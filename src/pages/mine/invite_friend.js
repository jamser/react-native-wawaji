import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight, Alert,Platform,BackHandler,TouchableWithoutFeedback} from 'react-native';
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import index_bg from '../../resource/toastbg.png'
import weixin from '../../resource/weixin.png'
import pengyouquan from '../../resource/pengyouquan.png'
import back from '../../resource/back.png'
import layer from '../../resource/layer.png'
import dash from '../../resource/dash.png'
import title from '../../resource/invite-friend-title.png'
import * as WeChat from 'react-native-wechat';
import {api} from '../../common/api.config'
import {consoleDebug} from '../../common/tool'
import AnalyticsUtil from '../../components/AnalyticsUtil'
import Headers from '../../common/fetch_header'
/**
 * 邀请好友
 */
export default class inviteFriendScreen extends Component{
    constructor(props){
        super(props)
        this.state = {name:'',code:'',title:'',description:'',thumbImage:'',type:'',webpageUrl:'',content:''}
        this.getText = this.getText.bind(this)  //这个页面的文字都是  走后台接口调用的 这个就是获得文字的接口
    }
    componentWillMount(){
        /*设置 监听 安卓 返回键 */
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    /*下方物理键的返回按钮 和 页面左上方的 返回都调用的这个 函数*/
    onBackAndroid = () => {
        const nav = this.props.navigation;
        nav.navigate('Mine');
        return true;
    };
    componentDidMount(){
        let _this = this
        _this.getText() //去拿文案
        /*获取用户信息*/
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            consoleDebug(api.userInfo+"地址信息")
            consoleDebug(ret)
            /**/
            fetch(api.userInfo, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                }else{
                    return response.json()
                }
            }).then((res)=>{
                consoleDebug(JSON.stringify(res)+"成功")
                _this.setState({name:res.nickName,code:res.code})
            }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
        /*获取 分享的title，这个 share 就是 分享的 文案 和 分享的url，等等，前端都不能写死，因为每次发版都不容易*/
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
            fetch(api.share, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    _this.setState({exchangeResult:true})
                }else{
                    consoleDebug("测试share"+response)
                    return response.json()
                }
            }).then((res)=>{
                _this.setState({title:res.title,description:res.description,thumbImage:res.thumbImage,type:res.type,webpageUrl:res.webpageUrl})
                consoleDebug(JSON.stringify(res)+"测试 share")
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    /*分享给 微信好友*/
    shareFriend(){
        let _this = this
        //统计-->我的_分享到微信
        AnalyticsUtil.onEventWithMap('5_2_1',{typeName:'5_2_1'});
        consoleDebug(_this.state.code)
        WeChat.isWXAppInstalled().then((isInstalled)=>{
            if (isInstalled) {
                WeChat.shareToSession({
                    title:_this.state.name+_this.state.title,
                    description: _this.state.description,
                    thumbImage: _this.state.thumbImage,
                    type: _this.state.type,
                    webpageUrl: _this.state.webpageUrl
                }).catch((error) => {
                        Alert(error.message);
                    });
            } else {
                Alert("您没有安装微信")
            }
        })
    }
    /*分享到 朋友圈*/
    shareCircle(){
        let _this = this
        //统计-->我的_分享到朋友圈
        AnalyticsUtil.onEventWithMap('5_2_2',{typeName:'5_2_2'});
        WeChat.isWXAppInstalled().then((isInstalled)=>{
            if (isInstalled) {
                WeChat.shareToTimeline({
                    title:_this.state.name+_this.state.title,
                    description: _this.state.description,
                    thumbImage: _this.state.thumbImage,
                    type: _this.state.type,
                    webpageUrl: _this.state.webpageUrl
                })
                    .catch((error) => {
                        Alert(error.message);
                    });
            } else {
                Alert('没有安装微信软件，请您安装微信之后再试');
            }
        })
    }
    getText(){
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            consoleDebug(api.inviteCoin)
            fetch(api.inviteCoin, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    return
                }else{
                    return response.json()
                }
            }).then((res)=>{
                console.info(res)
                this.setState({content:res.content})
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    render(){
        const {goBack,state} = this.props.navigation;
        return(
            <ImageBackground source={index_bg} style={styles.background} >
                <View style={styles.headers}>
                    <TouchableWithoutFeedback onPress={() => goBack()} underlayColor='transparent'>
                        <Image source={back} style={styles.back}/>
                    </TouchableWithoutFeedback>
                    <View style={{flex:1,alignItems:'center'}}>
                        <Image source={title} style={styles.title}/></View>
                </View>
                <ImageBackground style={styles.wrapInvite} source={layer}>
                    <View style={styles.center}>
                        <Text style={styles.normalFont}>您的专属邀请码</Text>
                        <Text style={styles.bold}>{state.params.code}</Text>
                    </View>
                    <Image source={dash} style={styles.dash}/>
                    <View style={{justifyContent:'flex-start',width:'100%'}}><Text style={styles.friendPaddings}>奖励规则：</Text></View>
                    <Text style={styles.friendPadding}>{this.state.content}</Text>
                </ImageBackground>
                {global.iosNoWx?<View/>:<View>
                    <TouchableHighlight onPress={this.shareFriend.bind(this)} underlayColor='transparent'>
                        <Image source={weixin} style={styles.share}/></TouchableHighlight>
                    <TouchableHighlight onPress={this.shareCircle.bind(this)} underlayColor='transparent'>
                        <Image source={pengyouquan} style={styles.share1}/></TouchableHighlight>
                </View>}
            </ImageBackground>
        )
    }
}
const styles = StyleSheet.create({
    background: {
        height: scaleSize(1675),
        width: '100%',
        alignItems:'center',
        paddingTop:ifIphoneX(scaleSize(30),0),
    },
    wrapInvite:{
        width:scaleSize(653),
        height:scaleSize(583),
        marginTop:scaleSize(68),
        alignItems:'center'
    },
    bold:{
        fontSize:setSpText(72),
        backgroundColor:'transparent',
        marginBottom:scaleSize(30),
        color:'#323232'
    },
    friendPadding:{
        paddingLeft:scaleSize(66),
        paddingRight:scaleSize(66),
        color:'#666666',
        fontSize:setSpText(26),
        backgroundColor:'transparent',
        lineHeight:scaleSize(40)
    },
    friendPaddings:{
        paddingLeft:scaleSize(60),
        paddingRight:scaleSize(66),
        color:'#323232',
        backgroundColor:'transparent',
        marginBottom:scaleSize(10),
        fontSize:setSpText(28),
        marginLeft:scaleSize(10)
    },
    center:{
        alignItems:'center',
        marginTop:scaleSize(96)
    },
    normalFont:{
        fontSize:setSpText(28),
        backgroundColor:'transparent',
        color:'#323232',
        marginBottom:scaleSize(20)
    },
    share:{
        width:scaleSize(456),
        height:scaleSize(111),
        marginTop:scaleSize(70)
    },
    share1:{
        width:scaleSize(456),
        height:scaleSize(111),
        marginTop:scaleSize(16)
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        left:scaleSize(30)
    },
    headers:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        width:'100%',
        height:scaleSize(66),
        marginTop:scaleSize(30),
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(30)
    },
    title:{
        width:scaleSize(168),
        height:scaleSize(40)
    },
    dash:{
        width:scaleSize(494),
        height:scaleSize(1),
        marginBottom:scaleSize(40)
    }
})