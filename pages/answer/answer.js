import getData from '../../utils/DataURL.js';
var conf = require('../../config');
import moment from '../../utils/moment.js';
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userData: {},
    shopData: {},
    location: {},
    newsList: '',
    meta: {},
    endPage: 0,
    isEnd: false,
    releaseFocus: false,
    dynamic_id: '',
    to_user_id: '',
    answer: '',
    thumbs_answer: false,
    is_read: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    let self=this
    self.setData({
      userData: wx.getStorageSync("userData"),
      location: wx.getStorageSync('location') ? wx.getStorageSync('location') : '',
      shopData: wx.getStorageSync('shopData') ? wx.getStorageSync('shopData') : ''
    })
    self.getDynamics()
    self.isRead()
    
  },
  getDynamics: function() {
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
      if (res.statusCode == 200) {
        let newsList = res.data.data;
        newsList.forEach(function(news) {
          news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
          news.created_at = moment(news.created_at.date).fromNow() + "发布";
          let newContent = news.content
          if (newContent != undefined) {
            if (newContent.length > 36) {
              news.content = newContent.substring(0, 36) + "...";
            } else {
              news.content = newContent
            }
          }

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
  isRead:function(){
    let param = {
      API_URL: conf.updateIsRead,
      method: "POST",
    };
    getData.result(param).then(res => {
      wx.setStorageSync('userDot','0')
      //更新上页
      var pages = getCurrentPages();
      if (pages.length > 1) {
        //上一个页面实例对象
        var prePage = pages[pages.length - 2];
        //关键在这里
        prePage.setData({
          answers: 0,
        })
        prePage.onLoad();
      }
      
    })
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    var self = this;
    self.onLoad()
    wx.hideLoading();
    wx.hideNavigationBarLoading();
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
          addList.forEach(function(news) {
            news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
            news.created_at = moment(news.created_at.date).fromNow() + "发布";
            let newContent = news.content
            if (newContent != undefined) {
              if (newContent.length > 36) {
                news.content = newContent.substring(0, 36) + "...";
              } else {
                news.content = newContent
              }
            }
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
  thumbsAnswer: function(e) {
    this.setData({
      thumbs_answer: !this.data.thumbs_answer,
      releaseFocus: e.currentTarget.dataset.dynamic.id
    })
  },
  thumbs: function(e) {
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
        nList.forEach(function(news) {
          news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
          news.created_at = moment(news.created_at.date).fromNow() + "发布";
        });
        this.setData({
          releaseFocus: false,
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
      dynamic_id: e.currentTarget.dataset.dynamic.id,
      to_user_id: e.currentTarget.dataset.dynamic.userid
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
      to_user_id: '',
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
      data.to_user_id = this.data.to_user_id
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
  //跳转到全屏播放页面
  startOnPlay(ev) {
    wx.navigateTo({
      url: '/pages/videoFull/videoFull?src=' + ev.currentTarget.dataset.src + '&shoptitle=' + ev.currentTarget.dataset.shoptitle,
    })
  },
  getLocationInfo: function(redirectUrl) {
    var that = this;
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标
      success: function(res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        that.doLocal(latitude, longitude, redirectUrl);
      },
      fail: function(e) {
        if (e.errMsg == 'getLocation:fail auth deny') {
          wx.showModal({
            title: '请授权获取地理位置',
            content: '点击“确定”，选择“使用我的地理位置”，享受精准服务。',
            success: function(res) {
              if (res.cancel) {
                console.info("取消授权");
                wx.navigateBack();
                if (that.UNfGetLocal) {
                  that.UNfGetLocal(true);
                }
              } else if (res.confirm) {
                //village_LBS(that);
                wx.openSetting({
                  success: function(data) {
                    if (data.authSetting["scope.userLocation"] == true) {
                      wx.getLocation({
                        type: 'gcj02', // 默认为 wgs84 返回 gps 坐标
                        success: function(res) {
                          var latitude = res.latitude;
                          var longitude = res.longitude;
                          that.doLocal(latitude, longitude, redirectUrl);
                        }
                      })
                    } else {
                      wx.navigateBack();
                      console.info("授权设置界面未授权");
                      if (that.UNfGetLocal) {
                        that.UNfGetLocal(true);
                      }
                      wx.showToast({
                        title: '请授权地理位置',
                        image: '/images/use/tip.png',
                        duration: 4000
                      })
                    }
                  }
                })
              }
            }
          })
        } else {
          var latitude = 36.817967;
          var longitude = 118.938926;
          that.doLocal(latitude, longitude);
        }
      },
      complete: function(e) {
        // complete
      }
    })
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

})