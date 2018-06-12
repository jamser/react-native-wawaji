package com.starcandy.wawaji.devices;

import android.content.Context;
import android.telephony.TelephonyManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.gson.Gson;
import com.starcandy.wawaji.utils.AppUtil;
import com.starcandy.wawaji.utils.Logger;

/**
 * Created by zhangjiwei on 2017/12/21.
 */

public class DevicesEngineModule extends ReactContextBaseJavaModule {
	private ReactApplicationContext reactContext;
	public DevicesEngineModule(ReactApplicationContext reactContext) {
		super(reactContext);
		this.reactContext =  reactContext;
	}
	
	@Override
	public String getName() {
		return "RCTDevicesEngine";
	}
	
	@ReactMethod()
	public void getDevicesInfo(String options,Promise promise){
		DevicesInfo devicesInfo = new DevicesInfo();
		//渠道
		String appMetaData = AppUtil.getAppMetaData(reactContext);
		if(appMetaData == null){
			appMetaData = "havefun0";
		}
		devicesInfo.setChannel(appMetaData);
		//版本名称
		String versionName = AppUtil.getVersionName(reactContext);
		if (versionName == null) {
			versionName = "1";
		}
		devicesInfo.setVersionName(versionName);
		//版本号
		String versionCode = AppUtil.getVersionCode(reactContext);
		if (versionCode == null) {
			versionCode = "1";
		}
		devicesInfo.setVersionCode(versionCode);
		//获取程序的IMEI
		TelephonyManager tm = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
		String devicesId;
		if(tm != null && tm.getDeviceId() != null){
			devicesId = tm.getDeviceId().trim();
			if (devicesId.isEmpty()) devicesId  = "";
		}else{
			devicesId  = "";
		}
		devicesInfo.setDevicesId(devicesId);
		String json = new Gson().toJson(devicesInfo);
		Logger.d("getDevicesInfo",json);
		promise.resolve(json);
	}
}
