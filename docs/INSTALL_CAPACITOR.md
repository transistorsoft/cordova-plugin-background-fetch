# Capacitor Setup

```
npm install cordova-plugin-name
npx cap sync
```

## iOS Setup

### Configure Background Capabilities

With `YourApp.xcworkspace` open in XCode, add the following **Background Modes Capability**:

- [x] Background fetch

![](https://dl.dropbox.com/s/9f86qcx6l4v1muj/step6.png?dl=1)

### `AppDelegate.swift`

The Background Geolocation SDK is integrated with the [iOS Background Fetch API](https://developer.apple.com/documentation/uikit/core_app/managing_your_app_s_life_cycle/preparing_your_app_to_run_in_the_background/updating_your_app_with_background_app_refresh).

In Your **`AppDelegate.swift`**, add the following code (just the **`+green`** lines):

```diff
import UIKit
import Capacitor
+import TSBackgroundFetch

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Override point for customization after application launch.
    return true
  }

+ //Added for cordova-plugin-background-fetch
+ func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler:@escaping (UIBackgroundFetchResult) -> Void) {
+   NSLog("AppDelegate received fetch event");
+   let fetchManager = TSBackgroundFetch.sharedInstance();
+   fetchManager?.perform(completionHandler: completionHandler, applicationState: application.applicationState);
+ }
  .
  .
  .
}
```


## Android Setup

*Nothing else to perform*




