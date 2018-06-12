package com.starcandy.wawaji.review;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.gson.Gson;
import com.starcandy.wawaji.utils.AppUtil;

import java.util.ArrayList;

/**
 * Created by zhangjiwei on 2018/1/4.
 */

public class AppReviewEngineModule extends ReactContextBaseJavaModule {
	private ReactApplicationContext reactContext;
	public AppReviewEngineModule(ReactApplicationContext reactContext) {
		super(reactContext);
		this.reactContext =  reactContext;
	}
	
	@Override
	public String getName() {
		return "RCTAppReviewEngine";
	}
	
	@ReactMethod()
	public void openReview(String options,Promise promise){
		if("android".equalsIgnoreCase(options)){
			ArrayList<AppInfo> filterInstallMarkets = AppUtil.getFilterInstallMarkets(reactContext);
			String toJson = new Gson().toJson(filterInstallMarkets);
			promise.resolve(toJson);
		}else{
			promise.resolve("errorType");
		}
		
	}
	
	@ReactMethod()
	public void shareAppShop(String options,Promise promise){
		boolean appShop = AppUtil.launchAppDetail(reactContext,options,"com.starcandy.wawaji");
		promise.resolve(appShop);
	}
	
	
}
