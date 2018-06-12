package com.starcandy.wawaji.utils;

import android.util.Log;

/**
 * Created by zhangjiwei on 2017/11/13.
 */

public class Logger {
	
	
	public static void e(String tag,String msg){
		if(Constants.isDev)
			Log.e(tag, msg);
	}
	
	public static void w(String tag,String msg){
		if(Constants.isDev)
			Log.w(tag, msg);
	}
	public static void i(String tag,String msg){
		if(Constants.isDev)
			Log.i(tag, msg);
	}
	public static void d(String tag,String msg){
		if(Constants.isDev)
			Log.d(tag, msg);
	}
	public static void v(String tag,String msg){
		if(Constants.isDev)
			Log.v(tag, msg);
	}
}
