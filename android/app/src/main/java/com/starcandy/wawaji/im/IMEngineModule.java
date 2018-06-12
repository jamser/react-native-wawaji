package com.starcandy.wawaji.im;

import android.support.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.starcandy.wawaji.im.presentation.business.InitBusiness;
import com.starcandy.wawaji.im.presentation.business.LoginBusiness;
import com.starcandy.wawaji.im.presentation.event.GroupEvent;
import com.starcandy.wawaji.im.presentation.event.MessageEvent;
import com.starcandy.wawaji.im.presentation.presenter.GroupManagerPresenter;
import com.starcandy.wawaji.utils.Logger;
import com.tencent.imsdk.TIMCallBack;
import com.tencent.imsdk.TIMElem;
import com.tencent.imsdk.TIMElemType;
import com.tencent.imsdk.TIMFriendshipManager;
import com.tencent.imsdk.TIMGroupMemberInfo;
import com.tencent.imsdk.TIMManager;
import com.tencent.imsdk.TIMMessage;
import com.tencent.imsdk.TIMTextElem;
import com.tencent.imsdk.TIMUserConfig;
import com.tencent.imsdk.TIMUserProfile;
import com.tencent.imsdk.TIMValueCallBack;
import com.tencent.imsdk.ext.group.TIMGroupCacheInfo;

import java.util.ArrayList;
import java.util.List;
import java.util.Observable;
import java.util.Observer;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

public class IMEngineModule extends ReactContextBaseJavaModule {
	private static final String TAG = "IMEngineModule";
	private static final String TYPE = "type";
	private static final String CODE = "code";
	private static final String MSG = "msg";
	private static final String ROOMID = "roomId";
	private static final String GROUPID = "groupId";
	private static final String FACEURL = "faceUrl";
	private static final String LEVEL = "level";
	private List<String> memberList = new ArrayList<>();
	
	@Override
	public String getName() {
		return "RCTIMEngine";
	}
	
	private IMEventHandler eventHandler = new IMEventHandler() {
		@Override
		public void onJoinGroup(final String name,final String groupId,final String faceUrl,final String level) {
			runOnUiThread(new Runnable() {
				@Override
				public void run() {
					WritableMap map = Arguments.createMap();
					map.putString(TYPE, "onJoinGroup");
					map.putString(MSG, name);
					map.putString(GROUPID, groupId);
					map.putString(FACEURL, faceUrl);
					map.putString(LEVEL, level);
					commonEvent(map);
				}
			});
		}
		
		@Override
		public void onQuitGroup(final String name,final String groupId,final String faceUrl,final String level) {
			runOnUiThread(new Runnable() {
				@Override
				public void run() {
					WritableMap map = Arguments.createMap();
					map.putString(TYPE, "onQuitGroup");
					map.putString(MSG, name);
					map.putString(GROUPID, groupId);
					map.putString(FACEURL, faceUrl);
					map.putString(LEVEL, level);
					commonEvent(map);
				}
			});
		}
		
		@Override
		public void onGroupAdd(final String name) {
			runOnUiThread(new Runnable() {
				@Override
				public void run() {
					WritableMap map = Arguments.createMap();
					map.putString(TYPE, "onGroupAdd");
					map.putString(MSG, name);
					commonEvent(map);
				}
			});
		}
		
		@Override
		public void onGroupDelete(final String name) {
			runOnUiThread(new Runnable() {
				@Override
				public void run() {
					WritableMap map = Arguments.createMap();
					map.putString(TYPE, "onGroupDelete");
					map.putString(MSG, name);
					commonEvent(map);
				}
			});
		}
		
		@Override
		public void onMessage(final String message) {
			runOnUiThread(new Runnable() {
				@Override
				public void run() {
					WritableMap map = Arguments.createMap();
					map.putString(TYPE, "onMessage");
					map.putString(MSG, message);
					commonEvent(map);
				}
			});
		}
		
	};
	
	
	public IMEngineModule(ReactApplicationContext reactContext) {
		super(reactContext);
		
	}
	
	@SuppressWarnings("unchecked")
	@ReactMethod
	public void initIM(final ReadableMap options, final Promise promise) {
		Logger.d(TAG, "initIM" + "appid:" + options.getInt("appid") +"--accountType" +options.getInt("accountType"));
		InitBusiness.start(IMEngineModule.this.getReactApplicationContext(), options.getInt("appid"), options.getInt("accountType"));
		TIMUserConfig userConfig = new TIMUserConfig();
		userConfig = MessageEvent.getInstance().init(userConfig);
		userConfig = GroupEvent.getInstance().init(userConfig);
		TIMManager.getInstance().setUserConfig(userConfig);
		
		GroupEvent.getInstance().addObserver(new Observer() {
			@Override
			public void update(Observable observable, Object data) {
				final GroupEvent.NotifyCmd cmd = (GroupEvent.NotifyCmd) data;
				Logger.d(TAG, "update" + "type:" + cmd.type +"--groupId" +cmd.groupId + "--cmd:" + cmd.toString());
				if (cmd.type == GroupEvent.NotifyType.MEMBER_JOIN) {
					//成员用户添加群组
					List<TIMGroupMemberInfo> memberList = (List<TIMGroupMemberInfo>) cmd.data;
					for (TIMGroupMemberInfo info :
							memberList) {
						//待获取用户资料的用户列表
						List<String> users = new ArrayList<>();
						users.add(info.getUser());
						//获取用户资料
						TIMFriendshipManager.getInstance().getUsersProfile(users, new TIMValueCallBack<List<TIMUserProfile>>() {
							@Override
							public void onError(int code, String desc) {
								Logger.e(TAG, "getUsersProfile failed: " + code + " desc");
							}
							
							@Override
							public void onSuccess(List<TIMUserProfile> result) {
								Logger.e(TAG, "getUsersProfile succ");
								for (TIMUserProfile res : result) {
									eventHandler.onJoinGroup(res.getNickName(),cmd.groupId,res.getFaceUrl(),res.getSelfSignature());
									Logger.e(TAG, "MEMBER_JOIN-->identifier: " + res.getIdentifier() + " nickName: " + res.getNickName()+" selfSignature:"+res.getSelfSignature());
								}
							}
						});
						
					}
					
					
				} else if (cmd.type == GroupEvent.NotifyType.MEMBER_QUIT) {
					//成员用户退出群组
					List<String> memberInfo = (List<String>) cmd.data;
					for (String member :
							memberInfo) {
						//待获取用户资料的用户列表
						List<String> users = new ArrayList<>();
						users.add(member);
						//获取用户资料
						TIMFriendshipManager.getInstance().getUsersProfile(users, new TIMValueCallBack<List<TIMUserProfile>>() {
							@Override
							public void onError(int code, String desc) {
								Logger.e(TAG, "getUsersProfile failed: " + code + " desc");
							}
							
							@Override
							public void onSuccess(List<TIMUserProfile> result) {
								Logger.e(TAG, "getUsersProfile succ");
								for (TIMUserProfile res : result) {
									Logger.e(TAG, "MEMBER_QUIT-->identifier: " + res.getIdentifier() + " nickName: " + res.getNickName());
									eventHandler.onQuitGroup(res.getNickName(),cmd.groupId,res.getFaceUrl(),res.getSelfSignature());
								}
							}
						});
					}
				} else if (cmd.type == GroupEvent.NotifyType.ADD) {
					//本机用户添加群组
					final TIMGroupCacheInfo timGroupCacheInfo = (TIMGroupCacheInfo) cmd.data;
					TIMFriendshipManager.getInstance().getSelfProfile(new TIMValueCallBack<TIMUserProfile>() {
						@Override
						public void onError(int i, String s) {
							Logger.e(TAG, "getUsersProfile failed: " + i + " desc");
						}
						
						@Override
						public void onSuccess(TIMUserProfile timUserProfile) {
							Logger.e(TAG, "Devices_ADD-->identifier: " + timUserProfile.getIdentifier() + " nickName: " + timUserProfile.getNickName()+"---ID:"+timGroupCacheInfo.getGroupInfo().getGroupId());
							eventHandler.onJoinGroup(timUserProfile.getNickName(),timGroupCacheInfo.getGroupInfo().getGroupId(),timUserProfile.getFaceUrl(),timUserProfile.getSelfSignature());
						}
					});
					
				} else if (cmd.type == GroupEvent.NotifyType.DEL) {
					//本机用户删除群组
					final String delGroupInfo = (String) cmd.data;
					TIMFriendshipManager.getInstance().getSelfProfile(new TIMValueCallBack<TIMUserProfile>() {
						@Override
						public void onError(int i, String s) {
							Logger.e(TAG, "getUsersProfile failed: " + i + " desc");
						}

						@Override
						public void onSuccess(TIMUserProfile timUserProfile) {
							Logger.e(TAG, "Devices_Del-->identifier: " + timUserProfile.getIdentifier() + " nickName: " + timUserProfile.getNickName()+"---ID:"+delGroupInfo);
							eventHandler.onQuitGroup(timUserProfile.getNickName(),"",timUserProfile.getFaceUrl(),timUserProfile.getSelfSignature());
						}
					});
				}
				
			}
		});
		
		MessageEvent.getInstance().addObserver(new Observer() {
			@Override
			public void update(Observable observable, Object data) {
				TIMMessage timMessage = (TIMMessage) data;
				for (int i = 0; i < timMessage.getElementCount(); ++i) {
					TIMElem elem = timMessage.getElement(i);
					//获取当前元素的类型
					TIMElemType elemType = elem.getType();
//					Logger.d(TAG, "elem type: " + elemType.name());
					//处理Message消息
					if (elemType == TIMElemType.Text) {
						TIMTextElem textElem = (TIMTextElem) elem;
						Logger.d(TAG, "MessageEvent-->:" + textElem.getText());
						eventHandler.onMessage(textElem.getText());
						/*try {
							//String-->Json-->JsonString
							Gson gson = new Gson();
							MessageInfo messageInfo = gson.fromJson(textElem.getText(), MessageInfo.class);
							Logger.d(TAG, "MessageEvent-->Gson:" + messageInfo.toString());
							eventHandler.onMessage(messageInfo.toString());
						}catch (Exception e){
							e.printStackTrace();
						}*/
					}
				}
			}
		});
		
		promise.resolve("success");
	}
	
	@ReactMethod
	public void login(
			String identify, String userSig,
			final Promise promise) {
		LoginBusiness.loginIm(identify, userSig, new TIMCallBack() {
			@Override
			public void onError(int i, String s) {
				Logger.d(TAG, "loginIm-->onError" + "i:" + i + "--s:" + s);
				promise.reject(String.valueOf(i), s);
			}
			
			@Override
			public void onSuccess() {
				Logger.d(TAG, "loginIm-->onSuccess");
				String loginUser = TIMManager.getInstance().getLoginUser();
				Logger.d(TAG, "TIMGroupManagerExt-->"+loginUser);
				promise.resolve("success");
			}
		});
		
		
	}
	
	@ReactMethod
	public void joinGroup(
			String groupId,
			final Promise promise) {
		Logger.d(TAG, "applyJoinGroup groupId-->"+groupId);
		GroupManagerPresenter.applyJoinGroup(groupId, "", new TIMCallBack() {
			@Override
			public void onError(int i, String s) {
				Logger.d(TAG, "applyJoinGroup-->onError" + "i:" + i + "--s:" + s);
				promise.reject(String.valueOf(i), s);
			}
			
			@Override
			public void onSuccess() {
				Logger.d(TAG, "applyJoinGroup-->onSuccess");
				promise.resolve("success");
			}
		});
	}
	
	@ReactMethod
	public void quitGroup(
			String groupId,
			final Promise promise) {
		Logger.d(TAG, "applyQuitGroup groupId-->"+groupId);
		GroupManagerPresenter.quitGroup(groupId, new TIMCallBack() {
			@Override
			public void onError(int i, String s) {
				promise.reject(String.valueOf(i), s);
			}
			
			@Override
			public void onSuccess() {
				promise.resolve("success");
			}
		});
	}
	
	/**
	 * 获取指定群组的成员
	 * @param groupId 群组ID
	 * @param promise ...
	 */
	@ReactMethod
	public void queryGroupMemberList(
			String groupId,
	        final Promise promise){
		memberList.clear();
		GroupManagerPresenter.queryGroupMemberList(groupId, new TIMValueCallBack<List<TIMGroupMemberInfo>>() {
			@Override
			public void onError(int i, String s) {
				promise.reject(String.valueOf(i), s);
			}
			
			@Override
			public void onSuccess(List<TIMGroupMemberInfo> timGroupMemberInfos) {
				if(timGroupMemberInfos.size() == 0){
					promise.resolve(null);
				}/*else if(timGroupMemberInfos.size() > 3){ 暂时注释 取所有数据
					for(int i=timGroupMemberInfos.size()-3;i<timGroupMemberInfos.size();i++){
						memberList.add(timGroupMemberInfos.get(i).getUser());
					}
					getUserFaceUrl(memberList,promise);
				}*/else{
					for(int i=0;i<timGroupMemberInfos.size();i++){
						//如果user是admin或者havefun 忽略掉
						String user = timGroupMemberInfos.get(i).getUser();
						if (!"admin".equals(user) && !"havefun".equals(user)) {
//							Logger.e(TAG,"timGroupMemberInfos-->"+user);
							memberList.add(user);
						}
					}
					getUserFaceUrl(memberList,promise);
				}
				
			}
		});
		
	}
	
	private void getUserFaceUrl(List<String> memberList,final Promise promise){
		//获取用户资料
		TIMFriendshipManager.getInstance().getUsersProfile(memberList, new TIMValueCallBack<List<TIMUserProfile>>() {
			@Override
			public void onError(int code, String desc) {
				Logger.e(TAG, "getUserFaceUrl failed: " + code + " desc");
			}
			
			@Override
			public void onSuccess(List<TIMUserProfile> result) {
				String json = new Gson().toJson(result);
				promise.resolve(json);
			}
		});
	}
	
	private void commonEvent(WritableMap map) {
		sendEvent(getReactApplicationContext(), "im", map);
	}
	
	private void sendEvent(ReactContext reactContext,
	                       String eventName,
	                       @Nullable WritableMap params) {
		reactContext
				.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
				.emit(eventName, params);
	}
	
	
}