var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    currentTab: 0,
    count: 0,
    books2: [],
    bookphoto_new: "",
    bookname_new: "",
    bookdescription_new: "",
  },

  onShow: function(options) {
    var that = this
    if (!app.globalData.ready) {
      console.log("wait")
      setTimeout(function() {
        that.onShow()
      }, 1000)
    } else {
      this.reloadData()
    }
  },

  init: function() {
    this.data.books2 = []
    for (var key in app.globalData.books) {
      var v = app.globalData.books[key]
      this.data.books2.push(v)
    }

    this.setData({
      books2: this.data.books2,
    })
  },

  callInittBookPhotos: function() {
    app.dbGetBookPhotos(this.init)
  },

  reloadData: function() {
    this.data.count = 0
    console.log("itemadmin, reloadData....")
    app.dbGetBooks(this.callInittBookPhotos)

  },

  //提交分类名称
  booknew_formSubmit: function(e) {
    var that = this

    if (e.detail.value.name.length < 2) {
      util.showHintBad("请输入正确名字")
      return
    }

    if (that.data.bookphoto_new.length < 3) {
      util.showHintBad("请选择照片")
      return
    }

    that.data.bookname_new = e.detail.value.name
    that.data.bookdescription_new = e.detail.value.description
    app.dbUploadFile(that.data.bookphoto_new, that.getUploadFile_newbook)
  },

  getUploadFile_newbook: function(data) {
    var that = this
    app.dbNewBook(that.data.bookname_new, that.data.bookdescription_new, data, function() {
      that.setData({
        bookphoto_new: "",
      })
      that.reloadData()
      util.showHint('添加成功')
    })
  },

  chooseImage_newbook: function() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: function(res) {
        if (res.tempFiles[0].size >= 2 * 1024 * 1024) {
          util.showHintBad("照片大于2M!")
          return
        }

        if (res.tempFilePaths.length != 1) {
          util.showHintBad("请添加照片!")
          return
        }
        that.setData({
          bookphoto_new: res.tempFilePaths[0],
        })
      }
    })
  },

  previewImage: function(e) {
    util.previewImage(e)
  },

  clickBook: function(e) {
    console.log("clickbook", e.target.dataset)
    if (e.target.dataset.bid)
      wx.navigateTo({
        url: '../book/book?bookid=' + e.target.dataset.bid,
      })
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
