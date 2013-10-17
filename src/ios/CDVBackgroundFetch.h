//
//  CDVBackgroundGeoLocation.hs
//
//  Created by Chris Scott <chris@transistorsoft.com>
//

#import <Cordova/CDVPlugin.h>

@interface CDVBackgroundFetch : CDVPlugin <UIApplicationDelegate>
- (void) configure:(CDVInvokedUrlCommand*)command;
- (void) start:(CDVInvokedUrlCommand*)command;
- (void) stop:(CDVInvokedUrlCommand*)command;
- (void) test:(CDVInvokedUrlCommand*)command;
- (void) sync;
- (void) onSuspend:(NSNotification *)notification;
- (void) onResume:(NSNotification *)notification;

@property(nonatomic,assign) BOOL enabled;

@end

