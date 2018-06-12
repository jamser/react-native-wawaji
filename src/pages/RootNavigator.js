import React from 'react';
import {StackNavigator} from 'react-navigation';
import LoginScreen from './main/Login'
import HomeScreen from './main/Home'
import RoomScreen from './main/Room'
import MineScreen from './mine/index'
import DetailsScreen from './mine/detail'
import RechargeScreen from './mine/recharge'
import InviteScreen from './mine/invite'
import addAddressScreen from './mine/add_address'
import inviteFriendScreen from './mine/invite_friend'
import Agreement from './main/Agreement'
import Feedback from './main/Feedback'
import getDollScreen from './mine/get_doll'
import myDollScreen from './mine/my_dolls'
import feedbackScreen from './mine/feedback'
import allegeScreen from './mine/allege'
import gameDetailScreen from './mine/game_detail'
import gameRecordScreen from './mine/game_record'
import webview from '../components/webViewExample'
import aboutusScreen from '../pages/mine/about_us'
import messageInfo from '../pages/mine/message_info'
import rankScreen from '../components/rank'
import vipScreen from '../pages/mine/vip'
import demo from '../pages/main/demo'
import medalScreen from '../pages/mine/medal'
import commentFeedback from  '../pages/mine/comment_feedback'

const RootNavigator = StackNavigator({
    Login: {
        screen: LoginScreen,
        navigationOptions: {
            headerTitle: '登录',
            header:null
        },
    },
    Agreement: {
        screen: Agreement,
        navigationOptions: {
            headerTitle: 'Agreement',
            header:null
        },
    },
    Home: {
        screen: HomeScreen,
        navigationOptions: {
            headerTitle: '返回',
            header:null
        },
    },
    Room: {
        screen: RoomScreen,
        navigationOptions: {
            headerTitle: '轻松抓娃娃',
            header:null
        },
    },
    Mine: {
        screen: MineScreen,
        navigationOptions: {
            headerTitle: '我的',
            header:null
        },
    },
    Details: {
        screen: DetailsScreen,
        navigationOptions: {
            headerTitle: '金币明细',
            header:null
        },
    },
    Recharge: {
        screen:RechargeScreen,
        navigationOptions: {
            headerTitle: '充值金币',
            header:null
        },
    },
    Invite:{
        screen:InviteScreen,
        navigationOptions: {
            headerTitle: '分享',
            header:null
        },
    },
    addAddress: {
        screen:addAddressScreen,
        navigationOptions: {
            headerTitle: '添加新地址',
            header:null
        },
    },
    inviteFriend:{
        screen:inviteFriendScreen,
        navigationOptions: {
            headerTitle: '邀请好友',
            header:null
        },
    },
    getDoll: {
        screen:getDollScreen,
        navigationOptions: {
            headerTitle: '领取娃娃',
            header:null
        },
    },
    myDoll:{
        screen:myDollScreen,
        navigationOptions: {
            headerTitle: '我的娃娃',
            header:null
        },
    },
    feedbackMain:{
        screen:Feedback,
        navigationOptions: {
            headerTitle: '问题反馈',
            header:null
        },
    },
    feedback:{
        screen:feedbackScreen,
        navigationOptions: {
            headerTitle: '问题反馈',
            header:null
        },
    },
    Allege:{
        screen:allegeScreen,
        navigationOptions: {
            headerTitle: '提交申述',
            header:null
        },
    },
    gameRecord:{
        screen:gameRecordScreen,
        navigationOptions: {
            headerTitle: '游戏记录',
            header:null
        },
    },
    gameDetail:{
        screen:gameDetailScreen,
        navigationOptions: {
            headerTitle: '游戏详情',
            header:null
        },
    },
    Webview: {
        screen: webview,
        navigationOptions: {
            headerTitle: '轻松抓娃娃',
            header:null
        },
    },
    aboutUs: {
        screen: aboutusScreen,
        navigationOptions: {
            headerTitle: '关于我们',
            header:null
        },
    },
    messageInfo:{
        screen: messageInfo,
        navigationOptions: {
            headerTitle: '消息列表',
            header:null
        },
    },
    Rank:{
        screen: rankScreen,
        navigationOptions: {
            headerTitle: '排行榜',
            header:null
        },
    },
    Vip: {
        screen: vipScreen,
        navigationOptions: {
            headerTitle: 'vip用户',
            header: null
        },
    },
    Medal:{
        screen:medalScreen,
        navigationOptions:{
            headerTitle:'我的成就',
            header:null
        },
    },
    commentFeedback:{
        screen:commentFeedback,
        navigationOptions:{
            headerTitle:'意见反馈',
            header:null
        },
    }
});
export default RootNavigator