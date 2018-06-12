import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight,ScrollView,Modal,Platform,BackHandler,Linking,Dimensions,FlatList,TouchableWithoutFeedback} from 'react-native';
import no_click from '../../resource/no-click.png'
import click from '../../resource/click.png'
import distribution from '../../resource/distribution.png'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import back from '../../resource/back.png'
import exchange_success from '../../resource/exchange.png'
import cancel from '../../resource/x.png'
import confirm_exchange from '../../resource/confirmexchange.png'
import {api} from '../../common/api.config'
import no_distribution from '../../resource/no-distribution.png'
import cancel_Modal from '../../resource/cancel.png'
import doll_title from '../../resource/my-doll-title.png'
import wlbtn from '../../resource/wlbtn.png'
import wllogo from '../../resource/wllogo.png'
import layer from '../../resource/layer.png'
import confirm from '../../resource/wlbtn-confirm.png'
import expireTime from '../../resource/expireTime.png'
import play_game from '../../resource/play-game.png'
import {monthTransfer, hourTransfer,consoleDebug} from '../../common/tool'
import {NavigationActions} from 'react-navigation'
import little_money from '../../resource/index-money-icon.png'
import zuanshi from '../../resource/mine-zuanshi.png'
import tishi from '../../resource/tishi.png'
import tishi_confirm from '../../resource/confirm.png'
import duihuan_zuanshi from '../../resource/duihuan-zuanshi.png'
import duihuan_zuanshi_disable from '../../resource/duihuan-zuanshi-disable.png'
import Headers from '../../common/fetch_header'
import AnalyticsUtil from '../../components/AnalyticsUtil'

/**
 * 我的娃娃
 */
var currentPage = 0
export default  class myDollScreen extends Component{
    constructor(props){
        super(props)
        this.state={dollList:[],selected:[],selectMoney:0,selectImage:[],modalVisible:false,userId:null,exchangeResult:false,defaultInfo:'',error:'',page:0,isRefreshing:false,wuliumodalVisible: false,toastInfoShow:false,toastInfo:'',company:'',waybill:'',phone:'',
            activeTab:0,coinDollVisible:false,isPractise:[],practiseVisible:false}
        this.callMe = this.callMe.bind(this)
        this.getLogistics = this.getLogistics.bind(this)
        this.toBillCompany = this.toBillCompany.bind(this)
    }
    componentWillMount(){
        /*设置监听 安卓的 物理返回键*/
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    /*物理返回键 和 页面 左上方的 返回 都是调用的这个 方法*/
    onBackAndroid = () => {
        const nav = this.props.navigation;
        nav.navigate('Mine');
        return true;
    };
    componentDidMount(){
        this.getDollList(this.state.activeTab)
    }
    /*选择娃娃  id 是娃娃的id,image 是选择的娃娃的图片，practise 代表是不是练习场状态，goldRepurchase 代表金币抓的娃娃可兑换的 金币 ， status 代表选中的娃娃的 发货状态 */
    selectDoll(id,repurchase,image,status,practise,goldRepurchase){
        if(status === 'SUCCESS'){
            let current = this.state.selected
            let currentMoney = this.state.selectMoney
            let currentImage = this.state.selectImage
            let currentPractise = this.state.isPractise
            if(current.indexOf(id)<0){
                current.push(id)
                if(this.state.activeTab === 0){
                    currentMoney = (+goldRepurchase)+(+this.state.selectMoney)
                }else{
                    currentMoney = (+repurchase)+(+this.state.selectMoney)
                }
                currentImage.push(image)
                currentPractise.push(practise)
            }else{
                current.splice(current.indexOf(id),1)
                if(this.state.activeTab === 0){
                    currentMoney = this.state.selectMoney-goldRepurchase
                }else{
                    currentMoney = this.state.selectMoney-repurchase
                }
                currentImage.splice(currentImage.indexOf(id),1)
                currentPractise.splice(current.indexOf(id),1)
            }
            this.setState({
                selected:current,
                selectMoney:currentMoney,
                selectImage:currentImage,
                isPractise:currentPractise
            })
            consoleDebug(this.state.selectImage)
        }else{
            consoleDebug("这条数据不能点击")
        }
    }
    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }
    setwuliuModalVisible(visible) {
        this.setState({wuliumodalVisible: visible});
    }
    setExchangeResult(visible) {
        this.setState({exchangeResult: visible});
    }
    callMe(phone){
        return Linking.openURL('tel:'+phone)
    }
    toBillCompany(waybill){
        let url ='https://m.kuaidi100.com/result.jsp?nu='+waybill
        Linking.openURL(url)
        this.setState({wuliumodalVisible:false})
    }
    exchange(){
        let url = api.myDoll
        let _this = this
        let param ={
            "ids":this.state.selected,
            "payment":"EXCHANGE",   //RECEIVE 领取，EXCHANGE 兑换
        }
        consoleDebug(param)
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            consoleDebug(url+"测试兑换")
            fetch(url,{method:'POST',headers: Headers(ret[0]),body: JSON.stringify(param)}).then((response) => {
                console.info(response)
                if(response.status === 200){
                    _this.setState({modalVisible:false,selected:[],selectMoney:0,selectImage:[]})
                    _this.getDollList()
                }else{
                    _this.setState({exchangeResult:true,error:'兑换失败，请稍后重试'})
                    return
                }
            }).catch((e)=>{
                _this.setState({exchangeResult:true,error:'兑换失败，请稍后重试'})
                consoleDebug("失败兑换"+e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    getDollList(type){
        let typeName = type === 0?'GOLD':'DIAMOND'
        let _this = this
        let url = api.myDoll+'?type='+typeName+'&page='+currentPage+'&size=1000&sort=id&order=DESC'
        consoleDebug(url+"进入mydollList的列表")
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    consoleDebug("失败")
                    _this.setState({exchangeResult:true,error:'数据获取失败'})
                }else{
                    return response.json()
                }
            }).then((res)=>{
                consoleDebug(JSON.stringify(res)+"成功")
                if(res.content.length === 0){
                    if(type === 0){
                        _this.setState({defaultInfo:'还没有用金币抓到的娃娃'})
                    }else{
                        _this.setState({defaultInfo:'还没有用钻石抓到的娃娃'})
                    }

                }
                // let currentDollList = [..._this.state.dollList,...res.content]
                _this.setState({dollList:res.content,userId:userId,isRefreshing:false})
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    /*获取物流信息*/
    getLogistics(id,status){
        if(status !== 'SHIPPED'){
            return
        }
        let userDollId = id,_this = this
        let url = api.logistics+'?userDollId='+userDollId
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            console.info(url)
            fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                console.info(response)
                if(response.status !== 200){
                    _this.setState({exchangeResult:true,error:"物流信息获取失败"})
                }else{
                    return response.json()
                }
            }).then((res)=>{
                console.info(res)
                _this.setState({wuliumodalVisible:true,company:res.name,waybill:res.waybill,phone:res.phone})
            }).
            catch((e) => {
                _this.setState({exchangeResult:true,error:"物流信息获取失败"})
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    toGameVideo(id){
        // //let param = encodeURIComponent("name="+global.code+"&id="+id)
        // let url = api.videoUrl+"&name="+global.code+"&id="+id
        // //let url = api.newVideoUrl+param
        // _this.getWebviewInfo(global.code,id)
        // const nav = this.props.navigation
        // const resetAction = NavigationActions.reset({
        //     index: 0,
        //     actions: [
        //         NavigationActions.navigate({ routeName: 'Webview',params:{url:url,from:'mydoll',result:'success',userDollId:id}})
        //     ]
        // })
        // nav.dispatch(resetAction)
        if(this.state.activeTab === 0){
            //统计-->金币娃娃视频
            AnalyticsUtil.onEventWithMap('5_5_1_1',{typeName:'5_5_1_1'});
        }else{
            //统计-->钻石娃娃视频
            AnalyticsUtil.onEventWithMap('5_5_2_1',{typeName:'5_5_2_1'});
        }
        this.getWebviewInfo(global.code,id)
    }
    getWebviewInfo(code,id){
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
                        NavigationActions.navigate({ routeName: 'Webview',params:{url:url,from:'mydoll',result:'success',userDollId:id}})
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
            <TouchableHighlight onPress={this.selectDoll.bind(this,item.id,item.repurchase,item.image,item.status,item.practice,item.goldRepurchase)} underlayColor='transparent'>
                <View style={styles.wrapDoll}>
                    {item.status === 'SUCCESS'?<Image source={this.state.selected.indexOf(item.id)<0?no_click:click} style={styles.selected}/>:<Text style={styles.selected}/>}

                    <TouchableHighlight onPress={this.toGameVideo.bind(this,item.id)} underlayColor='transparent'>
                    <View style={styles.dollImg}><Image source={{uri:item.image}} style={styles.dollImgWidth}/>
                        <Image source={play_game} style={styles.playGame}/>
                    </View>
                    </TouchableHighlight>
                    <View style={{flex:1}}>
                       <View><Text style={styles.name} numberOfLines={1}>{item.name}</Text></View>
                        <View style={styles.row}><Text style={styles.date}>{monthTransfer(item.createdTime)}</Text><Text style={styles.detailTime}>{hourTransfer(item.createdTime)}</Text></View>
                            <View style={styles.wrapTexts}><Text style={styles.exchangeSum} numberOfLines={1}>可兑换{this.state.activeTab === 0?item.goldRepurchase:item.repurchase}钻石</Text></View>
                    </View>
                    <View style={styles.wrapStatue}>
                        <View><Text style={styles.wait}>{item.status === 'FAILURE'?'失败':item.status === 'SUCCESS'?'寄存中':item.status === 'REPURCHASE'?'已兑换':item.status === 'PENDING'?'待发货':item.status === 'SHIPPED'?'已发货':'未抓中'}</Text></View>
                        {item.status === 'SUCCESS'?<View style={{flexDirection:'row',height:scaleSize(32),alignItems:'center'}}><Image source={expireTime} style={styles.expireTime}/><Text style={styles.detailExpireTime}>{item.expiredDay}天</Text></View>:<TouchableHighlight onPress={this.getLogistics.bind(this,item.id,item.status)} underlayColor='transparent'><View>{item.status === 'SHIPPED'?<Image source={wlbtn} style={styles.wlbtn}/>:<Text style={{backgroundColor:'transparent',height:scaleSize(32)}}/>}</View></TouchableHighlight>}
                    </View>
                </View>
            </TouchableHighlight>
        </View>
    );
    getMyDollList(type){
        if(type === 0){
            //统计-->金币娃娃
            AnalyticsUtil.onEventWithMap('5_5_1',{typeName:'5_5_1'});
        }else{
            //统计-->钻石娃娃
            AnalyticsUtil.onEventWithMap('5_5_2',{typeName:'5_5_2'});
        }

        this.setState({activeTab:type,selected:[],selectImage:[],selectMoney:0})
        this.getDollList(type)
    }
    toGetDoll(){
        if(this.state.activeTab === 0){
            this.setState({coinDollVisible:true})
        }else{
            /*practise判断当前的娃娃是不是练习场的，是练习场的就给个提示*/
            if(this.state.isPractise.indexOf('YES')>-1){
                this.setState({practiseVisible:true})
            }else{
                this.props.navigation.navigate('getDoll',{selected:this.state.selected,selectImage:this.state.selectImage,userId:this.state.userId})
            }
        }
    }
    render(){
        const {dollList, selected,selectMoney,selectImage,userId,defaultInfo,error,company,waybill,phone,activeTab} = this.state
        var modalBackgroundStyle = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
        };
        return(
            <View style={styles.mainBg}>
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={()=>{}}
                >
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={exchange_success} style={styles.exchange_success}>
                            <TouchableHighlight onPress={() => {
                                this.setModalVisible(false)
                            }} underlayColor='transparent'><Image source={cancel} style={styles.cancel}/></TouchableHighlight>
                            <Text style={styles.fonts}>您已选择{selected.length}个娃娃</Text>
                            <Text style={styles.font}>共可兑换{selectMoney}钻石</Text>
                            <TouchableHighlight onPress={this.exchange.bind(this)} underlayColor='transparent'>
                                <Image source={confirm_exchange} style={styles.confirm}/></TouchableHighlight>
                        </ImageBackground>
                    </View>
                </Modal>
                {/* 金币 抓中的 不允许发货*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.coinDollVisible}
                    onRequestClose={()=>{}}
                >
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={tishi} style={styles.exchange_success}>
                            <TouchableHighlight onPress={()=>{this.setState({coinDollVisible:false})}} underlayColor='transparent'><Image source={cancel} style={styles.cancelCoin}/></TouchableHighlight>
                            <Text style={styles.fonts}>金币区抓中的娃娃</Text>
                            <Text style={styles.font}>不能申请发货哦</Text>
                            <Text style={styles.zuanshifont}>(钻石区可申请)</Text>
                            <TouchableHighlight onPress={()=>{this.setState({coinDollVisible:false})}} underlayColor='transparent'>
                                <Image source={tishi_confirm} style={styles.tishiConfirm}/></TouchableHighlight>
                        </ImageBackground>
                    </View>
                </Modal>
                {/*练习场娃娃不发货*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.practiseVisible}
                    onRequestClose={()=>{}}
                >
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={tishi} style={styles.exchange_success}>
                            <TouchableHighlight onPress={()=>{this.setState({practiseVisible:false})}} underlayColor='transparent' style={{position:'absolute',right:0,top:scaleSize(90)}}><Image source={cancel} style={styles.cancelPratise}/></TouchableHighlight>
                            <Text style={styles.fontsPractise}>练习场的娃娃不能发货哦</Text>
                            <TouchableHighlight onPress={()=>{this.setState({practiseVisible:false})}} underlayColor='transparent'>
                                <Image source={tishi_confirm} style={styles.practiseConfirm}/></TouchableHighlight>
                        </ImageBackground>
                    </View>
                </Modal>
                {/*物流信息*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.wuliumodalVisible}
                    onRequestClose={()=>{}}
                >
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={layer} style={styles.layer}>
                            {this.state.toastInfoShow ?
                                <View style={styles.toastinfo}>
                                    <Text style={{fontSize: setSpText(12), color: '#fff'}}>复制成功</Text>
                                </View>:<Text style={{backgroundColor:'transparent'}}/>
                            }
                            <TouchableHighlight onPress={() => {
                                this.setwuliuModalVisible(false)
                            }} underlayColor='transparent'><Image source={cancel} style={styles.cancels}/></TouchableHighlight>
                            <View><Image source={wllogo} style={styles.wllogo}/></View>
                            <View>
                                <View style={styles.rowwuliu}>
                                    <Text style={styles.wuliuFont}>快递公司：<Text>{company}</Text></Text>
                                </View>
                                <View style={styles.rowwuliu}>
                                    <View style={{flexDirection:'row'}}>
                                        <View><Text style={styles.wuliuFont}>快递单号：</Text></View>
                                        <View style={styles.phone}><Text style={styles.wuliuFont} onPress={this.toBillCompany.bind(this,waybill)}>{waybill}</Text></View>
                                    </View>
                                    {/*复制 目前隐藏掉*/}
                                    {/*<View style={styles.wrapcopy}><Text style={styles.copy} onPress={this._setClipboardContent.bind(this,waybill)}>复制</Text></View>*/}
                                </View>
                                <View style={styles.rowwuliu}>
                                    <View><Text style={styles.wuliuFont}>官方电话：</Text></View>
                                    <View style={styles.phone}>
                                        <Text style={styles.wuliuFont} onPress={this.callMe.bind(this,phone)}>{phone}</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableHighlight onPress={this.toBillCompany.bind(this,waybill)} underlayColor='transparent'>
                                <Image source={confirm} style={styles.layerconfirm}/></TouchableHighlight>
                        </ImageBackground>
                    </View>
                </Modal>
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={this.state.exchangeResult}
                       onRequestClose={()=>{}}>
                    <View style={styles.wrapExchangeResult}>
                        <TouchableHighlight onPress={() => {
                            this.setExchangeResult(false)
                        }} underlayColor='transparent'><Image source={cancel_Modal} style={styles.cancelModal}/></TouchableHighlight><Text style={styles.exchangeResult}>{error}</Text>
                    </View>
                </Modal>
                <View style={styles.headers}>
                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Mine')}>
                        <Image source={back} style={styles.back}/>
                    </TouchableWithoutFeedback>
                    <View>
                        <Image source={doll_title} style={styles.title}/>
                    </View>
                </View>
                    <View style={styles.wrapCheck}><Text style={styles.checkText}>娃娃寄存15天及以上，会自动兑换成钻石哦</Text></View>
                <View style={{flexDirection:'row'}}>
                    <TouchableWithoutFeedback onPress={this.getMyDollList.bind(this,0)}>
                    <View style={[styles.wrapTab,activeTab === 0?styles.activeTab:'']}>
                        <Image source={little_money} style={styles.littleMoney}/>
                        <Text style={styles.myDollTab}>金币娃娃</Text>
                    </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback  onPress={this.getMyDollList.bind(this,1)}>
                    <View style={[styles.wrapTab,activeTab === 1?styles.activeTabzuanshi:'']}>
                        <Image source={zuanshi} style={styles.zuanshi}/>
                        <Text style={styles.myDollTab}>钻石娃娃</Text>
                    </View>
                    </TouchableWithoutFeedback>
                </View>
                {dollList.length === 0 ?<View style={styles.noDoll}><Text style={styles.noDollText}>{defaultInfo}</Text></View> :
                    <FlatList style={{paddingLeft:scaleSize(30),paddingRight:scaleSize(30),width:'100%',paddingBottom:scaleSize(160),backgroundColor:'#D4F8FD',paddingTop:scaleSize(30)}} initialNumToRender={20} data={dollList}  keyExtractor={this._keyExtractor} renderItem={this._renderItem}>
                </FlatList>
                  }
                <View style={styles.footer}>
                    <Image source={selected.length === 0?no_click:click} style={styles.clickIcon}/>
                    <Text style={styles.already}>已选({selected.length})</Text>
                    {selected.length === 0?<Image source={no_distribution} style={styles.distribution}/>:<TouchableWithoutFeedback onPress={this.toGetDoll.bind(this)}>
                        <Image source={distribution} style={styles.distributionActive}/></TouchableWithoutFeedback>}
                    {selected.length === 0?<Image source={duihuan_zuanshi_disable} style={styles.exchange}/>:<TouchableWithoutFeedback onPress={() =>  this.setModalVisible(true) }>
                        <Image source={duihuan_zuanshi} style={styles.exchangeActive}/></TouchableWithoutFeedback>}
                </View>
            </View>
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
        minHeight:Dimensions.get('window').height-scaleSize(138),
        backgroundColor:'#fff',
        //paddingTop:ifIphoneX(scaleSize(30),0),
    },
    wrapDoll:{
        width:'100%',
        height:scaleSize(188),
        backgroundColor:'#fff',
        borderRadius:scaleSize(20),
        paddingLeft:scaleSize(20),
        paddingRight:scaleSize(20),
        flexDirection:'row',
        alignItems:'center',
        marginBottom:scaleSize(30)
    },
    dollImg:{
        width:scaleSize(137),
        height:scaleSize(137),
        borderWidth:scaleSize(1),
        borderColor:'#44E1F4',
        borderRadius:scaleSize(34),
        marginLeft:scaleSize(32),
        marginRight:scaleSize(32),
        position:'relative'
    },
    selected:{
        width:scaleSize(44),
        height:scaleSize(44.9)
    },
    date:{
        marginTop:scaleSize(10),
        marginBottom:scaleSize(10),
        color:'#666666',
        fontSize:setSpText(26),
    },
    row:{
        flexDirection:'row',
        width:'100%',
    },
    name:{
        fontFamily:"PingFang-SC-Medium",
        fontSize:setSpText(32),
        color:'#323232'
    },
    detailTime:{
        marginLeft:scaleSize(20),
        marginTop:scaleSize(10),
        marginBottom:scaleSize(10),
        fontSize:setSpText(26),
        color:'#666666',
    },
    wait:{
        color:'#FF7171',
        fontSize:setSpText(30),
        textAlign:'center'
    },
    exchangeSum:{
        color:'#666666',
        fontSize:setSpText(26),
        flex:1
    },
    distribution:{
        width:scaleSize(190.4),
        height:scaleSize(67.3)
    },
    distributionActive:{
        width:scaleSize(178.4),
        height:scaleSize(67.3)
    },
    exchange:{
        width:scaleSize(190.4),
        height:scaleSize(67.3),
        marginLeft:scaleSize(20)
    },
    exchangeActive:{
        width:scaleSize(178.4),
        height:scaleSize(67.3),
        marginLeft:scaleSize(20)
    },
    already:{
        fontSize:setSpText(32),
        color:'#1a1a1a',
        flex:1,
        marginLeft:scaleSize(40)
    },
    clickIcon:{
        width:scaleSize(44),
        height:scaleSize(44)
    },
    footer:{
        width:'100%',
        height:ifIphoneX(scaleSize(138),scaleSize(98)),
        backgroundColor:'#fff',
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:scaleSize(50),
        paddingRight:scaleSize(50),
        paddingBottom:ifIphoneX(scaleSize(44),0)
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        left:scaleSize(16),
        top:scaleSize(38)
    },
    headers:{
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(40),
        paddingBottom:scaleSize(30),
        paddingTop:ifIphoneX(scaleSize(80),scaleSize(44)),
        backgroundColor:'#44E1F4'
    },
    title:{
        width:scaleSize(188),
        height:scaleSize(40)
    },
    fonts:{
        fontSize:setSpText(48),
        marginTop:scaleSize(62),
        backgroundColor:'transparent',
        color:'#323232',
        fontFamily:'PingFang SC'
    },
    font:{
        fontSize:setSpText(48),
        marginTop:scaleSize(20),
        backgroundColor:'transparent',
        color:'#323232',
        fontFamily:'PingFang SC'
    },
    exchange_success:{
        width:scaleSize(653),
        height:scaleSize(668),
        marginTop:scaleSize(240),
        alignItems:'center',
        justifyContent:'center'
    },
    confirm:{
        width:scaleSize(277),
        height:scaleSize(96),
        marginTop:scaleSize(57)
    },
    cancel:{
        width:scaleSize(100),
        height:scaleSize(100),
        marginLeft:scaleSize(540)
    },
    cancels:{
        width:scaleSize(100),
        height:scaleSize(100),
        marginLeft:scaleSize(536),
        marginTop:scaleSize(-2)
    },
    container: {
        flex: 1,
        padding: scaleSize(40),
        alignItems:'center',
    },
    noDollText:{
        color:'#fff',
        backgroundColor:'transparent',
        fontSize:setSpText(40)
    },
    noDoll:{
        flex:1,
        width:'100%',
        height:scaleSize(600),
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#D4F8FD'
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
    cancelModal:{
        width:scaleSize(50),
        height:scaleSize(50)
    },
    dollImgWidth:{
        width:'100%',
        height:'100%',
        borderRadius:scaleSize(34)
    },
    gameRecord:{
        width:scaleSize(188),
        height:scaleSize(36),
    },
    wlbtn:{
        width:scaleSize(126),
        height:scaleSize(45)
    },
    wuliuFont:{
        color:'#000',
        fontSize:setSpText(32)
    },
    wrapcopy:{
        borderWidth:scaleSize(1),
        borderColor:'#c4c3c1',
        borderRadius:scaleSize(5),
        width:scaleSize(82),
        height:scaleSize(35),
        alignItems:'center',
        flexDirection:'row',
        justifyContent:'center',
        marginLeft:scaleSize(17)
    },
    copy:{
        color:'#969494',
        fontSize:setSpText(24)
    },
    wllogo:{
        width:scaleSize(170),
        height:scaleSize(42),
        marginBottom:scaleSize(28)
    },
    layer:{
        width:scaleSize(626),
        height:scaleSize(588),
        marginTop:scaleSize(240),
        alignItems:'center',
    },
    layerconfirm:{
        width:scaleSize(213),
        height:scaleSize(96),
        marginTop:scaleSize(37)
    },
    rowwuliu:{
        width:'100%',
        flexDirection:'row',
        height:scaleSize(60),
        alignItems:'center'
    },
    phone:{
        borderBottomWidth:scaleSize(2),
        borderBottomColor:'#000',
        borderStyle:'dashed'
    },
    toastinfo:{
        backgroundColor:'rgba(0,0,0,0.9)',
        paddingLeft:'7%',
        paddingRight:'7%',
        height:scaleSize(60),
        borderRadius:scaleSize(30),
        alignItems:'center',
        justifyContent:'center',
        position:'absolute',
        left:'35%',
        top:'50%',
        zIndex:9,
    },
    expireTime:{
        width:scaleSize(28),
        height:scaleSize(31.6)
    },
    detailExpireTime:{
        color:'#8AEDFC',
        fontSize:setSpText(30),
        marginLeft:scaleSize(6)
    },
    checkText:{
        color:'#333333',
        fontSize:setSpText(24)
    },
    wrapCheck:{
        width:'100%',
        backgroundColor:'#ffec9d',
        height:scaleSize(50),
        alignItems:'center',
        justifyContent:'center',
        marginBottom:scaleSize(24)
    },
    wrapTexts:{
        width:'100%',
        height:scaleSize(40)
    },
    wrapStatue:{
        height:'100%',
        justifyContent:'space-between',
        paddingTop:scaleSize(36),
        paddingBottom:scaleSize(20)
    },
    /*我的娃娃 播放游戏视频*/
    playGame:{
        width:scaleSize(66),
        height:scaleSize(66),
        position:'absolute',
        left:'26%',
        top:'26%'
    },
    wrapTab:{
        flexDirection:'row',
        width:'50%',
        justifyContent:'center',
        alignItems:'center',
        height:scaleSize(89),
    },
    littleMoney:{
        width:scaleSize(51),
        height:scaleSize(50)
    },
    zuanshi:{
        width:scaleSize(50.6),
        height:scaleSize(49)
    },
    activeTab:{
        backgroundColor:'#D4F8FD',
        borderTopRightRadius:scaleSize(10)
    },
    activeTabzuanshi:{
        backgroundColor:'#D4F8FD',
        borderTopLeftRadius:scaleSize(20)
    },
    tishiConfirm:{
        width:scaleSize(213),
        height:scaleSize(96)
    },
    zuanshifont:{
        color:'#FD7171',
        fontSize:setSpText(28),
        marginTop:scaleSize(31),
        marginBottom:scaleSize(42)
    },
    cancelCoin:{
        width:scaleSize(100),
        height:scaleSize(100),
        marginLeft:scaleSize(530),
    },
    myDollTab:{
        fontSize:setSpText(32),
        color:'#384041',
        marginLeft:scaleSize(23)
    },
    cancelPratise:{
        width:scaleSize(100),
        height:scaleSize(100),
    },
    fontsPractise:{
        fontSize:setSpText(48),
        backgroundColor:'transparent',
        color:'#323232',
        fontFamily:'PingFang SC',
        marginTop:scaleSize(100),
        marginBottom:scaleSize(100)
    },
    practiseConfirm:{
        width:scaleSize(213),
        height:scaleSize(96)
    }
})