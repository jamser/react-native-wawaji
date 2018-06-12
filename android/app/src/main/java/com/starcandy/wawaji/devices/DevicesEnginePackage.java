package com.starcandy.wawaji.devices;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Created by zhangjiwei on 2017/12/21.
 */

public class DevicesEnginePackage implements ReactPackage {
	
	@Override
	public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
		return Arrays.<NativeModule>asList(
				new DevicesEngineModule(reactContext)
		);
	}
	
	public List<Class<? extends JavaScriptModule>> createJSModules() {
		return Collections.emptyList();
	}
	
	@Override
	public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
		return Collections.emptyList();
		
	}
}
