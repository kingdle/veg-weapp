import newData from '../../utils/DataURL.js';
var conf = require('../../config');
import * as echarts from '../../ec-canvas/echarts';

const app = getApp();


function initChart(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  
  console.log(app.globalData)
  
  var option = {
    title: {
      text: '品种-数量图表展示',
      top: 5,
      right: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#f85e13'
        }
      }
    },
    // color: ["#f85e13", "#67E0E3", "#9FE6B8"],
    legend: {
      data: [''],
      top: 0,
      left: 20,
      // backgroundColor: 'red',
      z: 100
    },
    grid: {
      containLabel: true
    },

    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: app.globalData.product,
      // show: false
      axisLabel: {
        interval: 0,
        rotate: 40
      },
      axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: {
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
      // show: false
    },
    series: [{
      name:'数量',
      type: 'bar',
      color:'#f85e13',
      stack: '棵',
      markPoint: {
        data: [
          { type: 'max', name: '最多' },
          { type: 'min', name: '最少' }
        ]
      },
      data: app.globalData.counts,
    }],
    
  };
  chart.setOption(option);
  return chart;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    shopId: null,
    userData: {},
    shopEn: [],
    shop:{},
    summary:'',
    shopPics: [],
    moneyCount: [],
    scrollDown: true,
    nextPage: 1,
    isEnd: false,
    prodSeller: [],
    ec: {
      onInit: initChart
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    let uData = app.globalData.userData;
    self.setData({
      shopId: options.id,
      userData: uData
    })
    self.getShopById(options.id)
    self.getPicById(options.id)
    self.getProdById(options.id)
    self.getMoneyById(options.id)
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
        shopEn: shop
      });
      if (that.waitShop) {
        that.waitShop(shop);
      }
      wx.setNavigationBarTitle({
        title: res.data.title
      });
    })
  },
  getAddress: function (lng, lat) {
    let that = this;
    let uu = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + ',' + lng + '&key=' + app.globalData.mapKey;
    wx.request({
      url: uu,
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
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
      fail: function () {
        page.setData({
          currentCity: "获取定位失败"
        });
      },
    })
  },
  getProdById: function(id) {
    let that = this;
    let param = {
      API_URL: conf.prodSeller + '/' + id
    };

    newData.result(param).then(res => {
      let prodSeller = res.data;
      //确保判断完再加载
      that.setData({
        prodSeller: prodSeller
      });
    })
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
  getMoneyById: function(id) {
    let that = this;
    let param = {
      API_URL: conf.moneyCount + '/' + id,
    };
    newData.result(param).then(res => {
      that.setData({
        moneyCount: res.data
      });
    })
  },
  navto: function() {
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

  makePhoneCall: function() {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.shopEn.user.phone
    })
  },
  summaryUpdate: function (e) {
    let that = this;
    that.data.summary = e.detail.value
    let data = {}
    if (that.data.summary == '') {
      wx.showToast({
        title: "简介内容不能为空",
        image: '/images/use/tip.png',
        duration: 1000
      })
      return;
    }
    data.summary = that.data.summary
    let param = {
      API_URL: conf.userShop,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
      // if (res.data.status_code != 404) {
      //   wx.showToast({
      //     title: "更新成功",
      //     icon: 'success',
      //     duration: 1000
      //   })
      // }
    });
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


})