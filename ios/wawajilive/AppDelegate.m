/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <CodePush/CodePush.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <React/RCTLinkingManager.h>

#import "TXLiteAVSDK_Smart/TXLiveBase.h"
#import "RNUMConfigure.h"
#import <IMSDKBugly/IMSDKBugly.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
    #ifdef DEBUG
        jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
    #else
        jsCodeLocation = [CodePush bundleURL];
    #endif
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"wawajilive"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  [UMConfigure setLogEnabled:YES];
  //测试线Umeng
  [RNUMConfigure initWithAppkey:@"5a3cf996f43e485e6500000c" channel:@"Apple"];
  //正式向Umeng
//  [RNUMConfigure initWithAppkey:@"5a438b89f29d986737000010" channel:@"Apple"];
  // 接入个推
  [GeTuiSdk startSdkWithAppId:kGtAppId appKey:kGtAppKey appSecret:kGtAppSecret delegate:self];
  // 注册远程通知
  [self registerRemoteNotification];
  IMSDKBuglyConfig * config = [[IMSDKBuglyConfig alloc] init];
  NSDictionary *infoDic = [[NSBundle mainBundle] infoDictionary];
  NSString *appVersion = [infoDic objectForKey:@"CFBundleShortVersionString"];
  config.channel = @"apple";
  config.version = appVersion;
  //测试线bugly
  [IMSDKBugly startWithAppId:@"9a06fa8139" config:config];
  //正式线bugly
//  [IMSDKBugly startWithAppId:@"6329bf4fc3" config:config];
  return YES;
}
- (void)registerRemoteNotification {
  if ([[UIDevice currentDevice].systemVersion floatValue] >= 10.0) {
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0 // Xcode 8编译会调用
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;[center requestAuthorizationWithOptions:(UNAuthorizationOptionBadge | UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionCarPlay) completionHandler:^(BOOL granted, NSError *_Nullable error) {
      if (!error) {
        NSLog(@"request authorization succeeded!");
      }
    }];
    [[UIApplication sharedApplication] registerForRemoteNotifications];
#else // Xcode 7编译会调用
    UIUserNotificationType types = (UIUserNotificationTypeAlert | UIUserNotificationTypeSound | UIUserNotificationTypeBadge);
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:types categories:nil];
    [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
    [[UIApplication sharedApplication] registerForRemoteNotifications];
#endif
  } else if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0) {
    UIUserNotificationType types = (UIUserNotificationTypeAlert | UIUserNotificationTypeSound | UIUserNotificationTypeBadge);
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:types categories:nil];
    [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
    [[UIApplication sharedApplication] registerForRemoteNotifications];
  } else {
    UIRemoteNotificationType apn_type = (UIRemoteNotificationType)(UIRemoteNotificationTypeAlert |
                                                                   UIRemoteNotificationTypeSound |
                                                                   UIRemoteNotificationTypeBadge);
    [[UIApplication sharedApplication] registerForRemoteNotificationTypes:apn_type];
  }
}
/** 远程通知注册成功委托 */
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  NSString *token = [[deviceToken description] stringByTrimmingCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"<>"]];
  token = [token stringByReplacingOccurrencesOfString:@" " withString:@""];
  NSLog(@">>>[DeviceToken Success]:%@", token);
  // [ GTSdk ]：向个推服务器注册deviceToken
  [GeTuiSdk registerDeviceToken:token];
}
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)   (UIBackgroundFetchResult))completionHandler {
  // [ GTSdk ]：将收到的APNs信息传给个推统计
  [GeTuiSdk handleRemoteNotification:userInfo];
  // 控制台打印接收APNs信息
  NSLog(@">>>[Receive RemoteNotification]:%@", userInfo);
  [[NSNotificationCenter defaultCenter]postNotificationName:GT_DID_RECEIVE_REMOTE_NOTIFICATION object:@{@"type":@"apns",@"userInfo":userInfo}];
  completionHandler(UIBackgroundFetchResultNewData);
}
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  [[NSNotificationCenter defaultCenter]postNotificationName:GT_DID_RECEIVE_REMOTE_NOTIFICATION object:@{@"type":@"apns",@"userInfo":notification.request.content.userInfo}]; completionHandler(UNNotificationPresentationOptionAlert);
}
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler {
  [GeTuiSdk handleRemoteNotification:response.notification.request.content.userInfo];
  [[NSNotificationCenter defaultCenter]postNotificationName:GT_DID_CLICK_NOTIFICATION object:response.notification.request.content.userInfo];
  completionHandler();
}
#endif
/** SDK收到透传消息回调 */
- (void)GeTuiSdkDidReceivePayloadData:(NSData *)payloadData andTaskId:(NSString *)taskId andMsgId:(NSString *)msgId andOffLine:(BOOL)offLine fromGtAppId:(NSString *)appId {
  // [ GTSdk ]：汇报个推自定义事件(反馈透传消息)
  [GeTuiSdk sendFeedbackMessage:90001 andTaskId:taskId andMsgId:msgId];
  
  // 数据转换
  NSString *payloadMsg = nil;
  if (payloadData) {
    payloadMsg = [[NSString alloc] initWithBytes:payloadData.bytes length:payloadData.length encoding:NSUTF8StringEncoding];
  }
  
  // 控制台打印日志
  NSString *msg = [NSString stringWithFormat:@"taskId=%@,messageId:%@,payloadMsg:%@%@", taskId, msgId, payloadMsg, offLine ? @"<离线消息>" : @""];
  NSDictionary *userInfo = @{@"taskId":taskId,@"msgId":msgId,@"payloadMsg":payloadMsg,@"offLine":offLine?@"YES":@"NO"};
  [[NSNotificationCenter defaultCenter]postNotificationName:GT_DID_RECEIVE_REMOTE_NOTIFICATION object:@{@"type":@"payload",@"userInfo":userInfo}];
  NSLog(@">>[GTSdk ReceivePayload]:%@", msg);
}
/** SDK成功注册 CID 回调 */
-(void)GeTuiSdkDidRegisterClient:(NSString *)clientId{
  [[NSNotificationCenter defaultCenter]postNotificationName:GT_DID_REGISTE_CLIENTID object:clientId];
}

// ios 8.x or older
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

// ios 9.0+
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
            options:(NSDictionary<NSString*, id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

@end
