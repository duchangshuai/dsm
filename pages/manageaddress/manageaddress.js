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

  },
  onShow: function (options) {
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
  kindToggle: function (e) {
    wx.redirectTo({
      url: '../newaddress/newaddress?addressId=' + e.currentTarget.dataset.value + '&addressDefault=' + e.currentTarget.dataset.checked
    })
  },
  addressNew: function () {
    wx.navigateTo({
      url: '../addAddress/addAddress'
    })
  },
  radioChange: function (e) {
    var that = this;
    common.commonRequest({
      url: config.setDefaultAddressUrl,
      method: 'POST',
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        addressId: e.detail.value
      },
      successFun: function (res) {
        that.setData({
          list: res.data.data
        })
      }
    })
  },
  addressDel: function (e) {
    var that = this;
    wx.showModal({
      content: '确定要删除此收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          //获取列表中要删除项的下标 
          var addressId = e.currentTarget.dataset.value;
          //更新列表的状态
          common.commonRequest({
            url: config.deleteAddressUrl + '/' + addressId,
            method: 'delete',
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
        } else if (res.cancel) {

        }
      }
    })
  },
})