import getData from '../../utils/DataURL.js';
var conf = require('../../config');
var maps = ['52YBZ-SNZ6X-TCO4C-7KBUO-IXAI5-CIFVP', 'CQTBZ-G7G6S-PK2OI-6RTUX-7WVRK-K6BOB',
  'MHTBZ-BHOKW-T43RD-RSR2R-L2NJT-UDFIB',
  'OF7BZ-HRBC6-SRGS4-MVBTO-MR2KS-ZFBMI',
  '4BIBZ-J3FW6-NHHSL-EAZH3-L5FOJ-XVBWZ'
];
var mapi = 0;
var app = getApp()
Page({
  data: {
    userData: {},
    shop: {},
    answers:'',
    configs:{},
  },
  onLoad: function () {
    var that = this;
    that.setData({
      userData: wx.getStorageSync("userData"),
      shop: wx.getStorageSync("shopData"),
      answers: wx.getStorageSync("userDot"),
    })
    that.Config()
    wx.removeTabBarBadge({
      index: 1
    })
  },
  onShow: function () {
    this.setData({
      userData: wx.getStorageSync("userData"),
      shop: wx.getStorageSync("shopData"),
    })
    
  },
  Config: function () {
    let pa = {
      API_URL: conf.configUrl,
    };
    getData.result(pa).then(res => {
      if (res.statusCode == 200) {
        //写入缓存
        wx.setStorageSync('configs', res.data)
        this.setData({
          configs: res.data[0]
        })
      } else {
        wx.showToast({
          title: '未获取配置信息',
          // icon: 'success',
          duration: 1000
        })
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
  getPhoneNumber: function (e) {
    let self = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '未授权不能继续操作',
        showCancel: false,
        content: '请在弹出框中点击确认授权！',
        success: function (res) { }
      })
    } else {
      wx.login({
        success: function (res) {
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
            let pno = res.data.phoneNumber;
            let da = {};
            da.phoneNumber = res.data.phoneNumber;
            let pa = {
              API_URL: conf.upUserUrl,
              data: da,
              method: "POST"
            };
            getData.result(pa).then(res => {
              if (res.data.status_code == 200) {
                //写入缓存
                getApp().globalData.userData.phone = pno;
                //转向界面
                self.register();
              } else {
                wx.showToast({
                  title: '保存失败',
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
  register: function () {
    let redirectUrl = '/pages/user/register/register'
    if (wx.getStorageSync('location')) {
      wx.navigateTo({
        url: redirectUrl
      })
    } else {
      this.getLocationInfo(redirectUrl)
    }
  },
  toOrderList: function () {
    let redirectUrl = '/pages/order/list'
    if (wx.getStorageSync('location')) {
      wx.navigateTo({
        url: redirectUrl
      })
    } else {
      this.getLocationInfo(redirectUrl)
    }
  },
  addOrder: function () {
    let redirectUrl = '/pages/order/add/add'
    if (wx.getStorageSync('location')) {
      wx.navigateTo({
        url: redirectUrl
      })
    } else {
      this.getLocationInfo(redirectUrl)
    }
  },
  getShop: function () {
    let that = this;
    let param = {
      API_URL: conf.userShop,
    };
    getData.result(param).then(res => {
      if (res.statusCode == 200) {
        that.setData({
          shop: res.data
        })
      }else{
        that.setData({
          shop: []
        })
      }
    })
  },
  editShop: function () {
    let self = this;
    let redirectUrl = "../shop/edit/edit?id=" + self.data.shop.id
    if (wx.getStorageSync('location')) {
      wx.navigateTo({
        url: redirectUrl
      })
    } else {
      this.getLocationInfo(redirectUrl)
    }
  },
  navTo: function () {
    let self = this;
    let param = {
      API_URL: conf.prodEcharts + '/' + self.data.shop.id,
    };
    getData.result(param).then(res => {
      app.globalData.product = res.data.prod
      app.globalData.counts = res.data.counts
    })
    let redirectUrl = "../shop/shop?id=" + self.data.shop.id
    if(wx.getStorageSync('location')){
      wx.navigateTo({
        url: redirectUrl
      })
    }else{
      this.getLocationInfo(redirectUrl)
    }
  },
  changeImage: function () {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var imgsrc = res.tempFilePaths;
        wx.showLoading({
          title: '头像上传中...',
          icon: 'loading',
          mask: true
        })
        let data = {};
        data.avatar = imgsrc;
        wx.uploadFile({
          url: conf.upAvtar,
          header: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + wx.getStorageSync('access_token')
          },
          // data:data,
          filePath: imgsrc[0],
          name: 'file',//这里根据自己的实际情况改
          // formData: usData,//这里是上传图片时一起上传的数据
          success: (res) => {
            let shop = that.data.shop;
            shop.avatar = res.data;
            that.setData({
              shop: shop
            });
            // 隐藏加载框
            wx.hideLoading();
          },
          fail: (res) => {
            wx.showToast({
              title: "头像保存失败",
              image: '/images/use/tip.png',
              duration: 2000
            })
          }
        })
      }
    })
  },
  saveImgToPhotosAlbumTap: function () {
    let self = this;
    wx.downloadFile({
      url: self.data.shop.code,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function (res) {
            wx.showToast({
              title: "保存失败",
              image: '/images/use/tip.png',
              duration: 2000
            })
          }
        })
      },
      fail: function () {
        console.log('fail')
      }
    })
  },
  FavoriteShops: function(){
    console.log(app.globalData.userData)

  },
  makePhoneCall: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.configs.btnRegisterName
    })
  },
  getLocationInfo: function (redirectUrl) {
    var that = this;
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        that.doLocal(latitude, longitude, redirectUrl);
      },
      fail: function (e) {
        let errMsg = e.errMsg
        if (errMsg.search("getLocation:fail") != -1) {
          wx.showModal({
            title: '请授权获取地理位置',
            content: '点击“确定”，选择“使用我的地理位置”，享受精准服务。',
            success: function (res) {
              if (res.cancel) {
                console.info("取消授权");
                wx.navigateBack();
                if (that.UNfGetLocal) {
                  that.UNfGetLocal(true);
                }
              } else if (res.confirm) {
                //village_LBS(that);
                wx.openSetting({
                  success: function (data) {
                    if (data.authSetting["scope.userLocation"] == true) {
                      wx.getLocation({
                        type: 'gcj02', // 默认为 wgs84 返回 gps 坐标
                        success: function (res) {
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
      complete: function (e) {
        // complete
      }
    })
  },
  doLocal: function (latitude, longitude, redirectUrl) {
    var that = this;
    var mapUrl = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=' + maps[mapi];
    wx.request({
      url: mapUrl,
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
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
      fail: function () {

      },
    })
  },
  onShareAppMessage: function () {
    return {
      title: '苗果——种苗服务平台',
      desc: '免费入驻，即刻拥有属于自己的微信管理平台',
      path: '/pages/user/user',
      // imageUrl: "/images/use/logo.png",
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  },
})