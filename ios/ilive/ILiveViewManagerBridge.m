//
//  ILivePlayerViewManagerBridge.m
//  wawajilive
//
//  Created by wuxudong on 08/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTILiveViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(liveFirstUrl, NSString)
RCT_EXPORT_VIEW_PROPERTY(liveSecondUrl, NSString)
RCT_EXPORT_VIEW_PROPERTY(liveIndex, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(onSelect, RCTBubblingEventBlock)

//RCT_EXPORT_VIEW_PROPERTY(onVideoReady, RCTDirectEventBlock)

@end

