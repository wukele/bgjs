(function(){
	var Slice = Array.prototype.slice;
/**
 * @class String
 */
CC.extendIf(String.prototype,  (function(){
    var allScriptText = new RegExp('<script[^>]*>([\\S\\s]*?)<\/script>', 'img');
    var onceScriptText = new RegExp('<script[^>]*>([\\S\\s]*?)<\/script>', 'im');
    var allStyleText = new RegExp('<style[^>]*>([\\S\\s]*?)<\/style>', 'img');
    var onceStyleText = new RegExp('<style[^>]*>([\\S\\s]*?)<\/style>', 'im');
    var trimReg = new RegExp("(?:^\\s*)|(?:\\s*$)", "g");

    return ({
/**
 * 删除两头空格
 * @return {String} 新字符串
*/
        trim: function() {
            return this.replace(trimReg, "");
        },
/**
 * 同escape(string).
 * @return {String} 新字符串
 */
        escape: function() {
            return escape(this);
        }
        ,
/**
 * 同unescape(string).
 * @return {String} 新字符串
 */
        unescape: function() {
            return unescape(this);
        }
        ,
/**
 * 检查是否存在'"/\等非法字符.
 * @return {Boolean} 如果存在,返回true,否则false
 */
        checkSpecialChar : function(){
            var reg=/[%\'\"\/\\]/;
            if( this.search( reg )!=-1){
                return false;
            }
            return true;
        },
/**
 * 截短字符串,使得不超过指定长度,如果已截短,则用特定字符串追加.<br>
 <pre><code>
   var str = "这是一个长长的字符串,非常非常长";
   //显示:这是一个长长的字符串...
   alert(str.truncate(10));
 </code></pre>
 * @param {Number} length 截短的长度
 * @param {String} [truncation] 追加的字符串,默认为三个点,表示省略
 * @return {String}
 */
        truncate: function(length, truncation) {
            length = length || 30;
            truncation = truncation === undefined ? '...' : truncation; return this.length > length ? this.slice(0, length - truncation.length) + truncation: this;
        }
        ,
/**
 * 返回已剔除字符串中脚本标签内容的新字符串.
 * @param {Function} fncb 回调函数,参数传递当前已匹配的标签内容
 */
        stripScript: function(fncb) {
            if (!fncb) {
                return this.replace(allScriptText, '');
            }
            return this.replace(allScriptText, function(sMatch) {
                fncb(sMatch); return '';
            }
            );
        }
        ,
/**
 * 返回已剔除字符串中脚本标签内容的新字符串.
 * @param {Function} fncb 回调函数,参数传递当前已匹配的标签内容
 */
        stripStyle: function(fncb) {
            if (!fncb) {
                return this.replace(allStyleText, '');
            }
            return this.replace(allStyleText, function(sMatch) {
                fncb(sMatch); return '';
            }
            );
        }
        ,
/**
 * 返回字符串JavaScript脚本标签内容.<br>
 <pre><code>
   var s = '&lt;script type=&quot;javascript&quot;&gt;var obj = {};&lt;/script&gt;';
   //显示 var obj = {};
   alert(s.innerScript());
   </code></pre>
 */
        innerScript: function() {
            this.match(onceScriptText); return RegExp.$1;
        }
        ,
/**
 * 返回字符串style标签内容.
 <pre><code>
   var s = '&lt;style&gt;.css {color:red;}&lt;/style&gt;';
   //显示 .css {color:red;}
   alert(s.innerStyle());
 </code></pre>  
 */
        innerStyle: function() {
            this.match(onceStyleText); return RegExp.$1;
        }
        ,
/**
 * 执行字符串script标签中的内容.<br>
 <pre><code>
   var s = '&lt;script type=&quot;text/javascript&quot;&gt;alert('execute some script code');&lt;/script&gt;';
   s.execScript();
</code></pre>
 */
        execScript: function() {
            return this.replace(allScriptText, function(ss) {
                //IE 不直接支持RegExp.$1??.
                ss.match(onceScriptText);
                if (window.execScript) {
                    execScript(RegExp.$1);
                } else {
                    window.eval(RegExp.$1);
                }
                return '';
            }
            );
        }
        ,
/**
 * 执行字符串style标签中的内容.<br>
 <pre><code>
   var s = '&lt;style &gt;.css {color:red;}&lt;/style&gt;';
   s.execStyle();
   //应用
   div.innerHTML = '&lt;span class=&quot;css&quot;&gt;Text&lt;/span&gt;';
</code></pre>
 */
        execStyle: function() {
            return this.replace(allStyleText, function(ss) {
                //IE 不直接支持RegExp.$1??.
                ss.match(onceStyleText);
                CC.loadStyle(RegExp.$1); return '';
            }
            );
        },
/**
 * 将css文件属性名形式转换成js dom中style对象属性名称.<br>
 <pre><code>
 //显示backgroundPosition
 alert('background-position'.camelize());
 </code></pre> 
 * @return {String}
 */
        camelize: function() {
            var parts = this.split('-'), len = parts.length;
            if (len == 1) return parts[0];

            var camelized = this.charAt(0) == '-'
            ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
            : parts[0];

            for (var i = 1; i < len; i++)
                camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

            return camelized;
        }
    });
})());

/**
 * @class Function
 */
CC.extendIf(Function.prototype, {
/**
 * 绑定this对象到函数，可绑定固定变量参数。<br>
 <pre><code>
  var self = {name:'Rock'};
  function getName(){
   return this.name;
  }

  var binded = getName.bind(self);

  //显示Rock
  alert(binded());
  </code></pre>
 * @return 绑定this后的新函数

 */
  bind : function() {
    var _md = this, args = Slice.call(arguments, 1), object = arguments[0];
    return function() {
       return _md.apply(object, args);
    }
  },
/**
 * 绑定事件处理函数,使其具有指定this范围功能,并传递event参数 <br>
 <pre><code>
   var self = {name:'Rock'};
   function onclick = function(event){
     alert("name:" + this.name + ', event:'+event);
   }

   dom.onclick = onclick.bindAsListener(self);
   </code></pre>
 * @return 绑定this后的新函数
 */
  bindAsListener : function(self) {
      var _md = this;
      return function(event) {
          return _md.call(self, event||window.event);
      }
  },
/**
 * 如果仅仅想切换this范围，而又使代理函数参数与原来参数一致的，可使用本方法。
 */
  bindRaw : function(scope){
      var md = this;
      return function() {
          return md.apply(scope, arguments);
      }
  },

/**
 * 超时调用. <br>
 <pre><code>
   //setTimeout方式调用
   var timerId = (function(){
    alert('timeout came!');
   }).timeout(2000);
   //setInterval方式调用
   var intervalTimerId = (function(){
    alert('interval came!');
    clearInterval(intervalTimerId);
   }).timeout(2000, true);
</code></pre>
 * @param {Number} seconds 毫秒
 * @param {Boolean} 是否为interval
 * @return {Number} timer id
 */
  timeout : function(seconds, interval){
    if(interval)
      return setInterval(this, seconds || 0);
    return setTimeout(this, seconds || 0);
  }
});

/**
 * 扩充Array原型,原型的扩充是通过CC.extendIf来实现的,所以如果数组原型中在扩充前就具有某个方法时,并不会覆盖掉.
 * @class Array
 * @see CC.extendIf
 */
CC.extendIf(Array.prototype,
{

/**
 * 移除数组中的某个元素.<br>
 <pre><code>
  var arr = ['A','B',5,'C'];
  arr.remove(0);
  arr.remove('B');
 </code></pre> 
 * @param {Number|Object} 数组下标或数组元素
 * @return {Number} 移除元素后的数组长度
 */
    remove: function(p) {
        if (typeof p === 'number') {
            if (p < 0 || p >= this.length)
                throw "Index Of Bounds:" + this.length + "," + p;

            this.splice(p, 1)[0]; return this.length;
        }

        if (this.length > 0 && this[this.length - 1] === p)
          this.pop();
        else {
            var pos = this.indexOf(p);
            if (pos !=  - 1) {
                this.splice(pos, 1)[0];
            }
        }
        return this.length;
    }
    ,
/**
 * 获得某元素在数组中的下标,如果数组存在该元素,返回下标,否则返回-1,该方法使用绝对等(===)作比较.<br>
  <pre><code>
  var arr = ['A','B',5,'C'];
  arr.indexOf('C');
  arr.indexOf('B');
  arr.indexOf('F');
 </code></pre>
 * @param {Object} 查找元素
 * @return {Number} 如果数组存在该元素,返回下标,否则返回-1
 */
    indexOf: function(obj) {
        for (var i = 0, length = this.length; i < length; i++) {
            if (this[i] === obj)return i;
        }
        return  -1;
    }
    ,
/**
 * @param {Number} index
 * @param {Object} object
 */
    insert: function(idx, obj) {
        return this.splice(idx, 0, obj);
    }
    ,
/**
 * @param {Object} object
 * @return {Boolean}
 */
    include: function(obj) {
        return (this.indexOf(obj) !=  - 1);
    },
/**
 * 清除所有元素
 */
    clear : function(){
        this.splice(0,this.length);
    }
}
);
})();