import React, {Component} from 'react'
import {WebView, View, StyleSheet, Dimensions,Text,Image,TouchableWithoutFeedback,Animated,Platform,BackHandler} from 'react-native'
import back from '../resource/back.png'
import logo from '../resource/logo.png'
import share_btn from '../resource/share-head.png'
import {api} from '../common/api.config'
import * as WeChat from 'react-native-wechat';
import {ifIphoneX, scaleSize, setSpText} from '../common/util'
import grab_success from '../resource/grab-success-title.png'
import grab_fail from '../resource/grab-fail-title.png'
import gonglve from '../resource/gonglve-title.png'
import {NavigationActions} from 'react-navigation'
import AnalyticsUtil from '../components/AnalyticsUtil'
import Headers from '../common/fetch_header'
import feedback_title from '../resource/question-feedback.png'

/*这两个是 分享朋友圈 和分享微信的 弹窗 从底部往上滑动的效果*/
const DEFAULT_BOTTOM = -300;
const DEFAULT_ANIMATE_TIME = 300;
export default class webViewExample extends Component{
    constructor(props){
        super(props)
        const param  = this.props.navigation.state.params
        this.state = {url:param && param.url !== undefined ?param.url:'',bottom: new Animated.Value(DEFAULT_BOTTOM),showActionSheet:false,from:param && param.from !== undefined ?param.from:'Home',showShare:false,result:param && param.result !== undefined ?param.result:'',scalesPageToFit: true,domStorageEnabled:true,javaScriptEnabled:true,automaticallyAdjustContentInsets:true,startInLoadingState:true,machineId:param && param.machineId !== undefined ?param.machineId:'',userDollId:param && param.userDollId !== undefined ?param.userDollId:''}

    }
    componentWillMount(){
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    componentDidMount(){
        /*因为这个 webview 组件 很多地方 共用， 所以 我们需要区别来源，这样 就方便 知道 点击返回的时候跳转回到哪里去*/
        if(this.state.from === 'game' || this.state.from === 'Room' || this.state.from === 'mydoll'){
            this.setState({showShare:true})
        }
        console.log(this.state.url)
        let id = this.state.userDollId
        let url
        if(id !== undefined && id !== '' && id !== null){
            url = api.successShare+'?userDollId='+id
            /*获取 分享的title*/
            storage.load({
                key: 'userInfo',
                autoSync: true,
                syncInBackground: true,
                syncParams: {
                    extraFetchOptions: {},
                    someFlag: true,
                },
            }).then((ret)=>{
                console.log("当前地址"+api.successShare)
                console.log(this.state.url)
                //let id = this.state.url.substring(this.state.url.indexOf('id=')+3,this.state.url.length)
                console.log("分享参数")
                console.log(url)
                fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                    if(response.status !== 200){
                    }else{
                        console.log("测试share"+response)
                        return response.json()
                    }
                }).then((res)=>{
                    this.setState({title:res.title,description:res.description,thumbImage:res.thumbImage,type:res.type,webpageUrl:res.webpageUrl})
                    console.log(JSON.stringify(res)+"测试 share")
                }).catch((e) => {
                    console.log("失败" + e)
                })
            }).catch((e)=>{
                console.log("获取数据失败")
                throw e
            })
        }else{
            console.log('userDollId->',id)
        }

    }
    onBackAndroid = () => {
        /*清空页面站，kill，并且跳转到相应的页面*/
        const nav = this.props.navigation;
        if(this.state.from === 'Room'){
            this.cleanAndJump('Room',{machineId:this.state.machineId})
        }else if(this.state.from === 'game'){
            this.cleanAndJump('gameRecord')
        }else if(this.state.from === 'mydoll'){
            this.cleanAndJump('myDoll')
        }else if(this.state.from === 'feedback'){
            this.cleanAndJump('Mine')
        }else{
            nav.goBack()
        }
        return true
    };
    /*清空页面站*/
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
    shareFriend(){
        let _this = this
        //统计-->从room进入分享页 点击分享好友
        AnalyticsUtil.onEventWithMap("4_3_6_3",{machineId:_this.state.machineId});
        WeChat.isWXAppInstalled().then((isInstalled)=>{
            if (isInstalled) {
                WeChat.shareToSession({
                    title:_this.state.title,
                    description: _this.state.description,
                    thumbImage: _this.state.thumbImage,
                    type: 'news',
                    webpageUrl: _this.state.webpageUrl
                }).catch((error) => {
                    Alert(error.message);
                });
            } else {
                console.log("您没有安装微信")
            }
        })
    }
    shareCircle(){
        let _this = this
        //统计-->从room进入分享页 点击分享朋友圈
        AnalyticsUtil.onEventWithMap("4_3_6_4",{machineId:_this.state.machineId});
        WeChat.isWXAppInstalled().then((isInstalled)=>{
            if (isInstalled) {
                WeChat.shareToTimeline({
                    title:_this.state.title,
                    description: _this.state.description,
                    thumbImage: _this.state.thumbImage,
                    type: 'news',
                    webpageUrl: _this.state.webpageUrl
                })
                    .catch((error) => {
                        Alert(error.message);
                    });
            } else {
                console.log('没有安装微信软件，请您安装微信之后再试');
            }
        })
    }
    /*分享朋友圈 和 分享 朋友的 弹窗 从底部 滑动出来*/
    showActionSheet(){
        //统计-->从room进入分享页 点击分享按钮
        AnalyticsUtil.onEventWithMap("4_3_6_2",{machineId:this.state.machineId});
        this.setState({showActionSheet:true})
        Animated.timing(
            this.state.bottom,
            {
                toValue: Platform.OS === 'ios'?0:scaleSize(40),
                duration:DEFAULT_ANIMATE_TIME
            }
        ).start();
    }
    cancel(){
        this.setState({showActionSheet:false,bottom:new Animated.Value(DEFAULT_BOTTOM)})
    }
    render(){
        const {url,showShare,result} = this.state
        return(
            <View style={styles.container}>
                {/**分享出去的页面的头部***/}
                    <View style={styles.header}>
                        <TouchableWithoutFeedback onPress={this.onBackAndroid.bind(this)}>
                       <Image source={back} style={styles.back}/>
                        </TouchableWithoutFeedback>
                        {result === 'fail'? <Image source={grab_fail} style={styles.grabFails}/>:
                        result === 'success'? <Image source={grab_success} style={styles.grabFails}/>:
                            result === 'gonglve'?<Image  source={gonglve} style={styles.grabFail}/>:
                                result === 'feedback'?<Image  source={feedback_title} style={styles.grabFail}/>:<Image source={logo} style={styles.logo}/>
                        }
                        {showShare && !global.iosNoWx ?<TouchableWithoutFeedback onPress={this.showActionSheet.bind(this)}>
                                <Image source={share_btn} style={styles.shareBtn}/>
                           </TouchableWithoutFeedback>:<View/>}
                    </View>
                <WebView
                    ref={'webview'}
                    style={styles.webview}
                    source={{uri: url}}
                    startInLoadingState={this.state.startInLoadingState}
                    scalesPageToFit={this.state.scalesPageToFit}
                    domStorageEnabled={this.state.domStorageEnabled}
                    javaScriptEnabled={this.state.javaScriptEnabled}
                    automaticallyAdjustContentInsets={this.state.automaticallyAdjustContentInsets}
                />
                {this.state.showActionSheet?<View style={styles.main}>
                    <Animated.View style={{bottom: this.state.bottom,flexDirection:'column-reverse'}}>
                        <TouchableWithoutFeedback onPress={this.cancel.bind(this)}>
                        <View style={styles.share}>
                            <Text style={styles.cancel}>取消</Text>
                        </View>
                        </TouchableWithoutFeedback>
                        <View style={styles.wrapText}>
                            <TouchableWithoutFeedback onPress={this.shareCircle.bind(this)}>
                                <View style={styles.shareText}>
                                    <Text style={styles.sharetexts}>分享到朋友圈</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.shareFriend.bind(this)}>
                                <View style={styles.shareText}>
                                    <Text  style={styles.sharetexts}>分享给微信好友</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </Animated.View>
                </View>:<View/>}
            </View>
        )
    }
}
const styles = StyleSheet.create({
    webview:{
        width:'100%',
        height:'100%'
    },
    container:{
        width:'100%',
        height:Dimensions.get('window').height,
    },
    header:{
        width:'100%',
        height:ifIphoneX(scaleSize(157),scaleSize(128)),
        flexDirection:'row',
        justifyContent:'center',
        backgroundColor:'#8AEDFC',
        alignItems:'center',
        paddingTop:ifIphoneX(scaleSize(55),scaleSize(40))
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
         position:'absolute',
        left:scaleSize(30),
        top:scaleSize(54)
    },
    shareBtn:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        right:scaleSize(30),
        top:scaleSize(54)
    },
    logo:{
        width:scaleSize(209),
        height:scaleSize(72),
    },
    /*底部弹窗*/
    main:{
        flex:1,
        position:'absolute',
        top:0,
        left:0,
        bottom:0,
        right:0,
        flexDirection:'column-reverse',
        backgroundColor:'rgba(0,0,0,0.2)',
        padding:scaleSize(16),
        paddingBottom:Platform.OS === 'ios'?ifIphoneX(scaleSize(44),0):scaleSize(14)
    },
    share:{
        width:'100%',
        height:scaleSize(80),
        backgroundColor:'#fff',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:scaleSize(10)
    },
    cancel:{
        fontSize:setSpText(36),
        color:'#0ab4c9',
    },
    wrapText:{
        width:'100%',
        backgroundColor:'#fff',
        marginBottom:scaleSize(16),
        borderRadius:scaleSize(10)
    },
    shareText:{
        height:scaleSize(80),
        alignItems:'center',
        justifyContent:'center',
        borderBottomColor:'#e1e2e3',
        borderBottomWidth:scaleSize(1)
    },
    sharetexts:{
        color:'#000',
        fontSize:setSpText(36)
    },
    grabFail:{
        width:scaleSize(188),
        height:scaleSize(40),
        marginRight:scaleSize(16)
    },
    grabFails:{
        width:scaleSize(188),
        height:scaleSize(40),
    }

})
