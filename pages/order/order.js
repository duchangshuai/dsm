var config = require('../../config.js');
var common = require('../../common.js');
var type = 1;
var reason = "";
var cancelOrderId = 0;
var isNull = false;
var couponshow;
var options;
Page({
  /** 
   * 页面的初始数据 
   */
  data: {
    HomeIndex: 1,
    winWidth: 0,
    winHeight: 0,
    currentNavtab: 0,
    addCart: false,
    animationData: {},
    item: [
      { 'orderdetail': '订单不能按预计时间送达' },
      { 'orderdetail': '操作有误（商品、地址等选错）' },
      { 'orderdetail': '重复下单 / 误下单' },
      { 'orderdetail': '其他渠道价格更低' },
      { 'orderdetail': '不想买了' },
      { 'orderdetail': '其他原因' },
    ],
    imageList: [],
  },
  onLoad: function (opt) {
    options = opt;
  },
  initData: function () {
    var that = this;
    common.commonRequest({
      url: config.orderListrUrl + '/' + type,
      method: 'GET',
      login: true,
      successFun: function (res) {
        var couponList = res.data.data;
        if (res.data.data == "") {
          that.setData({
            isNull: true
          });
        } else {
          that.setData({
            isNull: false
          });
        };
        that.setData({
          list: res.data.data,
          couponshow: couponshow
        });
      }
    });
  },
  onShow: function (options) {
    couponshow = true;
    // 生命周期函数--监听页面加载
    var that = this;
    if (options != undefined && options.shareId != undefined) {
      if (wx.getStorageSync("shareId") == undefined || wx.getStorageSync("shareId") == '') {
        wx.setStorageSync("shareId", options.shareId);
      }
    }
    if (!common.haveLogin()) {
      common.doLogin(function () {
        that.initData();
      });
    } else {
      that.initData();
    }
  },
  boxtwo: function (o) {
    var that = this;
    var idx = o.currentTarget.dataset.index;
    if (idx !== that.data.currentNavtab) {
      that.setData({
        currentNavtab: idx,
        HomeIndex: idx
      })
      type = idx;
      that.initData();
    }
  },
  reasonSelect: function (e) {
    reason = e.detail.value;
  },
  cancelOrder: function (e) {
    var that = this;
    reason = "";
    cancelOrderId = e.currentTarget.dataset.orderid;
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
  tijiao: function (e) {
    var that = this;
    if (reason == "" || cancelOrderId == 0) {
      wx.showToast({
        title: "请选择取消原因",
        icon: 'loading',
        mask: true
      })
      return;
    }
    //取消订单接口
    common.commonRequest({
      url: config.ordercancelUrl + '/' + cancelOrderId,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        reason: reason
      },
      login: true,
      successFun: function (res) {
        wx.showToast({
          title: "取消订单成功",
          icon: 'loading',
          mask: true
        })
        that.initData();
      }
    });
    this.setData({
      addCart: false,
      //HomeIndex: index
    })
  },
  //订单详情
  orderdetail: function (e) {
    wx.navigateTo({
      url: '../orderdetail/orderdetail?orderid=' + e.currentTarget.dataset.orderid,
    })
  },
  //立即付款
  gopay: function (e) {
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
        var that = this;
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
    });
  },
  //确认收货
  Confirm: function (e) {
    var orderid = e.currentTarget.dataset.orderid
    var that = this;
    common.commonRequest({
      url: config.confirmUrl + "/" + orderid,
      method: "POST",
      login: true,
      successFun: function (res) {
        wx.showToast({
          title: "确认成功",
        })
        that.initData();
      }
    })
  },
  //上传图片
  uploadpicture: function (e) {
    wx.navigateTo({
      url: '../uploadpicture/uploadpicture?orderid=' + e.currentTarget.dataset.orderid,
    })
  }
})