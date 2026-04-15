# Example App

A simple Cordova app demonstrating `cordova-plugin-background-fetch`.

## Running

```bash
cd example/app

# iOS
LANG=en_US.UTF-8 cordova run ios

# Android
cordova run android
```

## Simulating Events

See the [Debugging Guide](https://fetch.transistorsoft.com/cordova/debugging) for how to simulate background-fetch events on iOS and Android.

### Quick reference

**iOS** (Xcode lldb console):
```
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.transistorsoft.fetch"]
```

**Android**:
```bash
adb shell cmd jobscheduler run -f com.transistorsoft.fetch.cordova.demo 999
```
