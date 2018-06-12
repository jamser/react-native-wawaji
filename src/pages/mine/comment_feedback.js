import React,{Component} from 'react'
import {StyleSheet,View,ImageBackground,Image,Text,TextInput,Dimensions,TouchableWithoutFeedback,Platform,BackHandler,TouchableHighlight} from 'react-native'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import header_bg from '../../resource/mainBG.png'
import yijianfankui from '../../resource/yijianfankui.png'
import submit from '../../resource/yijian-submit.png'
import back from '../../resource/back.png'
import {api} from '../../common/api.config'
import Headers from '../../common/fetch_header'
import {NavigationActions} from 'react-navigation'
export default class Room extends Component{
    constructor(props){
        super(props)
        const param  = this.props.navigation.state.params
        this.state = {description:null,tel:null,from:param && param.from !== undefined ?param.from:'getDoll',machineId:param && param.machineId !== undefined ?param.machineId:''}
    }
    componentWillMount(){
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    onBackAndroid = () => {
        /*清空页面站，kill，并且跳转到相应的页面*/
        const nav = this.props.navigation;
        if(this.state.from === 'Room'){
            this.cleanAndJump('Room',{machineId:this.state.machineId})
        }else if(this.state.from === 'getDollGuide'){
            this.cleanAndJump('myDoll')
        }else if(this.state.from === 'aboutGuide'){
            this.cleanAndJump('aboutUs')
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
    submit(){
        if(this.state.description === null || this.state.description.length === 0){
            return
        }
        let url = api.feedback
        let param = {phone:this.state.tel,message:this.state.description}
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
                if(res.status === 200){
                    console.log("吐槽成功")
                    this.onBackAndroid()
                }else{
                    console.log("吐槽失败")
                }
            })
        }).catch((err)=>{
            throw err
        })
    }

    render(){
        return(
            <View>
            <ImageBackground style={styles.header} source={header_bg}>
                <TouchableHighlight onPress={this.onBackAndroid.bind(this)} underlayColor='transparent' >
                    <Image source={back} style={styles.back}/>
                </TouchableHighlight>
                <Image source={yijianfankui} style={styles.feedbackTitle}/>
            </ImageBackground>
                <View style={styles.content}>
                    <View>
                        <Text style={styles.text}>请详细描述问题和意见(必填)</Text>
                    </View>
                    <TextInput style={styles.textInput} placeholder="请输入不少于5个字的意见..." underlineColorAndroid='transparent' textAlignVertical='top' onChangeText={(description) => this.setState({description})} value={this.state.description} maxLength={200}/>
                    <Text style={styles.text}>请留下您的联系方式(非必填)</Text>
                    <TextInput style={styles.telInput} placeholder="联系电话" underlineColorAndroid='transparent' onChangeText={(tel) => this.setState({tel})} value={this.state.tel}/>
                    <View style={styles.wrapSubmit}>
                        <TouchableWithoutFeedback onPress={this.submit.bind(this)}>
                        <Image source={submit} style={styles.submit}/>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    header:{
        width:'100%',
        height:ifIphoneX(scaleSize(172),scaleSize(128)),
        flexDirection:'row',
        alignItems:'center',
    },
    content:{
        paddingLeft:scaleSize(18),
        paddingRight:scaleSize(18),
        minHeight:Dimensions.get('window').height - scaleSize(128),
        backgroundColor:'#fff'
    },
    text:{
        color:'#323232',
        fontSize:setSpText(24),
        marginTop:scaleSize(30),
        marginBottom:scaleSize(20)
    },
    back: {
        width: scaleSize(60),
        height: scaleSize(60),
        marginLeft: scaleSize(20),
        marginTop: scaleSize(20),
        marginRight:scaleSize(280),
    },
    feedbackTitle:{
        width:scaleSize(124),
        height:scaleSize(30)
    },
    textInput:{
        width:'100%',
        height:scaleSize(200),
        backgroundColor:'#DFDFDF',
        padding: 0,
        color:'#868686',
        fontSize:setSpText(28),
        paddingLeft:scaleSize(28),
        paddingTop:scaleSize(19),
        paddingBottom:scaleSize(19),
        paddingRight:scaleSize(28)
    },
    telInput:{
        width:'100%',
        height:scaleSize(66),
        backgroundColor:'#DFDFDF',
        padding: 0,
        color:"#868686",
        fontSize:setSpText(28),
        paddingLeft:scaleSize(28),
        alignItems:'center'
    },
    wrapSubmit:{
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        marginTop:scaleSize(103)
    },
    submit:{
        width:scaleSize(466),
        height:scaleSize(112)
    }
})