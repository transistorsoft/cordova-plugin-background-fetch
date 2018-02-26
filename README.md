cordova-plugin-background-fetch &middot; [![npm](https://img.shields.io/npm/dm/cordova-plugin-background-fetch.svg)]() [![npm](https://img.shields.io/npm/v/cordova-plugin-background-fetch.svg)]()
==============================================================================

[![](https://dl.dropboxusercontent.com/s/nm4s5ltlug63vv8/logo-150-print.png?dl=1)](https://www.transistorsoft.com)

By [**Transistor Software**](https://www.transistorsoft.com), creators of [**Cordova Background Geolocation**](http://www.transistorsoft.com/shop/products/cordova-background-geolocation)

------------------------------------------------------------------------------

Background Fetch is a *very* simple plugin for iOS &amp; Android which will awaken an app in the background about **every 15 minutes**, providing a short period of background running-time.  This plugin will execute your provided `callbackFn` whenever a background-fetch event occurs.  

There is **no way** to increase the rate which a fetch-event occurs and this plugin sets the rate to the most frequent possible &mdash; you will **never** receive an event faster than **15 minutes**.  The operating-system will automatically throttle the rate the background-fetch events occur based upon usage patterns.  Eg: if user hasn't turned on their phone for a long period of time, fetch events will occur less frequently.

## Using the plugin ##
The plugin creates the object **`window.BackgroundFetch`**.

## Installing the plugin ##

### Command Line

```bash
   $ cordova plugin add cordova-plugin-background-fetch
```

### PhoneGap Build

```xml
  <plugin name="cordova-plugin-background-fetch" source="npm" />
```

## Config 

### Common Options

#### `@param {Integer} minimumFetchInterval [15]`

The minimum interval in **minutes** to execute background fetch events.  Defaults to **`15`** minutes.  **Note**:  Background-fetch events will **never** occur at a frequency higher than **every 15 minutes**.  Apple uses a secret algorithm to adjust the frequency of fetch events, presumably based upon usage patterns of the app.  Fetch events *can* occur less often than your configured `minimumFetchInterval`.

### Android Options

#### `@config {Boolean} stopOnTerminate [true]`

Set `false` to continue background-fetch events after user terminates the app.  Default to `true`.

#### `@config {Boolean} startOnBoot [false]`

Set `true` to initiate background-fetch events when the device is rebooted.  Defaults to `false`.

:exclamation: **NOTE:** `startOnBoot` requires `stopOnTerminate: false`.

#### `@config {Boolean} forceReload [false]`

Set `true` to automatically relaunch the application (if it was terminated) &mdash; the application will launch to the foreground then immediately minimize.  Defaults to `false`.

#### `@config {Boolean} enableHeadless [false]`

:warning: **For advanced users only**.  In order to use **`enableHeadless: true`**, you must be prepared to **write Java code**.  If you're not prepared to write Java code, turn away now and do **not** enable this :warning:.

When your application is terminated with **`stopOnTerminate: false`**, your Javascript app (and your Javascript fetch `callback`) *are* terminated.  However, the plugin provides a mechanism for you to handle background-fetch events in the **Native Android Environment**, as an alternative to `forceReload: true`, which forcibly re-launches your entire Cordova application.

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
import android.util.Log;

public class BackgroundFetchHeadlessTask implements HeadlessTask {
    @Override
    public void onFetch(Context context) {
        Log.d(BackgroundFetch.TAG, "My BackgroundFetchHeadlessTask:  onFetch");
        // Perform your work here.

        // Just as in Javascript callback, you must signal #finish
        BackgroundFetch.getInstance(context).finish();
    }
}
```

2.  In your **`config.xml`**, add the following **`<resource-file>`** element to the **`<platform name="android">`**:
```xml
<platform name="android">
    <resource-file src="src/android/BackgroundFetchHeadlessTask.java" target="src/com/transistorsoft/cordova/backgroundfetch/BackgroundFetchHeadlessTask.java" />
</platform>
```
- `src`: path to your custom `BackgroundFetchHeadlessTask.java` file.
- `target`:  :warning: **Must** be *exactly* as shown above.

This will copy your custom Java source-file into the `cordova-plugin-background-fetch` plugin, effectively overriding the plugin.

:warning: You're responsible for managing your own gradle dependencies.  To import 3rd-party libraries, you'll have to import your own custom `build-extras.gradle` (See "build-extras" [here in the Cordova Android Platform Documentation](https://cordova.apache.org/docs/en/latest/guide/platforms/android/))

## Methods

| Method Name | Arguments | Notes
|---|---|---|
| `configure` | `callbackFn`, `failureFn`, `{config}` | Configures the plugin's fetch `callbackFn`.  This callback will fire each time an iOS background-fetch event occurs (typically every 15 min).  The `failureFn` will be called if the device doesn't support background-fetch. |
| `finish` | *none* | You **MUST** call this method in your fetch `callbackFn` provided to `#configure` in order to signal to iOS that your fetch action is complete.  iOS provides **only** 30s of background-time for a fetch-event -- if you exceed this 30s, iOS will kill your app. |
| `start` | `successFn`, `failureFn` | Start the background-fetch API.  Your `callbackFn` provided to `#configure` will be executed each time a background-fetch event occurs.  **NOTE** the `#configure` method *automatically* calls `#start`.  You do **not** have to call this method after you `#configure` the plugin |
| `stop` | `successFn`, `failureFn` | Stop the background-fetch API from firing fetch events.  Your `callbackFn` provided to `#configure` will no longer be executed. |

## Example ##

#### Pure Cordova Javascript (eg: Ionic 1)
```javascript
onDeviceReady: function() {
  var BackgroundFetch = window.BackgroundFetch;

  // Your background-fetch handler.
  var fetchCallback = function() {
    console.log('[js] BackgroundFetch event received');

    // Required: Signal completion of your task to native code
    // If you fail to do this, the OS can terminate your app
    // or assign battery-blame for consuming too much background-time
    BackgroundFetch.finish();
  };

  var failureCallback = function(error) {
    console.log('- BackgroundFetch failed', error);
  };

  BackgroundFetch.configure(fetchCallback, failureCallback, {
    minimumFetchInterval: 15, // <-- default is 15
    stopOnTerminate: false,   // <-- Android only
    startOnBoot: true,        // <-- Android only
    forceReload: true         // <-- Android only
  });
}
```

#### Ionic 2+ Example
```javascript
import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  constructor(public navCtrl: NavController, public platform: Platform) {
    this.platform.ready().then(this.onDeviceReady.bind(this));
  }

  onDeviceReady() {
    let BackgroundFetch = (<any>window).BackgroundFetch;
        
    // Your background-fetch handler.
    let fetchCallback = function() {
        console.log('[js] BackgroundFetch event received');
        // Required: Signal completion of your task to native code
        // If you fail to do this, the OS can terminate your app
        // or assign battery-blame for consuming too much background-time
        BackgroundFetch.finish();
    }
    let failureCallback = function(error) {
        console.log('- BackgroundFetch failed', error);
    };
    BackgroundFetch.configure(fetchCallback, failureCallback, {
        minimumFetchInterval: 15, // <-- default is 15
        stopOnTerminate: false,   // <-- Android only
        startOnBoot: true,        // <-- Android only
        forceReload: true         // <-- Android only
    });        
  }
}
```

## Debugging

### iOS

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

## iOS

Implements [performFetchWithCompletionHandler](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplicationDelegate_Protocol/Reference/Reference.html#//apple_ref/occ/intfm/UIApplicationDelegate/application:performFetchWithCompletionHandler:), firing a custom event subscribed-to in cordova plugin.  Unfortunately, iOS automatically ceases background-fetch events when the *user* explicitly terminates the application or reboots the device.

## Android

Android implements background fetch using two different mechanisms, depending on the Android SDK version.  Where the SDK version is `>= LOLLIPOP`, the new [`JobScheduler`](https://developer.android.com/reference/android/app/job/JobScheduler.html) API is used.  Otherwise, the old [`AlarmManager`](https://developer.android.com/reference/android/app/AlarmManager.html) will be used.

Unlike iOS, the Android implementation *can* continue to operate after application terminate (`stopOnTerminate: false`) or device reboot (`startOnBoot: true`).

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
