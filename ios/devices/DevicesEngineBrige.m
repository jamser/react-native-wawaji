//
//  DevicesEngineBrige.m
//  wawajilive
//
//  Created by 张继伟 on 2017/12/21.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DevicesEngine, NSObject)
RCT_EXTERN_METHOD(getDevicesInfo:(NSString *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
