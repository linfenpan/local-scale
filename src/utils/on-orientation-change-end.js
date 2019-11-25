'use strict';

/**
 * 检测 orientationChangeEnd 
 * @param {function} callback 监听回调
 * @param {object} config 
 * @property {number} [config.noChangeCountToEnd=100] 屏幕宽度没有发生变化时，检测的迭代次数
 * @property {number} [config.noEndTimeout=1000] 检测的超时时间
 */
export default function onOrientationChangeEnd(callback, config) {
  const global = window;

  config = Object.assign({
    noChangeCountToEnd: 100,
    noEndTimeout: 1000,
  }, config || {});

  let lastEnd = null;
  let fn = (event) => {
    // @see 参考 https://github.com/gajus/orientationchangeend
    let interval,
      timeout,
      end,
      lastInnerWidth,
      lastInnerHeight,
      noChangeCount;

    end = function (dispatchEvent) {
      clearInterval(interval);
      clearTimeout(timeout);

      interval = null;
      timeout = null;

      if (dispatchEvent) {
        callback(event);
      }
    };

    // If there is a series of orientationchange events fired one after another,
    // where n event orientationchangeend event has not been fired before the n+2 orientationchange,
    // then orientationchangeend will fire only for the last orientationchange event in the series.
    if (lastEnd) {
      lastEnd(false);
    }

    lastEnd = end;

    interval = setInterval(function () {
      if (global.innerWidth === lastInnerWidth && global.innerHeight === lastInnerHeight) {
        noChangeCount++;

        if (noChangeCount === config.noChangeCountToEnd) {
          end(true);
        }
      } else {
        lastInnerWidth = global.innerWidth;
        lastInnerHeight = global.innerHeight;
        noChangeCount = 0;
      }
    });
    timeout = setTimeout(function () {
      end(true);
    }, config.noEndTimeout);
  };
  
  global.addEventListener('orientationchange', fn);
  let off = () => { global.removeEventListener('orientationchange', fn); fn = null; }

  return off;
};