import '@tarojs/async-await'
import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/redux'

import Index from './pages/index'

import configStore from './redux/store'

import './app.less'
import { UPDATE_GLOBAL_DATA } from './redux/actions/global'

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
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
    },
  }

  componentWillMount () {
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
          Taro.showToast({
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
        Taro.showToast({
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
  }

  componentDidMount () {}

  componentDidShow () {}

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
