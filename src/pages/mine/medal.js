import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Image,
    TouchableHighlight,
    Platform,
    ScrollView,
    Modal,
    BackHandler,
    Linking,
    Alert,
    Clipboard,
    Dimensions,
    FlatList,
    Animated,
    CameraRoll,
    TouchableWithoutFeedback
} from 'react-native';
import {scaleSize, setSpText, ifIphoneX} from '../../common/util';
import {NavigationActions} from 'react-navigation'
import * as WeChat from 'react-native-wechat';
import Headers from '../../common/fetch_header';
import {api} from '../../common/api.config';
import back from '../../resource/back.png';
import {monthTransfer, hourTransfer, consoleDebug, monthTransferTwo} from '../../common/tool'
import titleText from '../../resource/achievement.png';
import crown from '../../resource/crown.png';
import defaul from '../../resource/default.png';
import bg_top from '../../resource/bjTop.png';
import nickBg from '../../resource/sidai.png';
import userTitle from '../../resource/userTitle.png';
import across from '../../resource/across.png';
import one from '../../resource/one.png';
import three from '../../resource/3.png';
import four from '../../resource/4.png';
import sharehead from '../../resource/share-head.png';
import popup0 from '../../resource/popup1.png';
import popup1 from '../../resource/popup2.png';
import popup2 from '../../resource/popup3.png';
import popup3 from '../../resource/popup4.png';
import popup4 from '../../resource/popup5.png';
import popup5 from '../../resource/popup6.png';
import popupX from '../../resource/popupX.png';
import medalLogo from '../../resource/logo.png';
import qrCode from '../../resource/qrcode1.png';
import achieve from '../../resource/achieve.png';
import level0Bg from '../../resource/level0-bg.png';
import level1Bg from '../../resource/level1-bg.png';
import level2Bg from '../../resource/level2-bg.png';
import level3Bg from '../../resource/level3-bg.png';
import level1 from '../../resource/level1.png';
import level2 from '../../resource/level2.png';
import level3 from '../../resource/level3.png';
import level4 from '../../resource/level4.png';
import level5 from '../../resource/level5.png';
import level6 from '../../resource/level6.png';
import level7 from '../../resource/level7.png';
import inlineMedal from '../../resource/inlineMedal.png';
import AnalyticsUtil from "../../components/AnalyticsUtil";
import {captureRef, captureScreen} from "react-native-view-shot";
const DEFAULT_BOTTOM = -300;
const DEFAULT_ANIMATE_TIME = 300;

/**
 * 我的成就
 */
export default class MedalScreen extends Component {
    constructor(props) {
        super(props)
        console.log(props)
        const param  = this.props.navigation.state.params
        this.state = {
            nickName: '',
            nickImg: '',
            medalList: [],
            dollList: [],
            dollListShare:[],
            shareSize:'',
            dollSize: '',
            value: {
                format: "png",
                quality: 0.9,
                result: "tmpfile",
                snapshotContentContainer: true,
                // width:320,
                // height:1400,
            },
            shareImages:'', 
            showActionSheet:false,
            showPopup:false,
            bottom: new Animated.Value(DEFAULT_BOTTOM),
            showIndex:null,
            popupList:[popup0,popup1,popup2,popup3,popup4,popup5],
            shotStatus:false,
            warningList:['用钻石当日第一抓即抓中娃娃',
                        '用钻石连续20抓没有抓中',
                        '用钻石单日抓中10个娃娃',
                        '用钻石累计抓取30种娃娃',
                        '每周数据清空时，位于排行榜周榜第一名',
                        '累计获取金币达到1000',],
            level:0,
            joinTime:0,//进入页面的时间
            quitTime:0,//退出页面的时间
            codeName:param.codeName,
            userId:param.userId,
            nav:param.nav,
            from:param && param.from !== undefined ?param.from:'Home',
            machineId:param && param.machineId !== undefined ?param.machineId:''
        }
    }

    componentWillMount(){
        this.state.joinTime = new Date().getTime();
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid)
        }
        let _this = this;
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret) => {
            console.log(api.medal+this.state.codeName + '勋章');
            let urlDollWallCodeUserId;
            let urlMedalCodeUserId;
            if(this.state.userId===''||this.state.userId===null||this.state.userId===undefined){
                urlDollWallCodeUserId=api.dollWall + '0&userCode='+this.state.codeName;
                urlMedalCodeUserId=api.medal+'userCode='+this.state.codeName
            }else {
                urlDollWallCodeUserId=api.dollWall + '0&userId='+this.state.userId;
                urlMedalCodeUserId=api.medal+'userId='+this.state.userId
            }
            //勋章
            fetch(urlMedalCodeUserId, {method: 'GET', headers: {'Content-Type': 'application/json','api-version':global.versioncode}}).then((res) => (res.json())).then((res) => {
                console.log(res)
                _this.setState({
                    medalList: res.medalList,
                })
                if(res.nickName.length>10){
                    let nickName=res.nickName.substring(0,8)+'...';
                    _this.setState({
                        nickName: nickName,
                        nickImg: res.userImage,
                        level:res.level,
                    })
                }else {
                    _this.setState({
                        nickName: res.nickName,
                        nickImg: res.userImage,
                        level:res.level,
                    })
                }
            }).catch((e) => {
                consoleDebug("获取数据失败")
                throw e
            });
            //娃娃墙

            fetch(urlDollWallCodeUserId, {method: 'GET', headers:{'Content-Type': 'application/json','api-version':global.versioncode}}).then((res) => {
                console.log(res)
                return res.json()
            }).then((res) => {
                console.log(res)
                _this.setState({
                    dollList: res.dolls,
                    dollSize: parseInt(res.size),
                });
                if(res.dolls.length>7){
                    console.log('zoujinglai')
                    _this.setState({
                        dollListShare:res.dolls.slice(0,7),
                    })
                }
            }).catch((e) => {
                consoleDebug("获取数据失败")
                throw e
            })
        }).catch((e) => {
            consoleDebug("获取数据失败")
            throw e
        })
    }

    componentWillUnmount(){
        this.state.quitTime = new Date().getTime()
        let stayTime = Math.ceil((this.state.quitTime  - this.state.joinTime) / 1000)
        //统计-->成就停留时间
        AnalyticsUtil.onEventWithMap('5_10_3',{stayTime:stayTime})
    }

    /*截图*/
    snapshot(refname){
        (refname
            ? captureRef(this.refs[refname], this.state.value)
            : captureScreen(this.state.value)
        )
            .then(
                res =>
                    this.state.value.result !== "tmpfile"
                        ? res
                        : new Promise((success, failure) =>
                            // just a test to ensure res can be used in Image.getSize
                            Image.getSize(
                                res,
                                (width, height) => (
                                    console.log('截图',res.slice(0,200), width, height), success(res),
                                    this.setState({
                                        shareImages:Platform.OS==='ios'?res.slice(8,208):res
                                    })
                                        // CameraRoll.saveToCameraRoll(res)
                                ),
                                failure
                            )
                        )
            )
        .then(res =>
            this.setState({
                res,
                previewSource: {
                    uri:
                        this.state.value.result === "base64"
                            ? "data:image/" + this.state.value.format + ";base64," + res
                            : res
                }
            })
        )
        .catch(
            error => (
                console.warn(error),
                    this.setState({error, res: null, previewSource: null})
            )
        );}

    /*分享到朋友圈*/
    shareCircleImg(){
        let _this = this
        WeChat.isWXAppInstalled().then((isInstalled)=>{
            if (isInstalled) {
                //统计-->分享到朋友圈
                AnalyticsUtil.onEventWithMap('5_10_1_1',{typeName:'5_10_1_1'});
               WeChat.shareToTimeline({
                    type: 'imageFile',
                    title: 'image file download from network',
                    description: 'share image file to time line',
                    mediaTagName: 'email signature',
                    messageAction: undefined,
                    messageExt: undefined,
                    imageUrl:Platform.OS==='ios'?'file://'+_this.state.shareImages:_this.state.shareImages,
                }).catch((error) => {
                        throw error
                    });

            } else {
                Alert('没有安装微信软件，请您安装微信之后再试');
            }
        }).catch((e) => {
            throw e
        });

        _this.setState({showActionSheet:false,shotStatus:false})

    }
    /*分享到朋友*/
    shareSessionImg(){
        let _this = this;
        WeChat.isWXAppInstalled().then((isInstalled)=>{
            if (isInstalled) {
                //统计-->分享到微信
                AnalyticsUtil.onEventWithMap('5_10_1_2',{typeName:'5_10_1_2'});
                WeChat.shareToSession({
                    type: 'imageFile',
                    title: 'image file download from network',
                    description: 'share image file to time line',
                    mediaTagName: 'email signature',
                    messageAction: undefined,
                    messageExt: undefined,
                    imageUrl:Platform.OS==='ios'?'file://'+_this.state.shareImages:_this.state.shareImages,
                })
                    .catch((error) => {
                        Alert(error.message);
                    });
            } else {
                Alert('没有安装微信软件，请您安装微信之后再试');
            }
        })
        _this.setState({showActionSheet:false,shotStatus:false})
    }
    cancel(){
        this.setState({showActionSheet:false,bottom:new Animated.Value(DEFAULT_BOTTOM),shotStatus:false})
    }
    /*显示分享到微信底部按钮*/
    showActionSheet(refname){
        //统计-->分享到微信底部按钮
        AnalyticsUtil.onEventWithMap('5_10_1',{typeName:'5_10_1'});
        this.setState({showActionSheet:true,shotStatus:true})
        Animated.timing(
            this.state.bottom,
            {
                toValue: Platform.OS === 'ios'?0:scaleSize(40),
                duration:DEFAULT_ANIMATE_TIME
            }
        ).start();
        let _this=this;
        setTimeout(()=>{
            _this.snapshot(refname)
        },500)
    }
    onBackAndroid = () => {
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
    /*娃娃展示*/
    _keyExtractor = (item, index) => item.id;
    _renderItem = ({item}) => (<View style={styles.dollAll}>
        <View style={styles.dollThree}>
            {item.map((key, i) => {
                return <View style={styles.dollShow} key={i}>
                    <Image source={{uri: key.dollImage}} style={styles.dollShowImage}/>
                    <View style={styles.dollTextBg}>
                        <Text style={styles.dollText}>
                            {monthTransferTwo(key.createdTime)}
                        </Text>
                    </View>
                </View>
            })}
        </View>
        <Image source={across} style={styles.across}/>
    </View>)
    /*点击勋章*/
    showPopup(index){
        //统计-->勋章点击次数
        AnalyticsUtil.onEventWithMap('5_10_2',{typeName:'5_10_2'});
        this.setState({showPopup:true,showIndex:index})
    }
    /*勋章弹窗*/
    showPopupTan(){
        this.setState({showPopup:false})
    }

    render() {
        return (
            <View>
                <ScrollView
                    ref="full"
                    style={styles.scrollStyle}
                >
                    <View ref='header' style={styles.headers}>
                        <ImageBackground style={this.state.shotStatus&&(this.state.level===6||this.state.level===7)?styles.bg_top_share6:this.state.shotStatus?styles.bg_top_share:this.state.level===6||this.state.level===7?styles.bg_top6: styles.bg_top} source={bg_top}>
                            {/*返回与分享按钮*/}
                            {this.state.shotStatus?<View style={styles.inlineLogo}>
                                <Image source={medalLogo} style={styles.medalLogo} />
                            </View>:<View style={styles.shareAndBack}>
                                <TouchableHighlight onPress={this.onBackAndroid.bind(this)} underlayColor='transparent'>
                                    <Image source={back} style={styles.back}/>
                                </TouchableHighlight>
                                {/*暂时隐藏分享按钮*/}
                                <TouchableHighlight onPress={this.showActionSheet.bind(this,'full')} underlayColor='transparent'>
                                    <Image source={sharehead} style={styles.shareBtn}/>
                                </TouchableHighlight>


                            </View>}
                            {/*用户头像*/}
                            <Image source={titleText} style={this.state.shotStatus?styles.titleTextAchieve:styles.titleText}/>
                            <View style={styles.grade}>
                                <ImageBackground source={this.state.level===1||this.state.level===2||this.state.level===3?level1Bg:this.state.level===4||this.state.level===5?level2Bg:this.state.level===6||this.state.level===7?level3Bg:level0Bg} style={this.state.level===6||this.state.level===7?styles.crown6:styles.crown}>

                                    <Image source={{uri: this.state.nickImg}} style={this.state.level===6||this.state.level===7?styles.defaul6: styles.defaul}></Image>
                                </ImageBackground>
                                {this.state.level===0?<View></View>:<View>
                                    <Image source={this.state.level===1?level1:this.state.level===2?level2:this.state.level===3?level3:this.state.level===4?level4:this.state.level===5?level5:this.state.level===6?level6:this.state.level===7?level7:''} style={this.state.level===6||this.state.level===7?styles.medalLevel6:styles.medalLevel}/>
                                </View>}
                            </View>
                            <ImageBackground source={nickBg} style={styles.nickBg}>
                                <Text style={styles.nickBgText}>{this.state.nickName}</Text>
                            </ImageBackground>
                            {/*勋章展示*/}
                            <View style={styles.medal}>
                                {this.state.medalList.map((val, index) => {
                                    return <TouchableHighlight key={index} onPress={this.showPopup.bind(this,index)} underlayColor='transparent'>
                                            <Image source={{uri: val.image}} style={index===0?styles.medalShow1:styles.medalShow}/>
                                        </TouchableHighlight>
                                })}
                            </View>
                            <View style={styles.medalText}>
                                {this.state.medalList.map((val, index) => {
                                    return <Text key={index} style={index===0?styles.medalFont1:styles.medalFont}>{val.name}</Text>
                                })}
                            </View>
                        </ImageBackground>
                    </View>
                    {/*战利品墙*/}
                    <View ref='section' style={styles.section}>
                        <ImageBackground source={userTitle} style={styles.userTitle}>
                            <Text style={[styles.userTotal,{paddingLeft:this.state.dollSize>99?scaleSize(12):scaleSize(40)}]}>战利品墙({this.state.dollSize})</Text>
                        </ImageBackground>
                        <ImageBackground source={one} style={styles.one}></ImageBackground>
                        <Image source={four} style={this.state.dollList.length<=2?styles.cabinet1:styles.cabinet}>

                            <FlatList style={{}} initialNumToRender={10} data={this.state.showActionSheet&&this.state.dollListShare.length>0?this.state.dollListShare:this.state.dollList}
                                      keyExtractor={this._keyExtractor} renderItem={this._renderItem}>
                            </FlatList>
                        </Image>
                        <ImageBackground source={three} style={this.state.dollList.length<=2?styles.three1:styles.three}/>


                    </View>
                    <View style={this.state.shotStatus?styles.inline:styles.inlineIos}>
                        <Image source={inlineMedal} style={styles.inlineMedal}/>
                        <Text style={styles.inlineText}>更多娃娃请长按识别二维码</Text>
                        <Text style={styles.inlineText}>马上开始“轻松抓娃娃”～</Text>
                        <Image source={qrCode} style={styles.qrCode}/>
                    </View>
                </ScrollView>
                {/*分享*/}
                {this.state.showActionSheet?<View style={styles.main}>
                    <Animated.View style={{bottom: this.state.bottom,flexDirection:'column-reverse'}}>
                        <TouchableWithoutFeedback onPress={this.cancel.bind(this)}>
                            <View style={styles.share}>
                                <Text style={styles.cancel}>取消</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <View style={styles.wrapText}>
                            <TouchableWithoutFeedback onPress={this.shareCircleImg.bind(this)}>
                                <View style={styles.shareText}>
                                    <Text style={styles.sharetexts}>分享到朋友圈</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.shareSessionImg.bind(this)}>
                                <View style={styles.shareText}>
                                    <Text  style={styles.sharetexts}>分享给微信好友</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </Animated.View>
                </View>:<View/>}
                {/*弹窗*/}
                {this.state.showPopup?<View style={styles.popup}>
                    <ImageBackground source={this.state.popupList[this.state.showIndex]} style={styles.popupBg} >
                        <TouchableHighlight onPress={this.showPopupTan.bind(this)} underlayColor='transparent'>
                            <Image source={popupX} style={styles.popupX} />
                        </TouchableHighlight>
                        <View>
                            <Text style={styles.popupText1}>{this.state.medalList[this.state.showIndex].name}</Text>
                        </View>
                        <Text style={styles.popupText2}>
                            {this.state.warningList[this.state.showIndex]}
                        </Text>
                    </ImageBackground>
                </View>:<View></View>}

            </View>
        )
    }
}
const styles = StyleSheet.create({
    scrollStyle:{
        width:'100%',
        minHeight:scaleSize(1122),
        // paddingTop:ifIphoneX(scaleSize(100),scaleSize(0)),
    },
    bg_top: {
        width: '100%',
        height: ifIphoneX(scaleSize(594),scaleSize(536)),

    },
    bg_top6: {
        width: '100%',
        height: scaleSize(562),
    },
    bg_top_share:{
        width:'100%',
        height:scaleSize(625),
    },
    bg_top_share6:{
        width:'100%',
        height:scaleSize(645),
    },
    shareAndBack:{
        flexDirection:'row',
        justifyContent:'center',
    },
    back: {
        width: scaleSize(60),
        height: scaleSize(60),
        marginLeft: scaleSize(0),
        marginTop:ifIphoneX(scaleSize(80),scaleSize(40)),
    },
    shareBtn: {
        width: scaleSize(60),
        height: scaleSize(60),
        marginLeft: scaleSize(590),
        marginTop:ifIphoneX(scaleSize(80),scaleSize(40)),

    },
    titleText: {
        width: scaleSize(153),
        height: scaleSize(35),
        marginLeft: scaleSize(310),
        marginTop: scaleSize(-50),
    },
    titleTextAchieve:{
        width:scaleSize(153),
        height: scaleSize(35),
        marginLeft:scaleSize(310),
        marginTop:scaleSize(20)
    },
    titleTextShare: {
        width: scaleSize(153),
        height: scaleSize(35),
        marginLeft: scaleSize(310),
        marginTop: scaleSize(20),
    },
    grade: {
        flexDirection: 'row',
    },
    crown: {
        width: scaleSize(206),
        height: scaleSize(210),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scaleSize(290),
        marginTop: scaleSize(15),
        marginBottom:scaleSize(10)
    },
    crown6: {
        width: scaleSize(202),
        height: scaleSize(221),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scaleSize(290),
        marginTop: scaleSize(20),
        marginBottom:scaleSize(10)
    },
    medalLevel:{
        width:scaleSize(37),
        height:scaleSize(43),
        marginLeft:scaleSize(-50),
        marginTop:scaleSize(160)
    },
    medalLevel6:{
        width:scaleSize(37),
        height:scaleSize(43),
        marginLeft:scaleSize(-50),
        marginTop:scaleSize(180)
    },
    defaul: {
        width: scaleSize(166),
        height: scaleSize(166),
        borderRadius: scaleSize(80),
        marginTop:scaleSize(12),
    },
    defaul6: {
        width: scaleSize(166),
        height: scaleSize(166),
        borderRadius: scaleSize(80),
        marginTop:scaleSize(20)
    },
    nickBg: {
        width: scaleSize(356),
        height: scaleSize(64),
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: scaleSize(215),
        marginBottom:scaleSize(10)

    },
    nickBgText: {
        fontSize: scaleSize(30),
        color: '#323232',
        backgroundColor:'transparent',
    },
    medal: {
        flexDirection: 'row',
        justifyContent:'center',
        marginTop: scaleSize(-10),
    },
    medalShow: {
        width: scaleSize(96),
        height: scaleSize(96),
        borderRadius: scaleSize(50),
        marginLeft: scaleSize(30),
    },
    medalShow1: {
        width: scaleSize(96),
        height: scaleSize(96),
        borderRadius: scaleSize(50),
        marginLeft: scaleSize(0),
    },
    medalText: {
        width: '100%',
        height: scaleSize(47),
        flexDirection: 'row',
        justifyContent:'center',
        marginTop: scaleSize(5)
    },
    medalFont: {
        paddingLeft: Platform.OS==='ios'?scaleSize(24):scaleSize(30),
        fontSize: scaleSize(24),
        color: '#323232',
        paddingTop: Platform.OS==='ios'?scaleSize(12):scaleSize(10),
        backgroundColor:'transparent',
    },
    medalFont1: {
        fontSize: scaleSize(24),
        color: '#323232',
        paddingTop: Platform.OS==='ios'?scaleSize(12):scaleSize(10),
        backgroundColor:'transparent',
    },
    section: {
        width: '100%',
        minHeight: ifIphoneX(scaleSize(1028),scaleSize(828)),
        backgroundColor: 'rgba(255,216,97,1)',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: scaleSize(36),
    },
    userTitle: {
        width: scaleSize(320),
        height: scaleSize(80),
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 9,
        marginBottom: scaleSize(-30),
        backgroundColor:'transparent',
    },
    userTotal: {
        width:scaleSize(300),
        color: '#ffffff',
        fontSize: scaleSize(38),
        paddingTop: scaleSize(5),
        fontWeight: 'bold',
    },
    cabinet: {
        width: scaleSize(705),
        height:null,
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        resizeMode: 'stretch',
    },
    cabinet1: {
        width: scaleSize(705),
        minHeight:scaleSize(615),
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        resizeMode: 'stretch',
    },
    one: {
        width: scaleSize(705),
        flex: 1,
        height:ifIphoneX(scaleSize(0),scaleSize(40)) ,
    },
    three: {
        width: scaleSize(705),
        height: ifIphoneX(scaleSize(0),scaleSize(35)),
        marginBottom: ifIphoneX(scaleSize(115),scaleSize(30)),
        flex: 1,
    },
    three1: {
        width: scaleSize(705),
        height: ifIphoneX(scaleSize(0),scaleSize(25)),
        marginBottom: scaleSize(30),
        flex: 1,
    },
    dollAll: {
        marginTop: scaleSize(70),
    },
    dollThree: {
        flexDirection: 'row',
    },
    dollShow: {
        marginLeft: scaleSize(64),
        zIndex: 9
    },
    dollShow1: {
        marginLeft: scaleSize(10),
        zIndex: 9
    },
    dollTextBg: {
        width: scaleSize(120),
        height: scaleSize(32),
        borderRadius: scaleSize(16),
        marginTop: scaleSize(-28),
        marginLeft: scaleSize(5),
        backgroundColor: 'rgba(255,234,24,1)',
    },
    dollText: {
        width: scaleSize(120),
        height: scaleSize(32),
        fontSize: scaleSize(20),
        color: 'rgba(50,50,50,1)',
        borderRadius: scaleSize(16),
        borderWidth: scaleSize(3),
        borderColor: 'rgba(181,117,3,0.8)',
        textAlign: 'center',
        paddingTop:Platform.OS==='ios'?scaleSize(2):scaleSize(0),
        backgroundColor:'transparent',
        marginTop:Platform.OS==='ios'?scaleSize(-3):scaleSize(0),
    },
    across: {
        width: scaleSize(619),
        height: scaleSize(65),
        marginTop: scaleSize(-30),
        marginLeft: scaleSize(18),
        zIndex:Platform.OS=== 'ios'?-1:0,
    },
    dollShowImage: {
        width: scaleSize(132),
        height: scaleSize(127),
        borderWidth: scaleSize(3),
        borderColor: 'rgba(181,117,3,0.6)',
        borderRadius: scaleSize(65),
    },
    main:{
        flex:1,
        position:'absolute',
        top:0,
        left:0,
        bottom:Platform.OS==='ios'?scaleSize(10):scaleSize(-30),
        right:0,
        flexDirection:'column-reverse',
        backgroundColor:'rgba(0,0,0,0.2)',
        padding:scaleSize(16),
        paddingBottom:Platform.OS === 'ios'?ifIphoneX(scaleSize(44),0):scaleSize(0),
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
    popup:{
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0,0,0,0.7)',
        position:'absolute',
        left:0,
        bottom:0,
        top:0,
        right:0,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
    },
    popupBg:{
        width:scaleSize(459),
        height:scaleSize(555),
        flexDirection:'column',
        alignItems:'center',
    },
    popupX:{
        width:scaleSize(40),
        height:scaleSize(40),
        marginTop:scaleSize(50),
        marginLeft:scaleSize(320),
    },
    popupText1:{
        fontSize:scaleSize(54),
        color:'rgba(239,73,76,1)',
        fontWeight:'bold',
        paddingTop:scaleSize(115)
    },
    popupText2:{
        width:scaleSize(282),
        fontSize:scaleSize(36),
        color:'#fff',
        paddingTop:scaleSize(64),
        fontWeight:'500',
    },
    popupText3:{
        fontSize:scaleSize(36),
        color:'#fff',
        fontWeight:'500',
    },
    inline:{
        flexDirection:'column',
        alignItems:'center',
        height:scaleSize(400),
        backgroundColor: 'rgba(255,216,97,1)',
    },
    inlineIos:{
        flexDirection:'column',
        alignItems:'center',
        height:scaleSize(0),
        overflow:'hidden'
    },
    inlineMedal:{
        width:scaleSize(526),
        height:scaleSize(36),
        marginTop:scaleSize(20),
        marginBottom:scaleSize(27)
    },
    inlineText:{
        fontSize:scaleSize(30),
        color:'rgba(177,114,3,1)',

    },
    qrCode:{
        width:scaleSize(214),
        height:scaleSize(214),
        marginTop:scaleSize(24),
        marginBottom:scaleSize(30)
    },
    inlineLogo:{
        flexDirection:'column',
        alignItems:'center',
        marginTop:scaleSize(24),
    },
    medalLogo:{
        width:scaleSize(240),
        height:scaleSize(80),
    },

});