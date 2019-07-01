import { GET_VIP_LEVEL_SUCCESS, GET_SYSTEM_CONFIG_SUCCESS, GET_BANNERS_SUCCESS } from '../actions/config'

const INITIAL_STATE = {
  vipLevel: 0,
  mallName: '', // 商城名称
  rechargeAmountMin: undefined, // 充值最小金额
  allowSelfCollection: '', // 是否允许到店自提
  banners: {}, // banner
}

export default function config(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_VIP_LEVEL_SUCCESS:
      return {
        ...state,
        vipLevel: action.data,
      }
    case GET_SYSTEM_CONFIG_SUCCESS:
      return {
        ...state,
        ...(action.data || {}),
      }
    case GET_BANNERS_SUCCESS:
      return {
        ...state,
        banners: {
          [action.key]: action.data,
        },
      }
    default:
      return state
  }
}
