# Releasing

`cordova-plugin-background-fetch` is published by GitHub Actions
(`.github/workflows/release.yml`) when a version tag is pushed. npm trusts that workflow
through **Trusted Publishing** (OIDC), so no npm token exists anywhere, and every release
carries **provenance**: a signed record of the repository, commit and workflow that built it.
The React Native and Capacitor background-fetch plugins release the same way, as do the
background-geolocation plugins.

## A release

```bash
npm run release -- prepare 7.3.2   # branch chore/release-7.3.2: version (package.json and plugin.xml), dated CHANGELOG, preflight
# merge chore/release-7.3.2 into master
npm run release -- tag 7.3.2       # on master: tag the merge (lightweight, like every earlier tag)
git push origin master 7.3.2       # the tag starts the workflow
```

`prepare` releases the CHANGELOG's `## Unreleased` section, which must hold at least one
`* ` entry, as `## [7.3.2] &mdash; <today>`. It runs from an up-to-date master and refuses a
version that is not greater than package.json's, or is already on npm.

A release branch prepared by hand before these scripts: merge it into master (its CHANGELOG
heading back to `## Unreleased`) and delete it; `prepare` keeps the version it set, dates the
CHANGELOG and refuses a version already on npm.

The workflow checks (the tag equals `package.json`'s version; `scripts/preflight.sh --release`:
`plugin.xml`'s version equals it, the committed `www/index.js` is what `src/typescript`
compiles to, the packed tarball's contents and what changed since the version on npm, a strict
consumer compile, the module loading through the `browser`-field shim for `cordova/exec`, a
CHANGELOG heading for the version), then publishes. What ships is decided by `.npmignore`:
7.3.1 shipped `.github/` and 119 files of `example/` (the Ionic app among them), which it now
excludes and preflight refuses. A prerelease such as `7.4.0-beta.1` is published under the
`beta` dist-tag, so `latest` only moves to a release.

`www/index.js` and `src/typescript/index.d.ts` are compiled from `src/typescript/index.ts`
**and committed**: Cordova loads `www/index.js` through `plugin.xml`, and an install from the
git URL never builds. After changing `index.ts`, run `npm run build` and commit both outputs
with it; preflight refuses a release whose committed output is stale. The build uses the
repository's own TypeScript (a devDependency, 4.1), so the output does not depend on whatever
`tsc` a machine has installed.

`npm run preflight` (without `-- --release`) is safe to run at any time; it publishes nothing.
Never add a `version`, `preversion` or `postversion` script: `release -- prepare` runs
`npm version`, which would run them.

Publishing is only the npm half. The native SDK `plugin.xml`, `Package.swift` and
`src/android/build.gradle` require (`TSBackgroundFetch` / `com.transistorsoft:tsbackgroundfetch`)
must already be released, or a build fails to resolve it.

## A release that failed

Fix the cause, then re-run from the Actions tab: **release → Run workflow → Use workflow
from → Tags → the version**. The workflow refuses to run on a branch, and skips the publish
if that version is already on npm. A version can be published once, ever: if a bad tag was
pushed, delete it and release the next patch version rather than re-using the number.

## Checking a release

- The package page on npmjs.com shows a provenance badge linking to the workflow run. npm
  shows the new version as "validating" for a few minutes before it serves it.
- `npm audit signatures`, in a project that depends on the package, verifies it.

## One-time setup

On npmjs.com, the package's **Settings → Trusted Publisher → GitHub Actions**:
organization `transistorsoft`, repository `cordova-plugin-background-fetch`, workflow
`release.yml`, environment blank (GitHub Environments are not available on this org's
plan, and the registration and the workflow must agree). **Publishing access**: "Require
two-factor authentication and disallow bypass 2fa tokens". GitHub needs nothing: no secrets,
no environment.
