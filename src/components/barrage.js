import React from 'react';
import {StyleSheet, Text, View, Animated,Dimensions} from 'react-native';
import {setSpText,scaleSize} from '../common/util'
/*弹幕*/
export let screenWidth = Dimensions.get('window').width;
export default class Barrage extends React.Component {
    constructor() {
        super();
        this.num = 8
        this.queue = []
        this.busy = Array.from(new Array(this.num), (val, index) => false)

        this.state = {
            movingAnimations: Array.from(new Array(this.num), (val, index) => new Animated.ValueXY({
                x: screenWidth,
                y: index * 12
            })),
            movingTexts: Array.from(new Array(this.num), (val, index) => "")
        }
    }

    offer(s,level) {
        console.info('screenWidth',screenWidth)
        if(this.queue !== undefined){
            this.queue.push({name:s,level:level})
            this.startAnimationIfNecessary()
        }
    }

    take() {
        if (this.queue.length > 0) {
            let s = this.queue[0]
            this.queue = this.queue.slice(1, -1)
            return s
        } else {
            return "";
        }
    }

    startAnimationIfNecessary() {
        console.log(this.queue)

        let busyTrackCount = this.busy.reduce((sum, busy) => (sum += busy ? 1 : 0), 0)

        if (busyTrackCount < this.num) {
            // find a free track
            let s = this.take()

            if (s.length === 0) {
                return
            } else {

                let leftTrackCount = this.num - busyTrackCount

                let selectIndex = Math.floor(Math.random() * leftTrackCount)

                var j = 0
                for (var i = 0; i < this.num; i++) {
                    if (this.busy[i]) {
                        continue
                    } else {
                        if (j === selectIndex) {
                            this.startAnimation(i, s)
                            break
                        } else {
                            j++
                        }

                    }
                }
            }
        }

    }

    startAnimation(index, text) {

        console.log("barrage " + text + " at track " + index)

        let _this = this

        var movingTextsCopy = this.state.movingTexts.slice()
        movingTextsCopy[index] = text
        this.setState({...this.state, movingTexts: movingTextsCopy})

        this.busy[index] = true

        Animated.timing(                  // Animate over time
            this.state.movingAnimations[index],            // The animated value to drive
            {
                /*调试 速度的 快慢*/
                toValue: {x: -1080, y: index * 12},                   // Animate to opacity: 1 (opaque)
                duration: 12000, // Make it take a while
                useNativeDriver: true
            }
        ).start(() => {
            var movingAnimationsCopy = _this.state.movingAnimations.slice()
            movingAnimationsCopy[index] = new Animated.ValueXY({
                x: screenWidth,
                y: index * 12
            })

            var movingTextsCopy = _this.state.movingTexts.slice()
            movingTextsCopy[index] = ""

            _this.busy[index] = false

            _this.setState({...this.state, movingAnimations: movingAnimationsCopy, movingTexts: movingTextsCopy})

            _this.startAnimationIfNecessary()

        });

    }

    getStyle(index) {
        let translateTransform = this.state.movingAnimations[index].getTranslateTransform();
        // console.log(translateTransform)
        return [{position:'absolute',marginTop:scaleSize(5)},{
            transform: translateTransform
        }]
    }

    render() {
        console.log("render barrage")
        return (
            <View style={styles.container}>
                {Array.from(new Array(this.num), (val, index) =>
                    <Animated.View key={index} style={this.getStyle(index)}>
                        <Text style={parseInt(this.state.movingTexts[index].level) === 0 || this.state.movingTexts[index].level === ""
                            ?styles.barrageText0
                            :parseInt(this.state.movingTexts[index].level) === 1||parseInt(this.state.movingTexts[index].level) === 2||parseInt(this.state.movingTexts[index].level) === 3
                                ?styles.barrageText1
                                :parseInt(this.state.movingTexts[index].level) === 4||parseInt(this.state.movingTexts[index].level) === 5
                                    ?styles.barrageText2
                                    :styles.barrageText3} numberOfLines={1}>{this.state.movingTexts[index].name}</Text>

                    </Animated.View>)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        //width: '100%',
        width: scaleSize(1080),
        height: scaleSize(400),
        alignItems: 'center',
        justifyContent: 'center',
        position:'absolute'
    },
    barrageText0:{
        color:'#FFFFFF',
        textShadowColor:'#5D5D5D',
        backgroundColor:'transparent',
        fontSize:setSpText(36),
        paddingTop:scaleSize(4),
        paddingBottom:scaleSize(4),
        textShadowRadius:scaleSize(24),
        textShadowOffset:{width: -1, height: 0}
    },
    barrageText2:{
        color:'#FEDFF1',
        textShadowColor:'#B1115A',
        backgroundColor:'transparent',
        fontSize:setSpText(36),
        paddingTop:scaleSize(4),
        paddingBottom:scaleSize(4),
        textShadowRadius:scaleSize(24),
        textShadowOffset:{width: -1, height: 0}
    },
    barrageText1:{
        color:'#E4FBFF',
        textShadowColor:'#0C91A5',
        backgroundColor:'transparent',
        fontSize:setSpText(36),
        paddingTop:scaleSize(4),
        paddingBottom:scaleSize(4),
        textShadowRadius:scaleSize(24),
        textShadowOffset:{width: -1, height: 0}
    },
    barrageText3:{
        color:'#FFF7DC',
        textShadowColor:'#B37D06',
        backgroundColor:'transparent',
        fontSize:setSpText(36),
        paddingTop:scaleSize(4),
        paddingBottom:scaleSize(4),
        textShadowRadius:scaleSize(24),
        textShadowOffset:{width: -1, height: 0}
    },
});