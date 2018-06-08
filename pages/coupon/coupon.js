var type = 1;
var config = require('../../config.js');
var common = require('../../common.js');
var app = getApp();
var userid;
var bool;
var imageUrl = '../../images/kind/redpacket.png';
var title = "送您德施曼官方微商城{0}元红包，快来领取吧";
Page({
  /** 
   * 页面的初始数据 
   */
  data: {
    HomeIndex: 1,
    tips: '无数据',
    navTab: ["未使用", "已使用", "已过期", "全部优惠券"],
    couponNum: 1,
    hidden: true
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    common.commonShare(
      {
        type: 102
      },
      function (res) {
        if (res.data.data != null) {
          title = res.data.data.title;
          imageUrl = res.data.data.pic
        }
      }
    )
  },
  onShow: function () {
    this.getData();
    this.setData({
      HomeIndex: type,
    });
  },
  getData: function () {
    var that = this;
    common.commonRequest({
      url: config.couponListByUserUrl + '?type=' + type,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      login: true,
      successFun: function (res) {
        userid = res.data.data.userId;
        that.setData({
          list: res.data.data.list
        });
        if (res.data.data.list.length == 0) {
          that.setData({
            bool: false
          })
        } else {
          that.setData({
            bool: true
          })
        }
      }
    })
  },
  switchTab: function (o) {
    var that = this;
    var idx = o.currentTarget.dataset.idx;
    if (idx !== that.data.currentNavtab) {
      type = idx;
      that.getData();
    }
  },
  boxtwo: function (o) {
    var that = this;
    var idx = o.currentTarget.dataset.index;
    if (idx !== that.data.currentNavtab) {
      that.setData({
        HomeIndex: idx
      })
      type = idx;
      that.getData();
    }
  },
  onShareAppMessage: function (res) {
    var id = res.target.dataset.id;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      var amount = res.target.dataset.amount;
      return {
        // title: '送您德施曼官方微商城' + amount + "元红包，快来领取吧",
        title: common.format(title, [amount]),
        path: '/pages/receive/receive' + '?userid=' + userid + '&cuponid=' + id,
        imageUrl: imageUrl,
        success: function (res) {
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }   
  }
})