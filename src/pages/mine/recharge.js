import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Image,
    TouchableHighlight,
    Modal,
    BackHandler,
    Platform,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';
import {scaleSize, setSpText, ifIphoneX} from '../../common/util'
import index_bg from '../../resource/recharge-bg.png'
import little_money from '../../resource/zuanshi-room.png'
import back from '../../resource/back.png'
import {api} from '../../common/api.config'
import title from '../../resource/recharge-title.png'
import cancel_Modal from '../../resource/cancel.png'
import recharge_success from '../../resource/rechragesuccess.png'
import confirm from '../../resource/confirm.png'
import {NavigationActions} from 'react-navigation'
import * as WeChat from 'react-native-wechat';
import {consoleDebug} from '../../common/tool'
import first_coin from '../../resource/zuanshi-recharge.png'
import recommend from '../../resource/recommend.png'
import first_recharge from '../../resource/first-recharge.png'
import AnalyticsUtil from '../../components/AnalyticsUtil'
import Headers from '../../common/fetch_header'
import level1_bg from '../../resource/level1-bg.png'
import level2_bg from '../../resource/level2-bg.png'
import level3_bg from '../../resource/level3-bg.png'
import level0_bg from '../../resource/level0-bg.png'
import level1 from '../../resource/level1.png'
import level2 from '../../resource/level2.png'
import level3 from '../../resource/level3.png'
import level4 from '../../resource/level4.png'
import level5 from '../../resource/level5.png'
import level6 from '../../resource/level6.png'
import level7 from '../../resource/level7.png'
import price_bg from '../../resource/recharge-price-bg.png'

/**
 * 充值
 */
export default class RechargeScreen extends Component {
    constructor(props) {
        super(props)
        const navigation = this.props.navigation;
        this.state = {
            userId: navigation.state.params && navigation.state.params.userId !== undefined ? navigation.state.params.userId : null,
            priceList: [],
            exchangeResult: false,
            error: '',
            balance: 0,
            rechargeResult: false,
            num: 0,
            isRecharge: false,
            from: navigation.state.params && navigation.state.params.from !== undefined ? navigation.state.params.from : 'Room',
            machineId: navigation.state.params && navigation.state.params.machineId !== undefined ? navigation.state.params.machineId : null,
            image: '',
            vipInfo: [{}],
            taskId: 0,
            needDiamond: 0,
            getCoin: 0,
            getDiamond: 0,
            nextLevel: 0,
            processed: false,
            progress: 0,
        }
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid)
        }
    }

    onBackAndroid = () => {
        const nav = this.props.navigation;
        if (this.state.from === 'Room') {
            nav.navigate('Room', {machineId: this.state.machineId})
        } else {
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({routeName: 'Mine'})
                ]
            })
            nav.dispatch(resetAction)
        }
        return true
    };

    componentDidMount() {
        this.getCharge(-1)    //获取当前的余额
        let _this = this
        let url = api.priceList
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret) => {
            /*获得 priceList 套餐列表*/
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + ret[0],
                    'api-version': global.versioncode,
                    'Version': 2
                }
            }).then((response) => {
                if (response.status !== 200) {
                    _this.setState({exchangeResult: true, error: '数据获取失败'})
                } else {
                    return response.json()
                }
            }).then((res) => {
                consoleDebug(JSON.stringify(res) + "成功")
                _this.setState({priceList: res.responseList, needDiamond: res.needDiamond, nextLevel: res.nextLevel})
            }).catch((e) => {
                consoleDebug("失败" + e)
            });
            //vipInfo
            fetch(api.vipInfo, {method: 'GET', headers: Headers(ret[0])}).then((response) => {
                if (response.status !== 200) {
                } else {
                    return response.json()
                }
            }).then((res) => {
                console.info('vipInfo', res)
                let progress = Math.abs((1 - (res.vipLevelResponse.needDiamond / res.vipLevelResponse.betweenDiamond)) * 351);
                _this.setState({
                    vipInfo: res.responseList,
                    taskId: res.weekPrizeResponse.taskId,
                    needDiamond: res.vipLevelResponse.needDiamond,
                    currentLevel: res.vipLevelResponse.currentLevel,
                    getDiamond: res.weekPrizeResponse.diamond,
                    getCoin: res.weekPrizeResponse.coin,
                    processed: res.weekPrizeResponse.processed,
                    nextLevel: res.vipLevelResponse.nextLevel,
                    progress: progress
                })
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e) => {
            consoleDebug("storage 读取失败")
            throw e
        })
    }

    setExchangeResult(visible) {
        this.setState({exchangeResult: visible});
    }

    recharge(id, coin, gift) {
        let _this = this
        //统计-->充值成功套餐
        if (_this.state.from === 'Mine') {
            AnalyticsUtil.onEventWithMap("5_1_1", {packageId: id});
        } else {
            AnalyticsUtil.onEventWithMap("4_3_1_1", {packageId: id});
        }

        if (_this.state.isRecharge) {
            return
        }
        _this.setState({isRecharge: true})
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret) => {
            /*充值的时候，把每个套餐的id作为参数传递进去*/
            let url = api.recharge + '?packageId=' + id
            consoleDebug(url + "充值")
            fetch(url, {method: 'POST', header: Headers(ret[0])}).then((res) => {
                if (res.status !== 200) {
                    _this.setState({exchangeResult: true, error: '充值失败，请稍后重试', isRecharge: false})
                    return
                } else {
                    return res.json()
                }
            }).then((res) => {
                console.info("充值")
                console.info(res)
                WeChat.isWXAppInstalled().then((isInstalled) => {
                    if (isInstalled) {
                        WeChat.pay(
                            {
                                partnerId: res.partnerid,  // 商家向财付通申请的商家id
                                prepayId: res.prepayid,   // 预支付订单
                                nonceStr: res.noncestr,   // 随机串，防重发
                                timeStamp: res.timestamp,  // 时间戳，防重发
                                package: res.package_,    // 商家根据财付通文档填写的数据和签名
                                sign: res.sign       // 商家根据微信开放平台文档对数据做的签名
                            }
                        ).then((res) => {
                            //统计-->充值成功套餐
                            if (_this.state.from === 'Mine') {
                                AnalyticsUtil.onEventWithMap("5_1_1", {packageId: id, status: '成功'});
                            } else {
                                AnalyticsUtil.onEventWithMap("4_3_1_1", {packageId: id, status: '成功'});
                            }

                            _this.setState({rechargeResult: true, num: (+coin) + (+gift), isRecharge: false})
                            _this.getCharge(id)
                        }).catch((e) => {
                            consoleDebug(e)
                            _this.setState({isRecharge: false})
                            throw e
                        })
                    } else {
                        _this.setState({isRecharge: false})
                        Alert("您没有安装微信")
                    }
                })
            }).catch((e) => {
                _this.setState({isRecharge: false})
                throw e
            })
        }).catch((e) => {
            consoleDebug("获取数据失败")
            _this.setState({isRecharge: false})
            throw e
        })
    }

    /*获取当前的余额*/
    getCharge(id) {
        let _this = this
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret) => {
            fetch(api.userInfo, {method: 'GET', headers: Headers(ret[0])}).then((response) => {
                if (response.status !== 200) {
                    _this.setState({exchangeResult: true, error: '数据获取失败'})
                } else {
                    return response.json()
                }
            }).then((res) => {
                consoleDebug(JSON.stringify(res) + "成功")
                if (id > -1) {
                    //统计-->充值成功后套餐
                    if (_this.state.from === 'Mine') {
                        AnalyticsUtil.onEventWithMap("5_1_2", {packageId: id, status: '成功'});
                    } else {
                        AnalyticsUtil.onEventWithMap("4_3_1_2", {packageId: id, status: '成功'});
                    }
                }
                _this.setState({balance: res.balance, image: res.image, level: res.level})
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e) => {
            consoleDebug("获取数据失败")
            throw e
        })
    }

    setChargeResult(visible) {
        this.setState({rechargeResult: visible});
    }

    /*跳转到 VIP 特权 页面*/
    toVip() {
        const nav = this.props.navigation;
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({routeName: 'Vip'})
            ]
        })
        nav.dispatch(resetAction)
    }

    toDetail() {
        const nav = this.props.navigation;
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({routeName: 'Vip'})
            ]
        })
        nav.dispatch(resetAction)
    }

    render() {
        const {goBack, state} = this.props.navigation;
        const {priceList, error, balance, num, from} = this.state
        var modalBackgroundStyle = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        };
        return (
            <ImageBackground source={index_bg} style={styles.background}>
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={this.state.exchangeResult}>
                    <View style={styles.wrapExchangeResult}>
                        <TouchableHighlight onPress={() => {
                            this.setExchangeResult(false)
                        }} underlayColor='transparent'><Image source={cancel_Modal}
                                                              style={styles.cancel}/></TouchableHighlight><Text
                        style={styles.exchangeResult}>{error}</Text>
                    </View>
                </Modal>
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={this.state.rechargeResult}>
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={recharge_success} style={styles.success}>
                            <Text style={styles.fonts}>恭喜您，获得</Text>
                            <Text style={styles.font}>{num}钻石</Text>
                            <TouchableHighlight onPress={() => {
                                this.setChargeResult(false)
                            }} underlayColor='transparent'>
                                <Image source={confirm} style={styles.confirm}/></TouchableHighlight>
                        </ImageBackground>
                    </View>
                </Modal>
                <View style={styles.headers}>
                    <TouchableWithoutFeedback onPress={this.onBackAndroid.bind(this)} underlayColor='transparent'>
                        <Image source={back} style={styles.back}/>
                    </TouchableWithoutFeedback>
                    <View>
                        <Image source={title} style={styles.title}/></View>
                </View>
                <TouchableWithoutFeedback onPress={this.toVip.bind(this)}>
                    <View style={{
                        width: scaleSize(126),
                        height: scaleSize(48),
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: scaleSize(2),
                        borderColor: '#333',
                        borderRadius: scaleSize(24),
                        position: 'absolute',
                        top: scaleSize(140),
                        right: scaleSize(30)
                    }}><Text style={{
                        fontSize: setSpText(26),
                        color: '#333',
                        backgroundColor: 'transparent'
                    }}>VIP特权</Text></View>
                </TouchableWithoutFeedback>
                <View style={{
                    width: scaleSize(170),
                    height: scaleSize(170),
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: scaleSize(170),
                    alignItems: 'center',
                    marginTop: scaleSize(48)
                }}>
                    <ImageBackground
                        source={this.state.level === 0 ? level0_bg : this.state.level === 1 || this.state.level === 2 || this.state.level === 3 ? level1_bg : this.state.level === 4 ? level2_bg : this.state.level === 5 || this.state.level === 6 ? level3_bg : ''}
                        style={this.state.level === 6 || this.state.level === 7 ? styles.levelBg6 : styles.levelBg}>
                        <Image
                            source={{uri: this.state.image !== '/0' && this.state.image.length > 0 ? this.state.image : 'http://media.starcandy.cn/doll/doll_defaultavatar.png'}}
                            style={this.state.level === 6 || this.state.level === 7 ? styles.nickImg6 : styles.nickImg}/>
                        <Image
                            source={this.state.level === 1 ? level1 : this.state.level === 2 ? level2 : this.state.level === 3 ? level3 : this.state.level === 4 ? level4 : this.state.level === 5 ? level5 : this.state.level === 6 ? level6 : this.state.level === 7 ? level7 : ''}
                            style={{
                                width: scaleSize(33),
                                height: scaleSize(38),
                                position: 'absolute',
                                bottom: 0,
                                right: 0
                            }}/>
                    </ImageBackground>
                </View>
                <View style={styles.currentBalance}>
                    <Text style={styles.flex1}>余额:</Text>
                    <Image source={little_money} style={styles.littleMoney}/>
                    <Text style={styles.fontColorBalance}>{balance}</Text>
                </View>
                <View style={{
                    backgroundColor: '#CAF4FC',
                    width: scaleSize(621),
                    height: scaleSize(116),
                    borderRadius: scaleSize(4),
                    marginTop: scaleSize(29),
                    marginBottom: scaleSize(19.5),
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {this.state.level === 7 ? <Text style={{color: '#333', fontSize: setSpText(26)}}>您已获得最高等级了</Text> :
                        <Text style={{color: '#333', marginBottom: scaleSize(4), fontSize: setSpText(26)}}>再充<Text
                            style={{color: '#FF4860'}}>{this.state.needDiamond}</Text>钻石，升级到<Text
                            style={{color: '#FF4860'}}>VIP{this.state.nextLevel}</Text></Text>}
                    {this.state.currentLevel >= 0 || this.state.currentLevel === 7 ?
                        <View
                            style={{flexDirection: 'row', alignItems: 'center'}}><Text>VIP{this.state.level}</Text><View
                            style={{
                                width: scaleSize(351),
                                height: scaleSize(9),
                                backgroundColor: '#A50215',
                                marginLeft: scaleSize(20),
                                marginRight: scaleSize(20),
                                borderRadius: scaleSize(5),
                                position: 'relative'
                            }}><View style={{height:scaleSize(9),backgroundColor:'#FD4E63',width:scaleSize(this.state.progress),borderRadius:scaleSize(5)}}></View></View><Text>VIP{this.state.nextLevel}</Text></View>:<View/>}
                </View>
                <View style={styles.wrapPrice}>
                    {priceList && priceList.length !== 0 ? priceList.map((item, i) => {
                        return (
                            <TouchableHighlight onPress={this.recharge.bind(this, item.id, item.coin, item.gift)}
                                                underlayColor='transparent' key={i}>
                                <ImageBackground source={price_bg} style={styles.priceList} key={i}>
                                    {item.type === 'YES' ?
                                        <Image source={first_recharge} style={styles.firstRecharge}/> : <View/>}
                                    <View style={styles.content}>
                                        <View style={styles.coins}>
                                            <View><Text style={styles.coin}><Text style={{
                                                fontSize: setSpText(33),
                                                marginRight: scaleSize(6)
                                            }}>{item.coin}</Text>钻石</Text></View>
                                            <View><Text style={styles.give}>送{item.gift}钻石</Text></View>
                                        </View>
                                        <Image source={first_coin} style={styles.firstCoin}/>
                                    </View>

                                    <View style={styles.wrapPeiceText}>
                                        <Text style={styles.price}>¥</Text><Text
                                        style={[styles.priceLeft, styles.price]}>{(item.price / 100).toFixed(2)}</Text>{item.recommend === 'YES' ?
                                        <Image source={recommend} style={styles.recommend}/> : <View/>}
                                    </View>
                                </ImageBackground>
                            </TouchableHighlight>
                        )
                    }) : <Text/>}
                    <View style={styles.priceList}></View>
                </View>
            </ImageBackground>
        )
    }
}
const styles = StyleSheet.create({
    background: {
        height: scaleSize(1675),
        width: '100%',
        alignItems: 'center',
        paddingLeft: scaleSize(30),
        paddingRight: scaleSize(30),
        paddingTop: ifIphoneX(scaleSize(30), 0)
    },
    currentBalance: {
        width: '100%',
        marginTop: scaleSize(33),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flex1: {
        color: '#323232',
        fontSize: setSpText(32),
        marginRight: scaleSize(33),
        backgroundColor: 'transparent',
    },
    littleMoney: {
        width: scaleSize(37),
        height: scaleSize(36),
        marginRight: scaleSize(10)
    },
    priceList: {
        width: scaleSize(210.9),
        height: scaleSize(268),
        marginTop: scaleSize(21.4),
    },
    coins: {
        width: '100%',
        // justifyContent:'center',
        marginTop: scaleSize(25.1)
    },
    coin: {
        paddingTop: scaleSize(10),
        fontSize: scaleSize(30),
        color: '#FF4860',
        textAlign: 'center'
    },
    wrapPrice: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    wrapPeiceText: {
        width: scaleSize(136),
        height: scaleSize(42),
        backgroundColor: '#FFC900',
        position: 'absolute',
        flexDirection: 'row',
        bottom: scaleSize(13.9),
        alignItems: 'center',
        left: scaleSize(37.5),
        justifyContent: 'center',
        borderRadius: scaleSize(10)
    },
    firstCoin: {
        width: scaleSize(66),
        height: scaleSize(69),
        marginTop: scaleSize(10),
    },
    price: {
        color: '#fff',
        fontSize: setSpText(30)
    },
    priceLeft: {
        marginLeft: scaleSize(10)
    },
    firstRecharge: {
        width: scaleSize(91),
        height: scaleSize(83),
        position: 'absolute'
    },
    content: {
        alignItems: 'center',
    },
    give: {
        color: '#FF4860',
        fontSize: setSpText(28),
        textAlign: 'center'
    },
    back: {
        width: scaleSize(60),
        height: scaleSize(60),
        position: 'absolute',
        left: 0
    },
    headers: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scaleSize(60),
    },
    title: {
        width: scaleSize(188),
        height: scaleSize(40)
    },
    fontColor: {
        color: '#323232',
        fontSize: setSpText(32),
        width: scaleSize(132)
    },
    fontColorBalance: {
        color: '#323232',
        fontSize: setSpText(32),
        backgroundColor: 'transparent',
    },
    wrapExchangeResult: {
        height: ifIphoneX(scaleSize(140), scaleSize(80)),
        backgroundColor: '#ff7171',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: scaleSize(40),
        paddingRight: scaleSize(40),
        paddingTop: ifIphoneX(scaleSize(44), 0)
    },
    exchangeResult: {
        color: '#fff',
        flex: 1,
        textAlign: 'center'
    },
    cancel: {
        width: scaleSize(50),
        height: scaleSize(50)
    },
    recommend: {
        width: scaleSize(74),
        height: scaleSize(34),
        marginLeft: scaleSize(6)
    },
    /*充值成功*/
    container: {
        flex: 1,
        padding: scaleSize(80),
        alignItems: 'center',
    },
    fonts: {
        fontWeight: 'bold',
        fontSize: setSpText(48),
        marginTop: scaleSize(172),
        backgroundColor: 'transparent',
        color: '#323232'
    },
    font: {
        fontWeight: 'bold',
        fontSize: setSpText(48),
        marginTop: scaleSize(32),
        backgroundColor: 'transparent',
        color: '#323232'
    },
    success: {
        width: scaleSize(653),
        height: scaleSize(668),
        marginTop: scaleSize(240),
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirm: {
        width: scaleSize(213),
        height: scaleSize(96),
        marginTop: scaleSize(78)
    },
    /*消费记录*/
    detail: {
        color: '#fff',
        fontSize: setSpText(30),
        position: 'absolute',
        right: 0
    },
    /*level*/
    levelBg: {
        width: scaleSize(160),
        height: scaleSize(166),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scaleSize(-4)
    },
    levelBg6: {
        width: scaleSize(150),
        height: scaleSize(165),
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: scaleSize(15),
        marginTop: scaleSize(-5)
    },
    nickImg: {
        width: scaleSize(130),
        height: scaleSize(130),
        borderRadius: scaleSize(70),
        marginTop: scaleSize(10),
    },
    nickImg6: {
        width: scaleSize(120),
        height: scaleSize(120),
        borderRadius: scaleSize(70),
    }
})
