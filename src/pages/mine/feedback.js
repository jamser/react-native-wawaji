import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight,TouchableWithoutFeedback, Platform,BackHandler} from 'react-native';
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import index_bg from '../../resource/mainBG.png'
import back from '../../resource/back.png'
import title from '../../resource/question-feedback.png'
import code from '../../resource/codeweixin.png'
import logo from '../../resource/feedback-logo.png'
import {api} from '../../common/api.config'
import Headers from '../../common/fetch_header'

/**
 * 反馈
 */
export default class feedbackScreen extends Component{
    componentWillMount(){
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
        this.toAboutQuestion()
    }
    onBackAndroid = () => {
        const nav = this.props.navigation;
        nav.navigate('Mine');
        return true
    };
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
                this.props.navigation.navigate('Webview',{url:res.url,from:'feedback',result:'feedback'}) //res.url 是娃娃攻略的URL
            }).catch((e)=>{
                console.log("获取娃娃攻略url失败"+e)
            })
        }).catch((e)=>{
            console.log("获取数据失败")
            throw e
        })
    }
        render(){
            const {goBack} = this.props.navigation;
            return(
                <View/>

            )
        }
}

const styles = StyleSheet.create({
    background: {
        flex:1,
        width:null,
        height:null,
        alignItems:'center',
        paddingTop:ifIphoneX(scaleSize(30),0),
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        left:scaleSize(30)
    },
    headers:{
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginTop:scaleSize(60),
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(40),
    },
    title:{
        width:scaleSize(188),
        height:scaleSize(40)
    },
    wrap:{
        flex:1,
        paddingRight:scaleSize(30),
        paddingLeft:scaleSize(30),
        marginBottom:scaleSize(30),
        marginTop:scaleSize(40)
    },
    detail:{
        width:'100%',
        height:'100%',
        backgroundColor:'#fff',
        borderRadius:scaleSize(46),
        alignItems:'center',
        paddingLeft:scaleSize(85),
        paddingRight:scaleSize(93)
    },
    logo:{
        width:scaleSize(440),
        height:scaleSize(154),
        marginTop:scaleSize(93)
    },
    code:{
        width:scaleSize(417),
        height:scaleSize(417)
    },
    feedTtle:{
        fontSize:setSpText(34),
        marginTop:scaleSize(10),
        marginBottom:scaleSize(31),
        color:'#000'
    },
    content:{
        fontSize:setSpText(32),
        color:'#000',
        marginTop:scaleSize(32),
        lineHeight:scaleSize(60),
        textAlign:'center'
    }

})
