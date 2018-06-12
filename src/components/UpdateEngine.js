import {
    NativeModules,
    findNodeHandle,
    NativeEventEmitter,
    NativeAppEventEmitter
} from 'react-native';

/**
 * 版本更新模块
 */
const {UpdateEngine} = NativeModules;
const UpdateEmitter = new NativeEventEmitter(UpdateEngine);

export default {
    ...UpdateEngine,
    async downLoadFile(options = {}) {
        let res = await UpdateEngine.downLoadFile(options);
        console.log("downLoadFile " + res)

    },
    addEventEmitter(fnConf) {
        if(!this.listener){
            this.listener = UpdateEmitter.addListener(
                'update',
                (event) => {
                    fnConf[event['type']] && fnConf[event['type']](event);
                }
            );
        }

    },
    removeEventEmitter() {
        if(this.listener && this.listener !== null && this.listener !== undefined){
            this.listener && this.listener.remove();
        }
    }
};
