package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRuntimeEnvHandlerNoStore(t *testing.T) {
	t.Setenv("VITE_API_URL", "https://ums.aurora.local")
	req := httptest.NewRequest(http.MethodGet, "/env.js", nil)
	res := httptest.NewRecorder()

	runtimeEnvHandler(res, req)

	if got := res.Header().Get("Cache-Control"); got != cacheControlNoStore {
		t.Fatalf("expected Cache-Control %q, got %q", cacheControlNoStore, got)
	}
	body := res.Body.String()
	if !strings.Contains(body, "window.__AURORA_RUNTIME__") {
		t.Fatalf("expected runtime assignment, got %q", body)
	}
	if !strings.Contains(body, "https://ums.aurora.local") {
		t.Fatalf("expected runtime env payload, got %q", body)
	}
}

func TestSPAHandlerCachesAssets(t *testing.T) {
	root := writeStaticFixture(t)
	handler := newServerHandler(os.DirFS(root))

	req := httptest.NewRequest(http.MethodGet, "/assets/app.js", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if got := res.Header().Get("Cache-Control"); got != cacheControlImmutable {
		t.Fatalf("expected immutable cache header, got %q", got)
	}
}

func TestSPAHandlerFallsBackToIndex(t *testing.T) {
	root := writeStaticFixture(t)
	handler := newServerHandler(os.DirFS(root))

	req := httptest.NewRequest(http.MethodGet, "/dashboard/overview", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if got := res.Header().Get("Cache-Control"); got != cacheControlNoCache {
		t.Fatalf("expected no-cache header, got %q", got)
	}
	body, _ := io.ReadAll(res.Body)
	if !strings.Contains(string(body), "aurora-ui") {
		t.Fatalf("expected SPA index fallback, got %q", string(body))
	}
}

func TestReadRuntimeEnvFiltersAllowedKeys(t *testing.T) {
	t.Setenv("VITE_API_URL", "https://admin.aurora.local")
	t.Setenv("NOT_ALLOWED", "secret")
	values := readRuntimeEnv()
	if values["VITE_API_URL"] != "https://admin.aurora.local" {
		t.Fatalf("expected allowed env to be present")
	}
	if _, ok := values["NOT_ALLOWED"]; ok {
		t.Fatalf("unexpected non-allowed env in payload")
	}
	if _, err := json.Marshal(values); err != nil {
		t.Fatalf("expected runtime env to be json serializable: %v", err)
	}
}

func writeStaticFixture(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	mustWriteFile(t, filepath.Join(root, "index.html"), "<html><body>aurora-ui</body></html>")
	mustWriteFile(t, filepath.Join(root, "assets", "app.js"), "console.log('ok');")
	return root
}

func mustWriteFile(t *testing.T, path string, content string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("mkdir failed: %v", err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("write file failed: %v", err)
	}
}
