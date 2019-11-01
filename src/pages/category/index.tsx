import { ComponentClass } from 'react'

import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView, Image, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getCategory, getProducts } from '@/redux/actions/goods'
import { Product, CategoryItem } from '@/redux/reducers/goods'

import { priceToFloat } from '@/utils'
import classNames from 'classnames'

import './index.scss'

type PageStateProps = {
  category: CategoryItem[]
  products: { [key: string]: Product[] }
}

type GetProductParam = {
  key: string,
  categoryId?: number,
  recommendStatus?: number,
  page?: number,
  pageSize?: number,
}

type PageDispatchProps = {
  getCategory: () => void
  getProducts: (data: GetProductParam) => void
}

type PageOwnProps = {}

type PageState = {
  activeCategory: number
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Category {
  props: IProps
}

// 首页多加滤镜
@connect(({ goods: { products }, goods }) => ({
  category: goods.category,
  products,
}), (dispatch: any) => ({
  getCategory: () => dispatch(getCategory()),
  getProducts: (data: GetProductParam) => dispatch(getProducts(data)),
}))

class Category extends Component {
  config = {
    navigationBarTitleText: '商品分类',
  }

  state = {
    activeCategory: 0,
  }

  async componentDidShow () {
    await this.props.getCategory()
    const { category } = this.props

    // 默认拉取第一个分类商品
    const categoryId = category[0].id
    if (!categoryId) {
      return
    }

    this.getProducts(categoryId)
  }

  // 跳转商品详情页
  goToProductDetail = (id: number) => {
    Taro.navigateTo({
      url: `/pages/product-detail/index?id=${id}`,
    })
  }

  // 获取分类商品
  getProducts = (categoryId: number) => {
    this.props.getProducts({
      key: `category_${categoryId}`,
      categoryId,
    })
  }

  // 用户切换分类
  onCategoryClick = (item: CategoryItem, index: number) => {
    this.getProducts(item.id)

    this.setState({
      activeCategory: index,
    })
  }

  render () {
    const { category, products } = this.props
    const { activeCategory } = this.state

    const currentCategory = category[activeCategory] || {}
    const currentProducts = products[`category_${currentCategory.id}`] || []

    return (
      <View className="container">
        <ScrollView scrollY className="category-nav">
          {
            category.map((item, index) => <View
              key={item.id}
              className={classNames('category-item', {
                active: activeCategory === index,
              })}
              onClick={this.onCategoryClick.bind(this, item, index)}
            >
              {item.name}
            </View>)
          }
        </ScrollView>
        <ScrollView scrollY className="products">
          {
            currentProducts.map((product: Product) => {
              const { id, minPrice, minScore, characteristic, name, pic } = product
              return <View
                key={id}
                className="product-item"
                onClick={this.goToProductDetail.bind(this, id)}
              >
                <View className="product-image">
                  <Image src={pic} mode="aspectFill"></Image>
                </View>
                <View className="product-info">
                  <View className="name clamp">{name}</View>
                  <View className="characteristic clamp">{characteristic}</View>
                  <View className="price">{(minPrice > 0 || minScore === 0)
                    ? <View><Text className="small-text">￥</Text>{priceToFloat(minPrice)}</View>
                    : <View>{minScore}<Text className="small-text"> 积分</Text></View>}
                  </View>
                </View>
              </View>
            })
          }
        </ScrollView>
      </View>
    )
  }
}

export default Category as ComponentClass<PageOwnProps, PageState>
