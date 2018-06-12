import React,{Component} from 'react'
import {ifIphoneX, scaleSize, setSpText} from '../common/util'
import {View,Text,StyleSheet,Dimensions,Image,TouchableWithoutFeedback,Platform} from 'react-native'
import {NavigationActions} from 'react-navigation'
import mine_icon from '../resource/mine-icon.png'
import mine_select_icon from '../resource/mine-icon-selected.png'
import home_icno from '../resource/home-icon.png'
import home_select_icon from '../resource/home-icon-selected.png'
import rank_icon from '../resource/rank-icon.png'
import rank_select_icon from '../resource/rank-icon-selected.png'
import AnalyticsUtil from './AnalyticsUtil'

export default class Footer extends Component{
    constructor(props){
        super(props)
        console.log("footer")
        console.log(props.selectTab)
        if(props.selectTab === 0 || props.selectTab === 2){
            this.state = {selectFooterTab:props.selectTab}
        }else{
            this.state = {selectFooterTab:1}
        }
    }
    toHome(){
        /*清空页面站，kill，并且跳转到 Home页面,当当前页面为首页的时候，不允许点击*/
        if(this.state.selectFooterTab !== 0){
            //统计-->底栏点击首页
            AnalyticsUtil.onEventWithMap('6_0',{typename:'6_0'});
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Home'})
                ]
            })
            this.props.navigation.dispatch(resetAction)
            return true
        }
    }
    toMine(){
        /*当前页面为 我的 页面的时候，不允许点击*/
        if(this.state.selectFooterTab !== 2) {
            //统计-->底栏点击我的
            AnalyticsUtil.onEventWithMap('6_2',{typename:'6_2'});
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({routeName: 'Mine'})
                ]
            })
            this.props.navigation.dispatch(resetAction)
            return true
        }
    }
    toRank(){
        /*当当前页面 为 排名页面的时候不允许点击*/
        if(this.state.selectFooterTab !== 1) {
            //统计-->底栏点击排行榜
            AnalyticsUtil.onEventWithMap('6_1',{typename:'6_1'});
            /*清空页面站 是官网给的写法*/
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({routeName: 'Rank'})
                ]
            })
            this.props.navigation.dispatch(resetAction)
            return true
        }
    }
    render(){
        const {selectFooterTab} = this.state
        return(
            <View style={styles.footer}>
                <TouchableWithoutFeedback onPress={this.toHome.bind(this)}>
                <View style={styles.footerTab}>
                    <Image source={selectFooterTab === 0?home_select_icon:home_icno} style={styles.homeIcon}/>
                    <Text style={[styles.footerText,selectFooterTab === 0?styles.activeFooterText:'']} >首页</Text>
                </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this.toRank.bind(this)}>
                <View style={styles.footerTab}>
                    <Image source={selectFooterTab === 1?rank_select_icon:rank_icon} style={styles.rankIcon}/>
                    <Text style={[styles.footerText,selectFooterTab === 1?styles.activeFooterText:'']} >排行榜</Text>
                </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this.toMine.bind(this)}>
                <View style={styles.footerTab}>
                    <Image source={selectFooterTab === 2?mine_select_icon:mine_icon} style={styles.mineIcon}/>
                    <Text style={[styles.footerText,selectFooterTab === 2?styles.activeFooterText:'']} >我的</Text>
                </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    /*底部的Tab*/
    footer:{
        width:'100%',
        height:ifIphoneX(scaleSize(147),scaleSize(97)),
        backgroundColor:'#fff',
        borderTopWidth:scaleSize(1),
        borderTopColor:'rgba(174,174,174,0.4)',
        borderBottomWidth:scaleSize(1),
        borderBottomColor:'rgba(174,174,174,0.4)',
        flexDirection:'row',
        position:'absolute',
        top:Platform.OS === 'ios'?ifIphoneX(Dimensions.get('window').height-scaleSize(142),Dimensions.get('window').height-scaleSize(97)):Dimensions.get('window').height-scaleSize(142)
    },
    footerTab:{
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    },
    footerText:{
        color:'#657187',
        fontSize:setSpText(20)
    },
    activeFooterText:{
        color:'#725B3A'
    },
    homeIcon:{
        width:scaleSize(45),
        height:scaleSize(41)
    },
    rankIcon:{
        width:scaleSize(47),
        height:scaleSize(44.8)
    },
    mineIcon:{
        width:scaleSize(45.8),
        height:scaleSize(45)
    }
})