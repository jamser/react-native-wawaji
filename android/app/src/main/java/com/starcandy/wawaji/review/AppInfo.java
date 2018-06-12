package com.starcandy.wawaji.review;

/**
 * Created by zhangjiwei on 2018/1/5.
 */

public class AppInfo {
	private String packageName;
	private String appName;
	
	public String getPackageName() {
		return packageName;
	}
	
	public void setPackageName(String packageName) {
		this.packageName = packageName;
	}
	
	public String getAppName() {
		return appName;
	}
	
	public void setAppName(String appName) {
		this.appName = appName;
	}
	
	@Override
	public String toString() {
		return "AppInfo{" +
				"packageName='" + packageName + '\'' +
				", appName='" + appName + '\'' +
				'}';
	}
}
