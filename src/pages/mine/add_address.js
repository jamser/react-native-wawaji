import React,{Component} from 'react';
import {View, Text, StyleSheet,TextInput, ImageBackground, Image, TouchableHighlight, Modal,Platform,BackHandler,TouchableWithoutFeedback} from 'react-native';
import {scaleSize,setSpText,ifIphoneX} from '../../common/util'
import arrow from '../../resource/arrows.png'
import index_bg from '../../resource/mainBG.png'
import confirm from '../../resource/commit.png'
import back from '../../resource/back.png'
import layer from '../../resource/layer.png'
import confirm_modal from '../../resource/confirm.png'
import title from '../../resource/address-title.png'
import change_title from '../../resource/change-address.png'
import Picker from 'react-native-picker';
import area from '../../common/area.json'

/**
 * 添加地址界面
 */
/*添加地址这一块，因为，地址提交的时候，走的不是接口，所以得通过参数的形式带到下一个页面，他的下一个页面肯定是 getDoll，也就是领取娃娃的页面，所以，在地址这一块，跳到getDoll的时候，会将 姓名，电话，地址 和省市区 通过url的参数形式带到getDoll中*/
export default class addAddressScreen extends Component{
    constructor(props){
        super(props)
        const params = this.props.navigation.state.params
        /*这个页面肯定是从getDoll 跳到这里来的，从 param判断，有没有具体的参数，如果有的话，代表，这个 页面的标题要变成 修改地址 ，并同时，把带来的参数展现在页面上，如果没有的话， 页面的 标题应该是 添加新的地址*/
        if(params.name !== "" && params.phone !== "" && params.address !== "" &&  params.province !== "" && params.city !== "" && params.area !== ""){
            this.state={name:params.name,phone:params.phone,address:params.address,add:false,modalVisible:false,error:'',province:params.province,city:params.city,area:params.area}
        }else{
            this.state={name:'',phone:'',address:'',add:true,modalVisible:false,error:'',province:'',city:'',area:''}
        }
    }
    componentWillMount(){
        /*设置监听物理返回按键*/
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid)
        }
    }
    onBackAndroid = () => {
        const nav = this.props.navigation;
        const state = nav.state
        /*物理返回键的时候，将相应的参数传进去，这样在getDoll 里面就可以 展现出你在这个页面填写的东西*/
        nav.navigate('getDoll',{name: this.state.name, phone: this.state.phone, address: this.state.address, selectImage: state.params.selectImage, userId: state.params.userId, selected: state.params.selected,province:this.state.province,city:this.state.city,area:this.state.area});
        return true;
    };
    setModalVisible(visible) {
        /*隐藏 弹窗*/
        this.setState({modalVisible: visible});
    }
    /*提交地址，这个提交不走接口*/
    submit(){
        let name = this.state.name
        let phone = this.state.phone
        let address = this.state.address
        let province = this.state.province
        let city = this.state.city
        let area = this.state.area
        let reg = /^1[34578]\d{9}$/;
        const params= this.props.navigation.state.params
        if(name.length === 0){
            this.setState({error:'姓名必须填写',modalVisible:true})
        }else if(phone.length === 0){
            this.setState({error:'电话必须填写',modalVisible:true})
        }else if(!(reg.test(this.state.phone))){
            this.setState({error:'电话格式不对',modalVisible:true})
        }else if(address.length === 0){
            this.setState({error:'地址必须填写',modalVisible:true})
        }else if(province.length === 0){
            this.setState({error:'省份必须填写',modalVisible:true})
        }else if(city.length === 0){
            this.setState({error:'城市必须填写',modalVisible:true})
        }else if(area.length === 0){
            this.setState({error:'地区必须填写',modalVisible:true})
        }else {
            /*所有的这个页面填写的东西，，带到下一个页面去，，记住啦*/
            this.props.navigation.navigate('getDoll', {
                name: name,
                phone: phone,
                address: address,
                selectImage: params.selectImage,
                userId: params.userId,
                selected: params.selected,
                province:province,
                city:city,
                area:area
            })
        }
    }
    /*城市选择控件，这两个函数都是城市选择控件，，，，，，，找的插件，，叫picker*/
    _createAreaData() {
        let data = [];
        let len = area.length;
        for(let i=0;i<len;i++){
            let city = [];
            for(let j=0,cityLen=area[i]['city'].length;j<cityLen;j++){
                let _city = {};
                _city[area[i]['city'][j]['name']] = area[i]['city'][j]['area'];
                city.push(_city);
            }

            let _data = {};
            _data[area[i]['name']] = city;
            data.push(_data);
        }
        return data;
    }
    _showAreaPicker() {
        Picker.init({
            pickerData: this._createAreaData(),
            selectedValue: this.state.province !== ''?[ this.state.province, this.state.city, this.state.area]:['北京', '北京', '东城区'],
            pickerConfirmBtnText:'确定',
            pickerCancelBtnText:'取消',
            pickerTitleText:'轻松抓娃娃',
            onPickerConfirm: pickedValue => {
                console.log('area', pickedValue);
                this.setState({
                    province:pickedValue[0],
                    city:pickedValue[1],
                    area:pickedValue[2]
                })
            },
            onPickerCancel: pickedValue => {
                console.log('area', pickedValue);
            },
            onPickerSelect: pickedValue => {
                //Picker.select(['山东', '青岛', '黄岛区'])
                console.log('area', pickedValue);
            }
        });
        Picker.show();
    }
        render(){
            const {state,name,phone,address} = this.props.navigation;
            const {add,error,province,city,area} = this.state
            var modalBackgroundStyle = {
                backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
            };
            return(
                <ImageBackground source={index_bg} style={styles.mainBg} >
                    <Modal animationType={"fade"}
                           transparent={true}
                           visible={this.state.modalVisible}
                           onRequestClose={()=>{}}>
                        <View style={[styles.container, modalBackgroundStyle]}>
                            <ImageBackground source={layer} style={styles.layer}>
                                <View><Text style={styles.error}>您好，{error}</Text></View>
                                <TouchableHighlight onPress={() => {
                                    this.setModalVisible(false)
                                }} underlayColor='transparent'><View style={styles.modalConfirm}><Image source={confirm_modal} style={styles.confirmColor}/></View></TouchableHighlight>
                            </ImageBackground>
                        </View>
                    </Modal>
                    <View style={styles.headers}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('getDoll', {name: name, phone: phone, address: address, selectImage: state.params.selectImage, userId: state.params.userId, selected: state.params.selected})} underlayColor='transparent'>
                            <Image source={back} style={styles.back}/>
                        </TouchableWithoutFeedback>
                        <View>
                            <Image source={add ? title:change_title} style={add?styles.title:styles.changeTitle}/>
                        </View>
                    </View>
                    <View style={styles.wrap}>
                        <View style={styles.list}>
                            <Text style={styles.fontColor}>收货人：</Text>
                            <TextInput underlineColorAndroid="transparent"onChangeText={(name) => this.setState({name})} value={this.state.name} style={styles.textInput}/>
                        </View>
                        <Text style={styles.bottom}/>
                        <View style={styles.list}>
                            <Text style={styles.fontColor}>联系电话：</Text>
                            <TextInput underlineColorAndroid="transparent" onChangeText={(phone) => this.setState({phone})} value={this.state.phone} style={styles.textInput}/>
                        </View>
                        <Text style={styles.bottom}/>
                        <TouchableHighlight  onPress={this._showAreaPicker.bind(this)} underlayColor='transparent'>
                        <View style={styles.listCity}>
                            <Text style={styles.fontColor}>所在城市:</Text>
                            <Text style={styles.cityFont}>{province}</Text><Text style={styles.cityFont}>{city}</Text><Text style={styles.cityFont}>{area}</Text>
                        </View>
                        </TouchableHighlight>
                        <Text style={styles.bottom}/>
                        <View style={styles.list1}>
                            <Text style={[styles.fontColor,styles.detailAddress]}>详细地址：</Text>
                            <TextInput underlineColorAndroid="transparent" onChangeText={(address) => this.setState({address})} multiline = {true} value={this.state.address} style={styles.textInputAddress}  textAlignVertical='top'/>
                        </View>
                    </View>
                    <TouchableHighlight onPress={this.submit.bind(this)} underlayColor='transparent'>
                        <Image source={confirm} style={styles.confirm}/></TouchableHighlight>
                </ImageBackground>
            )
        }
}
const styles = StyleSheet.create({
    mainBg: {
        flex:1,
        width:null,
        height:null,
        alignItems:'center',
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(30),
        paddingTop:ifIphoneX(scaleSize(30),0)
    },
    wrap:{
        width:'100%',
        height:scaleSize(470),
        marginTop:scaleSize(80),
        backgroundColor:'#fff',
        borderRadius:scaleSize(20),
        paddingLeft:scaleSize(30),
        paddingRight:scaleSize(30)
    },
    flex1:{
       flex:1
    },
    list:{
        width:scaleSize(620),
        flexDirection:'row',
        alignItems:'center',
    },
    list1:{
        width:scaleSize(620),
        flexDirection:'row',
    },
    bottom:{
        width:'100%',
        height:scaleSize(1),
        backgroundColor: 'rgba(174,174,174,0.4)',
    },
    arrow:{
        width:scaleSize(17),
        height:scaleSize(32)
    },
    confirm:{
        width:scaleSize(193),
        height:scaleSize(86),
        marginTop:scaleSize(90)
    },
    back:{
        width:scaleSize(60),
        height:scaleSize(60),
        position:'absolute',
        left:0
    },
    headers:{
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginTop:scaleSize(60),
    },
    title:{
        width:scaleSize(193),
        height:scaleSize(40)
    },
    changeTitle:{
        width:scaleSize(188),
        height:scaleSize(44)
    },
    fontColor:{
        color:'#323232',
        paddingLeft:scaleSize(24),
        fontSize:setSpText(32),
        width:scaleSize(200)
    },
    textInput:{
        color:'#323232',
        flex:1,
        height:scaleSize(88),
        width:'100%',
    },
    textInputAddress:{
        color:'#323232',
        width:'100%',
        height:scaleSize(188),
        paddingRight:scaleSize(96)
    },
    container: {
        flex: 1,
        padding: scaleSize(80),
        alignItems:'center',
    },
    error:{
        marginTop:scaleSize(180),
        marginBottom:scaleSize(80),
        fontSize:setSpText(48),
        color:'#323232',
        fontWeight:'bold'
    },
    modalConfirm:{
        width:'100%',
        height:scaleSize(80),
        justifyContent:'center',
        marginTop:scaleSize(30)
    },
    confirmColor:{
        width:scaleSize(213),
        height:scaleSize(96)
    },
    layer:{
        width:scaleSize(653),
        height:scaleSize(578),
        marginTop:scaleSize(216),
        alignItems:'center'
    },
    detailAddress:{
        marginTop:scaleSize(22)
    },
    /*城市选择*/
    listCity:{
        width:scaleSize(620),
        height:scaleSize(90),
        flexDirection:'row',
        alignItems:'center',
    },
    cityFont:{
        fontSize:setSpText(28),
        color:'#323232',
        marginRight:scaleSize(10)
    }
})
