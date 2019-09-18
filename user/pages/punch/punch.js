const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    bid: 0,
    bookname: "",
    itemnum: 0,
    locked: false,

    timeIndex: [0, 0],
    time: [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]
    ],

    location: "点击获取位置信息",
    longitude: "",
    latitude: "",
  },

  onLoad: function(options) {
    if (options) {
      this.data.bid = parseInt(options.bid)
      this.data.bookname = app.globalData.books[this.data.bid].Name
      this.data.itemnum = parseInt(options.itemnum)
    }
  },

  onShow: function(options) {
    var that = this
    if (!app.globalData.ready) {
      console.log("wait")
      setTimeout(function() {
        that.onShow()
      }, 1000)
    } else {
      that.init()
    }
  },

  init: function() {
    console.log("punch, init....")
    var that = this

    that.setData({
      itemnum: that.data.itemnum,
      bookname: that.data.bookname,
    })
  },

  bindTimeChange: function(e) {
    this.setData({
      timeIndex: e.detail.value
    })
  },

  punch_formSubmit(e) {
    var that = this
    if (!that.data.locked) {
      that.data.locked = true;
    } else {
      return;
    }
    if (that.data.longitude == "") {
      wx.showModal({
        title: '信息不全',
        content: '请点击获取位置信息。',
        confirmText: '知道了',
        showCancel: false,
      })
      return
    } else if (that.data.time[0][that.data.timeIndex[0]] * 60 + that.data.time[1][that.data.timeIndex[1]] < 10) {
      util.showHintBad("至少学习 10 分钟")
      return
    }
    var duration = util.formatTimeFromHM(that.data.time[0][that.data.timeIndex[0]], that.data.time[1][that.data.timeIndex[1]])
    var lon = that.data.longitude.toString()
    var lat = that.data.latitude.toString()

    app.dbNewPunch(duration, that.data.bid, that.data.itemnum, lon, lat, function() {
      wx.showModal({
        title: "成功",
        content: "打卡成功！",
        showCancel: false,
        confirmText: "知道了",
        success: function(res) {
          wx.navigateBack({
            delta: 1
          })
        }
      })

    })

    return

  },

  chooseLocation: function() {
    var that = this
    if (that.data.longitude == "" || that.data.latitude == "") {
      wx.getLocation({
        type: 'gcj02',
        success: function(res) {
          console.log(res)
          that.setData({
            longitude: res.longitude,
            latitude: res.latitude,
            location: "E: " + res.longitude + "' N: " + res.latitude + "'"
          })
        }
      })
    } else {
      const latitude = that.data.latitude
      const longitude = that.data.longitude
      wx.openLocation({
        latitude,
        longitude,
        scale: 18
      })
    }
  },
})
