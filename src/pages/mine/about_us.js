import React,{Component} from 'react'
import {View,ImageBackground,StyleSheet,Image,Text,Dimensions,Platform,BackHandler,TouchableWithoutFeedback,Modal,Linking} from 'react-native'
import mainBG from '../../resource/mainBG.png'
import about_head from '../../resource/aboutHeader.png'
import about_title from '../../resource/about-title.png'
import back from '../../resource/back.png'
import arrow from '../../resource/arrows.png'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import {api} from '../../common/api.config'
import UpdateEngine from '../../components/UpdateEngine'
import wechat from '../../resource/wechat.png'
import weibo from '../../resource/weibo.png'
import Headers from '../../common/fetch_header'
import {NavigationActions} from 'react-navigation'
import Application from '../../components/jumpToApplicationMarket'
import AnalyticsUtil from '../../components/AnalyticsUtil'
/**
 * 关于我们
 */
export default class Home extends Component{
    constructor(props){
        super(props)
        this.state={version: global.version,hasNew:false,appstore:false,updateApk:false,currentApk:false,loadingApk:false,status:'',toastInfoShow:false,giveComment:false}
        this.listenProcess = this.listenProcess.bind(this)
    }
    componentWillMount(){
        /*设置监听 手机上的 物理返回按键 */
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid.bind(this))
        }
        this.getNewAppVersion()
        this.listenProcess()     //监听下载的进度
    }
    onBackAndroid(){
        /*监听的物理返回按键所调用的方法，这个方法 页面左上角的返回按钮 也是调用这个 方法*/
        this.cleanAndJump('Mine');
        return true
    }
    cleanAndJump(url,param){
        const nav = this.props.navigation;
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: url,params:param})
            ]
        })
        nav.dispatch(resetAction)
    }
    /*获取当前有没有新的版本的apk进行更新*/
    getNewAppVersion(){
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
            let url = api.updateApp+'?type='+type+'&versionCode='+versionCode
            //+'&channel='+channel
            console.log(url)
            fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){

                }else{
                    return response.json()
                }
            }).then((res)=>{
                console.info(res)
                if(res !== undefined) {
                    console.log(res.versionCode)
                    console.log(global.versioncode)
                    if (res.versionCode > global.versioncode) {
                        this.setState({hasNew:true,downloadUrl:res.downloadUrl})
                    }
                }
            }).
            catch((e) => {
                console.log("失败" + e)
            })
        }).catch((e)=>{
            console.log("获取数据失败")
            throw e
        })
    }
    /*新版本apk下载，，如果是 IOS则直接 弹窗，跳到appstore*/
    toDownLoad(){
        //统计-->版本号
        /*status === loading 代表 当前 apk正在下载，不允许 再次点击下载了，并且弹窗，显示，正在下载apk*/
        AnalyticsUtil.onEventWithMap('5_9_3',{typeName:'5_9_3'});
        if(!this.state.hasNew){
            this.setState({currentApk:true})
        }else if(this.state.status === 'loading' || global.updateStatus === 'loading'){
            this.setState({loadingApk:true})
        }else{
            if(Platform.OS === 'ios'){
                this.setState({appstore:true})
            }else{
                /*调用安卓下载并更新app*/
                this.setState({updateApk:true})
            }
        }
        this.setState({
            giveComment:false
        })
    }
    toAppStore(){
        /*跳转的 appstore */
        Linking.openURL('itms-apps://');
        this.setState({appstore:false})
    }
    /*安卓调用的下载apk*/
    toDownLoadApk(){
        if(this.state.downloadUrl.length > 0 ) {
            this.setState({updateApk:false,toastInfoShow:true})

            UpdateEngine.downLoadFile({url: this.state.downloadUrl})
            setTimeout(()=>{
                this.setState({toastInfoShow:false})
            },3000)
        }
    }
    /*关于我们 的点击事件 根据接口获得 url，这里主要是跳转的webview*/
    toAboutQuestion(){
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            fetch(api.dollStrategyURL+'id=2',{method:'GET',headers: Headers(ret[0])}).then((response) => {
                console.log(JSON.stringify(response))
                if(response.status === 200){
                    return response.json()
                }else{
                    console.log("接口失败")
                }
            }).then((res)=>{
                //统计-->常见问题
                AnalyticsUtil.onEventWithMap('5_9_2',{typeName:'5_9_2'});
                this.props.navigation.navigate('Webview',{url:res.url,result:'question'}) //res.url 是娃娃攻略的URL
            }).catch((e)=>{
                console.log("获取娃娃攻略url失败"+e)
            })
        }).catch((e)=>{
            console.log("获取数据失败")
            throw e
        })
    }
    /*协议跳转*/
    toAgreen(){
        this.props.navigation.navigate('Agreement')
    }
    /*监听apk下载的进度，UpdateEngine 是native的方法，前端只是调用*/
    listenProcess(){
        let _this = this
        console.log("准备启动监听")
        UpdateEngine.addEventEmitter({
            onDownloadSuccess: (data) => {
                console.log("onDownloadSuccess")
                console.info(data)
                _this.setState({status:data.msg})
                global.updateStatus = 'success'
            },
            onDownloading: (data) => {
                console.log("onDownloading")
                console.info(data)
                _this.setState({status:data.msg})
                global.updateStatus = 'loading'
            },
            onDownloadFailed: (data) => {
                console.log("onDownloadFailed")
                console.info(data)
                _this.setState({status:data.msg})
                global.updateStatus = 'fail'
            }
        })
    }

    /**
     * 给我好评
     */
    guideComment(){
        let _this = this
        storage.load({
            key: 'aboutGuide',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            //统计-->给我好评
            AnalyticsUtil.onEventWithMap('5_9_1',{typeName:'5_9_1'});
            //修改-->关于我们中 只要点击就会有评价窗口
            console.info("领取娃娃的时间")
            console.info(ret)
            _this.setState({giveComment:true})
        }).catch(()=>{
            console.log("该用户从来没评价过")
            /*该用户从没评价过，这个时候会走到这里来，这个时候*/
            _this.setState({giveComment:true})
        })
    }
    render(){
        return(
            <View>
                <Application showModal={this.state.giveComment} modalType={'aboutGuide'} navigation={this.props.navigation}/>
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
                            <View style={styles.updateButton}><Text style={[styles.textButton,{borderRightColor:'rgba(174,174,174,0.4)',borderRightWidth:scaleSize(1)}]} onPress={this.toAppStore.bind(this)}>确定</Text><Text style={styles.textButton} onPress={()=>{this.setState({appstore:false})}}>取消</Text></View>
                        </View>
                    </View>
                </Modal>
                <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.updateApk}
                onRequestClose={()=>{}}
            >
                <View style={styles.containerModal}>
                    <View style={styles.updateModal}>
                        <View><Text style={styles.updateContent}>确定更新？</Text></View>
                        <View style={styles.updateButton}><Text style={[styles.textButton,{borderRightColor:'rgba(174,174,174,0.4)',borderRightWidth:scaleSize(1)}]} onPress={()=>{this.setState({updateApk:false})}}>取消</Text><Text style={styles.textButton} onPress={this.toDownLoadApk.bind(this)}>确定</Text></View>
                    </View>
                </View>
            </Modal>
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.currentApk}
                    onRequestClose={()=>{}}
                >
                    <View style={styles.containerModal}>
                        <View style={styles.updateModal}>
                            <View><Text style={styles.updateContent}>当前已是最新版本</Text></View>
                            <View style={styles.updateButton}><Text style={styles.textButton} onPress={()=>{this.setState({currentApk:false})}}>确定</Text></View>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.loadingApk}
                    onRequestClose={()=>{}}
                >
                    <View style={styles.containerModal}>
                        <View style={styles.updateModal}>
                            <View><Text style={styles.updateContent}>当前正在下载apk</Text></View>
                            <View style={styles.updateButton}><Text style={styles.textButton} onPress={()=>{this.setState({loadingApk:false})}}>确定</Text></View>
                        </View>
                    </View>
                </Modal>
                {/*头部信息*/}
                 <ImageBackground source={mainBG} style={styles.mainBG}>
                     <View style={styles.header}>
                         <TouchableWithoutFeedback onPress={this.onBackAndroid.bind(this)}><Image source={back} style={styles.back}/></TouchableWithoutFeedback>
                        <Image source={about_title} style={styles.aboutTitle}/>
                     </View>
                        <View style={styles.wrapHead}><Image source={about_head} style={styles.aboutHead}/></View>
                 </ImageBackground>
                <View style={styles.content}>
                    <View style={styles.tab}>
                        <View style={{flex:1}}><Text style={styles.tabText} onPress={this.guideComment.bind(this)}>给我好评</Text></View>
                        <View><Image source={arrow} style={styles.arrow}/></View>
                    </View>
                    <View style={styles.tab}>
                        <View style={{flex:1}}><Text style={styles.tabText} onPress={this.toAboutQuestion.bind(this)}>常见问题</Text></View>
                        <View><Image source={arrow} style={styles.arrow}/></View>
                    </View>
                    <TouchableWithoutFeedback onPress={this.toDownLoad.bind(this)}>
                    <View style={styles.tab}>
                        <View style={{flex:1}}><Text style={styles.tabText}>版本号：{this.state.version}</Text></View>
                        {this.state.hasNew?<View style={styles.update}><Text style={styles.updateText}>点击更新</Text></View>:<View/>}
                    </View>
                    </TouchableWithoutFeedback>
                    <View style={styles.boldBottom}></View>
                    <View style={styles.wrap}>
                        <Text style={styles.bottom}></Text>
                        <Text style={styles.textAbout}>关注我们</Text>
                        <Text style={styles.bottom}></Text>
                    </View>
                    <View style={styles.wrapAll}>
                        <View style={styles.wrapImg}>
                            <Image source={wechat} style={styles.wechat}/>
                            <Text style={styles.textAbout}>轻松抓娃娃</Text>
                        </View>
                        <View style={styles.wrapImg}>
                            <Image source={weibo} style={styles.weibo}/>
                            <Text style={styles.textAbout}>轻松抓娃娃APP</Text>
                        </View>
                    </View>
                    <Text style={styles.agreement} onPress={this.toAgreen.bind(this)}>《用户协议与隐私条款》</Text>
                </View>
                {this.state.toastInfoShow? <View style={styles.toastinfo}>
                    <Text style={{fontSize:setSpText(24),color:'#fff'}}>开始下载APK</Text>
                </View>:<Text style={styles.noTextShow}/>}
            </View>
        )
    }
}
const styles = StyleSheet.create({
    mainBG:{
        width:'100%',
        height:scaleSize(516),
        paddingTop:ifIphoneX(scaleSize(44),0)
    },
    header:{
        height:scaleSize(40),
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(30),
        marginTop:scaleSize(60)
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        left:scaleSize(30)
    },
    aboutTitle:{
        width:scaleSize(188),
        height:scaleSize(40),
    },
    aboutHead:{
        width:scaleSize(244),
        height:scaleSize(244),
        marginTop:scaleSize(98.7)
    },
    arrow:{
        width:scaleSize(17),
        height:scaleSize(32)
    },
    tab:{
        height:scaleSize(100),
        alignItems:'center',
        paddingLeft:scaleSize(40),
        paddingRight:scaleSize(40),
        borderBottomColor:'rgba(174,174,174,0.4)',
        borderBottomWidth:scaleSize(1),
        flexDirection:'row'
    },
    tabText:{
        color:'#323232',
        fontSize:setSpText(32),
    },
    update:{
        width:scaleSize(140),
        height:scaleSize(50),
        borderRadius:scaleSize(25),
        backgroundColor:'#FD5873',
        justifyContent:'center',
        alignItems:'center'
    },
    updateText:{
        color:'#fff',
        fontSize:setSpText(26)
    },
    wrapHead:{
        width:'100%',
        alignItems:'center'
    },
    content:{
        width:'100%',
        height:Dimensions.get('window').height-scaleSize(516),
        backgroundColor:'#fff'
    },
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
        color:'#000'
    },
    agreement:{
        color:'#FD5873',
        fontSize:setSpText(26),
        flex:1,
        textAlign:'center',
        marginTop:scaleSize(266)
    },
    wechat:{
        width:scaleSize(46),
        height:scaleSize(38)
    },
    wrap:{
       width:'100%',
       flexDirection:'row',
        justifyContent:'center',
        marginTop:scaleSize(60),
        alignItems:'center'
    },
    weibo:{
        width:scaleSize(38.7),
        height:scaleSize(31),
        marginLeft:scaleSize(94)
    },
    bottom:{
        width:scaleSize(263),
        height:scaleSize(1),
        backgroundColor:'#DFDFDF',
    },
    boldBottom:{
        height:scaleSize(20),
        width:'100%',
        backgroundColor:'#EFEFEF'
    },
    textAbout:{
        color:'#323232',
        fontSize:setSpText(26),
        marginLeft:scaleSize(20),
        marginRight:scaleSize(20)
    },
    wrapAll:{
        flexDirection:'row',
        justifyContent:'center',
        marginTop:scaleSize(61)
    },
    wrapImg:{
        flexDirection:'row'
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
        left:'36%',
        top:'50%'
    },
})