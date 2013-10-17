////
//  CDVBackgroundGeoLocation
//
//  Created by Chris Scott <chris@transistorsoft.com> on 2013-06-15
//  Largely based upon http://www.mindsizzlers.com/2011/07/ios-background-location/
//
#import "CDVLocation.h"
#import "CDVBackgroundFetch.h"
#import <Cordova/CDVJSON.h>

@implementation CDVBackgroundFetch

@synthesize enabled;


- (void) configure:(CDVInvokedUrlCommand*)command
{
    
    NSLog(@"CDVBackgroundFetch configure");
}

- (void) start:(CDVInvokedUrlCommand*)command
{
    NSLog(@"CDVBackgroundFetch start");
    self.enabled = YES;
}

- (void) stop:(CDVInvokedUrlCommand*)command
{
    NSLog(@"CDVBackgroundFetch stop");
    self.enabled = NO;
}

- (void) test:(CDVInvokedUrlCommand*)command
{
    NSLog(@"CDVBackgroundFetch test");
}

// If you don't stopMonitorying when application terminates, the app will be awoken still when a
// new location arrives, essentially monitoring the user's location even when they've killed the app.
// Might be desirable in certain apps.
- (void)applicationWillTerminate:(UIApplication *)application 
{
    
}

- (void)dealloc
{
    
}

@end
