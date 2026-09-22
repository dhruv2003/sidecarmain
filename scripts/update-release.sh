#!/usr/bin/env bash
# Regenerate latest-release.json from the newest GitHub release of
# dhruv2003/sidecar, then commit and push if it changed.
#
# Usage:
#   ./scripts/update-release.sh            # unauthenticated API (60 req/hr/IP)
#   GH_TOKEN=<token> ./scripts/update-release.sh   # authenticated, recommended
set -euo pipefail
cd "$(dirname "$0")/.."

AUTH=()
if [ -n "${GH_TOKEN:-}" ]; then AUTH=(-H "Authorization: Bearer ${GH_TOKEN}"); fi

curl -sS "${AUTH[@]}" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/dhruv2003/sidecar/releases/latest -o /tmp/sidecar-rel.json

python3 - <<'EOF'
import json

rel = json.load(open('/tmp/sidecar-rel.json'))
if 'tag_name' not in rel:
    raise SystemExit(f"API error: {rel.get('message', rel)}")

assets = rel.get('assets', [])
mac = next((a for a in assets if a['name'].lower().endswith('.dmg')), None)
win = next((a for a in assets if a['name'].lower().endswith('.exe')), None)

def pick(a):
    return {'name': a['name'], 'size': a['size'],
            'url': a['browser_download_url']} if a else None

out = {
    'version': rel.get('tag_name') or rel.get('name'),
    'published_at': rel.get('published_at'),
    'release_page': rel.get('html_url'),
    'mac': pick(mac),
    'win': pick(win),
}
with open('latest-release.json', 'w') as f:
    json.dump(out, f, indent=2)
    f.write('\n')
print('latest-release.json ->', out['version'])
EOF

git add latest-release.json
if git diff --cached --quiet; then
  echo "Already up to date."
else
  VERSION=$(python3 -c "import json; print(json.load(open('latest-release.json'))['version'])")
  git commit -m "chore: update latest release info to ${VERSION}"
  git push
  echo "Pushed ${VERSION}."
fi
