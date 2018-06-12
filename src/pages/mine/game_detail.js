import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight,ScrollView} from 'react-native';
import index_bg from '../../resource/mainBG.png'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import back from '../../resource/back.png'
import doll_title from '../../resource/game-detail.png'
import allege from '../../resource/allege.png'
import {monthTransfer,hourTransfer} from '../../common/tool'
import already_tui from '../../resource/alreay-tui.png'
import already_allege from '../../resource/already-allege.png'
import allege_fail from '../../resource/allege-fail.png'
import {consoleDebug} from '../../common/tool'

/**
 * 游戏详情
 */
export default  class gameDetailScreen extends Component{
    constructor(props){
        super(props)
        this.state={id:'',name:'',dateTime:'',image:'',status:''}
    }
    componentDidMount(){
        let _this = this
        storage.load({
            key: 'Info',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            consoleDebug(ret)
            _this.setState({id:ret[0],name:ret[1],dateTime:ret[2],status:ret[3],image:ret[4]})
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    render(){
        const {id,name,dateTime,status,image} = this.state
        return(
            <ImageBackground source={index_bg} style={styles.mainBg}>
                <View style={styles.headers}>
                    <TouchableHighlight onPress={() => this.props.navigation.navigate('gameRecord')} underlayColor='transparent'>
                        <Image source={back} style={styles.back}/>
                    </TouchableHighlight>
                    <View style={{flex:1,alignItems:'center'}}>
                        <Image source={doll_title} style={styles.title}/>
                    </View>
                </View>
                    <View style={styles.wrapRecord}>
                        <View style={styles.detail}>
                            <View style={styles.dollImg}>
                                <Image source={{uri:image}} style={styles.dollImgWidth}/>
                            </View>
                            <View style={styles.flex1}>
                                <View><Text style={styles.dollName}>{name}</Text></View>
                                <View style={[styles.row,styles.centerTop]}>
                                    <Text style={styles.date}>{monthTransfer(dateTime)}</Text>
                                    <Text style={styles.time}>{hourTransfer(dateTime)}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.bottom}/>
                        <View style={styles.feedback}>
                            <Text style={[styles.flex1,styles.allegeText]}>游戏中遇到问题请点申述</Text>
                            {status === null ? <TouchableHighlight onPress={() => this.props.navigation.navigate('Allege',{userDollId:id})} underlayColor='transparent'><Image source={status === 'AUDIT' ?already_allege:status === 'PASSED'?already_tui:status === 'REFUSE'?allege_fail:allege} style={styles.allege}/></TouchableHighlight>:<Image source={status === 'AUDIT' ?already_allege:status === 'PASSED'?already_tui:status === 'REFUSE'?allege_fail:allege} style={styles.allege}/>}
                        </View>
                    </View>
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
        width:'100%',
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
        backgroundColor:'#fff',
        borderRadius:scaleSize(20),
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(30),
        paddingTop:scaleSize(24),
        paddingBottom:scaleSize(20),
        marginTop:scaleSize(47)
    },
    detail:{
        height:scaleSize(160),
        alignItems:'center',
        flexDirection:'row',
        width:'100%'
    },
    dollImg:{
        width:scaleSize(137),
        height:scaleSize(137),
        borderWidth:scaleSize(1),
        borderColor:'#44E1F4',
        borderRadius:scaleSize(34),
        marginRight:scaleSize(32)
    },
    dollImgWidth:{
        width:'100%',
        height:'100%',
        borderRadius:scaleSize(34)
    },
    dollName:{
        fontSize:setSpText(32),
        color:'#323232',
        fontWeight:'bold'
    },
    date:{
        color:'#323232',
        fontSize:setSpText(28)
    },
    time:{
        color:'#323232',
        fontSize:setSpText(28),
        marginLeft:scaleSize(8)
    },
    flex1:{
        flex:1
    },
    bottom:{
        width:'100%',
        height:scaleSize(1),
        backgroundColor: 'rgba(174,174,174,0.4)',
        marginTop:scaleSize(25)
    },
    feedback:{
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
    },
    row:{
        flexDirection:'row'
    },
    allege:{
        width:scaleSize(187.5),
        height:scaleSize(74),
        marginTop:scaleSize(20)
    },
    allegeText:{
        color:'#000',
        fontSize:setSpText(32),
        marginTop:scaleSize(18)
    },
    centerTop:{
        marginTop:scaleSize(6),
    }
})