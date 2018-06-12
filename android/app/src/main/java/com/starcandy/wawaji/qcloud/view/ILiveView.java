package com.starcandy.wawaji.qcloud.view;

import android.content.Context;
import android.os.Bundle;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.starcandy.wawaji.qcloud.manager.TxLiveManager;
import com.starcandy.wawaji.utils.Logger;
import com.starcandy.wawaji.wawajilive.MainApplication;
import com.starcandy.wawaji.wawajilive.R;
import com.tencent.rtmp.ITXLivePlayListener;
import com.tencent.rtmp.TXLiveConstants;
import com.tencent.rtmp.TXLivePlayer;
import com.tencent.rtmp.ui.TXCloudVideoView;

public class ILiveView extends RelativeLayout {
	private static final String TAG = "WaWaJiPlayer";
	private FrameLayout flLiveFirst,flLiveSecond;//两个视频View
	private TXLivePlayer firstLivePlayer,secondLivePlayer;//PLayer实例
	private ImageView imLoading;
	private int playFirstFrameEvent,playSecondFrameEvent;//记录获取播放画面
	private int playFirstErrEvent,playSecondErrEvent;//记录视频断流
	private boolean isFirstInit,isSecondInit;
	public ILiveView(final Context context) {
		super(context);
		//mPlayerView即step1中添加的界面view
		LayoutInflater.from(context).inflate(R.layout.player, this);
		flLiveFirst = (FrameLayout) findViewById(R.id.fl_live_first);
		flLiveSecond = (FrameLayout) findViewById(R.id.fl_live_second);
		
		imLoading = (ImageView)findViewById(R.id.im_loading);
		
		TXCloudVideoView firstView = (TXCloudVideoView) findViewById(R.id.video_first_view);
		TXCloudVideoView secondView = (TXCloudVideoView) findViewById(R.id.video_second_view);
		TxLiveManager.obtain().init(context, firstView, secondView);
		
		firstLivePlayer = TxLiveManager.obtain().getTXLivePlayer(0);
		secondLivePlayer = TxLiveManager.obtain().getTXLivePlayer(1);
		
		//两个监听
		firstLivePlayer.setPlayListener(new ITXLivePlayListener() {
			@Override
			public void onPlayEvent(int i, Bundle bundle) {
				Logger.d(TAG,"firstLivePlayer:onPlayEvent:"+i);
				
				if(i == TXLiveConstants.PLAY_EVT_RCV_FIRST_I_FRAME){
					playFirstFrameEvent = i;
					if(isFirstInit){
						firstLivePlayer.pause();
					}
					Logger.d(TAG, "isShowLoading playFirstFrameEvent:-----"+playFirstFrameEvent);
					isShowLoading();
				}
				if( i == TXLiveConstants.PLAY_ERR_NET_DISCONNECT){
					playFirstErrEvent = i;
					isShowLoading();
				}
			}
			
			@Override
			public void onNetStatus(Bundle bundle) {
			}
		});
		
		secondLivePlayer.setPlayListener(new ITXLivePlayListener() {
			@Override
			public void onPlayEvent(int i, Bundle bundle) {
				Logger.d(TAG,"secondLivePlayer:onPlayEvent:"+i);
				if(i == TXLiveConstants.PLAY_EVT_RCV_FIRST_I_FRAME){
					playSecondFrameEvent = i;
					if(isSecondInit){
						secondLivePlayer.pause();
					}
					Logger.d(TAG, "isShowLoading playSecondFrameEvent:-----"+playSecondFrameEvent);
					isShowLoading();
				}
				if(i == TXLiveConstants.PLAY_ERR_NET_DISCONNECT){
					playSecondErrEvent = i;
					isShowLoading();
				}
			}
			
			@Override
			public void onNetStatus(Bundle bundle) {
			}
		});
	}
	
	/**
	 * 是否显示loading图
	 */
	private void isShowLoading() {
		Logger.d(TAG, "isShowLoading :playFirstFrameEvent"+playFirstFrameEvent+"====playSecondFrameEvent"+playSecondFrameEvent+"---");
		if (playFirstFrameEvent ==TXLiveConstants.PLAY_EVT_RCV_FIRST_I_FRAME  &&  playSecondFrameEvent == TXLiveConstants.PLAY_EVT_RCV_FIRST_I_FRAME){
			
			if(isFirstInit && isSecondInit){
				flLiveSecond.setVisibility(View.GONE);
				flLiveFirst.setVisibility(View.VISIBLE);
				isFirstInit = false;
				isSecondInit = false;
				firstLivePlayer.resume();
				imLoading.setVisibility(View.GONE);
				Logger.d(TAG, "isShowLoading :" + 2003);
				sendFirstEvent(2003);
			}
			else{
				imLoading.setVisibility(View.GONE);
			}
		} else if (playFirstErrEvent ==TXLiveConstants.PLAY_ERR_NET_DISCONNECT  ||  playSecondErrEvent == TXLiveConstants.PLAY_ERR_NET_DISCONNECT){
			imLoading.setVisibility(View.VISIBLE);
			showToast("网络不佳，请检查网络，退出重试");
		}
	}
	
	public ILiveView(Context context, AttributeSet attrs) {
		super(context, attrs);
	}
	
	public ILiveView(Context context, AttributeSet attrs, int defStyleAttr) {
		super(context, attrs, defStyleAttr);
	}
	
	public void playFirst(String liveFirstUrl) {
		Logger.e (TAG, "start play first:" + liveFirstUrl);
		isFirstInit = true;
		playFirstFrameEvent = -1;
		playFirstErrEvent = -1;
		imLoading.setVisibility(View.VISIBLE);
		flLiveFirst.setVisibility(View.VISIBLE);
		TxLiveManager.obtain().initConfig(firstLivePlayer,liveFirstUrl);
		sendFirstEvent(2002);
	}
	public void playSecond(String liveSecondUrl){
		Logger.e (TAG, "start play second:" + liveSecondUrl);
		isSecondInit = true;
		playSecondFrameEvent = -1;
		playSecondErrEvent = -1;
		imLoading.setVisibility(View.VISIBLE);
		flLiveSecond.setVisibility(View.VISIBLE);
		TxLiveManager.obtain().initConfig(secondLivePlayer,liveSecondUrl);
		sendFirstEvent(2002);
	}
	
	/**
	 * sp转px的方法。
	 */
	public int sp2px(float spValue) {
		final float fontScale = getResources().getDisplayMetrics().scaledDensity;
		return (int) (spValue * fontScale + 0.5f);
	}
	
	/**
	 * 切换摄像头操作
	 */
	public void switchShowLivePlayer(int index){
		Logger.d(TAG, "switchShowLivePlayer :" + index);
		Logger.d(TAG, "playFirstFrameEvent :" + playFirstFrameEvent+"--playSecondFrameEvent:"+playSecondFrameEvent);
		if (playFirstFrameEvent !=TXLiveConstants.PLAY_EVT_RCV_FIRST_I_FRAME  ||  playSecondFrameEvent != TXLiveConstants.PLAY_EVT_RCV_FIRST_I_FRAME){
			imLoading.setVisibility(View.VISIBLE);
			showToast("镜头暂未准备好,请稍等~ ~");
			return;
		}
		switch (index){
			case 0:
				flLiveSecond.setVisibility(View.GONE);
				flLiveFirst.setVisibility(View.VISIBLE);
				if(!firstLivePlayer.isPlaying()){
					firstLivePlayer.resume();
				}
				if(secondLivePlayer.isPlaying()){
					secondLivePlayer.pause();
				}
				break;
			case 1:
				flLiveFirst.setVisibility(View.GONE);
				flLiveSecond.setVisibility(View.VISIBLE);
				if(!secondLivePlayer.isPlaying()){
					secondLivePlayer.resume();
				}
				if(firstLivePlayer.isPlaying()){
					firstLivePlayer.pause();
				}
				
				break;
		}
	}
	
	
	public void destroy() {
		TxLiveManager.obtain().destroy();
		Logger.d(TAG, "liveViewDestroy");
	}
	
	private void showToast(String msg){
		Toast toast = Toast.makeText(getContext(), msg, Toast.LENGTH_SHORT);
		toast.setGravity(Gravity.CENTER, 0, 0);
		toast.show();
	}
	
	public void onPause(){
		TxLiveManager.obtain().pause();
	}
	public void onResume(){
		TxLiveManager.obtain().resume();
	}
	
	//发送视频加载数据至JS
	protected void sendFirstEvent(int var) {
		WritableMap params = Arguments.createMap();
		params.putInt("playFirstEvent", var);
		ReactContext reactContext = MainApplication.getInstance().getReactContext();

		if(reactContext != null){
			reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "topSelect", params);
		}

	}
	
}