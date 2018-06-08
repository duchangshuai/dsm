var config = require('../../config.js');
var common = require('../../common.js');
var buyList;
var userAddressId;
var totalCoupon;
var redColor = false;
var couponId = 0;
var totalAmount = 0;
var showCoupon = false;
var tempTotalAmount = 0;
var token;
var communityMsg = "";
Page({
  data: {
    index: 0,
    total: 0,
    totalAmount: totalAmount,
    addCart: false,
    totalCoupon: "无可用优惠券",
    tempTotalAmount: tempTotalAmount,
    imageList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var param = {};
    if (options.addressId != undefined) {
      param.addressId = options.addressId
    }
    totalCoupon = "无可用优惠券";
    redColor = false;
    couponId = 0;
    totalAmount = 0;
    showCoupon = false;
    communityMsg="";
    var that = this;
    common.commonRequest({
      url: config.settlementUrl,
      method: "post",
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: param,
      successFun: function (res) {
        token = res.data.data.token;
        buyList = res.data.data.buyList;
        var couponList = res.data.data.couponList
        userAddressId = res.data.data.address.id;
        totalAmount = res.data.data.totalAmount;
        var tempTotalAmount = totalAmount;
        //无优惠券列表时显示空页面
        if (couponList.length == 0) {
          that.setData({
            showCoupon: false
          })
        } else {
          that.setData({
            showCoupon: true
          })
        }
        for (var index in couponList) {
          if (couponList[index].canUse == true) {
            if (couponList[index].selected == true) {
              totalCoupon = -(couponList[index].couponPrice / 100.00);
              redColor = true;
              tempTotalAmount = tempTotalAmount - couponList[index].couponPrice;
              couponId = couponList[index].couponId;
              break;
            }
          }
        }
        that.setData({
          address: res.data.data.address,
          totalAmount: totalAmount,
          buyList: buyList,
          couponList: couponList,
          totalCoupon: totalCoupon,
          redColor: redColor,
          tempTotalAmount: tempTotalAmount
        });
      }
    })
  },
  changeAddress: function () {
    wx.redirectTo({
      url: '../selectaddress/selectaddress',
    })
  },
  //合计
  getsumTotal: function () {
    var sum = 0
    for (var i = 0; i < this.data.cartItems.length; i++) {
      if (this.data.cartItems[i].selected) {
        sum += this.data.cartItems[i].value * this.data.cartItems[i].price
      }
    }
    //更新数据
    this.setData({
      total: sum
    })
  },
  community: function (e) {
    communityMsg = e.detail.value;
  },
  submitOrder: function (e) {
    if (userAddressId == 0) {
      wx.showToast({
        title: "请先选择地址",
        icon: 'loading',
        mask: true
      })
      return;
    }
    var commodityList = [];
    for (var index in buyList) {
      commodityList.push({
        skuId: buyList[index].skuId,
        qty: buyList[index].quantity
      });
    }
    wx.showLoading({
      title: '正在提交订单',
    })
    common.commonRequest({
      url: config.ordersubmitUrl,
      method: "post",
      login: true,
      header: {
        "Content-Type": "application/json",
      },
      data: {
        commodityList: commodityList,
        userAddressId: userAddressId,
        couponId: couponId,
        token: token,
        community: communityMsg
      },
      failFun: function () {
        wx.hideLoading();
      },
      successFun: function (res) {
        wx.hideLoading();
        var orderid = res.data.data.orderId;
        common.commonRequest({
          url: config.weixinPayUrl,
          method: 'post',
          login: true,
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: {
            orderId: orderid
          },
          successFun: function (res) {
            var nonceStr = res.data.data.nonceStr;
            var packages = res.data.data.package;
            var paySign = res.data.data.paySign;
            var timeStamp = res.data.data.timeStamp;
            var signType = res.data.data.signType
            wx.requestPayment({
              'timeStamp': timeStamp,
              'nonceStr': nonceStr,
              'package': packages,
              'signType': signType,
              'paySign': paySign,
              'success': function (res) {
                wx.switchTab({
                  url: '../order/order',
                })

              },
              'fail': function (res) {
                wx.switchTab({
                  url: '../order/order',
                })
              },
              'complete': function (res) {
                wx.switchTab({
                  url: '../order/order',
                })
              }
            })
          }
        })
      }
    })
  },
  //选择优惠券
  selectCoupons: function (e) {
    var that = this;
    var animation = wx.createAnimation({  // 创建一个动画实例
      duration: 500,   // 动画持续时间
      timingFunction: 'linear' // 定义动画效果，当前是匀速
    })
    that.animation = animation  // 将该变量赋值给当前动画
    animation.translateY(200).step()  // 先在y轴偏移，然后用step()完成一个动画
    that.setData({
      animationData: animation.export(),  // 通过export()方法导出数据
      addCart: true
    })

    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 200)

  },
  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    that.setData({
      animationData: animation.export()
    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        addCart: false
      })
    }, 200)
  },

  changeCoupon: function (e) {
    var id = e.currentTarget.dataset.couponid;
    var couponList = this.data.couponList;
    var tempTotalAmount = totalAmount;
    for (var index in couponList) {
      if (couponList[index].canUse == true) {
        if (couponList[index].couponId == id) {
          totalCoupon = -(couponList[index].couponPrice / 100.00);
          redColor = true;
          couponId = couponList[index].couponId;
          tempTotalAmount = tempTotalAmount - couponList[index].couponPrice;
          break;
        }
      }
    }
    this.setData({
      totalCoupon: totalCoupon,
      redColor: redColor,
      tempTotalAmount: tempTotalAmount
    });
    this.hideModal();
  }
})