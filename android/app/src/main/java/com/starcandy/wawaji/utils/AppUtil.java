package com.starcandy.wawaji.utils;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.text.TextUtils;

import com.starcandy.wawaji.review.AppInfo;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * AppUtils
 * Created by zhangjiwei on 2017/11/9.
 */

public class AppUtil {
	/**
	 * 获取app当前的渠道号或application中指定的meta-data
	 * @return 如果没有获取成功(没有对应值，或者异常)，则返回值为空
	 */
	public static String getAppMetaData(Context context) {
		if (context == null || TextUtils.isEmpty("UMENG_CHANNEL")) {
			return null;
		}
		String channelNumber = "";
		try {
			PackageManager packageManager = context.getPackageManager();
			if (packageManager != null) {
				ApplicationInfo applicationInfo = packageManager.getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
				if (applicationInfo != null) {
					if (applicationInfo.metaData != null) {
						channelNumber = applicationInfo.metaData.getString("UMENG_CHANNEL");
					}
				}
			}
		} catch (PackageManager.NameNotFoundException e) {
			e.printStackTrace();
		}
		return channelNumber;
	}
	
	public static String getVersionName(Context context){
		String versionName = null;
		try {
			// 获取packagemanager的实例
			PackageManager packageManager = context.getPackageManager();
			// getPackageName()是你当前类的包名，0代表是获取版本信息
			PackageInfo packInfo = packageManager.getPackageInfo(context.getPackageName(), 0);
			versionName =  packInfo.versionName;
		}catch (PackageManager.NameNotFoundException e){
			e.printStackTrace();
		}
		return versionName;
	}
	
	public static String getVersionCode(Context context){
		String versionCode = null;
		try {
			// 获取packagemanager的实例
			PackageManager packageManager = context.getPackageManager();
			// getPackageName()是你当前类的包名，0代表是获取版本信息
			PackageInfo packInfo = packageManager.getPackageInfo(context.getPackageName(), 0);
			versionCode =  String.valueOf(packInfo.versionCode);
		}catch (PackageManager.NameNotFoundException e){
			e.printStackTrace();
		}
		return versionCode;
	}
	
	
	public static boolean checkPermission(Context context, String permission) {
		boolean result = false;
		if (Build.VERSION.SDK_INT >= 23) {
			try {
				Class<?> clazz = Class.forName("android.content.Context");
				Method method = clazz.getMethod("checkSelfPermission", String.class);
				int rest = (Integer) method.invoke(context, permission);
				if (rest == PackageManager.PERMISSION_GRANTED) {
					result = true;
				} else {
					result = false;
				}
			} catch (Exception e) {
				result = false;
			}
		} else {
			PackageManager pm = context.getPackageManager();
			if (pm.checkPermission(permission, context.getPackageName()) == PackageManager.PERMISSION_GRANTED) {
				result = true;
			}
		}
		return result;
	}
	public static String getDeviceInfo(Context context) {
		try {
			org.json.JSONObject json = new org.json.JSONObject();
			android.telephony.TelephonyManager tm = (android.telephony.TelephonyManager) context
					.getSystemService(Context.TELEPHONY_SERVICE);
			String device_id = null;
			if (checkPermission(context, Manifest.permission.READ_PHONE_STATE)) {
				device_id = tm.getDeviceId();
			}
			
			String mac = null;
			FileReader fstream = null;
			try {
				fstream = new FileReader("/sys/class/net/wlan0/address");
			} catch (FileNotFoundException e) {
				fstream = new FileReader("/sys/class/net/eth0/address");
			}
			BufferedReader in = null;
			if (fstream != null) {
				try {
					in = new BufferedReader(fstream, 1024);
					mac = in.readLine();
				} catch (IOException e) {
				} finally {
					if (fstream != null) {
						try {
							fstream.close();
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
					if (in != null) {
						try {
							in.close();
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
			}
			json.put("mac", mac);
			if (TextUtils.isEmpty(device_id)) {
				device_id = mac;
			}
			if (TextUtils.isEmpty(device_id)) {
				device_id = android.provider.Settings.Secure.getString(context.getContentResolver(),
						android.provider.Settings.Secure.ANDROID_ID);
			}
			json.put("device_id", device_id);
			return json.toString();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	/**
	 * 过滤出已经安装的包名集合
	 * @param context
	 * @return 已安装的包名集合
	 */
	public static ArrayList<AppInfo> getFilterInstallMarkets(Context context) {
		ArrayList<String>  pkgs = new ArrayList<>();
		pkgs.add("com.bbk.appstore");
		pkgs.add("com.tencent.android.qqdownloader");
		pkgs.add("com.xiaomi.market");
		pkgs.add("com.huawei.appmarket");
		pkgs.add("com.baidu.appsearch");
		pkgs.add("com.oppo.market");
		pkgs.add("com.qihoo.appstore");
		pkgs.add("com.wandoujia.phoenix2");
		
		HashMap<String,String> appHashMap = new HashMap<>();
		ArrayList<AppInfo> appInfos = new ArrayList<>();
		if (context == null || pkgs.size() == 0)
			return appInfos;
		PackageManager pm = context.getPackageManager();
		List<PackageInfo> installedPkgs = pm.getInstalledPackages(0);
		int li = installedPkgs.size();
		int lj = pkgs.size();
		
		for (int j = 0; j < lj; j++) {
			for (int i = 0; i < li; i++) {
				String installPkg = "";
				String checkPkg = pkgs.get(j);
				PackageInfo packageInfo = installedPkgs.get(i);
				try {
					installPkg = packageInfo.packageName;
				} catch (Exception e) {
					e.printStackTrace();
				}
				if (TextUtils.isEmpty(installPkg))
					continue;
				if (installPkg.equals(checkPkg)) {
					String appName;
					if("com.bbk.appstore".equalsIgnoreCase(installPkg)){
						appName = "VIVO应用商店";
					}else if("com.oppo.market".equalsIgnoreCase(installPkg)){
						appName = "OPPO软件商店";
					}else {
						appName = packageInfo.applicationInfo.loadLabel(context.getPackageManager()).toString();
					}
					AppInfo appInfo = new AppInfo();
					appInfo.setAppName(appName);
					appInfo.setPackageName(checkPkg);
					appInfos.add(appInfo);
				}
			}
		}
		return appInfos;
	}
	
	/**
	 * 启动到应用商店app详情界面
	 *
	 * @param appPkg    目标App的包名
	 * @param marketPkg 应用商店包名 ,如果为""则由系统弹出应用商店列表供用户选择,否则调转到目标市场的应用详情界面，某些应用商店可能会失败
	 */
	public static boolean launchAppDetail(Context context,String marketPkg,String appPkg) {
		try {
			if (TextUtils.isEmpty(appPkg)) return false;
			Uri uri = Uri.parse("market://details?id=" + appPkg);
			Intent intent = new Intent(Intent.ACTION_VIEW, uri);
			if (!TextUtils.isEmpty(marketPkg)) {
				intent.setPackage(marketPkg);
			}
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			context.startActivity(intent);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
}
