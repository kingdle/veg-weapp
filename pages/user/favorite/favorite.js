import getData from '../../../utils/DataURL.js';
var conf = require('../../../config');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    shopList: {},
    meta:{},
    endPage: 0,
    isEnd: false,
    location: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.loadFavoriteList()
    this.setData({
      location: wx.getStorageSync('location')
    })
  },
  loadFavoriteList: function () {
    let that = this;
    let data = {};
    if (wx.getStorageSync('location')){
      data.latitude = wx.getStorageSync('location').location.lat;
      data.longitude = wx.getStorageSync('location').location.lng;
    }
    let param = {
      API_URL: conf.followShopList,
      method: "POST",
      data: data
    };
    getData.result(param).then(res => {
      if (res.data.status_code != 401) {
        that.setData({
          shopList: res.data.data,
          meta: res.data.meta,
          isEnd: false
        });
      }

    })
  },
  makePhoneCall: function (event) {
    wx.makePhoneCall({
      phoneNumber: ''
    })
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
    wx.showNavigationBarLoading();
    var self = this;
    self.onLoad()
    wx.hideLoading();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let page = that.data.meta.current_page;
    if (page < that.data.meta.last_page) {
      let data = {};
      if (wx.getStorageSync('location')) {
        data.latitude = wx.getStorageSync('location').location.lat;
        data.longitude = wx.getStorageSync('location').location.lng;
      }
      let param = {
        API_URL: that.data.meta.path + '?page=' + (page + 1),
        method: "POST",
        data: data
      };
      getData.result(param).then(res => {
        let shopList = that.data.shopList.concat(res.data.data)
        that.setData({
          shopList: shopList,
          meta: res.data.meta,
          loading: false
        });
        if (res.data.meta.current_page == res.data.meta.last_page) {
          that.setData({
            endPage: res.data.meta.last_page,
            isEnd: true
          });
        }
      })
    }
  }
})