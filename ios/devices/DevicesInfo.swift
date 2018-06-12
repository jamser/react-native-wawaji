//
//  DevicesInfo.swift
//  wawajilive
//
//  Created by 张继伟 on 2017/12/21.
//  Copyright © 2017年 Facebook. All rights reserved.
//

import Foundation

class DevicesInfo : Codable{
  var devicesId: String
  var versionCode: String
  var versionName: String
  var channel: String
  init(devicesId: String,versionCode: String,versionName: String,channel: String) {
    self.devicesId = devicesId
    self.versionCode = versionCode
    self.versionName = versionName
    self.channel = channel
  }
}
