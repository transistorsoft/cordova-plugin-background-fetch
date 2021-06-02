cordova-plugin-background-fetch &middot; [![npm](https://img.shields.io/npm/dm/cordova-plugin-background-fetch.svg)]() [![npm](https://img.shields.io/npm/v/cordova-plugin-background-fetch.svg)]()
==============================================================================

[![](https://dl.dropboxusercontent.com/s/nm4s5ltlug63vv8/logo-150-print.png?dl=1)](https://www.transistorsoft.com)

By [**Transistor Software**](https://www.transistorsoft.com), creators of [**Cordova Background Geolocation**](http://www.transistorsoft.com/shop/products/cordova-background-geolocation)

-------------------------------------------------------------------------------
### :new: :stop_sign: *Capacitor* version now available! See [__`capacitor-background-fetch`__](https://github.com/transistorsoft/capacitor-background-fetch) :stop_sign:
------------------------------------------------------------------------------

Background Fetch is a *very* simple plugin which attempts to awaken an app in the background about **every 15 minutes**, providing a short period of background running-time.  This plugin will execute your provided `callbackFn` whenever a background-fetch event occurs.

There is **no way** to increase the rate which a fetch-event occurs and this plugin sets the rate to the most frequent possible &mdash; you will **never** receive an event faster than **15 minutes**.  The operating-system will automatically throttle the rate the background-fetch events occur based upon usage patterns.  Eg: if user hasn't turned on their phone for a long period of time, fetch events will occur less frequently or if an iOS user disables background refresh they may not happen at all.

:new: Background Fetch now provides a [__`scheduleTask`__](#executing-custom-tasks) method for scheduling arbitrary "one-shot" or periodic tasks.

### iOS
- There is **no way** to increase the rate which a fetch-event occurs and this plugin sets the rate to the most frequent possible &mdash; you will **never** receive an event faster than **15 minutes**.  The operating-system will automatically throttle the rate the background-fetch events occur based upon usage patterns.  Eg: if user hasn't turned on their phone for a long period of time, fetch events will occur less frequently.
- [__`scheduleTask`__](#executing-custom-tasks) seems only to fire when the device is plugged into power.
- ⚠️ When your app is **terminated**, iOS *no longer fires events* &mdash; There is *no such thing* as **`stopOnTerminate: false`** for iOS.
- iOS can take *days* before Apple's machine-learning algorithm settles in and begins regularly firing events.  Do not sit staring at your logs waiting for an event to fire.  If your [*simulated events*](#debugging-1) work, that's all you need to know that everything is correctly configured.
- If the user doesn't open your *iOS* app for long periods of time, *iOS* will **stop firing events**.

### Android
- The Android plugin provides a [Headless](#config-boolean-enableheadless-false) implementation allowing you to continue handling events even after app terminate.

-------------------------------------------------------------

# Contents
- ### :books: [API Documentation](#api-documentation)
  - [Config](#config)
  - [Methods](#methods)
- ### [Using the plugin](#using-the-plugin-1)
- ### [Installing the Plugin](#installing-the-plugin-1)
- ### [Setup Guides](#setup)
- ### [Example](#example-1)
- ### [Debugging](#debugging-1)

-------------------------------------------------------------

## Using the plugin ##

- **Cordova / Ionic 1**
The plugin creates the object **`window.BackgroundFetch`**.

- With Typescript (eg: Ionic 2+):
```typescript
import BackgroundFetch from "cordova-plugin-background-fetch";

```


## Installing the plugin ##

#### :warning: *Cocoapods* >= `1.10.0` is required:
```console
$ pod --version
// if < 1.10.0
$ sudo gem install cocoapods
```

- ### Ionic
```
ionic cordova plugin add cordova-plugin-background-fetch
```

- ### Pure Cordova

```bash
cordova plugin add cordova-plugin-background-fetch
```

- ### Capacitor
```bash
npm install cordova-plugin-background-fetch
npx cap sync
```
:information_source: See [Capacitor Setup](./docs/INSTALL_CAPACITOR.md)


## Setup

### iOS Setup

If you intend to execute your own [custom tasks](#executing-custom-tasks) via **`BackgroundFetch.scheduleTask`**, for example:

```javascript
BackgroundFetch.scheduleTask({
  taskId: 'com.transistorsoft.customtask1',  // <-- Your custom task-identifier
  delay: 60 * 60 * 1000  //  In one hour (milliseconds)
});
.
.
.
BackgroundFetch.scheduleTask({
  taskId: 'com.transistorsoft.customtask2',  // <-- Your custom task-identifier
  delay: 60 * 60 * 1000  //  In one hour (milliseconds)
});
```

You must register these custom *task-identifiers* with your iOS app's __`Info.plist`__ *"Permitted background task scheduler identifiers"*:

:open_file_folder: In your __`config.xml`__, find the __`<platform name="ios">`__ container and register your custom *task-identifier(s)*:
```xml
  <platform name="ios">
      <config-file parent="BGTaskSchedulerPermittedIdentifiers" target="*-Info.plist">
          <array>
              <string>com.transistorsoft.customtask1</string>
              <string>com.transistorsoft.customtask2</string>
          </array>
      </config-file>
  </platform>
```

:warning: A task identifier can be any string you wish, but it's a good idea to prefix them now with `com.transistorsoft.` &mdash;  In the future, the `com.transistorsoft` prefix **may become required**.

## Example ##

### Pure Cordova Javascript (eg: Ionic 1)
```javascript
onDeviceReady: async function() {
  var BackgroundFetch = window.BackgroundFetch;

  // Your BackgroundFetch event handler.
  var onEvent = async function(taskId) {
      console.log('[BackgroundFetch] event received: ', taskId);
      // Required: Signal completion of your task to native code
      // If you fail to do this, the OS can terminate your app
      // or assign battery-blame for consuming too much background-time
      BackgroundFetch.finish(taskId);
  };

  // Timeout callback is executed when your Task has exceeded its allowed running-time.
  // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
  var onTimeout = async function(taskId) {
      console.log('[BackgroundFetch] TIMEOUT: ', taskId);
      BackgroundFetch.finish(taskId);
  };

  var status = await BackgroundFetch.configure({minimumFetchInterval: 15}, onEvent, onTimeout);
  console.log('[BackgroundFetch] configure status: ', status);
}
```

### Ionic 2+ Example

```javascript
import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import BackgroundFetch from "cordova-plugin-background-fetch";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  constructor(public navCtrl: NavController, public platform: Platform) {
    this.platform.ready().then(this.onDeviceReady.bind(this));
  }

  async onDeviceReady() {
    // Your BackgroundFetch event handler.
    let onEvent = async (taskId) => {
        console.log('[BackgroundFetch] event received: ', taskId);
        // Required: Signal completion of your task to native code
        // If you fail to do this, the OS can terminate your app
        // or assign battery-blame for consuming too much background-time
        BackgroundFetch.finish(taskId);
    };

    // Timeout callback is executed when your Task has exceeded its allowed running-time.
    // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
    let onTimeout = async (taskId) => {
        console.log('[BackgroundFetch] TIMEOUT: ', taskId);
        BackgroundFetch.finish(taskId);
    };

    // Configure the plugin.
    let status = await BackgroundFetch.configure({minimumFetchInterval: 15}, onEvent, onTimeout);
    console.log('[BackgroundFetch] configure, status: ', status);
  }
}
```

### Executing Custom Tasks

In addition to the default background-fetch task defined by `BackgroundFetch.configure`, you may also execute your own arbitrary "oneshot" or periodic tasks (iOS requires additional [Setup Instructions](#setup)).  However, all events will be fired into the Callback provided to **`BackgroundFetch#configure`**:

### ⚠️ iOS:
- `scheduleTask` on *iOS* seems only to run when the device is plugged into power.
- `scheduleTask` on *iOS* are designed for *low-priority* tasks, such as purging cache files &mdash; they tend to be **unreliable for mission-critical tasks**.  `scheduleTask` will *never* run as frequently as you want.
- The default `fetch` event is much more reliable and fires far more often.
- `scheduleTask` on *iOS* stop when the *user* terminates the app.  There is no such thing as `stopOnTerminate: false` for *iOS*.

```javascript
// Step 1:  Configure BackgroundFetch as usual.
let status = await BackgroundFetch.configure({
  minimumFetchInterval: 15
}, (taskId) => {  // <-- Event callback.
  console.log("[BackgroundFetch] taskId: ", taskId);

  // Use a switch statement to route task-handling.
  switch (taskId) {
    case 'com.transistorsoft.customtask':
      print("Received custom task");
      break;
    default:
      print("Default fetch task");
  }
  // Finish, providing received taskId.
  BackgroundFetch.finish(taskId);
}, (taskId) => {  // <-- Task timeout callback.
  // This task has exceeded its allowed running-time.
  // You must stop what you're doing and immediately .finish(taskId)
  console.log('[BackgroundFetch] TIMEOUT taskId: ', taskId);
  BackgroundFetch.finish(taskId);
});

// Step 2:  Schedule a custom "oneshot" task "com.transistorsoft.customtask" to execute 5000ms from now.
BackgroundFetch.scheduleTask({
  taskId: "com.transistorsoft.customtask",
  forceAlarmManager: true,
  delay: 5000  // <-- milliseconds
});
```
# API Documentation

## Config

### Common Options

#### `@param {Integer} minimumFetchInterval [15]`

The minimum interval in **minutes** to execute background fetch events.  Defaults to **`15`** minutes.  **Note**:  Background-fetch events will **never** occur at a frequency higher than **every 15 minutes**.  Apple uses a secret algorithm to adjust the frequency of fetch events, presumably based upon usage patterns of the app.  Fetch events *can* occur less often than your configured `minimumFetchInterval`.

#### `@param {Integer} delay (milliseconds)`

:information_source: Valid only for `BackgroundGeolocation.scheduleTask`.  The minimum number of milliseconds in future that task should execute.

#### `@param {Boolean} periodic [false]`

:information_source: Valid only for `BackgroundGeolocation.scheduleTask`.  Defaults to `false`.  Set true to execute the task repeatedly.  When `false`, the task will execute **just once**.

### Android Options

#### `@config {Boolean} stopOnTerminate [true]`

Set `false` to continue background-fetch events after user terminates the app.  Default to `true`.

#### `@config {Boolean} startOnBoot [false]`

Set `true` to initiate background-fetch events when the device is rebooted.  Defaults to `false`.

:exclamation: **NOTE:** `startOnBoot` requires `stopOnTerminate: false`.

#### `@config {Boolean} forceAlarmManager [false]`

By default, the plugin will use Android's `JobScheduler` when possible.  The `JobScheduler` API prioritizes for battery-life, throttling task-execution based upon device usage and battery level.

Configuring `forceAlarmManager: true` will bypass `JobScheduler` to use Android's older `AlarmManager` API, resulting in more accurate task-execution at the cost of **higher battery usage**.

```javascript
let status = await BackgroundFetch.configure({
  minimumFetchInterval: 15,
  forceAlarmManager: true
}, async (taskId) => {
  console.log("[BackgroundFetch] taskId: ", taskId);
  BackgroundFetch.finish(taskId);
}, async (taskId) => {
  // This task has exceeded its allowed running-time.
  // You must stop what you're doing and immediately .finish(taskId)
  console.log('[BackgroundFetch] TIMEOUT taskId: ', taskId);
  BackgroundFetch.finish(taskId);
});
.
.
.
// And with with #scheduleTask
BackgroundFetch.scheduleTask({
  taskId: 'com.transistorsoft.customtask',
  delay: 5000,       // milliseconds
  forceAlarmManager: true
  periodic: false
});
```

#### `@config {integer} requiredNetworkType [BackgroundFetch.NETWORK_TYPE_NONE]`

Set basic description of the kind of network your job requires.

If your job doesn't need a network connection, you don't need to use this option as the default value is `BackgroundFetch.NETWORK_TYPE_NONE`.

| NetworkType                           | Description                                                         |
|---------------------------------------|---------------------------------------------------------------------|
| `BackgroundFetch.NETWORK_TYPE_NONE`     | This job doesn't care about network constraints, either any or none.|
| `BackgroundFetch.NETWORK_TYPE_ANY`      | This job requires network connectivity.                             |
| `BackgroundFetch.NETWORK_TYPE_CELLULAR` | This job requires network connectivity that is a cellular network.  |
| `BackgroundFetch.NETWORK_TYPE_UNMETERED` | This job requires network connectivity that is unmetered.          |
| `BackgroundFetch.NETWORK_TYPE_NOT_ROAMING` | This job requires network connectivity that is not roaming.      |

#### `@config {Boolean} requiresBatteryNotLow [false]`

Specify that to run this job, the device's battery level must not be low.

This defaults to false. If true, the job will only run when the battery level is not low, which is generally the point where the user is given a "low battery" warning.

#### `@config {Boolean} requiresStorageNotLow [false]`

Specify that to run this job, the device's available storage must not be low.

This defaults to false. If true, the job will only run when the device is not in a low storage state, which is generally the point where the user is given a "low storage" warning.

#### `@config {Boolean} requiresCharging [false]`

Specify that to run this job, the device must be charging (or be a non-battery-powered device connected to permanent power, such as Android TV devices). This defaults to false.

#### `@config {Boolean} requiresDeviceIdle [false]`

When set true, ensure that this job will not run if the device is in active use.

The default state is false: that is, the for the job to be runnable even when someone is interacting with the device.

This state is a loose definition provided by the system. In general, it means that the device is not currently being used interactively, and has not been in use for some time. As such, it is a good time to perform resource heavy jobs. Bear in mind that battery usage will still be attributed to your application, and surfaced to the user in battery stats.

#### `@config {Boolean} enableHeadless [false]`

:warning: **For advanced users only**.  In order to use **`enableHeadless: true`**, you must be prepared to **write Java code**.  If you're not prepared to write Java code, turn away now and do **not** enable this :warning:.

When your application is terminated with **`stopOnTerminate: false`**, your Javascript app (and your Javascript fetch `callback`) *are* terminated.  However, the plugin provides a mechanism for you to handle background-fetch events in the **Native Android Environment**.

Some examples where you could use the "Headless" mechanism:
- Refreshing API keys.
- Performing HTTP requests with your server.
- Posting a local notification

#### Headless Fetch Setup

1. create a new file in your Cordova application named **`BackgroundFetchHeadlessTask.java`.** :warning: The file can be located anywhere in your app but **MUST** be named **`BackgroundFetchHeadlessTask.java`**.

eg: :open_file_folder: **`src/android/BackgroundFetchHeadlessTask.java`**
```java
package com.transistorsoft.cordova.backgroundfetch;
import android.content.Context;
import com.transistorsoft.tsbackgroundfetch.BackgroundFetch;
import com.transistorsoft.tsbackgroundfetch.BGTask;
import android.util.Log;

public class BackgroundFetchHeadlessTask implements HeadlessTask {
    @Override
    public void onFetch(Context context, BGTask task) {
        String taskId = task.getTaskId();
        boolean isTimeout = task.getTimedOut();
        if (isTimeout) {
          Log.d(BackgroundFetch.TAG, "My BackgroundFetchHeadlessTask TIMEOUT: " + taskId);
          BackgroundFetch.getInstance(context).finish(taskId);
          return;
        }
        Log.d(BackgroundFetch.TAG, "My BackgroundFetchHeadlessTask:  onFetch: " + taskId);
        // Perform your work here....

        // Just as in Javascript callback, you must signal #finish
        BackgroundFetch.getInstance(context).finish(taskId);
    }
}
```

2.  In your **`config.xml`**, add the following **`<resource-file>`** element to the **`<platform name="android">`**:
```xml
<platform name="android">
    <resource-file src="src/android/BackgroundFetchHeadlessTask.java" target="app/src/main/java/com/transistorsoft/cordova/backgroundfetch/BackgroundFetchHeadlessTask.java" />
</platform>
```
- `src`: path to your custom `BackgroundFetchHeadlessTask.java` file.
- `target`:  :warning: **Must** be *exactly* as shown above.

This will copy your custom Java source-file into the `cordova-plugin-background-fetch` plugin, effectively overriding the plugin.

:warning: You're responsible for managing your own gradle dependencies.  To import 3rd-party libraries, you'll have to import your own custom `build-extras.gradle` (See "build-extras" [here in the Cordova Android Platform Documentation](https://cordova.apache.org/docs/en/latest/guide/platforms/android/))

## Methods

| Method Name | Arguments | Returns | Notes |
|-------------|-----------|---------|-------|
| `configure` | `{BackgroundFetchConfig}`, `callbackFn`, `timeoutFn` | `Promise<BackgroundFetchStatus>` | Configures the plugin's fetch `callbackFn` and `timeoutFn`.  This `callbackFn` will fire each time an iOS background-fetch event occurs (typically every 15 min).  The `timeoutFn` will be called when the OS reports your task is nearing the end of its allowed background-time. |
| `scheduleTask` | `{TaskConfig}` | `Void` | Executes a custom task.  The task will be executed in the same `Callback` function provided to `#configure`. |
| `stopTask` | `String taskId`, `successFn`,`failureFn` | `Void` | Stops a `scheduleTask` from running. |
| `finish` | `String taskId` | `Void` | You **MUST** call this method in your `callbackFn` provided to `#configure` in order to signal to the OS that your task is complete.  iOS provides **only** 30s of background-time for a fetch-event -- if you exceed this 30s, iOS will kill your app. |
| `start` | `successFn`, `failureFn` | `Void` | Start the background-fetch API.  Your `callbackFn` provided to `#configure` will be executed each time a background-fetch event occurs.  **NOTE** the `#configure` method *automatically* calls `#start`.  You do **not** have to call this method after you `#configure` the plugin |
| `stop` | `successFn`, `failureFn` | `Void` | Stop the background-fetch API from firing fetch events.  Your `callbackFn` provided to `#configure` will no longer be executed. |
| `status` | `callbackFn` | `Void` | Your callback will be executed with the current `status (Integer)` `0: Restricted`, `1: Denied`, `2: Available`.  These constants are defined as `BackgroundFetch.STATUS_RESTRICTED`, `BackgroundFetch.STATUS_DENIED`, `BackgroundFetch.STATUS_AVAILABLE` (**NOTE:** Android will always return `STATUS_AVAILABLE`)|


## Debugging

### iOS

#### :new: `BGTaskScheduler` API for iOS 13+

- :warning: At the time of writing, the new task simulator does not yet work in Simulator; Only real devices.
- See Apple docs [Starting and Terminating Tasks During Development](https://developer.apple.com/documentation/backgroundtasks/starting_and_terminating_tasks_during_development?language=objc)
- After running your app in XCode, Click the `[||]` button to initiate a *Breakpoint*.
- In the console `(lldb)`, paste the following command (**Note:**  use cursor up/down keys to cycle through previously run commands):
```obj-c
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.transistorsoft.fetch"]
```
- Click the `[ > ]` button to continue.  The task will execute and the Callback function provided to **`BackgroundFetch.configure`** will receive the event.


![](https://dl.dropboxusercontent.com/s/zr7w3g8ivf71u32/ios-simulate-bgtask-pause.png?dl=1)

![](https://dl.dropboxusercontent.com/s/87c9uctr1ka3s1e/ios-simulate-bgtask-paste.png?dl=1)

![](https://dl.dropboxusercontent.com/s/bsv0avap5c2h7ed/ios-simulate-bgtask-play.png?dl=1)

#### Simulating task-timeout events

First comment-out your call to `BackgroundFetch.finish(taskId)` in your `eventCallback` to simulate a task taking too long.

```javascript
let status = await BackgroundFetch.configure({
  minimumFetchInterval: 15
}, async (taskId) => {  // <-- Event callback.
  // This is the task callback.
  console.log("[BackgroundFetch] taskId", taskId);
  ////
  // NOTE:  Disable BackgroundFetch.finish(taskId) when simulating an iOS task timeout
  //BackgroundFetch.finish(taskId);
  //
}, async (taskId) => {  // <-- Event timeout callback
  // This task has exceeded its allowed running-time.
  // You must stop what you're doing and immediately .finish(taskId)
  print("[BackgroundFetch] TIMEOUT taskId:", taskId);
  BackgroundFetch.finish(taskId);
});
```

- Now simulate an iOS task timeout as follows, in the same manner as simulating an event above:
```obj-c
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateExpirationForTaskWithIdentifier:@"com.transistorsoft.fetch"]
```

#### Old `BackgroundFetch` API
- Simulate background fetch events in XCode using **`Debug->Simulate Background Fetch`**
- iOS can take some hours or even days to start a consistently scheduling background-fetch events since iOS schedules fetch events based upon the user's patterns of activity.  If *Simulate Background Fetch* works, your can be **sure** that everything is working fine.  You just need to wait.

### Android

- Observe plugin logs in `$ adb logcat`:
```bash
$ adb logcat -s TSBackgroundFetch
```
- Simulate a background-fetch event on a device (insert *&lt;your.application.id&gt;*) (only works for sdk `24+`):
```bash
$ adb shell cmd jobscheduler run -f <your.application.id> 999
```
- For devices with sdk `<21`, simulate a "Headless JS" event with (insert *&lt;your.application.id&gt;*)
```bash
$ adb shell am broadcast -a <your.application.id>.event.BACKGROUND_FETCH

```

## Licence ##

The MIT License

Copyright (c) 2018 Chris Scott, Transistor Software <chris@transistorsoft.com>
http://transistorsoft.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
