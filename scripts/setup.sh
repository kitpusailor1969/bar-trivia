#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PB_DIR="$(dirname "$SCRIPT_DIR")/pocketbase"

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
[ "$ARCH" = "x86_64" ] && ARCH="amd64"
[ "$ARCH" = "aarch64" ] && ARCH="arm64"

PB_VERSION="0.22.20"
URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"

echo "Downloading PocketBase v${PB_VERSION} for ${OS}/${ARCH}..."
curl -L "$URL" -o /tmp/pocketbase.zip
unzip -o /tmp/pocketbase.zip pocketbase -d "$PB_DIR"
chmod +x "$PB_DIR/pocketbase"
rm /tmp/pocketbase.zip
echo "Done. Run ./scripts/dev.sh to start."
