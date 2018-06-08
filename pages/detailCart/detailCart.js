//数据 
var config = require('../../config.js');
var common = require('../../common.js');
var cartItems = [];
var isSelected = "";
var value = 0;
var app = getApp();
var stockQuantity;
var options;
Page({
  data: {
    boolean: false,
    cartItems: [],
    sum1: "",
    value: 0,
    cartId: [],
    quantity: "",
    total: 0,
    delBtnWidth: '100rpx',
    index: 0,
    showView: true,
    editStyle: false, //编辑，完成
    cutNumImg: true,  //减法图片改变
    deleteStyle: true,//选中时是删除还是计算总价
    txtStyle: "",
    startX: 0, //开始坐标
    startY: 0,
    isTouchMove: false,
    minStatuses: []
  },
  onChangeShowState: function () {
    var editStyle;
    var that = this;
    var value = !that.data.editStyle;
    that.setData({
      showView: (!that.data.showView),
      editStyle: value,
    })
    that.getsumTotal()
  },
  onLoad: function (opt) {

    options = opt;

  },
  getData: function (e) {
    var that = this;
    var CheckAll = that.data.CheckAll;
    var minStatuses = [];
    // 请求购物车列表
    common.commonRequest({
      url: config.cartListrUrl,
      method: "GET",
      login: true,
      header: {
        "Content-Type": "application/json",
      },
      successFun: function (res) {
        var CheckAll = true;
        for (var i = 0; i < res.data.data.length; i++) {
          if (!res.data.data[i].isSelected) {
            CheckAll = false;
          }
        }
        var cartItems = res.data.data   //获取购物车列表   
        for (var i = 0; i < cartItems.length; i++) {
          var quantity = cartItems[i].quantity  //获取购物车里面当前点击的数量 
          var minStatus = quantity <= 1 ? 'jian-active' : 'jian';
          var minStatuses = that.data.minStatuses;
          minStatuses[i] = minStatus;
          that.setData({
            cartItems: cartItems,
            minStatuses: minStatuses
          })
        }
        that.setData({
          cartItems: res.data.data,
          CheckAll: CheckAll
        })
        that.getsumTotal()
        if (res.data.data.length == 0) {
          var CheckAll = false;
          that.setData({
            CheckAll: CheckAll,
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
  onShow: function (e) {
    var that = this;
    if (options != undefined && options.shareId != undefined) {
      if (wx.getStorageSync("shareId") == undefined || wx.getStorageSync("shareId") == '') {
        wx.setStorageSync("shareId", options.shareId);
      }
    }
    if (!common.haveLogin()) {
      common.doLogin(function () {
        that.getData(options);
      });
    } else {
      that.getData(options);
    }
  },
  onHide: function () {
  },
  //全部选择
  select: function (e) {
    // 向后台发送全选请求
    var CheckAll = this.data.CheckAll;
    CheckAll = !CheckAll
    var cartItems = this.data.cartItems;
    var that = this;
    if (CheckAll == true) {
      common.commonRequest({
        url: config.cartAllUrl,
        method: 'DELETE',
        login: true,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {},
        successFun: function (res) {
          for (var i = 0; i < cartItems.length; i++) {
            cartItems[i].isSelected = CheckAll
          }
          that.setData({
            cartItems: cartItems,
            CheckAll: CheckAll
          })
          that.getsumTotal()
        }
      })
    } else {
      common.commonRequest({
        url: config.disSelectedUrl,
        method: 'DELETE',
        login: true,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {},
        successFun: function (res) {
          for (var i = 0; i < cartItems.length; i++) {
            cartItems[i].isSelected = CheckAll
          }
          that.setData({
            cartItems: cartItems,
            CheckAll: CheckAll
          })
          that.getsumTotal()
        }
      })
    }
  },
  //数量加
  add: function (e) {
    var that = this;
    var cartId = e.currentTarget.dataset.cartid;
    var cartItems = that.data.cartItems   //获取购物车列表   
    var index = e.currentTarget.dataset.index //获取当前点击事件的下标索引
    var quantity = cartItems[index].quantity  //获取购物车里面的value值
    var stockQuantity = cartItems[index].stockQuantity
    if (quantity < stockQuantity) {
      quantity++
      cartItems[index].quantity = quantity;
      var minStatus = quantity <= 1 ? 'jian-active' : 'jian';
      var minStatuses = that.data.minStatuses;
      minStatuses[index] = minStatus;
      that.setData({
        cartItems: cartItems,
        minStatuses: minStatuses
      })
    } else {
      cartItems[index].quantity = stockQuantity;
      wx.showModal({
        content: "亲，已达到最大库存!",
        showCancel: false,
        confirmText: "确定"
      })
    }   
    //向后台发送加法请求
    var that = this;
    common.commonRequest({
      url: config.updateQtyUrl,
      method: 'PUT',
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        cartId: cartId,
        quantity: quantity
      },
      successFun: function (res) {
        that.setData({
          cartItems: cartItems
        });
        that.getsumTotal();
      }
    })
  },
  //减
  reduce: function (e) {
    var that = this;
    var cartId = e.currentTarget.dataset.cartid;
    var cartItems = that.data.cartItems   //获取购物车列表
    var index = e.currentTarget.dataset.index //获取当前点击事件的下标索引
    var quantity = cartItems[index].quantity  //获取购物车里面的value值
    var stockQuantity = cartItems[index].stockQuantity
    if (quantity == stockQuantity == 0) {
      cartItems[index].quantity = 0;
    }
    if (quantity > 1) {
      quantity--;
      cartItems[index].quantity = quantity;
      var minStatus = quantity <= 1 ? 'jian-active' : 'jian';
      var minStatuses = that.data.minStatuses;
      minStatuses[index] = minStatus;
      that.setData({
        cartItems: cartItems,
        minStatuses: minStatuses
      })
    } else {
      cartItems[index].quantity = quantity;
      wx.showModal({
        content: "亲，不能再减少了哦!",
        showCancel: false,
        confirmText: "确定"
      })
    }
    //向后台发送减法请求
    common.commonRequest({
      url: config.updateQtyUrl,
      method: 'PUT',
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        cartId: cartId,
        quantity: quantity
      },
      successFun: function (res) {
        that.setData({
          cartItems: cartItems
        });
        that.getsumTotal()
      }
    })
  },

  // 单个选择
  selectedCart: function (e) {
    var that = this;
    var cartId = e.currentTarget.dataset.cartid;
    var cartItems = this.data.cartItems   //获取购物车列表
    var index = e.currentTarget.dataset.index;  //获取当前点击事件的下标索引
    var isSelected = cartItems[index].isSelected;    //获取当前选中的值 
    var stockQuantity = cartItems[index].stockQuantity
    //取反
    cartItems[index].isSelected = !isSelected;
    isSelected = cartItems[index].isSelected;
    that.setData({
      cartItems: cartItems
    })
    // 判断库存是否为0
    if (stockQuantity == 0) {
      isSelected = false;
    }
    this.setData({
      isSelected: isSelected
    })
    that.getsumTotal();
    // wx.setStorageSync("cartItems", cartItems)
    if (isSelected == true) {
      isSelected = 1
    } else {
      isSelected = 0
    }
    //购物车商品选择
    common.commonRequest({
      url: config.cartSelectUrl,
      method: 'PUT',
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        cardId: cartId,
        selected: isSelected
      },
      successFun: function (res) {
        var CheckAll = true;
        for (var i = 0; i < cartItems.length; i++) {
          if (!cartItems[i].isSelected) {
            CheckAll = false;
          }
        }
        that.setData({
          CheckAll: CheckAll
        })
        that.getsumTotal()
      }
    })
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    var value = this.data.showView;
    //开始触摸时 重置所有删除
    if (value == false) {
      this.data.cartItems.forEach(function (v, i) {
        if (v.isTouchMove)//只操作为true的
          v.isTouchMove = false;
      })
      this.setData({
        startX: e.changedTouches[0].clientX,
        startY: e.changedTouches[0].clientY,
        cartItems: this.data.cartItems
      })
    }
  },

  //滑动事件处理
  touchmove: function (e) {
    var value = this.data.showView;
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    if (value == false) {
      that.data.cartItems.forEach(function (v, i) {
        v.isTouchMove = false
        //滑动超过30度角 return
        if (Math.abs(angle) > 30) return;
        if (i == index) {
          if (touchMoveX > startX) //右滑
            v.isTouchMove = false
          else //左滑
            v.isTouchMove = true
        }
      })
      //更新数据
      that.setData({
        cartItems: that.data.cartItems
      })
    }
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除
  deleteCart: function (e) {
    var cartId = e.currentTarget.dataset.cartid;
    var cartItems = this.data.cartItems  //获取购物车列表
    var index = e.currentTarget.dataset.index  //获取当前点击事件的下标索引
    cartItems.splice(index, 1);
    if (cartItems.length == 0) {
      var CheckAll = false;
      this.setData({
        CheckAll: CheckAll,
        boolean: false
      })
    }
    this.setData({
      cartItems: cartItems
    });
    var that = this;
    common.commonRequest({
      url: config.cartDeletetUrl,
      method: "POST",
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        cardId: cartId,
        _method: 'DELETE'
      },
      successFun: function (res) {
        that.getsumTotal();
      }
    })
  },
  //提示
  go: function (e) {
    var that = this;
    common.commonRequest({
      url: config.cartClearUrl,
      method: "DELETE",
      login: true,
      header: {
        "Content-Type": "application/json",
      },
      data: {},
      successFun: function (res) {
        that.setData({
          cartItems: [],
          boolean: false
        })
      }
    })
    var CheckAll = false;
    this.setData({
      CheckAll: CheckAll
    })
    this.getsumTotal()
  },
  //合计
  getsumTotal: function () {
    var sum = 0;
    var sum1 = 0;
    var cartItems = this.data.cartItems;
    if (cartItems.length != 0) {
      for (var i = 0; i < this.data.cartItems.length; i++) {
        if (this.data.cartItems[i].isSelected) {
          sum += this.data.cartItems[i].quantity * this.data.cartItems[i].salePrice
        }
        var sum1 = sum / 100.00;
      }
      // 更新数据
      this.setData({
        total: sum1
      })
    } else {
      // 更新数据
      this.setData({
        total: 0
      })
    }

  },
  //去结算
  goPay: function (e) {
    var haveNoSelected = true
    for (var i = 0; i < this.data.cartItems.length; i++) {
      if (this.data.cartItems[i].isSelected) {
        haveNoSelected = false;
      }
    }
    if (haveNoSelected) {
      wx.showToast({
        title: "请先选择商品",
        icon: 'loading',
        mask: true
      })
    } else {
      wx.navigateTo({
        url: '../account/account'
      })
    }
  },
  // 跳转首页
  goIndex: function (e) {
    wx.switchTab({
      url: '../index/index'
    })
  },
  // 购物车列表跳转详情页
  btn: function (e) {
    var HomeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../detail/detail?id=' + HomeId,
    })
  },
  //点击数字时阻止跳转
  reduce1: function () {

  }
})