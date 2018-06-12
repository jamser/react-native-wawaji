import React, {Component} from 'react'
import {View,Text,WebView,StyleSheet,Dimensions,BackHandler,Platform} from 'react-native'
import {api} from '../common/api.config'
import {consoleDebug} from '../common/tool'
import Headers from '../common/fetch_header'
import {scaleSize,setSpText} from '../common/util'
import Footer from './footer'
import AnalyticsUtil from '../components/AnalyticsUtil'

/**
 * 排行榜 排行榜是 内嵌 的webview 也就是H5
 */
export default class webViewExample extends Component{
    constructor(props){
        super(props)
        this.state = {scalesPageToFit: true,
            domStorageEnabled:true,
            javaScriptEnabled:true,
            automaticallyAdjustContentInsets:true,
            startInLoadingState:true,
            code:0,url:'',
            toastInfoShow:false,
            joinTime:0,//进入页面的时间
            quitTime:0,//退出页面的时间
        }
    }
    componentWillMount(){
        this.state.joinTime = new Date().getTime()
        let _this = this
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            lastBackPressed:0,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            consoleDebug("当前地址"+api.userInfo)
            consoleDebug(ret)
            fetch(api.userInfo, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                }else{
                    return response.json()
                }
            }).then((res)=>{
                _this.setState({code:res.code,url:api.rankUrl+encodeURIComponent('name='+res.code)})
                console.log(_this.state.url)
            }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }

    componentWillUnmount(){
        this.state.quitTime = new Date().getTime()
        let stayTime = Math.ceil((this.state.quitTime  - this.state.joinTime) / 1000)
        //统计-->成就停留时间
        AnalyticsUtil.onEventWithMap("8_1",{stayTime:stayTime})
    }
    /* 页面的 左上角的返回按钮 也是调用这个函数 */
    onBackAndroid = () => {
        let _this = this
        if(_this.state.lastBackPressed !== 0 && _this.state.lastBackPressed + 2000 >= new Date().getTime()){
            BackHandler.exitApp()
        }
        _this.setState({lastBackPressed:new Date().getTime()});
        _this.setState({toastInfoShow:true})
        return true
    };
    render(){
        const {url} = this.state
        return(
            <View style={styles.container}>
                {this.state.toastInfoShow? <View style={styles.toastinfo}>
                    <Text style={{fontSize:setSpText(24),color:'#fff'}}>再按一次退出应用</Text>
                </View>:<View/>}
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
                <Footer selectTab = {1} navigation={this.props.navigation}/>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container:{
        width:'100%',
        minHeight:Dimensions.get('window').height,
    },
    webview:{
        width:'100%',
        height:'100%'
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
})