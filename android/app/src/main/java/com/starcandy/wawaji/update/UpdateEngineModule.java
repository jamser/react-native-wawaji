package com.starcandy.wawaji.update;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat.Builder;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.starcandy.wawaji.utils.Logger;
import com.starcandy.wawaji.wawajilive.R;

import java.io.File;
import java.io.IOException;
/**
 * Created by zhangjiwei on 2017/12/16.
 */

public class UpdateEngineModule extends ReactContextBaseJavaModule {
	private NotificationManager mNotifyManager;
	private Builder mBuilder;
	private static final int NOTIFICATION_ID = 0;
	public UpdateEngineModule(ReactApplicationContext reactContext) {
		super(reactContext);
		mNotifyManager = (NotificationManager) UpdateEngineModule.this.getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
		mBuilder = new Builder(UpdateEngineModule.this.getReactApplicationContext());
	}
	
	@Override
	public String getName() {
		return "RCTUpdateEngine";
	}
	
	
	@ReactMethod()
	public void downLoadFile(ReadableMap options, final Promise promise){
		File cachePath= UpdateEngineModule.this.getReactApplicationContext().getExternalCacheDir();
		RecursionDeleteFile(cachePath);
		Logger.d("DownLoadUtils","路径--->"+cachePath.getPath()+":-->url"+options.getString("url"));
		commonEvent("onDownloading","loading");
		DownLoadUtils.get().download(options.getString("url"), cachePath.getPath(), new DownLoadUtils.OnDownloadListener() {
			@Override
			public void onDownloadSuccess(File file) {
				Logger.d("DownLoadUtils","下载完成");
				commonEvent("onDownloadSuccess","success");
				// 下载完成
				installAPk(file);
				mNotifyManager.cancel(NOTIFICATION_ID);
			}
			@Override
			public void onDownloading(int progress) {
				updateProgress(progress);
			}
			@Override
			public void onDownloadFailed() {
				commonEvent("onDownloadFailed","failed");
				Logger.d("DownLoadUtils","下载失败");
			}
		});
		
	}
	
	private void updateProgress(int progress) {
		//"正在下载:" + progress + "%"
		mBuilder.setSmallIcon(R.mipmap.ic_notice);
		mBuilder.setLargeIcon(BitmapFactory.decodeResource(
				UpdateEngineModule.this.getReactApplicationContext().getResources(), R.mipmap.ic_launcher));
		mBuilder.setContentText(UpdateEngineModule.this.getReactApplicationContext().getString(R.string.download_progress, progress)).setProgress(100, progress, false);
		//setContentInent如果不设置在4.0+上没有问题，在4.0以下会报异常
		PendingIntent pendingintent = PendingIntent.getActivity(UpdateEngineModule.this.getReactApplicationContext(), 0, new Intent(), PendingIntent.FLAG_CANCEL_CURRENT);
		mBuilder.setContentIntent(pendingintent);
		mNotifyManager.notify(NOTIFICATION_ID, mBuilder.build());
	}
	
	private void installAPk(File apkFile) {
		Intent intent = new Intent(Intent.ACTION_VIEW);
		//如果没有设置SDCard写权限，或者没有sdcard,apk文件保存在内存中，需要授予权限才能安装
		try {
			String[] command = {"chmod", "777", apkFile.toString()};
			ProcessBuilder builder = new ProcessBuilder(command);
			builder.start();
		} catch (IOException ignored) {
		}
		intent.setDataAndType(Uri.fromFile(apkFile), "application/vnd.android.package-archive");
		
		intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		UpdateEngineModule.this.getReactApplicationContext().startActivity(intent);
	}
	
	/**
	 * 递归删除文件和文件夹
	 * @param file    要删除的根目录
	 */
	private void RecursionDeleteFile(File file){
		try {
			if(file.isFile()){
				file.delete();
				return;
			}
			if(file.isDirectory()){
				File[] childFile = file.listFiles();
				if(childFile == null || childFile.length == 0){
					file.delete();
					return;
				}
				for(File f : childFile){
					RecursionDeleteFile(f);
				}
				file.delete();
			}
		}catch (Exception e){
			e.printStackTrace();
		}
	}
	
	private void commonEvent(String type,String callback) {
		WritableMap map = Arguments.createMap();
		map.putString("type", type);
		map.putString("msg", callback);
		sendEvent(getReactApplicationContext(), "update", map);
	}
	
	private void sendEvent(ReactContext reactContext,
	                       String eventName,
	                       @Nullable WritableMap params) {
		reactContext
				.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
				.emit(eventName, params);
	}
}
