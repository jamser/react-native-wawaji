//
//  ILivePlayerListener.swift
//  wawajilive
//
//  Created by wuxudong on 30/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import Foundation

class ILivePlayerListener : NSObject, TXLivePlayListener {
  var playStartHandler: (()->Void)?

  init(_ closure: @escaping ()->Void) {
    self.playStartHandler = closure
  }
  
  func onPlayEvent(_ EvtID: Int32, withParam param: [AnyHashable : Any]!) {
    
    print(EvtID)
    print(param)
    
    if (PLAY_EVT_PLAY_BEGIN.rawValue == EvtID) {
      playStartHandler?()
    }
    
  }
  
  func onNetStatus(_ param: [AnyHashable : Any]!) {    
    print(param)
  }
  
  
}
