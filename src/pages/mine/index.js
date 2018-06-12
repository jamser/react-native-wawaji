import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight, Platform,ScrollView,Modal,BackHandler,Linking,Alert,Clipboard,Dimensions} from 'react-native';
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import index_bg from '../../resource/mainBG.png'
import little_money from '../../resource/index-money-icon.png'
import recharge from '../../resource/recharge.png'
import my_doll from '../../resource/mydoll.png'
import arrows from '../../resource/arrows.png'
import game_record from '../../resource/game_record_icon.png'
import invite from '../../resource/invite.png'
import write_code from '../../resource/writecode-index.png'
import feedback from '../../resource/feedback.png'
import logo from '../../resource/logo.png'
import back from '../../resource/back.png'
import {api} from '../../common/api.config'
import cancel_Modal from '../../resource/cancel.png'
import gonglve from '../../resource/gonglve.png'
import attention from '../../resource/attention.png'
import {consoleDebug} from '../../common/tool'
import {NavigationActions} from 'react-navigation'
import about_us from '../../resource/aboutus.png'
import zuanshi from '../../resource/mine-zuanshi.png'
import AnalyticsUtil from '../../components/AnalyticsUtil'
import Footer from '../../components/footer'
import Headers from '../../common/fetch_header'
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
import myAce from '../../resource/myAce.png'
/**
 * 我的入口
 */
export default  class MineScreen extends Component{
    constructor(props){
        super(props)
        this.state={
            id:null,
            name:"",   //用户昵称
            image:"http://media.starcandy.cn/doll/doll_defaultavatar.png",    //用户头像
            balance:0,     //用户账户额度            # 一般用balance
            code:0,   //邀请码
            invitee:false,   //是否填写过邀请码
            payer:true,  //是否是首充用户         # 字段名称不明显， 客户端需要这个信息么？
            exchangeResult:false,
            attentionModal:false,
            wxModal:false,
            content:'', //关注即送金币的内容
            version:global.version,
            lastBackPressed:0,
            toastInfoShow:false,
            goldBalance:0 ,    // 默认的金币的 数量
            level:0 , //会员等级
        }
        consoleDebug("进入我的首页constructor")
        this.toDollStrategy = this.toDollStrategy.bind(this)
    }
    componentWillMount(){
        //统计-->进入我的
        AnalyticsUtil.onEventWithMap('5',{typename:'5'});
        /*这里开始设置 监听物理返回按键*/
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
        this.attention() //获得关注的内容
    }
    onBackAndroid = () => {
        /*lastBackPressed 和 Date().getTime() 是用来判断 当前  连续两次 点击物理返回按键的 间隔，如果在2s以内，就提示  再按一次退出应用*/
        let _this = this
        if(_this.state.lastBackPressed !== 0 && _this.state.lastBackPressed + 2000 >= new Date().getTime()){
            BackHandler.exitApp()
        }
        _this.setState({lastBackPressed:new Date().getTime()});
        _this.setState({toastInfoShow:true})
        return true
    };
    componentDidMount(){
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
            /***userInfo***/
            fetch(api.userInfo, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    _this.setState({exchangeResult:true})
                }else{
                    return response.json()
                }
            }).then((res)=>{
                console.log(res)
                _this.setState({name:res.nickName,balance:res.balance,id:res.id,code:res.code,image:res.image,invitee:res.invitee,goldBalance:res.goldBalance,level:res.level})
                global.code = res.code
            }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    setExchangeResult(visible) {
        this.setState({exchangeResult: visible});
    }
    setAttentionModal(visible) {
        //统计-->关注即送金币-取消
        AnalyticsUtil.onEventWithMap('5_3_1',{typeName:'5_3_1'});
        this.setState({attentionModal: visible});
    }
    setWxModal(visible) {
        this.setState({wxModal: visible});
    }
    toOpenWX(){
        this.setState({attentionModal:false})
        Linking.canOpenURL('weixin://').then(supported => {
              if (supported) {

                  Linking.openURL('weixin://');
                  } else {
                  Alert.alert(
                      '请先安装微信',
                      [
                          {text: '确定', onPress: () => console.log('OK Pressed')},
                      ],
                      { cancelable: false }
                  )
                 }
           });
    }
    /***跳转到娃娃功率的webView****/
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
                //统计-->娃娃攻略
                AnalyticsUtil.onEventWithMap('5_7',{typeName:'5_7'});
                this.props.navigation.navigate('Webview',{url:res.url,result:'gonglve'}) //res.url 是娃娃攻略的URL
            }).catch((e)=>{
                consoleDebug("获取娃娃攻略url失败"+e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }

    /**
     * 关于我们
     */
    toAboutUs(){
        //统计-->关于我们
        AnalyticsUtil.onEventWithMap('5_9',{typeName:'5_9'});
        this.props.navigation.navigate('aboutUs')
    }

    /** 跳转到邀请好友  */
    toInviteFriend(){
        //统计-->邀请有礼
        AnalyticsUtil.onEventWithMap('5_2',{typeName:'5_2'});
        this.props.navigation.navigate('inviteFriend',{code:this.state.code})
    }

    /**
     * 我的金币
     */
    toMyGold(){
        //统计-->我的金币
        AnalyticsUtil.onEventWithMap('5_4',{typeName:'5_4'});
        this.props.navigation.navigate('Details',{amount: this.state.balance,goldBalance:this.state.goldBalance,activeTab:0})
    }

    /**
     * 我的钻石
     */
    toMyDiamond(){
        //统计-->我的钻石
        AnalyticsUtil.onEventWithMap('5_4_1',{typeName:'5_4_1'});
        this.props.navigation.navigate('Details',{amount: this.state.balance,goldBalance:this.state.goldBalance,activeTab:1})
    }

    /**
     * 我的娃娃
     */
    toMyDollPress(){
        //统计-->我的娃娃
        AnalyticsUtil.onEventWithMap('5_5',{typeName:'5_5'});
        this.props.navigation.navigate('myDoll')
    }

    /**
     * 我的成就
     */
    toMyAchievement(){
        //统计-->我的成就
        AnalyticsUtil.onEventWithMap('5_10',{typeName:'5_10'});
        this.props.navigation.navigate('Medal',{codeName:this.state.code,nav:'Mine'})
    }

    /**
     * 游戏记录
     */
    toGameHistory(){
        //统计-->游戏记录
        AnalyticsUtil.onEventWithMap('5_6',{typeName:'5_6'});
        this.props.navigation.navigate('gameRecord')
    }
    /*获得关注的内容*/
    attention(){
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            console.log("获得关注内容"+api.attention)
            fetch(api.attention,{method:'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status === 200){
                    return response.json()
                }else{
                    consoleDebug("接口失败")
                }
            }).then((res)=>{
                console.log(res)
                this.setState({content:res.content})
            }).catch((e)=>{
                consoleDebug("获取娃娃攻略url失败"+e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    toWx(){
        //统计-->关注即送金币-点击
        AnalyticsUtil.onEventWithMap('5_3',{typeName:'5_3'});
        this.setState({wxModal:true,attentionModal:false})
        Clipboard.setString('轻松抓娃娃');
    }

    toAttentionModal(){
        //统计-->关注即送金币-进入
        this.setState({attentionModal:true})
    }
    toRecharge(){
        //统计-->我的充值按钮
        AnalyticsUtil.onEventWithMap('5_1',{typeName:'5_1'});
        this.props.navigation.navigate('Recharge',{amount:this.state.balance,userId:this.state.id,from:'Mine'})
    }
    render(){
        const {name, balance, code, id,image,invitee,content,goldBalance,level} = this.state
        var modalBackgroundStyle = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
        };
        return(
            <View style={Platform.OS === 'ios'?styles.wrapAlls:''}>
                <Footer selectTab = {2} navigation={this.props.navigation}/>
                {this.state.toastInfoShow? <View style={styles.toastinfo}>
                    <Text style={{fontSize:setSpText(24),color:'#fff'}}>再按一次退出应用</Text>
                </View>:<View/>}
            <ScrollView style={[styles.container]}>
                {/*版本号*/}
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={this.state.exchangeResult}
                       onRequestClose={()=>{}}>
                    <TouchableHighlight onPress={() => {
                        this.setExchangeResult(false)
                    }} underlayColor='transparent'>
                    <View style={styles.wrapExchangeResult}>
                        <TouchableHighlight onPress={() => {
                            this.setExchangeResult(false)
                        }} underlayColor='transparent'><Image source={cancel_Modal} style={styles.cancelModal}/></TouchableHighlight><Text style={styles.exchangeResult}>数据获取失败</Text>
                    </View></TouchableHighlight>
                </Modal>
                {/*关注即送金币的弹窗*/}
                <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.attentionModal}
                onRequestClose={()=>{}}
            >
                <View style={[styles.containerModal, modalBackgroundStyle]}>
                    <View style={styles.attentionModal}>
                        <View><Text style={styles.attentionModalText}>{content}</Text></View>
                        <View style={styles.modalButton}>
                            <Text style={[styles.attentionText,styles.attentionCancel]} onPress={() => {this.setAttentionModal(false)}}>取消</Text>
                            <Text style={styles.attentionText} onPress={this.toWx.bind(this)}>进入微信</Text>
                        </View>
                    </View>
                </View>
            </Modal>
                {/**************/}
                {/*打开微信*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.wxModal}
                    onRequestClose={()=>{}}
                >
                    <View style={[styles.containerModal, modalBackgroundStyle]}>
                        <View style={styles.wxModal}>
                            <View><Text style={styles.attentionModalText}>"轻松抓娃娃"想要打开您的"微信"</Text></View>
                            <View style={styles.modalButton}>
                                <Text style={[styles.attentionText,styles.attentionCancel]} onPress={() => {this.setWxModal(false)}}>取消</Text>
                                <Text style={styles.attentionText} onPress={this.toOpenWX.bind(this)}>确定</Text>
                            </View>
                        </View>
                    </View>
                </Modal>
                {/****/}
                <ImageBackground source={index_bg} style={styles.mineBg} >
                    <Image source={logo} style={styles.logo}/>
                    {global.iosNoWx?<View/>:<Text onPress={this.toRecharge.bind(this)} style={styles.rechargeText}>充值</Text>}
                    {/*<View style={styles.head}>*/}
                        {/*<Image source={{uri: image !== '/0' && image.length >0?image:'http://media.starcandy.cn/doll/doll_defaultavatar.png'}} style={Platform.OS === 'android'?styles.headImg:styles.headImgIOS} />*/}
                    {/*</View>*/}
                    <TouchableHighlight onPress={this.toMyAchievement.bind(this)} underlayColor='transparent'>
                        <View style={{width:scaleSize(200),height:scaleSize(210)}}>
                            <ImageBackground source={level === 1 || level === 2 || level === 3?level1_bg:level === 4 || level === 5?level2_bg:level === 6 || level === 7?level3_bg:level0_bg} style={level === 6|| level === 7?styles.levelIndexBg6:styles.levelIndexBg}>
                                <Image source={{uri: image !== '/0' && image.length >0?image:'http://media.starcandy.cn/doll/doll_defaultavatar.png'}} style={styles.levelNickNameImg}/>
                                {level === 0?<View/>:<Image source={level === 1?level1:level===2?level2:level === 3?level3:level === 4?level4:level === 5?level5:level === 6?level6:level7} style={{width:scaleSize(33),height:scaleSize(38),position:'absolute',bottom:scaleSize(10),right:scaleSize(10)}}/>}
                            </ImageBackground>
                        </View>

                    </TouchableHighlight>

                    <Text style={styles.name}>{name}</Text>
                    <View style={{flexDirection: 'row',alignItems:'center',width:'100%',justifyContent:'center',marginBottom:scaleSize(20)}}>
                        <TouchableHighlight onPress={this.toMyGold.bind(this)} underlayColor='transparent'>
                            <View style={styles.wrapMineDetail}>
                            <Text style={styles.headTitle}>我的金币</Text>
                            <View style={{marginTop:scaleSize(8),flexDirection:'row',justifyContent:'center'}}>
                                <Image source={little_money} style={styles.littleMoney}/>
                                <Text style={styles.balance}>{goldBalance}</Text></View>
                            </View>
                        </TouchableHighlight>
                        <View style={styles.borderRight}/>
                        <TouchableHighlight onPress={this.toMyDiamond.bind(this)} underlayColor='transparent'>
                            <View style={styles.wrapMineDetail}>
                            <Text style={styles.headTitle}>我的钻石</Text>
                            <View style={{marginTop:scaleSize(8),flexDirection:'row',justifyContent:'center'}}>
                                <Image source={zuanshi} style={styles.littlezuanshi}/>
                                <Text style={styles.balance}>{balance}</Text></View>
                            </View>
                        </TouchableHighlight>
                    </View>
                </ImageBackground>
                <View style={styles.wrapList}>
                    <TouchableHighlight onPress={this.toMyAchievement.bind(this)} underlayColor='transparent'>
                        <View
                            style={{flexDirection: 'row', alignItems: 'center',justifyContent:'center', paddingRight: scaleSize(40), paddingLeft: scaleSize(40),backgroundColor:'#fff',height: scaleSize(88)}}><Image
                            source={myAce} style={styles.indexIcon1}/><Text style={styles.mineIndex1}>我的成就</Text><Image source={arrows} style={styles.arrows}/></View>
                    </TouchableHighlight>
                    <Text style={styles.borderBottom1}/>
                    <TouchableHighlight onPress={this.toMyDollPress.bind(this)} underlayColor='transparent'>
                        <View
                            style={{flexDirection: 'row', alignItems: 'center',justifyContent:'center', paddingRight: scaleSize(40), paddingLeft: scaleSize(40),backgroundColor:'#fff',height: scaleSize(88)}}><Image
                            source={my_doll} style={styles.indexIcon1}/><Text style={styles.mineIndex1}>我的娃娃</Text><Image source={arrows} style={styles.arrows}/></View>
                    </TouchableHighlight>
                    <Text style={styles.borderBottom1}/>
                    {/*<TouchableHighlight onPress={() => this.props.navigation.navigate('Details',{amount: balance,userId:id})} underlayColor='transparent'>*/}
                    <TouchableHighlight onPress={this.toGameHistory.bind(this)} underlayColor='transparent'>
                        <View
                            style={{flexDirection: 'row', alignItems: 'center', paddingRight: scaleSize(40), paddingLeft: scaleSize(40),backgroundColor:'#fff',height: scaleSize(88)}}><Image
                            source={game_record} style={styles.indexIcon2}/><Text style={[styles.mineIndex,{marginLeft:scaleSize(40)}]}>游戏记录</Text><Image
                            source={arrows} style={styles.arrows}/></View></TouchableHighlight>
                    <Text style={styles.borderBottom}/>
                    <TouchableHighlight onPress={this.toInviteFriend.bind(this)} underlayColor='transparent'>
                        <View
                            style={{flexDirection: 'row', alignItems: 'center', paddingRight: scaleSize(40), paddingLeft: scaleSize(40),backgroundColor:'#fff',height: scaleSize(88)}}><Image
                            source={invite} style={styles.indexIcon}/><Text style={styles.mineIndex}>邀请有礼</Text><Image source={arrows}
                                                                                                                       style={styles.arrows}/></View></TouchableHighlight>
                    <Text style={styles.borderBottom}/>
                    <TouchableHighlight onPress={() => this.props.navigation.navigate('Invite',{userId:id,invitee:invitee,code:code})} underlayColor='transparent'>
                        <View
                            style={{flexDirection: 'row', alignItems: 'center', paddingRight: scaleSize(40), paddingLeft: scaleSize(40),backgroundColor:'#fff',height: scaleSize(88)}}><Image
                            source={write_code} style={styles.indexIcon}/><Text style={styles.mineIndex}>输入邀请码</Text><Image
                            source={arrows} style={styles.arrows}/></View></TouchableHighlight>
                    <Text style={styles.borderBottomBold}/>
                    <TouchableHighlight  onPress={() => this.props.navigation.navigate('feedback',{userId:id})} underlayColor='transparent'>
                        <View
                            style={{flexDirection: 'row', alignItems: 'center', paddingRight: scaleSize(40), paddingLeft: scaleSize(40),backgroundColor:'#fff',height: scaleSize(88)}}><Image
                            source={feedback} style={styles.indexIcon}/><Text style={styles.mineIndex7}>问题反馈</Text><Image source={arrows}
                                                                                                                         style={styles.arrows}/></View></TouchableHighlight>
                    <Text style={styles.borderBottom}/>
                    <TouchableHighlight  onPress={this.toDollStrategy.bind(this)} underlayColor='transparent'>
                        <View
                            style={{flexDirection: 'row', alignItems: 'center', paddingRight: scaleSize(40), paddingLeft: scaleSize(40),backgroundColor:'#fff',height: scaleSize(88)}}><Image
                            source={gonglve} style={styles.indexIcon4}/><Text style={styles.mineIndex6}>娃娃攻略</Text><Image source={arrows}
                                                                                                                         style={styles.arrows}/></View></TouchableHighlight>
                    <Text style={styles.borderBottom}/>
                    {global.iosNoWx?<View/>:<TouchableHighlight  onPress={this.toAttentionModal.bind(this)} underlayColor='transparent'>
                        <View
                            style={{flexDirection: 'row', alignItems: 'center', paddingRight: scaleSize(40), paddingLeft: scaleSize(34),backgroundColor:'#fff',height: scaleSize(88)}}><Image
                            source={attention} style={styles.indexIcon5}/><Text style={styles.mineIndex5}>关注即送钻石</Text><Image source={arrows}
                                                                                                                              style={styles.arrows}/></View></TouchableHighlight>}
                    {global.iosNoWx?<View/>: <Text style={styles.borderBottom}/>}
                    <TouchableHighlight onPress={this.toAboutUs.bind(this)} underlayColor='transparent'>
                        <View
                            style={{flexDirection: 'row', alignItems: 'center', paddingRight: scaleSize(40), paddingLeft: scaleSize(40),backgroundColor:'#fff',height: scaleSize(88)}}><Image
                            source={about_us} style={styles.indexIcon6}/><Text style={styles.mineIndex8}>关于我们</Text><Image source={arrows}
                                                                                                                          style={styles.arrows}/></View></TouchableHighlight>
                    <Text style={styles.borderBottom}/>
                    <View style={styles.center}></View>
                </View>
            </ScrollView>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container:{
        flexDirection: 'column',
         height: scaleSize(1191),
    },
    mineBg: {
        height: ifIphoneX(scaleSize(635),scaleSize(587)),
        width: '100%',
        justifyContent:'center',
        alignItems:'center',
        paddingTop:ifIphoneX(scaleSize(48),scaleSize(44))
    },
    mineIndex: {
        fontSize: setSpText(32),
        backgroundColor: '#fff',
        fontFamily: Platform.OS === 'android' ?'Noto Sans CJK SC':'PingFang-SC-Regular', //Noto Sans CJK SC
        marginLeft: scaleSize(30),
        flex: 1,
        textAlign: 'left',
        color:'#323232'
    },
    mineIndex1:{
        fontSize: setSpText(32),
        backgroundColor: '#fff',
        fontFamily: 'PingFang-SC-Regular',  //Noto Sans CJK SC
        marginLeft: scaleSize(36),
        flex: 1,
        textAlign: 'left',
        color:'#323232'
    },
    mineIndex5:{
        fontSize: setSpText(32),
        backgroundColor: '#fff',
        fontFamily: Platform.OS === 'android' ?'Noto Sans CJK SC':'PingFang-SC-Regular', //Noto Sans CJK SC
        marginLeft: scaleSize(17),
        flex: 1,
        textAlign: 'left',
        color:'#323232'
    },
    indexIcon: {
        width: scaleSize(50),
        height: scaleSize(48)
    },
    arrows: {
        width: scaleSize(17),
        height: scaleSize(32)
    },
    quit: {
        width: scaleSize(270),
        height: scaleSize(96),
        justifyContent: 'center',
        marginTop: scaleSize(76)
    },
    distance: {
        height: scaleSize(20),
        borderColor: '#aeaeae'
    },
    center: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor:'#fff'
    },
    borderBottom: {
        height: scaleSize(1),
        backgroundColor: 'rgba(174,174,174,0.4)',
    },
    borderBottom1:{
        height: scaleSize(1),
        backgroundColor: 'rgba(174,174,174,0.4)',
    },
    logo:{
        width:scaleSize(240),
        height:scaleSize(80),
    },
    littleMoney:{
        width:scaleSize(35),
        height:scaleSize(34),
        position:'relative',
        top:scaleSize(22)
    },
    recharge:{
        width:scaleSize(157),
        height:scaleSize(85)
    },
    head:{
        width:scaleSize(182),
        height:scaleSize(182),
        borderRadius:scaleSize(182),
        marginTop:scaleSize(58),
        borderColor:'#fff',
        borderWidth:scaleSize(8),
        shadowColor:'#0ab4c9',//投影
        shadowOffset:{height:scaleSize(4),width:0},
        shadowRadius:2,
        shadowOpacity:1,
    },
    name:{
        fontSize:setSpText(36),
        backgroundColor:'rgba(255,255,255,0)',
        marginTop:scaleSize(16),
        marginBottom:scaleSize(40),
        color:'#fff',
        fontWeight:'bold',
    },
    balance:{
        fontSize:setSpText(48),
        backgroundColor:'transparent',
        color:'#fff',
        fontFamily: Platform.OS === 'android' ?'KaiGenGothicSC-Bold':'PingFang-SC-Medium',
        fontWeight:'bold',
        marginLeft:scaleSize(10)
    },
    wrapList:{
        height:ifIphoneX(scaleSize(1046),scaleSize(986)),
        width:'100%'
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60)
    },
    wrapBack:{
        position:'absolute',
        top:ifIphoneX(scaleSize(90),scaleSize(50)),
        left:scaleSize(30)
    },
    indexIcon1:{
        width: scaleSize(42),
        height: scaleSize(46)
    },
    indexIcon2:{
        width: scaleSize(34),
        height: scaleSize(44),
        marginLeft:scaleSize(4)
    },
    wrapExchangeResult:{
        width:'100%',
        height:ifIphoneX(scaleSize(140),scaleSize(80)),
        backgroundColor:'#ff7171',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        paddingLeft:scaleSize(40),
        paddingRight:scaleSize(40),
        paddingTop:ifIphoneX(scaleSize(44),0)
    },
    exchangeResult:{
        color:'#fff',
        flex:1,
        textAlign:'center'
    },
    cancelModal:{
        width:scaleSize(50),
        height:scaleSize(50)
    },
    headImgIOS:{
        width: '100%',
        height: '100%',
        borderRadius:scaleSize(78)
    },
    headImg:{
        width: '100%',
        height: '100%',
        borderRadius:scaleSize(182)
    },
    indexIcon4:{
        width: scaleSize(40),
        height: scaleSize(44),
        marginRight:scaleSize(2),
        marginLeft:scaleSize(4)
    },
    indexIcon6:{
        width: scaleSize(32),
        height: scaleSize(44),
        marginRight:scaleSize(2),
        marginLeft:scaleSize(10)
    },
    indexIcon5:{
        width: scaleSize(54),
        height: scaleSize(42),
        marginRight:scaleSize(8),
        marginLeft:scaleSize(4)
    },
    /*关注即送金币的模态窗*/
    attentionModal:{
        width:scaleSize(500),
        height:scaleSize(270),
        backgroundColor:'#fff',
        borderRadius:scaleSize(8),
    },
    wxModal:{
        width:scaleSize(500),
        height:scaleSize(180),
        backgroundColor:'#fff',
        borderRadius:scaleSize(8),
    },
    containerModal: {
        flex: 1,
        padding: scaleSize(40),
        alignItems:'center',
        justifyContent:'center'
    },
    modalButton:{
        width:scaleSize(500),
        height:scaleSize(80),
        position:'absolute',
        bottom:0,
        flexDirection:'row',
        borderTopColor:'#e1e2e3',
        borderTopWidth:scaleSize(1),
    },
    attentionCancel:{
        borderRightColor:'#e1e2e3',
        borderRightWidth:scaleSize(1),
    },
    attentionText:{
        flex:1,
        color:'#000',
        height:'100%',
        textAlign:'center',
        fontSize:setSpText(28),
        lineHeight:scaleSize(60)
    },
    attentionModalText:{
        color:'#000',
        fontWeight:'bold',
        fontSize:setSpText(28),
        padding:scaleSize(20),
        paddingTop:scaleSize(30),
        textAlign:'center',
        lineHeight:scaleSize(44)
    },
    mineIndex7:{
        fontSize: setSpText(32),
        backgroundColor: '#fff',
        fontFamily: Platform.OS === 'android' ?'Noto Sans CJK SC':'PingFang-SC-Regular', //Noto Sans CJK SC
        marginLeft: scaleSize(32),
        flex: 1,
        textAlign: 'left',
        color:'#323232'
    },
mineIndex6:{
    fontSize: setSpText(32),
        backgroundColor: '#fff',
        fontFamily: Platform.OS === 'android' ?'Noto Sans CJK SC':'PingFang-SC-Regular', //Noto Sans CJK SC
        marginLeft: scaleSize(33),
        flex: 1,
        textAlign: 'left',
        color:'#323232'
},
    mineIndex8:{
        fontSize: setSpText(32),
        backgroundColor: '#fff',
        fontFamily: Platform.OS === 'android' ?'Noto Sans CJK SC':'PingFang-SC-Regular', //Noto Sans CJK SC
        marginLeft: scaleSize(33),
        flex: 1,
        textAlign: 'left',
        color:'#323232'
    },
    rechargeText:{
        color:'#fff',
        fontSize:setSpText(36),
        position:'absolute',
        top:ifIphoneX(scaleSize(100),scaleSize(50)),
        right:scaleSize(29),
        backgroundColor:'transparent'
    },
    borderRight:{
        width:scaleSize(2),
        height:scaleSize(90),
        backgroundColor:'#fff',
    },
    headTitle:{
        color:'#FFFEFE',
        fontSize:setSpText(32),
        textAlign:'center'
    },
    littlezuanshi:{
        width:scaleSize(37),
        height:scaleSize(34),
        position:'relative',
        top:scaleSize(14)
    },
    wrapAlls:{
        backgroundColor:'#fff',
        height:ifIphoneX(Dimensions.get('window').height-scaleSize(142),Dimensions.get('window').height-scaleSize(97))
    },
    borderBottomBold:{
        height:scaleSize(20),
        width:'100%',
        backgroundColor:'rgba(174,174,174,0.2)'
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
        left:'30%',
        top:'60%',
        zIndex:99,
    },
    wrapMineDetail:{
        width:scaleSize(320),
    },
    levelIndexBg:{
        width:scaleSize(184),
        height:scaleSize(190),
        alignItems:'center',
        justifyContent:'center',
        left:scaleSize(10),
        top:scaleSize(10),
    },
    levelIndexBg6:{
        width:scaleSize(184),
        height:scaleSize(204),
        alignItems:'center',
        justifyContent:'center',
        left:scaleSize(10),
        top:scaleSize(10),
    },
    levelNickNameImg:{
        width:scaleSize(154),
        height:scaleSize(154),
        borderRadius:scaleSize(80),
        marginTop:scaleSize(10)
    },
    levelNickNameImg6:{
        width:scaleSize(154),
        height:scaleSize(154),
        borderRadius:scaleSize(80),
        marginTop:scaleSize(10),
    },
});