var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    currentTab: 0,
    count: 0,

    itemsO: [],
    items2: [],

    itemrecitals2: {},
  },

  onLoad: function(options) {
    var that = this
    if (options) {
      that.data.itemsO = JSON.parse(options.items)
    }
    this.init()
  },

  init: function() {
    var that = this
    var str1 = wx.getStorageSync("itemrecitals2")
    if (str1.length > 0) {
      that.data.itemrecitals2 = JSON.parse(str1)
    } else {
      that.data.itemrecitals2 = {}
    }

    that.data.items2 = []
    for (var j = 0, len = that.data.itemsO.length; j < len; j++) {
      var v = app.globalData.items[that.data.itemsO[j]]
      v.Bookname = app.globalData.books[v.Bid].Name
      that.data.items2.push(v)
    }

    that.setData({
      items2: that.data.items2
    })
  },

  previewImage: function(e) {
    util.previewImage(e)
  },

  removeRecital: function(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要重新背诵吗？',
      success: function(sm) {
        if (sm.confirm) {
          console.log('用户点击确认')
          var v = that.data.items2[e.target.dataset.index]
          app.dbUpdateItemRecital(v.Id, 0)
          if (itemrecitals2[v.Id] > 0) {
            that.data.itemrecitals2[v.Id] = 0
            wx.setStorageSync("itemrecitals2", JSON.stringify(that.data.itemrecitals2))
          }
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  clickItem: function(e) {
    if (e.target.dataset.iid)
      wx.navigateTo({
        url: '../itemdetail/itemdetail?mode=0&itemid=' + e.target.dataset.iid,
      })
  },

})
