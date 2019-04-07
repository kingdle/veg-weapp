import getData from '../../../utils/DataURL.js';
var conf = require('../../../config');
var app = getApp();
var maps = ['52YBZ-SNZ6X-TCO4C-7KBUO-IXAI5-CIFVP', 'CQTBZ-G7G6S-PK2OI-6RTUX-7WVRK-K6BOB',
  'MHTBZ-BHOKW-T43RD-RSR2R-L2NJT-UDFIB',
  'OF7BZ-HRBC6-SRGS4-MVBTO-MR2KS-ZFBMI',
  '4BIBZ-J3FW6-NHHSL-EAZH3-L5FOJ-XVBWZ'
];
var mapi = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userData: {},
    location: '',
    username: '',
    typeArray: [],
    typeIndex: 0,
    typeId: '1',
    address: '',
    villageInfo: '',
    latitude: '',
    longitude: '',
    summary: '',
    avatar: '',
    country: '',
    province: '',
    cityInfo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      userData: wx.getStorageSync("userData"),
      avatar: wx.getStorageSync("userData").avatar_url,
    })
    if (wx.getStorageSync("location")) {
      this.setData({
        address: wx.getStorageSync("location").formatted_addresses.recommend + wx.getStorageSync("location").address_reference.landmark_l2._dir_desc,
        villageInfo: wx.getStorageSync("location") ? wx.getStorageSync("location").address_reference.landmark_l2.title : '',
        location: wx.getStorageSync("location"),
        latitude: wx.getStorageSync("location").location.lat,
        longitude: wx.getStorageSync("location").location.lng,
        villageInfo: wx.getStorageSync("location").address_reference.landmark_l2.title,
        country: wx.getStorageSync("location").ad_info.nation,
        province: wx.getStorageSync("location").ad_info.province,
        cityInfo: wx.getStorageSync("location").ad_info.city,
        avatar: wx.getStorageSync("userData").avatar_url,
      })
    }
  },

  /**
   * 监听地址输入
   */
  listenerUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    })

  },
  listenerVillageInfoInput: function(e) {
    this.setData({
      VillageInfo: e.detail.value
    })
  },
  /**
   * 监听简介输入
   */
  listenerSummaryInput: function(e) {
    this.setData({
      summary: e.detail.value
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

          getData.result(param).then(res => {
            let userPhone = []
            userPhone.phoneNumber = res.data.phoneNumber
            let param = {
              API_URL: conf.phoneUpdateUrl,
              data: userPhone,
              method: "POST"
            };
            getData.result(param).then(response => {
              wx.setStorageSync('userData', response.data.data)
              self.setData({
                userData: response.data.data,
              })
            })
          });

        }
      });
    }
  },
  setlocation: function(e) {
    var that = this;
    let data = {};
    wx.chooseLocation({
      success: function(res) {
        that.doLocal(res);
      }
    });
  },

  doLocal: function(res) {
    var that = this;
    var latitude = res.latitude
    var longitude = res.longitude
    var mapUrl = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=' + maps[mapi];
    wx.request({
      url: mapUrl,
      header: {
        'Content-Type': 'ication/json'
      },
      success: function(res) {
        if (res.data.status == 121) {
          mapi++;
          that.data.globalData.mapKey = maps[mapi + 1];
          that.doLocal(latitude, longitude);
        }
        console.log(res.data.result.formatted_addresses.recommend + res.data.result.address_reference.landmark_l2._dir_desc)
        that.setData({
          location: res.data.result,
          address: res.data.result.formatted_addresses.recommend + res.data.result.address_reference.landmark_l2._dir_desc,
          latitude: res.data.result.location.lat,
          longitude: res.data.result.location.lng,
          villageInfo: res.data.result.address_reference.landmark_l2.title,
          country: res.data.result.ad_info.nation,
          province: res.data.result.ad_info.province,
          cityInfo: res.data.result.ad_info.city,
        })
        wx.setStorageSync('location', res.data.result)

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
  addOrder: function() {
    if (this.data.username == null || this.data.username == '') {
      wx.showToast({
        title: "名称不能为空",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    if (this.data.address == null || this.data.address == '') {
      wx.showToast({
        title: "请选择地址信息",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    if (this.data.villageInfo == null || this.data.villageInfo == '') {
      wx.showToast({
        title: "社区不能为空",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    let data = {
      title: this.data.username,
      phone: wx.getStorageSync("userData").phone,
      address: this.data.address,
      villageInfo: this.data.villageInfo,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      summary: this.data.summary,
      country: this.data.country,
      province: this.data.province,
      cityInfo: this.data.cityInfo,
      avatar: this.data.avatar
    };

    let param = {
      API_URL: conf.shopAdd,
      data: data,
      method: "POST"
    };
    getData.result(param).then(res => {
      console.log(res)

      if (res.statusCode == 403) {
        wx.showToast({
          title: res.data.message,
          image: '/images/use/tip.png',
          duration: 2000
        })
        return;
      }
      wx.setStorageSync('userData', res.data.user)
      wx.setStorageSync('shopData', res.data.shop)
      wx.reLaunch({
        url: '/pages/detail/detail?id=' + res.data.shopId
      })
      //更新上页
      var pages = getCurrentPages();
      if (pages.length > 1) {
        //上一个页面实例对象
        var prePage = pages[pages.length - 2];
        //关键在这里
        prePage.setData({
          userData: res.data.user
        })
        prePage.onLoad();
      }
    })
  },
  makePhoneCall: function () {
    wx.makePhoneCall({
      phoneNumber: '18661737287'
    })
  },
  copyPhone: function (e) {
    wx.setClipboardData({
      data: '18661737287',
      success: function (res) {
        wx.showToast({
          title: '微信号已复制',
          image: '/images/use/wxphone.png',
          duration: 2000
        })
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
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})