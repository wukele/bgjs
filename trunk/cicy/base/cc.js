/**
 * Javascript Utility for web development.
 * 反馈 : www.bgscript.com/forum
 * @author Rock - javeejy@126.com
 * www.bgscript.com ? 2010 - 构建自由的WEB应用
 */
//~@base/base.js
/**
 * @fileOverview 定义库功能函数和控件基类(元素封装类).
 * @author <a href="mailto:javeejy@126.com">Rock</a>
 * @version 1.0.1
 */


/**
 * 空函数,什么也不干,象征意义居多.
 * 空调用有什么用?
 * 常见的就有在一个超链接中,
 * 其次当一个类未实现它的某个方法,但其它类又可能调用到该方法时,为了避免null调用,就可把这方法设为fGo.
 * @function
 * @example
   &lt;a href=&quot;Javascript:fGo()&quot; onclick=&quot;funcToRun()&quot;&gt;&lt;/a&gt;
 */
function fGo(){};

/**
 * 调试开关,默认false,可在Firefox下的firebug控制台输入__debug=true|false切换开关.
 *@global
 *@name __debug
 */
if(!window.__debug)
  var __debug = true;


(function(){

    var document = window.document,

    /**@inner*/
    ua = navigator.userAgent.toLowerCase(),

    /**产生全局一个唯一ID, 参见CC.uniqueID().
      * @inner
      */
    uniqueId = 0,

    String = window.String,

    undefined,

    //浏览器检测, thanks ExtJS here
    isStrict = document.compatMode === "CSS1Compat",
    isQuirks = document.compatMode === "BackCompat",
    isOpera = ua.indexOf("opera") > -1,
    isSafari = (/webkit|khtml/).test(ua),
    isChrome = ua.indexOf('chrome') > -1,
    isIE = !isOpera && ua.indexOf("msie") > -1,
    isIE7 = !isOpera && ua.indexOf("msie 7") > -1,
    isIE6 = !isOpera && ua.indexOf("msie 6") > -1,
    isGecko = !isSafari && ua.indexOf("gecko") > -1,
    //优先检测BackCompat,因为
    //假如以后compatMode改变,也是非盒模型
    isBorderBox = (isIE && !isStrict) || (!isIE && !isStrict),
    /**是否合法EMAIL字符串.
     * 参见 CC.isMail().
     * @inner
     */
    mailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
    
    
    Slice = Array.prototype.slice;

    // 修复在IE的一些版本中通过CSS改变元素背景图片会出现重新请求闪烁现象,IE6犹为明显.
    if(isIE && !isIE7){
        try{
            document.execCommand("BackgroundImageCache", false, true);
        }catch(e){}
    }
   /**
    * 该方法在创建新类时被调用,依次执行父类构造函数以给子类添加父类属性.
    * 参见 CC.create()
    * @inner
    */
    function applyCustructors(obj, superclass, cts){
        for(var i=0,len=cts.length;i<len;i++){
            var c = cts[i];
            if(CC.isArray(c)){
                arguments.callee(obj, superclass,c);
            }
            else if(typeof c === 'function'){
                CC.extend(obj,c(superclass));
            }
            else { CC.extend(obj, c);}
        }
    }
    
    /**
     * CC, Cicy缩写,所有类包根目录.
     * @name CC
     * @class 所有类包根目录
     */
    var CC =
       /**@lends CC*/
    {
        /**@property version 当前版本号*/
        version : '2010.4',

        /**
         * 根据结点ID值返回该DOM结点.
         * 该遍历为广度优先
         * 如果只有一个参数,返回id相同的结点(只一个).
         * 如 var objDiv = CC.$('idDiv');
         * 当参数为2时, 返回包含在父结点中的属性id孩子结点,孩子结点可在深层,id在父结点中需唯一.
         * 如 var objDiv = CC.$('idOfAncestor', 'idOfChild');
         *@param {String|DOMElement} a id 结点ID,直接一个DOM也没关系
         *@param {DOMElement} b 父结点,如果该值指定,将在该结点下查找
         *@returns {DOMElement} 对应ID的结点,如果不存在返回null
         *@example
           //结果为true
           alert(CC.$('idDIV')==document.getElementById('idDIV'));
           //在结点oDiv中寻找id为childDiv的结点
           CC.$('childDiv',oDiv);
         */
        $: function(a,b) {
            var iss = typeof a === "string" || a instanceof String;
            if (iss && !b)
                return document.getElementById(a);

            if(!iss)
                return a;

            if(b.id == a)
                return b;

            var child = b.firstChild;
            var tmp = [];
            while (child) {
                if (child.id == a){
                    return child;
                }
                //
                if(child.firstChild)
                  tmp.push(child);
                child = child.nextSibling;
                if(!child){
                  child = tmp.pop();
                  if(child)
                    child = child.firstChild;
                }
            }
            return null;
        }
        ,
        /**
         * 遍历可以枚举的对象.
         *@param {Object} object 可枚兴的对象,如果为数组或arguments时遍历下标数据,为普通对象时遍历对象所有属性.
         *@param {Function} callback
         *@example
             CC.each(array, funtion(obj, i){
                //true
                alert(this === array[i] && this === obj) ;
             });
         */
        each: function(object, callback) {
            if (args) {
                if (object.length === undefined) {
                    for (var name in object)
                        if (callback.apply(object[name]) === false)
                            break;
                } else
                    for (var i = 0, length = object.length; i < length; i++)
                        if (callback.apply(object[i], i) === false)
                            break;
            } else {
                if (object.length === undefined) {
                    for (var name in object)
                        if (callback.call(object[name], name, object[name]) === false)
                            break;
                } else
                    for (var i = 0, length = object.length, value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]){}
            }
            return object;
        },

        /**
         * 沿上层对象某属性遍历.
         * @param {Object} obj
         * @param {String} nextAttr
         * @param {Function} callback
         * @return 如果callback有返回值,则中断当前遍历返回该值.
         * @example

         CC.eachH(element, 'parentNode', function(){
            alert('当前级父结点为:'+ this);
            if(this === document.body)
              return false;
         });

         */
        eachH : function(obj, nextAttr, callback){
            var p = obj,b;
            while(p){
                b = callback.call(p);
                if(b !== undefined){
                    return b;
                }
                p = p[nextAttr];
            }
        }
        ,
        /**
         * 复制src对象属性到des对象中,des对象中相同名称的属性被覆盖.
         * @return 如果des为空,返回src属性副本,否则返回des
         */
        extend: function(des, src) {
            if (!des) {
                des = {};
            }
            if (src) {
                for (var i in src) {
                    des[i] = src[i];
                }
            }
            return des;
        }
        ,
        /**
         * 将原对象所有属性复制到目标对象中,如果目标对象存在该属性,并不进行覆盖.
         * 该方法是用for..in..遍历对象属性的.
         * @param {Object} des 目标对象
         * @param {Object} src 源对象
         * @see CC#extend
         * @return {Object} 返回目标对象,如果目标为空,返回一个新对象
         */
        extendIf : function(des, src) {
          if(!des)
            des = {};

          if(src)
            for(var i in src){
              if(des[i] === undefined)
                des[i] = src[i];
            }

          return des;
        },
        /**
         * 创建类方法
         * @param {String} ns 类名,可带有命名空间
         * @param {Object} base 父类
         * @param {Object|Function} set 类属性集,如果为一个函数,返回类属性对象.
         * @return {Object} 新类
         */
        create: function() {
          var clazz = (function() {
            this.initialize.apply(this, arguments);
          });

          if (arguments.length === 0) return clazz;

          var absObj = clazz.prototype,
              superclass,
              type,
              ags = this.$A(arguments);

          if (typeof ags[0] === 'string') {
            type = ags[0];
            superclass = ags[1];
            ags.shift();
          } else {
            superclass = ags[0];
          }
          ags.shift();

          if (superclass){
            superclass = superclass.prototype;
          }else{
            if(__debug) absObj.toString = function(){ return (this.id?this.id:'')+(this.title?'$'+this.title:'')+'@'+this.type;};
          }
          if (superclass) {

            function Bridge(){};

            Bridge.prototype = superclass;

            clazz.prototype = absObj = new Bridge();

            absObj.superclass = superclass;
            clazz.superclass = superclass;
          }

          if (type) {
            absObj.type = type;
            if (type.indexOf('.') > 0) {
              this.attr(window, type, clazz);
            } else window[type] = clazz;
          }

          clazz.constructors = ags;

          applyCustructors(absObj, superclass, ags);
          absObj.constructor = clazz;
          return clazz;
        }
        ,
        /**
         * 获得一个XMLHttpRequest类实例.
         * @return {XMLHttpRequest} XMLHttpRequest 实例
         */
        ajaxRequest: function() {
            try {
                if (window.XMLHttpRequest) {
                    return new XMLHttpRequest();
                } else {
                    if (window.ActiveXObject) {
                        try {
                            return new ActiveXObject("Msxml2.XMLHTTP");
                        } catch (e) {
                            try {
                                return new ActiveXObject("Microsoft.XMLHTTP");
                            } catch (e) {
                                return null;
                            }
                        }
                    }
                }
            } catch (ex) {
                if(__debug) console.log('createXMLHttpRequest', ex);
                return false;
            }
        }
        ,
        /**
         * 获得或设置对象任意层次属性.
         * @example
           var obj = {name:'xiaoming', car : {color:'black'}};
           //set
           CC.attr(obj, 'car.color', 'white');
           //get
           alert( CC.attr(obj, 'car.color'));
         */
        attr: function(obj, attrList, value) {
            if (typeof attrList === 'string') {
                attrList = attrList.split('.');
            }
            var t1;
            for (var i = 0, idx = attrList.length - 1; i < idx; i++) {
                t1 = obj;
                obj = obj[attrList[i]];
                if(typeof obj === 'undefined' || obj === null)
                  t1[attrList[i]] = obj = {};
            }
            if (value === undefined) {
                return obj[attrList[i]];
            }
            obj[attrList[i]] = value;
        }
        ,
        /**
         * 返回对象查询字符串表示形式.
         * @param {Object} obj
         * @return 对象的查询字符串表示形式
         * @example
           var obj = {name:'rock', age:'25'};

           //显示 name=rock&age=25
           alert(CC.queryString(obj));
         */
        queryString : function(obj) {
            if(!obj)
                return '';
            var arr = [];
            for(var k in obj){
                var ov = obj[k], k = encodeURIComponent(k);
                var type = typeof ov;
                if(type === 'undefined'){
                    arr.push(k, "=&");
                }else if(type != "function" && type != "object"){
                    arr.push(k, "=", encodeURIComponent(ov), "&");
                }else if(this.isArray(ov)){
                    if (ov.length) {
                        for(var i = 0, len = ov.length; i < len; i++) {
                            arr.push(k, "=", encodeURIComponent(ov[i] === undefined ? '' : ov[i]), "&");
                        }
                    } else {
                        arr.push(k, "=&");
                    }
                }
            }
            arr.pop();
            return arr.join("");
        },
        /**
         * 获得一个表单所有表单元素的数据,并返回表单的查询字符串表示.
         * @param {FormElement|String} f form或form的id
         * @return {String} 所有表单元素的查询字符串表示
         * @example
           &lt;form id=&quot;f&quot;&gt;
             &lt;input type=&quot;text&quot; name=&quot;username&quot; value=&quot;rock&quot;/&gt;
             &lt;input type=&quot;text&quot; name=&quot;password&quot; value=&quot;123&quot;/&gt;
           &lt;/form&gt;
           &lt;script&gt;
             //&gt;: username=rock&amp;password=123
             alert(CC.formQuery('f'));
           &lt;/script&gt;
         */
        formQuery: function(f) {
            var formData = "", elem = "", f = CC.$(f), qid;
            var elements = f.elements;
            var length = elements.length;
            for (var s = 0; s < length; s++) {
                elem = elements[s];
                if (elem.tagName === 'INPUT') {
                    if (elem.type === 'radio' || elem.type === 'checkbox') {
                        if (!elem.checked) {
                            continue;
                        }
                    }
                }
                
                qid = elem.name||elem.id;
                
                if(qid){
	                if (formData != "") {
	                    formData += "&";
	                }
	                formData += encodeURIComponent(elem.name||elem.id) + "=" + encodeURIComponent(elem.value);
                }
            }
            return formData;
        }
        ,
/**
 * 表单验证函数.
 * @example

//密码长度>=6
function checkPassword(v) {
  return v.length >= 6;
}

//两次密码要相同
function isTheSame(v, obj, form) {
  return form ? form.password.value == v: CC.$('password').value == v;
}

//出错时自定回调
function myCallback(msg, obj, form) {
  alert("出错显示的消息是:" + msg + " - 元素:" +
          obj.name + ",所在form:" + (form ? form.id: '无'));
}

//存在Form的例子
function testForm() {
  var result = CC.validate('testForm',
     ['username', '请输入用户名。'],
     ['mail', '邮箱格式不正确。', isMail],
     ['password', '密码长度大于或等于6。', checkPassword],
     //完整的配置示例
     ['password2', '两次密码不一致。', isTheSame,
        {nofocus: false,callback: myCallback,ignoreNull: false}
     ],
     {queryString: true});

  if (result !== false) alert("恭喜，通过验证!提交的字符串是:" + result);

  return result;
}
//无Form的例子.
function testNoForm() {
  var result = CC.validate( //既然没form了,这里不必存入form id作为第一个参数.
   ['username', '请输入用户名。'],
   ['mail', '邮箱格式不正确。', CC.isMail],
   ['password', '密码长度大于或等于6。', checkPassword],
   ['password2', '两次密码不一致。', isTheSame,
        {nofocus: false, callback: myCallback, ignoreNull: false}
   ],
  //函数最后一个参数
  { queryString: true});

  if (result !== false) alert("恭喜，通过验证!提交的字符串是:" + result);

  return result;
}

 */
        validate: function() {
          var args = CC.$A(arguments),
          form = null;
          //form如果不为空元素,应置于第一个参数中.
          if (!CC.isArray(args[0])) {
            form = CC.$(args[0]);
            args.remove(0);
          }
          //如果存在设置项,应置于最后一个参数中.
          //cfg.queryString = true|false;
          //cfg.callback = function
          //cfg.ignoreNull
          //nofocus:true|false
          var b = CC.isArray(b) ? {}: args.pop();
          var queryStr = b.queryString;
          var result = queryStr ? '': {};
          CC.each(args, function(i, v) {
            //如果在fomr中不存在该name元素,就当id来获得
            var obj = v[0].tagName ? v[0] : form ? form[v[0]] : CC.$(v[0]);
            //if(__debug) console.log('checking field:',v, 'current value:'+obj.value);
            var value = obj.value, msg = v[1], d = typeof v[2] === 'function' ? v[3]:v[2];
            //选项
            if(!d || typeof d != 'object')
              d = b;

            //是否忽略空
            if (!d.ignoreNull &&
            (value == '' || value == null)) {
              //如果不存在回调函数,就调用alert来显示错误信息
              if (!d.callback)
                CC.alert(msg, obj, form);
              //如果存在回调,注意传递的三个参数
              //msg:消息,obj:该结点,form:对应的表单,如果存在的话
              else d.callback(msg, obj, form);
              //出错后是否聚集
              if (!d.nofocus)
                obj.focus();
              result = false;
              return false;
            }
            //自定义验证方法
            if (typeof v[2] === 'function') {
              var ret = v[2](value, obj, form);
              var pass = (ret !== false);
              if (typeof ret === 'string') {
                msg = ret;
                pass = false;
              }

              if (!pass) {
                if (!d.callback) CC.alert(msg, obj, form);
                //同上
                else d.callback(msg, obj, form);

                if (!d.nofocus)
                  obj.focus();
                result = false;
                return false;
              }
            }
            //如果不设置queryString并通过验证,不存在form,就返回一个对象,该对象包含形如{elementName|elementId:value}的数据.
            if (queryStr && !form) {
              result += (result == '') ? ((typeof obj.name === 'undefined' || obj.name==='') ? obj.id : obj.name) + '=' + value: '&' + v[0] + '=' + value;
            } else if (!form) {
              result[v[0]] = value;
            }
          });
          //如果设置的queryString:true并通过验证,就返回form的提交字符串.
          if (result !== false && form && queryStr)
            result = CC.formQuery(form);
          return result;
        }
        ,
        /**
         * 获得一个全局唯一的ID.
         * @return {Number} 全局唯一ID
         */
        uniqueID: function() {
            return uniqueId++;
        }
        ,
        /**
         * 应用对象替换模板内容.
         * @param {Object} obj 数据对象
         * @param {String} str 模板字符串
         * @param {undefined|Number} [st] 控制开并 undefined 或 0 或 1 或其它
         * @param {Boolean} [urlencode] 是否用encodeURIComponent方法进行编码
         * @return {String}
         * @example
           CC.templ({name:'Rock'},'&#60;html&#62;&#60;title&#62;{name}&#60;/title&#62;&#60;/html&#62;');
           st:0,1:未找到属性是是否保留
         */
        templ : function(obj, str, st, urlencode) {
            return str.replace(/\{([\w_$]+)\}/g,function(c,$1){
                var a = obj[$1];
                if(a === undefined || a === null){
                    if(st === undefined)
                        return '';
                    switch(st){
                        case 0: return '';
                        case 1: return $1;
                        default : return c;
                    }
                }
                return urlencode?encodeURIComponent(a) : a;
            });
        },

        /**
         * 是否为一个函数(方法).
         * @param {Object} obj
         * @return {Boolean}
         */
        isFunction: function(obj) {
            return obj instanceof Function || typeof obj === "function";
        }
        ,
        /**
         * 是否为字符串.
         */
        isString: function(obj) {
            return obj instanceof String || typeof obj === "string";
        }
        ,
        /**
         * 是否为Array实例.
         */
        isArray: function(obj) {
            return obj instanceof Array;
        }
        ,
        /**
         * 是否为一个日期对象.
         */
        isDate: function(obj) {
            return obj instanceof Date;
        }

        ,
        /**
         * 系统对话框.
         * @param {Object} msg 显示的消息
         */
        alert: function(msg) {
            alert(msg);
        }
        ,
        /**
         * 系统小提示.
         */
        tip: function(msg, title, proxy, timeout, getFocus) {
            alert(msg);
        }
        ,
        /**
         * 移除并返回对象属性,该方法利用delete删除对象属性,并返回该属性值.
         * @param {Object} obj 要移除的属性所在的对象
         * @param {String} attrName 属性名称
         * @return {Object} 移除属性的值,如果不存在,返回undefined
         */
        delAttr : function(obj, attrName) {
          var t = obj[attrName];
          if(t !== undefined)
            delete obj[attrName];
          return t;
        },

        /**
         * 添加元素样式类.
         * @param {DOMElement} o
         * @param {String} s css类名
         * @see CC#delClass
         * @see CC#addClassIf
         * @example
           CC.addClass(oDiv, 'cssName');
         */
        addClass: function(o, s) {
            var ss = o.className.replace(s, '').trim();
            ss += ' ' + s;
            o.className = ss;
        }
        ,
        /**
         * 如果元素未存在该样式类,添加元素样式类,否则忽略.
         * @param {DOMElement} o
         * @param {String} s css类名
         * @see CC#addClass
         * @example
           CC.addClassIf(oDiv, 'cssName');
         */
        addClassIf: function(o, s) {
          if(this.hasClass(o,s))
            return;
          var ss = o.className.replace(s, '').trim();
            ss += ' ' + s;
            o.className = ss;
        },

        /**
         * 删除元素样式类.
         * @param {DOMElement} o
         * @param {String} s css类名
         * @see CC#addClass
         * @example
           CC.delClass(oDiv, 'cssName');
         */
        delClass: function(o, s) {
            o.className = o.className.replace(s, "").trim();
        }
        ,
        /**
         * 测试元素是否存在指定样式类.
         * @param {DOMElement} o
         * @param {String} s css类名
         * @return {Boolean}
         * @example
           CC.hasClass(oDiv, 'cssName');
         */
        hasClass : function(o, s) {
            return s && (' ' + o.className + ' ').indexOf(' ' + s + ' ') != -1;
        },
        /**
         * 替换元素样式类.
         * @param {DOMElement} o
         * @param {String} oldSty 已存在的CSS类名
         * @param {String} newSty 新的CSS类名
         * @example
           CC.switchClass(oDiv, 'mouseoverCss', 'mouseoutCss');
         */
        switchClass: function(a, oldSty, newSty) {
            CC.delClass(a, oldSty);
            CC.addClass(a, newSty);
        }
        ,
        /**
         * 重置元素样式类.
         * @param {DOMElement} o
         * @param {String} s CSS类名
         * @example
           CC.switchClass(oDiv, 'mouseoverCss', 'mouseoutCss');
         */
        setClass: function(o, s) {
            o.className = s;
        },
        /**
         * 获得或设置元素style.display属性.
         * 以style.display方式设置元素是否可见.
         * @param {DOMElement} v dom结点
         * @param {Boolean} [b] 设置是否可见
         * @param {Boolean} [inline] inline为true时将display设为空,而不是block
         * @example
           //测试元素是否可见
           alert( CC.display(div) );
           //设置元素可见,模式为block
           CC.display(div, true);
           //设置元素可见,模式为inline
           CC.display(div, true, true);
         */
        display: function(v, b, inline) {
            if (b === undefined) {
                return CC.$(v).style.display != 'none';
            }
            var blm = inline !== undefined ? '' : 'block';
            CC.$(v).style.display = b ? blm : 'none';
        }
        ,
        /**
         * 测试或设置元素是可用.
         * @param {DOMElement} v
         * @param {Boolean} [b]
         * @example
           //禁用元素
           CC.disable(div, true);
           //测试元素是否可用.
           var b = CC.disable(div);
         */
        disable: function(v, b) {
          if(b === undefined)
            return CC.$(v).disabled;

          CC.$(v).disabled = b;
        }
        ,
/**
 * 在oSelf后面插入oNew结点.
 * @param {DOMElement} oSelf
 * @param {DOMElement} oNew
 * @return {DOMElement} oNew
 */
        insertAfter: function(oNew, oSelf) {
            var oNext = oSelf.nextSibling;
            if (oNext == null) {
                oSelf.parentNode.insertBefore(oNew, oSelf);
            } else {
                oSelf.parentNode.insertBefore(oNew, oNext);
            }
            return oNew;
        },
/**
 * 测试是否为数字
 * @param {Object} ob
 * @return {Boolean}
 */
        isNumber: function(ob) {
            return (ob instanceof Number || typeof ob == "number");
        }
        ,
/**
 * 测试字符串是否为邮箱格式.
 * @param {String} strMail
 * @return {Boolean}
 */
        isMail : function(strMail) {
            return mailReg.test(strMail);
        },

/**
 * 返回日期的格式化字符串.
 * @param {Date} date
 * @param {String} 格式, mm/dd/yy或dd/mm/yy或yy/mm/dd,中间分隔符不限定
 * @return {String} 日期的格式化字串符
 * @see CC#dateParse
 */
        dateFormat: function(date, fmt) {
            if(!fmt){
              return date.toLocaleString();
            }
            var sep = fmt.charAt(2);
            var ss = fmt.split(sep);
            var cc = '';
            for(var i=0,len=ss.length;i<len;i++){
              switch(ss[i]){
                case 'mm' :
                  var month = date.getMonth()+1;
                  if (month < 10)
                    month = "0" + month;
                  cc+=month;
                  break;
                case 'yy' :
                  cc+=date.getFullYear();break;
                case 'dd' :
                  var d = date.getDate();
                  if (d < 10)
                    d = "0" + d;
                  cc += d;
                  break;
              }
              if(i!=len-1)
                cc+=sep;
            }
            return cc;
       }
       ,
/**
 * 返日期的格式化字符串所表示的日期对象.
 * @param {String} str 日期的格式化字符串,如2009/02/15
 * @param {String} 格式, mm/dd/yy或dd/mm/yy或yy/mm/dd,中间分隔符不限定
 * @return {Date} 格式化字符串所表示的日期对象
 * @see CC#dateFormat
 */
       dateParse : function(str, fmt){
        if(!fmt){
          return new Date(str);
        }
        var arr = [0,0,0];
        var sep = fmt.charAt(2);
        var ss = fmt.split(sep);
        var tar = str.split(sep);
        var cc = '';
        for(var i=0,len=ss.length;i<len;i++){
          if(ss[i]=='mm')
            arr[0] = tar[i];
          else if(ss[i]=='dd')
            arr[1]=tar[i];
          else arr[2]=tar[i];
        }
        return new Date(arr.join(sep));
       },
/**
 * 增加日期的某个字段值.
 * @param {String} field year|month|day中的一个
 * @param {Date} date
 * @param {Number} delta 增量
 * @return {Date} 值增加后的新日期
 */
        addDate: function(field, date, delta) {
            var newDate = null;
            switch (field) {
                case "year":
                    newDate = new Date(parseInt(date.getFullYear()) + 1, date.getMonth(), date.getDate());
                    break;
                case "month":
                    newDate = new Date(date.getFullYear(), date.getMonth() + delta, date.getDate());
                    break;
                case "day":
                    newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
                    break;
            }
            return newDate;
        },
/**
 * 创建一个DOM元素.
 * @param {String|Object} 为字符串时,传递tagName,为对象时,传递属性集.
 * @param {Document} document
 * @return {DOMElement} 新创建的DOM结点
 * @example
   //简单方式创建一个DIV结点.
   var div = CC.$C('DIV');
   //以属性集创建一个DIV结点.
   var div = CC.$C({
     tagName:'DIV',
     innerHTML : 'This div is created from function C.$C!',
     className : 'cs-div',
     onclick : function(){alert(this.innerHTML);}
   });
 */
        $C: function(a, doc) {
            if (typeof a === 'string') {
                return (doc||document).createElement(a);
            }
            var tag = a.tagName;
            delete a.tagName;
            var b = this.extend((doc||document).createElement(tag), a);
            a.tagName = tag;
            return b;
        }
/**
 * document.getElementsByName的快速调用.
 * @param name DOM元素的name
 * @return {DOMCollection}
 */
        ,
        $N: function(name) {
            return document.getElementsByName(name);
        },
/**
 * dom.getElementsByTagName的快速调用.
 * @param {String} tagName 标签名
 * @param {DOMElement} [dom] 在该标签下查找,未设置时为document
 * @return {DOMCollection}
 */
        $T: function(tagName, dom) {
          return (dom || document).getElementsByTagName(tagName);
        }
        ,
/**
 * 沿dom结点往上遍历,以寻找标签名为tag的结点,没找到返回null.
 * @param {DOMElement} dom 往该结点上遍历(包括该结点)
 * @param {String} tag 查找的标签名
 * @return {DOMElement} 匹配标签的结点
 @example
 var dom = CC.tagUp(div, 'TD');
 */
        tagUp : function(dom, tag){
          while(dom && dom.tagName !== tag){
            dom = dom.parentNode;
            if(dom && dom.tagName === 'BODY')
              return null;
          }
          return dom;
        },
/**
 * 获得对象和对象原型链上某个属性的所有值,方法只适合用本库创建具有superclass属性的类实例.
 * @param {Object} object
 * @param {String} attributeName
 * @return {Array} 返回链上该属性的所有值
 * @example
 <pre>
   A.prototype.name = 'Smart';
   a = new A();
   a.name = 'Rock';
   // ['Rock', 'Smart']
   CC.getObjectLinkedValues(a, 'name');
 </pre>
 */
        getObjectLinkedValues : function(obj, name, check){
			    var maps = [], check = !!check, o;
			    while(obj){
			      if(obj.hasOwnProperty(name)){
			      	o = obj[name];
			      	if(!check || o) maps.push(obj[name]);
			      }
			      if(obj.constructor.prototype.hasOwnProperty(name)){
			      	o = obj.constructor.prototype[name];
			      	if(!check || o) maps.push(o);
			      }
			      
			      obj = obj.superclass;
			    }
			    return maps;
        },
        
/**
 * 加载一个资源文件
 * @param {Object} 资源属性
 * @param {Function} callback 加载后回调, this指向资源tag
 * @param {Document} document
 */
 
				loadResource : function(attr, callback, doc) {
					// javascript , img..
					var src = CC.delAttr(attr, 'src');
					// css style sheet
					var href = CC.delAttr(attr, 'href');
					// tag
					var res = this.$C(attr, doc);
					
					if(res.readyState) {
						//IE
						res.onreadystatechange = function() {
							if (res.readyState == "loaded" ||
							res.readyState == "complete") {
								res.onreadystatechange = null;
								setTimeout(function(){res.parentNode.removeChild(res)},1)
								if(callback)
								callback.call(res);
							}
						};
					}else{
						//Others
						res.onload = function() {
							setTimeout(function(){res.parentNode.removeChild(res)},1)
							if(callback)
							callback.call(res);
						};
					}
					
					if(src)
					 res.src = src;
					
					if(rel)
					 res.href = href;
					
					this.$T('head')[0].appendChild(res);
					
					return res;
				},
/**
 * 加载JavaScript脚本文件
 * @param {String} url
 * @param {Function} callback
 * @param {String} [id]
 */
        loadScript: function(url, callback, id) {
          var nd = this.loadResource({
                tagName: 'script',
                src: url,
                type: 'text/javascript'
          }, callback);
          
          if(id) 
          	nd.id = id;
          return nd;
        }
        ,
/**
 * 加载一个CSS样式文件
 * @param {String} id 加载css标签ID
 * @param {String} url 加载css的路径
 * @return {DOMElement} link node
 */
        loadCSS: function(url, callback, id) {
          var nd = this.loadResource({
                tagName: 'link',
                rel: 'stylesheet',
                href: url,
                type: 'text/css'
          }, callback);
          if(id) 
          	nd.id = id;
          return nd;
        }
        ,
/**
 * 应用一段CSS样式文本
 * @param {String} id 生成的样式style结点ID\
 * @param {String} 样式文本内容
 @example
   CC.loadStyle('customCS', '.g-custom {background-color:#DDD;}');
   //在元素中应用新增样式类
   &lt;div class=&quot;g-custom&quot;&gt;动态加载样式&lt;/div&gt;
 */
        loadStyle: function(id, ss) {
            var o;
            if (document.createStyleSheet) {
                window[id] = ss;
                o = document.createStyleSheet('javascript:' + id);
                return o;
            }
            var css = this.$C( {
                tagName: 'style',
                id: id,
                type: 'text/css'
            }
            );
            css.innerHTML = ss;
            this.$T('head')[0].appendChild(css);
            return css;
        }
        ,
/**
 * 获得一个请求字符串,该字符串用于避免浏览器缓存请求页面,追加在URL尾部.
 * @return {String} 避免浏览器缓存请求页面的字符串.
 * @example
 * var requestUrl = 'http://www.site.com/?name=rock'+CC.noCache();
 */
        noCache: function() {
            return '&noCacheReq=' + (new Date()).getTime();
        }
        ,
/**
 * 将可枚举对象内容复制到新数组中,并返回该数组,可枚举对象是指可用[index]访问,并具有length属性的,常见的有arguments对象.
 * @param {Object} iterable 可枚举对象
 * @return {Array} 新数组
 */
        $A : function(a) {
            return Slice.call(a);
        },
/**
 * 获得iframe中的document结点.
 * @param {DOMElement} frame iframe结点
 * @return {DOMElement} iframe页面中的document结点
 */
        frameDoc : function(frame) {
            return frame.contentWindow ? frame.contentWindow.document:frame.contentDocument;
        },
/**
 * 获得iframe中的window对象.
 * @param {IFrame} frame iframe结点
 * @return {DOMElement} iframe页面中的document结点
 */
        frameWin : function(frame){
            return frame.contentWindow;
        },
/**
 * 获得文档内容区域高度.
 * @return {Number}
 */
        getDocumentHeight: function() {
            var scrollHeight = (document.compatMode != "CSS1Compat") ? document.body.scrollHeight : document.documentElement.scrollHeight;
            return Math.max(scrollHeight, this.getViewportHeight());
        },
/**
 * 获得文档内容区域宽度.
 * @return {Number}
 */
        getDocumentWidth: function() {
            var scrollWidth = (document.compatMode != "CSS1Compat") ? document.body.scrollWidth : document.documentElement.scrollWidth;
            return Math.max(scrollWidth, this.getViewportWidth());
        },
/**
 * 获得视图可见区域域高度.
 * @return {Number}
 */
        getViewportHeight: function(){
            if(isIE){
                return isStrict ? document.documentElement.clientHeight :
                         document.body.clientHeight;
            }else{
                return self.innerHeight;
            }
        },
/**
 * 获得视图可见区域域宽度.
 * @return {Number}
 */
        getViewportWidth: function() {
            if(isIE){
                return isStrict ? document.documentElement.clientWidth : document.body.clientWidth;
            }else{
                return self.innerWidth;
            }
        },
/**
 * 获得视图可见区域域宽高.
 * @return {Object} obj.width,obj.height
 @example
   var vp = CC.getViewport();
   alert(vp.width+','+vp.height);
 */
        getViewport : function(){
          return {width:this.getViewportWidth(), height:this.getViewportHeight()};
        },

        ie : isIE,
        ie7 : isIE7,
        ie6 : isIE6,
        strict : isStrict,
        safari : isSafari,
        gecko : isGecko,
        opera : isOpera,
        borderBox:isBorderBox
    };

//合并外部CC
if(window.CC)
CC.extend(CC, window.CC);

window.CC = CC;
/**
* UI相关功能函数存放类.
* @name CC.Util
* @class UI相关功能函数存放类
*/
if(!CC.Util)
CC.Util = {};
/**
 * @name CC.util
 * @class
 */
CC.util = {};
//~#
return CC;
})();
