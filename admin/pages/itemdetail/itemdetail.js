const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    itemid: 0,
    item: {},
    books2: [],
    bookIndex: 0,
    imageList: [],
    imageList2: [],
    imageList2b: [],
    imageList2u: [],
    itemname: "",
    itemphoto_orig: "",
    itemphoto: "",
    itemdescription: "",
    explainbyphoto: false,
  },

  getFileName: function(data) {
    var that = this
    that.data.imageList2[that.data.imageList2.length] = data
    that.data.imageList2b[that.data.imageList2b.length] = data
    if (that.data.imageList.length == that.data.imageList2.length) {
      this.setData({
        imageList2: that.data.imageList2,
      })
    }
  },

  getFileName2: function(data) {
    this.data.itemphoto_orig = data
    this.setData({
      itemphoto: data
    })
  },

  chooseImage_updateitem2: function() {
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
          itemphoto: res.tempFilePaths[0],
        })
      }
    })
  },

  previewImage: function(e) {
    util.previewImage(e)
  },

  chooseImage_updateitem: function() {
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
        if (that.data.imageList2.length > 2) {
          util.showHintBad("最多三张照片!")
          return
        }
        that.data.imageList2[that.data.imageList2.length] = res.tempFilePaths[0]
        that.setData({
          imageList2: that.data.imageList2,
        })
      }
    })
  },

  removeImage_updateitem: function(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除该图片吗？',
      success: function(sm) {
        if (sm.confirm) {
          console.log('用户点击确认')
          that.data.imageList2.splice(e.target.dataset.src, 1)
          that.setData({
            imageList2: that.data.imageList2,
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  pickerBooksChange: function(e) {
    this.data.bookIndex = parseInt(e.detail.value)
    this.setData({
      bookIndex: this.data.bookIndex
    })
  },

  item_formSubmit: function(e) {
    var that = this
    var v = e.detail.value

    if (v.name.length < 1) {
      util.showHintBad("输入不完整")
      return
    }

    if (!that.data.explainbyphoto) {
      if (v.description.length < 5) {
        util.showHintBad("输入不完整")
        return
      }
    }

    that.data.itemname = v.name
    if (that.data.explainbyphoto) {
      that.data.itemdescription = that.data.item.Description
    } else {
      that.data.itemdescription = v.description
    }

    //检查有没有更新
    if (that.data.books2[that.data.bookIndex].Id == that.data.item.Bid)
      if (v.name == that.data.item.Name)
        if (that.data.imageList2b.sort().toString() == that.data.imageList2.sort().toString())

          if (that.data.explainbyphoto) {
            if (that.data.itemphoto_orig == that.data.itemphoto) {
              {
                util.showHintBad("没有变化")
                return
              }
            }
          } else {
            if (v.description == that.data.item.Description) {
              util.showHintBad("没有变化")
              return
            }
          }

    if (v.name == that.data.item.Name) {
      that.item_formSubmit_step2(false)
    } else {
      app.dbCheckDuplicateItem(v.name, that.item_formSubmit_step2)
    }
  },

  item_formSubmit_step2: function(duplicate) {
    var that = this
    if (duplicate) {
      util.showHintBad("词条重复")
      return
    }

    if (that.data.explainbyphoto)
      if (that.data.itemphoto_orig != that.data.itemphoto) {
        app.dbUploadFile(that.data.itemphoto, that.item_formSubmit_step3)
        return
      }
    that.item_formSubmit_step3(null);
  },

  item_formSubmit_step3: function(data) {
    var that = this
    if (data != null) {
      that.data.itemdescription = data
    }
    if (that.data.imageList2b.sort().toString() == that.data.imageList2.sort().toString()) {
      that.item_formSubmit_step4(null);
    } else {
      that.data.imageList2u = []
      for (var key in that.data.imageList2) {
        var one = that.data.imageList2[key]
        var index1 = that.data.imageList2b.indexOf(one)
        if (index1 >= 0)
          that.data.imageList2u.push(that.data.imageList[index1])
      }
      if (that.data.imageList2.length > that.data.imageList2u.length) {
        for (var key in that.data.imageList2) {
          var one = that.data.imageList2[key]
          var index1 = that.data.imageList2b.indexOf(one)
          if (index1 < 0)
            app.dbUploadFile(one, that.item_formSubmit_step4)
        }
      } else {
        that.item_formSubmit_step4(null);
      }
    }
  },

  item_formSubmit_step4: function(data) {
    var that = this
    if (data != null) {
      that.data.imageList2u.push(data)
      if (that.data.imageList2u.length < that.data.imageList2.length)
        return
    }
    app.dbUpdateItem(
      that.data.item.Id,
      that.data.item.Creator,
      that.data.books2[that.data.bookIndex].Id,
      that.data.itemname,
      that.data.itemdescription,
      that.data.imageList2u.join(';'),

      function() {
        util.showHint('更新成功')
        var pages = getCurrentPages(); // 当前页面
        var beforePage = pages[pages.length - 2]; // 前一个页面
        wx.navigateBack({
          success: function() {
            beforePage.onLoad(); // 执行前一个页面的onLoad方法
          }
        });
      })

  },

  item_formReset: function(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function(sm) {
        if (sm.confirm) {
          console.log('用户点击确认')
          that.doRemoveItem(e)
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  doRemoveItem: function(e) {
    var that = this

    app.dbDeleteItem(that.data.item.Id,
      function() {
        util.showHint('删除成功')
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

  checkboxChange: function(e) {
    if (e.detail.value.length > 0)
      this.setData({
        explainbyphoto: true
      })
    else
      this.setData({
        explainbyphoto: false
      })
  },

  init: function() {
    var v = app.globalData.items[this.data.itemid]

    this.data.books2 = []
    for (var key in app.globalData.books) {
      var v2 = app.globalData.books[key]
      if (v2.Id == v.Bid)
        this.data.bookIndex = this.data.books2.length
      this.data.books2.push(v2)
    }

    if (util.checkExplainbyphoto(v.Description)) {
      this.setData({
        explainbyphoto: true
      })
      app.dbDownloadOneFile(v.Description.slice(1, -1), this.getFileName2)
    }

    if (v.Photo.length > 0) {
      this.data.imageList = v.Photo.split(";")
      if (this.data.imageList2.length > 0) {
        this.data.imageList2b = []
        for (var key in this.data.imageList2)
          this.data.imageList2b.push(this.data.imageList2[key])
      } else {
        this.data.imageList2 = []
        this.data.imageList2b = []
        for (var key in this.data.imageList) {
          app.dbDownloadOneFile(this.data.imageList[key].slice(1, -1), this.getFileName)
        }
      }
    }
    this.setData({
      item: v,
      books2: this.data.books2,
      bookIndex: this.data.bookIndex
    })
  },

  callbackCount: function() {
    this.data.count++

      if (this.data.count == 2) {
        this.init()
      }
  },

  callInittBookPhotos: function() {
    app.dbGetBookPhotos(this.callbackCount)
  },

  reloadData: function() {
    this.data.count = 0
    console.log("itemadmin, reloadData....")
    app.dbGetBooks(this.callInittBookPhotos)
    app.dbGetItems(this.callbackCount)
  },

  onLoad: function(options) {
    if (options) {
      this.data.itemid = parseInt(options.itemid)
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
