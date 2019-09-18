const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    itemid: 0,
    item: {},
    types: ["笔记", "建议"],
    currentTypeIndex: 0,
  },

  pickerCommentType: function (e) {
    this.setData({
      currentTypeIndex: parseInt(e.detail.value)
    })
  },

  item_formSubmit: function (e) {
    var that = this
    var v = e.detail.value

    if (v.comments.length < 5) {
      util.showHintBad("输入不完整")
      return
    }

    app.dbNewItemComments(that.data.itemid, that.data.types[that.data.currentTypeIndex], v.comments, function () {
      util.showHint("已经提交！")
      that.init()
    })

  },

  init: function () {
    var that = this
    var v = app.globalData.items[that.data.itemid]
    that.data.books2 = []
    for (var key in app.globalData.books) {
      var v2 = app.globalData.books[key]
      if (v2.Id == v.Bid) {
        v.Bookname = v2.Name
        break
      }
    }

    that.setData({
      item: v,
      books2: that.data.books2,
      types: that.data.types,
      currentTypeIndex: that.data.currentTypeIndex,
    })
  },

  onLoad: function (options) {
    if (options) {
      this.data.itemid = parseInt(options.itemid)
    }
    this.init()
  },
})
