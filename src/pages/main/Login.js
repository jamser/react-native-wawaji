import React from 'react'
import Storage from 'react-native-storage';
import {ImageBackground, Text, View, Image, StyleSheet, TouchableHighlight, AsyncStorage,Platform,AlertIOS,Alert} from 'react-native'
import {setSpText,scaleSize} from '../../common/util'
import dash from '../../resource/dash-login.png'
import * as WeChat from 'react-native-wechat';
import {api,options} from '../../common/api.config'
import IMEngine from '../../components/IMEngine'
import {consoleDebug} from '../../common/tool'
import AnalyticsUtil from '../../components/AnalyticsUtil'
import Headers from '../../common/fetch_header'
WeChat.registerApp(api.wxCode);

/*storage 存储 有效期是7天*/
var storage = new Storage({
    size: 1000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24 * 7,
    enableCache: true,
    sync: {}
})
/*将这个storage 变成全局的*/
global.storage = storage

export default class LoginScreen extends React.Component {
    state = {
        checked: true
    }
    componentWillMount(){
        console.info('激活App')
        //统计-->激活App
        AnalyticsUtil.onEventWithMap('1',{typeName:'1'});
        /*调取初始化 IM*/
        this.InitIMEngine()
    }
    componentDidMount() {
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
            /* userInfo 要是有值，代表这个 用户 7天之内 登录过，那么 就不用走 登录，直接跳转到Home页面*/
            if (ret.length !== 0) {
                consoleDebug(ret[0])
                /*判断是否是IOS 并且是否有微信 为了 通过 苹果审核*/
                WeChat.isWXAppInstalled().then((res)=>{
                    console.info(res)
                    if(!res){
                        console.log("您还没有安装微信")
                        if(Platform.OS === 'ios'){
                            //这个变量 ，是为了 将整个项目中关于微信的东西注释掉，包括微信充值，微信分享
                            global.iosNoWx = true
                        }
                    }
                }).catch((e)=>{
                        throw e
                })

                this.props.navigation.navigate('Home')
            }
        }).catch(err => {
            this.judgeIos()
            console.info('err', '首次登陆 找不到用户信息')
        })
    }

    _handleCheck = () => {
        this.setState({checked: !this.state.checked})
    }
    /*点击 页面上的微信登录 就调用的方法*/
    _handleLogin() {
        let jwtToken = ''
        WeChat.isWXAppInstalled()
            .then(async (e) => {
                let userObj = await WeChat.sendAuthRequest("snsapi_userinfo").catch((e)=>{
                    /*catch 微信登录失败，前端封住*/
                    //统计-->登录微信失败
                    AnalyticsUtil.onEventWithMap("2",{status:'失败'});
                    if(Platform.OS === 'android'){
                        Alert.alert(
                            '',
                            '微信登录失败，请退出重试',
                            [
                                {text: '', onPress: () => {}},
                                {text: '确定', onPress: () =>{}},
                                {text: '', onPress: () => {}}
                            ],
                            { cancelable: false }
                        )
                    }else{
                        AlertIOS.alert(
                            '',
                            '微信登录失败，请退出重试',
                            [
                                {text: '确定', onPress: () => {}},
                                {text: '', onPress: () => {}},
                            ]
                        )
                    }
                    consoleDebug("sendAuthRequest is error")
                    throw e
                })
                console.info(userObj,userObj.code)
                /*调用 自己后台的login userObj.code 是微信给返回的*/
                fetch(api.login + userObj.code, {method: 'GET'})
                    .then(res => {
                        console.info('res', res);
                        jwtToken = res.headers.map.jwt_token[0]
                        return res.json()
                    })
                    .then(res => {
                        console.info('res', res)
                        if (res.status && res.status !== 200) {
                            throw res
                        } else {
                            /*storage。save 存储 token 和 id  有效期是 7天*/
                            storage.save({
                                key: 'userInfo',   // Note: Do not use underscore("_") in key!
                                data: [jwtToken, res.id],
                            });
                            //统计-->登录微成功
                            AnalyticsUtil.onEventWithMap("2",{status:'成功'});
                            this.props.navigation.navigate('Home')
                        }
                    }).catch(err => {
                        console.info('login err', err)

                })
            }).catch(err => {
            alert('您没有安装微信')
        })
    }

    /*初始化IMEngine*/
    InitIMEngine(){
        IMEngine.init(options).then((res)=>{
            console.info("InitIMEngine",res)
        })
    }
    /*判断 当前用户是否有微信，如果没有微信并且 用户是IOS的时候，调用后端接口，传递 devicetype和appVersion过去，后台会返回token，并且有限期为一个月*/
    judgeIos(){
        console.log("走进judge")
        WeChat.isWXAppInstalled().then((res)=>{
            /*有微信就正常的走登录按钮*/
            console.info(res)
            if(!res){
                console.log("您还没有安装微信")
                /*返回的res为false的时候，意味着你没有安装微信returns {Boolean} if WeChat is installed.*/
                if(Platform.OS === 'ios'){
                    /*无法获得app version 目前版本是 1.6.0*/
                    let param = '?deviceType=IOS&appVersion=1.6.0'
                    let url = api.iosTreat + param
                    global.iosNoWx = true
                    fetch(url, {method: 'GET'})
                        .then(res => {
                            if(res.status !== 200){
                                throw res
                            }else{
                                return res.json()
                            }
                        }).then(res => {
                        /*获取userId*/
                        let token = res.token
                        this.getUserId(token)
                    }).catch(err => {
                        console.info('IOS 接口调用失败', err)
                    })
                }
            }
        }).catch((e)=>{
            throw e
        })
    }
    /*根据 返回的token 去取用户的userId*/
    getUserId(token){
        fetch(api.userInfo, {method: 'GET',headers: Headers(token)}).then((response) => {
            if(response.status !== 200){
                console.log("获取userId失败，强写一个userId，以方便用户进行后续操作")
                storage.save({
                    key: 'userInfo',
                    data: [token, 60001],
                });
                this.props.navigation.navigate('Home')
            }else{
                return response.json()
            }
        }).then((res)=>{
            storage.save({
                key: 'userInfo',   // Note: Do not use underscore("_") in key!
                data: [token, res.id],
            });
            this.props.navigation.navigate('Home')
        }).catch((e) => {
            console.log("失败 在登录页面login" + e)
        })
    }
    render() {
        let state = this.state
        return (
            <ImageBackground source={require('../../resource/loginBG.png')} style={styles.container}>
                <Image source={require('../../resource/logo.png')} style={styles.logo}/>
                {state.checked ? <TouchableHighlight onPress={() => {
                        this._handleLogin()
                    }} underlayColor='transparent'>
                        <Image source={require('../../resource/login-btn.png')} style={styles.loginBtn}/>
                    </TouchableHighlight> :
                    <Image source={require('../../resource/login-btn-select.png')} style={styles.loginBtn}/>
                }
                <View style={{marginTop: scaleSize(40), display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableHighlight onPress={() => {
                        this._handleCheck()
                    }} underlayColor='transparent'>
                        {state.checked ? <Image style={{width: scaleSize(38), height: scaleSize(38), marginRight: scaleSize(10)}}
                                                source={require('../../resource/checkbox.png')}/> :
                            <Image style={{width: scaleSize(38), height: scaleSize(38), marginRight: scaleSize(10)}}
                                   source={require('../../resource/checkbox-no.png')}/>}
                    </TouchableHighlight>
                    <Text style={styles.label}>登录表示同意</Text><TouchableHighlight onPress={() => {
                    this.props.navigation.navigate('Agreement')
                }} underlayColor='transparent'><View><Text style={[styles.labels]}>用户协议与隐私条款</Text><Image source={dash}
                                                                                                          style={styles.dash}/></View></TouchableHighlight>
                </View>
            </ImageBackground>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        width: '100%'
    },
    logo: {
        width: scaleSize(462), height: scaleSize(152), marginTop: scaleSize(190)
    },
    label: {
        backgroundColor: 'transparent', color: '#fff', fontSize: setSpText(24)
    },
    labels: {backgroundColor: 'transparent', color: '#fff', fontSize: scaleSize(24), marginTop: scaleSize(4)},
    dash: {width: scaleSize(211.9), marginTop: scaleSize(4)},
    loginBtn: {width: scaleSize(500), height: scaleSize(120), marginTop: scaleSize(330)}
})