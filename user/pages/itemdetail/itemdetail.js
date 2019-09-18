const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    mode: 0,
    itemid: 0,
    item: {},
    books2: [],
    bookIndex: 0,
    comments: [],
  },

  previewImage: function(e) {
    util.previewImage(e)
  },

  init: function() {
    var that = this
    var v
    if (that.data.mode == 0)
      v = app.globalData.items[that.data.itemid]
    else if (that.data.mode == 1)
      v = app.globalData.itemsBro[that.data.itemid]
    else
      v = app.globalData.itemsFavor[that.data.itemid]

    that.data.books2 = []
    for (var key in app.globalData.books) {
      var v2 = app.globalData.books[key]
      if (v2.Id == v.Bid)
        that.data.bookIndex = that.data.books2.length
      that.data.books2.push(v2)
    }

    app.dbGetItemComments(that.data.itemid, function(comments) {
     that.setData({
        comments: comments,
      })
    })

    v.infavorite = false
    if (that.data.itemid in app.globalData.favorites) {
      v.infavorite = true
    }

    that.setData({
      item: v,
      books2: that.data.books2,
      bookIndex: that.data.bookIndex,
    })
  },

  addFavorite: function() {
    app.dbNewFavorites(this.data.itemid)
    var v = this.data.item
    v.infavorite = true
    this.setData({
      item: v,
    })
  },

  removeFavorite: function() {
    app.dbDeleteFavorites(this.data.itemid)
    var v = this.data.item
    v.infavorite = false
    this.setData({
      item: v,
    })
  },

  reloadData: function() {
    this.init()
    console.log("itemdetail, reloadData....")
  },

  onLoad: function(options) {
    if (options) {
      this.data.mode = parseInt(options.mode)
      this.data.itemid = parseInt(options.itemid)
    }
    this.reloadData()
  },
})
