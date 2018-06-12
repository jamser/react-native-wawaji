import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableWithoutFeedback,TouchableHighlight,Platform,ScrollView,BackHandler} from 'react-native';
import index_bg from '../../resource/vip-bg.png'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import back from '../../resource/back.png'
import {consoleDebug} from '../../common/tool'
import {api} from '../../common/api.config'
import Headers from '../../common/fetch_header'
import title from '../../resource/vip-title.png'
import {NavigationActions} from 'react-navigation'
import benzhoujiangli from '../../resource/benzhoujiangli.png'
import coin from '../../resource/recharge-coin.png'
import zuanshi from '../../resource/zuanshi-room.png'
import getCoin from '../../resource/getCoin.png'
import level2 from '../../resource/level2.png'
import level3 from '../../resource/level3.png'
import level4 from '../../resource/level4.png'
import level5 from '../../resource/level5.png'
import level6 from '../../resource/level6.png'
import level7 from '../../resource/level7.png'
import level1 from '../../resource/level1.png'
import vip1 from '../../resource/vip1.png'
import vip2 from '../../resource/vip2.png'
import vip3 from '../../resource/vip3.png'
import vip4 from '../../resource/vip4.png'
import vip5 from '../../resource/vip5.png'
import vip6 from '../../resource/vip6.png'
import vip7 from '../../resource/vip7.png'
import already_get_coin from '../../resource/already-getcoin.png'
/**
 * VIP 用户特权
 */
export default  class gameDetailScreen extends Component{
    constructor(props){
        super(props)
        this.state={id:'',name:'',dateTime:'',image:'',status:'',vipInfo:[{}],taskId:0,needDiamond:0,getCoin:0,getDiamond:0,nextLevel:0,processed:false,progress:0}
    }
    componentWillMount(){
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    onBackAndroid = () => {
        const nav = this.props.navigation;
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Recharge',params:{from:'vip'}})
                ]
            })
            nav.dispatch(resetAction)
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
            fetch(api.vipInfo, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                }else{
                    return response.json()
                }
            }).then((res)=>{
                console.info('vipInfo',res)
                let progress=Math.abs((1-(res.vipLevelResponse.needDiamond/res.vipLevelResponse.betweenDiamond))*351);
                _this.setState({vipInfo:res.responseList,taskId:res.weekPrizeResponse.taskId,needDiamond:res.vipLevelResponse.needDiamond,currentLevel:res.vipLevelResponse.currentLevel,getDiamond:res.weekPrizeResponse.diamond,getCoin:res.weekPrizeResponse.coin,processed:res.weekPrizeResponse.processed,nextLevel:res.vipLevelResponse.nextLevel,progress:progress})
            }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    getVip(){
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            let url = api.getVip+'?taskId='+this.state.taskId;
            fetch(url,{method:'GET',header:Headers(ret[0])}).then((res)=>{
                if(res.status !== 200){
                    return
                }else{
                    console.log('getVip成功')
                    this.setState({
                        processed:true,
                    });
                }
            }).catch((err)=>{
                throw err
            })
        }).catch((err)=>{
            throw err
        })
    }
    toRecharge(){
        const nav = this.props.navigation
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Recharge',params:{from:'vip'}})
            ]
        })
        nav.dispatch(resetAction)
    }
    render(){
        return(
            <ImageBackground source={index_bg} style={styles.mainBg}>
                {/*<Text onPress={this.getVip.bind(this)}>领取</Text>*/}
                <View style={styles.headers}>
                    <TouchableWithoutFeedback onPress={this.onBackAndroid.bind(this)} underlayColor='transparent'>
                        <Image source={back} style={styles.back}/>
                    </TouchableWithoutFeedback>
                    <View>
                        <Image source={title} style={styles.title}/></View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{marginTop:scaleSize(39.2)}}>
                    <View style={{alignItems:'center'}}><Text style={{fontSize:setSpText(32),color:'#333',backgroundColor:'transparent'}}>我的会员成长</Text></View>
                    {this.state.currentLevel >= 0 || this.state.currentLevel === 7?<View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:scaleSize(43)}}><Text style={{backgroundColor:'transparent'}}>VIP{this.state.currentLevel}</Text >
                        <View style={{width:scaleSize(351),height:scaleSize(9),backgroundColor:'#A50215',marginLeft:scaleSize(20),marginRight:scaleSize(20),borderRadius:scaleSize(5)}}>
                            <View style={{height:scaleSize(9),backgroundColor:'#FD4E63',width:scaleSize(this.state.progress),borderRadius:scaleSize(5)}}></View>
                        </View>
                        <Text style={{backgroundColor:'transparent'}}>VIP{this.state.nextLevel}</Text></View>:<View/>}
                    {this.state.currentLevel === 7?<Text style={{backgroundColor:'transparent'}}>您已获得最高等级</Text>:<View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginTop:scaleSize(40)}}>
                        <Text style={{marginTop:scaleSize(18),color:'#333',backgroundColor:'transparent',marginBottom:scaleSize(4)}}>再充<Text style={{color:'#FF4860'}}>{this.state.needDiamond}</Text>个钻石，升级到<Text style={{color:'#FF4860'}}>VIP{this.state.nextLevel}</Text></Text>
                        <View style={{width:scaleSize(126),height:scaleSize(48),justifyContent:'center',alignItems:'center',borderWidth:scaleSize(1),borderColor:'#333',borderRadius:scaleSize(24),marginLeft:scaleSize(73)}}><Text onPress={this.toRecharge.bind(this)} style={{backgroundColor:'transparent'}}>去充值</Text></View>
                    </View>}
                    <View style={{width:scaleSize(669),height:scaleSize(156),backgroundColor:'#fff',borderRadius:scaleSize(14),marginTop:scaleSize(41),paddingLeft:scaleSize(23),paddingRight:scaleSize(26)}}>
                        {this.state.getCoin === 0 && this.state.getDiamond === 0 ? <Text style={{backgroundColor:'transparent',color:'#333',fontSize:setSpText(32),marginTop:scaleSize(50),marginLeft:scaleSize(120)}}>本周还没有奖励可以领取</Text> :
                            <View>
                                <View style={{flexDirection: 'row', marginTop: scaleSize(19)}}>
                                    <Image source={benzhoujiangli} style={styles.benzhoujiangli}/>
                                    <Text style={{backgroundColor:'transparent',fontSize: setSpText(32), color: '#333', marginLeft: scaleSize(17)}}>本周奖励</Text>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: scaleSize(14)}}>
                                    <Image source={coin} style={styles.coin}/><Text style={{
                                    fontSize: setSpText(32),
                                    color: '#333',
                                    marginLeft: scaleSize(17)
                                }}>{this.state.getCoin}</Text>
                                    <Image source={zuanshi} style={styles.zuanshi}/><Text style={{
                                    fontSize: setSpText(32),
                                    color: '#333',
                                    marginLeft: scaleSize(17)
                                }}>{this.state.getDiamond}</Text>
                                    {this.state.processed?<Image source={already_get_coin} style={styles.getCoin}/>:<TouchableHighlight onPress={this.getVip.bind(this)} underlayColor='transparent'>
                                        <Image source={getCoin} style={styles.getCoin}/>
                                    </TouchableHighlight>}
                                </View>
                            </View>
                        }
                    </View>
                    <View style={{flexDirection:'row',alignItems:'center',marginTop:scaleSize(16),paddingLeft:scaleSize(16)}}><View style={styles.dot}></View><Text style={styles.remark}>备注：福利每周可以领取一次</Text></View>
                    </View>
                    <View style={{flexDirection:'row',width:scaleSize(576),marginTop:scaleSize(32),justifyContent:'space-between',marginLeft:scaleSize(40)}}><Text style={{backgroundColor:'transparent',fontSize:setSpText(30),color:'#333',marginBottom:scaleSize(22)}}>等级</Text><Text style={{backgroundColor:'transparent',fontSize:setSpText(30),color:'#333'}}>特权</Text><Text style={{backgroundColor:'transparent',fontSize:setSpText(30),color:'#333'}}>福利</Text></View>
                    {this.state.vipInfo?this.state.vipInfo.map((item,i)=>{
                      return    item.level !== 0?<View style={styles.vipList} key={i}>
                          <Image source={item.level === 1 ?level1:item.level === 2?level2:item.level === 3?level3:item.level === 4?level4:item.level === 5?level5:item.level=== 6?level6:level7} style={styles.level}/>
                          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                              <Image source={item.level === 1 ?vip1:item.level === 2?vip2:item.level === 3?vip3:item.level === 4?vip4:item.level === 5?vip5:item.level === 6?vip6:vip7} style={styles.vipBg}/>
                          </View>
                          <View>
                              <View style={{flexDirection:'row',alignItems:'center'}}>
                                  <Image source={zuanshi} style={styles.zuanshiLittle}/><Text style={{fontSize:setSpText(22),color:'#00535F',marginLeft:scaleSize(3),marginRight:scaleSize(8)}}>X</Text><Text style={{fontSize:setSpText(30),color:'#00535F'}}>{item.diamond}</Text>
                              </View>
                              <View style={{flexDirection:'row',alignItems:'center'}}>
                                  <Image source={coin} style={styles.coinLittle}/><Text style={{fontSize:setSpText(22),color:'#00535F',marginLeft:scaleSize(3),marginRight:scaleSize(8)}}>X</Text><Text style={{fontSize:setSpText(30),color:'#00535F'}}>{item.coin}</Text>
                              </View>
                          </View>
                      </View>:<View/>
                    }):<View/>}
                </ScrollView>
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    mainBg:{
        flex:1,
        width: null,
        height: null,
        alignItems:'center',
        flexDirection:'column',
        paddingRight:scaleSize(30),
        paddingLeft:scaleSize(30),
        paddingTop:ifIphoneX(scaleSize(30),0),
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        left:0
    },
    headers:{
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginTop:Platform.OS==='ios'?scaleSize(60):scaleSize(30),
    },
    title:{
        width:scaleSize(188),
        height:scaleSize(40)
    },
    benzhoujiangli:{
        width:scaleSize(37),
        height:scaleSize(41),
    },
    coin:{
        width:scaleSize(50),
        height:scaleSize(50)
    },
    zuanshi:{
        width:scaleSize(50),
        height:scaleSize(46),
        marginLeft:scaleSize(78)
    },
    getCoin:{
        width:scaleSize(140),
        height:scaleSize(62),
        marginLeft:scaleSize(121)
    },
    dot:{
       width:scaleSize(8),
       height:scaleSize(8),
       backgroundColor:'#00698A',
        borderRadius:scaleSize(8),
        marginRight:scaleSize(17)
    },
    remark:{
        color:'#00698A',
        fontSize:setSpText(24),
        backgroundColor:'transparent',
    },
    vipList:{
        width:scaleSize(669),
        height:scaleSize(125),
        backgroundColor:'#fff',
        borderRadius:scaleSize(10),
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:scaleSize(54),
        paddingRight:scaleSize(27),
        marginBottom:scaleSize(16)
    },
    level:{
        width:scaleSize(48),
        height:scaleSize(56)
    },
    vipBg:{
        width:scaleSize(95),
        height:scaleSize(95)
    },
    zuanshiLittle:{
        width:scaleSize(32),
        height:scaleSize(29)
    },
    coinLittle:{
        width:scaleSize(29),
        height:scaleSize(29)
    }
})