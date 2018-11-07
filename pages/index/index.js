import newData from '../../utils/DataURL.js';
var conf = require('../../config');
import moment from '../../utils/moment.js';
var app = getApp();

Page({
  data: {
    userData: {},
    img_url: '/images/',
    address: '定位中…',
    msgList: app.notes,
    banners: app.banners,
    shopList: [],
    slogan: [],
    slide: [],
    btnRegisterName: '',
    btnOrderName: '',
    introduce: '',
    notice: [],
    newsList: [],
    meta: [],
    allNewsList: [],
    pathList: '',
    nextPage: 0,
    endPage: 0,
    isEnd: false,
    headerindicatorDots: false,
    headerautoplay: true,
    headerinterval: 3000,
    headerduration: 500,
    headercircular: true,
    indicatorDots: false,
    shopautoplay: true,
    shopinterval: 5000,
    shopduration: 500,
    shopcircular: true,
    dynamic_id: '0',
    answer: '',
    dynamicIndex: '',
    thumbs_answer: false,
    releaseFocus: '',
    admission: '专业种苗服务平台',
    is_active: '0',
    inputShowed: false,
    inputVal: "",
    queryText: ''
  },
  onLoad: function() {
    var self = this;
    self.setData({
      is_active: wx.getStorageSync("is_active"),
      userData: wx.getStorageSync("userData"),
    })

    self.getUData();
    self.getData();
    self.doShopList();

  },
  doShopList: function(unauth) {
    var that = this;
    let lat = wx.getStorageSync('locLat');
    let lng = wx.getStorageSync('locLng');
    let userLocal = [];
    userLocal.latitude = lat;
    userLocal.longitude = lng;

    let param = {
      API_URL: conf.shopNearUrl,
      data: userLocal,
      method: "POST"
    };

    newData.result(param).then(data => {
      let shopList = data.data.data;
      let slogan = data.data.slogan;
      let slide = data.data.slide;
      let notice = data.data.notice;
      let shopS = new Array(Math.ceil(shopList.length / 4));
      for (var i = 0; i < shopS.length; i++) {
        shopS[i] = new Array();
      }
      for (var j = 0; j < shopList.length; j++) {
        shopS[parseInt(j / 4)][j % 4] = shopList[j];
      }
      that.setData({
        shopList: shopS,
        slogan: slogan,
        slide: slide,
        btnRegisterName: slogan.btnRegisterName,
        btnOrderName: slogan.btnOrderName,
        introduce: slogan.host,
        notice: notice,
        // headerindicatorDots: slogan.header_indicator_dots,
        headerautoplay: slogan.header_auto_play,
        headerinterval: slogan.header_interval,
        headerduration: slogan.header_duration,
        headercircular: slogan.header_circular,
        shopindicatorDots: slogan.shop_indicator_dots,
        shopautoplay: slogan.shop_auto_play,
        shopinterval: slogan.shop_interval,
        shopduration: slogan.shop_duration,
        shopcircular: slogan.shop_circular,
        admission: slogan.admission,
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
    self.getData()
    // 隐藏加载框
    wx.hideLoading();
    // 隐藏导航栏加载框  
    wx.hideNavigationBarLoading();
    // 停止下拉动作  
    wx.stopPullDownRefresh();
  },
  //页面上拉触底事件的处理函数
  onReachBottom: function() {
    this.getNews();
  },
  getNews: function() {
    var that = this;
    that.setData({
      loading: true
    });
    let page = that.data.meta.current_page;
    if (page < that.data.meta.last_page) {
      let userLocal = [];
      userLocal.latitude = wx.getStorageSync('locLat');
      userLocal.longitude = wx.getStorageSync('locLng');
      userLocal.userId = app.globalData.userData.id;
      userLocal.queryText = that.data.queryText
      let param = {
        API_URL: that.data.meta.path + '?page=' + (page + 1),
        method: "POST",
        data: userLocal
      };
      newData.result(param).then(res => {
        console.log(res.data)
        let addList = res.data.data;
        if (addList != undefined) {
          addList.forEach(function(news) {
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
        // 隐藏加载框
        wx.hideLoading();
        // 隐藏导航栏加载框  
        wx.hideNavigationBarLoading();
        // 停止下拉动作  
        wx.stopPullDownRefresh();
      })
    }
  },

  getData: function() {
    var that = this;
    let userLocal = [];
    userLocal.latitude = wx.getStorageSync('locLat');
    userLocal.longitude = wx.getStorageSync('locLng');
    userLocal.userId = wx.getStorageSync("userData").id;

    let param = {
      API_URL: conf.newsListDisUrl,
      data: userLocal,
      method: "POST"
    };

    newData.result(param).then(res => {
      let newsList = res.data.data;
      newsList.forEach(function(news) {
        news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
        news.created_at = moment(news.created_at.date).fromNow() + "发布";
      });
      that.setData({
        newsList: newsList,
        meta: res.data.meta
      });
      if (res.data.meta.current_page == res.data.meta.last_page) {
        that.setData({
          endPage: res.data.meta.last_page,
          isEnd: true
        });
      }
    })
  },
  onShow: function() {
    let self = this;
    self.getUData();
  },
  onPageScroll: function(e) {
    let self = this;
    self.getUData();
  },
  onReady: function() {
    let self = this;
    self.getUData();
  },
  getUData: function() {
    let self = this;
    let aa = self.data.userData;
    if (aa == null) {
      self.setData({
        userData: app.globalData.userData,
      });
    }
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
                //转向界面
                self.navto();
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

  //动态图片
  toPic2(e) {
    let self = this;
    let current = e.target.dataset.src;
    let url = self.json2str2(self.data.newsList, current);
    //上面完了，这个重新赋值
    current = current + '!mp.v1080';

    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: url // 需要预览的图片http链接列表  
    })
  },
  json2str2: function(json, img) {
    var rtArr = new Array();
    for (var p in json) {
      if (json[p].pic.indexOf(img) >= 0) {
        var js = new Array();
        js = json[p].pic;
        for (var j in js) {
          rtArr.push(js[j] + '!mp.v1080')
        }
      }
    }
    return rtArr;
  },
  navto: function() {
    let self = this;
    wx.navigateTo({
      url: '../user/me/me'
    })
  },
  thumbsAnswer: function(e) {
    this.setData({
      thumbs_answer: !this.data.thumbs_answer,
      releaseFocus: e.currentTarget.dataset.dynamic.id
    })
  },
  thumbs: function(e) {
    console.log(e.currentTarget.dataset.dynamic)
    var data = []
    data.dynamicId = e.currentTarget.dataset.dynamic.id
    data.latitude = wx.getStorageSync('locLat');
    data.longitude = wx.getStorageSync('locLng');
    data.userId = wx.getStorageSync("userData").id;
    let param = {
      API_URL: conf.followDynamic,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
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
        nList.forEach(function(news) {
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
  answer: function(e) {
    this.setData({
      answer: e.currentTarget.dataset.dynamic.id
    })
  },
  bindReply: function(e) {
    this.setData({
      releaseFocus: e.currentTarget.dataset.dynamic.id,
      dynamic_id: e.currentTarget.dataset.dynamic.id
    })
  },
  inputAnswer: function(e) {
    this.setData({
      answer: e.detail.value
    })
  },
  bindblur: function(e) {
    this.setData({
      releaseFocus: false,
      dynamic_id: '',
      answer: '',
      thumbs_answer: false
    })
  },
  bindconfirm: function(e) {
    this.setData({
      releaseFocus: false
    })
    if (this.data.answer != '') {
      var data = []
      data.body = this.data.answer
      data.user_id = app.globalData.userData.id
      data.dynamic_id = this.data.dynamic_id
      data.latitude = wx.getStorageSync('locLat');
      data.longitude = wx.getStorageSync('locLng');
      let param = {
        API_URL: conf.answerUrl,
        data: data,
        method: "POST"
      };
      newData.result(param).then(res => {
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
          nList.forEach(function(news) {
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
  showInput: function() {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function() {
    var self = this;
    if (self.data.queryText != '') {
      self.getData()
    }
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function() {
    this.loadShopList()
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    let that = this;
    that.setData({
      queryText: e.detail.value,
    });
  },
  inputConfirm: function(e) {
    let that = this;
    if (that.data.queryText != '') {
      let data = [];
      data.queryText = e.detail.value
      data.latitude = wx.getStorageSync('locLat');
      data.longitude = wx.getStorageSync('locLng');
      data.userId = wx.getStorageSync("userData").id;
      let param = {
        API_URL: conf.dynamicQuery,
        method: "POST",
        data: data
      };

      newData.result(param).then(res => {
        let newsList = res.data.data;
        newsList.forEach(function(news) {
          news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
          news.created_at = moment(news.created_at.date).fromNow() + "发布";
        });
        that.setData({
          newsList: newsList,
          meta: res.data.meta
        });
        if (res.data.meta.current_page == res.data.meta.last_page) {
          that.setData({
            endPage: res.data.meta.last_page,
            isEnd: true
          });
        }
      })
    }
  },
  //跳转到全屏播放页面
  startOnPlay(ev) {
    wx.navigateTo({
      url: '/pages/videoFull/videoFull?src=' + ev.currentTarget.dataset.src + '&shoptitle=' + ev.currentTarget.dataset.shoptitle,
    })
  },
  onShareAppMessage: function() {
    return {
      title: this.data.admission,
      desc: '免费入驻，体验用微信管理苗子...',
      path: '/pages/index/index',
      // imageUrl: "/images/use/logo.png",
      success: function(res) {
        // 分享成功
      },
      fail: function(res) {
        // 分享失败
      }
    }
  },
});