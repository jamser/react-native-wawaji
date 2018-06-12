import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Image,
    TouchableHighlight,
    ScrollView,
    Modal,
    Platform,
    BackHandler,
    FlatList,
    TouchableWithoutFeedback
} from 'react-native';
import index_bg from '../../resource/mainBG.png'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import back from '../../resource/back.png'
import {api} from '../../common/api.config'
import cancel_Modal from '../../resource/cancel.png'
import doll_title from '../../resource/game-record.png'
import arrow from '../../resource/arrows.png'
import play_game from '../../resource/play-game.png'
import recharge_coin from '../../resource/recharge-coin.png'
import {monthTransfer, hourTransfer,consoleDebug} from '../../common/tool'
import {NavigationActions} from 'react-navigation'
import Headers from '../../common/fetch_header'
import zuanshi from '../../resource/mine-zuanshi.png'
import AnalyticsUtil from '../../components/AnalyticsUtil'

/**
 * 游戏记录
 */
export default class myDollScreen extends Component {
    constructor(props) {
        super(props)
        const navigation = this.props.navigation;
        this.state = {
            dollList: [],
            selected: [],
            selectMoney: 0,
            selectImage: [],
            modalVisible: false,
            userId: null,
            exchangeResult: false,
            defaultInfo: '',
            error: '',
            page: 0,
            isRefreshing: false,
            name:'',
            dateTime:'',
            status:'',
            image:'',
            machineId:navigation.state.params && navigation.state.params.machineId !== undefined?navigation.state.params.machineId:null
        }
    }
    /* 设置 监听 安卓手机上的 物理 返回按键*/
    componentWillMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid)
        }
    }
    /*如果这个页面是从Room 调过来的就 还是跳回Room去，一定记得传machineId*/
    onBackAndroid = () => {
        const nav = this.props.navigation;
        if(this.state.machineId !== null){
            nav.navigate('Room',{machineId:this.state.machineId});
            return true;
        }else{
            nav.navigate('Mine');
            return true;
        }
    };
   /*拿到 游戏记录 的列表*/
    componentDidMount() {
        this.getDollList()
    }
        /*选中某条游戏记录*/
    selectDoll(id,name,dateTime,status,image,navStatus) {
        if(navStatus === 'INDEFINITE' || navStatus === 'FAILURE' ) {
            //统计-->游戏记录 抓取失败
            AnalyticsUtil.onEventWithMap('5_6_2',{typeName:'5_6_2'});
            storage.save({
                key: 'Info',   // Note: Do not use underscore("_") in key!
                data: [id, name, dateTime, status, image],
            });
            const nav = this.props.navigation
            nav.navigate('gameDetail')
        }
    }

    getDollList() {
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
            fetch(api.gameRecord, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    return
                }else{
                    return response.json()
                }
            }).then((res)=>{
                consoleDebug(JSON.stringify(res)+"成功")
                if(res.content.length === 0){
                    _this.setState({defaultInfo:'还没有抓到娃娃'})
                }
                _this.setState({dollList:res.content,userId:userId})
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    /*游戏记录 点击中间的播放按钮 跳转到 视频加载 的webview页面*/
    toGameVideo(status,id){
        let result
        if(status === 'INDEFINITE' || status === 'FAILURE' || status === 'CANCEL'){
            result = 'fail'
        }else{
            result = 'success'
        }
        //let param = encodeURIComponent("name="+global.code+"&id="+id)
        //let url = api.videoUrl+"&name="+global.code+"&id="+id
        //let url = api.newVideoUrl+param
        // console.log(url)
        // const nav = this.props.navigation
        // const resetAction = NavigationActions.reset({
        //     index: 0,
        //     actions: [
        //         NavigationActions.navigate({ routeName: 'Webview',params:{url:url,from:'game',result:result,userDollId:id}})
        //     ]
        // })
        // nav.dispatch(resetAction)
        //统计-->游戏记录视频
        AnalyticsUtil.onEventWithMap('5_6_1',{typeName:'5_6_1'});
        this.getWebviewInfo(global.code,id,result)
    }
    getWebviewInfo(code,id,result){
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            let url = api.getShareVideo+'name='+code+'&id='+id
            fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                console.log("走到这里哈哈哈")
                console.info(response)
                if(response.status !== 200){
                    return
                }else{
                    return response.json()
                }
            }).then((res)=>{
                let param = encodeURIComponent('name='+code+'&id='+id+'&nickName='+res.nickName+'&avatar='+res.avatar+'&dollImage='+res.dollImage+'&videoUrl='+res.videoUrl+'&dollName='+res.dollName+'&dollAmount='+res.dollAmount+'&status='+res.status)
                let url = api.newVideoUrl+param
                console.log("抓取"+url)
                const nav = this.props.navigation
                const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'Webview',params:{url:url,from:'game',result:result,userDollId:id}})
                    ]
                })
                nav.dispatch(resetAction)
            }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    _keyExtractor = (item, index) => item.id;

    _renderItem = ({item}) => (
        <View>
            <TouchableHighlight
                onPress={this.selectDoll.bind(this, item.id, item.name, item.createdTime,item.appealStatus,item.image,item.status)} underlayColor='transparent'>
                <View style={styles.wrapDoll}>
                    <TouchableHighlight onPress={this.toGameVideo.bind(this,item.status,item.id)} underlayColor='transparent'>
                    <View style={styles.dollImg}><Image source={{uri: item.image}}
                                                        style={styles.dollImgWidth}/>
                        <Image source={play_game} style={styles.playGame}/>
                    </View>
                    </TouchableHighlight>
                    <View style={{flex: 1}}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <View style={[styles.row,styles.middleHeight]}>
                            <Text style={styles.date}>{monthTransfer(item.createdTime)}</Text>
                            <Text style={styles.detailTime}>{hourTransfer(item.createdTime)}</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <Image source={item.coinType === 'DIAMOND'?zuanshi:recharge_coin} style={item.coinType === 'DIAMOND'?styles.rechargeZuanshi:styles.rechargeCoins}/><Text style={styles.coinText}>X</Text><Text style={styles.coinText}>{item.practice === 'NO'?item.coinType === 'DIAMOND'?item.coin:item.goldCoin:item.coinType === 'DIAMOND'?item.practiceCoin:item.practiceGoldCoin}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection:'row'}}>
                        {item.status === 'INDEFINITE' || item.status === 'FAILURE' ?
                        <Text style={styles.watis}>抓取失败</Text>:item.status === 'CANCEL'?<Text style={styles.wait}>已退币</Text>:<Text style={styles.wait}>抓取成功</Text>}
                        <Image source={arrow} style={styles.arrow}/>
                    </View>
                </View>
            </TouchableHighlight>
        </View>
    );
    render() {
        const {dollList, defaultInfo, error} = this.state
        return (
            <ImageBackground source={index_bg} style={styles.mainBg}>
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={this.state.exchangeResult}
                       onRequestClose={() => {}}>
                    <View style={styles.wrapExchangeResult}>
                        <TouchableHighlight onPress={() => {
                            this.setExchangeResult(false)
                        }} underlayColor='transparent'><Image source={cancel_Modal}
                                                              style={styles.cancelModal}/></TouchableHighlight><Text
                        style={styles.exchangeResult}>{error}</Text>
                    </View>
                </Modal>
                <View style={styles.headers}>
                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Mine')}>
                        <Image source={back} style={styles.back}/>
                    </TouchableWithoutFeedback>
                    {/*<View style={{flex: 1, alignItems: 'center'}}>*/}
                        <Image source={doll_title} style={styles.title}/>
                    {/*</View>*/}
                </View>
                {dollList.length === 0 ?<View style={styles.noDoll}><Text
                    style={styles.noDollText}>{defaultInfo}</Text></View> : <FlatList style={{paddingLeft:scaleSize(15),paddingRight:scaleSize(32),width:'100%',paddingBottom:scaleSize(160)}} initialNumToRender={20} data={dollList}  keyExtractor={this._keyExtractor} renderItem={this._renderItem}>
                </FlatList>}
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    mainBg: {
        flex: 1,
        width: null,
        height: null,
        alignItems: 'center',
        flexDirection: 'column',
        paddingTop:ifIphoneX(scaleSize(30)),
    },
    wrapDoll: {
        // width:scaleSize(345),
        width: '100%',
        height: scaleSize(188),
        backgroundColor: '#fff',
        borderRadius: scaleSize(20),
        paddingRight: scaleSize(20),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scaleSize(10),
        marginBottom: scaleSize(20)
    },
    dollImg: {
        width: scaleSize(137),
        height: scaleSize(137),
        borderWidth: scaleSize(1),
        borderColor: '#44E1F4',
        borderRadius: scaleSize(34),
        marginLeft: scaleSize(32),
        marginRight: scaleSize(32),
        position:'relative'
    },
    selected: {
        width: scaleSize(45.8),
        height: scaleSize(44.6)
    },
    date: {
        marginTop: scaleSize(10),
        marginBottom: scaleSize(10),
        color: '#666666',
        fontSize: setSpText(26),
    },
    row: {
        flexDirection: 'row',
        width: '100%',
    },
    name: {
        fontFamily: "PingFang-SC-Medium",
        fontSize: setSpText(32),
        color: '#323232'
    },
    detailTime: {
        marginLeft: scaleSize(20),
        marginTop: scaleSize(10),
        marginBottom: scaleSize(10),
        fontSize: setSpText(26),
        color: '#666666',
    },
    wait: {
        color: '#FF7171',
        fontSize: setSpText(30),
        textAlign:'right'
    },
    watis:{
        color:'#8AEDFC',
        fontSize: setSpText(30),
        textAlign:'right'
    },
    exchangeSum: {
        color: '#666666',
        fontSize: setSpText(26),
        flex: 1
    },
    distribution: {
        width: scaleSize(177.4),
        height: scaleSize(67.3)
    },
    exchange: {
        width: scaleSize(177.4),
        height: scaleSize(67.3),
        marginLeft: scaleSize(20)
    },
    already: {
        fontSize: setSpText(32),
        color: '#1a1a1a',
        flex: 1,
        marginLeft: scaleSize(40)
    },
    clickIcon: {
        width: scaleSize(44),
        height: scaleSize(44)
    },
    footer: {
        width: '100%',
        height: scaleSize(98),
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: scaleSize(50),
        paddingRight: scaleSize(50),
    },
    back: {
        width: scaleSize(60),
        height: scaleSize(60),
        position:'absolute',
        left:scaleSize(30),
    },
    headers: {
        width:'100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scaleSize(60),
        paddingLeft: scaleSize(30),
        paddingRight: scaleSize(40),
        marginBottom: scaleSize(20),
        position:'relative'
    },
    title: {
        width:scaleSize(188),
        height:scaleSize(40)
    },
    fonts: {
        fontSize: setSpText(48),
        marginTop: scaleSize(62),
        backgroundColor: 'transparent',
        color: '#323232',
        fontFamily: 'PingFang SC'
    },
    font: {
        fontSize: setSpText(48),
        marginTop: scaleSize(20),
        backgroundColor: 'transparent',
        color: '#323232',
        fontFamily: 'PingFang SC'
    },
    exchange_success: {
        width: scaleSize(653),
        height: scaleSize(668),
        marginTop: scaleSize(240),
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirm: {
        width: scaleSize(273),
        height: scaleSize(96),
        marginTop: scaleSize(57)
    },
    cancel: {
        width: scaleSize(100),
        height: scaleSize(100),
        marginLeft: scaleSize(540)
    },
    container: {
        flex: 1,
        padding: scaleSize(40),
        alignItems: 'center',
    },
    noDollText: {
        color: '#fff',
        backgroundColor: 'transparent',
        fontSize: setSpText(40)
    },
    noDoll: {
        flex: 1,
        height: scaleSize(600),
        alignItems: 'center',
        justifyContent: 'center'
    },
    wrapExchangeResult: {
        height:ifIphoneX(scaleSize(140),scaleSize(80)),
        backgroundColor:'#ff7171',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        paddingLeft:scaleSize(40),
        paddingRight:scaleSize(40),
        paddingTop:ifIphoneX(scaleSize(44),0)
    },
    exchangeResult: {
        color: '#fff',
        flex: 1,
        textAlign: 'center'
    },
    cancelModal: {
        width: scaleSize(50),
        height: scaleSize(50)
    },
    dollImgWidth: {
        width: '100%',
        height: '100%',
        borderRadius: scaleSize(34)
    },
    arrow:{
        width:scaleSize(14),
        height:scaleSize(25),
        marginLeft:scaleSize(16),
        position:'relative',
        top:Platform.OS === 'ios'?scaleSize(3):scaleSize(10)
    },
    middleHeight:{
        height:scaleSize(54),
        alignItems:'center'
    },
    /*我的娃娃 播放游戏视频*/
    playGame:{
        width:scaleSize(66),
        height:scaleSize(66),
        position:'absolute',
        left:'26%',
        top:'26%'
    },
    rechargeCoins:{
        width:scaleSize(36),
        height:scaleSize(36)
    },
    coinText:{
        fontSize:setSpText(26),
        marginLeft:scaleSize(10)
    },
    rechargeZuanshi:{
        width:scaleSize(38),
        height:scaleSize(36)
    }
})