import React from 'react'
import {StyleSheet, View, Image, Text, TextInput,AndroidTextInput, ImageBackground, TouchableHighlight,Platform,TouchableOpacity,BackHandler} from 'react-native'
import {setSpText,scaleSize} from '../../common/util'
import {api} from '../../common/api.config'

export default class Room extends React.Component {
    constructor(props){
        super(props)
        this.state = {text:''}
        this.showToast = this.showToast.bind(this)   //自己改写的toast
    }
    componentWillMount(){
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    onBackAndroid = () => {
        const nav = this.props.navigation;
        nav.goBack();
        return true;
    };
_feedback() {
    let _this = this
    storage.load({
        key: 'userInfo',
        // autoSync(默认为true)意味着在没有找到数据或数据过期时自动调用相应的sync方法
        autoSync: true,
        // syncInBackground(默认为true)意味着如果数据过期，
        // 在调用sync方法的同时先返回已经过期的数据。
        // 设置为false的话，则等待sync方法提供的最新数据(当然会需要更多时间)。
        syncInBackground: true,
        // 你还可以给sync方法传递额外的参数
        syncParams: {
            extraFetchOptions: {
                // 各种参数
            },
            someFlag: true,
        },
    })
        .then(ret => {
            console.info('ret', ret)
            fetch(api.feedback, {
                method: 'POST', headers: {'Content-Type': 'application/json','Authorization':'Bearer ' + ret[0]}, body: JSON.stringify({
                    "message": _this.state.text
                })
            })
                .then(res => {
                    if (res.status === 200) {
                        _this.setState({text: ''})
                            this.showToast('反馈成功')
                        console.info(api.feedback, _this.state.text, '提交成功')
                        _this.props.navigation.goBack()
                    }
                })
        })
        .catch(err => {
            console.info(api.feedback, err)
            _this.props.navigation.goBack()
        })
}
    showToast(meg){
        this.setState({toastInfoShow:true,toastInfo:meg})
        setTimeout(()=>{
            this.setState({toastInfoShow:false})
        },3000)
    }
render() {
       let state = this.state
    return (
    <ImageBackground source={require('../../resource/mainBG.png')} style={Platform.OS === 'ios'?[styles.container,{paddingTop:scaleSize(40)}]:styles.container}>
        <View style={styles.headers}>
            <TouchableHighlight style={{position:'absolute',left:0}} onPress={() => this.props.navigation.goBack()} underlayColor='transparent'>
                <Image source={require('../../resource/back.png')} style={styles.back}/>
            </TouchableHighlight>
                <Image source={require('../../resource/commit-feedback.png')} style={styles.title}/>
        </View>
        <View style={{alignItems:'center',marginTop:scaleSize(40)}}>
        {Platform.OS === 'ios' ? <View style={styles.bg}><TextInput
            style={styles.textInput}
            multiline={true}
            placeholder="请输入您要反馈的内容"
            onChangeText={(text) => this.setState({text})}
            value={state.text}
        /></View> : <View style={styles.bg}><TextInput
            style={[styles.textInput,{paddingTop:scaleSize(40),paddingBottom:scaleSize(40),paddingLeft:scaleSize(40),paddingRight:scaleSize(40)}]}
            multiline={true}
            numberOfLines = {35}
            textAlignVertical='top'
            underlineColorAndroid='transparent'
            placeholder="请输入您要反馈的内容"
            onChangeText={(text) => this.setState({text})}

            value={state.text}
        /></View>}
        </View>
        <TouchableOpacity onPress={() => {
            this._feedback()
        }} style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
            <Image style={styles.submitBtn} source={require('../../resource/submit.png')}/>
        </TouchableOpacity>
        {this.state.toastInfoShow? <View style={styles.toastinfo}>
            <Text style={{fontSize:setSpText(24),color:'#fff'}}>{state.toastInfo}</Text>
        </View>:<Text style={{backgroundColor:'transparent'}}/>}
    </ImageBackground>
)
}
}
const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        paddingLeft: scaleSize(24),
        paddingRight: scaleSize(24),
        display: 'flex',
    },
    submitBtn: {
        width: scaleSize(254),
        height: scaleSize(112),
        marginTop:scaleSize(54)
    },
    back:{
        width: scaleSize(66),
        height: scaleSize(66),
        justifyContent:'flex-start',
        alignItems:'flex-start'
    },
    headers:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginTop:scaleSize(12),
        paddingLeft:0,
        paddingRight:scaleSize(30),
        height:scaleSize(90)
    },
    title:{
        width:scaleSize(176),
        height:scaleSize(46)
    },
    wrapTitle:{
        flex:1,
        textAlign:'center',
        backgroundColor:'transparent',
    },
    bg:{
        width:'100%',
        height:scaleSize(645),
        backgroundColor:'#fff',
        borderRadius:scaleSize(50)
    },
    toastinfo:{
        backgroundColor:'rgba(0,0,0,0.4)',
        paddingLeft:'7%',
        paddingRight:'7%',
        height:scaleSize(60),
        borderRadius:scaleSize(30),
        alignItems:'center',
        justifyContent:'center',
        position:'absolute',
        left:'35%',
        top:'50%'
    },
    textInput: {
        width:'100%',
        //backgroundColor:'#fff',borderRadius:px2dp(35),height:323,padding:10
    }
})