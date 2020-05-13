export default {
  pages: [
    'pages/index/index',
    'pages/authorize/index',
    'pages/account/index',
    'pages/account/extinfo',
    'pages/category/index',
    // // 'pages/score-shop/index',
    'pages/shop-cart/index',
    // 'pages/entry/index',
    // 'pages/vip-center/index',
    // 'pages/vip-center/my',
    // 'pages/vip-center/potences',
  ],
  subPackages: [{
    root: 'pages2',
    pages: [
      'product-detail/index',
      'product-detail/share',
      'product-detail/reputations',
      'checkout/index',
      'address-select/index',
      'address-edit/index',
      'order-list/index',
      'order-detail/index',
      'reputation/index',
      'asset/index',
      'recharge/index',
      'location/index',
      'contact/index',
      'wifi/index',
      'coupons/index',
    ],
  }],
  tabBar: {
    color: '#333333',
    selectedColor: '#D6B44C',
    borderStyle: 'white',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        iconPath: 'assets/icon/home.jpg',
        selectedIconPath: 'assets/icon/home-selected.jpg',
        text: '商城首页',
      },
      {
        pagePath: 'pages/category/index',
        iconPath: 'assets/icon/category.jpg',
        selectedIconPath: 'assets/icon/category-selected.jpg',
        text: '分类',
      },
      {
        pagePath: 'pages/shop-cart/index',
        iconPath: 'assets/icon/shopcart.jpg',
        selectedIconPath: 'assets/icon/shopcart-selected.jpg',
        text: '购物车',
      },
      {
        pagePath: 'pages/account/index',
        iconPath: 'assets/icon/account.jpg',
        selectedIconPath: 'assets/icon/account-selected.jpg',
        text: '我的',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black'
  },
  navigateToMiniProgramAppIdList: ['wx60d176f873ca2d67', 'wxcefbc3693001e0d2']
}
