// import React,{Component} from 'react';
// import {View, Text, StyleSheet, ImageBackground, Image,  Platform,Picker,Modal} from 'react-native';
// import {scaleSize,setSpText} from '../../common/util'
// import layer from '../../resource/layer.png'
// import cancel from '../../resource/x.png'
// import btn_left from '../../resource/btn-left.png'
// import btn_right from '../../resource/btn-right.png'
// import btn_up from '../../resource/btn-up.png'
// import btn_down from '../../resource/btn-down.png'
// export default  class MineScreen extends Component{
//     constructor(props){
//         super(props)
//         this.state = {
//             language:''
//         }
//     }
//     render(){
//         var modalBackgroundStyle = {
//             backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
//         };
//         return(
//             <View>
//             <Modal animationType={"fade"}
//                    transparent={true}
//                    visible={false}
//                    onRequestClose={()=>{}}>
//                 <View style={[styles.main, modalBackgroundStyle]}>
//                 <ImageBackground source={layer} style={styles.layer}>
//                     <Image source={cancel} style={styles.cancel}/>
//                     <View><Text style={styles.text}>TEST for adjust</Text></View>
//                     <View><Text style={styles.text}>TEST for adjust LALA</Text></View>
//                 </ImageBackground>
//                     <View style={styles.wrapBtn}>
//                     <Image source={btn_left} style={[styles.btn,styles.left]}/>
//                     <Image source={btn_right} style={[styles.btn,styles.right]}/>
//                     <Image source={btn_up} style={[styles.btn,styles.up]}/>
//                     <Image source={btn_down} style={[styles.btn,styles.down]}/>
//                     </View>
//                 </View>
//             </Modal>
//                 <Picker
//                     selectedValue={this.state.language}
//                     onValueChange={(itemValue, itemIndex) => this.setState({language: itemValue})}>
//                     <Picker.Item label="北京" value="北京" >
//                         <Picker.Item label="zhasss" value="fff" />
//                     </Picker.Item>
//                     <Picker.Item label="山东" value="潍坊" />
//                     <Picker.Item label="青海" value="西宁" />
//                 </Picker>
//             </View>
//         )
//     }
// }
// const styles = StyleSheet.create({
//     main:{
//         flex:1,
//         alignItems:'center',
//         justifyContent:'center',
//         backgroundColor:'#fff'
//     },
//     layer:{
//         width:scaleSize(500),
//         height:scaleSize(450),
//     },
//     cancel:{
//         width:scaleSize(80),
//         height:scaleSize(80),
//         borderRadius:scaleSize(40),
//         position:'relative',
//         marginLeft:scaleSize(420)
//     },
//     text:{
//         fontSize:setSpText(36),
//         backgroundColor:'#fff',
//         textAlign:'center'
//     },
//     wrapBtn:{
//         position:'relative'
//     },
//     btn:{
//         width:scaleSize(100),
//         height:scaleSize(100),
//         position:'absolute',
//     },
//     left:{
//         right:scaleSize(-28)
//     },
//     right:{
//         right:scaleSize(-174)
//     },
//     up:{
//         top:scaleSize(-56)
//     },
//     down:{
//         top:scaleSize(50)
//     }
// })


/**
 * Bootstrap of PickerTest
 */

// import React, {Component} from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     Dimensions
// } from 'react-native';
//
// import Picker from 'react-native-picker';
// import area from '../../common/area.json';
//
// export default class PickerTest extends Component {
//
//     constructor(props, context) {
//         super(props, context);
//     }
//     _createAreaData() {
//         let data = [];
//         let len = area.length;
//         for(let i=0;i<len;i++){
//             let city = [];
//             for(let j=0,cityLen=area[i]['city'].length;j<cityLen;j++){
//                 let _city = {};
//                 _city[area[i]['city'][j]['name']] = area[i]['city'][j]['area'];
//                 city.push(_city);
//             }
//
//             let _data = {};
//             _data[area[i]['name']] = city;
//             data.push(_data);
//         }
//         return data;
//     }
//     _showAreaPicker() {
//         Picker.init({
//             pickerData: this._createAreaData(),
//             selectedValue: ['河北', '唐山', '古冶区'],
//             pickerConfirmBtnText:'确定',
//             pickerCancelBtnText:'取消',
//             pickerTitleText:'轻松抓娃娃',
//             onPickerConfirm: pickedValue => {
//                 console.log('area', pickedValue);
//             },
//             onPickerCancel: pickedValue => {
//                 console.log('area', pickedValue);
//             },
//             onPickerSelect: pickedValue => {
//                 //Picker.select(['山东', '青岛', '黄岛区'])
//                 console.log('area', pickedValue);
//             }
//         });
//         Picker.show();
//     }
//     _toggle() {
//         Picker.toggle();
//     }
//     _isPickerShow(){
//         Picker.isPickerShow(status => {
//             alert(status);
//         });
//     }
//     render() {
//         return (
//             <View>
//                 <Text>tetet</Text>
//                 <TouchableOpacity onPress={this._showAreaPicker.bind(this)}>
//                     <Text>AreaPicker</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={{marginTop: 10, marginLeft: 20}} onPress={this._toggle.bind(this)}>
//                     <Text>toggle</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={{marginTop: 10, marginLeft: 20}} onPress={this._isPickerShow.bind(this)}>
//                     <Text>isPickerShow</Text>
//                 </TouchableOpacity>
//                 <TextInput
//                     placeholder="test picker with input"
//                     style={{
//                         height: 40,
//                         borderColor: 'gray',
//                         borderWidth: 1,
//                         marginLeft: 20,
//                         marginRight: 20,
//                         marginTop: 10,
//                         padding: 5
//                     }}
//                 />
//             </View>
//         );
//     }
// };
// const HomeScreen = () => (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//         <Text>Home Screen</Text>
//     </View>
// );
//
// const ProfileScreen = () => (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//         <Text>Profile Screen</Text>
//     </View>
// );
//
// const RootTabs = TabNavigator({
//     Home: {
//         screen: HomeScreen,
//     },
//     Profile: {
//         screen: ProfileScreen,
//     },
// });
//
// export default RootTabs;


// const MainScreenNavigator = TabNavigator({
//     Recent: { screen: RecentChatsScreen },
//     All: { screen: AllContactsScreen },
// });
// export default MainScreenNavigator;
// import React from 'react';
// import { TabNavigator,TabBarBottom } from 'react-navigation';
// import DataList from '../../components/DataList'
// const RootTabs = TabNavigator({
//     全部: {
//         screen: DataList,
//     },
//     新品: {
//         screen: DataList,
//     },
//     金币区: {
//         screen: DataList,
//     },
//     钻石区: {
//         screen: DataList,
//     },
//     特惠区: {
//         screen: DataList,
//     },
//     },{
//     tabBarPosition: 'top',
//     animationEnabled: true,
//     swipeEnabled:true,
//     indicatorStyle:{backgroundColor:'#48CAE6'},
//     animationEnabled: true,
//     tabBarOptions: {
//         style:{backgroundColor:'#fff'},
//         activeTintColor: '#48CAE6',
//         labelStyle:{color:'#666'},
//         tabBarComponent: TabBarBottom,
//         indicatorStyle:{backgroundColor:'#48CAE6'}
//     },
// });
//
//
// export default RootTabs;
import React,{Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight,ScrollView,Modal,Platform,BackHandler,SectionList} from 'react-native';
import index_bg from '../../resource/mainBG.png'
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import little_money from '../../resource/littlemoney.png'
import back from '../../resource/back.png'
import {api} from '../../common/api.config'
import title from '../../resource/detail-title.png'
import cancel from '../../resource/cancel.png'
import {monthTransfer,hourTransfer,consoleDebug} from '../../common/tool'

/**
 * 金币明细
 */
export default class DetailsScreen extends Component{
    constructor(props){
        super(props)
        this.state={detail:[],exchangeResult:false}
    }
    componentWillMount(){
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    onBackAndroid = () => {
        const nav = this.props.navigation;
        nav.navigate('Mine');
        return true
    };
    componentDidMount(){
        let _this = this
        let url = api.coinDetail+'?size=1000'
        storage.load({
            key: 'userInfo',
            autoSync: true,
            syncInBackground: true,
            syncParams: {
                extraFetchOptions: {},
                someFlag: true,
            },
        }).then((ret)=>{
            fetch(url, {method: 'GET',headers:{'Content-Type': 'application/json','authorization':'Bearer ' + ret[0]}}).then((response) => {
                console.info(response)
                if(response.status === 200){
                    return response.json()
                }else{
                    _this.setState({exchangeResult:true})
                    return
                }
            }).then((res)=>{
                _this.setState({detail:res.content})
                consoleDebug(JSON.stringify(res)+"成功")
            }).catch((e) => {
                consoleDebug("失败" + e)
            })
        }).catch((e)=>{
            consoleDebug("读取数据失败")
            throw e
        })
    }
    setExchangeResult(visible) {
        this.setState({exchangeResult: visible});
    }

    _keyExtractor = (item, index) => item.id;

    _renderItem = ({item}) => (
        <View>
            <View style={styles.detailContent}>
                <View style={styles.wrapProcess}>
                    <Text style={styles.detailProcess}>{item.description}</Text>
                    <View style={styles.detailRow}><Text style={styles.tint}>{monthTransfer(item.createdTime)}</Text><Text style={styles.tints}>{hourTransfer(item.createdTime)}</Text></View>
                </View>
                {item.type === 'FETCH' ||item.type === 'SHIPPED'?<Text style={styles.pink}>-{item.coin}</Text>: <Text style={styles.blue}>+{item.coin}</Text> }
            </View>
            <Text style={styles.borderBottom}/>
        </View>
    );

    _listHeaderComponent(){
        return (
            <View><Text>999999</Text></View>
        );
    }
    render(){
        const {goBack, state} = this.props.navigation;
        const {detail} = this.state
        return(
            <View>
                <ImageBackground source={index_bg} style={styles.mainBg}>
                    <Modal animationType={"fade"}
                           transparent={true}
                           visible={this.state.exchangeResult}>
                        <View style={styles.wrapExchangeResult}>
                            <TouchableHighlight onPress={() => {
                                this.setExchangeResult(false)
                            }} underlayColor='transparent'><Image source={cancel} style={styles.cancel}/></TouchableHighlight><Text style={styles.exchangeResult}>数据加载失败，请稍后重试</Text>
                        </View>
                    </Modal>
                    <View style={styles.headers}>
                        <TouchableHighlight onPress={() => goBack()} underlayColor='transparent'>
                            <Image source={back} style={styles.back}/>
                        </TouchableHighlight>
                        <View style={{flex:1,alignItems:'center'}}>
                            <Image source={title} style={styles.title}/>
                        </View>
                    </View>
                    <View style={styles.detail}>
                        <Image source={little_money} style={styles.moneyIcon}/><Text style={styles.balance}>666</Text>
                    </View>
                </ImageBackground>
                <View>
                    <Text>00000000000000</Text>
                </View>
                <View>
                    <Text>00000000000000</Text>
                </View>
                <ScrollView stickyHeaderIndices={[0]}>
                <View>
                    <Text>00000000000000</Text>
                </View>
                <View>
                    <Text>00000000000000</Text>
                </View>
                <SectionList style={{paddingRight:scaleSize(62),paddingLeft:scaleSize(62),width:'100%',backgroundColor:'#fff'}} initialNumToRender={40} keyExtractor={this._keyExtractor} renderItem={this._renderItem} sections={[{data:detail}]} renderSectionHeader={this._listHeaderComponent}>
                </SectionList>
                </ScrollView>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    mainBg:{
        width:'100%',
        height:ifIphoneX(scaleSize(314),scaleSize(284)),
        paddingTop:ifIphoneX(scaleSize(30),0),
    },
    detail:{
        height:scaleSize(160),
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
    },
    moneyIcon:{
        width:scaleSize(66),
        height:scaleSize(64)
    },
    balance:{
        fontSize:setSpText(80),
        backgroundColor:'transparent',
        marginLeft:scaleSize(26),
        color:'#fff',
        fontFamily: Platform.OS === 'android' ?'KaiGenGothicSC-Bold':'PingFang-SC-Medium',
        fontWeight:'bold',
        paddingBottom:scaleSize(20)
    },
    wrapDetail:{
        minHeight:scaleSize(1400)
    },
    detailContent:{
        flexDirection:'row',
        height:scaleSize(140),
        alignItems:'center',
        width:'100%',
    },
    borderBottom:{
        width:'100%',
        height:scaleSize(1),
        backgroundColor: 'rgba(174,174,174,0.4)'
    },
    detailProcess:{
        color:'#323232',
        fontSize:setSpText(32)
    },
    detailRow:{
        flexDirection:'row',
        marginTop:scaleSize(12)
    },
    wrapProcess:{
        flex:1
    },
    tint:{
        color:'#666666',
        fontSize:setSpText(28)
    },
    pink:{
        color:'#ff7177',
        fontSize:setSpText(36)
    },
    blue:{
        color:'#22c245',
        fontSize:setSpText(36)
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        justifyContent:'flex-start',
        alignItems:'flex-start'
    },
    headers:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginTop:scaleSize(40),
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(40)
    },
    title:{
        marginRight:scaleSize(16),
        width:scaleSize(188),
        height:scaleSize(40)
    },
    tints:{
        marginLeft:scaleSize(20),
        color:'#666666',
        fontSize:setSpText(28)
    },
    wrapExchangeResult:{
        width:'100%',
        height:scaleSize(80),
        backgroundColor:'#ff7171',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        paddingLeft:scaleSize(40),
        paddingRight:scaleSize(40)
    },
    exchangeResult:{
        color:'#fff',
        flex:1,
        textAlign:'center'
    },
    cancel:{
        width:scaleSize(50),
        height:scaleSize(50)
    },
})


