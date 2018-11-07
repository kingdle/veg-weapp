import newData from '../../../utils/DataURL.js';
var conf = require('../../../config');
const app = getApp()

Page({

  data: {
    map_width: 380,
    map_height: 380,
    shop: {},
    loginUser: null,
    butn_show_loading: false,
    namecan: false
  },
  imageUrl: "",
  onLoad: function(options) {
    let that = this;
    //组合成初始状态下，shop-user-phone
    let user = {};
    user.phone = app.globalData.userData.phone;
    let pshop = that.data.shop;
    pshop.user = user;


    that.setData({
      shop: pshop,
      loginUser: app.globalData.userInfo,
    })

    //地图初始化之后，根据用户id查找店铺信息
    this.getShop();
  },
  getShop: function() {
    let that = this;
    let param = {
      API_URL: conf.userShop,
    };

    newData.result(param).then(res => {
      if (res.statusCode == 200) {
        let pp = res.data;
        that.setData({
          shop: pp,
          namecan: true
        });
      }
      //得到店铺信息后加载地图
      that.doMap();
    })
  },
  //show current position
  doMap: function() {
    var that = this;
    // 获取定位，并把位置标示出来
    if (that.data.shop.id != undefined) {
      let lng = that.data.shop.longitude;
      let lat = that.data.shop.latitude;
      that.getAddress(lng, lat);
    } else {
      app.getLocationInfo(function(locationInfo) {
        let lng = locationInfo.location.lng;
        let lat = locationInfo.location.lat;
        that.getAddress(lng, lat);
      })
    }


    //set the width and height
    // 动态设置map的宽和高
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          map_width: res.windowWidth,
          map_height: res.windowWidth - 85,
          controls: [{
            id: 1,
            iconPath: "../../../images/use/map.png",
            position: {
              left: res.windowWidth / 2 - 15,
              top: res.windowWidth / 2 - 73,
              width: 30,
              height: 30
            },
            clickable: true
          }]
        })
      }
    })

  },
  //获取中间点的经纬度，并mark出来
  getLngLat: function() {
    var that = this;
    this.mapCtx = wx.createMapContext("map4select");
    this.mapCtx.getCenterLocation({
      success: function(res) {
        let lng = res.longitude;
        let lat = res.latitude;
        that.getAddress(lng, lat);

        that.setData({
          longitude: lng,
          latitude: lat,
          markers: [{
            id: 0,
            iconPath: "../../../images/use/map.png",
            longitude: res.longitude,
            latitude: res.latitude,
            width: 30,
            height: 30
          }]
        })
      }
    })
  },
  getAddress: function(lng, lat) {
    let that = this;
    let uu = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + ',' + lng + '&key=' + app.globalData.mapKey;
    wx.request({
      url: uu,
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function(res) {
        let mpoi = res.data.result;
        if (mpoi !== undefined) {
          let add = mpoi.formatted_addresses.recommend + mpoi.address_reference.landmark_l2._dir_desc;
          let shop = that.data.shop;
          shop.country = mpoi.ad_info.nation;
          shop.province = mpoi.ad_info.province;
          shop.cityInfo = mpoi.ad_info.city;
          shop.villageInfo = mpoi.address_reference.landmark_l2.title;
          shop.address = add;
          shop.longitude = mpoi.location.lng;
          shop.latitude = mpoi.location.lat;
          that.setData({
            shop: shop,
            longitude: lng,
            latitude: lat,
            markers: [{
              id: 0,
              iconPath: "../../../images/use/map.png",
              longitude: lng,
              latitude: lat,
              width: 30,
              height: 30
            }]
          })
        }

      },
      fail: function() {
        page.setData({
          currentCity: "获取定位失败"
        });
      },
    })
  },

  regionchange(e) {
    console.log(e.timeStamp)
    // 地图发生变化的时候，获取中间点，也就是用户选择的位置
    // if (e.type == 'end') {
    //   this.getLngLat()
    // }
  },

  markertap(e) {
    console.log('MMM:' + e)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    if (!app.checkIfLogin(true)) {
      return;
    }
    this.imageUrl = app.globalData.userInfo.avatarUrl
  },
  Keytitle: function(e) {
    let that = this;
    let val = e.detail.value;
    let shop = that.data.shop;
    shop.title = val;
    this.setData({
      shop: shop,
    })
  },
  Keysummary: function(e) {
    let that = this;
    let val = e.detail.value;
    let shop = that.data.shop;
    shop.summary = val;
    this.setData({
      shop: shop,
    })
  },
  KeyvillageInfo: function(e) {
    let that = this;
    let val = e.detail.value;
    let shop = that.data.shop;
    shop.villageInfo = val;
    this.setData({
      shop: shop,
    })
  },
  toBack: function() {
    wx.navigateBack();
  },
  formSubmit: function(e) {
    this.setData({
      butn_show_loading: true
    })

    var shopInfo = e.detail.value;
    console.log(shopInfo)
    let shopTitle = shopInfo.title; //手机号码
    if (!shopTitle || shopTitle == null) {
      wx.showToast({
        title: "苗厂名不能为空",
        image: '/images/use/tip.png',
        duration: 2000
      })
      this.setData({
        butn_show_loading: false
      })
      return;
    }
    //村庄必填
    let villageInfo = shopInfo.villageInfo; //手机号码
    if (!villageInfo) {
      wx.showToast({
        title: "村庄信息必填",
        image: '/images/use/tip.png',
        duration: 2000
      })
      this.setData({
        butn_show_loading: false
      })
      return;
    }

    let url = null;
    let id = shopInfo.id;
    //检测手机号
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(16[0-9]{1})|(14[0-9]{1}))+\d{8})$/;

    let phoneNo = shopInfo.phone; //手机号码
    if (id == '' && !myreg.test(phoneNo)) {
      wx.showToast({
        title: "手机格式错误",
        image: '/images/use/tip.png',
        duration: 2000
      })
      this.setData({
        butn_show_loading: false
      })
      return;
    }
    //再附加userinfo有关信息，组合
    // shopInfo.headimg = this.imageUrl

    if (id == '')
      url = conf.shopAdd;
    else
      url = conf.userShop;

    let param = {
      API_URL: url,
      data: shopInfo,
      method: "POST"
    };

    newData.result(param).then(res => {
      if (res.statusCode == 200) {
        //写入缓存
        // app.globalData.userData.is_active = 1;
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1]; //当前页面
        var prevPage = pages[pages.length - 2]; //上一个页面
        // var homePage = pages[pages.length - 3]; //上一个页面

        let pUserData = app.globalData.userData;
        pUserData.is_active = 1;

        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
          userData: pUserData,
        })
        // homePage.setData({
        //   userData: pUserData,
        // })

        //弹窗跳转
        wx.showModal({
          title: '苗厂入驻成功',
          content: '您可以发布苗子动态，用微信管理合同订单了，快去体验吧。',
          confirmText: '我的苗厂',
          cancelText: '发布动态',
          success: function(res) {
            if (res.confirm) {
              if (id == '') {
                let param = {
                  API_URL: conf.userShop,
                };
                newData.result(param).then(res => {
                  if (res.statusCode == 200) {
                    let pp = res.data;
                    wx.redirectTo({
                      url: "../../detail/detail?id=" + pp.id
                    })
                  }
                })
              } else {
                wx.redirectTo({
                  url: "../../detail/detail?id=" + id
                })
              }

            } else if (res.cancel) {
              // wx.navigateBack()
              wx.redirectTo({
                url: "../../news/news"
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: res.data.message,
          image: '/images/use/tip.png',
          duration: 2000
        })
        this.setData({
          butn_show_loading: false
        })
      }
    })
  },
})