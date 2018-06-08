// pages/logistics/logistics.js
var config = require('../../config.js');
var common = require('../../common.js');
var orderid;
var context;
var time;
var havelogistics = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    orderid = options.orderid;
    var that = this;
    common.commonRequest({
      url: config.expressUrl + '/' + orderid,
      method: 'GET',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      login: true,
      successFun: function (res) {
        if (res.data.data.trackList.length > 0) {
          var orderId = res.data.data.orderId;
          var expressName = res.data.data.expressName;
          var shippingCode = res.data.data.shippingCode;
          var trackList = res.data.data.trackList;
          for (var index in trackList) {
            context = trackList[index].context;
            time = trackList[index].time;
          }
          that.setData({
            trackList: res.data.data.trackList,
            orderId: orderId,
            expressName: expressName,
            shippingCode: shippingCode,
            time: time,
            context: context,
            havelogistics: true
          })
        }
        if (res.data.data.trackList.length == 0) {
          var orderId = res.data.data.orderId;
          var expressName = res.data.data.expressName;
          var shippingCode = res.data.data.shippingCode;
          that.setData({
            orderId: orderId,
            expressName: expressName,
            shippingCode: shippingCode,
            havelogistics: false
          })
        }
      }
    }); 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})