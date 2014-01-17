#import "AppDelegate.h"

@implementation AppDelegate(AppDelegate)

-(void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
    [[NSNotificationCenter defaultCenter] postNotificationName:@"BackgroundFetch" object:completionHandler];
}

@end