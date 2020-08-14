/**
 * Bind after-leave event for vue instance. Make sure after-leave is called in any browsers.这东西是用来干嘛的啊
 *
 * @param {Vue} instance Vue instance.
 * @param {Function} callback callback of after-leave event
 * @param {Number} speed the speed of transition, default value is 300ms
 * @param {Boolean} once weather bind after-leave once. default value is false.
 */
export default function (instance, callback, speed = 300, once = false) {
  if (!instance || !callback) throw new Error('instance & callback is required');
  let called = false;//是否调用过的标志位
  //新的函数，用来干嘛？
  //这个函数是立即调用吗？
  //如果已经调用过，返回



  const afterLeaveCallback = function () {
    if (called) return;

    called = true;
    //没调用过，就把旗子改一改并且调用
    if (callback) {
      //调用的对象是null和aruments？？？哪来的？？？哦argument是这个函数的所有参数，null的话是指没有this或者把this指向了其他地方？
      callback.apply(null, arguments);
    }
  };

  //实力方法，自定义事件 
  //如果只调用一次，就把回调函数的应用绑定在实例的once上，如果不是的话就绑定在on上，方便下次调用
  if (once) {
    instance.$once('after-leave', afterLeaveCallback);
  } else {
    instance.$on('after-leave', afterLeaveCallback);
  }

  //为什么要这么再调一次啊
  //在规定速度后面加0.1秒调用？
  setTimeout(() => {
    afterLeaveCallback();
  }, speed + 100);
};
