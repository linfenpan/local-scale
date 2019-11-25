'use strict';
import onOrientationChangeEnd from './on-orientation-change-end';

export default {
  listeners: [],

  /**
   * 启动监听
   */
  $start() {
    const ctx = this;
    if (ctx.$isStart) { return; }
    
    // @see https://github.com/gajus/scream/blob/master/src/scream.js
    let isOrientationChanging;
    const global = window;

    // android 2.3 不支持的，用之前判定一下
    // Media matcher is the first to pick up the orientation change.
    
    if (global.matchMedia) {
      ctx.$fnMd = function() { isOrientationChanging = true; };
      ctx.$media = global.matchMedia('(orientation: portrait)');
      ctx.$media.addListener(ctx.$mFn);
    }

    ctx.$offChangeEnd = onOrientationChangeEnd(function() {
      isOrientationChanging = false;
    });

    ctx.$fnOc = function() { ctx.$run(); };
    global.addEventListener('orientationchange', ctx.$fnOc);

    ctx.$fnRz = function() { if (!isOrientationChanging) { ctx.$run(); } };
    global.addEventListener('resize', ctx.$fnRz);

    ctx.$isStart = true;
  },
  /**
   * 关闭监听
   */
  $stop() {
    const ctx = this;
    const global = window;

    ctx.$media && ctx.$media.removeListener(ctx.$mFn);
    ctx.$media = null;
    ctx.$mFn = null;

    global.removeEventListener('orientationchange', ctx.$fnOc);
    ctx.$fnOc = null;

    global.removeEventListener('resize', ctx.$fnRz);
    ctx.$fnRz = null;

    ctx.$isStart = false;
  },
  /**
   * 执行监听器
   */
  $run() {
    const ctx = this;
    if (ctx.$runTimer) { return; }
    ctx.$runTimer = setTimeout(() => {
      ctx.$runTimer = null;
      const listeners = ctx.listeners.slice(0);
      listeners.forEach(fn => fn());
    }, 20);
  },
  /**
   * 监听事件
   * @param {function} listener 
   */
  on(listener) {
    this.listeners.push(listener);
    this.$start();
  },
  /**
   * 取消事件监听
   * @param {function} listener 
   */
  off(listener) {
    const ctx = this;
    const index = ctx.listeners.findIndex(l => l === listener);
    if (index >= 0) {
      ctx.listeners.splice(index, 1);
    }
    if (ctx.listeners.length <= 0) {
      this.$stop();
    }
  }
}