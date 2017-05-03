'use strict'

/**
 * @todo
 * - back to original position when mouse leave
 * - cancel requestAnimationFrame
 */
var raf = null

function assign(target) {
  var args = Array.prototype.slice.call(arguments)
  for (var i = 1; i < args.length; i++) {
    var source = args[i]
    if (source) {
      for (var key in source) {
        target[key] = source[key]
      }
    }
  }
  return target
}

var wrapper = function (div) {
  div.style.position = 'relative'
  div.style.display = 'inline-block'

  function addAdditionalStyle (opts) {
    div.style.paddingTop = opts.spaceBetweenFrame + 'px'
    return div
  }

  return addAdditionalStyle
}(document.createElement('div'))

var border = function (div) {
  div.style.position = 'absolute'
  div.style.borderStyle = 'solid'
  div.style.margin = '0 auto'
  div.style.left = '0'
  div.style.right = '0'
  div.style.zIndex = '1'

  function addAdditionalStyle (opts) {
    div.style.top = 0
    div.style.bottom = opts.spaceBetweenFrame + 'px'
    div.style.borderWidth = opts.densityFrame + 'px'
    div.style.borderColor = opts.colorFrame
    div.style.width = 'calc(100% - ' + (opts.spaceBetweenFrame * 2) + 'px)'
    return div
  }

  return addAdditionalStyle
}(document.createElement('div'))

function FrameParallax (el, opts) {
  this.$el = el
  this.getOptions(opts)
  this.addElement()
  this.init()
  this.animate()
}

FrameParallax.prototype.getOptions = function (opts) {
  var baseOpts = {
    speedBorder: 22,
    speedImage: 25,
    threshold: 25,
    spaceBetweenFrame: 25,
    densityFrame: 2,
    colorFrame: '#000'
  }
  this.opts = assign(baseOpts, opts)
  return this
}

FrameParallax.prototype.addElement = function () {
  this.$wrapper = wrapper(this.opts)
  this.$border = border(this.opts)

  // Set parent to wrapper
  this.$el.parentNode.replaceChild(this.$wrapper, this.$el)
  this.$wrapper.appendChild(this.$border) // Set sibling
  this.$wrapper.appendChild(this.$el)

  return this
}

FrameParallax.prototype.init = function () {
  this.dim = {
    w: this.$wrapper.offsetWidth,
    h: this.$wrapper.offsetHeight
  }

  var rect = this.$wrapper.getBoundingClientRect()
  this.rect = {
    top: rect.top,
    left: rect.left
  }

  this.running = false

  this.$wrapper.addEventListener('mouseenter', this.onMouseEnter.bind(this))
  this.$wrapper.addEventListener('mouseleave', this.onMouseLeave.bind(this))
  return this
}

FrameParallax.prototype.onMouseEnter = function (ev) {
  this.$wrapper.addEventListener('mousemove', this.move.bind(this))

  this.posx = 0
  this.posy = 0
  this.endx = 0
  this.endy = 0

  this.elX = 0
  this.elY = 0
  this.borderX = 0
  this.borderY = 0

  this.torender = true
  this.move(ev)
}

FrameParallax.prototype.onMouseLeave = function (ev) {
  this.$wrapper.removeEventListener('mousemove', this.move.bind(this))
  this.torender = false
}

FrameParallax.prototype.move = function (ev) {
  this.posx = ((ev.clientX - this.rect.left) / this.dim.w - .5) * 2
  this.posy = ((ev.clientY - this.rect.top) / this.dim.h - .5) * 2
  return this
}

FrameParallax.prototype.animate = function () {
  if (this.running) {
    return this
  }
  this.running = true
  raf = requestAnimationFrame(this.render.bind(this))
  return this
}

// posx & posy from -1 to 1
FrameParallax.prototype.render = function () {
  if (this.torender) {
    // Until threshold
    this.endx = (this.posx * this.opts.threshold)
    this.endy = (this.posy * this.opts.threshold)

    // Add documentation for this
    // 25 - 0 / 25 = 1
    // 1 + 25 -1 / 25 = 1.9
    // 1.9 + 25 - 1.9 / 25 = 1.8
    this.elX += (this.endx - this.elX) / this.opts.speedImage
    this.elY += (this.endy - this.elY) / this.opts.speedImage
    this.borderX += (this.endx - this.borderX) / this.opts.speedBorder
    this.borderY += (this.endy - this.borderY) / this.opts.speedBorder

    // Use translate3d instead translate2d
    // because gfx hardware acceleration to speed up rendering
    // more on http://blog.teamtreehouse.com/increase-your-sites-performance-with-hardware-accelerated-css
    this.$el.style.transform = 'translate3d(' + (-this.elX) + 'px, ' + (-this.elY) + 'px, 0)'
    this.$border.style.transform = 'translate3d(' + this.borderX + 'px, ' + this.borderY + 'px, 0)'
  }
  if (this.running) {
    raf = requestAnimationFrame(this.render.bind(this))
  }
}
