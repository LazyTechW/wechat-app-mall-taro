import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Video, Swiper, SwiperItem, Text } from '@tarojs/components'

import { getBanners } from '@/redux/actions/config'
import { getProducts } from '@/redux/actions/goods'
import classNames from 'classnames'
import { Price } from '@/components'
import { setCartBadge, requireEntryPage } from '@/utils'
import { AtIcon } from 'taro-ui'

import './index.scss'

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageStateProps = {
  counter: {
    num: number
  }
}

type PageDispatchProps = {
  getBanners: (type: string) => void
  getProducts: () => void
}

type PageOwnProps = {}

type PageState = {
  swiperIndex: number
  playVideo: boolean,
  statusBarHeight: number,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps
}

@connect(({ config, goods: { products } }) => ({
  products,
  banners: config.banners['index'],
  systemConfig: config.systemConfig,
  recommendProducts: products.homeRecommendProducts,
  allProducts: products.allProducts,
}), dispatch => ({
  getBanners: type => dispatch(getBanners(type)),
  getProducts: data => dispatch(getProducts(data)),
}))

class Index extends Component {

  /**
 * 指定config的类型声明为: Taro.Config
 *
 * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
 * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
 * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
 */
  config: Config = {
    navigationBarTitleText: '首页',
    navigationStyle: 'custom',
  }

  state: PageState = {
    swiperIndex: 0,
    playVideo: false,
    statusBarHeight: 0,
  }

  componentWillMount() {
    setCartBadge()
    const { statusBarHeight } = Taro.getSystemInfoSync()
    this.setState({
      statusBarHeight,
    })
  }

  componentDidShow() {
    // 展示启动页
    this.props.getBanners('index')

    // 加载首页推荐商品
    this.props.getProducts({
      key: 'homeRecommendProducts',
      recommendStatus: 1,
    })

    // 展示发现更多商品块
    this.props.getProducts({
      key: 'allProducts',
      page: 1,
      pageSize: 10,
    })

    console.log(this.props.systemConfig.home_order_category_id)

    this.orderCategoryId = this.props.systemConfig.home_order_category_id
    // 加载在线定位数据
    this.props.getProducts({
      key: `category_${this.orderCategoryId}`,
      categoryId: this.orderCategoryId,
    })
  }

  // 跳转商品详情页
  goToProductDetail = id => {
    Taro.navigateTo({
      url: `/pages/product-detail/index?id=${id}`,
    })
  }

  // 监听轮播图变化
  onSwiperChange = e => {
    this.setState({
      swiperIndex: e.detail.current,
    })
  }

  // 播放视频
  playVideo = () => {
    this.setState({
      playVideo: true,
    }, () => {
      const videoContext = Taro.createVideoContext('playVideo')
      videoContext.requestFullScreen()
    })
  }

  // 视频全屏事件
  onFullScreenChange = e => {
    if (!e.detail.fullScreen) {
      this.setState({
        playVideo: false,
      })
    }
  }

  // banner 点击
  onBannerClick = item => {
    const { linkUrl } = item

    // 项目内跳转
    if (/^\/pages\//.test(linkUrl)) {
      Taro.navigateTo({
        url: linkUrl,
      })
    }
    // 公众号跳转
    if (/^http/.test(linkUrl)) {
      Taro.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(linkUrl)}`,
      })
    }
  }

  // 返回首页
  goHome = () => {
    Taro.redirectTo({
      url: '/pages/entry/index',
    })
  }

  render() {
    const {
      banners = [],
      recommendProducts,
      allProducts,
      products,
      systemConfig: {
        index_video_1: videoUrl,
        index_video_2: videoUrl2,
        home_order_category_id: orderCategoryId,
      },
    } = this.props
    const { swiperIndex, playVideo, statusBarHeight } = this.state

    const orderCategoryProducts = products[`category_${orderCategoryId}`] || []

    return (
      <View className="index">
        {requireEntryPage && <View
          className="go-home"
          style={{
            paddingTop: `${statusBarHeight * 2}rpx`,
          }}
          onClick={this.goHome}
        >
          <AtIcon value="chevron-left" size="20" color="#fff"></AtIcon>
          <Text>首页</Text>
        </View>}
        {/* banner */}
        <Swiper
          className="swiper"
          circular
          indicatorDots={false}
          autoplay
          onChange={this.onSwiperChange}
        >
          {banners.map(item => <SwiperItem className="swiper-item" key={item.id} onClick={this.onBannerClick.bind(this, item)}>
            <Image showMenuByLongpress className="swiper-item_image" src={item.picUrl} mode="aspectFill" />
          </SwiperItem>)}
        </Swiper>
        {/* 轮播图 dots */}
        <View className="indicator-dots">
          {banners.map((item, index) => <View className={classNames('indicator-dot', {
            active: swiperIndex === index,
          })} key={item.id}
          ></View>)}
        </View>

        {
          <View className="recommend-products">
            {/* 精品推荐商品块 */}
            {
              recommendProducts && recommendProducts.length > 0 && <View>
                <View className="title title-line">精品推荐</View>
                <View className="list">
                  {
                    recommendProducts.map(product => {
                      const { id, pic, name, characteristic, minPrice, minScore } = product
                      return <View key={id} onClick={this.goToProductDetail.bind(this, id)}>
                        <Image className="product-image" src={pic} mode="aspectFill"></Image>
                        <View className="name clamp">{name}</View>
                        <View className="characteristic clamp">{characteristic}</View>
                        <Price price={minPrice} score={minScore}></Price>
                      </View>
                    })
                  }
                </View>
              </View>
            }
            {/* 店内环境 */}
            {
              videoUrl && <View onClick={this.playVideo}>
                <View className="title title-line">店内环境</View>
                <View className="video-wrapper">
                  <Video
                    src={videoUrl}
                    loop
                    autoplay
                    muted
                    controls={false}
                    object-fit="fill"
                  >
                    <View class="mask">
                      <View class="play-button"></View>
                    </View>
                  </Video>
                </View>
                {playVideo && <Video
                  src={videoUrl2}
                  loop
                  autoplay
                  object-fit="fill"
                  id="playVideo"
                  onFullScreenChange={this.onFullScreenChange}
                >
                </Video>}
              </View>
            }
            {/* 在线定位 */}
            {
              orderCategoryProducts && orderCategoryProducts.length > 0 && <View>
                <View className="title title-line">在线定位</View>
                <View className="list">
                  {
                    orderCategoryProducts.map(product => {
                      const { id, pic, name, characteristic, minPrice, minScore } = product
                      return <View key={id} onClick={this.goToProductDetail.bind(this, id)}>
                        <Image className="product-image" src={pic} mode="aspectFill"></Image>
                        <View className="name clamp">{name}</View>
                        <View className="characteristic clamp">{characteristic}</View>
                        <Price price={minPrice} score={minScore}></Price>
                      </View>
                    })
                  }
                </View>
              </View>
            }
          </View>
        }

        {/* 发现更多商品块 */}
        {
          allProducts && allProducts.length > 0 && <View className="all-products">
            <View className="title title-line">发现更多</View>
            <View className="list">{
              allProducts.map(product => {
                const { id, pic, name, characteristic, minPrice, minScore, numberSells } = product
                return <View key={id} className="item" onClick={this.goToProductDetail.bind(this, id)}>
                  <Image className="product-image" src={pic} mode="aspectFill"></Image>
                  <View className="name clamp">{name}</View>
                  <View className="characteristic clamp">{characteristic}</View>
                  <View className="price-wrapper">
                    <Price price={minPrice} score={minScore}></Price>
                    <View className="sold-amount">
                      已售:{numberSells > 999 ? '999+' : numberSells}件
                    </View>
                  </View>
                </View>
              })
            }</View>
          </View>
        }
      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>