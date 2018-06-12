package com.starcandy.wawaji.im;

/**
 * Created by wuxudong on 28/11/2017.
 */

interface IMEventHandler {
    void onJoinGroup(String name,String groupId,String faceUrl,String level);//成员加入群组
    void onQuitGroup(String name,String groupId,String faceUrl,String level);//成员退出群组
    void onGroupAdd(String name);//当前用户加入群组
    void onGroupDelete(String name);//当前用户退出群组
    void onMessage(String message);//消息提醒
}
