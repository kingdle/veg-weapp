import getData from '../../../utils/DataURL.js';
var conf = require('../../../config');
const app = getApp();
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
    currentTab: 0,
    shopId: null,
    userData: {},
    shopEn: [],
    shop: {},
    shopTitle:'',
    phoneNum:'',
    shopPics: [],
    scrollDown: true,
    nextPage: 1,
    isEnd: false,
    prodSeller: [],
    location: '',
    address: '',
    villageInfo: '',
    latitude: '',
    longitude: '',
    avatar: '',
    country: '',
    province: '',
    cityInfo: '',
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    self.setData({
      shopId: options.id,
      userData: wx.getStorageSync('userData'),
      avatar: wx.getStorageSync('shopData') ? wx.getStorageSync('shopData').avatar + '!mp.v200' :'https://images.veg.kim/mp/mg-code-mp.jpg'
    })
    self.getShopById(options.id)
    self.getPicById(options.id)
  },
  getShopById: function (id) {
    let that = this;
    let param = {
      API_URL: conf.shopUrl + id
    };

    getData.result(param).then(res => {
      let shop = res.data;
      //确保判断完再加载
      that.setData({
        shopEn: shop,
        shopTitle: shop.title,
        phoneNum:shop.user.phone
      });
      if (that.waitShop) {
        that.waitShop(shop);
      }
      // wx.setNavigationBarTitle({
      //   title: res.data.title
      // });
    })
  },
  changeAvatar: function () {
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
            that.setData({
              avatar: res.data
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
  getPicById: function (id) {
    let that = this;
    let param = {
      API_URL: conf.shopPicUrl + id,
    };
    getData.result(param).then(res => {

      that.setData({
        shopPics: res.data.data
      });
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
  json2str: function (json) {
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
  json2str2: function (json, img) {
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
  
  navto: function () {
    let self = this;
    let ss = self.data.shopEn;
    console.log(self.data.shopEn)
    wx.openLocation({
      latitude: Number(ss.latitude),
      longitude: Number(ss.longitude),
      scale: 17,
      name: ss.title,
      address: ss.address
    })
  },
  getPhoneNumber: function (event) {
    let self = this;
    if (event.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '手机号更新失败',
        showCancel: false,
        content: '若您更改了手机号请先更新微信为新手机号，再点击重新获取！',
        success: function (res) { }
      })
    } else {
      wx.login({
        success: function (res) {
          
          let data = {};
          data.iv = event.detail.iv;
          data.encryptedData = event.detail.encryptedData;
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
              console.log(response)
              wx.setStorageSync('userData', response.data.data)
              self.setData({
                userData: response.data.data,
                phoneNum: response.data.data.phone
              })
            })
          });

        }
      });
    }
  },
  makePhoneCall: function () {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.phoneNum
    })
  },
  setlocation: function (e) {
    var that = this;
    let data = {};
    wx.chooseLocation({
      success: function (res) {
        that.doLocal(res);
      }
    });
  },

  doLocal: function (res) {
    var that = this;
    var latitude = res.latitude
    var longitude = res.longitude
    var mapUrl = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=' + maps[mapi];
    wx.request({
      url: mapUrl,
      header: {
        'Content-Type': 'ication/json'
      },
      success: function (res) {
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
          address: res.data.result.formatted_addresses.recommend + res.data.result.address_reference.landmark_l2._dir_desc,
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
        console.log(data)
        let param = {
          API_URL: conf.shopAddressUpdate,
          data: data,
          method: "POST"
        };
        getData.result(param).then(response => {
          console.log(response)
          that.setData({
            shopEn: response.data.data,
          })
        })

      },
      fail: function () {

      },
    })
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
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },


})