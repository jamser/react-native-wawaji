//
//  UpdateEngineBrige.m
//  wawajilive
//
//  Created by 张继伟 on 2017/12/20.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(UpdateEngine, NSObject)

RCT_EXTERN_METHOD(downLoadFile:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end



