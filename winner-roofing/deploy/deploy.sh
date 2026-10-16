#!/usr/bin/env bash
# Build and upload the Winner Roofing dashboard Worker, then (optionally)
# attach it to a custom domain. Run from winner-roofing/:
#
#   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... ./deploy/deploy.sh
#
# Optional:
#   WORKER_NAME   default winner-roofing-sales-floor
#   HOSTNAME_FQDN custom domain to serve on, e.g. winnerroofing.m411.app
#                 (its zone must be on the same Cloudflare account)
#
# Nothing secret lives in this repo: the token and account id come from the
# environment. The Worker itself has no bindings or secrets.
set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID}"
NAME="${WORKER_NAME:-winner-roofing-sales-floor}"
API="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}"
AUTH="Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
HERE="$(cd "$(dirname "$0")" && pwd)"

check() {  # fail loudly on a Cloudflare API error
  python3 -c 'import json,sys; d=json.load(sys.stdin); ok=d.get("success"); print("  ", "ok" if ok else d.get("errors")); sys.exit(0 if ok else 1)'
}

echo "1/3 build"
python3 "$HERE/build.py"

echo "2/3 upload Worker '$NAME'"
META="$(mktemp)"
trap 'rm -f "$META"' EXIT
echo '{"main_module":"worker.js","compatibility_date":"2025-01-01","bindings":[]}' > "$META"
curl -sS -X PUT -H "$AUTH" \
  -F "metadata=@${META};type=application/json" \
  -F "worker.js=@${HERE}/dist/worker.js;filename=worker.js;type=application/javascript+module" \
  "$API/workers/scripts/$NAME" | check
# serve on <name>.<account-subdomain>.workers.dev; no preview URLs
curl -sS -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"enabled":true,"previews_enabled":false}' \
  "$API/workers/scripts/$NAME/subdomain" | check

echo "3/3 custom domain"
if [ -n "${HOSTNAME_FQDN:-}" ]; then
  # the zone is the hostname itself (bare domain) or a parent of it: try each in turn
  ZONE_ID="" ; CANDIDATE="$HOSTNAME_FQDN"
  while [ -z "$ZONE_ID" ] && [[ "$CANDIDATE" == *.* ]]; do
    ZONE_ID="$(curl -sS -H "$AUTH" "https://api.cloudflare.com/client/v4/zones?name=${CANDIDATE}" |
      python3 -c 'import json,sys; r=json.load(sys.stdin)["result"]; print(r[0]["id"] if r else "")')"
    [ -n "$ZONE_ID" ] || CANDIDATE="${CANDIDATE#*.}"
  done
  [ -n "$ZONE_ID" ] || { echo "   no zone on this account covers ${HOSTNAME_FQDN}"; exit 1; }
  curl -sS -X PUT -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"hostname\":\"${HOSTNAME_FQDN}\",\"service\":\"${NAME}\",\"zone_id\":\"${ZONE_ID}\",\"environment\":\"production\"}" \
    "$API/workers/domains" | check
  echo "   https://${HOSTNAME_FQDN}/"
else
  echo "   skipped (set HOSTNAME_FQDN to attach one)"
fi
