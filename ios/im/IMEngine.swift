//
//  TimManager.swift
//  wawajilive
//
//  Created by wuxudong on 01/12/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import Foundation

@objc(IMEngine)
class IMEngine: RCTEventEmitter, TIMMessageListener,TIMGroupListener{
  //IM Manager
  let timManger : TIMManager! = TIMManager.sharedInstance()
  //群组 Manager
  let timGroupManger : TIMGroupManager! = TIMGroupManager.sharedInstance()
  //查看资料 Manager
  let timFriendshipManager : TIMFriendshipManager! = TIMFriendshipManager.sharedInstance()
  var memberArray = [String]()//群组列表
  var userInfoArray = [UserInfo]()//群组查询后用户信息列表
  var appid : Int32 = 0
  @objc(initIM:resolve:reject:)
  func initIM(options: NSDictionary, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    //初始化Config UserConfig
    let config = TIMSdkConfig()
    let userConfig = TIMUserConfig()
    userConfig.groupListener = self
    userConfig.enableGroupAssistant = true
    userConfig.disableStorage = true
    appid = options["appid"]! as! Int32
    let accountType = String(options["accountType"]! as! Int)
    config.sdkAppId = appid
    config.accountType = accountType;
//    config.logLevel = TIMLogLevel.LOG_DEBUG
//    config.logFuncLevel = TIMLogLevel.LOG_DEBUG
    //初始化SDK
    let initRes = timManger.initSdk(config)
    timManger.setUserConfig(userConfig)
    //添加Message监听
    timManger.add(self)
    print("init res \(initRes,appid)")
    resolve("success")
  }
  
  @objc(login:userSig:resolve:reject:)
  func login(identify: NSString, userSig: NSString, resolve:@escaping RCTPromiseResolveBlock , reject:RCTPromiseRejectBlock) -> Void {
    let login_param = TIMLoginParam()
    login_param.identifier = identify as String!;
    login_param.userSig = userSig as String!;
    login_param.appidAt3rd = String(appid);
    timManger.login(login_param, succ: {
      print("init login (success)")
      resolve("success")
    }) { (error, message) in
      print("init login \(error,message)")
    }
//    login_param.appidAt3rd = "";
  }
  
  //消息接收
  func onNewMessage(_ msgs: [Any]!) {
    for index in msgs{
      let message = index as! TIMMessage
      for i in 0..<message.elemCount() {
        let elem = message.getElem(i)
        if (elem is TIMTextElem) {
          let text_elem = elem as! TIMTextElem;
          print("IM-->OnNewMessage text_elem\(text_elem.text)")
          let sendTypeAndMsg : [String:String] = [
            "type": "onMessage",
            "msg": text_elem.text!,
            ]
          self.sendEvent(info:sendTypeAndMsg)
        }
      }
    }
  }
  
  //成员加入
  func onMemberJoin(_ groupId: String!, membersInfo: [Any]!) {
    for index in membersInfo{
      let memberInfo = index as! TIMGroupMemberInfo
      timFriendshipManager.getUsersProfile([memberInfo.member], succ: { (res) in
        for index in res!{
          let userInfo = index as!TIMUserProfile
          let faceURL = userInfo.faceURL
          let nickName = userInfo.nickname
          let currentGroupId = groupId
          let level  = String(data: userInfo.selfSignature!, encoding: String.Encoding.utf8) as String!
          print("IM-->onMemberJoin\(faceURL,nickName,currentGroupId)")
          let sendRet : [String:String] = [
            "type": "onJoinGroup",
            "msg": nickName!,
            "groupId":currentGroupId!,
            "faceUrl":faceURL!,
            "level":level!
          ]
          print("IM-->onMemberJoin\(sendRet)")
          self.sendEvent(info:sendRet)
        }
      }, fail: { (code, errorMessage) in
         print("IM-->onMemberJoinError\(code,errorMessage)")
      })
    }
  }
  //成员退出
  func onMemberQuit(_ groupId: String!, members: [Any]!) {
    for index in members{
      let memberInfo = index
      timFriendshipManager.getUsersProfile([memberInfo], succ: { (res) in
        for index in res!{
          let userInfo = index as!TIMUserProfile
          let faceURL = userInfo.faceURL
          let nickName = userInfo.nickname
          let currentGroupId = groupId
          let level  = String(data: userInfo.selfSignature!, encoding: String.Encoding.utf8) as String!
          let sendRet : [String:String] = [
            "type": "onQuitGroup",
            "msg": nickName!,
            "groupId":currentGroupId!,
            "faceUrl":faceURL!,
            "level":level!
          ]
           print("IM-->onMemberQuit\(sendRet)")
          self.sendEvent(info:sendRet)
        }
      }, fail: { (code, errorMessage) in
        print("IM-->onMemberQuitError\(code,errorMessage)")
      })
    }
  }
  
  //当前用户加入回调
  func onGroupAdd(_ groupInfo: TIMGroupInfo!) {
    timFriendshipManager.getSelfProfile({ (res) in
      let userInfo = res as! TIMUserProfile
      let faceURL = userInfo.faceURL
      let nickName = userInfo.nickname
      let currentGroupId = groupInfo.group
      let level  = String(data: userInfo.selfSignature!, encoding: String.Encoding.utf8) as String!
      let sendRet : [String:String] = [
        "type": "onJoinGroup",
        "msg": nickName!,
        "groupId":currentGroupId!,
        "faceUrl":faceURL!,
        "level":level!
      ]
      print("IM-->onGroupAdd\(sendRet)")
      self.sendEvent(info:sendRet)
    }) { (code, errorMessage) in
       print("IM-->onGroupAdd\(code,errorMessage)")
    }
  }
  //当前用户退出回调
  func onGroupDelete(_ groupId: String!) {
    timFriendshipManager.getSelfProfile({ (res) in
      let userInfo = res as! TIMUserProfile
      let faceURL = userInfo.faceURL
      let nickName = userInfo.nickname
      let level  = String(data: userInfo.selfSignature!, encoding: String.Encoding.utf8) as String!
      let sendRet : [String:String] = [
        "type": "onQuitGroup",
        "msg": nickName!,
        "groupId":groupId!,
        "faceUrl":faceURL!,
        "level":level!
      ]
      print("IM-->onGroupDelete\(sendRet)")
      self.sendEvent(info:sendRet)
    }) { (code, errorMessage) in
      print("IM-->onGroupDelete\(code,errorMessage)")
    }
  }
  
  //加入群组
  @objc(joinGroup:resolve:reject:)
  func joinGroup(groupId: NSString, resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    timGroupManger.joinGroup(groupId as String!, msg: "",succ: {
      print("IM-->joinGroup success\(groupId)")
//      let sendTypeAndMsg : [String:String] = [
//        "type": "onGroupAdd" ,
//        "msg": "joinGroupSuccess" ,
//        ]
//      self.sendEvent(info:sendTypeAndMsg)
      resolve("success")
    }) { (error, message) in
      resolve(nil)
    }
  }
  //退出群组
  @objc(quitGroup:resolve:reject:)
  func quitGroup(groupId: NSString, resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    timGroupManger.quitGroup(groupId as String!, succ: {
      print("IM-->quitGroup success\(groupId)")
//      let sendTypeAndMsg : [String:String] = [
//        "type": "onGroupDelete" ,
//        "msg": "quitGroupSuccess" ,
//        ]
//      self.sendEvent(info:sendTypeAndMsg)
      resolve("success")
    }) { (error, message) in
      resolve(nil)
    }
  }
  
  //查询GroupMemberList
  @objc(queryGroupMemberList:resolve:reject:)
  func queryGroupMemberList(groupId: NSString, resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    self.memberArray.removeAll()
    self.userInfoArray.removeAll()
    timGroupManger.getGroupMembers(groupId as String!, succ: { (res) in
      for index in res!{
        let memberInfo = index as! TIMGroupMemberInfo
        let user = memberInfo.member
        if("admin" != user && "havefun" != user ){
           self.memberArray.append(user!)
        }
      }
      self.userInfoArray.reverse()
      //查询群组成员信息
      self.timFriendshipManager.getUsersProfile(self.memberArray, succ: { (res) in
        for index in res!{
          let userInfo = index as! TIMUserProfile
          let info = UserInfo(identifier:userInfo.identifier,nickname:userInfo.nickname,faceUrl:userInfo.faceURL)
          self.userInfoArray.append(info)
        }
        do {
          let jsonEncoder = JSONEncoder()
          let jsonData = try jsonEncoder.encode(self.userInfoArray)
          let json = String(data: jsonData, encoding: String.Encoding.utf8)
          resolve(json)
        } catch {
         print("")
        }
      }, fail: { (code, errorMessage) in
        resolve(nil)
      })
    }) { (code, errorMessage) in
      resolve(nil)
    }
  }

  func sendEvent(info:Any){
    self.sendEvent(withName: "im", body:info)
  }
  @objc open override func supportedEvents() -> [String] {
    return ["im"]
  }
}
