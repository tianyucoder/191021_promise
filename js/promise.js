(function () {

  //定义常量
  const PENDING = 'pending' //初始化状态
  const RESOLVED = 'resolved' //成功状态
  const REJECTED = 'rejected' //失败状态

  //Promise的构造函数
  function Promise(executor) {
    const self = this //缓存this，避免以后this指向出问题
    self.status = PENDING //实例一开始是初始化状态
    self.data = undefined //实例一开始数据为空
    self.callbacks = [] //实例对应的一组一组的回调们，形如：[{onResolved：函数，onRejected：函数},...]

    //resolve函数，调用后：1.状态切为resolved; 2.存储成功的value; 3.依次执行该实例所对应的每一个onResolved
    function resolve(value) {
      //1.状态切为resolved;
      self.status = RESOLVED
      //2.存储成功的value;
      self.data = value
      //3.依次执行回调
      setTimeout(()=>{
        self.callbacks.forEach((callbackObj)=>{
          callbackObj.onResolved(self.data)
        })
      })
    }

    //reject函数,调用后：1.状态切为rejected; 2.存储失败的reason; 3.执行onRejected
    function reject(reason) {
      //1.状态切为rejected;
      self.status = REJECTED
      //2.存储成功的value;
      self.data = reason
      //3.依次执行回调
      setTimeout(()=>{
        self.callbacks.forEach((callbackObj)=>{
          callbackObj.onRejected(self.data)
        })
      })
    }

    //调用程序员传过来的executor
    executor(resolve,reject)
  }

  //Promise原型对象上的then
  Promise.prototype.then = function (onResolved,onRejected) {
    const self = this
    self.callbacks.push({onResolved,onRejected})
  }

  //替换掉原生的Promise
  window.Promise = Promise

})()



