const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    punches: []
  },
  onLoad: function() {
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
    var that = this
    that.data.punches = []
    for (var key in app.globalData.punches) {
      var v = app.globalData.punches[key]
      v.Time = util.formatTimeFromDB(v.CreateDate)
      v.Book = app.globalData.books[v.Bid].Name
      that.data.punches.push(v)
    }
    that.setData({
      punches: that.data.punches
    })
  },
})
