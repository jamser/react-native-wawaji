import {
  NativeModules,
  findNodeHandle,
  NativeEventEmitter,
  NativeAppEventEmitter
} from 'react-native';

/**
 * IM模块
 */
const {IMEngine} = NativeModules;
const IMEmitter = new NativeEventEmitter(IMEngine);
export default {
  ...IMEngine,
  async init(options = {}) {
    let res = await IMEngine.initIM(options);
    console.log("init " + res)

  },
  async login(id, sig) {
    let res = await IMEngine.login(id, sig);
    console.log("login " + res)
  },
  async joinGroup(groupId) {
    let res = await IMEngine.joinGroup(groupId);
    console.log("joinGroup " + res)
  },
  async quitGroup(groupId) {
    let res = await IMEngine.quitGroup(groupId);
    console.log("quitGroup " + res)
  },
    /*query member List */
  async queryGroupMemberList(groupId) {
      let res = await IMEngine.queryGroupMemberList(groupId);
      console.log("queryGroupMemberList-->" + res)
      return res
  },
    /**
     * componentWillMount 添加
     * @param fnConf
     */
  addEventEmitter(fnConf, source) {
    // this.listener = NativeAppEventEmitter.addListener('iLiveEvent', event => {
    //     fnConf[event['type']] && fnConf[event['type']](event);
    // });
        if(source === 'home' ) {
            this.homelistener = IMEmitter.addListener(
                'im',
                (event) => {
                    fnConf[event['type']] && fnConf[event['type']](event);
                }
            );
        } else if(source === 'room') {
            this.roomlistener = IMEmitter.addListener(
                'im',
                (event) => {
                    fnConf[event['type']] && fnConf[event['type']](event);
                }
            );
        }
  },
    /**
     * componentWillUnmount时 移除
     */
  removeEventEmitter(source) {
    //there are no `removeListener` for NativeAppEventEmitter & DeviceEventEmitter
    // if(this.listener && this.listener !== null && this.listener !== undefined){
    //     console.info("EventEmitter","removeEventEmitter")
    //
    // }
        if(source === 'home'){
            this.homelistener.remove();
        }else if(source === 'room'){
            this.roomlistener.remove();
        }

  }
};
