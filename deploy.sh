#!/bin/bash

# deploy.sh
# Usage:
#   ./deploy.sh apache   → build with mode=apache and copy to Apache dir
#   ./deploy.sh github   → build with mode=github and push to git (triggers GitHub Actions)
#   ./deploy.sh npm      → verify npm dev config is ready and print instructions

set -e

PROJECT_DIR="$(pwd)"
BUILD_DIR="$PROJECT_DIR/dist"
TARGET_DIR="/mnt/d/Apache/html/sandbox/exercise"
VIDEO_SRC="/mnt/d/Code/Python/prc-data-and-old-code/code/exercise2/videos"
BACKUP_BASE="/mnt/d/Apache/html/sandbox/exercise-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$BACKUP_BASE/$TIMESTAMP"

# ── Sanity check ──────────────────────────────────────────────────────────────
if [ ! -f "vite.config.ts" ] || [ ! -f "package.json" ]; then
  echo "❌ Error: must run from project root"
  exit 1
fi

MODE="${1:-}"

# ══ npm mode ══════════════════════════════════════════════════════════════════
if [ "$MODE" = "npm" ]; then
  echo "🔧 npm dev mode"
  echo ""
  echo "  Config : vite.config.ts (single unified file — no swap needed)"
  echo "  Env    : .env.npm"
  echo ""
  echo "  Run:  npm run dev"
  echo ""
  echo "  Vite dev server will start on http://localhost:5173"
  echo "  /cgi-bin requests will proxy → Apache on port 80"
  exit 0
fi

# ══ github mode ═══════════════════════════════════════════════════════════════
if [ "$MODE" = "github" ]; then
  echo "🐙 GitHub Pages deployment"
  echo ""

  # Optional: do a local test build first
  echo "1. Test-building with mode=github..."
  npm run build:github
  echo "   ✅ Build OK"

  echo ""
  echo "2. Pushing to GitHub (triggers Actions deploy)..."
  git add -A
  git status
  echo ""
  read -p "   Commit message: " COMMIT_MSG
  git commit -m "$COMMIT_MSG"
  git push origin main
  echo ""
  echo "🎉 Pushed! GitHub Actions will deploy to GitHub Pages."
  echo "   Check progress at: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/.git$//')/actions"
  exit 0
fi

# ══ apache mode ═══════════════════════════════════════════════════════════════
if [ "$MODE" = "apache" ]; then
  echo "🚀 Apache deployment"
  echo "📁 Project dir : $PROJECT_DIR"
  echo "📦 Build dir   : $BUILD_DIR"
  echo "🎯 Target dir  : $TARGET_DIR"

  # ── 1. Backup ───────────────────────────────────────────────────────────────
  echo ""
  echo "1. Backing up existing deployment..."
  if [ -d "$TARGET_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$TARGET_DIR"/. "$BACKUP_DIR"/
    echo "   ✅ Backup saved to: $BACKUP_DIR"
  else
    echo "   ⚠️  No existing deployment — skipping backup"
    mkdir -p "$TARGET_DIR"
  fi

  # ── 2. Build ────────────────────────────────────────────────────────────────
  echo ""
  echo "2. Building with mode=apache..."
  npm run build:apache
  echo "   ✅ Build complete"

  # ── 3. Copy dist ────────────────────────────────────────────────────────────
  echo ""
  echo "3. Copying dist → $TARGET_DIR..."
  cp -r "$BUILD_DIR"/* "$TARGET_DIR"/

  # ── 4. Sync static assets ───────────────────────────────────────────────────
  echo ""
  echo "4. Syncing favicon..."
  cp -u public/favicon.ico "$TARGET_DIR/favicon.ico"

  echo "5. Syncing trace* files..."
  if ls trace* 1>/dev/null 2>&1; then
    cp trace* "$TARGET_DIR/"
    echo "   copied: $(ls trace*)"
  fi

  echo "6. Syncing images..."
  mkdir -p "$TARGET_DIR/images"
  cp -ur ./public/images/. "$TARGET_DIR/images/"

  echo "7. Syncing videos from public/..."
  mkdir -p "$TARGET_DIR/videos"
  echo "    Skipping copying videos"
  #cp -ur ./public/videos/. "$TARGET_DIR/videos/" 2>/dev/null || true

  echo "8. Syncing videos from $VIDEO_SRC..."
  for src in "$VIDEO_SRC"/*; do
    fname=$(basename "$src")
    dst="$TARGET_DIR/videos/$fname"
    if [ ! -f "$dst" ]; then
      cp "$src" "$dst"
      echo "   copied: $fname"
    fi
  done

  # ── 5. Permissions ──────────────────────────────────────────────────────────
  echo ""
  echo "9. Setting permissions..."
  chmod -R 755 "$TARGET_DIR"

  # ── Done ────────────────────────────────────────────────────────────────────
  echo ""
  echo "🎉 Deployment complete!"
  echo "   Live at : http://localhost/sandbox/exercise"
  echo "   Backup  : $BACKUP_DIR"
fi

  # ── Contents  ────────────────────────────────────────────────────────────────────
  echo ""
  cd $TARGET_DIR
  ls $TARGET_DIR
  find * | less


# ══ No mode given ═════════════════════════════════════════════════════════════
echo "Usage:"
echo "  ./deploy.sh apache   → build and deploy to local Apache"
echo "  ./deploy.sh github   → build, commit, and push to GitHub Pages"
echo "  ./deploy.sh npm      → show npm dev instructions"
exit 1

