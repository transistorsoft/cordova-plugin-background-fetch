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
    NSLog(@"CDVBackgroundFetch AppDelegate received fetch event");
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager performFetchWithCompletionHandler:completionHandler];    
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
    if (configured) {
        NSLog(@"- CDVBackgroundFetch already configured");
        return;
    }
    NSLog(@"- CDVBackgroundFetch configure");
    
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    
    NSDictionary *config = [command.arguments objectAtIndex:0];
    
    [fetchManager configure:config];
    
    if ([fetchManager start]) {
        configured = YES;
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
        CDVPluginResult* result = nil;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [result setKeepCallbackAsBool:NO];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

-(void) start:(CDVInvokedUrlCommand*)command
{
    NSLog(@"- CDVBackgroundFetch start");
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
    NSLog(@"- CDVBackgroundFetch stop");
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager stop];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}
-(void) finish:(CDVInvokedUrlCommand*)command
{
    NSLog(@"- CDVBackgroundFetch finish");
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager finish:UIBackgroundFetchResultNewData];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)dealloc
{

}

@end
