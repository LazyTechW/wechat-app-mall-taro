import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtIcon, AtActionSheet, AtActionSheetItem } from 'taro-ui'

import { getBanners } from '@/redux/actions/config'

import './index.scss'


const BANNER_KEY = 'entry'
@connect(({ config }) => ({
  banners: config.banners[BANNER_KEY] || [],
  concatPhoneNumber: config.systemConfig.concat_phone_number,
  mallName: config.systemConfig.mall_name,
}), dispatch => ({
  getBanners: type => dispatch(getBanners(type)),
}))

export default class Entry extends Component {
  config = {
    navigationBarTitleText: '',
  }

  state = {
    showActionSheet: false,
  }

  componentDidShow() {
    this.props.getBanners(BANNER_KEY)
    this.setTitle(this.props.mallName)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.mallName !== this.props.mallName) {
      this.setTitle(nextProps.mallName)
    }
  }

  // 设置页面标题
  setTitle = title => {
    Taro.setNavigationBarTitle({
      title: title || '首页',
    })
  }


  // 跳转 url
  goPage = (url, tabBar = false) => {
    if (!tabBar) {
      Taro.navigateTo({
        url,
      })
      return
    }

    Taro.switchTab({
      url,
    })
  }

  // 切换 action sheet
  onToggleActionSheet = () => {
    this.setState({
      showActionSheet: !this.state.showActionSheet,
    })
  }

  // 图片信息
  bannerInfo = [
    {
      title: '官方小程序商城',
      onClick: () => this.goPage('/pages/index/index', true),
    },
    {
      title: '会员中心',
      onClick: () => this.goPage('/pages/vip-center/index'),
    },
    {
      title: '专属顾问',
      onClick: () => this.onToggleActionSheet(),
    },
  ]

  // 打电话
  makePhoneCall = () => {
    Taro.makePhoneCall({
      phoneNumber: this.props.concatPhoneNumber,
    })
  }

  render () {
    const { banners, concatPhoneNumber } = this.props
    const { showActionSheet } = this.state
    return (
      <View className="container">
        <View className="banners">
          {
            banners.map((banner, index) => {
              const { id, picUrl } = banner
              const { onClick, title } = this.bannerInfo[index]
              return <View
                className="content"
                key={id}
                onClick={onClick}
              >
                <Image
                  className="image"
                  src={picUrl}
                  mode="aspectFill"
                />
                {index === 0 && <View className="first-item item">
                  <Text className="text">{title}</Text>
                  <View className="buy-button">立即选购</View>
                </View>}
                {
                  index !== 0 && <View className="item">
                    <Text className="text">{title}</Text>
                    <AtIcon value="chevron-right" size="24" color="#fff"></AtIcon>
                  </View>
                }
              </View>
            })
          }
        </View>

        {/* 分享弹窗 */}
        <AtActionSheet cancelText="取消" isOpened={showActionSheet} onClose={this.onToggleActionSheet}>
          <AtActionSheetItem>
            <Button className="button" onClick={this.makePhoneCall}>拨打电话：<Text className="phone-number">{concatPhoneNumber}</Text></Button>
          </AtActionSheetItem>
          <AtActionSheetItem>
            <Button
              className="button"
              hoverClass="none"
              size="mini"
              openType="contact"
            >咨询客服</Button>
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    )
  }
}

