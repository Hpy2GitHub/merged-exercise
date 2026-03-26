#!/bin/bash

# deploy.sh - Deploy Vite exercise app to Apache or GitHub
# Usage:
#   ./deploy.sh                  → build and deploy to Apache
#   ./deploy.sh dev              → swap in dev config for npm dev
#   ./deploy.sh github "message" → build for github and push source

set -e

PROJECT_DIR="$(pwd)"
BUILD_DIR="$PROJECT_DIR/dist"
TARGET_DIR="/mnt/d/Apache/html/sandbox/exercise2"
VIDEO_SRC="/mnt/d/Code/Python/prc-data-and-old-code/code/exercise2/videos"
BACKUP_BASE="/mnt/d/Apache/html/sandbox/exercise2-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$BACKUP_BASE/$TIMESTAMP"

# ── dev mode ──────────────────────────────────────────────────────────────────
if [ "$1" = "dev" ]; then
  echo "🔧 Switching to dev config..."
  cp vite-npm vite.config.ts
  echo "✅ vite.config.ts updated for npm dev"
  echo "   Run: npm run dev"
  exit 0
fi

# ── github mode ───────────────────────────────────────────────────────────────
if [ "$1" = "github" ]; then
  # Use 2nd argument as commit message, or a default with timestamp if empty
  COMMIT_MSG="${2:-"Update exercise app: $TIMESTAMP"}"
  
  echo "🚀 Starting GitHub Deployment..."
  
  # 1. Build using the github mode defined in package.json
  # This ensures vite.config.ts uses base: '/merged-exercise/'
  echo "📦 Building for GitHub..."
  npm run build:github
  
  # 2. Git automation
  echo "📝 Committing with message: $COMMIT_MSG"
  git add .
  
  # Only commit if there are actual changes to avoid "nothing to commit" errors
  if ! git diff-index --quiet HEAD --; then
    git commit -m "$COMMIT_MSG"
    git push origin main
    echo "✅ Pushed to GitHub! Actions will handle the deployment."
  else
    echo "⚠️  No changes detected, nothing to commit."
  fi
  exit 0
fi

# ── apache deploy mode ────────────────────────────────────────────────────────
echo "🚀 Starting Apache deployment process..."
echo "📁 Project dir : $PROJECT_DIR"
echo "📦 Build dir   : $BUILD_DIR"
echo "🎯 Target dir  : $TARGET_DIR"

# Check we're in the right place
if [ ! -f "vite-apache" ] || [ ! -f "package.json" ]; then
    echo "❌ Error: missing vite-apache or package.json — run from project root"
    exit 1
fi

# 1. Backup existing deployment
echo ""
echo "1. Backing up existing deployment..."
if [ -d "$TARGET_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$TARGET_DIR"/. "$BACKUP_DIR"/
    echo "   ✅ Backup saved to: $BACKUP_DIR"
else
    echo "   ⚠️  No existing deployment found — skipping backup"
    mkdir -p "$TARGET_DIR"
fi

# 2. Swap in Apache vite config and build
echo ""
echo "2. Swapping vite config for Apache..."
cp vite-apache vite.config.ts

echo ""
echo "3. Building..."
npm run build:apache

echo "   ✅ Build complete"

# 3. Copy build output
echo ""
echo "4. Copying dist → $TARGET_DIR..."
cp -r "$BUILD_DIR"/* "$TARGET_DIR"/

# 4. Sync static assets
echo ""
echo "5. Syncing favicon..."
cp -u public/favicon.ico "$TARGET_DIR/favicon.ico"

echo "6. Syncing trace* files..."
if ls trace* 1>/dev/null 2>&1; then
    cp trace* "$TARGET_DIR/"
    echo "   copied: $(ls trace*)"
fi

echo "7. Syncing images..."
mkdir -p "$TARGET_DIR/images"
cp -ur ./public/images/. "$TARGET_DIR/images/"

echo "8. Syncing videos from public/..."
mkdir -p "$TARGET_DIR/videos"
cp -ur ./public/videos/. "$TARGET_DIR/videos/" 2>/dev/null || true

echo "9. Syncing videos from VIDEO_SRC..."
for src in "$VIDEO_SRC"/*; do
    fname=$(basename "$src")
    dst="$TARGET_DIR/videos/$fname"
    if [ ! -f "$dst" ]; then
        cp "$src" "$dst"
        echo "   copied: $fname"
    fi
done

# 5. Permissions
echo ""
echo "10. Setting permissions..."
chmod -R 755 "$TARGET_DIR"

# 6. Restore dev config
echo ""
echo "11. Restoring dev config..."
cp vite-npm vite.config.ts
echo "    ✅ vite.config.ts reset for npm dev"

echo ""
echo "🎉 Deployment complete!"
echo "   Live at : http://localhost/sandbox/exercise2"
echo "   Backup  : $BACKUP_DIR"
