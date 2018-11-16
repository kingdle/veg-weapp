import getData from '../../utils/DataURL.js';
var conf = require('../../config');
import moment from '../../utils/moment.js';
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    newsList: '',
    meta: {},
    endPage: 0,
    isEnd: false,
    releaseFocus: false,
    dynamic_id: '',
    answer: '',
    thumbs_answer: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getDynamics();
  },
  getDynamics: function () {
    var that = this;
    let data = [];
    data.queryText = this.data.queryText
    if (wx.getStorageSync('location')) {
      data.latitude = wx.getStorageSync('location').location.lat;
      data.longitude = wx.getStorageSync('location').location.lng;
    }
    data.userId = wx.getStorageSync("userData").id;
    let param = {
      API_URL: conf.answerList,
      method: "POST",
      data: data
    };

    getData.result(param).then(res => {
      if (res.statusCode==200){
        let newsList = res.data.data;
        newsList.forEach(function (news) {
          news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
          news.created_at = moment(news.created_at.date).fromNow() + "发布";
        });
        that.setData({
          newsList: newsList,
          meta: res.data.meta,
          slogan: res.data.slogan,
          slide: res.data.slide,
        });
        if (res.data.meta.current_page == res.data.meta.last_page) {
          that.setData({
            endPage: res.data.meta.last_page,
            isEnd: true
          });
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    var self = this;
    self.onLoad()
    wx.hideLoading();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    this.getNews();
  },
  getNews: function () {
    var that = this;
    that.setData({
      loading: true
    });
    let page = that.data.meta.current_page;
    if (page < that.data.meta.last_page) {
      let data = [];
      data.queryText = this.data.queryText
      if (wx.getStorageSync('location')) {
        data.latitude = wx.getStorageSync('location').location.lat;
        data.longitude = wx.getStorageSync('location').location.lng;
      }
      data.userId = wx.getStorageSync("userData").id;
      let param = {
        API_URL: that.data.meta.path + '?page=' + (page + 1),
        method: "POST",
        data: data
      };
      getData.result(param).then(res => {
        let addList = res.data.data;
        if (addList != undefined) {
          addList.forEach(function (news) {
            news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
            news.created_at = moment(news.created_at.date).fromNow() + "发布";
          });
        }
        let newsList = that.data.newsList.concat(addList)
        that.setData({
          newsList: newsList,
          meta: res.data.meta,
          loading: false
        });
        if (res.data.meta.current_page == res.data.meta.last_page) {
          that.setData({
            endPage: res.data.meta.last_page,
            isEnd: true
          });
        }
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      })
    }
  },
  thumbsAnswer: function (e) {
    this.setData({
      thumbs_answer: !this.data.thumbs_answer,
      releaseFocus: e.currentTarget.dataset.dynamic.id
    })
  },
  thumbs: function (e) {
    var data = []
    data.dynamicId = e.currentTarget.dataset.dynamic.id
    if (wx.getStorageSync('location')) {
      data.latitude = wx.getStorageSync('location').location.lat;
      data.longitude = wx.getStorageSync('location').location.lng;
    }
    data.userId = wx.getStorageSync("userData").id;
    let param = {
      API_URL: conf.followDynamic,
      data: data,
      method: "POST"
    };
    getData.result(param).then(res => {
      if (res.data.status_code != 404) {
        var dynamicId = e.currentTarget.dataset.dynamic.id
        var allNewsList = this.data.newsList
        for (let i = 0; i < allNewsList.length; i++) {
          if (dynamicId == allNewsList[i].id) {
            this.setData({
              dynamicIndex: i
            })
          }
        }
        var nList = res.data.data
        nList.forEach(function (news) {
          news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
          news.created_at = moment(news.created_at.date).fromNow() + "发布";
        });
        this.setData({
          ["newsList[" + this.data.dynamicIndex + "]"]: nList[0]
        })

        // this.setData({
        //   releaseFocus: false,
        //   dynamic_id: '',
        //   answer: '',
        //   thumbs_answer: false
        // })
      }
    });
  },
  answer: function (e) {
    this.setData({
      answer: e.currentTarget.dataset.dynamic.id
    })
  },
  bindReply: function (e) {
    this.setData({
      releaseFocus: e.currentTarget.dataset.dynamic.id,
      dynamic_id: e.currentTarget.dataset.dynamic.id
    })
  },
  inputAnswer: function (e) {
    this.setData({
      answer: e.detail.value
    })
  },
  bindblur: function (e) {
    this.setData({
      releaseFocus: false,
      dynamic_id: '',
      answer: '',
      thumbs_answer: false
    })
  },
  bindconfirm: function (e) {
    this.setData({
      releaseFocus: false
    })
    if (this.data.answer != '') {
      var data = []
      data.body = this.data.answer
      data.user_id = app.globalData.userData.id
      data.dynamic_id = this.data.dynamic_id
      if (wx.getStorageSync('location')) {
        data.latitude = wx.getStorageSync('location').location.lat;
        data.longitude = wx.getStorageSync('location').location.lng;
      }
      let param = {
        API_URL: conf.answerUrl,
        data: data,
        method: "POST"
      };
      getData.result(param).then(res => {
        if (res.data.status_code != 404) {
          var dynamicId = e.currentTarget.dataset.dynamicid
          var allNewsList = this.data.newsList
          for (let i = 0; i < allNewsList.length; i++) {
            if (dynamicId == allNewsList[i].id) {
              this.setData({
                dynamicIndex: i
              })
            }
          }
          var nList = res.data.data
          nList.forEach(function (news) {
            news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
            news.created_at = moment(news.created_at.date).fromNow() + "发布";
          });
          this.setData({
            ["newsList[" + this.data.dynamicIndex + "]"]: nList[0]
          })

          this.setData({
            releaseFocus: false,
            dynamic_id: '',
            answer: '',
            thumbs_answer: false
          })
        }
      });
    }
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
  
})