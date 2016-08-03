////
//  CDVBackgroundGeoLocation
//
//  Created by Chris Scott <chris@transistorsoft.com> on 2013-06-15
//  Largely based upon http://www.mindsizzlers.com/2011/07/ios-background-location/
//
#import "CDVBackgroundFetch.h"
#import "AppDelegate.h"
#import <TSBackgroundFetch/TSBackgroundFetch.h>

@implementation AppDelegate(AppDelegate)

-(void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
    NSLog(@"*** AppDelegate Rx BackgroundFetch ***");
    
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager performFetchWithCompletionHandler:completionHandler];    
}

@end

@implementation CDVBackgroundFetch
{
    BOOL enabled;
    BOOL stopOnTerminate;
}

- (void)pluginInitialize
{
    stopOnTerminate = NO;    
}

- (void) configure:(CDVInvokedUrlCommand*)command
{    
    NSLog(@"- CDVBackgroundFetch configure");
    
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];

    NSDictionary *config = [command.arguments objectAtIndex:0];
    
    if (config[@"stopOnTerminate"]) {
        stopOnTerminate = [[config objectForKey:@"stopOnTerminate"] boolValue];
    }
        
    if ([fetchManager start]) {
        void (^handler)();    
        handler = ^void(void){
            NSLog(@"- CDVBackgroundFetch Rx Fetch Event");
            CDVPluginResult* result = nil;
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [result setKeepCallbackAsBool:YES];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        };
        [fetchManager addListener:handler];
    } else {
        NSLog(@"- CDVBackgroundFetch failed to start");
        //command.callbackId.error("BackgroundFetch not supported");
        CDVPluginResult* result = nil;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [result setKeepCallbackAsBool:NO];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

/*
-(void) onFetch:(NSNotification *) notification
{
    NSLog(@"- CDVBackgroundFetch onFetch");

    _notification = notification;
    _completionHandler = [notification.object copy];
    
    // If onFetch is called and we don't have our Cordova callback registered yet, we were probably booted due to a background-fetch event.
    // Just return and wait for the plugin to be configured.  We'll detect that in #configure method and execute the callback once it's been registered.
    if (!self.fetchCallbackId) {
        return;
    }  
}
*/
-(void) finish:(CDVInvokedUrlCommand*)command
{
    NSLog(@"- CDVBackgroundFetch finish");
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager finish:UIBackgroundFetchResultNewData];
}

/**
 * Termination. Checks to see if it should turn off
 */
-(void) onAppTerminate
{
    NSLog(@"- CDVBackgroundFetch onAppTerminate");
    if (stopOnTerminate) {
        NSLog(@"- stopping background-fetch");
        TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
        [fetchManager stop];
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

}

@end
