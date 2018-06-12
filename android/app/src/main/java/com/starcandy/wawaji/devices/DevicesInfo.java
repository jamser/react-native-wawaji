package com.starcandy.wawaji.devices;

/**
 * Created by zhangjiwei on 2017/12/21.
 */

public class DevicesInfo {
	private String devicesId;
	private String versionCode;
	private String versionName;
	private String channel;
	
	
	public String getDevicesId() {
		return devicesId;
	}
	
	public void setDevicesId(String devicesId) {
		this.devicesId = devicesId;
	}
	
	public String getVersionCode() {
		return versionCode;
	}
	
	public void setVersionCode(String versionCode) {
		this.versionCode = versionCode;
	}
	
	public String getVersionName() {
		return versionName;
	}
	
	public void setVersionName(String versionName) {
		this.versionName = versionName;
	}
	
	public String getChannel() {
		return channel;
	}
	
	public void setChannel(String channel) {
		this.channel = channel;
	}
	
	@Override
	public String toString() {
		return "DevicesInfo{" +
				"devicesId='" + devicesId + '\'' +
				", versionCode='" + versionCode + '\'' +
				", versionName='" + versionName + '\'' +
				", channel='" + channel + '\'' +
				'}';
	}
}
