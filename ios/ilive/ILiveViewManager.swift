//
//  ILivePlayerViewManager.swift
//  wawajilive
//
//  Created by wuxudong on 08/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import UIKit

@objc(RCTILiveViewManager)
open class ILiveViewManager: RCTViewManager {
  override open func view() -> UIView! {
    let ins = ILiveView()
    return ins;
  }
  
  override open static func requiresMainQueueSetup() -> Bool {
    return true;
  }
  
}

