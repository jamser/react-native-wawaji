import {
    NativeModules,
} from 'react-native';

/**
 * 设备信息模块
 */
const {DevicesEngine} = NativeModules;

export default {
    ...DevicesEngine,
    async getDevicesInfo(options = {}) {
        let res = await DevicesEngine.getDevicesInfo(options);
        console.info("getDevicesInfo " + res)
        return res
    }

};
