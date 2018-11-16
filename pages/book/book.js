import newData from '../../utils/DataURL.js';
var conf = require('../../config');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    shopList: [],
    meta: [],
    inputShowed: false,
    inputVal: "",
    loading:false,
    location:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.setData({
      location:wx.getStorageSync('location')
    })
    this.loadShopList()
  },
  loadShopList: function() {
    let that = this;
    let data = {};
    if (wx.getStorageSync('location')){
      data.latitude = wx.getStorageSync('location').location.lat;
      data.longitude = wx.getStorageSync('location').location.lng;
    }
    let param = {
      API_URL: conf.shopNearUrl,
      method: "POST",
      data: data
    };
    newData.result(param).then(res => {
      if (res.data.status_code != 401) {
        that.setData({
          shopList: res.data.data,
          meta: res.data.meta
        });
      }

    })
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.loadShopList()
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.loadShopList()
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    let that = this;
    let data = {};
    if (wx.getStorageSync('location')) {
      data.latitude = wx.getStorageSync('location').location.lat;
      data.longitude = wx.getStorageSync('location').location.lng;
    }
    data.queryText = e.detail.value
    let param = {
      API_URL: conf.shopQuery,
      method: "POST",
      data: data
    };
    newData.result(param).then(res => {
      console.log(res.data)
      if (res.data.status_code != 401) {
        that.setData({
          shopList: res.data.data,
          meta: res.data.meta
        });
      }

    })
    this.setData({
      inputVal: e.detail.value
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    this.loadShopList()
    // 隐藏加载框
    wx.hideLoading();
    // 隐藏导航栏加载框  
    wx.hideNavigationBarLoading();
    // 停止下拉动作  
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    that.setData({
      loading: true
    });
    let page = that.data.meta.current_page;
    console.log(that.data.meta.path)
    if (page < that.data.meta.last_page) {
      let data = {};
      if (wx.getStorageSync('location')) {
        data.latitude = wx.getStorageSync('location').location.lat;
        data.longitude = wx.getStorageSync('location').location.lng;
      }
      let param = {
        API_URL: conf.shopNearUrl + '?page=' + (page + 1),
        method: "POST",
        data: data
      };
      newData.result(param).then(res => {
        console.log(res.data)
        let shopListData = that.data.shopList.concat(res.data.data)
        that.setData({
          shopList: shopListData,
          meta: res.data.meta,
          loading: false
        });
      })
    }
  }
})