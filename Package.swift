// swift-tools-version:5.9
import PackageDescription

// Swift package used by cordova-ios >= 8 because plugin.xml declares
// <platform name="ios" package="swift">. Older cordova-ios ignores this file and uses the
// <source-file>/<header-file> and the TSBackgroundFetch <pod> in plugin.xml. (WO-001)
let package = Package(
    name: "cordova-plugin-background-fetch",
    platforms: [.iOS(.v15)],
    products: [
        // cordova-ios links .product(name: <plugin id>, package: <plugin id>), so this name must equal the plugin id. (WO-001)
        .library(name: "cordova-plugin-background-fetch", targets: ["CDVBackgroundFetch"])
    ],
    dependencies: [
        // cordova-ios rewrites this line to a local path at `cordova plugin add` with a greedy
        // regex; keep it alone on its own line. (WO-001)
        .package(url: "https://github.com/apache/cordova-ios.git", from: "8.0.0"),
        // 4.2.0 through every later 4.x: 4.2 is the first iOS 15 build. An app that also uses
        // background-geolocation needs a TSLocationManager that accepts 4.2 (4.8.x allows only 4.1.x). (WO-001)
        .package(url: "https://github.com/transistorsoft/transistor-background-fetch.git", from: "4.2.0")
    ],
    targets: [
        .target(
            name: "CDVBackgroundFetch",
            dependencies: [
                .product(name: "Cordova", package: "cordova-ios"),
                .product(name: "TSBackgroundFetch", package: "transistor-background-fetch")
            ],
            path: "src/ios",
            // SwiftPM rejects a C-family target with no include/ directory. (WO-001)
            publicHeadersPath: "."
        )
    ]
)
