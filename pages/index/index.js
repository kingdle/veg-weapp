import getData from '../../utils/DataURL.js';
var conf = require('../../config');
import moment from '../../utils/moment.js';
import Notify from '../../vant/notify/notify';
import Dialog from '../../vant/dialog/dialog';
var maps = ['52YBZ-SNZ6X-TCO4C-7KBUO-IXAI5-CIFVP', 'CQTBZ-G7G6S-PK2OI-6RTUX-7WVRK-K6BOB',
  'MHTBZ-BHOKW-T43RD-RSR2R-L2NJT-UDFIB',
  'OF7BZ-HRBC6-SRGS4-MVBTO-MR2KS-ZFBMI',
  '4BIBZ-J3FW6-NHHSL-EAZH3-L5FOJ-XVBWZ'
];
var mapi = 0;
var app = getApp();

Page({
  data: {
    userData: {
      is_active: '0'
    },
    location: {},
    slogan: [],
    slide: [],
    notice: [],
    img_url: '/images/',
    address: '定位中…',
    msgList: app.notes,
    banners: app.banners,
    shopList: [],
    btnRegisterName: '',
    btnOrderName: '',
    introduce: '',
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
    inputShowed: false,
    inputVal: "",
    queryText: '',
    message: '请点击确认，允许授权登录',
    show: false
  },
  showNotify: function() {
    Notify({
      duration: 1000,
      text: '功能开发中，敬请期待',
      selector: '#custom-selector',
      backgroundColor: '#79c22b'
    });
  },
  onLoad: function() {
    var self = this;
    if (wx.getStorageSync("userData").id == undefined) {
      self.onLogin();
    }
    self.setData({
      userData: wx.getStorageSync("userData"),
      location: wx.getStorageSync('location')
    })
    self.getDynamics();
  },
  onLogin() {
    this.setData({
      show: true
    });
  },
  getUserInfo: function(res) {
    let that = this;
    const encryptedData = res.detail.encryptedData;
    const iv = res.detail.iv;
    if (encryptedData && iv) {
      app.doLogin(res.detail.userInfo);
      setTimeout(function() {
        that.setData({
          userData: wx.getStorageSync("userData"),
        })
        if (wx.getStorageSync("userData").is_active == '1') {
          let that = this;
          let param = {
            API_URL: conf.userShop,
          };
          getData.result(param).then(res => {
            if (res.statusCode == 200) {
              wx.setStorageSync('shopData', res.data)
            } else {

            }
          })
        }
      }, 1000)
      that.setData({
        show: false
      })
    } else {
      this.setData({
        show: true
      });
    }

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
      API_URL: conf.dynamicsListDistanceUrl,
      method: "POST",
      data: data
    };

    getData.result(param).then(res => {
      let newsList = res.data.data;
      newsList.forEach(function(news) {
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


  onShow: function() {

  },
  onPageScroll: function(e) {

  },
  onReady: function() {

  },

  getPhoneNumber: function(e) {
    let self = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '请授权获取您的手机号',
        showCancel: false,
        content: '不获取您的手机号农户无法联系到您',
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

          getData.result(param).then(res => {
            let userPhone = []
            userPhone.phoneNumber = res.data.phoneNumber
            let param = {
              API_URL: conf.phoneUpdateUrl,
              data: userPhone,
              method: "POST"
            };
            getData.result(param).then(response => {
              console.log(response.data.data)
              wx.setStorageSync('userData', response.data.data)
              self.setData({
                userData: response.data.data,
              })
              let redirectUrl = '/pages/user/register/register'
              self.getLocationInfo(redirectUrl);
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
    let redirectUrl = '/pages/user/register/register'
    self.getLocationInfo(redirectUrl);
    // wx.navigateTo({
    //   url: redirectUrl
    // })
  },
  toShopList: function(event) {
    let self = this;
    let redirectUrl = '/pages/' + event.target.dataset.url
    if (wx.getStorageSync('location')) {
      wx.navigateTo({
        url: redirectUrl
      })
    } else {
      self.getLocationInfo(redirectUrl);
    }
  },
  addDynamic: function() {
    let self = this;
    let redirectUrl = '/pages/news/news'
    self.getLocationInfo(redirectUrl);
    // wx.navigateTo({
    //   url: redirectUrl
    // })
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
  inputTyping: function(event) {
    let that = this;
    that.setData({
      queryText: event.detail,
    });
  },
  onSearch: function(event) {
    let that = this;
    if (that.data.queryText != '') {
      let data = [];
      data.queryText = this.data.queryText
      if (wx.getStorageSync('location')) {
        data.latitude = wx.getStorageSync('location').location.lat;
        data.longitude = wx.getStorageSync('location').location.lng;
      }
      data.userId = wx.getStorageSync("userData").id;
      let param = {
        API_URL: conf.dynamicQuery,
        method: "POST",
        data: data
      };

      getData.result(param).then(res => {
        let newsList = res.data.data;
        newsList.forEach(function(news) {
          news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
          news.created_at = moment(news.created_at.date).fromNow() + "发布";
        });
        console.log(res.data)
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
  doLocal: function(latitude, longitude, redirectUrl) {
    var that = this;
    var mapUrl = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=' + maps[mapi];
    wx.request({
      url: mapUrl,
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function(res) {
        if (res.data.status == 121) {
          mapi++;
          that.data.globalData.mapKey = maps[mapi + 1];
          that.doLocal(latitude, longitude);
        }
        that.setData({
          globalData: res.data,
          location: res.data.result
        })
        wx.setStorageSync('location', res.data.result)
        that.getDynamics();

        if (redirectUrl != undefined) {
          wx.navigateTo({
            url: redirectUrl
          })
        }
        let data = {
          country: res.data.result.address_component.nation,
          province: res.data.result.address_component.province,
          city: res.data.result.address_component.city,
          district: res.data.result.address_component.district,
          town: res.data.result.address_reference.town.title,
          address: res.data.result.address,
          street: res.data.result.address_component.street,
          street_number: res.data.result.address_reference.landmark_l2.title,
          crossroad: res.data.result.address_reference.crossroad ? res.data.result.address_reference.crossroad.title : '',
          nation_code: res.data.result.ad_info.nation_code,
          adcode: res.data.result.ad_info.adcode,
          city_code: res.data.result.ad_info.city_code,
          latitude: res.data.result.location.lat,
          longitude: res.data.result.location.lng,
          location_title: res.data.result.address_reference.street ? res.data.result.address_reference.street.title : '',
          location_dir_desc: res.data.result.address_reference.street ? res.data.result.address_reference.street._dir_desc : '',
          live_place: res.data.result.address + res.data.result.address_reference.town.title,
          villageInfo: res.data.result.address_reference.landmark_l2.title
        };
        let param = {
          API_URL: conf.weappupdateUrl,
          data: data,
          method: "POST"
        };

        getData.result(param).then(response => {
          wx.setStorageSync('userData', response.data.data)
          that.setData({
            userData: response.data.data,
          })
        })

      },
      fail: function() {

      },
    })
  },
  onShareAppMessage: function() {
    return {
      title: this.data.slogan.admission,
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