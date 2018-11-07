import newData from '../../utils/DataURL.js';
var conf = require('../../config');
var app = getApp();
// pages/order/detail.js
Page({
  data: {
    shopData:{},
    orderId: 0,
    orderData: {},
    pastOrder:{}
  },
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
    })
    this.loadOrder();
    this.loadShop(options)
    this.loadPastList(options)
  },
  loadShop: function (options){
    let that = this;
    let url = conf.shopUrl + options.shopId;
    let param = {
      API_URL: url,
    };
    newData.result(param).then(res => {
      that.setData({
        shopData: res.data
      });
      console.log(res.data)
    })
  },
  loadOrder: function () {
    let that = this;
    let url = conf.orderUrl + that.data.orderId;
    let param = {
      API_URL: url,
    };

    newData.result(param).then(res => {
      that.setData({
        orderData: res.data
      });
      console.log(res.data)
    })
  },
  loadPastList: function (options) {
    let that = this;
    let data = {};
    data.phone = options.phone;
    console.log(options.phone)
    let param = {
      API_URL: conf.orderPastUrl,
      method: "POST",
      data: data
    };
    newData.result(param).then(res => {
      that.setData({
        pastOrder: res.data
      });
      console.log(res.data)
    })
  },
  makePhoneCall: function (e) {
    wx.makePhoneCall({
      phoneNumber: this.data.orderData.phone
    })
  },
  openLocation: function (e) {
    let self = this;
    wx.openLocation({
      latitude: Number(this.data.orderData.latitude),
      longitude: Number(this.data.orderData.longitude),
      scale: 17,
      name: this.data.orderData.name,
      address: this.data.orderData.address
    })

  },

})