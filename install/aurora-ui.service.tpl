[Unit]
Description=Aurora UI Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=aurora
Group=aurora
WorkingDirectory=/opt/aurora/ui
StateDirectory=aurora-ui
ReadWritePaths=/var/lib/aurora-ui
EnvironmentFile=-{{ .EnvFilePath }}
ExecStart={{ .BinaryPath }} --listen 127.0.0.1:{{ .AppPort }} --root /opt/aurora/ui/dist
Restart=always
RestartSec=3
LimitNOFILE=65535
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ProtectControlGroups=true
ProtectKernelModules=true
ProtectKernelTunables=true
ProtectClock=true
ProtectHostname=true
LockPersonality=true
MemoryDenyWriteExecute=true
RestrictRealtime=true
RestrictSUIDSGID=true
RestrictNamespaces=true
SystemCallArchitectures=native
CapabilityBoundingSet=
AmbientCapabilities=
UMask=0077
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
ReadOnlyPaths=/opt/aurora/ui

[Install]
WantedBy=multi-user.target
