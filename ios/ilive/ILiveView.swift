//
//  File.swift
//  wawajilive
//
//  Created by wuxudong on 07/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import UIKit


open class ILiveView: UIView {
    open var onSelect:RCTBubblingEventBlock?
    
    var _firstLivePlayer : TXLivePlayer
    
    var _secondLivePlayer : TXLivePlayer
    
    var _firstVideoContainer : UIView
    
    var _secondVideoContainer : UIView
    
    var _firstLiveUrl : String?
    
    var _secondLiveUrl : String?
    
    var _liveIndex : Int?
    
    var _firstPlayerLoadComplete = false
    
    var _secondPlayerLoadComplete = false
    
    var firstPlayerListener : ILivePlayerListener?
    var secondPlayerListener : ILivePlayerListener?
    
    override init(frame: CoreGraphics.CGRect) {
        _firstVideoContainer = UIView(frame: frame) ;
        _secondVideoContainer = UIView(frame: frame) ;
        
        _firstLivePlayer = TXLivePlayer();
        _firstLivePlayer.setupVideoWidget(frame, contain: _firstVideoContainer, insert: 0)
        
        _secondLivePlayer = TXLivePlayer()
        _secondLivePlayer.setupVideoWidget(frame, contain: _secondVideoContainer, insert: 0)
               
        super.init(frame: frame)
        
        self.addSubview(_firstVideoContainer)
        self.addSubview(_secondVideoContainer)
        
        firstPlayerListener =  ILivePlayerListener({() -> Void in
            self._firstPlayerLoadComplete = true
            print("play1 now play")
            self.emitReadyIfNecessary()
            }
        )
        
        secondPlayerListener =  ILivePlayerListener({() -> Void in
            self._secondPlayerLoadComplete = true
            print("play2 now play")
            self.emitReadyIfNecessary()
            }
        )
        
        _firstLivePlayer.delegate = firstPlayerListener
        
        _secondLivePlayer.delegate = secondPlayerListener
        
    }
    
    
    override open func reactSetFrame(_ frame: CGRect)
    {
        super.reactSetFrame(frame);
        _firstVideoContainer.reactSetFrame(frame);
        _secondVideoContainer.reactSetFrame(frame);
    }
    
    required public init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override open func willMove(toWindow newWindow: UIWindow?) {
        super.willMove(toWindow: newWindow)
        
        if newWindow == nil {
            destroy()
        } else {
            // UIView appear
        }
    }
    
    func destroy() {
        _firstLivePlayer.stopPlay()
        _secondLivePlayer.stopPlay()
    }
       
    func setLiveFirstUrl(_ liveUrl: String) {
        print("first live url " + liveUrl)
        
        if _firstLiveUrl == liveUrl {
            self.emitReadyIfNecessary()
            return
        }
        
        _firstPlayerLoadComplete = false
        
        if self.onSelect == nil {
            return
        } else {
            self.onSelect!(["playFirstEvent":2002])
        }
        
        _firstLiveUrl = liveUrl
        
        _firstLivePlayer.stopPlay()
        
        if liveUrl.contains("txSecret") && liveUrl.contains("txTime") {
            _firstLivePlayer.startPlay(liveUrl, type:TX_Enum_PlayType.PLAY_TYPE_LIVE_RTMP_ACC)
        }
        else {
            _firstLivePlayer.startPlay(liveUrl, type:TX_Enum_PlayType.PLAY_TYPE_LIVE_RTMP)
        }
        
    }
    
    func setLiveSecondUrl(_ liveUrl: String) {
        print("second live url " + liveUrl)
        
        if _secondLiveUrl == liveUrl {
            self.emitReadyIfNecessary()
            return
        }
        
        _secondPlayerLoadComplete = false
        
        
        if self.onSelect == nil {
            return
        } else {
            self.onSelect!(["playFirstEvent":2002])
        }
        
        
        
        _secondLiveUrl = liveUrl
        
        _secondLivePlayer.stopPlay()
        
        if liveUrl.contains("txSecret") && liveUrl.contains("txTime") {
            _secondLivePlayer.startPlay(liveUrl, type:TX_Enum_PlayType.PLAY_TYPE_LIVE_RTMP_ACC)
        }
        else {
            _secondLivePlayer.startPlay(liveUrl, type:TX_Enum_PlayType.PLAY_TYPE_LIVE_RTMP)
        }
        
    }
    
    
    func setLiveIndex(_ liveIndex: Int) {
        
        print("liveIndex ", liveIndex)
        _liveIndex = liveIndex
        
        
        switch (liveIndex){
        
        case 1:
            _firstVideoContainer.isHidden = true
            _secondVideoContainer.isHidden = false
            
            if (!_secondLivePlayer.isPlaying()) {
                _secondLivePlayer.resume()
            }
            
            if (_firstLivePlayer.isPlaying()) {
                _firstLivePlayer.pause()
            }
            
            break;
        default:
        
            _secondVideoContainer.isHidden = true
            _firstVideoContainer.isHidden = false
            
            if (!_firstLivePlayer.isPlaying()) {
                _firstLivePlayer.resume()
            }
            
            if (_secondLivePlayer.isPlaying()) {
                _secondLivePlayer.pause()
            }
            
            break;
        }
        
    }
    
    func emitReadyIfNecessary() {
        if _firstPlayerLoadComplete && _secondPlayerLoadComplete {
            if self.onSelect == nil {
                return
            } else {
                self.onSelect!(["playFirstEvent":2003])
            }
        }
    }
    
}

