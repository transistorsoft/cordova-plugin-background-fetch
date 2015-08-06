BackgroundFetch
==============================

iOS [Background Fetch](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/#//apple_ref/occ/instm/UIApplication/setMinimumBackgroundFetchInterval:) Implementation.  

iOS Background Fetch is basically an API which wakes up your app about every 15 minutes (during the user's prime-time hours) and provides your app **exactly 30s** of background running-time.  This plugin will execute your provided `callbackFn` whenever a background-fetch event occurs.  There is **no way** to increase the rate which a fetch-event occurs and this plugin sets the rate to the most frequent possible value of `UIApplicationBackgroundFetchIntervalMinimum` -- iOS determines the rate automatically based upon device usage and time-of-day (ie: fetch-rate is about ~15min during prime-time hours; less frequently when the user is presumed to be sleeping, at 3am for example).

[Tutorial](http://www.doubleencore.com/2013/09/ios-7-background-fetch/)

Follows the [Cordova Plugin spec](https://github.com/apache/cordova-plugman/blob/master/plugin_spec.md), so that it works with [Plugman](https://github.com/apache/cordova-plugman).

This plugin leverages Cordova/PhoneGap's [require/define functionality used for plugins](http://simonmacdonald.blogspot.ca/2012/08/so-you-wanna-write-phonegap-200-android.html). 

## Using the plugin ##
The plugin creates the object `window.BackgroundFetch` with the methods `configure(success, fail, option)`, `start(success, fail)` and `stop(success, fail). 

## Installing the plugin ##

1.Download the repo using GIT or just a ZIP from Github.

2.Add the plugin to your project (from the root of your project):

```
   $ cordova plugin add https://github.com/christocracy/cordova-plugin-background-fetch.git
```

## Config 

####`@param {Boolean} stopOnTerminate`

Set `true` to cease background-fetch from operating after user "closes" the app.  Defaults to `false`.

## Example ##

A full example could be:
```
   onDeviceReady: function() {
        var Fetcher = window.BackgroundFetch;
        
        // Your background-fetch handler.
        var fetchCallback = function() {
            console.log('BackgroundFetch initiated');

            // perform your ajax request to server here
            $.get({
                url: '/heartbeat.json',
                callback: function(response) {
                    // process your response and whatnot.

                    Fetcher.finish();   // <-- N.B. You MUST called #finish so that native-side can signal completion of the background-thread to the os.
                }
            });
        }
        var failureCallback = function() {
            console.log('- BackgroundFetch failed');
        };
        Fetcher.configure(fetchCallback, failureCallback, {
            stopOnTerminate: false  // <-- false is default
        });
    }


```

## iOS

Implements [performFetchWithCompletionHandler](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplicationDelegate_Protocol/Reference/Reference.html#//apple_ref/occ/intfm/UIApplicationDelegate/application:performFetchWithCompletionHandler:), firing a custom event subscribed-to in cordova plugin.



## Licence ##

The MIT License

Copyright (c) 2013 Chris Scott <chris@transistorsoft.com>
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
