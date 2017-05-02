'use strict'

/**
 * @todo
 * - create smooth mouse enter
 * - back to original position when mouse leave
 */
var raf = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (cb) { setTimeout(cb, 1000 / 60) }

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
    div.style.marginTop = opts.spaceBetweenFrame + 'px'
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
    div.style.top = '-' + (opts.spaceBetweenFrame + 'px')
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
  this.tick = false
  this.getOptions(opts)
  this.init()
  this.bind()
}

FrameParallax.prototype.getOptions = function (opts) {
  var baseOpts = {
    parallaxTranslation: 20,
    spaceBetweenFrame: 25,
    densityFrame: 2,
    colorFrame: '#000'
  }
  this.opts = assign(baseOpts, opts)
  return this
}

FrameParallax.prototype.init = function () {
  this.$wrapper = wrapper(this.opts)
  this.$border = border(this.opts)

  // Set parent to wrapper
  this.$el.parentNode.replaceChild(this.$wrapper, this.$el)
  this.$wrapper.appendChild(this.$border) // Set sibling
  this.$wrapper.appendChild(this.$el)
  return this
}

FrameParallax.prototype.mouseMove = function (ev) {
  if (this.tick) {
    return this
  }
  this.tick = true
  raf(function () {
    this.update(ev)
  }.bind(this))
  return this
}

FrameParallax.prototype.update = function (ev) {
  var pt = this.opts.parallaxTranslation
  var transX = ((pt / this.$el.offsetWidth) * ev.clientX) - (pt / 2)
  var transY = ((pt / this.$el.offsetHeight) * ev.clientY) - (pt / 2)

  this.$el.style.transform = 'translate(' + transX + 'px, ' + transY + 'px)'
  this.$border.style.transform = 'translate(' + (transX * -1) + 'px, ' + (transY * -1) + 'px)'
  this.tick = false
  return this
}

FrameParallax.prototype.bind = function () {
  this.$wrapper.addEventListener('mousemove', this.mouseMove.bind(this))
  return this
}
