import newData from '../../utils/DataURL.js';
var conf = require('../../config');
var app = getApp()
Page({
  data: {
    userData: {},
    userInfo: {},
    shop: {},
  },
  onLoad: function () {
    var that = this;
    that.setData({
      userData: app.globalData.userData,
      userInfo: app.globalData.userInfo,
    })
    if(app.globalData.userData.is_active=='1'){
      that.getShop()
    }

  },
  getUData: function () {
    let self = this;
    let aa = self.data.userData;
    self.setData({
      userData: app.globalData.userData,
    });
  },
  
  onShow: function () {
    let self = this;
    self.getUData();
    if (app.globalData.userData.is_active == '1') {
      self.getShop();
    }
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
                self.register();
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
  register: function () {
    wx.navigateTo({
      url: '../user/me/me'
    })
  },
  getShop: function () {
    let that = this;
    let param = {
      API_URL: conf.userShop,
    };
    newData.result(param).then(res => {
      if (res.statusCode == 200) {
        let pp = res.data;
        that.setData({
          shop: pp
        })
      }else{
        that.setData({
          shop: []
        })
      }
    })
    
  },
  navTo: function () {
    let self = this;
    let param = {
      API_URL: conf.prodEcharts + '/' + self.data.shop.id,
    };
    newData.result(param).then(res => {
      app.globalData.product = res.data.prod
      app.globalData.counts = res.data.counts
    })
    wx.navigateTo({
      url: "../shop/shop?id=" + self.data.shop.id
    })
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