import newData from '../../utils/DataURL.js';
import moment from '../../utils/moment.js';
var conf = require('../../config');
var app = getApp();
Page({
  data: {
    userData: {},
    shopPics: [],
    nextPage: 1,
    isEnd: false,
    id: '',
  },
  onLoad: function(options) {
    let self = this;
    self.setData({
      userData: app.globalData.userData,
      id: options.id
    })
    self.getPicById();
  },

  getPicById: function() {
    let that = this;
    let id = that.data.id;
    let nextPage = that.data.nextPage;
    let isend = that.data.isEnd;
    // wx.showLoading({
    //   title: '加载中...',
    // })
    let param = {
      API_URL: conf.shopPicUrl + id + "?page=" + nextPage,
    };
    // 页数+1
    nextPage = nextPage + 1;
    newData.result(param).then(res => {
      let pList = res.data.data;
      if (!that.data.isEnd && nextPage - 1 == res.data.meta.last_page) {
        that.setData({
          isEnd: true,
        })
        // 隐藏加载框
        wx.hideLoading();
        // 隐藏导航栏加载框  
        wx.hideNavigationBarLoading();
        // 停止下拉动作  
        wx.stopPullDownRefresh();
      }
      let pred = that.data.shopPics;
      let tdata = pred.concat(pList);
      that.setData({
        shopPics: tdata,
        nextPage: nextPage
      });
      // 隐藏加载框
      wx.hideLoading();
      // 隐藏导航栏加载框  
      wx.hideNavigationBarLoading();
      // 停止下拉动作  
      wx.stopPullDownRefresh();
    })
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var self = this;
    self.getPicById();
  },

  //页面上拉触底事件的处理函数
  onReachBottom: function() {
    // 显示顶部刷新图标
    if (this.data.isEnd == false){
      wx.showNavigationBarLoading();
      var self = this;
      self.getPicById();
    }
  },
  //相册点击放大
  toPic1(e) {
    let self = this;
    let current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: self.json2str(self.data.shopPics) // 需要预览的图片http链接列表  
    })
  },
  json2str: function(json) {
    var rtArr = new Array();
    for (var p in json) {
      rtArr.push(json[p].pic + '!mp.v1080')
    }
    return rtArr;
  },

  toHome: function() {
    wx.navigateBack()
  },
  makePhoneCall: function() {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.shopEn.user.phone //仅为示例，并非真实的电话号码
    })
  },
  makeOrder: function(e) {
    wx.showModal({
      title: '提示',
      content: '发送订单—>苗场确认，就安排育苗了哦！',
      success: function(res) {
        if (res.confirm) {
          console.log(e);
          console.log("发送订单啦啦啦");
        } else if (res.cancel) {
          console.log(e);
          console.log("点击了发送订单，但又取消了，继续跟进吧。。");

        }
      }
    })
  },
  orderAdd: function() {
    let that = this;
    let param = {
      API_URL: conf.orderAddUrl,
      data: data,
      method: "POST"
    };

    newData.result(param).then(res => {

    })
  },
  getPhoneNumber: function(e) {
    let self = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '未授权不能继续操作',
        showCancel: false,
        content: '请在弹出框中点击确认授权！',
        success: function(res) {}
      })
    } else {
      wx.login({
        success: function(res) {
          let data = {};
          data.iv = e.detail.iv;
          data.encryptedData = e.detail.encryptedData;
          data.code = res.code;

          let param = {
            API_URL: conf.getPhoneUrl,
            data: data,
            method: "POST"
          };

          newData.result(param).then(res => {
            let pno = res.data.phoneNumber;
            let da = {};
            da.phoneNumber = res.data.phoneNumber;
            let pa = {
              API_URL: conf.upUserUrl,
              data: da,
              method: "POST"
            };
            newData.result(pa).then(res => {
              if (res.data.status_code == 200) {
                //写入缓存
                getApp().globalData.userData.phone = pno;
                //根据传递的值不同处理
                let type = e.currentTarget.dataset.name;
                if (type == 1)
                  self.makeOrder()
                else if (type == 0)
                  self.makePhoneCall();

              } else {
                wx.showToast({
                  title: '手机号码保存失败，请重试！',
                  // icon: 'success',
                  duration: 1000
                })
              }
            })
          });

        }
      });
    }
  },

});