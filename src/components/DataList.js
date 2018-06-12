import React from 'react'
import {StyleSheet, View, Image,Text,ImageBackground, TouchableHighlight,TouchableWithoutFeedback,Dimensions,ScrollView} from 'react-native'
import {api} from '../common/api.config'
import {scaleSize,setSpText} from '../common/util'
import { NavigationActions } from 'react-navigation'
import {consoleDebug} from '../common/tool'
import AnalyticsUtil from '../components/AnalyticsUtil'
import home_diamound from '../resource/home-diamound.png'
import diamond from '../resource/zuanshi.png'
import jinbi from '../resource/jinbi.png'
import Headers from '../common/fetch_header'
var refreshTimer  = null,isMounted = 0     //isMounted 等于1的时候，可以进行setState，等于0的时候不能进行
export default class DataList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            content: [],
            loading:true,
            type:this.props.type ,     //tab代表tab页 父组件传递子组件
            typeName:this.props.typeName
        }
        this._goRoom = this._goRoom.bind(this)
    }
    componentWillMount() {
        let _this = this
        isMounted = 1
        this.getHomeListStatus(_this.state.type)
        this.polling()
    }
    getHomeListStatus(){
        let _this = this
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then(ret => {
            /* newURl 是 新的tab 选项的 接口，点击全部的话还是 oldURL 也就是之前的接口 */
                let oldUrl = api.room+'?ver='+global.versioncode+'&page=0&size=1000&sort=rank&order=DESC'
                let newUrl = api.tabListRoom+'?panelId='+_this.state.type+'&ver='+global.versioncode+'&page=0&size=100&sort=rank&order=DESC'
                let url = _this.state.type === 0?oldUrl:newUrl
                console.log("一进来"+url+ new Date())
                return fetch(url, {
                    method: 'GET',
                    headers:Headers(ret[0])
                })
            }).then(res => res.json()).then(res => {
            console.log("dataList")
            console.info(res)
            if(isMounted === 1) {
                if (res.status && res.status !== 200) {
                    throw res
                } else {
                    _this.setState({loading: false, content: res.content})
                }
            }
        }).catch(err => {
            console.info("失败", err)
        })
    }
    /*轮训的type 是取了当前的state 的 type 这样 轮训一直存在可以不用每次跳转tab的时候清除掉*/
    polling(){
        let _this = this,currentQueryType
        refreshTimer = setInterval(() => {
            storage.load({
                key: 'userInfo',
                autoSync: true,
                syncInBackground: true,
                syncParams: {
                    extraFetchOptions: {},
                    someFlag: true,
                },
            })
                .then(ret => {
                    let oldUrl = api.room+'?ver='+global.versioncode+'&page=0&size=100&sort=rank&order=DESC'
                    let newUrl = api.tabListRoom+'?panelId='+_this.state.type+'&ver='+global.versioncode+'&page=0&size=100&sort=rank&order=DESC'
                    let url = _this.state.type === 0?oldUrl:newUrl
                    currentQueryType = _this.state.type
                    console.log("轮训"+url+ new Date())
                    return fetch(url, {
                        method: 'GET',
                        headers: Headers(ret[0])
                    })
                })

                .then(res => res.json())
                .then(res => {
                    if(isMounted === 1) {
                        if (res.status && res.status !== 200) {
                            throw res
                        } else {
                            console.log("返回的东西")
                            console.info(res.content)
                            let beAboutToAssignment = _this.state.type
                            /*赋值之前先去看一下当前 的type是什么，如果当前type就是请求的type，那就没什么问题，可以成功赋值*/
                            if (isMounted === 1 && beAboutToAssignment === currentQueryType) {
                                _this.setState({loading: false, content: res.content})
                            }
                        }
                    }
                }).catch(err => {
                console.info("失败", err)
            })
        }, 5000) // 5s轮询一次
    }
    /*生命周期  接受新的props */
    componentWillReceiveProps(nextProps) {
        console.log(nextProps,this.state.type)
        if(nextProps.type !== this.state.type){
            /*重新调用方法*/
            this.setState({type:nextProps.type,typeName:nextProps.typeName})
            /*轮训和 重新加载都取 最新的type*/
            this.getHomeListStatus()
        }
    }
    componentWillUnmount(){
        /*组件被销毁的时候，清除定时器啊，要不然卡死你卡死你*/
        isMounted = 0
        clearInterval(refreshTimer)
    }
    /*点击进去房间*/
    _goRoom(item) {
        global.roomId=item.id;
        global.type=this.state.type;
        global.coinType=item.coinType;
        global.roomName=item.name;
        global.typeName=this.state.typeName;
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Room',params:{machineId: item.machineIds[0],type:this.state.type,coinType:item.coinType,roomId:item.id,roomName:item.name,typeName:this.state.typeName}})
            ]
        })
        //统计-->进入房间

        AnalyticsUtil.onEventWithMap("4_2",{roomId:global.roomId,roomName:item.name,tabName:this.state.typeName});
        this.props.navigation.dispatch(resetAction)
        return true
    }

    render() {
        let state = this.state
        return (
            <ScrollView style={{paddingLeft:scaleSize(21),paddingRight:scaleSize(21),marginTop:Dimensions.get('window').width*0.03,paddingBottom:scaleSize(100)}}>
                {state.loading ? <View style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                    <Image style={{width:120,height:20,marginTop:150}} source={require('../resource/loading.png')}/>
                </View> : <View style={styles.container}>
                    {state.content !== undefined && state.content.length !== 0 && state.content.map((item, i) => {
                        return (
                            <TouchableWithoutFeedback onPress={this._goRoom.bind(this,item)}  key={i}>
                            <View style={styles.wrapAlls}>
                                <View style={styles.wrapImageBg} >
                                    <Image source={{uri:item.image}}style={styles.listBackground} />
                                    <View style={styles.wrapName}><Text style={styles.name}>{item.name}</Text></View>
                                    {/*房间状态*/}
                                    <View style={[styles.wrapStatus,item.status === 'FREE'?{backgroundColor:'#71DE67'}:{backgroundColor:'#FC6566'}]}><Text style={styles.status}>{item.status === 'FREE'?'空闲中':'游戏中'}</Text></View>
                                    {/*钻石和金币*/}
                                    {item.coinType === 'ALL' || item.coinType === 'DIAMOND'?<View style={styles.wrapDiamound}><ImageBackground source={home_diamound} style={styles.homeDiamound}>
                                        <Image source={diamond} style={styles.diamond}/>
                                        <View style={styles.diamondNum}><Text style={styles.diamoundText}>{item.coin}/次</Text></View>
                                    </ImageBackground></View>:<View/>}
                                    {item.coinType === 'ALL' || item.coinType === 'GOLD'? <View style={item.coinType ==='GOLD'?styles.wrapDiamound:styles.wrapJinbi}><ImageBackground source={home_diamound} style={styles.homeDiamound}>
                                        <Image source={jinbi} style={styles.jinbi}/>
                                        <View style={styles.jinbiNum}><Text style={styles.diamoundText}>{item.goldCoin}/次</Text></View>
                                    </ImageBackground></View>:<View/>}
                                </View>
                            </View>
                            </TouchableWithoutFeedback>
                        )
                    })}
                </View>}
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'space-between',
        width:'100%',
        paddingBottom:scaleSize(140),
    },
    item: {
        width: Dimensions.get('window').width*0.46,
        height: Dimensions.get('window').width*0.46,
        position: 'relative',
        marginBottom: Dimensions.get('window').width*0.03,
        backgroundColor:'transparent',
        borderColor:'#e1e2e3',
        borderWidth:scaleSize(1),
        borderRadius:scaleSize(30),
    },
    itemBG:{
        borderWidth:scaleSize(2),
        borderRadius:scaleSize(30),
        borderColor:'#fff',
        width:'100%',
        height:'100%'
    },
    img: {
        width: '80%',
        height: '76%',
        position:'absolute',
        left:'10%',
        top:'11%'
    },
    name: {
        color:'#fff',
        fontSize:setSpText(30)
    },
    busy: {
        color: '#fff',
        fontSize: setSpText(20)
    },
    free: {
        color:'#fff',
        fontSize: setSpText(20),
        position:'relative',
        top:scaleSize(-1)
    },
    machine: {
        position: 'absolute',
        left: scaleSize(14),
        bottom: scaleSize(56),
        backgroundColor: '#FFC001',
        color: '#fff'
    },
    stars: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        height: scaleSize(38),
        width:scaleSize(72),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'center',
        borderRadius: scaleSize(20),
        position:'relative',
        top:scaleSize(-84),
        bottom:scaleSize(40),
        marginLeft:scaleSize(16),

    },
    starsImg: {
        width: scaleSize(24), height: scaleSize(24), marginRight: scaleSize(5)
    },
    starsText: {
        fontSize: setSpText(24), color: '#fff'
    },
    // status:{
    //     position: 'absolute',
    //     right: scaleSize(13),
    //     top: scaleSize(28),
    //     width:scaleSize(80),
    //     height:scaleSize(30),
    //     alignItems:'center',
    //     justifyContent:'center',
    //     borderRadius: scaleSize(6),
    //     backgroundColor: '#71DE67',
    // },
    statusBusy:{
        position: 'absolute',
        right: scaleSize(13),
        top: scaleSize(28),
        width:scaleSize(80),
        height:scaleSize(30),
        alignItems:'center',
        justifyContent:'center',
        borderRadius: scaleSize(6),
        backgroundColor: '#FC6566',
    },
    andriodStars:{
        backgroundColor: '#FC9DA0',
        height: scaleSize(38),
        flexDirection: 'row',
        alignItems: 'center',
        position:'absolute',
        paddingLeft:scaleSize(10),
        paddingRight:scaleSize(10),
        top: scaleSize(24),
        borderBottomRightRadius:scaleSize(20),
        borderTopRightRadius:scaleSize(20),
        left:'1%'
    },
    /*新版本首页*/
    // wrapName:{
    //     width:'98%',
    //     height:scaleSize(50),
    //     backgroundColor:'rgba(0,0,0,0.5)',
    //     alignItems:'center',
    //     justifyContent:'center',
    //     position:'absolute',
    //     bottom:'0.8%',
    //     left:scaleSize(2),
    //     borderBottomLeftRadius:scaleSize(26),
    //     borderBottomRightRadius:scaleSize(26)
    // },
    /*新版本首页*/
    wrapImageBg:{
        width:'100%',
        height:'100%',
        borderColor:'#fff',
        borderWidth:scaleSize(2),
        borderRadius:scaleSize(28),
        overflow:'hidden',
        position:'relative',
        flexDirection:'column-reverse'
    },
    listBackground:{
        width:'100%',
        height:'100%',
        borderRadius:scaleSize(30),
        overflow:'hidden',
        position:'absolute',
        top:0,
        bottom:0
    },
    wrapName:{
        width:'100%',
        backgroundColor:'rgba(0,0,0,0.5)',
        overflow:'hidden',
        borderBottomLeftRadius:scaleSize(26),
        borderBottomRightRadius:scaleSize(26),
        padding:scaleSize(11),
    },
    wrapAlls:{
        borderWidth:scaleSize(1),
        borderColor:'#e1e2e3',
        width: Dimensions.get('window').width*0.46,
        height: Dimensions.get('window').width*0.46,
        marginBottom: Dimensions.get('window').width*0.03,
        borderRadius:scaleSize(30),
    },
    status:{
        color:'#fff',
        fontSize:setSpText(20),
    },
    /*钻石的背景*/
    wrapDiamound:{
        position:'absolute',
        left:scaleSize(8),
        top:scaleSize(8),
    },
    wrapJinbi:{
        position:'absolute',
        left:scaleSize(8),
        top:scaleSize(60)
    },
    homeDiamound:{
        width:scaleSize(110),
        height:scaleSize(46),
        flexDirection:'row',
        alignItems:'center',
    },
    diamond:{
        width:scaleSize(23),
        height:scaleSize(23),
        marginLeft:scaleSize(9),
        position:'relative',
        top:scaleSize(-1.4)
    },
    jinbi:{
        width:scaleSize(28),
        height:scaleSize(28),
        marginLeft:scaleSize(7)
    },
    diamondNum:{
        width:scaleSize(68),
        height:scaleSize(28),
        backgroundColor:'#FF7DBB',
        borderRadius:scaleSize(14),
        justifyContent:'center',
        alignItems:'center',
        marginLeft:scaleSize(5),
        position:'relative',
        top:scaleSize(-0.2)
    },
    diamoundText:{
        fontSize:setSpText(20),
        color:'#7A3226'
    },
    jinbiNum:{
        width:scaleSize(68),
        height:scaleSize(28),
        backgroundColor:'#FDD32C',
        borderRadius:scaleSize(14),
        justifyContent:'center',
        alignItems:'center',
        marginLeft:scaleSize(4),
    },
    wrapStatus:{
        width:scaleSize(66),
        height:scaleSize(28),
        borderRadius:scaleSize(4),
        alignItems:'center',
        justifyContent:'center',
        position:'absolute',
        right:scaleSize(13),
        top:scaleSize(13),
        backgroundColor: '#FC6566',
    }

})