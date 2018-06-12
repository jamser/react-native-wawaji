package com.starcandy.wawaji.utils;

/**
 * 静态函数
 */
public class Constants {
   
    public static final boolean isDev = true;//是否是测试环境 false为正式环境 true为测试环境
    
    //Tx视频操作码记录
    public static final int PLAY_EVT_CONNECT_SUCC = 2001;               //已经连接服务器
    public static final int PLAY_EVT_RTMP_STREAM_BEGIN = 2002;          //已经连接服务器，开始拉流（仅播放RTMP地址时会抛送）
    public static final int PLAY_EVT_RCV_FIRST_I_FRAME = 2003;          //网络接收到首个可渲染的视频数据包(IDR)
    public static final int PLAY_EVT_PLAY_BEGIN = 2004;                 //视频播放开始，如果有转菊花什么的这个时候该停了
    public static final int PLAY_EVT_PLAY_PROGRESS = 2005;              //视频播放进度，会通知当前进度和总体进度，仅在点播时有效
    public static final int PLAY_EVT_PLAY_END = 2006;                   //视频播放结束
    public static final int PLAY_EVT_PLAY_LOADING = 2007;               //视频播放loading，如果能够恢复，之后会有BEGIN事件
    public static final int PLAY_EVT_START_VIDEO_DECODER = 2008;        //视频开始解码
    public static final int PLAY_EVT_CHANGE_RESOLUTION = 2009;          //视频改变解析度(流畅->极速)
    public static final int PLAY_ERR_NET_DISCONNECT = -2301;            //网络断连,且经多次重连抢救无效,可以放弃治疗,更多重试请自行重启播放
    public static final int PLAY_ERR_GET_RTMP_ACC_URL_FAIL = -2302;     //获取RTMP_ACC_URL 失败
    public static final int PLAY_ERR_FILE_NOT_FOUND = -2303;            //无法找到文件
    public static final int PLAY_WARNING_VIDEO_DECODE_FAIL = 2101;      //当前视频帧解码失败
    public static final int PLAY_WARNING_AUDIO_DECODE_FAIL = 2102;      //当前音频帧解码失败
    public static final int PLAY_WARNING_RECONNECT = 2103;              //网络断连, 已启动自动重连 (重连超过三次就直接抛送 PLAY_ERR_NET_DISCONNECT 了)
    public static final int PLAY_WARNING_RECV_DATA_LAG = 2104;          //网络来包不稳：可能是下行带宽不足，或由于主播端出流不均匀
    public static final int PLAY_WARNING_VIDEO_PLAY_LAG = 2105;         //当前视频播放出现卡顿
    public static final int PLAY_WARNING_HW_ACCELERATION_FAIL = 2106;   //硬解启动失败，采用软解
    public static final int PLAY_WARNING_VIDEO_DISCONTINUITY = 2107;    //硬解启动失败，采用软解
    public static final int PLAY_WARNING_FIRST_IDR_HW_DECODE_FAIL = 2108;//暂时放弃
    public static final int PLAY_WARNING_DNS_FAIL = 3001;               //RTMP-DNS解析失败（仅播放RTMP地址时会抛送
    public static final int PLAY_WARNING_SEVER_CONN_FAIL = 3002;        //RTMP服务器连接失败（仅播放RTMP地址时会抛送）
    public static final int PLAY_WARNING_SHAKE_FAIL = 3003;             //RTMP服务器握手失败（仅播放RTMP地址时会抛送）
    public static final int PLAY_WARNING_READ_WRITE_FAIL = 3005;        //读写失败

}