function formatLocal(longitude, latitude) {
    var lat1 = latitude || 0;
    var lng1 = longitude || 0;
    var lat2 = wx.getStorageSync('locLat') || 0;
    var lng2 = wx.getStorageSync('locLng') || 0;

    var rad1 = lat1 * Math.PI / 180.0;
    var rad2 = lat2 * Math.PI / 180.0;
    var a = rad1 - rad2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;

    var r = 6378137;
    var dis = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));
    var rt = parseInt(dis / 1000);

    // console.log("newlist中坐标：" +lat1 + "," + lng1+" 当前定位坐标： "+lat2 + ":" + lng2 +" 距离 "+ rt);
    return rt;
}

module.exports = {
    formatLocal: formatLocal
}
