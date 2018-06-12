import React,{Component} from 'react'
import {StyleSheet,View,Text,ImageBackground,Image,FlatList,ScrollView,TouchableWithoutFeedback,Platform,BackHandler,Linking} from 'react-native'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import mainBG from '../../resource/mainBG.png'
import back from '../../resource/back.png'
import arrow from '../../resource/arrows.png'
import info_title from '../../resource/info-title.png'
import {NavigationActions} from 'react-navigation'
import {api} from '../../common/api.config'
import {monthTransfer, hourTransfer,consoleDebug} from '../../common/tool'
import Headers from '../../common/fetch_header'
import AnalyticsUtil from "../../components/AnalyticsUtil";

/**
 * 消息中心
 */
export default class messageInfo extends Component{
   constructor(props){
       super(props)
       this.state ={content:[],
           joinTime:0,//进入页面的时间
           quitTime:0,//退出页面的时间
       }
   }
    componentWillMount(){
        this.state.joinTime = new Date().getTime()
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.toGoBack.bind(this))
        }
        this.getMessageList()
    }

    componentWillUnmount(){
        this.state.quitTime = new Date().getTime()
        let stayTime = Math.ceil((this.state.quitTime  - this.state.joinTime) / 1000)
        //统计-->成就停留时间
        AnalyticsUtil.onEventWithMap("7_2",{stayTime:stayTime})
    }


    toGoBack(){
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Home'})
            ]
        })
        this.props.navigation.dispatch(resetAction)
        return true
    }
    getMessageList(){
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
            let url = api.userMessage +'?page=0&size=1000&messageShow=LISTSHOW'
            fetch(url, {method: 'GET',headers: Headers(ret[0])}).then((response) => {
                if(response.status !== 200){
                    return
                }else{
                    return response.json()
                }
            }).then((res)=>{
                consoleDebug(JSON.stringify(res)+"成功")
                _this.setState({content:res.content})
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("获取数据失败")
            throw e
        })
    }
    toExternal(messageType,bill,id){
        console.log(messageType)
        if(bill !== null){
            this.toAlready(id)
            if(messageType === 'SHIPPING'){
                let url ='https://m.kuaidi100.com/result.jsp?nu='+bill
                Linking.openURL(url)
            }else{
                const nav = this.props.navigation
                nav.navigate('Webview',{from:'Message',url:bill})
            }
        }

    }
    toAlready(id){
        let url = api.updateMessage +'/'+id
        console.log(url)
        fetch(url, {method: 'GET',headers: Headers(global.jwtToken)}).then((response) => {
            console.info(response)
            if(response.status !== 200){
                return
            }else{
                return response.json()
            }
        }).then((res)=>{
            console.log("成功 将这条信息标志成已读")
        }).catch((e) => {
            consoleDebug("失败" + e)
        })
    }
    _keyExtractor = (item, index) => item.id;
    _renderItem = ({item}) => (
        <TouchableWithoutFeedback onPress={this.toExternal.bind(this,item.messageType,item.url,item.id)}>
        <View style={styles.wrapInfo}>
            <View style={styles.wrapDotAll}>
                {item.readWhether?<Text/>:<Text style={styles.dot}/>}
                <View>
                    <View style={styles.wrapSys}>
                        <Text style={styles.titleInfo} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.date}>{monthTransfer(item.createdTime)}</Text>
                        <Text style={styles.date}>{hourTransfer(item.createdTime)}</Text>
                    </View>
                    <View style={styles.wrapContentText}>
                        <Text style={styles.contentText}>
                            {item.content}
                        </Text>
                    </View>
                </View>
            </View>
                {item.url !== null?<View style={styles.wrapArrow}>
                    <Text style={styles.checkText}>查看详情</Text>
                    <Image source={arrow} style={styles.arrow}/>
                </View>:<View/>}
        </View>
        </TouchableWithoutFeedback>
    );
   render(){
       const {goBack} = this.props.navigation;
       return(
           <ImageBackground source={mainBG} style={styles.mainBg}>
               <View style={styles.header}>
                   <TouchableWithoutFeedback onPress={this.toGoBack.bind(this)}><Image source={back} style={styles.back}/></TouchableWithoutFeedback>
                  <Image source={info_title} style={styles.infoTitle}/>
               </View>
               {this.state.content.length === 0?<View style={styles.wrapDefault}><Text style={styles.defaultInfo}>您还没有收过消息哦~</Text></View>:<FlatList style={styles.wrapAll} initialNumToRender={20} data={this.state.content}  keyExtractor={this._keyExtractor} renderItem={this._renderItem}>
               </FlatList>}
           </ImageBackground>
       )
   }
}
const styles= StyleSheet.create({
    mainBg:{
        flex:1,
        paddingLeft:scaleSize(31),
        paddingRight:scaleSize(31),
        paddingTop:ifIphoneX(scaleSize(44),0)
    },
    header:{
        width:'100%',
        height:scaleSize(90),
        flexDirection:'row',
        alignItems:'center',
        paddingTop:scaleSize(14),
        marginTop:scaleSize(20),
        justifyContent:'center'
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        left:0,
        top:scaleSize(24)
    },
    wrapAll:{
        marginTop:scaleSize(24)
    },
    wrapInfo:{
        width:'100%',
        backgroundColor:'#fff',
        borderRadius:scaleSize(20),
        marginBottom:scaleSize(33.6)
    },
    arrow:{
        width:scaleSize(14),
        height:scaleSize(25)
    },
    wrapArrow:{
        flexDirection:'row',
        borderTopColor:'#DCDCDC',
        borderTopWidth:scaleSize(1),
        paddingLeft:scaleSize(25.7),
        paddingRight:scaleSize(36.3),
        height:scaleSize(70),
        alignItems:'center'
    },
    checkText:{
        color:'#999',
        fontSize:setSpText(24),
        flex:1
    },
    wrapDotAll:{
        paddingLeft:scaleSize(23.7),
        paddingRight:scaleSize(23.7),
        flexDirection:'row',
    },
    dot:{
        width:scaleSize(14),
        height:scaleSize(14),
        borderRadius:scaleSize(14),
        backgroundColor:'#FF6674',
        position:'relative',
        top:scaleSize(40)
    },
    wrapSys:{
        flexDirection:'row',
        height:scaleSize(30),
        alignItems:'center',
        marginTop:scaleSize(30),
        paddingRight:scaleSize(38),
        paddingLeft:scaleSize(10)
    },
    titleInfo:{
        color:'#27DDF9',
        fontSize:setSpText(30),
        width:scaleSize(380)
    },
    date:{
        color:'#999',
        fontSize:setSpText(22),
        marginLeft:scaleSize(10)
    },
    contentText:{
        fontSize:setSpText(30),
        color:'#333',
    },
    infoTitle:{
        width:scaleSize(144),
        height:scaleSize(34),
    },
    wrapDefault:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },
    defaultInfo:{
        color:'#fff',
        fontSize:scaleSize(36),
        backgroundColor:'transparent'
    },
    wrapContentText:{
        paddingLeft:scaleSize(10),
        paddingRight:scaleSize(40),
        width:'100%',
        marginTop:scaleSize(24),
        marginBottom:scaleSize(24),
    }
})