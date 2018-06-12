import React,{Component} from 'react'
import {StyleSheet, View, Image, Text, ScrollView, ImageBackground, TouchableHighlight,Platform,Dimensions,BackHandler,Alert,Vibration,AppState,AlertIOS,Modal,TouchableWithoutFeedback} from 'react-native'
import ILiveView from '../../common/ILiveView'
import io from 'socket.io-client';
import {api} from '../../common/api.config'
import {setSpText,scaleSize,ifIphoneX} from '../../common/util'
import { NavigationActions } from 'react-navigation'
import Sound from 'react-native-sound'
import IMEngine from '../../components/IMEngine'
import AnalyticsUtil from '../../components/AnalyticsUtil'
import Barrage from '../../components/barrage'
import {consoleDebug} from '../../common/tool'
import gonglve from '../../resource/fail-gonglve.png'
import btn_left from '../../resource/btn-left.png'
import btn_right from '../../resource/btn-right.png'
import btn_up from '../../resource/btn-up.png'
import btn_down from '../../resource/btn-down.png'
import shot from '../../resource/btn-shot.png'
import mainBG from '../../resource/mainBG.png'
import back from '../../resource/back.png'
import begin_play from '../../resource/begin.png'
import coin from '../../resource/star.png'
import camera from '../../resource/camera.png'
import layer from '../../resource/layer.png'
import success_title from '../../resource/stars-title.png'
import success from '../../resource/success.png'
import cancel from '../../resource/x.png'
import try_again from '../../resource/try-again.png'
import try_btn_success from '../../resource/try-btn.png'
import share_btn from '../../resource/share-btn.png'
import fail_title from '../../resource/fail.png'
import fail_info from '../../resource/fail-info.png'
import no_play from '../../resource/no-play.png'
import btn_left_in from '../../resource/btn-left-in.png'
import btn_up_in from '../../resource/btn-up-in.png'
import btn_right_in from '../../resource/btn-right-in.png'
import btn_down_in from '../../resource/btn-down-in.png'
import btn_shot_disable from '../../resource/btn-shot-disable.png'
import one from '../../resource/count-down-one.png'
import two from '../../resource/count-down-two.png'
import three from '../../resource/count-down-three.png'
import star_disable from '../../resource/star-disable.png'
import try_again_disable from '../../resource/try-again-disable.png'
import try_btn_disable from '../../resource/try-btn-disable.png'
import PercentageCircle from '../../components/circleAnimate';
import videoLoading from '../../resource/video-loading.png'
import detail_video from '../../resource/detail-video.png'
import send_coin from '../../resource/send-coin.png'
import send_zuanshi from '../../resource/send-zuanshi.png'
import zuanshi from '../../resource/zuanshi-room.png'
import send_coin_in from '../../resource/send-coin-in.png'
import send_zuanshi_in from '../../resource/send-zuanshi-in.png'
import send_zuanshi_disable from '../../resource/send-zuanshi-disable.png'
import send_coin_disable from '../../resource/send-coin-disable.png'
import recharge_coin from '../../resource/recharge-coin.png'
import recharge_add from '../../resource/recharge-add.png'
import success_info from '../../resource/success-info.png'
import lackcoin from '../../resource/lack-coin.png'
import lackzuanshis from '../../resource/lack-zuanshi.png'
import coincontent from '../../resource/coin-content.png'
import zuanshicontent from '../../resource/zuanshi-content.png'
import invite_friend from '../../resource/invite-friend.png'
import to_recharge from '../../resource/to-recharge.png'
import zuanshi_disabled from '../../resource/zuanshi-disable.png'
import Headers from '../../common/fetch_header'
import * as WeChat from 'react-native-wechat';
import get_coin_title from '../../resource/get-coin-title.png'
import every_coin from '../../resource/everyday-getcoin.png'
import AppReviewEngine from '../../components/AppReviewEngine'
import level1_bg from '../../resource/level1-bg.png'
import level1 from '../../resource/level1.png'
import level2_bg from '../../resource/level2-bg.png'
import level0_bg from '../../resource/level0-bg.png'
import level3_bg from '../../resource/level3-bg.png'
import level2 from '../../resource/level2.png'
import level3 from '../../resource/level3.png'
import level4 from '../../resource/level4.png'
import level5 from '../../resource/level5.png'
import level6 from '../../resource/level6.png'
import level7 from '../../resource/level7.png'
import give_good from '../../resource/giveGood.png'
import novice2 from '../../resource/novice-2.png';
import novice4 from '../../resource/novice-4.png';
import novice5 from '../../resource/novice-5.png';
import novice6 from '../../resource/novice-6.png';
import novice7 from '../../resource/novice-7.png';
import novice8 from '../../resource/novice-8.png';
import novice9 from '../../resource/novice-9.png';
var socket = null,
    timer = null,
    timerResult = null,
    roomStatus = null,
    coinStatus = null,
    queryTimer = null,
    record = null,
    toastTimer=null,
    isMounted = 0,  //record 代表抓取记录的轮询 ,isMounted 等于1的时候，可以进行setState，等于0的时候不能进行
    leftLong = null,   //以下四个都是长按的定时操作
    rightLong = null,
    upLong = null,
    downLong = null

/*new Sound Promise 创建一个sound对象就会播放一首音乐*/
function newSoundFunc(source) {
    return new Promise((resolve,reject) => {
        var whoosh = new Sound(source, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                consoleDebug('failed to load the sound', error);
                reject(error)
            }
            resolve(whoosh)
            consoleDebug('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());
        });
    })
}

export default class Room extends Component{
    constructor(props){
        super(props)
        const params = this.props.navigation.state.params
        this.state = {
            tabIndex:0,            //娃娃详情 和 图片 的两个tab切换
            successResult:false,
            failResult:false,
            liveIndex:-1,       //默认视频流 与安卓交互
            balance:0,           //钻石余额
            coin: 0,
            dollList: [],
            machineId: null,
            controlStatus: null,
            frontAddressUrl:'login',      //视频流正面
            sideAddressUrl:'login',       //视频流侧面
            mac: '',
            buttonStatus: 0,//0不可上机, 1可上机
            remainTime:30,
            userDollId:0,
            countDown:4,            // 3.2.1倒计时
            dollScreenshots:[],
            controllerStatus:1,//0 不可以操作 1可以
            status:0, //0未操作 1操作
            result:true,
            remainTimeResult:10,
            showDialog:false,
            name:'',
            code:'',
            enterRoom:undefined,          //进入房间的音乐
            devicesMove:undefined,                  //爪子移动的音乐
            devicesFall:undefined,             //爪子掉落的音乐
            beginPlay:undefined,        //开始玩的音乐
            grabFail:undefined,        //失败的音乐
            grabSuccess:undefined,       //成功的音乐
            hideCamera:true,       //隐藏摄像头
            isPlayAgain:false,       //是否再玩一次
            upIn:0,               //当0的时候代表，向上的按钮正在被按。为1的时候代表没有按
            downIn:0,               //当0的时候代表，向下的按钮正在被按。为1的时候代表没有按
            leftIn:0,               //当0的时候代表，向左的按钮正在被按。为1的时候代表没有按
            rightIn:0,               //当0的时候代表，向右的按钮正在被按。为1的时候代表没有按
            beginIn:0,               //当0的时候，表示开始的按钮没按，为1的时候表示按下去的动态
            shotIn:0 ,                  //当0的时候，表示抓去的按钮没按，为1的时候表示按下去的动态
            imageIn:'',    //上机的头像
            player:null,       //是否有上机的人
            playername:'',
            isRecharge:true,       //上机成功，就将充值成功的按钮给隐藏掉
            toastInfoShow:false,     //IOS弹窗
            toastInfo:'',            //IOS弹窗内容
            isMounted:false,         //判断是否允许setState，解决warning
            groupId:'',  //groupId  IM群组id @TGS#aVISJC7EL
            groupListen:'',
            gameId:0  ,          //设置默认的gameId变量
            chatRoomList:[],       //在房间的List 头像集合
            chatRoomMembersCount:0,   //判断在房间的一共有几个人
            getDoll:false ,
            getDollUrl:'http://media.starcandy.cn/doll/doll_defaultavatar.png',
            bChatRoomMsg:'',    //广播大群msg
            queryMember:[],
            millisecond:0 ,     //长按按钮下去的间隔
            videoLoading:false,
            type:params !== undefined?params.type:global.type,//tab房间type
            lackofCoin:false, //缺乏金币
            lackzuanshi:false, // 缺乏钻石
            goldBalance:0 ,      //金币余额
            coinType:params !== undefined && params.coinType?params.coinType:'',        //区分是 钻石场还是金币场
            roomId:params !== undefined && params.roomId?params.roomId:global.roomId, //roomId房间Id
            roomName:params !== undefined && params.roomName?params.roomName:global.roomName, //房间的名称
            typeName:params !== undefined && params.typeName?params.typeName:global.typeName, //选中的tab的名字
            goldCoin:0,  //玩的金币数
            howGetCoins:false,   //如何获得金币
            guidance:false,      // 为false的时候，不显示评价，为true的时候，显示去评价
            androidList:false,     //android 应用市场 的列表
            androidListMap:[],
            level:0 ,//会员等级
            selectLevel:0, // 大喇叭传来的会员等级
            beginPlaySound:1,  //开始播放 begin_play.mp3
            handleType:0,   //长按识别
            noviceStatus:true,//新手引导
            noviceStatus1:true,
            playUserId:'',
            userIdPlayer:'',
        }
        Sound.setCategory('PlayBack',true)     //音乐播放
        this.showToast = this.showToast.bind(this)   //自己改写的toast
        this.toDollStrategy = this.toDollStrategy.bind(this)   //跳转到 娃娃攻略
        this.handleChange = this.handleChange.bind(this)      //子组件传递父组件
        this.IMListen = this.IMListen.bind(this) //监听IM
        this.toGameVideo = this.toGameVideo.bind(this)
        console.log(params)
    }
    /*播放音乐*/
    playSound(source,loop){
        consoleDebug("播放音乐")
        return  source.then((res)=>{
            if(loop){
                res.setNumberOfLoops(-1);   //循环
            }
            res.play((success) => {
                if(success){
                    consoleDebug("音乐播放完了")
                    res.stop();
                }else{
                    consoleDebug("音乐正在播放？")
                }
            });
            return res
        }).catch((err)=>{
            console.info("new音乐",err)
            throw err
        })
    }
    /*天哪，这是我见过最长的 componentDidMount 函数*/

    componentWillMount () {
        //统计-->游戏界面
        AnalyticsUtil.onEventWithMap("4_3",{typeName:'4_3'});
        isMounted = 1
        console.log(Dimensions.get('window').width)
        /*新手引导*/

        /*组件渲染之前调用安卓的 物理 返回键 监听*/
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        let _this = this
        machineId = _this.props.navigation.state.params.machineId,
            url = api.machine + '/' + machineId
        _this.setState({machineId:machineId})
        /*监听IM*/
        _this.IMListen()
        // 读取
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then(ret => {
            console.info('ret', ret)
            return fetch(api.userInfo, {method: 'GET',headers: Headers(ret[0])})//个人信息
        }).then(res => res.json()).then(res => {
            if (res.status && res.status !== 200) {
                throw res
            } else {
                _this.setState({balance:res.balance,name:res.nickName,code:res.code,goldBalance:res.goldBalance,userIdPlayer:res.id})
            }
        }).catch(err => {
            console.info('api.userInfo err', err)
        })
        //轮循获取金币个数
        coinStatus = setInterval(() => {
            fetch(api.userInfo, {method: 'GET',headers: Headers(global.jwtToken)})//个人信息
                .then(res => res.json())
                .then(res => {
                    console.info('api.userInfo isMounted', isMounted)
                    if(isMounted === 1) {
                        if (res.status && res.status !== 200) {
                            throw res
                        } else {
                            _this.setState({balance: res.balance})
                        }
                    }
                }).catch(err => {
                console.info('api.userInfo err', err)
            })
        },5000)
        //获取房间状态 fail 代表你不能上机，success代表你抢到上机的机会了
        fetch(api.prefetch, {
            method: 'POST', headers: Headers(global.jwtToken), body: JSON.stringify({machineId: machineId})
        })
            .then(res => res.json())
            .then(res => {
                console.info(api.prefetch, res)
                if (res.code) {
                    throw res
                } else {
                    _this.setState({imageIn:res.player !== null && res.player.avator?res.player.avator:'',player:res.player,playername:res.player !== null ?res.player.nickName:'',level:res.player !== null && res.player.level ?res.player.level:0,playUserId:res.player!==null?res.player.userId:''})
                    if(res.status === 'SUCCESS'){
                        _this.setState({buttonStatus:1})  //
                    }else{
                        this.showToast('房间被其他用户抢占')
                    }
                }
            }).catch(err => {
            console.info(api.prefetch, err)
        })
        //轮循获取房间状态
        roomStatus = setInterval(() => {
            fetch(api.prefetch, {
                method: 'POST', headers: Headers(global.jwtToken), body: JSON.stringify({machineId: machineId})
            })
                .then(res => res.json())
                .then(res => {
                    console.info(api.prefetch, res)
                    if(isMounted === 1) {
                        _this.setState({
                            imageIn: res.player !== null ? res.player.avator : '',
                            player: res.player,
                            playername: res.player !== null ? res.player.nickName : '',
                            level:res.player !== null && res.player.level ?res.player.level:0,
                            playUserId:res.player!==null?res.player.userId:''
                            })
                    }
                    if (res.code) {
                        throw res
                    } else {
                        if(res.status === 'SUCCESS'&& !_this.state.showDialog){
                            _this.setState({buttonStatus:1,imageIn:res.player !== null?res.player.avator:'',player:res.player,playername:res.player !== null ?res.player.nickName:'',level:res.player !== null && res.player.level ?res.player.level:0, playUserId:res.player!==null?res.player.userId:''
                            })
                        }else if(res.status === 500){
                            _this.showToast('服务器开小差 请稍后再试')
                        }
                    }
                }).catch(err => {
                console.info(api.prefetch, err)
            })
        }, 5000)

        //机器信息
        console.log('wolail')
        console.info(this.state.roomId,machineId,global.jwtToken)
        fetch(api.machine + '/' + machineId+'?roomId='+this.state.roomId, {method: 'GET',headers: Headers(global.jwtToken)})
            .then(res => res.json())
            .then(res => {
                console.info(api.machine + '/' + machineId, res)
                if (res.status && res.status !== 200) {
                    throw res
                } else {
                    console.info(api.machine + '/' + machineId,res)
                    _this.setState({dollScreenshots:res.dollScreenshots,coin:res.coin,goldCoin:res.goldCoin,frontAddressUrl:res.frontAddressUrl,sideAddressUrl:res.sideAddressUrl,groupId:res.chatRoomId,roomId:res.roomId,coinType:res.coinType,practice:res.practice})
                    /*进来的时候，join这个群组*/
                    if(this.state.groupId !== null && this.state.groupId !== undefined && this.state.groupId.length >0) {
                        IMEngine.joinGroup(this.state.groupId)
                    }
                    /*获取当前房间有多少人,头像*/
                    IMEngine.queryGroupMemberList(this.state.groupId).then((res)=>{
                        let query = JSON.parse(res),queryArray=[]
                        for(let i = 0;i<query.length; i++){
                            queryArray.push(query[i].faceUrl)
                        }
                        console.log("queryGroupMemberList  in Room")
                        console.log(queryArray)
                        console.log(queryArray.slice(0,3))
                        _this.setState({queryMember:queryArray,chatRoomList:queryArray.slice(0,5),chatRoomMembersCount:query.length})
                    })
                    //循环获取抓取记录信息
                    record = setInterval(() => {
                        let dollUrl = api.doll + res.dollId + "/winner"
                        fetch(dollUrl, {method: 'GET',headers: Headers(global.jwtToken)})
                            .then(res => res.json())
                            .then(res => {
                                console.log("最近抓中记录")
                                console.info(dollUrl, res)
                                if(isMounted === 1) {
                                    if (res.status && res.status !== 200) {
                                        throw res
                                    } else {
                                        console.log(_this.state.dollList)
                                        _this.setState({dollList: res.content})
                                    }
                                }
                            }).catch(err => {
                            console.info(url, err)
                        })
                    }, 5000)

                    //抓取记录信息
                    return fetch(api.doll + res.dollId + "/winner", {method: 'GET'})

                }
            })
            .then(res => res.json())
            .then(res => {
                console.info(api.doll, res)
                if (res.status && res.status !== 200) {
                    throw res
                } else {
                    if(isMounted === 1) {
                        _this.setState({dollList: res.content})
                    }
                }
            })
            .catch(err => {
                console.info('err', err)
            })

        /*监听 Home键*/
        AppState.addEventListener('change',this._handleAppStateChange);
        /* 一进来就 加载所有的 音乐*/
        this.newEnterRoom = newSoundFunc('enter_room.mp3')
        this.newBeginPlay = newSoundFunc('begin_play.mp3')
        this.newGrabSuccess = newSoundFunc('grab_success.mp3')
        this.newGrabFail = newSoundFunc('grab_fail.mp3')
        this.newDeviceMove = newSoundFunc('devices_move.mp3')
        this.newDevicesFall = newSoundFunc('fall.wav')
    }

    //进入Room 播放音乐
    componentDidMount() {
        let _this = this
        storage.load({
            key: 'getRoom',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((res)=>{
            if(res.type==='noviceRoom'){
                _this.setState({
                    noviceStatus:true
                })
            }
        }).catch((err)=>{
            _this.setState({
                noviceStatus:false
            })
            console.log('新用户')
            throw err
        });
        _this.playSound(this.newEnterRoom,true)
    }
    getNoviceRoom(){
        this.setState({
            noviceStatus1:false,
            noviceStatus:true,
        })
        storage.save({
            key: 'getRoom',   // Note: Do not use underscore("_") in key!
            data: {type:'noviceRoom'},
            expires: null
        })
    }
    /*组件销毁，组件被移除之前调用，用于清理*/
    componentWillUnmount(){
        isMounted = 0
        /* 组件销毁的时候，清除掉，所有的6个背景音乐*/
        if (this.newBeginPlay !== undefined) {
            this.newBeginPlay.then((res)=>{
                res.release()
            })
        }
        if (this.newEnterRoom !== undefined) {
            this.newEnterRoom.then((res)=>{
                res.release()
            })
        }

        if (this.newDeviceMove !== undefined) {
            this.newDeviceMove.then((res)=>{
                res.release()
            })
        }
        if (this.newDevicesFall !== undefined) {
            this.newDevicesFall.then((res)=>{
                res.release()
            })
        }
        if (this.newGrabFail !== undefined) {
            this.newGrabFail.then((res)=>{
                res.release()
            })
        }
        if (this.newGrabSuccess !== undefined) {
            this.newGrabSuccess.then((res)=>{
                res.release()
            })
        }
        /*组件销毁的时候，清除监听Home*/
        AppState.removeEventListener('change',this._handleAppStateChange);
        /*清除所有的定时器   无奈，为什么这么多定时器*/
        clearInterval(coinStatus)
        clearInterval(timer)
        clearInterval(queryTimer)
        clearInterval(timerResult)
        clearInterval(record)
        clearInterval(toastTimer)
        /*组件被销毁的时候，长按的定时需要被清掉*/
        clearInterval(rightLong)
        clearInterval(leftLong)
        clearInterval(upLong)
        clearInterval(downLong)
        /*组件销毁的时候 ，退出群*/
        IMEngine.quitGroup(this.state.groupId)
        /*组件销毁的时候，移除监听*/
        IMEngine.removeEventEmitter('room')
    }
    /*监听用户是否点击Home的变化 后台运行*/
    _handleAppStateChange = (nextAppState)=>{
        if (nextAppState != null && nextAppState === 'background') {
            if(this.newBeginPlay !== undefined) {
                this.newBeginPlay.then((res)=>{
                    res.stop()
                })
            }
            if(this.newEnterRoom !== undefined) {
                this.newEnterRoom.then((res)=>{
                    res.stop()
                })
            }
            /**用户点击手机上的Home按键的时候，退出群组***/
            IMEngine.quitGroup(this.state.groupId)
        }else{
            console.log("this.newBeginPlay")
            console.log(this.newBeginPlay,this.state.beginPlaySound)
            if(this.state.beginPlaySound === 1){
                this.playSound(this.newEnterRoom,true)
            }else{
                this.playSound(this.newBeginPlay,true)
            }
            /**用户点击手机上的Home按键进入app的时候，加入群组***/
            IMEngine.joinGroup(this.state.groupId)
        }
    }
    _playAgain() {
        console.log("再来一次")
        clearInterval(timerResult)
        clearInterval(rightLong)
        clearInterval(leftLong)
        clearInterval(upLong)
        clearInterval(downLong)
        let _this = this
        //统计-->再次挑战
        AnalyticsUtil.onEventWithMap("4_3_6",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName});

        _this.setState({liveIndex:0,beginPlaySound:1})//重置摄像头
        if(_this.newBeginPlay){
            _this.newBeginPlay.then((res)=>{
                res.stop()
            })
        }
        if(_this.newEnterRoom){
            _this.newEnterRoom.then((res)=>{
                res.stop()
            })
        }
        this.setState({successResult: false, failResult:false,status:0,buttonStatus:0,controllerStatus:1,remainTimeResult:10,isPlayAgain:true})
        fetch(api.prefetch, {
            method: 'POST', headers: Headers(global.jwtToken), body: JSON.stringify({machineId: _this.state.machineId})
        })
            .then(res => {
                if(res.status === 200){
                    return res.json()
                }else{
                    return false;
                }
            })
            .then(res => {
                console.info(api.prefetch, res)
                if (res.code) {
                    throw res
                } else {
                    if(res.status === 'SUCCESS'){
                        _this.setState({buttonStatus:1})
                        _this._begin(_this.state.selectCoinType)
                    }else{

                    }
                }
            }).catch(err => {
            console.info(api.prefetch, err)
        })

    }
    /*我收回我的上句话，这个函数 很。。。*/
    _begin(type) {
        Vibration.vibrate([0, 80, 100, 0])
        let _this = this
        //统计-->开始抓娃娃
        AnalyticsUtil.onEventWithMap("4_3_2",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName});
        if(type === 'GOLD'){
            //统计-->投金币
            AnalyticsUtil.onEventWithMap("4_3_2_1_1",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName});
        }else{
            //统计-->投钻石
            AnalyticsUtil.onEventWithMap("4_3_2_2",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName});
        }
        _this.setState({buttonStatus:0})//点击开始游戏，按钮立即变灰
        /*fetch接口上传deviceType*/
        let deviceType = Platform.OS.toUpperCase();
        _this.setState({selectCoinType:type})
        fetch(api.fetch, {
            method: 'POST', headers: Headers(global.jwtToken), body: JSON.stringify({machineId: _this.state.machineId,deviceType: deviceType,roomId:_this.state.roomId,coinType:type,practice:_this.state.practice})
        })
            .then(res => {
                console.info(api.fetch, res)
                if (res.ok) {
                    res.json().then( res => {
                        console.info(api.fetch, res)
                        if(res.status === 'SUCCESS'){
                            //统计-->开始抓娃娃 上机成功
                            AnalyticsUtil.onEventWithMap("4_3_2",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName,status:'上机成功'});
                            _this.setState({showDialog:true,liveIndex:-1,videoLoading:false,hideCamera:_this.state.isPlayAgain?true:false,imageIn:res.player !== null?res.player.avator:'',player:res.player,playername:res.player !== null ?res.player.nickName:'',isRecharge:false,millisecond:res.millisecond,level:res.player !== null && res.player.level ?res.player.level:0,beginPlaySound:0,playUserId:res.player!==null?res.player.userId:''})//设置上机成功
                            consoleDebug(_this.state.hideCamera)
                            /*release掉进入房间的页面，再begin_play 音乐*/
                            if(_this.newEnterRoom !== undefined) {
                                _this.newEnterRoom.then((res)=>{
                                    res.stop()
                                })
                            }
                            _this.playSound(this.newBeginPlay, true)
                            _this.setState({userDollId:res.userDollId,mac:res.mac,frontAddressUrl:res.frontAddressUrl !== null?res.frontAddressUrl:'login',sideAddressUrl:res.sideAddressUrl !== null ? res.sideAddressUrl:'login',gameId:res.gameId})//获取娃娃ID 机器mac 两个视频地址
                            socket = io(api.socketUrl, { transports: ['websocket'] });
                            //监听socket
                            socket.on('connect', () => {consoleDebug('socket 连接成功')});
                            socket.on('startEvent', (res) => {console.info('socket startEvent', res)});
                            socket.on('disconnect', () => {consoleDebug('socket disconnect 连接断开')});
                            socket.on('error', (err) => {console.info('socket err', err)});
                            socket.on('endEvent',(res, cb) => {
                                console.info('endEvent', res)
                                clearInterval(rightLong)
                                clearInterval(leftLong)
                                clearInterval(upLong)
                                clearInterval(downLong)
                                if (cb && (res.gameId === _this.state.gameId || res.userDollId === _this.state.userDollId)) {
                                    if(res.crawlSuccess === true){
                                        _this.setState({successResult:true})
                                        _this.playSound(this.newGrabSuccess,false)
                                        timerResult = setInterval(() => {
                                            _this.setState({remainTimeResult:_this.state.remainTimeResult -1})
                                            if(_this.state.remainTimeResult === 0){
                                                clearInterval(timerResult)
                                                socket.disconnect()
                                                _this.setState({status:0,buttonStatus:0,controllerStatus:1})
                                            }
                                        }, 1000)
                                    }else{
                                        _this.setState({failResult:true})
                                        _this.playSound(this.newGrabFail,false)
                                        timerResult = setInterval(() => {
                                            _this.setState({remainTimeResult:_this.state.remainTimeResult-1})
                                            if(_this.state.remainTimeResult === 0){
                                                clearInterval(timerResult)
                                                socket.disconnect()
                                                _this.setState({status:0,buttonStatus:0,controllerStatus:1})
                                            }
                                        }, 1000)
                                        // _this.props.navigation.navigate('Result',{crawlSuccess:res.crawlSuccess})
                                    }
                                }
                            });
                            //监听可能不是一个人的情况
                            socket.on('failEvent', () => {
                                //统计-->开始抓娃娃 上机失败
                                AnalyticsUtil.onEventWithMap("4_3_2",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName,status:'上机失败->不是同一个人'});
                                console.info('不是同一个人')
                                socket.disconnect() //当不是同一个人的时候，断掉 socketIO
                                _this.setState({buttonStatus:0,status:0})
                                _this.showToast('上机失败，请退出重试')
                                return false;
                            });

                            //资格验证成功后开始socket
                            socket.emit('startEvent', {
                                userId: global.userId,
                                mac: _this.state.mac,
                                userDollId:_this.state.userDollId
                            }, () => {
                                console.info('startEvent 开始 成功')
                                queryTimer = setInterval(() => {          //我实在不知道这个定时器是什么鬼
                                    _this.setState({countDown:_this.state.countDown-1})
                                    if(_this.state.countDown === 0){
                                        clearInterval(queryTimer)
                                        _this.setState({countDown:4})
                                        //设置按钮倒计时为30 按钮状态为可用 并且开始倒计时
                                        _this.setState({status: 1, remainTime: 30})
                                        timer = setInterval(() => {
                                            if (_this.state.remainTime === 0) {
                                                clearInterval(timer) //这是什么鬼？
                                                _this.playSound(_this.newDevicesFall,false)
                                                _this.setState({controllerStatus: 0})//时间结束后 GO按钮变灰
                                            } else {
                                                _this.setState({remainTime: _this.state.remainTime - 1})
                                            }
                                        }, 1000)

                                    }
                                }, 1000)

                            });

                        }else {
                            //统计-->开始抓娃娃 上机失败
                            AnalyticsUtil.onEventWithMap("4_3_2",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName,status:'上机失败'});
                            _this.setState({isRecharge:true})
                            _this.showToast('上机失败：房间被其他用户抢占')
                        }
                    });
                } else {
                    if(JSON.parse(res._bodyText).code === 10001){
                        this.showToast(JSON.parse(res._bodyText).message)
                        /* 点击 上机返回的结果，，如果返回10001 代表钱不够，判断当前用户是点击的哪种情况 上机，根据 selectCoinType 来判断 */
                        if(_this.state.selectCoinType === 'GOLD'){
                            _this.setState({lackofCoin:true}) //缺乏 金币的 弹窗
                            //统计-->金币不足弹窗
                            AnalyticsUtil.onEventWithMap('4_3_2_1_4',{typeName:'4_3_2_1_4'});
                        }else{
                            _this.setState({lackzuanshi:true}) //缺乏 钻石的弹窗
                            //统计-->钻石不足弹窗
                            AnalyticsUtil.onEventWithMap('4_3_2_2_2',{typeName:'4_3_2_2_3'});
                        }
                        _this.setState({status:0,buttonStatus:0})
                        // /*跳转到 充值页面进行 清除 定时器和 背景音乐*/

                    }
                }
            }, function(e) {
                consoleDebug("Fetch failed!", e);
            }).catch(err => {

        });
    }

    /**
     * 关闭钻石去充值界面
     */
    closeLackDiamond(){
        //统计-->关闭钻石去充值界面
        AnalyticsUtil.onEventWithMap("4_3_2_2_1",{typeName:'4_3_2_2_1'})
        this.setState({lackzuanshi:false})
    }
    /*点击金币按钮跳转到充值页面 并进行相应的清除*/
    toRecharge(){
        let _this = this
        clearInterval(roomStatus)
        clearInterval(coinStatus)
        const nav = this.props.navigation
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Recharge',params:{userId: global.userId, machineId: this.state.machineId}})
            ]
        })
        //统计-->充值按钮
        AnalyticsUtil.onEventWithMap("4_3_1",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName});
        nav.dispatch(resetAction)
    }
    _controlTab(i){
        //统计-->最近抓中记录/娃娃详情
        if(i === 0){
            AnalyticsUtil.onEventWithMap("4_3_5",{roomId:this.state.roomId,roomName:this.state.roomName,tabName:this.state.typeName});
        }else if(i === 1){
            AnalyticsUtil.onEventWithMap("4_3_3",{roomId:this.state.roomId,roomName:this.state.roomName,tabName:this.state.typeName});
        }
        this.setState({tabIndex:i})
    }
    _handleUp(type) {
        if(!type) {
            Vibration.vibrate([0, 80, 100, 0])
        }
        let _this = this
        _this.playSound(this.newDeviceMove,false)
        if(_this.state.controllerStatus === 0){
            return
        }
        socket.emit('userActionEvent',{userId: global.userId,
            action: _this.state.liveIndex === 0 || _this.state.liveIndex === -1 ?0:2, mac:_this.state.mac,type:_this.state.handleType}, () => {
            console.info('userActionEvent up 成功')
        });
    }
    _handleDown(type) {
        if(!type) {
            Vibration.vibrate([0, 80, 100, 0])
        }
        let _this = this
        _this.playSound(this.newDeviceMove,false)
        if(_this.state.controllerStatus === 0){
            return
        }
        socket.emit('userActionEvent',{userId: global.userId,
            action: _this.state.liveIndex === 0 || _this.state.liveIndex === -1 ?1:3, mac:_this.state.mac,type:_this.state.handleType}, () => {
            console.info('userActionEvent down 成功')
        });
    }
    _handleLeft(type) {
        if(!type) {
            Vibration.vibrate([0, 80, 100, 0])
        }
        let _this = this
        _this.playSound(this.newDeviceMove,false)
        if(_this.state.controllerStatus === 0){
            return
        }
        socket.emit('userActionEvent',{userId: global.userId,
            action: _this.state.liveIndex === 0 || _this.state.liveIndex === -1 ?2:1, mac:_this.state.mac,type:_this.state.handleType}, () => {
            console.info('userActionEvent left 成功')
        });
    }
    _handleRight(type) {
        if(!type) {
            Vibration.vibrate([0, 80, 100, 0])
        }
        let _this = this
        _this.playSound(this.newDeviceMove,false)
        if(_this.state.controllerStatus === 0){
            return
        }
        socket.emit('userActionEvent',{userId: global.userId,
            action: _this.state.liveIndex === 0 || _this.state.liveIndex === -1 ?3:0, mac:_this.state.mac,type:_this.state.handleType}, () => {
            console.info('userActionEventuserActionEvent right 成功')
        });
    }
    _handleShot() {
        Vibration.vibrate([0, 80, 100, 0])
        let _this = this
        _this.playSound(_this.newDevicesFall,false)
        socket.emit('userActionEvent',{userId: global.userId,
            action: 4, mac:_this.state.mac}, res => {
            console.info('userActionEvent(抓取) 成功 ')
            _this.setState({controllerStatus:0,remainTime:0})
        });
    }
    _toggleCamera() {
        //统计-->切换摄像头
        let _this = this
        AnalyticsUtil.onEventWithMap("4_3_9",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName});
        if (this.state.liveIndex === -1 || this.state.liveIndex === 0) {
            this.setState({liveIndex: 1})

        } else {
            this.setState({liveIndex: 0})
        }
    }
    onBackAndroid = () => {
        let _this = this
        clearInterval(roomStatus)
        clearInterval(coinStatus)
        console.log(_this.state.showDialog)
        if(_this.state.showDialog){
            if(Platform.OS === 'android'){
                Alert.alert(
                    '',
                    '退出后游戏将自动结束哦',
                    [
                        {text: '', onPress: () => {}},
                        {text: '离开', onPress: () => _this._handleLeave()},
                        {text: '留下', onPress: () => consoleDebug('我留下了')},
                    ],
                    { cancelable: false }
                )
            }else{
                AlertIOS.alert(
                    '',
                    '退出后游戏将自动结束哦',
                    [
                        {text: '离开', onPress: () => _this._handleLeave()},
                        {text: '留下', onPress: () => consoleDebug('我留下了')},
                    ]
                )
            }
            return true
        }else{
            if(_this.newBeginPlay !== undefined){
                _this.newBeginPlay.then((res)=>{
                    res.release()
                });
            }
            if(_this.newEnterRoom !== undefined){
                _this.newEnterRoom.then((res)=>{
                    res.release()
                })
            }
            const nav = this.props.navigation;
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Home',params:{type:_this.state.type}})
                ]
            })
            nav.dispatch(resetAction)
            return true
        }
    }

    /**
     * 显示获取金币弹窗
     */
    showHowGetCoins(){
        //统计-->显示获取金币弹窗
        AnalyticsUtil.onEventWithMap("4_3_1_3",{typeName:'4_3_1_3'})
        this.setState({howGetCoins:true})
    }

    _handleLeave() {
        this.setState({showDialog:false})
        if(socket && socket !== null) {
            socket.disconnect()
        }
        //断开socket
        //this.props.navigation.goBack()
        const nav = this.props.navigation;
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Home'})
            ]
        })
        nav.dispatch(resetAction)
    }
    _closeResultModal() {
        let _this = this
        if(_this.state.successResult){
            _this.guideComment()
        }
        //统计-->游戏状态关闭
        AnalyticsUtil.onEventWithMap("4_3_8",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName});
        _this.socketNoPlay()
        clearInterval(timerResult)
        clearInterval(rightLong)
        clearInterval(leftLong)
        clearInterval(upLong)
        clearInterval(downLong)
        if (_this.newBeginPlay !== undefined) {
            _this.newBeginPlay.then((res)=>{
                res.stop()
            })
        }
        if (_this.newGrabFail !== undefined) {
            _this.newGrabFail.then((res)=>{
                res.stop()
            })
        }
        if (_this.newGrabSuccess !== undefined) {
            _this.newGrabSuccess.then((res)=>{
                res.stop()
            })
        }
        _this.playSound(this.newEnterRoom,true)
        this.setState({failResult:false,successResult:false,remainTimeResult:10,status:0,buttonStatus:0,controllerStatus:1, showDialog:false,liveIndex:-1,videoLoading:false,isRecharge:true,beginPlaySound:1})

        fetch(api.machine + '/' + _this.state.machineId+'?roomId='+this.state.roomId, {method: 'GET',headers: Headers(global.jwtToken)})
            .then(res => res.json())
            .then(res => {
                // console.info(api.machine, res)
                if (res.status && res.status !== 200) {
                    throw res
                } else {
                    _this.setState({frontAddressUrl:res.frontAddressUrl,sideAddressUrl:res.sideAddressUrl,roomId:res.roomId,coinType:res.coinType,practice:res.practice})
                    console.info(_this.state.frontAddressUrl)
                }
            }).catch(err => {
            console.info(api.machine, err)
        })

        fetch(api.prefetch, {
            method: 'POST', headers: Headers(global.jwtToken), body: JSON.stringify({machineId: _this.state.machineId})
        })
            .then(res => {
                if(res.status === 200){
                    return res.json()
                }else{
                    return false;
                }
            })
            .then(res => {
                console.info(api.prefetch, res)
                if (res.code) {
                    throw res
                } else {
                    if(res.status === 'SUCCESS'){
                        _this.setState({buttonStatus:1})
                    }else{

                    }
                }
            }).catch(err => {
            console.info(api.prefetch, err)
        })

    }
    /*用户引导评价*/
    guideComment(){
        let _this = this
        storage.load({
            key: 'getDollGuide',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            //修改-->Room界面需要存储时间 按照时间才会弹出来
            console.info(ret)
            let timeDifference = Math.ceil(new Date().getTime() - ret.time)
            if(ret.type === 'wantPlay' && timeDifference > 1000 * 3600 * 24 * 6){
                _this.setState({guidance:true})
            }else if(ret.type === 'giveBad' && timeDifference > 1000 * 3600 * 24 * 15){
                _this.setState({guidance:true})
            }else if(ret.type === 'giveGood' && timeDifference >1000 * 3600 * 24 * 30){
                _this.setState({guidance:true})
            }else{
                console.log("jump->",'进来了')
            }
        }).catch((err)=>{
            console.log("该用户从来没评价过")
            /*该用户从没评价过，这个时候会走到这里来，这个时候*/
            _this.setState({guidance:true})
            throw  err
        })

    }
    /*吐槽*/
    giveBad(){
        this.setState({guidance:false})
        storage.save({
            key: 'getDollGuide',   // Note: Do not use underscore("_") in key!
            data: {type:'giveBad',time:new Date().getTime()},
            expires: null
        });
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'commentFeedback',params:{from:'Room',machineId:this.state.machineId}})
            ]
        })
        this.props.navigation.dispatch(resetAction)
    }
    /*给我好评*/
    giveGood(){
        this.setState({guidance:false,androidList:true})
        let deviceType = Platform.OS
        AppReviewEngine.openReview(deviceType).then((res)=>{
            console.info(res,typeof res)
            console.info('===========')
            let data = JSON.parse(res)
            console.info(data[0].appName)
            console.info('===========')
            this.setState({androidListMap:data})
        }).catch((err)=>{
            console.info(err)
            throw err
        })
        storage.save({
            key: 'getDollGuide',   // Note: Do not use underscore("_") in key!
            data: {type:'giveGood',time:new Date().getTime()},
            expires: null
        });
    }
    /*再玩一会*/
    wantPlay(){
        this.setState({guidance:false})
        storage.save({
            key: 'getDollGuide',   // Note: Do not use underscore("_") in key!
            data: {type:'wantPlay',time:new Date().getTime()},
            expires: null
        });
    }

    toOpenReview(packageName){
        AppReviewEngine.shareAppShop(packageName)
        this.setState({androidList:false})
    }
    toCloseReview(){
        this.setState({androidList:false})
    }

    showToast(meg){
        this.setState({toastInfoShow:true,toastInfo:meg})
        toastTimer = setTimeout(()=>{
            this.setState({toastInfoShow:false})
        },3000)
    }
    socketNoPlay(){
        if(socket) {
            socket.emit('noPlay', {
                userId: global.userId,
                mac: this.state.mac
            }, () => {
                if(socket && socket !== null) {
                    socket.disconnect()
                }
            });
        }
    }
    /*去娃娃攻略*/
    toDollStrategy(){
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            fetch(api.dollStrategyURL+'id=1',{method:'GET',headers: Headers(ret[0])}).then((response) => {
                consoleDebug(JSON.stringify(response))
                if(response.status === 200){
                    return response.json()
                }else{
                    consoleDebug("接口失败")
                }
            }).then((res)=>{
                console.log("娃娃攻略",res)
                clearInterval(roomStatus)
                clearInterval(coinStatus)
                //统计-->查看攻略
                AnalyticsUtil.onEventWithMap("4_3_7",{roomId:this.state.roomId,roomName:this.state.roomName,tabName:this.state.typeName});
                const nav = this.props.navigation
                const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'Webview',params:{url:res.url,from:'Room',result:'gonglve',machineId:this.state.machineId}})
                    ]
                })
                nav.dispatch(resetAction)
            }).catch((e)=>{
                consoleDebug("获取娃娃攻略url失败"+e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    /*与native端交互，看 视频有没有加载成功*/
    _onSelect(event) {
        let entry = event.nativeEvent
        console.log("判断视频的加载程度")
        console.log(entry)
        if (entry != null && entry.playFirstEvent) {
            if(entry.playFirstEvent === 2002) {
              this.setState({hideCamera: false, videoLoading: false})
            } else if(entry.playFirstEvent === 2003) {
              this.setState({hideCamera: true, videoLoading: true})
            }
        }
    }
    //父组件接受子组件的参数，并改变 state
    handleChange(val,msg,level) {
        this.setState({
            getDoll: true,
            getDollUrl:val !== '/0'?val:'http://media.starcandy.cn/doll/doll_defaultavatar.png',
            bChatRoomMsg:msg,
            selectLevel:level
        });
        setTimeout(()=>{
            this.setState({getDoll:false})
        },3000)
    }
    /*从子组件里面拿用户的头像*/
    handleHeadAdd(val){
        let currentHead = this.state.chatRoomList
        let queryMember = this.state.queryMember
        if(currentHead.indexOf(val)>-1){
            return
        }
        let currentMember = (+this.state.chatRoomMembersCount) + (+1)
        this.setState({chatRoomMembersCount:currentMember})
        currentHead.unshift(val)    //随机选取的长度加1
        queryMember.unshift(val)  //总的数组长度加1
        console.log(currentHead)
        if(currentHead.length > 3){
            console.log("数组大于3")
            console.log(currentHead.slice(0,3))         //随机选取的数组里面随机选取 前面三个
            this.setState({chatRoomList:currentHead.slice(0,5),queryMember:queryMember})
        }else{
            this.setState({chatRoomList:currentHead,queryMember:queryMember})
        }

    }
    /*从子组件里面拿用户的头像*/
    handleHeadReduce(val){
        let currentHead = this.state.queryMember
        let currentIndex = currentHead.indexOf(val)
        let currentMember = this.state.chatRoomMembersCount - 1
        console.log(currentHead)
        currentHead.splice(currentIndex,1)
        console.log("减少头像")
        console.log(currentHead)
        this.setState({chatRoomList:currentHead.slice(0,5),chatRoomMembersCount:currentMember})
    }
    /*监听 IM*/
    IMListen(){
        IMEngine.addEventEmitter({
            onMessage: (data) => {
                console.info("onMessage",data)
                let onMessageData
                try {
                    onMessageData = JSON.parse(data.msg)
                    if(onMessageData.groupProperty === 'AVChatRoom') {
                        let listenVariable = onMessageData.msg
                        let level = onMessageData.level
                        console.log("onMessage","listenVariable-->"+listenVariable,typeof listenVariable)
                        if(listenVariable !== undefined && listenVariable.length>0) {
                            this.refs.barrage.offer(listenVariable,level)
                        }
                    }
                    if(onMessageData.groupProperty === 'BChatRoom'){
                        var bMsg
                        if(onMessageData.msg.length > 10){
                            bMsg = onMessageData.msg.substring(0,10)+'...'
                        }else{
                            bMsg = onMessageData.msg
                        }
                        this.handleChange(onMessageData.url,bMsg,onMessageData.level);
                    }
                } catch (e) {
                    console.log("datamsg传来的数据有错误")
                }
            },
            onJoinGroup: (data) => {
                console.info("onJoinGroup",data);
                console.log("onJoinGroup",data.msg);
                if(data !== undefined){
                    let listenVariable = data.msg+"进来了"
                    let level = data.level
                    //判断 1.不是广播大群 2.是当前群组ID
                    console.log("joinGroup",this.state.groupId,global.BChatRoomId)
                    if(data.groupId !== global.BChatRoomId  && data.groupId === this.state.groupId) {
                        this.handleHeadAdd(data.faceUrl)
                        console.log("onJoinGroup","listenVariable-->"+listenVariable,typeof listenVariable)
                        if(listenVariable !== undefined  && listenVariable.length>0) {
                            this.refs.barrage.offer(listenVariable,level)
                        }
                    }
                }
            },
            onQuitGroup: (data) => {
                console.info("onQuitGroup",data);
                if(data !== undefined){
                    let listenVariable = data.msg+"走掉了"
                    let level = data.level
                    //判断 1.不是广播大群 2.是当前群组ID
                    console.log("quitGroup",this.state.groupId,global.BChatRoomId)
                    if(data.groupId !== global.BChatRoomId && data.groupId === this.state.groupId) {
                        this.handleHeadReduce(data.faceUrl)
                        console.log("quitGroup","listenVariable-->"+listenVariable,typeof listenVariable)
                        if(listenVariable !== undefined  && listenVariable.length>0 ) {
                            this.refs.barrage.offer(listenVariable,level)
                        }
                    }
                }
            },
            onGroupAdd: (data) => {
                console.info("onGroupAdd",data);
            },
            onGroupDelete: (data) => {
                console.log("onGroupDelete",data);
            }
        },'room')
    }
    /*长按调用*/
    _handleLeftLong(){
        console.log('长安')
        this.setState({leftIn:1})
        let _this=this;
        _this.setState({
            handleType:1,
        })
        _this._handleLeft()
        console.log('开始长安了')
        _this.playSound(_this.newDeviceMove,true)
    }
    _handleEndSocket(){
        if (this.newDeviceMove !== undefined) {
            this.newDeviceMove.then((res)=>{
                res.stop()
            })
        }
        if(this.state.handleType===1){
            socket.emit('userActionEvent',{userId: this.state.userId,
                action: 5, mac:this.state.mac,userDollId:this.state.userDollId}, res => {
                console.info('stop成功')
            });
        }

    }
    _handleLeftUnLong(){
        this.setState({leftIn:0})
        if(leftLong) clearTimeout(leftLong);
        this._handleEndSocket()
        this.setState({
            handleType:0
        })
    }
    _handleRightLong(){
        let _this=this;
        _this.setState({
            handleType:1,
        })
        _this._handleRight()
        console.log('开始长安了')
        _this.playSound(_this.newDeviceMove,true)
    }
    _handleRightUnLong(){
        this.setState({rightIn:0})
        if(rightLong) clearTimeout(rightLong);
        this._handleEndSocket()
        this.setState({
            handleType:0
        })
    }
    _handleUpLong(){
        let _this=this;
        _this.setState({
            handleType:1,
        })
        _this._handleUp()
        console.log('开始长安了')
        _this.playSound(_this.newDeviceMove,true)
    }
    _handleUpUnLong(){
        this.setState({upIn:0})
        if(upLong) clearTimeout(upLong);
        this._handleEndSocket()
    }
    _handleDownLong(){
        let _this=this;
        _this.setState({
            handleType:1,
        })
        _this._handleDown()
        console.log('开始长安了')
        _this.playSound(_this.newDeviceMove,true)
    }
    _handleUpDownLong(){
        this.setState({downIn:0})
        if(downLong) clearTimeout(downLong);
        this._handleEndSocket()
    }
    /*到达游戏 视频*/
    toGameVideo(result,userId,code){
        let _this = this,url
        clearInterval(roomStatus)
        clearInterval(coinStatus)
        console.log(userId,code)
        //去视频列表webView
        if(userId !== '' && code !== ''){
            //统计-->视频点击
            AnalyticsUtil.onEventWithMap('4_3_4',{typeName:'4_3_4'});
            //url = api.videoUrl+"&name="+code+"&id="+userId
            _this.getWebviewInfo(code,userId,result)
        }else{
            if(result === 'success'){
                //统计-->分享炫耀
                AnalyticsUtil.onEventWithMap("4_3_6_1",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName,status:'分享炫耀'});
            }
            //寻求安慰
            else if(result === 'fail'){
                AnalyticsUtil.onEventWithMap("4_3_6_1",{roomId:_this.state.roomId,roomName:_this.state.roomName,tabName:_this.state.typeName,status:'寻求安慰'})
            }
            //url = api.videoUrl+"&name="+this.state.code+"&id="+this.state.userDollId
            _this.getWebviewInfo(this.state.code,this.state.userDollId,result)
        }
    }
    //to我的成就
    toMyAc(code,userId){
        console.log('跳转')
        clearInterval(roomStatus)
        clearInterval(coinStatus)
        this.props.navigation.navigate('Medal',{codeName:code,nav:'Room',machineId:this.state.machineId,from:'Room'})
        const nav = this.props.navigation
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Medal',params:{url:url,from:'Room',codeName:code,nav:'Room',machineId:this.state.machineId,userId:userId}})
            ]
        })
        nav.dispatch(resetAction)
    }
    noToMyAc(){
        console.log('不跳转')
        return false
    };
    getWebviewInfo(code,id,result){
        let _this = this
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            let url = api.getShareVideo+'name='+code+'&id='+id
            console.log("apiconfig",url)
            fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                console.log("走到这里哈哈哈")
                console.info(response)
                if(response.status !== 200){
                    return
                }else{
                    return response.json()
                }
            }).then((res)=>{
              let param = encodeURIComponent('name='+code+'&id='+id+'&nickName='+res.nickName+'&avatar='+res.avatar+'&dollImage='+res.dollImage+'&videoUrl='+res.videoUrl+'&dollName='+res.dollName+'&dollAmount='+res.dollAmount+'&status='+res.status)
                let url = api.newVideoUrl+param
                console.log("抓取"+url)
                const nav = this.props.navigation
                const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'Webview',params:{url:url,from:'Room',result:result,machineId:this.state.machineId,userDollId:id}})
                    ]
                })
                nav.dispatch(resetAction)
            }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }

    /**
     * 关闭金币不足弹窗
     */
    closeLackOfCoin(){
        //统计-->关闭金币不足弹窗
        AnalyticsUtil.onEventWithMap("4_3_2_1_2",{typeName:'4_3_2_1_2'})
        this.setState({lackofCoin:false})
    }

    /**
     * 关闭如何获取金币弹窗
     */
    closeHowGetCoins(){
        //统计-->关闭如何获取金币弹窗
        AnalyticsUtil.onEventWithMap("4_3_1_3_2",{typeName:'4_3_1_3_2'})
        this.setState({howGetCoins:false})
    }

    /**
     * 邀请好友
     */
    shareFriend(){
        //统计-->邀请好友
        AnalyticsUtil.onEventWithMap("4_3_1_3_1",{typeName:'4_3_1_3_1'})
        let _this = this
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            consoleDebug("当前地址"+api.share)
            console.log(ret[0])
            fetch(api.share, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                }else{
                    return response.json()
                }
            }).then((res)=>{
                console.info(res,'room分享')
                WeChat.isWXAppInstalled().then((isInstalled)=>{
                    if (isInstalled) {
                        WeChat.shareToSession({
                            title:_this.state.name+res.title,
                            description: res.description,
                            thumbImage: res.thumbImage,
                            type: res.type,
                            webpageUrl: res.webpageUrl
                        }).catch((error) => {
                            Alert(error.message);
                        });
                    } else {
                        Alert("您没有安装微信")
                    }
                })
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }

    render(){
        const {status,successResult,failResult,frontAddressUrl,sideAddressUrl,liveIndex,chatRoomList,chatRoomMembersCount,hideCamera,buttonStatus,lackofCoin,lackzuanshi,howGetCoins,level} = this.state
        var modalBackgroundStyle = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
        };
        return(
            <ImageBackground source={mainBG} style={styles.main}>
                {/*引导评价*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.guidance}
                    onRequestClose={()=>{}}>
                    <View style={styles.containerModal}>
                        <View style={styles.updateModal}>
                            <View style={styles.wrapGuide}><Text style={[styles.guidanceContent,{fontWeight:'bold'}]}>小宝贝～如果抓娃娃很开心，就为我评分打call吧～</Text></View>
                            <TouchableWithoutFeedback onPress={this.wantPlay.bind(this)}>
                                <View style={styles.wrapGuide}><Text style={styles.guidanceContent}>再玩一会</Text></View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.giveBad.bind(this)}>
                                <View style={[styles.wrapGuide]}><Text style={styles.guidanceContent}>去吐槽</Text></View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.giveGood.bind(this)}>
                                <View style={[styles.wrapGuide,styles.noBorder]}>
                                    <Image source={give_good} style={styles.giveGoods}/>
                                    <Text style={[styles.guidanceContent,{color:'#1283FF'}]}>给我好评</Text></View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </Modal>
                {/*安卓应用市场列表*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.androidList}
                    onRequestClose={()=>{}}
                >
                    <View style={styles.containerModal}>
                        <View style={styles.updateModal}>
                            {this.state.androidListMap.length>0?this.state.androidListMap.map((item,i)=>{
                                return <TouchableWithoutFeedback onPress={this.toOpenReview.bind(this,item.packageName)}>
                                    <View style={styles.wrapGuide} key={i}><Text style={styles.guidanceContent} >{item.appName}</Text></View>
                                </TouchableWithoutFeedback>
                            }):<View/>}
                            <TouchableWithoutFeedback onPress={this.toCloseReview.bind(this)}>
                                <View style={styles.wrapGuide}>
                                    <Text style={styles.guidanceContent}>取消</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </Modal>
                {/*用户抓取的结果 成功*/}
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={successResult}
                       onRequestClose={()=>{}}>
                    <View style={[styles.container, modalBackgroundStyle]}>
                    <ImageBackground source={layer} style={styles.layer}>
                        <TouchableHighlight style={{ width:'100%'}} onPress={this._closeResultModal.bind(this)}  underlayColor='transparent'>
                        <Image source={cancel} style={styles.cancel}/>
                        </TouchableHighlight>
                        <Image source={success_title} style={styles.success_title}/>
                        <Image source={success} style={[styles.success,styles.successTit]}/>
                        <Image source={success_info} style={styles.tryBtnSuccess}/>
                        {this.state.remainTimeResult === 0 ? <TouchableWithoutFeedback  onPress={()=>{}} underlayColor='transparent'>
                            <Image source={try_btn_disable} style={[styles.tryAgain,styles.successtryAgain]}/>
                        </TouchableWithoutFeedback>: <TouchableWithoutFeedback  onPress={this._playAgain.bind(this)} underlayColor='transparent'>
                            <Image source={try_btn_success} style={[styles.tryAgain,styles.successtryAgain]}/>
                        </TouchableWithoutFeedback>}
                       <Text style={styles.againRemains}>({this.state.remainTimeResult}S)</Text>
                        <TouchableHighlight onPress={this.toGameVideo.bind(this,'success','','')} underlayColor='transparent'>
                        <Image source={share_btn} style={styles.share}/>
                        </TouchableHighlight>
                    </ImageBackground>
                    </View>
                </Modal>
                {/*用户抓取的结果 失败*/}
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={failResult}
                       onRequestClose={()=>{}}>
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={layer} style={styles.layer}>
                            <TouchableHighlight style={{ width:'100%'}}onPress={this._closeResultModal.bind(this)}  underlayColor='transparent'>
                            <Image source={cancel} style={styles.cancel}/>
                            </TouchableHighlight>
                            <Image source={fail_title} style={styles.success}/>
                            <Image source={fail_info} style={styles.tryBtn}/>
                            {this.state.remainTimeResult===0? <TouchableWithoutFeedback onPress={()=>{}} underlayColor='transparent'>
                                <Image source={try_again_disable} style={styles.tryAgain}/>
                            </TouchableWithoutFeedback>:<TouchableWithoutFeedback onPress={this._playAgain.bind(this)} underlayColor='transparent'>
                                <Image source={try_again} style={styles.tryAgain}/>
                            </TouchableWithoutFeedback>}
                             <Text style={styles.againRemain}>({this.state.remainTimeResult}S)</Text>
                            <TouchableHighlight onPress={this.toGameVideo.bind(this,'fail','','')} underlayColor='transparent'>
                            <Image source={no_play} style={styles.share}/>
                            </TouchableHighlight>
                            {/*添加webview 跳转到娃娃攻略 */}
                            <TouchableHighlight onPress={() => {this.toDollStrategy()}} underlayColor='transparent'>
                                <Image source={gonglve} style={styles.gonglve}/>
                            </TouchableHighlight>
                        </ImageBackground>
                    </View>
                </Modal>
                {/*金币不够的情况下的弹窗*/}
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={lackofCoin}
                       onRequestClose={()=>{}}>
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={layer} style={styles.layer}>
                            <TouchableHighlight style={{ width:'100%'}} onPress={this.closeLackOfCoin.bind(this)} underlayColor='transparent'>
                                <Image source={cancel} style={styles.cancel}/>
                            </TouchableHighlight>
                            <Image source={lackcoin} style={styles.lackCoin}/>
                            <Image source={coincontent} style={styles.coinContent}/>
                            <TouchableWithoutFeedback onPress={this.shareFriend.bind(this)}>
                            <Image source={invite_friend} style={styles.toRecharges}/>
                            </TouchableWithoutFeedback>
                        </ImageBackground>
                    </View>
                </Modal>
                {/*钻石不够的情况下的弹窗*/}
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={lackzuanshi}
                       onRequestClose={()=>{}}>
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={layer} style={styles.layer}>
                            <TouchableHighlight style={{ width:'100%'}} onPress={this.closeLackDiamond.bind(this)} underlayColor='transparent'>
                                <Image source={cancel} style={styles.cancel}/>
                            </TouchableHighlight>
                            <Image source={lackzuanshis} style={styles.lackzuanshi}/>
                            <Image source={zuanshicontent} style={styles.zuanshiContent}/>
                            <TouchableWithoutFeedback onPress={this.toRecharge.bind(this)}>
                            <Image source={to_recharge} style={styles.inviteFriends}/>
                            </TouchableWithoutFeedback>
                        </ImageBackground>
                    </View>
                </Modal>
                {/*如何获得金币*/}
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={howGetCoins}
                       onRequestClose={()=>{}}>
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={layer} style={styles.layer}>
                            <TouchableHighlight style={{ width:'100%'}} onPress={this.closeHowGetCoins.bind(this)} underlayColor='transparent'>
                                <Image source={cancel} style={styles.cancel}/>
                            </TouchableHighlight>
                            <Image source={get_coin_title} style={styles.getCoinTtile}/>
                            <Image source={every_coin} style={styles.everyCoinContent}/>
                            <TouchableWithoutFeedback onPress={this.shareFriend.bind(this)}>
                                <Image source={invite_friend} style={styles.inviteFriends}/>
                            </TouchableWithoutFeedback>
                        </ImageBackground>
                    </View>
                </Modal>
                {/*******/}
                <ScrollView>
                    <View style={styles.header}>
                        {/*显示钻石的数量并充值*/}
                        {this.state.isRecharge && !global.iosNoWx?<TouchableWithoutFeedback onPress={this.toRecharge.bind(this)}>
                                <View>
                                    <Image source={zuanshi} style={styles.rechargeZuanshi}/>
                                    <View style={styles.wrapZuanshi}><Text style={styles.coinNum}>{this.state.balance}</Text></View>
                                    <Image source={recharge_add} style={styles.rechargeAdd}/>
                                </View>
                            </TouchableWithoutFeedback>:<View/>}

                        <TouchableHighlight onPress={() => {this.onBackAndroid()}} underlayColor='transparent' style={{position:'absolute',right:scaleSize(24),bottom:0}}>
                            <Image source={back} style={styles.back}/></TouchableHighlight>
                        {/*显示金币的数量*/}
                        {this.state.isRecharge && !global.iosNoWx?
                            <TouchableWithoutFeedback onPress={this.showHowGetCoins.bind(this)}>
                            <View style={{marginRight:scaleSize(43)}}>
                            <Image source={recharge_coin} style={styles.rechargeCoin}/>
                            <View style={styles.wrapCoin}><Text style={styles.coinNum}>{this.state.goldBalance}</Text></View>
                        </View></TouchableWithoutFeedback>:<View/>}
                    </View>
                    <View style={styles.content}>
                        <View style={styles.video}>
                            {/*视频默认加载的图片*/}
                            {!this.state.videoLoading?<Image source={videoLoading} style={styles.videoLoading}/>:<View/>}
                            {/*视频*/}
                            <ILiveView style={styles.liveBox} ref={child => {this.live = child}} liveFirstUrl={frontAddressUrl} liveSecondUrl={sideAddressUrl} liveIndex={liveIndex} onSelect={this._onSelect.bind(this)}/>
                            {/*三二一倒计时*/}
                            {this.state.countDown === 3?<Image style={styles.count} source={three}/>:<View></View>}
                            {this.state.countDown === 2?<Image style={styles.count} source={two}/>:<View></View>}
                            {this.state.countDown === 1?<Image style={styles.count} source={one}/>:<View></View>}

                            {/*弹幕*/}
                            <Barrage ref="barrage"/>
                            {/*上机者的头像*/}
                            {/*{this.state.player !== null?<View style={styles.player}>*/}
                                {/*<View style={styles.playImg}>*/}
                                    {/*<Image source={{uri:this.state.imageIn === '/0' || this.state.imageIn.length === 0?'http://media.starcandy.cn/doll/doll_defaultavatar.png':this.state.imageIn}} style={styles.head}/>*/}
                                {/*</View>*/}
                                {/*<Text numberOfLines={1} style={styles.playerName}>{this.state.playername}</Text>*/}
                            {/*</View>:<View/>}*/}
                            {this.state.player !== null?
                                <TouchableHighlight style={{position:'absolute',width:scaleSize(300),height:scaleSize(300)}} onPress={this.state.userIdPlayer===this.state.playUserId?this.noToMyAc():this.toMyAc.bind(this,'',this.state.playUserId)} underlayColor='transparent'>
                                    <View style={{position:'absolute',width:scaleSize(300),height:scaleSize(300)}}>
                                        <ImageBackground source={level === 1 || level === 2 || level === 3?level1_bg:level === 4 || level === 5?level2_bg:level === 6 || level === 7?level3_bg:level0_bg} style={level === 6 || level === 7 ? styles.levelRoomBg6:styles.levelRoomBg}>
                                            <Image source={{uri:this.state.imageIn === '/0' || this.state.imageIn.length === 0?'http://media.starcandy.cn/doll/doll_defaultavatar.png':this.state.imageIn}} style={styles.levelRoomNickImg}/>
                                            {level === 0 || level === ""?<View/>:<Image source={level === 1?level1:level===2?level2:level === 3?level3:level === 4?level4:level === 5?level5:level === 6?level6:level7} style={{width:scaleSize(33),height:scaleSize(38),position:'absolute',bottom:0,right:0}}/>}
                                        </ImageBackground>
                                        <View style={{width:scaleSize(120),height:scaleSize(40),backgroundColor:'rgba(50,50,50,0.6)',borderRadius:scaleSize(20),alignItems:'center',justifyContent:'center',marginLeft:scaleSize(20),marginTop:scaleSize(15)}}><Text style={{color:'#fff',fontSize:setSpText(24)}}>游戏中</Text></View>
                                    </View>
                                </TouchableHighlight>
                            :<View/>}
                            {/******/}
                            {/*IM 一共有几个人*/}
                            {chatRoomMembersCount <= 0?<Text style={{backgroundColor:'transparent'}}/>:<View style={styles.IMWrap}>
                                <Text style={styles.IMtext}>{chatRoomMembersCount}人</Text>
                                {chatRoomList.length !== 0?chatRoomList.map((item,i)=>{
                                    return (
                                        <Image source={{uri:item === '/0' ||item.length ===0 ?'http://media.starcandy.cn/doll/doll_defaultavatar.png':item}} style={styles.IMHead} key={i}/>
                                    )
                                }):<View></View>}
                            </View>}
                            {/*摄像头*/}
                            {hideCamera?<View style={styles.camerawrap} >
                                <TouchableWithoutFeedback onPress={() => {this._toggleCamera()}} ><Image source={camera} style={styles.camera}/></TouchableWithoutFeedback>
                            </View>:<View/>}
                            {/*倒计时*/}
                            {this.state.status === 1?
                                /*因为自己写的 倒计时的动画在 安卓上不兼容，所以，先暂时屏蔽掉*/
                                Platform.OS === 'ios'?
                                <View style={styles.remainTimeNew}>
                                    <PercentageCircle radius={24.5} percent={this.state.remainTime/30*100} borderWidth={scaleSize(6)} color={"#3498db"} fontSize={setSpText(40)} data={this.state.remainTime}>
                                    </PercentageCircle>
                            </View>:<View style={styles.remainTimeNews}>
                                        <Text style={styles.remainTimeText}>{this.state.remainTime}</Text>
                                    </View>
                                :<View/>}
                        </View>
                    </View>
                    {/*这里是控制按钮的地方*/}
                    {buttonStatus === 0 && status === 0?
                        <View style={styles.wrapBegin}>
                            {this.state.coinType === 'GOLD' ||this.state.coinType === 'ALL' ?<View style={this.state.coinType === 'GOLD'?styles.wrapDotGold:styles.wrapDot}><View style={styles.dot}></View><Text style={styles.dotText}>金币不发货</Text></View>:<View/>}
                            {this.state.coinType === 'GOLD' ||this.state.coinType === 'ALL' ?<ImageBackground source={send_coin_disable} style={styles.sendCoin}>
                                <View style={styles.wrapNum}><Image source={star_disable} style={styles.coin}/><Text style={styles.num}>X</Text><Text style={styles.num}>{this.state.goldCoin}</Text></View>
                            </ImageBackground>:<View/>}
                            {this.state.coinType === 'DIAMOND' ||this.state.coinType === 'ALL'?<ImageBackground source={send_zuanshi_disable} style={styles.sendCoin}>
                                <View style={styles.wrapNum}><Image source={zuanshi_disabled} style={styles.coin}/><Text style={styles.num}>X</Text><Text style={styles.num}>{this.state.coin}</Text></View>
                            </ImageBackground>:<View/>}
                        </View>:
                        status === 0?
                        <View style={styles.wrapBegin}>
                            {this.state.coinType === 'GOLD' ||this.state.coinType === 'ALL' ?<View style={this.state.coinType === 'GOLD'?styles.wrapDotGold:styles.wrapDot}><View style={styles.dot}></View><Text style={styles.dotText}>金币不发货</Text></View>:<View/>}
                            {this.state.coinType === 'GOLD' ||this.state.coinType === 'ALL' ?<TouchableHighlight onPress={() => {this._begin('GOLD')}} underlayColor='transparent' onPressIn={()=>{this.setState({beginIn:1})}} onPressOut={()=>{this.setState({beginIn:0})}}>
                                <ImageBackground source={this.state.beginIn === 0?send_coin:send_coin_in} style={styles.sendCoin}>
                                    <View style={styles.wrapNum}><Image source={coin} style={styles.coin}/><Text style={styles.num}>X</Text><Text style={styles.num}>{this.state.goldCoin}</Text></View>
                                </ImageBackground>
                            </TouchableHighlight>:<View/>}
                            {this.state.coinType === 'DIAMOND' || this.state.coinType === 'ALL'?<TouchableWithoutFeedback onPressIn={()=>{this.setState({zuanshiIn:1})}} onPressOut={()=>{this.setState({zuanshiIn:0})}} onPress={() => {this._begin('DIAMOND')}}>
                                <ImageBackground source={this.state.zuanshiIn === 0?send_zuanshi:send_zuanshi_in}  style={styles.sendCoin}>
                                    <View style={styles.wrapNum}><Image source={zuanshi} style={styles.coin}/><Text style={styles.num}>X</Text><Text style={styles.num}>{this.state.coin}</Text></View>
                                </ImageBackground>
                            </TouchableWithoutFeedback>:<View/>}
                        </View>:
                        <View style={styles.wrapBtn}>
                            {/*onLongPress={this._handleLeftLong.bind(this)}*/}
                            <TouchableHighlight style={[styles.btn,styles.left]} onPress={() => {this._handleLeft()}}     onPressIn={()=>this.setState({leftIn:1})} onPressOut={this._handleLeftUnLong.bind(this)}  underlayColor='transparent'>
                            <Image source={this.state.leftIn === 0?btn_left:btn_left_in} style={[styles.btn]}/>
                            </TouchableHighlight>
                            {/*onLongPress={() => {this._handleRightLong()}} */}
                            <TouchableHighlight style={[styles.btn,styles.right]} onPress={() => {this._handleRight()}} onPressIn={()=>this.setState({rightIn:1})} onPressOut={this._handleRightUnLong.bind(this)} underlayColor='transparent'>
                            <Image source={this.state.rightIn === 0?btn_right:btn_right_in} style={styles.btn}/>
                            </TouchableHighlight>
                            {/*onLongPress={() => {this._handleUpLong()}} */}
                            <TouchableHighlight  style={[styles.btn,styles.up]} onPress={() => {this._handleUp()}}  underlayColor='transparent' onPressIn={()=>this.setState({upIn:1})}  onPressOut={this._handleUpUnLong.bind(this)}>
                            <Image source={this.state.upIn === 0?btn_up:btn_up_in} style={[styles.btn]}/>
                            </TouchableHighlight>
                            {/*onLongPress={() => {this._handleDownLong()}} */}
                            <TouchableHighlight style={[styles.btn,styles.down]} onPress={() => {this._handleDown()}} onPressIn={()=>this.setState({downIn:1})} onPressOut={this._handleUpDownLong.bind(this)} underlayColor='transparent'>
                            <Image source={this.state.downIn === 0?btn_down:btn_down_in} style={[styles.btn]}/>
                            </TouchableHighlight>
                            {this.state.controllerStatus === 0?
                                <TouchableHighlight style={styles.wrshot}  underlayColor='transparent' ><ImageBackground source={btn_shot_disable} style={styles.shot}></ImageBackground></TouchableHighlight>: <TouchableHighlight style={styles.wrshot} onPress={this._handleShot.bind(this)} onPressIn={()=>this.setState({shotIn:1})} onPressOut={()=>this.setState({shotIn:0})} underlayColor='transparent' ><ImageBackground source={this.state.shotIn === 0?shot:shot} style={styles.shot}></ImageBackground></TouchableHighlight>}
                    </View>}
                    {/*这里是娃娃详情的地方*/}
                    {status === 0?
                        <View style={styles.wrapDollList}>
                        <View style={styles.dollList}>
                        <View style={styles.wrapRoom}>
                            <View style={styles.wrapTab}>
                                <View style={styles.wrapTabDetail}>
                                    <View style={this.state.tabIndex ===0?[styles.tabs1,styles.tabActive]:styles.tabs1}><Text style={this.state.tabIndex ===0?styles.fontActiveColor:styles.fontColor}onPress={() => {this._controlTab(0)}}>娃娃详情</Text></View>
                                    <View style={this.state.tabIndex ===1?[styles.tabs1,styles.tabActive]:styles.tabs1}><Text style={this.state.tabIndex ===1?styles.fontActiveColor:styles.fontColor} onPress={() => {this._controlTab(1)}}>最近抓中记录</Text></View>
                                </View>
                            </View>
                        </View>
                            {/*娃娃详情的具体内容*/}
                            {this.state.tabIndex === 0?
                                <View style={{width:'100%'}}>
                                    {this.state.dollScreenshots.length !== 0?this.state.dollScreenshots.map((item, i) => {
                                        return (
                                            <View key={i}>
                                                <Image source={{uri:item}} style={styles.dollDetail}/>
                                            </View>
                                        )
                                    }):<View></View>
                                    }
                                </View>:<View >
                                    {this.state.dollList.length !== 0 && this.state.dollList.map((item, i) => {
                                        let userId='';
                                        return (
                                            <TouchableHighlight onPress={this.toMyAc.bind(this,item.code,userId)} underlayColor='transparent' key={i}>
                                            <View key={i}>
                                                <View style={styles.roomDetail}>
                                                    <View style={styles.roomDetails}>
                                                    {/*<Image style={Platform.OS === 'ios'?styles.dollListIosImg:styles.dollListImg} source={{uri:item.avatar !== '/0' && item.avatar.length>0?item.avatar:'http://media.starcandy.cn/doll/doll_defaultavatar.png'}} />*/}
                                                        <ImageBackground source={item.level === 1 || item.level === 2 || item.level === 3?level1_bg:item.level === 4 || item.level === 5?level2_bg:item.level === 6 || item.level === 7?level3_bg:level0_bg} style={item.level===6||item.level===7?styles.levelDollDetail6:styles.levelDollDetail}>
                                                            <Image source={{uri:item.avatar !== '/0' && item.avatar.length>0?item.avatar:'http://media.starcandy.cn/doll/doll_defaultavatar.png'}} style={item.level===6||item.level===7?styles.levelDollNickImg6:styles.levelDollNickImg}/>
                                                            {item.level === 0?<View/>:<Image source={item.level === 1?level1:item.level===2?level2:item.level === 3?level3:item.level === 4?level4:item.level === 5?level5:item.level === 6?level6:level7} style={{width:scaleSize(20),height:scaleSize(23),position:'absolute',bottom:scaleSize(0),right:scaleSize(0)}}/>}
                                                        </ImageBackground>
                                                    <View style={{flex:1}}>
                                                    <Text style={{backgroundColor:'transparent',fontSize:setSpText(30),color:'#000'}}>{item.nickName}</Text>
                                                    <Text style={{backgroundColor:'transparent',fontSize:setSpText(24),color:'#666'}}>{item.shortTime}</Text>
                                                    </View>
                                                    <View>
                                                        <Image source={detail_video} style={styles.detailVideo}/>
                                                    </View>
                                                </View>
                                                </View>
                                            </View>
                                            </TouchableHighlight>
                                        )
                                    })}
                                </View>}
                        </View></View>:<View/>}
                </ScrollView>
                {/*大喇叭和弹窗的样式*/}
                {this.state.toastInfoShow? <View style={styles.toastinfo}>
                    <Text style={{fontSize:setSpText(24),color:'#fff'}}>{this.state.toastInfo}</Text>
                </View>:<Text style={styles.noTextShow}/>}
                {/*大喇叭 信息*/}
                {this.state.getDoll?<View style={styles.imWrap}>
                    <View style={[styles.imWrapTint,this.state.selectLevel === '0'?styles.border0:this.state.selectLevel === '1' || this.state.selectLevel === '2' || this.state.selectLevel === '3'?styles.border1:this.state.selectLevel === '4' || this.state.selectLevel === '5'?styles.border2:styles.border3]}>
                        <Image source={{uri:this.state.getDollUrl}} style={[styles.imWrapImg,this.state.selectLevel === '0'?styles.border0:this.state.selectLevel === '1' || this.state.selectLevel === '2' || this.state.selectLevel === '3'?styles.border1:this.state.selectLevel === '4' || this.state.selectLevel === '5'?styles.border2:styles.border3]}/>
                        <Text style={this.state.selectLevel === '0'?styles.mineText0:this.state.selectLevel === '1' || this.state.selectLevel === '2' || this.state.selectLevel === '3'?styles.mineText1:this.state.selectLevel === '4' || this.state.selectLevel === '5'?styles.mineText2:styles.mineText3}>{this.state.bChatRoomMsg}</Text>
                    </View>
                </View>:<Text style={styles.noTextShow}/>}
                {this.state.noviceStatus?<View></View>: <TouchableHighlight style={styles.novice} onPress={this.getNoviceRoom.bind(this)}>
                    <View style={styles.novice}>
                        <Image source={novice9} style={styles.noviceImage1}/>
                        <Image source={novice4} style={styles.noviceImage2}/>
                    </View>
                </TouchableHighlight>}
                {this.state.noviceStatus&&this.state.noviceStatus1===false?<TouchableHighlight style={styles.novice} onPress={()=>this.setState({noviceStatus1:true})}>
                    <View style={styles.novice}>
                        <Image source={novice5} style={styles.noviceImage3} />
                        <Image source={novice6} style={styles.noviceImage4} />
                        <Image source={novice7} style={styles.noviceImage5} />
                        <Image source={novice8} style={styles.noviceImage6} />
                    </View>
                </TouchableHighlight>:<View></View>}

            </ImageBackground>
        )
    }
}
const styles = StyleSheet.create({
    main:{
        flex:1,
        paddingTop:ifIphoneX(scaleSize(68),Platform.OS === 'ios'?scaleSize(40):0)
    },
    /*头部区域*/
    header:{
        flex:1,
        height:scaleSize(80),
        paddingLeft:scaleSize(40),
        paddingRight:scaleSize(40),
        flexDirection:'row-reverse',
        position:'relative',
        paddingTop:scaleSize(30),
    },
    /*返回键*/
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
    },
    /*视频加载*/
    content:{
        paddingRight:scaleSize(40),
        paddingLeft:scaleSize(40),
        marginTop:scaleSize(25)
    },
    video:{
        flex:1,
        height:scaleSize(890),
        borderRadius:scaleSize(10),
        borderColor:'#fff',
        borderWidth:scaleSize(10),
        position:'relative'
    },
    /*四个方向键的样式*/
    wrapBtn:{
        flex:1,
        width:'100%',
        position:'relative',
        flexDirection:'row',
        height:scaleSize(300)
    },
    btn:{
        width:scaleSize(156),
        height:scaleSize(154),
        position:'absolute',
    },
    left:{
        left:scaleSize(60),
        top:scaleSize(20)
    },
    right:{
        left:scaleSize(275),
        top:scaleSize(20)
    },
    up:{
        top:scaleSize(-56),
        left:scaleSize(168)
    },
    down:{
        top:scaleSize(100),
        left:scaleSize(168)
    },
    /*点击落抓的时候的样式*/
    shot:{
        width:scaleSize(195),
        height:scaleSize(195),
        justifyContent:'center',
        alignItems:'center'
    },
    wrshot:{
        width:scaleSize(215),
        height:scaleSize(225),
        position:'absolute',
        right:scaleSize(60),
        top:scaleSize(28),
    },
    /*开始玩游戏*/
    wrapBegin:{
        flex:1,
        //paddingLeft:scaleSize(96),
        //paddingRight:scaleSize(96),
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginTop:scaleSize(70)
    },
    beginPlay:{
        width:scaleSize(355),
        height:scaleSize(145),
        justifyContent:'center',
        alignItems:'center'
    },
    coin:{
        width:scaleSize(32),
        height:scaleSize(32),
        position:'relative',
        top:scaleSize(5)
    },
    wrapNum:{
        flexDirection:'row',
        position:'relative',
        top:scaleSize(11),
    },
    num:{
        backgroundColor:'transparent',
        color:'#fff',
        fontSize:setSpText(30),
        marginLeft:scaleSize(13)
    },
    /*娃娃详情样式*/
    wrapDollList:{
        paddingLeft:scaleSize(21),
        paddingRight:scaleSize(21),
    },
    dollList:{
        backgroundColor:'#fff',
        borderRadius:scaleSize(5),
        marginTop:scaleSize(92),
    },
    wrapRoom:{
        flex:1,
        paddingLeft:scaleSize(15),
        paddingRight:scaleSize(15),
    },
    wrapTab:{
        paddingRight:scaleSize(34),
        paddingLeft:scaleSize(34),
        justifyContent:'center',
        marginTop:scaleSize(21.5),
        width:'100%',
        marginBottom:scaleSize(14.5)
    },
    wrapTabDetail:{
        flexDirection:'row',
        borderWidth:scaleSize(1),
        borderColor:'#8AEDFC',
        height:scaleSize(72),
        width:'100%',
        backgroundColor:'#8AEDFC',
        borderRadius:scaleSize(3)
    },
    tabs:{
        backgroundColor:'#fff',
        flex:1,
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        borderBottomRightRadius:scaleSize(3),
        borderTopRightRadius:scaleSize(3)
    },
    tabs1:{
        backgroundColor:'#fff',
        flex:1,
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        borderBottomLeftRadius:scaleSize(3),
        borderTopLeftRadius:scaleSize(3)
    },
    fontColor:{
        color:'#11B0C8'
    },
    fontActiveColor:{
        color:'#fff'
    },
    tabActive:{
        backgroundColor:'#8AEDFC'
    },
    /*上机者的头像*/
    player:{
        width:scaleSize(147),
        height:scaleSize(176),
        borderBottomRightRadius:scaleSize(5),
        backgroundColor:'#fff',
        position:'absolute',
        left:Platform.OS === 'ios'?scaleSize(-3):scaleSize(-1),
        top:scaleSize(-3)
    },
    playImg:{
        width:scaleSize(139),
        height:scaleSize(139),
        borderRadius:scaleSize(5)
    },
    head:{
        width:'100%',
        height:'100%',
        borderRadius:scaleSize(5)
    },
    playerName:{
        fontSize:setSpText(24),
        color:'#000',
        textAlign:'center',
        marginTop:scaleSize(0)
    },
    /*IM 样式 一共有几人在房间*/
    IMWrap:{
        // width:scaleSize(381),
        height:scaleSize(52),
        backgroundColor:'rgba(0,0,0,0.2)',
        borderRadius:scaleSize(24),
        alignItems:'center',
        // justifyContent:'center',
        flexDirection:'row',
        position:'absolute',
        right:scaleSize(15),
        paddingRight:scaleSize(20),
        marginTop:scaleSize(15)
    },
    IMHead:{
        width:scaleSize(46),
        height:scaleSize(46),
        borderRadius:scaleSize(26),
        marginLeft:scaleSize(10)
    },
    IMtext:{
        color:'#fff',
        fontSize:setSpText(24),
        marginLeft:scaleSize(10)
    },
    /*摄像头*/
    camerawrap:{
        width:scaleSize(106),
        height:scaleSize(106),
        backgroundColor:'#fff',
        position:'absolute',
        alignItems:'center',
        justifyContent:'center',
        right:Platform.OS==='ios'?scaleSize(-15): scaleSize(-2),
        borderTopLeftRadius:scaleSize(100),
        borderBottomLeftRadius:scaleSize(100),
        bottom:scaleSize(387)
    },
    camera:{
        width:scaleSize(90),
        height:scaleSize(90),
    },
    /*返回结果的弹层*/
    container: {
        flex: 1,
        alignItems:'center',
        justifyContent:'center'
    },
    layer:{
        width:scaleSize(650),
        height:scaleSize(609),
        position:'relative',
        alignItems:'center',
    },
    success_title:{
        width:scaleSize(337),
        height:scaleSize(157),
        position:'absolute',
        top:scaleSize(-70),
        left:scaleSize(166)
    },
    success:{
        width:scaleSize(171),
        height:scaleSize(40),
    },
    tryBtn:{
        width:scaleSize(397),
        height:scaleSize(30),
        marginTop:scaleSize(24)
    },
    tryBtns:{
        width:scaleSize(207),
        height:scaleSize(30),
        marginTop:scaleSize(24)
    },
    cancel:{
        width:scaleSize(100),
        height:scaleSize(100),
        position:'relative',
        left:scaleSize(555)
    },
    tryAgain:{
        width:scaleSize(252),
        height:scaleSize(91),
        marginTop:scaleSize(45)
    },
    share:{
        width:scaleSize(252),
        height:scaleSize(91),
        marginTop:scaleSize(43)
    },
    /*娃娃攻略*/
    gonglve:{
        width:scaleSize(176),
        height:scaleSize(32),
        marginTop:scaleSize(24)
    },
    /*娃娃详情*/
    roomDetail:{
        paddingLeft:scaleSize(40),
        paddingRight:scaleSize(40),
    },
    roomDetails:{
        flexDirection:'row',
        alignItems:'center',
        height:scaleSize(120),
        borderBottomWidth:scaleSize(0.5),borderBottomColor:'rgb(136,215,227)'
    },
    bottom:{
        width:'94%',
        height:scaleSize(0.5),
        marginLeft:'3%',
        backgroundColor:'rgb(136,215,227)'
    },
    dollListImg:{
        width:scaleSize(58),
        height:scaleSize(58),
        marginRight:scaleSize(20),
        borderRadius:scaleSize(100)
    },
    dollListIosImg:{
        width:scaleSize(58),
        height:scaleSize(58),
        marginRight:scaleSize(20),
        borderRadius:scaleSize(26)
    },
    dollDetail: {
        width: '100%',
        height:(Dimensions.get('window').width-20)*4/3,
    },
    /*大喇叭 和 弹窗的样式*/
    toastinfo:{
        backgroundColor:'rgba(0,0,0,0.4)',
        paddingLeft:'7%',
        paddingRight:'7%',
        height:scaleSize(60),
        borderRadius:scaleSize(30),
        alignItems:'center',
        justifyContent:'center',
        position:'absolute',
        left:'30%',
        top:'50%'
    },
    imImage:{
        width:scaleSize(56),
        height:scaleSize(56),
        borderRadius:scaleSize(56),
    },
    /*弹幕*/
    border0:{
        borderColor:'#FBFBFB'
    },
    border1:{
        borderColor:'#6DDEFF'
    },
    border2:{
        borderColor:'#F981BA'
    },
    border3:{
        borderColor:'#FFCC00'
    },
    imWrap:{
        width:scaleSize(420),
        height:scaleSize(80),
        position:'absolute',
        right:scaleSize(48),
        top:scaleSize(180),
        alignItems:'center',
        paddingLeft:scaleSize(20),
        flexDirection:'row',
        zIndex:50,
    },
    imWrapTint:{
        minWidth:scaleSize(200),
        maxWidth:scaleSize(380),
        height:scaleSize(50),
        borderWidth:scaleSize(2),
        backgroundColor:'#fff',
        borderRadius:scaleSize(29),
        flexDirection:'row',
        alignItems:'center',
    },
    imWrapImg:{
        width:scaleSize(50),
        height:scaleSize(50),
        borderWidth:scaleSize(2),
        borderRadius:scaleSize(50),
        marginLeft:scaleSize(-3)
    },
    mineText0: {
        color: '#323232',
        fontSize: setSpText(30),
    },
    mineText1: {
        color: '#6DDEFF',
        fontSize: setSpText(30),
    },
    mineText2: {
        color: '#F981BA',
        fontSize: setSpText(30),
    },
    mineText3: {
        color: '#F8AF10',
        fontSize: setSpText(30),
    },
    // dropDoll:{
    //     color:'#fff',
    //     marginLeft:scaleSize(10)
    // },
    noTextShow:{
        backgroundColor:'transparent',
        position:'absolute',
        height:0
    },
    liveBox:{
        width:'100%',
        height:'100%',
        position:'absolute',
        left:Platform.OS === 'ios'?scaleSize(-7):scaleSize(-1),
        top:Platform.OS === 'ios'?scaleSize(-7):scaleSize(-0.5)
    },
    /*再来一次剩余时间*/
    againRemain:{
        color:'#fff',
        fontSize:scaleSize(30),
        position:'absolute',
        left:scaleSize(370),
        top:scaleSize(263)
    },
    againRemains:{
        color:'#fff',
        fontSize:scaleSize(30),
        position:'absolute',
        left:scaleSize(370),
        top:scaleSize(286)
    },
    /*抓取剩余时间*/
    remainTimeShot:{
        backgroundColor:'transparent',
        color:'#fff',
        fontSize:setSpText(36),
        marginTop:scaleSize(60)
    },
    /*充值页面*/
    recharge:{
        flexDirection:'row',
        position:'relative',
    },
    chage:{
        flexDirection:'row',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderTopLeftRadius:scaleSize(100),
        borderBottomLeftRadius:scaleSize(100),
        paddingTop:scaleSize(6),
        paddingRight:scaleSize(36),
        paddingBottom:scaleSize(6),
        paddingLeft:scaleSize(6),
        height:scaleSize(60),
        marginTop:scaleSize(6),
        alignItems:'center',
        justifyContent:'center'
    },
    star:{
        width:scaleSize(46),
        height:scaleSize(44),
        position:'relative',
        top:scaleSize(0)
    },
    balanceNum:{
        position:'relative',
        top:scaleSize(-1),
        paddingLeft:scaleSize(10),
        paddingRight:scaleSize(10),
        color:'#fff'
    },
    iconadd:{
        width:scaleSize(72),
        height:scaleSize(72),
        position:'relative',
        left:scaleSize(-36)
    },
    /*倒计时*/
    count:{
        position:'absolute',
        width:scaleSize(130),
        height:scaleSize(200),
        left:'40%',
        top:scaleSize(345)
    },
    successTit:{
        // marginTop:scaleSize(43)
    },
    successtryAgain:{
        marginTop:scaleSize(60)
    },
    /*新版抓取倒计时*/
    remainTimeNew:{
        // width:scaleSize(98),
        // height:scaleSize(98),
        // borderRadius:scaleSize(98),
        // borderWidth:scaleSize(6),
        // borderColor:'#06fffc',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        right:scaleSize(15),
        bottom:scaleSize(15)
    },
    remainTimeNews:{
        width:scaleSize(98),
        height:scaleSize(98),
        borderRadius:scaleSize(98),
        borderWidth:scaleSize(6),
        borderColor:'#06fffc',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        right:scaleSize(15),
        bottom:scaleSize(15)
    },
    remainTimeText:{
        color:'#fff',
        fontWeight:'bold',
        fontSize:setSpText(40),
        position:'relative',
        left:scaleSize(0),
        backgroundColor:'transparent'
    },
    videoLoading:{
        width:'100%',
        height:'100%'
    },
    detailVideo:{
        width:scaleSize(40),
        height:scaleSize(40)
    },
    /*新版本的操作*/
    sendCoin:{
        width:scaleSize(250),
        height:scaleSize(120),
        justifyContent:'center',
        alignItems:'center',
        marginLeft:scaleSize(35),
        marginRight:scaleSize(35)
    },
    wrapDot:{
        flexDirection:'row',
        height:scaleSize(26),
        alignItems:'center',
        position:'absolute',
        top:scaleSize(136),
        left:scaleSize(135),
        width:'100%',
    },
    wrapDotGold:{
        flexDirection:'row',
        height:scaleSize(26),
        alignItems:'center',
        position:'absolute',
        top:scaleSize(136),
        width:'100%',
        justifyContent:'center'
    },
    dot:{
        width:scaleSize(10),
        height:scaleSize(10),
        borderRadius:scaleSize(10),
        backgroundColor:'#1670A8'
    },
    dotText:{
        color:'#1670A8',
        fontSize:setSpText(26),
        marginLeft:scaleSize(9),
        backgroundColor:'transparent'
    },
    /*显示金币的数量*/
    wrapCoin:{
        backgroundColor:'rgba(0,0,0,0.2)',
        paddingRight:scaleSize(14),
        paddingLeft:scaleSize(63),
        height:scaleSize(46),
        justifyContent:'center',
        borderRadius:scaleSize(23)
    },
    coinNum:{
        color:'#fff',
        fontSize:setSpText(36)
    },
    rechargeCoin:{
        width:scaleSize(52),
        height:scaleSize(50),
        position:'absolute',
        zIndex:2,
        top:scaleSize(-2)
    },
    wrapZuanshi:{
        paddingLeft:scaleSize(58),
        paddingRight:scaleSize(47),
        backgroundColor:'rgba(0,0,0,0.2)',
        height:scaleSize(46),
        justifyContent:'center',
        marginLeft:scaleSize(4),
        borderRadius:scaleSize(23)
    },
    rechargeZuanshi:{
        width:scaleSize(48),
        height:scaleSize(47),
        position:'absolute',
        zIndex:2,
        top:scaleSize(-4)
    },
    rechargeAdd:{
        width:scaleSize(35.2),
        height:scaleSize(35.2),
        position:'absolute',
        right:scaleSize(4),
        top:scaleSize(4)
    },
    tryBtnSuccess:{
        width:scaleSize(197),
        height:scaleSize(31),
        marginTop:scaleSize(33)
    },
    lackCoin:{
        width:scaleSize(216),
        height:scaleSize(42),
    },
    coinContent:{
        width:scaleSize(351),
        height:scaleSize(118),
        marginTop:scaleSize(44)
    },
    inviteFriends:{
        width:scaleSize(256),
        height:scaleSize(91),
        marginTop:scaleSize(90)
    },
    lackzuanshi:{
        width:scaleSize(218),
        height:scaleSize(42),
        marginTop:scaleSize(20)
    },
    zuanshiContent:{
        width:scaleSize(285),
        height:scaleSize(75),
        marginTop:scaleSize(44)
    },
    toRecharges:{
        width:scaleSize(256),
        height:scaleSize(91),
        marginTop:scaleSize(90)
    },
    /*如何获得金币*/
    getCoinTtile:{
        width:scaleSize(284),
        height:scaleSize(40),
    },
    everyCoinContent:{
        width:scaleSize(220),
        height:scaleSize(118),
        marginTop:scaleSize(45)
    },
    /*评价的弹窗*/
    containerModal:{
        flex: 1,
        padding: scaleSize(40),
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(0, 0, 0, 0.5)',
        paddingLeft:scaleSize(80),
        paddingRight:scaleSize(80)
    },
    updateModal:{
        width:'100%',
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:scaleSize(20)
    },
    guidanceContent:{
        textAlign:'center',
        color:'#000',
        fontSize:scaleSize(36),
    },
    wrapGuide:{
        minHeight:scaleSize(30),
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        paddingLeft:scaleSize(40),
        paddingRight:scaleSize(40),
        paddingTop:scaleSize(20),
        paddingBottom:scaleSize(20),
        borderBottomWidth:scaleSize(1),
        borderBottomColor:'#e1e2e3',
        flexDirection:'row'
    },
    noBorder:{
        borderBottomWidth:0,
    },
    giveGoods:{
        width:scaleSize(45),
        height:scaleSize(44),
        position:'absolute',
        left:scaleSize(160)
    },
    levelRoomBg:{
        width:scaleSize(140),
        height:scaleSize(146),
        alignItems:'center',
        justifyContent:'center',
        left:scaleSize(10),
        top:scaleSize(10)
    },
    levelRoomBg6:{
        width:scaleSize(140),
        height:scaleSize(160),
        alignItems:'center',
        justifyContent:'center',
        left:scaleSize(10),
        top:scaleSize(10)
    },
    levelRoomNickImg:{
        width:scaleSize(120),
        height:scaleSize(120),
        borderRadius:scaleSize(60),
        marginTop:scaleSize(10),
    },
    levelDollDetail:{
        width:scaleSize(68),
        height:scaleSize(72),
        alignItems:'center',
        justifyContent:'center',
        marginRight:scaleSize(20),
    },
    levelDollDetail6:{
        width:scaleSize(70),
        height:scaleSize(76),
        alignItems:'center',
        justifyContent:'center',
        marginRight:scaleSize(20),
    },
    levelDollNickImg:{
        width:scaleSize(52),
        height:scaleSize(55),
        borderRadius:scaleSize(27),
        marginTop:scaleSize(5)
    },
    levelDollNickImg6:{
        width:scaleSize(54),
        height:scaleSize(54),
        borderRadius:scaleSize(27),
        marginTop:scaleSize(6),
    },
    novice:{
        width:null,
        height:null,
        flex:1,
        position:'absolute',
        left:0,
        top:0,
        bottom:0,
        right:0,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    noviceImage1:{
        width:scaleSize(510),
        height:scaleSize(250),
        position:'absolute',
        top:scaleSize(20),
        right:scaleSize(60)
    },
    noviceImage2:{
        width:scaleSize(610),
        height:scaleSize(346),
        position:'absolute',
        bottom:scaleSize(80),
        left:scaleSize(100)
    },
    noviceImage3:{
        width:scaleSize(325),
        height:scaleSize(226),
        position:'absolute',
        top:'28%',
        right:scaleSize(60)
    },
    noviceImage4:{
        width:scaleSize(354),
        height:scaleSize(335),
        position:'absolute',
        bottom:'4%',
        right:scaleSize(60)
    },
    noviceImage5:{
        width:scaleSize(230),
        height:scaleSize(290),
        position:'absolute',
        bottom:'25%',
        right:scaleSize(60)
    },
    noviceImage6:{
        width:scaleSize(370),
        height:scaleSize(455),
        position:'absolute',
        bottom:'2%',
        left:scaleSize(60)
    }
})