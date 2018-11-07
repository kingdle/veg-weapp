import newData from '../../utils/DataURL.js';
var conf = require('../../config');
var WxSearch = require('../../wxSearch/wxSearch.js');
var app = getApp();
Page({
  data: {
    // wxSearchData:{
    //   view:{
    //     isShow: true
    //   }
    // }
  },
  onLoad: function() {
    let param = {
      API_URL: conf.ProductUrl,
      method: "GET"
    };
    newData.result(param).then(res => {
      let res_data = res.data.data
      let tagsD = [];
      let tagsId = [];
      for (let i = 0; i < res_data.length; i++) {
        tagsId.push(res_data[i].id);
        tagsD.push(res_data[i].title);
      }
      console.log(tagsId)
      console.log(tagsD)
      var that = this;
      //初始化的时候渲染wxSearchdata
      WxSearch.init(that, 43, tagsD);
      WxSearch.initMindKeys(tagsId);
    })
    
  },
  wxSearchFn: function(e) {
    var that = this
    WxSearch.wxSearchAddHisKey(that);
  },
  wxSearchInput: function(e) {
    var that = this
    WxSearch.wxSearchInput(e, that);
  },
  wxSerchFocus: function(e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function(e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  wxSearchKeyTap: function(e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);
  },
  wxSearchDeleteKey: function(e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function(e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function(e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  }
})