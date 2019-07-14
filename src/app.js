import '@tarojs/async-await'
import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/redux'
import { getVipLevel, getSystemConfig } from '@/redux/actions/config'
import { checkToken } from '@/services/user'
import { getUserDetail } from '@/redux/actions/user'
import { theme, requireBindMobile, showToast } from './utils'

import Index from './pages/index'
import configStore from './redux/store'
import { UPDATE_GLOBAL_DATA } from './redux/actions/global'

import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

const store = configStore()

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/authorize/index',
      'pages/account/index',
      'pages/productDetail/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
    },
    tabBar: {
      color: '#ccc',
      selectedColor: '#000',
      borderStyle: 'white',
      backgroundColor: '#fff',
      list: [
        {
          pagePath: 'pages/index/index',
          iconPath: 'assets/icon/home.png',
          selectedIconPath: 'assets/icon/home-selected.png',
          text: '首页',
        },
        {
          pagePath: 'pages/index/index',
          iconPath: 'assets/icon/category.png',
          selectedIconPath: 'assets/icon/category-selected.png',
          text: '分类',
        },
        {
          pagePath: 'pages/index/index',
          iconPath: 'assets/icon/shopcart.png',
          selectedIconPath: 'assets/icon/shopcart-selected.png',
          text: '购物车',
        },
        {
          pagePath: 'pages/account/index',
          iconPath: 'assets/icon/account.png',
          selectedIconPath: 'assets/icon/account-selected.png',
          text: '我的',
        },
      ],
    },
  }

  async componentWillMount () {
    // 检测版本更新
    const updateManager = Taro.getUpdateManager()
    updateManager.onUpdateReady(() => {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        },
      })
    })

    // 检测网络状况
    Taro.getNetworkType({
      success: (res) => {
        const networkType = res.networkType
        if (networkType === 'none') {
          // 更新断网状态
          this.updateNetworkStatus(false)
          showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000,
          })
        }
      },
    })

    // 监听网络状态
    Taro.onNetworkStatusChange(res => {
      if (!res.isConnected) {
        // 更新断网状态
        this.updateNetworkStatus(false)
        showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: () => {
            // 网络断开处理逻辑
            // this.goStartIndexPage()
          },
        })
      } else {
        this.updateNetworkStatus(true)
        Taro.hideToast()
      }
    })

    // 获取 vipLevel
    store.dispatch(getVipLevel())

    // 获取系统参数（店铺信息等
    store.dispatch(getSystemConfig())

    // 积分赠送规则

    // 获取用户详情
    const userDetail = await store.dispatch(getUserDetail())

    // 强制用户绑定手机号
    if (requireBindMobile && !userDetail.mobile) {
      showToast({
        title: '需要授权并绑定手机号~',
        icon: 'none',
        duration: 2000,
        complete: () => {
          this.goToLoginPage()
        },
      })
    }
  }

  // componentDidMount () {
  //   Taro.setNavigationBarColor({
  //     backgroundColor: theme['$color-brand'],
  //     frontColor: '#ffffff',
  //   })
  // }

  componentDidShow () {
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
    // 获取 token
    const token = Taro.getStorageSync('token')
    // 跳转啊授权登录页面
    if (!token) {
      this.goToLoginPage()
      return
    }

    // 校验 token 是否有效
    checkToken().then((res) => {
      if (res.code != 0) {
        // token 失效，清除本地 token 重新授权
        Taro.removeStorageSync('token')
        showToast({
          title: '登录失效，请重新授权~',
          icon: 'loading',
          duration: 1000,
          complete: () => {
            this.goToLoginPage()
          },
        })
      }
    })

    Taro.checkSession({
      fail: () => {
        // 微信 session 失效，清除本地 token 重新授权
        Taro.removeStorageSync('token')
        this.goToLoginPage()
      },
    })
  }

  componentDidHide () {}

  componentDidCatchError () {}

  // 更新网络状态
  updateNetworkStatus = async isConnected => {
    await store.dispatch({
      type: UPDATE_GLOBAL_DATA,
      data: {
        isConnected,
      },
    })
  }

  goToLoginPage = () => {
    // Taro.removeStorageSync('token')
    setTimeout(() => {
      Taro.navigateTo({
        url: "/pages/authorize/index",
      })
    }, 300)
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
