/* eslint-disable import/no-commonjs */
const path = require('path')
const { theme } = require('../mallConfig')

const config = {
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
  },
  projectName: 'wechat-app-mall-taro',
  date: '2020-4-27',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [
  ],
  sass: {
    resource: [
      path.resolve(__dirname, '..', 'src/var.scss')
    ],
    projectDirectory: path.resolve(__dirname, '..'),
    data: Object.keys(theme).reduce((str, key) => str += `${key}: ${theme[key]} !default;`, ''),
  },
  defineConstants: {
  },
  copy: {
    patterns: [
      { from: 'src/components/wxParse/wxParse.wxss', to: 'dist/components/wxParse/wxParse.wxss'},
      { from: 'src/components/wxParse/wxParse.wxml', to: 'dist/components/wxParse/wxParse.wxml'}
    ],
    options: {
    }
  },
  framework: 'react',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {
        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
