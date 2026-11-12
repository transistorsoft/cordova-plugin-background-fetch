#!/usr/bin/env bash
# Everything worth checking before a release — run by scripts/release.sh and by the
# release workflow, and safe to run any time.
#
#   scripts/preflight.sh             build, pack, compile and load a consumer against the tarball
#   scripts/preflight.sh --release   also: CHANGELOG has a heading for this version
#
# www/index.js is compiled from src/typescript/index.ts AND committed: Cordova loads it from
# plugin.xml, and an install from the git URL never builds. So the committed file must be
# what the TypeScript compiles to. The tarball is shaped by .npmignore alone (7.3.1 shipped
# .github/ and 119 files of example/), and plugin.xml carries its own version, which Cordova
# reads and package.json does not set. Builds only into a throwaway directory, publishes
# nothing; it reads the registry only to compare file lists.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
RELEASE=0
[ "${1:-}" = "--release" ] && RELEASE=1

GREEN=$'\033[0;32m'; RED=$'\033[0;31m'; DIM=$'\033[2m'; RESET=$'\033[0m'
ok()   { echo "  ${GREEN}✓${RESET} $1"; }
fail() { echo "  ${RED}✗${RESET} $1" >&2; exit 1; }
step() { echo; echo "${DIM}── $1${RESET}"; }

cd "$ROOT"
NAME="$(node -p "require('./package.json').name")"
VERSION="$(node -p "require('./package.json').version")"

step "1. version"
echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$' || fail "package.json version '$VERSION' is not semver"
# The <plugin> element's version (not the <?xml version="1.0"?> declaration above it).
PLUGIN_XML="$(tr '\n' ' ' < plugin.xml | grep -o '<plugin[^>]*>' | grep -o 'version="[^"]*"' | cut -d'"' -f2)"
[ "$PLUGIN_XML" = "$VERSION" ] || fail "plugin.xml says $PLUGIN_XML, package.json says $VERSION"
if [ "$RELEASE" = 1 ]; then
  # The first `## ` heading must be this version: an `## Unreleased` above it means the
  # notes were never given a version.
  first="$(grep -m1 '^## ' CHANGELOG.md || true)"
  case "$first" in
    "## $VERSION "*|"## [$VERSION] "*) ok "$NAME@$VERSION, plugin.xml $PLUGIN_XML — CHANGELOG: $first" ;;
    *) fail "CHANGELOG's first heading is '$first', not '## [$VERSION] …' — run npm run release -- prepare" ;;
  esac
else
  ok "$NAME@$VERSION, plugin.xml $PLUGIN_XML"
fi

step "2. build"
./node_modules/.bin/tsc -p src/typescript --outDir "$WORK/build/www" --declarationDir "$WORK/build/typings" \
  >"$WORK/build.log" 2>&1 || { cat "$WORK/build.log" >&2; fail "tsc -p src/typescript"; }
cmp -s "$WORK/build/www/index.js" www/index.js \
  || fail "www/index.js is not what src/typescript/index.ts compiles to — npm run build, and commit it"
cmp -s "$WORK/build/typings/index.d.ts" src/typescript/index.d.ts \
  || fail "src/typescript/index.d.ts is not what src/typescript/index.ts compiles to — npm run build, and commit it"
ok "the committed www/index.js and index.d.ts are what src/typescript compiles to"

step "3. the tarball"
# Its own directory: the version on npm, packed below, has the same file name whenever
# package.json still says the released version, and would overwrite this one, so step 4
# would install and test what is already on npm instead of this build.
mkdir -p "$WORK/pack" "$WORK/npm"
npm pack --silent --pack-destination "$WORK/pack" >/dev/null || fail "npm pack"
TARBALL="$(ls "$WORK"/pack/*.tgz)"
tar -tzf "$TARBALL" | sort > "$WORK/contents"
# What Cordova and an Ionic import need: plugin.xml, the www/ module it clobbers, the
# browser-field shim for cordova/exec, the npm typings, the Swift package cordova-ios 8
# builds, and the native sources for both platforms.
for want in package/package.json package/plugin.xml package/www/index.js package/www/exec-browser.js \
            package/src/typescript/index.d.ts package/Package.swift; do
  grep -qx "$want" "$WORK/contents" || fail "the tarball has no $want"
done
grep -q '^package/src/android/' "$WORK/contents" || fail "the tarball has no src/android/"
grep -q '^package/src/ios/' "$WORK/contents" || fail "the tarball has no src/ios/"
bad="$(grep -E '^package/(\.github|scripts|example|docs|node_modules)/|/\.gradle/|^package/(RELEASING\.md|src/typescript/index\.ts|src/typescript/tsconfig\.json)$' "$WORK/contents" || true)"
[ -z "$bad" ] || fail "the tarball carries what it should not (.npmignore): $(echo "$bad" | head -3 | tr '\n' ' ')"
ok "$(basename "$TARBALL") — $(wc -l < "$WORK/contents" | tr -d ' ') files"
# Against the version on npm now: files that vanish or appear are worth a look before
# they ship. Printed, not enforced — a deliberate change is fine.
PREV="$(npm view "$NAME" dist-tags.latest 2>/dev/null || true)"
if [ -n "$PREV" ] && (cd "$WORK/npm" && npm pack --silent "$NAME@$PREV" >/dev/null 2>&1); then
  tar -tzf "$WORK"/npm/*.tgz | sort > "$WORK/previous"
  gone="$(comm -23 "$WORK/previous" "$WORK/contents" | sed 's#^package/##')"
  new="$(comm -13 "$WORK/previous" "$WORK/contents" | sed 's#^package/##')"
  ok "against $PREV on npm: $(echo -n "$gone" | grep -c . || true) gone, $(echo -n "$new" | grep -c . || true) new"
  [ -z "$gone" ] || echo "$gone" | head -10 | sed 's/^/      - /'
  [ -z "$new" ] || echo "$new" | head -10 | sed 's/^/      + /'
else
  echo "  ${DIM}(no published version to compare with)${RESET}"
fi

step "4. a consumer compiles and loads it"
# The Ionic/Angular import path. The consumer brings its own TypeScript; the types package
# comes in as a dependency.
mkdir -p "$WORK/consumer" && cd "$WORK/consumer"
echo '{"name": "consumer", "private": true}' > package.json
npm install --silent --no-audit --no-fund "$TARBALL" "typescript@^5" >/dev/null || fail "npm install of the tarball"
cat > index.ts <<'TS'
import BackgroundFetch from "cordova-plugin-background-fetch";
import type { BackgroundFetchConfig, BackgroundFetchStatus, TaskConfig } from "@transistorsoft/background-fetch-types";

const config: BackgroundFetchConfig = {
  minimumFetchInterval: 15,
  stopOnTerminate: false,
  requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
};
export async function start(): Promise<boolean> {
  const status: BackgroundFetchStatus = await BackgroundFetch.configure(
    config,
    (taskId: string) => BackgroundFetch.finish(taskId),
    (taskId: string) => BackgroundFetch.finish(taskId),
  );
  const task: TaskConfig = { taskId: "com.transistorsoft.task", delay: 5000, periodic: false };
  BackgroundFetch.scheduleTask(task, () => {}, (error: string) => console.warn(error));
  return status === BackgroundFetch.STATUS_AVAILABLE;
}
TS
for mode in "node16 node16" "esnext bundler"; do
  set -- $mode
  ./node_modules/.bin/tsc --strict --noEmit --skipLibCheck false --target es2020 --lib es2020,dom \
    --module "$1" --moduleResolution "$2" index.ts \
    || fail "a strict consumer does not compile under moduleResolution $2"
done
ok "strict TypeScript compiles under node16 and bundler resolution"
# What a bundler does with the package.json `browser` field (7.3.1): `cordova/exec` resolves to
# www/exec-browser.js, which forwards to window.cordova.exec. Load it that way and call through.
node -e '
  const Module = require("module"), path = require("path");
  const pkg = path.dirname(require.resolve("cordova-plugin-background-fetch/package.json"));
  const browser = require(path.join(pkg, "package.json")).browser["cordova/exec"];
  const resolve = Module._resolveFilename;
  Module._resolveFilename = function (request, ...rest) {
    return request === "cordova/exec" ? path.join(pkg, browser) : resolve.call(this, request, ...rest);
  };
  const calls = [];
  globalThis.window = { cordova: { exec: (ok, err, service, action) => calls.push(service + "." + action) } };
  const B = require("cordova-plugin-background-fetch");
  const want = { STATUS_RESTRICTED: 0, STATUS_DENIED: 1, STATUS_AVAILABLE: 2, NETWORK_TYPE_NONE: 0,
                 NETWORK_TYPE_ANY: 1, NETWORK_TYPE_UNMETERED: 2, NETWORK_TYPE_NOT_ROAMING: 3, NETWORK_TYPE_CELLULAR: 4 };
  const wrong = Object.keys(want).filter(k => B[k] !== want[k]);
  if (wrong.length) { console.error("wrong at runtime:", wrong.join(", ")); process.exit(1); }
  B.finish("task");
  if (calls.join() !== "BackgroundFetch.finish") { console.error("exec calls:", calls.join() || "none"); process.exit(1); }' \
  || fail "the module does not load through the browser-field shim, or its constants are wrong"
ok "require() through the browser-field shim: every constant, and finish() reaches cordova.exec"

echo
echo "${GREEN}preflight passed${RESET} — $NAME@$VERSION"
