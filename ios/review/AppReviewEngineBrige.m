//
//  AppReviewEngineBrige.m
//  wawajilive
//
//  Created by 张继伟 on 2018/1/4.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppReviewEngine, NSObject)
RCT_EXTERN_METHOD(openReview:(NSString *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(shareAppShop:(NSString *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
@end


