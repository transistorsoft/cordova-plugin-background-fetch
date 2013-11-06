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
    NSLog(@"CDVBackgroundFetch configure");
    
    self.fetchCallbackId = command.callbackId;
    
    [[UIApplication sharedApplication] setMinimumBackgroundFetchInterval:UIApplicationBackgroundFetchIntervalMinimum];
    
    [[UIApplication sharedApplication].delegate self];
     
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

-(void) onFetch:(NSNotification *) notification
{
    NSLog(@"-------------- CDVBackgroundFetch onFetch");
    _completionHandler = notification.object;
    
    CDVPluginResult* result = nil;
    
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [result setKeepCallbackAsBool:YES];
    
    
    // Inform javascript a background-fetch event has occurred.
    [self.commandDelegate sendPluginResult:result callbackId:self.fetchCallbackId];
}
-(void) finish:(CDVInvokedUrlCommand*)command
{
    NSLog(@"CDVBackgroundFetch finish");
    _completionHandler(UIBackgroundFetchResultNewData);
    
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
