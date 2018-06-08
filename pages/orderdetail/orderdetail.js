// pages/orderdetail/orderdetail.js
var config = require('../../config.js');
var common = require('../../common.js');
var orderid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderPrice: 0,
    couponAmount: 0,
    countDownDay: 0,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    orderid = options.orderid;
    common.commonRequest({
      url: config.orderdetailUrl + '/' + orderid,
      method: 'GET',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      login: true,
      successFun: function (res) {
        var createDate = res.data.data.createDate;
        var createmyDate = new Date(createDate);
        var createTime = createmyDate.getTime();
        var timestamp = Date.parse(new Date());//获取当前时间戳
        var totalSecond = (timestamp - createTime) / 1000;
        var interval = setInterval(function () {
          // 秒数  
          var second = totalSecond;

          // 天数位  
          var day = Math.floor(second / 3600 / 24);
          var dayStr = day.toString();
          if (dayStr.length == 1) dayStr = '0' + dayStr;

          // 小时位  
          var hr = Math.floor((second - day * 3600 * 24) / 3600);
          var hrStr = hr.toString();
          if (hrStr.length == 1) hrStr = '0' + hrStr;

          // 分钟位  
          var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
          var minStr = min.toString();
          if (minStr.length == 1) minStr = '0' + minStr;

          // 秒位  
          var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
          var secStr = sec.toString();
          if (secStr.length == 1) secStr = '0' + secStr;

          that.setData({
            countDownDay: dayStr,
            countDownHour: hrStr,
            countDownMinute: minStr,
            countDownSecond: secStr,
          });
          totalSecond--;
          if (totalSecond < 0) {
            clearInterval(interval);
            // wx.showToast({
            //   title: '活动已结束',
            // });
            that.setData({
              countDownDay: '00',
              countDownHour: '00',
              countDownMinute: '00',
              countDownSecond: '00',
            });
          }
        }.bind(that), 1000);
        that.setData(res.data.data)
      }
    });
  },
  //查看物流信息
  logistics: function (e) {
    wx.redirectTo({
      url: '../logistics/logistics' + '?orderid=' + orderid,
    })
  },
  //立即付款
  payment: function (e) {
    var that = this;
    var orderid = e.currentTarget.dataset.orderid
    common.commonRequest({
      url: config.weixinPayUrl,
      method: 'POST',
      data: {
        orderId: orderid
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      login: true,
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
            wx.showToast({
              title: "支付成功",
              icon: 'loading',
              mask: true
            })
            wx.switchTab({
              url: '../order/order',
            })
          },
          'fail': function (res) {

          },
          'complete': function (res) {

          }
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

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

  },
  //拨打电话
  calling: function () {
    wx.makePhoneCall({
      phoneNumber: '400-880-1889',
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
})