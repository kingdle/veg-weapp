import newData from '../../utils/DataURL.js';
import moment from '../../utils/moment.js';
var conf = require('../../config');
var app = getApp();
Page({
  data: {
    // tab切换  
    currentTab: 0,
    favorites:'',
    shopId: null,
    userData: {},
    shopEn: [],
    shopAvatar:'',
    shopNews: [],
    shopPics: [],
    scrollDown: true,
    nextPage: 1,
    isEnd: false,
    showAdd: true
  },
  onLoad: function(options) {
    let self = this;
    let uData = app.globalData.userData;
    self.setData({
      shopId: options.id,
      userData: uData
    })
    self.getShopById(options.id);
    self.getNewsListById(options.id);
    self.getPicById(options.id);
    self.isFavoriteShop(options.id)
  },
  onShow: function() {
    let that = this;
    let uData = app.globalData.userData;
    that.waitShop = res => {
      let shop = res;
      let showAdd = that.data.showAdd;
      if (shop.userid == uData.id) {
        showAdd = false;
        that.setData({
          showAdd: showAdd
        });
      }
    };
  },
  onPageScroll: function(e) {
    // console.log(e);
  },
  listscroll: function(e) {
    // console.log(e)
  },
  getShopById: function(id) {
    let that = this;
    let param = {
      API_URL: conf.shopUrl + id
    };

    newData.result(param).then(res => {
      let shop = res.data;
      //确保判断完再加载
      that.setData({
        shopEn: shop,
        shopAvatar:shop.avatar+'!mp.v200'
      });
      console.log(shop)
      if (that.waitShop) {
        that.waitShop(shop);
      }
      wx.setNavigationBarTitle({
        title: res.data.title
      });
    })
  },
  isFavoriteShop: function(id) {
    let that = this;
    let data=[]
    data.shop_id = id
    let param = {
      API_URL: conf.isFavoriteShop,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
      console.log(res.data)
      if (res.data.status_code == 200) {
        that.setData({
          favorites: res.data.data
        });
      }
    })
  },
  favoriteShop: function (e) {
    let that = this;
    let data = []
    data.shop_id = e.currentTarget.id
    let param = {
      API_URL: conf.FavoriteShop,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
      if (res.data.status_code == 200) {
        that.setData({
          favorites: true
        });
        this.getShopById(e.currentTarget.id);
      }
    })
  },
  destroyFavorites: function (e) {
    let that = this;
    let param = {
      API_URL: conf.FavoriteShop + '/' + e.currentTarget.id,
      method: "DELETE"
    };
    newData.result(param).then(res => {
      if (res.data.status_code == 201) {
        that.setData({
          favorites: ''
        });
        this.getShopById(e.currentTarget.id);
      }
    })
  },
  getNewsListById: function(id) {
    let that = this;
    let param = {
      API_URL: conf.newsListUrl + id,
    };
    let nextPage = that.data.nextPage;

    newData.result(param).then(res => {
      let nList = res.data.data;
      //格式化日期为mmm前
      if (nList == null)
        return;
      nList.forEach(function(news) {
        news.fdate = moment(news.created_at.date).fromNow() + '发表';
        news.year = moment(news.created_at.date).format("YYYY");
        news.month = moment(news.created_at.date).format("M");
        news.day = moment(news.created_at.date).format("DD");
      });
      console.log(res.data.data)
      nextPage = nextPage + 1;
      that.setData({
        shopNews: nList,
        nextPage: nextPage
      });
    })
    // 隐藏导航栏加载框  
    wx.hideNavigationBarLoading();
    // 停止下拉动作  
    wx.stopPullDownRefresh();
  },
  getPicById: function(id) {
    let that = this;
    let param = {
      API_URL: conf.shopPicUrl + id,
    };
    newData.result(param).then(res => {

      that.setData({
        shopPics: res.data.data
      });
    })
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var self = this;
    self.getNewsListById(self.data.shopId);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    // 显示加载图标
    // wx.showLoading({
    //   title: '加载中...',
    // })
    var that = this;
    let nextPage = that.data.nextPage;
    let param = {
      API_URL: conf.newsListUrl + that.data.shopId + "?page=" + nextPage,
    };

    newData.result(param).then(res => {
      let nList = res.data.data;

      if (nList == undefined) {
        that.setData({
          isEnd: true,
        })
        // 隐藏加载框
        // wx.hideLoading();
        return;
      }

      //格式化日期为mmm前
      nList.forEach(function(news) {
        news.fdate = moment(news.created_at.date).fromNow();
        news.year = moment(news.created_at.date).format("YYYY");
        news.month = moment(news.created_at.date).format("M");
        news.day = moment(news.created_at.date).format("DD");
      });
      let pred = that.data.shopNews;
      let tdata = pred.concat(nList);
      // 页数+1
      nextPage = nextPage + 1;
      that.setData({
        shopNews: tdata,
        nextPage: nextPage
      });
      // 隐藏加载框
      wx.hideLoading();
    })
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
  //动态图片
  toPic2(e) {
    let self = this;
    let current = e.target.dataset.src;
    let url = self.json2str2(self.data.shopNews, current);

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
    let ss = self.data.shopEn;
    console.log(ss)
    wx.openLocation({
      latitude: Number(ss.latitude),
      longitude: Number(ss.longitude),
      scale: 17,
      name: ss.title,
      address: ss.address
    })
  },
  toHome: function() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  makePhoneCall: function() {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.shopEn.user.phone
    })
  },
  makeOrder: function(e) {
    let self = this;
    wx.showModal({
      title: '提示',
      content: '7月1日正式上线订单功能，目前为体验版',
      success: function(res) {
        if (res.confirm) {
          self.orderAdd();
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
    let mpoi = app.globalData.locationInfo;

    let pp = mpoi.address + mpoi.address_reference.town.title + ',' + mpoi.address_reference.landmark_l2.title + mpoi.address_reference.landmark_l2._dir_desc + ',' + mpoi.address_component.city + ',' + mpoi.location.lng + ',' + mpoi.location.lat;

    let data = {
      shop_id: that.data.shopId,
      phoneNumber: app.globalData.userData.phone,
      nickname: app.globalData.userData.nickname,
      note_buy: '',
      address: pp
    };
    console.log(data);

    let param = {
      API_URL: conf.orderSendUrl,
      data: data,
      method: "POST"
    };

    newData.result(param).then(res => {
      if (res.statusCode == 200) {
        wx.showModal({
          title: '订单已发送，待育苗场确认',
          content: '苗场确认并填写完善您预定的种苗信息后，您会收到确认通知，请注意查收核对。',
          confirmText: '查看订单',
          cancelText: '返回上页',
          success: function(res) {
            if (res.confirm) {
              wx.redirectTo({
                url: "/pages/order/order"
              })
            } else {
              wx.navigateBack()
            }
          }
        })
      }
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
                let uData = app.globalData.userData;
                self.setData({
                  userData: uData
                })
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
  bindChange: function(e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },

  //切换tab
  swichNav: function(e) {
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      var current = e.target.dataset.current;
      that.setData({
        currentTab: parseInt(current),
      });

      //没有数据就进行加载
      switch (that.data.currentTab) {
        case 0:
          !that.data.shopNews.length && that.getNewsListById();
          break;
        case 1:
          !that.data.shopPics.length && that.getPicById();
          break;
      }
    };
  },
  //跳转到全屏播放页面
  startOnPlay(ev) {
    wx.navigateTo({
      url: '/pages/videoFull/videoFull?src=' + ev.currentTarget.dataset.src + '&shoptitle=' + ev.currentTarget.dataset.shoptitle,
    })
  },
  onShareAppMessage: function() {
    let self = this;
    let ss = self.data.shopEn;
    return {
      title: ss.title,
      // desc: "订苗电话：" + ss.user.phone,
      // path: '/pages/detail/detail?id=' + ss.id
    }
  }
});