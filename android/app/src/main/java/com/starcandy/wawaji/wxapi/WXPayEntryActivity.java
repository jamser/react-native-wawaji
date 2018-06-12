package com.starcandy.wawaji.wxapi;

import android.app.Activity;
import android.os.Bundle;

import com.theweflex.react.WeChatModule;

/**
 * 微信支付
 * Created by zhangjiwei on 2017/11/10.
 */

public class WXPayEntryActivity extends Activity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		WeChatModule.handleIntent(getIntent());
		finish();
	}
}

