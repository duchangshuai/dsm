/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

//var host = "http://192.168.1.135:8082"
//var host = "http://106.15.249.230:8081"  
//var host = "http://192.168.1.142:8081"
var host = "https://wx.dsmzg.com"
var config = {

  // 下面的地址配合云端 Server 工作
  host,

  // 登录地址，用于建立会话
  loginUrl: `${host}/login`,

  // 获取二维码接口
  codeUrl: `${host}/qr/code`,

  //首页
  indexListUrl: `${host}/index/view/list`,

  //地址管理列表
  addressListByUserUrl: `${host}/uc/user/address/addressListByUser`,

  //获取城市列表
    areaUrl: `${host}/uc/area/list`,

  //地址新增
    addAddressUrl: `${host}//uc/user/address/addAddress`,

  //编辑前获取addressId
    getAddressByIdUrl: `${host}/uc/user/address/getAddressById`,

  //地址编辑
    editAddressUrl: `${host}/uc/user/address/editAddress`,

  //设为默认地址
  setDefaultAddressUrl: `${host}/uc/user/address/setDefaultAddress`,

  //地址删除
  deleteAddressUrl: `${host}/uc/user/address/deleteAddress`,

  //优惠券
  couponListByUserUrl: `${host}/uc/user/coupon/couponListByUser`,
 
  //商品详情页
  detailUrl: `${host}/ic/item/detail/`,

  //订单
  orderListrUrl: `${host}/oc/order/list`,

  //订单详情页
  orderdetailUrl: `${host}/oc/order/detail`,

  // 取消订单
  ordercancelUrl: `${host}/oc/order/cancel`,

  //提交订单
  ordersubmitUrl: `${host}/oc/order/post`,

  //购物车列表
  cartListrUrl: `${host}/oc/cart/list`,


  //购物车数量更新
  updateQtyUrl: `${host}/oc/cart/updateQty`,

  //购物车商品选择
  cartSelectUrl: `${host}/oc/cart/select`,

  //购物车全选
  cartAllUrl: `${host}/oc/cart/selected/all`,

  //购物车全不选
  disSelectedUrl: `${host}/oc/cart/disSelected/all`,

  //购物车商品删除
  cartDeletetUrl: `${host}/oc/cart/delete`,

  //购物车清空
  cartClearUrl: `${host}/oc/cart/clear`,

  //购物车
  cartAddUrl: `${host}/oc/cart/add`, 

  //结算
  settlementUrl: `${host}/oc/cart/settlement`,

  //加载更多
  itemListUrl: `${host}/ic/item/list`,

  //优惠券详情地址
  couponDetailUrl: `${host}/uc/user/coupon/detail/`,

  
  shareSingleUrl: `${host}/uc/user/coupon/share/single`,


  //支付
  weixinPayUrl: `${host}/pc/payment/weixinPay`,

  //佣金
  commissionUrl: `${host}/mc/commission/list`,

  //判断是否显示佣金和邀约入口
  myauthUrl: `${host}/mc/auth/myAuth`,


  //邀约入口
  userUrl: `${host}/mc/id`,

   //订单物流
  expressUrl: `${host}/oc/order/express`,

  //分享获取群信息
  gropPostUrl: `${host}/mc/share/group/post`,

  //我的推荐
  recommendUrl: `${host}/mc/recommend`,

  //上传图片
  uploadDoorPicUrl: `${host}/oc/order/uploadDoorPic`,


  //显示图片
  queryDoorPicUrl: `${host}/oc/order/queryDoorPic`,

  //确认收货
  confirmUrl: `${host}/oc/order/confirm`,

  //分享请求
  shareUrl: `${host}/cc/share/get`,

  //佣金提现
  withdrawUrl: `${host}/mc/account/withdraw`,

  //获取手机号
  phoneUrl: `${host}/mc/post/phone`
  
};

module.exports = config
