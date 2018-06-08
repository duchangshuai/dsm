// pages/commission/commission.js
var config = require('../../config.js');
var common = require('../../common.js');
var pageSize = 15;
var pageNumber = 1;
var titleShow;
var code;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemlist: [],
    memberAccount: 0,
    withdrawAccount: 0,
    withdraw: false,
    HomeIndex: 1,
    phone: '获取手机号'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    pageNumber = 1;
    this.getData();
  },
  //加载更多
  onReachBottom: function () {
    this.getData();
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    var that = this;
    setTimeout(function () {
      pageNumber = 1;
      that.data.itemlist = [];
      that.getData();
    }, 300);
  },
  withdraw: function (e) {
    var count = e.currentTarget.dataset.withdarw;
    if (count > 0) {
      var that = this;
      //这个code是为了解密手机号使用
      wx.login({
        success: function (res) {
          if (res.code) {
            code = res.code;
          } else {
            wx.showToast({
              title: '获取code失败',
              icon: 'none'
            })
          }
        }
      });
      var animation = wx.createAnimation({  // 创建一个动画实例
        duration: 500,   // 动画持续时间
        timingFunction: 'linear' // 定义动画效果，当前是匀速
      })
      that.animation = animation  // 将该变量赋值给当前动画
      animation.translateY(200).step()  // 先在y轴偏移，然后用step()完成一个动画
      that.setData({
        animationData: animation.export(),  // 通过export()方法导出数据
        withdraw: true
      })

      // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
      setTimeout(function () {
        animation.translateY(0).step()
        that.setData({
          animationData: animation.export()
        })
      }, 200)
    } else {
      wx.showToast({
        title: '可提现金额为零',
        icon: 'none',
        duration: 2000
      })
    }


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
        withdraw: false
      })
    }, 200)
  },
  commissionWidthdraw: function (e) {
    var count = e.currentTarget.dataset.withdarw;
    var myphone = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (e.detail.value.realName == "") {
      wx.showToast({
        title: '真实姓名不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (e.detail.value.alipayAccount == "") {
      wx.showToast({
        title: '支付宝账号不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (e.detail.value.phone == "") {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (!myreg.test(e.detail.value.alipayAccount) && !myphone.test(e.detail.value.alipayAccount)) {
      wx.showToast({
        title: '支付宝账号格式不正确',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var that = this;
    common.commonRequest({
      url: config.withdrawUrl,
      method: "POST",
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        realName: e.detail.value.realName,
        alipayAccount: e.detail.value.alipayAccount,
        phone: e.detail.value.phone
      },
      successFun: function (res) {
        console.log(res)
        wx.showToast({
          title: '提现成功',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          withdraw: false
        })
        pageNumber = 1;
        that.data.itemlist = [];
        that.getData();
      },
      fail: function (res) {
        wx.showToast({
          title: '提现失败',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          withdraw: false
        })
      }
    });
  },
  getPhoneNumber: function (e) {   
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      return;
    }
    var that = this;
    var encryptedData = e.detail.encryptedData;
    var iv = e.detail.iv;
    common.commonRequest({
      url: config.phoneUrl,
      method: "POST",
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        code: code,
        encryptedData: encryptedData,
        iv: iv
      },
      successFun: function (res) {
        var phone = res.data.data;
        if (phone != '' && phone != null) {
          that.setData({
            phone: res.data.data
          })
        }

      }
    })
  },
  getData: function () {
    var that = this;
    common.commonRequest({
      url: config.commissionUrl + '?pageNumber=' + pageNumber + '&pageSize=' + pageSize,
      method: "GET",
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      successFun: function (res) {
        var list = res.data.data.detail;
        var itemlist = that.data.itemlist;
        var loadMoreData;
        if (list.length == pageSize) {
          loadMoreData = "加载更多";
        } else {
          loadMoreData = "已经到底了……";
        }
        if (list.length > 0) {
          for (var index in list) {
            var sjc = list[index].paidDate;
            var paidDate = '';
            if (sjc != null) {
              var paidDate = common.formatTime(sjc, 'Y/M/D h:m:s')
            }
            list[index].paidDate = paidDate;
            itemlist.push(list[index])
          }
          that.setData({
            phone: res.data.data.phone,
            list: res.data.data.detail,
            memberAccount: res.data.data.memberAccount,
            withdrawAccount: res.data.data.withdrawAccount,
            itemlist: itemlist,
            titleShow: true,
            loadMoreData: loadMoreData,
            hideBottom: false
          });
          pageNumber++;
        } else {
          that.setData({
            loadMoreData: "已经到底了……",
            hideBottom: false
          })
        }
      }
    })
  }
})