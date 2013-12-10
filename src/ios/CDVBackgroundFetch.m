////
//  CDVBackgroundGeoLocation
//
//  Created by Chris Scott <chris@transistorsoft.com> on 2013-06-15
//  Largely based upon http://www.mindsizzlers.com/2011/07/ios-background-location/
//
#import "CDVBackgroundFetch.h"
#import <Cordova/CDVJSON.h>



@implementation CDVBackgroundFetch
{
    void (^_completionHandler)(UIBackgroundFetchResult);
    NSTimer *backgroundTimer;
}

@synthesize enabled;

- (CDVPlugin*) initWithWebView:(UIWebView*) theWebView
{
    [[NSNotificationCenter defaultCenter] addObserver:self
        selector:@selector(onFetch:)
        name:@"BackgroundFetch"
        object:nil];
    
    return self;
}

- (void) configure:(CDVInvokedUrlCommand*)command
{    
    NSLog(@"- CDVBackgroundFetch configure");
    
    self.fetchCallbackId = command.callbackId;
    
    [[UIApplication sharedApplication] setMinimumBackgroundFetchInterval:UIApplicationBackgroundFetchIntervalMinimum];
    
    [[UIApplication sharedApplication].delegate self];
     
}

- (void) start:(CDVInvokedUrlCommand*)command
{
    NSLog(@"- CDVBackgroundFetch start");
    self.enabled = YES;
}

- (void) stop:(CDVInvokedUrlCommand*)command
{
    NSLog(@"- CDVBackgroundFetch stop");
    self.enabled = NO;
}

- (void) test:(CDVInvokedUrlCommand*)command
{
    NSLog(@"- CDVBackgroundFetch test");
}

-(void) onFetch:(NSNotification *) notification
{
    NSLog(@"- CDVBackgroundFetch onFetch");
    UIApplication *app = [UIApplication sharedApplication];
    
    _completionHandler = [notification.object copy];
    
    // Set a timer to ensure our bgTask is murdered 1s before our remaining time expires.
    backgroundTimer = [NSTimer scheduledTimerWithTimeInterval:app.backgroundTimeRemaining-1
                                                       target:self
                                                     selector:@selector(onTimeExpired:)
                                                     userInfo:nil
                                                      repeats:NO];
    
    // Inform javascript a background-fetch event has occurred.
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* result = nil;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [result setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:result callbackId:self.fetchCallbackId];
    }];
}
- (void)onTimeExpired:(NSTimer *)timer
{
    NSLog(@"- CDVBackgroundFetch TIME EXPIRED");
    [self stopBackgroundTask];
}
-(void) finish:(CDVInvokedUrlCommand*)command
{
    NSLog(@"- CDVBackgroundFetch finish");
    [self stopBackgroundTask];
    
}
-(void) stopBackgroundTask
{
    [backgroundTimer invalidate];
    backgroundTimer = nil;
    
    UIApplication *app = [UIApplication sharedApplication];
    NSLog(@"- CDVBackgroundFetch stopBackgroundTask (remaining t: %f)", app.backgroundTimeRemaining);
    if (_completionHandler) {
        _completionHandler(UIBackgroundFetchResultNewData);
        _completionHandler = nil;
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
