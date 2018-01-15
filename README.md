BackgroundFetch for iOS and Android
======================================== 

Background Fetch is a *very* simple plugin which will awaken an app in the background about **every 15 minutes**, providing a short period of background running-time.  This plugin will execute your provided `callbackFn` whenever a background-fetch event occurs.  

There is **no way** to increase the rate which a fetch-event occurs and this plugin sets the rate to the most frequent possible &mdash; you will **never** receive an event faster than **15 minutes**.  The operating-system will automatically throttle the rate the background-fetch events occur based upon usage patterns.  Eg: if user hasn't turned on their phone for a long period of time, fetch events will occur less frequently.

## Using the plugin ##
The plugin creates the object `window.BackgroundFetch` with the methods `configure(success, fail, option)`, `start(success, fail)` and `stop(success, fail)`. 

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

#### `@param {Boolean} stopOnTerminate [true]`

Set `false` to continue background-fetch events after user terminates the app.  Default to `true`.

#### `@param {Boolean} startOnBoot [false]`

Set `true` to initiate background-fetch events when the device is rebooted.  Defaults to `false`.

:exclamation: **NOTE:** `startOnBoot` requires `stopOnTerminate: false`.

#### `@param {Boolean} forceReload [false]`

Set `true` to automatically relaunch the application (if it was terminated) &mdash; the application will launch to the foreground then immediately minimize.  Defaults to `false`.


## Methods

| Method Name | Arguments | Notes
|---|---|---|
| `configure` | `callbackFn`, `failureFn`, `{config}` | Configures the plugin's fetch `callbackFn`.  This callback will fire each time an iOS background-fetch event occurs (typically every 15 min).  The `failureFn` will be called if the device doesn't support background-fetch. |
| `finish` | *none* | You **MUST** call this method in your fetch `callbackFn` provided to `#configure` in order to signal to iOS that your fetch action is complete.  iOS provides **only** 30s of background-time for a fetch-event -- if you exceed this 30s, iOS will kill your app. |
| `start` | `successFn`, `failureFn` | Start the background-fetch API.  Your `callbackFn` provided to `#configure` will be executed each time a background-fetch event occurs.  **NOTE** the `#configure` method *automatically* calls `#start`.  You do **not** have to call this method after you `#configure` the plugin |
| `stop` | `successFn`, `failureFn` | Stop the background-fetch API from firing fetch events.  Your `callbackFn` provided to `#configure` will no longer be executed. |

## Example ##

A full example could be:
```Javascript
   onDeviceReady: function() {
        var Fetcher = window.BackgroundFetch;
        
        // Your background-fetch handler.
        var fetchCallback = function() {
            console.log('[js] BackgroundFetch event received');

            // perform some asynchronous operation, such as an ajax request to your server.            
            $.get({
                url: '/heartbeat.json',
                callback: function(response) {
                    // process your response and whatnot.

                    ////
                    // IMPORTANT:  You MUST ALWAYS call the #finish method
                    // when your work is done to signal to the native code 
                    // that your task is complete.
                    //
                    // If you neglect this, the OS can terminate your
                    // app for spending too long in the background in
                    // addition to assigning "battery blame" to your app.
                    //
                    Fetcher.finish();  // <-- Signal that your task is complete
                }
            });
        }
        var failureCallback = function(error) {
            console.log('- BackgroundFetch failed', error);
        };
        Fetcher.configure(fetchCallback, failureCallback, {
            minimumFetchInterval: 15, // <-- default is 15
            stopOnTerminate: false,   // <-- Android only
            startOnBoot: true,        // <-- Android only
            forceReload: true         // <-- Android only
        });
    }
```

## iOS

Implements [performFetchWithCompletionHandler](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplicationDelegate_Protocol/Reference/Reference.html#//apple_ref/occ/intfm/UIApplicationDelegate/application:performFetchWithCompletionHandler:), firing a custom event subscribed-to in cordova plugin.  Unfortunately, iOS automatically ceases background-fetch events when the *user* explicitly terminates the application or reboots the device.

## Android

Android implements background fetch using two different mechanisms, depending on the Android SDK version.  Where the SDK version is `>= LOLLIPOP`, the new [`JobScheduler`](https://developer.android.com/reference/android/app/job/JobScheduler.html) API is used.  Otherwise, the old [`AlarmManager`](https://developer.android.com/reference/android/app/AlarmManager.html) will be used.

Unlike iOS, the Android implementation *can* continue to operate after application terminate (`stopOnTerminate: false`) or device reboot (`startOnBoot: true`).

## Licence ##

The MIT License

Copyright (c) 2013 Chris Scott, Transistor Software <chris@transistorsoft.com>
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
