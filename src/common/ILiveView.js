/**
 * Created by ruby on 2017/10/28.
 * @description 腾讯直播渲染层
 * @copyright wuxudong inc.
 */
import  React, {Component, PropTypes} from 'react'
import {
  requireNativeComponent,
  View
} from 'react-native'

const RCTILiveView = requireNativeComponent("RCTILiveView", ILiveView, {
  nativeOnly: { onSelect: true }
});

export default class ILiveView extends Component {

  render() {
    return (
      <RCTILiveView {...this.props}/>
    )
  }
}

