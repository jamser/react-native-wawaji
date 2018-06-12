package com.starcandy.wawaji.im;

/**
 * 消息
 * Created by zhangjiwei on 2017/11/30.
 */

public class MessageInfo {
	//{"userId": "10000", "nickName":"测试","url":"xxxxx", "msg":"消息", "timeStamp":1111111,"groupId":"@123","groupProperty":"AVChatRoom/BChatRoom"}
	private String userId;
	private String groupId;
	private String nickName;
	private String url;
	private String msg;
	private String groupProperty;
	private String timeStamp;
	
	public String getUserId() {
		return userId;
	}
	
	public void setUserId(String userId) {
		this.userId = userId;
	}
	
	public String getGroupId() {
		return groupId;
	}
	
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	
	public String getNickName() {
		return nickName;
	}
	
	public void setNickName(String nickName) {
		this.nickName = nickName;
	}
	
	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	public String getMsg() {
		return msg;
	}
	
	public void setMsg(String msg) {
		this.msg = msg;
	}
	
	public String getGroupProperty() {
		return groupProperty;
	}
	
	public void setGroupProperty(String groupProperty) {
		this.groupProperty = groupProperty;
	}
	
	public String getTimeStamp() {
		return timeStamp;
	}
	
	public void setTimeStamp(String timeStamp) {
		this.timeStamp = timeStamp;
	}
	
	@Override
	public String toString() {
		return "MessageInfo{" +
				"userId='" + userId + '\'' +
				", groupId='" + groupId + '\'' +
				", nickName='" + nickName + '\'' +
				", url='" + url + '\'' +
				", msg='" + msg + '\'' +
				", groupProperty='" + groupProperty + '\'' +
				", timeStamp=" + timeStamp +
				'}';
	}
}
