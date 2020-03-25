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
static NSString *const PLUGIN_ID = @"cordova-background-fetch";

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
    void (^callback)(NSString*);
}

- (void)pluginInitialize
{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(didFinishLaunching:) name:UIApplicationDidFinishLaunchingNotification object:nil];
    configured = NO;
}

- (void)didFinishLaunching:(NSNotification *)notification
{
    [[TSBackgroundFetch sharedInstance] didFinishLaunching];
}

- (void) configure:(CDVInvokedUrlCommand*)command
{
    __block id<CDVCommandDelegate> commandDelegate = self.commandDelegate;

    self->callback = ^void(NSString *taskId){
        NSLog(@"[%@ event] taskId: %@", TAG, taskId);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:taskId];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };

    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];

    NSDictionary *config = [command.arguments objectAtIndex:0];

    [fetchManager addListener:PLUGIN_ID callback:self->callback];

    NSTimeInterval delay = [[config objectForKey:@"minimumFetchInterval"] doubleValue] * 60;

    [fetchManager configure:delay callback:^(UIBackgroundRefreshStatus status) {
        self->configured = YES;
        if (status != UIBackgroundRefreshStatusAvailable) {
            NSLog(@"[%@ configure] ERROR: failed to start, status: %ld", TAG, (long)status);
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)status];
            [result setKeepCallbackAsBool:NO];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }
    }];
}

-(void) start:(CDVInvokedUrlCommand*)command
{
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];

    [fetchManager status:^(UIBackgroundRefreshStatus status) {
        CDVPluginResult* result = nil;
        if (status == UIBackgroundRefreshStatusAvailable) {
            [fetchManager addListener:PLUGIN_ID callback:self->callback];
            NSError *error = [fetchManager start:nil];
            if (!error) {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            } else {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
            }
        } else {
            NSLog(@"[%@ start] ERROR: failed to start, status: %ld", TAG, (long) status);
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)status];
        }
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

-(void) stop:(CDVInvokedUrlCommand*)command
{
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    NSString *taskId = nil;
    if ([command.arguments count] == 0) {
        [fetchManager removeListener:PLUGIN_ID];
    } else {
        taskId = [command.arguments objectAtIndex:0];
    }
    [fetchManager stop:taskId];

    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void) scheduleTask:(CDVInvokedUrlCommand *)command {
    NSDictionary *config = [command.arguments objectAtIndex:0];
    NSString *taskId = [config objectForKey:@"taskId"];
    long delayMS = [[config objectForKey:@"delay"] longValue];
    NSTimeInterval delay = delayMS / 1000;
    BOOL periodic = [[config objectForKey:@"periodic"] boolValue];

    NSError *error = [[TSBackgroundFetch sharedInstance] scheduleProcessingTaskWithIdentifier:taskId
                                                                                        delay:delay
                                                                                     periodic:periodic
                                                                                     callback:self->callback];
    CDVPluginResult *result;
    if (!error) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.localizedDescription];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void) finish:(CDVInvokedUrlCommand*)command
{
    NSString *taskId = nil;
    if ([command.arguments count] > 0) {
        taskId = [command.arguments objectAtIndex:0];
    }

    [[TSBackgroundFetch sharedInstance] finish:taskId];
    CDVPluginResult *response = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:response callbackId:command.callbackId];
}

-(void) status:(CDVInvokedUrlCommand*)command
{
    [[TSBackgroundFetch sharedInstance] status:^(UIBackgroundRefreshStatus status) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:(int)status];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void)dealloc
{

}

@end

