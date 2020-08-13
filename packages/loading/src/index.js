import Vue from 'vue';
import loadingVue from './loading.vue';
import { addClass, removeClass, getStyle } from 'element-ui/src/utils/dom';
import { PopupManager } from 'element-ui/src/utils/popup';
import afterLeave from 'element-ui/src/utils/after-leave';
import merge from 'element-ui/src/utils/merge';

//创建了一个子类，根据一个vue文件创建
const LoadingConstructor = Vue.extend(loadingVue);

//插件的参数名称
const defaults = {
  text: null,//
  fullscreen: true,//
  body: false,//
  lock: false,//
  customClass: ''//
};

//临时变量
let fullscreenLoading;

//原始位置，原始涂层高度
LoadingConstructor.prototype.originalPosition = '';
LoadingConstructor.prototype.originalOverflow = '';

//关闭的函数，用来服务调用
LoadingConstructor.prototype.close = function () {

  //如果全屏幕，就给全屏家在设为未定义，为啥呢？
  if (this.fullscreen) {
    //清空上次全屏的实例？
    fullscreenLoading = undefined;
  }
  //是调用进来的一个函数，不知道是为了干啥，
  afterLeave(this, _ => {
    const target = this.fullscreen || this.body
      ? document.body
      : this.target;
    removeClass(target, 'el-loading-parent--relative');
    removeClass(target, 'el-loading-parent--hidden');
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
    this.$destroy();
  }, 300);
  //把这个函数的执行上下纹确定了，那这个visible是哪里的visible？
  this.visible = false;
};

//传入要加的选项，和父元素，和子元素的实例。
const addStyle = (options, parent, instance) => {
  let maskStyle = {};
  if (options.fullscreen) {
    instance.originalPosition = getStyle(document.body, 'position');
    instance.originalOverflow = getStyle(document.body, 'overflow');
    maskStyle.zIndex = PopupManager.nextZIndex();
  } else if (options.body) {
    instance.originalPosition = getStyle(document.body, 'position');
    ['top', 'left'].forEach(property => {
      let scroll = property === 'top' ? 'scrollTop' : 'scrollLeft';
      maskStyle[property] = options.target.getBoundingClientRect()[property] +
        document.body[scroll] +
        document.documentElement[scroll] +
        'px';
    });
    ['height', 'width'].forEach(property => {
      maskStyle[property] = options.target.getBoundingClientRect()[property] + 'px';
    });
  } else {
    instance.originalPosition = getStyle(parent, 'position');
  }
  Object.keys(maskStyle).forEach(property => {
    instance.$el.style[property] = maskStyle[property];
  });
};

//最后只导出了这个东西？
const Loading = (options = {}) => {
  if (Vue.prototype.$isServer) return;//这句话我也能加上，但感觉挺废柴的
  // 把所有的选项合并，第一个为什么有个空对象？然后default是默认参数，options是传入的配置，所以谁给他传这个options
  options = merge({}, defaults, options);
  //哪来的target？
  if (typeof options.target === 'string') {
    options.target = document.querySelector(options.target);
  }
  options.target = options.target || document.body;
  if (options.target !== document.body) {
    options.fullscreen = false;
  } else {
    options.body = true;
  }
  if (options.fullscreen && fullscreenLoading) {
    return fullscreenLoading;
  }

  let parent = options.body ? document.body : options.target;
  let instance = new LoadingConstructor({
    el: document.createElement('div'),
    data: options
  });

  //给子元素添加样式
  addStyle(options, parent, instance);
  if (instance.originalPosition !== 'absolute' && instance.originalPosition !== 'fixed') {
    addClass(parent, 'el-loading-parent--relative');
  }
  if (options.fullscreen && options.lock) {
    addClass(parent, 'el-loading-parent--hidden');
  }
  parent.appendChild(instance.$el);
  //下次dom更新循环后将实例设为可见
  Vue.nextTick(() => {
    instance.visible = true;
  });
  //如果实例是全屏的，则将全屏实例保存在闭包中
  if (options.fullscreen) {
    fullscreenLoading = instance;
  }
  //返回实例
  return instance;
};

export default Loading;
