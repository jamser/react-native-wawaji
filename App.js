import React from 'react';
import {StyleSheet, View} from 'react-native';
import codePush from 'react-native-code-push'
import Index from './src/pages/RootNavigator'

export default class App extends React.Component {
    constructor(props){
        super(props)
    }
    componentDidMount(){
        //CodePush会在后台静默地将更新下载到本地，等待APP下一次启动的时候应用更新
        codePush.sync({
            installMode: codePush.InstallMode.IMMEDIATE, //启动模式三种：ON_NEXT_RESUME、ON_NEXT_RESTART、IMMEDIATE
            updateDialog: {
                appendReleaseDescription: true,//是否显示更新description，默认为false
                descriptionPrefix: "更新内容:\n",//更新说明的前缀。 默认是” Description:
                mandatoryContinueButtonLabel: "立即更新",//强制更新的按钮文字，默认为continue
                mandatoryUpdateMessage: "发现新版本，请确认更新\n",//- 强制更新时，更新通知. Defaults to “An update is available that must be installed.”.
                optionalIgnoreButtonLabel: '稍后',//非强制更新时，取消按钮文字,默认是ignore
                optionalInstallButtonLabel: '后台更新',//非强制更新时，确认文字. Defaults to “Install”
                optionalUpdateMessage: '发现新版本，是否更新？',//非强制更新时，更新通知. Defaults to “An update is available. Would you like to install it?”.
                title: '更新提示'//要显示的更新通知的标题. Defaults to “Update available”.,
            }
        });
    }
    render() {
        return (
            <View style={styles.container}>
                <Index/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});
