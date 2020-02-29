(function () {

  //定义常量
  const PENDING = 'pending' //初始化状态
  const RESOLVED = 'resolved' //成功状态
  const REJECTED = 'rejected' //失败状态

  //Promise的构造函数
  class Promise {
    constructor(executor){
      const self = this //缓存this，避免以后this指向出问题
      self.status = PENDING //实例一开始是初始化状态
      self.data = undefined //实例一开始数据为空
      self.callbacks = [] //实例对应的一组一组的回调们，形如：[{onResolved：函数，onRejected：函数},...]
      //定义resolve函数，调用后：1.状态切为resolved; 2.存储成功的value; 3.依次执行该实例所对应的每一个onResolved
      function resolve(value) {
        if(self.status !== PENDING) return
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
      //定义reject函数,调用后：1.状态切为rejected; 2.存储失败的reason; 3.执行onRejected
      function reject(reason) {
        if(self.status !== PENDING) return
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
    then(onResolved,onRejected) {
      const self = this
      //下面这行代码，是为了保证Promise的错误穿透功能
      onRejected = typeof onRejected === 'function' ? onRejected : reason =>{throw reason}
      //下面这行代码，是为了保证catch的传递功能
      onResolved = typeof onResolved === 'function' ? onResolved : value => value
      return new Promise((resolve,reject)=>{
        //专门用于执行成功或失败的回调，且能根据回调执行的结果，影响着then返回的那个实例的状态、值
        function handle(target) {
          try{
            let result = target(self.data) //获取onResolved函数执行的结果
            //若返回值是一个非Promise类型
            if(!(result instanceof Promise)){
              resolve(result)
            }
            //若返回值是一个Promise实例
            else{
              result.then(
                value => resolve(value), //result成功了
                reason =>reject(reason) // result失败了
              )
              result.then(resolve,reject)
            }
          }catch(err){
            reject(err) //若onResolved抛了异常，则then返回的那个Promise实例状态为失败，reason为异常
          }
        }

        //如果调用then时，状态已经为resolved，不向callbacks中保存了，立即异步执行onResolved
        if(self.status === RESOLVED){
          setTimeout(()=>{
            handle(onResolved)
          })
        }
        //如果调用then时，状态已经为rejected，不向callbacks中保存了，立即异步执行onRejected
        else if(self.status === REJECTED){
          setTimeout(()=>{
            handle(onRejected)
          })
        }
        //如果调用then时，状态仍为pending，向callbacks中保存回调。
        else{
          self.callbacks.push({
            onResolved:()=>{handle(onResolved)},
            onRejected:()=>{handle(onRejected)}
          })
        }
      })
    }

    //Promise原型对象上的catch
    catch (onRejected) {
      return this.then(undefined,onRejected)
    }

    //Promise的resolve方法
    static resolve (value) {
      return new Promise((resolve,reject)=>{
        if(value instanceof Promise){
          //如果value是Promise值,需要进一步判断
          value.then(
            val => resolve(val),
            reason => reject(reason)
          )
        }else{
          //如果value不是是Promise值,直接成功
          resolve(value)
        }
      })
    }

    //Promise的reject方法
    static reject (reason) {
      return new Promise((resolve,reject)=>{
        reject(reason)
      })
    }

    //Promise的all方法
    static all (promiseArr) {
      let resolvedCount = 0 //记录成功的个数
      let resultArr = [] //定义好一个数组，用于保存每一个实例成功的结果，最后返回作为整体成功的结果。
      return new Promise((resolve,reject)=>{
        promiseArr.forEach((prom,index)=>{
          Promise.resolve(prom).then(
            (value)=>{
              resultArr[index] = value
              resolvedCount++
              if(promiseArr.length === resolvedCount){
                resolve(resultArr)
              }
            },
            (reason)=>{reject(reason)}
          )
        })
      })
    }

    //Promise的race方法
    static race (promiseArr) {
      return new Promise((resolve,reject)=>{
        promiseArr.forEach((prom)=>{
          Promise.resolve(prom).then(
            (value)=>{resolve(value)},
            (reason)=>{reject(reason)}
          )
        })
      })
    }

    //Promise的resolveDelay方法
    static resolveDelay (value,time) {
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          if(value instanceof Promise){
            //如果value是Promise值,需要进一步判断
            value.then(
              val => resolve(val),
              reason => reject(reason)
            )
          }else{
            //如果value不是是Promise值,直接成功
            resolve(value)
          }
        },time)
      })
    }

    //Promise的rejectDelay方法
    static rejectDelay (reason,time) {
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          reject(reason)
        },time)
      })
    }
  }

  //替换掉原生的Promise
  window.Promise = Promise

})()



