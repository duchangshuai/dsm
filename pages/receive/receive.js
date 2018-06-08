const app = getApp();
var config = require('../../config.js');
var common = require('../../common.js')
var userCouponId;
var shareUserId;
var user = "";
var price = "";
Page({
  onLoad: function (options) {
    shareUserId = options.userid;
    userCouponId = options.cuponid;
    var that = this;  
  },
  onShow: function () {
    this.getData();
  },
  getData: function () {
    var that = this;
    common.commonRequest({
      url: config.couponDetailUrl + userCouponId,
      method: 'GET',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      login: true,
      successFun: function (res) {
        that.setData({
          user: res.data.data.couponUserName,
          price: res.data.data.couponPrice
        })
      }
    });
  },
  Receive: function () {
    var that = this;
    common.commonRequest({
      url: config.shareSingleUrl,
      method: 'POST',
      data: {
        userCouponId: userCouponId,
        shareUserId: shareUserId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      login: true,
      successFun: function (res) {
        wx.showToast({
          title: "领取成功",
        })
        wx.switchTab({
          url: '/pages/personal/personal',
        })
      }
    });
  }
})