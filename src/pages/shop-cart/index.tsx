import { ComponentClass } from 'react'

import Taro, { Component, Config } from '@tarojs/taro'
import { View, Form, Button, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { ProductList, MyCheckbox, Price } from '@/components'
import { updateCart } from '@/redux/actions/user'
import { addWxFormId } from '@/services/wechat'
import { setCartBadge } from '@/utils'
import { Product } from '@/redux/reducers/goods'

import './index.scss'


type ProductInfo = {
  number: number | string
  goodsId: string
  propertyChildIds: string
  active?: boolean
}

type ShopCartInfo = any

type PageStateProps = {
  shopCartInfo: ShopCartInfo
}

type PageDispatchProps = {
  updateCart: (data: {
    type?: string,
    products: ProductInfo[]
  }) => Promise<void>
}

type PageOwnProps = {}

type PageState = {
  editing: boolean,
  totalAmount: number,
  totalScore: number,
  productList: Product[],
  selectAll: boolean,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ShopCart {
  props: IProps
}


@connect(
  ({
    user: {
      shopCartInfo,
    },
  }) => ({
    shopCartInfo,
  }),
  (dispatch: any) => ({
    updateCart: (data: {
      type?: string,
      products: ProductInfo[]
    }) => dispatch(updateCart(data)),
  }),
)

class ShopCart extends Component {
  config: Config = {
    navigationBarTitleText: '购物车',
  }

  state = {
    editing: false,
    totalAmount: -1,
    totalScore: -1,
    productList: [],
    selectAll: false,
  }

  componentWillMount() {
    setCartBadge()
  }

  async componentDidShow() {
    this.handleData(this.props.shopCartInfo)
  }

  componentWillReceiveProps(nextProps: PageStateProps) {
    this.handleData(nextProps.shopCartInfo)
  }

  handleData = (shopCartInfo: ShopCartInfo) => {
    if (!shopCartInfo) {
      return
    }

    const { shopList = [] } = shopCartInfo
    const nextState = shopList.reduce((pre: {
      totalAmount: number,
      totalScore: number,
      selectAll: boolean,
    }, item: any) => {
      const { price, score, number } = item
      if (item.active) {
        // 价格和积分总和
        pre.totalAmount += (price * 100 * number) / 100
        pre.totalScore += score * number
      } else {
        // 是否全选
        pre.selectAll = false
      }
      return pre
    }, {
      totalAmount: 0,
      totalScore: 0,
      selectAll: true,
    })

    if (shopList.length === 0) {
      nextState.selectAll = false
    }

    this.setState({
      ...nextState,
      productList: shopList,
    })
  }

  // 更新选中状态
  onListChange = (productInfo: any) => {
    this.props.updateCart({
      products: [productInfo],
    })
  }

  // 表单提交
  onFromSubmit = (e: TaroBaseEventOrig) => {
    addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })
  }

  // 全选
  toggleSelectAll = () => {
    const { productList, editing, selectAll } = this.state
    if (productList.length === 0) {
      return
    }
    // 非编辑模式
    if (!editing) {
      this.props.updateCart({
        products: productList.map((product: any) => ({
          ...product,
          active: !selectAll,
        })),
      })
    }
  }

  // 用户点击提交
  onSubmit = () => {
    const { editing, productList } = this.state
    if (!productList || productList.length === 0) {
      Taro.showToast({
        title: '购物车为空~',
        icon: 'none',
        duration: 2000,
      })
      return
    }
    // 非编辑模式
    if (!editing) {
      // 跳转到结算页
      Taro.navigateTo({
        url: '/pages/checkout/index?orderType=cart',
      })
    }
  }

  render () {
    const { productList, selectAll, totalAmount, totalScore } = this.state
    return (
      <View className="container shop-cart">
        {productList.length === 0 && <View className="no-data">购物车为空</View>}
        {productList.length > 0 && <ProductList list={productList} edit onChange={this.onListChange}></ProductList>}
        {/* 底部Bar */}
        <View className="bottom-bar-wrapper">
          <Form reportSubmit onSubmit={this.onFromSubmit}>
            <View className="bottom-bar">
              <View className="checkbox-wrapper" onClick={this.toggleSelectAll}>
                <MyCheckbox checked={selectAll}></MyCheckbox>
                <View className="check-all-text">全选</View>
              </View>
              {productList.length !== 0 && <Text className="price">合计：</Text>}
              <Price price={totalAmount} score={totalScore}></Price>
              <Button
                form-type="submit"
                className="button"
                hoverClass="none"
                size="mini"
                // type="secondary"
                onClick={this.onSubmit}
              >去结算</Button>
            </View>
          </Form>
        </View>
      </View>
    )
  }
}

export default ShopCart as ComponentClass<PageOwnProps, PageState>
