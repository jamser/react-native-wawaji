//
//  UserInfo.swift
//  wawajilive
//
//  Created by 张继伟 on 2017/12/15.
//  Copyright © 2017年 Facebook. All rights reserved.
//

import Foundation

class UserInfo : Codable{
  var identifier: String
  var nickname: String
  var faceUrl: String
  
  init(identifier: String,nickname: String,faceUrl: String) {
          self.identifier = identifier
      self.nickname = nickname
      self.faceUrl = faceUrl
        }
}
