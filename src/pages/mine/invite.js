import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight, TouchableWithoutFeedback,TextInput,Modal,Platform,BackHandler} from 'react-native';
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import index_bg from '../../resource/toastbg.png'
import confirm from '../../resource/confirm.png'
import back from '../../resource/back.png'
import invite from '../../resource/invites.png'
import layer from '../../resource/layer.png'
import {api} from '../../common/api.config'
import title from '../../resource/input-code-title.png'
import {consoleDebug} from '../../common/tool'
import tishi from '../../resource/tishi2.png'
import write_code from '../../resource/write-code.png'
import code_me from '../../resource/code-me.png'
import failCode from '../../resource/noexist.png'
import invalid_code from '../../resource/invalid-code.png'
import Headers from '../../common/fetch_header'

/**
 * 邀请码
 */
/*inviteStatus 这个标志符 因为 弹窗是公用的，但是每个弹窗 里面的内容 都不一样 是代表 每个 标志 */
export default class InviteScreen extends Component{
    constructor(props){
        super(props)
        const navigation = this.props.navigation;
        this.state={text:'',userId:navigation.state.params && navigation.state.params.userId !== undefined?navigation.state.params.userId:null,exchangeResult:false,info:'',inviteSuccess:false,isClick:false,invitee:navigation.state.params.invitee,code:navigation.state.params.code,resultContent:'',inviteStatus:0}
    }
    componentWillMount(){
        /*开启 设置 监听 安卓上的物理返回键 */
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    /* 页面上的左上方 的 返回按钮 和 下方的 返回按钮 都调用的这个方法*/
    onBackAndroid = () => {
        const nav = this.props.navigation;
        nav.navigate('Mine');
        return true;
    };
    /*输入邀请码 的确认 isClick 是代表着不能让他 快速 并且频繁的点击 */
    confirm(){
        if(this.state.isClick){
            return
        }
        this.setState({isClick:true})
        let url = api.invite
        let param ={
            "code":this.state.text
        }
        if(this.state.invitee){
            this.setState({info:'您已经获得过邀请奖励咯',exchangeResult:true,inviteStatus:1})
            return
        }
        if(this.state.code === this.state.text){
            this.setState({info:'不能邀请自己',exchangeResult:true,inviteStatus:0})
            return
        }
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            console.log(url)
            fetch(url,{method:'POST',headers: Headers(ret[0]),body: JSON.stringify(param)}).then((res)=>{
                consoleDebug(JSON.stringify(res))
                if(res.status === 200 || res.status === 400){
                    if(res.status === 200) {
                        this.setState({inviteSuccess: true})
                    }
                    return res.json()
                }else{
                    this.setState({info:'邀请码输入错误',exchangeResult:true,inviteStatus:2})
                }
                this.setState({isClick:false})
            }).then((res)=>{
                if(res.code === 404){
                    this.setState({exchangeResult:true,inviteStatus:3})
                }
                this.setState({resultContent:res.content})
                consoleDebug(JSON.stringify(res)+"成功领取10钻石")
            }).catch((e)=>{
                consoleDebug("失败"+e+JSON.stringify(e))
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    setExchangeResult(visible) {
        this.setState({exchangeResult: visible,isClick:false});
    }
    setInviteResult(visible){
        this.setState({inviteSuccess: visible,isClick:false});
    }
        render(){
            const {goBack} = this.props.navigation;
            var modalBackgroundStyle = {
                backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
            };
            return(
                <ImageBackground source={index_bg} style={styles.background} >
                    <Modal animationType={"fade"}
                           transparent={true}
                           visible={this.state.exchangeResult}
                           onRequestClose={()=>{}}>
                        <View style={[styles.container, modalBackgroundStyle]}>
                            <ImageBackground source={layer} style={styles.layer}>
                                {/*<View><Text style={styles.error}>{this.state.info}</Text></View>*/}
                                <Image source={tishi} style={styles.tishi}/>
                                {this.state.inviteStatus === 0?<Image source={code_me} style={styles.codeMe}/>:this.state.inviteStatus === 1?<Image source={write_code} style={styles.writeCode}/>:this.state.inviteStatus === 3?<Image source={invalid_code} style={styles.invalidCode}/>:<Image source={failCode} style={styles.failCode}/>}
                                <TouchableHighlight onPress={() => {
                                    this.setExchangeResult(false)
                                }} underlayColor='transparent'><View style={styles.modalConfirm}><Image source={confirm} style={[styles.confirmColor]}/></View></TouchableHighlight>
                            </ImageBackground>
                        </View>
                    </Modal>
                    {/*输入邀请码成功*/}
                    <Modal animationType={"fade"}
                           transparent={true}
                           visible={this.state.inviteSuccess}
                           onRequestClose={()=>{}}>
                        <View style={[styles.container, modalBackgroundStyle]}>
                            <ImageBackground source={layer} style={styles.layer1}>
                                <View style={{alignItems:'center'}}>
                                    <Text style={[styles.errorSuccess,{fontWeight:'bold',marginBottom:scaleSize(10)}]}>成功</Text>
                                    <Text style={styles.errorSuccess}>您已成功领取奖励，可在消费记录里查看明细</Text>
                                </View>
                                <TouchableHighlight onPress={() => {
                                    this.setInviteResult(false);this.props.navigation.navigate('Mine')
                                }} underlayColor='transparent'><View style={styles.modalConfirm}><Image source={confirm} style={styles.confirmColor}/></View></TouchableHighlight>
                            </ImageBackground>
                        </View>
                    </Modal>
                    <View style={styles.headers}>
                        <TouchableWithoutFeedback onPress={() => goBack()} underlayColor='transparent'>
                            <Image source={back} style={styles.back}/>
                        </TouchableWithoutFeedback>
                        <View>
                            <Image source={title} style={styles.title}/>
                        </View>
                    </View>
                    <ImageBackground style={styles.wrapInvite} source={layer}>
                        <Image source={invite} style={styles.invite}/>
                        <TextInput style={styles.textInput} underlineColorAndroid="transparent" onChangeText={(text) => this.setState({text})} value={this.state.text} maxLength={8} placeholder="输入邀请码，领取奖励"/>
                        <TouchableHighlight onPress={this.confirm.bind(this)} underlayColor='transparent'>
                            <Image source={confirm} style={styles.confirm}/></TouchableHighlight>
                    </ImageBackground>
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
        height:scaleSize(588),
        alignItems:'center',
        justifyContent:'center',
        marginTop:scaleSize(180)
    },
    confirm:{
        width:scaleSize(219),
        height:scaleSize(98)
    },
    textInput:{
        width:scaleSize(471),
        height:scaleSize(78),
        backgroundColor:'rgba(104, 364, 257,1)',
        color:'#7d999d',
        textAlign:'center',
        borderRadius:scaleSize(20),
        marginTop:scaleSize(60),
        marginBottom:scaleSize(80),
        fontSize:setSpText(28),
        padding: 0
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
        width:scaleSize(228),
        height:scaleSize(44)
    },
    invite:{
        width:scaleSize(451),
        height:scaleSize(42)
    },
    container: {
        flex: 1,
        padding: scaleSize(80),
        alignItems:'center',
    },
    error:{
        marginTop:scaleSize(180),
        marginBottom:scaleSize(80),
        fontSize:setSpText(48),
        color:'#323232',
        fontWeight:'bold'
    },
    modalConfirm:{
        width:'100%',
        justifyContent:'center',
        marginTop:scaleSize(100)
    },
    confirmColor:{
        width:scaleSize(219),
        height:scaleSize(98),
    },
    layer:{
        width:scaleSize(653),
        height:scaleSize(578),
        marginTop:scaleSize(216),
        alignItems:'center',
    },
    layer1:{
        width:scaleSize(653),
        height:scaleSize(578),
        marginTop:scaleSize(216),
        alignItems:'center',
        justifyContent:'center'
    },
    errorSuccess:{
        fontSize:setSpText(40),
        color:'#323232',
        paddingLeft:scaleSize(60),
        paddingRight:scaleSize(60),
        textAlign:'center'
    },
    tishi:{
        width:scaleSize(83),
        height:scaleSize(40),
        marginTop:scaleSize(96)
    },
    writeCode:{
        width:scaleSize(267),
        height:scaleSize(75),
        marginTop:scaleSize(45)
    },
    codeMe:{
        width:scaleSize(189),
        height:scaleSize(30),
        marginTop:scaleSize(68)
    },
    failCode:{
        width:scaleSize(222),
        height:scaleSize(30),
        marginTop:scaleSize(45)
    },
    invalidCode:{
        width:scaleSize(285),
        height:scaleSize(75),
        marginTop:scaleSize(45)
    }

})