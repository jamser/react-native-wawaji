//
//  APPReviewEngine.swift
//  wawajilive
//
//  Created by 张继伟 on 2018/1/4.
//  Copyright © 2018年 Facebook. All rights reserved.
//

import Foundation
@objc(AppReviewEngine)
class AppReviewEngine: RCTEventEmitter{
  
  @objc(openReview:resolve:reject:)
  func openReview(options: NSString,resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    if("ios" == options){
      //如果版本大于10.3才会弹出来
      if #available(iOS 10.3, *){
          SKStoreReviewController.requestReview()
      }else{
        let url = "itms-apps://itunes.apple.com/cn/app/id1316940203?mt=8&action=write-review"
        open(scheme: url)
      }
      resolve("success")
    }else{
       resolve("errorType")
    }
  }
  
  @objc(shareAppShop:resolve:reject:)
  func shareAppShop(options: NSString,resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    resolve("success")
  }
  
  func open(scheme: String) {
    if let url = URL(string: scheme) {
      if #available(iOS 10, *) {
        UIApplication.shared.open(url, options: [:],completionHandler: {(success) in
          print("Open \(scheme): \(success)")
        })
      } else {
        let success = UIApplication.shared.openURL(url)
        print("Open \(scheme): \(success)")
      }
    }
  }
  
  func sendEvent(info:Any){
    self.sendEvent(withName: "review", body:info)
  }

  @objc open override func supportedEvents() -> [String] {
    return ["review"]
  }
}
