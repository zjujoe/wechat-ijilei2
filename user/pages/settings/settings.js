var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    books2: [],
    currentBidIndex: 0,
    LIFO: false,
    currentLimit: 0,
    currentLimit2: 100,
  },

  onLoad: function(options) {
    var that = this
    if (!app.globalData.ready) {
      console.log("wait")
      setTimeout(function() {
        that.onLoad()
      }, 2000)
    } else {
      that.init()
    }
  },

  init: function() {
    this.data.books2 = []
    for (var key in app.globalData.books) {
      var v = app.globalData.books[key]
      if (v.Id == app.globalData.currentBid)
        this.data.currentBidIndex = this.data.books2.length
      this.data.books2.push(v)
    }

    if (app.globalData.currentOrder == "asc")
      this.data.LIFO = false
    else
      this.data.LIFO = true
    this.data.currentLimit = app.globalData.currentLimit
    this.data.currentLimit2 = app.globalData.currentLimit2

    this.setData({
      books2: this.data.books2,
      currentBidIndex: this.data.currentBidIndex,
      currentLimit: this.data.currentLimit,
      currentLimit2: this.data.currentLimit2,
      LIFO: this.data.LIFO,
    })
  },

  dbUpdateUserSucceed: function() {
    this.dbReset()
    util.showHint("设置成功")
  },

  //提交分类名称
  setting_formSubmit: function(e) {
    var that = this
    if (!app.globalData.ready)
      return

    that.data.currentLimit = parseInt(e.detail.value.limit)
    if (isNaN(that.data.currentLimit)) {
      util.showHintBad("请输入正确数字")
      return
    }
    that.data.currentLimit2 = parseInt(e.detail.value.limit2)
    if (isNaN(that.data.currentLimit2)) {
      util.showHintBad("请输入正确数字")
      return
    }
    var bid = that.data.books2[that.data.currentBidIndex].Id

    var order;
    if (this.data.LIFO) {
      order = "desc"
    } else {
      order = "asc"
    }

    if (bid == app.globalData.currentBid && that.data.currentLimit == app.globalData.currentLimit &&
      order == app.globalData.currentOrder && that.data.currentLimit2 == app.globalData.currentLimit2) {
      util.showHintBad("设置没有变化")
      return
    }


    app.dbUpdateUser(app.globalData.userid, bid, order, that.data.currentLimit, that.data.currentLimit2, that.dbUpdateUserSucceed)
  },

  previewImage: function(e) {
    util.previewImage(e)
  },

  dbReset: function() {
    app.dbReset()
    this.onLoad()
  },

  resetBookRecitals: function() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要重新背诵吗？',
      success: function(sm) {
        if (sm.confirm) {
          console.log('用户点击确认')
	  var bid = that.data.books2[that.data.currentBidIndex].Id
	  app.dbDeleteBookRecitals(bid)
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  resetCoreData: function() {
    if (!app.globalData.ready)
      return
    this.dbReset()
    util.showHint('重置成功')
  },

  resetAllData: function() {
    if (!app.globalData.ready)
      return
    try {
      wx.clearStorageSync()
    } catch (e) {
      console.log("wx.clearStorageSync", e)
    }
    this.dbReset()
    util.showHint('重置成功 0.80')
  },

  changeSwitch: function(e) {
    this.data.LIFO = e.detail.value
  },

  pickerBook: function(e) {
    this.setData({
      currentBidIndex: parseInt(e.detail.value)
    })
  },

  clickItem: function(e) {
    if (e.target.dataset.aid)
      wx.navigateTo({
        url: '../item/item?itemid=' + e.target.dataset.aid,
      })
  },

})
