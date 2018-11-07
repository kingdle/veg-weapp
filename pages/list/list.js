import newData from '../../utils/DataURL.js';
import moment from '../../utils/moment.js';
var conf = require('../../config');
var app = getApp();

//创建精选页面对象
Page({

  data: {
    userData: {},
    newsList: [],
    nextPage: 0,
    endPage: 0,
    isEnd: false,

    sortKind: [],
    sortType: [],
    currentId: '1',
    typeId: '',
    preTypeId: '',
    preFlag: false,

    isNew: 1,
    fixTop: 180, //区域离顶部的高度
    scrollTop: 0, //滑动条离顶部的距离
  },
  onLoad: function(params) {
    let self = this;
    self.getSort();
    self.defaultType();
    self.getData();

    this.setData({
      userData: app.globalData.userData,
    })
  },
  onShow: function() {},

  getData: function() {
    var that = this;
    let kindId = that.data.currentId;
    let typeId = that.data.typeId;
    let isEnd = that.data.isEnd;
    if (typeId == 'all')
      typeId = kindId;

    //根据最终的值，判断，如果不一致则更新，一致就不查询了，节省点    
    let preTypeId = that.data.preTypeId;
    let preFlag = that.data.preFlag;
    if (preTypeId != typeId) {
      that.setData({
        preTypeId: typeId,
        preFlag: false,
        nextPage: 0,
        newsList: [],
      });
      wx.showLoading({
        title: '加载中...',
      })
    } else if (preFlag && preTypeId == typeId) {
      return;
    }
    let lat = wx.getStorageSync('locLat');
    let lng = wx.getStorageSync('locLng');
    let nextPage = that.data.nextPage;
    let endPage = that.data.endPage;
    if ((endPage > 0 && nextPage + 1 <= endPage) || endPage == 0)
      nextPage = nextPage + 1;
    else
      return

    let userLocal = [];
    userLocal.latitude = lat;
    userLocal.longitude = lng;
    userLocal.sortId = typeId;

    let param = {
      API_URL: conf.newsListDisUrl + "?page=" + nextPage,
      data: userLocal,
      method: "POST"
    };

    newData.result(param).then(res => {
      let tdata = [];
      let nList = res.data.data;
      let pred = that.data.newsList;
      if (nList != undefined) {
        nList.forEach(function(news) {
          news.fdate = moment(news.shop.user.updated_at.date).fromNow() + "来过";
        });
      }
      //想明白了再动此
      if (nextPage == 1) {
        tdata = nList;
      } else if (nextPage > 1 && !isEnd) {
        tdata = pred.concat(nList);
      } else if (nextPage > 1 && isEnd) {
        tdata = pred;
      }
      let sPage = 0;
      if (res.data.status_code == 200) {
        sPage = res.data.meta.last_page;
      } else {
        that.setData({
          isEnd: true,
        })
      }
      that.setData({
        newsList: tdata,
        nextPage: nextPage,
        endPage: sPage
      });
      if (nextPage == sPage) {
        that.setData({
          isEnd: true,
        })
      }

      // 隐藏加载框
      wx.hideLoading();
      // 隐藏导航栏加载框  
      wx.hideNavigationBarLoading();
      // 停止下拉动作  
      wx.stopPullDownRefresh();
    })
  },

  //固定导航实现
  onPageScroll: function(res) {
    let self = this;
    let top = res.scrollTop;
    self.setData({
      scrollTop: top
    });
  },
  defaultType: function() {
    let that = this;
    let param = {
      API_URL: conf.sortUrl + that.data.currentId,
    };

    newData.result(param).then(res => {
      that.setData({
        sortType: res.data,
      });
    })
  },
  getSort: function(e) {
    let id = '';
    if (e != undefined)
      id = e.currentTarget.id;
    let that = this;
    let param = {
      API_URL: conf.sortUrl + id,
    };

    newData.result(param).then(res => {
      if (id == '') {
        that.setData({
          sortKind: res.data,
          isEnd: false
        });
      } else {
        that.setData({
          currentId: id,
          preFlag: true,
          // typeId: 'all',
          sortType: res.data,
          isEnd: false
        });
        that.getData()
      }
    })
  },
  getType: function(e) {
    let that = this;
    let typeId = e.currentTarget.id;
    let dId = that.data.typeId;
    if (dId == typeId)
      typeId = '';

    that.setData({
      typeId: typeId,
      preFlag: true,
      isEnd: false
    })
    that.getData();
  },
  //按钮选中事件
  setSort: function(e) {
    if (e.currentTarget.id == "1") {
      this.setData({
        isNew: true
      })
    } else {
      this.setData({
        isNew: false
      })
    }
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var self = this;
    self.getData();
  },

  //页面上拉触底事件的处理函数
  onReachBottom: function() {
    this.getData();
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
  onShareAppMessage: function() {
    return {
      title: '苗果——种苗服务平台',
      desc: '免费入驻，即刻拥有属于自己的微信传播平台...',
      path: '/pages/list/list',
      // imageUrl: "/images/use/logo.png",
      success: function(res) {
        // 分享成功
      },
      fail: function(res) {
        // 分享失败
      }
    }
  },
})