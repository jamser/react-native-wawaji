package com.starcandy.wawaji.wxapi;

import android.app.Activity;
import android.os.Bundle;

import com.theweflex.react.WeChatModule;

/**
 * Created by zhangjiwei on 2017/11/7.
 */

public class WXEntryActivity extends Activity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		WeChatModule.handleIntent(getIntent());
		finish();
	}
}