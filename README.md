BackgroundFetch
==============================

iOS [Background Fetch](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/#//apple_ref/occ/instm/UIApplication/setMinimumBackgroundFetchInterval:) Implementation.  

iOS Background Fetch is basically an API which wakes up your app about every 15 minutes (during the user's prime-time hours) and provides your app **exactly 30s** of background running-time.  This plugin will execute your provided `callbackFn` whenever a background-fetch event occurs.  There is **no way** to increase the rate which a fetch-event occurs and this plugin sets the rate to the most frequent possible value of `UIApplicationBackgroundFetchIntervalMinimum` -- iOS determines the rate automatically based upon device usage and time-of-day (ie: fetch-rate is about ~15min during prime-time hours; less frequently when the user is presumed to be sleeping, at 3am for example).

[Tutorial](http://www.doubleencore.com/2013/09/ios-7-background-fetch/)

Follows the [Cordova Plugin spec](https://github.com/apache/cordova-plugman/blob/master/plugin_spec.md), so that it works with [Plugman](https://github.com/apache/cordova-plugman).

This plugin leverages Cordova/PhoneGap's [require/define functionality used for plugins](http://simonmacdonald.blogspot.ca/2012/08/so-you-wanna-write-phonegap-200-android.html). 

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

#### `@param {Integer} minimumFetchInterval [15]`

The minimum interval in **minutes** to execute background fetch events.  Defaults to **`15`** minutes.  **Note**:  Background-fetch events will **never** occur at a frequency higher than **every 15 minutes**.  Apple uses a secret algorithm to adjust the frequency of fetch events, presumably based upon usage patterns of the app.  Fetch events *can* occur less often than your configured `minimumFetchInterval`.

#### `@param {Boolean} stopOnTerminate`

Set `true` to cease background-fetch from operating if iOS terminates the app.  Defaults to `true`.  

:warning: Background-fetch events will **always** terminate if the *user* terminates the app.

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
            console.log('[js] BackgroundFetch initiated');

            // perform some ajax request to server here
            $.get({
                url: '/heartbeat.json',
                callback: function(response) {
                    // process your response and whatnot.

                    Fetcher.finish();   // <-- N.B. You MUST called #finish so that native-side can signal completion of the background-thread to the os.
                }
            });
        }
        var failureCallback = function(error) {
            console.log('- BackgroundFetch failed', error);
        };
        Fetcher.configure(fetchCallback, failureCallback, {
            stopOnTerminate: false  // <-- true is default
        });
    }
```

## iOS

Implements [performFetchWithCompletionHandler](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplicationDelegate_Protocol/Reference/Reference.html#//apple_ref/occ/intfm/UIApplicationDelegate/application:performFetchWithCompletionHandler:), firing a custom event subscribed-to in cordova plugin.

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
