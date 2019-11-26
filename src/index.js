'use strict';
require('./css/index.css');

import OrientationListener from './utils/orientation-listener';
import { addClass, removeClass } from './utils/add-class';
import closet from './utils/closet';

/**
 * 监控dom load事件的key
 */
const KEY_WATCH_LOADED = 'data-ls-wload';

/**
 * 以宽度为基准，进行局部缩放，针对 selector 的第一个子元素，并且 selector 下，仅且仅有1个子元素
 * @constructor
 * @param {string} [selector='.local-scale'] 被检测的选择器
 * @param {object} options 参数选项
 * @property {dom} options.root 选择器所在的根容器
 * @property {number} options.width 原始的宽度，会被 data-ls-width 覆盖
 * @property {number} [options.height=0] 原始的高度；如果值是0，则进行动态计算；会被 data-ls-height 覆盖
 * @property {boolean} [options.watchResize=true] 是否监听页面缩放、旋屏等操作
 * @property {boolean} [options.watchLoad=false] 是否监听dom内的load事件
 * @property {string} [options.attr='data-ls'] 用于覆盖默认参数的属性前缀，用于解决与当前属性有冲突的问题，一般可不管
 * @property {function} options.parseHeight 高度计算函数，parseHeight(height, scale)
 */
class LocalScale {
  constructor(selector, options) {
    this.selector = selector || '.local-scale';
    this.options = Object.assign({
      root: document.body,
      width: 750,
      height: 0,
      watchResize: true,
      watchLoad: false,
      attr: 'data-ls',
      parseHeight(height, scale) { return height * scale; }
    }, options);

    // 单个元素更新
    this.$fnElemUpdate = (e) => {
      const target = e.target || e.srcElement;
      const $el = closet(target, `[${KEY_WATCH_LOADED}]`);
      if ($el) {
        this.update([ $el ]);
      }
    };
  }

  /**
   * 更新所有容器的缩放
   * @param {array<dom>} 更新指定的dom列表
   */
  update($list) {
    // 参考这个文章，能搞出精彩的内容 https://www.zhangxinxu.com/wordpress/2019/08/js-dom-mutation-observer/
    // @notice 可以尝试 MutationObserver 监听元素变化 https://blog.csdn.net/u010419337/article/details/81474311
    // @notice 或者试试 DOMAttrModified 事件 https://developer.mozilla.org/en-US/docs/Web/API/MutationEvent
    const { options, selector } = this;
    const { root, width, height, attr, watchLoad, parseHeight } = options;
    const cls = 'local-scale-prepare';

    const $all = $list || root.querySelectorAll(selector);
    for (let i = 0, max = $all.length; i < max; i++) {
      const $el = $all[i];
      const style = $el.style;

      addClass($el, cls);
      style.width = style.height = 'auto';
      style.webkitTransform = style.transform = '';

      const clientWidth = $el.clientWidth;
      const baseWidth = Number($el.getAttribute(`${attr}-width`) || width);
      const scale = clientWidth / baseWidth;

      style.width = baseWidth + 'px';
      style.webkitTransform = style.transform = `scale(${ scale })`;
      
      const clientHeight = Number($el.getAttribute(`${attr}-height`) || height || $el.clientHeight);
      const styleHeight = parseHeight(clientHeight, 1);
      style.height = styleHeight + 'px';
      style.marginBottom = (scale - 1) * clientHeight + 'px';
      this.$fixBgParent($el);
      
      // const $helper = this.$appendBgHelper($el);
      // $helper.style.height = styleHeight + 'px';
      // $helper.style.marginBottom = (scale - 1) * clientHeight + 'px';

      removeClass($el, cls);
      watchLoad && this.$watchLoad($el);
    }
  }

  // $appendBgHelper($el) {
  //   const children = $el.children;
  //   if (children.length > 1) {
  //     return children[children.length - 1];
  //   }
  //   this.$fixBgParent($el);

  //   const last = document.createElement('div');
  //   last.className = 'local-scale-bg-helper';
  //   $el.appendChild(last);
  //   return last;
  // }
  
  $fixBgParent($el) {
    // 如果是最后一个孩子元素，负 margin 值会带来一块神奇的空白，插入一个空白元素，让它能正常显示
    const $pt = $el.parentElement || $el.parentNode;
    const cls = 'local-scale-bg-helper';
    const { attr } = this.options;
    const key = `${attr}-fix-bg`;
    if ($pt.getAttribute(key)) { return; }

    const $all = $pt.querySelectorAll(`.${cls}`);
    const $last = $all[$all.length - 1];
    if ($last && ($last.parentNode || $last.parentElement) === $pt) { return; }

    $pt.setAttribute(key, 1);
    $pt.insertAdjacentHTML('beforeEnd', `<div class="${cls}"></div>`);
  }

  $watchLoad($el) {
    const attr = KEY_WATCH_LOADED;
    if ($el.getAttribute(attr)) {
      return;
    }
    
    $el.setAttribute(attr, 1);
    $el.addEventListener('load', this.$fnElemUpdate, true);
  }

  $unwatchLoad($el) {
    $el.removeAttribute(KEY_WATCH_LOADED);
    $el.removeEventListener('load', this.$fnElemUpdate, true);
  }

  /**
   * 启动缩放
   */
  start() {
    const ctx = this;
    if (!ctx.$fnResize && ctx.options.watchResize) {
      ctx.$fnResize = ctx.update.bind(ctx);
      OrientationListener.on(ctx.$fnResize);
    }
    ctx.update();
  }

  /**
   * 停止缩放
   */
  stop() {
    const ctx = this;
    if (ctx.$fnResize) {
      OrientationListener.off(ctx.$fnResize);
      ctx.$fnResize = null;
    }

    const { options, selector } = this;
    const { root } = options;
    const $all = root.querySelectorAll(selector);
    for (let i = 0, max = $all.length; i < max; i++) {
      this.$unwatchLoad($all[i])
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.stop();
    this.options = null;
    this.selector = null;
  }
}

export default LocalScale;