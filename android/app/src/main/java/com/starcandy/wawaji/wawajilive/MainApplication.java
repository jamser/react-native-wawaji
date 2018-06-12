package com.starcandy.wawaji.wawajilive;

import android.app.Application;
import android.content.Context;
import android.support.multidex.MultiDex;
import android.telephony.TelephonyManager;

import com.beefe.picker.PickerViewPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.getui.reactnativegetui.GetuiLogger;
import com.getui.reactnativegetui.GetuiModule;
import com.getui.reactnativegetui.GetuiPackage;
import com.microsoft.codepush.react.CodePush;
import com.starcandy.wawaji.devices.DevicesEnginePackage;
import com.starcandy.wawaji.im.IMEnginePackage;
import com.starcandy.wawaji.qcloud.nativemodule.ILivePackage;
import com.starcandy.wawaji.review.AppReviewEnginePackage;
import com.starcandy.wawaji.umeng.DplusReactPackage;
import com.starcandy.wawaji.umeng.RNUMConfigure;
import com.starcandy.wawaji.update.UpdateEnginePackage;
import com.starcandy.wawaji.utils.AppUtil;
import com.starcandy.wawaji.utils.Logger;
import com.tencent.bugly.Bugly;
import com.tencent.bugly.BuglyStrategy;
import com.tencent.bugly.beta.Beta;
import com.theweflex.react.WeChatPackage;
import com.umeng.commonsdk.UMConfigure;
import com.zmxv.RNSound.RNSoundPackage;

import java.util.Arrays;
import java.util.List;

import javax.annotation.Nullable;

import fr.greweb.reactnativeviewshot.RNViewShotPackage;

import static com.starcandy.wawaji.utils.Constants.isDev;

public class MainApplication extends Application implements ReactApplication {
	
	private static MainApplication instance;
	
	private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
		@Override
		public boolean getUseDeveloperSupport() {
			return BuildConfig.DEBUG;
		}
		
		@Override
		protected List<ReactPackage> getPackages() {
			return Arrays.asList(
					new MainReactPackage(),
            		new RNViewShotPackage(),
					new PickerViewPackage(),
                    new GetuiPackage(),
                    new RNSoundPackage(),
                    new WeChatPackage(),
					new ILivePackage(),
					new IMEnginePackage(),
					new UpdateEnginePackage(),
					new DevicesEnginePackage(),
					new DplusReactPackage(),
					new AppReviewEnginePackage(),
					new CodePush(BuildConfig.CODEPUSH_KEY, MainApplication.getInstance(), BuildConfig.DEBUG)
			);
		}
		
		@Override
		protected String getJSMainModuleName() {
			return "index";
		}
		
		@Nullable
		@Override
		protected String getJSBundleFile() {
			return CodePush.getJSBundleFile();
		}
	};
	
	@Override
	public ReactNativeHost getReactNativeHost() {
		return mReactNativeHost;
	}
	
	@Override
	public void onCreate() {
		super.onCreate();
		instance = this;
		SoLoader.init(this, /* native exopackage */ false);
		//初始化bugly
		initApp();
		//初始化Rn Context
		registerReactInstanceEventListener();
		
		//初始化Getui
		GetuiModule.initPush(this);
		GetuiLogger.ENABLE = isDev;
		String appKey;
		if(isDev){
			appKey = "5a3c78bbb27b0a18820004db";//测试线Umeng
		}else{
			appKey = "5a438b4df43e48730000000d";//正式线Umeng
		}
		RNUMConfigure.init(this,appKey, AppUtil.getAppMetaData(this), UMConfigure.DEVICE_TYPE_PHONE, "");
		UMConfigure.setLogEnabled(isDev);
		//腾讯转化率
		/*try {
			Logger.d("MainApplication","GDTTracker");
			GDTTracker.init(instance, TrackConstants.APP_CHANNEL.OPEN_APP);
			GDTTracker.activateApp(instance);
		}catch (Exception e){
			e.printStackTrace();
		}*/
	}
	private ReactContext mReactContext;
	public ReactContext getReactContext() {
		Logger.d("MainApplication","mReactContext"+mReactContext);
		return mReactContext;
	}
	
	private void registerReactInstanceEventListener() {
		mReactNativeHost.getReactInstanceManager().addReactInstanceEventListener(mReactInstanceEventListener);
	}
	private void unRegisterReactInstanceEventListener() {
		mReactNativeHost.getReactInstanceManager().removeReactInstanceEventListener(mReactInstanceEventListener);
	}
	private final ReactInstanceManager.ReactInstanceEventListener mReactInstanceEventListener = new ReactInstanceManager.ReactInstanceEventListener() {
		@Override
		public void onReactContextInitialized(ReactContext context) {
			Logger.d("MainApplication","currentReactContext"+context);
			if(context != null){
				mReactContext = context;
//				sendDevicesInfo(context);
			}
			
		}
	};
	
	public static MainApplication getInstance(){
		return instance;
	}
	
	@Override
	protected void attachBaseContext(Context context) {
		super.attachBaseContext(context);
		MultiDex.install(this);
	}
	
	private void initApp() {
		String BUGLY_APP_KEY;
		if (isDev) {
			BUGLY_APP_KEY = "0c102f07d6";//BUGLY测试版
		} else {
			BUGLY_APP_KEY = "1840a47dfa";//BUGLY正式版
		}
		
		BuglyStrategy strategy = new BuglyStrategy();
		String appMetaData = AppUtil.getAppMetaData(instance);
		if(appMetaData == null){
			appMetaData = "havefun0";
		}
		
		String versionName = AppUtil.getVersionName(instance);
		if (versionName == null) {
			versionName = "1";
		}
		
		String packageName = instance.getPackageName();
		if(packageName == null){
			packageName = "com.starcandy.wawaji";
		}
		strategy.setAppChannel(appMetaData);  //设置渠道
		strategy.setAppVersion(versionName);      //App的版本
		strategy.setAppPackageName(packageName);  //App的包名
		Logger.d("WaWaJiPlayer", "versionName:" + versionName + "--getPackageName:" + packageName+"BUGLY_APP_KEY:"+BUGLY_APP_KEY);
		Beta.autoInit = true;//启动自动初始化升级模块
		Beta.autoCheckUpgrade = true;//自动检查更新开关
		Beta.upgradeCheckPeriod = 60 * 1000;//升级检查周期设置
//		Beta.checkUpgrade(false,false);
		Bugly.init(getApplicationContext(), BUGLY_APP_KEY, isDev,strategy);
		
	}
	protected void sendDevicesInfo(ReactContext mReactContext) {
		String appMetaData = AppUtil.getAppMetaData(instance);
		if(appMetaData == null){
			appMetaData = "havefun0";
		}
		
		String versionName = AppUtil.getVersionName(instance);
		if (versionName == null) {
			versionName = "1";
		}
		String versionCode = AppUtil.getVersionCode(instance);
		if (versionCode == null) {
			versionCode = "1";
		}
		
		//获取程序的IMEI
		TelephonyManager tm = (TelephonyManager) this.getSystemService(Context.TELEPHONY_SERVICE);
		String devicesId;
		if(tm != null && tm.getDeviceId() != null){
			devicesId = tm.getDeviceId().trim();
			if (devicesId.isEmpty()) devicesId  = "";
		}else{
			devicesId  = "";
		}
		
		Logger.d("WaWaJiPlayer", "versionCode:" + versionCode +"--versionName:" + versionName + "--appMetaData:" + appMetaData);

		WritableMap params = Arguments.createMap();
		params.putString("Devices", "imei="+devicesId+"&code="+versionCode+"&ver="+versionName+"&channel="+appMetaData);
		
		mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
				.emit("onDevicesInfoMessage", params);
	}
}
