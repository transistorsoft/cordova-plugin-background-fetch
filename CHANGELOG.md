# CHANGELOG

## [6.1.0] &mdash; 2020-06-12
* [Fixed][Android] * `com.android.tools.build:gradle:4.0.0` no longer allows "*direct local aar dependencies*".  Re-package `tslocationmanager.aar` as a maven repo and add `maven url` in `build.gradle`.

## [6.0.8] &mdash; 2020-05-27
* [Fixed] Android could fail to restart events when configured with forceAlarmManager: true.
* [Fixed] Android check `wakeLock.isHeld()` before executing `wakeLock.release()`.

## [6.0.7] &mdash; 2020-05-13
* [Fixed][Android] Update gradle file for Capacitor-detection relative to `$projectDir` instead of `$userDir`.

## [6.0.6] &mdash; 2020-04-09
* [Fixed] [Android] Fixed bug related to `6.0.5` referencing non existent `BackgroundGeolocationHeadlessTask`.  Define class-name as a hard-coded String instead.

## [6.0.5] &mdash; 2020-04-09
* [Changed] Don't install default `BackgroundGeolocationHeadlessTask.java`

## [6.0.4] &mdash; 2020-03-24
* [Fixed][iOS] Fix bug calling BackgroundFetch.start after BackgroundFetch.stop.

## [6.0.3] &mdash; 2020-02-27
* [Fixed] [Android] Remove unused imports in `CDVBackgroundGeocation.java` causing problems with AndroidX.  Fixes #121.

## [6.0.2] &mdash; 2020-02-21
* [Fixed] [Android] `stopOnTerminate` not cancelling scheduled job / Alarm when fired task fired after terminate.

## [6.0.1] &mdash; 2020-02-20

* [Android] Fix Android NPE on `hasTaskId` when launched first time after upgrading to v6

## [6.0.0] &mdash; 2020-02-19

* [Added] [Android-only] New option `forceAlarmManager` for bypassing `JobScheduler` mechanism in favour of `AlarmManager` for more precise scheduling task execution.
* [Changed] Migrate iOS deprecated "background-fetch" API to new [BGTaskScheduler](https://developer.apple.com/documentation/backgroundtasks/bgtaskscheduler?language=objc).  See new required steps in iOS Setup.
* [Added] Added new `BackgroundFetch.scheduleTask` method (along with corresponding `#stopTask`) for scheduling custom "onehot" and periodic tasks in addition to the default fetch-task.

```javascript
BackgroundFetch.configure({
  minimumFetchInterval: 15,
  stopOnTerminate: false
}, (taskId) => {  // <-- [NEW] taskId provided to Callback
  console.log("[BackgroundFetch] taskId: ", taskId);
  switch(taskId) {
    case 'foo':
      // Handle scheduleTask 'foo'
      break;
    default:
      // Handle default fetch event.
      break;
  }
  BackgroundFetch.finish(taskId);  // <-- [NEW] Provided taskId to #finish method.
});

// This event will end up in Callback provided to #configure above.
BackgroundFetch.scheduleTask({
  taskId: 'foo',  //<-- required
  delay: 60000,
  periodic: false
});
```

## Breaking Changes
* With the introduction of ability to execute custom tasks via `#scheduleTask`, all tasks are executed in the Callback provided to `#configure`.  As a result, this Callback is now provided an argument `String taskId`.  This `taskId` must now be provided to the `#finish` method, so that the SDK knows *which* task is being `#finish`ed.

```javascript
BackgroundFetch.configure({
  minimumFetchInterval: 15,
  stopOnTerminate: false
), (taskId) => {  // <-- [NEW] taskId provided to Callback
  console.log("[BackgroundFetch] taskId: ", taskId);
  BackgroundFetch.finish(taskId);  // <-- [NEW] Provided taskId to #finish method.
});
```

And with the Headless Task, as well:
```java
public class BackgroundFetchHeadlessTask implements HeadlessTask {
    @Override
    public void onFetch(Context context, String taskId) {  // <-- 1.  Added String taskId as 2nd argument
        Log.d(BackgroundFetch.TAG, "BackgroundFetchHeadlessTask onFetch: " + taskId);
        BackgroundFetch.getInstance(context).finish(taskId);  // <-- 2.  Provide taskId to #finish.
    }
}
```


## [5.6.1] &mdash; 2019-10-07
- [Fixed] Resolve Android issues exposed by booting app in StrictMode, typically from loading SharedPreferences on Main Thread.

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

