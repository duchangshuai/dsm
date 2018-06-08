const app = getApp();
var common = require('../../common.js');
var config = require('../../config.js');
var boolean;
Page({
  data: {
    list: [],
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    common.commonRequest({
      url: config.addressListByUserUrl,
      method: "GET",
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      successFun: function (res) {
        that.setData({
          list: res.data.data
        })
        if (res.data.data.length == 0) {
          that.setData({
            boolean: false
          })
        } else {
          that.setData({
            boolean: true
          })
        }
      }
    })
  },
  selectaddress: function (e) {
    wx.redirectTo({
      url: '../account/account?addressId=' + e.currentTarget.dataset.value
    })
  },
  addressNew: function () {
    wx.redirectTo({
      url: '../sAddaddress/sAddaddress'
    })
  },
})