var config = require('../../config.js');
var common = require('../../common.js');
var app = getApp();
var itemId;
var selectStockQuantity;
var p = 0, c = 0, d = 0;
var skuidList = [];
var options;
var title = app.globalData.title;
var imageUrl;
Page({
  data: {
    skuidList: [],
    HomeIndex: 0,
    swiperCurrent: 0,
    circular: true,
    vertical: false,
    autoplay: true,
    interval: 2000,
    duration: 500,
    circular: true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    price: '',
    title: '',
    addCart: false,
    gopayCart: false,
    animationData: {},
    userInfo: {},
    hasUserInfo: false,
    showMessage: false,
    messageContent: '',
    showDistpicker: false,
    num: "",  //数量初始化
    cutNumImg: false,
    minStatus: "jian-active",
    _color: 0 //商品属性选择
  },
  onLoad: function (opt) {
    wx.showShareMenu({
      withShareTicket: true
    });
    options = opt;
    if (options != undefined && options.shareId != undefined && options.shareId != '') {
      wx.setStorageSync("shareId", options.shareId);
    }
    itemId = opt.id;

    var that = this;
    currentTab: 0;
    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    common.commonRequest({
      url: config.detailUrl + itemId,
      method: 'GET',
      successFun: function (res) {
        var skuList = res.data.data.skuList;
        var salePrice;
        var title;
        var selectColor;
        var selectPic;
        var cartSkuId;
        var skuName;
        for (var index in skuList) {
          if (skuList[index].selected == 1) {
            salePrice = skuList[index].salePrice / 100.00;
            selectColor = skuList[index].skuId;
            selectPic = skuList[index].skuPic;
            cartSkuId = skuList[index].skuId;
            selectStockQuantity = skuList[index].stockQuantity;
            title = res.data.data.itemName;
            skuName = skuList[index].skuName;
          }
        }
        that.setData({
          carousel: res.data.data.carouselPicList,
          itemName: title,
          price: salePrice,
          selectPrice: salePrice,
          selectSkuName: skuName,
          selectStockQuantity: selectStockQuantity,
          detailPicList: res.data.data.detailPicList,
          skuList: skuList,
          _color: selectColor,
          selectPic: selectPic,
          cartSkuId: cartSkuId
        })
        if (selectStockQuantity == 0) {
          that.setData({
            num: 0
          })
        } else {
          that.setData({
            num: 1
          })
        }
      }
    });
    common.commonShare(
      {
        type: 101,
        itemId: itemId
      },
      function (res) {
        if (res.data.data != null) {
          title = res.data.data.title;
          imageUrl = res.data.data.pic
        }
      }
    );
  },
  //商品属性选择
  clickColor: function (e) {
    var skuProp = e.target.dataset;
    this.setData({
      selectPrice: skuProp.skuprice,
      selectSkuName: skuProp.skuname,
      selectStockQuantity: skuProp.stockquantity,
      _color: skuProp.skuid,
      selectPic: skuProp.skupic,
      cartSkuId: skuProp.skuid
    })
  },
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  bindChange: function (e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },
  // 弹出购物车
  cart: function () {

    wx.redirectTo({
      url: '../detailCart/detailCart'
    })

  },
  addCart: function (e) {
    var that = this;
    var animation = wx.createAnimation({  // 创建一个动画实例
      duration: 500,  // 动画持续时间
      timingFunction: 'linear'   // 定义动画效果，当前是匀速
    })
    that.animation = animation  // 将该变量赋值给当前动画
    animation.translateY(200).step()   // 先在y轴偏移，然后用step()完成一个动画
    that.setData({
      animationData: animation.export(),  // 通过export()方法导出数据
      addCart: true
    })
    setTimeout(function () {    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
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
  // 点击购物车里面加减
  add: function (e) {
    var num = this.data.num;
    if (num < selectStockQuantity) {
      num++
      var minStatus = num < 1 ? 'jian-active' : 'jian';
      this.setData({
        num: num,
        minStatus: minStatus
      })
    } else {
      this.setData({
        num: selectStockQuantity
      })
      wx.showModal({
        content: "亲，已达到库存上限!",
        showCancel: false,
        confirmText: "确定"
      })
    }
    this.setData({
      // num:num,
      cutNumImg: true,
    })
  },
  remove: function () {
    var num = this.data.num;
    if (num > 1) {
      num--;
      var minStatus = num <= 1 ? 'jian-active' : 'jian';
      this.setData({
        cutNumImg: false,
        num: num,
        minStatus: minStatus
      })
    } else {
      this.setData({
        cutNumImg: true,
        num: num
      })
      wx.showModal({
        content: "亲，不能再减少了哦!",
        showCancel: false,
        confirmText: "确定"
      })
    }
    this.setData({
      num: num
    })
  },
  //加入购物车
  addcart1: function (e) {
    var that = this;
    if (options != undefined && options.shareId != undefined) {
      if (wx.getStorageSync("shareId") == undefined || wx.getStorageSync("shareId") == '') {
        wx.setStorageSync("shareId", options.shareId);
      }
    }
    if (wx.getStorageSync("sessionId") == undefined || wx.getStorageSync("sessionId") == '') {
      common.doLogin(function () {
        that.addCartForLogin(e);
      });
    } else {
      that.addCartForLogin(e);
    }
  },
  addCartForLogin(e) {
    if (selectStockQuantity == 0) {
      wx.showToast({
        title: "商品库存为0",
        duration: 2000,
        icon: "loading"
      })
      return;
    }
    var skuidList = [];
    var cartItems = [];
    var skuid = e.currentTarget.dataset.id;
    var skuid = e.currentTarget.dataset.id;
    var cartItems = wx.getStorageSync("cartItems") || []
    var exist = cartItems.find(function (el) {
      return el.id == e.target.dataset.id
    })

    var that = this;
    var quantity = that.data.num;
    var platform;
    wx.getSystemInfo({
      success: function (res) {
        platform = res.model;
      }
    })
    common.commonRequest({
      url: config.cartAddUrl,
      method: 'POST',
      data: {
        skuId: skuid,
        quantity: quantity,
        platform: platform
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      login: true,
      successFun: function (res) {
        wx.showToast({
          title: "加入购物车成功",
          duration: 1000
        })
        that.hideModal();
      }
    });
  },
  gopay: function (e) {
    var that = this;
    var animation = wx.createAnimation({  // 创建一个动画实例
      duration: 500,  // 动画持续时间
      timingFunction: 'linear'   // 定义动画效果，当前是匀速
    })
    that.animation = animation  // 将该变量赋值给当前动画
    animation.translateY(200).step()   // 先在y轴偏移，然后用step()完成一个动画
    that.setData({
      animationData: animation.export(),  // 通过export()方法导出数据
      gopayCart: true
    })
    setTimeout(function () {    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 200)
  },
  hideModal1: function (e) {
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
        gopayCart: false
      })
    }, 200)
  },
  // 立即购买
  gopay1: function (e) {
    var cartSkuId = e.target.dataset.id;
    var quantity = this.data.num;
    this.hideModal1();
    wx.redirectTo({
      url: '../account/account' + '?skuid=' + cartSkuId + '&quantity=' + quantity,
    })
  },
  //页面内转发
  onShareAppMessage: function (res) {
    var that = this;
    var dsmToken = wx.getStorageSync("dsmToken");
    var path = '/pages/detail/detail' + '?id=' + itemId;
    if (dsmToken != undefined) {
      path = path + "&shareId=" + dsmToken;
    }
    return {
      title: title,
      path: path,
      imageUrl: imageUrl,
      success: function (res) {
        // 转发成功
        var shareTickets = res.shareTickets;
        if (shareTickets != undefined) {
          wx.login({
            success: function (r) {
              if (r.code) {
                that.postGroup(r.code, shareTickets[0]);
              }
            }
          })
        }
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  postGroup: function (code, shareTicket) {
    //获取分享的群信息
    wx.getShareInfo({
      shareTicket: shareTicket,
      success: function (res) {
        if (res.encryptedData) {
          common.commonRequest({
            url: config.gropPostUrl,
            method: 'POST',
            data: {
              code: code,
              encryptedData: res.encryptedData,
              iv: res.iv
            },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            login: true,
            successFun: function (res) { }
          });
        }
      }
    });
  },
  goIndex: function (e) {
    wx.switchTab({
      url: '../index/index'
    })
  },
  // 轮播样式滑动
  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  }
})
