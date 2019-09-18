const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTimeForDB = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + 'T' + [hour, minute, second].map(formatNumber).join(':') + "+00:00"
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

function showHint(msg) {
  wx.showToast({
    title: msg,
    icon: 'success',
    duration: 1000
  })
}

function showHintBad(msg) {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 1000
  })
}

function previewImage(e) {
  var current = e.target.dataset.src;
  wx.previewImage({
    current: current,
    urls: [current]
  })
}

function checkExplainbyphoto(s) {
  var len1 = s.length
  var exts = new Array("jpg", "jpeg", "jfif","png")
  if (len1 == 50 || len1 == 51) {
    var list1 = s.split(".")
    if (list1.length > 1) {
        var ext = list1[1].slice(0, -1).toLowerCase()
	    console.log(ext)
        if (exts.includes(ext))
	    return true
    }
  }
  return false
}
module.exports = {
  formatTimeForDB: formatTimeForDB,
  formatDate: formatDate,
  showHint: showHint,
  showHintBad: showHintBad,
  previewImage: previewImage,
  checkExplainbyphoto: checkExplainbyphoto,
}
