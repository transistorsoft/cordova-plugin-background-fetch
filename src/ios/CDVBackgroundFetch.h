//
//  CDVBackgroundGeoLocation.hs
//
//  Created by Chris Scott <chris@transistorsoft.com>
//

#import <Cordova/CDVPlugin.h>
#import "AppDelegate.h"

@interface CDVBackgroundFetch : CDVPlugin <UIApplicationDelegate>
@property (nonatomic, strong) NSString* fetchCallbackId;
- (void) configure:(CDVInvokedUrlCommand*)command;
- (void) finish:(CDVInvokedUrlCommand*)command;

@end

