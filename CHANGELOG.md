# CHANGELOG

## [7.1.1] &mdash; 2022-04-29
* Mixup in version code mismatch between package.json and plugin.xml

## [7.1.0] &mdash; 2022-04-06
* [Android] Update for Android 12.  Add new required permission android.permission.SCHEDULE_EXACT_ALARM

## [7.0.3] &mdash; 2021-06-30
* [Changed][Android] Allow multiple calls to .configure to allow re-configuring the fetch task.  Existing task will be cancelled and a new periodic fetch task re-scheduled according to new config.
* [Changed][Android] Ignore initial fetch task fired immediately.
* [Changed][Android] `android:exported="false"` on `BootReceiver` to resolve reported security analysis.

## [7.0.2] &mdash; 2021-05-25
* [Fixed][Android] Android failed to detect Capacitor v3 apps.  capacitor.config.json vs capacitor.config.[js|ts]
## [7.0.1] &mdash; 2021-02-18
* [Fixed][Android] Fix `java.lang.NullPointerException: Attempt to invoke virtual method 'java.lang.String com.transistorsoft.tsbackgroundfetch.BGTask.getTaskId()' on a null object reference`

## [7.0.0] &mdash; 2021-02-17

* [Added][iOS] Implement two new iOS options for `BackgroundFetch.scheduleTask`:
    - `bool requiresNetworkConnectivity`
    - `bool requiresCharging` (previously Android-only).

* [Changed][iOS] Migrate `TSBackgroundFetch.framework` to new `.xcframework` for *MacCatalyst* support with new Apple silcon.

### :warning: Breaking Change:  Requires `cocoapods >= 1.10+`.

*iOS'* new `.xcframework` requires *cocoapods >= 1.10+*:

```bash
$ pod --version
// if < 1.10.0
$ sudo gem install cocoapods
```

* [Added] task-timeout callback, executed when the operating system has signalled your remaining background-time is about to expire.  You must stop what you're doing and immediately call `BackgroundFetch.finish(taskId)`

### :warning: Breaking Change:  arguments to `BackgroundFetch.configure`

The method-signature for `BackgroundFetch.configure` **has dramatically changed** and now returns `Promise<BackgroundFetchStatus>`.

#### OLD:

When `BackgroundFetch` failed to start (eg: user disabled "Background Fetch" permission in your app settings), the *2nd argument* `failureCallback` would fire with the current `BackgroundFetchStatus`.

```javascript
BackgroundFetch.configure(eventCallback, failureCallback, config);
```

#### NEW:

```javascript
let status = await BackgroundFetch.configure(config, eventCallback, timeoutCallback);
```

The current `BackgroundFetchStatus` is now returned as a `Promise` when calling `.configure()`.  The `BackgroundFetchConfig` has moved from *3rd position* to *1st position*.  The *3rd argument* is now `timeoutCallback`, executed when OS has signalled your allowed background time is about to expire:

- `@param BackgroundFetchConfig` Configuration object.
- `@param Function` Event callback function.
- `@param Function` Event timeout callback function. This callback will be executed when the operating system has signalled your background-time is about to expire.

```javascript
// Usual config object.
let config = {minimumFetchInterval: 15};

// Usual BackgroundFetch event handler.
let eventCallback = async (taskId) => {  // <-- task callback.
  console.log('[BackgroundFetch] task: ', taskId);
  // Do your background work...
  BackgroundFetch.finish(taskId);
}

// NEW:  Timeout callback is executed when your Task has exceeded its allowed running-time.
// You must stop what you're doing immediately BackgroundFetch.finish(taskId)
let timeoutCallback = async (taskId) => {
  console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
  BackgroundFetch.finish(taskId);
}

// BackgroundFetch now returns a Promise<BackgroundFetchStatus> and the order-of-arguments
// has significantly changed.
let status = await BackgroundFetch.configure(config, eventCallback, timeoutCallback);

console.log('[BackgroundFetch] configure status: ', status);
```

### :warning: [Android] Breaking Change For Android Headless-task

- In order to differentiate *task timeout* events, the *Android Headless Task* now receives a `BGTask task` instance instead of `String taskId`.  When the OS signals your allowed background-time is about to expire, `task.getTimedOut()` will return `true`.  `taskId` is available via `task.getTaskId()`.

```java
package com.transistorsoft.cordova.backgroundfetch;

import android.content.Context;
import android.util.Log;

import com.transistorsoft.tsbackgroundfetch.BackgroundFetch;
import com.transistorsoft.tsbackgroundfetch.BGTask;  // <-- NEW:  import BGTask

public class BackgroundFetchHeadlessTask implements HeadlessTask {
    @Override
    public void onFetch(Context context, BGTask task) {  // <-- NEW:  BGTask instead of String taskId.
        String taskId     = task.getTaskId();
        boolean isTimeout = task.getTimedOut();
        if (isTimeout) {
            // The operating system has signalled your background-time is about to expire.
            // You must stop what you're doing and immediately call .finish(taskId).
            Log.d(BackgroundFetch.TAG, "BackgroundFetchHeadlessTask onFetch TIMEOUT taskId: " + task.getTaskId());
            BackgroundFetch.getInstance(context).finish(taskId);
            return;
        }
        Log.d(BackgroundFetch.TAG, "BackgroundFetchHeadlessTask onFetch: taskId: " + task.getTaskId());
        // Do your background work here...
        BackgroundFetch.getInstance(context).finish(taskId);
    }
}
```

## [6.1.1] &mdash; 2020-07-23
[Fixed] Modify `plugin.xml` to copy android `libs` to `platforms/android/libs` rather than referencing from `/plugins/src/android/libs` -- this was not possible with *PhoneGap Build*.

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

