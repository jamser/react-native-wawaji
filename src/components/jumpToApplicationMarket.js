import React,{Component} from 'react';
import {StyleSheet,View,Modal,TouchableWithoutFeedback,Text,Platform,Image} from 'react-native'
import {scaleSize,setSpText,ifIphoneX} from '../common/util'
import {NavigationActions} from 'react-navigation'
import AppReviewEngine from '../components/AppReviewEngine'
import give_good from '../resource/giveGood.png'
import AnalyticsUtil from '../components/AnalyticsUtil'

/**
 * 评价选项
 */
export default class toApplicationMarket extends Component{
    constructor(props){
        super(props)
        this.state = {guidance:false,//是否显示
            androidList:false,
            androidListMap:[],
            showModalType:''//评价type
        }
    }
    componentWillReceiveProps(nextProps) {
         this.setState({
             guidance:nextProps.showModal,
             showModalType:nextProps.modalType
         })
    }
    /*吐槽*/
    giveBad(){
        this.setState({guidance:false})
        storage.save({
            key: this.state.showModalType,   // Note: Do not use underscore("_") in key!
            data: {type:'giveBad',time:new Date().getTime()},
            expires: null
        });
        //统计-->吐槽
        AnalyticsUtil.onEventWithMap('5_9_1_1',{typeName:'5_9_1_1'});
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'commentFeedback',params:{
                    from:this.state.showModalType
                }})
            ]
        })
        this.props.navigation.dispatch(resetAction)
    }
    /*给我好评*/
    giveGood(){
        this.setState({guidance:false,androidList:true})
        let deviceType = Platform.OS
        AppReviewEngine.openReview(deviceType).then((res)=>{
            //统计-->给我好评
            AnalyticsUtil.onEventWithMap('5_9_1_2',{typeName:'5_9_1_2'});
            let data = JSON.parse(res)
            this.setState({androidListMap:data})
        }).catch((err)=>{
            console.info(err)
            throw err
        })
        storage.save({
            key: this.state.showModalType,   // Note: Do not use underscore("_") in key!
            data: {type:'giveGood',time:new Date().getTime()},
            expires: null
        });
    }
    /*再玩一会*/
    wantPlay(){
        //统计-->再玩一会
        AnalyticsUtil.onEventWithMap('5_9_1_3',{typeName:'5_9_1_3'});
        this.setState({guidance:false})
        storage.save({
            key: this.state.showModalType,   // Note: Do not use underscore("_") in key!
            data: {type:'wantPlay',time:new Date().getTime()},
            expires: null
        });
    }
    toOpenReview(packageName){
        AppReviewEngine.shareAppShop(packageName)
        this.setState({androidList:false})
    }
    toCloseReview(){
        this.setState({androidList:false})
    }
    render(){
        return(
            <View>
                {/*引导评价*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.guidance}
                    onRequestClose={()=>{}}
                >
                    <View style={styles.containerModal}>
                        <View style={styles.updateModal}>
                            <View style={styles.wrapGuide}><Text style={[styles.guidanceContent,{fontWeight:'bold'}]}>小宝贝～如果抓娃娃很开心，就为我评分打call吧～</Text></View>
                            <TouchableWithoutFeedback onPress={this.wantPlay.bind(this)}>
                                <View style={styles.wrapGuide}><Text style={styles.guidanceContent}>再玩一会</Text></View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.giveBad.bind(this)}>
                                <View style={[styles.wrapGuide]}><Text style={styles.guidanceContent}>去吐槽</Text></View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.giveGood.bind(this)}>
                                <View style={[styles.wrapGuide,styles.noBorder]}>
                                    <Image source={give_good} style={styles.giveGoods}/>
                                    <Text style={[styles.guidanceContent,{color:'#1283FF'}]}>给我好评</Text></View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </Modal>
                {/*安卓应用市场列表*/}
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.androidList}
                    onRequestClose={()=>{}}
                >
                    <View style={styles.containerModal}>
                        <View style={styles.updateModal}>
                            {this.state.androidListMap.length>0?this.state.androidListMap.map((item,i)=>{
                                return <TouchableWithoutFeedback onPress={this.toOpenReview.bind(this,item.packageName)}>
                                    <View style={styles.wrapGuide} key={i}><Text style={styles.guidanceContent} >{item.appName}</Text></View>
                                </TouchableWithoutFeedback>
                            }):<View/>}
                            <TouchableWithoutFeedback onPress={this.toCloseReview.bind(this)}>
                                <View style={styles.wrapGuide}>
                                    <Text style={styles.guidanceContent}>取消</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    /*评价的弹窗*/
    containerModal:{
        flex: 1,
        padding: scaleSize(40),
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(0, 0, 0, 0.5)',
        paddingLeft:scaleSize(80),
        paddingRight:scaleSize(80)
    },
    updateModal:{
        width:'100%',
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:scaleSize(20)
    },
    guidanceContent:{
        textAlign:'center',
        color:'#000',
        fontSize:scaleSize(36),
    },
    wrapGuide:{
        minHeight:scaleSize(30),
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        paddingLeft:scaleSize(40),
        paddingRight:scaleSize(40),
        paddingTop:scaleSize(20),
        paddingBottom:scaleSize(20),
        borderBottomWidth:scaleSize(1),
        borderBottomColor:'#e1e2e3',
        flexDirection:'row'
    },
    noBorder:{
        borderBottomWidth:0,
    },
    giveGoods:{
        width:scaleSize(45),
        height:scaleSize(44),
        position:'absolute',
        left:scaleSize(160)
    }
})