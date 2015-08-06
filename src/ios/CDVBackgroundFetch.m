////
//  CDVBackgroundGeoLocation
//
//  Created by Chris Scott <chris@transistorsoft.com> on 2013-06-15
//  Largely based upon http://www.mindsizzlers.com/2011/07/ios-background-location/
//
#import "CDVBackgroundFetch.h"
#import <Cordova/CDVJSON.h>
#import "AppDelegate.h"

@implementation AppDelegate(AppDelegate)

-(void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
    void (^safeHandler)(UIBackgroundFetchResult) = ^(UIBackgroundFetchResult result){
        dispatch_async(dispatch_get_main_queue(), ^{
            completionHandler(result);
        });
    };
    [[NSNotificationCenter defaultCenter] postNotificationName:@"BackgroundFetch" object:safeHandler];
}

@end

@implementation CDVBackgroundFetch
{
    void (^_completionHandler)(UIBackgroundFetchResult);
    BOOL enabled;
    BOOL stopOnTerminate;

    NSNotification *_notification;
}
@synthesize fetchCallbackId;

- (void)pluginInitialize
{
    stopOnTerminate = NO;

    [[NSNotificationCenter defaultCenter] addObserver:self
        selector:@selector(onFetch:)
        name:@"BackgroundFetch"
        object:nil];
}

- (void) configure:(CDVInvokedUrlCommand*)command
{    
    NSLog(@"- CDVBackgroundFetch configure");
    UIApplication *app = [UIApplication sharedApplication];

    if (![app respondsToSelector:@selector(setMinimumBackgroundFetchInterval:)]) {
        NSLog(@" background fetch unsupported");
        return;
    }
    
    NSDictionary *config = [command.arguments objectAtIndex:0];
    if (config[@"stopOnTerminate"]) {
        stopOnTerminate = [[config objectForKey:@"stopOnTerminate"] boolValue];
    }

    self.fetchCallbackId = command.callbackId;
    
    [app setMinimumBackgroundFetchInterval:UIApplicationBackgroundFetchIntervalMinimum];
    [app.delegate self];
    
    UIApplicationState state = [app applicationState];
    
    // Handle case where app was launched due to background-fetch event
    if (state == UIApplicationStateBackground && _completionHandler && _notification) {
        [self onFetch:_notification];
    }
}

-(void) onFetch:(NSNotification *) notification
{
    NSLog(@"- CDVBackgroundFetch onFetch");
    if (!self.fetchCallbackId) {
        return;
    }
    _notification = notification;
    _completionHandler = [notification.object copy];
    
    // Inform javascript a background-fetch event has occurred.
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* result = nil;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [result setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:result callbackId:self.fetchCallbackId];
    }];
}
-(void) finish:(CDVInvokedUrlCommand*)command
{
    NSLog(@"- CDVBackgroundFetch finish");
    UIApplication *app = [UIApplication sharedApplication];
    if (_completionHandler) {
        NSLog(@"- CDVBackgroundFetch stopBackgroundTask (remaining t: %f)", app.backgroundTimeRemaining);
        _completionHandler(UIBackgroundFetchResultNewData);
        _completionHandler = nil;
    }
}

/**
 * Termination. Checks to see if it should turn off
 */
-(void) onAppTerminate
{
    NSLog(@"- CDVBackgroundFetch onAppTerminate");
    if (stopOnTerminate) {
        NSLog(@"- stopping background-fetch");
        UIApplication *app = [UIApplication sharedApplication];
        [app setMinimumBackgroundFetchInterval:UIApplicationBackgroundFetchIntervalNever];
    }
}

// If you don't stopMonitorying when application terminates, the app will be awoken still when a
// new location arrives, essentially monitoring the user's location even when they've killed the app.
// Might be desirable in certain apps.
- (void)applicationWillTerminate:(UIApplication *)application 
{
    
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
