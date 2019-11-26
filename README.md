# @lfp/local-scale v0.0.2
一个移动端，局部区域等比缩放的方案。

## 背景
移动端开发时，经常整体页面缩放 或者 响应式开发。
但遇到这么个场景: `在响应式开发时，部分图文混排的内容，要根据宽度进行缩放`。

于是有了这么一个工具。

## 使用
监听这个页面的特定元素，默认是 `.local-scale`
```javascript
var ls = new LocalScale('.local-scale');
// 启动脚本，默认监听resize、orientation事件
ls.start();
```

`html`方面:
```html
<!-- .local-scale 的div，其中的 height, width, transform, margin 都将会被改写 -->
<div class="local-scale">
  <!-- 
    * 只能有1个子元素
    * 此子元素将会强制更变为绝对定位
    * margin值将全部失效
    * 可以指定 data-ls-width 说明此元素的原始宽度，不设定，默认则是 750
  -->
  <div data-ls-width="750">
    <!-- 里面没有其他限制 -->
  </div>
</div>
```

## 参数
构造函数如下:
```javascript
new LocalScale(selector:String, options:Object);
```

### options 属性如下

* @property {dom} root 选择器所在的根容器
* @property {number} width 原始的宽度，会被 data-ls-width 覆盖
* @property {number} [height=0] 原始的高度；如果值是0，则进行动态计算；会被 data-ls-height 覆盖
* @property {boolean} [watchResize=true] 是否监听页面缩放、旋屏等操作
* @property {boolean} [watchLoad=false] 是否监听dom内的load事件
* @property {string} [attr='data-ls'] 用于覆盖默认参数的属性前缀，用于解决与当前属性有冲突的问题，一般可不管
* @property {function} parseHeight 高度计算函数，parseHeight(height, scale) { return height * scale }

## 方法

### localScale.update()
更新全部元素的缩放


## 样式
脚本会强制插入 `style`，注意避让:
```css
.local-scale {
  position: relative;
  transform-origin: 0% 0%;
}
.local-scale >:first-child {
  position: absolute;
  margin: 0!important;
  top: 0!important;
  left: 0!important;
  width: 100%;
}
.local-scale-bg-helper {
  width: 100%;
  height: 0.0000000001px;/* 让浏览器解析为 0，兼容 iphone 的异常情况 */
  position: relative;
  overflow: hidden;
  clear: both;
}
.local-scale-prepare >:first-child {
  position: relative;
}
.local-scale-prepare .local-scale-bg-helper {
  display: none;
}
```


## 注意事项

* 整体是基于 `transform: scale` 制作的，缩放的时候，宽高会出现小数，绝大部分场景都可无视。实在没辙，可以用 overflow: hidden 解决宽度小数问题，用 options.parseHeight 解决高度小数的问题。
* 如果是整体页面缩放，请不要使用此脚本。建议用 meta，或者 rem、vw、vh 之类的
* 仅供个人参考学习，实际使用请慎重~


## 更新记录

* v0.0.2 占用 local-scale 的 margin 样式
* v0.0.2 支持 local-scale 背景设置