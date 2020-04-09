# Capacitor Setup

```
npm install cordova-plugin-background-fetch
npx cap sync
```

## iOS Setup

### Configure Background Capabilities

With `YourApp.xcworkspace` open in XCode, add the following **Background Modes Capability**:

- [x] Background fetch
- [x] Background processing (Only if you intend to use `BackgroundFetch.scheduleTask`)

![](https://dl.dropboxusercontent.com/s/9vik5kxoklk63ob/ios-setup-background-modes.png?dl=1)


## Configure `Info.plist` &mdash; :new: iOS 13+
1.  Open your __`Info.plist`__ and add the key *"Permitted background task scheduler identifiers"*

![](https://dl.dropboxusercontent.com/s/t5xfgah2gghqtws/ios-setup-permitted-identifiers.png?dl=1)

2.  Add the **required identifier `com.transistorsoft.fetch`**.

![](https://dl.dropboxusercontent.com/s/kwdio2rr256d852/ios-setup-permitted-identifiers-add.png?dl=1)

3.  If you intend to execute your own [custom tasks](#executing-custom-tasks) via **`BackgroundFetch.scheduleTask`**, you must add those custom identifiers as well.  For example, if you intend to execute a custom **`taskId: 'com.transistorsoft.customtask'`**, you must add the identifier **`com.transistorsoft.customtask`** to your *"Permitted background task scheduler identifiers"*, as well.

:warning: A task identifier can be any string you wish, but it's a good idea to prefix them now with `com.transistorsoft.` &mdash;  In the future, the `com.transistorsoft` prefix **may become required**.

```dart
BackgroundFetch.scheduleTask(TaskConfig(
  taskId: 'com.transistorsoft.customtask',
  delay: 60 * 60 * 1000  //  In one hour (milliseconds)
));
```

### `AppDelegate.swift`

For devices running iOS < 13, the Background Geolocation SDK will implement the *deprecated* [iOS Background Fetch API](https://developer.apple.com/documentation/uikit/core_app/managing_your_app_s_life_cycle/preparing_your_app_to_run_in_the_background/updating_your_app_with_background_app_refresh).

In Your **`AppDelegate.swift`**, add the following code (just the **`+green`** lines):

```diff
import UIKit
import Capacitor
+import TSBackgroundFetch

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

+ // Added for cordova-plugin-background-fetch
+ func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler:@escaping (UIBackgroundFetchResult) -> Void) {
+   NSLog("AppDelegate received fetch event");
+   TSBackgroundFetch.sharedInstance().perform(completionHandler: completionHandler, applicationState: application.applicationState);
+ }
  .
  .
  .
}
```


## Android Setup

*Nothing else to perform*




