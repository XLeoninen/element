import Vue from 'vue';
import Loading from './loading.vue';
import { addClass, removeClass, getStyle } from 'element-ui/src/utils/dom';
import { PopupManager } from 'element-ui/src/utils/popup';
import afterLeave from 'element-ui/src/utils/after-leave';
//extend是干嘛的，继承？使用基础 Vue 构造器，创建一个“子类”。使用的时候new 。。。.¥mount（‘元素定位’）
const Mask = Vue.extend(Loading);

const loadingDirective = {};
loadingDirective.install = Vue => {
  //如果是服务器环境就直接返回
  if (Vue.prototype.$isServer) return;
  //这是一个不允许更改的常量函数
  const toggleLoading = (el, binding) => {
    //这里的binding。value是什么？  是钩子函数传入的值，如果binding为true
    if (binding.value) {

      Vue.nextTick(() => {
        //分别调用了三次insertDOm
        //如果是全屏的话
        //总之都是根据条件去添加对应的属性及类，然后插入结点
        //是全屏的话就是以下逻辑
        if (binding.modifiers.fullscreen) {
          // 传入的修饰符p判断
          // 自定义属性
          el.originalPosition = getStyle(document.body, 'position');
          el.originalOverflow = getStyle(document.body, 'overflow');
          //这里可以控制浮层的高度面得被覆盖
          //这一块儿先简化以下，写个固定值
          el.maskStyle.zIndex = PopupManager.nextZIndex();

          //将全屏的样式添加进去以后，调用插入方法,反正
          addClass(el.mask, 'is-fullscreen');
          //全屏的话直接插入document.body
          insertDom(document.body, el, binding);
          //如果不是全屏的话
        } else {
          removeClass(el.mask, 'is-fullscreen');
          //那看他有没有body？
          if (binding.modifiers.body) {
            el.originalPosition = getStyle(document.body, 'position');

            ['top', 'left'].forEach(property => {
              const scroll = property === 'top' ? 'scrollTop' : 'scrollLeft';
              el.maskStyle[property] = el.getBoundingClientRect()[property] +
                document.body[scroll] +
                document.documentElement[scroll] -
                parseInt(getStyle(document.body, `margin-${property}`), 10) +
                'px';
            });
            ['height', 'width'].forEach(property => {
              el.maskStyle[property] = el.getBoundingClientRect()[property] + 'px';
            });

            insertDom(document.body, el, binding);
            //如果没有body的话？
          } else {
            el.originalPosition = getStyle(el, 'position');
            insertDom(el, el, binding);
          }
        }
      });
    } else {
      //value为false的情况要怎么办
      //给元素添加after-leave自定义事件,这个afterleave有什么必要吗？
      afterLeave(el.instance, _ => {
        if (!el.instance.hiding) return;
        el.domVisible = false;
        //看看是否全屏，如果是全屏的话执行对象就不一样了
        const target = binding.modifiers.fullscreen || binding.modifiers.body
          ? document.body
          : el;
        //根据执行对象去移去被绑定元素添加的类
        removeClass(target, 'el-loading-parent--relative');
        removeClass(target, 'el-loading-parent--hidden');
        //然后把instance.hiding设置为false
        el.instance.hiding = false;
      }, 300, true);
      //instance此处在哪里设置的
      el.instance.visible = false;
      el.instance.hiding = true;
    }
  };
  //插入dom节点，用来给toggleloading调用
  const insertDom = (parent, el, binding) => {
    //这句话还有点问题，没看懂
    //主要不知道domvisible是什么，visible的东西太多了
    if (!el.domVisible && getStyle(el, 'display') !== 'none' && getStyle(el, 'visibility') !== 'hidden') {
      //把保存在备份中的样式正式添加上去
      Object.keys(el.maskStyle).forEach(property => {
        el.mask.style[property] = el.maskStyle[property];
      });
      //如果现在元素的定位不是绝对定位和固着定位的话，就可以给父元素加上相对定位的样式
      if (el.originalPosition !== 'absolute' && el.originalPosition !== 'fixed') {
        addClass(parent, 'el-loading-parent--relative');
      }
      //如果绑定的值是全屏的话，加上父元素hidden的属性
      if (binding.modifiers.fullscreen && binding.modifiers.lock) {
        addClass(parent, 'el-loading-parent--hidden');
      }
      //将被插入的元素设置为可见
      el.domVisible = true;
      //终于插入了～～～此时会显示
      parent.appendChild(el.mask);

      //下一次叶页面更新的时候，执行该函数
      //如果下次数据更新的话，去执行回调函数，判断el实例的值，如果是隐藏的话就去触发关闭事件
      //如果不是的话，将其设备可见
      Vue.nextTick(() => {
        if (el.instance.hiding) {
          el.instance.$emit('after-leave');
        } else {
          el.instance.visible = true;
        }
      });

      //将dom是否插入设为已插入，这个标志位是用来给unbind方法用的
      el.domInserted = true;
    }
    //如果节点不可见，将节点设置为可见
    else if (el.domVisible && el.instance.hiding === true) {
      el.instance.visible = true;
      el.instance.hiding = false;
    }
  };


  //自定义指令的内容
  Vue.directive('loading', {
    bind: function (el, binding, vnode) {
      // 获取被绑定元素上绑定的属性值并保存，用来在后期赋值
      const textExr = el.getAttribute('element-loading-text');
      const spinnerExr = el.getAttribute('element-loading-spinner');
      const backgroundExr = el.getAttribute('element-loading-background');
      const customClassExr = el.getAttribute('element-loading-custom-class');
      // 这是个Vue.component，编译生成的虚拟节点，这个节点是被绑定的父节点还是要绑定的子节点呢？
      // vue.component和vnode什么区别。vnode中包含了vue.component
      const vm = vnode.context;

      //mask是个根据vue组件模版生成的vnode？
      const mask = new Mask({
        el: document.createElement('div'),
        data: {
          //如果vm存在，且vm的对应数据不为空，则保留原值，【有保留原值的可能性吗？】若不存在则直接使用新建值
          //从编译得出的虚拟节点中获取值
          text: vm && vm[textExr] || textExr,
          spinner: vm && vm[spinnerExr] || spinnerExr,
          background: vm && vm[backgroundExr] || backgroundExr,
          customClass: vm && vm[customClassExr] || customClassExr,
          //从指令属性生成的对象中获取值
          fullscreen: !!binding.modifiers.fullscreen
        }
      });


      //把返回值存在了el中
      //把mask node存在了el中，
      el.instance = mask;
      //指mask node的dom元素 该实例使用的根dom元素
      el.mask = mask.$el;
      //用来存储更新后的样式
      el.maskStyle = {};

      //如果指令绑定的值为true，就调用loading方法，不为true的话就不调用了

      binding.value && toggleLoading(el, binding);
      //第一次加载的时候去调用，在value有值的时候再去做
    },

    update: function (el, binding) {
      //调用一下组件的自定义方法setText
      el.instance.setText(el.getAttribute('element-loading-text'));
      if (binding.oldValue !== binding.value) {
        //更新的时候是否调用
        toggleLoading(el, binding);
      }
    },

    unbind: function (el, binding) {
      //现在让我们来整理一下el的参数表，然后每个参数的用处
      if (el.domInserted) {
        el.mask &&
          el.mask.parentNode &&
          el.mask.parentNode.removeChild(el.mask);
        //
        toggleLoading(el, { value: false, modifiers: binding.modifiers });
      }
      el.instance && el.instance.$destroy();
    }
  });
};

export default loadingDirective;
