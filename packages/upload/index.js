import Upload from './src';
//上面是导入了整个文件夹吗？
/* istanbul ignore next */
Upload.install = function(Vue) {
  Vue.component(Upload.name, Upload);
};

export default Upload;
