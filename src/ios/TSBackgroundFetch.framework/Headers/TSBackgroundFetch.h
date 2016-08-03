//
//  RNBackgroundFetchManager.h
//  RNBackgroundFetch
//
//  Created by Christopher Scott on 2016-08-02.
//  Copyright © 2016 Christopher Scott. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface TSBackgroundFetch : NSObject

+ (TSBackgroundFetch *)sharedInstance;
-(void) performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))handler;
-(void) addListener:(void (^)(void))handler;
-(BOOL) start;
-(void) stop;
-(void) finish:(UIBackgroundFetchResult) result;

@end

