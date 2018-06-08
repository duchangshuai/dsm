var area = {};
var p = 0, c = 0, d = 0;
var isSelected;
var config = require('../../config.js');
var common = require('../../common.js');
var addressId;
// var addressDefault;
Page({
  data: {
    provinceName: [],
    provinceCode: [],
    provinceSelIndex: '',
    cityName: [],
    cityCode: [],
    citySelIndex: '',
    districtName: [],
    districtCode: [],
    districtSelIndex: '',
    showMessage: false,
    messageContent: '',
    showDistpicker: false
  },
  onLoad: function (options) {
    // 初始化数据
    addressId = options.addressId;
    isSelected = options.addressDefault;
    var that = this;
    common.commonRequest({
      url: config.areaUrl,
      method: "GET",
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      successFun: function (res) {
        area = res.data.data;
        that.setAreaData();
        common.commonRequest({
          url: config.getAddressByIdUrl + '?addressId=' + addressId,
          method: "GET",
          login: true,
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          successFun: function (res) {
            that.setData(res.data.data);
          }
        })
      }
    })
  },
  setAreaData: function (p, c, d) {
    var p = p || 0 // provinceSelIndex
    var c = c || 0 // citySelIndex
    var d = d || 0 // districtSelIndex
    // 设置省的数据
    var province = area['100000']
    var provinceName = [];
    var provinceCode = [];
    for (var item in province) {
      provinceName.push(province[item])
      provinceCode.push(item)
    }
    this.setData({
      provinceName: provinceName,
      provinceCode: provinceCode[p]
    })
    // 设置市的数据
    var city = area[provinceCode[p]]
    var cityName = [];
    var cityCode = [];
    for (var item in city) {
      cityName.push(city[item])
      cityCode.push(item)
    }
    this.setData({
      cityName: cityName,
      cityCode: cityCode[c]
    })
    // 设置区的数据
    var district = area[cityCode[c]]
    var districtName = [];
    var districtCode = [];
    for (var item in district) {
      districtName.push(district[item])
      districtCode.push(item)
    }
    this.setData({
      districtName: districtName,
      districtCode: districtCode[d]
    })
  },
  changeArea: function (e) {
    p = e.detail.value[0]
    c = e.detail.value[1]
    d = e.detail.value[2]
    this.setAreaData(p, c, d)
  },
  showDistpicker: function () {
    this.setAreaData(0, 0, 0);
    this.setData({
      showDistpicker: true
    })
  },
  distpickerCancel: function () {
    this.setData({
      showDistpicker: false
    })
  },
  distpickerSure: function () {
    this.setData({
      provinceSelIndex: p,
      citySelIndex: c,
      districtSelIndex: d
    })
    this.distpickerCancel()
  },
  showMessage: function (text) {
    var that = this
    that.setData({
      showMessage: true,
      messageContent: text
    })
    setTimeout(function () {
      that.setData({
        showMessage: false,
        messageContent: ''
      })
    }, 3000)
  },
  checkboxChange: function (e) {
    isSelected = e.detail.value.length;
  },
  //确认新增
  savePersonInfo: function (e) {
    var that = this;
    var flag = false;
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (e.detail.value.consigneeName == "") {
      wx.showToast({
        title: '请填写收货人',
        icon: 'loading',
        mask: true
      })
    } else if (e.detail.value.consigneePhone == "") {
      wx.showToast({
        title: '请输入手机号',
        icon: 'loading',
        mask: true
      })
    } else if (!myreg.test(e.detail.value.consigneePhone)) {
      wx.showToast({
        title: '手机号码有误',
        icon: 'loading',
        mask: true
      })
    } else if (e.detail.value.province == "") {
      wx.showToast({
        title: '请选择地区',
        icon: 'loading',
        mask: true
      })
    } else if (e.detail.value.address == "") {
      wx.showToast({
        title: '请输入地址',
        icon: 'loading',
        mask: true
      })
    } else {
      flag = true;
      common.commonRequest({
        url: config.editAddressUrl,
        method: 'post',
        login: true,
        header: {
          "Content-Type": "application/json",
        },
        data: {
          "consigneeName": e.detail.value.consigneeName,
          "consigneePhone": e.detail.value.consigneePhone,
          "provinceId": e.detail.value.provinceCode,
          "cityId": e.detail.value.cityCode,
          "districtId": e.detail.value.districtCode,
          "address": e.detail.value.address,
          "addressDefault": isSelected,
          "addressId": addressId,
        },
        successFun: function (res) {
          wx.redirectTo({
            url: '../manageaddress/manageaddress',
          })
        }
      })
    }
  }
})