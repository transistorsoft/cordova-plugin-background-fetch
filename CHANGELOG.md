# CHANGELOG

## [5.6.0] &mdash; 2019-08-22
- [Added] Capacitor support

## [5.5.0] &mdash; 2019-06-04
- [Added] Typescript API
- [Added] Android `JobInfo` criteria `requiredNetworkType`, `requiresCharging`, `requiresBatteryNotLow`, `requiresDeviceIdle`, `requiresStorageNotLow`.
- [Added] `finish` now accepts `BackgroundFetch.FETCH_RESULT_*` (eg: `BackgroundFetch.FETCH_RESULT_NO_DATA`).

## [5.4.1] &mdash; 2018-05-25
- [Changed] Decrease required cordova version from `8.0.0` -> `7.1.0`.

## [5.4.0] &mdash; 2018-05-16
- [Added] `cordova-android @ 7.0.0` support.

## [5.3.0] &mdash; 2018-02-28
- [Changed] The Android library `tsbackgroundfetch.aar` has been composed as a *Maven* repository.  Purely structural change; no implementation has changed with this version.

## [5.2.1] &mdash; 2018-01-23
- [Added] Android implementation using `JobScheduler` / `AlarmManager`

