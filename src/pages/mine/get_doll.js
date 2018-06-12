import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight,Modal,ScrollView,Platform,BackHandler,TextInput,TouchableWithoutFeedback} from 'react-native';
import index_bg from '../../resource/mainBG.png'
import little_money from '../../resource/littlemoney.png'
import pay_send from '../../resource/paysend.png'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import back from '../../resource/back.png'
import {api} from '../../common/api.config'
import layer from '../../resource/layer.png'
import confirm from '../../resource/confirm.png'
import cancel from '../../resource/cancel.png'
import titles from '../../resource/shipping-title.png'
import {consoleDebug} from '../../common/tool'
import Headers from '../../common/fetch_header'
import zuanshi from '../../resource/mine-zuanshi.png'
import Application from '../../components/jumpToApplicationMarket'
/**
 * 领取娃娃
 *
 */
export default class getDollScreen extends Component{
    constructor(props){
        super(props)
        consoleDebug(this.props.navigation)
        const params = this.props.navigation.state.params
        if(params.name && params.phone && params.address && params.province && params.city && params.area){
            this.state = {noAddress:false,address:params.name+"  "+params.phone,exchangeResult:false,result:'',info:'',modalVisible:false,addressDetail:params.address,name:params.name,phone:params.phone,coin:'',title:'',content:'',balance:'',province:params.province,city:params.city,area:params.area,comment:'',successToast:false,guidance:false,}
        }else{
            this.state = {noAddress:false,address:'还没有添加地址',exchangeResult:false,result:'',info:'',modalVisible:false,addressDetail:'',coin:'',title:'',content:'',balance:'',comment:'',successToast:false,guidance:false}
        }
    }
    componentWillMount(){
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    onBackAndroid = () => {
        const nav = this.props.navigation;
        nav.navigate('myDoll');
        return true;
    };
    componentDidMount(){
        let _this = this
        _this.getDollText()
        _this.getCurrentCoin()
        let url = api.getAddress
        /*获得是否有地址*/
        const params = this.props.navigation.state.params
        if(params.name && params.phone && params.address && params.province && params.city && params.area){
            consoleDebug("发货地址",_this.state.name,_this.state.phone,_this.state.address)
        }else {
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
                        _this.setState({noAddress: true})
                    }else {
                        return response.json()
                    }
                }).then((res) => {
                    consoleDebug(JSON.stringify(res))
                    if(res.name !== null && res.phone !== null && res.address !== null) {
                        _this.setState({
                            address: res.name + " " + res.phone,
                            addressDetail: res.address,
                            name: res.name,
                            phone: res.phone,
                            province:res.province,
                            city:res.city,
                            area:res.area
                        })
                    }else{
                        _this.setState({noAddress: true})      //判断当前地址 是不是为null
                    }
                }).catch((e) => {
                    consoleDebug("失败" + e)
                })
            }).catch((e)=>{
                consoleDebug("获取数据失败")
                throw e
            })
        }
    }
    getDoll(){
        let _this = this
        const params= this.props.navigation.state.params
        let selectId = params.selected?params.selected:[]
        let url = api.myDoll
        if(this.state.address === '还没有添加地址' || this.state.name === null || this.state.phone === null){
            _this.setState({info:'您还没有添加地址',modalVisible:true})
            return
        }
        if(this.state.balance<60 && selectId.length === 1){
            _this.setState({info:'您当前余额不足以支付邮费',modalVisible:true})
            return
        }
        if(_this.state.province === null || _this.state.city === null || _this.state.area == null){
            _this.setState({info:'请修改地址并填写省市区',modalVisible:true})
            return
        }
        let param ={
            "ids":selectId,
            "payment":"RECEIVE",   //RECEIVE 领取，EXCHANGE 兑换
            "name":_this.state.name,  //param.name
            "phone":_this.state.phone,
            "address":_this.state.addressDetail,
            "province":_this.state.province,
            "city":_this.state.city,
            "area":_this.state.area,
            "remark":_this.state.comment
        }
        console.info(JSON.stringify(param)+"领取娃娃")
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            fetch(url,{method:'POST',headers:Headers(ret[0]),body: JSON.stringify(param)}).then((res)=>{
                consoleDebug("成功"+JSON.stringify(res))
                if(res.status === 200){
                    _this.setState({modalVisible:true,successToast:true})
                    /*/!*弹出评价的弹窗*!/
                    storage.load({
                        key: 'getDollGuide',
                        autoSync: true,
                        syncInBackground: true,
                        syncParams: {
                            extraFetchOptions: {},
                            someFlag: true,
                        },
                    }).then((ret)=>{
                        console.info("领取娃娃的时间")
                        console.info(ret)
                        this.setState({
                            assessTime:ret.time,
                            assessType:ret.type,
                        });
                    }).catch((err)=>{
                        console.log("该用户从来没评价过")
                        /!*该用户从没评价过，这个时候会走到这里来，这个时候*!/
                        // _this.setState({guidance:true})
                        throw  err
                    })*/
                }else{
                    _this.setState({exchangeResult:true,result:'提交失败，请稍后重试'})
                }
            }).catch((e)=>{
                consoleDebug("失败"+e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    setExchangeResult(visible) {
        this.setState({exchangeResult: visible});
    }
    setModalVisible(visible) {
        this.setState({modalVisible: visible});
        /*弹出评价的弹窗*/
        storage.load({
            key: 'getDollGuide',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            console.info("领取娃娃的时间")
            console.info(ret)
            this.setState({
                assessTime:ret.time,
                assessType:ret.type,
            });
        }).catch((err)=>{
            console.log("该用户从来没评价过")
            /*该用户从没评价过，这个时候会走到这里来，这个时候*/
            _this.setState({guidance:true})
            throw  err
        })
        let _this=this;
        let timeDifference = Math.ceil(new Date().getTime() - this.state.assessTime)
        if(this.state.assessType === 'wantPlay' && timeDifference > 1000 * 3600 * 24 * 6){
            _this.setState({guidance:true})
        }else if(this.state.assessType === 'giveBad' && timeDifference > 1000 * 3600 * 24 * 15){
            _this.setState({guidance:true})
        }else if(this.state.assessType === 'giveGood' && timeDifference >1000 * 3600 * 24 * 30){
            _this.setState({guidance:true})
        }else{
            this.props.navigation.navigate('myDoll')
        }
    }
    getDollText(){
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            consoleDebug(api.inviteCoin)
            fetch(api.getDollText, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    return
                }else{
                    return response.json()
                }
            }).then((res)=>{
                console.info(res)
                this.setState({content:res.content,coin:res.coin,title:res.title})
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    /*获取用户当时的金币*/
    getCurrentCoin(){
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
            fetch(api.userInfo, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    _this.setState({exchangeResult:true})
                }else{
                    return response.json()
                }
            }).then((res)=>{
                consoleDebug(JSON.stringify(res)+"成功")
                _this.setState({balance:res.balance})
            }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    render(){
        const {state} = this.props.navigation;
        const {noAddress,address,result,info,addressDetail,name,phone,coin,title,content,province,city,area} = this.state
        var modalBackgroundStyle = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
        };
        return(
            <ImageBackground source={index_bg} style={styles.mainBg}>
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={this.state.modalVisible}
                       onRequestClose={()=>{}}>
                    <View style={[styles.container, modalBackgroundStyle]}>
                        <ImageBackground source={layer} style={styles.layer}>
                            {this.state.successToast?<View style={styles.successToast}>
                                <Text style={styles.successText}>提交成功</Text>
                                <Text style={styles.successTexts}>您的娃娃将会在3个工作日内发出</Text>
                            </View>: <View><Text style={styles.error}>{info}</Text></View>}
                            <TouchableHighlight onPress={() => {
                                this.setModalVisible(false)
                            }} underlayColor='transparent'><View style={styles.modalConfirm}><Image source={confirm} style={styles.confirmColor}/></View></TouchableHighlight>
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
                        }} underlayColor='transparent'><Image source={cancel} style={styles.cancel}/></TouchableHighlight><Text style={styles.exchangeResult}>{result}</Text>
                    </View>
                </Modal>
                <Application showModal={this.state.guidance} modalType={'getDollGuide'} navigation={this.props.navigation}/>
                <View style={styles.headers}>
                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('myDoll',{userId:this.props.navigation.state.params.userId})}>
                        <Image source={back} style={styles.back}/>
                    </TouchableWithoutFeedback>
                    <View>
                        <Image source={titles} style={styles.title}/>
                    </View>
                </View>
                <ScrollView style={{width:'100%'}}>
                <View style={styles.sendDoll}>
                    <View style={styles.wrapDoll}>
                        {state.params.selectImage.map((item,i)=>{
                            return <View style={styles.doll} key={i}><Image source={{uri:item}} style={styles.dollImgWidth}/></View>
                        })}
                    </View>
                    <Text style={styles.bottom}/>
                    <View style={styles.wrapAdd}><Text style={styles.total}>共{state.params.selectImage.length}件</Text></View>
                </View>
                <View style={styles.add}>
                    <View style={styles.wrapNoAddress}>
                        <Text style={styles.noAddress}>{address}</Text>
                        <Text style={styles.noAddress}>{province}{city}{area}</Text>
                        <Text style={styles.noAddress}>{addressDetail}</Text>
                    </View>
                    <TouchableHighlight onPress={() => this.props.navigation.navigate('addAddress',{selectImage:state.params.selectImage,selected:state.params.selected,userId:state.params.userId,name:name,phone:phone,address:addressDetail,province:province,city:city,area:area})} underlayColor='transparent'>
                        <View style={styles.wrapAdd}><Text style={styles.addAddress}>{noAddress?'添加地址':'修改地址'}</Text></View></TouchableHighlight>
                </View>
                    <View style={styles.wrapComment}>
                        <Text style={styles.commentText}>备注</Text>
                        <TextInput underlineColorAndroid="transparent" onChangeText={(comment) => this.setState({comment})} multiline = {true} value={this.state.comment} textAlignVertical='top' style={styles.comment}/>
                    </View>
                <View style={styles.add}>
                    <View style={styles.wrapPostage}>
                        <Text style={styles.postage}>{title}</Text>
                        <View style={styles.wrapPost}><Text style={styles.postFee}>{state.params.selectImage.length === 1 ?coin:0}</Text><Image source={zuanshi} style={styles.littleMoney}/></View>
                    </View>
                    <Text style={styles.lightFont}>{content}</Text>
                    {/*<Text style={styles.lightFont}>2.一个需要支付60金币</Text>*/}
                </View>
                    <View style={styles.wrapButton}>
                <TouchableHighlight onPress={this.getDoll.bind(this)} underlayColor='transparent'>
                    <Image source={pay_send} style={styles.paySend}/></TouchableHighlight></View>
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
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(30),
        paddingTop:ifIphoneX(scaleSize(30),0),
    },
    sendDoll:{
        width:'100%',
        backgroundColor:'#fff',
        paddingLeft:scaleSize(31),
        paddingRight:scaleSize(31),
        borderRadius:scaleSize(20),
        paddingTop:scaleSize(40),
        paddingBottom:scaleSize(40),
        marginTop:scaleSize(40)
    },
    add:{
        width:'100%',
        backgroundColor:'#fff',
        paddingLeft:scaleSize(31),
        paddingRight:scaleSize(31),
        marginTop:scaleSize(40),
        borderRadius:scaleSize(20),
        paddingTop:scaleSize(40),
        paddingBottom:scaleSize(40)
    },
    paySend:{
        width:scaleSize(269),
        height:scaleSize(96),
        marginTop:scaleSize(100)
    },
    addAddress:{
        fontSize:setSpText(34),
        color:'#ff7171',
    },
    noAddress:{
        fontSize:setSpText(32),
        color:'#323232'
    },
    wrapNoAddress:{
        minHeight:scaleSize(116)
    },
    lightFont:{
        fontSize:setSpText(28),
        color:'#666666',
        marginTop:scaleSize(8)
    },
    postage:{
        fontSize:setSpText(32),
        color:'#323232',
        flex:1
    },
    littleMoney:{
        width:scaleSize(32),
        height:scaleSize(32),
        marginLeft:scaleSize(5),
        position:'relative',
        top:scaleSize(4)
    },
    wrapPostage:{
        flexDirection:'row',
        marginBottom:scaleSize(20)
    },
    wrapAdd:{
        alignItems:'flex-end',
    },
    bottom:{
       width:'100%',
       height:scaleSize(1),
        backgroundColor: 'rgba(174,174,174,0.4)',
    },
    doll:{
        width:scaleSize(139),
        height:scaleSize(139),
        borderRadius:scaleSize(33),
        borderColor:'#44e1f4',
        borderWidth:scaleSize(1),
        marginRight:scaleSize(30),
        marginBottom:scaleSize(40)
    },
    wrapDoll:{
        flexDirection:'row',
        flexWrap:'wrap'
    },
    total:{
        fontSize:setSpText(32),
        color:'#323232',
        marginTop:scaleSize(34),
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        left:0,
    },
    headers:{
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginTop:scaleSize(60),
        paddingLeft:0,
    },
    title:{
        width:scaleSize(188),
        height:scaleSize(40)
    },
    postFee:{
        color:'#323232',
        fontSize:setSpText(32),
    },
    wrapPost:{
        marginTop:scaleSize(-3),
        flexDirection:'row'
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
    container: {
        flex: 1,
        padding: scaleSize(80),
        alignItems:'center',
    },
    error:{
        marginTop:scaleSize(180),
        marginBottom:scaleSize(20),
        fontSize:setSpText(48),
        color:'#323232',
        fontWeight:'bold',
        paddingLeft:scaleSize(60),
        paddingRight:scaleSize(60),
        textAlign:'center'
    },
    modalConfirm:{
        width:'100%',
        height:scaleSize(114),
        justifyContent:'center',
        marginTop:scaleSize(30)
    },
    confirmColor:{
        width:scaleSize(219),
        height:scaleSize(98),
    },
    layer:{
        width:scaleSize(653),
        height:scaleSize(578),
        marginTop:scaleSize(216),
        alignItems:'center'
    },
    cancel:{
        width:scaleSize(50),
        height:scaleSize(50)
    },
    wrapButton:{
        flex:1,
        alignItems:'center',
        marginBottom:scaleSize(60)
    },
    dollImgWidth:{
        width:'100%',
        height:'100%',
        borderRadius:scaleSize(34)
    },
    cancelModal:{
        width:scaleSize(50),
        height:scaleSize(50)
    },
    /*备注*/
    wrapComment:{
        backgroundColor:'#fff',
        marginTop:scaleSize(38),
        borderRadius:scaleSize(8),
        paddingBottom:scaleSize(16),
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(30),
        paddingTop:scaleSize(16)
    },
    comment:{
        width:'100%',
        height:scaleSize(100),
    },
    commentText:{
        color:'#323232',
        fontSize:scaleSize(30)
    },
    successToast:{
        alignItems:'center',
        justifyContent:'center',
        paddingLeft:scaleSize(60),
        paddingRight:scaleSize(60),
        paddingTop:scaleSize(100)
    },
    successText:{
        fontSize:setSpText(48),
        color:'#323232',
        fontWeight:'bold',
        textAlign:'center'
    },
    successTexts:{
        fontSize:setSpText(48),
        color:'#323232',
        textAlign:'center'
    }
})