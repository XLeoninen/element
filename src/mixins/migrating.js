import { kebabCase } from 'element-ui/src/utils/util';
/**
 * Show migrating guide in browser console.显示混合指导在浏览器控制台中？
 *
 * Usage:使用方法
 * import Migrating from 'element-ui/src/mixins/migrating';
 *
 * mixins: [Migrating]
 *
 * add getMigratingConfig method for your component. 为你的组件加入混合配置方法
 *  getMigratingConfig() {
 *    return {
 *      props: {
 *        'allow-no-selection': 'allow-no-selection is removed.',
 *        'selection-mode': 'selection-mode is removed.'
 *      },
 *      events: {
 *        selectionchange: 'selectionchange is renamed to selection-change.'
 *      }
 *    };
 *  },
 */
export default {
  // 自定义的mounted钩子方法，混入后自动执行
  //这东西就是方便调试打log的
  mounted () {
    // 如果环境是线上环境，自动返回不执行
    if (process.env.NODE_ENV === 'production') return;
    // 如果没有vnode也不执行
    if (!this.$vnode) return;
    // 获得参数表和事件表
    const { props = {}, events = {} } = this.getMigratingConfig();
    // 从vnode中获取数据和组件选项
    const { data, componentOptions } = this.$vnode;
    // 定义属性，如果data中有的话
    const definedProps = data.attrs || {};
    // 获取组件的事件监听器
    const definedEvents = componentOptions.listeners || {};


    for (let propName in definedProps) {
      propName = kebabCase(propName); // compatible with camel case
      if (props[propName]) {
        //输出警告
        console.warn(`[Element Migrating][${this.$options.name}][Attribute]: ${props[propName]}`);
      }
    }

    for (let eventName in definedEvents) {
      eventName = kebabCase(eventName); // compatible with camel case
      if (events[eventName]) {
        //输出警告
        console.warn(`[Element Migrating][${this.$options.name}][Event]: ${events[eventName]}`);
      }
    }
  },
  methods: {
    getMigratingConfig () {
      return {
        props: {},
        events: {}
      };
    }
  }
};
