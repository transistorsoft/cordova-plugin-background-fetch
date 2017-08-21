////
//  CDVBackgroundGeoLocation
//
//  Created by Chris Scott <chris@transistorsoft.com> on 2013-06-15
//  Largely based upon http://www.mindsizzlers.com/2011/07/ios-background-location/
//
#import "CDVBackgroundFetch.h"
#import "AppDelegate.h"
#import <TSBackgroundFetch/TSBackgroundFetch.h>

static NSString *const TAG = @"CDVBackgroundFetch";

@implementation AppDelegate(AppDelegate)

-(void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
    NSLog(@"%@ AppDelegate received fetch event", TAG);
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager performFetchWithCompletionHandler:completionHandler applicationState:application.applicationState];
}

@end

@implementation CDVBackgroundFetch
{
    BOOL enabled;
    BOOL configured;
}

- (void)pluginInitialize
{
    configured = NO;
}

- (void) configure:(CDVInvokedUrlCommand*)command
{
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];

    NSDictionary *config = [command.arguments objectAtIndex:0];

    [fetchManager configure:config];

    if ([fetchManager start]) {
        configured = YES;
        void (^handler)();
        handler = ^void(void){
            NSLog(@"- %@ Rx Fetch Event", TAG);
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [result setKeepCallbackAsBool:YES];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        };
        [fetchManager addListener:TAG callback:handler];
    } else {
        NSLog(@"- %@ failed to start", TAG);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [result setKeepCallbackAsBool:NO];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

-(void) start:(CDVInvokedUrlCommand*)command
{
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];

    CDVPluginResult* result = nil;
    if ([fetchManager start]) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];    
}

-(void) stop:(CDVInvokedUrlCommand*)command
{
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager stop];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void) finish:(CDVInvokedUrlCommand*)command
{
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager finish:TAG result:UIBackgroundFetchResultNewData];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void) status:(CDVInvokedUrlCommand*)command
{
    UIBackgroundRefreshStatus status = [[TSBackgroundFetch sharedInstance] status];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:(int)status];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)dealloc
{

}

@end
