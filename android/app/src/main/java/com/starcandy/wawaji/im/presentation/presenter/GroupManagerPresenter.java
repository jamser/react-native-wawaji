package com.starcandy.wawaji.im.presentation.presenter;

import com.tencent.imsdk.TIMCallBack;
import com.tencent.imsdk.TIMGroupManager;
import com.tencent.imsdk.TIMGroupMemberInfo;
import com.tencent.imsdk.TIMValueCallBack;
import com.tencent.imsdk.ext.group.TIMGroupManagerExt;

import java.util.List;

/**
 * 群管理逻辑
 */
public class GroupManagerPresenter {

    private static final String TAG = "GroupManagerPresenter";

    /**
     * 申请加入群
     *
     * @param groupId  群组ID
     * @param reason   申请理由
     * @param callBack 回调
     */
    public static void applyJoinGroup(String groupId, String reason, TIMCallBack callBack) {
        TIMGroupManager.getInstance().applyJoinGroup(groupId, reason, callBack);
    }

    /**
     * 退出群
     *
     * @param groupId  群组ID
     * @param callBack 回调
     */
    public static void quitGroup(String groupId, TIMCallBack callBack) {
        TIMGroupManager.getInstance().quitGroup(groupId, callBack);
    }
    
    /**
     * 群组成员列表
     *
     * @param groupId  群组ID
     * @param callBack 回调
     */
    public static void queryGroupMemberList(String groupId, TIMValueCallBack<List<TIMGroupMemberInfo>> callBack) {
        TIMGroupManagerExt.getInstance().getGroupMembers(groupId,callBack);
    }

}
