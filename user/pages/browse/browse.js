var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    currentTab: 0,
    count: 0,
    itemsb: [],
    itemsf: [],
    books2: [],
    booksIndex_search: 0,
  },

  onShow: function(options) {
    var that = this
    if (!app.globalData.ready) {
      console.log("wait")
      setTimeout(function() {
        that.onShow()
      }, 2000)
    } else {
      app.dbGetItems2("", that.init)
    }
  },

  init: function() {
    app.dbGetAllItemBroPhotos()
    this.data.books2 = []
    for (var key in app.globalData.books) {
      var v = app.globalData.books[key]
      this.data.books2.push(v)
    }

    this.data.itemsb = []

    for (var key in app.globalData.itemsBro) {
      var v = app.globalData.itemsBro[key]
      if (v.Bid in app.globalData.books) {
        v.Bookname = app.globalData.books[v.Bid].Name
        this.data.itemsb.unshift(v)
      }
    }
    this.data.itemsf = []

    for (var key in app.globalData.favorites) {
      var v = app.globalData.itemsFavor[key]
      if (v.Bid in app.globalData.books) {
        v.Bookname = app.globalData.books[v.Bid].Name
        this.data.itemsf.unshift(v)
      }
    }
    this.setData({
      itemsb: this.data.itemsb,
      itemsf: this.data.itemsf,
      books2: this.data.books2,
    })
  },

  pickerBooksChange2: function(e) {
    this.data.booksIndex_search = parseInt(e.detail.value)
    this.setData({
      booksIndex_search: parseInt(e.detail.value)
    })
  },

  clickItem: function(e) {
    if (e.target.dataset.iid)
      wx.navigateTo({
        url: '../itemdetail/itemdetail?mode='+e.target.dataset.mode+'&itemid=' + e.target.dataset.iid,
      })
  },

  itemsearch_formSubmit: function(e) {
    app.globalData.dirty["itemsBro"] = true

    if (e.detail.value.search.length < 1) {
      app.dbGetItems2("bid:" + this.data.books2[this.data.booksIndex_search].Id, this.init)
    } else {
      app.dbGetItems2("name__contains:" + e.detail.value.search, this.init)
    }
  },
  swiperTab: function(e) {
    var that = this
    that.setData({
      currentTab: e.detail.current
    })
  },

  clickTab: function(e) {
    var that = this
    if (this.data.currentTab === e.target.dataset.current) {
      return false
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
})
