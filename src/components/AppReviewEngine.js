import {
    NativeModules,
} from 'react-native';

/**
 * App跳转应用市场模块
 */
const {AppReviewEngine} = NativeModules;
export default {
    ...AppReviewEngine,
    async openReview(type) {
        let res = await AppReviewEngine.openReview(type);
        console.info("AppReviewEngine->openReview " + res)
        return res
    },
    async shareAppShop(packageName) {
        let res = await AppReviewEngine.shareAppShop(packageName);
        console.info("AppReviewEngine->shareAppShop " + res)
        return res
    }

};
