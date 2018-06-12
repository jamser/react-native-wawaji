/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <UIKit/UIKit.h>
// 导入头文件
#import <RCTGetuiModule/RCTGetuiModule.h>
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
#import <UserNotifications/UserNotifications.h>
#endif
// 以下三个参数需要到个推官网注册应用获得
//测试个推
#define kGtAppId @"l0lMLAgl9f6Bnc5GLGxvk4"
#define kGtAppKey @"bQX4iSiXOq6wuLfIrJHNr1"
#define kGtAppSecret @"71QpxtSLREAAPK02z4l7L"

//正式个推
//#define kGtAppId @"RVl26W3MvX7B95Iglm3553"
//#define kGtAppKey @"c8YrnF6XjOAsgXuMaDSAq7"
//#define kGtAppSecret @"P50e7r7D4D9fbT2BjvIFY9"

@interface AppDelegate : UIResponder <UIApplicationDelegate,UNUserNotificationCenterDelegate,GeTuiSdkDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
