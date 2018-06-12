import React from 'react'
import {ImageBackground, View, Image, StyleSheet, TouchableHighlight,Text,Platform,ScrollView,BackHandler,Modal,Dimensions,Linking,InteractionManager,SectionList,TouchableWithoutFeedback} from 'react-native'
import Carousel from 'react-native-carousel'  //轮播图的插件
import layer from '../../resource/first-login-bg.png'
import {api} from '../../common/api.config'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import get_coin from '../../resource/asign.png'
import { NavigationActions} from 'react-navigation'
import logo from '../../resource/logo.png'
import IMEngine from '../../components/IMEngine'
import AnalyticsUtil from '../../components/AnalyticsUtil'
import {consoleDebug} from '../../common/tool'
import Getui from 'react-native-getui'
import DataList from '../../components/DataList'
import UpdateEngine from '../../components/UpdateEngine'
import headerpng from '../../resource/header.png'
import cancel from '../../resource/x.png'
import qiandao_title from '../../resource/qiandao-title.png'
import firstLoginWeek from '../../resource/firstLoginWeek.png'
import week_1 from '../../resource/1.png'
import alreadyGet from '../../resource/alreadyGet.png'
import zuanshi from '../../resource/zuanshi-room.png'
import jinbi from '../../resource/recharge-coin.png'
import week_2 from '../../resource/week-2.png'
import week_3 from '../../resource/week-3.png'
import week_4 from '../../resource/week-4.png'
import week_5 from '../../resource/week-5.png'
import week_6 from '../../resource/week-6.png'
import week_7 from '../../resource/week-7.png'
import novice1 from '../../resource/novice-1.png';
import novice2 from '../../resource/novice-2.png';
import novice3 from '../../resource/novice-3.png';
import message_icon from '../../resource/message-icon.png'
import DevicesEngine from '../../components/DevicesEngine'
import Footer from '../../components/footer'
import Headers from '../../common/fetch_header'
var isMounted = 0
export default class Home extends React.Component {
    constructor(props){
        super(props)
        const params = this.props.navigation.state.params
        console.info(params)
        this.state = {
            carousel: [],
            touchLock:false,
            avatarUri:"http://media.starcandy.cn/doll/doll_defaultavatar.png",
            lastBackPressed:0,
            firstLogin:false,
            coin:0,
            imei:'',
            groupId:'',    //群主的ID
            getDollUrl:'http://media.starcandy.cn/doll/doll_defaultavatar.png',
            bChatRoomMsg:'',    //广播大群msg
            getDoll:false,
            clientId:'',   //个推的id
            getCoinLock:true,
            signDays:0,    // 登录的天数
            singArray:[1,2,3,4,5,6,7],
            alreadySign:0,          //该用户已经签到的天数
            type:params!== undefined && params.type && params.type.type?params.type.type:0,
            tabList:[{id:0,name:'全部'}],
            update:false ,   //检测是否有更新
            title:'',       //强制更新弹窗
            content:'' ,             //强制更新内容
            forced:'NO',            //No的话，代表不进行强制更新
            appstore:false,      //判断是否是ios，去跳转到appstore
            latestVerCode:0,      // 从服务器拿到最新的versionCode
            updateApkShow:false,
            scrollY:0,
            selectFooterTab:0,
            typeName:'全部',     //选中的顶部tab的名称
            messageToast:false ,   //弹出消息提醒的弹窗
            messageInfo:[],       //弹出消息的全部内容
            read:true,  //用户是否有已读或未读消息，true表示已读，false表示未读
            selectLevel:0,
            joinTime:0,//进入页面的时间
            quitTime:0,//退出页面的时间
            noviceStatus:true,//新手引导
        }
        this.isFirstLogin = this.isFirstLogin.bind(this)
        this.showToast = this.showToast.bind(this)   //自己改写的toast
        this.toWebView = this.toWebView.bind(this)
        this.listenIM = this.listenIM.bind(this)
        this.listenProcess = this.listenProcess.bind(this)
        this.scrollFromRoom = this.scrollFromRoom.bind(this) //绑定 滚动事件
    }
    componentWillMount() {
        this.state.joinTime = new Date().getTime()
        consoleDebug("开始监听IMEI")
        //统计-->进入首页
        AnalyticsUtil.onEventWithMap('4',{typeName:'4'});
        isMounted = 1
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
        this.listenIM()
        this.listenProcess()
        /* 获取 clientID 个推*/
        this.getClientId()
        this.toGetMessageToast() //获得消息的弹窗
        this.getIsRead() //判断 是否有未读消息
        if(global.scrollY !== undefined) {
            setTimeout(() => {
                this.scrollFromRoom()
            }, 500)
        }
    //    新手引导存储
        let _this=this;
        storage.load({
            key: 'getNovice',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((res)=>{
            if(res.type==='noviceType'){
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
    }
    onBackAndroid = () => {
        let _this = this
        if(_this.state.lastBackPressed !== 0 && _this.state.lastBackPressed + 2000 >= new Date().getTime()){
            BackHandler.exitApp()
        }
        _this.setState({lastBackPressed:new Date().getTime()});
        _this.showToast("再按一次退出应用")
        return true
    }
    /*监听 IM  大喇叭的 信息*/
    listenIM(){
        let _this = this
        IMEngine.addEventEmitter({
            onMessage: (data) => {
                let onMessageData = JSON.parse(data.msg)
                /*BChatRoom  代表  大喇叭 还有一个叫做 AVChatRoom 这个代表弹幕*/
                if(onMessageData.groupProperty === 'BChatRoom'){
                    var bMsg
                    if(onMessageData.msg.length > 10){
                        bMsg = onMessageData.msg.substring(0,10)+'...'
                    }else{
                        bMsg = onMessageData.msg
                    }
                    _this.setState({getDoll:true,getDollUrl:onMessageData.url !== '/0'?onMessageData.url:'http://media.starcandy.cn/doll/doll_defaultavatar.png',bChatRoomMsg:bMsg,selectLevel:onMessageData.level})
                }
                 setTimeout(()=>{
                            _this.setState({getDoll:false})
               },3000)
                 console.log("监听事件")
            }
        },'home')
    }
    /*监听 下载 强制更新 apk  的进程 ，有完成，正在下载，下载失败*/
    listenProcess(){
        console.log("准备启动监听")
        UpdateEngine.addEventEmitter({
            onDownloadSuccess: (data) => {
                console.log("onDownloadSuccess")
                console.info(data)
                global.updateStatus = 'success'
            },
            onDownloading: (data) => {
                console.log("onDownloading")
                console.info(data)
                global.updateStatus = 'loading'
            },
            onDownloadFailed: (data) => {
                console.log("onDownloadFailed")
                console.info(data)
                global.updateStatus = 'fail'
            }
        })
    }
    componentDidMount() {
        // InteractionManager.runAfterInteractions(() => {
        //     console.log( this.myScroll,global.scrollY)
        //     this.myScroll.scrollTo({x:0,y:330});
        //     console.log("called DidMount");
        // })
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
            consoleDebug(ret)
            global.jwtToken = ret[0]
            global.userId = ret[1]
            /*获取TAB 栏*/
            console.log("获取tab栏")
            console.log(Headers(ret[0]))
            fetch(api.tabList, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                }else{
                    return response.json()
                }
            }).then((res)=>{
                console.info("tabxxx")
                console.info(res.content)
                if(res.content.length === 0){

                }else{
                    _this.setState({tabList:[..._this.state.tabList,...res.content]})
                }
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
            fetch(api.carousel, {method: 'GET',headers: Headers(ret[0])}).then(res => res.json())
                .then(res=>{
                    console.info(api.carousel,res)
                    if(res.status && res.status !== 200){
                        throw res
                    }else{
                        _this.setState({carousel:res})
                    }
                }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
        })
        _this.isFirstLogin()
        _this.InitDevicesEngine().then(()=>{
            _this.updateApp()   //判断强制更新
            _this.getCurrentImage() //获取当前头像
        })
    }
    /*领取金币*/
    getCoin(){
        let _this = this
        if(!_this.state.getCoinLock){
            return
        }
        _this.setState({getCoinLock:false})
        //统计-->点击签到
        AnalyticsUtil.onEventWithMap('3',{typeName:'3'});
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            fetch(api.getCoin,{method:'PUT',headers: Headers(ret[0])}).then((response) => {
                _this.setState({firstLogin:false})
                consoleDebug(JSON.stringify(response))
                _this.setState({getCoinLock:true})
                if(response.status === 200){
                    _this.setState({alreadySign:_this.state.alreadySign++})
                    return response.json()
                }else{
                    this.showToast('领取失败')
                    return
                }
            }).then((res)=>{
                consoleDebug(JSON.stringify(res))
                if(res.dailySignStatus === 'YES'){
                    _this.setState({firstLogin:false})
                    this.showToast('领取成功')
                }else{
                    this.showToast('领取失败')
                }
            }).catch((e)=>{
                _this.setState({firstLogin:false,getCoinLock:true})
                this.showToast('领取失败')
                consoleDebug("领取失败"+e)
            })
        }).catch((e)=>{
            _this.setState({firstLogin:false,getCoinLock:true})
            consoleDebug("获取数据失败")
            throw e
        })
    }
    /*判断当前用户是否是第一次登录，并且，每日配置金额大于0*/
    isFirstLogin(){
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
            consoleDebug(api.firstLogin,ret[0])
            fetch(api.firstLogin,{method:'GET',headers: Headers(ret[0])}).then((response) => {
                consoleDebug(JSON.stringify(response))
                if(response.status === 200){
                    return response.json()
                }else{
                    _this.setState({firstLogin:false})
                }
            }).then((res)=>{
                consoleDebug(JSON.stringify(res))
                /*如果 连续签到 大于7 ，前台 展示从1 重新开始，这个不用前台操心，，后台自己做判断并显示*/
                if(res.dailySignStatus === 'NO'){
                    _this.setState({firstLogin:true,singArray:res.configResponseList,signDays:res.signDays+1 === 8?1:res.signDays+1,alreadySign:res.signDays === 7?0:res.signDays})
                }
            }).catch((e)=>{
                consoleDebug("是否是第一次登录获取失败"+e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    componentWillUnmount(){
        this.state.quitTime = new Date().getTime()
        let stayTime = Math.ceil((this.state.quitTime  - this.state.joinTime) / 1000)
        //统计-->首页停留时间
        AnalyticsUtil.onEventWithMap("4_1_1",{stayTime:stayTime})
        isMounted = 0
        IMEngine.removeEventEmitter('home')
    }
    showToast(meg){
        if(isMounted === 1) {
            this.setState({toastInfoShow: true, toastInfo: meg})
            setTimeout(() => {
                this.setState({toastInfoShow: false})
            }, 3000)
        }
    }
    /*跳转到 webView页面*/
    toWebView(url){
        if(url === null || url.length === 0 ){
            return
        }else {
            this.props.navigation.navigate('Webview',{url:url,from:'Home'})
        }
    }
    /*获取个推的clientId*/
    getClientId(){
        Getui.clientId((param)=>{
            console.info('clientID'+param)
            this.setState({clientId: param})
        })
    }
    showDataList(type,typeName){
        //统计-->切换Tab
        AnalyticsUtil.onEventWithMap("4_4",{tabId:type,tabName:typeName});
        this.setState({type:type,typeName:typeName})
    }
    /*获取强制更新的URL*/
    updateApp(){
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            let type =Platform.OS.toUpperCase() ,versionCode = global.versioncode ,channel=global.channel
            let url = api.updateApp+'?type='+type+'&versionCode='+versionCode +'&channel='+channel
            console.log(url)
            fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                console.info('updateApp',response)
                if(response.status !== 200){

                }else{
                    return response.json()
                }
            }).then((res)=>{
               console.info('updateApp',res)
                if(res !== undefined && res.versionCode>global.versioncode && global.updateStatus !== 'loading') {
                   if(res.forced === 'YES'){
                       this.setState({update:true,forced:res.forced,title :res.title ,content:res.content,downloadUrl:res.downloadUrl,latestVerCode:res.versionCode})
                   }else{
                       if (res.notice === 'YES') {
                           this.setState({forced:res.forced,title :res.title ,content:res.content,downloadUrl:res.downloadUrl,latestVerCode:res.versionCode})
                           storage.load({
                               key: 'updateInfo',
                           }).then((ret)=>{
                               console.log("ret",ret,ret[0],res.versionCode,typeof ret[0],typeof res.versionCode)
                               if(res.versionCode !== ret[0] ){
                                   this.setState({update:true})
                               }else if(ret[1] && res.versionCode === ret[0]){
                                   console.log("进入到这里")
                                   this.setState({update:false})
                               }
                           }).catch((e)=>{
                               console.log("updateInfo数据获取失败")
                               this.setState({update:true})
                           })
                       }
                   }
                }
            }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    /*下载 apk*/
    toDownLoad(){
        this.setState({update:false})
        if(Platform.OS === 'ios'){
            this.setState({appstore:true})
        }else{
            /*调用安卓下载并更新app*/
            if(this.state.downloadUrl.length > 0 ) {
                this.setState({updateApkShow:true})
                UpdateEngine.downLoadFile({url:this.state.downloadUrl})
                setTimeout(()=>{
                    this.setState({updateApkShow:false})
                },3000)
            }

        }
    }
    toAppStore(){
        Linking.openURL('itms-apps://');
        this.setState({appstore:false})
    }
    /*获取当前的 Image*/
    getCurrentImage(){
        let _this = this
        let url = api.userInfo +'?'+'imei='+global.devicesId+'&code='+global.versioncode+'&ver='+global.version+"&channel="+global.channel
        fetch(url, {method: 'GET',headers: Headers(global.jwtToken)}).then(res => res.json())
            .then(res=>{
                console.info(url,res)
                if(res.status && res.status !== 200){
                    throw res
                }else{
                    console.info(res)
                    _this.setState({avatarUri:res.image})
                    return res
                }
            }).then((res)=>{
            global.userId = res.id
            let username = res.identifier
            let sessionkey = res.privateKey
            let bchatRoomId = res.bchatRoomId
            global.BChatRoomId = bchatRoomId
            if(username !==  null && username !==  undefined && sessionkey !== undefined && sessionkey !== null ) {
                IMEngine.login(username, sessionkey).then((res) => {
                    consoleDebug("login finished", bchatRoomId)
                    global.BChatRoomId = bchatRoomId
                    IMEngine.joinGroup(bchatRoomId)
                    // this.listenIM()
                })
            }
            /*个推 获取client 和 绑定别名 和 上传*/
            Getui.bindAlias(res.id.toString())
            if (_this.state.clientId !== '') {
                let param = {clientId: _this.state.clientId}
                fetch(api.getui, {method: 'POST',
                    headers: Headers(global.jwtToken),
                    body: JSON.stringify(param)
                }).then((response) => {
                    return response.json()
                }).catch((e) => {
                    consoleDebug("失败" + e)
                })
            }
        }).catch((e) => {
            consoleDebug("失败" + e)
        })
    }
    /*用户点击取消的时候，重新set Storage信息*/
    resetUpdateInfo(){
        this.setState({update:false})
        storage.remove({
            key: 'updateInfo'
        }).then(()=>{
            storage.save({
                key: 'updateInfo',   // Note: Do not use underscore("_") in key!
                data: [this.state.latestVerCode,true],
            });
        })

    }
    /*获取滑动状态*/
    changeScroll(e){
        let scrollY = e.nativeEvent.contentOffset.y
        this.setState({scrollY:scrollY})
        global.scrollY = scrollY
    }
    /*初始化DevicesEngine 并且将版本号渠道号 等等通通挂载到global上 DevicesEngine 是native里面的方法，前端只是调用*/
    InitDevicesEngine(){
        console.info("InitDevicesEngine")
        return DevicesEngine.getDevicesInfo('get').then((res)=>{
            try {
                let resJson = JSON.parse(res);
                global.versioncode = resJson.versionCode
                global.version = resJson.versionName
                global.channel = resJson.channel
                global.devicesId = resJson.devicesId
                console.log("InitDevicesEngine " + res,typeof res)
            }catch(error){
                console.log("InitDevicesEngineError " + error)
            }

        })
    }
    toMessageInfo(){
        //统计-->消息中心
        AnalyticsUtil.onEventWithMap("7_1",{typeName:'7_1'})
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'messageInfo'})
            ]
        })
        this.props.navigation.dispatch(resetAction)
        return true
    }
    /*  获得消息推送的弹窗  */
     toGetMessageToast(){
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
             let url = api.userMessagePop
             console.log("获得消息推送的弹窗")
             fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                 console.info("ssssss",response)
                 if(response.status !== 200){
                     return
                 }else{
                     return response.json()
                 }
             }).then((res)=>{
                 consoleDebug(JSON.stringify(res)+"成功")
                 if(res.length >0){
                     _this.setState({messageToast:true,messageInfo:res})
                 }
             }).catch((e) => {
                 consoleDebug("失败" + e)
             })
         }).catch((e)=>{
             consoleDebug("获取数据失败")
             throw e
         })
     }
    deleteMessageInfo(id){
         console.log("点击确定")
         /*点击确定的时候，调用后台的接口，标志着这条信息是已读的*/
         let url = api.updateMessage +'/'+id
        console.log(url)
        fetch(url, {method: 'GET',headers: Headers(global.jwtToken)}).then((response) => {
             console.info(response)
            if(response.status !== 200){
                return
            }else{
                return response.json()
            }
        }).then((res)=>{
             console.log("成功 将这条信息标志成已读")
            console.info('eeee',res)
            if(this.state.messageInfo.length>1){
                let current = this.state.messageInfo
                current.splice(current.indexOf(id),1)
                this.setState({messageInfo:current})
            }else{
                this.setState({messageToast:false})
            }
        }).catch((e) => {
            consoleDebug("失败" + e)
        })
    }
    /*判断是否有 已读 未读 的消息*/
    getIsRead(){
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
            let url = api.messageRead
            fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    return
                }else{
                    return response.json()
                }
            }).then((res)=>{
                consoleDebug(JSON.stringify(res)+"成功")
                _this.setState({read:res.read})
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    scrollFromRoom(){
        // InteractionManager.runAfterInteractions(() => {
        //     this._scrollView.scrollTo({y:global.scrollY});
        //     console.log("called DidMount");
        // })
        if(this._scrollView && this._scrollView !== undefined) {
            this._scrollView.scrollTo({y: global.scrollY});
        }
    }
    //新手引导
    getNovice(){
        this.setState({
            noviceStatus:true
        })
        storage.save({
            key: 'getNovice',   // Note: Do not use underscore("_") in key!
            data: {type:'noviceType'},
            expires: null
        })
    }
    render() {
        let state = this.state
        var modalBackgroundStyle = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
        };
        return (
            <View>
                {this.state.toastInfoShow? <View style={styles.toastinfo}>
                    <Text style={{fontSize:setSpText(24),color:'#fff'}}>{state.toastInfo}</Text>
                </View>:<Text style={styles.noTextShow}/>}
                {/*首页的大喇叭 的样式*/}
                {this.state.getDoll?
                    <View style={styles.imWrap}>
                    <View style={[styles.imWrapTint,state.selectLevel === '0'?styles.border0:state.selectLevel === '1' || state.selectLevel === '2' || state.selectLevel === '3'?styles.border1:state.selectLevel === '4' || state.selectLevel === '5'?styles.border2:styles.border3]}>
                    <Text style={state.selectLevel === '0'?styles.mineText0:state.selectLevel === '1' || state.selectLevel === '2' || state.selectLevel === '3'?styles.mineText1:state.selectLevel === '4' || state.selectLevel === '5'?styles.mineText2:styles.mineText3}>{this.state.bChatRoomMsg}</Text>
                    </View>
                        <Image source={{uri:this.state.getDollUrl}} style={[styles.imImage,state.selectLevel === '0'?styles.border0:state.selectLevel === '1' || state.selectLevel === '2' || state.selectLevel === '3'?styles.border1:state.selectLevel === '4' || state.selectLevel === '5'?styles.border2:styles.border3]}/>
                    </View>:<Text style={styles.noTextShow}/>}
                {/********************/}
                {this.state.updateApkShow? <View style={styles.toastinfoAPK}>
                    <Text style={{fontSize:setSpText(24),color:'#fff'}}>开始下载APK</Text>
                </View>:<Text style={styles.noTextShow}/>}
                {/*<Image source={mainBg} style={styles.mainBg}/>*/}
                {/*强制更新弹窗*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.update}
                    onRequestClose={()=>{}}
                >
                    <View style={styles.containerModal}>
                        <View style={styles.updateModal}>
                            <View><Text style={styles.updateContent}>{this.state.title}</Text></View>
                            <View><Text style={styles.updateContent}>{this.state.content}</Text></View>
                            {this.state.forced === 'NO'? <View style={styles.updateButton}><Text style={[styles.textButton,{borderRightColor:'rgba(174,174,174,0.4)',borderRightWidth:scaleSize(1)}]} onPress={this.toDownLoad.bind(this)}>更新</Text><Text style={styles.textButton} onPress={this.resetUpdateInfo.bind(this)}>取消</Text></View>:
                                <View style={styles.updateButton}>
                                    <Text style={styles.textButton} onPress={this.toDownLoad.bind(this)}>更新</Text>
                                </View>
                            }
                        </View>
                    </View>
                </Modal>
                {/* 跳往appStore*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.appstore}
                    onRequestClose={()=>{}}
                >
                    <View style={styles.containerModal}>
                        <View style={styles.updateModal}>
                            <View><Text style={styles.updateContent}>"轻松抓娃娃"想要打开您的appStore</Text></View>
                            <View style={styles.updateButton}><Text style={[styles.textButton,{borderRightColor:'rgba(174,174,174,0.4)',borderRightWidth:scaleSize(1)}]} onPress={()=>{this.setState({appstore:false})}}>取消</Text><Text style={styles.textButton} onPress={this.toAppStore.bind(this)}>确定</Text></View>
                        </View>
                    </View>
                </Modal>
                {/*每日首次登录弹窗*/}
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={this.state.firstLogin}
                       onRequestClose={()=>{}}>
                    <View style={[styles.firstContainer, modalBackgroundStyle]}>
                        <ImageBackground source={layer} style={styles.exchange_success}>
                            <TouchableWithoutFeedback onPress={()=>{this.setState({firstLogin:false})}}>
                            <Image source={cancel} style={styles.cancelFirst}/>
                            </TouchableWithoutFeedback>
                            <Image source={qiandao_title} style={styles.qiandaoTitle}/>
                            <Text style={styles.signNum}>第<Text style={styles.Num}>{state.signDays}</Text>天签到</Text>
                            {state.singArray.map((item,i)=>{
                                return  <ImageBackground source={firstLoginWeek} style={styles.weekBG} key={i}>
                                        {i<state.alreadySign?<Image source={alreadyGet} style={styles.alreadyGet}/>:<View/>}
                                    <Image source={i===0?week_1:i===1?week_2:i===2?week_3:i===3?week_4:i===4?week_5:i===5?week_6:week_7} style={styles.weekStar}/>
                                    <View style={styles.wrapFristBg}>
                                        <View style={styles.wrapStar}>
                                            <Image source={jinbi} style={styles.signCoin}/><Text style={styles.signCoinText}>X</Text><Text style={styles.signCoinText}>{item.goldCoin}</Text>
                                        </View>
                                        <View style={styles.wrapStar}>
                                            <Image source={zuanshi} style={styles.signCoin}/><Text style={styles.signCoinText}>X</Text><Text style={styles.signCoinText}>{item.coin}</Text>
                                        </View>
                                    </View>
                                </ImageBackground>
                            })}

                            <TouchableHighlight onPress={this.getCoin.bind(this)} underlayColor='transparent'>
                            <Image source={get_coin} style={styles.confirm}/>
                            </TouchableHighlight>
                        </ImageBackground>
                    </View>
                </Modal>
                {/*推出消息提醒的弹窗*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.messageToast}
                    onRequestClose={()=>{}}
                >
                    <View style={styles.containerModal}>
                        {this.state.messageInfo && this.state.messageInfo.length>0?this.state.messageInfo.map((item,i)=>{
                           return <View style={styles.messageInfoModal} key={i}>
                                <View><Text style={styles.updateContent}>{item.title}</Text></View>
                                <View><Text style={styles.updateContent}>{item.content}</Text></View>
                                <View style={styles.updateButton}><Text style={styles.textButton} onPress={this.deleteMessageInfo.bind(this,item.id)}>确定</Text></View>
                            </View>
                        }):<View/>}
                    </View>
                </Modal>
                {/***************************/}
                    <View style={{width:'100%',backgroundColor:'#66daee'}} >
                    <View style={styles.header}>
                    <View style={styles.wrapLogo}><Image source={logo} style={styles.title}/></View>
                        <TouchableWithoutFeedback onPress={this.toMessageInfo.bind(this)}>
                                <Image source={message_icon} style={styles.messageIcon}/>
                        </TouchableWithoutFeedback>
                        {this.state.read?<View style={styles.noRead}></View>:<View/>}
                    </View>
                    </View>
                <ScrollView  onScroll={this.changeScroll.bind(this)} stickyHeaderIndices={[1]} style={styles.wrapAllScroll} ref={(scrollView) => { this._scrollView = scrollView; }}>
                    <ImageBackground source={headerpng} style={styles.headersPng}>
                <View style={{width:'100%',paddingLeft:scaleSize(21),paddingRight:scaleSize(21),paddingTop:scaleSize(14)}}>
                    {/*轮播*/}
                    {state.carousel.length !== 0 ? <View style={styles.wrapCarousel}>
                        <Carousel width={Platform.OS === 'ios' &&Dimensions.get('window').width === scaleSize(640)? Dimensions.get('window').width:Dimensions.get('window').width-scaleSize(42)} height={scaleSize(244)} delay={5000}indicatorColor="#FFFFFF">
                            {state.carousel.map((item, i) => {
                                    return (
                                        <View style={styles.carouselItemIOS} key={i}>
                                            <TouchableHighlight onPress={this.toWebView.bind(this,item.url)} underlayColor='transparent'><Image style={styles.bannerImg} source={{uri: item.image}}/></TouchableHighlight>
                                        </View>
                                    )
                                }
                            )}
                        </Carousel>
                    </View> : <View></View>}
                </View>
                    </ImageBackground>
                {/*tabView*/}
                  <View>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} automaticallyAdjustContentInsets={false} style={styles.tabViewScroll}>
                            <View style={styles.wrap}>
                                {this.state.tabList.map((item,i)=>{
                                    return <View style={[styles.wrapTab,this.state.type === item.id ?styles.activeTab:'']} key={i}>
                                        <Text onPress={this.showDataList.bind(this,item.id,item.name)} style={[styles.inactiveTab,this.state.type === item.id ?styles.activeTabText:'']}>{item.name}</Text>
                                    </View>
                                })}
                            </View>
                        </ScrollView>
                        <Text style={styles.bottom}/>
                    </View>
                <DataList navigation={this.props.navigation} type={this.state.type} typeName={this.state.typeName}/>
                </ScrollView>
                <Footer selectTab={0} navigation={this.props.navigation}/>
                {this.state.noviceStatus?<View></View>:<TouchableHighlight style={styles.novice} onPress={this.getNovice.bind(this)}>
                    <View style={styles.novice}>
                        <Image source={novice1} style={styles.noviceImage1}/>
                        <Image source={novice2} style={styles.noviceImage2}/>
                        <Image source={novice3} style={styles.noviceImage3}/>
                    </View>

                </TouchableHighlight>}

            </View>
        )
    }
}

const styles = StyleSheet.create({
    carouselItemIOS:{
        height:scaleSize(244),
        flex: 1,
        zIndex:9,
        width:Platform.OS === 'ios' &&Dimensions.get('window').width === scaleSize(640)? Dimensions.get('window').width:Dimensions.get('window').width-scaleSize(42),
    },
    mainBg:{
        width:'100%',
        height:Dimensions.get('window').height,
        position:'absolute',
    },
    container: {
        height: '100%',
        width: '100%',
        paddingTop:0,
        paddingBottom:ifIphoneX(scaleSize(25),0)
    },
    wrapper: {
        backgroundColor:'#000',
        height: scaleSize(260),
        flex:0,
        borderWidth:1,
        overflow:'scroll'
    },
    bannerImg: {
        width:'100%',
        height: '100%',
        borderRadius:Platform.OS === 'ios' &&Dimensions.get('window').width === scaleSize(640)?0:scaleSize(30),
    },
    header: {
        display: 'flex',
        height: ifIphoneX(scaleSize(164),Platform.OS === 'ios'?scaleSize(136):scaleSize(120)),
        flexDirection: 'row',
        width: '100%',
        paddingTop:ifIphoneX(scaleSize(54),Platform.OS === 'ios'?scaleSize(30):scaleSize(10)),
        position:'relative',
        justifyContent:'center',
    },
    title: {
        width:scaleSize(240),
        height:scaleSize(80),
    },
    firstContainer:{
        flex: 1,
        alignItems:'center',
        justifyContent:'center'
    },
    exchange_success:{
        width:scaleSize(653),
        height:scaleSize(1126),
        alignItems:'center',
        position:'relative'
    },
    confirm:{
        width:scaleSize(213),
        height:scaleSize(96),
        marginTop:scaleSize(10)
    },
    cancel:{
        width:scaleSize(100),
        height:scaleSize(100),
        marginLeft:scaleSize(580),
        marginTop:scaleSize(200)
    },
    wrapLogo:{
        alignItems:'center',
        marginTop:ifIphoneX(scaleSize(10),scaleSize(15)),
    },
    wrapCarousel:{
        width:'100%',
        height:scaleSize(244),
        overflow:'hidden',
        borderRadius:Platform.OS === 'ios'?scaleSize(24):scaleSize(56),
        backgroundColor: 'transparent',
        elevation:3
    },
    toastinfo:{
        backgroundColor:'rgba(0,0,0,0.4)',
        paddingLeft:'7%',
        paddingRight:'7%',
        height:scaleSize(60),
        borderRadius:scaleSize(30),
        alignItems:'center',
        justifyContent:'center',
        position:'absolute',
        left:'35%',
        top:'50%',
        zIndex:99,
    },
    wrapCrouselImg:{
        width:Platform.OS === 'ios' &&Dimensions.get('window').width === scaleSize(640)? Dimensions.get('window').width:Dimensions.get('window').width-scaleSize(42),
        height:'100%'
    },
    imImage:{
        width:scaleSize(58),
        height:scaleSize(58),
        borderRadius:Platform.OS === 'ios'?scaleSize(30):scaleSize(58),
        position:'absolute',
        borderWidth:scaleSize(2)
    },
    border0:{
       borderColor:'#fff'
    },
    border1:{
        borderColor:'#0C91A5'
    },
    border2:{
        borderColor:'#B1115A'
    },
    border3:{
        borderColor:'#B37D06'
    },
    imWrap:{
        maxWidth:scaleSize(400),
        height:scaleSize(80),
        position:'absolute',
        right:scaleSize(20),
        top:scaleSize(140),
        alignItems:'center',
        paddingLeft:scaleSize(20),
        flexDirection:'row',
        zIndex:50,
    },
    imWrapTint:{
        minWidth:scaleSize(200),
        maxWidth:scaleSize(380),
        height:scaleSize(57),
        borderWidth:scaleSize(2),
        backgroundColor:'#fff',
        borderRadius:scaleSize(19),
        justifyContent:'center',
        paddingLeft:scaleSize(38),

    },
    // dropDoll:{
    //     color:'#fff',
    //     fontSize:setSpText(24)
    // },
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
    noTextShow:{
        backgroundColor:'transparent',
        position:'absolute',
        height:0
    },
    cherryHead:{
        width:'100%',
        height:'100%'
    },
    /*连续签到的背景*/
    assignBg:{
        width:scaleSize(106),
        height:scaleSize(140),
        alignItems:'center',
        justifyContent:'center',
        marginLeft:scaleSize(27),
        marginTop:scaleSize(27)
    },
    signCoin:{
        width:scaleSize(34),
        height:scaleSize(34),
        marginRight:scaleSize(8)
    },
    wrapAllSign:{
        flexDirection:'row',
        paddingLeft:scaleSize(61),
        paddingRight:scaleSize(88),
        flexWrap:'wrap',
        justifyContent:'center',
    },
    signCoinText:{
        fontSize:setSpText(24),
        color:'#A56500',
        position:'relative',
        top:Platform.OS === 'ios'?scaleSize(3):0
    },
    signNum:{
        fontSize:setSpText(36),
        color:'#000',
        marginTop:scaleSize(7),
        marginBottom:scaleSize(7)
    },
    Num:{
        fontSize:setSpText(48)
    },
    signCoins:{
        width:scaleSize(58),
        height:scaleSize(48)
    },
    /*tab样式*/
    wrap:{
        height:scaleSize(85),
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:scaleSize(41),
        paddingRight:scaleSize(41),
    },
    wrapTab:{
        paddingLeft:scaleSize(35),
        paddingRight:scaleSize(35),
        justifyContent:'center',
        alignItems:'center',
    },
    inactiveTab:{
        color:'#666',
        fontSize:setSpText(28),
        width:'100%',
        height:'100%',
        textAlign:'center',
        lineHeight:scaleSize(65),
        backgroundColor:'transparent'
    },
    activeTab:{
        borderBottomColor:'#48CAE6',
        borderBottomWidth:scaleSize(3),
        backgroundColor:'transparent'
    },
    activeTabText:{
        color:'#48CAE6',
        backgroundColor:'transparent'
    },
    bottom:{
        width:'100%',
        height:scaleSize(1),
        backgroundColor:'rgba(174,174,174,0.4)'
    },
    /*强制更新弹窗*/
    containerModal:{
        flex: 1,
        padding: scaleSize(40),
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(0, 0, 0, 0.5)',
        paddingLeft:scaleSize(120),
        paddingRight:scaleSize(120)
    },
    updateModal:{
        width:'100%',
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:scaleSize(4)
    },
    updateButton:{
        height:scaleSize(80),
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        borderTopWidth:scaleSize(1),
        borderTopColor:'rgba(174,174,174,0.4)'
    },
    textButton:{
        flex:1,
        textAlign:'center',
        height:'100%',
        lineHeight:scaleSize(56),
        color:'#000'
    },
    updateContent:{
        paddingTop:scaleSize(20),
        paddingBottom:scaleSize(20),
        textAlign:'center',
        color:'#000',
        paddingLeft:scaleSize(20),
        paddingRight:scaleSize(20)
    },
    toastinfoAPK:{
        backgroundColor:'rgba(0,0,0,0.4)',
        paddingLeft:'7%',
        paddingRight:'7%',
        height:scaleSize(60),
        borderRadius:scaleSize(30),
        alignItems:'center',
        justifyContent:'center',
        position:'absolute',
        left:'36%',
        top:'50%',
        zIndex:50
    },
    tabViewScroll:{
        height:scaleSize(85),
        backgroundColor:'#fff',
    },
    headersPng:{
        width:'100%',
    },
    wrapAllScroll:{
        minHeight:Dimensions.get('window').height,
        backgroundColor:'#fff'
    },
    cancelFirst:{
        width:scaleSize(100),
        height:scaleSize(100),
        position:'absolute',
        right:0
    },
    qiandaoTitle:{
        width:scaleSize(330),
        height:scaleSize(63),
        marginTop:scaleSize(51)
    },
    weekBG:{
        width:scaleSize(496),
        height:scaleSize(96),
        position:'relative',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginBottom:scaleSize(14)
    },
    alreadyGet:{
        position:'absolute',
        width:scaleSize(76.7),
        height:scaleSize(71.4),
        right:0,
        top:0
    },
    weekStar:{
        width:scaleSize(110),
        height:scaleSize(110),
        position:'absolute',
        top:scaleSize(4),
        left:scaleSize(3)
    },
    wrapStar:{
        width:scaleSize(85),
        flexDirection:'row'
    },
    wrapFristBg:{
        width:scaleSize(234),
        height:scaleSize(54),
        borderRadius:scaleSize(100),
        backgroundColor:'rgba(0,0,0,0.1)',
        flexDirection:'row',
        paddingLeft:scaleSize(21),
        paddingRight:scaleSize(21),
        alignItems:'center',
        justifyContent:'space-between',
        marginLeft:scaleSize(20)
    },
    /*消息列表 的入口*/
    messageIcon:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        right:scaleSize(30.9),
        top:ifIphoneX(scaleSize(68.9),Platform.OS === 'ios'?scaleSize(52):scaleSize(24.9))
    },
    wrapAllHead:{
        flexDirection:'row',
        position:'absolute',
        top:ifIphoneX(scaleSize(54),Platform.OS === 'ios'?scaleSize(24):scaleSize(14)),
        left:scaleSize(21)
    },
    messageInfoModal:{
        width:'100%',
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:scaleSize(4),
        position:'absolute'
    },
    /* 未读消息 */
    noRead:{
        width:scaleSize(20),
        height:scaleSize(20),
        backgroundColor:'#fc696a',
        borderRadius:scaleSize(20),
        position:'absolute',
        right:scaleSize(20),
        top:Platform.OS === 'ios'?ifIphoneX(scaleSize(70),scaleSize(57)):scaleSize(26)
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
        width:scaleSize(430),
        height:scaleSize(300),
        position:'absolute',
        bottom:scaleSize(180),
        left:scaleSize(270)
    },
    noviceImage2:{
        width:scaleSize(600),
        height:scaleSize(530),
        position:'absolute',
        top:scaleSize(320),
        left:scaleSize(20)
    },
    noviceImage3:{
        width:scaleSize(650),
        height:scaleSize(125),
        position:'absolute',
        top:scaleSize(20),
        right:scaleSize(25),
    }
})