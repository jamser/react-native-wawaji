//
//  DevicesEngine.swift
//  wawajilive
//
//  Created by 张继伟 on 2017/12/21.
//  Copyright © 2017年 Facebook. All rights reserved.
//

import Foundation

@objc(DevicesEngine)
class DevicesEngine: RCTEventEmitter{
  
  @objc(getDevicesInfo:resolve:reject:)
  func getDevicesInfo(options: NSString,resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    let infoDic = Bundle.main.infoDictionary
    //APP 版本号
    let appVersion = infoDic?["CFBundleShortVersionString"]
    //APP build版本
    let appBuildVersion = infoDic?["CFBundleVersion"]
    /**
     //APP 名称
     let appName = infoDic?["CFBundleDisplayName"]
     print("getDevicesInfo-->appName \(appName)")
     let deviceName = UIDevice.current.name
     print("getDevicesInfo-->deviceName \(deviceName)")
     */
    let deviceUUID = UIDevice.current.identifierForVendor?.uuidString
  
    let info = DevicesInfo(devicesId:deviceUUID!,versionCode:appBuildVersion as! String,versionName:appVersion as! String,channel:"apple")
    do {
      let jsonEncoder = JSONEncoder()
      let jsonData = try jsonEncoder.encode(info)
      let json = String(data: jsonData, encoding: String.Encoding.utf8)
      resolve(json)
    } catch {
      print("JSONEncoder 错误")
    }

  }
  
  func sendEvent(info:Any){
    self.sendEvent(withName: "devices", body:info)
  }
  @objc open override func supportedEvents() -> [String] {
    return ["devices"]
  }
}
