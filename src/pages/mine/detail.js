import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight,TouchableWithoutFeedback,ScrollView,Modal,Platform,BackHandler,FlatList,Dimensions} from 'react-native';
import index_bg from '../../resource/mainBG.png'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import little_money from '../../resource/detail-icon.png'
import back from '../../resource/back.png'
import {api} from '../../common/api.config'
import title from '../../resource/xiaofei-title.png'
import cancel from '../../resource/cancel.png'
import zuanshi from '../../resource/mine-zuanshi.png'
import {monthTransfer,hourTransfer,consoleDebug} from '../../common/tool'
import Headers from '../../common/fetch_header'

/**
 * 金币明细
 */
export default class DetailsScreen extends Component{
    constructor(props){
        super(props)
        console.log("金币明细")
        console.info(props.navigation.state.params.activeTab)
        this.state={
            detail:[],     // detailList 金币明细的列表
            exchangeResult:false,
            activeTab:props.navigation.state.params.activeTab //0 代表选中的 金币，1 代表选中的是钻石
        }
    }
    componentWillMount(){
        /*设置 安卓的物理返回按键 */
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    /*下方的物理返回按键 和 页面左上角的 返回 调用的都是这个函数*/
    onBackAndroid = () => {
        const nav = this.props.navigation;
        nav.navigate('Mine');
        return true
    };
    componentDidMount(){
        /*上来默认加载 金币明细，activeTab 代表选中的状态*/
        this.getDetailList(this.state.activeTab)
    }
    /*要是 数据获取失败，就弹这个窗*/
    setExchangeResult(visible) {
        this.setState({exchangeResult: visible});
    }
    /*获取里面的详细的list信息，type是 区分是金币 还是钻石*/
    getDetailList(type){
        let typeName = type === 0?'GOLD':'DIAMOND'
        let _this = this
        let url = api.coinDetail+'?type='+typeName+'&size=1000'
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
            fetch(url, {method: 'GET',headers:Headers(ret[0])}).then((response) => {
                console.info(response)
                if(response.status === 200){
                    return response.json()
                }else{
                    _this.setState({exchangeResult:true})
                    return
                }
            }).then((res)=>{
                _this.setState({detail:res.content})
                consoleDebug(JSON.stringify(res)+"成功")
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("读取数据失败")
            throw e
        })
    }
    /*下方是 用FlatList 才用到的*/
    _keyExtractor = (item, index) => item.id;

    _renderItem = ({item}) => (
        <View>
        <View style={styles.detailContent}>
        <View style={styles.wrapProcess}>
        <Text style={styles.detailProcess}>{item.description}</Text>
        <View style={styles.detailRow}><Text style={styles.tint}>{monthTransfer(item.createdTime)}</Text><Text style={styles.tints}>{hourTransfer(item.createdTime)}</Text></View>
        </View>
            {/*根据 这个type 来 判断是 + 和 —*/}
        {item.type === 'FETCH' ||item.type === 'SHIPPED'?<Text style={styles.pink}>-{item.coinType === 'DIAMOND'?item.coin:item.goldCoin}</Text>: <Text style={styles.blue}>+{item.coinType === 'DIAMOND'?item.coin:item.goldCoin}</Text> }
        </View>
        <Text style={styles.borderBottom}/>
        </View>
);
    toGetDollList(type){
        this.setState({activeTab:type})
        this.getDetailList(type)
    }

    render(){
        const {goBack, state} = this.props.navigation;
        const {detail,activeTab} = this.state
        return(
            <View>
                <ImageBackground source={index_bg} style={styles.mainBg}>
                    <Modal animationType={"fade"}
                           transparent={true}
                           visible={this.state.exchangeResult}>
                        <View style={styles.wrapExchangeResult}>
                            <TouchableHighlight onPress={() => {
                                this.setExchangeResult(false)
                            }} underlayColor='transparent'><Image source={cancel} style={styles.cancel}/></TouchableHighlight><Text style={styles.exchangeResult}>数据加载失败，请稍后重试</Text>
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
                    <View style={styles.detail}>
                        <TouchableWithoutFeedback onPress={this.toGetDollList.bind(this,0)}>
                        <View style={[styles.noactive,activeTab === 0?styles.active:'']}>
                            <Image source={little_money} style={styles.moneyIcon}/>
                            <Text style={[styles.balance,activeTab === 0?styles.activeText:'']}>{state.params.goldBalance}</Text>
                        </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.toGetDollList.bind(this,1)}>
                        <View style={[styles.noactive,activeTab === 1?styles.activezuanshi:'']}>
                            <Image source={zuanshi} style={styles.zuanshiIcon}/>
                            <Text style={[styles.balance,activeTab === 1?styles.activeText:'']}>{state.params.amount}</Text>
                        </View>
                        </TouchableWithoutFeedback>
                    </View>
                </ImageBackground>
                <FlatList style={{paddingRight:scaleSize(62),paddingLeft:scaleSize(62),width:'100%',backgroundColor:'#fff',minHeight:Dimensions.get('window').height}} initialNumToRender={40} data={detail}  keyExtractor={this._keyExtractor} renderItem={this._renderItem}>
                </FlatList>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    mainBg:{
        width:'100%',
        height:ifIphoneX(scaleSize(267),scaleSize(224)),
        paddingTop:ifIphoneX(scaleSize(44),0),
    },
    detail:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        height:scaleSize(125),
    },
    moneyIcon:{
        width:scaleSize(51),
        height:scaleSize(50),
    },
    balance:{
        fontSize:setSpText(36),
        backgroundColor:'transparent',
        marginLeft:scaleSize(19),
        color:'#fff',
        fontFamily: Platform.OS === 'android' ?'KaiGenGothicSC-Bold':'PingFang-SC-Medium',
    },
    wrapDetail:{
        minHeight:scaleSize(1400)
    },
    detailContent:{
        flexDirection:'row',
        height:scaleSize(140),
        alignItems:'center',
        width:'100%',
    },
    borderBottom:{
        width:'100%',
        height:scaleSize(1),
        backgroundColor: 'rgba(174,174,174,0.4)'
    },
    detailProcess:{
        color:'#323232',
        fontSize:setSpText(32)
    },
    detailRow:{
        flexDirection:'row',
        marginTop:scaleSize(12)
    },
    wrapProcess:{
        flex:1
    },
    tint:{
        color:'#666666',
        fontSize:setSpText(28)
    },
    pink:{
        color:'#ff7177',
        fontSize:setSpText(36)
    },
    blue:{
        color:'#22c245',
        fontSize:setSpText(36)
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        left:scaleSize(30),
        top:scaleSize(40)
    },
    headers:{
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(40),
        height:scaleSize(120),
        paddingTop:scaleSize(30)
    },
    title:{
        width:scaleSize(150.6),
        height:scaleSize(34.6)
    },
    tints:{
        marginLeft:scaleSize(20),
        color:'#666666',
        fontSize:setSpText(28)
    },
    wrapExchangeResult:{
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
    cancel:{
        width:scaleSize(50),
        height:scaleSize(50)
    },
    noactive:{
        flexDirection:'row',
        width:'50%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center'
    },
    zuanshiIcon:{
        width:scaleSize(50.6),
        height:scaleSize(49),
    },
    active:{
        backgroundColor:'#fff',
        borderTopRightRadius:scaleSize(24)
    },
    activeText:{
        color:'#1ECDEB'
    },
    activezuanshi:{
        backgroundColor:'#fff',
        borderTopLeftRadius:scaleSize(24)
    }
})