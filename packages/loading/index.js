import directive from './src/directive';
import service from './src/index';

export default {
  install (Vue) {
    Vue.use(directive);//安装directive插件
    Vue.prototype.$loading = service;
  },
  directive,
  service
};
