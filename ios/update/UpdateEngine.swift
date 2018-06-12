//
//  UpdateEngine.swift
//  wawajilive
//
//  Created by 张继伟 on 2017/12/20.
//  Copyright © 2017年 Facebook. All rights reserved.
//

import Foundation

@objc(UpdateEngine)
class UpdateEngine: RCTEventEmitter{

  @objc(downLoadFile:resolve:reject:)
  func downLoadFile(options: NSDictionary, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    let currentVersion = Bundle.main.infoDictionary!["CFBundleShortVersionString"] as! String
    let deviceName = UIDevice.current.name
    let deviceUUID = UIDevice.current.identifierForVendor?.uuidString

    resolve("success")
  }
  
  func sendEvent(info:Any){
    self.sendEvent(withName: "update", body:info)
  }
  @objc open override func supportedEvents() -> [String] {
    return ["update"]
  }
}

