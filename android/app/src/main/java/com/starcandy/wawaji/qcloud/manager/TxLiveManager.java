package com.starcandy.wawaji.qcloud.manager;

import android.content.Context;

import com.starcandy.wawaji.utils.Logger;
import com.tencent.rtmp.TXLiveConstants;
import com.tencent.rtmp.TXLivePlayConfig;
import com.tencent.rtmp.TXLivePlayer;
import com.tencent.rtmp.ui.TXCloudVideoView;

/**
 * 视频管理类
 * Created by zhangjiwei on 2017/11/6.
 */

public class TxLiveManager {
	private final String TAG = "TxLiveManager";
	private TXLivePlayer mLiveFirstPlayer,mLiveSecondPlayer;
	private TXCloudVideoView firstView,secondView;
	
	/**
	 * 单例实现
	 */
	private static class TxLiveManagerHolder {
		private static TxLiveManager imManager = new TxLiveManager();
	}
	
	public static TxLiveManager obtain() {
		return TxLiveManagerHolder.imManager;
	}
	
	
	public void init(Context context, TXCloudVideoView firstView,TXCloudVideoView secondView){
		this.firstView = firstView;
		this.secondView = secondView;
		mLiveFirstPlayer = new TXLivePlayer(context);
		mLiveSecondPlayer = new TXLivePlayer(context);
		mLiveFirstPlayer.setPlayerView(firstView);
		mLiveSecondPlayer.setPlayerView(secondView);
	}
	
	/**
	 * 初始化Player
	 */
	public void initConfig(TXLivePlayer player,String liveUrl){
		//增加检查 防止服务器返回null
		if(player == null || liveUrl == null || liveUrl.isEmpty()) return;
		player.enableHardwareDecode(true);
		player.setRenderMode(TXLiveConstants.RENDER_MODE_FULL_FILL_SCREEN);
//		player.setRenderRotation(TXLiveConstants.RENDER_ROTATION_LANDSCAPE);
		
		player.setAutoPlay(true);
		//流畅模式
		TXLivePlayConfig mPlayConfig = new TXLivePlayConfig();
		mPlayConfig.setAutoAdjustCacheTime(false);
		mPlayConfig.setCacheTime(5);
		
		player.setConfig(mPlayConfig);
		Logger.e (TAG, "initConfigURl:" + liveUrl);
		if(liveUrl.contains("txSecret") || liveUrl.contains("txTime")){
			Logger.e (TAG, "initConfig--->" + "RTMP_ACC");
			player.startPlay(liveUrl, TXLivePlayer.PLAY_TYPE_LIVE_RTMP_ACC);
		}else{
			Logger.e (TAG, "initConfig--->" + "RTMP");
			player.startPlay(liveUrl, TXLivePlayer.PLAY_TYPE_LIVE_RTMP);
		
		}
	}
	
	public TXLivePlayer getTXLivePlayer(int player){
		switch (player){
			case 0:
				return mLiveFirstPlayer;
			case 1:
				return mLiveSecondPlayer;
		}
		return null;
	}
	
	public void destroy(){
		if(mLiveFirstPlayer!=null && mLiveSecondPlayer!=null){
			mLiveFirstPlayer.setPlayListener(null);
			mLiveSecondPlayer.setPlayListener(null);
			mLiveFirstPlayer.stopPlay(true);
			mLiveSecondPlayer.stopPlay(true);
			firstView.onDestroy();
			secondView.onDestroy();
			Logger.e (TAG, "TxLiveManager-->destroy");
		}
	}
	
	public void pause(){
		if(mLiveFirstPlayer!=null && mLiveSecondPlayer!=null){
			if(mLiveFirstPlayer.isPlaying() && mLiveSecondPlayer.isPlaying()){
				mLiveFirstPlayer.pause();
				mLiveSecondPlayer.pause();
				Logger.e (TAG, "TxLiveManager-->pause");
			}
		}
	}
	
	public void resume(){
		if(mLiveFirstPlayer!=null && mLiveSecondPlayer!=null){
			if(!mLiveFirstPlayer.isPlaying() && !mLiveSecondPlayer.isPlaying()){
				mLiveFirstPlayer.resume();
				mLiveSecondPlayer.resume();
				Logger.e (TAG, "TxLiveManager-->resume");
			}
		}
	}
	
}
