/**
     * 1. 支持水平和垂直滚动，包括ltr、rtl，ttb、btt四个方向
     * 2. 支持指定速度
     * 3. 支持动态添加和减少项目，这个必须支持
     * 
     */
 const defaultOptions = {
  contentClass: '.content',
  itemClass: '.item',
  duration: 60,
  speed: 8
}
function SmoothSlide(options) {
  if (!(this instanceof SmoothSlide)) {
    throw 'SmoothSlide必须以构造器的方式调用'
  }
  this.options = Object.assign({}, defaultOptions, options)
  this.init()
}

SmoothSlide.prototype.start = function() {
  let that = this
  this.timer = setInterval(function run() {
    that.run()
  }, this.options.duration)
}

SmoothSlide.prototype.stop = function() {
  this.timer && clearInterval(this.timer)
}

// 寻找可视区内第一个元素
SmoothSlide.prototype.findFirstItemInView = function() {
  const offsetTop = -this.content.offsetTop
  const item = this.items.find(x => x.offsetTop <= offsetTop && offsetTop < (x.offsetTop + this.itemHeight))
  return item
}

SmoothSlide.prototype.isInView = function(item) {
  const offsetTop = -this.content.offsetTop
  const offsetBottom = offsetTop + this.container.offsetHeight
  return !((item.offsetTop + item.offsetHeight) < offsetTop || item.offsetTop > offsetBottom)
}

SmoothSlide.prototype.getPlaceOfItem = function(item) {
  const offsetTop = -this.content.offsetTop
  const offsetBottom = offsetTop + this.container.offsetHeight
  if (item.offsetTop + item.offsetHeight < offsetTop) {
    return 'above'
  }
  if (item.offsetTop > offsetBottom) {
    return 'under'
  }
  return 'in'
}

SmoothSlide.prototype.addItem = function(item) {
  // 获取当前可视区内首个，然后把新的内容插到他的上面
  const firstItem = this.findFirstItemInView()
  if (firstItem) {
    this.content.insertBefore(item, firstItem)
    this.content.style.top = this.content.offsetTop - this.itemHeight + 'px'
  } else {
    this.content.appendChild(item)
  }
  this.calcHeight()
}

SmoothSlide.prototype.removeItem = function(item) {
  // 判断要删除元素是在视口上面、里面还是下面
  // 如果在上面，则相应减少top
  // 如果在下面不修改top
  // 如果在中间也先不处理吧，做好能等到它离开可视区再做删除
  let place = this.getPlaceOfItem(item)
  if (place === 'above') {
    item.parentNode.removeChild(item)
    // debugger
    this.content.style.top = this.content.offsetTop + this.itemHeight + 'px'
    this.calcHeight()
  }
  if (place === 'under') {
    item.parentNode.removeChild(item)
    this.calcHeight()
  }
  if (place === 'in') {
    // 开启定时器，等离开可视区域再删除
    let that = this
    setTimeout(function() {
      that.removeItem(item)
    }, this.options.duration * 10)
  }
}

SmoothSlide.prototype.init = function() {
  this.container = document.querySelector(this.options.el)
  this.content = this.container.querySelector(this.options.contentClass)
  // this.items = this.content.querySelectorAll(this.options.itemClass) // 项目支持动态变化，因此这里不是最终的，在addItem和removeItem中会重新计算
  this.items = Array.prototype.slice.call(this.content.querySelectorAll(this.options.itemClass))
  let firstItem = this.items[0]
  let cloneItem = firstItem.cloneNode()
  cloneItem.classList.add('clone-item')
  console.log('cloneItem:', cloneItem.outerHTML)
  this.content.innerHTML = '<div class="empty"></div>' + this.content.innerHTML // + cloneItem.outerHTML
  this.emptyItem = this.content.querySelector('.empty')
  this.emptyItemHeight = this.emptyItem.offsetHeight
  this.calcHeight()
  // 初始化时显示到追加的那个元素上
  this.content.style.top = -((this.items.length - 1) * this.itemHeight + this.emptyItemHeight) + 'px'
  let that = this
  this.container.onmouseover = function() {
    that.stop()
  }

  this.container.onmouseout = function() {
    that.start()
  }
}

SmoothSlide.prototype.run = function() {
  let content = this.content
  if (content.offsetTop > 0) {
      content.style.top = -(this.emptyItemHeight + this.itemHeight * this.items.length - 1) + "px"
  }

  content.style.top = content.offsetTop + this.options.speed + "px"
}

SmoothSlide.prototype.calcHeight = function() {
  // this.items = this.content.querySelectorAll(this.options.itemClass)
  this.items = Array.prototype.slice.call(this.content.querySelectorAll(this.options.itemClass))
  this.itemHeight = this.items && this.items[0].offsetHeight || 0
  this.content.style.height = this.emptyItemHeight + this.items.length * (this.items && this.items[0].offsetHeight || 0) + 'px'
}