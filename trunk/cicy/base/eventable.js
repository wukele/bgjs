(function(){
/**
 * 事件处理模型的实现.
 * @name CC.Eventable
 * @class 事件处理模型的实现
 */
var Eventable = CC.Eventable = (function(opt){
    /**
     * @name CC.Eventable#events
     * @property {Object} events 保存的事件列表
     */
     if(opt)
      CC.extend(this, opt);
     CC.extend(this, Eventable.prototype);
});

/**
 * 发送对象事件.
 * @name CC.Eventable#fire
 * @function
 * @param {Object} eid 事件名称
 * @param {Object} [args] 传递的回调参数
 @example
  var e = new Eventable();
  e.on('selected', function(arg){
   //handling..
  });
  e.fire('selected', arg);
 */
Eventable.prototype.fire = function(eid/**,arg1,arg2,arg3,...,argN*/){

	if(__debug) {console.log('发送:%s,%o,源:%o',eid, arguments,this);}

	if(this.events){
		
		var handlers = this.events[eid];
		
		if(handlers){
			var fnArgs = CC.$A(arguments),
			    argLen = fnArgs.length, 
			    ret, i, len, oHand;
			    
			// remove eid the first argument
			fnArgs.shift();

			for(i=0,len=handlers.length;i<len;i++){
				oHand = handlers[i];
				// 如果注册处理中存在参数args,追加到当前参数列尾
				if(oHand.args)
				   fnArgs[argLen] = oHand.args;

				// 如果注册处理中存在this,应用this调用处理函数
				ret = (oHand.ds)?oHand.cb.apply(oHand.ds,fnArgs):oHand.cb.apply(this,fnArgs);
				
				//如果某个处理回调返回false,取消后续处理
				if(ret === false)
				   break;
			}
		}
	}
  if(this.subscribers){
      var sr;
      for(i=0,len=this.subscribers.length;i<len;i++){
        sr = this.subscribers[i];
        sr.fireSubscribe.apply(sr, arguments);
      }
  }
	//返回最后一个处理的函数执行结果
	return ret;
};

/**
 * 监听对象事件,如果回调函数返回false,取消后续的事件处理.
 * @param {Object} eid 事件名称
 * @param {Function} callback 事件回调函数
 * @param {Object} [ds] this范围对象
 * @param {Object} [objArgs] 传递参数,该参数将作为回调最后一个参数传递
 * @function
 * @name CC.Eventable#on
 * @return this
 @example
   var self = {name:'Rock'};
   var cfg = {message:'Good boy!'};
   var e = new CC.Eventable();
   e.on('selected', function(item, cfg){
    //显示an item
    alert(item.title);

    //显示Rock
    alert(this.name);

    //显示Good boy!
    alert(cfg.message);
   }, self, cfg);

   var item = {title:'an item'};
   e.fire('selected', item);
 */
Eventable.prototype.on = (function(eid,callback,ds,objArgs){
    if(!eid || !callback){
    	  if(__debug) console.trace();
        throw ('eid or callback can not be null');
    }
    
    if(!this.events)
      this.events = {};
    var hs = this.events[eid];
    if(!hs)
        hs = this.events[eid] = [];
    hs[hs.length] = {
        cb:callback,
        ds:ds,
        args:objArgs
    };
    return this;
});
/**
 * 移除事件监听.
 * @param {Object} eid
 * @param {Function} callback
 * @function
 * @name CC.Eventable#un
 * @return this
 */
Eventable.prototype.un = (function(eid,callback){
    if(!this.events)
      return this;

    if(callback === undefined){
      delete this.events[eid];
      return this;
    }

    var handlers = this.events[eid];

    if(handlers){
        for(var i=0;i<handlers.length;i++){
            var oHand = handlers[i];
            if(oHand.cb == callback){
                handlers.remove(i);
                break;
            }
        }
    }
    return this;
});

/**
 * 发送一次后移除所有监听器,有些事件只通知一次的,此时可调用该方法发送事件
 * @param {Object} eid
 * @function
 * @name CC.Eventable#fireOnce
 * @return this
 */
Eventable.prototype.fireOnce = function(eid){
  var r = this.fire.apply(this, arguments);
  this.un(eid);
  return r;
};

/**
 * 订阅当前对象所有事件
 * @param {Object} target 订阅者,订阅者也是可Eventable的对象
 * @function
 * @name CC.Eventable#to
 * @return this
 */
Eventable.prototype.to = (function(target){
  if(!this.subscribers)
    this.subscribers = [];
  if(this.subscribers.indexOf(target) > 0)
    return;
  this.subscribers.push(target);
  return this;
});

/**
 * 默认为fire,自定订阅方式可重写.
 * @function
 * @name CC.Eventable#fireSubscribe
 * @return this
 @example
  var source = new Eventable();
  var subscriber = new Eventable();

  source.to(subscribers);
  subscriber.on('load', function(){});

  source.fire('load');
 */
Eventable.prototype.fireSubscribe = Eventable.prototype.fire;
})();