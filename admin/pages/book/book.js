const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    bookid: 0,
    book: {},
    bookphoto: "",
    bookname: "",
    bookdescription: "",
    bookStatus: ['编辑中', '已完成', '已封存'],
    bookStatus2: [0, 50, 100],
    statusIndex: 0,
  },

  chooseImage_book: function() {
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
          bookphoto: res.tempFilePaths[0],
        })
      }
    })
  },

  //更新分类名称
  book_formSubmit: function(e) {
    var that = this

    if (e.detail.value.name.length < 2) {
      util.showHintBad("请输入正确名字")
      return
    }

    if (that.data.bookphoto.length < 3) {
      util.showHintBad("请选择照片")
      return
    }

    that.data.bookname = e.detail.value.name
    that.data.bookdescription = e.detail.value.description

    if ((e.detail.value.name == that.data.book.Name) && (that.data.bookphoto == that.data.book.filename) &&
      (e.detail.value.description == that.data.book.Description) && (that.data.bookStatus2[that.data.statusIndex] == that.data.book.Status)) {
      util.showHintBad("设置没有变化")
      return
    }

    if ((that.data.bookStatus2[that.data.statusIndex] != that.data.book.Status) && (that.data.statusIndex > 1)) {
      app.dbCheckBookActive(that.data.book.Id, that.book_formSubmit_step2)
    } else {
      that.book_formSubmit_step2(null)
    }
  },

  book_formSubmit_step2: function(active) {
    var that = this
    if (active == true) {
      util.showHintBad("本书被使用中")
      return
    }
    if (that.data.bookphoto != that.data.book.filename)
      app.dbUploadFile(that.data.bookphoto, that.book_formSubmit_step3)
    else
      that.book_formSubmit_step3(that.data.book.Photo)
  },

  book_formSubmit_step3: function(data) {
    var that = this
    app.dbUpdateBook(
      that.data.book.Id,
      that.data.bookname,
      that.data.book.Items,
      that.data.bookdescription,
      that.data.book.CreateDate,
      data,
      that.data.bookStatus2[that.data.statusIndex],
      function() {
        util.showHint('更新成功')
        var pages = getCurrentPages(); // 当前页面
        var beforePage = pages[pages.length - 2]; // 前一个页面
        wx.navigateBack({
          success: function() {
            if (beforePage != undefined)
              beforePage.onLoad(); // 执行前一个页面的onLoad方法
          }
        });
      })
  },

  book_formReset: function(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除这本书吗？',
      success: function(sm) {
        if (sm.confirm) {
          console.log('用户点击确认')
          that.doRemoveBook(e)
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  doRemoveBook: function(e) {
    var that = this
    app.dbDeleteBook(that.data.book.Id, function() {
      util.showHint('删除成功')
      var pages = getCurrentPages(); // 当前页面
      var beforePage = pages[pages.length - 2]; // 前一个页面
      wx.navigateBack({
        success: function() {
          if (beforePage != undefined) {
            beforePage.onLoad(); // 执行前一个页面的onLoad方法
          }
        }
      })
    })
  },

  previewImage: function(e) {
    util.previewImage(e)
  },

  bindStatusChange: function(e) {
    this.setData({
      statusIndex: e.detail.value
    })
  },

  init: function() {
    var v = app.globalData.books[this.data.bookid]
    console.log(v)
    this.setData({
      book: v,
      bookphoto: v.filename,
      statusIndex: this.data.bookStatus2.indexOf(v.Status),
    })
  },

  callInittBookPhotos: function() {
    app.dbGetBookPhotos(this.init)
  },

  reloadData: function() {
    console.log("bookadmin, reloadData....")
    app.dbGetBooks(this.callInittBookPhotos)
  },

  onLoad: function(options) {
    if (options) {
      this.data.bookid = parseInt(options.bookid)
    }
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
})