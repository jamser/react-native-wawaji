let online = false,domain
if(online){
    domain = 'http://wawaji.starcandy.cn/api/'//正式环境
}else{
    domain = 'http://devwawaji.starcandy.cn/api/'   //测试环境
}
export const api = {
    priceList: domain + 'price/package',    //价格列表
    userInfo: domain + 'user/info',           //用户信息
    recharge: domain + 'order/prepay',     //充值
    weixinPay: domain + 'order/notify',      //微信支付回调
    coinDetail: domain + 'user/deal',        //金币明细
    carousel: domain + 'app/carousel',//轮播图
    room: domain + 'room',//房间列表
    machine: domain + 'machine',//  /{id} 房间信息
    feedback: domain + 'user/feedback', //反馈
    doll: domain + 'doll/', //抓去记录
    login: domain + 'wechat/login?code=', //login
    prefetch: domain + 'user/prefetch',
    fetch: domain + 'user/fetch',
    firstLogin: domain +'prize/dailySignStatus',  //用户第一次登录领取
    getCoin:domain + 'prize/dailySign' ,        //用户登录领取
    share:domain + 'user/share/invite',          //失败的分享,动态获取分享
    socketUrl: online?'http://39.106.28.210:9092':'http://47.94.213.164:9092',//测试socketIo
    successShare:domain+'user/share/winner',
    myDoll:domain+'user/doll',              //我的娃娃
    invite:domain+'user/prize',          //输入邀请码
    getAddress:domain+'user/address',
    gameRecord:domain+'user/doll?status=all',     //游戏记录接口
    allege:domain+'user/appeal',            //申述
    inviteInfo:domain+'user/allege',        //邀请码金币动态
    allegeSelect:domain+'app/appeal',      //申述下拉选项
    inviteCoin:domain+'user/invite/prompt', //邀请页面 的文字调用
    getDollText:domain+'user/shipping/prompt', //领取娃娃页面的文字调用
    isDebuger:true,         //如果为true的话，那么在前台打印日志，为false的话意味正式版本，不打印日志
    logistics:domain+'user/waybill',      //获取物流信息
    dollStrategyURL:domain+'app/html?',       //获取娃娃攻略的url
    iosTreat:domain+'app/demo-user',          //ios treat
    getui:domain+'user/addClientId',       //个推URL
    attention:domain+'user/prompt?type=attention', // 关注
    videoUrl:online?'http://wawaji.starcandy.cn/video?from=app':'http://devwawaji.starcandy.cn/video?from=app',
    wxCode:online?'wxd8768b5631050f54':'wx3682b3465f6c474f',
    tabList:domain+'panel',           //tab列表的配置
    tabListRoom:domain+'panelRoom',    //tab 列表下面的房间页
    updateApp:domain+'app/version',    //更新app的接口
    userMessage:domain+'userMessage',    //消息列表的全部list
    userMessagePop:domain+'userMessage/pop', //得到用户弹窗
    updateMessage:domain + 'userMessage',   //更新用户的某条消息为已读
    messageRead:domain+'userMessage/read',   //判断消息是否已读
    rankUrl:online?'http://wawaji.starcandy.cn/share-video/ranking.html?':'http://devwawaji.starcandy.cn/share-video/ranking.html?',    //排行榜的URL
    getShareVideo:domain+'user/share/video?',
    newVideoUrl:online?'http://wawaji.starcandy.cn/share-video/share-video.html?':'http://devwawaji.starcandy.cn/share-video/share-video.html?',
    // 我的成就
    medal:domain+'user/code/medal?',
    dollWall:domain+'user/code/dollWall?size=1000&page=',
    vipInfo:domain+'vip',  //获得VIP的详细信息
    getVip:domain+'vip/prize', //领取Vip
}
export const options = {
    //测试线IM appID,accountType
    // appid: 1400052487,
    // accountType: 18808

    //正式线IM appID,accountType
    appid: online?1400053203:1400052487,
    accountType: online?19836:18808
};
