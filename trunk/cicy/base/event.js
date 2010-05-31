(function(){
/**
 * @class CC.Event
 * DOM事件处理实用函数库,更多关于浏览器DOM事件的文章请查看<a href="http://www.bgscript.com/archives/369" target="_blank">http://www.bgscript.com/archives/369</a>
 * @singleton
 */
var Event = CC.Event = {};
var document = window.document;
var opera = CC.opera, chrome = CC.chrome, ie = CC.ie;

CC.extend(Event,
  {
    /**@property
     * @type Number
     */
    BACKSPACE: 8,
    /**@property
     * @type Number
     */
    TAB: 9,
    /**@property
     * @type Number
     */
    ENTER: 13,
    /**@property
     * @type Number
     */
    ESC: 27,
    /**@property
     * @type Number
     */
    LEFT: 37,
    /**@property
     * @type Number
     */
    UP: 38,
    /**@property
     * @type Number
     */
    RIGHT: 39,
    /**@property
     * @type Number
     */
    DOWN: 40,
    /**@property
     * @type Number
     */
    DELETE: 46,
    /**
     *@private
     */
    readyList : [],
    /**@private*/
    contentReady : false,
    /**
     * @property
     * 常用于取消DOM事件继续传送,内在调用了Event.stop(ev||window.event);<br>
       div.onmousedown = Event.noUp;
     * @type Function
     * @private
     */
    noUp : function(ev) {
        Event.stop(ev||window.event);
        return false;
    },
/**
 * @property
 * preventDefault(ev||window.event)
 * @type Function
 * @param {DOMEvent} event
 * @private
 */
    noDef : function(ev){
      Event.preventDefault(ev||window.event);
    },

/**
 * 获得DOM事件源
 * @param {DOMEvent} event
 * @return {DOMElement}
 */
    element: function(ev) { return ev.srcElement || ev.target; }
    ,
/**
 * 获得事件发生时页面鼠标x坐标.
 * @param {DOMEvent} event
 * @return {Number} pageX
 */
    pageX : function(ev) {
        if ( ev.pageX == null && ev.clientX != null ) {
            var doc = document.documentElement, body = document.body;
            return ev.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
        }
        return ev.pageX;
    },
/**
 * 获得事件发生时页面鼠标y坐标.
 * @param {DOMEvent} event
 * @return {Number} pageY
 */
    pageY : function(ev) {
        if ( ev.pageY == null && ev.clientY != null ) {
            var doc = document.documentElement, body = document.body;
            return ev.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
        }
        return ev.pageY;
    },
/**
 * 获得事件发生时页面鼠标xy坐标.
 * @param {DOMEvent} event
 * @return {Array} [pageY,pageY]
 */
    pageXY : function(ev) {
        if ( ev.pageX == null && ev.clientX != null ) {
            var doc = document.documentElement, body = document.body;
            return [ev.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0),
            ev.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0)];
        }
        return [ev.pageX, ev.pageY];
    },
/**
 * 获得事件发生时的键盘按键.
 * @param {DOMEvent} event
 */
    which : function(ev) {
        if ( !ev.which && ((ev.charCode || ev.charCode === 0) ? ev.charCode : ev.keyCode) )
            return ev.charCode || ev.keyCode;
    },

/**
 * 是否左击.
 * @param {DOMEvent} event
 * @return {Boolean}
 */
    isLeftClick: function(ev) {
        return (((ev.which)
            && (ev.which === 1)) || ((ev.button) && (ev.button === 1)));
    }
/**
 * 是否按下回车键.
 * @param {DOMEvent} event
 * @return {Boolean}
 */
    ,
    isEnterKey: function(ev) {
        return ev.keyCode === 13;
    },
/**
 * 是否按下ESC键
 * @param {DOMEvent} event
 * @return {Boolean}
 */
    isEscKey : function(ev){
      return ev.keyCode === 27;
    },
/**
 * 获得滚轮增量
 * @param {DOMEvent} event
 * @return {Number}
 */
    getWheel : function(ev){
       // IE或者Opera
       if (ev.wheelDelta) {
         delta = ev.wheelDelta/120;
         // 在Opera9中，事件处理不同于IE
         if (opera)
          delta = -delta;
       } else if (ev.detail)
         //In Mozilla, sign of delta is different than in IE.
         //Also, delta is multiple of 3.
         delta = -ev.detail/3;
       return delta;
    },
/**
 * 停止事件传递和取消浏览器对事件的默认处理.
 * @param {DOMEvent} event
 */
    stop: function(ev) {
        if (ev.preventDefault)
            ev.preventDefault();

        if(ev.stopPropagation)
            ev.stopPropagation();

        if(CC.ie){
            ev.returnValue = false;
            ev.cancelBubble = true;
        }
    }
    ,
/**
 * 取消浏览器对事件的默认处理.
 * @param {DOMEvent} event
 */
    preventDefault : function(ev) {
        if(ev.preventDefault)
            ev.preventDefault();
        ev.returnValue = false;
    },
/**
 * 停止事件传递.
 * @param {DOMEvent} event
 */
    stopPropagation : function(ev) {
        if (ev.stopPropagation)
            ev.stopPropagation();
        ev.cancelBubble = true;
    },
/**
 * 切换元素样式(展开,收缩等效果).<br>
 <pre><code>
   &lt;style&gt;
    .expand {background-image:'open.gif'}
    .fold {background-image:'fold.gif'}
   &lt;/style&gt;
   &lt;body&gt;
     &lt;div id=&quot;src&quot;&gt;标题&lt;/div&gt;
     &lt;div id=&quot;des&quot;&gt;
       内容部份
     &lt;/div&gt;
   &lt;/body&gt;
   &lt;script&gt;
    Event.toggle('src','des','expand', 'fold', '点击展开','点击收缩', '标题栏');
   &lt;/script&gt;
   </code></pre>
   <br><pre>
 * param {DOMElement|String} 源DOM
 * param {DOMElement|String} 目标DOM
 * param {String} cssExpand 展开时样式
 * param {String} cssFold   闭合时样式
 * param {String} [msgExp] src.title = msgExp
 * param {String} [msgFld] src.title =  msgFld
 * param {String} [hasText] src显示文本
 </pre>
 */
    toggle : function(src, des, cssExpand, cssFold, msgExp, msgFld, hasText) {
        src = CC.$(src);
        des = CC.$(des);
        var b = CC.display(des);
        var add = b ? cssFold : cssExpand;
        var del = b ? cssExpand : cssFold;
        var txt = b ? msgExp : msgFld;

        CC.delClass(src, del);
        CC.addClass(src, add);
        CC.display(des, !b);
        if(hasText) src.innerHTML = txt;
        src.title = txt;
    },
/**@private*/
    observers: false,
/**@private*/
    _observeAndCache: function(element, name, observer, useCapture) {
        if (!this.observers) {
            this.observers = [];
        }
        if (element.addEventListener) {
            this.observers.push([element, name, observer, useCapture]);
            element.addEventListener(name, observer, useCapture);
        } else if (element.attachEvent) {
            this.observers.push([element, name, observer, useCapture]);
            element.attachEvent('on' + name, observer);
        }
    }
    ,
/**@private*/
    unloadCache: function() {
        if (!this.observers) {
            return ;
        }

        for (var i = 0; i < this.observers.length; i++) {
            this.un.apply(this, this.observers[i]);
            this.observers[i][0] = null;
        }
        this.observers = false;
    }
    ,
/**
 * 添加DOM元素事件监听函数.<br>
 * Warning : In IE6 OR Lower 回调observer时this并不指向element.<br>
 <code>
   Event.on(document, 'click', function(event){
    event = event || window.event;
   });
 </code>
 * @param {DOMElement} element
 * @param {String} name 事件名称,无on开头
 * @param {Function} observer 事件处理函数
 * @param {Boolean} [useCapture]
 * @return this
 */
    on: function(element, name, observer, useCapture) {
        useCapture = useCapture || false;

        if (name == 'keypress' && (navigator.appVersion.match( / Konqueror | Safari | KHTML / )
            || element.attachEvent)) {
            name = 'keydown';
        }
        this._observeAndCache(element, name, observer, useCapture);
        return this;
    }
    ,
/**
 * 移除DOM元素事件监听函数.
 * @param {DOMElement} element
 * @param {String} name 事件名称,无on开头
 * @param {Function} observer 事件处理函数
 * @param {Boolean} [useCapture]
 * @return this
 */
    un: function(element, name, observer, useCapture) {
        var element = CC.$(element); useCapture = useCapture || false;

        if (name == 'keypress' && (navigator.appVersion.match( / Konqueror | Safari | KHTML / )
            || element.detachEvent)) {
            name = 'keydown';
        }

        if (element.removeEventListener) {
            element.removeEventListener(name, observer, useCapture);
        } else if (element.detachEvent) {
            element.detachEvent('on' + name, observer);
        }
        return this;
    },
/**
 * 提供元素拖动行为,在RIA中不建议用该方式实现元素拖放,而应实例化一个Base对象,使之具有一个完整的控件生命周期.<br>
 <pre>
 * param {DOMElement} dragEl
 * param {DOMElement} moveEl
 * param {Boolean} enable or not?
 * param {Function} [onmovee] callback on moving
 * param {Function} [ondrag] callback on drag start
 * param {Function} [ondrog] callback when drogged
 </pre>
 */
    setDragable: function(dragEl, moveEl, b, onmove, ondrag, ondrog) {
        if (!b) {
            dragEl.onmousedown = dragEl.onmouseup = null;
            return ;
        }
        if(!moveEl)
          moveEl = dragEl;

        var fnMoving = function(event) {
            var ev = event || window.event;
            if (!Event.isLeftClick(ev)) {
                msup(ev);
                return ;
            }

            if (!moveEl.__ondraged) {
                if(ondrag)
                  ondrag(ev, moveEl);
                moveEl.__ondraged = true;
            }

            if (onmove) {
                if (!onmove(ev, moveEl)) {
                    return false;
                }
            }

            var x = ev.clientX;
            var y = ev.clientY;
            var x1 = x - moveEl._x;
            var y1 = y - moveEl._y;
            moveEl._x = x;
            moveEl._y = y;

            moveEl.style.left = moveEl.offsetLeft + x1;
            moveEl.style.top = moveEl.offsetTop + y1;
        };

        var msup = function(event) {
            if (moveEl.__ondraged) {
                if(ondrog)
                  ondrog(event || window.event, moveEl);
                moveEl.__ondraged = false;
            }
            /**@ignore*/
            //document.ondragstart = function(event) {
            //    (event || window.event).returnValue = true;
            //};

            Event.un(document, "mousemove", fnMoving);
            Event.un(document, 'mouseup', arguments.callee);
            Event.un(document, "selectstart", Event.noUp);
        };

        dragEl.onmousedown = function(event) {
            if(moveEl.unmoveable)
              return;
            var ev = event || window.event;
            var x = ev.clientX;
            var y = ev.clientY;
            moveEl._x = x;
            moveEl._y = y;
            /**@ignore*/
            //document.ondragstart = function(event) {
            //    (event || window.event).returnValue = false;
            //};

            Event.on(document, "mousemove", fnMoving);
            Event.on(document, "selectstart", Event.noUp);
            Event.on(document, 'mouseup', msup);
        };
    },
/**
 * @private
 * 页面加载完成后回调,CC.ready将调用本方法
 */
    ready : function(callback) {
      this.readyList.push(callback);
    },

/**@private*/
    _onContentLoad : function(){
      var et = Event;
      if(!et.contentReady){
        et.contentReady = true;



        if(et.defUIReady)
          et.defUIReady();

        for(var i=0;i<et.readyList.length;i++){
          et.readyList[i].call(window);
        }
      }
    }
}
);

/**
 * 添加DOM加载完成后回调函数
 * @member CC
 * @method ready
 */
CC.ready = function(){
  Event.ready.apply(Event, arguments);
};

//
//Thanks to jQuery, www.jquery.org
// Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
// chrome下DOMContentLoaded创建结点还没能正确显示的,所以忽略该事件,等待onload事件
  if ( document.addEventListener && !opera && !chrome)
    // Use the handy event callback
    document.addEventListener( "DOMContentLoaded", Event._onContentLoad, false );

  // If IE is used and is not in a frame
  // Continually check to see if the document is ready
  if ( ie && window == top ) (function(){
    if (Event.contentReady) return;
    try {
      // If IE is used, use the trick by Diego Perini
      // http://javascript.nwbox.com/IEContentLoaded/
      document.documentElement.doScroll("left");
    } catch( error ) {
      setTimeout( arguments.callee, 0 );
      return;
    }
    // and execute any waiting functions
    Event._onContentLoad();
  })();

  if ( opera )
    document.addEventListener( "DOMContentLoaded", function () {
      if (Event.contentReady) return;
      for (var i = 0; i < document.styleSheets.length; i++)
        if (document.styleSheets[i].disabled) {
          setTimeout( arguments.callee, 0 );
          return;
        }
      // and execute any waiting functions
      Event._onContentLoad();
    }, false);

//  if ( isSafari )

// A fallback to window.onload, that will always work
  Event.on(window, "load", Event._onContentLoad);
})();