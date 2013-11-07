#!/bin/bash

# Since PhoneGap has no direct access to AppDelegate.m, we're forced to patch in the required performFetchWithCompletionHandler method in via black-magic
# searching for the @end label and blindly patching in before that.
#
if pushd platforms/ios 2>/dev/null ; then   # iOS-specific actions...
    # Patch *-Info.plist
        PROJNAME=$(echo *.xcodeproj|sed -e 's/\..*//')
    sed -i '' 's/@end/\
-(void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler\
{\
    [[NSNotificationCenter defaultCenter] postNotificationName:@"BackgroundFetch" object:completionHandler];\
}\
@end/' $PROJNAME/Classes/AppDelegate.m
    popd
fi