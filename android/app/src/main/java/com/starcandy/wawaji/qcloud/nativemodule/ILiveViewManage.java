package com.starcandy.wawaji.qcloud.nativemodule;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.starcandy.wawaji.utils.Logger;
import com.starcandy.wawaji.qcloud.view.ILiveView;
import com.tencent.rtmp.TXLiveBase;

import java.lang.ref.WeakReference;


public class ILiveViewManage extends SimpleViewManager<ILiveView> {
    private static final String TAG = "WaWaJiPlayer";
    private ThemedReactContext reactContext;
    private static WeakReference<ILiveView> sLiveViewRef = null;

    @Override
    public String getName() {
        return "RCTILiveView";
    }

    @Override
    protected ILiveView createViewInstance(ThemedReactContext reactContext) {
        String sdkVersionStr = TXLiveBase.getSDKVersionStr();
        this.reactContext = reactContext;
        sLiveViewRef = new WeakReference<>(new ILiveView(reactContext));
        reactContext.addLifecycleEventListener(liveViewLifecycleEventListener);
        Logger.e(TAG, "liteav sdk version is : " + sdkVersionStr);
        return sLiveViewRef.get();
    }
    
    @Override
    public void onDropViewInstance(ILiveView view) {
        super.onDropViewInstance(view);
        reactContext.removeLifecycleEventListener(liveViewLifecycleEventListener);
        sLiveViewRef.get().destroy();
        Logger.e(TAG, "onDropViewInstance");
    }
    
    @ReactProp(name = "liveFirstUrl")
    public void setLiveUrl(ILiveView view, String liveFirstUrl) {
        Logger.e (TAG, "liveFirstUrl :" + liveFirstUrl);
        sLiveViewRef.get().playFirst(liveFirstUrl);
    }
    
    @ReactProp(name = "liveSecondUrl")
    public void setLiveSecondUrl(ILiveView view, String liveSecondUrl) {
        Logger.e (TAG, "liveSecondUrl :" + liveSecondUrl);
        sLiveViewRef.get().playSecond(liveSecondUrl);
    }

    @ReactProp(name = "liveIndex")
    public void setLiveUrl(ILiveView view, int liveIndex) {
        Logger.e (TAG, "liveIndex :" + liveIndex);
        if(liveIndex != -1){
            sLiveViewRef.get().switchShowLivePlayer(liveIndex);
        }
    }
    
    private LifecycleEventListener  liveViewLifecycleEventListener  = new LifecycleEventListener() {
        @Override
        public void onHostResume() {
            Logger.e(TAG, "onHostResume");
            sLiveViewRef.get().onResume();
        }
    
        @Override
        public void onHostPause() {
            Logger.e(TAG, "onHostPause");
            sLiveViewRef.get().onPause();
        }
    
        @Override
        public void onHostDestroy() {
        }
    };
}