package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"mime"
	"net/http"
	"os"
	"os/signal"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"time"
)

const (
	defaultListenAddr     = "127.0.0.1:8080"
	defaultStaticRoot     = "/opt/aurora/ui/dist"
	shutdownTimeout       = 10 * time.Second
	readHeaderTimeout     = 5 * time.Second
	readTimeout           = 10 * time.Second
	writeTimeout          = 30 * time.Second
	idleTimeout           = 60 * time.Second
	cacheControlImmutable = "public, max-age=31536000, immutable"
	cacheControlNoStore   = "no-store"
	cacheControlNoCache   = "no-cache"
)

type serverConfig struct {
	ListenAddr string
	StaticRoot string
}

func main() {
	listenAddr := flag.String("listen", defaultListenAddr, "listen address")
	rootDir := flag.String("root", defaultStaticRoot, "static root")
	flag.Parse()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg := serverConfig{
		ListenAddr: strings.TrimSpace(*listenAddr),
		StaticRoot: strings.TrimSpace(*rootDir),
	}
	logger := log.New(os.Stdout, "", log.LstdFlags)
	if err := run(ctx, cfg, logger); err != nil {
		logger.Fatal(err)
	}
}

func run(ctx context.Context, cfg serverConfig, logger *log.Logger) error {
	if logger == nil {
		logger = log.New(os.Stdout, "", log.LstdFlags)
	}
	files, cleanRoot, err := openStaticRoot(cfg.StaticRoot)
	if err != nil {
		return err
	}

	server := &http.Server{
		Addr:              firstNonEmpty(strings.TrimSpace(cfg.ListenAddr), defaultListenAddr),
		Handler:           newServerHandler(files),
		ReadHeaderTimeout: readHeaderTimeout,
		ReadTimeout:       readTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
	}

	errCh := make(chan error, 1)
	go func() {
		logger.Printf("aurora-ui-service listening on %s serving %s", server.Addr, cleanRoot)
		errCh <- server.ListenAndServe()
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()
		logger.Printf("aurora-ui-service shutting down")
		if err := server.Shutdown(shutdownCtx); err != nil {
			return fmt.Errorf("shutdown ui server failed: %w", err)
		}
		if err := <-errCh; err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	case err := <-errCh:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	}
}

func openStaticRoot(rootDir string) (fs.FS, string, error) {
	cleanRoot := strings.TrimSpace(rootDir)
	if cleanRoot == "" {
		return nil, "", fmt.Errorf("root is required")
	}
	fileSystem := os.DirFS(cleanRoot)
	if _, err := fs.Stat(fileSystem, "."); err != nil {
		return nil, "", fmt.Errorf("static root is unavailable: %w", err)
	}
	if _, err := fs.Stat(fileSystem, "index.html"); err != nil {
		return nil, "", fmt.Errorf("static root is missing index.html: %w", err)
	}
	return fileSystem, cleanRoot, nil
}

func newServerHandler(files fs.FS) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/health/liveness", healthHandler)
	mux.HandleFunc("/health/readiness", healthHandler)
	mux.HandleFunc("/env.js", runtimeEnvHandler)
	mux.Handle("/", spaHandler(files))
	return withSecurityHeaders(mux)
}

func withSecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		next.ServeHTTP(w, r)
	})
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", cacheControlNoStore)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func runtimeEnvHandler(w http.ResponseWriter, _ *http.Request) {
	payload, err := json.Marshal(readRuntimeEnv())
	if err != nil {
		http.Error(w, "encode runtime env failed", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
	w.Header().Set("Cache-Control", cacheControlNoStore)
	_, _ = fmt.Fprintf(w, "window.__AURORA_RUNTIME__ = %s;\n", payload)
}

func spaHandler(files fs.FS) http.Handler {
	fileServer := http.FileServer(http.FS(files))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cleanPath := path.Clean("/" + strings.TrimSpace(r.URL.Path))
		trimmed := strings.TrimPrefix(cleanPath, "/")
		if trimmed == "" {
			trimmed = "index.html"
		}
		if hasStaticAsset(files, trimmed) {
			setStaticCacheHeaders(w, trimmed)
			if ext := strings.ToLower(filepath.Ext(trimmed)); ext != "" {
				if ctype := mime.TypeByExtension(ext); ctype != "" {
					w.Header().Set("Content-Type", ctype)
				}
			}
			fileServer.ServeHTTP(w, r)
			return
		}
		indexRaw, err := fs.ReadFile(files, "index.html")
		if err != nil {
			http.Error(w, "index.html not found", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", cacheControlNoCache)
		_, _ = w.Write(indexRaw)
	})
}

func setStaticCacheHeaders(w http.ResponseWriter, assetPath string) {
	trimmed := strings.Trim(strings.TrimSpace(assetPath), "/")
	if trimmed == "" || trimmed == "index.html" {
		w.Header().Set("Cache-Control", cacheControlNoCache)
		return
	}
	if strings.HasPrefix(trimmed, "assets/") {
		w.Header().Set("Cache-Control", cacheControlImmutable)
		return
	}
	w.Header().Set("Cache-Control", cacheControlNoCache)
}

func hasStaticAsset(files fs.FS, name string) bool {
	if name == "index.html" {
		return true
	}
	info, err := fs.Stat(files, name)
	return err == nil && !info.IsDir()
}

func readRuntimeEnv() map[string]string {
	allowed := []string{
		"VITE_API_URL",
		"VITE_UMS_API_URL",
		"VITE_VM_API_URL",
		"VITE_PAAS_API_URL",
		"VITE_DBAAS_API_URL",
		"VITE_PLATFORM_API_URL",
		"VITE_MAIL_API_URL",
		"VITE_VM_LIST_PATH",
		"VITE_VM_OWNER_USER_ID",
	}
	out := make(map[string]string, len(allowed))
	for _, key := range allowed {
		if value := strings.TrimSpace(os.Getenv(key)); value != "" {
			out[key] = value
		}
	}
	keys := make([]string, 0, len(out))
	for key := range out {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	normalized := make(map[string]string, len(keys))
	for _, key := range keys {
		normalized[key] = out[key]
	}
	return normalized
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		if trimmed != "" {
			return trimmed
		}
	}
	return ""
}
