import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight,TextInput,Modal,ScrollView} from 'react-native';
import index_bg from '../../resource/mainBG.png'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import back from '../../resource/back.png'
import allege_title from '../../resource/allege-reason.png'
import submit from '../../resource/submit-allege.png'
import no_click from '../../resource/no-click.png'
import click from '../../resource/allege-click.png'
import {api} from '../../common/api.config'
import cancel_Modal from '../../resource/cancel.png'
import layer from '../../resource/layer.png'
import confirm from '../../resource/confirm.png'
import Headers from '../../common/fetch_header'
import {consoleDebug} from '../../common/tool'

/**
 * 申诉界面
 */
export default  class allegeScreen extends Component{
    constructor(props){
        super(props)
        const navigation = this.props.navigation;
        this.state={feedbackList:[],selectId:'',address:'',message:'',allegeId:'',userDollId:navigation.state.params && navigation.state.params.userDollId !== undefined?navigation.state.params.userDollId:null,exchangeResult:false,info:'',toastInfoShow:false}
        this.selectFeedback = this.selectFeedback.bind(this)
    }
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
            fetch(api.allegeSelect, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    return
                }else{
                    return response.json()
                }
            }).then((res)=>{
                _this.setState({feedbackList:res})
            }).
            catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    selectFeedback(id,allegeId){
        this.setState({selectId:id,allegeId:allegeId})
    }
    setExchangeResult(visible) {
        this.setState({exchangeResult: visible});
    }
    submit(){
        let _this = this
        if(_this.state.allegeId.length === 0 && _this.state.message.length === 0){
            _this.setState({exchangeResult:true,info:'申诉内容必填'})
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
            let param = {
                userDollId:_this.state.userDollId,
                appealId:_this.state.allegeId,
                message:_this.state.message
            }
            console.info(param)
            fetch(api.allege, {method: 'POST',headers: Headers(ret[0]),body: JSON.stringify(param)}).then((response) => {
                if(response.status !== 200){
                    _this.setState({exchangeResult:true})
                    _this.setState({info:'申述失败，请稍后重试'})
                    return
                }else{
                    _this.setState({toastInfoShow:true})
                    setTimeout(()=>{
                        _this.setState({toastInfoShow:false})
                    },2000)
                    const nav = this.props.navigation
                    nav.navigate('gameRecord')
                }
            }).catch((e) => {
                _this.setState({exchangeResult:true})
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            _this.setState({exchangeResult:true})
            consoleDebug("获取数据失败")
            throw e
        })
    }
    render(){
        const {feedbackList,selectId,info}  = this.state
        var modalBackgroundStyle = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
        };
        return(
            <ImageBackground source={index_bg} style={styles.mainBg}>
                <Modal animationType={"fade"}
                       transparent={true}
                       visible={this.state.exchangeResult}
                       onRequestClose={()=>{}}>
                    <View style={[styles.container, modalBackgroundStyle]}>
                    <ImageBackground source={layer} style={styles.layer}>
                        <View><Text style={styles.error}>{info}</Text></View>
                        <TouchableHighlight onPress={() => {
                            this.setExchangeResult(false)
                        }} underlayColor='transparent'><View style={styles.modalConfirm}><Image source={confirm} style={styles.confirmColor}/></View></TouchableHighlight>
                    </ImageBackground>
                    </View>
                </Modal>
                <ScrollView style={{width:'100%'}}>
                <View style={styles.headers}>
                    <TouchableHighlight onPress={() => this.props.navigation.navigate('gameDetail')} underlayColor='transparent'>
                        <Image source={back} style={styles.back}/>
                    </TouchableHighlight>
                    <View style={{flex:1,alignItems:'center'}}>
                        <Image source={allege_title} style={styles.title}/>
                    </View>
                </View>
                <View style={styles.wrapRecord}>
                    <View style={{width:'100%'}}>
                        {feedbackList.map((item,i)=>{
                            return(
                                <TouchableHighlight onPress={this.selectFeedback.bind(this,i,item.id)} underlayColor='transparent' key={i}><View style={styles.content}>{selectId === i ?<Image source={click} style={styles.icon}/>:<Image  source={no_click} style={styles.icon}/>}<Text key={i} style={styles.contentText}>{item.content}</Text></View></TouchableHighlight>
                            )
                        })}
                    </View>
                    <TextInput underlineColorAndroid="transparent" onChangeText={(message) => this.setState({message})} multiline = {true} value={this.state.message} style={styles.textInputAddress}  textAlignVertical='top' placeholder="其他原因：" maxLength={140}/>
                    <TouchableHighlight onPress={this.submit.bind(this)} underlayColor='transparent'><View><Image source={submit} style={styles.submit}/></View></TouchableHighlight>
                </View>
                </ScrollView>
                {this.state.toastInfoShow? <View style={styles.toastinfo}>
                    <Text style={{fontSize:setSpText(24),color:'#fff'}}>提交成功</Text>
                </View>:<Text style={styles.noTextShow}/>}
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
    headers:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginTop:scaleSize(60),
        marginBottom:scaleSize(20)
    },
    title:{
        width:scaleSize(188),
        height:scaleSize(40)
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        top:scaleSize(-30)
    },
    wrapRecord:{
        width:'100%',
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(30),
        paddingTop:scaleSize(30),
        paddingBottom:scaleSize(30),
        alignItems:'center',
        justifyContent:'center'
    },
    content:{
        width:'100%',
        height:scaleSize(92),
        backgroundColor:'#fff',
        marginTop:scaleSize(30),
        borderRadius:scaleSize(20),
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:scaleSize(18),
        paddingRight:scaleSize(18)
    },
    row:{
        flexDirection:'row'
    },
    submit:{
        width:scaleSize(304),
        height:scaleSize(96),
        marginTop:scaleSize(78)
    },
    icon:{
        width:scaleSize(34),
        height:scaleSize(34)
    },
    contentText:{
        fontSize:setSpText(32),
        color:'#000',
        marginLeft:scaleSize(17)
    },
    textInputAddress:{
        color:'#323232',
        width:'100%',
        backgroundColor:'#fff',
        height:scaleSize(403),
        marginTop:scaleSize(49),
        borderRadius:scaleSize(20),
        paddingRight:scaleSize(23),
        paddingLeft:scaleSize(23),
        paddingTop:scaleSize(17)
    },
    /*弹出层*/
    layer:{
        width:scaleSize(653),
        height:scaleSize(578),
        marginTop:scaleSize(216),
        alignItems:'center'
    },
    container: {
        flex: 1,
        padding: scaleSize(80),
        alignItems:'center',
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
    error:{
        marginTop:scaleSize(180),
        marginBottom:scaleSize(80),
        fontSize:setSpText(48),
        color:'#323232',
        fontWeight:'bold'
    },
    /*弹窗样式*/
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
        top:'50%'
    },
    noTextShow:{
        backgroundColor:'transparent',
        position:'absolute',
        height:0
    },
})