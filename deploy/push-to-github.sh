#!/usr/bin/env bash
# =============================================================================
# Baby Planet BD Clone — Push to GitHub Helper
# -----------------------------------------------------------------------------
# This script helps you push the local repo to your GitHub account.
#
# USAGE:
#   1. Create a new empty repository on GitHub (don't add README/license/gitignore)
#      → https://github.com/new
#      → Repository name: babyplanet-clone (or whatever you prefer)
#      → Set to PUBLIC or PRIVATE
#      → DO NOT check "Add a README" or "Add .gitignore" or "Choose a license"
#      → Click "Create repository"
#
#   2. Copy the repo URL (looks like one of):
#      HTTPS: https://github.com/YOUR_USERNAME/babyplanet-clone.git
#      SSH:   git@github.com:YOUR_USERNAME/babyplanet-clone.git
#
#   3. Run this script with the URL:
#      chmod +x push-to-github.sh
#      ./push-to-github.sh https://github.com/YOUR_USERNAME/babyplanet-clone.git
#
#   4. (Optional) Authenticate when prompted:
#      - HTTPS: GitHub will ask for a Personal Access Token (PAT) as password
#        → Create one at: https://github.com/settings/tokens (scope: repo)
#      - SSH: Ensure your SSH key is added to GitHub
#        → https://github.com/settings/keys
# =============================================================================

set -euo pipefail

# ---- Colors ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $*"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARN:${NC} $*"; }
err()  { echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $*" >&2; }
info() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }

# -----------------------------------------------------------------------------
# Validate argument
# -----------------------------------------------------------------------------
if [ $# -lt 1 ]; then
  err "Usage: $0 <github-repo-url>"
  err ""
  err "Example:"
  err "  $0 https://github.com/YOUR_USERNAME/babyplanet-clone.git"
  err "  $0 git@github.com:YOUR_USERNAME/babyplanet-clone.git"
  err ""
  err "Create a new empty repo first at: https://github.com/new"
  exit 1
fi

REPO_URL="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# -----------------------------------------------------------------------------
# Verify we're in a git repo
# -----------------------------------------------------------------------------
if [ ! -d ".git" ]; then
  err "Not a git repository. Run this script from the project root."
  exit 1
fi

log "Project directory: $PROJECT_DIR"
log "GitHub repo URL:   $REPO_URL"
echo ""

# -----------------------------------------------------------------------------
# Check if a remote already exists
# -----------------------------------------------------------------------------
EXISTING_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")

if [ -n "$EXISTING_REMOTE" ]; then
  warn "A remote 'origin' already exists: $EXISTING_REMOTE"
  read -p "Replace it with the new URL? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Aborted. Existing remote kept."
    exit 0
  fi
  git remote set-url origin "$REPO_URL"
  log "Updated remote 'origin' → $REPO_URL"
else
  git remote add origin "$REPO_URL"
  log "Added remote 'origin' → $REPO_URL"
fi

echo ""
info "Current remotes:"
git remote -v
echo ""

# -----------------------------------------------------------------------------
# Verify branch
# -----------------------------------------------------------------------------
BRANCH=$(git branch --show-current)
log "Current branch: $BRANCH"

# Rename to 'main' if on 'master'
if [ "$BRANCH" = "master" ]; then
  git branch -M main
  BRANCH="main"
  log "Renamed branch 'master' → 'main'"
fi

# -----------------------------------------------------------------------------
# Final pre-flight check
# -----------------------------------------------------------------------------
log "Pre-flight check:"
log "  • Tracked files: $(git ls-files | wc -l)"
log "  • Last commit: $(git log -1 --oneline)"
log "  • Uncommitted changes: $(git status --short | wc -l)"

if [ "$(git status --short | wc -l)" -gt 0 ]; then
  warn "You have uncommitted changes. Commit them before pushing?"
  read -p "Commit + push? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    git commit -m "Final pre-push cleanup"
    log "Committed uncommitted changes."
  else
    err "Aborting — commit your changes first, then re-run this script."
    exit 1
  fi
fi

echo ""
info "Pushing to GitHub..."
echo ""

# -----------------------------------------------------------------------------
# PUSH!
# -----------------------------------------------------------------------------
git push -u origin "$BRANCH"

if [ $? -eq 0 ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "🎉  Successfully pushed to GitHub!"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  echo "   Your repo:  ${REPO_URL%.git}"
  echo "   Branch:     $BRANCH"
  echo "   Files:      $(git ls-files | wc -l)"
  echo ""
  echo "   Next steps:"
  echo "     1. Visit your repo on GitHub"
  echo "     2. Add a description + topics (nextjs, express, postgresql, redis, ecommerce)"
  echo "     3. Star it ⭐"
  echo "     4. Share with the world!"
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
else
  err "Push failed. Common causes:"
  err "  • HTTPS: Need a Personal Access Token (not your password)"
  err "    Create one at: https://github.com/settings/tokens (scope: repo)"
  err "  • SSH: Your SSH key isn't added to GitHub"
  err "    Add it at: https://github.com/settings/keys"
  err "  • Repository doesn't exist yet — create it at https://github.com/new"
  exit 1
fi
