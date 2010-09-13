/*!
 * Javascript Utility for web development.
 * 反馈 : www.bgscript.com/forum
 * www.bgscript.com ? 2010 - 构建自由的WEB应用
 */
/**
 * @class global 全局对象
 */
/**
 * 空函数,什么也不干,象征意义居多.
 * 空调用有什么用?
 * 常见的就有在一个超链接中,
 * 其次当一个类未实现它的某个方法,但其它类又可能调用到该方法时,为了避免null调用,就可把这方法设为fGo.<br/>
 * <code>
   &lt;a href=&quot;Javascript:fGo()&quot; onclick=&quot;funcToRun()&quot;&gt;&lt;/a&gt;
 * </code>
 * @member global
 * @method fGo
 */
function fGo(){};

/**
 *调试开关,默认false,可在Firefox下的firebug控制台输入__debug=true|false切换开关.
 * @member global
 * @property __debug
 * @type Boolean
 */
if(window.__debug === undefined)
  var __debug = false;


(function(){

    var document = window.document,

    ua = navigator.userAgent.toLowerCase(),

    // 产生全局一个唯一ID, 参见CC.uniqueID()
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
     * @ignore
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
    * @ignore
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
     * @class CC
     * Cicy缩写,所有类包根目录.
     */
    var CC =
    {
        /**
         * 当前版本号
         * @type String
         */
        version : '2010.5',

        /**
         * 根据结点ID值返回该DOM结点.
         * 该遍历为广度优先
         * 如果只有一个参数,返回id相同的结点(只一个).
         * 如 var objDiv = CC.$('idDiv');
         * 当参数为2时, 返回包含在父结点中的属性id孩子结点,孩子结点可在深层,id在父结点中需唯一.<br/>
         * 如
         * <pre><code>
         *  var objDiv = CC.$('idOfChild', ancestorNode);
         *  //结果为true
         *  alert(CC.$('idDIV')==document.getElementById('idDIV'));
         *  //在结点oDiv中寻找id为childDiv的结点
         *  CC.$('childDiv',oDiv);
         *  </code></pre>
         * @param {String|DOMElement} id 结点ID,直接一个DOM也没关系
         * @param {DOMElement} ancestorNode 父结点,如果该值指定,将在该结点下查找
         * @return {DOMElement} 对应ID的结点,如果不存在返回null
         * @member CC
         * @method $
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
         *<pre><code>
         *    CC.each(array, funtion(obj, i){
         *      //true
         *       alert(this === array[i] && this === obj) ;
         *   });
         * </code></pre>
         *@param {Object} object 可枚兴的对象,如果为数组或arguments时遍历下标数据,为普通对象时遍历对象所有属性.
         *@param {Function} callback
         */
        each: function(object, callback) {
                if (object.length === undefined) {
                    for (var name in object)
                        if (callback.call(object[name], name, object[name]) === false)
                            break;
                } else for (var i = 0, length = object.length, value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]){}
            return object;
        },

        /**
         * 沿上层对象某属性遍历.
         * <pre><code>
         CC.eachH(element, 'parentNode', function(){
            alert('当前级父结点为:'+ this);
            if(this === document.body)
              return false;
         });
         *</code></pre>
         * @param {Object} obj
         * @param {String} nextAttr 属性名称
         * @param {Function} callback
         * @return 如果callback有返回值,则中断当前遍历返回该值.
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
         * @param {Object} dest 目标对象
         * @param {Object} src  源对象
         * @returns 如果des为空,返回src属性副本,否则返回des
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
         * @see CC.extend
         * @returns {Object} 返回目标对象,如果目标为空,返回一个新对象
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
         * <pre><code>
           var obj = {name:'xiaoming', car : {color:'black'}};
           //set
           CC.attr(obj, 'car.color', 'white');
           //get
           alert( CC.attr(obj, 'car.color'));
         *  </code></pre>
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
         * <pre><code>
           var obj = {name:'rock', age:'25'};

           //显示 name=rock&age=25
           alert(CC.queryString(obj));
         * </code></pre>
         * @param {Object} obj
         * @return 对象的查询字符串表示形式
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
         * <br/>
         <code>
           &lt;form id=&quot;f&quot;&gt;
             &lt;input type=&quot;text&quot; name=&quot;username&quot; value=&quot;rock&quot;/&gt;
             &lt;input type=&quot;text&quot; name=&quot;password&quot; value=&quot;123&quot;/&gt;
           &lt;/form&gt;
           &lt;script&gt;
             //&gt;: username=rock&amp;password=123
             alert(CC.formQuery('f'));
           &lt;/script&gt;
           </code>
         * @param {FormElement|String} f form或form的id
         * @return {String} 所有表单元素的查询字符串表示
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
 * <pre><code>
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
 * </code></pre>
 * @return {false|Object} 如果设置的queryString:true并通过验证,就返回form的提交字符串,验证失败返回false
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
         * 应用对象替换模板内容.<br/>
         * <pre><code>
           CC.templ({name:'Rock'},'&#60;html&#62;&#60;title&#62;{name}&#60;/title&#62;&#60;/html&#62;');
           st:0,1:未找到属性是是否保留
         * </code></pre>
         * @param {Object} obj 数据对象
         * @param {String} str 模板字符串
         * @param {undefined|Number} [st] 控制开并 undefined 或 0 或 1 或其它
         * @param {Boolean} [urlencode] 是否用encodeURIComponent方法进行编码
         * @return {String}
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
         * @private
         */
        alert: function(msg) {
            alert(msg);
        }
        ,
        /**
         * 系统小提示.
         * @private
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
         * <pre><code>
           CC.addClass(oDiv, 'cssName');
         * </code></pre>
         * @param {DOMElement} o
         * @param {String} s css类名
         * @see CC#delClass
         * @see CC#addClassIf
         */
        addClass: function(o, s) {
            var ss = o.className.replace(s, '').trim();
            ss += ' ' + s;
            o.className = ss;
        }
        ,
        /**
         * 如果元素未存在该样式类,添加元素样式类,否则忽略.
         * <pre><code>
           CC.addClassIf(oDiv, 'cssName');
           </code></pre>
         * @param {DOMElement} o
         * @param {String} s css类名
         * @see CC.addClass
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
         * <pre><code>
           CC.delClass(oDiv, 'cssName');
         * </code></pre>
         * @param {DOMElement} o
         * @param {String} s css类名
         * @see CC#addClass
         */
        delClass: function(o, s) {
            o.className = o.className.replace(s, "").trim();
        }
        ,
        /**
         * 测试元素是否存在指定样式类.
         * <pre><code>
           CC.hasClass(oDiv, 'cssName');
           </code></pre>
         * @param {DOMElement} o
         * @param {String} s css类名
         * @return {Boolean}
         */
        hasClass : function(o, s) {
            return s && (' ' + o.className + ' ').indexOf(' ' + s + ' ') != -1;
        },
        /**
         * 替换元素样式类.
         * <pre><code>
           CC.switchClass(oDiv, 'mouseoverCss', 'mouseoutCss');
         *  </code></pre>
         * @param {DOMElement} o
         * @param {String} oldSty 已存在的CSS类名
         * @param {String} newSty 新的CSS类名
         */
        switchClass: function(a, oldSty, newSty) {
            CC.delClass(a, oldSty);
            CC.addClass(a, newSty);
        }
        ,
        /**
         * 重置元素样式类.
         * <pre><code>
           CC.switchClass(oDiv, 'mouseoverCss', 'mouseoutCss');
           </code></pre>
         * @param {DOMElement} o
         * @param {String} s CSS类名
         */
        setClass: function(o, s) {
            o.className = s;
        },
        /**
         * 获得或设置元素style.display属性.
         * 以style.display方式设置元素是否可见.
         * <pre><code>
           //测试元素是否可见
           alert( CC.display(div) );
           //设置元素可见,模式为block
           CC.display(div, true);
           //设置元素可见,模式为display=''
           CC.display(div, true, '');
           //设置元素可见,模式为display='inline'
           CC.display(div, true, 'inline');
           </code></pre>
         * @param {DOMElement} v dom结点
         * @param {Boolean} [b] 设置是否可见
         * @param {Boolean} [inline] inline为true时将display设为空,而不是block
         */
        display: function(v, b, inline) {
            if (b === undefined) {
                return CC.$(v).style.display != 'none';
            }
            var blm = inline !== undefined ? inline : 'block';
            CC.$(v).style.display = b ? blm : 'none';
        }
        ,
        /**
         * 测试或设置元素是可用.
         * <pre><code>
           //禁用元素
           CC.disable(div, true);
           //测试元素是否可用.
           var b = CC.disable(div);
           </code></pre>
         * @param {DOMElement} v
         * @param {Boolean} [b]
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
 * 创建一个DOM元素.<br/>
 * <pre><code>
   //简单方式创建一个DIV结点.
   var div = CC.$C('DIV');
   //以属性集创建一个DIV结点.
   var div = CC.$C({
     tagName:'DIV',
     innerHTML : 'This div is created from function C.$C!',
     className : 'cs-div',
     onclick : function(){alert(this.innerHTML);}
   });
 *  </code></pre>
 * @param {String|Object} 为字符串时,传递tagName,为对象时,传递属性集.
 * @param {Document} document
 * @return {DOMElement} 新创建的DOM结点
 * @member CC
 * @method $C
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
 * @member CC $N
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
 * @member CC $T
 */
        $T: function(tagName, dom) {
          return (dom || document).getElementsByTagName(tagName);
        }
        ,
/**
 * 沿dom结点往上遍历,以寻找标签名为tag的结点,没找到返回null.<br/>
 <pre><code>
 var dom = CC.tagUp(div, 'TD');
 </code></pre>
 * @param {DOMElement} dom 往该结点上遍历(包括该结点)
 * @param {String} tag 查找的标签名
 * @return {DOMElement} 匹配标签的结点
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
 <pre><code>
   A.prototype.name = 'Smart';
   a = new A();
   a.name = 'Rock';
   // ['Rock', 'Smart']
   CC.getObjectLinkedValues(a, 'name');
 </code></pre>
 * @param {Object} object
 * @param {String} attributeName
 * @return {Array} 返回链上该属性的所有值
 */
        getObjectLinkedValues : function(obj, name, check){
			    var maps = [], check = !!check, o;
          if(obj.hasOwnProperty(name)){
            o = obj[name];
            if(!check || o) maps.push(obj[name]);
          }
          if(obj.constructor.prototype.hasOwnProperty(name)){
            o = obj.constructor.prototype[name];
            if(!check || o) maps.push(o);
          }
          obj = obj.superclass;
			    while(obj){
            if(obj.hasOwnProperty(name)){
              o = obj[name];
              if(!check || o) maps.push(obj[name]);
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
 
				loadResource : function(attr, callback, autoremove, doc) {
					// javascript , img..
					var src = CC.delAttr(attr, 'src');
					// css style sheet
					var href = CC.delAttr(attr, 'href');
					// tag
					var res = this.$C(attr, doc);
					if(callback || autoremove){
  					if(res.readyState) {
  						//IE
  						res.onreadystatechange = function() {
  							if (res.readyState == "loaded" ||
  							res.readyState == "complete") {
  								res.onreadystatechange = null;
  								if(autoremove)
  								  setTimeout(function(){res.parentNode.removeChild(res)},1)
  								if(callback)
  								callback.call(res);
  							}
  						};
  					}else{
  						//Others
  						res.onload = function() {
  							if(autoremove)
  							  setTimeout(function(){res.parentNode.removeChild(res)},1)
  							if(callback)
  							  callback.call(res);
  						};
  					}
				  }
					
					if(src)
					 res.src = src;
					
					if(href)
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
          }, callback, true);
          
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
 * 应用一段CSS样式文本.
 * <pre><code>
   CC.loadStyle('.g-custom {background-color:#DDD;}');
   //在元素中应用新增样式类
   &lt;div class=&quot;g-custom&quot;&gt;动态加载样式&lt;/div&gt;
   </code></pre>
 * @param {String} id 生成的样式style结点ID\
 * @param {String} 样式文本内容
 */
        loadStyle: function(ss, doc) {
          var styleEl = this._styleEl;
          if(!styleEl){
            styleEl = this._styleEl = this.$C( {
              tagName: 'style',
              type: 'text/css'
            });
            this.$T('head')[0].appendChild(styleEl);
          }
          styleEl.styleSheet && (styleEl.styleSheet.cssText += ss) || styleEl.appendChild((doc||document).createTextNode(ss));
          return styleEl;
        }
        ,
/**
 * 获得一个请求字符串,该字符串用于避免浏览器缓存请求页面,追加在URL尾部.
 * <pre><code>
 * var requestUrl = 'http://www.site.com/?name=rock'+CC.noCache();
   </code></pre>
 * @return {String} 避免浏览器缓存请求页面的字符串.
 */
        noCache: function() {
            return '&noCacheReq=' + (new Date()).getTime();
        }
        ,
/**
 * 将可枚举对象内容复制到新数组中,并返回该数组,可枚举对象是指可用[index]访问,并具有length属性的,常见的有arguments对象.
 * @param {Object} iterable 可枚举对象
 * @return {Array} 新数组
 * @member CC
 * @method $A
 */
        $A : function(a) {
            return Slice.call(a);
        },
/**
 * 获得iframe中的document结点.
 * @param {DOMElement} iframe iframe结点
 * @return {DOMElement} iframe页面中的document结点
 */
        frameDoc : function(frame) {
            return frame.contentWindow ? frame.contentWindow.document:frame.contentDocument;
        },
/**
 * 获得iframe中的window对象.
 * @param {DOMElement} iframe iframe结点
 * @return {DOMElement} window iframe页面中的window对象
 */
        frameWin : function(frame){
            return frame.contentWindow;
        },
/**
 * 获得文档内容区域高度.
 * @return {Number}
 */
        getDocumentHeight: function() {
            var scrollHeight = !this.strict ? document.body.scrollHeight : document.documentElement.scrollHeight;
            return Math.max(scrollHeight, this.getViewportHeight());
        },
/**
 * 获得文档内容区域宽度.
 * @return {Number}
 */
        getDocumentWidth: function() {
            var scrollWidth = !this.strict ? document.body.scrollWidth : document.documentElement.scrollWidth;
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
 <pre><code>
   var vp = CC.getViewport();
   alert(vp.width+','+vp.height);
 </code></pre>
 * @return {Object} obj.width,obj.height
 */
        getViewport : function(){
          return {width:this.getViewportWidth(), height:this.getViewportHeight()};
        },
/**是否IE浏览器*/
        ie : isIE,
/**是否IE7*/
        ie7 : isIE7,
/**是否IE6*/
        ie6 : isIE6,
/**是否strict模式*/
        strict : isStrict,
/**是否safari*/
        safari : isSafari,
/**是否gecko*/
        gecko : isGecko,
/**是否opera*/
        opera : isOpera,
/**是否border box模型*/
        borderBox:isBorderBox
    };

//合并外部CC
if(window.CC)
CC.extend(CC, window.CC);

window.CC = CC;
/**
 * @class CC.Util
 * UI相关功能函数存放类
 * @singleton
 */
if(!CC.Util)
CC.Util = {};
/**
 * @class CC.util
 * 实用功能类库集合
 */
CC.util = {};
return CC;
})();

﻿
/*!
 * 在不改变原意的前提下,原型扩展如此便利快速,为何不好?
 * 感觉良好!
 */

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
    },
/**
 * 复制并返回新数组。
 */
    clone : function(){
        var a = [];
        for(var i = this.length - 1;i>=0;i--)
            a[i] = this[i];
        
        return a;
    }
}
);
})();
﻿(function(){
var CC = window.CC;
/**
 * 缓存类,数据结构为:<br>
 * <pre>
 * Cache[key] = [dataObjectArray||null, generator];
 * dataObjectArray[0] = 预留位,保存该key数据最大缓存个数, 默认为5.
 * generator = 生成数据回调
 * </pre>
 * @class CC.Cache
 * @singleton
 */
CC.Cache =
   {

    /**@cfg {Number} MAX_ITEM_SIZE 某类设置的最大缓存数量.*/
    MAX_ITEM_SIZE: 5,

    /**@private 获取缓存数据的回调函数.*/
    callbacks: [],
/**
 * 注册数据产生方式回调函数,可重复赋值,函数返回键对应的数据.
 * @param {Object} key
 * @param {Function} callback
 * @param {Number} [max] 缓存该数据的最大值
 */
    register: function(k, callback, max) {
       if(!this[k])
        this[k] = [null, callback];
       else this[k][1] = callback;

       if(max !== undefined)
        this.sizeFor(k, max);
    }
    ,
/**
 * 根据键获得对应的缓存数据.
 * @param {String} key
 * @return {Object|null}
 */
    get: function(k) {
        var a = this[k];
        if(a === undefined)
            return null;
        var b = a[1];
        a = a[0];

        if(a === null){
          return b();
        }
        //0位预留
        if(a.length > 1)
            return a.pop();
        if(b)
            return b();

        return null;
    }
    ,
/**
 * 缓存键值数据.
 * @param {Object} key
 * @param {Object} value
 */
    put: function(k, v) {
        var a = this[k];
        if(!a){
            this[k] = a = [[this.MAX_ITEM_SIZE, v]];
            return;
        }
        var c = a[0];
        if(!c)
          a[0] = c = [this.MAX_ITEM_SIZE];

        if (c.length - 1 >= c[0]) {
            return ;
        }

        c.push(v);
    },

/**
 * 移除缓存.
 * @param {Object} key 键值
 */
    remove : function(k){
      var a = this[k];
      if(a){
        delete this[k];
      }
    },
/**
 * 设置指定键值缓存数据的最大值.
 * @param {Object} key
 * @param {Number} max
 */
    sizeFor : function( k, max ) {
        var a = this[k];
        if(!a)
          this[k] = a = [[]];
        if(!a[0])
          a[0] = [];
        a[0][0] = max;
    }
};

/**
 * 缓存DIV结点,该结点可方便复用其innerHTML功能.
 * <pre><code>
   var divNode = CC.Cache.get('div');
 * </code></pre>
 * @property div
 * @type DOMElement
 */
CC.Cache.register('div', function() {
    return CC. $C('DIV');
}
);
})();
﻿(function(){
 var cvtMap = {};
 var cptMap = {};
/**
 * @class CC.util.TypeConverter
 * 数据类型转换器
 * <pre><code>
  var cvt = CC.util.TypeConverter.get('int');
  var num = cvt('123456');
  alert(typeof num);
 * </code></pre><br>系统自带类型转换有
 <div class="mdetail-params"><ul>
 <li>string</li>
 <li>int</li>
 <li>float</li>
 <li>bool</li>
 <li>date</li>
 </ul></div>
 */
CC.util.TypeConverter = {
/**
 * 注册一个类型转换函数.
 * @param {String} type
 * @param {Function} converter
 */
  reg : function(type, cvt){
    cvtMap[type] = cvt;
  },

/**
 * 根据type获得类型转换函数.
 * @param {String} type
 * @return {Function}
 */
  get : function(type){
    var c = cvtMap[type];
    if(!c){
      c = this.create.apply(this, arguments);
      if(!c)
        throw '未识别的数据类型:'+type;
      cvtMap[type] = c;
    }

    return c;
  },

/**
 * 获得类型比较器。
 * @param {String} type
 * @return {Function}
 */
  getComparator : function(type){
    var c = cptMap[type];
    if(!c){
      var cv = this.get(type);
      
      c = cptMap[type] = cv ? 
        (function(a, b){
          var a = cv(a), b = cv(b);
          if (a > b)
            return 1;
          
          if (a < b)
            return -1;
          
          return 0;
        }) :
         
        (function(a, b){
          if (a > b)
            return 1;
          
          if (a < b)
            return -1;
          
          return 0;
        }) 
    }
    return c;
  },

  /**
  * 数据类型转换器,创建后存在属性converter中,用于比较器比较两列值.
  * @param {String} type
  * @return {Object} 该列的数据类型转换器
  * @private
  */
  create: function(type){
    var numReg = /[\$,%]/g, cv;
    switch (type) {
      case "":
      case undefined:
        cv = function(v){
          return (v === null || v === undefined) ? v : v.toString();
        };
      break;

      case "string":
        cv = function(v){
          return (v === undefined || v === null) ? '' : v.toString();
        };
      break;

      case "int":
        cv = function(v){
          return v !== undefined && v !== null && v !== '' ? parseInt(v.toString().replace(numReg, ""), 10) : '';
        };
      break;

      case "float":
        cv = function(v){
          return v !== undefined && v !== null && v !== '' ? parseFloat(v.toString().replace(numReg, ""), 10) : '';
        };
      break;

      case "bool":
        cv = function(v){
          return v === true || v === "true" || v == 1;
        };
      break;

      case "date":
        cv = function(v){
          if (!v)
            return '';

          if (CC.isDate(v))
            return v;
          // date format
          var dt = arguments[1];
          if (dt) {
            if (dt === "timestamp") {
              return new Date(v * 1000);
            }
            if (dt === "time") {
              return new Date(parseInt(v, 10));
            }
            return Date.parseDate(v, dt);
          }
          var parsed = Date.parse(v);
          return parsed ? new Date(parsed) : null;
        };
      break;
    }
    return cv;
  }
};

})();
﻿//~@base/CssParser.js
(function(){
var C = {
//1c, 占宽一列, 即width:95%
  '1c':['width','95%'],
//2c, 占宽两列, 即width:45%
  '2c':['width','45%'],
  '3c':['width','30%'],
  '4c':['width','20%'],
  '5c':['width','10%'],
//c:5 为 width = 5*10 + '%',结果为width=50%
  'c' :function(c,v){c.view.style.width = v + '%'},
  'w' :function(c,v){c.view.style.width = v;},
  'h' :function(c,v){c.view.style.height = v;},
  'd' :function(c,v){c.view.style.display = v;},
  'db': ['display', 'block'],
  'dib':['display', 'inline-block'],
  'dh' :['display', 'hidden'],
  'np':['padding','0px'],
  'nb':['border','0px'],

  'fl':['float','left'],
  'fr':['float','right'],
  'cb':['clear','both'],

  'tl':['textAlign','left'],
  'tr':['textAlign','right'],
  'tc':['textAlign','center'],

  'p':function(c, v){c.view.style.padding = v;},
  'pl':function(c, v){c.view.style.paddingLeft = v;},
  'pr':function(c, v){c.view.style.paddingRight = v;},
  'pt':function(c, v){c.view.style.paddingTop = v;},
  'pb':function(c, v){c.view.style.paddingBottom = v;},

  'bd':function(c, v){c.view.style.border = v;},
  'bdl':function(c, v){c.view.style.borderLeft = v;},
  'bdr':function(c, v){c.view.style.borderRight = v;},
  'bdt':function(c, v){c.view.style.borderTop = v;},
  'bdb':function(c, v){c.view.style.borderBottom = v;},
   
  'z'  :function(c, v){c.view.style.zIndex = v;},
   
//常用于布局Border设置
  'lnl':['borderLeft',  '1px solid #CCC'],
  'lnt':['borderTop',   '1px solid #CCC'],
  'lnb':['borderBottom','1px solid #CCC'],
  'lnr':['borderRight', '1px solid #CCC'],
  'lnx':['border',      '1px solid #CCC'],

  'm':function(c, v){c.view.style.margin  = v;},
  'ml':function(c, v){c.view.style.marginLeft  = v;},
  'mr':function(c, v){c.view.style.marginRight  = v;},
  'mt':function(c, v){c.view.style.marginTop  = v;},
  'mb':function(c, v){c.view.style.marginBottom  = v;},

  'pa':['position', 'absolute'],
  'pr':['position', 'relative'],
  'b' :function(c, v){c.view.style.bottom = v;},
  'l' :function(c, v){c.view.style.left = v;},
  'r' :function(c, v){c.view.style.right = v;},
  't' :function(c, v){c.view.style.top = v;},
  'of':function(c, v){c.view.style.overflow = v;},
  'oh':['overflow','hidden'],
  'oa':['overflow','auto'],
  
  'v' : function(c, v){
     v = v.split('=');
     c.view.style[v[0]] = v[1];
   }
};

var S = /\s+/, B  = CC.borderBox, inst;

/**
 * @class CC.util.CssParser
 * CssParser对于懒得写CSS或需要用脚本控制css的开发人员来说,是个好工具.
 * 它可以以一种非常简单的方式写元素的inline css style.<br>
 * 例如<pre><code>
   parser.parse(comp, 'pa l:5 t:10 ofh ac w:25 $pd:5,3');
   上面这句将应用comp以下样式:
   {
    position:absolute;
    left:5px;
    top:10px;
    overflow:hidden;
    text-align:center;
    width:25px;
    对于border box浏览器应用
    padding:5px 3px;
   }
   CC.Base的cset方法已内嵌CSS Parser解析,以上可直接调用
   comp.parse('pa l:5 t:10 oh tc w:25 $p:5,3');
   </code></pre><br>
系统自带的规则为:<br>
<pre><code>
{
//1c, 占宽一列, 即width:95%
  '1c':['width','95%'],
//2c, 占宽两列, 即width:45%
  '2c':['width','45%'],
  '3c':['width','30%'],
  '4c':['width','20%'],
  '5c':['width','10%'],
//c:5 为 width = 5*10 + '%',结果为width=50%
  'c' :function(c,v){c.view.style.width = v + '%'},
  'w' :function(c,v){c.view.style.width = v;},
  'h' :function(c,v){c.view.style.height = v;},
  'd' :function(c,v){c.view.style.display = v;},
  'db': ['display', 'block'],
  'dib':['display', 'inline-block'],
  'dh' :['display', 'hidden'],
  'np':['padding','0px'],
  'nb':['border','0px'],

  'fl':['float','left'],
  'fr':['float','right'],
  'cb':['clear','both'],

  'tl':['textAlign','left'],
  'tr':['textAlign','right'],
  'tc':['textAlign','center'],

  'p':function(c, v){c.view.style.padding = v;},
  'pl':function(c, v){c.view.style.paddingLeft = v;},
  'pr':function(c, v){c.view.style.paddingRight = v;},
  'pt':function(c, v){c.view.style.paddingTop = v;},
  'pb':function(c, v){c.view.style.paddingBottom = v;},

  'bd':function(c, v){c.view.style.border = v;},
  'bdl':function(c, v){c.view.style.borderLeft = v;},
  'bdr':function(c, v){c.view.style.borderRight = v;},
  'bdt':function(c, v){c.view.style.borderTop = v;},
  'bdb':function(c, v){c.view.style.borderBottom = v;},
   
  'z'  :function(c, v){c.view.style.zIndex = v;},
   
  'lnl':['borderLeft',  '1px solid #CCC'],
  'lnt':['borderTop',   '1px solid #CCC'],
  'lnb':['borderBottom','1px solid #CCC'],
  'lnr':['borderRight', '1px solid #CCC'],
  'lnx':['border',      '1px solid #CCC'],

  'm':function(c, v){c.view.style.margin  = v;},
  'ml':function(c, v){c.view.style.marginLeft  = v;},
  'mr':function(c, v){c.view.style.marginRight  = v;},
  'mt':function(c, v){c.view.style.marginTop  = v;},
  'mb':function(c, v){c.view.style.marginBottom  = v;},

  'pa':['position', 'absolute'],
  'pr':['position', 'relative'],
  'b' :function(c, v){c.view.style.bottom = v;},
  'l' :function(c, v){c.view.style.left = v;},
  'r' :function(c, v){c.view.style.right = v;},
  't' :function(c, v){c.view.style.top = v;},
  'of':function(c, v){c.view.style.overflow = v;},
  'oh':['overflow','hidden'],
  'oa':['overflow','auto']
}
</code></pre>
 */
CC.util.CssParser = function(){};

CC.extendIf(CC.util.CssParser.prototype, {
/**
 * 定义规则.<br>
 <pre><code>
   parser.def('fl', ['float', 'left']);
   parser.def('bdred', {border:'1px red'});
   parser.def('bd', function(comp, value){
    comp.setStyle('border', value);
   });
 </code></pre>
 * @param {String|Object} key 当为Object类型时批量定义规则
 * @param  {Object} value 可以是一个属生集的Object, 也可以是css属性组合的数组[attrName, attrValue],还可以是一个函数,该函数参数为 function(component, value){},其中component为应用样式的控件,value为当前解析得出的值,未设置则为空.
 */
  def : function(k, r){
    var rs = this.rules;
    if(!rs)
      rs = this.rules = {};

    if(typeof k === 'object'){
      for(var i in k)
        rs[i] = k[i];
    }else {
      rs[k] = r;
    }
    return this;
  },
/**
 * 解析指定规则.
 * @param {CC.Base} taget 目标控件
 * @param {String} pattern 规则样式字符串
 */
  parse : function(ct, cs){
    var cf, r,
        cs = cs.split(S),
        i,len,rv, rs = this.rules,
        wc,d,v;

    for(i=0,len=cs.length;i<len;i++){
      r = cs[i];

      //parse r=v
      d = r.indexOf(':');
      if(d>0){
          v = r.substring(d+1);
          v = v.replace(/,/g, ' ');
          r = r.substr(0, d);
      }else v = false;

      //parse -child
      if(r.charAt(0)==='^'){
        r = r.substring(1);
        if(r.charAt(0) === '$'){
          if(!B)
            continue;
          r = r.substring(1);
        }
        rv = rs&&rs[r] || C[r] || r;

        if(!cf)
          cf = [];
        cf.push(rv);
        cf.push(v);
      }

      //
      else {
        // parse $ border box only
        if(r.charAt(0) === '$'){
          if(B){
            r = r.substring(1);
            rv = rs&&rs[r] || C[r];
            if(rv)
              this.applyRule(ct, rv, v);
          }
        }else {
          rv = rs&&rs[r] || C[r] || r;
          this.applyRule(ct, rv, v);
        }
      }
    }

    if(cf && cf.length>0 && ct.children){
      for (i=0,cs=ct.children,len=cs.length; i < len; i++) {
        s = cs[i];
        for(var k=0,m=cf.length;k<m;k+=2){
           this.applyRule(s, cf[k], cf[k+1]);
        }
      }
    }
  },
  /**@private*/
  applyRule : function(c, rv, v){
    //array
    if(CC.isArray(rv)){
      c.setStyle(rv[0], v||rv[1]);
    }

    //object
    else if(typeof rv === 'object'){
      for(var k in rv)
        c.setStyle(k, rv[k]);
    }

    //string
    else if(typeof rv === 'string'){
      if(rv.charAt(0) !== '.'){
        //continue parsing
        if(rv.indexOf(' ')<0)
          throw 'CC.util.CssParser: Unsupported instruction \''+rv+'\'';

        this.parse(c, rv);
      }else {
        //single string
        c.addClass(rv.substring(1));
      }
    }
    //function
    else if(typeof rv === 'function'){
      rv(c, v, this);
    }
  }
});
/**
 * 获得全局CSS解析器
 * @member CC.util.CssParser
 * @method getParser
 * @static
 * @return CC.util.CssParser
 */
CC.util.CssParser.getParser = function(){
  if(!inst)
    inst = new CC.util.CssParser();

  return inst;
};
})();
﻿(function(){
/**
 * @class CC.Eventable
 * 事件处理模型的实现.
 * @constructor
 * @param {Object} config config object
 */
 
 
/**
 * 发送对象事件.<br>
 <pre><code>
  var e = new Eventable();
  e.on('selected', function(arg){
   //handling..
  });
  e.fire('selected', arg);
  </code></pre>
 * @method fire
 * @param {Object} eid 事件名称
 * @param {Object, Object, ...} args 传递的回调参数
 */


/**
 * 监听对象事件,如果回调函数返回false,取消后续的事件处理. <br>
 <pre><code>
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
   </code></pre>
 * @param {Object} eid 事件名称
 * @param {Function} callback 事件回调函数
 * @param {Object} [ds] this范围对象
 * @param {Object} [objArgs] 传递参数,该参数将作为回调最后一个参数传递
 * @method on
 * @return this
 */

/**
 * 移除事件监听.
 * @param {Object} eid
 * @param {Function} callback
 * @method un
 * @return this
 */

/**
 * 发送一次后移除所有监听器,有些事件只通知一次的,此时可调用该方法发送事件
 * @param {Object} eid
 * @method fireOnce
 * @return this
 */

/**
 * 订阅当前对象所有事件
 * @param {Object} target 订阅者,订阅者也是可Eventable的对象
 * @method to
 * @return this
 */


/**
 * 默认为fire,自定订阅方式可重写.<br>
 <pre><code>
  var source = new Eventable();
  var subscriber = new Eventable();

  source.to(subscribers);
  subscriber.on('load', function(){});

  source.fire('load');
  </code></pre>
 * @method fireSubscribe
 * @return this
 */
 
var Eventable = CC.Eventable = (function(opt){
    /**
     * @cfg {Object} events 保存的事件列表,格式为
     <pre><code>
       events : {
         // names
         'eventName' : [ //Array, handler list
           // handler data
           {  
             // callback 简写
             cb : function(arguments){
               // ...
             },
             
             // <b>this</b> caller
             caller : object
           },
           ...
         ],
         ...
       }
     </code></pre>
     */
     if(opt)
      CC.extend(this, opt);
     
     CC.extend(this, Eventable.prototype);
});

Eventable.prototype = {

  fire : function(eid){
  
  	if(__debug) {console.log('发送:%s,%o,源:%o',eid, arguments,this);}
  
  	if(this.events){
  		
  		var handlers = this.events[eid];
  		
  		if(handlers){
  			var fnArgs = CC.$A(arguments),
  			    argLen = fnArgs.length, 
  			    ret, i, len, oHand;
  			    
  			// remove eid the first argument
  			fnArgs.shift();
        
        handlers._evtLocked = true;
        
  			for(i=0,len=handlers.length;i<len;i++){
  				oHand = handlers[i];
  				
  				// 标记已删除
  				if( oHand.removed)
  				   continue;
  				// 如果注册处理中存在参数args,追加到当前参数列尾
  				if(oHand.args)
  				   fnArgs[argLen] = oHand.args;
  
  				// 如果注册处理中存在this,应用this调用处理函数
  				ret = (oHand.ds)?oHand.cb.apply(oHand.ds,fnArgs):oHand.cb.apply(this,fnArgs);
  				
  				//如果某个处理回调返回false,取消后续处理
  				if(ret === false)
  				   break;
  			}
  			
  			handlers._evtLocked = false;
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
  },
  
  on   :  function(eid,callback,ds,objArgs){
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
  },
  
  un : function(eid,callback){
      if(!this.events)
        return this;
      
      if(callback === undefined){
        delete this.events[eid];
        return this;
      }
  
      var handlers = this.events[eid];
  
      if(handlers){
        
          if(handlers._evtLocked) {
             // 产生迭代修改冲突，将复制新数组。
             handlers = this.events[eid] = handlers.slice(0);
          }
          
          for(var i=0;i<handlers.length;i++){
              var oHand = handlers[i];
              if(oHand.cb == callback){
                  handlers.remove(i);
                  // 标记删除
                  oHand.removed = true;
                  break;
              }
          }
      }
      return this;
  },
  
  fireOnce : function(eid){
    var r = this.fire.apply(this, arguments);
    this.un(eid);
    return r;
  },
  
  to : function(target){
    if(!this.subscribers)
      this.subscribers = [];
    if(this.subscribers.indexOf(target) > 0)
      return;
    this.subscribers.push(target);
    return this;
  }
};


Eventable.prototype.fireSubscribe = Eventable.prototype.fire;
})();
﻿(function(){
/**
 * @class CC.Event
 * DOM事件处理实用函数库,更多关于浏览器DOM事件的文章请查看<a href="http://www.bgscript.com/archives/369" target="_blank">http://www.bgscript.com/archives/369</a>
 * @singleton
 */
var Event = CC.Event = {};
var document = window.document;
var opera = CC.opera, chrome = CC.chrome, ie = CC.ie;
var DocMouseDownEventable = new CC.Eventable();
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
        Event.stopPropagation(ev||window.event);
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
﻿/**
 * @class console
 * 系统控制台,如果存在firebug,利用firebug输出调试信息,否则忽略.
 * 在firbug中可直接进行对某个对象进行监视,
 * 无console时就为空调用,可重写自定输出.
 * @singleton
 */
if(!window.console)
      window.console = {};

if(!window.tester)
  window.tester = window.fireunit || {};

CC.extendIf(console,
  {
      /**
       * %o表示参数为一个对象
       * console.log('This an string "%s",this is an object , link %o','a string', CC);
       *@param {arguments} 类似C语言中printf语法
       *@method
       */
    debug : fGo,
/**
 * @method info
 */
    info : fGo,
/**
 * @method trace
 */
    trace : fGo,
/**
 * @method log
 */
    log : fGo,
/**
 * @method warn
 */
    warn : fGo,
/**
 * @method error
 */
    error : fGo,
/**
 * @method assert
 */
    assert:function(a, b){
        if(a !== b) {
            this.trace();
            throw "Assertion failed @"+a+' !== '+b;
        }
    },
    
      /**
       * 列出对象所有属性.
       *@param {object} javascript对象
       *@method dir
      */
    dir:fGo,
/**
 * @method count
 */
    count : fGo,
/**
 * @method group
 */
    group:fGo,
/**
 * @method groupEnd
 */
    groupEnd:fGo,
/**
 * @method time
 */
    time:fGo,
/**
 * @method timeEnd
 */
    timeEnd:fGo});
//基于firebug插件fireunit
CC.extendIf(tester, {
  ok : function(a, b){
    if(typeof a === 'function')
      a = a();
    if(typeof b === 'function')
      b = b();
    if(a != b){
      alert('assert failed in testing '+a+'=='+b);
      console.group('断言失败:',a, b);
      console.error(a, b);
      console.trace();
      console.groupEnd();
    }
  },
  testDone : fGo
});
/**
 * @class CC.util.JSONPConnector
 * 该类实现JSONP跨域请求，并实现XMLHttpRequest类常用方法，使得可以直接应用到{@link CC.Ajax}类中.<br>
 * 要发起JSONP请求，可利用{@link CC.Ajax}类，不必直接调用本类。
 * <br>JSONP原理:<br><pre>
Jsonp原理：
首先在客户端注册一个callback, 然后把callback的名字传给服务器。
此时，服务器生成 json 数据,然后以 javascript 语法的方式，生成一个function , function 名字就是传递上来的参数 jsonp.
最后将 json 数据直接以入参的方式，放置到 function 中，这样就生成了一段 js 语法的文档，返回给客户端。
客户端浏览器，解析script标签，并执行返回的 javascript 文档，此时数据作为参数，传入到了客户端预先定义好的 callback 函数里.（动态执行回调函数）
</pre>
 * @constructor
 * @param {Object} config
 */

/**
 * @cfg {Function} onreadystatechange 状态变更后回调
 */

CC.create('CC.util.JSONPConnector', null, {
    
    initialize : function(cfg){
        this.cfg = cfg;
    },
    
/**
 * 中止请求
 */
    abort : function(){
        if(!this.cleaned)
            this._clean();
    },
    
    setRequestHeader : fGo,
    getResponseHeader : fGo,

    open : function(method, url){
        if(url)
            this.url = url;
    },
    
    send : function(data){
        var cfg = this.cfg || {};
            url = this.url || cfg.url, 
            isQ = url.indexOf('?')>=0,
            win = cfg.win || window,
            fn  = 'jsonp_' + (+new Date()),
            doc = cfg.win ? CC.frameDoc(win) : document,
            script = doc.createElement('script'),
            jsonp = cfg.jsonp || 'jsonp',
            hd = doc.getElementsByTagName("head")[0],
            self = this;
            
        url = url + ( isQ ? '&'+jsonp+'='+fn : '?'+jsonp+'='+fn);
        
        data && ( url = url + ( typeof data === 'string' ? data : CC.queryString(data) ));

        script.type = 'text/javascript';
        cfg.charset && (script.charset = cfg.charset);
        cfg.deffer  && (script.deffer  = cfg.deffer);
        script.src = url;
        
        win[fn] = function(){
            self._clean();
        };
        
        this._win = win;
        this._script = script;
        this._fn = fn;
        
        this.cleaned = false;
        
        // jsonp callback
        win[fn] = function(){
            if(!self.cleaned){
                self._clean();
                self._fireState(4, 200, arguments);
            }
        };

        script.onreadystatechange = script.onload = function(e){
            var rs = this.readyState;
            if( !self.cleaned && (!rs || rs === 'loaded' || rs === 'complete') ){
                self._clean();
                self._fireState(4, -1);
            }
        };
                
        hd.appendChild(script);
    },
    
    _clean : function(){
        try {
            delete this._win[this._fn];
            delete this._win;
            delete this._fn;
            this._script.onreadystatechange = null;
            this._script.parentNode.removeChild(this._script);
            delete this._script;
            delete this.cfg;
        }catch(e){}
        this.cleaned = true;
    },
    
    _fireState : function(rs, status, args){
        this.readyState = rs;
        if(status !== undefined)
            this.status = status;
        this.onreadystatechange.call(this, args);
    }
});
﻿/*!
 * Javascript Utility for web development.
 * 反馈 : www.bgscript.com/forum
 * www.bgscript.com ? 2010 - 构建自由的WEB应用
 */
(function(){
	var CC = window.CC;
/**
 * @class CC.Ajax
 * CC.Ajax Ajax请求封装类<br>
 * 该类依赖底层连接器实现，目前已实现的连接器有
 * <ul>
 * <li>XMLHttpRequest，这是浏览器自带的http连接，不能跨哉。</li>
 * <li>JSONP，利用script标签加载资源，可跨域。，参见{@link CC.util.JSONPConnector}</li>
 * </ul>
 * AJAX类具有很详细的事件列表，利用这些事件可控制请求的每个细节。
 * 可以new一个实例，再调用{@link open}, {@link send}或{@link connect}方法请求数据，
 * 也可以直接调用静态方法{@link CC.Ajax.connect}发起请求。
 <pre><code>
  //连接服务器并获得返回的JSON数据
  CC.Ajax.connect({
    url : '/server/json/example.page?param=v',
    success : function(ajax){
                    var json = this.getJson();
                    alert(json.someKey);
    },
    failure : function(){alert('连接失败.');},
    
    onfinal : function(){
        alert('无论成功与否，都被执行');
    }
  });

  //连接服务器并获得返回的XML文档对象数据
  CC.Ajax.connect({
    url : '/server/xml/example.page?param=v',
    success : function(ajax){
                    var xmlDoc = ajax.getXmlDoc();
                    alert(xmlDoc);
    }
  });

  // 连接服务器并运行返回的html数据,
  // 将html显示在设置的displayPanel中,在window范围内运行Javascript和style
  CC.Ajax.connect({
    url : '/server/xml/example.page?param=v',
    displayPanel : 'panel'
  });

  //
  var ajax = new CC.Ajax({
   url : '...',
   // 指定POST请法度
   method:'POST',
   // POST数据
   data : {article:'long long text.'}
   ....
  });
  ajax.connect();
  
  // 当资源需要跨域时，可进行JSONP请求，返回JSON对象数据。
  CC.Ajax.connect({
    // 指定方式为JSONP
    method : 'JSONP',
    //其它设置一样
    success : function(json){
        alert(json);
    }
  });
  </code></pre>
 * @extends CC.Eventable 
 */
var Ajax = CC.Ajax = CC.create();
/**
 * 快速Ajax调用<br>
  <pre><code>
  //连接服务器并获得返回的JSON数据
  Ajax.connect({
    url : '/server/json/example.page?param=v',
    success : function(ajax){
                    var json = this.getJson();
                    alert(json.someKey);
                },
    failure : function(){alert('连接失败.');}
  });

  //连接服务器并获得返回的XML文档对象数据
  Ajax.connect({
    url : '/server/xml/example.page?param=v',
    success : function(ajax){
                    var xmlDoc = this.getXmlDoc();
                    alert(xmlDoc);
                }
  });

  //连接服务器并运行返回的html数据,将html显示在设置的displayPanel中,在window范围内运行Javascript和style
  Ajax.connect({
    url : '/server/xml/example.page?param=v',
    displayPanel : 'panel'
  });
  </code></pre>
 * @member CC.Ajax
 */
Ajax.connect = (function(option){
    var ajax = new Ajax(option);
    ajax.connect();
    return ajax;
});

/**
* @event final
* 请求结束后调用,无论成功与否.
* @param {CC.Ajax} ajax
*/
/**
 * @event open
 * 在打开前发送
 * @param {CC.Ajax} ajax
 */

 /**
  * @event send
  * 在发送数据前发送
  * @param {CC.Ajax} ajax
  */
  
/**
 * @event json
 * 在获得XMLHttpRequest数据调后Ajax.getJson方法后发送,可直接对当前json对象作更改,这样可对返回的json数据作预处理.
 * @param {Object} o json对象
 * @param {Ajax} ajax
 */
/**
 * @event xmlDoc
 * 在获得XMLHttpRequest数据调后Ajax.getXMLDoc方法后发送,可直接对当前xmlDoc对象作更改,这样可对返回的XMLDoc数据作预处理.
 * @param {XMLDocument} doc
 * @param {CC.Ajax} ajax
 */
/**
 * @event text
 * 在获得XMLHttpRequest数据调后Ajax.getText方法后发送,如果要改变当前text数据,在更改text后设置当前Ajax对象text属性即可,这样可对返回的文件数据作预处理.
 * @param {String} responseText
 * @param {CC.Ajax} ajax
 */
/**
 * @event failure
 * 数据请求失败返回后发送.
 * @param {CC.Ajax} ajax
 */
 
/**
 * @event success
 * 数据成功返回加载后发送.
 * @param {CC.Ajax} ajax
 */
 
/**
 * @event load
 * 请求响应返回加载后发送(此时readyState = 4).
 * @param {CC.Ajax} ajax
 */
 
/**
 * @event statuschange
 * 在每个fire事件发送前该事件都会发送
 * @param {String} status
 * @param {CC.Ajax} j
 */
Ajax.prototype =
   /**
    * @class CC.Ajax
    */
   {
/**
 * @cfg {String} method GET 或者 POST 或者 JSONP,默认GET.
 */
    method :'GET',
/**@cfg {String} url 请求URL*/
    url : null,
/**@cfg {Boolean} asynchronous=true 是否异步,默认true*/
    asynchronous: true,
/**@cfg {Number} timeout=false 设置超时,默认无限制*/
    timeout: false,
/**@cfg {DOMElement} disabledComp 在请求过程中禁止的元素,请求结束后解除*/
   disabledComp : undefined,
/**@cfg {String} contentType 默认application/x-www-form-urlencoded*/
    contentType: 'application/x-www-form-urlencoded',
/**@cfg {String} msg 提示消息*/
    msg: "数据加载中,请稍候...",

/**@cfg {Boolean} cache=true 是否忽略浏览器缓存,默认为true.*/
    cache:true,

/**
 * @cfg {Function} caller 用于调用failure,success函数的this对象.
 */

/**
 * @cfg {Function} failure 失败后的回调.
 */

/**
 * @cfg {Object} data POST时发送的数据
 */

/**
 * @cfg {String|Object} params G提交的字符串参数或Map键值对,结果被追加到<b>url</b>尾.
 */
 /**
  *@cfg {Function} success 设置成功后的回调,默认为调用{@link invokeHtml}运行服务器返回的数据内容.
  */
    success: (function(ajax) {
        ajax.invokeHtml();
    }),

    /**
     * @cfg {Function} onfinal 无论请求成功与否最终都被调用.
     */

    /**@cfg {DOMElement|String} displayPanel 如果数据已加载,数据显示的DOM面板.*/
    displayPanel: null,

/**
 * @property xmlReq XMLHttpRequest对象
 * @type XMLHttpRequest
 */

/**
 * @property busy
 * 指明当前Ajax是否处理请求处理状态,在open后直至close前该值为真.
 * @type Boolean
 */
 
/**
 * @property loaded
 * 指明当前请求是否已成功返回(状态码200).
 * @type Boolean
 */

/**
 * @property closed
 * 指明当前请求是否已关闭.
 * @type Boolean
 */

/**
 * 在每个事件发送后,事件名称记录在该属性下.
 * @property status
 * @type String
 */

/**
 * @property text
 * 调用{@link #getText}方法后保存的text文本,在{@link #close}方法调用后销毁, 可重设以后某些过滤处理.
 * @type String
 */
         
/**
 * @property xmlDoc
 * 调用{@link #getXmlDoc}方法后保存的XMLDocument对象,在{@link #close}方法调用后销毁.
 * @type XMLDocument
 */

/**
 * @property json
 * 调用{@link #getJson}方法后保存的json对象,在{@link #close}方法调用后销毁.
 * @type Object
 */
             

    /**
     * @private
     * 根据设置初始化.
     */
    initialize: function(options) {
        CC.extend(this, options);
        this.method = this.method.toUpperCase();
    }
    ,

  /**
   * 重设置.
   * @param {Object} opts
   */
    setOption: function(opts) {
      CC.extend(this, opts);
    }
    ,

   /**
   * 重写以实现自定消息界面,用于进度的消息显示,默认为空调用.
   * @method setMsg
   */
    setMsg: fGo
    ,
    /**@private*/
    _onTimeout: function() {
        if (this.xmlReq.readyState >= 4) {
            return ;
        }
        if(__debug) console.log('ajax request timeout for '+this.url);
        this.abort();
        this._fire('timeout', this);
        this._close();
    }
    ,
    
    closed : false,
    
    /**@private*/
    _close: function() {
      if(!this.closed){
        if(this.timeout)
            clearTimeout(this._tid);
        if(this.onfinal)
            if(this.caller)
                this.onfinal.call(this.caller,this);
            else
                this.onfinal.call(this,this);

        this._fire('final', this);

        if (this.disabledComp)
            CC.disable(this.disabledComp, false);

        if(!(this.json === undefined))
            delete this.json;
        if(!(this.xmlDoc === undefined))
            delete this.xmlDoc;

        if(!(this.text === undefined))
            delete this.text;

        this.disabledComp = null;
        this.xmlReq = null;
        this.params = null;
        this.busy = 0;
        this.closed = true;
      }
    }
    ,

    /**终止请求*/
    abort: function() {
      if(this.xmlReq !== null){
        this.xmlReq.abort();
        this.aborted = true;
        this._close();
      }
    }
    ,
    /**@private*/
    _req : function(){
        if(!this.xmlReq)
            this.xmlReq = this.method==='JSONP'? 
                new CC.util.JSONPConnector(this) : 
                CC.ajaxRequest();
    },
    /**@private*/
    _setHeaders: function() {
        this._req();
        if (this.method === 'POST') {
            this.xmlReq.setRequestHeader('Content-type', this.contentType + (this.encoding ? '; charset=' + this.encoding: ''));
        }
        var j = this.xmlReq;
        if(this.headers) {
          CC.each(this.headers, function(k, v){
            j.setRequestHeader(k, v);
          });
        }
    }
    ,

   /**
    * 建立XMLHttpRequest连接,在调用该方法后调用send方法前可设置HEADER.
    */
    open: function() {
        this._req();
        this.busy = 1;
        this._fire('open',this);
        
        if (this.timeout) {
            this._tid = setTimeout(this._onTimeout.bind(this), this.timeout);
        }

        if (this.disabledComp) {
            CC.disable(this.disabledComp, true);
        }

        var ps = this.params, ch = this.cache, theUrl = this.url;
        if(ps || ch){
            var isQ = theUrl.indexOf('?') > 0;
            if(ch){
                if (isQ)
                    theUrl = theUrl + '&__uid=' + (+new Date());
                else
                    theUrl = theUrl + '?__uid=' + (+new Date());
            }

            if(ps){
                if(!isQ && !ch)
                    theUrl = theUrl+'?';

                theUrl = theUrl + '&' + ((typeof ps === 'string') ? ps : CC.queryString(ps));
            }
        }
        this.xmlReq.open(this.method, theUrl, this.asynchronous);
    }
    ,

/**开始传输.
 * @param {object} [data] 要传输的数据
 */
    send: function(data) {
        this._fire('send', this);
        this._setHeaders();
        this.xmlReq.onreadystatechange = this._onReadyStateChange.bindRaw(this);
        this.setMsg(this.msg);
    
    if(!data)
        data = this.data;
        
    if(data){
      if(typeof data === 'object')
        data = CC.queryString(data);
      this.xmlReq.send(data);
    }
    else this.xmlReq.send();
  }
    ,
    /**
   * 建立连接并发送数据,如果当前Ajax类正忙,会终止先前连接再重新建立,这方法是连续调用open,send以完成的.
   *@param {object} [data] 要传输的数据
   */
    connect : function(data) {
        if(this.busy)
            try{
                this.abort();
            }catch(e){
                if(__debug) console.log(e);
            }

        this.open();
        this.send(data);
    },
/**
 * 设置请求数据头.
 * @param {Object} key
 * @param {Object} value
 */
    setRequestHeader: function(key, value) {
        this._req();
        try{
          this.xmlReq.setRequestHeader(key, value);
        }catch(e){
          this._close();
          if(__debug) console.log(e);
        }
    }
    ,
/**
 * 获得服务器返回的数据头信息.
 */
    getResponseHeader: function(key) {
        return this.xmlReq.getResponseHeader(key);
    }
    ,
    
    _fire : function(e){

    	this.status = e;
    	
    	if(this.statuschange)
    	   this.statuschange.call(this.caller||this, e, this);
    	   
    	Ajax.fire('statuschange', e, this);
    	this.fire('statuschange', e, this);
    	
      if(Ajax.fire.apply(Ajax, arguments) !== false){
      	if(this.fire.apply(this, arguments) !== false)
      	  return;
      }
      return false;
    },
    
    //private
    _onReadyStateChange: function() {
        var req = this.xmlReq;
        if (req.readyState === 4) {
        	if(!this.aborted){
            if(this._fire('load', this) === false)
              return;
            var success = this.success;
            var failure = this.failure;
            // req.status 为 本地文件请求
            try{
                if (req.status == 200) {
                    this.loaded = true;
                    if(this._fire('success', this) === false)
                      return false;
                    if(success){
                        if(this.method === 'JSONP')
                            success.apply(this.caller||this, arguments);
                        else success.call(this.caller||this, this);
                    }
                } else {
                	  if(req.status == 0)
                	    if(__debug) console.error('拒绝访问,确认是否跨域,',this.url); 
                    if(this._fire('failure', this) === false)
                      return false;
                    if(failure)
                        failure.call(this.caller||this, this);
                }
            }catch(reqEx){
                if(__debug) console.error(reqEx);
                this._close();
                throw reqEx;
            }
            this._close();
          }
        }
    }
    ,
/**
 * 提供访问返回数据一致性方法,以文本形式提取返回数据,并将该数据保存在当前Ajax实例的text属性中.
 * 调用该方法中发送text事件,在Ajax关闭后Ajax.text会被清空.
 * @return {string} text 服务器返回的文件数据
 */
    getText : function() {
        if(this.text)
            return this.text;
        var s = this.text = this.xmlReq.responseText;
        this._fire('text',s,this);
        return this.text;
    },
  /**
   * 获得服务器返回数据的XML Document 格式文档对象,该方法调用了XMLHttpRequest.responseXML.documentElement获得XML文档对象.
   * 在调用过程中会发送xmlDoc事件.
   * @return {XMLDocument} XML Document 文档对象.
   */
    getXmlDoc : function() {
        if(this.xmlDoc)
            return this.xmlDoc;

        var doc = this.xmlDoc = this.xmlReq.responseXML.documentElement;
        this._fire('xmlDoc', doc, this);
        return this.xmlDoc;
    },
   /**
   * 获得服务器返回数据格式的JSON对象,该方法先调用getText方法获得文本数据,再将数据转为Javascript对象.
   * 可改变返回的text文本数据以达到修改JSON数据的目的,只要在调用getJson重设ajax.text值即可.
   * 在调用过程中会发送text事件.
   * @return 转换后的Javascript对象,如果数据格式有误,返回undefined
   */
    getJson : function(){
        if(this.json)
            return this.json;
        var o;
        try {
            this.json = o = eval("("+this.getText()+");");
        }catch(e) {
            if(__debug) { console.log('Internal server error : a request responsed with wrong json format:\n'+e+"\n"+this.getText()); }
            throw e;
        }
        this._fire('json',o,this);
        return this.json;
    }
    ,
  /**
   * 运行返回内容中的JS,方法返回已剔除JS后的内容.<br>
   *<pre><code>
    //服务器返回的文本数据为
    &lt;script&gt;
      alert('Hello world!');
    &lt;/script&gt;
    &lt;div&gt;something&lt;/div&gt;

    //////////
    Ajax.connect({
      url:'/test/',
      success : function(){
       //以下ss值为 '&lt;xml&gt;something&lt;/xml&gt;',弹出的alert并显示Hello world!.
        var ss = this.invokeScript();
      }
    });
   *</code></pre>
   *@return {string} 返回已剔除JS后的内容
   */
    invokeScript: function() {
        return eval(this.getText());
    }
    ,
  /**
   * 应用请求返回的HTML文本,方法先提取JS(如果存在),style(如果存在),将剩下内容放入displayPanel(innerHTML)中,再运行提取的JS,style.
   */
    invokeHtml: function() {
        var cacheJS =[] ,cache = [];
        var ss = this.getText().stripScript(function(sMatch) {
            cacheJS[cacheJS.length] = sMatch;
        }
        );
        cache = [];
        //先应用CSS
        ss = ss.stripStyle(function(sMatch) {
            cache[cache.length] = sMatch.innerStyle();
        }
        );
        cache.join('').execStyle();
        //再应用HTML
        if (this.displayPanel) {
            CC.$(this.displayPanel).innerHTML = ss;
        }
        //最后应用JS
        cacheJS.join('').execScript();
        cache = null;
        cacheJS = null;
        ss = null;
    }
};

CC.Eventable.call(Ajax.prototype);
CC.Eventable.call(Ajax);
})();
﻿(function(CC){
var Eventable = CC.Eventable;
//component cache
var CPC = {};
var Cache = CC.Cache;
var Event = CC.Event;
/**
 * @class CC.Base
 * 为所有控件的基类,定义控件的基本属性与方法,管理控件的生命周期.<br>
 * 控件表现为属性+方法(行为)+视图(view),为了简单起见,在库控件的实现中控件属性和行为,可通过控件对象实例直接访问,而视图,即DOM部分可通过控件其中一个view属性访问.<br>
 * 一般来说,控件的私有属性和方法用下划线+名称表示.<br>
 * 控件的视图,即view,是表征控件外观,在页面中具体表现为html,从设计上来说,有两种方法可改变控件的视图,一是通过CSS控制控件的外观,二是改变控件视图的HTML.<br>
 * 第一种改变CSS有时达不到预期效果,它改变的仅仅是风格,如果两种都可运用则可使定义外观方式变得强大.<br>
 * 为了使得控件具体有多种外观而保持不变的行为,在库的控件实现中采用模板的方式定义控件的外观,在模板数据中可以定义控件具体的HTML,CSS,当改变控件的外观时,只需改变控件的模板,而必定义更多的代码.<br>
 * 例如将126风格的控件换成EXT风格控件,只需将它们的模板换成EXT相似的即可.
 * @abstract
 * @author Rock
 */
var Base = CC.Base = (function(dom){
    if(dom !== undefined)
        this.view = CC.$(dom);
});

/**
 * 根据控件ID获得控件,该方法将遍历控件缓存,速度并不快
 * @param {String} componentId
 * @static
 * @return {CC.Base|null}
 * @member CC.Base
 * @method find
 */
Base.find = function(id){
  for(var i in CPC){
    if(CPC[i].id === id)
      return CPC[i];
  }
  return null;
};
/**
 * 根据控件缓存ID(cacheId, 唯一)获得控件,该缓存id在控件初始化时设置,保存在 component.cacheId 和 component.view.cicyId中.
 * @param {String} componentCacheId
 * @static
 * @return {CC.Base|null}
 * @member CC.Base
 * @method byCid
 */
Base.findByCid = Base.byCid = function(cid){
  return CPC[cid];
};

/**
 * 根据DOM元素返回一个控件, 如果已指定pCt,返回该容器子控件中的匹配控件，方法忽略已托管的(delegated)元素。
 * @param {HTMLElement} dom
 * @param {CC.ui.ContainerBase|Function} filter, 可以指定寻找子项的父容器，如果已指定,返回该容器子控件中的匹配控件；也可以传入一个function过滤器，返回true表示匹配，函数参数为当前已检测的控件。
 * @param {CC.Base|CC.HTMLElement} [scope] 如果参数二为一个过滤器，第三个参数可传入一个限定检索的范围结点或控件，在该范围下查找。 
 * @static
 * @member CC.Base
 * @method byDom
 <pre><code>
  寻找点击html元素所在的首个控件
  function onclick(e){
  	var el = CC.Event.element(e);
  	var component = CC.Base.byDom(el);
  	if(component)
  		alert("当前点击的是"+component.title+"控件");
    
    tab.domEvent('click', function(e){
    	var el = CC.Event.element(e);
    	var clickedTabItem = CC.Base.byDom(el, tab);
    	if(clickedTabItem)
    		alert('当前点击的tabitem是'+clickedTabItem.title);
    });
    
    // 在嵌套的控件树中，可自定义过滤器，查找DOM所在的目标控件。
    
    tree.domEvent('click', function(e){
    	var el = CC.Event.element(e);
    	var treeitem = CC.Base.byDom(el, function(c){
    			return c.type === 'CC.ui.TreeItem';
    	});
    	if(treeitem){
    		alert('当前点击的树项是'+treeitem.title);
    	}
    }, tree);
  }
 </code></pre>

 */
Base.byDom = function(dom, pCt){
      //find cicyId mark
      var c, 
          isf = pCt && typeof pCt === 'function',
          end;
      // scope, arg[2]
      if(isf && arguments[2])
      	end = arguments[2].view || arguments[2];
      
      else end = pCt && pCt.view || document;

      while(dom && dom !== end){
        if(dom.cicyId){
          c = Base.byCid(dom.cicyId);
          if(c && !c.delegated){
            if(pCt){
              if(isf){
              	if(pCt(c))
              		return c;
              }else if(c.pCt === pCt)
                return c;
            }else return c;
          }
        }
        dom = dom.parentNode;
      }

      return null;  
};

/**
 * @class CC.Tpl
 * 控件html模板定义类, 通过{@link #def}方式存放.
 * <pre><code>
   CC.Tpl.def('MyComp') = '&lt;div class=&quot;cus&quot;&gt;&lt;/div&gt;';
   </code></pre>
 * <br>
 * 不宜在注册CC.Cache缓存时调用模板方法{@link CC.Tpl.$}, {@link CC.Tpl.$$},{@link CC.Tpl.remove},这将引起循环的递归调用,因为模板生成的结点缓存在Cache里的.
 */
var Tpl = CC.Tpl;

if(!Tpl){
  Tpl = CC.Tpl = {};
}


CC.extend(Tpl,
{
/**
 * @cfg {String} BLANK_IMG
 * 为什么要有空图片?
 * 用于填充img标签.为什么要用到img标签,用其它标签的background-url定位不行么?
 * img标签主要优点是可放大,缩小图片,目前兼容的css难做到这点.<br>
 * 可以通过window.BLANK_IMG指定空图片.
 */
      BLANK_IMG : window.BLANK_IMG || 'http://bgjs.googlecode.com/svn/trunk/cicy/default/s.gif',
/**
 * 根据模板名称获得模板字符串对应的HTML结点集,该结点生成只有一次,第二次调用时将从缓存克隆结点数据.<br>
 * <pre><code>
  CC.Tpl.def('MyComp', '&lt;div class=&quot;fd&quot;&gt;&lt;a href=&quot;javascript:void(0)&quot; id=&quot;_tle&quot;&gt;&thorn;&yen;&lt;/a&gt;&lt;/div&gt');

  var  domNode = Tpl.$('MyComp');

  //显示 _tle
  alert(domNode.firstChild.id);
  </code></pre>
 * @param {String} keyName 模板在Tpl中的键值,即属性名称
 * @param {String} compName
 * @param {Function} [prehandler] 模板字符串的预处理函数, 调用方式为 return function(strTemplate, objParam),返回处理后的html模板
 * @param {Object} [Object] prehandler 传递给prehandler的参数
 * @method $
 * @return {DOMElement} 模板字符串对应的HTML结点集
 */
    $ : (function(keyName,compName, prehandler, objParam){
        var node = Cache.get(keyName);
        if(!node){
            if(!compName)
                compName = keyName;
            var tp = this[compName];
            if(typeof tp == 'undefined')
              return null;

            var dv = Cache.get('div');
            dv.innerHTML = prehandler? prehandler(tp, objParam) : tp;
            node = dv.removeChild(dv.firstChild);
            Cache.put('div',dv);
            Cache.put(keyName,node);
        }

        return node.cloneNode(true);
    }),
/**
 * 获得模板DOM结点经Base封装后的对象
 * @param key 模板在Tpl中的键值,即属性名称
 * @return {CC.Base}
 * @method $$
 */
    $$ : function(key) {
        return CC.$$(this.$(key));
    },
/**
 * 移除已缓存的模板结点.
 * @param key 模板在Tpl中的键值,即属性名称
 */
    remove : function(key) {
      Cache.remove(key);
      delete this[key];
    },


/**
 * 根据html字符串返回由该字符串生成的HTML结点集.<br>
<pre><code>
 var dataObj = {id:'Rock', age : 2};
 var strHtml = &lt;div class=&quot;fd&quot;&gt;&lt;a href=&quot;javascript:void(0)&quot; id=&quot;{title}&quot;&gt;年龄:{age}&lt;/a&gt;&lt;/div&gt;

 var node = Tpl.forNode( strHtml, dataObj );

 var link = node.firstChild;

 //显示 Rock
 alert(link.id);

 //显示 年龄:2
 alert(link.innerHTML);
 </code></pre>
 * @param {String} strHtml
 * @param {Object} [dataObj]
 * @param {String} [st] 模板替换方式, 参见{@link CC.templ}
 * @see CC.templ
 */
    forNode : function(strHtml, dataObj, st) {
      if(dataObj)
        strHtml = CC.templ(dataObj, strHtml, st);
      var dv = Cache.get('div'), node;
      dv.innerHTML = strHtml;
      node = dv.removeChild(dv.firstChild);
      Cache.put('div',dv);
      return node;
    },
/**
 * 定义模板.
 * @param {String} key 模板在Tpl中的键值,即属性名称
 * @param {String} 模板字符串,可以多个参数,方便查看
 * @return {Object} this
 */
    def : function(key, str) {
      if(arguments.length>=3){
        str = CC.$A(arguments);
        str.shift();
        str = str.join('');
      }
      this[key] = str;
      return this;
    }
});

  Event.on(window, 'unload', function(ev){
    var nss = [];
    try{
      for(var i in CPC){
        nss[nss.length] = CPC[i];
      }
      for(var i=0,len=nss.length;i<len;i++){
        if(nss[i].cacheId)
           nss[i].destory();
      }

    }catch(e){if(__debug) console.log(e);}
    finally{
      CPC = null;
      nss = null;
    }
  });

var document = window.document;
//thanks Ext JS here.
var view = document.defaultView;
// local style camelizing for speed
var propCache = {};
var camelRe = /(-[a-z])/gi;
var camelFn = function(m, a){ return a.charAt(1).toUpperCase(); };
//
//
//
var hidCS = ['vid','hid','hid','hid'];

var disCS = ['vvi', 'dbl','dbi',''];

var undefined;

var Math = window.Math, parseInt = window.parseInt;

var CPR = CC.util.CssParser.getParser();
/**
 * @class CC.Base
 */
CC.extend(Base.prototype,
  {
/*
 * @cfg type
 * 控件类型标识符,与类钱称相同,eg:CC.ui.Grid
 * @type String
 */
    type: 'CC.Base',
/**
 * @cfg {DOMElement|String} view 
 * 控件对应的DOM结点,即控件视图部份,如果未设置,默认创建一个DIV结点作为视图,初始化时可为DOM元素或页面元素中的ID字符串作为值.
 */
 view: false,
 
/**
 * @cfg {String} clickCS 点击效果修饰样式
 */

/**
 * @cfg {String} hoverCS 鼠标悬浮样式
 */
/**
 * @cfg {Number} height=false 控件高度,默认为fase,忽略设置
 */
    height:false,
    
/**
 * @cfg {Number} width=false 控件宽度,为false时忽略
 */
    width : false,
/**
 * @cfg {Number} left=false  控件x值,为false时忽略
 */
    left:false,

/**
 * @cfg {Number} top=false 控件top值,为false时忽略
 */
    top:false,
/**
 * @cfg {Number} minW=0 控件最小宽度
 */
    minW:0,
/**
 * @cfg {Number} minH=0 控件最小高度
 */
    minH:0,
/**
 * @cfg {Number} maxH=Math.MAX 控件最大高度
 */
    maxH:Math.MAX,
/**
 * @cfg {Number} maxW=Math.MAX 控件最大宽度
 */
    maxW:Math.MAX,

/**
 * @cfg {String} template 
 * 设置控件视图view的HTML模板名称,利用这些模板创建DOM结点作为控件视图内容,
 * 该设置值不会被保留到控件属性中,应用模板获得view结点后属性被移除.<br>
 * 可以传入一个模块索引名称,系统会利用这个名称获得对应的DOM结点作为view的值;
 * 也可以传入一串html字符串,系统会生成这些html字符串对应的DOM结点作为view的值. <br>
 * <pre><code>
   // 定义模板
   CC.Tpl.def('MyComponent', '<div><h1 id="_tle"></h1></div>');
   // 创建控件
   var myComponent = CC.Base.instance({
     ctype:'base',
     template:'myComponent'
   });
   myComponent.setTitle('Hello world!');
   
   // 也可直接利用一串html字符串作为模板生成view视图结点
   var myComponent = CC.Base.instance({
     ctype:'base',
     template : '<div><h1 id="_tle"></h1></div>'
   });
   
   第一种方式可充分利用缓存快速生成结点.
   第二种可灵活生成不同结构的结点.
 </code></pre>
 */
   clickDisabled : false,
/**
 * @cfg {Boolean} clickDisabled 存在clickEvent事件的控件时，如果 clickDisabled 为 false,则消取该事件的发送.
 */

/**
 * @property pCt 
 * 父容器.<br>
 * 以下情形将使得当前控件获得一个指向父容器的引用.<div class="mdetail-params">
 * <ul>
 * <li>通过父容器或父容器的布局管理器{@link CC.ui.ContainerBase#add}方式添加的子控件</li>
 * <li>通过{@link CC.ui.ContainerBase#follow}方式委托另一个控件("父"容器)管理自身控件周期的子控件</li>
 * </ul></div>
 * <pre><code>
    // 通过父控件的follow方法
    var ca = new CC.ui.Panel();
    var cb = new CC.ui.Button();
    ca.follow(cb);
    
    //显示true
    alert(cb.pCt === ca);
    
    // 通过add
    var ca = new CC.ui.Panel();
    var cb = new CC.ui.Button();
    ca.layout.add(cb);
 * </code?</pre>
 * @type {CC.Base}
 */
    pCt : false,

/**
 * @cfg {Boolean} eventable 是否实现事件模型,实现事件模型的控件具有发送,注册处理事件功能.
 */
    eventable : false,

        
/**
 * @cfg {Boolean} autoRender 是否自动渲染,自动渲染时在控件初始化后就立即调用{@link #render}进行渲染.
 */
 
/**
 * @private
 */
    initialize: function(opts) {
        if (opts){
          CC.extend(this, opts);
        }

        if(this.eventable)
            Eventable.apply(this);

        this.initComponent();

        if(this.autoRender)
            this.render();
    },

/**
 * 生成控件DOM结点(view)部分,调用该方法后创建this.view结点.
 * @private
 */
    createView : function(){

      if(!this.view){

        if(this.hasOwnProperty('template') ||
           this.constructor.prototype.hasOwnProperty('template') ||
           (this.superclass && this.superclass.hasOwnProperty('template'))){
          // come from a html string or cache
          this.view = this.template.charAt(0) === '<' ? Tpl.forNode(this.template, this) : Tpl.$(this.template);
          
          delete this.template;

        }else {
          this.view = Tpl.$(this.type);
        }

        if(!this.view){
          this.view = this.createView0(this.superclass);
        }
      }else if(typeof this.view === 'string'){
        this.view = CC.$(this.view);
      }

      if(!this.view)
        this.view = CC.$C('DIV');
    },

    createView0 : function(superclass){
      if(!superclass)
        return null;

      var v;

      if(superclass.hasOwnProperty('template')){
        v = Tpl.$(superclass.template);
      }else {
        v = Tpl.$(superclass.type);
      }
      if(v)
        return v;
      return arguments.callee(superclass.superclass);
    },
    
    cacheId : undefined,
/**
* @property cacheId
* 全局控件唯一id,也可用于判断对象是否是类的实例化对象,在控件初始化时分配.
* @type String
*/

/**@private*/
    __flied : undefined,
    
/**
 * @cfg {String} strHtml 可以通过一段html文本来创建view内容,初始化时通过view.innerHTML方式加载到view结点中. 
 */
    strHtml : false,

/**
 * @cfg {String} innerCS 控件自身内在的css类设置,常用于控件的设计中,如果无继承控件创建新控件类,不必理会该属性.
 * @private
 */
    innerCS : false,

/**
* @cfg {String} cs 控件css类,它将添加在{@link #innerCS}类后面,通过{@link #addClass},{@link #switchClass}方法.
*/
    cs : false,

/**
 * @cfg {String} id 控件id,如果无,系统会生成一个.
 */
    id : undefined,

/**
* @cfg {String} title 控件标题.<br>
* 如果控件有标题的话,就必须定义一个标题结点存放标题,以便控件在初始化时能够找到该结点并应用title值到结点中.
* 系统通过标题结点id寻找该结点,默认的标题结点id为'_tle',也可以指定{@link #titleNode}来定义新的ID值.<br>
<pre><code>
    //定义MyButton类的视图模板,该类是有标题的
    CC.Tpl.def('MyButton') = '&lt;div class=&quot;button&quot;&gt;&lt;span id=&quot;_tle&quot;&gt;这里是标题&lt;/span&gt;&lt;/div&gt;';
    //这样就可以设置控件标题了,标题将被添加到结点id为_tle的元素上.
    myButton.setTitle('button title');
</code></pre>
*/
    title : undefined,
/**
 * @cfg {String} titleNode 可以指定控件标题所在控件的id,该id在控件初始化创建view时唯一.
 */  
    titleNode : false,

    hoverCS : false,
    
/**
 * @cfg {String} icon 控件图标css类.
 */
    icon : false,

/**
 * @cfg {String} css 设置控件inline style规则字符串,
 * 将调用{@link CC.util.CssParser}类进行解析,
 * 并将inline style应用到控件的view结点中.<br>
 * 具体可参见{@link CC.util.CssParser}类.
 */
    css : false,

/**
* @cfg {Boolean} unselectable 是否允许选择控件的文本区域.
*/
    unselectable : false,

/**
 * @cfg {Boolean} disabled 是否允许使用该控件.
 */
    disabled : false,
/**
 * @cfg {String} tip 设置提示
 */
    tip : false,
    
/**
 * @cfg {String} qtip 设置控件库内置提示方式
 */
    qtip : false,

/**
 * @cfg {Boolean|Object|CC.ui.Shadow} shadow 控件是否具有阴影效果.
 */
    shadow : false,
/**
 * 初始化控件.
 * @private
 */
    initComponent : function() {
      
        // if not initializing from fly element
        if(this.__flied === undefined){
	        var cid = this.cacheId = 'c' + CC.uniqueID();
	        CPC[cid] = this;
	        
	        this.createView();
        }

        if(this.strHtml){
            this.html(this.strHtml);
            delete this.strHtml;
        }

        if(this.innerCS)
          this.addClass(this.innerCS);

        if(this.cs)
            this.addClass(this.cs);

        if(this.id && !this.view.id)
            this.view.id=this.id;

        if(this.id === undefined)
          this.id = 'comp' + CC.uniqueID();

        //cache the cacheId to dom node for fast access to host component
        this.view.cicyId = cid;

        //cache the title node for latter rendering.
        if(this.title){
          if(!this.titleNode)
            this.titleNode = this.dom('_tle');
          else if(!this.titleNode.tagName)
            this.titleNode = this.dom(this.titleNode);
        }

        if(this.icon) {
            this.setIcon(this.icon);
        }

        if(this.clickCS) {
            this.bindClickStyle(this.clickCS);
        }

        if(this.hoverCS){
            this.bindHoverStyle(this.hoverCS);
        }
        
        if(this.css)
         this.cset(this.css);
         
        if(this.unselectable)
            this.noselect();

        if(this.title)
          this.setTitle(this.title);

        if(this.top !== false)
            this.setTop(this.top);

        if(this.left !== false)
            this.setLeft(this.left);

        if(this.disabled){
            this.disabled = 1;
            this.disable(true);
        }

        if(this.tip){
            //设置鼠标提示.
            this.setTip(this.tip===true?this.title:this.tip);
        }
        
        if(this.qtip && CC.Util.qtip)
            CC.Util.qtip(this);
            
        if(this.shadow){
          this.shadow = CC.ui.instance(this.shadow===true?'shadow':this.shadow);
          this.follow(this.shadow);
        }
    },

/**@private*/
    __delegations : false,

/**@private*/
    delegated : false,

/**
 * <p>
 * 将部件a纳入当前控件的管理范畴,
 * 纳入后部件a的渲染和销毁与控件一致.
 * </p><p>
 * 当某些部件不是以add方式加进容器控件的,
 * 就比如适合采用这方法将部件纳入管理范畴,
 * 使得它和宿主控件一起渲染和销毁.
 * </p>
 * @param {CC.Base} component 跟随控件的部件
 * @return {Object} this
 */
    follow : function(a){
      var ls = this.__delegations;
      if(!ls)
        ls = this.__delegations = [];
      //note that this component is delegated.
      a.delegated = true;

      ls.push(a);
      if(!a.pCt)
        a.pCt = this;
      if(this.rendered && !a.rendered)
        a.render();
      return this;
    },

/**@private*/  
    observes : false,
    
/**
 * 销毁控件,包括:移出DOM;移除控件注册的所有事件;销毁与控件关联的部件.
 */
    destory : function(){
      if(this.pCt && !this.delegated){
        this.pCt.remove(this);
      }
      else {
        this.del();
      }

      //not come from cbase init

      if(this.cacheId === undefined){
        return;
      }

      delete CPC[this.cacheId];

      var obs = this.observes, i, len, c;
      if(obs){
        var el;
        for(i=0,len=obs.length;i<len;i++){
          c = obs[i];
          el = c[3] || this.view;
          if (el.removeEventListener) {
              el.removeEventListener(c[0], c[2], true);
          } else if (el.detachEvent) {
                el.detachEvent('on' + c[0], c[2]);
          }
        }
        this.observes = null;
      }
      obs = this.__delegations;
      if(obs){
        for(i=0,len=obs.length;i<len;++i){
          obs[i].pCt = null;
          if(obs[i].cacheId)
            obs[i].destory();
        }
        this.__delegations = null;
      }
      this.view.cicyId = null;
      delete this.view;
      delete this.cacheId;
    },
    
    
/**
 * @property hidden
 * 当前控件是否可见
 * @type Boolean
 */   
    hidden : undefined,

/**
 * @cfg {DOMElement|String} showTo 将控件渲染到该结点上,应用后showTo被移除.
 */   
    showTo : false,
    
    /**
     * <p>
     * 渲染方式的实现方法,子类要自定渲染时,重写该方法即可.
     * <div class="mdetail-params"><ul>主要步骤有:
       <li>应用控件的显示/隐藏属性</li>
       <li>将控件view添加到showTo属性中</li>
       <li>如果需要,设置鼠标提示</li>
       <li>如果存在阴影,将阴影附加到控件中</li>
       <li>渲染跟随部件(参见{@link # follow})</li>
       </ul></div>
       </p>
     * @private
     */
    onRender : function(){
        if(this.hidden){
          // 防止display不起作用,重置
          this.hidden = undefined;
          this.display(false);
        }

        if(this.width !== false)
            this.setWidth(this.width, true);

        if(this.height !== false)
            this.setHeight(this.height, true);

        var pc = this.showTo;

        if(pc){
           pc = CC.$(pc);
           delete this.showTo;
        }

        if(pc){
            if(pc.view)
              pc = pc.view;

            pc.appendChild(this.view);
        }

      var obs = this.__delegations;
      if(obs){
        for(var i=0,len=obs.length;i<len;i++){
          if(!obs[i].rendered)
            obs[i].render();
        }
      }
      if(this.shadow){
        if(!this.getZ())
          this.setZ(1001);
        this.shadow.attach(this);
      }
    },

/**
 * @event render
 * 当控件具有{@link #eventable}后,渲染前发送该事件.
 */

/**
 * @event rendered
 * 当控件具有{@link #eventable}后,渲染后发送该事件.
 */

/**
 * @property rendered
 * 指示控件是否已渲染.
 * @type Boolean
 */
    rendered : false,

/**
 * 渲染控件到DOM文档,子类要定义渲染方式应该重写{@link #onRender}方法.<br>
       <div class="mdetail-params"><ul>主要步骤有:
       <li>应用控件的显示/隐藏属性</li>
       <li>将控件view添加到showTo属性中</li>
       <li>如果需要,设置鼠标提示</li>
       <li>如果存在阴影,将阴影附加到控件中</li>
       <li>渲染跟随部件(参见{@link # follow})</li>
       </ul></div>
 */
    render : function() {
        if(this.rendered || this.fireOnce('render')===false)
            return false;
        /**
         * @name CC.Base#rendered
         * @cfg {Boolean} rendered  标记控件是否已渲染.
         * @readonly
         */
        this.rendered = true;
        this.onRender();
        this.fireOnce('rendered');

        if(!this.hidden && this.shadow){
          var s = this.shadow;
          (function(){
              s.reanchor().display(true);
          }).timeout(0);
        }
    },

/**
 * <p>
 * Base类默认是没有事件处理模型的,
 * 预留fire为接口,方便一些方法如{@link # render}调用,
 * 当控件已实现事件处理模型时,即{@link # eventable}为true时,
 * 此时事件就变得可用.
 * </p>
 * @method fire
 */
    fire : fGo,
/**
 * <p>
 * Base类默认是没有事件处理模型的,
 * 预留fire为接口,方便一些方法如{@link # render}调用,
 * 当控件已实现事件处理模型时,即{@link # eventable}为true时,
 * 此时事件就变得可用.
 * </p>
 * @method fire
 */
    fireOnce : fGo,

/**
 * <p>
 * Base类默认是没有事件处理模型的,
 * 预留fire为接口,方便一些方法如{@link # render}调用,
 * 当控件已实现事件处理模型时,即{@link # eventable}为true时,
 * 此时事件就变得可用.
 * </p>
 * @method fire
 */
    un : fGo,

/**
 * 隐藏控件.
 * @return {Object} this
 */
    hide : function(){
      return this.display(false);
    },
/**
 * 显示控件.
 * @return {Object} this
 */
    show : function(){
      return this.display(true);
    },

/**
 * 取出视图view结点内指定的子元素,对其进行CC.Base封装,以便利用,与{@link #unfly}对应.<br/>
 * <code>
  &lt;div id=&quot;content&quot;&gt;
   Content Page
   &lt;span id=&quot;sub&quot;&gt;&lt;/span&gt;
  &lt;/div&gt;
  &lt;script&gt;
    var c = new CC.Base({view:'content', autoRender:true});
    c.fly('sub')
     .setStyle('color','red')
     .html('this is anothor text!')
     .unfly();
  &lt;/script&gt;
 * </code>
 * @param {String|DOMElement} childId 子结点.
 * @see CC.Base#fly
 * @return {CC.Base} 封装后的对象,如果childId为空,返回null.
 */
    fly : function(childId){
      var el = this.dom(childId);

      if(this.__flied !== undefined && this.__flied > 0)
        this.unfly();

      if(el)
        return CC.fly(el);

      return null;
    },
/**
 * 解除结点的Base封装,与{@link # fly}成对使用.<br/>
 <code>
  &lt;div id=&quot;content&quot;&gt;
   Content Page
   &lt;span id=&quot;sub&quot;&gt;&lt;/span&gt;
  &lt;/div&gt;
  &lt;script&gt;
    var c = new CC.Base({view:'content', autoRender:true});
    c.fly('sub')
     .setStyle('color','red')
     .html('this is anothor text!')
     .unfly();
  &lt;/script&gt;
  </code>
 */
    unfly : function(){
      if(this.__flied !== undefined){
        this.view = null;
        this.displayMode = 1;
        this.blockMode = 1;
        this.width = this.top = this.left = this.height = false;
        //引用计数量
        this.__flied -= 1;
        if(this.__flied === 0){
          Cache.put('flycomp', this);
        }
      }
    },

/**
* 添加控件view元素样式类.<br>
* 参见{@link #delClass},{@link #addClassIf},{@link #checkClass},{@link #hasClass}<br>
 * <pre><code>comp.addClass('cssName');</code></pre><br>
* @param {String} css css类名
* @return {Object} this
*/
    addClass: function(s) {
        var v = this.view;
        var ss = v.className.replace(s, '').trim();
        ss += ' ' + s;
        v.className = ss;
        return this;
    }
    ,
/**
 * 检查是否含有某个样式,如果有,添加或删除该样式.
 * @param {String} css
 * @param {Boolean} addOrRemove true -> add, or else remove
 */
    checkClass : function(cs, b){
			if(cs){
				var hc = this.hasClass(cs);
				if(b){
					if(!hc)
					this.addClass(cs);
				}else if(hc){
					this.delClass(cs);
				}
		  }
    },
/**
* 如果控件view元素未存在该样式类,添加元素样式类,否则忽略.<br>
* 参见{@link #delClass},{@link #addClass},{@link #switchClass},{@link #checkClass},{@link #hasClass}
* @param {String} css css类名
* @return {Object} this
*/
    addClassIf: function(s) {
        if(this.hasClass(s))
        return this;
    var v = this.view;
        var ss = v.className.replace(s, '').trim();
        ss += ' ' + s;
        v.className = ss;
        return this;
    }
    ,
/**
* 删除view元素样式类.<br>
* 参见{@link #addClass},{@link #switchClass},{@link #addClassIf},{@link #checkClass},{@link #hasClass}
* @param {String} css css类名
* @return {Object} this
*/
    delClass: function(s) {
        var v = this.view;
        v.className = v.className.replace(s, "").trim();
        return this;
    }
    ,
/**
* 测试view元素是否存在指定样式类.<br/>
* 参见{@link #delClass},{@link #addClassIf},{@link #checkClass},{@link #addClass},{@link #switchClass}
* @param {String} css css类名
* @return {Boolean}
*/
    hasClass : function(s) {
        return s && (' ' + this.view.className + ' ').indexOf(' ' + s + ' ') != -1;
    },
/**
* 替换view元素样式类.<br/>
* <code>comp.switchClass('mouseoverCss', 'mouseoutCss');</code><br/>
* 参见{@link #delClass},{@link #addClassIf},{@link #checkClass},{@link #addClass},{@link #switchClass}
* @param {String} oldSty 已存在的CSS类名
* @param {String} newSty 新的CSS类名
* @return {Object} this
*/
    switchClass: function(oldSty, newSty) {
        this.delClass(oldSty);
        this.addClass(newSty);
        return this;
    }
    ,
/**
* 重置元素样式类.
* @param {String} css CSS类名
* @return {Object} this
*/
    setClass: function(s) {
        this.view.className = s;
        return this;
    }
    ,

/**
 * this.view.getElementsByTagName(tagName);
 * @param {String} tagName
 * @return {DOMCollection} doms
 * @method $T
 */
    $T: function(tagName) {
        return this.view.getElementsByTagName(tagName);
    }
    ,
/**
 * 获得控件视图下任一子结点.
 * @param {String|DOMElement} childId
 * @return {DOMElement} dom
 */
    dom : function(childId) {
        return CC.$(childId, this.view);
    },
    /**
     * 常用于取消DOM事件继续传送,内在调用了Event.stop(ev||window.event);
     * @param {String} eventName 事件名称
     * @param {String|DOMElement} 子结点
     * @return {Object} this
     */
    noUp : function(eventName, childId) {
        return this.domEvent(eventName || 'click', Event.noUp, true, null, childId);
    },
/**
 * 清空view下所有子结点.
 * @return {Object} this
 * @method clear
 */
    clear: CC.ie ? function() {
        var dv = Cache.get('div');
        var v = this.view;
        while (v.firstChild) {
            dv.appendChild(v.firstChild);
        }
        dv.innerHTML = '';
        Cache.put('div', dv);
        return this;
    } : function(){
        var v = this.view;
        while (v.firstChild) {
            v.removeChild(v.firstChild);
        }
        return this;
    },
/**
 * 从父结点中移除视图view.
 */
    del : function(){
        if(this.view.parentNode)
            this.view.parentNode.removeChild(this.view);
    },

/**
 * @cfg {String} disabledCS='g-disabled' 禁用时元素样式
 */
    disabledCS : 'g-disabled',

/**
 * @cfg {Boolean} displayMode=1 显示模式0,1,可选有display=1,visibility=0<br>
 * 另见{@link #setDisplayMode},{@link #setBlockMode}
 */
    displayMode : 1,

/**
 * @cfg {Number} blockMode=1, style.display值模式,可选的有block=1,inline=2和''=0
 * @see #setBlockMode
 */
    blockMode : 1,

/**
 * 显示或隐藏或获得控件的显示属性.<br/>
 * <pre><code>
   // 测试元素是否可见
   alert(comp.display());

   // 设置元素可见,模式为block
   comp.display(true);

   // 设置元素可见,模式为inline
   comp.setBlockMode(2).display(true);
   
   // 设置元素可见模式为display=''
   comp.setBlockMode(0).display(true);
   
   // 设置元素可见模式为visiblity=visible
   comp.setDisplayMode(0).display(true);
   
 * </code></pre>
 * @param {Boolean} [b] 设置是否可见
 * @return {this|Boolean}
*/
   display: function(b) {
     if (b === undefined) {
      return !this.hasClass(hidCS[this.displayMode]);
     }
     if(this.hidden !== !b){
       this.hidden = !b;
       b ? this.onShow() : this.onHide();
     }
     return this;
   },

/**
 * @private
 */
   onShow : function(){
      this.delClass(hidCS[this.displayMode]);
      if(!this.displayMode || this.blockMode !== 2){
        this.addClassIf(disCS[this.displayMode])
      }
      if(this.shadow){
        var s = this.shadow;
        (function(){
          s.reanchor()
           .display(true);
        }).timeout(0);
      }
   },
/**
 * @private
 */
   onHide : function(){
     if(!this.hasClass(hidCS[this.displayMode])){
       if(!this.displayMode || this.blockMode !== 2){
         if(this.hasClass(disCS[this.displayMode]))
          this.delClass(disCS[this.displayMode]);
       }
       this.addClass(hidCS[this.displayMode]);
     }
     if(this.shadow)
      this.shadow.display(false);
     // release contexted on hide
     if(this.contexted)
       this.releaseContext();
   },

/**
 * 参见{@link #blockMode}
 * @param {String} blockMode
 * return this
 */
   setBlockMode : function(bl){
      this.blockMode = bl;
      return this;
   },
/**
 * 参见{@link #displayMode}
 * @param {String} displayMode
 * return this
 */
   setDisplayMode : function(dm){
    this.displayMode = dm;
    if(dm === 0)
      this.blockMode = 0;
    return this;
   },

/**
 * 检查或设置DOM的disabled属性值.
 * @param {Boolean|undefined} b
 * @return {this|Boolean}
 */
    disable: function(b) {
      if(arguments.length===0){
        return this.disabled;
      }

      b = !!b;
      if(this.disabled !== b){
        var v = this.disableNode || this.view;
        this.dom(v).disabled = b;
        this.disabled = b;

        if(this.disabledCS){
        	this.checkClass(this.disabledCS, b);
        }
        
        if(b && this.hoverCS && this.hasClass(this.hoverCS)){
          this.delClass(this.hoverCS);
        }
        
        if(b && v.tabIndex>=0){
          this._tmpTabIdx = v.tabIndex||0;
          v.tabIndex = -1;
        }else if(this._tmpTabIdx){
          v.tabIndex = this._tmpTabIdx;
          delete this._tmpTabIdx;
        }
      }
      return this;
    },

     /**
      * this.view.appendChild(oNode.view || oNode); 
      * @param {DOMElement} oNode
      * @return {Object} this;
      */
    append : function(oNode){
        this.view.appendChild(oNode.view || oNode);
        return this;
    },
/**
 * 应用一段html文本到视图view结点.<br/>
 * 方式为(this.ct||this.view).innerHTML = ss;
 * @param {String} ss html内容
 * @param {Boolean} [invokeScript] 是否运行里面的脚本
 * @param {Function} [callback] 回调
 * @return {Object} this
 */
    html : function(ss, invokeScript, callback) {
        if(invokeScript){
            var cacheJS =[] ,cache = [];
            ss = ss.stripScript(function(sMatch) {
                cacheJS[cacheJS.length] = sMatch;
            }
            );
            cache = [];
            //先应用CSS
            ss = ss.stripStyle(function(sMatch) {
                cache[cache.length] = sMatch.innerStyle();
            }
            );
            cache.join('').execStyle();
            //再应用HTML
            this.view.innerHTML = ss;
            //最后应用JS
            cacheJS.join('').execScript();
            if(callback)
                callback.call(this);
            cache = null;
            cacheJS = null;
            ss = null;
            return this;
        }

        (this.ct||this.view).innerHTML = ss;
        return this;
    },

/**
 * @param {String} html
 * @param {String} wrapTag
 * @return this
 */
    appendHtml : function(html, wrapTag){
      if(wrapTag)
       html = '<'+wrapTag+'>'+html+'</'+wrapTag+'>';
      (this.ct || this.view).appendChild(CC.Tpl.forNode(html));
      return this;
    },

/**
 * @param {String} text
 * @return this
 */
    appendText : function(text){
      (this.ct || this.view).appendChild(document.createTextNode(text));
      return this;
    },
    
    /**
     * where.appendChild(this.view);
     * @param {DOMElement|CC.Base} where
     * @return {Object} this
     */
    appendTo : function(where) {
        where.type ? where.append(this.view) : CC.$(where).appendChild(this.view);
        return this;
    },
/**
 * 在结点之后插入oNew
 * @param {DOMElement|CC.Base} oNew
 * @return {Object} this
 */
    insertAfter: function(oNew) {
        var f = CC.fly(oNew);
        oNew = f.view;
        var v = this.view;
        var oNext = v.nextSibling;
        if (!oNext) {
            v.parentNode.appendChild(oNew);
        } else {
            v.parentNode.insertBefore(oNew, oNext);
        }
        f.unfly();
        return this;
    },
 /***/
    insertBefore : function(oNew) {
        oNew = oNew.view || oNew;
        this.view.parentNode.insertBefore(oNew, this.view);
        return this;
    },
 /**
  * 设置控件的zIndex值.
  * @param {Number} zIndex
  * @return {Object} this
  */
    setZ : function(zIndex) {
        this.fastStyleSet("zIndex", zIndex);
        if(this.shadow)
          this.shadow.setZ(zIndex - 1);
        return this;
    },
  /**
   * 获得控件的zIndex值.
   * @return {Number}
   */
    getZ : function(){
      return this.fastStyle('zIndex')|0;
    },
/**
 * 设置或获得控件样式.<br>
<pre><code>
  var div = CC.$('someid');
  var f = CC.fly(div);
  f.style('background-color','red');
  //显示red
  alert(f.style('background-color');
  f.unfly();
</code></pre>
 * @return {Mixed}
 */
    style : function(style,value) {
        //getter
        if(value === undefined) {
            return this.getStyle(style);
        }
        return this.setStyle(style,value);
    },
 /***/
    getOpacity : function () {
        return this.getStyle('opacity');
    },

/**设置view结点的透明度.*/
    setOpacity : function (value) {
        this.view.style.opacity = value == 1 ? '' : value < 0.00001 ? 0 : value;
        return this;
    },

    /*设置view结点风格.<br>
     * comp.setStyle('position','relative');<br>
     * 另见{@link #fastStyleSet},{@link #getStyle}
     */
    setStyle : function (key, value) {
        if (key === 'opacity') {
            this.setOpacity(value)
        } else {
            var st = this.view.style;
            st[
            key === 'float' || key === 'cssFloat' ? ( st.styleFloat === undefined ? ( 'cssFloat' ) : ( 'styleFloat' ) ) : (key.camelize())
            ] = value;
        }
        return this;
    },


    /*获得view结点风格.<br>
     * comp.getStyle('position');<br>
     * 另见{@link #fastStyle},{@link #setStyle}
     */
    getStyle : function(){
        return view && view.getComputedStyle ?
            function(prop){
                var el = this.view, v, cs, camel;
                if(prop == 'float'){
                    prop = "cssFloat";
                }
                if(v = el.style[prop]){
                    return v;
                }
                if(cs = view.getComputedStyle(el, "")){
                    if(!(camel = propCache[prop])){
                        camel = propCache[prop] = prop.replace(camelRe, camelFn);
                    }
                    return cs[camel];
                }
                return null;
            } :
            function(prop){
                var el = this.view, v, cs, camel;
                if(prop == 'opacity'){
                    if(typeof el.style.filter == 'string'){
                        var m = el.style.filter.match(/alpha\(opacity=(.*)\)/i);
                        if(m){
                            var fv = parseFloat(m[1]);
                            if(!isNaN(fv)){
                                return fv ? fv / 100 : 0;
                            }
                        }
                    }
                    return 1;
                }else if(prop == 'float'){
                    prop = "styleFloat";
                }
                if(!(camel = propCache[prop])){
                    camel = propCache[prop] = prop.replace(camelRe, camelFn);
                }
                if(v = el.style[camel]){
                    return v;
                }
                if(cs = el.currentStyle){
                    return cs[camel];
                }
                return null;
            };
    }(),
/**
 * 快速获得元素样式,比setStyle更轻量级,但也有如下例外<br><div class="mdetail-params"><ul>
 * <li>不能设置float
 * <li>传入属性名必须为JS变量格式,如borderLeft,非border-width
 * <li>不能设置透明值
 * </ul></div>
 */
    fastStyleSet : function(k, v){
      this.view.style[k] = v;
      return this;
    },
/**
 * 快速获得元素样式,比getStyle更轻量级,但也有如下例外<br><div class="mdetail-params"><ul>
 * <li>不能获得float
 * <li>传入属性名必须为JS变量格式,如borderLeft,非border-width
 * <li>不能处理透明值
 * </ul></div>
 */
    fastStyle : function(){
        return view && view.getComputedStyle ?
            function(prop){
                var el = this.view, v, cs, camel;
                if(v = el.style[prop]){
                    return v;
                }
                if(cs = view.getComputedStyle(el, "")){
                    return cs[prop];
                }
                return null;
            } :
            function(prop){
                var el = this.view, v, cs;
                if(v = el.style[prop]){
                    return v;
                }
                if(cs = el.currentStyle){
                    return cs[prop];
                }
                return null;
            };
    }(),

    /**
     * 先添加默认图标样式this.iconCS，再添加参数样式.
     * @param {String} cssIco
     * @return {Object} this
     */
    setIcon: function(cssIco) {
      /**
       * @name CC.Base#iconNode
       * @cfg {DOMElement|String} iconNode 图标所在结点
       */
        var o = this.fly(this.iconNode || '_ico');
        if(this.iconCS)
          this.addClassIf(this.iconCS);

        if(o){
            if(typeof cssIco === 'string')
                o.addClass(cssIco);
            else
                o.display(cssIco);
            o.unfly();
        }
        return this;
    }
    ,
/**
* @param {String} tip
* @return {Object} this
*/
    setTip:function(ss){
      if(this.view && !this.qtip){
          this.view.title = ss;
      }
      this.tip = ss;
      return this;
   },
   
/**
 * @return {String}
 */
    getTitle : function(){
      return this.title;
    },
    
/**
* @cfg {Function} brush 渲染标题的函数<br>
* 参见 {@link CC.util.BrushFactory}
* @param {Object} v
* @return {String} html string of title
*/
    brush : false,
    
/**
* @param {String} title
* @return {Object} this
*/
    setTitle: function(ss) {
        this.title = ss;
        if(!this.titleNode)
          this.titleNode = this.dom('_tle');
        else if(!this.titleNode.tagName)
          this.titleNode = this.dom(this.titleNode);

        if(this.titleNode)
          this.titleNode.innerHTML = this.brush ? this.brush(ss):ss;
        if(this.tip && this.view && !this.qtip)
          this.view.title = ss;
        if(this.qtip === true)
          this.qtip = ss;
        return this;
    }
    ,
/**
 * @param {Number} width
 * @return {Object} this
 */
    setWidth: function(width) {
        this.setSize(width, false);
        return this;
    }
    ,
/**
 * @param {Boolean} usecache 是否使用缓存数据
 * @return {Number}
 */
    getWidth : function(usecache){
        if(usecache && this.width !== false)
            return this.width;
        return this.getSize().width;
    },
/**
 * @param {Number} height
 * @return {Object} this
 */
    setHeight: function(height) {
        this.setSize(false, height);
        return this;
    }
    ,
/**
 * @param {Boolean} usecache 是否使用缓存值
 * @return {Number}
 */
    getHeight:function(usecache){
        if(usecache &&  this.height !== false)
            return this.height;
        return this.getSize().height;
    },

/**
 * @property outerW
 * <p>
 * border + padding 的宽度,除非确定当前
 * 值是最新的,否则请通过{@link #getOuterW}方法来获得该值.
 * 该值主要用于布局计算,当调用{@link #getOuterW}方法时缓存该值
 * </p>
 * @private
 * @type Number
 */

/**
 * 得到padding+border 所占宽度, 每调用一次,该函数将缓存值在outerW属性中.
 * @return {Number}
 */
    getOuterW : function(cache){
      var ow = this.outerW;
      if(!cache || ow === undefined){
        ow =(parseInt(this.fastStyle('borderLeftWidth'), 10)||0) +
            (parseInt(this.fastStyle('borderRightWidth'),10)||0) +
            (parseInt(this.fastStyle('paddingLeft'),     10)||0) +
            (parseInt(this.fastStyle('paddingRight'),    10)||0);
        this.outerW = ow;
      }
      return ow;
    },

/**
 * @property outerH
 * <p>
 * border + padding 的高度,除非确定当前
 * 值是最新的,否则请通过{@link #getOuterH}方法来获得该值.
 * 该值主要用于布局计算,当调用{@link #getOuterH}方法时缓存该值
 * </p>
 * @private
 * @type Number
 */

/**
 * 得到padding+border 所占高度, 每调用一次,该函数将缓存该值在outerH属性中
 * @param {Boolean} cache 是否使用缓存值
 * @return {Number}
 */
    getOuterH : function(cache){
      var oh = this.outerH;
      if(!cache || oh === undefined){
        oh=  (parseInt(this.fastStyle('borderTopWidth'),   10)||0) +
             (parseInt(this.fastStyle('borderBottomWidth'),10)||0) +
             (parseInt(this.fastStyle('paddingTop'),       10)||0) +
             (parseInt(this.fastStyle('paddingBottom'),    10)||0);
        this.outerH = oh;
      }
      return oh;
    },

/**
 * 获得容器内容宽高值
 * @param {Boolean} cache 是否使用缓存值(outer)计算
 * @return {Array} [outerWidth, outerHeight]
 */
    getContentSize : function(cache){
      var sz = this.getSize(cache);
      return [sz.width - this.getOuterW(cache), sz.height - this.getOuterH(cache)];
    },

/**
 *<pre><code>
  comp.setSize(50,100);
  comp.setSize(false,100);
  comp.setSize(50,false);
 * </code></pre>
 * @param {Number|Object|false} a number或{width:number,height:number},为false时不更新
 * @return {Object} this
 */
    setSize : function(a, b) {
        if(a.width !== undefined){
            var c = a.width;
            if(c !== false){
                if(c<this.minW) c=this.minW;
                if(c>this.maxW) c=this.maxW;
                this.fastStyleSet('width', CC.borderBox?c + 'px':Math.max(c - this.getOuterW(),0)+'px');
                this.width = c;
            }
            c=a.height;
            if(c !== false){
                if(c<this.minH) c=this.minH;
                if(c>this.maxH) c=this.maxH;
                if(c<0) a.height=c=0;

                this.fastStyleSet('height', CC.borderBox?c + 'px':Math.max(c - this.getOuterH(),0)+'px');
                this.height = c;
            }
            return this;
        }

        if(a !== false){
            if(a<this.minW) a=this.minW;
            if(a>this.maxW) a=this.maxW;
            this.fastStyleSet('width', CC.borderBox? a + 'px':Math.max(a - this.getOuterW(),0)+'px');
            this.width = a;
        }
        if(b !== false){
            if(b<this.minH) b=this.minH;
            if(b>this.maxH) b=this.maxH;
            this.fastStyleSet('height', CC.borderBox? b + 'px':Math.max(b - this.getOuterH(),0)+'px');
            this.height=b;
        }

        return this;
    },
/**
<pre><code>
  comp.setXY(50,100);
  comp.setXY(false,100);
  comp.setXY(50,false);
</code></pre>
 * @param {Number|Array|false} a number或[x,y],为false时不更新.
 * @return {Object} this
 */
    setXY : function(a, b){
        if(CC.isArray(a)){
           if(a[0]!== false || a[1]!== false){
            if(a[0]!== false){
              this.fastStyleSet('left',a[0]+'px');
              this.left = a[0];
            }
            if(a[1] !== false){
              this.fastStyleSet('top',a[1]+'px');
              this.top = a[1];
            }
            return this;
           }
        }

        if(a !== false || b !== false){
           if(a !== false){
            this.fastStyleSet('left',a+'px');
            this.left = a;
          }
           if(b !== false){
            this.fastStyleSet('top',b+'px');
            this.top = b;
          }
        }

        return this;
    },
/**
 * this.setXY(false, top);
 * @return {Object} this
 */
    setTop: function(top) {
        this.setXY(false, top);
        return this;
    }
    ,
/**
 * 得到top值.
 * @param {Boolean} usecache 是否使用缓存值
 * @return {Number}
 */
    getTop : function(usecache){
        if(usecache && this.top !== false)
            return this.top;
        this.top = parseInt(this.fastStyle('top'), 10) || this.view.offsetTop;
        return this.top;
    },
/**
 * @return {Object} this
 */
    setLeft: function(left) {
        this.setXY(left, false);
        return this;
    }
    ,
/**
 * 得到left值.
 * @param {Boolean} usecache 是否使用缓存值
  *@return {Number}
 */
    getLeft : function(usecache){
        if(usecache && this.left !== false)
            return this.left;
        this.left = parseInt(this.fastStyle('left'), 10) || this.view.offsetLeft;
        return this.left;
    },
/**
 * 得到style.left,style.top坐标.
 * @param {Boolean} usecache 是否使用缓存值
 * @return {Array} [left, top]
 */
    xy : function(usecache) {
        return [this.getLeft(usecache), this.getTop(usecache)];
    }
    ,
/**
 * 得到相对页面x,y坐标值.
 * @return {Array} [x, y]
 */
    absoluteXY: function() {
            var p, b, scroll, bd = (document.body || document.documentElement), el = this.view;

            if(el == bd || !this.display()){
                return [0, 0];
            }
            if (el.getBoundingClientRect) {
                b = el.getBoundingClientRect();
                p = CC.fly(document);
                scroll = p.getScroll();
                p.unfly();
                return [b.left + scroll.left, b.top + scroll.top];
            }
            var x = 0, y = 0;

            p = el;

            var hasAbsolute = this.fastStyle("position") == "absolute", f = CC.fly(el);

            while (p) {

                x += p.offsetLeft;
                y += p.offsetTop;
                f.view = p;
                if (!hasAbsolute && f.fastStyle("position") == "absolute") {
                    hasAbsolute = true;
                }

                if (CC.gecko) {
                    var bt = parseInt(f.fastStyle("borderTopWidth"), 10) || 0;
                    var bl = parseInt(f.fastStyle("borderLeftWidth"), 10) || 0;
                    x += bl;
                    y += bt;
                    if (p != el && f.fastStyle('overflow') != 'visible') {
                        x += bl;
                        y += bt;
                    }
                }
                p = p.offsetParent;
            }

            if (CC.safari && hasAbsolute) {
                x -= bd.offsetLeft;
                y -= bd.offsetTop;
            }

            if (CC.gecko && !hasAbsolute) {
                f.view = bd;
                x += parseInt(f.fastStyle("borderLeftWidth"), 10) || 0;
                y += parseInt(f.fastStyle("borderTopWidth"), 10) || 0;
            }

            p = el.parentNode;
            while (p && p != bd) {
                f.view = p;
                if (!CC.opera || (p.tagName != 'TR' && f.fastStyle("display") != "inline")) {
                    x -= p.scrollLeft;
                    y -= p.scrollTop;
                }
                p = p.parentNode;
            }
            f.unfly();
            return [x, y];
    }
    ,
/** 
 * @return {Number}
 */
    absoluteX : function(){
        return this.absoluteXY()[0];
    },
/**
 * @return {Number}
 */
    absoluteY : function() {
        return this.absoluteXY()[1];
    },
/**
 * @param {Boolean} usecache 是否使用缓存值
 * @return {width:w, height:h}
 */
    getSize: function(usecache) {
        if(usecache && (this.width !== false && this.height !== false)) {
            return {
                width:this.width,
                height:this.height
            };
        }

        var v = this.view;
        var w = Math.max(v.offsetWidth, v.clientWidth);
        if(!w){
            w = parseInt(this.fastStyle('width'), 10) || 0;
            if(!CC.borderBox)
                w += this.getOuterW();
        }

        var h = Math.max(v.offsetHeight, v.clientHeight);
        if(!h){
            h = parseInt(this.fastStyle('height'), 10) || 0;
            if(!CC.borderBox)
                h += this.getOuterH();
        }

        return {
            width:w,
            height:h
        };
    },

/**
 * 连续应用 setXY, setSize方法
 * @return {Object} this
 */
    setBounds : function(x,y,w,h) {
        this.setXY(x,y);
        return this.setSize(w,h);
    },

/**
 * 获得相对控件或方块的坐标,如果高度未定,请在显示控件后再调用该方法定位.
 * @param {CC.Base|Array} box 目标元素,或一个矩形方块[x,y,width,height]
 * @param {String} dir 锚准位置,可选值有l, t, r, b组合,如lt,rb
 * @param {String} rdir 水平或垂直翻转,可选值有v,h,u,d,l,r,如vu表示垂直向上翻转,hr水平右转
 * @param {Array} offset 定位后的偏移附加值, 计算方式:[new x + off[0], new y + off[1]]
 * @param {Boolean} reanchor 是否修正到可视范围内
 * @param {Boolean} moveto 是否将新位置应用到控件中
 * @return {Array} [new x, new y]
 */
  anchorPos : function(box, dir, rdir, off, rean, move){
    if(box.view){
      var bxy = box.absoluteXY(), bsz = box.getSize(true);
      box = [bxy[0], bxy[1], bsz.width, bsz.height];
    }
    var sz = this.getSize(true),
        w  = sz.width, h  = sz.height,
        bx = box[0], by = box[1],
        bw = box[2], bh = box[3],
        nx, ny;

      nx = dir.charAt(0) === 'l' ? bx - w : bx + bw;
      ny = dir.charAt(1) === 't' ? by - h : by + bh;

      if(rdir){
        if(rdir.charAt(0) === 'h'){
          nx = rdir.charAt(1) === 'l' ? nx - w : nx + w;
        }else ny = rdir.charAt(1) === 'u' ? ny - h : ny + h;
      }

      if(off){
        nx += off[0];
        ny += off[1];
      }
      //reanchor into view
      if(rean){
        //this与box是否重合(对角判断法则)
        var vp = CC.getViewport(),
            vh = vp.height, vw = vp.width;
        if(nx < 0){
          nx = 0;
          if(by+bh>ny && by<ny+h)
            ny = by - h;
        }

        if(nx + w > vw)
          nx = by+bh>ny && by<ny+h ? bx - w : vw - w;

        if(ny < 0 && by+bh + h <= vh)
          ny = bx+bw>nx && bx<nx+w ? by+bh : 0;

        if( ny + h > vh && by - h >= 0 )
          ny = bx+bw>nx && bx<nx+w ? by - h : vh - h;
      }

      w = [nx, ny];

      if(move)
        this.setXY(w);

      return w;
  },
/**
 * 利用{@link CC.util.CssParser}设置inline style
 * @param {String} css 适用于{@link CC.util.CssParser}的规则字符串
 */
  cset : function(css){
    CPR.parse(this, css);
    return this;
  },

/***/
    clip: function() {
        var v = this.view;
        if (v._overflow)
            return this;

        this._overflow = v.style.overflow || 'auto';
        if (this._overflow !== 'hidden')
            v.style.overflow = 'hidden';
        return this;
    },
/***/
    unclip: function() {
        var v = this.view;
        if (!this._overflow)
            return this;
        v.style.overflow = this._overflow == 'auto' ? '' : this._overflow;
        this._overflow = null;
        return this;
    },
/**
 * 设置left, top, width, height到目标元素中.
 * @param {CC.Base|DOMElement} des
 * @return {Object} this
 */
    copyViewport : function(des){
        des = CC.$$(des);
        des.setXY(this.xy());
        des.setSize(this.getSize());
        return this;
    },

/**
 * 控件获得焦点.
 * @param {Number} [timeout] 设置聚焦超时
 * @return {Object} this
 */
    focus : function(timeout){
            if(this.disabled)
              return this;
            /**
             * @name CC.Base#focusNode
             * @cfg {DOMElement|String} focusNode 当控件调用{@link #focus}聚焦时,控件中实际触发聚焦的DOM元素.
             */
            var el = this.focusNode?this.dom(this.focusNode):this.view;
            if(timeout)
              (function(){ try{el.focus();}catch(ee){}}).timeout(timeout);
            else try{ el.focus();}catch(e){}
          return this;
    },
/**
 * 应用CSS样式字符串到控件
 * @param {String|Object|Function} styles
 * @return {Object} this
 */
    cssText : function(styles) {
        if(styles){
            if(typeof styles == "string"){
                var re = /\s?([a-z\-]*)\:\s?([^;]*);?/gi;
                var matches;
                while ((matches = re.exec(styles)) != null){
                    this.setStyle(matches[1], matches[2]);
                }
            }else if (typeof styles == "object"){
                for (var style in styles){
                    this.setStyle(style, styles[style]);
                }
            }else if (typeof styles == "function"){
                this.cssText(styles.call());
            }
        }
        return this;
    },
/**
 * 禁止可选择控件选择文本.
 * @return {Object} this
 */
    noselect : function() {
        var v = this, t = typeof this.unselectable, mt = false;
        if(t != 'undefined' && t != 'boolean'){
            mt = true;
            v = this.fly(this.unselectable);
        }
        v.view.unselectable = "on";
        v.noUp("selectstart");
        v.addClass("noselect");
        if(mt)
          v.unfly();
        return this;
    },

/**
 * 自动设置高度.
 */
    autoHeight : function(animate, onComplete) {
        var oldHeight = this.getHeight();
        this.clip();
        this.view.style.height = 1; // force clipping
        setTimeout(function(){
            var height = parseInt(this.view.scrollHeight, 10); // parseInt for Safari
            if(!animate){
                this.setHeight(height);
                this.unclip();
                if(onComplete){
                    onComplete();
                }
            }else{
                this.setHeight(oldHeight);
            }
        }.bind(this), 0);
        return this;
    },
/**
 * 返回{left:scrollLeft,top:scrollTop}
 */
    getScroll : function(){
        var d = this.view, doc = document;
        if(d == doc || d == doc.body){
            var l, t;
            if(CC.ie && CC.strict){
                l = doc.documentElement.scrollLeft || (doc.body.scrollLeft || 0);
                t = doc.documentElement.scrollTop || (doc.body.scrollTop || 0);
            }else{
                l = window.pageXOffset || (doc.body.scrollLeft || 0);
                t = window.pageYOffset || (doc.body.scrollTop || 0);
            }
            return {left: l, top: t};
        }else{
            return {left: d.scrollLeft, top: d.scrollTop};
        }
    },
/**
 * 是否包含a元素.
 */
    ancestorOf :function(a, depth){
      a = a.view || a;
      var v = this.view;
      if (v.contains && !CC.safari) {
         return v.contains(a);
      }else if (v.compareDocumentPosition) {
         return !!(v.compareDocumentPosition(a) & 16);
      }

      if(depth === undefined)
        depth = 65535;
      var p = a.parentNode, bd = document.body;
      while(p!= bd && depth>0 && p !== null){
        if(p == v)
          return true;
        p = p.parentNode;
        depth--;
      }
      return false;
    },
/**
 * 添加childId元素事件监听函数.
 * Warning : In IE6 OR Lower 回调observer时this并不指向element.
 * @param {String} evName
 * @param {Boolean} cancel 是否取消事件冒泡和默认操作
 * @param {String|DOMElement} childId 事件所在的元素
 * @param {Function} handler 事件回调
 * @return {Object} this
 */
    domEvent : function(evName, handler, cancel, caller, childId, useCapture) {
        if (evName == 'keypress' && (navigator.appVersion.match( / Konqueror | Safari | KHTML / )
            || this.view.attachEvent)) {
            evName = 'keydown';
        }

        if(!this.observes){
          this.observes = [];
        }

        var self = caller || this;
        var cb = (function(ev){
            var ev = ev || window.event;
            if(self.disabled){
              Event.stop(ev);
              return false;
            }
            if(cancel)
                Event.stop(ev);
            return handler.call(self, ev);
        });


        if(childId){
          childId = this.dom(childId);
          if(!childId)
            return this;

          this.observes.push([evName, handler, cb, childId, useCapture]);
        }
        else{
          childId = this.view;
          this.observes.push([evName, handler, cb]);
        }

        if (childId.addEventListener) {
            childId.addEventListener(evName, cb, useCapture);
        } else if (childId.attachEvent) {
            childId.attachEvent('on' + evName, cb);
        }
        return this;
    },

    wheelEvent : function(handler, cancel, caller, childId, useCapture){
      if(CC.ie || CC.opera)
        this.domEvent('mousewheel', handler, cancel, caller, childId, useCapture);
      else this.domEvent('DOMMouseScroll', handler, cancel, caller, childId, useCapture);
    },
/**
 * @param {String} evName
 * @param {Function} handler 事件回调
 * @param {String|DOMElement} childId 事件所在的元素
 * @return {Object} this
 * @see domEvent
 */
    unEvent : function(evName, handler, childId){
      if (evName == 'keypress' && (navigator.appVersion.match( / Konqueror | Safari | KHTML / )
            || this.view.attachEvent)) {
            evName = 'keydown';
      }
      var obs = this.observes;
      if(!obs)
        return;
      childId = childId !== undefined?childId.tagName? childId : this.dom(childId) : this.view;
      for(var i=0,len=obs.length;i<len;i++){
        var c = obs[i];
        if(c[0]==evName && c[1] == handler && (c[3]== childId || c[3] === undefined)){
          if (childId.removeEventListener) {
            childId.removeEventListener(evName, c[2], c[4]);
          } else if (childId.detachEvent) {
              childId.detachEvent('on' + evName, c[2]);
          }
          obs.remove(i);
          return this;
        }
      }
    },
/**
 * 绑定回车事件处理
 * @param {Function} callback
 * @param {Boolean} cancelBubble
 * @param {Object} caller
 * @param {DOMElement|String} childId
 * @return {Object} this
 */
    bindEnter : function(callback,cancel, caller, childId){
        return this.domEvent('keydown',(function(ev){
            if(Event.isEnterKey(ev)){
                //#fixbug : change cancel false in domEvent param , instead of when is enter. 09-03-21
                if(cancel)
                  Event.stop(ev);
                callback.call(this, ev);
            }
        }),false, caller, childId);
    },
   /**
   * 为相对事件设置样式效果,如果控件disbled为true,效果被忽略.<br>
   * 相对事件如onmouseup,onmousedown;onmouseout,onmouseover等等.
   <pre>
   param {String} evtHover
   param {String} evtOff
   param {String} css
   param {Boolean} cancelBubble
   param {Function} onBack
   param {Function} offBack
   param {Object} caller
   param {DOMElement|String} childId
   param {DOMElement|String} targetId
   <pre>
   * @return {Object} this
   */
    bindAlternateStyle: function(evtHover, evtOff, css, cancel, onBack, offBack, caller, childId, targetId) {
        var a = evtHover+'Node',b=evtHover+'Target';
        var obj = childId || this[a],tar= targetId || this[b];
        if(obj){
            obj = this.dom(obj);
            delete this[a];
         }else obj = this.view;

        if(tar){
          tar = this.dom(tar);
          delete this[b];
        }else tar = this.view;

        var self = this;

        if(tar == this.view){
          onBack = onBack || self[evtHover+'Callback'];
          offBack = offBack || self[evtOff+'Callback'];
        }

        this.domEvent(evtHover, (function(evt){
          var ret = false;
          if(onBack)
            ret = onBack.call(this, evt);
          if(ret !== true)
            CC.addClass(tar,css);
        }), cancel, caller, obj);

        this.domEvent(evtOff, (function(evt){
          var ret = false;
          if(offBack)
            ret = offBack.call(this, evt);
          if(ret !== true)
            CC.delClass(tar,css);
        }), cancel, caller, obj);
        return this;
    },
  /**
   * 设置鼠标划过时元素样式.
   <pre>
   param {String} css
   param {Boolean} cancelBubble
   param {Function} onBack
   param {Function} offBack
   param {Object} caller
   param {DOMElement|String} childId
   param {DOMElement|String} targetId
   <pre>
   * @return {Object} this
   */
    bindHoverStyle: function( css, cancel, onBack, offBack, oThis, childId, targetId) {
        return this.bindAlternateStyle('mouseover', 'mouseout', css || this.hoverCS, cancel, onBack || this.onMouseHover, offBack || this.onMouseOff, oThis || this, childId, targetId);
    }
    ,
  /**
   <pre>
   param {String} css
   param {Boolean} cancelBubble
   param {Function} onBack
   param {Function} offBack
   param {Object} caller
   param {DOMElement|String} childId
   param {DOMElement|String} targetId
   <pre>
   * @return {Object} this
   */
    bindFocusStyle : function( css, cancel, onBack, offBack, oThis, childId, targetId) {
        return this.bindAlternateStyle('focus', 'blur', css, cancel, onBack || this.onfocusHover, offBack || this.onfocusOff, oThis || this, childId, targetId);
    },
  /**
   * 设置鼠标按下/松开时元素样式.
   <pre>
   param {String} css
   param {Boolean} cancelBubble
   param {Function} onBack
   param {Function} offBack
   param {Object} caller
   param {DOMElement|String} childId
   param {DOMElement|String} targetId
   <pre>
   * @return {Object} this
   */
    bindClickStyle: function(css, cancel, downBack, upBack, oThis, childId, targetId) {
        this.bindAlternateStyle('mousedown', 'mouseup', css, cancel, downBack, upBack, oThis, childId, targetId);
        //防止鼠标按下并移开时样式未恢复情况.
        this.domEvent('mouseout', function(){
          if(!this.docked)
            this.delClass(css);
        });
        return this;
    }
    ,
/**
 * @event contexted
* 当控件具有{@link #eventable}后,切换上下文效果时发送该事件.
 * @param {Boolean} isContexted true|false
 * @param {DOMElement|DOMEvent} mixed fire('contexted', false, evt, tar),fire('contexted', true, tar), 其中tar为触发结点. 
 */
 
/**
 * 添加上下文切换效果,当点击控件区域以外的地方时隐藏控件.
 <pre>
 * param {Function} callback
 * param {Boolean}  cancelBubble
 * param {Object}   caller
 * param {DOMElement|String} childNode 触发结点
 * param {DOMElement|String} cssTarget
 * param {String} cssName
 </pre>
 * @return {Object} this
 */
    bindContext : function(callback,cancel, caller, childId, cssTarget, cssName) {
        if(this.contexted)
          return this;

        var tar = childId ? this.dom(childId) : this.view;
        if(!caller)
          caller = this;
        var self = this;
        var releaseCall = (function(evt) {
            if(callback)
                if(callback.call(caller, evt, tar)===false)
                    return;
            Event.un(document, 'mousedown', arguments.callee);
            Event.un(tar, 'mousedown', Event.noUp);

            var f = tar == self.view ? self : CC.fly(tar);

            self.contexted = false;
            delete self.__contextedCb;
            if(cssTarget){
              CC.fly(cssTarget).delClass(cssName).unfly();
            }
            f.display(false).unfly();
            self.fire('contexted', false, evt, tar);
        }
        );
        Event.on(tar, 'mousedown', Event.noUp);
        Event.on(document, 'mousedown', releaseCall);


        this.contexted = true;
        this.__contextedCb = releaseCall;
        if(cssTarget){
          CC.fly(cssTarget).addClass(cssName).unfly();
        }
        this.fire('contexted', true, tar);
        return this;
    },
/**
 * 释放已绑定的上下文切换
 */
    releaseContext : function(){
      if(this.contexted)
        this.__contextedCb();
    },

/**
 * CC.Base包装控件内的子结点元素
 * @param {String|DOMElement} node
 * @return {CC.Base}
 * @method $$
 */
    $$ : function(id) {
        var c = CC.$$(id, this.view);
        if(c){
         this.follow(c);
        }
        return c;
    },
 /**
  * 访问或设置view中任一子层id为childId的子结子的属性,属性也可以多层次.<br>
  * <pre><code>
    //如存在一id为this.iconNode || '_ico'子结点,设置其display属性为
    comp.inspectAttr(this.iconNode || '_ico','style.display','block');
  * </code></pre>
  * @param {element|string} childId 子结点ID或dom元素
  * @param {string} childAttrList 属性列,可连续多个,如'style.display'
  * @param {Object} [attrValue] 如果设置该置,则模式为设置,设置属性列值为该值,如果未设置,为访问模式,返回视图view给出的属性列值
  * @return {Object} value 如果为访问模式,即attrValue未设置,返回视图view给出的childAttrList属性列值
  */
    attr: function(childId, childAttrList, attrValue) {
        var obj = this.dom(childId);
        //??Shoud do this??
        if (!obj)
            return ;

        obj = CC.attr(obj, childAttrList, attrValue);
        return obj;
    },
/**
 * @private
 * @param {Boolean} closeable
 * @return {Object} this
 */
    setCloseable: function(b) {
        this.closeable = b;
        var obj = this.fly(this.closeNode || '_cls');
        if(obj)
            obj.display(b).unfly();
        return this;
    },
    
/**
 * 得到相对位移
 * @param {DOMElement|CC.Base} offsetToTarget
 * @return [offsetX, offsetY]
 */
    offsetsTo : function(tar){
        var o = this.absoluteXY();
        tar = CC.fly(tar);
        var e = tar.absoluteXY();
        tar.unfly();
        return [o[0]-e[0],o[1]-e[1]];
    },
/**
 * 滚动控件到指定视图
 * @param {DOMElement|CC.CBase} ct 指定滚动到视图的结点
 * @param {Boolean} hscroll 是否水平滚动,默认只垂直滚动
 * @return {Object} this
 */
    scrollIntoView : function(ct, hscroll){
      var c = ct?ct.view||ct:CC.$body.view;
        var off = this.getHiddenAreaOffsetVeti(c);
        if(off !== false)
          c.scrollTop = off;
        //c.scrollTop = c.scrollTop;

        if(hscroll){
          off = this.getHiddenAreaOffsetHori(ct);
          if(off !== false)
          c.scrollLeft = off;
        }

        return this;
    },
/**
 * 滚动指定控件到当前视图
 * @param {DOMElement|CC.CBase} child 指定滚动到视图的结点
 * @param {Boolean} hscroll 是否水平滚动,默认只垂直滚动
 * @return {Object} this
 */
    scrollChildIntoView : function(child, hscroll){
        this.fly(child).scrollIntoView(this.view, hscroll).unfly();
        return this;
    },

  /**
   * 检测元素是否在某个容器的可见区域内.
   * <br>如果在可见区域内,返回false,
   * 否则返回元素偏离容器的scrollTop,利用该scrollTop可将容器可视范围滚动到元素处。
   * @param {DOMElement|CC.Base} [container]
   * @return {Boolean}
   */
  getHiddenAreaOffsetVeti : function(ct){
        var c = ct.view || ct;
        var el = this.view;

        var o = this.offsetsTo(c),
            ct = parseInt(c.scrollTop, 10),
            //相对ct的'offsetTop'
            t = o[1] + ct,
            eh = el.offsetHeight,
            //相对ct的'offsetHeight'
            b = t+eh,

            ch = c.clientHeight,
            //scrollTop至容器可见底高度
            cb = ct + ch;
        if(eh > ch || t < ct){
          return t;
        }else if(b > cb){
            b -= ch;
            if(ct != b){
          return b;
            }
        }

    return false;
  },
  /**
   * 检测元素是否在某个容器的可见区域内.
   * <br>如果在可见区域内，返回false,
   * 否则返回元素偏离容器的scrollLeft,利用该scrollLeft可将容器可视范围滚动到元素处。
   * @param {DOMElement|CC.Base} [container]
   * @return {Boolean}
   */
  getHiddenAreaOffsetHori : function(ct){
    var c = ct.view || ct;
    var el = this.view;
        var cl = parseInt(c.scrollLeft, 10),
        o = this.offsetsTo(c),
            l = o[0] + cl,
            ew = el.offsetWidth,
            cw = c.clientWidth,
            r = l+ew,
            cr = cl + cw;
    if(ew > cw || l < cl){
        return l;
    }else if(r > cr){
        r -= cw;
        if(r != cl){
          return r;
         }
    }
    return false;
  }
});

/**
 * 创建一个具有完整生命周期的基本类实例.<br>
 * 注意如果直接用new CC.Base创建的类没控件初始化过程.
 * 该方法已被设为 protected, 不建议直接调用,要创建基类实例请调用
 * CC.ui.instance(option)方法.
 * @private
 * @param {Object} opt 类初始化信息
 * @method create
 * @member CC.Base
 * @static
 */
Base.create = function(opt){
    var comp;
    if(typeof opt === 'string'){
      comp = new Base[arguments[0]](arguments[1]);
    }else {
      comp = new Base();
      comp.initialize(opt);
    }
    return comp;
};
/**
 * 用CC.Base初始化结点
 * @param {HTMLElement} element
 * @param {Object} options
 * @method applyOption
 * @member CC.Base
 * @static
 */
Base.applyOption = function(el, opt){
  var f = CC.fly(el);
  f.initialize(opt);
  f.render();
  f.unfly();
};

/**
 * 根据DOM快速转化为控件对象方法，该方法将具有控件生命周期，但略去了初始化和渲染.
 * @param {DOMElement|String} dom
 * @param {DOMElement} parentNode
 * @method $$
 * @member CC
 */
CC.$$ = (function(dom, p) {
    if(!dom || dom.view)
        return dom;
    var c, cid = 'c' + CC.uniqueID();

    if(!p){
        c = CC.$(dom);
        if(c){
          c = new Base(c);
          c.cacheId = cid;
          CPC[cid] = c;
        }
        return c;
    }

    c = (p && p.view) ? CC.$(dom, p.view) : CC.$(dom, p);

    if(c){
      c = new Base(c);
      c.cacheId = cid;
      CPC[cid] = c;
    }
    return c;
});

//see unfly, fly
Cache.register('flycomp', function(){
  var c = new Base();
  c.__flied = 0;
  return c;
});

/**
 * 这是CC.Base类加上去的,参见{@link CC.Base#fly}
 * @method fly
 * @member CC
 */
CC.fly = function(dom){
  if(dom){
    // string as an id
    if(typeof dom == 'string'){
      dom = CC.$(dom);
    }else if(dom.view){ // a component
      //fly 引用计数量,当unfly后__flied引用为0时被回收
      if(dom.__flied !== undefined)
        dom.__flied += 1;
      return dom;
    }
  }
  //actually, can not be null!
  if(!dom){
    console.trace();
    throw 'Node not found.';
  }
  // a DOMElement
  var c = Cache.get('flycomp');
  c.view = dom;
  return c;
};

if (CC.ie){
    /**
     * @ignore
     */
    Base.prototype.getOpacity = function() {
        var element = this.view;
        if(element.filters[0])
            return parseFloat(element.filters[0].Opacity/100.0);
        value = ( this.getStyle(element, 'filter') || '').match(/alpha\(opacity=(.*)\)/);
        if (value) {
            if (value[1]) {
                return parseFloat(value[1]) / 100;
            }
        }
        return 1.0;
    };
    /**
     * @ignore
     */
    Base.prototype.setOpacity = function (opacity) {
       var st = this.view.style;
       st.zoom = 1;
       st.filter = (st.filter || '').replace(/alpha\([^\)]*\)/gi,"") +
          (opacity == 1 ? "" : " alpha(opacity=" + opacity * 100 + ")");
       return this;
    };
}

/**
 * @class CC.ui
 * 控件包
 */

CC.ui = {
/**@private*/
  ctypes : {},

/**
 * 注册控件类标识,方便在未知具体类的情况下生成该类,也方便序列化生成类实例.
 * @param {String} ctype 类标识
 * @param {Function} 类
 */
  def : function(ctype, clazz){
    this.ctypes[ctype] = clazz;
  },
/**
 * 根据ctype获得类.
 * @param {String} ctype
 * @return {Function} class
 */
  getCls : function(ct){
    return this.ctypes[ct];
  },
/**
 * 根据类初始化信息返回类实例,如果初始化信息未指定ctype,默认类为CC.Base,
 * 如果初始化信息中存在ctype属性,在实例化前将移除该属性.
 * 如果传入的参数已是某个类的实例,则忽略.
  <pre><code>
  通过该类创建类实例方式有几种
  1. var inst = CC.ui.instance('shadow');
    或
     var inst = CC.ui.instance('shadow', { width:55, ...});

  2. var inst = CC.ui.instance({ctype:'shadow', width:55});

  //得到CC.ui.ContainerBase类实例,假定该类的ctype为ct
     var inst = CC.ui.instance({ ctype : 'ct', showTo : document.body });
  </code></pre>
 * @param {Object} option
 */
  instance : function(opt){
    if(typeof opt === 'string')
      return new this.ctypes[opt](arguments[1]);

    var t;

    if(!opt)
      return Base.create();

    //判断是否已实例化
    if(opt.cacheId)
        return opt;

    t = opt.ctype;
    if(!t)
      return Base.create(opt);

    //else delete opt.ctype;

    return new this.ctypes[t](opt);
  }
};

CC.ui.def('base', function(opt){
	return Base.create(opt);
});
  
/**
 * @property $body
 * document.body的Base封装,在DOMReady后由CC.Base生成.
 * @member CC
 * @type CC.Base
 */
Event.defUIReady = function(){
  CC.$body = CC.$$(document.body);
  if(document.body.lang !== 'zh')
    document.body.lang = 'zh';
};

})(CC);
/**
 * @class CC.util.BrushFactory
 * 标题画笔工厂,用于根据类型值输出指定格式的字符串.
 * <p>
 * 自带的画笔有:
 * <div class="mdetail-params"><ul>
 * <li><b>.xx</b>: 保留两位小数的浮点预留画笔</li>
 * <li><b>.xx%</b>: 保留两位小数的百分比预留画笔</li>
 * </ul></div>
 * </p>
 * @singleton
 */
CC.util.BrushFactory = {
  
/**
 * 获得浮点数格式化表示值.<br>
 * <pre><code>
   var brush = CC.util.BrushFactory.floatBrush(2);
   alert(brush(1.2214));
   alert(brush(.3218));
   </code></pre>
 * @param {Number} digit 保留位数
 * @param {String} [type] 可选的有 '%',
 * @return {Function}
 */
  floatBrush : function(digit, type){
    var n = Math.pow(10, digit);
    switch(type){
      case '%' :
        n = n*100;
        var m = n/100;
        return function(v){
          return Math.round(v*n)/m + '%';
        }
      break;
      default :
        return function(v){
          return Math.round(v*n)/n;
        }
    }
  },
/**
 * 获得输出指定日期格式的画笔.
 * @param {String} fmt mm/dd/yy或其它格式
 * @return {Function} brush
 */
  date : function(fmt){
    if(!fmt)
      fmt = 'yy/mm/dd';

    return function(v){
      return CC.dateFormat(v, fmt);
    }
  },
/**
 * 获得预存画笔.
 * @param {String} type
 * @return {Function} brush
 */
  get : function(type){
  	if(!this.cache)
  	  this.cache = {};
  	
    var b = this.cache[type];
    if(!b){
    	// 初始化默认
      switch(type){
      	// 保留两位小数的浮点预留画笔
        case '.xx':
          b = CC.util.BrushFactory.floatBrush(2);
          this.reg(type, b);
          break;
        
        // 保留两位小数的百分比预留画笔
        case '.xx%' :
          b = CC.util.BrushFactory.floatBrush(2, '%');
          this.reg(type, b);
          break;
      }
    }
    return b;
  },
/**
 * 注册画笔.
 * @param {String} type
 * @param {Function} brush
 */
  reg : function(type ,brush){
    if(!this.cache)
      this.cache = {};
    this.cache[type] = brush;
  }
};
﻿/**
 * @class CC.util.d2d
 * 平面2D相关类库
 */
 CC.util.d2d = {};
/**
 * @class CC.util.d2d.Point
 * 点类,描述平面空间上的一个点
 * @cfg {Number} x x坐标
 * @cfg {Number} y y坐标
 * @constructor
 * @param {Number} x x坐标
 * @param {Number} y y坐标
 */
  CC.util.d2d.Point = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
  };

/**
 * @class CC.util.d2d.Rect
 * 矩形类,l,t,w,h<br>
 * <pre><code>
    var rect  = new CC.util.d2d.Rect(left, top, width, height);
    var rect2 = new CC.util.d2d.Rect([left, top, width, height]);
   </code></pre>
 * @param {Array|Number} data 传入一个数组或left, top, width, height
 * @constructor
 */
  CC.util.d2d.Rect = function(l, t, w, h){
    var len = arguments.length;
    if(len === 4){
      this.l = l || 0;
      this.t = t || 0;
      this.w = w || 0;
      this.h = h || 0;
    }else {
      this.l = l[0];
      this.t = l[1];
      this.w = l[2];
      this.h = l[3];
    }
    
    this.valid = true;
  };

  CC.extend(CC.util.d2d.Rect.prototype, {
    valid : true,
/**
 * @cfg {Boolean} valid 指示矩形数据是否有效，无效的数据将忽略对矩形的各种检测.
 */
/**
 * @cfg {Number} l left值
 */
    l : 0,
/**
 * @cfg {Number} t top值
 */
    t : 0,
/**
 * @cfg {Number} w width值
 */
    w: 0,
/**
 * @cfg {Number} h height值
 */
    h : 0,
/**
 * 判断点p是位于矩形内.
 * @param {CC.util.Point} 点
 * @return {Boolean}
 */
    isEnter : function(p){
      if(this.valid){
        var x = p.x, y = p.y;
  
        x =    x>=this.l && x<=this.l+this.w &&
               y>=this.t && y<=this.t+this.h;
        return x ? this : false;
      }
      return false
    },
    

/**
 * qd, quadrant 缩写，计算指定点所属矩形的象限，调用前请确保点已落在矩形上。
 * <br> 返回值： 0 - 8;
 * 象限所在X，Y轴正向与屏幕坐标系正方向一致。
 *  ________ x+
 *    |
 *  2 |  1
 *   y+
 <div class="mdetail-params"><ul>
 <li>0:原点</li>
 <li>1 - 4 : 1-4象限</li>
 <li>5 - 8 原点为中心，x, y四条轴，其中5为x正轴，其它类推。</li>
 <li>bool</li>
 <li>date</li>
 </ul></div>
 * @param {Number} x
 * @param {Number} y
 * @return {Number}
 */
    qdAt : function(x, y){
        // assert(this.isEnter({x:x, y:y}));
        var dx = Math.floor(x - this.l - this.w/2),
            dy = Math.floor(y - this.t - this.h/2);
        
        if(dx > 0){
            if(dy>0) 
                return 1;
            else if(dy<0) return 4;
            else return 5;
        }else if(dx < 0){
            if(dy>0)
                return 2;
            else if(dy<0)
                return 3;
            else return 7;
        }else { // dx = 0
            if(dy > 0)
                return 6;
            else if(dy < 0)
                return 8;
            return 0; 
        }
    },
    
/**
 * 接口,刷新矩形缓存数据,默认为空调用
 * @method
 */
    update : fGo,
/**
 * @return  this.valueOf() + ''
 */
    toString : function(){
      return this.valueOf() + '';
    },
/**
 * @return [this.l,this.t,this.w,this.h]
 */
    valueOf : function(){
      return [this.l,this.t,this.w,this.h];
    }
  });

/**
 * @class CC.util.d2d.RectZoom
 * 矩域, 由多个矩形或矩域组成树型结构,
 * 矩域大小由矩形链内最小的left,top与最大的left+width,top+height决定.
 * @extends CC.util.d2d.Rect
 * @constructor
 * @param {Array} rects 由矩形数组创建矩域
 */
  CC.create('CC.util.d2d.RectZoom', CC.util.d2d.Rect, function(father){

   var Math = window.Math, max = Math.max, min = Math.min;

   return {
/**
 * 父层矩域
 * @type {CC.util.d2d.RectZoom}
 */
     pZoom : null,
/**
 * @private
 * @param {Array} rects 包含CC.util.Rect实例的数组
 */
     initialize : function(opt){
       this.valid = true;
       if(opt) CC.extend(this, opt);
       var rects = CC.delAttr(this, 'rects');
       this.rects = [];
       if(rects){
         for(var i=0,len=rects.length;i<len;i++){
            this.add(rects[i]);
         }
       }
        // 跳过prototype
        //this.isEnter = this.isEnter;
      },


/**@interface*/
      prepare : fGo,
      
/**
 * 返回域内所有矩形, 返回的并不是矩形的复制,
 * 而是实例内所有矩形的引用,所以对返回矩形数据的修改也就是对矩域内矩形数据的修改.
 * @return {Array} rects
 */
      getRects : function(){
        return this.rects;
      },

/**
 * 矩形加入矩域
 * @param {CC.util.d2d.Rect} rect
 * @param {Boolean} update 加入后是否重新计算域数据
 */
      add : function(r, update){
        if(r.pZoom)
          r.pZoom.remove(r);

        this.rects.push(r);
        if(update)
          this.update();
        r.pZoom = this;
        return this;
      },
/**
 * 矩形移出矩域
 * @param {CC.util.d2d.Rect} rect
 * @param {Boolean} update 移出后是否重新计算域数据
 */
      remove : function(r, update){
        delete r.pZoom;
        this.rects.remove(r);
        if(update)
          this.update();
        return this;
      },
/**
 * 是否包含某矩形(域),深层检测
 * @param {CC.util.d2d.Rect} rect
 * @return {Boolean}
 */
      contains : function(r){
        var c = false, ch;
        for(var i=0,rs=this.rects,len=rs.length;i<len;i++){
          ch = rs[i];
          if(ch === r){
            c = this;
            break;
          }
          if(ch.contains){
            c = ch.contains(r);
            if(c)
              break;
          }
        }
        return c;
      },

  /**
   * 检测点是否位于当前矩形链中,如果点已进入范围,点所在的矩形
   * @param {CC.util.d2d.Point} point
   * @return [Boolean|CC.util.d2d.Rect] false或矩形类
   */
      isEnter : function(p){
        //先大范围检测
        if(this.valid && father.isEnter.call(this, p)){
          var i, rs = this.rects, len = rs.length, rt;
          for(i=0;i<len;i++){
            rt = rs[i].isEnter(p);
            if(rt){
              return rt;
            }
          }
       }
       return false;
      },

  /**@private*/
      union : function(){
        var i, rs = this.rects, len = rs.length, r;
        var t1=[], t2=[], x1=[], x2=[];
        if(len === 0){
          t1 = t2 = x1 = x2 = 0;
        }else{
          for(i=0;i<len;i++){
              r = rs[i];
              t1.push(r.t);
              t2.push(r.t+r.h);
              x1.push(r.l);
              x2.push(r.l+r.w);
          }
          x1 = min.apply(Math, x1);
          x2 = max.apply(Math, x2);
          t1 = min.apply(Math, t1);
          t2 = max.apply(Math, t2);
        }
        this.l = x1;
        this.t = t1;
        this.w = x2 - x1;
        this.h = t2 - t1;
     },
/**
 * 刷新计算域数据。具体操作为：1.清空原有矩域；2.调用prepare方法；3.调用子矩域update方法，依次更新每个子矩域数据。
 * @override
 */
     update : function(){
      this.clear();
      this.prepare();
      var i, rs = this.rects, len = rs.length;
      for(i=0;i<len;i++){
        rs[i].update();
      }
      this.union();
     },
/**
 * @interface
 */
     clear : fGo
   };

  });
  
/**
 * @class CC.util.d2d.ComponentRect
 * 组件封装后的矩形
 * @extends CC.util.d2d.Rect
 * @constructor
 * @param {CC.Base} component 与矩形关联的控件
 */
 
/**
 * @property comp 
 * 该区域对应的控件
 * @type CC.ui.Base
 */
 
  CC.create('CC.util.d2d.ComponentRect', CC.util.d2d.Rect, {
/**
 * @property z 
 * zIndex值
 * @type Number
 */
    z : -1,
/**
 * @property ownRect
 * 如果控件已注册拖放区域,引用指向封装该控件的矩形CC.util.d2d.ComponentRect.<br>
 * 该属性是由{@link CC.util.d2d.ComponentRect}类引入的.
 * @type {CC.util.d2d.ComponentRect}
 * @member CC.Base
 * @constructor
 * @param {CC.Base} component binding component
 * @param {Boolean} autoUpdate 是否立即更新矩形数据,默认false.
 */
    initialize : function(comp, autoUpdate){
      this.comp = comp;
      this.valid = true;
      comp.ownRect = this;
      if(autoUpdate) this.update();
    },

/**
 * 刷新矩形缓存数据.
 * @override
 */
    update : function(){
      if(this.hidden){
        this.l = this.t = this.w = this.h = 0;
        this.z = -1;
      } else {
        var c = this.comp,
            sz = c.getSize(),
            xy = c.absoluteXY();
        this.z = c.getZ();
        this.l = xy[0];
        this.t = xy[1];
        this.w = sz.width;
        this.h = sz.height;
      }
    },
/**
 * 解除与控件关联
 */
    destory : function(){
      delete this.comp.ownRect;
      this.comp = null;
    }
  });
﻿/**
 * @class CC.util.AsynchronizeQueue
 * 异步处理队列，可监听各个异步请求{@link CC.Ajax}的状态。
 * 结构包含两个队列：
  * <ul>
 * <li>waitQueue，等待队列</li>
 * <li>requestQueue，请求队列，或为活动队列</li>
 * </ul>
 利用{@link join}方法入队，放入等待队列。<br>
 利 用{@link out}方法出队，从请求或等待队列中移除。<br>
 */

/**
 * @cfg {Object} caller scope object of callbacks.
 */
 
/**
 * @cfg {Function} onincrease
 */

/**
 * @cfg {Function} ondecrease
 */
 
/**
 * @cfg {Function} onempty
 */

/**
 * @cfg {String} openEvt open event name fired by connector
 */
 
/**
 * @cfg {String} finalEvt final event name fired by connector
 */
 
/**
 * @property waitQueue
 * @type Array
 */

/**
 * @property requestQueue
 * @type Array 
 */
CC.create('CC.util.AsynchronizeQueue',null, {

  openEvt : 'open',
  
  finalEvt : 'final',
  
  initialize : function(opt){
    
    this.waitQueue = [];
    
    this.requestQueue = [];
    
    if(opt)
      CC.extend(this, opt);

    // connector cache
    // connector -- > key
    this.connectorKeys = {};
    // key -- > connector
    this.connectors    = {};
    
    this.max = 0;
  },
/**
 * 入队
 * @param {CC.Ajax} connector
 * @return {String} connectorKey uniqued indexed id for this connector
 */
  join : function(connector){
    this.waitQueue.push(connector);
    connector.on(this.openEvt, this.getConnectorBinder(this.openEvt));
    this.max++;
    
    var key = CC.uniqueID().toString();
    this.connectorKeys[connector] = key;
    this.connectors[key] = connector;
    
    if(this.onincrease)
      this.onincrease.call(this.caller?this.caller:this, connector, this);
      
    return key;
  },

/**
 * 出队
 * @param {CC.Ajax} connector
 */
  out : function(connector){
    if(this.waitQueue.indexOf(connector) >= 0){
      this.waitQueue.remove(connector);
      connector.un(this.openEvt, this.getConnectorBinder(this.openEvt));
      this.onOut(connector);
    }else if(this.requestQueue.indexOf(connector) >= 0){
      this.requestQueue.remove(connector);
      connector.un(this.finalEvt,this.getConnectorBinder(this.finalEvt));
      this.onOut(connector);
    }
  },

/**
 * @param {String} connectorKey
 * @return {CC.Ajax} ajax
 */
  getConnector : function(key){
    return this.connectors[key];
  },

/**
 * 是否请求中
 * @return {Boolean} busy
 */
  isConnectorBusy : function(key){
    var c = this.getConnector(key);
    return c && c.busy;
  },
  
/**
 * 是否已成功返回
 * @return {Boolean} busy
 */
  isConnectorLoaded : function(key){
    var c = this.getConnector(key);
    return c && c.loaded;
  },
  
  // private
  onOut : function(connector){
    
    delete this.connectors[CC.delAttr(connector, this.connectorKeys)];
    
    if(this.ondecrease)
      this.ondecrease.call(this.caller?this.caller:this, connector, this);
      
    if(this.waitQueue.length == 0 && this.requestQueue.length == 0 && this.onempty){
        this.onempty.call(this.caller?this.caller:this, this);
        this.max = 0;
    }
  },

  // private
  getConnectorBinder : function(key){
    var bnds = this.connectorBinders;
    if(!bnds)
      bnds = this.connectorBinders = {};
    var bd = bnds[key];
    if(!bd){
      switch(key){
        case this.finalEvt :
          bd = this.onConnectorFinal.bindAsListener(this);
          break;
        case this.openEvt :
          bd = this.onConnectorOpen.bindAsListener(this);
          break;
      }
      
      if(bd)
        bnds[key] = bd;
    }
    return bd;
  },

  onConnectorFinal : function(j){
    if(this.onfinal)
      this.onfinal.call(this.caller?this.caller:this, j, this);
    this.out(j);
  },
  
  onConnectorOpen : function(j){
    this.waitQueue.remove(j);
    this.requestQueue.push(j);
    
    if(this.requestQueue.length === 1) {
      if(this.onfirstopen)
        this.onfirstopen.call(this.caller?this.caller:this, j, this);
    }
    
    if(this.onopen)
      this.onopen.call(this.caller?this.caller:this, j, this);
      
    j.on(this.finalEvt,this.getConnectorBinder(this.finalEvt));
  }
});
﻿/**
 * @class CC.util.Tracker
 * 状态变更跟踪器.<br>
 * 内部维护一个后进先出数据结构来记录数据,该类目前用于记录{@link CC.ui.Tab}类的TAB选项打开顺序.
 */
CC.create('CC.util.Tracker', null, {
  /**@cfg {Number} max 历史记录最大条数*/
  max : 20,

  initialize : function(opt){
    this.area = [];
    if(opt)
      CC.extend(this, opt);
  },

/**
 * 记录数据
 * @param {Object} data
 */
  track : function(data){
    var a = this.area;
    if(a.indexOf(data) !== -1)
      a.remove(data);

    a.push(data);

    if(a.length > this.max)
      a.pop();
    if(__debug) console.log('记录:', data);
  },

/**
 * 接口,测试当前记录数据是可用
 * @param {Object} data
 * @method isValid
 */
  isValid : fGo,

/**
 * @cfg {Object} validCaller {@link #isValid}的this对象
 */
  validCaller : null,

/**
 * 弹出最近记录的数据.
 */
  pop : function(){
    var vc = this.validCaller || this, as = this.area, len = as.length, i = len - 1;
    for(;i>=0;i--){
      if(__debug) console.log('抹除:', this.isValid.call(vc, as[i]), as[i]);
      if(this.isValid.call(vc, as[i]))
        return as[i];
      as.pop();
    }
  },

/**
 * 移除指定记录数据.
 * @param {Object} data
 */
  remove : function(data){
    this.area.remove(data);
  },

/**
 * 当前记录数据大小
 * @return {Number}
 */
  size : function() {return this.area.length;}
});
﻿(function () {

var CC = window.CC, 
    Base = CC.Base,
    cptx = Base.prototype,
    UX = CC.ui;

/**
 * @class CC.layout
 * 容器布局管理器类库
 */
  CC.layout = {};

/**
 * 以一个简称注册布局管理器, 方便根据简称实例化类.
 * @param {String} type 简称
 * @param {Function} class 布局管理器类
 * @method def
 * @member CC.layout
 * @static
 */
CC.layout.def = function(type, cls){
  this[type] = cls;
  return this;
};

/**
 * @class CC.ui.Item
 * @extends CC.Base
 */
 CC.create('CC.ui.Item', Base, {});
 CC.ui.def('item', CC.ui.Item);


/**
 * @class CC.layout.Layout
 * 布局管理器基类.<br>
布局管理,布局管理可理解为一个容器怎么去摆放它的子项,因为CSS本身可以布局,所以,大多数时候并不必手动,即用脚本去布局子项,但当一些复杂灵活的布局CSS无能为力的时候,就需要脚本实现了,脚本实现的类可称为布局管理器.
<br>lyCfg就是一个容器布局管理器的配置(属性)信息,用于初始化容器自身的布局管理器,具体配置因不同布局管理器而不同.
<br>lyCfg.items 表明所有容器子项由布局管理器加入容器,而不是直接添加到容器,直接调用容器的add方法是不经过布局管理器的,这时如果需要布局的话,就不能对加入的子项进行布局了.
<br>container.array 配置也是所有将要加入到窗口子项组成数组,lyCfg.item不同的是,它们不经过布局管理器,直接调用容器add方法加到容器,当一些用CSS就能布局的容器通过以这种方式加载子项.
<br>container.items 意义与 container.layCfg.items一样,只是为了方便书写初始化.
 */

/**
 * @cfg {CC.Base} ct
 * 布局管理器对应的容器
 */
         
/**
 * @cfg {Array} items 初始化时由管理器加入到容器的子项列表, 该属性等同于{@link CC.ui.ContainerBase#items}.
 */
 
/**
 * @cfg {Boolean} layoutOnChange 如果每次布局都涉及所有容器子项,则该值应设为true,以便于当容器子项变更(add, remove, display)时重新布局容器
 */
 

/**
 * @cfg {Boolean} deffer 默认false
 * 延迟多少毫秒后再布局,有利于提高用户体验,
 * 但注意访问同步,例如容器子项在布局时才渲染,
 * 如果deffer已置,则子项渲染将会在JavaScript下一周期调用.
 */
 
/**
 * @cfg {String} itemCS 将子项被加进容器时添加到子项的CSS样式
 */
 
/**
 * @cfg {Object} lyInf 布局配置数据,子项的父容器布局管理器根据该信息布局子项.<br>
    如果控件被布局管理器所管理,其布局相关的配置信息将存放在component.lyInf,
    要访问子项当前布局信息,可通过container.layout.cfgFrom(component)方法获得.
 * @member CC.Base
 */
 
/**
 * @cfg {Boolean} invalidate 指示当引发布局时是否执行布局,
 * 如大量引发重复布局的操作可先设置invalidate=true,执行完后再设置invalidate=false,
 * 再调用{@link #doLayout}布局.<br>
 * 容器类不必直接设置该属性,
 * 可调用{@link CC.ui.ContainerBase#validate}和{@link CC.ui.ContainerBase#invalidate}方法.
 */

/**
 * @cfg {String} ctCS 初始化时添加到容器的样式
 */
 
/**
 * @cfg {String} wrCS 初始化时添加到容器ct.wrapper的样式
 */
 
CC.create('CC.layout.Layout', null, {

        ct: false,

        items : false,

        layoutOnChange : false,

        deffer : false,

        initialize: function(opt){
            if (opt)
                CC.extend(this, opt);
            var ct = CC.delAttr(this, 'ct');
            if(ct)
              this.attach(ct);
        },

        /**
         * 容器在添加子项前被调用。
         * @param {CC.Base} comp 子项
         * @param {Object} cfg 子项用布局的配置信息
         * @method beforeAdd
         * @private
         */
        beforeAdd: fGo,

        itemCS : false,


/**
 * 将组件 component 添加到布局,
 * 如果容器具有有效的布局管理器,则建议从布局管理器添加子项组件,
 * 而不是直接调用容器add方法, 其它子项变更操作(remove, insert)同理.
 * 如果layoutOnChange为true,组件加入后将重新布局容器,否则只调用layoutChild对加入组件进行布局.
 * @param {CC.Base} component
 * @param {Object} cfg 组件布局信息
 * @return this
 */
        add : function(comp, cfg){          
          // 由JSON格式创建
          if(!comp.cacheId){
            comp = this.ct.instanceItem(comp);
          }

          var cc = comp.lyInf;
          if (!cc)
            comp.lyInf = cc = cfg || {};
          else if(cfg)
            CC.extend(cc, cfg);
         
          this.beforeAdd(comp, cc);

          if(this.itemCS)
            comp.addClassIf(this.itemCS);

          //添加到容器
          this.ct.add(comp);
          
          if(this.isUp()){
            if(this.layoutOnChange)
              this.doLayout();
            else this.layoutChild(comp); //子项布局后再渲染

            if (!comp.rendered)
              comp.render();
          }
          return this;
        },
/**
 * 当前布局管理器是否就绪执行doLayout布局
 * @private
 */
        isUp : function(){
          return !this.invalidate && this.ct.rendered;
        },

/**
 * 显示/隐藏子项,如果layoutOnChange为true则重新布局容器.
 * @param {CC.Base} component
 * @param {Boolean} displayOrNot
 */
        display : function(c, b){
          c.display(b);
          if(this.layoutOnChange)
            this.doLayout();
        },


/**
 * 布局容器,要重写布局应重写onLayout方法.
 */
        doLayout: function(){
          if(this.isUp()){
            //不可见时并不立即布局容器,而是待显示时再布局
            //参见ct.display
            if(this.ct.hidden){
              if(__debug) console.log(this,'容器处于隐藏状态,未立即布局..');
              
              // 延迟布局中寄存的布局方法参数
              this.defferArgs = arguments;
              return;
            }

            if(this.deffer !== false){
              var args = CC.$A(arguments);
              var self = this;
              (function(){
                if(self.ct)
                self.onLayout.apply(self, args);
              }).timeout(this.deffer);
            }
            else this.onLayout.apply(this, arguments);
          }
        },

/**
 * 获得控件当前布局相关的属性配置信息, 该调用无论任何时候都会返回一个非null对象,即使相关配置不存在.
 * <pre><code>
   var item = ct.$(0);
   var layout = ct.layout;
   var cfg = layout.cfgFrom(item);

   if(cfg.collapsed) {
    //...
   }
   </code></pre>
 * @param {CC.Base} item
 * @return {Object} 控件当前布局相关的属性配置信息
 */
        cfgFrom : function(item) {
          return item.lyInf || {};
        },

        insert : function(comp){
            if (this.layoutOnChange)
                 this.doLayout.bind(this).timeout(0);
        },

        /**
         * 如没有针对单个控件布局的可直接忽略.
         * @private
         * @param {CC.Base} comp
         * @param {Object} cfg
         */
        layoutChild: fGo,

        remove: function(comp){
            if (this.layoutOnChange)
                this.doLayout.bind(this).timeout(0);
        },
        
/**
 * 批量添加子控件到容器.
 * @param {CC.Base} items
 */
        fromArray : function(its){
           var ct = this.ct,
               cls = ct.itemCls,
               item,
               icfg = ct.itemCfg || false;

              if (typeof cls === 'string')
                cls = UX.ctypes[cls];
            var tmp = this.invalidate;
            this.invalidate = true;
            for (var i=0,len=its.length;i<len;i++) {
              item = its[i];
              // already instanced
              if (!item.cacheId){
               
               if(!item.ctype && icfg)
                 item = CC.extendIf(item, icfg);
               
               item = ct.instanceItem(item, cls, true);
              }
              this.add(item);
            }
            this.invalidate = tmp;
            
            if(this.isUp()){
              this.doLayout();
            }
        },

        ctCS : false,

        wrCS : false,
        
        /**
         * 将布局管理器应用到一个容器控件中。
         * @param {Object} ct container component
         * @return this
         */
        attach: function(ct){
            this.ct = ct;
            if(ct.deffer !== undefined)
              this.deffer = ct.deffer;
              
            if (this.ctCS)
                ct.addClass(this.ctCS);

            if(this.wrCS)
              ct.wrapper.addClass(this.wrCS);


            if(this.items){
              this.fromArray(this.items);
              delete this.items;
            }
            
            if(ct.items){
              this.fromArray(ct.items);
              delete ct.items;              
            }
            
            return this;
        },

        /**
         * 移除容器的布局管理器.
         */
        detach: function(){
          var ct = this.ct;
          if(ct){
            this.ct = null;
            this.wrapper = null;
          }
          return this;
        },

        /**
         * 子项被容器布局后再渲染.
         * @private
         */
        onLayout: function(){
            var i = 0, ch, chs = this.ct.children, len = chs.length;
            for (; i < len; i++) {
                ch = chs[i];
                this.layoutChild(ch);
                if (!ch.rendered)
                    ch.render();
            }
        }
});

var 
Lt = CC.layout.Layout.prototype, 
//
// 容器默认的布局管理器布局方式为：
// 未渲染前，rendered = false，总会重新布局容器，所以doLayout总是有效；
// 渲染后，doLayout被设为空调用，忽略容器布局。
//
Adapert = CC.create(CC.layout.Layout, {
  doLayout : function(){
    Lt.doLayout.call(this);
    if(this.rendered)
    	this.doLayout = fGo;
  }
});
CC.layout.def('default', Adapert);


/**
 * @class CC.ui.ContainerBase
 * 容器类控件,容器是基类的扩展,可包含多个子组件,
 * 子组件也可是一个容器,形成了组件树
 * @extends CC.Base
 */
CC.create('CC.ui.ContainerBase', Base,
{

  /**
   * @property children
   * 容器子控件存放处
   * @type Array
   */
  children: null,
/**
 * @cfg {Boolean} eventable=true 可处理事件,即可通过on方法监听容器事件<br>
 * <pre><code>
   ct.on('resized', function(){
     //...
   });
   </code></pre>
 */
  eventable: true,

/**
 * 指明面板容器结点,ID或Html元素
 * @type HTMLElement|String
 */
  ct: null,

  minH: 0,

  minW: 0,

  maxH: 65535,

  maxW: 65535,
  
/**
 * @cfg {Base} itemCls=CC.ui.Item 容器子控件类, fromArray方法根据该子项类实例化子项
 * 可以通过该属性设定容器子类类别，也可以在子项配置中通过ctype方法具体应用某个类。
 * @see #fromArray
<pre><code>
    ct = CC.ui.instance({
        ctype:'ct',
        itemCls : 'button',
        array:[
            // button
            {title:'确定'},
            // button
            {title:'取消'},
            // 也可具体指定应用某个类
            {ctype:'text'}
        ]
    });
</code></pre>

 */
  itemCls: CC.ui.Item,

  autoRender: false,

/**
 * @cfg {Array} items
 * 预留给布局管理器初始化的子项,初始化后移除.
 * items与array初始化的区别仅在于是否通过布局管理器加载,如果是items时,由container.layout.fromArray加载,
 * 如果是array,直接由container.fromArray加载,忽略布管理器对子项进行布局.<br>
 * 该属性与{@link CC.layout.Layout#items}属性意义相同.
 */
  items : false,
  
/**
 * @cfg {Array} array 子项数据初始化组数, 由{@link #fromArray}装载，如果设定该配置，在初始化时通过{@link #fromArray}载入.
 */
  array:false,
  
  initialize : function(){
    cptx.initialize.apply(this, arguments);
    //pre load children
    if (this.array) {
      this.fromArray(this.array);
      delete this.array;
    }
  },
  
/**
 * @cfg {Boolean} keyEvent 是否开启键盘监听事件.<br>
 * 用于监听键盘按键的事件名称,如果该值在容器初始化时已设置,
 * 可监听容器发出的keydown事件.
 * <pre><code>
   var ct = new CC.ui.ContainerBase({keyEvent:true});
   ct.on('keydown', function(event){
      this....
   });
   </code></pre>
 */
  keyEvent : undefined,
  
/**
 * @cfg {Boolean} useContainerMonitor 是否在容器层上处理子项DOM事件
 */  
  useContainerMonitor : false,

/**
 * @cfg {Boolean|String} cancelClickBubble=false 是否停止容器clickEvent事件的DOM触发事件冒泡
 */  
  cancelClickBubble : false,

/**
 * @name CC.ui.ContainerBase#clickEvent
 * @cfg {Boolean|String} clickEvent 设置子项单击事件,如果为true,默认事件为mousedown
 */   
  clickEvent : false,
  
/**
 * @cfg {Boolean|CC.util.SelectionProvider} selectionProvider 属性由{@link CC.util.SelectionProvider}提供,指明是否开启容器选择子项的功能. 
 */
  selectionProvider : false,
  
/**
 * @cfg {Boolean|CC.util.ConnectionProvider} connectionProvider 属性由{@link CC.util.ConnectionProvider}提供,指明是否开启容器向服务器请求加载数据的功能. 
 */
  connectionProvider : false,

/**
 * @property children
 * 最终存放子项的数组，可通过$方法获得子项，通过{@link #each}方法遍历子项。
 * @type {Array}
 */  
  initComponent: function() {
    cptx.initComponent.call(this);
    if (this.keyEvent)
      this.bindKeyInstaller();

    if (this.useContainerMonitor && this.clickEvent) {
      this.bindClickInstaller();
    }

    this.children = [];

    this.createLayout();
    
    if(this.selectionProvider)
      this.getSelectionProvider();

    if(this.connectionProvider)
      this.getConnectionProvider();
  },
  
/**
 * @cfg {Layout|String} layout='default' 容器布局管理器
 */
  layout : 'default',
  
/**
 * @cfg {Object} lyCfg 用于初始化布局管理器的数据
 */
  lyCfg : false,
  
  createLayout : function(){
      if (typeof this.layout === 'string') {
        var cfg = this.lyCfg || {};
        cfg.ct = this;
        this.layout = new(CC.layout[this.layout])(cfg);
        if (this.lyCfg) delete this.lyCfg;
      }
      else this.layout.attach(this);
  },
  
/**
 * @cfg {String|DOMElement} ct 指定容器存放子项的dom结点.
 */
  ct : false,

 /**
  * @property wrapper
  * container.ct结点对应的Base对象,如果当前container.view === container.ct,则wrapper为容器自身.
  * @type CC.Base
  */
  createView: function() {
    cptx.createView.call(this);
    if (!this.ct) 
        this.ct = this.view;
    //apply ct
    else if (typeof this.ct === 'string')
      this.ct = this.dom(this.ct);

    //再一次检测
    if (!this.ct)
      this.ct = this.view;
      
    this.wrapper = this.ct == this.view ? this: this.$$(this.ct);
  },
  
/**@private*/
  destoryed : false,
  
  destory: function() {
    this.destoryed = true;
    this.destoryChildren();
    //clear the binded action of this ct component.
    var cs = this.bndActs, n;
    if (cs) {
      while (cs.length > 0) {
        n = cs[0];
        this.unEvent(n[0], n[2], n[3]);
        cs.remove(0);
      }
    }
    this.layout.detach();
    this.ct = null;
    this.wrapper = null;
    cptx.destory.call(this);
  },

  onRender: function() {
    cptx.onRender.call(this);
    // layout ct
    this.layout.doLayout();
  },

  /**
     * 添加时默认子控件view将为ct结点最后一个子结点,子类可重写该方法以自定子结点添加到容器结点的位置.
     * @param {DOMElement} dom 子项view结点
     * @param {Number} [idx]
     */
  _addNode: function(dom, idx) {
    if (idx === undefined) this.ct.appendChild(dom);
    else {
      this.ct.insertBefore(this.ct.childNodes[idx], dom);
    }
  },
  /**
 * 自定义移除容器中的子项DOM元素.
 * @param {DOMElement} dom 子项view结点
 */
  _removeNode: function(dom) {
    dom.parentNode.removeChild(dom);
  },

/**
 * 向容器中添加一个控件,默认如果容器已渲染,加入的子项将立即渲染,
 * 除非传入的第二个参数为true,指示未好渲染子项.
 * 布局管理就这样做,向容器加入后并未渲染子项,等待子项布局好后再渲染.
 * 控件即是本包中已实现的控件,具有基本的view属性.
 * 如果要批量加入子项,请调用fromArray方法.
 * @param {Base} item 子项
 */
  add: function(a) {

    // 由JSON格式创建
    if(!a.cacheId){
      a = this.instanceItem(a);
    }

/**
 * @event beforeadd
 * 添加子项前发送
 * @param {CC.Base} component
 */
      if(this.fire('beforeadd', a) !== false && this.beforeAdd(a) !== false){
        this.onAdd.apply(this, arguments);
        this.afterAdd(a);
/**
 * @event add
 * 添加子项后发送
 * @param {CC.Base} component
 */
        this.fire('add', a);
      }
    return this;
  },
  
  /**@private*/
  __click : false,
  
/**
 * @private
 */
  onAdd : function(a){
    this.children.push(a);

    if (a.pCt){
      if(a.pCt !== this){
        a.pCt.remove(a);
        //建立子项到容器引用
        a.pCt = this;
      }
    }else a.pCt = this;

    //默认子项结点将调用_addNode方法将加到容器中.
    this._addNode(a.view);
    
    //在useContainerMonitor为false时,是否允许子项点击事件,并且是否由子项自身触发.
    if (!this.useContainerMonitor && this.clickEvent)
        this.installItemInnerClickEvent(a, true);
  },
  
  installItemInnerClickEvent : function(item, bind){
      if(bind){
        
        if(__debug) console.assert(item.__ctClickData, undefined);
        
        var name  = this.clickEvent === true ? 
                          'mousedown' : 
                          this.clickEvent, 
            proxy = this.clickEventNode ? item.dom(this.clickEventNode) : item.view;
        
        item.domEvent( name, this.clickEventTrigger, this.cancelClickBubble, null, proxy );
        
        item.__ctClickData = proxy === this.view ? name : [name, proxy]; 
        
      }else { // unbind
        var data = item.__ctClickData;
        if( CC.isArray(data) )
             item.undomEvent(data[0] , this.clickEventTrigger, this.cancelClickBubble, null, data[1]);
        else item.undomEvent(data , this.clickEventTrigger, this.cancelClickBubble, null);
        delete item.__clickProxy; 
      }
  },
  

/**
 * @private
 */
  beforeAdd : fGo,
  
/**
 * @private
 */
  afterAdd : fGo,

/**
 * @event itemclick
 * 子项点击后发送.
 * @param {CC.Base} item
 * @param {DOMEvent} event
 */
 
/**
 * @private
 */
  ctClickTrigger: function(item, evt) {
    if (!item.disabled && !item.clickDisabled)
      this.fire('itemclick', item, evt);
  },

/**
 * 子项点击事件回调,发送itemclick事件.
 * @private
 */
  clickEventTrigger: function(event) {
    var p = this.pCt;
    if (!this.clickDisabled) 
        p.fire('itemclick', this, event);
  },

/**
 * @event beforeremove
 * 子项移除前发送
 * @param {CC.Base} component
 */

/**
 * @event remove
 * 子项移除后发送
 * @param {CC.Base} component
 */

/**
 * 从容器移出但不销毁子项,移除的子项也包括托管的子控件.
 * 如果容器子项由布局管理器布局,在调用该方法后用
 * ct.doLayout重新布局, 或直接由ct.layout.remove(component)移除子项.
 * @param {String|CC.Base} item 可为控件实例或控件ID
 * @return this
 */
  remove: function(a){
    a = this.$(a);
    if(a.delegated) {
        this.__delegations.remove(a);
        if(a.view.parentNode)
          a.view.parentNode.removeChild(a.view);
    }
    else if(this.fire('beforeremove', a)!==false && this.beforeRemove(a) !== false){
      this.onRemove(a);
      this.fire('remove', a);
    }
    return this;
  },

  beforeRemove : fGo,

  onRemove : function(a){
    
    if(a.__clickProxy)
        this.installItemInnerClickEvent(a, false);
    
    a.pCt = null;
    
    this.children.remove(a);
    
    this._removeNode(a.view);
  },

 /**
 * 移除所有子项.
 */
  removeAll: function() {
    var it, chs = this.children;
    this.invalidate();
    while (chs.length > 0) {
      it = chs[0];
      this.remove(it);
    }
    this.validate();
  },

  /**
     * 销毁容器所有子项.
     */
  destoryChildren: function() {
    var it, chs = this.children;
    this.invalidate();
    for(var i=chs.length-1;i>=0;i--) {
        it = chs[i];
        this.remove(it);
        it.destory();
    }

    if (!this.destoryed)
        this.validate();
  },

  /**
     * 根据控件ID或控件自身或控件所在数组下标安全返回容器中该控件对象<div class="mdetail-params"><ul>
     * <li>id为控件id,即字符串格式,返回id对应的子项,无则返回null</li>
     * <li>id为数字格式,返回数字下标对应子项,无则返回null</li>
     * <li>id为子项,直接返回该子项</li></ul></div>
     * @param {CC.Base|String|Number} id 子控件
     * @method $
     */
  $: function(id) {
    if (id === null || id === undefined || id === false) {
      return null;
    }

    //dom node, deep path
    if (id.tagName) {
      //find cicyId mark
      return Base.byDom(id, this);
    }

    //number
    if (typeof id === 'number') {
      return this.children[id];
    }

    //component
    if (id.view)
      return id;

    var chs = this.children;

    for (var i = 0, len = chs.length; i < len; i++) {
      if (chs[i].id == id) {
        return chs[i];
      }
    }
    return null;
  },

  onShow : function(){
    cptx.onShow.call(this);
      var ly = this.layout;
      if (ly.defferArgs){
        if (__debug) console.log(this, '容局显示时布局..', ly.defferArgs);
        ly.doLayout.apply(ly, ly.defferArgs);
        //重置标记
        ly.defferArgs = false;

        if(this.shadow){
         (function() {
           this.shadow.reanchor().display(true);
         }).bind(this).timeout(ly.deffer||0);
        }
      }
  },

/**
 * 返回容器子控件索引.
 * @param {String|CC.Base} 参数a可为控件实例或控件ID
 * @return {Number} index or -1, if not found.
 */
  indexOf: function(a) {
    a = this.$(a);
    return ! a ? -1 : this.children.indexOf(a);
  },
/**
 * 获得子项数量
 * @return {Number} size
 */
  size: function() {
    return this.children.length;
  },
  
  /**
 * 容器是否包含给出控件.
 * @param {String|CC.Base} component 可为控件实例或控件ID
 * @return {Boolean}
 */
  contains: function(a) {
    if (!a.cacheId) {
      a = this.$(a);
    }
    return a.pCt === this;
  },

/**
 * 子项b之前插入项a.
 * @param {CC.Base} componentA
 * @param {CC.Base} componentB
 */
  insertBefore: function(a, b) {
    if(b !== undefined){
        var idx = this.indexOf(b);
        this.insert(idx, a);
    }else cptx.insertBefore.call(this, a);
  },

  /**
     * 方法与_addNode保持一致,定义DOM结点在容器结点中的位置.
     * @param {DOMElement} new
     * @param {DOMElement} old
     */
  _insertBefore: function(n, old) {
    this.ct.insertBefore(n, old);
  },

  /**
     * 插入前item 可在容器内, 在idx下标处插入item, 即item放在原idx处项之前.
     * @param {Number} index
     * @param {CC.Base} item
     * @return this
     */
  insert: function(idx, item) {
    
    if(item.pCt === this){
        //本身已容器内部,Remove后调整位置
        if(this.indexOf(item)<idx)
            idx --;
        this.children.remove(item);
        this.onInsert(idx, item);
    }else if( this.fire('beforeadd', item) !== false && 
              this.beforeAdd(item) !== false){
                
        if (item.pCt && item.rendered){
            item.pCt.remove(item);
            item.pCt = this;
        }
        this.onInsert(idx, item);
        this.fire('add', item);
    }
    return this;
  },
  //
  // 只负责结构相关的移动
  //
  onInsert : function(idx, item){
      this.children.insert(idx, item);
      var nxt = this.children[idx+1];
      if (nxt)
         this._insertBefore(item.view, nxt.view);
      else this._addNode(item.view);
  },
  
  /**
 * 重写,同{@link #removeAll}
 * @override
 * @return this
 */
  clear: function() {
    var ch = this.children;
    for (var i = 0, len = ch.length; i < len; i++) {
      this.remove(ch[0]);
    }
    return this;
  },
/**
 * 交换两子项.
 * @param {CC.Base} a1
 * @param {CC.Base} a2
 * @return this
 */
  swap: function(a1, a2) {
    var ch = this.children,
        idx1 = this.indexOf(a1),
        idx2 = this.indexOf(a2);
    a1 = ch[idx1];
    a2 = ch[idx2];
    ch[idx1] = a2;
    ch[idx2] = a1;

    var n1 = a1.view, 
        n2 = a2.view;

    if (n1.swapNode) {
      n1.swapNode(n2);
    }
    else {
      var p = n2.parentNode, 
          s = n2.nextSibling;

      if (s == n1) {
        p.insertBefore(n1, n2);
      }
      else if (n2 == n1.nextSibling) {
        p.insertBefore(n2, n1);
      }
      else {
        n1.parentNode.replaceChild(n2, n1);
        p.insertBefore(n1, s);
      }
    }
    return this;
  },

  /**
     * 对容器控件进行排序,采用Array中sort方法,排序后控件的DOM结点位置也随之改变.
     * @param {Function} comparator 比较器
     * @return this
     */
  sort: function(comparator) {
    var chs = this.children;
    if (comparator === undefined) chs.sort();
    else chs.sort(comparator);

    var oFrag = document.createDocumentFragment();
    for (var i = 0, len = chs.length; i < len; i++) {
      oFrag.appendChild(chs[i].view);
    }

    this.ct.appendChild(oFrag);
    return this;
  },
/**
 * 反转子控件
 * @return this
 */
  reverse: function() {
    var chs = this.children;
    chs.reverse();

    var oFrag = document.createDocumentFragment();
    for (var i = 0, len = chs.length; i < len; i++) {
      oFrag.appendChild(chs[i].view);
    }

    this.ct.appendChild(oFrag);
    return this;
  },
/**
 * 过滤方式隐藏子控件.
 * @param {Function} matcher
 * @param {Object} caller 调用matcher的this
 * @return this
 */
  filter: function(matcher, caller) {
    var caller = caller || window;
    CC.each(this.children, (function() {
      if (!matcher.call(caller, this)) {
        this.display(0);
        return;
      }
      this.display(1);
    }));
    return this;
  },

/**
 * 枚举子项, 如果回调函数返回false,则终止枚举.
 * @param {Function} callback 回调,传递参数为 (caller||item).callback(item, i)
 * @param {Object} caller 调用callback的this, 默认为子项
 * @return 最后一个回调调用结果值
 */
  each: function(cb, caller) {
    var i, it, rt, len, its = this.children;
    for (i = 0, len = its.length; i < len; i++) {
      it = its[i];
      rt = cb.call(caller || it, it, i);
      if (rt === false) break;
    }
    return rt;
  },

  /**
     * 是否为控件的父容器
     * @param {CC.Base} child
     * @return {Boolean}
     */
  parentOf: function(child) {
    if (!child) return false;
    if (child.pCt == this) return true;
    var self = this;
    var r = CC.eachH(child, 'pCt', function() {
      if (this == self) return 1;
    });
    return r == true;
  },
/**
 * 批量生成子项, 不能在初始化函数里调用fromArray,因为控件未初始化完成时不能加入子控件.
 * 子类寻找优先级为 :<br>
 * {item option}.ctype -> 参数itemclass -> 容器.itemCls,
 * 容器的itemCls可以为ctype字符串, 也可以为具体类
 * @param {Array} array 子项实始化配置
 * @param {CC.Base} [itemclass=this.itemCls] 可选, 子类
 * @return this
 */
  fromArray: function(array, cls) {
    cls = cls || this.itemCls;
    if (typeof cls === 'string') {
      cls = CC.ui.ctypes[cls];
    }

/**
 * @cfg {Object} itemCfg 用于批量添加子项{@link #fromArray}时子项的配置
 */
    var it, cfg = this.itemCfg || false;

    for (var i = 0, len = array.length; i < len; i++) {
      it = array[i];
      // already instanced
      if (!it.cacheId){
      
        if(!it.ctype && cfg)
          it = CC.extendIf(it, cfg);
          
        it = this.instanceItem(it, cls, true);
      }
      
      this.add(it);
    }
    return this;
  },
/**
 * 实例化并返回容器子项,此时未添加子项.
 * @param {Object} itemConfig
 * @param {Function} [itemClass]
 * @return {CC.Base} item
 */
  instanceItem : function(it, cls, mixed){
    
    if(!cls){
      cls = this.itemCls;
      if (typeof cls === 'string') {
        cls = CC.ui.ctypes[cls];
      }
    }
    
    if(!it)
      it = {};
      
    if (!it.cacheId) {
      if(!mixed && this.itemCfg){
        it = CC.extendIf(it, this.itemCfg);
      }

      // 提前添加父子关联,有利于在初始化过程中获得父控件信息
      it.pCt = this;
      it = it.ctype ? UX.instance(it) : new(cls||CC.ui.Item)(it);
    
      //层层生成子项
      if (it.array && it.children) {
        it.fromArray(it.array);
        delete it.array;
      }
    }
    return it;
  },
  
  /**@private*/
  bndActs : false,
/**
 * 在容器范围内为子项添加事件处理.<br>
 <pre>
 * param {String} evtName
 * param {Function} callback
 * param {Boolean} cancelBubble
 * param {Object} scope
 * param {String|HTMLElement} childId
 * param {String} srcName
 </pre><br>
 callback 参数为
 <pre>
 * param {CC.ui.Base} childItem 子项
 * param {DOMEvent} event dom 事件
 </pre><br>
 * @return this
 */
  itemAction: function(eventName, callback, cancelBubble, caller, childId, srcName) {
    caller = caller || this;
    var act = (function(e) {
      var el = e.target || e.srcElement;

      if((srcName === undefined || el.tagName === srcName) && el !== this.view){
          var item = this.$(el);
          if (item)
            return item.disabled ? false : callback.call(caller, item, e);
      }
   });
   
   if (!this.bndActs) {
      this.bndActs = [];
   }
    this.bndActs.push([eventName, callback, act, childId]);
    this.domEvent(eventName, act, cancelBubble, null, childId);
    act = null;
    childId = null;
    return this;
  },
/**
 * @param {String} evtName
 * @param {Function} callback
 * @param {String|HTMLElement} childId
 * @return this
 */
  unItemAction: function(eventName, callback, childId) {
    var bnds = this.bndActs;
    
    for (var i = 0, len = bnds.length; i < len; i++) {
      var n = bnds[i];
      if (n[0] === eventName && n[1] === callback && n[3] === childId) {
        childId = childId !== undefined ? childId.tagName ? childId: this.dom(childId) : this.view;
        this.unEvent(eventName, n[2], n[3]);
        bnds.remove(i);
        return this;
      }
    }

    return this;
  },

/**
 * @event keydown
 * 如果已安装键盘监听器,键盘按键触发时发送该事件,参见{@link #bindKeyInstaller},{@link #keyEvent}.
 * @param {DOMEvent} event
 */
 
/**
 * 安装键盘事件监听器,用于发送容器的keydown事件,
 * 一些具有选择功能(CC.util.SelectionProvider)控件已默认开启了该功能.
 * 可通过获取容器keyEvent属性检测是否安装了监听器
 * @return this
 */
  bindKeyInstaller: function() {
    if(this.keyEvent === undefined)
      this.keyEvent = true;

    var kev = this.keyEvent === true ? 'keydown': this.keyEvent;
    var node = this.keyEventNode = this.keyEventNode ? this.dom(this.keyEventNode) : this.ct;
    if (node.tabIndex === -1) {
      //ie won't works.
      node.tabIndex = 0;
      node.hideFocus = 'on';
    }
    this.domEvent(kev, this._onKeyPress, this.cancelKeyBubble, null, node);
    return this;
  },

/**
 * 安装容器itemclick事件
 * @private
 */
  bindClickInstaller : function(){
    this.itemAction(this.clickEvent === true ? 'mousedown': this.clickEvent, this.ctClickTrigger, this.cancelClickBubble);
  },

/**@private*/
  _onKeyPress: function(e) {
    if (!this.disabled && this.fire('keydown', e) !== false)
      this.onKeyPressing(e);
  },
/**
 * 在处理完keydown事件后默认调用的回调函数,
 * 这是一个接口函数,默认为空函数,如果不想通过ct.on方式监听,
 * 可通过重写该方法快速处理按键事件.
 * @method onKeyPressing
 * @param {DOMEvent} event
 */
  onKeyPressing: fGo,

/**
 * 容器聚焦,可通过设置timeout非undefined值来超时聚焦
 * @param {Number} timeout 设置超时
 * @return this
 */
  focus: function(timeout){
    if (this.disabled)
      return this;
    var ct = this.keyEventNode || this.ct;
    if (timeout !== undefined)
      (function(){
         try {
          ct.focus();
         }catch (ee) {}
       }).timeout(0);
    else try {ct.focus();}catch (e) {}
    return this;
  },

  /**
   * 立即布局当前容器
   * @return this
   */
  validate: function() {
    this.layout.invalidate = false;
    this.layout.doLayout();
    return this;
  },
  /**
   *
   */
  invalidate: function() {
    this.layout.invalidate = true;
    return this;
  },

  /**
   * 布局当前容器,如果当前容器正处于布局变更中,并不执行布局.
   * @return this
   */
  doLayout: function() {
    if (!this.layout.invalidate && this.rendered) this.layout.doLayout.apply(this.layout, arguments);
    return this;
  },

/**
 * 根据容器内容宽度自动调整.
 * @override
 * @return this
 */
  autoHeight: function() {
    var v = this.ct;
    this.setSize(this.getWidth(true) + v.scrollWidth - v.clientWidth, this.getHeight(true) + v.scrollHeight - v.clientHeight);
    return this;
  },
    /**
     * 相对父层居中,这里的居中是相对视角居中.
     * @param {DOMElement|CC.Base} 相对居中锚点
     * @return this
     */
    center : function(anchor){
        var xy, sz, p = anchor?anchor.view?anchor.view:anchor
                   : this.pCt?this.pCt.view : this.view.parentNode;
        if(!p)
          p = document.body;

        if (p == document.body || p == document.documentElement) {
        sz = CC.getViewport();
        xy = [0,0];
      }
      else {
        p = CC.fly(p);
        sz = p.getSize();
        xy = p.absoluteXY();
        p.unfly();
      }

      var off = (sz.height - this.height) / 2 | 0;

      this.setXY( Math.max(xy[0] + (((sz.width - this.width) / 2) | 0), 0), Math.max(xy[1] + off - off/2|0, 0));
      return this;
    },
/**
 * 根据ID或指定属性深层遍历寻找子控件.<br>
 <pre><code>
   input1 = form.layout.add(new CC.ui.Text({id:'idInput',  name:'nameInput'}));
   input2 = form.layout.add(new CC.ui.Text({id:'id2Input', name:'nameInput'}));
   // input1
   var input = form.byId('idInput');
   // input2
   var input = form.byId('id2Input');
   // input1
   var input1 = form.byId('nameInput', name);
   // [input1, input2]
   var inputs = form.byId('nameInput', name, true);
 </code></pre>
 * @param {String} childId ID值或指定属性的值
 * @param {String} attributeName 不一定是id值,可以指定搜索其它属性
 * @param {Boolean} [returnMore] 是否返回第一个或多个 
 * @return {CC.Base|null|Array} 如果 returnMore 未设置,返回第一个匹配或null,否则返回一个数组,包含所有的匹配.
 */
    byId : function(cid, key, loop){
      var tmp = [], els = null, chs = this.children, child = this.children[0];
      var k=0;
      if(!key) key = 'id';
      if(loop) els = [];
      while(child){
        if(child[key] === cid){
          if(!loop) return child;
          els[els.length] = child;
        }
        if(child.children && child.children.length > 0)
          tmp.push(child);

        child = chs[++k];

        if(!child){
          child = tmp.pop();
          if(child){
            chs = child.children;
            k = 0;
            child = chs[0];
          }
        }
      }
      return els;
    },
    
/**
 * 以广度优先遍历控件树
 * @param {Function} callback 参数为 callback(idxOfItemContainer, totalCounter), 返回false时终止遍历;
 * @override
 */
  eachH : function(cb){
    var chs = this.children, ch, acc = 0, idx = 0, tmp = [];
    
    ch = chs[0];
    
    while (ch) {
      
      if(ch.children){
        // prepared
        tmp.push(ch);
      }
      //apply
      acc++;
      
      if(cb.call(ch, idx, acc) === false)
         break;
      
      // move next
      ch = chs[++idx];
      
      if(!ch){
        ch = tmp.pop();
        if(ch){
          idx = 0;
          chs = ch.children;
          ch = chs[0];
        }
      }
    }
  },
  
  // private
  scrollor : false,
  
/**
 * 获得容器的滚动条所在控件,默认返回父层overflow:hidden元素,如无法找到,返回容器{@link #ct}结点.
 * @return {DOMElement|CC.Base}
 */
	getScrollor : function(){
		
		// 某些实现控件可以缓存在控件内部的scrollor结点以快速返回
		if(this.scrollor)
			return this.scrollor;
		
		var bd = CC.strict ? document.documentElement : document.body,
		    nd = this.ct,
		    f  = CC.fly(nd);
	
		while(nd && nd !== bd){
			f.view = nd;
			if( f.fastStyle('overflow') !== 'visible' ){
				f.unfly();
				return nd;
			}
			nd = nd.parentNode;
		}
		f.unfly();
		return nd ? nd : this.ct;
	}
});

var ccx  = CC.ui.ContainerBase,
    ccxp = ccx.prototype;

/**
 * 等同 {@link byId}
 * @type Function
 */
ccxp.find = ccxp.byId;

UX.def('ct', ccx);

CC.Tpl.def( 'CC.ui.Panel', '<div class="g-panel"></div>');
/**
 * @class CC.ui.Panel
 * 面板与容器的主要区别是可发送resized, reposed事件,resize后可重新设定容器内容结点的宽高和位置.
 * @extends CC.ui.ContainerBase
 */
CC.create('CC.ui.Panel', ccx, function(superclass){
 return {
/**
 * @cfg {String|HTMLElement} ct 默认为ID为_wrap,如果不存在该结点,则指向当前面板的view结点
 */
        ct: '_wrap',
/**
 * @cfg {Boolean} deffer 是否延迟布局,该值attach到布局管理器时将覆盖布局管理器原有deffer设置,默认不延迟.
 */
        deffer : false,

/**
 * @cfg {Boolean} syncWrapper 当面板宽高改变时是否同步计算并更新容器内容组件宽高,默认为true.
 */
        syncWrapper : true,
        
        insets : false,
        
        initComponent: function(){
            var w = false, h = false, l = false, t = false;
            if (this.width !== false) {
                w = this.width;
                this.width = false;
            }

            if (this.height !== false) {
                h = this.height;
                this.height = false;
            }

            if (this.left !== false) {
                l = this.left;
                this.left = false;
            }

            if (this.top !== false) {
                t = this.top;
                this.top = false;
            }

            if(this.insets){
              var m = this.insets;
              m[4] = m[0]+m[2];
              m[5] = m[1]+m[3];
            }
            
            superclass.initComponent.call(this);

            if(this.insets){
              var m = this.insets;
              this.wrapper.setXY(m[3], m[0]);
            }

            if (w !== false || h !== false)
                this.setSize(w, h);

            if(l !== false || t !== false)
              this.setXY(l, t);
        },

/**
 * 得到容器距离边框矩形宽高.
 * 该值应与控件CSS中设置保持一致,
 * 用于在控件setSize中计算客户区宽高,并不设置容器的坐标(Left, Top).
 * @return {Array} insetArray
 */
        getWrapperInsets: function(){
            var ins = this.insets;
            if(!ins){
              var w = this.wrapper;
              this.insets = ins =
                [parseInt(w.fastStyle('top'),10)||0,
                 parseInt(w.fastStyle('right'),10)||0,
                 parseInt(w.fastStyle('bottom'),10)||0,
                 parseInt(w.fastStyle('left'),10)||0
                ];
              ins[4] = ins[0] + ins[2];
              ins[5] = ins[1] + ins[3];
            }
            return ins;
        },

/**
 * @event resized
 * {@link #setSize}设置后触发.
 * @param {Number} contentWidth 面板容器结点内容宽度
 * @param {Number} contentHeight 面板容器结点内容高度
 * @param {Number} width  面板宽度
 * @param {Number} height 面板高度
 */

/**
 * 在设置宽高后发送resized事件,并调用布局管理器布局(layout.doLayout()).
 * @param {Number|false} width
 * @param {Number|false} height
 * @param {Boolean} uncheck 性能优化项,是否比较宽高,如果宽高未变,则直接返回
 */
        setSize: function(a, b, uncheck){
            var w = this.width, h = this.height;
            if(!uncheck){
              w = w===false?a:w===a?false:a;
              h = h===false?b:h===b?false:b;
            }

            if (w !== false || h !== false){
              superclass.setSize.call(this, w, h);
              //受max,min影响,重新获得
              if(w !== false) w = this.width;
              if(h !== false) h = this.height;

              var wr = this.wrapper, spaces,cw, ch;
              //如果wrapper非容器结点
              if(wr.view !== this.view && this.syncWrapper){
                spaces = this.getWrapperInsets();
                cw = w===false?w:Math.max(w - spaces[5], 0);
                ch = h===false?h:Math.max(h - spaces[4], 0);
                wr.setSize(cw, ch);
                //受max,min影响,重新获得
                if(cw !== false) cw = wr.width;
                if(ch !== false) ch = wr.height;
              }else {
                //容器自身结点,计算容器content size
                cw = w===false?w:Math.max(w - this.getOuterW(), 0);
                ch = h===false?h:Math.max(h - this.getOuterH(), 0);
              }
              this.fire('resized', cw, ch, w, h);
              this.doLayout(cw, ch, w, h);
            }
            return this;
        },
/**
 * @event reposed
 * {@link #setXY}设置后触发.
 * @param {Number} left 设置后面板x坐标
 * @param {Number} top  设置后面板y坐标
 * @param {Number} deltaX
 * @param {Number} deltaY
 */

/**
 * 设置面板x,y坐标
 * 设置后发送reposed事件
 */
        setXY: function(a, b){
            if (CC.isArray(a)) {
                b = a[1];
                a = a[0];
            }
            var dl = 0, dt = 0;
            if ((a !== this.left && a !== false) || (b !== this.top && b !== false)) {
                if (a !== this.left && a !== false) {
                    this.fastStyleSet('left', a + 'px');
                    dl = a - this.left;
                    this.left = a;
                }
                else
                    a = false;

                if (b !== this.top && b !== false) {
                    this.fastStyleSet('top', b + 'px');
                    dt = b - this.top;
                    this.top = b;
                }
                else
                    b = false;
                if (a !== false || b !== false) {
                    this.fire('reposed', a, b, dl, dt);
                }
            }

            return this;
        }
};
});

UX.def('panel', CC.ui.Panel);
})();
﻿/**
 * @class CC.util.dd
 * 库drag & drop效果实现
 * drag & drop实现有两种方法<ul>
 * <li>基于空间划分检测</li>
 * <li>一种基于浏览器自身的mouse over + mouse out检测</li></ul>
 * 这里采用第一种.
 */
(function(){

var CC = window.CC;
CC.util.dd = {};

var E = CC.Event,

    _w = window,

    doc = _w.document,

    M = _w.Math,

    //位于上方的控件
    onEl = null,

    //拖动中的控件
    dragEl = null,

    //拖动开始时鼠标位置
    IXY,

    //当前鼠标位置
    PXY,

    //鼠标离初始位置偏移量
    DXY = [0,0],

    //开始时拖动元素位置
    IEXY,

    //是否拖动中
    ing = false,

    //当前拖动compoent所在域
    zoom,

    //寄存点
    P = new CC.util.d2d.Point,

    //寄存ComponentRect
    R,
    
    // drag monitor
    AM,
    
    // drop monitor
    OM = false,
    //拖放事件是否已绑定,避免重复绑定
    binded = false,

    //drag source控件所在的域
    ownZoom = false,

    //[MAX_DX,MIN_DX,MAX_DY,MIN_DY]
    bounds = false,
    
    tmpValid = undefined,
    
    // temp DOMEvent on move
    V;

    function noSelect(e){
      e = e || window.E;
      E.stop(e);
      return false;
    }
    
    function checkZoom(){
      if(zoom) {
        if(dragEl.ownRect){
          if(zoom.contains(dragEl.ownRect)){
            tmpValid = dragEl.ownRect.valid;
            dragEl.ownRect.valid = false;
          }
        }
        zoom.update();
      }
    }
    
    function before(e){
        dragEl = this;
        if(__debug) console.group("拖放"+this);
        if(__debug) console.log('beforedrag');
        if((!this.beforedrag || this.beforedrag(e)!==false) && this.fire('beforedrag', e) !== false){
          // check drag monitor, this instead of null
          if(!AM)
            AM = this;
      
          if(AM !== this && AM.beforedrag){
            if(AM.beforedrag(e) === false){
              dragEl = false;
              AM = false;
              return;
            }
          }
          
          IEXY = dragEl.absoluteXY();
          IXY = PXY = E.pageXY(e);
          
          E.stop(e);
          
          if(!binded){
            // bind dom events
            binded = true;
            // chec drop monitor
            if(!OM)
            	OM = this;
        
            if(!OM.movesb)
            OM.movesb = false;
        
            // 加速处理
            if(!AM.drag)
              AM.drag = false;
        
            E.on(doc, "mouseup", drop)
             .on(doc, "mousemove", drag)
             .on(doc, "selectstart", noSelect);
          }
          
          checkZoom();
      
          if(__debug && zoom) console.log('当前zoom:',this.dragZoom||zoom);
        }else {
          dragEl = false;
        }
    }

    function GDXY(){
      var d = DXY;
          d[0] = PXY[0] - IXY[0];
          d[1] = PXY[1] - IXY[1];
          if(bounds){
             var b = bounds;
             if(d[0]<b[1]) d[0]=b[1];
             else if(d[0]>b[0]) d[0]=b[0];

             if(d[1]<b[3]) d[1]=b[3];
             else if(d[1]>b[2]) d[1]=b[2];
          }
    }
    // 检测是否进入范围
    function _(){
        //区域检测
        R = zoom.isEnter(P);
        if(R && R.comp !== dragEl) {
          if(onEl !== R.comp){
            //首次进入,检测之前
            if(onEl !== null){
                if(__debug) console.log('离开:',onEl.title||onEl);
                OM.sbout && OM.sbout(onEl, dragEl, V);
            }
            //
            onEl = R.comp;
            if(!onEl.disabled){
              if(__debug) console.log('进入:',onEl.title||onEl);
              OM.sbover && OM.sbover(onEl, dragEl, V);
              // 可能已重新检测onEl
            }else {
              onEl = null;
            }
          }
          //源内移动
          if(onEl){
            if(OM.sbmove) OM.sbmove(onEl, V);
          }
        }else{
          if(onEl!== null){
            if(__debug) console.log('离开:',onEl.title||onEl);
            OM.sbout && OM.sbout(onEl, dragEl, V);
            onEl = null;
          }
        }
    }
    
    function drag(e){
    	// dragstart false state
    	if(ing === -1)
    		return;
    	
      V = e || _w.E;
      PXY = E.pageXY(e);


      P.x = PXY[0];
      P.y = PXY[1];

      GDXY();

      if(!ing){
        if(__debug) console.log('dragstart       mouse x,y is ', PXY,'dxy:',DXY);
        if(AM.dragstart){
        	if(AM.dragstart(e, dragEl) === false){
        		ing = -1;
        		return;
        	}
        }
        ing = true;
      }
      
      if((AM.drag === false || AM.drag(e) !== false) && zoom)
        _();
        
      E.stop(e);
    }

    function drop(e){
      // drag has started
      if(dragEl){
        e = e || _w.E;
        if(binded){
          //doc.ondragstart = null;
          //清空全局监听器
          E.un(doc, "mouseup", arguments.callee)
           .un(doc, "mousemove", drag)
           .un(doc, "selectstart", noSelect);
          if(ing && ing !== -1){
             if(__debug) console.log('dragend         mouse delta x,y is ',DXY, ',mouse event:',e);
            //如果在拖动过程中松开鼠标
            if(onEl !== null){
              OM.sbdrop && OM.sbdrop(onEl, dragEl, e);
              if(__debug) console.log(dragEl.toString(), '丢在', onEl.title||onEl,'上面');
            }

            AM.dragend && AM.dragend(e, dragEl);
          }
          
          onEl = null;
          if(zoom){
            zoom.clear();
            //不再将自己放入域
            ownZoom = false;
            zoom = null;
          }
          R = null;
          binded = false;
          ing = false;
        }
        
        if(__debug) console.log('afterdrag');
        AM.afterdrag && AM.afterdrag(e);
        dragEl.fire('afterdrag', e);
        
        // 恢复
        if(tmpValid !== undefined){
           dragEl.ownRect.valid = tmpValid;
           tmpValid = undefined;
        }
        
        dragEl = null;
        bounds = false;
        OM = AM = false;
        V = null;
        if(__debug) console.groupEnd();
      }
    }


/**
 * @class CC.util.dd.Mgr
 * Drag & Drop 管理器
 * 利用空间划分类，结合鼠标事件实现DRAG & DROP功能。
 <pre><code>
CC.ready(function(){
//__debug=true;
// 实现两个控件（树，表格）间的拖放响应效果。
var win = new CC.ui.Win({
  layout:'border',
  showTo:document.body,
  items:[
      {ctype:'tree',id:'typetree',  cs:'scrolltree', css:'lnr',
       getScrollor : function(){ return this; },
       // 默认tree点击触发事件是mousedown,就像tabitem一样,
       // 这里为了不影响拖动事件mousedown,将触发事件改为click
       clickEvent:'click',
       root:{expanded:true,title:'根目录'},
       width:190,lyInf:{dir:'west'}
      },
      {ctype:'grid', id:'attrgrid', lyInf:{dir:'center'},autoFit:true,css:'lnl',
       header : {array:[
         {title:'名 称'},
         {title:'值'}
       ]},
       
       content:{array:[{  array:[{title:'码 数'}, {title:'20'}] }] }
      }
  ]
});
win.render();
win.center();

var resizeImg = new CC.ui.Resizer({
    layout : 'card',
    left   : 20,
    top    : 10,
    width  : 300,
    height : 300,
    id     : '图片',
    showTo : document.body,
    autoRender : true,
    shadow : true,
    items  : [{
        ctype:'base',
        template:'<img alt="图片位置" src="3ea53e46d25.jpg">'
    }]
});

var attrgrid = win.byId('attrgrid');
var typetree    = win.byId('typetree');
// 拖放管理器
var G = CC.util.dd.Mgr;

// 添加三个拖放域，为指定控件所在的区域
var ctzoom = new CC.util.d2d.RectZoom({
  rects:[
    new CC.util.d2d.ComponentRect(attrgrid),
    new CC.util.d2d.ComponentRect(typetree),
    new CC.util.d2d.ComponentRect(resizeImg)
  ]
});

// 拖放处理对象
var handler = {
  beforedrag : function(){
    G.setZoom(ctzoom);
  },
  dragstart : function(evt, source){
    G.getIndicator().prepare();
    G.getIndicator().setMsg("容器间的拖放!", "源:"+source.id);
    CC.each(ctzoom.rects, function(){
        if(this.comp != source){
            this.comp.addClass('dragstart');
        }
    });
  },
  
  drag : function(){
    // 使得指示器在正确的位置显示
    G.getIndicator().reanchor();
  },
  sbover : function(target){
    G.getIndicator().setMsg('进入了<font color="red">'+target.id+'</font>');
    target.addClass('dragover');
  },
  sbout : function(target){
    G.getIndicator().setMsg("容器间的拖放!");
    target.delClass('dragover');
  },
  
  sbdrop : function(target, source){
    target.delClass('dragover');   
  },
  
  dragend : function(evt, source){
    CC.each(ctzoom.rects, function(){
        if(this.comp != source){
            this.comp.delClass('dragstart');
        }
    });
    G.getIndicator().end();
  }
};

G.installDrag(typetree, true, null, handler);

G.installDrag(attrgrid, true, null, handler);

G.installDrag(resizeImg, true, null, handler);
});
 </code></pre>

 */
  var mgr = CC.util.dd.Mgr = {
/**
 * 矩域缓存
 * @private
 */
        zmCache : {root:new CC.util.d2d.RectZoom()},

/**
 * 给控件安装可拖动功能,安装后控件component具有
 * component.draggable = true;
 * 如果并不想控件view结点触发拖动事件,可设置component.dragNode
 * 指定触发结点.
 * @param {CC.Base} component
 * @param {Boolean} install 安装或取消安装
 * @param {HTMLElement|String} dragNode 触发事件的结点,如无则采用c.dragNode
 */
        installDrag : function(c, b, dragNode, monitor, dragtrigger){
          if(!b){
            c.draggable = false;
            c.unEvent('mousedown', before,dragNode||c.dragNode);
          }else {
            c.draggable = true;
            if(dragtrigger){
              dragtrigger = c.dom(dragtrigger) || dragtrigger;
              if(dragtrigger){
                c.domEvent('mousedown',  function(e){
                   var el = E.element(e);
                   if(el === dragtrigger || el.id === dragtrigger){
                     mgr.startDrag(this, e);
                   }
                }, false, null, dragNode);
              }
            }else {
              c.domEvent('mousedown', before, false, null, dragNode);
            }
            
            if(monitor){
              c.beforedrag = function(){
                AM = OM = monitor;
              };
            }
          }
        },
/**
 * 手动触发拖放处理.
 * @param {CC.Base} dragSource
 * @param {DOMEvent} event 传入初始化事件.
 */
        startDrag : function(source, e){
          before.call(source, e);
        },

/**
 * 设置拖动中的控件, 在dragbefore时可以指定某个控件作为拖动源对象.
 * @param {CC.Base} draggingComponent
 * @return this
 */
        setSource : function(comp){
          dragEl = comp;
          return this;
        },
/**
 * 设置拖动监听器, 在dragbefore时可以指定某个对象作为拖动监听器,如果未设置,drag source控件将作为监听器.<br>
 * monitor具有以下接口
   beforedrag<br>
   dragstart <br>
   drag      <br>
   dragend   <br>
 * @param {Object} dragMonitor
 * @return this
 */
        setDragHandler : function(monitor){
          OM = monitor;
          return this;
        },
/**
 * 设置drop监听器, 在dragbefore时可以指定某个对象作为监听器,如果未设置,drag source控件将作为监听器.<br>
 * monitor具有以下接口
   sbover    <br>
   sbout     <br>
   sbmove    <br>
   sbdrop    <br>
 * @param {Object} dropgMonitor
 * @return this
 */        
        setDropHandler : function(monitor){
          AM = monitor;
          return this;
        },
/**
 * 集中一个监听器.
 * @param {Object} monitor
 * @return this
 */
        setHandler : function(monitor){
          OM = AM = monitor;
          return this;
        },
/**
 * 可在dragbefore重定义当前拖放区域.
 * @param {CC.util.d2d.RectZoom} rectzoom
 * @param {Boolean} update
 * @return this
 */
        setZoom : function(z, update){
          zoom = z;
          if(z && update) zoom.update();
          return this;
        },

/**
 * 设置拖放区域大小,在X方向上,最小的delta x与最大的delta x,
 * 在Y方向上,最小的delta y与最大的delta y, 所以数组数据为
 * [max_delta_x, min_delta_x, max_delta_y, min_delta_y],
 * 设置拖动区域后,超出区域的行为将被忽略,也就是并不回调
 * component.drag方法,所以,在drag方法内的操作都是安全的.
 * 受限区域在拖放结束后清空.
 * @param {Array} constrainBounds
 * @return this
 */
        setBounds : function(arr){
          bounds = arr;
          return this;
        },

/**
 * 获得受限区域
 * @return {Array} [MAX_DX,MIN_DX,MAX_DY,MIN_DY]
 */
        getBounds : function(){
          return bounds;
        },
/**
 * 返回根域
 * @return {CC.util.d2d.RectZoom}
 */
        getZoom : function(){
          return zoom;
        },

/**
 * 拖动开始时鼠标位置
 * @return {Array} [x, y]
 */
        getIMXY : function(){
          return IXY;
        },
/**
 * 获得对象拖动开始时对象坐标
 * @return {Array} [x,y]
 */
        getIEXY : function(){
          return IEXY;
        },

/**
 * 获得自鼠标拖动起至今的x,y方向偏移量
 * @return {Array} [dx, dy]
 */
        getDXY : function(){
          return DXY;
        },
/**
 * 获得当前鼠标位置
 * @return {Array} [x,y]
 */
        getXY : function(){
          return PXY;
        },
/**
 * 获得当前拖动的对象
 * @return {CC.Base}
 */
        getSource : function(){
          return dragEl;
        },
/**
 * 获得当前位正下方的对象,如果无,返回null
 * @return {CC.Base}
 */
        getTarget : function(){
          return onEl;
        },

/**
 * 更新当前拖动的矩域数据.
 * @return this
 */
    update : function(){
      if(zoom){
        zoom.update();
        // recheck again
      }
      return this;
    },

/**
 * 是否拖放中
 * @return {Boolean}
 */
        isDragging : function(){
          return ing;
        },
/**
 * @class CC.util.dd.Mgr.resizeHelper
 * 当控件需要resize时调用,可以创建resize相关的掩层和映像,防止其它干扰resize的因素,如iframe
 * @singleton
 */

        resizeHelper : {

          resizeCS : 'g-resize-ghost',

          maskerCS : 'g-resize-mask',
/**
 * @property  layer
 * 映像层,只读,当调用applyLayer方法后可直接引用
 * @type CC.Base
 */

/**
 * @property masker
 * 页面掩层,只读,当调用applyMasker方法后可直接引用
 * @type CC.Base
 */

/**
 * 在resize开始或结束时调用
 * @param {Boolean} applyOrNot
 * @param {String}  [maskerCursor] 掩层的style.cursor值
 */
          applyResize : function(b, cursor){
            this.resizing = b;
            this.applyLayer(b);
            this.applyMasker(b, cursor);
          },
/**
 * 是否应用映像层
 * @param {Boolean} apply
 * @return this
 */
          applyLayer : function(b){
            var y = this.layer;
            if(!y){
              y = this.layer =
                  CC.Base.create({
                    view:CC.$C('DIV'),
                    autoRender:true,
                    cs:this.resizeCS,
                    hidden:true
                  });
            }
            b ? y.appendTo(doc.body) : y.del();
            y.display(b);
            return this;
          },
/**
 * 创建或移除页面掩层,在resize拖动操作开始时,创建一个页面掩层,
 * 以防止受iframe或其它因素影响resize
 * @param {Boolean} cor 创建或移除页面掩层
 * @param {String}  cursor 掩层style.cursor值
 * @return this
 */
          applyMasker : function(b, cursor){
            var r = this.masker;
            if(!r)
              r = this.masker =
                CC.Base.create({
                  view:CC.$C('DIV'),
                  autoRender:true,
                  cs:this.maskerCS,
                  hidden:true,
                  unselectable:true
                });

            if(b && CC.ie)
              r.setSize(CC.getViewport());
            b ? r.appendTo(doc.body) : r.del();
            r.display(b);
            
            if(cursor !== undefined)
              r.fastStyleSet('cursor', cursor);
            return this;
          }
        }
  };
/**
 * @class CC.util.dd.DragHandler
 * 这是一个接口类，实际并不存在，可以通过任意对象现实其中的一个或多个方法。
 * 用于处理Drag & Drop事件回调。

<pre><code>
// 拖放管理器
var G = CC.util.dd.Mgr;

// 添加三个拖放域，为指定控件所在的区域
var ctzoom = new CC.util.d2d.RectZoom({
  rects:[
    new CC.util.d2d.ComponentRect(grid),
    new CC.util.d2d.ComponentRect(tree),
    new CC.util.d2d.ComponentRect(resizer)
  ]
});

// 拖放处理对象
// DragHandler 与 Drop Hander 合在一起实现

var handler = {

  beforedrag : function(){
    G.setZoom(ctzoom);
  },
  
  dragstart : function(evt, source){
    G.getIndicator().prepare();
    G.getIndicator().setMsg("容器间的拖放!", "源:"+source.id);
    CC.each(ctzoom.rects, function(){
        if(this.comp != source){
            this.comp.addClass('dragstart');
        }
    });
  },
  
  drag : function(){
    // 使得指示器在正确的位置显示
    G.getIndicator().reanchor();
  },
  
  sbover : function(target){
    G.getIndicator().setMsg('进入了<font color="red">'+target.id+'</font>');
    target.addClass('dragover');
  },
  
  sbout : function(target){
    G.getIndicator().setMsg("容器间的拖放!");
    target.delClass('dragover');
  },
  
  sbdrop : function(target, source){
    target.delClass('dragover');   
  },
  
  dragend : function(evt, source){
    CC.each(ctzoom.rects, function(){
        if(this.comp != source){
            this.comp.delClass('dragstart');
        }
    });
    G.getIndicator().end();
  }
};

G.installDrag(tree, true, null, handler);
G.installDrag(grid, true, null, handler);
G.installDrag(resizer, true, null, handler);
 </code></pre>

 */
 
 
  CC.extendIf(CC.Base.prototype, {

/**
 * 如果已安装拖放,
 * 函数在鼠标按下时触发,方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @method beforedrag
 */
    beforedrag : false,
/**
 * 如果已安装拖放,拖动开始时触发.方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @param {CC.Base}  source
 * @method dragstart
 */
    dragstart : false,
/**
 * 如果已安装拖放,
 * 函数在鼠标松开时触发,拖动曾经发生过.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @param {CC.Base}  source
 * @method dragend
 */
    dragend : false,
/**
 * 如果已安装拖放,
 * 函数在鼠标松开时触发,拖动不一定发生过.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @method afterdrag
 */
    afterdrag : false,
/**
 * 如果已安装拖放,
 * 函数在鼠标拖动时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @param {CC.Base} overComponent 在下方的控件,无则为空
 * @method drag
 */
    drag : false,


/**
 * @class CC.util.dd.DropHandler
 * 这是一个接口类，实际并不存在，可以通过任意对象现实其中的一个或多个方法。
 * 用于处理Drag & Drop事件回调。

<pre><code>
// 拖放管理器
var G = CC.util.dd.Mgr;

// 添加三个拖放域，为指定控件所在的区域
var ctzoom = new CC.util.d2d.RectZoom({
  rects:[
    new CC.util.d2d.ComponentRect(grid),
    new CC.util.d2d.ComponentRect(tree),
    new CC.util.d2d.ComponentRect(resizer)
  ]
});

// 拖放处理对象
// DragHandler 与 Drop Hander 合在一起实现

var handler = {

  beforedrag : function(){
    G.setZoom(ctzoom);
  },
  
  dragstart : function(evt, source){
    G.getIndicator().prepare();
    G.getIndicator().setMsg("容器间的拖放!", "源:"+source.id);
    CC.each(ctzoom.rects, function(){
        if(this.comp != source){
            this.comp.addClass('dragstart');
        }
    });
  },
  
  drag : function(){
    // 使得指示器在正确的位置显示
    G.getIndicator().reanchor();
  },
  
  sbover : function(target){
    G.getIndicator().setMsg('进入了<font color="red">'+target.id+'</font>');
    target.addClass('dragover');
  },
  
  sbout : function(target){
    G.getIndicator().setMsg("容器间的拖放!");
    target.delClass('dragover');
  },
  
  sbdrop : function(target, source){
    target.delClass('dragover');   
  },
  
  dragend : function(evt, source){
    CC.each(ctzoom.rects, function(){
        if(this.comp != source){
            this.comp.delClass('dragstart');
        }
    });
    G.getIndicator().end();
  }
};

G.installDrag(tree, true, null, handler);
G.installDrag(grid, true, null, handler);
G.installDrag(resizer, true, null, handler);
 </code></pre>
 
 */
 
/**
 * 如果已加入拖放组,
 * 函数在源进入时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {CC.Base} dragTarget 下方控件
 * @param {CC.Base} dragSource 上方控件
 * @param {DOMEvent} event
 * @method sbover
 */
    sbover : false,
/**
 * 如果已加入拖放组,
 * 函数在源离开时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {CC.Base} dragTarget 下方控件
 * @param {CC.Base} dragSource 上方控件
 * @param {DOMEvent} event
 * @method sbout
 */
    sbout : false,
/**
 * 如果已加入拖放组,
 * 函数在源丢下时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {CC.Base} dragTarget 下方控件
 * @param {CC.Base} dragSource 上方控件
 * @param {DOMEvent} event
 * @method sbdrop
 */
    sbdrop : false,
/**
 * 如果已加入拖放组,
 * 函数在源移动时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {CC.Base} dragTarget 下方组件
 * @param {DOMEvent} event
 * @method sbmove
 */
    sbmove : false
  });
  
/**
 *@class CC.util.d2d.ContainerDragZoom
 * 该类可快速将容器首层子控件添加到容器矩域中，并可实时刷新矩域数据。
 <pre><code>
 // 容器子项拖放响应
    var portalZoom = new CC.util.d2d.ContainerDragZoom({ct:win});
    var handler = {
        beforedrag : function(){
            CC.util.dd.Mgr.setZoom(portalZoom);
        },
        ...
    };
 </code></pre>
 * @extends CC.util.d2d.RectZoom
 */
  CC.create('CC.util.d2d.ContainerDragZoom', CC.util.d2d.RectZoom, {
/**
 * @cfg {Function} filter 在拖动开始收集控件区域时可过滤某些不合条件的子控件。
 * <br>
 * 格式:filter(childComponent),false时忽略该子控件
 */
    filter : false,

/**
 * 获得视图元素(overflow:hidden),只有在该范围内的子控件才会被检测,范围外的子控件被忽略.
 * 默认返回父层overflow:hidden元素.
 * 控件开发者可重写该函数返回自定的范围视图.
 * @private
 * @return {CC.ui.Base} containerViewport
 */
    getViewportEl : function(){
    	return this.ct.getScrollor();
    },
    
/**
 * 默认只将容器视图范围内的子控件加入到矩域,视图范围外不可见的子控件将被忽略.<br>
 * 在收集子控件过程中,调用{@link #filter}方法过滤子控件
 * @implementation
 * @private
 */
    prepare : function(){
      var sv = this.getViewportEl(), 
          ch = sv.clientHeight,
          st = sv.scrollTop,
          source = mgr.getSource(),
          self = this;
      
      if( __debug ) console.group("容器"+this.ct.id+"拖放域:", this);
      
      var zoom = this;
      this.ct.each(function(){
        if(this !== source){
            if(!self.filter || self.filter(this)){
              var v = this.view, ot = v.offsetTop, oh = v.offsetHeight;
              // 是否可见范围
              if(ot + oh - st > 0){
                if(ot - st - ch < 0){
                  zoom.add( new CC.util.d2d.ComponentRect(this) );
                  if(__debug) console.log('CC.util.d2d.ContainerDragZoom:加入矩域:', arguments[1]);
                }else {
                  return false;
                }
              }
            }
        }
      });
      if( __debug ) console.groupEnd();
    },
/**
 * 
 */
    clear   : function(){
      this.rects.clear();
    },
/**
 * @param {CC.Base} component(s)
 */
    addComp : function(comp){
      if(CC.isArray(comp)){
        for(var i=0,len=comp.length;i<len;i++){
          this.addComp(comp[i]);
        }
      }
      else this.add( new CC.util.d2d.ComponentRect(comp) );
    }
  });
  
  CC.ui.def('ctzoom', CC.util.d2d.ContainerDragZoom);
/**
 * @class CC.util.dd.Indicator
 * 默认的拖放指示器
 * @extends CC.ui.ContainerBase
 */
  CC.create('CC.util.dd.Indicator', CC.ui.ContainerBase, {
      
      hidden : true,
      
      template : CC.ie ? 
           '<table class="g-float-tip g-clear g-openhand"><tr><td><table class="tipbdy"><tr><td id="_tle" class="important_txt"></td></tr><tr><td id="_msg" class="important_subtxt"></td></tr></table></td></tr></table>' :
           '<div class="g-float-tip g-clear g-openhand"><div class="tipbdy"><div id="_tle" class="important_txt"></div><div id="_msg" class="important_subtxt"></div></div></div>',
      
      shadow : {ctype:'shadow', inpactY:-1,inpactH:5},
/**
 * 设置标题。
 * @param {String} text 正文
 * @param {String} title 标题
 */
      setMsg : function(text, title){
        if(text !== false) {
          if(!this.msgNode)
            this.msgNode = this.dom('_msg');
          this.msgNode.innerHTML = text;
        }
        if(title !== undefined){
          if(!this.titleNode)
            this.titleNode = this.dom('_tle');
          this.titleNode.innerHTML = title;
        }
        
        if(this.shadow)
          this.shadow.resize();
      },
/**
 * 显示前调用，设置初始位置等信息。
 */
      prepare : function(x, y){
        if(x === undefined)
          x = 15;
          
        if(y === undefined)
          y = -10;

        if(!this.rendered) {
          this.render();
        }
        var ixy = mgr.getIMXY();
        x += ixy[0]; 
        y += ixy[1];
        this.initX = x;
        this.initY = y;
        this.setXY(x, y);
        this.show();
        mgr.resizeHelper.applyMasker(true);
        mgr.resizeHelper.masker.addClass('g-openhand');
        this.appendTo(document.body);
      },

      setXY : function(){
        this.superclass.setXY.apply(this, arguments);
        if(this.shadow)
          this.shadow.repos();
        return this;
      },
/**
 * 更新定位信息。
 */
      reanchor : function(){
        this.setXY(this.initX + DXY[0], this.initY + DXY[1]);
      },
/**
 * 指示结束后调用
 */
      end : function(){
        mgr.resizeHelper.applyMasker(false);
        mgr.resizeHelper.masker.delClass('g-openhand');
        this.hide().del();
      }
  });
  
  CC.ui.def('ddindicator', CC.util.dd.Indicator);
  
  /**
   * @member CC.util.dd.Mgr
   * @method getIndicator
   */
  mgr.getIndicator = function(cfg){
    var idc = this.indicator;
    if(!idc){
      idc = this.indicator = CC.ui.instance(CC.extend({ctype:'ddindicator'}, cfg));
    }
    return idc;
  };
})();
(function(){
var 
    G = CC.util.dd.Mgr, 
    Rz = G.resizeHelper,
    // 当前指示器方向，例如目标上半段或下半段
    DIR;
/**
 * @class CC.util.dd.Portable
 * 本类支持容器内子控件子控件与子控件以及容器间子控件与子控件的拖放响应.
 * 当拖放开始时,拖放源会离开原位置浮动起来,随着鼠标移动而移动.<br>
 * 最常见例子是利用本类做Portal布局.它的效果就是这样,
 * Portal布局管理器运行Portable类并限定了拖放的范围,细化到在某一容器下拖放子控件。
 */

/**
 * @cfg {String} dragNode 指定触发拖放响应的结点ID,该结点位于拖放源中.
 */
 
/**
 * @cfg {Function} createZoom, 生成并返回拖放域，回调参数：createZoom(dragSource)
 */
 
CC.create('CC.util.dd.Portable', null, {
    
    dragNode : '_drag',
    
    // 浮动时添加到拖放源的样式
    floatingCS    :'g-portal-float',
    
    // 占位元素的样式
    
    srcPlaceholdCS : 'g-portal-srchold',
    
    ctPlaceholdCS : 'g-portal-ct-hold',
    
    indicatorCS   : 'g-portal-indicator',
    
    // 修复ie offsetParent与实际定位不一致,显式添加position
    ieOfpCs       : 'g-portal-ie-ofp',
    
    // 当容器无子项时,添加到容器占位元素的最小高度
    miniCtHolderH : 100,
    
    initialize : function(cfg){
        if(cfg)
            CC.extend(this, cfg);
    },
    
/**
 * 绑定一个控件,使之成为拖放源,以触发拖放事件.
 * @param {CC.Base} dragSource
 */
    bind : function(c){
        return G.installDrag(c, true, this.getDragNode(c), this);
    },
    
/**
 * 如果不通过设置{@link #dragNode}来自定义触发拖放的元素,
 * 可以重写该方法返回拖放源上的某个元素作为触发拖放的元素.<br>
 * 函数默认返回拖放源的dragNode属性或者当前类的dragNode属性.
 * @param {CC.Base} dragSource
 * @return {HTMLElement|String} 触发拖放的html元素或元素ID
 */
    getDragNode : function(c){
        return c.dragNode || this.dragNode;
    },

    createZoom : fGo,

//
//  Drag & Drop Handler 接口实现
//    
    dragstart : function(e, source){
        // 重置方向指示
        DIR = undefined;
        // 建drag zoom
        G.setZoom(this.createZoom(source), true);
        // 避免拖放过程中产生的干扰
        Rz.applyMasker(true);
        // 使得拖放可浮动移动
        this.freeSource(source, true);
        // 显示源占位
        source.insertBefore(this.getSrcPlacehold());
        
        if(__debug) console.log('portal zoom tree:', G.getZoom());
    },
    
    drag : function(){
    	  // 拖放源随鼠标移动而移动
        var dxy = G.getDXY(), ixy = this._initOff;
        G.getSource().setXY(dxy[0]+ixy[0], dxy[1] + ixy[1]);
    },

//
//       UP
//  ------------ <-
//      DOWN
//
    sbmove : function(target){
        //
        // 得到目标矩形,并确定鼠标在矩形内的位置(象限)
        //
        var rect = target.ownRect,
            xy = G.getXY(),
            qd = rect.qdAt(xy[0], xy[1]);
        
        // 位于空容器或者目标上半段
        if(target.placeholdCt || qd === 3 || qd === 4 || qd === 8){
            if(!DIR){
                DIR = true;
                this._wayFor(target, true);
            }
        }else if(DIR === undefined || DIR){
            DIR = false;
            this._wayFor(target, false);
        }
    },

    sbout : function(){
    	 // 复位位置
        DIR = undefined;
    },
    
    dragend : function(e, source){
        
        this.getIndicator().del();
        
        if(this._currHold)
            this._applyHold(source, this._currHold, DIR);
        
        Rz.applyMasker(false, '');
        this.getSrcPlacehold().del();
        this.freeSource(source, false);
        
        this.destoryCtPlaceholds();
        delete this._currHold;
    },

    //// 
    
    /**
     * 获得源占位
     * @private
     */
    getSrcPlacehold : function(){
        return this.placehold || ( this.placehold = this.createPlacehold(this.srcPlaceholdCS) );
    },
    /**
     * 获得指示器
     * @private
     */
    getIndicator : function(){
        return this.indicator || ( this.indicator = this.createPlacehold( this.indicatorCS ) );
    },
    
    /**
     * 是否应用容器占位，容器占位在拖放前生成，拖放结束后销毁。
     * @private
     */
    createPlaceholdForCt : function(ct, b){
        var cph = this.createPlacehold();
        cph.placeholdCt = ct;
        cph.setHeight(
            Math.max(
                this.miniCtHolderH, 
                ct.getHeight() - this.getSrcPlacehold(this.ctPlaceholdCS).getHeight()
            )
        );
        cph.appendTo(ct.ct);
        
        // 记录拖放时的空容器
        if (!this.emptyCtHolds) 
            this.emptyCtHolds = [];
        this.emptyCtHolds.push(cph);
        return cph;
    },
    
    destoryCtPlaceholds : function(){
        if(this.emptyCtHolds){
            var ct, ph;
            for(var i=0,chs=this.emptyCtHolds,len=chs.length;i<len;i++) {
                delete chs[i].placeholdCt;
                chs[i].destory();
                chs[i] = null;
            }
            delete this.emptyCtHolds;
        }
    },
    
//
// 生成占位 
//
    createPlacehold : function(cs){
        var ph = CC.ui.instance({
            ctype:'base',
            cs : cs
        });
        return ph;
    },
    
//
// 使得拖放可浮动移动
//
    freeSource : function(source, free){
    
      if(free){
          var v = source.view,
              op = v.offsetParent, 
              off = this._initOff = source.offsetsTo(op);
          
          //
          //  IE下，offsetParent返回的是上一层父元素，
          //  但该元素并不具absolute 或 relative属性，
          //  所以在确定初始位置时误判。现在显式设置
          //  offsetParent的position属性为relative
          //
          if(CC.ie){
              var op = CC.fly(op),
                  ps = op.fastStyle('position');
              if(ps !== 'relative' || ps !== 'absolute'){
                  this._ofPnt = op.view;
                  op.addClass(this.ieOfpCs)
                    .unfly();
              }
          }
          
          source.fastStyleSet('left', off[0] + 'px')
                .fastStyleSet('top',  off[1] + 'px')
                .fastStyleSet('width', v.offsetWidth + 'px')
                .fastStyleSet('position', 'absolute');
      }else {
          source.fastStyleSet('left', '')
                .fastStyleSet('top','')
                .fastStyleSet('position', '')
                .fastStyleSet('width', '');
                
          if(CC.ie && this._ofPnt){
              CC.fly(this._ofPnt)
                .delClass(this.ieOfpCs)
                .unfly();
              delete this._ofPnt;
          }
      }
      
      source.checkClass(this.floatingCS, free);
    },

//
//  往目标位置处插入拖放源
//
    _applyHold : function(source, target, at){
        var tct;
        // TOP - BOTTOM
        // if a container placehold
        if(target.placeholdCt){
            target.placeholdCt.add(source);
            target.hide();
        }else {
            var ct = target.pCt;
            var idx = ct.indexOf(target);
            at ? ct.insert( idx, source ) : 
                 ct.insert( idx+1, source);
        }
    },
    
//
//  在目标上方时显示指示器
//
    _wayFor : function(target, before){
        var it = this.getIndicator();
        before ? target.insertBefore(it) : 
                 target.insertAfter(it);
        if(this._currHold !== target)
            this._currHold = target; 
    }
});
})();
﻿(function(){
var ccxp = CC.ui.ContainerBase.prototype;

/**
 * @class CC.util.ProviderBase
 * 容器{@link CC.ui.ContainerBase}功能增强类的基类.
 */
 
/**
 * @property t
 * 已绑定的目标容器
 * @type CC.ui.ContainerBase
 */
 
CC.create('CC.util.ProviderBase', null, {
	
	initialize : function(opt){
/**
 * 是否已初始化,主要是提供给getXXProvider方法检测目标是否已关联Provider实例
 * @private
 */
		this.inited = true;
		if(opt)
			CC.extend(this, opt);
	},
/**
 * 绑定容器.
 * @param {CC.ui.ContainerBase} targetContainer
 */
	setTarget : function(container){
		this.t = container;
	},

	each : function(){
	  this.t.each.apply(this.t, arguments);
	}
});

/**
 * @class CC.util.ProviderFactory
 */
CC.util.ProviderFactory = {
/**
 * @param {String} name Provider name
 * @param {Function} baseClass base class
 * @param {Object} attrset attribute set
 */
	create : function(name, base, attrs){
		var full      = name + 'Provider', low = name.toLowerCase();
		//lowProvider
		var access    = low + 'Provider';
		var clsName   = 'CC.util.'+full;
		// create provider class
		CC.create(clsName, base || CC.util.ProviderBase, attrs);
		// create container.getXProvider method
		ccxp['get'+full] = function(opt, cls){
		  var p = this[access];
		  if(!p || p === true || !p.inited){
		  	// get config from inherency attribute link
		    var cfgs = CC.getObjectLinkedValues(this, access, true);
		    
		    if(opt)
		      cfgs.insert(0, opt);
		    
		    var c = {}, cls = false;
		    for(var i=0,len=cfgs.length;i<len;i++){
		      var it = cfgs[i];
		      // default class
		      if(it === true && !cls)
		         cls = CC.attr(window, clsName);
          // a ctype
		      if(typeof it === 'string' && c.ctype === undefined)
		        c.ctype = it;
		      // a class specified
          else if(typeof it === 'function' && !cls)
          	cls = it;
		      
		      // 最前优先级最高
		      else CC.extendIf(c, it);
		    }
		    
		    if(!cls && !c.ctype)
		      cls = cls = CC.attr(window, clsName);
		    
		    p = this[access] = cls ? new cls(c) : CC.ui.instance(c);
		      
		    p.setTarget(this);
		  }
		  return p;
		};
	}
};
})();
﻿/**
 * @class CC.util.ConnectionProvider
 * 为控件提供数据加载功能
 * 这个类主要用于桥接CC.Ajax与CC.ui.ContainerBase.
 * @extends CC.util.ProviderBase
 */

 
CC.util.ProviderFactory.create('Connection', null, {
/**
 * @cfg {Boolean} indicatorDisabled  是否禁用指示器,默认false
 */
  indicatorDisabled : false,

/**
 * @cfg {Boolean} subscribe  是否订阅CC.Ajax连接器事件到target容器中,默认false
 */
  subscribe : false,

/**
 * @cfg {String} reader 指定数据载入后格式转换器，默认无。
 */
  reader : false,
  
/**
 * @cfg {Object} ajaxCfg
 * 连接器设置,连接器保存当前默认的连接器connector配置信息,
 * 每次连接时都以该配置信息与新的配置结合发出连接.
 * <br><pre><code>
   var provider = new CC.util.ConnectionProvider(target, {
    indicatorDisabled : true,
    ajaxCfg : {
      url : 'http://www.server.com/old',
      success : function(){},
      ...
    }
   });

   provider.connect('http://www.server.com/new',
    //这里的配置属性将会覆盖provider.ajaxCfg原有属性
    {
      success : function(){},
      ...
    }
   );
   </code></pre>
 */
  ajaxCfg : false,

  setTarget : function(){
  	CC.util.ProviderBase.prototype.setTarget.apply(this, arguments);
  	this.initConnection();
  },
  
 /**@private*/
  initConnection : function(){
    // init request queue
    
    this.createSyncQueue();
    
    if(this.ajaxCfg && this.ajaxCfg.url)
      this.connect();
  },
  
  createSyncQueue : function(){
    this.syncQueue = new CC.util.AsynchronizeQueue({
      caller   : this,
      onempty : this.onConnectorsFinish,
      onfirstopen   : this.onConnectorFirstOpen
    });
  },

/**
 * @cfg {String} loadType
 * 指明返回数据的类型,成功加载数据后默认的处理函数将根据该类型执行
 * 相应的操作,被支持的类型有如下两种<div class="mdetail-params"><ul>
 * <li>html,返回的HTML将被加载到target.wrapper中</li>
 * <li>json,返回的数据转换成json,并通过target.fromArray加载子项</li></ul></div>
 * 如果未指定,按json类型处理.
 * 默认处理函数:{@link #defaultLoadSuccess}
 */
 
 /**
  * 成功返回后执行,默认是根据返回数据类型(loadType)执行相应操作,
  * 如果要自定义处理返回的数据,可定义在连接时传递success方法或重写本方法.<br>
 <pre><code>
   var ct = new CC.ui.ContainerBase({
    connectionProvider : {loadType:'json'}
   });
   //加载json
   ct.getConnectionProvider().connect('http://server/getChildrenData');

   //加载html到容器
   ct.connectionProvider.loadType = 'html';
   ct.connectionProvider.connect('http://server/htmls/');

   //或自定义加载
   ct.getConnectionProvider().connect('http://server/..', {
     success : function(j){
      //this默认是connectionProvider
      alert(this.loadType);
      alert(j.getText());
     }
   });
 </code></pre>
 * @param {CC.Ajax} ajax
 */
  defaultLoadSuccess : function(j){
    if(this.t.fire('connection:defdataload', j, this) !== false){
        var t = this.loadType;
        if(t === 'html')
          this.defaultDataProcessor(t, j.getText());
        else this.defaultDataProcessor(t, j.getJson());
    }
  },
  
/**
 *  可重写本方法自定义数据类型加载
 * @param {String} dataType 数据类型 html, json ..
 * @param {Object} data     具体数据
 */
  defaultDataProcessor : function(dataType, data){
    switch(dataType){
      case 'html' :
        this.t.wrapper.html(data, true);
        break;
      default :
        var ct = this.t.layout||this.t;
        if(this.reader){
            if(typeof this.reader === 'string')
                ct.fromArray(CC.util.DataTranslator.get(this.reader).read(data, this.t));
            else ct.fromArray(this.reader.read(data, this.t));
        }else 
            ct.fromArray(data);
        break;
    }
  },
  
  _setConnectorMsg : function(msg){
    this.caller.getIndicator().setTitle(msg);
  },
  
/**
 * 获得连接指示器,
 * Loading类寻找路径 this.indicatorCls -> target ct.indicatorCls -> CC.ui.Loading
 * @param {Object} indicatorConfig
 * @return {CC.ui.Loading}
 */
  getIndicator : function(opt){
    if(this.indicator && this.indicator.cacheId)
      return this.indicator;
    
    return this.createIndicator(opt);
  },
  
/**
 * 连接服务器, success操作如果未在配置中指定,默认调用当前ConnectionProvider类的defaultLoadSuccess方法
 * 如果当前未指定提示器,调用getIndicator方法实例化一个提示器;
 * 如果上一个正求正忙,终止上一个请求再连接;
 * 当前绑定容器将订阅请求过程中用到的Ajax类的所有消息;
 * indicator 配置信息从 this.indicator -> target ct.indicator获得
 * @param {String} url, 未指定时用this.url
 * @param {Object} cfg 配置Ajax类的配置信息, 参考信息:cfg.url = url, cfg.caller = this
 * @return {String} connectorKey connector in queue
 */
  connect : function(url, cfg){
    var afg = this.ajaxCfg;
    
    if(!afg)
      afg = {url:url||this.url};
      
    else if(url)
      afg.url = url;

    afg.caller = this;
    
    if(cfg)
      CC.extend(afg, cfg);
    
    if (!afg.success){
      if(afg.caller !== this)
        throw '如果使用默认处理,ajaxCfg的caller须为当前的connection provider';
      afg.success = this.defaultLoadSuccess;
    }

/**
 * @cfg {Object|Function|String} indicator
 */
    if (!this.indicatorDisabled && !this.indicator)
      this.getIndicator();
        
    return this.bindConnector(afg);
  },
  
  getConnectionQueue : function(){
    return this.syncQueue;
  },
  
  // private
  createIndicator : function(opt){
    var it, inner = this.indicator || this.t.indicator;
    
    if( !opt ) 
      opt = {};
    
    opt.target = this.t;
    opt.targetLoadCS = this.loadCS;
    
    if(typeof inner == 'function'){
      it = new inner (opt);
    }else {
      if(typeof inner === 'string'){
        if(!opt.ctype)
          opt.ctype = inner;
      } else if(typeof inner === 'object'){
        CC.extendIf(opt, inner);
      }
      
      if(!opt.ctype)
        opt.ctype = 'loading';
        
      it = CC.ui.instance(opt); 
    }
    
    this.indicator = it;
    this.t.follow(it);
    return it;
  },
  
/**
 * 绑定连接器
 * 连接器接口为
  <pre>
  function(config){
    //终止当前连接
    abort : fGo,
    //订阅连接事件
    to : fGo(subscribe),
    //连接
    connect : fGo
  }
  </pre>
 * @private
 * @return {String} connectorKey
 */
  bindConnector : function(cfg){
    var a = this.createConnector(cfg);
    
    // 加入队列
    var connectorKey = this.syncQueue.join(a);

    if(this.subscribe)
      a.to(this.t);

    // 应用url模板 , 确保不覆盖原有ajaxCfg url
    a.url = CC.templ(this.t, cfg.url);
    a.connect();
    
    return connectorKey;
  },
  
/**
 * 创建并返回连接器
 * @private
 */
  createConnector : function(cfg){
     return new CC.Ajax(cfg);
  },

  onConnectorsFinish : function(j){
    this.t.fire('connection:connectorsfinish', this, j);
    if(!this.indicatorDisabled)
      this.getIndicator().stopIndicator();
  },
  
  onConnectorFirstOpen   : function(j){
    this.t.fire('connection:connectorsopen', this, j);
    if(!this.indicatorDisabled)
      this.getIndicator().markIndicator();
  }
});


/**
 * 获得容器连接器.
 * 如果未指定容器的连接器,可通过传过参数cls指定连接器类,
 * 用于实例化的连接器类搜寻过程为 cls -> ct.connectionCls -> CC.util.ConnectionProvider;
 * 连接器配置信息可存放在ct.connectionProvider中, 连接器实例化后将移除该属性;
 * 生成连接器后可直接通过ct.connectionProvider访问连接器;
 * @param {CC.util.ConnectionProvider} [config] 使用指定连接器类初始化
 * @member CC.ui.ContainerBase
 * @method getConnectionProvider
 */
 /**
  * @class CC.ui.ContainerBase
  */
  
 /**
 * @event connection:defdataload
 * 由{@link CC.util.ConnectionProvider}提供,
 * 数据成功返回后，进行默认的数据处理前发送，
 * 返回false取消默认处理
 * @param {CC.Ajax} j
 * @param {CC.util.ConnectionProvider} connectionProvider
 */ 

/**
 * @event connection:connectorsopen
 * @param {CC.util.ConnectionProvider} current
 * @param {Object|CC.Ajax} connector
 * 由{@link CC.util.ConnectionProvider} 批量请求开始时发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */
 
/**
 * @event connection:connectorsfinish
 * @param {CC.util.ConnectionProvider} current
 * @param {Object|CC.Ajax} connector
 * 由{@link CC.util.ConnectionProvider} 批量请求结束后发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */
﻿/**
 * @class CC.util.SelectionProvider
 * 为容器提供子项选择功能,子项是否选择的检测是一个 -- 由子项样式状态作向导的实时检测.
 * @extends CC.util.ProviderBase
 */
CC.util.ProviderFactory.create('Selection', null, function(father){

  var Event = CC.Event;

  var trackerOpt = { isValid :  function (item){
    return !item.hidden && !item.disabled;
  }};

  return {
/**
 * @cfg {Number} mode 当前选择模式(1单选,0多选),默认单选
 */
  mode : 1,
/**@cfg {Boolean} tracker 是否应用选择跟踪器*/
  tracker : false,
  
/**@cfg {Number} UP 定义"向上"的按键值*/
  UP : Event.UP,
  
/**@cfg {Number} DOWN 定义"向下"的按键值*/
  DOWN : Event.DOWN,
  
/**@cfg {Number} selectedIndex 当前选择项下标*/
  selectedIndex : -1,
/**
 * @cfg {Boolean} autoscroll 子项选择后是否滚动到容器可视范围内,默认为true
 */
  autoscroll : true,
  
/**
 * @cfg {Boolean} autoFocus 选择后是否聚焦,默认为true
 */
 autoFocus : true,
/**
 * @cfg {String} selectedCS=selected 子项选择时子项样式
 */
  selectedCS: 'selected',
/**
 * @property selected
 * 当前选择项,如果多选模式,最后一个被选中选项.
 * @type {CC.Base}
 */
 
/**
 * @property previous
 * 上一选择项
 * @type {CC.Base}
 */
 
/**
 * @cfg {Boolean} unselectable 是否允许选择
 */
  unselectable : false,

  initialize : function(){
    father.initialize.apply(this, arguments);
    if(this.tracker === true)
      this.tracker = new CC.util.Tracker(trackerOpt);
  },
/**
 * mode可选,1 | 0,设置时将清除现有选择
 */
 setMode : function(m){
  this.selectAll(false);
  this.mode = m;
  return this;
 },

 setTarget : function(ct){
  
  if(ct.keyEvent === undefined)
      ct.bindKeyInstaller();
      
  father.setTarget.apply(this, arguments);
  
  ct.on('itemclick', this.itemSelectionTrigger, this)
    .on('keydown',   this.navigateKey, this)
    .on('remove',   this.onItemRemoved, this);
  
  if(this.selected !== undefined){
    var t = this.selected;
    delete this.selected;
    this.select(t);
  }
 },
/**
 * @param {CC.Base} item
 * @param {Boolean} selectOrNot
 * @param {Boolean} cancelscroll
 */
 setSelected : function(item, b, cancelscroll, e){
  if(b)
    this.select(item, cancelscroll, e);
  else this.unselect(item);

  return this;
 },

/*@private**/
 itemSelectionTrigger : function(it, e){
  //TODO:|| !Event.isLeftClick(e)
  // 在IE下,即使是左击,但event.button还是为0,很奇怪
  if(!this.unselectable){
    //this.decorateSelected(it, !this.isSelected(it));
    if(this.mode)
      this.select(it, false, e);
    else this.setSelected(it, !this.isSelected(it), false, e);
  }
 },

/**
 * 当子项移除时提示选择器更新状态
 * @private
 **/
 onItemRemoved : function(item){
  if(item === this.selected){
    this.decorateSelected(item, false);
    this.select(null);
  }else if(item === this.previous)
    this.previous = null;

  if(this.tracker)
    this.tracker.remove(item);
 },

/**
 * 重载该方法可以定义按键导航
 * @private
 */
 navigateKey : function(e){
   var kc = e.keyCode;
   if (kc === this.UP) {
    this.pre();
    Event.stop(e);
   } else if (kc === this.DOWN) {
    this.next();
    Event.stop(e);
   } else return this.defKeyNav(e);
 },

/**@private*/
 defKeyNav : fGo,

/**
 * 获得容器当前选区, 该操作会重新检测当前选择项
 * @return {Array}
 */
 getSelection : function(){
  var s = this, sn = [];
  s.t.each(function(){
    if(s.isSelected(this)){
      sn.push(this);
    }
  });
  return sn;
 },

/**
 * 修饰选择时子项外观CSS, 重写该方法以自定子项选择时修饰方
 * @param {CC.Base} item
 * @param {Boolean} b
 */
 decorateSelected : function(item, b){
  var s = this.selectedCS;
  if(s)
  	item.checkClass(s, b);
 },

/**
 * 选择某子项
 * @param {CC.Base} item
 * @param {Boolean} cancelscroll
 */
 select : function(item, cancelscroll, e){

  if(this.unselectable || this.disabled)
    return this;

  var t = this.t;

  if(!t.rendered){
    t.on('rendered', function(){
      t.selectionProvider.select(item);
    });
    return this;
  }

  item = this.t.$(item);

  // select none
  if(!item)
    return this.selectAll(false);

  if(item.disabled)
    return this;


/**
 * @cfg {Boolean} forceSelect 是否强制发送select事件,即使当前子项已被选中.<br>
 * 默认是当某项选中后,再次选择并不触发selected事件,可强制设定即使已选时是否发送.
 */
  if((this.forceSelect || !this.isSelected(item))
      && this.t.fire('select', item, this, e) !== false){
    this.onSelectChanged(item, true, e);
    this.onSelect(item, cancelscroll ,e);
    this.t.fire('selected', item, this, e);
  }
  return this;
 },

 unselect : function(item){
  item = this.t.$(item);
  this.onSelectChanged(item, false);
  return this;
 },

 onSelect : function(item, cancelscroll) {
  if(this.autoFocus)
   this.t.wrapper.focus();

  if(!cancelscroll && this.autoscroll)
      item.scrollIntoView(this.t.getScrollor());
  item.onselect && item.onselect();
 },
 
/**@private*/
 onSelectChanged : function(item , b){
  if(!this.hasChanged(item, b))
    return;

  var s = this.selected,
      pre = this.previous;

  if(item)
    this.decorateSelected(item, b);

  if(this.mode){
    if(b){
      if(s)
        this.decorateSelected(s, false);
      this.previous = s;
      this.selected = item;
      this.selectedIndex = this.t.indexOf(item);
    }else if(item === s){
      this.selected = null;
      this.selectedIndex = -1;
    }
  }
  else {
    if(b){
      this.previous = s;
      this.selected = item;
    }else if(s === item){
      // -> unselect
      // selected -> unselect,
      this.previous = null;
      this.selected = pre;
    }else if(item === pre && pre){
      //unselect pre
      this.previous = null;
    }
  }

  if(this.tracker && s && b)
    this.tracker.track(s);

  this.t.fire('selectchange', item, s, this);
  if(__debug){  console.group("selectchanged data"); console.log('当前选择:',this.selected);console.log('前一个选择:',this.previous); console.groupEnd();}
 },

/**
 * 测试选择项状态是否改变
 * @private
 */
 hasChanged : function(item, b){
  return !((item === this.selected) && b) || !(item && this.isSelected(item) === b);
 },

/**
 * 测试某子项是否已被选择，两个条件：非隐藏状态和具备selectedCS样式。
 * @param item
 * @return {Boolean}
 */
 isSelected : function(item){
  return !item.hidden && item.hasClass(this.selectedCS);
 },

/**
 * 容器是否可选择.
 * @return {Boolean}
 */
 isSelectable : function(){
  return !this.unselectable;
 },
/**
 * 设置容器是否可选择
 */
 setSelectable : function(b){
  this.unselectable = !b;
 },

/**
 * 检测item是否能作为下一个选择项.
 * @param {CC.Base} item
 * @return {Boolean}
 */
 canNext : function(item){
  return !item.disabled && !item.hidden;
 },

/**
 * 检测item是否能作为上一个选择项
 * @param {CC.Base} item
 * @return {Boolean}
 */
 canPre : function(item){
  return !item.disabled && !item.hidden;
 },

 /**
  * @private
  * 获得当前用于计算下|上一选项的下标,默认返回当前选项项selectedIndex
  */
 getStartIndex : function(){
  return this.selectedIndex;
 },

 /**
  * 获得下一个可选择项,如无可选择项,返回null
  * @return {CC.Base} item 下一个可选择项
  */
 getNext : function(){
  var idx = this.getStartIndex() + 1,
      cs  = this.t.children,
      len = cs.length;

  while (idx <= len - 1 && !this.canNext(cs[idx])) idx++;

  if (idx >= 0 && idx <= len - 1) {
    return cs[idx];
  }
  return null;
 },

 /**
  * 获得上一个可选择项,如无可选择项,返回null
  * @return {CC.Base} item 上一个可选择项
  */
 getPre : function(){
  var idx = this.getStartIndex() - 1,
      cs  = this.t.children,
      len = cs.length;

  while (idx >= 0 && !this.canPre(cs[idx])) idx--;

  if (idx >= 0 && idx <= len - 1) {
    return cs[idx];
  }
  return null;
 },

/**
 * 选择并返回下一项,如无返回null
 */
 next : function(){
  var n = this.getNext();
  if(n)
    this.select(n);
  return n;
 },

/**
 * 选择并返回前一项,如无返回null
 */
 pre : function(){
  var n = this.getPre();
  if(n)
    this.select(n);
  return n;
 },

/**@private*/
 selectAllInner : function(b){
  var s = this;
  this.t.each(function(){
    s.setSelected(this, b, true);
  });
 },

/**
 * 全选/全不选
 * @param {Boolean}
 */
 selectAll : function(b){
  if(this.mode && !b){
    if(this.selected)
      this.unselect(this.selected);

    return this;
  }
  this.selectAllInner(b);
  return this;
 },

/**
 * 反选
 */
 selectOpp : function() {
  var s = this;
  this.t.each(function(){
    s.setSelected(this, !s.isSelected(this), false);
  });
 }

 }
});

/**@class CC.Base*/
/**
 * @cfg {Function} onselect 该属性由{@link CC.util.SelectionProvider}类处理,当项选中时,调用本方法.
 * @member CC.Base
 */
 
/**
 * @class CC.ui.ContainerBase
 */
/**
 * 该属性由{@link CC.util.SelectionProvider}类提供，选择变更时发出,包括空选择.
 * @event selectchange
 * @param {CC.Base} item
 * @param {CC.Base}  previous
 * @param {CC.util.SelectionProvider} provider
 */
 
/**
 * @event select
 * 该属性由{@link CC.util.SelectionProvider}类提供，选择前发出,为空选时不发出
 * @param {CC.Base} item
 * @param {Boolean}  b
 */


/**
 * @event selected
 * 该属性由{@link CC.util.SelectionProvider}类提供，选择后发出,为空选时不发出
 * @param {CC.Base} item
 * @param {CC.util.SelectionProvider} selectionProvider
 * @param {DOMEvent} event 如果该选择事件由DOM事件触发,传递event
 */
﻿/**
 * @class CC.util.ValidationProvider
 * 为容器控件提供子项数据验证功能.
 * @extends CC.util.ProviderBase
 */
CC.util.ProviderFactory.create('Validation', null, {
  /**
   * @cfg {String} errorCS 验证失败时添加到子项样式
   */
  errorCS : 'g-form-error',
/**
 * @cfg {Boolean} focusOnError 验证失败时是否聚焦到子项,默认为true
 */
  focusOnError : true,
  
/**
 * 如果想定义子项数据出错时的修饰样式,可重写本方法.
 * @param {Boolean} isValid 验证结果
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 */
  decorateValidation : function(b, item, collector, type){
    if(item){
    	item.checkClass(item.errorCS || this.errorCS, !b);
    }
  },
/**
 * 接口,重写可实现自定义对子项的验证
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 */
  validator : fGo,
/**
 * 验证容器所有子项.
 * @param {Object} type 如果容器子项数据验证的类型有多种,传入type以自行识别,否则可忽略.
 */
  validateAll : function(type){
    var self = this, coll = [], r;
    this.each(function(){
      r = self.validate(this, coll, type);
      if(r !== true) {
        if(coll.length === 1 && self.focusOnError){
          // capture focus when error
          try {this.focus();}catch(e){}
        }
        //break if null
        if(r === null)
          return false;
      }
    });
    return coll.length ? coll : true;
  },

/**
 * @event validation:start
 * 事件由验证器{@link CC.util.ValidationProvider}提供,在验证容器某个子项数据开始时发送.事件返回false将中断往下验证.
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 * @member CC.ui.ContainerBase
 */
 
/**
 * @event validation:failed
 * 事件由验证器{@link CC.util.ValidationProvider}提供,当容器某个子项数据验证失败时发送.
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 * @member CC.ui.ContainerBase
 */
 
/**
 * 单独验证指定子项数据. 
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略.
 * @return {Boolean} true or false
 */
  validate : function(item, collector, type){

    if(!collector)
      collector = [];

    var r;
    
    r = this.validator(item, collector, type);
    
    if(this.t.fire('validation:start', item, collector, type) === false){
      r = null;
    }
    
    if(collector.length > 0){
      if(r !== null)
        r = false;
    }else { r = true; }
    
    this.notifyValidation(!!r, item, collector, type);
    return r;
  },
  
/**
 * 通知Listener某个子项信息验证是否成功,可以手动验证后,调用该方法通知Listener验证结果.
 * @param {Boolean} isValid
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 * @return this
 */
  notifyValidation : function(isvalid, item, collector, type){
    this.decorateValidation(isvalid, item, collector, type);
    this.t.fire(
      isvalid ? 'validation:success':'validation:failed', 
      item, 
      collector, 
      type, 
      this
    );
    return this;
  },
  
/**
 * 验证是否<b>不</b>正确,将调用{@link #validate}方法验证,并收集出错信息.
 * @param {CC.Base} item 容器子项
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 * @return {Array|Boolean} 未通过验证返回消息数组,通过返回false
 */
  isInvalid :function(item, type){
    var res = [], ret;
    ret = this.validate(item,res, type);
    return ret === true?false:res;
  }
});
﻿/**
 * @class CC.util.StoreProvider
 * 提供容器子项数据存储(添加,修改,删除)功能.
 */
CC.util.ProviderFactory.create('Store', null, {
/**
 * @cfg {String} enableIndicator 是否允许指示器.
 */
  enableIndicator : true,
/**
 * @cfg {String} modifyUrl
 */
  modifyUrl : false,
/**
 * @cfg {String} addUrl
 */  
  addUrl  : false,
/**
 * @cfg {String} delUrl
 */  
  delUrl : false,
/**
 * @cfg {Boolean} updateIdOnAdd
 */  
  updateIdOnAdd : true,
  
/**
 * @cfg {Object} shareParams 每次更新都会提交的键值对数据.
 <pre><code>
  shareParams : {appName:'cicy'}
 </code></pre>
 */
  shareParams : false,
/**
 * @cfg {Boolean} setupUrlFromItem 每次提交前是否将子项数据影射到URL中,默认为true.
 */  
  setupUrlFromItem : true,
/**
 * @cfg {Boolean} submitModify 是否只提交已修改的数据，默认为true
 */
	submitModify : true,
	
/**
 * @cfg {Function} isResponseOk 可以重写该函数,以定义返回的数据是否正常.
 * @return {Boolean}
 */
  isResponseOk : function(ajax){
    return (CC.util.StoreProvider.isResponseOk && 
            CC.util.StoreProvider.isResponseOk(ajax))
           || true;
  },
  
/**
 * @private
 */
  mappingUrl : function(url, item){
    if(url){
      //query data from share object
      if(this.shareParams)
        url = CC.templ(this.shareParams, url, 2, true);
      // query data from item
      if(item && this.setupUrlFromItem)
        url = CC.templ(item, url, 2, true);
    }
    return url;
  },
  
  //
  getDelUrl : function(item){
    return this.mappingUrl(this.delUrl, item);
  },

  getDelQuery : function(item){
    var q = '';
    if(item){
    	q = this.itemQueryTempl || '';
      
      if(this.shareParams)
        q = CC.templ(this.shareParams, q, 2, true);
          
      // query data from item
      // query data from item
      if(q)
        q = CC.templ(item, q);
    }
          //query data from share object
    if(this.shareParams){
     if(q){
       q += '&';
     }
     q += CC.queryString(this.shareParams);
    }
    return q;
  },
 
  getSaveUrl : function(item, isNew){
    return this.mappingUrl(isNew?this.addUrl:this.modifyUrl, item);
  },
/**
 * @cfg {Function} onSaveFail
 */
  onSaveFail : fGo,

  beforeDel : function(item){
    return this.t.getValidationProvider().isInvalid(item, 'del')===false;
  },
/**
 * 删除某子项.
 * @param {CC.Base} item
 */  
  del : function(item){
    if(item && this.isNew(item)){
      item.pCt.remove(item);
      item.destory();
    }else if(this.beforeDel(item) !== false 
      && this.t.fire('store:beforedel', item, this) !== false){
      this.onDel(item);
    }
    return this;
  },
  
  
  
/**
 * 
 */  
  delAll : function(){
    var self = this;
    this.each(function(){
      self.del(this);
    });
  },
/**
 * 
 */
  delSelection : function(){
    var self = this;
    CC.each(this.t.getSelectionProvider().getSelection(), function(){
      self.del(this);
    });
  },

  onDel : function(item){
    this.t.getConnectionProvider().connect(this.getDelUrl(item), {
      method : 'POST',
      data : this.getDelQuery(item),
      caller : this,
      success:function(j){
        if(this.isResponseOk(j)) {
          this.afterDel(item);
          this.t.fire('store:afterdel', item, j, this);
        }else j.failure.call(j.caller, j);
      },
    
      failure : function(j){
        this.onDelFail(item, j);
        this.t.fire('store:delfail', item, j, this);
      }
    });
  },
/**@cfg {Function} onDelFail */
  onDelFail : fGo,

  afterDel : function(item){
    if(item){
      item.pCt.remove(item);
      item.destory();
    }
  },
/**
 * @param {CC.Base} item
 */
  save : function(item){
    var isNew = this.isNew(item),
        isMd  = this.isModified(item);
    if(isMd){    	
      if(this.beforeSave( item, isNew)!== false && 
           this.t.fire('store:beforesave', item, isNew, this)!==false){
        this.onSave(item, isNew);
     }
    }
    return this;
  },

/**
 * 过滤未修改过的
 * @override
 */
	each : function(cb){
		var self = this;
		if(this.filterChanged){
			this.t.each(function(){
				if(self.isNew(this) || self.isModified(this)){
					cb.apply(this, arguments);
				}
			});
		}else CC.util.StoreProvider.prototype.each.apply(this, arguments);
	},
	
/**
 * 
 */
  saveAll : function(uncheck){
  	if(!uncheck){
  		if(this.t.getValidationProvider().validateAll() !== true)
  			return this;
  	}
    var self = this;
    this.each(function(){
      self.save(this, true);
    });
    
    return this;
  },
/**
 * @param {Object} itemOption
 * @param {Boolean} scrollIntoView
 * @return {CC.ui.Item}
 */
  createNew : function(itemOption, scrollIntoView){
    var item = this.t.instanceItem(itemOption);
    this.decorateNew(item, true);
    (this.t.layout||this.t).add(item);
    if(scrollIntoView) {
      item.scrollIntoView( this.t.getScrollor() );
    }
    return item;
  },
  
  beforeSave : function(item, isNew){
    return this.t.getValidationProvider().isInvalid(item, 'save')===false;
  },

  onSave : function(item, isNew){
      this.t.getConnectionProvider().connect(this.getSaveUrl(item, isNew),{
        method : 'POST',
        caller : this,
        data : this.queryString(item, this.shareParams),
        success:function(j){
          if(this.isResponseOk(j)) {
            this.decorateModified(item, false);
            
            if(isNew)
              this.decorateNew(item, false);
            
            this.afterSave(item, isNew, j);
            this.t.fire('store:aftersave', item, isNew, j, this);
          }else j.failure.call(j.caller, j);
        },
        
        failure : function(j){
          this.onSaveFail(item, isNew, j);
          this.t.fire('store:savefail', item, isNew, j, this);
        }
      });
      
  },
  
/**
 * @cfg {Boolean} updateIdOnAdd 默认为true
 */
  afterSave  : function(item, isNew, ajax){
    if(isNew && this.updateIdOnAdd)
      item.id = this.getCreationId(ajax);
  },
/**
 * param {CC.Ajax} ajax
 */
  getCreationId : function(ajax){
    return (ajax.getText()||'').trim();
  },
  
  decorateNew : function(item, b){
    if(item)
      item.newed = b;
    return this;
  },

  decorateModified : function(item, b){
    if(item)
      item.modified = b;
    return this;
  },

/**
 * @param {CC.Base} item
 * @return {Boolean}
 */
  isModified : function(item){
    return item ? item.modified : false;
  },
/**
 * 容器数据是否被修改过.
 * @return {Boolean} 
 */
  isModifiedAll : function(){
  	var self = this, md = false;
  	this.each(function(){
  	  if(self.isModified(this)){
  	  	md = true;
  	  	return false;
  	  }
  	});
  	return md;
  },
  
/**
 * @param {CC.Base} item
 * @return {Boolean}  
 */
  isNew : function(item){
    return item ? item.newed : false;
  },

  itemQueryTempl : false,
/**
 * @cfg  {String} itemQueryTempl
 */ 
 
/**
 * @param {CC.Base} item
 * @return String
 */
  queryString : function(item, params){
    var q = '';
    if(item){
    	q = this.itemQueryTempl || '';
      //query data from share object
      if(params)
        q = CC.templ(params, q, 2, true);
      
      // query data from item
      if(q)
        q = CC.templ(item, q, 2, true);
       
      q = this.getItemQuery(item, q);
    }
    if(params){
       if(q)
         q += '&';
         
       q += CC.queryString(params);
    }
    return q;
  },
  
/**
 * 如果自定义子项的提交参数内容,可重写该方法
 * @param {CC.Base}
 * @param {String} itemQueryTemplateString
 * @return {String}
 */
  getItemQuery : fGo
});
﻿/**
 * @class CC.util.Validators
 */
CC.util.Validators = {
/***/
  NoEmpty : function(v){
    if(!v || v.trim() == ''){
      return '该项不能为空'
    }
    return true;
  },
/***/
  Mail : function(v){
    return !CC.isMail(v)?'邮箱格式不正确':true;
  }
};
(function(){
  
var E = CC.Event,
    G = CC.util.dd.Mgr;
/**
 * @class CC.util.dd.AbstractCtMonitor
 * 为容器提供方便子项拖放的功能.
 * 只需要往容器绑定一次,不必为每个子项绑定拖放事件.
 */  
CC.create('CC.util.dd.AbstractCtMonitor', null, {
  
  initialize : function(cfg){
    if(cfg) CC.extend(this, cfg);
    
    var zoom = this.zoom;
    
    if(!zoom)
      zoom =  {ctype:'ctzoom'};
     
    if(zoom.ctype !== undefined)
       zoom = this.zoom = CC.ui.instance(zoom);
    
    if(this.pZoom){
      this.pZoom.add(zoom);
    }
  },
  
/**
 * @cfg {String} trigger 触发drag DOM元素ID,默认为'_dragger'
 */
  trigger : '_dragger',

/**
 * @cfg {String} dragCS 拖动中源控件样式
 */
  dragCS : false,
/***/
  indicator : false,
/***/
  mgrIndicator : true,
  
/**
 * trigger按下时,寻找trigger所在的子项作为拖放源.
 * @private
 */
  beforedrag : function(e){
    // 查看是否为子项发出
    var el = E.element(e);
    
    if(el.id !== this.trigger) 
      return false;
    
    // 将drag source设为当前子项
    G.setSource(this.ct.$(el));
    E.stop(e);
  },
/**
 * 拖放开始时,获得可视范围内的子控件作为区域项,更新区域矩形数据.
 * @private
 */
  dragstart : function(e , source){
    //
    //  组建当前的dragzoom为表可见列
    //
    G.setZoom(this.pZoom||this.zoom, true);

    if(this.dragCS)
      source.addClass(this.dragCS);
      
    if(this.mgrIndicator) {
      G.getIndicator().prepare();
    }
  },
/**
 * 如果未设置showTo,showTo到document.body
 * @private
 * @protected
 */
  getIndicator : function(){
    
    var idt = this.indicator;
    
    if(idt && !idt.cacheId){
      if(!idt.showTo)
        idt.showTo = document.body;
      this.indicator = idt = CC.ui.instance(idt);
    }
    
    return idt;
  },
  
  drag : function(){
    if(this.mgrIndicator)
      G.getIndicator().reanchor();
  },
  
  dragend : function(e, source){

    if(this.indicator) 
      this.getIndicator().hide();
      
    if(this.dragCS)
      source.delClass(this.dragCS);
      
    if(this.mgrIndicator)
      G.getIndicator().end();
  },
  sbover:fGo,
  sbout:fGo,
  sbdrop:fGo,
  afterdrag:fGo
});
})();
/**
 * @class CC.util.DataTranslator
 * UI容器只加载符合一定格式的子项数据，这个格式为{title:'...'}，在通过情况下，数据从后台加载进来，并不是UI容器可接受的格式类型，
 * 些时可运用本类将特定类型的数据数组转换成适合UI加载的数据数组。
 * 例如，可将一单纯数组数据['a', 'b', 'c']，转换为[{title:'a'}, {title:'b'}, {title:'c'}]。
 * 在容器的connectionProvider里设置reader属性指明运用的转换器即可，不必手动处理.
 <pre><code>
    // 原生容器适用数据，不用转换，可直接通过fromArray载入
    var rawUIData = [
      {array:[{title:'原生'}, {title:'原生'}, {title:'原生'}, {title:'原生'}]},
      {array:[{title:'原生'}, {title:'原生'}, {title:'原生'}, {title:'原生'}]}
    ];
    // 原始数组数据
    var arrayStream = [
      ['a', 'b', 'c', 'e'],
      ['f', 'g', 'h', 'i'],
      ['j', 'k', 'l', 'm'],
      ['o', 'p', 'q', 'r']
    ];
    
    // 原始记录映射数据
    var mappedStream = [
      ['id' , 'second',   ['first','value'], 'third' ,'fourth'],
      ['row12345a' , '2', ['1','aaa'], '3', '4'],
      ['row12345b' , '2', ['1','bbb'], '3', '4'],
      ['row12345c' , '2', ['1','bbb'], '3', '4'],
      ['row13423d' , '2', ['1','bbb'], '3', '4']
    ];
    
    
    CC.ready(function(){
      var grid = new CC.ui.Grid({
       header:
        {
         array:[
          {title:'第一列', id:'first'},
          {title:'第二列', id:'second'},
          {title:'第三列', id:'third'},
          {title:'第四列', id:'fourth'}
         ]
       },
       content : {altCS:'alt-row'}
      });
    
      var win = new CC.ui.Win({
        title:'自定义数据转换成UI可载入已格式化的数据',
        showTo:document.body,
        layout:'card',
        items:[grid]
      });
      
      win.render();
      win.center();
      // 原生容器适用数据，不用转换，可直接通过fromArray载入
      grid.content.fromArray(rawUIData);
      
      // 特定格式的数据经转换后读入到表
      var arrayDataAfterTrans = CC.util.DataTranslator.get('gridarraytranslator').read(arrayStream);
      grid.content.fromArray(arrayDataAfterTrans);
    
      var mappedDataAfterTrans = CC.util.DataTranslator.get('gridmaptranslator').read(mappedStream, grid.content);
      console.log(mappedDataAfterTrans);
      grid.content.fromArray(mappedDataAfterTrans);
 </code></pre>

 */
CC.util.DataTranslator = {
  // private
  trans : {
    array : {
      /**
       * 注意:本方法会直接往传入的items里更新数据。
       */
      read : function(items, ct){
        for(var i=0,len=items.length;i<len;i++){
          items[i] = {title:items[i]};
        }
        return items;
      }
    },

/**
 * 数据格式为
   ['col a',  'col b', ['col c','cell_data',...], 'row_attribute', ...],
   ['data a', '..',    ['title', '...', '...'],    '..']
 */
    gridmaptranslator : {
       read : function(rows, ct){
         var cols = ct.grid.header.children,
             idxMap = {}, 
             dataIdx = 0, i, len;  
         
         for(i=0,len=cols.length;i<len;i++){
           if(cols[i].dataCol){
             idxMap[cols[i].id] = dataIdx;
             dataIdx++;
           }
         }
         
         var def = rows.shift(), newRows = [], k;
         
         if(def){
           for(i=0,len=def.length;i<len;i++){
             k = def[i];
             // [a, b, [key, v1, v2]]
             if(CC.isArray(k)){
               k[0] = idxMap[k[0]];
               k._isa = true;
             }
             else if(idxMap[k] !== undefined){
               // if index found
               // key -> index
               def[i] = idxMap[k];
             }
           }
  
           // maybe def status:['id', 3, 0, 2, 1]
           var len2, 
               row, 
               isIdx, 
               colIdx,
               arr, j, len3, cell;
  
           for(i=0;i<len;i++){
             colIdx = def[i];
             isIdx = typeof colIdx === 'number';
             for(var k=0,len2=rows.length;k<len2;k++){
               row = newRows[k];
               
               if(!row)
                  row = newRows[k] = {array:[]};
               
               if(isIdx) {
                 row.array[colIdx] = {title:rows[k][i]};
               }else if(colIdx._isa){
                 arr = rows[k][i];
                 cell = row.array[colIdx[0]] = {title:arr[0]};
                 for(j=1,len3=arr.length;j<len3;j++)
                   cell[colIdx[j]] = arr[j];
               }else {
                 // row attributes
                 row[colIdx] = rows[k][i];
               }
             }
           }
         }
         return newRows;
       }
    },

    gridarraytranslator : {
      read : function(rows){
        var arr = CC.util.DataTranslator.get('array');
        for(var i=0,len=rows.length;i<len;i++){
          rows[i] = {array:arr.read(rows[i])};
        }
        return rows;
      }
    }
  },
  
  reg : function(key, trans){
    this.trans[key] = trans;
    return this;
  },
  
  get : function(key){
    return this.trans[key];
  }
};
﻿  /**
   * @class CC.layout.BorderLayout
   * 东南西北中布局, 与Java swing中的BorderLayout具有相同效果.
 <pre><code>
		CC.ready(function(){
			var win = new CC.ui.Win({
				layout:'border',
				lyCfg : {
					items : [
					 {ctype:'panel', height:40, lyInf:{split:true, dir:'north', collapsed:true}},
					 {ctype:'panel', height:40, lyInf:{split:true, dir:'south'}},
					 {ctype:'panel', width:125, lyInf:{split:true, dir:'east',autoCollapseWidth:80,collapsed: false}},
					 {ctype:'panel', width:125, lyInf:{split:true, dir:'west',collapsed: true}, maxW:300},
					 {ctype:'panel', lyInf:{dir:'center'}}
					]
				},
				showTo:document.body
			});
          win.render();
          win.center();
		});
 </code></pre>

   * @extends CC.layout.Layout
   */
(function(){
  var CC = window.CC,
      tpx = CC.Tpl,
      uix = CC.ui,
      ccx = uix.ContainerBase,
      superclass = CC.layout.Layout.prototype,
      Math = window.Math,
      G = CC.util.dd.Mgr,
      undefined;

  tpx.def('CC.ui.BorderLayoutSpliter' , '<div class="g-layout-split"></div>')
     .def('CCollapseBarH' , '<table cellspacing="0" cellpadding="0" border="0" class="g-layout-split"><tr><td class="cb-l"></td><td class="cb-c"><div class="expander" id="_expander"><a class="nav" id="_navblock" href="javascript:fGo()"></a></div></td><td class="cb-r"></td></tr></table>')
     .def('CCollapseBarV' , '<table cellspacing="0" cellpadding="0" border="0" class="g-layout-split"><tr><td class="cb-l"></td></tr><tr><td class="cb-c"><div class="expander" id="_expander"><a class="nav" id="_navblock" href="javascript:fGo()"></a></div></td></tr><tr><td class="cb-r"></td></tr></table>');
  uix.BorderLayoutSpliter = CC.create(CC.Base, function(spr) {

    //ghost 初始坐标
    var GIXY;

    return {

      type: 'CC.ui.BorderLayoutSpliter',

      ghostCS : 'g-layout-sp-ghost',

      initComponent: function() {
        this.ct = this.layout.ct.wrapper;
        if (this.dir == 'north' || this.dir == 'south')
          this.dxDisd = true;
        spr.initComponent.call(this);
        G.installDrag(this, true);
      },
/**
 * 计算拖动范围dx,dy
 * @private
 * @return {Array}
 * @ignore
 */
      getRestrict: function() {
        var ly = this.layout,
            wr = this.ct,
            max,
            min,
            dir  = this.dir,
            comp = ly[dir],
            op,
            cfg = comp.lyInf,
            lyv = ly.vgap,
            lyh = ly.hgap,
            vg  = cfg.gap == undefined ? lyv: cfg.gap,
            hg  = cfg.gap == undefined ? lyh: cfg.gap,
            cfg2,
            cbg = ly.cgap,
            cg,
            ch = wr.height,cw = wr.width;

        switch (dir) {
          case 'north':
            min = -1 * comp.height;
            max = ch + min - vg;
            op = ly.south;
            if (op) {
              cfg2 = op.lyInf;
              if(cfg2.cbar && !cfg2.cbar.hidden){
                cg = cfg2.cgap === undefined ? cbg: cfg2.cgap;
                max -= cg;
              }
              if(!op.hidden && !op.contexted)
                max -= op.height + (cfg2.gap == undefined ? lyv: cfg2.gap);
            }

            if(max>comp.maxH-comp.height)
              max = comp.maxH - comp.height;
            if(Math.abs(min)>comp.height - comp.minH)
              min = -1*(comp.height - comp.minH);
            break;
          case 'south':
            max = comp.height;
            min = -1 * ch + max + vg;
            op = ly.north;
            if (op) {
              cfg2 = op.lyInf;
              if(cfg2.cbar && !cfg2.cbar.hidden){
                cg = cfg2.cgap === undefined ? cbg: cfg2.cgap;
                min += cg;
              }

              if(!op.hidden && !op.contexted)
                min += op.height + (cfg2.gap == undefined ? lyv: cfg2.gap);
            }

            if(max>comp.height - comp.minH)
              max = comp.height - comp.minH;
            if(Math.abs(min)>comp.maxH-comp.height)
              min = -1*(comp.maxH-comp.height);
            break;
          case 'west':
            min = -1 * comp.width;
            max = cw + min - hg;
            op = ly.east;
            if (op) {
              cfg2 = op.lyInf;
              if(cfg2.cbar && !cfg2.cbar.hidden){
                cg = cfg2.cgap === undefined ? cbg: cfg2.cgap;
                max -= cg;
              }
              if(!op.hidden && !op.contexted)
                max -= op.width + (cfg2.gap == undefined ? lyh: cfg2.gap);
            }

            if(max > comp.maxW - comp.width)
              max = comp.maxW - comp.width;
            if(Math.abs(min)>comp.width - comp.minW)
              min = -1*(comp.width - comp.minW);
            break;
          case 'east':
            max = comp.width;
            min = -1 * cw + max + hg;
            op = ly.west;
            if (op) {
              cfg2 = op.lyInf;

              if(cfg2.cbar && !cfg2.cbar.hidden){
                cg = cfg2.cgap === undefined ? cbg: cfg2.cgap;
                min += cg;
              }

              if(!op.hidden && !op.contexted)
                min += op.width + (cfg2.gap === undefined ? lyh: cfg2.gap);
            }
            if(max > comp.width - comp.minW)
              max = comp.width - comp.minW;
            if(Math.abs(min)>comp.maxW - comp.width)
              min = -1*(comp.maxW - comp.width);
            break;
        }
        return dir === 'west' || dir === 'east' ?
               [max, min, 0, 0] : [0,0,max,min]
      },
/**
 * @private
 */
      applyGhost : function(b){
        var g = this.splitGhost;
        if(!g){
          g = this.splitGhost =
               this.$$(CC.$C({tagName:'DIV', className:this.ghostCS}));
        }
        if(b){
          this.copyViewport(g);
          GIXY = [g.left, g.top];
          g.appendTo(this.ct);
        }else{
          g.del();
        }
        return g;
      },

      beforedrag : function(){
        this.applyGhost(true);
        G.setBounds(this.getRestrict());
        G.resizeHelper.applyMasker(true);
        G.resizeHelper.masker.fastStyleSet('cursor', this.fastStyle('cursor'));
      },

      drag : function(){
        var d = G.getDXY(),i = G.getIEXY();
        this.dxDisd ?
          this.splitGhost.setTop(GIXY[1]+d[1]) :
          this.splitGhost.setLeft(GIXY[0]+d[0]);
      },

      dragend: function() {
        var c   = this.layout[this.dir],
            wr  = this.ct,
            dxy = G.getDXY(),
            cfg = c.lyInf,
            k;
        k = this.dxDisd ? this.dir === 'north' ? c.height + dxy[1]: c.height - dxy[1] :
                          this.dir === 'west'   ? c.width  + dxy[0]: c.width  - dxy[0];

        if(cfg.autoCollapseWidth !== false && k <= (cfg.autoCollapseWidth||40)){
           this.layout.collapse(c, true);
        }else {
          this.dxDisd ?
               c.setHeight(k) :
               c.setWidth(k);
          this.layout.doLayout();
        }
      },

      afterdrag :  function(){
        this.applyGhost(false);
        G.resizeHelper.applyMasker(false);
        G.resizeHelper.masker.fastStyleSet('cursor', '');
      }
    };
  });

  uix.BorderLayoutCollapseBar = CC.create(ccx,
   {

    type : 'CC.ui.BorderLayoutCollapseBar',

    hidden : true,

    innerCS:'g-layout-cbar',

    ct : '_expander',

    compContextedCS : 'g-layout-contexted',

    sliperCS : 'g-layout-sliper g-f1',

    navBlockCS : {
             east:'g-nav-block-l',west:'g-nav-block-r',
             south:'g-nav-block-u',north:'g-nav-block-d'
    },

    initComponent : function(){
      this.template =
        (this.dir === 'south' || this.dir === 'north') ?
          'CCollapseBarH' : 'CCollapseBarV';

      ccx.prototype.initComponent.call(this);

      if(this.dir === 'west' || this.dir === 'east')
        this.addClass(this.innerCS+'-v');

      this.centerExpander = this.dom('_expander');

      this.navBlock = this.dom('_navblock');

      CC.fly(this.navBlock)
        .addClass(this.navBlockCS[this.dir])
        .unfly();

      this.domEvent('mousedown', this.onBarClick, true)
          .domEvent('mousedown', this.onNavBlockClick, true, null, this.navBlock);

      this.sliperEl = CC.$C({tagName:'A', className:this.sliperCS,href:'javascript:fGo()'});
      this.comp.append(this.sliperEl);
      this.comp.domEvent('click', this.sliperAction, false, null, this.sliperEl);
    },

    destory : function(){
      this.centerExpander = null;
      this.navBlock = null;
      this.sliperEl = null;
      if(this.compShadow)
        this.compShadow.destory();
      ccx.prototype.destory.call(this);
    },

    sliperAction : function(){
      this.pCt.layout.collapse(this, true);
    },

    // 收缩按钮点击
    onNavBlockClick : function(){
      var c = this.comp;
      c.setXY(10000,10000);
      if(c.contexted)
        c.releaseContext();
      this.itsLayout.collapse(c, false);
    },

    // 使得面板浮动
    makeFloat : function(){
      var c = this.comp;
      c.addClass(this.compContextedCS)
       .show();

      this.setCompContextedBounds();

      var xy = c.absoluteXY();
      c.appendTo(document.body)
       .setXY(xy);

      if(c.collapse && c.collapsed)
        c.collapse(false);

      this.getShadow().attach(c).display(true);

      var cfg = c.lyInf;
      if(!cfg.cancelAutoHide){
        this.resetAutoHideTimer();
        cfg.autoHideTimer = this.onTimeout.bind(this).timeout(cfg.autoHideTimeout||5000);
      }
    },

    getShadow : function(){
      var sd = this.compShadow;
      if(!sd)
        sd = this.compShadow
           = uix.instance('shadow', {inpactH:9,inpactY:-2, inpactX : -4, inpactW:10});
      return sd;
    },

    onTimeout : function(){
      var c = this.comp;
      if(c.contexted)
        c.releaseContext();
      else this.unFloat();
      this.resetAutoHideTimer();
    },

    resetAutoHideTimer : function(){
      var cfg = this.comp.lyInf;
      if(cfg.autoHideTimer){
        clearTimeout(cfg.autoHideTimer);
        delete cfg.autoHideTimer;
      }
    },

    // 面板复原
    unFloat : function(){
      var c = this.comp,
          cfg = c.lyInf;

      if(cfg.autoHideTimer)
        this.resetAutoHideTimer();
      c.pCt._addNode(c.view);
      c.delClass(this.compContextedCS);
      this.getShadow().detach();
    },

    // 点击区域范围外时回调
    onCompReleaseContext : function(){
      var cfg = this.pCt.layout.cfgFrom(this);
      cfg.cbar.unFloat();
    },

    // 侧边栏点击
    onBarClick : function(){
      var c = this.comp;
      if(c.contexted)
        c.releaseContext();
      //callback,cancel, caller, childId, cssTarget, cssName
      else {
        c.bindContext(this.onCompReleaseContext, true, null, null, this.navBlock, this.navBlockCS[this.dir]+'-on');
        this.makeFloat();
      }
    },

    // 设置浮动面板浮动开始前位置与宽高
    setCompContextedBounds : function(){
      var c = this.comp, dir = this.dir;
      if(dir === 'west')
        c.setBounds(this.left+this.width+1, this.top, false, this.height);
      else if(dir === 'east')
        c.setBounds(this.left - c.width - 1, this.top, false, this.height);
      else if(dir === 'north')
        c.setBounds(this.left, this.top+this.height+1, this.width, false);
      else c.setBounds(this.left, this.top-c.height - 1, this.width, false);
    },

    setSize : function(){
      ccx.prototype.setSize.apply(this, arguments);
      var v;
      if(this.dir === 'north' || this.dir === 'south'){
        v = Math.max(0, this.width - 6)+'px';
        this.centerExpander.style.width = v;
        if(CC.ie)
          this.centerExpander.parentNode.style.width = v;
      }
      else{
        v =  Math.max(0, this.height - 6)+'px';
        this.centerExpander.style.height = v;
        if(CC.ie)
          this.centerExpander.parentNode.style.height = v;
      }
    }

  });

CC.create('CC.layout.BorderLayout', CC.layout.Layout,
  {
    /**
     * @cfg {Number} hgap 水平方向分隔条高度,利用面板布置设置可覆盖该值,默认5.
     */
    hgap: 5,
    /**
     * @cfg {Number} vgap  垂直方向分隔条高度,利用面板布置设置可覆盖该值,默认5.
     */
    vgap: 5,
    /**
     * @cfg {Number} cgap 侧边栏宽度,默认32.
     */
    cgap : 32,

    cpgap : 5,

    wrCS : 'g-borderlayout-ct',

    itemCS :'g-borderlayout-item',

    separatorVCS : 'g-ly-split-v',

    separatorHCS : 'g-ly-split-h',

    add: function(comp, dir) {

      superclass.add.call(this, comp, dir);

      var d, s;

      if(!dir)
        dir = comp.lyInf;

      d = dir.dir;
      s = dir.split;

      if(!d)
        d = 'center';

      this[d] = comp;

      if (s && d !== 'center') {
        var sp = dir.separator = new uix.BorderLayoutSpliter({
          dir: d,
          layout: this
        });

        sp.addClass(
          d === 'west' || d === 'east' ? this.separatorVCS:this.separatorHCS
        );

        sp.appendTo(this.ct.ct)
          .show();
      }

      comp.addClass(this.itemCS + '-' + (d||'center'));

      dir.collapsed === undefined ? this.doLayout() : this.collapse(comp, dir.collapsed);

      return this;
    },
/**
 * 获得收缩栏.
 * @return {CC.Base}
 */
    getCollapseBar : function(c){
      var cfg,
          cg,
          cbar,
          cfg = c.lyInf,
          cbar = cfg.cbar;

      if(!cbar && !cfg.noSidebar){
        cbar = cfg.cbar = new uix.BorderLayoutCollapseBar({dir:cfg.dir, comp:c, itsLayout:this, autoRender:true});
        cbar.addClass(cbar.innerCS+'-'+cfg.dir)
            .appendTo(this.ct.ct);
      }
      return cbar;
    },
/**
 * 收起或展开指定控件,如果控件存在collapse方法,也将调用该方法
 * @param {CC.Base} component
 * @param {Boolean} collapsedOrNot
 */
    collapse : function(comp, b){
      var cbar = this.getCollapseBar(comp),
          cfg = comp.lyInf;

      cfg.collapsed = b;
      if(cfg.separator)
        cfg.separator.display(!b);

      if(comp.collapse)
        comp.collapse(b);

      if(cbar)
        cbar.display(b);

      comp.display(!b);
      this.doLayout();
    },

    onLayout: function() {
      superclass.onLayout.call(this);
      var wr = this.ct.wrapper,
          w = wr.getWidth(true),
          h = wr.getHeight(true),
          l = 0,
          t = 0,
          c = this.north,
          dd, n, sp, vg = this.vgap,
          cbg = this.cgap,
          cpg = this.cpgap,
          dcpg = cpg+cpg,
          hg = this.hgap,
          cfg, cg, cb;

      if (c) {
        cfg = c.lyInf;
        cb = cfg.cbar;

        if(cb && !cb.hidden){
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          cb.setBounds(l+cpg,t+cpg,w-dcpg, cg - dcpg);
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          t += cg;
        }

        if(!c.hidden && !c.contexted){
          dd = c.getHeight(true);
          c.setBounds(l, t, w, c.height);
          t += dd;
          cg = cfg.gap === undefined ? vg: cfg.gap;
          sp = cfg.separator;
          if (sp) {
            sp.setBounds(l, t, w, cg);
          }
          t += cg;
        }
        if(c.contexted)
          c.releaseContext();
      }

      c = this.south;
      if (c) {
        cfg = c.lyInf;
        cb = cfg.cbar;
        if(cb && !cb.hidden){
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          h -= cg;
          cb.setBounds(l+cpg,h+cpg,w-dcpg, cg - dcpg);
        }

        if(!c.hidden && !c.contexted){
          dd = c.getHeight(true);
          h -= dd;
          c.setBounds(l, h, w, c.height);
          cg = cfg.gap === undefined ? vg: cfg.gap;
          sp = cfg.separator;
          h -= cg;
          if (sp) sp.setBounds(l, h, w, cg);
        }

        if(c.contexted)
          c.releaseContext();
      }
      h -= t;

      c = this.east;
      if (c) {
        cfg = c.lyInf;
        cb = cfg.cbar;

        if(cb && !cb.hidden){
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          w -= cg;
          cb.setBounds(w+cpg, t, cg - dcpg, h);
        }

        if(!c.hidden && !c.contexted){
          dd = c.getWidth(true);
          w -= dd;
          c.setBounds(w, t, c.width, h);
          sp = cfg.separator;
          cg = cfg.gap === undefined ? hg: cfg.gap;
          w -= cg;
          if (sp) sp.setBounds(w, t, cg, h);
        }
        if(c.contexted)
          c.releaseContext();
      }

      c = this.west;
      if (c) {
        cfg = c.lyInf;
        cb = cfg.cbar;
        if(cb && !cb.hidden){
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          cb.setBounds(l+cpg, t, cg - dcpg, h);

          l += cg;
          w -= cg;
        }

        if(!c.hidden && !c.contexted){
          dd = c.getWidth(true);
          c.setBounds(l, t, c.width, h);
          l += dd;
          cg = cfg.gap === undefined ? hg: cfg.gap;
          sp = cfg.separator;
          w -= dd + cg;
          if (sp) sp.setBounds(l, t, cg, h);
          l += cg;
        }
        if(c.contexted)
          c.releaseContext();
      }

      c = this.center;
      if (c) {
        c.setBounds(l, t, w, h);
      }
    },

    remove: function(c) {
      var cfg = c.lyInf;

      delete this[cfg.dir];

      var sp = cfg.separator;
      if (sp) {
        sp.destory();
        delete cfg.separator;
      }

      var cb = cfg.cbar;
      if(cb){
          cb.destory();
        delete cfg.cbar;
      }
      superclass.remove.apply(this, arguments);
    },

    detach : function(){
      var self = this;
      this.invalidated = true;
      CC.each(['east', 'south', 'west', 'north' , 'center'], function(){
        if(self[this])
          self.remove(self[this]);
      });
      superclass.detach.call(this);
    }
  });

 CC.layout.def('border', CC.layout.BorderLayout);

})();
﻿(function(){

var ly = CC.layout;
var B =  ly.Layout;
var superclass = B.prototype;
var Math = window.Math;
var Base = CC.Base;
/**
 * @class CC.layout.CardLayout
 * CardLayout,容器内所有子项宽高与容器一致.<br>
 <pre><code>
   new CC.ui.Win({
     // 使得子项iframepanel布满整个window客户区域.
     layout:'card',
     items : [
       {ctype :'iframe', src:'http://www.g.cn' }
     ]
   });
 </code></pre>
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.CardLayout', B, {
  wrCS : 'g-card-ly-ct',
  layoutChild : function(item){
    var sz = this.ct.wrapper.getContentSize(true);
    if(!item.rendered)
    	Base.prototype.setSize.apply(item, sz);
    else item.setSize(sz[0], sz[1]);
  }
});

ly.def('card', ly.CardLayout);
/**
 * @class CC.layout.QQLayout
 *  
 <pre><code>
 			var win = new CC.ui.Win({
				layout:'qq',
				title:'QQ布局管理器',
				width:190,
				height:450,
				itemCls:'titlepanel',
				lyCfg : {
					items : [
					 {ctype:'titlepanel',title:'我的好友', array:[
	  					{ctype:'folder',
	  					 selectionProvider : {mode:0},
	  					 array:[
				  			{title:'disabled item',icon:'iconRef',disabled:true},
								{title:'粉红色',icon:'iconUser'},
								{title:'蓝色',icon:'iconEdit'},
								{title:'清除记录',icon:'iconLeaf'},
								{title:'粉红色',icon:'iconTabs'},
								{title:'蓝色',icon:'iconUser'},
								{title:'清除记录',icon:'iconEdit'}
	  	         ]
	  				 }
	  			]},
					 {title:'陌生人'},
					 {title:'黑名单'}
					]
				},
				showTo:document.body
			});
      win.render();
      win.layout.collapse(win.$(0), false);
		});
 </code></pre>
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.QQLayout', B, {

    wrCS : 'g-card-ly-ct',

    beforeAdd : function(comp, cfg){
      comp.fastStyleSet('position', 'absolute')
          .setLeft(0);

      if(cfg && cfg.collapsed === false){
        comp.collapse(false);
        this.frontOne = comp;
      }else {
        comp.collapse(true);
      }
      superclass.beforeAdd.apply(this, arguments);
    },

    onLayout : function(){
      superclass.onLayout.apply(this, arguments);
      var c = this.frontOne,
          ct = this.ct,
          ch = ct.wrapper.height,
          cw = ct.wrapper.width,
          i, it, t,j,
          its = ct.children,
          len = ct.size();
      //由上而下
      for(i=0, t = 0;i<len;i++){
        it = its[i];

        if(it.hidden)
          continue;

        if(it == c)
          break;

        it.setBounds(false, t, cw, it.minH);
        ch -= it.height;
        t += it.height;
      }

      if(c)
        c.setTop(t);
      //由下而上
      for(j=len-1, t = ct.wrapper.height;j>i;j--){
        it = its[j];
        t -= it.minH;
        it.setBounds(false, t, cw, it.minH);
        ch -= it.height;
      }

      if(c)
        c.setSize(cw, ch);
    },
/**
 * @param {CC.Base} component
 * @param {Boolean} collapseOrNot
 */
    collapse : function(comp, b){
      var cfg = comp.lyInf,fr = this.frontOne;

      if(cfg.collapsed !== b){
        if(fr && fr !== comp){
          if(fr.collapse)
            fr.collapse(true);
          fr.lyInf.collapsed = true;
        }

        if(comp.collapse)
          comp.collapse(b);

        cfg.collapsed = b;
        this.frontOne = b?null:comp;
        this.doLayout();
        this.ct.fire('collapsed', comp, b);
      }
    }
});

ly.def('qq', ly.QQLayout);

/**
 * @class CC.layout.RowLayout
 * 行布局,该布局将对子控件宽度/高度进行布局,不干预控件坐标.
 * 控件配置方面:<div class="mdetail-params"><ul>
 * <li>auto : 自动宽高,不进行干预</li>
 * <li>具体宽/高 : 如50px</li>
 * <li>leading : 平分宽高</li></ul></div><br>
  <pre><code>
var win = new CC.ui.Win({
  showTo:document.body,
  layout:'row',
  lyCfg:{
    items:[
    {ctype:'base', template:'<div />', cs:'fix', css:'h:50', strHtml:'fixed height'},
    {ctype:'base', template:'<div />', cs:'lead',strHtml:'lead',lyInf:{h:'lead'}},
    ]
  }
});
win.render();
  </code></pre>
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.RowLayout', B, {
    wrCS : 'g-row-ly',
    onLayout: function() {
      var wr = this.ct.wrapper;
      var w = wr.getWidth(true),
      h = wr.getHeight(true),
      i,len, it, its = this.ct.children, cfg, ty = this.type, iv;
      //y direction
      var leH = [], leW = [];
      for(i=0,len=its.length;i<len;i++){
        it = its[i];
        if(it.hidden)
          continue;

        cfg = it.lyInf;
        switch(cfg.h){
          case 'auto' :
          case undefined :
            h-=it.getHeight();
            break;
          case 'lead' :
            leH[leH.length] = it;
            break;
          default :
            iv = cfg.h;
            if(CC.isNumber(iv)){
              if(iv>=1){
                it.setHeight(iv);
                //may be maxH reached.
                h-=it.height
              }else if(iv>=0){
                iv = Math.floor(iv*h);
                it.setHeight(iv);
                //may be maxH reached.
                h-=it.height;
              }
            }
        }
        var fw = cfg.w;
        if(fw === undefined){
          it.setWidth(w);
        }
        else if(fw < 1){
          it.setWidth(Math.floor(fw*w));
        }
       }

       for(i=0,len=leH.length;i<len;i++){
          it = leH[i];
          cfg = it.lyInf;
          iv = cfg.len;
          if(CC.isNumber(iv)){
              iv = Math.floor(iv*h);
              it.setHeight(iv);
              h-=it.height
          }else {
            iv = Math.floor(h/(len-i));
            it.setHeight(iv);
            h-=it.height;
          }
       }

      for(i=0,len=its.length;i<len;i++){
        it = its[i];
        if (!it.rendered) it.render();
      }
    }
});

ly.RowLayout.prototype.layoutChild = ly.RowLayout.prototype.onLayout;

ly.def('row', ly.RowLayout);

/**
 * @class CC.layout.TableLayout
 * 用HTML TABLE元素布局控件,主要用于表单设计中,
 * 布局信息用JSON表示,通过 lyCfg:{  items:  } 传入.
 * items为一个数组,数组每个元素代表一行(tr).
 * 每一行的数据格式可为一个数组或一个object
 * 
 *  行为数组时,数组中每个元素表示每个单元(td)<br>
 *  行为object时,表示该行只有一个单元格,可以在object中定义td,tr的属性信息, object.td = {}, object.tr = {}<br>
 * 当一个配置信息既无ctype属性,亦无td属性时被看作是该行tr的信息
 * <br>
 <pre><code>
var win = new CC.ui.Win({
  showTo:document.body,
  layout:'table',
  lyCfg:{
    // 设置table结点的class样式
    tblCs : 'form_tbl',
    // 设置每个分组的信息
  	group:{ 
  		cols:2,
  		// 第一个colgroup结点的信息
  		0 : {css:'w:120', cs:'hgrp'} 
  	},
  	
    items:[
      //  row one
      [ 
        { 
          // cell one
          ctype:'label', 
          title:'提交请求:', 
          // td结点的信息
          td:{css:'tr', cs:'cap'}
        },
         // cell two
        {ctype:'text',  width:120, value:'提交请求:'}
      ],
      // row two
      { 
        ctype:'text', css:'w:100%', 
        // td.colspan = 2
        td:{cols:2}
      },
      
      [
        // 占位td
        false, 
        // tr信息
        {cs:'tr-row'}, 
        {td:{css:'h:33'}}
      ],
      // row with single cell , no component
      {tr:{cs:'tr-end'}, td:{cols:2}}
    ]
  }
});
 </code></pre>
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.TableLayout', B, {

	attach : function(ct){
		// cache the items
	  this._items = ct.lyCfg && ct.lyCfg.items;
	  // 自由添加结点到容器
	  ct._addNode = ct._removeNode = fGo;
	  superclass.attach.apply(this, arguments);
	},
	
	//override
  fromArray : function(items){
    // 将items的json行列所有数据存到单一的数组中,由父类fromArray载入
    // 未定义ctype的配置作为非实体控件配置处理
    var len = items.length, i, j, as, news = [], tds = [];
    for(i=0;i<len;i++){
      as = items[i];
      if(CC.isArray(as)){
        for(j=0;j<as.length;j++){
          if(as[j] && as[j].ctype){
            news.push(as[j]);
            // 避免td污染
//            tds.push(as[j].td);
//            delete as[j].td;
          }   
        }
      }else if(as && as.ctype){
        news.push(as);
        // 避免td污染
//        tds.push(as.td);
//        delete as.td;
      }
    }
    superclass.fromArray.call(this, news);
    
    // 恢复td
//    for(i=0,len=news.length;i<len;i++){
//      if(news[i].td !== undefined){
//        news[i].td = tds[i];
//      }
//    }
//    tds = null;
    news = null;
  },
/**
 * @property tableEl
 * @type HTMLElement
 */
/**
 * @cfg {String} tblCs class name of main table node
 */
/**
 * 一次性布局,生成table表
 * @private
 */
	onLayout : function(){
		if(!this.layouted){
			superclass.onLayout.apply(this, arguments);
			
			this.layouted = true;
			
			var tbl = this.tableEl;
			var tb = this.tableEl = CC.$C('TABLE');
			var c = this.ct;
			
			tb.className = 'g-ly-tbl';
			
			if(this.tblCs){
			  CC.fly(tb).addClass(this.tblCs).unfly();
			  delete this.tblCs;
			}
			
			if(tbl){
			  Base.applyOption(tb, tbl);
			}
			
			if(this.group){
				var g = this.group;
				var gn = CC.$C('COLGROUP');
				var len = g.cols;
				var col;
				for(i=0;i<len;i++){
				  col = CC.$C('COL');
				  col.className = 'g'+(i+1);
				  if(g[i]){
				    Base.applyOption(col, g[i]);
				  }
				  gn.appendChild(col);
				}
			  delete this.group;
			  tb.appendChild(gn);
			}
			
			var tbody = CC.$C('TBODY'),
          its = this._items;
          
			if(its){
			  var szits = its.length, chs = c.children, szchs = chs.length;
			  var i,j,k,ch, szr, tr, td, cc, inf, tp,cpp;
			  for(i=0, k=0;i<szits;i++){
			    r = its[i];
			    tr = CC.$C('TR');
			    tr.className = 'r'+(i+1);
			    
			    if(CC.isArray(r)){
				     for(j=0,cpp=1,szr=r.length;j<szr;j++){
				       cc = r[j];
				       if(cc){
				          inf = cc.td, tp = cc.ctype;
				          if(!inf && !tp){
				            // tr config
				            Base.applyOption(tr, cc);
				            continue;
				          }
				          td = CC.$C('TD');
				          td.className = 'tbl-td c'+(cpp++);
				          // td class
				          if(cc.tdcs)
				            CC.fly(td).addClass(cc.tdcs).unfly();
				          // apply td cfg
							    if(inf){
							       if(inf.cols){
							         td.colSpan = inf.cols;
							         delete inf.cols;
							       }
							       Base.applyOption(td, inf);
							     }
							    // add component to td
                  if(tp){
							       ch  = chs[k++];
							       td.appendChild(ch.view);
							    }
							    tr.appendChild(td);
				       }else {
				         // else single td, nothing
				         td = CC.$C('TD');
				         td.className = 'tbl-td c'+(cpp++);
				         tr.appendChild(td);
				       }
				     }
			    }else {
				      // single td in row
				     td = CC.$C('TD');
				     td.className = 'tbl-td c'+(cpp++);
				     if(r.td){
				       var inf = r.td;
				       if(inf.cols){
				         td.colSpan = inf.cols;
				         delete td.cols;
				       }
				       Base.applyOption(td, inf);
				     }
				     if(r.tr){
              // tr config
              Base.applyOption(tr, r.tr);
				     }
				     if(r.ctype){
				       ch  = chs[k++];
				       td.appendChild(ch.view);
				     }
				     
				     tr.appendChild(td);
			    }
			    tbody.appendChild(tr);
			  }
			}
			tb.appendChild(tbody);
		  c.wrapper.append(tb);
		  delete this._items;
		}
	}
});

CC.layout.def('table', CC.layout.TableLayout);

})();
﻿/**
 * @class CC.layout.TablizeLayout
 * 只有一行的table布局,主要用于toolbar的布局,使得任何类型的元素排列的都比较整齐.
 * 也常用于form布局,当需要并排表单组件时,此布局就能派上用场了.
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.TablizeLayout', CC.layout.Layout, {

  attach : function(ct){
  	var self = this;
    this.tableEl = CC.Tpl.forNode('<table class="g-ly-tablize"><tr id="_tr"></tr></table>');
	  this.trEl = CC.$('_tr', this.tableEl);
	  
    ct._addNode = function(nd){
     var td = CC.$C('TD');
     td.className = 'tblly-td';
     td.appendChild(nd);
     self.trEl.appendChild(td);
    };
    ct.wrapper.append(this.tableEl);
    CC.layout.Layout.prototype.attach.apply(this, arguments);
  },

  add : function(c){
    CC.layout.Layout.prototype.add.apply(this, arguments);
    if(c.lyInf && c.lyInf.separator){
      this.addSeparator();
      delete c.lyInf.separator;
    }
  },
    
  onLayout : function(){
    if(!this.layouted){
      this.layouted = true;
	    CC.layout.Layout.prototype.onLayout.apply(this, arguments);
    }
  },
/**
 * 添加分隔条.
 */
  addSeparator : function(){
  	var td = CC.$C({
  	  tagName:'TD',
  	  innerHTML:'<span class="tblly-sep"> | </span>',
  	  className:'tblly-td'
  	});
    this.trEl.appendChild(td);
  }
});
CC.layout.def('tablize', CC.layout.TablizeLayout);
/**
 * @class CC.layout.Portal
 */
 
/**
 * @cfg {Function} createZoom 自定义生成矩域，调用方式为 createZoom(source)，方法在拖放开始时触发。
 */

CC.create('CC.layout.Portal', CC.layout.Layout, {
    
    initialize : function(opt){
        this.portable = new CC.util.dd.Portable(this.portable);
        // 设置createZoom
        this.portable.createZoom = this.createZoom.bindRaw(this);
        CC.layout.Layout.prototype.initialize.call(this, opt);
    },
    
    beforeAdd : function(comp){
      // flag 
      if(!comp._portalAddedBnd){
              if(__debug) console.log('check ct child dd binded', comp);
              comp.on('add', this.bindModule, this);
              comp._portalAddedBnd = true;
      }
      
      var self = this;
      comp.each(function(){
          if(!this.portalDDBinded)
              self.bindModule(this);
      });
    },
  
    bindModule : function(c){
      if(!c.portalDDBinded){
          this.portable.bind(c);
      }
    },
  
    createZoom : function(source){
            var ct = this.ct, 
                row, cell, 
                root = new CC.util.d2d.RectZoom();
            
            function filter(c){
                return c !== source;
            }
            
            for(var i=0,chs=ct.children,len=chs.length;i<len;i++){
                row = chs[i];
                if(row.size()){
                    root.add(new CC.util.d2d.ContainerDragZoom({
                        ct:row, 
                        filter:filter
                    }));
                }else {
                    // 
                    // 对于空容器，添加placehold域以获得响应
                    // 在拖放结束后清空placehold域
                    //
                    var hold = new CC.util.d2d.ComponentRect(this.portable.createPlaceholdForCt(row));
                    root.add(hold);
                }
            }
            return root;
    }
});

CC.layout.def('portal', CC.layout.Portal);

/**
 * @class CC.ui.layout.TabItemLayout
 * 用于布局{@link CC.ui.Tab}容器里的{@link CC.ui.TabItem},使得子项超出可视时出视导航条.
 * @extends CC.layout.Layout
 */
CC.Tpl.def('CC.ui.TabItemLayout', '<div class="g-panel"><div class="auto-margin" id="_margin"><a href="javascript:fGo()" id="_rigmov" class="auto-rigmov" style="right:0px;"></a><a href="javascript:fGo()" style="left:0px;" id="_lefmov" class="auto-lefmov"></a><div class="auto-scrollor" id="_scrollor" tabindex="1" hidefocus="on"><div class="auto-offset" id="_wrap"></div></div></div></div>');
CC.create('CC.layout.TabItemLayout', CC.layout.Layout, function(father){
return {

  layoutOnChange : true,
  /**
   * 该值须与 CSS 中的.auto-margin值保持同步,因为这里margin并不是由JS控制.
   * 出于性能考虑,现在把它固定下来
   * @private
   */
  horizonMargin: 5,

  /**
   * 该值须与左边导航按钮宽度一致,出于性能考虑,现在把它固定下来
   * @private
   */
  navLeftWidth: 24,

  /**
   * 该值须与右边导航按钮宽度一致,出于性能考虑,现在把它固定下来
   * @private
   */
  navRightWidth: 24,

/**
 * 布局加到容器的样式
 * @private
 */
  ctCS : 'g-autoscroll-ly',
/**
 * 导航按钮的disabled样式
 * @private
 */
  disabledLeftNavCS: 'g-disabled auto-lefmov-disabled',

/**
 * 导航按钮的disabled样式
 * @private
 */
  disabledRightNavCS: 'g-disabled auto-rigmov-disabled',
/**
 * 导航按钮所在结点的样式
 * @private
 */
  navPanelCS: 'g-mov-tab',

  getMargins : function(){
    return [this.marginLeft||this.horizonMargin, this.marginRight||this.horizonMargin];
  },

  attach: function(ct){
    father.attach.call(this, ct);

    // 重置margin结点值，忽略CSS设置的值，
    // 使得当CSS值不同的不引起布局的混乱
    var mg = ct.dom('_margin').style, ms = this.getMargins();
    mg.marginLeft = ms[0] + 'px';
    mg.marginRight = ms[1] + 'px';

    this.scrollor = ct.$$('_scrollor');

    //左右导航结点
    var lm = this.lefNav = ct.$$('_lefmov'),
        rm = this.rigNav = ct.$$('_rigmov');

    lm.disabledCS = this.disabledLeftNavCS;
    rm.disabledCS = this.disabledRightNavCS;

    this.attachEvent();
  },

/**@private*/
  attachEvent : function(){
    var lm = this.lefNav, rm = this.rigNav;
    this.ct.on('remove', this.onStructureChange, this)
           .on('closed', this.onStructureChange, this)
           .domEvent('mousedown', this.onNavMousedown, true, this, lm.view)
           .domEvent('mouseup',   this.onNavMouseup,   true, this, lm.view)
           .domEvent('mousedown', this.onNavMousedown, true, this, rm.view)
           .domEvent('mouseup',   this.onNavMouseup,   true, this, rm.view);
  },

  onStructureChange : function(){
    //has left but no right
    if(this.hasLeft() && !this.hasRight())
      this.requireMoreSpace();
    this.doLayout();
  },

/**
 * 点击时是左导航按钮还是右导航按钮?
 * @private
 */
  getDirFromEvent : function(e) {
    return this.lefNav.view.id === CC.Event.element(e).id?'l':'r'
  },

/**
 * 滚动至首个隐藏按钮,使得按钮处于可见状态
 * @param {String} dir l 或 r
 */
  scrollToNext : function(dir, norepeat){
    var nxt = this.getNextHiddenItem(dir);
    if(nxt){
      this.scrollItemIntoView(nxt);
      if(!norepeat){
        this.mousedownTimer =
          arguments.callee.bind(this, dir).timeout(300);
      }
    }else{
      clearTimeout(this.mousedownTimer);
      this.mousedownTimer = null;
    }
  },

/**
 * 将子项滚动到可见处
 * @param {CC.ui.TabItem} tabItem
 */
  scrollItemIntoView : function(item){
    if(!item)
      item = this.ct.selectionProvider.selected;

    if(item){
      var dx = this.getScrollIntoViewDelta(item);
      if(dx !== 0){
        if(__debug) console.log('scroll delta:'+dx);

        this.setScrollLeft(this.getScrollLeft() + dx);
      }
      this.checkStatus();
    }
  },

/**
 * @private
 */
  onNavMousedown : function(e){
    this.mousedownTimer = this.scrollToNext.bind(this, this.getDirFromEvent(e)).timeout(300);
  },
/**
 * @private
 */
  onNavMouseup : function(e){
    if(this.mousedownTimer){
        clearTimeout(this.mousedownTimer);
        this.mousedownTimer = null;
    }
    this.scrollToNext(this.getDirFromEvent(e), true);
  },


  add: function(comp){
    //override & replace
    comp.scrollIntoView = this.scrollItemIntoView.bind(this);
    father.add.apply(this, arguments);
  },

/**
 * 获得Tab容器放置区域可视宽度
 * @private
 */
  getScrollViewWidth : function(){
    return this.scrollor.view.clientWidth;
  },

/**
 * @private
 */
  getScrollLeft : function(){
    return parseInt(this.scrollor.view.scrollLeft, 10) || 0;
  },
/**
 * @private
 */
  setScrollLeft : function(x){
    this.scrollor.view.scrollLeft = x;
  },
/**
 * @private
 */
  hasLeft : function(){
    return this.scrollor.view.scrollLeft>0;
  },
/**
 * @private
 */
  hasRight : function(){
    return this.ct.size() > 0 && this.getScrollRigthLength(this.ct.children[this.ct.size() - 1])>0;
  },
/**
 * @private
 */
  getScrollLeftLength : function(item){
    return this.getScrollLeft() - item.view.offsetLeft;
  },
/**
 * @private
 */
  getScrollRigthLength : function(item){
    var sv = this.getScrollViewWidth(),
        sl = this.getScrollLeft(),
        ol = item.view.offsetLeft,
        ow = item.view.offsetWidth;
    return ol+ow-sl-sv;
  },
/**
 * @private
 */
  getScrollIntoViewDelta : function(item){
    var d = this.getScrollLeftLength(item);

    if(__debug) console.log('scroll left dx:',d);

    if(d>0)
      return -1*d;
    d = this.getScrollRigthLength(item);

    if(__debug) console.log('scroll right dx:',d);

    return d>0?d:0;
  },
/**
 * @private
 */
  requireMoreSpace : function(){
    var nxt = this.getNextHiddenItem('l');
    if(nxt)
      this.scrollItemIntoView(nxt);
  },

  getLastVisibleItem : function(){
    var its = this.ct.children, i = 0,len = its.length;
    for(i=len-1;i>=0;i--){
      if(!its[i].hidden && this.getScrollRigthLength(its[i])<=0)
        return its[i];
    }
  },

/**
 * @private
 */
  getNextHiddenItem : function(dir){
    var its = this.ct.children,
        it,i = 0,len = its.length;

    if(dir === 'l'){
      for (; i < len; i++) {
        it = its[i];
        if(!it.hidden){
          if(this.getScrollLeftLength(it)<=0)
          return its[i-1];
        }
      }
    }else {
      for(i=len-1;i>=0;i--){
        it = its[i];
        if(!it.hidden){
          if(this.getScrollRigthLength(it)<=0)
          return its[i+1];
        }
      }
    }
  },
/**
 * @private
 */
  fixIEOnLayout : function(w){
    var ct = this.ct,
        ms = this.getMargins(),
        w = (w || ct.getWidth(true)) - ms[0] - ms[1]; //margin of wrap.

    ct.fly('_margin').setWidth(w).unfly();
    w -= this.navLeftWidth + this.navRightWidth; //margin of nav bar.
    this.scrollor.setWidth(w);
  },
/**
 * @private
 */
  onLayout : function(w){

   if(__debug) console.group('TabItem布局('+this.ct+')');

   father.onLayout.apply(this, arguments);
   var ct = this.ct,
       scrollor = ct.scrollor,
       selected = ct.selectionProvider.selected;
  //
  // fix ie
  //
  if (CC.ie)
    this.fixIEOnLayout(w);

  // 是否由resized引起的
  if(w !== undefined){
    var dx = false;

    if(this.preWidth === undefined)
      this.preWidth = w;
    else dx = w - this.preWidth;

    this.preWidth = w;

    if (dx) {
      //如果向右扩
      if (dx > 0) {
        //如果右边有隐藏，尽量显示,否则显示左边
        if(!this.hasRight())
          this.setScrollLeft(this.getScrollLeft() - dx);
      }
    }
  }
  if(selected)
      this.scrollItemIntoView(selected);
  else this.checkStatus();

  if(__debug) console.groupEnd();
  },


/**
 * 检查导航按钮状态，是否应显示或禁用.
 * @private
 */
  checkStatus : function(){
    var ct = this.ct,
        dl = !this.hasLeft(),
        dr = !this.hasRight();

    if(__debug) console.log('checking nav disabled,','hasL:',!dl,'hasR:',!dr);

    this.lefNav.disable(dl);
    this.rigNav.disable(dr);
    ct.checkClass(this.navPanelCS, !dl || !dr);
  }
};
});

CC.layout.def('tabitem', CC.ui.layout.TabItemLayout);
/**
 * @class CC.layout.Portal
 */
 
/**
 * @cfg {Function} createZoom 自定义生成矩域，调用方式为 createZoom(source)，方法在拖放开始时触发。
 */

CC.create('CC.layout.Portal', CC.layout.Layout, {
    
    initialize : function(opt){
        this.portable = new CC.util.dd.Portable(this.portable);
        // 设置createZoom
        this.portable.createZoom = this.createZoom.bindRaw(this);
        CC.layout.Layout.prototype.initialize.call(this, opt);
    },
    
    beforeAdd : function(comp){
      // flag 
      if(!comp._portalAddedBnd){
              if(__debug) console.log('check ct child dd binded', comp);
              comp.on('add', this.bindModule, this);
              comp._portalAddedBnd = true;
      }
      
      var self = this;
      comp.each(function(){
          if(!this.portalDDBinded)
              self.bindModule(this);
      });
    },
  
    bindModule : function(c){
      if(!c.portalDDBinded){
          this.portable.bind(c);
      }
    },
  
    createZoom : function(source){
            var ct = this.ct, 
                row, cell, 
                root = new CC.util.d2d.RectZoom();
            
            function filter(c){
                return c !== source;
            }
            
            for(var i=0,chs=ct.children,len=chs.length;i<len;i++){
                row = chs[i];
                if(row.size()){
                    root.add(new CC.util.d2d.ContainerDragZoom({
                        ct:row, 
                        filter:filter
                    }));
                }else {
                    // 
                    // 对于空容器，添加placehold域以获得响应
                    // 在拖放结束后清空placehold域
                    //
                    var hold = new CC.util.d2d.ComponentRect(this.portable.createPlaceholdForCt(row));
                    root.add(hold);
                }
            }
            return root;
    }
});

CC.layout.def('portal', CC.layout.Portal);

﻿(function(){

var CC = window.CC;
var PR = CC.Base.prototype;

/**
 * @class CC.ui.Shadow
 * 阴影类, 阴影类须在文档创建后(DOM Ready)生成.
 * @extends CC.Base
 */
CC.Tpl.def('CC.ui.Shadow' , CC.ie6 ? '<div class="g-dxshadow"></div>' : '<div class="g-shadow" style="display:none;"><div class="g-shadow-t" id="_t"></div><div class="g-shadow-lt" id="_lt"></div><div class="g-shadow-rt" id="_rt"></div><div class="g-shadow-l" id="_l"></div><div class="g-shadow-lb" id="_lb"></div><div class="g-shadow-r" id="_r"></div><div class="g-shadow-rb" id="_rb"></div><div class="g-shadow-b" id="_b"></div></div>');
CC.create('CC.ui.Shadow', CC.Base,
{
/**
 * @cfg {Number} [inpactW=8] 阴影宽度相关参数
 */
  inpactW : 8,
/**
 * @cfg {Number} [inpactH=0] 阴影高度相关参数
 */
  inpactH : 0,
/**
 * @cfg {Number} [inpactX=-4] 阴影x方向位移相关参数
 */
  inpactX : -4,
/**
 * @cfg {Number} [inpactY=8] 阴影y方向位移相关参数
 */
  inpactY : 4,
/**
 * @cfg {Number} [shadowWidth=8] 阴影边沿宽度,该值只对IE有效
 */
  shadowWidth : 6,

  /**
   * @cfg {Number} offset 变换引起的偏移量, 专为IE6采用的滤镜设置,非IE6时忽略该值,默认为4, 参见CSS滤镜中Blur(pixelradius).
   * @private
   */
  offset : 4,

  hidden : true,

/**
 * @cfg {CC.Base} target 阴影附加的目标控件
 */
  target : false,
  
  initComponent : function(){

    PR.initComponent.call(this);

    if(this.target)
        this.attach(this.target);
    if(CC.ie && !CC.ie6){
      this.shadowR = this.dom('_r');
      this.shadowB = this.dom('_b');
      this.shadowL = this.dom('_l');
      this.shadowT = this.dom('_t');
    }
  },
/**
 * 将阴影关联到目标控件.
 * @param {CC.Base} target 阴影附加的目标控件
 * @return this
 */
  attach : function(target){
    this.target = target;

    if(this.target.eventable){
        this.target.on('resized', this.reanchor, this)
                   .on('reposed', this.reanchor, this);
    }
    this.setZ((this.target.fastStyle('zIndex') || 1)-1);
    //专门针对不支持PNG图片的IE6
    if(CC.ie6){
      this._ie6OffDt = Math.floor(this.offset/2);
      this.view.style.filter="progid:DXImageTransform.Microsoft.alpha(opacity=50) progid:DXImageTransform.Microsoft.Blur(pixelradius="+this.offset+")";
    }
    return this;
  },

/**
 * 撤消阴影与目标控件的关联.
 * @return this
 */
  detach : function(){
    if(this.target.eventable){
        this.target.un('resized', this.reanchor, this);
        this.target.un('reposed', this.reanchor, this);
    }
    this.target = null;
    this.display(false);
    return this;
  },

/**
 * 调整阴影大小.
 * @private
 */
  setRightSize : CC.ie6?
    function(a, b){
      if(a !== false)
        this.setWidth(a - this.offset - this._ie6OffDt + this.inpactW - 1);
      if(b !== false)
        this.setHeight(b - this.offset - this._ie6OffDt + this.inpactH);
    }:function(a, b){
    if(a !== false){
      a = a+this.inpactW;
      if(a!=this.width)
        this.setWidth(a);
    }
    if(b !== false){
      b+=this.inpactH;
      if(b!=this.height){
        this.setHeight(b);
      }
    }
    //修正IE不能同时设置top, bottom的问题,设置具体高度
    if(CC.ie){
      var f = CC.fly(this.shadowR), d = this.shadowWidth*2, e;
      if(b !== false){
        e = b - d;
        f.setHeight(e);
        f.view = this.shadowL;
        f.setHeight(e);
      }
      if(a !== false){
        e = a - d;
        f.view = this.shadowB;
        f.setWidth(e);
        f.view = this.shadowT;
        f.setWidth(e);
      }
      f.unfly();
    }
  },
/**
 * 定位阴影.
 * @private
 */
  setRightPos : CC.ie6?
    function(pos){
      pos[0]+=this.inpactX - this._ie6OffDt + 1;
      pos[1]+=this.inpactY - this._ie6OffDt;
      this.setXY(pos);
    }:
    function(pos){
      this.setXY(pos[0]+this.inpactX, pos[1]+this.inpactY - 1);
    },
/**
 * 假如目标只是宽高改变，可调用本方法重新调整阴影。
 */
  resize : function(){
    var d = this.target.getSize(true);
    this.setRightSize(d.width, d.height);
  },
/**
 * 假如目标只是x,y改变，可调用本方法重新调整阴影。
 */
  repos : function(){
    this.setRightPos(this.target.absoluteXY());
  },
/**
 * 更新至当前状态,当阴影大小或位置与目标不一致时调用.
 * @return this
 */
  reanchor : function(){
    var t = !this.hidden;
    this.resize();
    this.repos();
    if(t)
      PR.display.call(this, true);
    return this;
  },

  // 只有target显示时才显示阴影,否则忽略.
  display : function(b){
    if(b===undefined)
      return PR.display.call(this);
    var b = b && this.target && !this.target.hidden;
    if(b){
      this.reanchor();
      this.appendTo(document.body);
    }else {
      this.del();
    }
    return PR.display.call(this, b);
  }
}
);

CC.ui.def('shadow', CC.ui.Shadow);

})();
(function(){
var CC = window.CC;
var PR = CC.Base.prototype;
/**
 * @class CC.ui.Loading
 * 加载提示类,参见{@link CC.util.ConnectionProvider}
 * @extends CC.Base
 */
 
/**
 * @cfg {String} loadMaskCS 掩层CSS类名
 */
 
/**
 * @cfg {Boolean} maskDisabled 是否禁用掩层
 */

/**
 * @cfg {String} targetLoadCS 加载时添加到目标的样式
 */
 
/**
 * @cfg {Boolean} loadMsgDisabled 是否禁用消息提示
 */
 
/**
 * @cfg {Boolean} monitor 监听连接事件源,默认为空,监听的事件为open, send, success, final.
 */


/**
 * @property target
 * 目标容器
 * @type CC.ui.ContainerBase
 */
 
CC.Tpl.def( 'CC.ui.Loading' , '<div class="g-loading"><div class="g-loading-indicator"><span id="_tle">加载中,请稍候...</span></div></div>');

CC.create('CC.ui.Loading', CC.Base,
 {
  loadMaskCS:'g-loading-mask',

  monitor : false,
  
  initComponent : function(){
    PR.initComponent.call(this);
    if(this.monitor) {
      this.setMonitor(CC.delAttr('monitor', this));
    }
  },

 
/**
 * 装饰容器,当容器加载数据时出现提示.
 * @param {CC.ui.ContainerBase} targetContainer
 */
  attach : function(target){
    this.target = target;
  },

/**
 * 设置监听事件源.
 */
  setMonitor : function(monitor){
    if(this.monitor){
      this.monitor.un('open',this.whenOpen,this).
                   un('send',this.whenSend,this).
                   un('success',this.whenSuccess,this).
                   un('final',this.whenFinal,this);
    }
    if(monitor){
      monitor.on('open',this.whenOpen,this).
              on('send',this.whenSend,this).
              on('success',this.whenSuccess,this).
              on('final',this.whenFinal,this);
    }
    this.monitor = monitor;
  },
  
  /**@private*/
  whenSend : fGo,
  
  /**@private*/
  whenSuccess : function(){this.loaded = true;},
  
  /**@private*/
  whenOpen : function(){
    this.markIndicator();
  },
  
  /**@private*/
  whenFinal : function(){
    this.stopIndicator();
    if(this.target.shadow){
      this.target.shadow.reanchor();
    }
  },

   targetLoadCS : false,

   maskDisabled : false,

   loadMsgDisabled : false,
   
/**
 * 开始加载提示.
 */
  markIndicator : function(){
    
    if(this.disabled)
      return;
    
    this.busy = true;
    
    if(this.targetLoadCS)
      CC.fly(this.target).addClass(this.targetLoadCS).unfly();

    //应用掩层
    if((!this.mask || !this.mask.tagName) && !this.maskDisabled){
      this.mask = CC.$C({tagName:'DIV', className:this.loadMaskCS});
    }

    if(this.mask && !this.maskDisabled){
      this.target.wrapper.append(this.mask).unfly();
    }

    if(!this.loadMsgDisabled)
      this.target.wrapper.append(this);
  },
/**
 * 停止加载提示.
 */
  stopIndicator : function(){
    if(this.targetLoadCS)
      CC.fly(this.target).delClass(this.targetLoadCS).unfly();

    if(!this.maskDisabled) {
      if(this.mask){
        //firefox bug?
        //can not find out the parentNode, that is null!
        //this.mask.parentNode.removeChild(this.mask);
        //alert()
        //TODO: find out why??
        if(this.mask.parentNode)
          this.mask.parentNode.removeChild(this.mask);
        //delete this.mask;
      }
      this.del();
    }
    
    this.busy = false;
    this.loaded = true;
  },
  
/**
 * 目标是否正在加载中.
 * @return {Boolean}
 */
  isBusy : function(){
    return this.busy;
  },
  
/**
 * 目标是否已成功加载.
 * @return {Boolean}
 */
  isLoaded : function(){
    return this.loaded;
  }, 
  
  destory : function(){
    this.setMonitor(null);
    this.superclass.destory.call(this);
  }
});

CC.ui.def('loading', CC.ui.Loading);
})();
﻿/**
 * @class CC.ui.Mask 容器控件遮掩层
 * @extends CC.Base
 */
CC.create('CC.ui.Mask', CC.Base, {

  template : '<div class="g-modal-mask"></div>',

/**
 * @cfg {Function} onactive 点击层时响应回调
 */

/**
 * @cfg {Number} opacity 遮罩层透明度, 0 - 1
 */
 
  onactive : null,

/**
 * @property target
 * 目标容器
 * @type CC.ui.ContainerBase
 */

  initComponent : function(){
    CC.Base.prototype.initComponent.call(this);
    if(this.target){
      this.attach(this.target);
    }
    if(this.opacity){
      this.setOpacity(this.opacity);
    }
    this.domEvent('mousedown', this.onMaskResponsed, true);
  },

  /**@private*/
  onMaskResponsed : function(){
     this.fire('active', this);
     if(this.onactive)
      this.onactive();
  },

/**
 * 绑定目标容器
 * @param {CC.ui.ContainerBase} target
 */
  attach : function(target){

    var t = target || CC.$body;

    this.target = t;

    if(t.eventable)
      t.on('resized', this.onTargetResized, this);

    var f = CC.fly(t);

    if(t === CC.$body || t === document.body){
      CC.$body.domEvent('resize', this.onWindowResize, false, this, window);
      this.onWindowResize();
    }else {
      this.setSize(f.getSize());
    }

    this.setXY(0,0);

    f.unfly();
    this.appendTo(t);
    return this;
  },

/**
 * 解除绑定
 */
  detach : function(){
    var t = this.target;

    if(t === CC.$body || t === document.body)
      CC.$body.unEvent('resize', this.onWindowResize, window);

    if(t.eventable)
      t.un('resized', this.onTargetResized);

    this.del();
    this.target = null;
    return this;
  },

/**@private*/
  onTargetResized : function(a, b, c, d) {
    this.setSize(c, d);
  },

/**@private*/
  onWindowResize : function(){
      var vp = CC.getViewport();
      this.setSize(vp);
  },

/**@private*/
  destory : function(){
    if(this.target)
      this.detach();

    CC.Base.prototype.destory.call(this);
  }
});
﻿/**
 * @class CC.ui.Viewport
 * 时刻布满整个浏览器客户区的面板
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Viewport', CC.ui.Panel, {

  bodyCS : 'g-viewport-body',

  cs : 'g-viewport',
  
/**@cfg {Array} mg margins*/
  mg : [0,0,0,0],
  
  initComponent : function(){
    this.showTo = document.body;
    if(!this.view)
      this.view = CC.$C('DIV');
      
    CC.Event.on(window, 'resize', this.onWindowResize.bind(this));
    
    CC.ui.Panel.prototype.initComponent.call(this);
    
    CC.$body.addClass(this.bodyCS);
    
    this.onWindowResize();
  },

  onWindowResize : function(){
      var vp = CC.getViewport();
      var x=0, y=0, mg = this.mg, space;
      
      x = mg[1];
      y = mg[2];
      vp.width  -= mg[1] + mg[3];
      vp.height -= mg[0] + mg[2];
      
      if(this.maxW < vp.width){
      	space = vp.width - this.maxW;
        x += Math.floor(space/2);;
        vp.width -= space;
      }
      
      if(this.maxH < vp.height){
      	space = vp.height - this.height;
        y += Math.floor(space/2);;
        vp.height -= space;
      }
      
      this.setBounds(x, y, vp.width ,vp.height);
      
  }
}
);

CC.ui.def('viewport', CC.ui.Viewport);
﻿CC.Tpl.def('CC.ui.FolderItem', '<li class="g-unsel"><b id="_ico" class="icos"></b><a id="_tle" class="g-tle"></a></li>')
      .def('CC.ui.Folder', '<div class="g-folder g-grp-bdy"><div class="g-grp-bdy" id="_scrollor"><ul id="_bdy" tabindex="1" hidefocus="on"></ul></div></div>');
/**
 * @class CC.ui.Folder
 * @extends CC.ui.ContainerBase
 */
/**
 * 
 */
CC.create('CC.ui.Folder', CC.ui.ContainerBase, {
  itemCfg : {
    template : 'CC.ui.FolderItem', 
    hoverCS:'on', 
    icon:'icoNote', 
    blockMode:2
  },
  keyEvent : true,
  ct : '_bdy',
  clickEvent : true,
  useContainerMonitor : true,
  template:'CC.ui.Folder',
  selectionProvider : true
});

CC.ui.def('folder', CC.ui.Folder);
﻿CC.Tpl.def('CC.ui.Button', '<table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="g-btn-l"><i>&nbsp;</i></td><td class="g-btn-c"><em unselectable="on"><button type="button" class="g-btn-text" id="_tle"></button></em></td><td class="g-btn-r"><i>&nbsp;</i></td></tr></tbody></table>');
/**
 * @class CC.ui.Button
 * @extends CC.Base
 */
CC.create('CC.ui.Button', CC.Base, function(superclass){
    return {
        iconNode: '_tle',
        focusNode: '_tle',
        hoverCS: 'g-btn-over',
        clickCS: 'g-btn-click',
        iconCS: 'g-btn-icon',
        focusCS: 'g-btn-focus',
        tip : false,
        disableNode: '_tle',
        innerCS: 'g-btn',
        blockMode: '',

        _onclick: function(){
            if (this.onclick)
                this.onclick.call(this);
        },

        initComponent: function(){
            superclass.initComponent.call(this);
            if (!this.title || this.title == '')
                this.addClass(this.noTxtCS || 'g-btn-notxt');
            this.element = this.dom('_tle');
            this.domEvent('mousedown', this._gotFocus);
            this.domEvent('click', this._onclick);
            if (this.focusCS)
                this.bindFocusStyle(this.focusCS);
            if (this.dockable && this.docked) {
                this.setDocked(true);
            }
        },
/**
 * @param {Boolean} dockOrNot
 */
        setDocked: function(b){
          /**
           * @type Boolean
           */
            this.docked = b;
            this.checkClass(this.clickCS, b);
            return this;
        },

        _gotFocus: function(ev){
            try {
                this.element.focus();
            }
            catch (e) {
            }
        },

        mouseupCallback: function(){
            if (this.dockable) {
                this.docked = !this.docked;
                return this.docked;
            }
        }
    };
});
/**
 * @class CC.ui.DropButton
 */
CC.create('CC.ui.DropButton', CC.ui.Button, {

  downCS : 'g-btn-dwn',
/**
 * @private
 */
  _onclick : function(e){
    if(this.array)
      this.createMenu();
/**
 * @property menu
   下拉菜单
 * @type CC.ui.Menu
 */
    if(this.menu){
      CC.Event.stop(e);
      this.showMenu(!!this.menu.hidden);
    }

    CC.ui.DropButton.superclass._onclick.apply(this, arguments);
  },
/***/
  showMenu : function(b){
    if(b){
      this.menu.at(this, true);
      this.menu.focus(0);
    }else {
      this.menu.hide();
    }
  },
/***/
  decorateDown : function(b){
    this.checkClass(this.downCS, b);
  },
/**
 * array attr will be deleted after creation
 * @private
 */
  createMenu : function(mcfg){
    var
        self = this,
        cfg =
        CC.extendIf(mcfg || this.menuCfg , {
          ctype : 'menu',
          array : this.array,
          width:120,
          showTo: document.body,
        /**
         * 重载CC.ui.Menu.onDisplay方法
         * @private
         */
          onDisplay : function(b){
            self.decorateDown(b);
          }
        });

    delete this.array;

    this.menu = CC.ui.instance(cfg);
    this.menu.render();
  }
});

CC.ui.def('button', CC.ui.Button);
CC.ui.def('dropbutton', CC.ui.DropButton);
﻿CC.Tpl['CC.ui.BarItem'] = '<table class="g-baritem" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="g-btn-l"><i>&nbsp;</i></td><td class="g-btn-c"><em unselectable="on"><button type="button" class="g-btn-text" id="_tle"></button></em></td><td class="g-btn-r"><i>&nbsp;</i></td></tr></tbody></table>';
CC.Tpl['CC.ui.Toolbar'] = '<div class="g-tbar"><div class="g-tbar-wr" id="_wrap"></div></div>';



/**
 * @class CC.ui.Bigbar
 * @extends CC.ui.Panel
 */

CC.create('CC.ui.Bigbar', CC.ui.Panel, {

   keyEvent:false,

   clickEvent:true,

   syncWrapper : false,
   
   itemCfg : {

    template : 'CC.ui.BarItem',

    hoverCS:'g-baritem-over',
    downCS : 'g-baritem-dwn',
    innerCS : 'g-baritem',

    clickCS:'g-baritem-click',

    focusCS:false,

    title:false
   },

   selectionProvider : {
    autoscroll:false,
    forceSelect:true
   },

   maxH : 38,

   innerCS : 'g-bigbar',

   itemCls : CC.ui.Button,

   template : 'CC.ui.Toolbar'
});

CC.ui.def('bigbar', CC.ui.Bigbar);

CC.create('CC.ui.BigbarDropButton', CC.ui.DropButton, {

    template : 'CC.ui.BarItem',

    hoverCS:'g-baritem-over',
    downCS : 'g-baritem-dwn',
    innerCS : 'g-baritem',

    clickCS:'g-baritem-click',

    focusCS:false,

    title:false
});

CC.ui.def('bigbardropbtn', CC.ui.BigbarDropButton);
/**
 * @class CC.ui.Smallbar
 * 小型工具栏,16*16图标大小
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Smallbar', CC.ui.Panel, /**@lends CC.ui.Smallbar#*/{

   syncWrapper : false,

   selectionProvider : {
    autoscroll:false,
    forceSelect:true
   },

   clickEvent:true,

   itemCfg : {

    template : 'CC.ui.BarItem',

    hoverCS: 'g-smallbar-item-over',

    downCS : 'g-smallbar-item-dwn',

    clickCS:'g-smallbar-item-click',

    innerCS:'g-smallbar-item',

    focusCS:false
   },

   maxH : 26,

   innerCS:'g-smallbar',

   itemCls : CC.ui.Button,

   template : 'CC.ui.Toolbar'
});

CC.ui.def('smallbar', CC.ui.Smallbar);

CC.create('CC.ui.SmallbarDropButton', CC.ui.DropButton, {
    template : 'CC.ui.BarItem',

    hoverCS: 'g-smallbar-item-over',

    downCS : 'g-smallbar-item-dwn',

    clickCS:'g-smallbar-item-click',

    innerCS:'g-smallbar-item',

    focusCS:false
});
CC.ui.def('smallbardropbtn', CC.ui.SmallbarDropButton);
﻿(function() {

  var SC = CC.ui.ContainerBase.prototype,
      SP = CC.ui.Panel.prototype,
      C = CC.Cache;
// html template for tabitem
CC.Tpl.def('CC.ui.TabItem', '<table unselectable="on" class="g-unsel g-tab-item"><tbody><tr id="_ctx"><td class="tLe" id="_tLe"></td><td class="bdy"><nobr id="_tle" class="g-tle">选卡1</nobr></td><td class="btn" id="_btnC"><a href="javascript:fGo()" title="关闭" id="_trigger" class="g-ti-btn"></a></td><td class="tRi" id="_tRi"></td></tr></tbody></table>');

/**
 * @class CC.ui.TabItem
 * @extends CC.ui.ContainerBase
 */
  CC.create('CC.ui.TabItem', CC.ui.ContainerBase, {

    hoverCS: false,
/**
 * 是否可关闭.
 * @cfg {Boolean} closeable
 */
 
/**
 * @cfg {Boolean} autoReload 当再次选择项或再次调用loadContent时是否自动重新加载内容，即使内容已经加载，默认为false.
 */
    
    autoReload : false,
    
    closeable: true,

    unselectable: true,

    ct: '_ctx',

    blockMode: 2,

    loadCS: 'g-tabitem-loading',

    initComponent: function() {
      SC.initComponent.call(this);
      var c = this.cacheBtnNode = this.dom('_btnC');
      if (c) c.parentNode.removeChild(c);

      this.bindClsEvent();
      if(this.closeable !== undefined)
        this.setCloseable(this.closeable);

      if(this.panel){
        this.setContentPanel(this.panel);
        //this.follow(this.panel);
      }
    },

/**
 * 增加按钮,如关闭按钮,还可以增加其它类似的按钮.
 * @param {Object} config button config
 */
    addButton: function(cfg) {
      var td = this.cacheBtnNode.cloneNode(true);
      cfg.view = td;
      td.id = cfg.id;
      cfg.iconNode = '_trigger';
      // apply the basic functionality to this button.
      var td = CC.Base.create(cfg);
      this.add(td);
      return td;
    },
    
		/**
		 * @cfg {Boolean} syncPanelDestory tab item 销毁时是否连同对应的Panel一起销毁, 当tabitem.panel被自动加入tab.contentPanel面板时,如果该值未设置,则置为true.
		 */
	  syncPanelDestory : undefined,
		
/**
 * 获得tabItem对应的内容面板
 * @param {Boolean} autoCreate 如果没有,是否自动创建
 * @return {CC.ui.ContainerBase}
 */
    getContentPanel: function(autoCreate) {
      var p = this.panel, tct;
      if (!p && autoCreate) {
        //iframe
        p  = this.src ? new CC.ui.IFramePanel() : new CC.ui.Panel();
        this.setContentPanel(p);
      }
      
        //如果panel未加入tab 的 contentPanel,加入之
      if(p && !p.pCt){
        if((ct = this.pCt) && (tct = ct.getContentPanel())){
        	tct.layout.add(p);
        }
        if(this.syncPanelDestory === undefined)
          this.syncPanelDestory = true;
      }
      
      return p;
    },
    
/**
 * 设置TabItem对应的内容面板,设置后,panel有一个bindingTabItem属性指向该TabItem
 * @param {CC.ContainerBase} contentPanel 内容面板,可以是CC.ui.IFramePanel或其它容器
 * @return this
 */
    setContentPanel : function(p){
      if(this.panel)
        delete this.panel.bindingTabItem;

      // 未实例化,实例化之,并不急于添加到tab的contentPanel中,因为contentPanel可能未创建
      if(!p.cacheId)
      	p = CC.ui.instance(p);
            
      this.panel = p;
      //Panel指向TAB项的引用
      p.bindingTabItem = this;
      return this;
    },

    _addNode: function(node) {
      if (this.buttonOrient != 'l') this.fly('_tRi').insertBefore(node).unfly();
      else this.fly('_tLe').insertAfter(node).unfly();
    },

    onClsClick: function() {
      if (this.closeable && this.pCt.getDisc() > 1){
        this.pCt.close(this);
      }
    },

    bindClsEvent: function() {
      var cls = this.$$(this.closeNode);
      if (!cls) {
        cls = this.addButton({
          id: '_clsBtn',
          blockMode: 2,
          icon: 'g-ti-clsbtn'
        });
      }
      //close event.
      this.domEvent('click', this.onClsClick, true, null, cls.view)
          .domEvent('dblclick', this.onClsClick, true);
      //不影响父容器mousedown事件.
      cls.view.onmousedown = CC.Event.noUp;
    },
/**
 * 设置是否可关闭
 * @param {Boolean} closeable
 */
    setCloseable: function(b) {
      if (this.cacheBtnNode) {
        this.closeable = b;
        this.$('_clsBtn').display(b);
      }
      else SC.setCloseable.call(this, b);

      return this;
    },
 
/**
 * @cfg {String} loadType
 * 如果允许自动创建内容面板,loadType设置创建的内容面板加载的内容,默认为html
 * 这个loadType将设置面板的connectionProvider.loadType.
 */
   loadType : 'html',
   
/**
 * 加载项面板内容
 * @param {String} url
 * @return this
 */

    loadContent : function(url){
      var p = this.getContentPanel(true);
      // 设置默认返回应用html内容
      p.getConnectionProvider().loadType = this.loadType||'html';

      var cp = p.getConnectionProvider(), ind = cp.indicator;
      if (!ind) {
          //自定Loading标识
          // 取消iframepanel默认indicatorDisabled:true
          cp.indicatorDisabled = false;
          ind = cp.getIndicator({
            markIndicator: this.onIndicatorStart,
            stopIndicator: this.onIndicatorStop
          });
      }

      if (url || ( (this.autoReload || !this.isContentLoaded()) && !this.isContentBusy())){
        this._dataConnectorId = cp.connect(url || this.src || this.url);
      }
      return this;
    },

/**
 * 指示内容面板是否已加载。
 */
    isContentLoaded : function(){
      return this._dataConnectorId && 
        this.getContentPanel(true)
            .getConnectionProvider()
            .getConnectionQueue()
            .isConnectorLoaded(this._dataConnectorId);
    },
    
    isContentBusy : function(){
      return this._dataConnectorId && 
        this.getContentPanel(true)
            .getConnectionProvider()
            .getConnectionQueue()
            .isConnectorBusy(this._dataConnectorId);
    },
    
    /**
     * TabItem内容面板加载时样式设置,这里主要在TabItem上显示一个loading图标.
     * @private
     */
    onIndicatorStart: function() {
      var item = this.target.bindingTabItem;
      //此时的this为loading indicator.
      item.addClass(item.loadCS);
    },

    onIndicatorStop: function() {
      //此时的this为loading indicator.
      var tg = this.target,
          item = tg.bindingTabItem;
      if (item) {
        item.delClass(item.loadCS);
      }
    },

    //@bug  fixed @v2.0.8.3 reminded by robin {@link http://www.bgscript.com/forum/viewthread.php?tid=38&extra=page%3D1}
    destory: function() {
      this.syncPanelDestory &&
                 this.panel &&
                 this.panel.destory();
      SC.destory.call(this);
    }

  });

  CC.ui.def('tabitem', CC.ui.TabItem);
/**
 * @class CC.ui.Tab
 * @extends CC.ui.Panel
 */
  CC.create('CC.ui.Tab', CC.ui.Panel, {

    keyEvent: true,

    clickEvent : true,

    template: 'CC.ui.TabItemLayout',

    innerCS: 'g-tab',

    keyEventNode: '_scrollor',
    
    vcs : 'g-vtab',
/**
 * @cfg {Boolean} vtab 是否在下部显示
 */
    vtab : false,
    
    selectionProvider : {
      UP: CC.Event.LEFT,
      DOWN: CC.Event.RIGHT,
      tracker:true,
      selectedCS:'g-tab-selectitem'
    },

    syncWrapper : false,

    maxH: 33,

    itemCls: CC.ui.TabItem,
    
    floatCS : 'g-tab-float',
    
/**
 * @cfg {Boolean} autoLoad 子项选择时是否自动加载子项内容, 默认为true
 */
    autoLoad: true,
/**
 * @cfg {Boolean} destoryItemOnclose 当关闭子项时是否销毁子项,默认为false, 子项也可以设置tabItem.destoryOnClose覆盖设置.
 */
    destoryItemOnclose : false,

    lyCfg: {

      navPanelCS: 'g-mov-tab',

      horizonMargin: 5,

      // 该值须与左边导航按钮宽度一致,出于性能考虑,现在把它固定下来
      navLeftWidth: 24,

      // 该值须与右边导航按钮宽度一致,出于性能考虑,现在把它固定下来
      navRightWidth: 24
    },

    initComponent: function() {

      SP.initComponent.call(this);

      this.on('selected', this.onItemSelected);
      
      if(this.vtab){
        this.addClass(this.vcs);
        delete this.vtab;
      }
      
      if(this['float']){
        this.addClass(this.floatCS + (this['float']===true?'':this['float']));
        delete this['float'];
      }
    },

    onItemSelected : function(item){
      if((item.url || item.src) && this.autoLoad){
        item.loadContent();
      }

      var self = this;

      (function(){
        var pre = self.selectionProvider.previous;

        pre && pre.getContentPanel() && !pre.panel.hidden && pre.panel.hide();

        self.displayItem(item, true);

        if (item.getContentPanel())
         item.panel.show();

      }).timeout(0);
    },

    /**
     * 关闭指定TabItem,当只有一个TabItem时忽略.
     * @param {CC.ui.TabItem} tabItem
     */
    close: function(item) {
      item = this.$(item);
      if(item.closeable){
        if (this.fire('close', item) !== false){
          this.displayItem(item, 0);
          this.fire('closed', item);
          if(item.destoryOnClose === true || this.destoryItemOnclose){
            item.destory();
          }
        }
      }
    },

/**
 * 获得内容面板.
 * @return {CC.ui.ContainerBase}
 */
    getContentPanel : function(){
      var cp = this.contentPanel;

      if(typeof cp === 'string')
        cp = this.contentPanel = CC.Base.find(cp);

      return cp;
    },

/**
 * 是否显示指定的TabItem,
 * 参数a可为TabItem实例也可为TabItem的id,b为true或false.
 * @param {CC.ui.TabItem|String} tabItem
 * @param {Boolean} displayOrNot
 */
    displayItem: function(a, b) {
      a = this.$(a);
      //Cann't change this attribute.
      if (!a.closeable && !b) {
        return false;
      }

      var isv = !a.hidden;

      a.display(b);

      var p = this.selectionProvider;
      //切换下一个TabItem
      if (!b && p.selected === a) {
        if(p.tracker.size()){
          var it = p.tracker.pop();
          if(it){
            p.select(it);
            p.tracker.pop();
            return;
          }
        }

        var idx = this.indexOf(a);
        var tmp = idx - 1;
        var chs = this.children;
        while (tmp >= 0 && (chs[tmp].hidden || chs[tmp].disabled)) {
          tmp--;
        }
        if (tmp >= 0) {
          p.select(chs[tmp]);
          return;
        }

        tmp = chs.length;
        idx += 1;
        while (idx < tmp && (chs[idx].hidden || chs[idx].disabled)) {
          idx++;
        }
        if (idx < tmp) {
          p.select(chs[idx]);
        }
      }
    },

/**
 * 返回显示的TabItem个数.
 * @return {Number}
 */
    getDisc: function() {
      var cnt = 0;
      var chs = this.children;
      for (var i = 0, len = chs.length; i < len; i++) {
        if (!chs[i].hidden) {
          cnt++;
        }
      }
      return cnt;
    }
  });

  CC.ui.def('tab', CC.ui.Tab);
})();
﻿if(!CC.ie)
  CC.Tpl.def('CC.ui.FloatTip', '<div class="g-float-tip g-clear"><div class="tipbdy"><div id="_tle" class="important_txt"></div><div id="_msg" class="important_subtxt"></div></div><div class="btm_cap" id="_cap"></div></div>');
else
  CC.Tpl.def('CC.ui.FloatTip', '<table class="g-float-tip g-clear"><tr><td><table class="tipbdy"><tr><td id="_tle" class="important_txt"></td></tr><tr><td id="_msg" class="important_subtxt"></td></tr></table></td></tr><tr><td class="btm_cap" id="_cap"></td></tr></table>');
/**
 * @class CC.ui.FloatTip
 * 浮动提示框,可用于一般的对话提示或鼠标悬浮提示
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.FloatTip', CC.ui.Panel,function(superclass){
  var CC = window.CC;

  //一个全局FloatTip对象
  var instance;

  var Event = CC.Event;
  //
  // 记录鼠标移动时坐标
  //
  var globalPos = [-10000,-10000];

  //当前document是否已绑定鼠标移动监听回调
  var docEvtBinded = false;

  function onDocMousemove(event){
    globalPos = Event.pageXY(event || window.event);
  }
  /**
   * 显示消息提示.<br>
   * 方法来自{@link CC.ui.FloatTip}<br>
   <pre><code>CC.Util.ftip('密码不能为空.', '提示', 'input_el', true, 3000);</code></pre>
   * @param {String} msg 提示消息
   * @param {String} [title] 消息提示标题
   * @param {DOMElement|CC.Base} [target] 消息提示目录元素,消息将出现在该元素左上方
   * @param {Boolean} [getFocus] 提示时是否聚焦到target元素,这对于表单类控件比较有用
   * @param {Number} [timout] 超时毫秒数,即消息显示停留时间
   * @param {Array}  [offsetx, offsety] 显示X，Y增量
   * @method ftip
   * @member CC.Util
   */
  CC.Util.ftip = function(msg, title, proxy, getFocus, timeout, off){
    if(!instance)
      instance = CC.ui.instance({ctype:'tip', showTo:document.body, autoRender:true});
    CC.fly(instance.tail).show().unfly();
    instance.show(msg, title, proxy, getFocus, timeout, off);

    return instance;
  };
  /**
   * 给目标对象绑定悬浮消息.<br>
   * 方法来自{@link CC.ui.FloatTip}<br>
     <pre><code>CC.Util.qtip(input, '在这里输入您的大名');</code></pre>
   * @param {CC.ui.Base} target
   * @param {String} msg
   * @method qtip
   * @member CC.Util
   */
  CC.Util.qtip = function(proxy, msg){
    if(!instance)
      instance = new CC.ui.FloatTip({showTo:document.body, autoRender:true});
    instance.tipFor(proxy, msg);
  };

  return {
    /**
     * @cfg {Number} timeout=2500 设置消失超时ms, 如果为0 或 false 不自动关闭.
     */
    timeout: 2500,
  /**
   * @cfg {Number} delay 显示提示消息的延迟,消息将鼠标位于目标延迟daly毫秒后出现
   */
    delay : 500,

    /**
     * @cfg {Boolean} [reuseable = true] 消息提示是否可复用,如果否,在消息隐藏后自动销毁
     */
    reuseable : true,

    shadow:true,

  /**
   * @cfg {Boolean} qmode 指定是哪种显示风格,一种为mouseover式提示,另一种为弹出提示
   */
    qmode : false,

    zIndex : 10002,
    
  /**
   * @private
   * mouseover式提示时样式
   */
    hoverTipCS : 'g-small-tip',


    initComponent: function() {
      superclass.initComponent.call(this);
      if(this.msg)
        this.setMsg(this.msg);
      this.tail = this.dom('_cap');
      this.setXY(-10000,-10000).setZ(this.zIndex);
      if(this.qmode)
        this.createQtip();
      else this.createFtip();
    }
    ,

    display : function(b){
      if(b && this.timerId){
        this.killTimer();
      }
      return superclass.display.apply(this, arguments);
    },

    onShow : function(){
      superclass.onShow.call(this);
      if(this.timeout)
        this.timerId = this._timeoutCall.bind(this).timeout(this.timeout);
    },

    onHide : function(){
      this.killTimer();
      superclass.onHide.call(this);
      this.setXY(-10000, -10000);
    },

  /**@private*/
    setRightPosForTarget : function(target, off){
      var f = CC.fly(target), xy = f.absoluteXY();
      if(off){
        xy[0] += off[0];
        xy[1] += off[1];
      }
      this.anchorPos([xy[0],xy[1],0,0], 'lt', 'hr', false, true, true);
      f.unfly();
    },

  /**@private*/
    setRightPosForHover : function(xy){
      //box, dir, rdir, off, rean, move
      this.anchorPos([xy[0],xy[1],0,0], 'lb', 'hr', [5,24], true, true);
    },

  /**@private*/
    _timeoutCall : function(){
      superclass.display.call(this, false);
      this.killTimer(true);
      if(this.ontimeout)
        this.ontimeout();
    },
/**
 * 超时显示
 * @private
 */
    killPretimer : function(){
      if(this.pretimerId){
          clearTimeout(this.pretimerId);
          this.pretimerId = false;
      }
    },

  /**
   * 清除当前超时关闭
   * @param {boolean} check 是否作回收(reuseable)检查
   * @private
   */
    killTimer : function(check){

      if(this.timerId){
          clearTimeout(this.timerId);
          this.timerId = false;
      }

      if(!this.reuseable && check)
        this.destory();
    },

  /**
   * 设置提示标题与消息
   * @param {String} msg
   * @param {String} title
   */
    setMsg: function(msg, title) {
      this.fly('_msg').html(msg).unfly();
      if(title)
        this.setTitle(title);

      if(this.shadow && !this.shadow.hidden)
        this.shadow.reanchor();
      return this;
    },

  /**
   * 显示提示.
   * @param {String} msg 提示消息
   * @param {String} [title] 消息提示标题
   * @param {DOMElement|CC.Base} [target] 消息提示目录元素,消息将出现在该元素左上方
   * @param {Boolean} [getFocus] 提示时是否聚焦到target元素,这对于表单类控件比较有用
   * @param {Number} [timout] 超时毫秒数,即消息显示停留时间
   * @param {Array}  [offsetx, offsety] 显示X，Y增量
   */
    show : function(msg, title, target, getFocus, timeout, off){

      if(arguments.length == 0)
        return superclass.show.call(this);

      this.setMsg(msg, title);

      if(timeout !== undefined)
        this.timeout = timeout;

      if(this.qmode)
        this.createFtip();

      this.display(true);
      if(target){
        this.setRightPosForTarget(target, off);
        if(getFocus)
          CC.fly(target).focus(true).unfly();
      }
      return this;
    },
    /**@private*/
    createFtip : function(){
      this.qmode = false;
      this.delClass(this.hoverTipCS);
      if(this.shadow){
        this.shadow.inpactY = -1;
        this.shadow.inpactH = -12;
      }
    },
    /**@private*/
    createQtip : function(){
      this.qmode = true;
      this.addClassIf(this.hoverTipCS);
      if(this.shadow){
        this.shadow.inpactY = CC.ui.Shadow.prototype.inpactY;
        this.shadow.inpactH = CC.ui.Shadow.prototype.inpactH;
      }
    },
  /**
   * 给目标对象绑定悬浮消息.<br>
   * <code>CC.Util.qtip(input, '在这里输入您的大名');</code>
   * @param {CC.ui.Base} target
   * @param {String} msg, 消息
   */
    tipFor : function(proxy, msg, title){
      CC.fly(proxy)
        .domEvent('mouseover',
          function(evt){
            var self = this;
            if(!docEvtBinded){
              Event.on(document, 'mousemove', onDocMousemove);
              docEvtBinded = true;
            }

            //删除
            if(this.pretimerId)
              this.killPretimer();

            this.pretimerId  = (function(){

              self.killTimer();

              self.setMsg(proxy.qtip || proxy.tip || proxy.title || msg, title);
              CC.fly(self.tail).hide().unfly();
              if(!self.qmode){
                self.createQtip();
              }

              self.display(true)
                  .setRightPosForHover(globalPos);
            }).timeout(this.delay);

          }, true, this)
        .domEvent('mouseout', this.onTargetMouseout, true, this)
        .unfly();
    },
  /**@private*/
    onTargetMouseout : function(evt){
      if(this.qmode){
         this.display(false);
      }
      if(docEvtBinded){
        Event.un(document, 'mousemove', onDocMousemove);
        docEvtBinded = false;
      }
      this.killPretimer();
    }
  };
});
CC.ui.def('tip', CC.ui.FloatTip);

﻿/**
 * 具有标题栏的面板容器.
 * @class CC.ui.TitlePanel
 * @extends CC.ui.Panel
 */
CC.Tpl.def('CC.ui.TitlePanel', '<div class="g-panel g-titlepanel"><h3 class="g-titlepanel-hd" id="_tleBar"><a id="_btnFN" class="g-icoFld" href="javascript:fGo()"></a><a id="_tle" class="g-tle" href="javascript:fGo()"></a></h3><div id="_scrollor" class="g-panel-wrap g-titlepanel-wrap"></div></div>');

CC.create('CC.ui.TitlePanel', CC.ui.Panel, function(superclass){
    return {

        unselectable : '_tleBar',

        ct:'_scrollor',

        minH : 22,

        openCS : 'g-icoOpn',

        clsCS  : 'g-icoFld',

        foldNode : '_btnFN',

        initComponent: function() {
            superclass.initComponent.call(this);

            //evName, handler, cancel, caller, childId
            this.domEvent('mousedown', this.onTriggerClick, true, null, this.foldNode)
                .domEvent('mousedown', this.onTitleClick,  true, null, this.titleNode || '_tle');
            //_tleBar
            this.header = this.$$('_tleBar');

            if(this.collapsed)
              this.collapse(this.collapsed, true);
        },

        getWrapperInsets : function(){
          return [this.minH , 0, 0, 0, this.minH, 0];
        },

/**@cfg {Function} onTriggerClick 点击收缩图标时触发,可重写自定*/
        onTriggerClick: function() {
            var v = !this.wrapper.hidden;
            this.collapse(v, true);
        },
/**
 * @cfg {Function} onTitleClick 标题点击时触发,默认执行缩放面板
 */
        onTitleClick : function(){
          this.onTriggerClick();
        },
/**
 * 收缩/展开内容面板
 * @param {Boolean} collapsed
 * @param {Boolean} notifyParentLayout 是否通知父容器的布局管理器,如果布局管理器存在collapse方法，调用该方法折叠控件，否则直接调用doLayout布局.
 */
        collapse : function(b, layout) {
            this.attr(this.foldNode, 'className', b ? this.openCS : this.clsCS);
            this.wrapper.display(!b);
            this.collapsed = b;
            this.fire('collapsed',b);

            if(layout && this.pCt){
              if(this.pCt.layout.collapse)
                this.pCt.layout.collapse(this, b);
              else this.pCt.layout.doLayout();
            }
            return this;
        }
    }
});

CC.ui.def('titlepanel', CC.ui.TitlePanel);
﻿/**
 * @class CC.ui.Foldable
 * @extends CC.Base
 */

/**
 * @cfg {String} nodeBlockMode 指定收缩结点的blockMode:''或block, 参见{@link CC.Base#blockMode}
 */

/**
 * @cfg {String|HTMLElement} foldNode 指定模板中收缩结点或结点ID
 */
 
/**
 * @cfg {Function} getTarget 定义收缩的控件
 */
CC.Tpl.def('CC.ui.Foldable', '<div class="g-foldable"><div class="g-foldablewrap"><b title="隐藏" id="_trigger" class="icos icoCls"></b><div><strong id="_tle"></strong></div></div></div>');

CC.create('CC.ui.Foldable', CC.Base, {

    clsGroupCS: 'g-gridview-clsview',

    unselectable: true,
   
    initComponent: function(){
        CC.Base.prototype.initComponent.call(this);
        this.domEvent('click', this.onTrigClick, true, null);
    },
    
    getTarget : function(){
       if(!this.target.cacheId)
        this.target = CC.Base.find(this.target);
       return this.target;
    },
    
    onTrigClick : function(){
        this.fold(!this.getTarget().hidden);
    },
/**
 * 收缩内容区域.
 * @param {Boolean} foldOrNot
 */
    fold: function(b){
        var t = this.getTarget();
        
        if (this.fire('expand', this, b) !== false) {
            t.display(!b);
            this.dom('_trigger').title = b ? '隐藏' : '展开';
            this.checkClass(this.clsGroupCS, b);
            this.expanded = b;
            this.fire('expanded', this, b);
        }
        //
        return this;
    }
});
CC.ui.def('foldable', CC.ui.Foldable);
﻿/**
 * @class CC.util.IFrameConnectionProvider
 * 封装IFramePanel容器的连接处理.
 * @extends CC.util.ConnectionProvider
 */

/**
 * @cfg {Boolean} traceLoad 是否监听IFRAME加载事件,默认为true
 */

/**
 * @event connection:connectorsopen
 * @param {CC.util.ConnectionProvider} current
 * @param {CC.ui.IFramePanel} iframepanel
 * 由{@link CC.util.ConnectionProvider} 批量请求开始时发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */
 
/**
 * @event connection:connectorsfinish
 * @param {CC.util.ConnectionProvider} current
 * @param {CC.ui.IFramePanel} iframepanel
 * 由{@link CC.util.ConnectionProvider} 批量请求结束后发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */

/**
 * @event connection:success
 * @param {CC.util.ConnectionProvider} current
 * @param {CC.ui.IFramePanel} iframepanel
 * 由{@link CC.util.ConnectionProvider} 加载完成后发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */
 
CC.create('CC.util.IFrameConnectionProvider', CC.util.ConnectionProvider, {

  traceLoad : true,

  indicatorDisabled : true,

  // 默认不处理,重写
  defaultLoadSuccess : fGo,
  
  setTarget : function(t){
  	CC.util.ConnectionProvider.prototype.setTarget.apply(this, arguments);
  	if(t.src || t.url)
  	  this.connect(t.src || t.url);
  },
  
  // @override
  initConnection : function(){
    if(this.traceLoad)
      this.t.domEvent(CC.ie?'readystatechange':'load', this.traceFrameLoad, false, this , this.t.getFrameEl());
    CC.util.ConnectionProvider.prototype.initConnection.apply(this, arguments);
  },
  
  // @override
  createSyncQueue : function(){
    CC.util.ConnectionProvider.prototype.createSyncQueue.call(this);
    
    this.syncQueue.openEvt = 'connection:open';
    this.syncQueue.finalEvt = 'connection:final';
  },

/**@private*/
  onFrameLoad : function(e){
    var t = this.t;
    // as connector status
    t.loaded = true;
    
    try{
      this.t.fire('connection:success', this.t, this);
      if(this.success)
        this.success(this, e);
    }catch(ex){console.warn(ex);}

    this.onFinal();
  },

/**@private*/
  traceFrameLoad : function(evt){
    var status = CC.Event.element(evt).readyState || evt.type,
        t = this.t;
    switch(status){
      case 'loading':  //IE  has several readystate transitions
        if(!this.syncQueue.isConnectorBusy(this.connectorKey)){
          t.fire('connection:open', this.t, this);
        }
      break;
      //
      //当用户手动刷新FRAME时该事件也会发送
      //case 'interactive': //IE
      case 'load': //Gecko, Opera
      case 'complete': //IE
        if(t.getFrameEl().src && t.getFrameEl().src !== 'about:blank')
          this.onFrameLoad(evt);
        break;
    }
  },
/**中止当前连接.*/
  abort : function(){
    this.t.getFrameEl().src = CC.ie?'about:blank':'';
    this.onFinal();
  },

/**@private*/
  onFinal : function(){
    this.t.fire('connection:final', this.t, this);
  },
  
/**@private*/
  bindConnector : function(cfg){

    if(this.connectorKey  && this.syncQueue.isConnectorBusy(this.connectorKey))
      this.abort();
      
    // 加入队列
    this.connectorKey = this.syncQueue.join(this.t);
    CC.extend(this, cfg);
    this.connectInner();
    
    return this.connectorKey;
  },

/**@private*/
  connectInner : function(){
    this.t.fire('connection:open', this.t, this);
    (function(){
      try{
        this.t.getFrameEl().src = this.url;
      }catch(e){
        if(__debug) console.warn(e);
      }
    }).bind(this).timeout(0);
  }
});

CC.Tpl.def('CC.ui.IFramePanel', '<iframe class="g-framepanel" frameBorder="no" scrolling="auto" hideFocus=""></iframe>');
/**
 * @class CC.ui.IFramePanel
 * 面板主要维护一个iframe结点.
 * @extends  CC.ui.Panel
 */
CC.create('CC.ui.IFramePanel', CC.ui.Panel, {
/**
 * @cfg {Boolean} traceResize 是否跟踪IFramePanel父容器宽高改变以便调整自身宽高,默认值为false,
 * 通常并不需要该项,IFramePanel往往是通过父容器的布局管理器来调整它的大小.
 */
  traceResize : false,

  connectionProvider : CC.util.IFrameConnectionProvider,
  // 取消父层默认的_ctx
  ct : undefined,

  onRender : function(){
    CC.ui.Panel.prototype.onRender.call(this);

    var c = this.pCt;

    if(this.traceResize){
      c.on('resized', this.onContainerResize, this);
      this.onContainerResize(false, false, c.wrapper.getWidth(true), c.wrapper.getHeight(true));
    }
  },
/**
 * 获得iframe html结点.
 * @return {HTMLElement} iframe
 */
  getFrameEl : function(){
    return this.view;
  },

/**
 * 获得iframe中的widnow对象.
 * @return {Window} window
 */
  getWin : function(){
    return CC.frameWin(this.getFrameEl());
  },
  
  //
  // 实例化时可重写该方法,以自定义IFRAME宽高.
  //
  onContainerResize : function(a,b,c,d){
    this.setSize(a, b);
  },

  /**
   * 根据结点id返回IFrame页面内元素dom结点.
   * 注:必须在IFrame加载完成后才可正常访问.
   * @return {DOMElement}
   * @method $
   */
  $ : function(id){
    return CC.frameDoc(this.view).getElementById(id);
  },

/**
 * 方法等同于 this.getConnectionProvider().connect(src), 加载一个页面。
 */
  connect : function(src){
    this.getConnectionProvider().connect(src);
  }
}
);

CC.ui.def('iframe', CC.ui.IFramePanel);
﻿CC.Tpl.def('CC.ui.Resizer', '<div class="g-panel g-resizer"><div class="g-win-e" id="_xe"></div><div class="g-win-s" id="_xs"></div><div class="g-win-w" id="_xw"></div><div class="g-win-n" id="_xn"></div><div class="g-win-sw" id="_xsw"></div><div class="g-win-es" id="_xes"></div><div class="g-win-wn" id="_xwn"></div><div class="g-win-ne" id="_xne"></div><div class="g-panel-wrap g-resizer-wrap" id="_wrap"></div></div>');

/**
 * @class CC.ui.Resizer
 * 八个方向都可以缩放的面板.
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Resizer', CC.ui.Panel ,(function(superclass){
  var CC = window.CC, G = CC.util.dd.Mgr, H = G.resizeHelper, E = CC.Event;
    return {

/**
 * @cfg {Boolean} resizeable 是否允许缩放.
 */
        resizeable : true,
/**
 * @cfg {Boolean} enableH 是否允许纵向缩放
 */
        enableH:true,
/**
 * @cfg {Boolean} enableW 是否允许横向缩放
 */
        enableW:true,

        unresizeCS : 'g-win-unresize',

        width:500,

        height:250,

        minW:12,

        minH:6,

/**
 * @event resizestart
 * 缩放开始时发送.
 */
 
/**
 * @private
 */
        onResizeStart : function(nd){
          if(this.resizeable){
            var a = this.absoluteXY(),
                b = this.getSize(true);
            if(!CC.borderBox){
              b.width  -= 1;
              b.height -= 1;
            }
            //记录初始数据,坐标,宽高
            this.initPS = {pos:a,size:b};
            H.applyResize(true, nd.fastStyle('cursor'));
            H.layer.setXY(a)
                   .setSize(b);
            this.fire('resizestart');
          }
        },

/**
 * @event resizeend
 * @param {Array} xy [current_x, current_y]
 * @param {Array} dxy [delta_x, delta_y]
 * 缩放结束后发送.
 */
/**
 * @property initPS
 * 记录缩放开始时控件位置,长度等相关信息.
 * 结构为 {pos:[x,y],size:{width:w, height:h}}
 * @type Object
 */
/**
 * @private
 */
        onResizeEnd : function(){
          var dxy = G.getDXY();
          if(dxy[0] === 0 && dxy[1] === 0){
            H.applyResize(false);
            H.masker.fastStyleSet('cursor','');
          }else if(this.initPS){
            var sz = H.layer.getSize(true);
            //TODO:hack
            if(!CC.borderBox){
              if(sz.width !== 0)
                sz.width += 1;
              if(sz.height !== 0)
                sz.height += 1;
            }
            var dlt = H.layer.xy(),
                ips = this.initPS.pos,
                isz = this.initPS.size,
                dxy = [sz.width - isz.width, sz.height - isz.height],
                sd  = this.shadow,
                sds = sd && !sd.hidden;

            dlt[0] -= ips[0];
            dlt[1] -= ips[1];

            //消除阴影残影
            if(sd && sds)
              sd.hide();

            this.setXY(this.getLeft(true) + dlt[0],
                       this.getTop(true)  + dlt[1])
                .setSize(sz);

            if(sd && sds)
              sd.show();

            this.fire('resizeend', dlt, dxy);

            H.applyResize(false, '');
            delete this.initPS;
          }
        },

        initComponent : function() {
          superclass.initComponent.call(this);
          
          this.cornerSprites = [];
          this.resizeable ? this.bindRezBehavior() : this.setResizable(false);
        },
/**
 * @private
 */
        bindRezBehavior : function(){
         var  end = this.onResizeEnd.bind(this),
                a = this.createRezBehavior(0x8),
                b = this.createRezBehavior(0x4),
                c = this.createRezBehavior(0x2),
                d = this.createRezBehavior(0x1),
                f = this.createRezBehavior('',c,b),
                e = this.createRezBehavior('',b,d),
                g = this.createRezBehavior('',a,c),
                h = this.createRezBehavior('',a,d);

              this.bindRezTrigger('_xn', a,end)
                  .bindRezTrigger('_xs', b,end)
                  .bindRezTrigger('_xw', c,end)
                  .bindRezTrigger('_xe', d,end)
                  .bindRezTrigger('_xes',e,end)
                  .bindRezTrigger('_xsw',f,end)
                  .bindRezTrigger('_xwn',g,end)
                  .bindRezTrigger('_xne',h,end);
        },

/**
 * @private
 */
        bindRezTrigger : function(id, drag, end) {
            var self = this;
            var vid = this.cornerSprites[this.cornerSprites.length] = this.$$(id);

            vid.beforedrag = function(){self.onResizeStart(vid);};
            vid.drag = drag;
            vid.afterdrag = end;
            G.installDrag(vid, true);
            return this;
        },
/**
 * @private
 */
        createRezBehavior : function(axis,a,b) {
            var self = this;
            if(axis == 0x4 || axis == 0x8){
                return function() {
                    if(!self.enableH) {
                        return;
                    }
                    var dxy = G.getDXY();
                    self._zoom(axis, dxy[1]);
                };
            }
            else if(axis == 0x1 || axis == 0x2) {
                return function() {
                    if(self.enableW) {
                      var dxy = G.getDXY();
                      self._zoom(axis, dxy[0]);
                    }
                };
            }else {
                return function(ev) {
                    a.call(this);
                    b.call(this);
                };
            }
        },
/**@private*/
        _zoom : function(axis, pace) {
            var ly = H.layer;
            if((axis & 0x1) !== 0x0) {
                off =  this.initPS.size.width + pace;
                if(off>=this.minW)
                  ly.setWidth(off);
            }

            else if((axis & 0x2) !== 0x0) {
                off = this.initPS.size.width - pace;
                if(off >= this.minW){
                  ly.setWidth(off);
                  off = this.initPS.pos[0] + pace;
                  ly.setLeft(off);
                }
            }

            if((axis & 0x4) != 0x0) {
                off = this.initPS.size.height + pace;
                if(off>=this.minH)
                    ly.setHeight(off);
            }

            else if((axis & 0x8) != 0x0) {
                off = this.initPS.size.height - pace;
                if(off>=this.minH){
                  ly.setHeight(off);
                  off = this.initPS.pos[1] + pace;
                  ly.setTop(off);
                }
            }
        },
/**
 * 设置是否可缩放.
 * @param {Boolean} resizeable
 */
        setResizable : function(resizeable) {
          this.checkClass(this.unresizeCS, !resizeable);
          this.resizeable = resizeable;
        },

        getWrapperInsets : function(){
          return [6,1,1,1,7,2];
        }
    };
}));

CC.ui.def('resizer', CC.ui.Resizer);
﻿/**
 * @class CC.ui.Win
 * window控件
 * @extends CC.ui.Resizer
 */
CC.create('CC.ui.Win', CC.ui.Resizer, function(father){
    var CC = window.CC;
    CC.Tpl.def('CC.ui.win.Titlebar', '<div id="_g-win-hd" class="g-win-hd"><div class="fLe"></div><b class="icoSw" id="_ico"></b><span id="_tle" class="g-tle">提示</span><div class="fRi"></div><div class="g-win-hd-ct" style="position:absolute;right:5px;top:7px;" id="_ctx"></div></div>');
    CC.Tpl.def('CC.ui.win.TitlebarButton', '<a class="g-hd-btn" href="javascript:fGo();"></a>');

    //static变量,跟踪当前最顶层窗口的zIndex
    var globalZ = 900,
        G = CC.util.dd.Mgr,
        H = G.resizeHelper,
        Base = CC.Base,
        SX = Base.prototype.setXY,
        IPXY;

    var wtbDef = {
      ctype:'ct',
      autoRender: true,
      clickEvent : true,
      unselectable:true,
      cancelClickBubble : true,
      itemCfg: { template: 'CC.ui.win.TitlebarButton' },
      ct: '_ctx',
      template:'CC.ui.win.Titlebar',
      selectionProvider : {forceSelect: true, selectedCS : false}
    };

    var wtbClsBtn = {
      ctype:'item',
      cs:'g-win-clsbtn',
      template:'CC.ui.win.TitlebarButton',
      tip:'关闭',
      id:'_cls'
    };
    
    return {
/**
 * @cfg {Boolean} unmoveable 设置该值操纵当前窗口是否允许移动.
 */
        unmoveable : false,
/**
 * @cfg {Boolean} closeable 是否可关闭.
 */
        closeable : true,

        shadow : {ctype:'shadow', inpactY:-1,inpactH:5},

        innerCS : 'g-win g-tbar-win',
/**
 * 最小化时窗口样式
 * @private
 */
        minCS : 'g-win-min',

/**
 * 最大化时窗口样式
 * @private
 */
        maxCS : 'g-win-max',

        minH:30,
/**
 * @cfg {String} overflow 指定内容溢出时是否显示滚动条(overflow:hidden|auto),默认为显示
 */
        overflow:false,

        minW:80,
/**
 * 拖放时窗口透明度
 * @private
 */
        dragOpacity : 0.6,

        initComponent: function() {
          var tle = CC.delAttr(this, 'title');
          father.initComponent.call(this);
          
          //create titlebar
          var tb = this.titlebar;
          if(tb)
            CC.extendIf(tb,wtbDef);
          else tb = wtbDef;
          tb.title = tle;
          
          var tboutter = true, v=tb.view;
          // toolbar view 结点位于window 模板内
          if(v && typeof v === 'string'){
             tb.view = this.dom(v);
             tboutter = false;
          }
          this.titlebar = CC.ui.instance(tb.ctype, tb);
          //recovery
          tb.view = v;
          tb = this.titlebar;
          
          if(tboutter)
            this.addTitlebarNode(tb);
          
          this.follow(tb);
          delete this.title;

          if(this.overflow)
            this.wrapper.fastStyleSet('overflow', this.overflow);

          if(this.closeable === true){
            var cls = tb.clsBtn;
            if(cls)
              CC.extendIf(cls,wtbClsBtn);
            else cls = wtbClsBtn;
            cls.onselect = this.onClsBtnClick;
            v = cls.view;
            if(v && typeof v === 'string'){
               cls.view = this.dom(v);
            }
            this.clsBtn = CC.ui.instance(cls);
            // recovery
            cls.view = v;
            tb.layout.add(this.clsBtn);
          }

          if(this.destoryOnClose)
            this.on('closed', this.destory);

          this.domEvent('mousedown', this.trackZIndex)
              //为避免获得焦点,已禁止事件上传,所以还需调用trackZIndex更新窗口zIndex
              .domEvent('mousedown', this.trackZIndex, true, null, this.titlebar.view)
              .domEvent('dblclick',  this.switchState, true, null, this.titlebar.view);

          if(!this.unmoveable)
            G.installDrag(this, true, tb.view);

          this.trackZIndex();
        },
        
/**
 * @private
 * 重写该接口实现自定义标题栏位置
 * @param {CC.ui.ContainerBase} titlebar
 */
   addTitlebarNode : function(tb){
     this.wrapper.insertBefore(tb);
   },
        beforedrag : function(){
        	if(this.unmoveable)
        		return false;
        },
/**
 * 实现窗口的拖放
 * @private
 * @override
 */
        dragstart : function(){
          if(this.unmoveable || this.fire('movestart') === false)
            return false;

          if (this.shadow)
            this.shadow.hide();

          H.applyMasker(true);
          this.decorateDrag(true);
          IPXY = this.xy();
        },

        drag : function() {
          var d = G.getDXY();
          SX.call(this, IPXY[0] + d[0], IPXY[1] + d[1]);
        },

        dragend : function() {
          H.applyMasker(false);
          if (this.fire('moveend') === false) {
            this.setXY(IPXY);
            this.decorateDrag(false);
            return false;
          }

          //update x,y
          var d = G.getDXY(), ip = IPXY;
          this.left = this.top = false;
          this.setXY(ip[0] + d[0], ip[1] + d[1]);
          this.decorateDrag(false);
          IPXY = null;
        },
/**
 * 拖动前台修饰或恢复窗口效果,主要是设置透明,隐藏内容
 * @private
 * @param {Boolean} decorate 修饰或恢复
 */
        decorateDrag : function(b){
          if(b){
           this.setOpacity(this.dragOpacity)
               .wrapper.hide();
          }else{
           this.setOpacity(1)
               .wrapper.show();
          }
          if (this.shadow)
            this.shadow.display(!b);
        },

/**
 * @private
 * 点击关闭按钮事件.
 * 此时this为按钮
 */
        onClsBtnClick : function(){
          this.pCt.pCt.close();
        },

        setTitle : function(tle) {
          this.titlebar.setTitle(tle);
          return this;
        },
/**
 * 更新窗口系统的zIndex,使得当前激活窗口位于最顶层
 * @private
 */
        trackZIndex : function(){
          if(this.zIndex != globalZ){
            //以2+速度递增,+2因为存在阴影
            globalZ+=2;
            this.setZ(globalZ);
          }
        },

        //override
        setZ : function(zIndex) {
            this.fastStyleSet("zIndex", zIndex);

            //corners
            /*
            for(var i=0,cs=this.cornerSprites,len=cs.length;i<len;i++){
              cs[i].setZ(zIndex + 1);
            }
            */
            //shadow
            if(this.shadow)
              this.shadow.setZ(zIndex-1);

            //cache the zIndex
            this.zIndex = zIndex;

            return this;
        },

        switchState : function(){
          if(this.win_s != 'max')
            this.max();
          else this.normalize();
        },

        getWrapperInsets : function(){
          return [29,1,1,1,30,2];
        },

        setTitle : function(tle){
            if(this.titlebar){
                this.titlebar.setTitle(tle);
                this.title = tle;
            }
            return this;
        },
/**
 * @event close
 * 关闭前发送,返回false取消关闭当前窗口.
 */
 
/**
 * @event closed
 * 关闭后发送.
 */
        /**
         * 关闭当前窗口.
         * @return this;
         */
        close : function(){
            if(this.fire('close')=== false)
                return false;
            this.onClose();
            this.fire('closed');
            return this;
        },

/**
 * @private
 * 默认的关闭处理
 */
        onClose : function(){
            this.display(0);
        },

        _markStated : function(unmark){
          if(unmark){
            var n = CC.delAttr(this, '_normalBounds');
            if(n){
              this.setXY(n[0]);
              this.setSize(n[1]);
            }
          }
          else {
            this._normalBounds = [this.xy(),this.getSize(true)];
          }
        },
        /**
         * 最小化窗口.
         * @return this
         */
        min : function(){
          this.setState('min');
          return this;
        },

        /**
         * 恢复正常
         * @return this;
         */
        normalize : function(){
          return this.setState('normal');
        },
        /**
         * 最大化
         * @return this
         */
        max : function(){
          return this.setState('max');
        },
/**
 * @event statechange
 * 窗口状态改变时前发送.
 * @param {String} status
 * @param {String} previousStatus
 */
/**
 * @event statechanged
 * 窗口状态改变时后发送.
 * @param {String} status
 * @param {String} previousStatus
 */
/**
 * 改变窗口状态
 * 可选状态有<br><div class="mdetail-params"><ul>
 * <li>max</li>
 * <li>min</li>
 * <li>normal</li></ul></div>
 * @param {String} status
 */
        setState : function(st) {
          var ws = this.win_s;

          if(this.win_s == st)
            return this;

          this.fire('statechange', st, ws);

          switch(ws){
            case 'min' :
              this.delClass(this.minCS);break;
            case 'max' : this.delClass(this.maxCS);break;
            default :
              this._markStated();
          }

          switch(st){
            case 'min' :
              if(this.shadow)
                this.shadow.show();
              this.addClass(this.minCS);
              this.setHeight(this.minH);
              break;
            case 'max':
              if(this.shadow){
                this.shadow.hide();
              }
              this.addClass(this.maxCS);
              var sz, p = this.pCt?this.pCt.view : this.view.parentNode;
              if(p === document.body){
                sz = CC.getViewport();
              }
              else{
                p = CC.fly(p);
                sz = p.getSize();
                p.unfly();
              }
              this.setXY(0,0).setSize(sz);
              break;
            //as normal
            default :
              this._markStated(true);
              if(this.shadow)
                this.shadow.show();
          }
          this.win_s = st;

          this.fire('statechanged', st, ws);
          return this;
        }
    };
});
CC.ui.def('win', CC.ui.Win);
﻿CC.Tpl.def('CC.ui.Dialog.Bottom', '<div class="g-win-bottom"><div class="bottom-wrap"></div></div>');
/**
 * @class CC.ui.Dialog
 * 对话框是一个特殊的窗体，底部具有按钮栏，并且可指定是否模式，即是否有掩层。
 * @extends CC.ui.Win
 <pre><code>
 // 
 </code></pre>
 */
 
/**
 * @bottomer {CC.ui.ContainerBase} 底部面板，设置为false时可取消生成底部面板。
 */
 
/**
 * @cfg {Array} buttons 显示的按钮列表
  <pre><code>
  new CC.ui.Dialog({
    ...,
  	buttons : [
  		{title:'关 闭', id:'close'},
  		{title:'忽 略', id:'ignore'}
  	]
  });
 </code></pre>
 */
 
/**
 * @cfg {String} defaultButton 设置默认按钮,该按钮必须在当前按钮列表中
 */

/**
 * @cfg {Boolean} bottomer 设置是否显示底部面板，默认显示。
 */

/**
 * @cfg {Function} on[ReturnCode] 以on+返回码(ID)方式定义按钮选择后的回调方法。
  <pre><code>
  new CC.ui.Dialog({
    ...,
  	buttons : [
  		{title:'关 闭', id:'close'},
  		{title:'忽 略', id:'ignore'}
  	],
  	
  	onclose : function(){
  		...
  	},
  	
  	onignore : function(){
  		....
  	}
  });  
 </code></pre>

 */

/**
 * @property bottomer
 * 底部面板
 * @type {CC.ui.ContainerBase}
 */
CC.create('CC.ui.Dialog', CC.ui.Win, function(superclass){
  var CC = window.CC;
  var Event = CC.Event;
  
  // 当前正在打开的对话框,方便从子frame窗口中关闭父层对话框.
  var Openning;
  
/**
 * 获得最近打开的对话框,方便从子iframe页面中关闭父页面的对话框.
 * @static
 * @return {CC.ui.Dialog}
 */
CC.ui.Dialog.getOpenning = function(){
	return CC.Base.byCid(Openning);
};

CC.ui.def('dlg', CC.ui.Dialog);

  return {
    /**
     * 内部高度，与CSS一致
     * @private
     */
    bottomHeight: 51,
    /**
     * 返回状态值, 可自定,如ok,cancel...,当对话框某个按钮点击并可返回时,返回值为该按钮ID.
     * @type String|Boolean
     */
    returnCode : false,

    defaultButton : false,

    initComponent: function(){
      this.createView();

      this.keyEventNode = this.view;

      //no bottom
      if(this.bottomer === false){
        this.bottomHeight = 0;
      }else this.createBottom();

      superclass.initComponent.call(this);

      if (this.buttons && this.bottomer !== false) {
        this.bottomer.fromArray(this.buttons);
        delete this.buttons;
      }

      if(this.keyEvent)
        this.on('keydown', this.onKeydownEvent, null, true);
    },

    /**
     * 如果按钮的returnCode = false, 取消返回.
     * @private
     * @param {CC.Base} item
     */
    onBottomItemSelected : function(item){
      if(item.returnCode !== false && item.id){
        this.pCt.returnCode = item.id;
        var callFn = this.pCt['on'+item.id];
        // call the callback
        if(!callFn || callFn.call(this.pCt, item) !== false){
        	this.pCt.close();
        }
      }
    },

    /**
     * 监听对话框键盘事件
     * 如果为回车,调用onOk,如果为ESC,调用onCancel
     * @private
     * @param {Event} evt
     */
    onKeydownEvent : function(evt){
      var c = evt.keyCode;
      if (Event.ESC == c) {
        this.onCancel();
      }else if(Event.isEnterKey(evt)){
        this.onOk();
      }
    },

    /**
     * 触发选择默认按钮.
     */
    onOk : function(){
       if(this.bottomer && this.defaultButton){
        this.bottomer.selectionProvider.select(this.defaultButton, true);
       }
    },

    /**
     * @private
     * @override
     */
    onClsBtnClick : function(){
      this.pCt.pCt.returnCode = false;
      superclass.onClsBtnClick.apply(this, arguments);
    },

    /**
     * 对话框以false状态返回.
     */
    onCancel : function(){
      this.returnCode = false;
      this.close();
    },
/**
 * 显示对话框.
 * @param {CC.Base} parent 应用模式掩层的控件,为空时应用到document.body中.
 * @param {Boolean} modal 是否为模态显示.
 * @param {Function} callback 关闭前回调.
 */
    show: function(parent, modal, callback){
      this.modal = modal;
      this.modalParent = parent;
      this.modalCallback = callback;
      return superclass.show.call(this);
    },

    trackZIndex : function(){
      superclass.trackZIndex.call(this);
      if(this.masker){
       this.masker.setZ(this.getZ() - 2);
      }
    },

    onShow : function(){
      superclass.onShow.call(this);
      if (this.modal) {
        var m = this.masker;
        if (!m)
          m = this.masker = new CC.ui.Mask();
        if (!m.target)
          m.attach(this.modalParent || CC.$body);
      }
      this.center(this.modalParent);
      this.trackZIndex.bind(this).timeout(0);
      this.focusDefButton();
      
      // 记录当前打开的对话框
      Openning = this.cacheId;
    },

    onHide : function(){
      if (this.modal) {
        if(this.modalCallback && this.modalCallback(this.returnCode) === false){
           return this;
        }

        this.masker.detach();
        delete this.modal;
        delete this.modalParent;
        delete this.modalCallback;
      }
      superclass.onHide.call(this);
    },

/**
 * 聚焦到默认按钮上
 */
    focusDefButton : function(){
      if(this.bottomer){
        var def = this.bottomer.$(this.defaultButton);
        if(def)
          def.focus(22);
      }
    },

    /**
     * @private
     */
    createBottom: function(){
      var b = this.bottomer = CC.ui.instance(
       CC.extendIf(this.bottomer, {
        ctype:'ct',
        pCt:this,
        itemCls: CC.ui.Button,
        template:'CC.ui.Dialog.Bottom',
        ct : '_wrap',
        clickEvent : 'click',
        keyEvent : true,
        selectionProvider:{forceSelect:true}
       }
      ));

      this.follow(b);
      //监听按钮点击
      b.on('selected', this.onBottomItemSelected);
      this.addBottomNode(b);
    },
    
    addBottomNode : function(bottom){
      this.view.appendChild(bottom.view);
    },
    
    getWrapperInsets: function(){
      var s = this.superclass.getWrapperInsets.call(this),
          h = this.bottomHeight - 1;
      s[2] += h;
      s[4] += h;
      return s;
    }
  };
  
});

﻿CC.Tpl.def('Util.alert.input', '<div class="msgbox-input"><table class="swTb"><tbody><tr><td valign="top"><b class="icoIfo" id="_ico"></b></td><td><span id="_msg" class="swTit"></span>&nbsp;<input type="text" style="" class="gIpt" id="_input"/><p class="swEroMsg"><span id="_err"></span></p></span></td></tr></tbody></table></div>');
CC.extendIf(CC.Util, (function(){
  /**
   * 根据对话框类型过滤按钮
   * 当前this为过滤字符串
   * @private
   * @see CC.ui.ContainerBase#filter
   */
  function buttonMatcher(item){
    return this.indexOf(item.id)>=0;
  }
/**
 * @class CC.Util
 <pre><code>
function allButtons(){
	CC.Util.alert('选择任意按钮','按钮标题',(function(){
		alert('你点击了'+this.returnCode);
	}),'ok|cancel|yes|no|close');
}

//
// 回调函数返回false时不关闭
// 实现自定关闭
//
function callbackReturnFalse(){
	CC.Util.alert('点击时并不会关闭', '', function(){
		CC.Util.ftip("未得到肯定我是不会关闭的!","说明", this);
		return false;
	});
}
//
// alert回调时有alert
//
function alertInAlert(){
	CC.Util.alert('按钮被点击了','按钮标题',(function(){
		CC.Util.alert.bind(CC.Util, this.returnCode).timeout(0);
	}),'ok|cancel|yes|no|close');
}

//
// 显示长篇消息时自动适应高度
//
function longText(){
	CC.Util.alert("    1. 看一本权威的书, 推荐《JavaScript权威指南》(非广告-_-!!)<br><br>    2. 给自己选一个实践的目标,如利用JS做一个UI,或实现某一效果,或做一个小游戏<br><br>    3. 遇到问题先查查资料书,再g.cn,不行再google.com,最后才是问人<br><br>    4. 多看看同行的BLOG,里面有不少经验分享<br><br>    5. 学会调试，推荐Firefox的firebug插件<br><br>    5. 平时勤于独立思考,试试用不同方式模式实现同一效果", "学习JavaScript建议");
}
 </code></pre>

 */
return {
  /**
   * 系统对话框引用,如果要获得系统对话框,请用Util.getSystemWin方法.
   * @private
   */
  _sysWin : null,
  /**
   * 返回系统全局唯一对话框.
   * 该对话框为系统消息窗口.
   * @return {Dialog} 系统对话框
   * @member CC.Util
   */
  getSystemWin: function() {
    var w = this._sysWin;
    if (!w) {
      w = this._sysWin = new CC.ui.Dialog({
        id: 'sysWin',
        //@override 无状态控制
        setState: fGo,
        cs: 'sysWin bot',
        resizeable: false,
        width: 400,
        hidden: true,
        autoRender: true,
        keyEvent : true,
        showTo: document.body,
        //@override 不受窗口zIndex管理
        setZ: fGo,
        //对话框默认按钮
        buttons : [
          {title: '取&nbsp;消',     id :'cancel'},
          {title: '确&nbsp;定',     id :'ok'},
          {title: '&nbsp;否&nbsp;', id :'no'},
          {title: '&nbsp;是&nbsp;', id :'yes'},
          {title: '关&nbsp;闭',     id :'close'}
        ]
      });

      /**
       * 得到inputBox中input元素, getSystemWin().getInputEl()
       * @private
       * @return {Element} inputBox中input元素
       */
      w.getInputEl  = (function(){
        return this.wrapper.dom('_input');
      });
    }
    return w;
  },

  /**
   * 弹出对话框.
   * @param {String} msg 消息
   * @param {String} title 标题
   * @param {Function} callback 当对话框返回时回调
   * @param {String} buttons 显示按钮ID,用|号分隔,如ok|cancel|yes|no
   * @param {Win} modalParent 父窗口,默认为document.body层
   * @param {String} defButton 聚焦按钮ID,默认为 'ok'
   * @member CC.Util
   */
  alert: function(msg, title, callback, buttons, modalParent, defButton) {
    title = title || '提示';
    var s = this.getSystemWin();
    s.setTitle(title)
     .setSize(400, 153)
     .wrapper.html('<div class="msgbox-dlg">' + (msg||'') + '</div>');

    if(!buttons){
      buttons = 'ok';
      defButton = 'ok';
    }

    s.bottomer.filter(buttonMatcher, buttons);

    if(defButton)
      s.defaultButton = defButton;
    s.fastStyleSet('visibility', 'hidden');
    s.show(modalParent||document.body, true, callback);
    (function(){
      s.autoHeight().center(modalParent);
      s.fastStyleSet('visibility', '');
    }).timeout(0);
  },

  /**
   * 弹出输入对话框.
   * 可通过{@link #getSystemWin}().getInputEl()获得输入的input元素.
   * @param {String} msg 消息
   * @param {String} title 标题
   * @param {Function} callback 当对话框返回时回调
   * @param {String} buttons 显示按钮ID,用|号分隔,如ok|cancel|yes|no,默认为ok|cancel
   * @param {Win} modalParent 父窗口,默认为document.body层
   * @param {String} defButton 聚焦按钮ID,默认为 'ok'
   * @member CC.Util
   */
  inputBox: function(msg, title, callback, buttons, modalParent, defButton) {
    title = title || '提示';
    var s = this.getSystemWin();
    s.setTitle(title)
     .setSize(400, 175)
     .wrapper.html(CC.Tpl['Util.alert.input'])
     .dom('_msg').innerHTML = msg;

    var ipt = s.wrapper.dom('_input');

    if(!buttons){
      buttons = 'ok|cancel';
      defButton = 'ok';
    }

    s.bottomer.filter(buttonMatcher, buttons);

    if(defButton)
      s.defaultButton = defButton;

    s.show(modalParent||document.body, true, callback);
    (function(){
      s.getInputEl().focus();}
    ).timeout(80);
  }
};
})());
﻿(function(){

var CC = window.CC;
var Event = CC.Event;
var SPP = CC.util.SelectionProvider.prototype;
/**
 * @class CC.ui.menu
 */
CC.Tpl.def('CC.ui.Menu', '<div class="g-panel g-menu"><div id="_wrap" class="g-panel-wrap"><ul class="g-menu-opt" id="_bdy"  tabindex="1" hidefocus="on"></ul></div></div>')
      .def('CC.ui.MenuItem', '<li class="g-menu-item"><span id="_tle" class="item-title"></span></li>');

CC.create('CC.ui.menu.MenuSelectionProvider', CC.util.SelectionProvider, {
/**
 * 无论选中与否都强迫选择
 */
  forceSelect : true,
/**
 * 取消修饰选择的样式
 */
  selectedCS : false,

//@override
  onSelect : function(item, e){
    item.handleClick(e);
    SPP.onSelect.call(this, item);
  },

 navigateKey : function(e){
   var kc = e.keyCode;
   switch(kc){
      case Event.UP:
        this.t.menubar ? this.tryActive(this.t, true) : this.pre();
        Event.stop(e);
        break;
      case Event.DOWN:
        this.t.menubar ? this.tryActive(this.t, true) : this.next();
        Event.stop(e);
        break;

      case Event.LEFT :
        this.t.menubar ? this.pre() : this.left();
        Event.stop(e);
        break;

      case Event.RIGHT :
        this.t.menubar ? this.next() : this.right();
        Event.stop(e);
        break;

      case Event.ENTER :
        this.enter();
        Event.stop(e);
        break;

      case Event.ESC :
        this.esc();
        Event.stop(e);
        break;
      default : return this.defKeyNav(e);
   }
 },

  // 展开菜单当前项或激活第一个能激活的菜单项
  tryActive : function(menu, exp){
    var o = menu.onItem;
    if(o && o.subMenu){
      o.showMenu(true);
      this.tryActive(o.subMenu);
    }else {
      o = menu.getSelectionProvider().getNext();
      if(o)
        o.active(exp);
    }
  },

  // @override
  getStartIndex : function(){
    var m = this.t, o = m.onItem;
    return o?m.indexOf(o) : -1;
  },

  next : function(){
    var t = this.t, it = this.getNext();
    if(!it) it = t.$(0);
    if(it) it.active(t.menubar);
  },

  pre : function(){
    var t = this.t, it = this.getPre();
    if(!it) it = t.$(t.size() - 1);
    if(it)  it.active(t.menubar);
  },

  left : function(){
    var m = this.t;
    if(m.menubar)
      this.pre();
    else {
      var p = m.pItem;
      if(p){
        p.showMenu(false);
        if(p.pCt.menubar)
          p.pCt.getSelectionProvider().pre();
        else p.active();
      }
    }
  },

  right : function(){
    var m = this.t;
    if(m.menubar)
      this.next();
    else {
      var o = m.onItem;
      if(o && o.subMenu){
        o.showMenu(true);
        this.tryActive(o.subMenu);
      }
      else m.getRoot().getSelectionProvider().next();
    }
  },

  esc : function(){
    var m = this.t, o = m.onItem;
    if(m.menubar){
      if(o){
        o.deactive(true);
        m.setAutoExpand(false);
      }
    }else {
      var sm = o && o.subMenu;
      if(sm && !sm.hidden){
        o.active(false);
      }
      else if(m.pItem)
        m.pItem.active(false);
      else m.hide();
    }
  },

  enter : function(){
    var t = this.t, o = t.onItem;
    if(o) this.select(o);
  }
});

/**
 * @class CC.ui.MenuItem
 * 菜单项被添加到菜单中,它可以被激活,激活后的菜单可方便键盘导航,
 * 菜单项可附有子菜单,菜单项有多种状态,每种状态可有不同的CSS样式:<div class="mdetail-params"><ul>
 * <li>normal(deactive) -- 常态</li>
 * <li>active  -- 激活</li>
 * <li>sub menu expanded -- 子项展开</li></ul>
 * @extends CC.Base
 */
CC.create('CC.ui.MenuItem', CC.Base, function(superclass){
return {

/**
 * 子菜单
 * @type CC.ui.Menu
 */
  subMenu: null,

/**
 * 如果菜单项存在子菜单,附加到菜单项上的样式
 * @type String
 * @private
 */
  subCS : 'sub-x',

/**
 * 激活菜单项,要设置激活菜单项样式.
 * @param {Boolean} expand 激活时是否展开子菜单
 */
  active : function(expand){
    if(!this.disabled){
      var c = this.pCt, o = c.onItem;
      if(o !== this) {
        //每次只允许一个激活
        if(o)
          o.deactive(true);

        if(this.deactiveTimer)
          this.clearDefer();

        c.onItem = this;

        var pi = c.pItem;

        if(pi && !pi.isActive())
            pi.active(expand);

        this.decorateActive(true);
      }

      //激活项时移焦
      c.focus();
      if(this.subMenu)
        this.showMenu(expand);
    }
  },
/**@private*/
  isActive : function(){
    return this.pCt.onItem === this;
  },

/**@private*/
  decorateActive : function(b){
  	this.checkClass(this.pCt.activeCS, b);
  },
  
/**@private*/
  deactive : function(fold){
    var c = this.pCt, m = this.subMenu;
    c.onItem = null;

    if(this.deactiveTimer)
      this.clearDefer();

    this.decorateActive(false);

    if(m && fold && !m.hidden)
      this.showMenu(false);
  },
/**@private*/
  deferDeactive : function(fold){
    this.deactiveTimer = this.deactive.bind(this, fold).timeout(100);
  },
/**@private*/
  clearDefer : function(){
    clearTimeout(this.deactiveTimer);
    this.deactiveTimer = false;
  },
/**@private*/
  decorateExpand : function(b){
  	this.checkClass(this.pCt.expandCS, b);
  },

/**
 * 当选择菜单后调用
 * @private
 */
  handleClick : function(e){
    var p = this.pCt;
    if(p.menubar){
      this.active(true);
      if(!p.contexted)
        p.bindContext();
      p.setAutoExpand(true);
    }else if(this.subMenu){
      this.active(true);
      if(e)
        Event.stop(e);
    }else p.hideAll();
  },

/**
 * 显示/隐藏子项菜单
 * @param b {Boolean} true|false
 */
  showMenu : function(b){
    var m = this.subMenu;
    if(m){
      if(m.hidden !== !b){
        var c = this.pCt;

        if(!m.rendered)
          m.render();

        if(b){
          this.decorateExpand(true);
          m.setZ((c.getZ()||8888)+2);

          //向下展开 或 向右展开
          c.menubar ? m.anchorPos(this, 'lb', 'hr', null, true, true) :
                      m.anchorPos(this, 'rt', 'vd', null, true, true);
          m.focus(0);
        }else {
          this.decorateExpand(false);

          //cascade deactive
          if(m.onItem)
            m.onItem.deactive(true);
        }
        m.display(b);
      }
   }
  },

/**
 * 绑定子菜单
 */
  bindMenu : function(menu){
    menu.pItem = this;
    this.subMenu = menu;
    this.decorateSub(true);
  },

/**@private*/
  decorateSub : function(b){
    this.checkClass(this.subCS, b);
  },

/**
 * 解除子菜单
 */
  unbind : function(){
    var m = this.subMenu;
    if(m){
      this.decorateSub(false);
      delete m.pItem;
      delete this.subMenu;
    }
  },

  initComponent : function(){
    superclass.initComponent.call(this);
    if(this.array){
      var sub = new CC.ui.Menu({array:this.array, showTo:document.body});
      this.bindMenu(sub);
      delete this.array;
    }
  },

/**@private*/
  onRender : function() {
    superclass.onRender.call(this);
    if(this.subMenu){
      if(!this.subMenu.rendered)
        this.subMenu.render();
    }
  },

  destory : function(){
    if(this.subMenu){
      this.subMenu.destory();
      this.unbind();
    }
    superclass.destory.call(this);
  }
  };
});

/**
 * @class CC.ui.Menu 
 * 菜单控件,默认添加在document.body中.
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Menu', CC.ui.Panel, function(superclass) {
return /**@lends CC.ui.Menu#*/{

  hidden : true,

  width : 115,
/**
 * 父菜单项,如果存在
 * @type CC.ui.MenuItem
 */
  pItem: null,

  // 菜单项激活时CSS样式
  activeCS :  'itemOn',

  // 当子菜单显示时,附加到菜单项上的样式
  expandCS : 'subHover',

  clickEvent : 'mousedown',

  shadow : true,

/**
 * @private
 * 当前激活菜单项
 */
  onItem: null,

  selectionProvider : CC.ui.menu.MenuSelectionProvider,

  itemCls : CC.ui.MenuItem,

  ct : '_bdy',

  menubarCS : 'g-menu-bar',

  // 分隔条结点样式
  separatorCS : 'g-menu-separator',

  initComponent: function() {

    if(this.shadow === true)
      this.shadow = new CC.ui.Shadow({inpactH:6,inpactY:-2, inpactX : -5, inpactW:9});

    superclass.initComponent.call(this);

    if(this.menubar)
      this.addClass(this.menubarCS);

    if(this.array){
      this.fromArray(this.array);
      delete this.array;
    }

    //撤消菜单内的onclick事件上传
    //默认为不显示
    this.noUp();

    //容器上监听子项mouseover/mouseout
    this.itemAction('mouseover', this.mouseoverCallback, true);
    this.itemAction('mouseout', this.mouseoutCallback, true);
  }
  ,

/**@private*/
  mouseoverCallback : function(item){
    var pi = this.pItem, o = this.onItem;

    if(o !== item){
      if(o)
        o.deactive(true);

      if(pi && pi.deactiveTimer)
        pi.clearDefer();

      if(this.menubar && !this.autoExpand){
        item.active();
      }else {
        item.active(true);
      }
    }else if(o){
      o.clearDefer();
    }
  },

/**@private*/
  mouseoutCallback : function(item, e){
    if(!this.menubar)
      item.deferDeactive(true);
    else if(!this.autoExpand)
      item.deferDeactive();
  },

/**
 * 把子菜单menu添加到tar项上, 附加子菜单时要按从最先至最后附加,这样事件才会被父菜单接收.
 * @param {CC.ui.Menu} menu
 * @param {CC.ui.MenuItem|Number|String} targetItem 可为一个index,或一个MenuItem对象,还可为MenuItem的id
 */
  attach: function(menu, tar) {
    tar = this.$(tar);
    tar.bindMenu(menu);
    if(this.menubar)
      tar.decorateSub(false);
  }
  ,

  beforeAdd : function(a){
    superclass.beforeAdd.apply(this, arguments);
    if(a.separator){
      this.addSeparator();
      delete a.separator;
    }
    if(this.menubar && a.subMenu)
      a.decorateSub(false);
  },

  beforeRemove : function(a){
    if(a === this.onItem)
      this.onItem.deactive();
    return superclass.beforeRemove.call(this, a);
  },

/**
 * 撤消菜单项上的子菜单
 * @param {Number|CC.ui.MenuItem} targetItem
 */
  detach: function(tar) {
    tar = this.$(tar);
    tar.unbind();
  }
  ,

/**
 * 获得最顶层菜单.
 * @return {CC.ui.Menu}
 */
  getRoot : function(){
    var p = this.pItem;
    if(!p)
      return this;
    return p.pCt.getRoot();
  },

/**
 * 隐藏所有关联菜单.
 */
  hideAll : function(){
    var r = this.getRoot();
      if(r.menubar && r.onItem){
        r.onItem.deactive(true);
        r.setAutoExpand(false);
      }else {
        r.display(false);
      }
  },

  onHide : function(){
    superclass.onHide.call(this);
    if(this.onItem)
      this.onItem.deactive(true);
    this.onDisplay(false);
  },

  onShow : function(){
    superclass.onShow.call(this);
    this.onDisplay(true);
  },

/**
 * @cfg {Function} onDisplay 可重写该方法添加其它控件的一些样式.
 */
  onDisplay : fGo,

/**
 * 是否自动展开子菜单.
 * @param {Boolean} autoExpand
 */
  setAutoExpand : function(b){
    this.autoExpand = b;
  },

/**
 * 添加分隔条.
 */
  addSeparator : function(){
    this._addNode(CC.ui.Menu.Separator.view.cloneNode(true));
  },

/**
 * 在指定坐标或控件下显示菜单.
 <pre><code>
   //在指定坐标显示菜单
   menu.at(110, 120);
   //在指定控件下显示菜单
   menu.at(text);
   //在指定坐标显示菜单,并且点击菜单外部时取消隐藏
   menu.at(110,120,false);
 </code></pre>
 * @param {CC.Base|Number} x
 * @param {Number|Boolean} y
 * @param {Boolean} contexted

 */
  at : function(a,b){
    this.display(true);
    if(typeof a === 'number'){
      this.anchorPos([a, b, 0, 0] ,'lb', 'hr', null, true, true);
      if(arguments[2] !== false && !this.menubar)
        this.bindContext();
    }else {
      this.anchorPos(a ,'lb', 'hr', null, true, true);
      if(b !== false && !this.menubar)
        this.bindContext();
    }
  },

  destory : function(){
    this.each(function(){
      if(this.subMenu && !this.disabledCascadeDel){
        var sub = this.subMenu;
        this.pCt.detach(this);
        sub.destory();
      }
    });
    superclass.destory.call(this);
  }
};
});

CC.ui.Menu.Separator = CC.$$(CC.$C({tagName:'LI', className:CC.ui.Menu.prototype.separatorCS}));
/**
 * 菜单条
 * @class CC.ui.Menubar
 * @extends CC.ui.Menu
 */
CC.create('CC.ui.Menubar', CC.ui.Menu, {
    menubar : true,
    hidden : false,
    shadow : false,
/**@private*/
  onContextedRelease : function(){
    if(this.onItem)
      this.onItem.deactive(true);
    this.getSelectionProvider().select(null);
    this.setAutoExpand(false);
    //无需隐藏
    return false;
  },

/**
 * @private
 * @override
 */
  bindContext : function(){
    return CC.ui.Menu.prototype.bindContext.call(this, this.onContextedRelease);
  }
});

CC.ui.def('menu', CC.ui.Menu);
CC.ui.def('menuitem', CC.ui.MenuItem);
CC.ui.def('menubar', CC.ui.Menubar);

})();
﻿
(function(){

var CC = window.CC;

CC.Tpl.def( 'CC.ui.Tree', '<div class="g-tree"><div class="g-panel-body g-panel-body-noheader" id="_scrollor"><ul id="_ctx" class="g-tree-nd-ct  g-tree-arrows" tabindex="1" hidefocus="on"></ul></div></div>' )
      .def( 'CC.ui.TreeItem', '<li class="g-tree-nd"><div class="g-tree-nd-el g-unsel" unselectable="on" id="_head"><span class="g-tree-nd-indent" id="_ident"></span><img class="g-tree-ec-icon" id="_elbow" src="'+CC.Tpl.BLANK_IMG+'"/><img unselectable="on" class="g-tree-nd-icon" src="'+CC.Tpl.BLANK_IMG+'" id="_ico" /><a class="g-tree-nd-anchor" unselectable="on" hidefocus="on" id="_tle"></a></div><ul class="g-tree-nd-ct" id="_bdy" style="display:none;" tabindex="1" hidefocus="on"></ul></li>' )
      .def( 'CC.ui.TreeItemSpacer', '<img class="g-tree-icon" src="'+CC.Tpl.BLANK_IMG+'"/>');

var cbx = CC.ui.ContainerBase;
var spr = cbx.prototype;

/**
 * 树项.
 * @class CC.ui.TreeItem
 * @extends CC.ui.ContainerBase
 */
 
/**@cfg {Boolean} nodes 树结点是否为目录,默认false.*/

/**@cfg {String} expandEvent 展开/收缩事件，默认为dblclick,当树项双击时展开或收起子项面板，设为false时取消该操作。*/

CC.create('CC.ui.TreeItem', cbx, {
  /**
   * 每个TreeItem都有一个指向根结点的指针以方便访问根结点.
   * @type CC.ui.TreeItem
   */
  root : null,

  ct : '_bdy',

  expandEvent : 'dblclick',
  
  dragNode : '_head',
  hoverCS : 'g-tree-nd-over g-tree-ec-over',
  splitEndPlusCS : 'g-tree-split-end-plus',
  splitEndMinCS : 'g-tree-split-end-minus',
  splitPlusCS : 'g-tree-split-plus',
  splitMinCS :'g-tree-split-minus',
  splitCS : 'g-tree-split',
  splitEndCS : 'g-tree-split-end',
  nodeOpenCS : 'g-tree-nd-opn',
  nodeClsCS : 'g-tree-nd-cls',
  nodeLeafCS : 'g-tree-nd-leaf',
  loadCS:'g-tree-nd-loading',
  /**
   * 空占位结点样式.
   * @private
   */
  elbowLineCS :'g-tree-elbow-line',

  springCS : 'spring',
  /**
   * 鼠标掠过时添加样式的触发结点id
   * @private
   * @see CC.Base#bindAlternateStyle
   */
  mouseoverNode : '_head',

  /**
   * 鼠标掠过时添加样式目标结点id.
   * @private
   */
  mouseoverTarget : '_head',

  nodes : false,

  clickEvent : 'click',

  clickEventNode : '_head',

  initComponent : function(opt) {
    //
    if(!this.root)
      this.root = this;
    if(this.array && !this.nodes)
      this.nodes = true;

    spr.initComponent.call(this);
    this._ident = this.$$('_ident');
    this._elbow = this.$$('_elbow');
    this._head  = this.$$('_head');

    //文件夹
    if(this.nodes) {
      
      if(this.expandEvent)
        this.domEvent(this.expandEvent, this.expand, true, null, this._head.view)
      
      this.domEvent('mousedown', this.expand, true, null, this._elbow.view)
          .domEvent('click', CC.Event.noUp, true, null, this._elbow.view);
    }
    else
      this._head.addClass(this.nodeLeafCS);

    this._decElbowSt(false);
  },
/**
 * 添加小图标.
 * @param {String} cssIcon 图标样式.
 * @param {Object} config  额外信息.
 */
  addIcon : function(icon, cfg){
    var cn = CC.Tpl.$('CC.ui.TreeItemSpacer');
    if(cfg)
      CC.extend(cn, cfg);
    CC.fly(cn).addClass(icon).unfly();
    this.fly(this.titleNode).insertBefore(cn).unfly();
    return this;
  },

  addSpring : function(spring){
    if(spring.view)
      this.follow(spring);
    this.fly(this.titleNode).insertBefore(spring).unfly();
    CC.fly(spring).addClass(this.springCS).unfly();
  },
  
/**
 * 展开/收缩子项.
 * @param {Boolean} expand
 */
  expand : function(b) {
    if(b !== true && b !== false)
      b = !CC.display(this.ct);
    if(this.root.tree.fire('expand', this, b)===false)
      return false;
    this._decElbowSt(b);

    CC.display(this.ct,b);
    this.expanded = b;

    return  this.root.tree.fire('expanded', this, b);
  },

  _decElbowSt : function(b) {
    if(arguments.length==0)
      b = CC.display(this.ct);

    var p = this.pCt;
    var last = (!p) || (p.ct.lastChild == this.view);
    var en = this._elbow,
        sepcs = this.splitEndPlusCS,
        semcs = this.splitEndMinCS,
        spcs = this.splitPlusCS,
        smcs = this.splitMinCS;

    if(this.nodes){
      if(!last) {
          if(en.hasClass(sepcs))
            en.delClass(sepcs);
          else if(en.hasClass(semcs))
            en.delClass(semcs);
      }else {
          if(en.hasClass(spcs))
            en.delClass(spcs);
          else if(en.hasClass( smcs))
            en.delClass(smcs);
      }
      if (b) {
        if(!last)
          en.switchClass(spcs, smcs);
        else
          en.switchClass(sepcs, semcs);
        this._head.switchClass(this.nodeClsCS, this.nodeOpenCS);

      } else {
        if(!last)
           en.switchClass(smcs, spcs);
        else
          en.switchClass(semcs, sepcs);
        this._head.switchClass(this.nodeOpenCS, this.nodeClsCS);
      }
      return;
    }
    //leaf
    (last) ?
      en.switchClass(this.splitCS, this.splitEndCS) :
      en.switchClass(this.splitEndCS, this.splitCS);
  },

  add : function(item) {
    spr.add.call(this, item);
    item._decElbowSt();
    item._applyChange(this);
    var pre = item.previous;
    if(pre){
      pre._decElbowSt();
      pre._applyChange(this);
    }
  },
  /**
   * 该结点发生变动时重组
   * @private
   */
  _applyChange : function(parentNode) {
    //所有事件由据结点的事件监听者接收
    this._applyRoot(parentNode.root);
    this._applySibling();
    this._fixSpacer(parentNode);
    if(this.nodes) {
      this.itemCls = parentNode.root.itemCls;
    }
  },

  _applyRoot : function(root){
    if(this.root === root)
      return;
    this.root = root;
    if(this.nodes){
      var chs = this.children;
      for(var k=chs.length - 1;k>=0;k--){
        if(chs[k].nodes)
          chs[k]._applyRoot(root);
        else chs[k].root = root;
      }
    }
  },

  _applySibling : function(detach){
    if(detach){
      if(this.previous)
        this.previous.next = this.next;

      if(this.next)
        this.next.previous = this.previous;

      this.next = this.previous = null;
      return;
    }

    var ct = this.pCt;
    if(!ct){
      this.previous = this.next = null;
      return;
    }
    c = ct.children, idx = c.indexOf(this);
    this.next = c[idx+1];
    if(this.next)
      this.next.previous = this;
    this.previous = c[idx-1];
    if(this.previous)
      this.previous.next = this;
  },

/**
 * @private
 * 子项点击事件回调,发送clickEvent事件
 */
   clickEventTrigger : function(e){
     this.root.tree.fire('itemclick', this, e);
   },

/**
 * 以深度优先遍历所有子项.
 * @param {Function} callback this为treeItem, 参数为 callback(treeItem, counter), 返回false时终止遍历.
 * @override
 */
  eachH : function(cb, acc){
    var chs = this.children, ch;

    if(acc === undefined) acc = 0;

    for(var i=0,len = chs.length; i<len; i++){
      ch = chs[i];
      if(cb.call(ch, ch, ++acc) === false)
        return false;

      if(ch.nodes)
        if(ch.eachH(cb, acc) === false)
          return false;
    }
  },


  remove : function(item) {
    var item = this.$(item);
    var last = this.children[this.children.length-1] == item;
    var pre = item.previous;
    item._applySibling(true);
    spr.remove.call(this, item);

    //如果删除当前选择项,重设选择为空.
    this.root.tree.getSelectionProvider().onItemRemoved(item);

    if(last)
      if(this.size()>0)
        this.children[this.children.length-1]._decElbowSt();
    if(pre)
      pre._applyChange(this);

    return this;
  },
/**
 * @cfg {Boolean} expanded 是否展开结点.
 */
 
  /**
   * 只有在渲染时才能确定根结点
   * @private
   */
  onRender : function(){
    this.root = this.pCt.root;
    this._applySibling();
    spr.onRender.call(this);
    if(this.expanded){
      delete this.expanded;
      this.expand(true);
    }
  },

  insert : function(idx, item){
    spr.insert.call(this, idx, item);
    item._applyChange(this);
    item._decElbowSt();
  },

  getSpacerNodes : function() {
    var nd = CC.Tpl.forNode(CC.Tpl['CC.ui.TreeItemSpacer']);
    if(this.root === this)
      return nd;

    var chs = this._ident.view.childNodes,
        fr = document.createDocumentFragment();

    for(var i=0,len=chs.length;i<len;i++){
      fr.appendChild(chs[i].cloneNode(true));
    }

    fr.appendChild(nd);

    return fr;
  },

  _fixSpacer : function(parentNode) {
    var sp = this._ident.view;
    sp.innerHTML = '';
    sp.appendChild(parentNode.getSpacerNodes());
    //是否有连接线依据:父层有往下有兄弟结点
    if(parentNode.next)
      CC.addClassIf(sp.lastChild,parentNode.elbowLineCS);

    if(this.nodes){
      for(var i=0,len=this.size();i<len;i++) {
        this.children[i]._fixSpacer(this);
      }
    }
  }
});

CC.ui.TreeItem.prototype.itemCls = CC.ui.TreeItem;

CC.ui.def('treeitem', CC.ui.TreeItem);

var sprs = CC.ui.ContainerBase.prototype;

var undefined = window.undefined;

CC.create('CC.ui.tree.TreeSelectionProvider', CC.util.SelectionProvider, {

  selectedCS : 'g-tree-selected',

  //@override
  decorateSelected : function(it, b){
    var h = it._head, c = this.selectedCS;
    h.checkClass(c, b);
  },

  isSelected : function(item){
    return item._head.hasClass(this.selectedCS);
  },

  getNext : function(t){
    var s = this.selected, root = this.t.root, n, dir;

    if(!s){
      n = root;
    }else {
      n = s;
      dir = !(n.nodes && n.expanded && n.children.length>0);

      if(!dir)
        //向下
        n = n.children[0];

      while(true){
        if(dir){
          if(!n.next){
              //上溯到顶
              if(n === root){
                n = null;
                break;
              }
              n = n.pCt;
              continue;
          }
          n = n.next;
          if(this.canNext(n))
            break;
        }else if(!this.canNext(n)){
          dir = true;
        }else break;
      }
    }
    return n;
  },

  getPre : function(){
    var s = this.selected, root = this.t.root, n;
    if(!s){
      n = root;
    }else {
      n = s.previous;
      while((!n || !this.canPre(n) || (n.nodes && n.expanded && n.children.length>0)) && n != root){
        if(!n){
          n = s===root ? null : s.pCt;
          break;
        }
        else if(n.nodes && this.canPre(n)){
          n = n.children[n.children.length-1];
        }else n = n.previous;
      }

      if(n===s)
        n = null;
    }
    return n;
  }
});


CC.create('CC.ui.tree.TreeItemLoadingIndicator', CC.ui.Loading, {

  markIndicator : function(){
    this.target._head.addClass(this.target.loadCS);
  },

  stopIndicator : function(){
    var t = this.target;
    t._head.delClass(t.loadCS);
    //@bug reminded by earls @v2.0.8 {@link http://www.bgscript.com/forum/viewthread.php?tid=33&extra=page%3D1}
    if(t.getConnectionProvider()
        .getConnectionQueue()
        .isConnectorLoaded(t._dataConnectorId)){
      t.expand(true);
    }
  }
});


CC.ui.TreeItem.prototype.indicator = CC.ui.tree.TreeItemLoadingIndicator;

/**
 * @class CC.ui.Tree
 * 树形控件, 可以指定一个根结点root,或者由树自己生成.<br>
 * <pre><code>
  var tree = new CC.ui.Tree({
    root:{
      title:'title of tree'
      // 子项数据
      array:[
        {title:'leaf'},
        {title:'nodes', nodes:true}
      ]
    },
    
    // 展开自动ajax加载
    autoLoad : true,
    parentParamName : 'pnodeid',
    url : 'http://www.example.com/tree'
  });
   </code></pre>
 * @extends CC.ui.ContainerBase
 */

/**
 * @event expand
 * 展开/收缩前发送,可返回false取消操作.
 * @param {CC.ui.TreeItem} treeItem 当前操作的树项.
 * @param {Boolean} expand 指示当前操作是展开或收缩. 
 */
/**
 * @event expanded
 * 展开/收缩后发送
 * @param {CC.ui.TreeItem} treeItem 当前操作的树项.
 * @param {Boolean} expand 指示当前操作是展开或收缩. 
 */
var rootCfg = {
  nodes : true,
  draggable : false,
  itemCls : CC.ui.TreeItem,
  ctype:'treeitem'
};

CC.create('CC.ui.Tree', CC.ui.ContainerBase, {

  ct : '_ctx',
/**
 * @cfg {String} url 设置自动加载子项数据时请求的url.参见{@link #autoLoad}, {@link #parentParamName}.
 */
  url : false,
/**
 * @cfg {Boolean} autoLoad 展开时是否自动加载子项数据,参见{@link #parentParamName}, {@link #url}.
 */
  autoLoad : false,
/**
 * @cfg {String} parentParamName 设置自动加载子项时父结点id提交参数的名称,默认为pid=pCt.id.
 */
  parentParamName : 'pid',

  keyEvent : true,
  
  clickEventTrigger : CC.ui.TreeItem.prototype.clickEventTrigger,

  /**
   * @private
   * 项的选择事件触发结点为视图中指向的id结点.
   */
  clickEventNode : '_head',

  clickEvent : true,

  selectionProvider : CC.ui.tree.TreeSelectionProvider,

  initComponent : function() {
    var arr = CC.delAttr(this, 'array');
    sprs.initComponent.call(this);

    if(!this.root || this.root.cacheId === undefined) {
      var cfg = this.root || this.rootCfg;
      if(cfg)
        delete this.rootCfg;
      this.root = this.instanceItem(CC.extendIf(cfg, rootCfg));
    }
    
    if(this.hideRoot){
      this.root._head.hide();
      delete this.hideRoot;
    }
    
    this.root.tree = this;

    var self = this;
    this.add(this.root);
    this.on('expand', this.onExpand, this);
  },

  /**
   * @private
   * 自动加载功能
   */
  onExpand : function(item, b) {
    //
    // 如果结点已经加载,忽略.
    //
    if(this.autoLoad  && b){
      if(!this.isItemRequested(item)){
        this.loadItem(item);
        return (item.children.length>0);
      }
    }
  },

/**
 * 当autoLoad为true时,结点展开即时加载,也可以调用该方法手动加载子结点
 * 加载子项, 该方法通过子项的connectionProvider来实现载入数据功能.
 * @param {CC.ui.TreeItem} treeItem
 */
  loadItem : function(item){
      var url = this.getItemUrl(item);
      if(url){
        var cp = item.getConnectionProvider(), ind = cp.getIndicator();
        if(!this.isItemRequested(item)){
          item._dataConnectorId = cp.connect(url);
        }
      }
  },

/**
 * 判断子项数据是否加载中。
 * @param {CC.ui.TreeItem} treeItem
 */
  isItemRequested : function(item){
    return !!item._dataConnectorId; 
    // item.getConnectionProvider().getConnectionQueue().isConnectorBusy(item._dataConnectorId);
  },
  
/**
 * 获得子项用于请求数据的url,可重写该方法,自定义请定的URL.
 */
  getItemUrl : function(item){
    var url = CC.templ(this, this.url);
    if(url){
      //@bug reminded by earls @v2.0.8 {@link http://www.bgscript.com/forum/viewthread.php?tid=33&extra=page%3D1}
      //contains '?' already ??
      url+= (url.indexOf('?') > 0 ?'&':'?') + encodeURIComponent(this.parentParamName)+'='+encodeURIComponent(item.id);
    }
    return url;
  },

/**
 * 该方法在树控件类中已被保留，取而代之的是{@link findH}方法
 */
  $ : function(id){
    return id;
  },

/**
 * 遍历树所有结点(包括深层结点)
 */
  each : function(cb){
    var r = this.root;
    if(cb.call(r, r, 0) !== false)
      return r.eachH(cb, 1);
  },
  // @override fix ie no horizon scrollbar
  setSize : function(w, h){
    sprs.setSize.apply(this, arguments);
    if(w !== false && CC.ie){
      var sc = this.getScrollor();
      if(sc !== this) 
      	CC.fly(sc).setWidth(this.width).unfly();
    }
  }
});

CC.ui.def('tree', CC.ui.Tree);

})();
(function() {
  var CC = window.CC;
  var spr = CC.ui.Panel.prototype;
  var DP;

  var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  //是否闰年
  function isLeapYear(year) {
    return !! ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
  }
  //指定月天数,mm由1开始
  function sumDays(yy, mm) {
    return (mm != 2) ? monthDays[mm - 1] : (isLeapYear(yy)) ? 29 : 28;
  }
  //该月的第一天为星期几
  function firstDayOfMonth(date) {
    var day = (date.getDay() - (date.getDate() - 1)) % 7;
    return (day < 0) ? (day + 7) : day;
  }

  var Event = CC.Event;

  CC.Tpl.def('CC.ui.Datepicker', '<div class="g-datepicker" ><div style="position: relative;"><table cellspacing="0" cellpadding="0" class="entbox"><tbody><tr><td class="headline"><table width="100%" cellspacing="0" cellpadding="1" align="center" class="dxcalmonth"><tbody><tr><td align="left" class="month_btn_left"><span></span></td><td align="center"><table cellspacing="0" cellpadding="0" align="center"><tbody><tr><td><div id="_seltor" class="g-datepicker-selecor" style="display:none;"></div><div id="_planeY" class="planeYear" style="cursor: pointer;">1955</div></td><td class="comma">,</td><td><div id="_planeM" class="planeMonth" title="点击选择或直接输入年份值"></div></td></tr></tbody></table></td><td align="right" class="month_btn_right"><span></span></td></tr></tbody></table></td></tr><tr><td><table width="100%" cellspacing="0" cellpadding="0" class="g-datepicker-body"><tbody><tr><th class="month_spr"><span>月</span></th><th><span>日</span></th><th><span>一</span></th><th><span>二</span></th><th><span>三</span></th><th><span>四</span></th><th><span>五</span></th><th><span>六</span></th><th class="month_spr"><span>月</span></th></tr></tbody></table></td></tr><tr><td id="_monthWrap"></td></tr><tr><td style="text-align:center;padding-bottom:5px;" id="_tdytd"></td></tr></tbody></table><div class="leftsplit" id="_preBar" onmouseover="CC.addClass(this, \'leftsplitOn\')" onmouseout="CC.delClass(this, \'leftsplitOn\')" ></div><div class="rightsplit" onmouseover="CC.addClass(this, \'rightsplitOn\')" onmouseout="CC.delClass(this, \'rightsplitOn\')" id="_nxtBar"></div></div></div>');
/**
 * @class CC.ui.Datepicker
 * @extends CC.ui.Panel
 */
  CC.create('CC.ui.Datepicker', CC.ui.Panel, {

    shadow: true,

    unselectable: true,

    eventable: true,

    value: new Date(),

    fmt: 'yy/mm/dd',

    mm: null,

    yy: null,

    dd: null,

    keyEvent : true,

    initComponent: function() {

      spr.initComponent.call(this);

      this.monthWrap = this.dom('_monthWrap');

      this.domEvent('click', this.onDayClick, true, null, this.monthWrap)
          .domEvent('click', this.onYearList, true, null, '_planeY')
          .domEvent('click', this.onNavBarMove, true, null, '_nxtBar')
          .domEvent('click', this.onNavBarMove, true, null, '_preBar');

      if (CC.Util.qtip)
        CC.Util.qtip(this.$$('_planeY'), '点击选择或直接输入年份值');
      if (this.value)
        this.setValue(this.value, true);

      this.todayBtn = new CC.ui.Button({ showTo: this.dom('_tdytd'), title: '今天' });

      this.follow(this.todayBtn)
          .domEvent('click', this.toToday, true, null, this.todayBtn.view)
          .selectorNode = this.dom('_seltor');
    },

    _hideYearSel: function() {
      CC.fly(this.selectorNode)
        .display(false)
        .unfly();
    },

    onNavBarMove: function(evt) {
      var el = Event.element(evt);
      el.id == '_nxtBar' ?
        this.selectYear(this.yy + 1)
      : this.selectYear(this.yy - 1);
    },
/**
 * 选择年
 * @param {Number}
 */
    selectYear: function(yy) {
      this.setValue(new Date(yy, this.mm, 1), true);
    },
/**
 * 获得今日日期
 */
    toToday: function() {
      this.setValue(new Date());
    },

    onYearList: function() {
      var dv = this.selectorNode;
      CC.fly(dv)
        .bindContext()
        .display(true)
        .unfly();

      if (!dv.firstChild)
        this.createList();

      dv.firstChild.value = this.yy;
      dv.lastChild.value = '';

      (function() {
        dv.lastChild.focus();
      }).timeout(20);
    },

    createList: function() {
      var dv = this.selectorNode,
          pan = this.fly('_planeY'),
          sz = pan.getSize();
      dv.innerHTML = this.getSelectListHtml();

      var sel = dv.firstChild,
          txt = dv.lastChild;

      pan.unfly();

      CC.fly(txt)
        .fastStyleSet('width', sel.offsetWidth)
        .fastStyleSet('height', sel.offsetHeight)
        .unfly();

      this.domEvent('change', function() {
        this.selectYear(sel.value);
        this._hideYearSel();
      },
      false, null, sel);

      this.noUp('click', dv)
          .bindEnter(function() {
        var v = parseInt(txt.value.trim());
        if (!isNaN(v)) this.selectYear(v);
        this._hideYearSel();

      }, true, null, txt);

    },

    getSelectListHtml: function() {
      var html = ['<select>'],
          ys = this.selectYearStart || 1900,
          es = this.selectYearEnd || 2100;
      for (var i = ys; i <= es; i++) {
        html.push('<option value="' + i + '">' + i + '</option>');
      }
      html.push('<input type="text" class="g-corner" />');
      return html.join('');
    },

    onDayClick: function(evt) {
      var el = Event.element(evt);
      if (el == this.monthWrap) return;
      var id = CC.tagUp(el, 'TD').id;
      if (id.indexOf('/') > 0) this.setValue(new Date(id));
      else this.setValue(new Date(this.yy, parseInt(id), 1), true);
    },
/**
 * 设置日期.
 * @param {String|Date}
 */
    setValue: function(v, cancelEvent) {
      var pre = this.currentDate;
      if (!CC.isDate(v)) {
        v = CC.dateParse(v, this.fmt);
      }

      var yy = v.getFullYear();
      if (isNaN(yy)) {
        if (__debug) console.log('invalid date :' + v);
        return;
      }

      var mm = v.getMonth(),
          dd = v.getDate();

        this.yy = yy;
        this.mm = mm;
        this.dd = dd;

        this.currentDate = v;
        this.update(pre);
        if (!cancelEvent && (!this.disableFilter || !this.disableFilter(yy, mm, dd)))
          this.fire('select', CC.dateFormat(v, this.fmt), v);
    },

    update: function(preDate) {
      var mm = this.mm + 1,
          yy = this.yy,
          dd = this.dd;


      this.dom('_planeM').innerHTML = mm + '月';
      this.dom('_planeY').innerHTML = yy + '年';

      var mw = CC.fly(this.monthWrap),
          id;
      if (preDate && yy == preDate.getFullYear() && mm == preDate.getMonth() + 1) {
        id = (preDate.getMonth() + 1) + '/' + preDate.getDate() + '/' + preDate.getFullYear();
        CC.delClass(mw.dom(id), 'selday');
      } else this.monthWrap.innerHTML = this.getMonthHtml(this.currentDate);

      id = mm + '/' + dd + '/' + yy;
      var dom = mw.dom(id);
      if (dom) CC.addClass(dom, 'selday');
      mw.unfly();
    },

    getMonthHtml: function(date) {
      var html = [], tod = new Date(), toy = tod.getFullYear();
      var mm = date.getMonth() + 1,
          yy = date.getFullYear(),
          days = sumDays(yy, mm),
          ct = mm - 1,
          py = yy,
          ny = py,
          preM = ct == 0 ? 12 : ct;

      if (preM == 12) py -= 1;

      ct = mm + 1;

      var nxtM = ct > 12 ? 1 : ct;

      if (nxtM == 1) ny += 1;

      var fstday = firstDayOfMonth(date),
          psum = sumDays(py, preM),
          psd = psum - fstday + 1;

      //sunday, show more days to previous month.
      if (fstday == 0) psd = psum - 6;

      html.push('<table class="g-datepicker-days"  width="100%" cellspacing="0" cellpadding="0"><tbody>');
      //visible two months
      var state = 0,
      cls = 'preday',
      m = preM,
      y = py,
      df = this.disableFilter;

      for (var i = 0; i < 6; i++) {
        //week days
        html.push('<tr><td class="month_sep');

        if((i+1) === mm)
          html.push(' selmonth');

        html.push('" id="' + i + '"><a href="javascript:fGo()" hidefocus="on">' + (i + 1) + '</a></td>');
        for (var j = 0; j < 7; j++) {
          html.push('<td class="' + cls);
          if (j == 6) html.push(' sateday');
          else if (j == 0) html.push(' sunday');

          if (df)
            if (df(y, m, psd))
              html.push(' disabledday');

          html.push('" id="' + m + '/' + psd + '/' + y + '"><a');
          if(toy === y && (tod.getMonth() + 1) === m && tod.getDate() === psd){
            html.push(' class="today" title="今天:'+ y + '年' + m + '月' + psd +'日"');
          }
          html.push(' href="javascript:fGo()" hidefocus="on">' + psd + '</a></td>');

          psd++;
          if (psd > psum && state == 0) {
            psd = 1;
            state = 1;
            cls = 'curday';
            m = mm;
            y = yy;
          } else if (state == 1 && psd > days) {
            state = 2;
            psd = 1;
            cls = 'nxtday';
            m = nxtM;
            y = ny;
          }
        }
        html.push('<td class="month_sep month_r');

        if((i+7) === mm)
          html.push(' selmonth');

        html.push('" id="' + (i + 6) + '"><a href="javascript:fGo()" hidefocus="on">' + (i + 7) + '</a></td></tr>');
      }
      html.push('</tbody></table>');
      return html.join('');
    }
  });

  DP = CC.ui.Datepicker;

  DP.dateFormat = 'yy/mm/dd';

  var instance;
  function onselect(v) { (function() {
      instance.hide();
      instance.bindingEditor.value = v;
      instance.bindingEditor = null;
    }).timeout(200);
  }

  function showDatepicker() {
    var dp = instance,
    f = CC.fly(dp.bindingEditor);
    dp.display(true);
    dp.setValue(dp.bindingEditor.value.trim(), true);
    //get the right position.
    dp.anchorPos(f, 'lb', 'hr', null, true, true);
    f.unfly();
    dp.bindContext();
  }

  DP.getInstance = function(){
    if (!instance) {
      instance = DP.instance = new DP({
        hidden: true,
        showTo: document.body,
        autoRender: true
      });
      instance.on('select', onselect);
    }
    return instance;
  };

  /**
 * 全局实例
 * 用法 <pre><input type="text" onclick="Datepicker.show(this)" /></pre>
 * @member CC.ui.Datepicker
 * @method show
 * @static
 */
  DP.show = function(input) {
    DP.getInstance();
    instance.dateFormat = DP.dateFormat;
    instance.bindingEditor = input;
    showDatepicker(true);
  };
})();
﻿(function(){

var CC = window.CC,
    Math = window.Math,
    undefined,
    B = CC.Base,
    C = CC.Cache;
/**
 * @class CC.ui.grid
 */

/**
 * @class CC.ui.grid.plugin
 */
 
/**
 * @class CC.ui.grid.Column
 * 表格中的列,包含在表头中.
 */
 
/**@cfg {Boolean} resizeDisabled 是否禁止改变列宽*/

/**
 * @cfg {Function} cellBrush 可以统一设置该列数据的显示数据的具体内容, 返回字符串以innerHTML形式加进表单元格的内容元素中.
 <pre><code>
   header : {array:[ {title:'第一列' , cellBrush : function( v ){ return '<b>'+v+'</b>' } } ]}
 </code></pre>
 * @param {Object} cellValue
 * @return {String}
 */
 
/**
 * @cfg {Function} sortDecorator decorator(order, precolumn)
 */
 
/**
 * @event colwidthchange
 * 列宽改变前发送.
 * @param {Number} columnIndex
 * @param {CC.ui.grid.Column} column
 * @param {Number} width
 * @param {Number} dx 前后改变宽差
 * @member CC.ui.Grid
 */

/**
 * @event aftercolwidthchange
 * 列宽改变后发送.
 * @param {Number} columnIndex
 * @param {CC.ui.grid.Column} column
 * @param {Number} width
 * @param {Number} dx 前后改变宽差
 * @member CC.ui.Grid
 */

/**
 * @event showcolumn
 * 显示或隐藏列后发送
 * @param {Boolean} displayOrNot
 * @param {CC.ui.grid.Column} column
 * @param {Number} columnIndex
 */
 
/**
 * @property locked
 * 列是否已锁定,该属性主要提供给控制列宽的插件,提示该列宽已锁定,将影响自适应宽度的计算,参见{@link lock}.
 * @type Boolean
 */

CC.create('CC.ui.grid.Column', B, function(father){

    return {

        // bdEl,
        resizeDisabled : false,

        sortedCS : 'sorted',
        
        ascCS : 'asc',
        
        descCS :'desc',
        
        sortIndicatorCS : 'sort-icon',
          
        createView : function(){
          this.view = CC.$C({
            tagName:'TD',
            innerHTML : '<div class="hdrcell"></div>'
          });
          
          this.bdEl = this.view.firstChild;
          this.createViewBody(this.bdEl);
        },
/**
 * 创建td内容结点,这里是一个div
 * @private
 */
        createViewBody : function(bd){
          bd.appendChild(CC.$C({
                      tagName: 'span',
                      id: '_tle'
          }));
        },

        onRender : function(){
          //忽略列宽设置(父onRender将设置宽度)
          if(this.width !== false){
            var w = CC.delAttr(this, 'width');
            father.onRender.call(this);
            this.width = w;
          } else {
            father.onRender.call(this);
          }
        },

        cellBrush : function(v){
          return v;
        },

        sortDecorator : function(order, pre){
            this.addClassIf(this.sortedCS);
            
            if(pre && pre !== this &&  !pre.order){
              pre.checkClass(this.descCS, false);
              pre.checkClass(this.ascCS,  false);
            }
            
            var desc = (order === 'desc');
            this.switchClass(
                            desc?this.ascCS:this.descCS, 
                            desc?this.descCS:this.ascCS
                           );
            
            if(this.pCt){
               var decEl = this.pCt._sortDecorateEl;
               if(!decEl){
                 decEl = this.pCt._sortDecorateEl = CC.Tpl.forNode('<span class="'+this.sortIndicatorCS+'"></span>');
               }
               if(decEl.parentNode !== this.bdEl)
                 this.bdEl.appendChild(decEl);
            }
        },
        
/**
 * 此时Column的setWidth不再执行具体的设宽操作,
 * 而是向grid发送一个事件,让其它处理列宽的插件(通常是表头)来执行实际的设宽操作,
 * 这也是有理由的,因为单单一个Column它并不知道全局是如何安排列宽的.
 * 尽管这样,setWidth对话外部来说,还是可以正常调用,它并不影响方法来本的意义,只是
 * 具体操作托管了.
 * @param {Number} width
 * @private
 */
        setWidth : function(w, autoLock){
          var p = this.pCt;
          var pr = this.preWidth, dx;

          dx = !pr ? false : w - pr;

          if(p){
            
            // 锁定列宽,使得列宽改变能正确完成.
            if(autoLock) this.lock(true);
            // 留给事件处理器来设置列宽
            // 并更新this.width
            p.fireUp('colwidthchange', this.pCt.indexOf(this), this, w, dx);
            //
            if(w !== this.width){
              w  = this.width;
              if(dx !== false)
                dx = w - pr;
            }
            p.fireUp('aftercolwidthchange', this.pCt.indexOf(this), this, w, dx);
            
            if(autoLock) this.lock(false);
          }
          // cached the width for init.
          else this.width = w;
          
          this.preWidth = w;
          
          return this;
       },
       
       onShow : function(){
         this.pCt.fireUp('showcolumn', true, this, this.pCt.indexOf(this));
       },
       
       onHide : function(){
         this.pCt.fireUp('showcolumn', false, this, this.pCt.indexOf(this));
       },
       
       locked : 0,
 /**
  * 锁定/解锁列宽,该属性主要提供给控制列宽的插件,提示该列宽已锁定,将影响自适应宽度的计算,参见{@link locked}.
  */
        lock : function(locked){
          locked ? this.locked ++ : this.locked --;
          if(this.locked<0){
            if(__debug) throw 'lock operation failed: locked < 0';
            this.locked = 0;
          }
        }
    };
});

CC.Tpl.def('CC.ui.Grid', '<div class="g-grid"></div>');

/**
 * @class CC.ui.Grid
 * 表,实体主要由 表头(Header) + 内容(Content) + 插件(plugins) 组成.
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Grid', CC.ui.Panel, function(father){

return {
  
  layout:'row',
/**
 * @cfg {Array} plugins 存放表内容的插件,
 * 通过 CC.ui.Grid.prototype.plugins.push(pluginDefinitions) 可以向全局表组件添加一个插件.<br>
 * 插件格式为:
 <pre><code>
  plugins : [
    {
      // name ,名称,以后可通过grid[name]访问插件
      name:'header', 
      // 权重,影响插件初始化顺序
      weight:-100, 
      // 插件类
      ctype:'gridhd'
    },
    
    {name:'content',weight:-80,  ctype:'gridcontent'}
  ]
 </code></pre>
 */
  plugins : [
    {name:'header', ctype:'gridhd'},
    {name:'content',ctype:'gridcontent'}
  ],

  initComponent : function(){

    father.initComponent.call(this);
    
    var pls = this.getInitPlugins();
    
    //初始化插件
    this.plugins = this.addPluginsInner(pls);
  },

  onRender : function(){
    var w = false, h = false;

    // 全部子控件rendered后调用后再设width, height
    if(this.width !== false)
      w = CC.delAttr(this, 'width');

   if(this.height !== false)
      h = CC.delAttr(this, 'height');
      
   father.onRender.call(this);
   
   if(w !== false || h !== false)
    this.setSize(w, h);
  },

// -------------------------------------------------------
//
// 表格插件支持实现,插件是在容器事件模型的基础上的功能扩展
//
// -------------------------------------------------------
  
/**
 * 从对象实例到对象原型链接枚举事件处理函数,并注册到表格中.
 * @param {CC.Base} component
 * @private
 */
  extraRegisterEventMaps : function(comp){
    var maps = CC.getObjectLinkedValues(comp, 'gridEventHandlers', true);
    for(var i=0,len=maps.length;i<len;i++){
      this.attachPluginEventHandlers(comp, maps[i]);
    }
  },
  
/**
 * key as event name, value as event handler
 * @param {CC.Base} component
 * @param {Object} gridEventMap
 * @private
 */
  attachPluginEventHandlers : function(comp, map){
    if(typeof map === 'function')
       map = map(comp);
     
    for(var k in map)
      this.on(k, map[k], comp);
  },

/**
 * 权重值越小越排前
 * @private
 */
  pluginComparator : function(p1, p2){
    var w1 = p1.weight === undefined? p1.ctype? CC.ui.getCls(p1.ctype).prototype.weight:0 : p1.weight;
    var w2 = p2.weight === undefined? p2.ctype? CC.ui.getCls(p2.ctype).prototype.weight:0 : p2.weight;
    if(w1 === w2)
      return 0;
    return w1 < w2 ? -1 : 1;
  },
  
/**
 * 获得将要初始化的插件列表.
 * @private
 * @return {Array} 返回要初始化的插件列表
 */
  getInitPlugins : function(){
    var arrs = CC.getObjectLinkedValues(this, 'plugins'), pls;
    //merge arrays
    if(arrs.length === 1){
      pls = arrs[0];
    }else if(arrs.length === 0){
      return arrs;
    }else {
      pls = [];
      for(var i=0,len=arrs.length;i<len;i++){
        pls = pls.concat(arrs[i]);
      }
    }
    return pls;
  },
/**
 * @event beforeaddPLUGINNAME
 * 在附有UI的插件当UI添加到表格前该事件都会发送,如添加了一个工具条插件,名称为tb,就会发送beforeaddtb.
 * @param {CC.Base} pluginUI 添加到表格的控件,该控件由{@link #initPlugin}返回
 * @param {Object} plugin 当前插件实例
 */
/**
 * @event afteraddPLUGINNAME
 * 在附有UI的插件当UI添加到表格后该事件都会发送,如添加了一个工具条插件,名称为tb,就会发送afteraddtb.
 * @param {CC.Base} pluginUI 添加到表格的控件,该控件由{@link #initPlugin}返回
 * @param {Object} plugin 当前插件实例
 */
/**
 * @event beforeinitPLUGINNAME
 * 在初始化插件前,发送该事件.如一个工具条插件,名称为tb,初始化前就会发送beforeinittb.
 * @param {Object} plugin 当前插件实例
 * @param {CC.ui.Grid} grid
 */
 
/**
 * @event afterinitPLUGINNAME
 * 在初始化插件后,发送该事件.如一个工具条插件,名称为tb,初始化后就会发送afterinittb.
 * @param {Object} plugin 当前插件实例
 * @param {CC.ui.Grid} grid
 */
/**
 * 批量添加插件
 * @private
 * @param {Array} pluginArray 要注册的插件列表
 * @return {Array} 返回实例化后的插件列表,位置一一对应
 */
  addPluginsInner : function(ps){
    // sort
    ps.sort(this.pluginComparator);
    
    var 
       // plugin name
       name, 
       // plugin ctype
       ctype, 
       // plugin config indexed name to grid
       cfgId, 
       // plugin configeration
       opt, 
       // plugin instance
       pl , 
       i, len,
       nps = [];
    // prepare, instance and register events
    for(i=0,len=ps.length;i<len;i++){
      pl   = ps[i];
      name = pl.name;
      cfgId = pl.cfgId || name;
      opt = {};
      // from grid indexed cfgId
      CC.extend(opt, pl);
      CC.extend(opt, CC.delAttr(this, cfgId));
      ctype = opt.ctype;
      // make a reference to grid
      opt.grid = this;
      if(__debug) tester.ok(!!ctype, true);
      opt   = CC.ui.instance(ctype, opt);
      this.extraRegisterEventMaps(opt);
      // new plugin list
      nps[i] = opt;
      //make a reference
      this[cfgId] = opt;
    }

    var rt = [], ui;
    //init
    for(i=0,len=nps.length;i<len;i++){
      pl = nps[i];
      name = pl.name;
      this.fireOnce('beforeinit'+name, pl, this);
      if(pl.initPlugin){
        ui = pl.initPlugin(this);
        if(ui){
          rt.push(name);
          // 插件本身
          if(ui === true)
            ui = pl;
          rt.push(ui);
          rt.push(pl);
        }
      }
      this.fireOnce('afterinit'+name, pl, this);
    }
    // list to add to grid
    if(rt.length){
      for(i=0,len=rt.length;i<len;i+=3){
        this.fireOnce('beforeadd'+rt[i], rt[i+1], rt[i+2]);
        this.layout.add(rt[i+1]);
        this.fireOnce('afteradd'+rt[i], rt[i+1], rt[i+2]);
      }
    }
    
    return nps;
  },


/**
 * 往表格添加一个插件
 * @param {Object} plugin
 */
  addPlugin : function(pl){
    pl = this.addPluginsInner([pl]);
    this.plugins.push(pl[0]);
  },

  destoryPlugins : function(){
    var g = this;
    CC.each(this.plugins, function(){
      if(this.destoryPlugin)
        this.destoryPlugin(g);
    });
  },


  destory : function(){
    this.destoryPlugins();
    father.destory.call(this);
  }
};
});

CC.ui.Grid.SCROLLBAR_WIDTH = 17;

CC.ui.def('grid', CC.ui.Grid);
/**
 * @class CC.ui.grid.Cell
 * 单元格
 * @extends CC.Base
 */
C.register('CC.ui.grid.Cell', function(){
  var td = CC.$C({
    tagName: 'TD',
    className:'grid-td'
  });

  td.appendChild(CC.$C({
    tagName: 'DIV',
    id: '_tle',
    className:'cell'
  }));
  return td;
});

CC.create('CC.ui.grid.Cell', CC.Base, function(father){
return {
  
  // 设为空,内容交给CC.grid.Column填充,也可以非空自定义填充方式
  brush : false,

  getTitleNode : function(){
    return this.view.firstChild;
  },

  // 忽略自身设置标题方式
  setTitle : function(){
    //ignore
    return this;
  }
};
});

/**
 * 表格行
 * @class CC.ui.grid.Row
 * @extends CC.ui.ContainerBase
 */

/**
 * @cfg {String|CC.Base} colCls 指定该列单元格类，未设定时采用CC.ui.grid.Cell 
 * @member CC.ui.grid.Column
 */ 
CC.ui.grid.Column.prototype.colCls = CC.ui.grid.Cell;

C.register('CC.ui.grid.Row', function(){
  return CC.$C({
    tagName: 'TR',
    className: 'grid-row'
  });
});
/**
 * @class CC.ui.grid.Row
 */
CC.create('CC.ui.grid.Row', CC.ui.ContainerBase, {

  eventable: false,
  
  brush : false,

  itemCls: CC.ui.grid.Cell,

  hoverCS: 'row-over',
  
  //display:'' 
  blockMode  : 0,
  
  displayMode:3,
  
  createView : function(){
    // deletage to parent container to create row view
    if(this.pCt){
      this.pCt.createRowView(this);
    }else {
      this.view = C.get('CC.ui.grid.Row');
      CC.ui.ContainerBase.prototype.createView.call(this);
    }
  },

  mouseoverCallback: function(e){
    this.pCt.onRowOver(this, e);
  },

  mouseoutCallback: function(e){
    this.pCt.onRowOut(this, e);
  },
  
  /**
   * @param {Array} array
   */
  fromArray: function(array) {
    
    var it, cols = this.pCt.grid.header.children;

    for (var i = 0, len = array.length; i < len; i++) {
      cls = cols[i].colCls;
      if (typeof cls === 'string')
        cls = CC.ui.ctypes[cls];

      it = array[i];
      // already instanced
      if (!it.cacheId){
      
        if(!it.ctype)
          it = CC.extendIf(it);
          
        it = this.instanceItem(it, cls, true);
      }
      
      this.add(it);
    }
    return this;
  },
/**
 * 根据列id获得单元格.
 * @param {String} columnId 列ID
 * @return {CC.ui.grid.Cell}
 */
  getCell : function(colId){
    var hd = this.pCt.pCt.header;
    return this.$(hd.indexOf(hd.$(colId)));
  },

/**
 * 获得或设置列数据.
 * @param {Number} columnIdOrIndex
 * @param {Object} [value] 
 * @return {Object}
 */
  dataAt : function(i, v){
    if(v === undefined) return this.getCell(i).getValue();
    this.getCell(i).setValue(v);
  },
/**
 * 获得或设置列标题.
 * @param {Number} columnIdOrIndex
 * @param {Object} [text]
 * @param {Boolean} update 是否更新到数据视图，此时保证数据视图(GridContent)已创建.
 * @return {String}
 */
  textAt : function(i, v, update){
    if(v === undefined) return this.$(i).getTitle();
    var cell = this.getCell(i);
    cell.setTitle(v);
    if(update) {
      this.pCt.updateCell(cell, v);
    }
  },
  fire:fGo
});

CC.ui.def('gridrow', CC.ui.grid.Row);
})();
﻿CC.Tpl.def('CC.ui.grid.Header', '<div class="g-grid-hd"><div class="hd-inner" id="_hd_inner"><table class="hd-tbl" id="_hd_tbl" cellspacing="0" cellpadding="0" border="0"><colgroup id="_grp"></colgroup><tbody><tr id="_ctx"></tr></tbody></table></div><div class="g-clear"></div></div>');

/**
 * @class CC.ui.grid.Header
 * 表头
 * @extends CC.ui.ContainerBase
 */
CC.create('CC.ui.grid.Header', CC.ui.ContainerBase, function(father){
	
 var  B = CC.Base;
 
return {

  itemCls : CC.ui.grid.Column,

  ct:'_ctx',
  
  peerCS : 'peer',

  createView : function(){
    father.createView.call(this);
    this.grpEl = this.dom('_grp');
    this.hdTbl = this.$$('_hd_tbl');
  },
  
  // create td <-> col peer
  onAdd : function(col){
    father.onAdd.apply(this, arguments);
    var peer = CC.$C('COL');
    peer.className = this.peerCS;
    this.grpEl.appendChild(peer);
    col._colPeer = peer;
  },
  
  initPlugin : function(grid){
    // add to grid container
    return true;
  },

  updateColWrapTblWidth : function(colWidth, dx){
    var hdTbl = this.hdTbl;
    if(hdTbl.width === false){
      hdTbl.setWidth(colWidth);
    }else if(dx === false){
      hdTbl.setWidth(hdTbl.width + colWidth);
    }else {
      hdTbl.setWidth(hdTbl.width + dx);
    }
  },
/**
 * 插件监听Grid事件的事件处理函数
 * @private
 */
  gridEventHandlers : {

    colwidthchange : function(idx, col, w){
      // 由表头设置具体列宽
      var tmp = col.view;
      col.view = col._colPeer;
      B.prototype.setWidth.call(col, w);
      col.view = tmp;
    },

    aftercolwidthchange : function(idx, col, width, dx){
      this.updateColWrapTblWidth(width, dx);
    },

    //同步表头与内容的滚动
    contentscroll : function(e, scrollLeft, ct){
        if(parseInt(this.view.scrollLeft, 10) !== scrollLeft)
          this.view.scrollLeft = scrollLeft;
    },
    
    showcolumn : function(b, col, idx){
      col._colPeer.style.width = b ? col.width+'px' : '0px';
      if(!b)
        this.updateColWrapTblWidth(false, -col.width);
    }
  },
  
  // 发送父层表格事件,如果此时存在父组件,调用父组件的fire发送事件
  fireUp : function(){
    var p = this.pCt;
    if(p){
      return p.fire.apply(p, arguments);
    }
  },

  getColumnCount : function(){
    return this.children.length;
  }
};
});
/**
 * 表头权重
 * @static
 */
CC.ui.grid.Header.WEIGHT = CC.ui.grid.Header.prototype.weight = -100;

CC.ui.def('gridhd', CC.ui.grid.Header);
﻿/**
 * @class CC.ui.grid.Content
 * 表格数据视图控件.
 * @extends CC.ui.ContainerBase
 */
 
/**
 * @cfg {Boolean} ignoreClick 是否禁止本单元的cellclick事件的发送,如果为true,当点击该单元时Grid并不发送cellclick事件,默认未置值
 * @member CC.ui.grid.Cell
 */

/**
 * @cfg {Boolean} ignoreClick 是否禁止本行的itemclick事件的发送,如果为true,当点击该行时Grid并不发送itemclick事件,默认未置值
 * @member CC.ui.grid.Row
 */

/**@cfg {Boolean} hoverEvent 是否允许发送rowover,rowout事件.*/

/**
 * @property batchUpdating
 * 是否正在批量更新中
 * @type {Boolean}
 * @private
 */
 
/**
 * @event cellclick
 * 单元格点击事件
 * @param {CC.ui.grid.Cell} cell
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */

/**
 * @event rowclick
 * 行点击事件
 * @param {CC.ui.grid.Row} row
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */

/**
 * @event rowdblclick
 * 行双击事件
 * @param {CC.ui.grid.Row} row
 * @param {CC.ui.grid.Cell} cell 双击所有地单元格，无则则为空
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */

/**
 * @event contentscroll
 * 数据视图grid.content滚动条滚动时发送.
 * @param {DOMEvent} event
 * @param {Number} scrollLeft
 * @param {CC.ui.grid.plugin.Content} content
 * @member CC.ui.Grid
 */


/**
 * @event rowover
 * 允许content.hoverEvent后,鼠标mouseover时发送.
 * @param {CC.ui.grid.Row} row
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */

/**
 * @event rowout
 * 允许content.hoverEvent后,鼠标mouseout时发送.
 * @param {CC.ui.grid.Row} row
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */
 
 
CC.Tpl.def('CC.ui.grid.Content', '<div class="g-grid-ct"><table class="ct-tbl" id="_ct_tbl" cellspacing="0" cellpadding="0" border="0"><colgroup id="_grp"></colgroup><tbody id="_ctx"></tbody></table></div>');
CC.create('CC.ui.grid.Content', CC.ui.Panel, function(father){
	var undefined, C = CC.Cache, CX = CC.ui.ContainerBase.prototype;
return {

 itemCls : CC.ui.grid.Row,

 ct : '_ctx',

 useContainerMonitor : true,

 syncWrapper : false,

 clickEvent : 'click',

 selectionProvider : { selectedCS : 'row-select' },

 lyInf : {h:'lead'},

  initPlugin : function(){
    this.ctTbl = this.$$('_ct_tbl');
    return true;
  },
  
/**
 * 创建列宽控制器,这里采用 &lt;colgroup&gt;&lt;col /&gt;&lt;/colgroup&gt;控制方式
 * @private
 */
  setupColumnLever : function(){
    var n, i,
        levers = this.levers = [],
        cs = this.grid.header.children,
        len = cs.length,
        cp = this.dom('_grp');

    // 创建列宽控制点
    for(i=0;i<len;i++){
      n = this.$$(CC.$C('COL'));
      levers[i] = n;
      if(cs[i].hidden)
        this.setCellsVisible(false, i, n);
      cp.appendChild(n.view);
    }

    var cws = this.cacheWidths;

    if(cws){
      delete this.cacheWidths;
      for(i=0,len=cws.length;i<len;i++){
        if(cws[i] !== undefined){
          levers[i].setWidth(cws[i]);
        }
      }
    }
  },

/**
 * @private
 */
  onRender : function(){
   this.setup();
   father.onRender.call(this);

   this.batchUpdating = true;
   this.updateView();
   this.batchUpdating = false;
  },

  /**
   * 用于初始化数据表,数据表结点处于就绪状态,就绪后所有接口方法都能正常调用
   * @private
   */
  setup : function(){
    this.setupColumnLever();
    this.setupEvent();
  },

/**
 * @private
 */
  setupEvent : function(){
    this.domEvent('scroll' , this.onScroll);
    this.on('resized', this.onResized);
  },

/**
 * @override
 * @private
 */
  bindClickInstaller : function(){
    this.itemAction(
             this.clickEvent,
             this.onRowClick,
             false,
             null,
             this.dom('_ct_tbl')
    );
    
    this.itemAction(
             'dblclick',
             this.onRowDblClick,
             false,
             null,
             this.dom('_ct_tbl')
    );    
  },
  
  updateContentWrapTblWidth : function(colWidth, dx){
    var ctTbl = this.ctTbl;
    if(ctTbl.width === false){
      ctTbl.setWidth(colWidth);
    }else if(dx === false){
      ctTbl.setWidth(ctTbl.width + colWidth);
    }else {
      ctTbl.setWidth(ctTbl.width + dx);
    }
  },
  
  updateLeversWidth : function(idx, width, dx){
    if(this.levers){
      this.levers[idx].setWidth(width);
    }else {
      var cws = this.cacheWidths;
      if(!cws){
        cws = this.cacheWidths = [];
      }
      cws[idx] = width;
    }
  },
  
  setCellsVisible : function(b, idx, lever){
    if(this.levers){
      var lv = lever || this.levers[idx];
      if(!b)
        lv.view.style.width = '0px';
      else lv.view.style.width = lv.width + 'px';
    }
  },
  
  // @override
  getScrollor : function(){
    return this.view;
  },

  onAdd : function(c){
    if(this.altCS && (this.size()%2)){
      c.addClass(this.altCS);
    }
    father.onAdd.apply(this, arguments);
    if(this.rendered && !this.batchUpdating){
      this.updateRow(c);
    }
    
    if(!c.rendered)
      c.render();
  },
  
  onInsert : function(idx, row){
    father.onInsert.apply(this, arguments);
    if(this.rendered && !this.batchUpdating){
      this.updateRow(row);
    }
    
    if(!row.rendered)
      row.render();
  },
  
/**
 * @private
 */
  onScroll : function(e){
    this.grid.fire('contentscroll', e, parseInt(this.view.scrollLeft, 10) || 0, this);
  },


  onRowClick : function(row, e){
    if(!this.clickDisabled && !row.ignoreClick){
      var cell = row.$(e.srcElement || e.target), rt;
      if(cell){
        if(cell.disabled)
         return;
        
        if(!row.clickDisabled && !cell.ignoreClick){
          rt = this.grid.fire('cellclick', cell, e);
        }
      }

      if(rt !== false){
        this.fire('itemclick', row, e);
        this.grid.fire('rowclick',  row, e);
      }
    }
  },
  
  dblclickDisabled : false,
  
  onRowDblClick : function(row, e){
    if(!this.dblclickDisabled){
      var cell = row.$(e.srcElement || e.target);
      if(!cell || !cell.disabled)
        this.grid.fire('rowdblclick', row, cell, e);
    }
  },
  
  hoverEvent : false,
 
  // @interface
  onRowOver : function(r, e){
    if(this.hoverEvent === true){
      this.grid.fire('rowover', r, e);
    }
  },
  
  // @interface
  onRowOut : function(r, e){
    if(this.hoverEvent === true){
      this.grid.fire('rowout', r, e);
    }
  },
  
  // @interface
  instanceItem : function(item){
    if(item && !item.cacheId){
      // 检查是否有非数据列
      var hds = this.grid.header.children;
    	
    	if(!item.array){
    		var arr = item.array = []
        for(i=0,len=hds.length;i<len;i++){
          arr[arr.length] = {title:''};
        }
      }

      else if(item.array.length !== hds.length){
        arr = item.array;
        for(i=0,len=hds.length;i<len;i++){
          if(!hds[i].dataCol){
            arr.insert(i, {});
          }
        }
      }
    }
    return father.instanceItem.apply(this, arguments);
  },
  
  onResized : function(w){
    if(w !== false){
      //fix ie no scroll event bug
      if(CC.ie){
        this.grid.fire('contentscroll', null, parseInt(this.view.scrollLeft, 10) || 0, this);
      }
    }
  },
// --- Interface
/**
 * @private
 */
  gridEventHandlers : {

    aftercolwidthchange : function(idx, col, width, dx){
      this.updateContentWrapTblWidth(width, dx);
      this.updateLeversWidth(idx, width, dx);
    },
    
    sortcol : function(){
      this.sortByCol.apply(this, arguments);
    },
    
    showcolumn : function(b, col, idx){
      this.setCellsVisible(b, idx);
      if(!b)
        this.updateContentWrapTblWidth(false, -col.width);
    }
  },
  
  
  sortByCol : function(col, idx, order, comparator){
    this.sort(function(ra, rb){
      var a = ra.children[idx].getValue(),
          b = rb.children[idx].getValue();
      return order === 'asc' ? comparator(a, b) : comparator(b, a);
    });
  },
  
  updateView : function(){
    var cs = this.grid.header.children,
        hl = cs.length,
        i, rs = this.children,
        rl = rs.length,
        bs = [], c;

    for(i=0;i<hl;i++)
      bs[i] = cs[i].cellBrush;

    for(i=0;i<rl;i++){
      for(j=0;j<hl;j++){
        this.updateCell(rs[i].children[j],undefined, rs[i].brush || bs[j]);
      }
    }
  },
/**
 * 当行初始化时,委托父类生成view结点,当通过fromArray方式载行数据时才生效.
 * @param {CC.ui.grid.GridRow} row
 */
  createRowView : function(row){
    row.view = C.get('CC.ui.grid.Row');
    CX.createView.call(row);
  },
  
/**
 * 当一行数据添加到表格时,调用该方法更新行数据.
 * @param {CC.ui.grid.GridRow} row
 */
  updateRow : function(row){
    var cs = this.grid.header.children,
        i, rs = row.children,
        rl = rs.length;

    for(i=0;i<rl;i++){
      this.updateCell(rs[i], undefined, rs[i].brush || cs[i].cellBrush);
    }
  },

/**
 * 更新单元格html
 * @param {CC.ui.grid.Cell} cell
 * @param {String} title
 */
  updateCell : function(cell, title, brush){
    if(!brush)
    	brush = cell.brush || this.grid.header.$(cell.pCt.indexOf(cell)).cellBrush;
    if(title === undefined){
      title = cell.title===undefined?cell.value:cell.title;
    }
    cell.getTitleNode().innerHTML = brush.call(cell, title);
  },

/**
 * 获得位置i行,j列上的单元格.
 * @param {Number} rowIndex
 * @param {Number} cellIndex
 * @return {CC.ui.grid.Cell} cell
 */
  cellAt : function(i, j){
    return this.children[i].children[j];
  },

/**
 * 获得第i行j列的数据.
 * @param {Number} rowIndex
 * @param {Number} cellIndex
 * @param {Object} [value] 
 * @return {Object}
 */
  dataAt : function(i, j, v){
    if(v === undefined) return this.$(i).$(j).getValue();
    this.$(i).$(j).setValue(v);
  },
/**
 * 获得第i行j列的标题.
 * @param {Number} rowIndex
 * @param {Number} cellIndex
 * @param {Object} [text] 
 * @return {String}
 */
  textAt : function(i, j, v){
    if(v === undefined) return this.$(i).$(j).getTitle();
    this.$(i).$(j).setTitle(v);
  }
};
});

/**
 * @cfg {Boolean} dataCol 指明该列是否为数据项,如果为非数据项,则表格数据视图在添加行时自动插入数据到该列.
 * @member CC.ui.grid.Column
 */
CC.ui.grid.Column.prototype.dataCol = true;

// 插件权重
CC.ui.grid.Content.WEIGHT = CC.ui.grid.Content.prototype.weight = -80;
CC.ui.def('gridcontent', CC.ui.grid.Content);
﻿CC.Tpl.def('CC.ui.grid.TreeCellBody', [
  '<div class="g-tree-nd-el g-tree-nd-cls g-tree-nd g-tree-arrows">',
      '<div class="g-tree-nd-indent" id="_ident">',
        '<div class="g-tree-ec-icon" id="_pls"></div>',
        '<div class="g-tree-nd-icon" id="_ico"></div>',
      '</div>',
      '<div class="g-tree-nd-anchor" id="_wr">',
        '<span id="_tle" class="g-unsel" unselectable="on"></span>',
      '</div>',
      '<div class="g-clear"></div>',
  '</div>'
].join(''));

/**
 * 该类并无新增公开的方法和属性，生成了控制表格树项的单元格UI。
 * @class CC.ui.grid.TreeCell
 * @extends CC.ui.grid.Cell
 */

CC.create('CC.ui.grid.TreeCell', CC.ui.grid.Cell, function(superclass){

return {
  splitPlusCS : 'g-tree-split-plus',
  splitMinCS :'g-tree-split-minus',
  nodeOpenCS : 'g-tree-nd-opn',
  nodeClsCS : 'g-tree-nd-cls',
  nodeLeafCS : 'g-tree-nd-leaf',
  // private
  rowHoverCS : 'g-tree-nd-over g-tree-ec-over',

  identW : 16,
  
  initComponent : function(){
    superclass.initComponent.call(this);
      // init event
      this.domEvent('mousedown', this.onElbowClick, true, null, this._elbow.view)
          .domEvent('click', CC.Event.noUp, true, null, this._elbow.view);
      
      this._checkIfNodes(false);
    // make parent row a reference to self
    this.pCt.treeCell = this;
  },
  
  // private
  onElbowClick : function(){
    this.pCt.expand(!this.pCt.expanded);
  },
  
  // private
  createView : function(){
    superclass.createView.call(this);
    var bd = CC.Tpl.$('CC.ui.grid.TreeCellBody');
    // 标题结点
    this.titleNode = CC.$('_tle', bd);
    // expand装饰结点
    this._elbow    = this.$$(CC.$("_pls", bd));
    // 图标装饰结点
    this._icon     = this.$$(CC.$("_ico", bd));
    
    this._ident     = this.$$(CC.$("_ident", bd));
    
    // 
    this._head     = this.$$(bd);
    var wrap = this.view.firstChild;
    // 取消作为标题结点
    wrap.id = '';
    wrap.appendChild(bd);
    this.addClass('g-treegrid-cell');
  },
  
  // override
  getTitleNode : function(){
    return this.titleNode;
  },
  
  // 调整结点样式,展开/收缩时调用本方法更新结点样式状态
  _decElbowSt : function(b) {
    
    if(b===undefined)
      b = this.pCt.expanded;

    if(this.pCt.nodes){
      if (b) {
         this._elbow.switchClass(this.splitPlusCS, this.splitMinCS);
         this._head.switchClass(this.nodeClsCS, this.nodeOpenCS);
      } else {
         this._elbow.switchClass(this.splitMinCS, this.splitPlusCS);
         this._head.switchClass(this.nodeOpenCS, this.nodeClsCS);
      }
    }
  },
  
  // 调整结点叶子结点/非叶子结点样式，当子项数量发生变动时调用更新
  // 里面同时也调用了_decElbowSt方法
  _checkIfNodes : function(b){
    if(this.pCt.nodes){
      if(this._head.hasClass(this.nodeLeafCS)){
        this._head.delClass(this.nodeLeafCS);
      }
    }else if(!this._head.hasClass(this.nodeLeafCS)){
        this._head.addClass(this.nodeLeafCS);
    }
    
    this._decElbowSt(b);
  }
};
});


CC.ui.def('treecell', CC.ui.grid.TreeCell);

/**
 * @class CC.ui.grid.TreeRow
 * @extends CC.ui.grid.Row
 */

/**
 * @property previous
 * 上个结点
 * @type CC.ui.grid.TreeRow
 */

/**
 * @property next
 * 下个结点
 * @type CC.ui.grid.TreeRow
 */

/**
 * @property treeCell
 * 该行树结点UI所在单元的格
 * @type CC.ui.grid.GridCell
 */

/**
 * @cfg {Boolean} expanded 是否展开
 */
CC.create('CC.ui.grid.TreeRow', CC.ui.grid.Row, function(superclass){
return {
  // private
  _curIdent : 0,
  
  initComponent : function(){
    superclass.initComponent.call(this);
    // folder node
    if(this.nodes){
      nds = CC.delAttr(this, 'nodes');
      for(var i=0,len=nds.length;i<len;i++){
        this.addItem(nds[i]);
      }
      
      if(!nds.length)
        this.nodes = nds;
    }
  },
  
  onRender : function(){
    superclass.onRender.call(this);
    if(this.expanded){
      delete this.expanded;
      this.expand(true);
    }
  },

/**
 * 添加子项
 * @param {CC.ui.grid.TreeRow} treeRow
 <pre><code>
   row.addItem({
      array:[{title:'ac'}, {title:'ac'}, {title:'ac'}],
      nodes : [
        { array:[{title:'aca'}, {title:'acb'}, {title:'acc'}] }
      ]
  });
 </code></pre>
 */
  addItem : function(item, cancelAddIntoView){
    var nds = this.nodes;
    if(!nds)
      nds = this.nodes = [];
    item.hidden = this.hidden || !this.expanded;
    
    item = this.pCt.instanceItem(item);
    
    item.pNode = this;
    
    if(this.view.parentNode === this.pCt.ct)
      this._addItemView(item);
      
    nds.push(item);
    
    //item.treeCell._decElbowSt();
    item._applyChange(this);
    
    if(this.rendered)
      this.treeCell._checkIfNodes();
    
    var pre = item.previous;
    if(pre){
      //pre.treeCell._decElbowSt();
      pre._applyChange(this);
    }
    return item;
  },

/**
 * 删除子项
 * @param {CC.ui.grid.TreeRow} treeRow
 */
  removeItem : function(item, cancelNotifyParent){
    if(this.rendered)
      item._removeFromView(cancelNotifyParent);
    
    item.pNode = null;
    var pre  = item.previous;

    this.nodes.remove(item);
    item._applySibling(true);

    if(pre)
      pre._applySibling();
    
    if(this.rendered)
      this.treeCell._checkIfNodes();
  },
/**
 * 插入子项表结点
 * @param {Number} index
 * @param {CC.ui.grid.TreeRow} item
 * @return {CC.ui.grid.TreeRow}
 */
  insertItem: function(idx, item) {
    var nds = this.nodes;

    if(item.pNode === this && nds.indexOf(item)<idx)
      idx --;


      if(!nds)
        nds = this.nodes = [];
        
      if (item.pNode){
          item.pNode.removeItem(item);
          item.pNode = this;
      }
      else {
        item.hidden = this.hidden || !this.expanded;
        item = this.pCt.instanceItem(item);
        item.pNode = this;
      }

      nds.insert(idx, item);
      
      if(this.rendered){
        delete item.pCt;
        if (nds[idx+1])
           this.pCt.insert(this.pCt.indexOf(nds[idx+1]), item);
        else this.pCt.insert(this.pCt.indexOf(this)+1, item);
        item.pCt = this.pCt;
        this.treeCell._checkIfNodes();
      }
      // child nodes..
      item._applyChange(this);
    return item;
  },

  expanded : false,
  
/**
 * 展开/收缩子项.
 * @param {Boolean} expand
 */
  expand : function(b) {
    if(this.expanded !== b){
      if(this.pCt.grid.fire('expandtree', this, b)===false)
        return false;
      this.treeCell._decElbowSt(b);
      this._expandContent(b);
      this.expanded = b;
      return this.pCt.grid.fire('expandedtree', this, b);
    }
  },

  // override
  onHide : function(){
    superclass.onHide.call(this);
    if(this.nodes){
      for(var i=0,nds=this.nodes,len=nds.length;i<len;i++){
        if(!nds.hidden)
          nds[i].display(false);
      }
    }
  },
  
  // override
  onShow : function(){
    superclass.onShow.call(this);
    if(this.expanded && this.nodes){
      for(var i=0,nds=this.nodes,len=nds.length;i<len;i++){
        if(nds[i].hidden)
          nds[i].display(true);
      }
    }
  },
  
  _applySibling : function(detach){
    if(detach){
      if(this.previous)
        this.previous.next = this.next;
      if(this.next)
        this.next.previous = this.previous;
      this.next = this.previous = null;
    }else {
      var ct = this.pNode;
      if(ct){
        c = ct.nodes, idx = c.indexOf(this);
        this.next = c[idx+1];
        if(this.next)
          this.next.previous = this;
        this.previous = c[idx-1];
        if(this.previous)
          this.previous.next = this;        
      }else {
        this.previous = this.next = null;
      }
    }
  },
  
  _applyChange : function(){
    this._applySibling();
    this._fixSpacer();
  },
  
  _fixSpacer : function(pNode) {
    pNode = pNode || this.pNode;
    if(pNode){
      var tc  = this.treeCell, 
          idt = pNode._curIdent + tc.identW;
      
      tc._head.view.style.paddingLeft = idt + 'px';
      this._curIdent = idt;
      
      if(this.nodes){
        for(var i=0,nds = this.nodes,len=nds.length;i<len;i++) {
          nds[i]._fixSpacer(this);
        }
      }
    }
  },
  
  _navInsertPlaceHold : function(){
    return this.nodes ?
      !this.nodes[this.nodes.length - 1] ? this : this.nodes[this.nodes.length - 1]._navInsertPlaceHold() 
      : this;
  },
  
  _addItemView : function(item){
    // 是否已在nodes列表中而还没加到grid view上?
    var nxt = this._navInsertPlaceHold(), 
        idx = this.pCt.indexOf(nxt) + 1;
    
    delete item.pCt;
    this.pCt.insert(idx, item);
    item.pCt = this.pCt;
    
    if(item.nodes){
      idx ++;
      for(var nds=item.nodes,len=nds.length, i=0;i<len;i++){
        idx = item._batchAddItemView(nds[i], idx);
      }
    }
  },
  
  _batchAddItemView : function(item, idx){
    delete item.pCt;

    this.pCt.insert(idx, item);
    item.pCt = this.pCt;
    idx++;
    
    if(item.nodes){
      for(var nds=item.nodes,len=nds.length, i=0;i<len;i++){
        idx = item._batchAddItemView(nds[i], idx);
      }
    }
    return idx;
  },
    
  _removeFromView : function(cancelNotifyParent){
    // remove from grid view
    if(this.nodes){
      var nds = this.nodes;
      for(var i=0,len=nds.length;i<len;i++){
        if(nds[i].nodes)
          nds[i]._removeFromView();
        else if(nds[i].pCt)
          nds[i].pCt.remove(nds[i], true);
      }
    }
    // 防止重复调用
    if(!cancelNotifyParent && this.pCt)
      this.pCt.remove(this, true);
  },
   
  _expandContent : function(b){
    if(this.nodes){
      for(var i=0,nds=this.nodes,len=nds.length;i<len;i++)
         nds[i].display(b);
    }
  },
  
  mouseoverCallback : function(){
    this.treeCell._ident.addClass(this.treeCell.rowHoverCS);
    superclass.mouseoverCallback.apply(this, arguments);
  },
  
  mouseoutCallback : function(){
    this.treeCell._ident.delClass(this.treeCell.rowHoverCS);
    superclass.mouseoutCallback.apply(this, arguments);
  },
  
  destory : function(){
    if(this.nodes){
      for(var i=0,nds=this.nodes,len=nds.length;i<len;i++){
        nds[i].destory();
      }
    }
    superclass.destory.call(this);
  }
};
});

/**
 * @class CC.ui.grid.TreeContent
 * @extends CC.ui.grid.Content
 */
CC.create('CC.ui.grid.TreeContent', CC.ui.grid.Content, function(superclass){
return {
  
  itemCls : CC.ui.grid.TreeRow,
  
  onAdd : function(row){
    superclass.onAdd.apply(this, arguments);
    row._applyChange();
    if(row.nodes){
      var idx = this.indexOf(row) + 1;
      for(var i=0,nds=row.nodes,len=nds.length;i<len;i++){
        idx = row._batchAddItemView(nds[i], idx);
      }
    }
  },
  /*
  onInsert : function(row){
    superclass.onInsert.apply(this, arguments);
    row._applyChange();
    if(row.nodes){
      var idx = this.indexOf(row) + 1;
      for(var i=0,nds=row.nodes,len=nds.length;i<len;i++){
        idx = row._batchAddItemView(nds[i], idx);
      }
    }
  },
  */
  remove : function(item , cancelNotifyPNode){
    superclass.remove.apply(this, arguments);
    if(!cancelNotifyPNode && item.pNode) {
      item.pNode.removeItem(item, true);
    }else {
      // grid level
      item._removeFromView(true);
    }
  }
};
});

CC.ui.def('treecontent', CC.ui.grid.TreeContent);
﻿/**
 * @class CC.ui.grid.ContentStoreProvider
 * 提供表格数据视图的数据存储功能.
 * @extends CC.util.StoreProvider
 */
CC.create('CC.ui.grid.ContentStoreProvider', CC.util.StoreProvider, {
	
	modifyCS : 'g-form-mdy',
/**
 * @cfg {Boolean} filterChanged 是否只提交已更改的行记录,默认为true, false时提交所有行记录.
 */
	filterChanged : true,
	
  // @override
	isModified : function(row){
		var md = false;
		row.each(function(){
			if(this.modified){
				md = true;
				return false;
			}
		});
		return md;
	},
	
  // @override
	decorateModified : function(row, b){
		var self = this;
		row.each(function(){
			if(this.modified)
				self.decorateCellModified(this, b);
		});
	},
	
	decorateCellModified : function(cell, b){
   if(cell.modified !== b){
	   cell.checkClass(cell.modifyCS || this.modifyCS, b);
	   cell.modified = b;
   }
	},
	
	createNew : function(opt, scroll){
		if(!opt){
			opt = {array:[]};
			this.t.pCt.header.each(function(){
				opt.array.push({title:''});
			});
		}
		return CC.util.StoreProvider.prototype.createNew.call(this, opt, scroll);
	},

  // @override
	getItemQuery : function(item, qs){
		var s = [], q, idx=0, chs = item.children, v, m = this.submitModify;
		this.t.pCt.header.each(function(a, cnt){
		  if(!m || chs[cnt].modified){
  			q = this.qid || this.id;
  			v = chs[cnt].getValue();
  			//query id string
  			if(q && v!== undefined)
  				s[s.length] = q + '=' + encodeURIComponent(v);
		  }
		});
		q = s.length?s.join('&') : '';
		if(q){
		  if(!qs) 
		    qs = q;
		  else qs += '&' + q;
		}
		return qs;
	}
});
CC.ui.grid.Content.prototype.storeProvider = CC.ui.grid.ContentStoreProvider;
﻿/**
 * @class CC.ui.grid.ContentValidation
 * 提供表格数据视图的数据验证功能.
 * @extends CC.util.ValidationProvider
 */
CC.create('CC.ui.grid.ContentValidation', CC.util.ValidationProvider, {
	
  // @override
  decorateValidation : fGo,
  
  decorateCellValidation : function(cell, b, msg){
    cell.checkClass(this.errorCS, !b);
    if(!b)
    	cell.setTip(msg);
    else cell.setTip('');
  },
  
  // @override
  validator : function(row, collector){
  	var idx=0, 
  	    cols = this.t.pCt.header.children, 
  	    r = true ,
  	    n = this.t.getStoreProvider().isNew(row),
  	    self = this;
  	//
  	row.each(function(){
  		// 只验证修改过的
  		if(n || this.modified){
	  		if(self.validateCell(this, cols[idx].validator)===false && r === true){
	  			r = false;
	  		}
	  	}
	  	idx++;
  	});
  	
  	if(!r) 
  	 collector.push(r);
  	return r;
  },
  
/**
 * 验证单元格数据.
 * @param {CC.ui.grid.Cell} cell
 * @return {Boolean} true | false
 */
  validateCell : function(cell, vd){
  	var r = true;
  	if(!vd){
  		vd = this.t.pCt.header.$(cell.pCt.indexOf(cell)).validator;
  	}
  	
		if(vd){
			var msg = vd.call(cell, cell.getValue());
			if(msg !== true)
				r = false;
			this.decorateCellValidation(cell, msg === true, msg);
		}
		return r;
  },
  
  each : function(){
  	var s = this.t.getStoreProvider();
  	s.each.apply(s, arguments);
  }
});
CC.ui.grid.Content.prototype.validationProvider = CC.ui.grid.ContentValidation;
﻿/**
 * @cfg {Boolean} autoFit 是否自动调整列宽以适应表格宽度,该属性来自{@link CC.ui.grid.ColumnWidthControler}.
 * @member CC.ui.Grid
 */
CC.ui.Grid.prototype.autoFit = false;

/**
 * @class CC.ui.grid.plugins.ColumnWidthControler
 * 该插件负任调整表头列宽,表头列自适应表宽度等.
 */
CC.create('CC.ui.grid.plugins.ColumnWidthControler', null, function(){
  Math = window.Math;
return {

  autoFitCS : 'g-grid-fit',
/**
 * @cfg {Number} minColWidth 每列缩放的最小宽度,默认为10
 */
  minColWidth : 10,

  initialize : function(opt){
    CC.extend(this, opt);
  },

  initPlugin : function(g) {
    if(g.autoFit){
      g.addClass(this.autoFitCS);
    }
  },

  gridEventHandlers : {
    resized : function(w){
      if(w !== false){
        if(!this.hasInitColWidths){
         w = Math.max(0, w - CC.ui.Grid.SCROLLBAR_WIDTH);
         this.initColWidths(w);
         this.hasInitColWidths = true;
       }else if(this.grid.autoFit){
         w = Math.max(0, w - CC.ui.Grid.SCROLLBAR_WIDTH);
         this.autoColWidths(w); 
       }
      }
    },
    
    aftercolwidthchange : function(idx, col){
        if(!col._widthcontrolset) this.autoColWidths();
    },
    
    showcolumn : function(b, col, idx){
      this.autoColWidths();
    }
  },
  // 第一次初始化
  initColWidths : function(w){
     var lf = w, hd = this.grid.header, len = hd.getColumnCount();
     var cw, min = this.minColWidth, self = this;
     hd.each(function(){
      if(!this.hidden){
         cw = this.width;
         if(cw !== false){
           //小数,按百分比计
           if(cw < 1){
             cw = Math.floor(w * cw);
           }
           len --;
           self.setColWidth0(this, Math.max(cw, min));
           lf -= this.width;
         }
      }
     });

     cw = Math.max(Math.floor(lf/len), min);

     hd.each(function(){
      if(this.width === false && !this.hidden){
        self.setColWidth0(this, cw);
      }
     });
  },
  
  // private
  getAutoWidthLen : function(w){
    return Math.max(0, (w||this.grid.width)- CC.ui.Grid.SCROLLBAR_WIDTH);
  },
  
  // private
  setColWidth0 : function(col, w){
    col._widthcontrolset = true;
    col.setWidth(w, true);
    delete col._widthcontrolset;
  },
  
  // 瓜分多出的宽度到列
  deliverDelta : function(dw){
    if(__debug) console.log('auto dw:',dw);
    var chs = this.grid.header.children,
        len = chs.length,
        // 每列瓜分均值
        avw , 
        // 应重设列宽值
        nw, 
        // 重设前宽值
        prew,
        
        min = this.minColWidth,
        i,col,
        
        // 仍处理的列 
        queue = [], 
        
        // 已剔除的列
        delqueue = [];
        
    // clone array
    for(i=0;i<len;i++){
      if(!chs[i].locked && !chs[i].resizeDisabled && !chs[i].hidden)
        queue[queue.length] = chs[i];
    }
    
    while(dw !== 0 && queue.length){
      avw = Math.floor(dw / queue.length);
      for(i=0,len=queue.length;i<len;i++){
        col = queue[i];
        prew = col.width;
        nw = Math.max(col.width + avw, min);
        if(nw !== prew){
          this.setColWidth0(col, nw);
          if(col.width !== prew){
            dw -= (col.width - prew);
          }else {delqueue.push(col);}
        }else {delqueue.push(col);}
      }
      
      for(i=0;i<delqueue.length;i++){
        queue.remove(delqueue[i]);
      }
      delqueue = [];
    }
    
    if(__debug)  console.log('remain dw:',dw);
  },
  
  autoColWidths : function(w){
    if(this.grid.autoFit){
      
      if( !w )
        w = this.getAutoWidthLen();
      
      var hd  = this.grid.header, ws = 0;
      
      hd.each(function(){
          if(!this.hidden)
            ws += (this.width||0);
      });
      
      var dw  = w - ws; // 每列扩展的宽度值delta width
      
      if(__debug) console.log('grid width:',w,',current width:',ws,',dw:',dw);
      var self = this;
      if(dw != 0){
         this.deliverDelta(dw);
      }
    }
  },

/**
 * 获得在插件列宽调整规则内指定列可调整的最大与最小<strong>可缩放宽度</strong>.
 * @return {Array} maxminwidth [minWidth, maxWidth]
 * @public
 */
  getConstrain : function(col){
    if(col.hidden)
      return [0, 0];

    if(col.resizeDisabled)
      return [col.width, col.width];
    
    var min = col.width - Math.max(this.minColWidth, col.minW, 0);
    
    if(this.grid.autoFit){
      var hd  = this.grid.header, 
          idx = hd.indexOf(col),
          chs = hd.children;
          maxW = 0, minW = 0;
      for(var i=idx+1,len=chs.length;i<len;i++){
        if(!chs[i].hidden){
          maxW += chs[i].width;
          minW =  Math.max(this.minColWidth, chs[i].minW, 0);
        }
      }
      
      return [min, maxW - minW];
    }
    
    return [min, Math.MAX_VALUE];
  }
};
}
);

CC.ui.def('colwidthctrl', CC.ui.grid.plugins.ColumnWidthControler);

CC.ui.Grid.prototype.plugins.push({name:'colwidthctrl', ctype:'colwidthctrl'});
﻿/**
 * @class CC.ui.grid.plugins.Editation
 * 支持表格编辑的插件
 */
CC.create('CC.ui.grid.plugins.Editation', null, function(){
  var E = CC.Event, Math = window.Math;
  
  CC.ui.grid.Column.prototype.editable = true;
  CC.ui.grid.Row.prototype.editable    = true;
  CC.ui.grid.Cell.prototype.editable   = true;

/**
 * 获得该单元格值, 如果cell.value已定义,返回cell.value,否则返回cell.title
 * @param {CC.ui.grid.Cell} cell
 * @return {Object} value
 * @method getValue
 * @member CC.ui.grid.Cell
 */
  CC.ui.grid.Cell.prototype.getValue = function(cell){
     return this.value === undefined ? this.title : this.value;
  };
/**
 * @param {Object} cellValue
 * @method setValue
 * @member CC.ui.grid.Cell
 */ 
  CC.ui.grid.Cell.prototype.setValue = function(v){
      this.value = v;
      return this;
  };
  

return {
/**
 * @cfg {Boolean} editable 是否允许或禁止编辑当前表格
 */
  editable : true,
  
  trigMode : 'cellclick',
  
/**@private*/
  editorCS : 'g-flot-editor',
  
  initialize : function(opt){
    if(opt)
      CC.extend(this, opt);
    
    var self = this;
    
    switch(this.trigMode){
      case 'cellclick' : 
         this.grid.on(this.trigMode, function(cell){
           self.strictStartEdit(cell);
         });
         break;
      case 'rowdblclick' : 
         this.grid.on(this.trigMode, function(row, cell){
           if(cell)
             self.strictStartEdit(cell);
         });
    }
    
    opt = null;
  },

/**
 * 当前单元格是否允许编辑
 * this.editable && !cell.disabled &&  col.editor && col.editable && cell.pCt.editable && cell.editable
 * @param {CC.ui.grid.Cell} cell
 * @return {Boolean}
 */
  isCellEditable : function(cell, col){
    if(!col)
      col = this.grid.header.$(cell.pCt.indexOf(cell));

    return this.editable      &&
           col.editor         && 
           col.editable       && 
           cell.pCt.editable  && 
           !cell.disabled     &&
           cell.editable
  },
  
  // @private
  strictStartEdit : function(cell){
    var idx = cell.pCt.indexOf(cell),
    col = this.grid.header.$(idx);
    if(this.isCellEditable(cell, col)){
      this.startEdit(cell, idx, col);
    }
  },
  
/**
 * 获得单元格编辑器.
 * @param {CC.ui.grid.Column} column
 * @return {CC.ui.form.FormElement}
 */
  getEditor : function(col){
    var ed = col.editor;
    if(ed && (!ed.cacheId || typeof ed === 'string')){
      if(typeof ed === 'string')
        ed = {ctype:ed};

      CC.extendIf(ed, {
        showTo:document.body, 
        autoRender:true, 
        shadow:true
      });
      
      if(ed.shadow === true)
         ed.shadow = CC.ui.instance({ctype:'shadow', inpactH:6,inpactY:-2, inpactX : -5, inpactW:9});
      
      ed = col.editor = this.createEditor(ed);
      ed.addClass(this.editorCS);
    }
    return ed;
  },

/**@private*/
  createEditor : function(cfg){
    var inst = CC.ui.instance(cfg);
    var self = this;
    
    inst.on('blur', function(){
        if(this.bindingCell){
          self.endEdit(this.bindingCell);
        }
      });
      
    inst.on('keydown', function(e){
      if( this.bindingCell){
        var cell = this.bindingCell;
        if(E.TAB === e.keyCode){
          self.endEdit(cell);
          var nxt = self.getNextEditableBlock(cell.pCt, cell.pCt.indexOf(cell));
          
          if(nxt){
            self.startEdit(nxt);
            E.stop(e);
            return false;
          }
        }
        else if(E.ESC === e.keyCode){
          self.endEdit(cell);
          E.stop(e);
          return false;
        }
      }
    });
    
    return inst;
  },
  
  getNextEditableBlock : function(row, cellIdx){
    var c = row.children[cellIdx + 1];
    if(!c){
      row = row.pCt.children[row.pCt.indexOf(row) + 1];
      if(row){
        c = this.getNextEditableBlock(row, -1);
      }
    }else if(!this.isCellEditable(c)){
       c = this.getNextEditableBlock(row, cellIdx + 1);
    }
    return c;
  },
  
    /**
     * @property editingCell 
     * 当前正在编辑的单元格
     * @type CC.ui.GridCell
     */
     
/**
 * 开始编辑指定格元格.
 * @param {CC.ui.grid.Cell} gridcell
 */
  startEdit : function(cell,  idx, col){
    // make a timeout to avoid effection from self dom event
    this.startEdit0.bind(this, cell, idx, col).timeout(0);
  },
  
  startEdit0 : function(cell, idx, col){
    
    cell.scrollIntoView(this.grid.content.getScrollor(), true);
    
    if(idx === undefined)
      idx = cell.pCt.indexOf(cell);

    if(!col)
      col = this.grid.header.$(idx);
    
    var et = this.getEditor(col);
    if(et){
      et.bindingCell = cell;
      cell.bindingEditor = et;
      
      this.setBoundsForEditor(cell, et);
      
      et.setValue(cell.getValue())
        .setTitle(cell.getTitle())
        .show().focus();
      this.grid.fire('editstart', cell, et, col, idx, this);
    }
  },
/**
 * 结束编辑指定单元格.
 * @param {CC.ui.grid.Cell} cell
 */
  endEdit : function(cell){
    var g = this.grid;
    var idx = cell.pCt.indexOf(cell),
    et =  cell.bindingEditor,
    v, prev;
    
    if(g.fire('edit', cell, et, idx, this) !== false){
      et.hide();
      v = et.getValue(), prev = cell.getValue();
      if(v != prev){
        var txt = et.getText();
        g.content.updateCell(cell, txt);
        cell.setValue(v);
        cell.title = txt;
        this.grid.content.getValidationProvider().validateCell(cell);
        if(!cell.modified)
          g.content.getStoreProvider().decorateCellModified(cell, true);
      }
      g.fire('editend', cell, et, idx, this);
      et.bindingCell = null;
      delete cell.bindingEditor;
    }
  },

  setBoundsForEditor : function(cell, ed){
    var cz = cell.getSize(),
        xy = cell.absoluteXY();

    ed.setSize(cz);
    if(ed.height < cz.height){
      xy[1] = xy[1] + Math.floor((cz.height - ed.height)/2);
    }
  
    ed.setXY(xy);
  }
};
});

CC.ui.def('grideditor', CC.ui.grid.plugins.Editation);
﻿/**
 * @class CC.ui.grid.plugins.Toolbar
 * 表格工具条插件
 */
CC.create('CC.ui.grid.plugins.Toolbar', null, {
/**
 * @cfg {String} installWhen 当表格指定事件发生后安装工具栏到表格中,默认值为afteraddcontent
 */
  installWhen : 'afteraddcontent',
/**
 * @cfg {String} defCType 指定要创建工具栏的ctype类型,默认值为smallbar
 */
  defCType : 'smallbar',
/**
 * @property tb
 * 工具条UI控件.
 * @type {CC.Base}
 */
  tb : false,
  
  initialize : function(opt){
    CC.extend(this, opt);
    this.gridEventHandlers = {};
    this.gridEventHandlers[this.installWhen] = this.installUI;
  },
  
  initPlugin : function(g){
  	
    var tb = this.tb || {};
    
    if(!tb.ctype)
     tb.ctype = this.defCType;
    
    tb.layout = 'tablize';
    this.tb = CC.ui.instance(tb);
  },
  
  installUI : function(){
  	this.grid.fire('beforeadd' + this.name, this.tb, this);
    this.grid.layout.add(this.tb);
    this.grid.fire('afteradd' + this.name, this.tb, this);
  }
});

CC.ui.def('gridtb', CC.ui.grid.plugins.Toolbar);
﻿/**
 * @class CC.ui.grid.plugins.Pagenation
 * 表格分页插件
 */
CC.create('CC.ui.grid.plugins.Pagenation', null, {
/**
 * @cfg {Number} current 当前页
 */
	current : false,
	
/**
 * @property count
 * 总页数
 * @type Number
 */
	count : 0,
/**
 * @cfg {Number} size 每页记录数
 */
	size : 10,
/**
 * @cfg {Boolean} autoLoad 表格后渲染后是否立即连接请求分页数据,默认为true.
 */
  autoLoad : true,

/**
 * @cfg {Object} params 在每次发起请求时共享的提交参数对象键值对
 */
  params : false,

/**
 * 可重写该方法创建并返回自定义的查询字符串
 * @param {Object} queryObject key:value的提交键值对,可在里面定义提交的数据
 * @return {String}
 * @method customQuery
 */
  customQuery : false,

/**
 * @cfg {Boolean} disabled 是否允许响应分页
 */
  disabled : false,
  
  initialize : function(opt){
    CC.extend(this, opt);
  },
  
  initPlugin : function(g){
    g.content.on('statuschange', this._onConnectorStatusChange, this);
    if(this.autoLoad)
      g.on('rendered', this.go, this);
  },
  
  gridEventHandlers : {
    afteraddtb : function(tb){
      this.installUI(tb);
      this.tb = tb;
    }
  },
  
  installUI : function(tb){
  	var self = this;
    tb.layout.fromArray([
      {id:'first', tip:'第一页', icon:'g-icon-navfirst', onclick : self.go.bind(self, 1)},
      
      {id:'pre', lyInf:{separator:true}, tip:'上一页', icon:'g-icon-navpre', onclick : self.pre.bind(self)},
      {lyInf:{separator:true}, id:'current', template:'<span class="lbl">第 <span><input class="g-ipt-text g-corner" style="text-align:center;" id="_i" size="3"/></span> 页</span>',ctype:'base',clickDisabled:true},
      {id:'next', tip:'下一页', icon:'g-icon-navnxt', onclick : self.next.bind(self)},
      
      {lyInf:{separator:true}, id:'last', tip:'最后一页', icon:'g-icon-navlast',onclick : function(){
        self.go(self.count);
      }},
      {lyInf:{separator:true}, id:'total', template:'<span class="lbl">共<span id="_t">0</span>页</span>', ctype:'base', clickDisabled:true},
      {id:'refresh',tip:'刷新当前页', icon:'g-icon-ref', onclick:function(){
        self.refresh();
      }}
    ]);
    this.currentEl = tb.$('current').dom('_i');
    this.totalEl = tb.$('total').dom('_t');
    
    tb.bindEnter( function(){
    	if(self.currentEl.value.trim())
        self.go(parseInt(self.currentEl.value));
    } ,true, null, this.currentEl);
    
  },
/**
 * 刷新
 */
  refresh : function(){
    this.go(this.current, true);
  },
  
/**
 * 设置每页记录条数
 * @param {Number} size
 * @return this
 */
  setSize : function(sz){
    this.size = sz;
    return this;
  },

/**
 * @return this;
 */
  disable : function(b){
    this.disabled = b;
    this.updateUIStatus();
    return this;
  },
/**
 * @event page:beforechange
 * 事件由{@link CC.ui.grid.plugins.Pagenation}提供,分页改变前发送.
 * @param {Object} pageInformation
 * @param {Object} pagenationPlugin
 * @member CC.ui.Grid
 */

/**
 * @event page:afterchange
 * 事件由{@link CC.ui.grid.plugins.Pagenation}提供,分页改变,数据加载完成后发送.<br/>
 * @param {Object} pageInformation
 * @param {Object} returnedJsonObject
 * @param {CC.Ajax} ajax
 * @member CC.ui.Grid
 */

 
  go : function(inf, fource){
    if(!this.disabled){
    	if(!inf || typeof inf === 'number')
    	  inf = {current:inf||1};
    	
    	var pre = this.current, cr = inf.current;
    	
      if( (pre !== cr || fource) && cr>0){
        this.grid.fire('page:beforechange', inf, this) !== false && this.onPageChange(inf) !== false;
      }
    }
    return this;
  },
  
  isResponseOk : function(){
    return true;
  },
  
  onPageChange : function(pageInf){
    if(this.url){
      if(!pageInf)
         pageInf = {};
      
      // 收集提交的分页信息
      // copy page info to temp object
      pageInf = this.createQuery(pageInf);
  
      this.grid.content.getConnectionProvider()
          .connect(
             CC.templ(this, this.url, 2), 
             { success : this._onSuccess, params  : pageInf}
          );
    }
  },
  
  _onConnectorStatusChange : function(s){
     if(s === 'open')
       this.tb.$('refresh').disable(true);
     else if(s === 'final')
     	 this.tb.$('refresh').disable(false);
  },
  
/**
 * 要完全自定义提交的参数,可重写该方法,要定义局部的提交参数,可重写customQuery方法
 * 应用参数的顺序为 default page info -> this.params -> this.customQuery
 */
  createQuery : function(pageInf){
    CC.extendIf(pageInf, {
          size:this.size,
          count:this.count,
          current:this.current
    });
    // update param data to temp object
    if(this.params)
      CC.extend(pageInf, params);
      
    if(this.customQuery)
      this.customQuery(pageInf);
    return pageInf;
  },
  
  _onSuccess : function(j){
  	// 注意当前的this是content.getConnectionProvider()
    var page = this.t.pCt.pagenation;
    if(page.isResponseOk(j)){
    	 json = j.getJson();
       // 更新分页信息
	     page.size    = json.size;
	     page.count   = json.count;
	     page.current = json.current || j.params.current;
	     
	     if(page.current > page.count)
	       page.current = page.count;
	     
    	 //clear content rows
    	 this.t.destoryChildren();
    	 
       // call default processor
       this.defaultDataProcessor('json', json.data);
       page.grid.fire('page:afterchange', page, json, j); 
       page.updateUIStatus();
    }
  },
  
/**
 * 更新UI状态.
 */
  updateUIStatus : function(){
  	var tb = this.tb, cur = this.current, cnt = this.count;
  	//has pre
  	var test = this.disabled || cnt === 1 || cur <= 1;
  	tb.$('first').disable(test);
    tb.$('pre').disable(test);
    //has last
    test = this.disabled || cur === cnt || cnt === 1;
  	tb.$('next').disable(test);
    tb.$('last').disable(test); 
    this.currentEl.value = cur||'';
    this.totalEl.innerHTML = cnt;
    
    tb.$('refresh').disable(this.disabled||(cnt==0));
  },
  
  next : function(){
  	if(this.current !== this.count)
  	  this.go(this.current + 1);
  },
  
  pre : function(){
  	if(this.current - 1 >= 1)
  	  this.go(this.current - 1);
  }
});
CC.ui.def('gridpage', CC.ui.grid.plugins.Pagenation);
﻿/**
 * @class CC.ui.grid.plugins.ColumnResizer
 * 一个列宽调整的插件
 */
CC.create('CC.ui.grid.plugins.ColumnResizer', null, function(){
  
  var G = CC.util.dd.Mgr, 
      Rz = G.resizeHelper, 
      E = CC.Event,
      Math = window.Math,
      
      // 当前resize列
      currentCol,
      
      // 列resize时宽度最大,最小长度限制
      bounds = [0, 0, 0, 0],
      
      // indicator 初始 xy
      IDX = 0;

/**
 * @cfg {Boolean} resizeDisabled 是否允许列缩放.<br>
 * 该属性来自{@link CC.ui.grid.plugins.ColumnResizer},一个列宽调整的插件.
 * @member CC.ui.grid.Column
 */
  CC.ui.grid.Column.prototype.resizeDisabled = false;

return {
  
/**@cfg {Boolean} resizeDisabled 是否禁用列缩放*/
  resizeDisabled : false,
  
/**@cfg {Number} monitorW*/
  monitorLen : 10,
 
  initialize : function(opt){
    CC.extend(this, opt);
  },
  
  install : function(hd){    
    hd.itemAction('mousemove', this.onColMouseMove, false, this)
      .itemAction('mousedown', this.onColMouseDown, false, this);
  },
  
  // 拖动开始时
  dragstart : function(){
     this.grid.fire('colresizestart', currentCol, currentCol.pCt.indexOf(currentCol));
     // indicator定位到初始位置
     var rdc = this.getIndicator(), 
         ldc = this.leftIndicator, 
         cxy = currentCol.absoluteXY(), 
         y;
         
     IDX     = cxy[0] + currentCol.view.offsetWidth - Math.floor(rdc.getWidth(true)/2);
     y       = cxy[1] + currentCol.view.offsetHeight;
     
     rdc.setXY(IDX, y).appendTo(document.body);
     ldc.setXY(cxy[0] - Math.floor(rdc.getWidth(true)/2), y).appendTo(document.body);
  },
  
  drag : function(){
    this.rightIndicator.view.style.left = (IDX + G.getDXY()[0]) + 'px';
  },
  
  dragend : function(){
     var dx = G.getDXY()[0];
     if(dx) currentCol.setWidth(currentCol.getWidth(true) + dx, true);
     this.leftIndicator.del();
     this.rightIndicator.del();
     this.grid.fire('colresizeend', this, currentCol.pCt.indexOf(currentCol));
  },
  
  afterdrag : function(){
     currentCol = null;
     Rz.applyMasker(false, '');
  },
  
  onColMouseMove : function(col, e){
     var st = col.view.style;
     if (col.resizeDisabled || G.isDragging()) {
          if (st.cursor != '') 
             st.cursor = "";
          return;
     }
     
     // td
     var el = col.view, 
         px = el.offsetWidth - E.pageX(e) + col.absoluteXY()[0];
     if (px < this.monitorLen) {
       st.cursor = "col-resize";
     } else if (st.cursor != ''){
       st.cursor = "";
     }
  },

  onColMouseDown: function(col, e){
     var el = col.view;
     if (el.style.cursor === 'col-resize' && !col.resizeDisabled && !G.isDragging()){
        // preparing for resizing
        // 记录当前列
        currentCol = col;
        
        Rz.applyMasker(true, 'col-resize');
        G.setHandler(this)
         .setBounds(this.calColWidthConstrain(col))
         .startDrag(col, e);
        E.preventDefault(e);
     }
  },
  
  calColWidthConstrain : function(col){
     if(this.grid.colwidthctrl){
       dx = this.grid.colwidthctrl.getConstrain(col);
       bounds[1] = -1*dx[0];
       bounds[0] = dx[1];
     }else {
       bounds[1] = Math.max(col.minW, 0);
       bounds[0] = Math.MAX_VALUE;
     }
     return bounds;
  },
  
  gridEventHandlers : {
  	afteraddheader : function(hd){
  	  this.install(hd);
  	}
  },
  
  indicatorCS : 'g-grid-cwidctor',
  
  getIndicator : function(){
    var rdc = this.rightIndicator;
    if(!rdc){
      var cfg = {
        view:'div',
        ctype:'base',
        cs: this.indicatorCS
      };
      rdc = this.rightIndicator = CC.ui.instance(cfg);
      this.leftIndicator        = CC.ui.instance(cfg);
      this.grid.header.follow(rdc)
                      .follow(this.leftIndicator);
    }
    return rdc;
  }
};

});

CC.ui.def('colresizer', CC.ui.grid.plugins.ColumnResizer);

CC.ui.Grid.prototype.plugins.push({name:'colresizer', ctype:'colresizer'});


/**
 * @event colresizestart
 * 当开始调整列宽时发送.<br>
 * 该属性来自{@link CC.ui.grid.plugins.ColumnResizer},一个列宽调整的插件.
 * @param {CC.ui.grid.Column} column
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */
 
 /**
 * @event colresizeend
 * 当列宽调整结束后发送.<br>
 * 该属性来自{@link CC.ui.grid.plugins.ColumnResizer},一个列宽调整的插件.
 * @param {CC.ui.grid.Column} column
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */

﻿/**
 * @class CC.ui.grid.plugins.RowChecker
 * 为表格增加checkbox选择列
 */
CC.create('CC.ui.grid.plugins.RowChecker', null, {
   
   name : 'rowchecker',
   
   cell :  {
      title:'&nbsp;',
      maxW : 20,
      minW : 20,
      resizeDisabled : true,
      id : 'rowCheckerCol',
      dataCol : false,
      checkedCS : 'g-check-checked',
      cellBrush: function(){
        this.id = 'rowcheckercell';
        return '<span class="g-checkbox g-form-el"><img class="chkbk" src="'+CC.Tpl.BLANK_IMG+'"></span>';
      },
      
      brush : function(){
        return '<span class="g-checkbox g-form-el" title="全选/反选"><img class="chkbk" src="'+CC.Tpl.BLANK_IMG+'"></span>';
      },
      
      //添加全选反选事件
      onRender : function(){
        this.superclass.onRender.call(this);
        this.domEvent('click', function(){
          var sp = this.pCt.pCt.content.getSelectionProvider();
          var sel = this.selected = !this.selected;
          this.checkClass(this.checkedCS, sel);
          if(sp.mode === 0)
            sp.selectAll(sel);
        });
      }
   },
   
   initialize : function( opt ){
      var cell = CC.extend({}, this.cell);
      if(opt){
        if(opt.cell) {
          CC.extend(cell, CC.delAttr('cell', opt));
        }
        CC.extend(this, opt);
      }
      
      this.grid.header.array && this.grid.header.array.insert(0, cell);
   },
   
   gridEventHandlers : {
  	 afteraddcontent : function(ct){
  	   ct.on('selectchange', function(current, previous, selProvider){
  	       var cell = current.$('rowcheckercell');
  	       var col  = ct.grid.header.$('rowCheckerCol');
   	       // maybe col destoryed ?
            cell.checkClass(col.checkedCS, selProvider.isSelected( current ));
            if(previous){
                var preCell = previous.$('rowcheckercell');
                preCell.checkClass(col.checkedCS, selProvider.isSelected( previous ));
            }
   	   });
  	}
   }
});

CC.ui.grid.plugins.RowChecker.WEIGHT = CC.ui.grid.plugins.RowChecker.prototype.weight = CC.ui.grid.Header.WEIGHT - 2;

CC.ui.def('gridrowchecker', CC.ui.grid.plugins.RowChecker);
﻿/**
 * @cfg {Boolean} sortable 属性来自{@link CC.ui.grid.plugins.Sorter},
 * 表示是否允许排序该列，默认为undefined。当值为undefined时，
 * 如果列为{@link CC.ui.grid.Column.dataCol}，允许对该列排序，否则不允许排序。
 * @member CC.ui.grid.Column
 */

/**
 * @cfg {Boolean} sortable 属性来自{@link CC.ui.grid.plugins.Sorter},
 * 表示是否允许排序表格，默认为true, false时关闭表格排序功能.
 * @member CC.ui.Grid
 */
 
/**
 * @cfg {Boolean} dt 属性来自{@link CC.ui.grid.plugins.Sorter},
 * 指明当前列的数据类型，可选类型有 string|bool|float|int|date, 参见{@link CC.util.TypeConverter}可注册自定义的数据类型
 * @member CC.ui.grid.Column
 */
 
/**
 * @property order 属性来自{@link CC.ui.grid.plugins.Sorter},表示当前列的排序方式，'asc','desc'或undefined。
 * @type String
 * @member CC.ui.grid.Column
 */
 
CC.ui.Grid.prototype.sortable = true;
CC.ui.grid.Column.prototype.sortable = undefined;
CC.ui.grid.Column.prototype.order    = undefined;
CC.ui.grid.Column.prototype.dt       = undefined;

/**
 * @class CC.ui.grid.plugins.Sorter
 * 一个列辅助排序插件。
 */

/**
 * @cfg {String} trigEvent 排序触发事件，默认为click
 */
 
/**
 * @cfg {String} order 首次排序方式[asc, desc]，默认为降序, desc.
 */
 
/**
 * @cfg {String} dt 默认列数据类型为string
 */
 
CC.create('CC.ui.grid.plugins.Sorter', null, {
  
  trigEvent : 'click',
  
  order : 'desc',
  
  dt : 'string',
  
  initialize : function(opt){
    CC.extend(this, opt);
  },

  gridEventHandlers : {
    afteraddheader : function(hd){
      if(this.grid.sortable)
        hd.itemAction(this.trigEvent, this.onColClick, false, this);
    }
  },
  
  onColClick : function(col){
    if(col.sortable || (col.sortable === undefined && col.dataCol)){
      var order = 
            col.order === undefined ? 
              this.order :
              col.order === 'desc' ? 'asc':'desc';

      this.sort(col, order);
    }
  },
  
  sort : function(col, order){
    var idx = col.pCt.indexOf(col), 
        dt  = col.dt === undefined ? this.dt:col.dt, 
        comparator = col.comparator ? 
          col.comparator : CC.util.TypeConverter.getComparator(dt);
      
    if(this.grid.fire('sortcol', col, idx, order, comparator) !== false){
      var pre = this.preSorted;
      if(pre)
        pre = CC.Base.byCid(pre);
      
      if(pre && pre !== col){
          // reset order
          pre.order = undefined;
      }
      
      this.preSorted = col.cacheId;

      col.order = order;
      col.sortDecorator(order, pre);
      this.grid.fire('sortcolend', col, idx, order, pre);
    }
  }
});

CC.ui.def('gridsorter', CC.ui.grid.plugins.Sorter);

CC.ui.Grid.prototype.plugins.push({name:'sorter', ctype:'gridsorter'});

/**
 * @event sortcol
 * 发送排序某列请求
 * @param {CC.ui.grid.Column} sortCol
 * @param {Number} colIndex
 * @param {String} order order asc or desc.
 * @param {String} comparator use this comparator to compare two column values.
 * @member CC.ui.Grid
 */
 
/**
 * @event sortcolend
 * 排序某列后发送
 * @param {CC.ui.grid.Column} sortCol
 * @param {Number} colIndex
 * @param {String} order order asc or desc.
 * @param {CC.ui.grid.Column} previous sorted column if existed.
 * @member CC.ui.Grid
 */

/**
 * @cfg {String} expandableRowContent 该属性来自{@link CC.ui.grid.plugins.ExpandableRow}, 行内容模板,将应用CC.templ结合当前行数据进行匹配
 * <br>
 <code>
   {
     // apply CC.templ(row, expandableRowContent);
     expandableRowContent : '<div>name:{name}</div>'
   }
 </code>
 * @member CC.ui.grid.Content
 */
 

CC.ui.grid.Content.prototype.expandableRowContent = false;

CC.ui.grid.Cell.prototype._isExpandTrig = false;

/**
 * @class CC.ui.grid.plugins.ExpandableRow
 */
 
CC.create('CC.ui.grid.plugins.ExpandableRow', null, {
   
   initialize : function( opt ){
      var cell = CC.extend({}, this.cell);
      if(opt){
        if(opt.cell) {
          CC.extend(cell, CC.delAttr('cell', opt));
        }
        CC.extend(this, opt);
      }
      
      this.grid.header.array && this.grid.header.array.insert(0, cell);
      
      // implements
      var gct = this.grid.content;
      if(gct) {
        gct.template = '<div class="g-grid-ct"><table class="ct-tbl" id="_ct_tbl" cellspacing="0" cellpadding="0" border="0"><colgroup id="_grp"></colgroup></table></div>';
        gct.ct = '_ct_tbl';
        gct.createRowView = this._createRowViewProxy;
      }
   },
  
  cell : {
    dataCol : false,
    title:'&nbsp;',
    maxW : 20,
    minW : 20,
    resizeDisabled : true,
    sortable : false,
    cellBrush: function(){
      // 做个标识
      this.pCt._rowExpandind = false;
      this._isExpandTrig     = true;
      this.addClass('exptrigcell');
      return '<a href="javascript:void(0)" class="trig"></a>';
    }
  },
  
  _createRowViewProxy : function(row){
      var cols = this.grid.header.children.length,
          erc = this.expandableRowContent;
      
      if(erc)
        erc = CC.templ(row, erc);
      
      var nd = CC.Tpl.forNode([
        '<table><tbody>',
          // cell data
          '<tr></tr>',
          
          // content
          '<tr>',
            // 竖条
            '<td class="g-gridrow-expandtd0"></td>',
            '<td class="g-gridrow-expandtd1" colspan="'+ (cols - 1) +'"><div id="_expand_area" class="g-gridrow-expandarea hid">' + (erc?erc:'') +'</div></td>',
          '</tr>',
        '</tbody></table>'
      ].join(''), row);
  
      row.view = nd.removeChild(nd.firstChild);
      row.ct = row.view.firstChild;
      row.expandRowContentEl = row.dom('_expand_area');
      
      nd = null;
      cols = null;
  },
  
  gridEventHandlers : {
    cellclick : function(cell, e){
      if(cell._isExpandTrig){
        var row = cell.pCt;
        this.expandRow(row, !row._rowExpandind);
        CC.Event.stop(e);
      }
    }
  },

/**
 * @return {HTMLElement}
 */
  getRowContentEl : function(row){
    return row.dom('_expand_area');
  },
  
  expandRow : function(row, expand){
    if(row._rowExpandind !== expand){
      if(this.grid.fire('expandablerow:beforeexpand', row, expand) !== false){
        row._rowExpandind = expand;
        CC.fly(row.expandRowContentEl)
          .display(expand)
          .unfly();
          
        row.checkClass('g-gridrow-expand', expand);
        
        this.grid.fire('expandablerow:afterexpand', row, expand);
      }
    }
  }
});

CC.ui.grid.plugins.ExpandableRow.WEIGHT = CC.ui.grid.plugins.ExpandableRow.prototype.weight = CC.ui.grid.Header.WEIGHT - 1;

CC.ui.def('gridexpandablerow', CC.ui.grid.plugins.ExpandableRow);
﻿/**
 * @class CC.ui.ContainerBase
 */

/**
 * @cfg {Boolean} isForm 属性来自表单控件,注明该容器是否为一个表单容器。
 * 该属性便于表单元素通过getForm获得自身所在的表单容器。
 */
CC.ui.ContainerBase.prototype.isForm = false;

/**
 * @class CC.ui.form
 */

/**
 * @class CC.ui.form.FormElement
 * 表单元素基类，所有表单元素都派生自该类。
 * @extends CC.Base
 */
 
/**
 * @event focus
 * 元素获得焦点时发送
 */
/**
 * @event blur
 * 元素失去焦点后发送
 */

/**@cfg {String} name 指定提交字段的名称*/

/**@cfg {Object} value 值*/

/**
 * @property element
 * 提交数据放在这个html form element里.
 * @type {HTMLElement}
 */

/**
 * @cfg {Function} validator 数据验证函数.
 * 返回true或错误信息
 */

/**
 * @cfg {Boolean} validateOnblur=true 失去焦点时是否验证.
 */
 
/**
 * @cfg {String} elementNode 指定原生的表单元素所在结点的ID，默认为'_el'，
 * 每个表单控件都有一个原生的表单元素。<br>
 * 该配置通常用于创建或定制表单控件，使用时不必理会。
 */


(function(){
var spr,
    CC = window.CC,
    Bx = CC.Base,
    Tpl = CC.Tpl;

CC.create('CC.ui.form.FormElement', Bx, {

    name : false,

    value : undefined,

    element : false,
    
    elementNode: '_el',

    eventable : true,

    validator : false,

    validateOnblur : true,
    
    elementCS: 'g-form-el',

    initComponent: function() {
      //generate template first and searching form element node..
      var v = this.view;
      if (!v) {
        var t = this.template || this.type;
        this.view = v = Tpl.$(t);
      }
      var el = this.element;

      if (!el) {
        el = this.dom(this.elementNode);
        if(!el)
          el = this.view;
          
        this.element = el;
      }
      
      this.focusNode = el;
      
      this.addClass(this.elementCS);

      Bx.prototype.initComponent.call(this);

      if (this.name) this.setName(this.name);

      if (this.value) {
        v = CC.delAttr(this, 'value');
        this.setValue(v);
      }
      
      if (this.focusCS)
        this.bindFocusCS();
    },
/**
 * 设置聚焦,失焦时样式切换效果
 * @private
 */
    bindFocusCS : function(cs){
      if(cs)
        this.focusCS = cs;
      this.on('focus', this._switchFocusCS);
      this.on('blur', this._switchFocusCS);
    },

    _switchFocusCS : function(){
      if(this.focused){
        this.addClassIf(this.focusCS);
        this.focusCallback();
      }
      else this.delClass(this.focusCS);

    },

    /**
     * 用于修改聚焦样式时回调,如果子项有聚焦效果并需要监听聚焦的话,就不用重新监听一次,直接重写该函数即可.
     * @private
     */
    focusCallback : fGo,

    /**
     * 继承的FormElement控件必要实现控件失去/获得焦点时事件的发送.
     * @private
     */
    onFocusTrigger : function(){
      if(this.focused)
        return;
      this.focused = true;

      if (this.onfocus) this.onfocus();

      this.fire('focus');
    },

    /**@private*/
    onBlurTrigger : function(){
      if(this.focused){
        this.focused = false;

      if(this.validateOnblur && this.validator){
        this.checkValid();
      }

      if (this.onblur)
          this.onblur();

        this.fire('blur');
      }
    },

    /**
     * 继承的FormElement控件必要实现控件按件事件的发送.
     * @private
     */
    onKeydownTrigger : function(evt){
      this.fire('keydown', evt);
    },

/**
 * 验证控件,利用控件自身的validator验证,并调用{@link decorateValid}方法修饰结果
 * @return {Boolean}
 */
    checkValid : function(){
      var isv = this.validator? this.validator(this.getValue()):true;
      this.decorateValid(isv);
      return isv;
    },

/**
 * 验证失败后修饰控件的"错误"状态.重写该方法可自定义修饰"错误提示"的方法
 * @param {Boolean} isValid
 */
    decorateValid : function(msg){
    	var es = this.errorCS;
    	if(es)
    		this.checkClass(es, !(msg === true));
    },

/**
 * 置值
 * @param {Object} value
 * @return this
 */
    setValue: function(v) {
      this.element.value = v;
      this.value = v;
      return this;
    },

/**
 * 获得html form element元素值.
 * @return {Object}
 */
    getValue : function(){
      return this.element.value;
    },

/**获得控件文本显示值
 * @return {Object}
 */
    getText : function(){
      return this.getValue();
    },
/**
 * 设置提交字段名称.
 * @param {String} name
 * @return this
 */
    setName: function(n) {
      this.element.name = n;
      this.name = n;
      return this;
    },

/**
 * 返回表单所在的表单容器，任何一个容器控件只需注明是否表单容器即可为表单容器,参见{@link CC.ui.ContainerBase#isForm}.
 * @return {CC.ui.ContainerBase|NULL} formContainer 或 null
 */   
    getForm : function(){
      var p = this.pCt;
      while(p){
        if(p.isForm)
          return p;
        p = p.pCt;
      }
      return null;
    },
    
    active : fGo,
    
    deactive : fGo,
    
    // @override
    mouseupCallback: function(evt) {
      if (this.onclick)
        this.onclick(evt, this.element);
    }
}
);

var cf = CC.ui.form.FormElement;
spr = cf.prototype;

var fr = CC.ui.form;

Tpl.def('Text', '<input type="{type}" class="g-ipt-text g-corner" />')
   .def('Textarea', '<textarea class="g-textarea g-corner" />')
   .def('Checkbox', '<span tabindex="0" class="g-checkbox"><input type="hidden" id="_el" /><img src="' + Tpl.BLANK_IMG + '" class="chkbk" /><label id="_tle"></label></span>')
   .def('Select', '<select class="g-corner"/>')
   .def('CC.ui.form.Label', '<span><label id="_tle" class="cap"></label></span>');
/**
 * @class CC.ui.form.Text
 * @extends CC.ui.form.FormElement
 * 封装原生input text元素,引用名为text
 */
/**
 * @cfg {String} type text或者password，默认text
 */
CC.create('CC.ui.form.Text', cf, {

    type : 'text',
    
    template : 'Text',
    
    initComponent : function(){
      this.view = Tpl.forNode(Tpl[this.template], this);
      spr.initComponent.call(this);
      this.domEvent('focus', this.onFocusTrigger)
          .domEvent('blur', this.onBlurTrigger)
          .domEvent('keydown', this.onKeydownTrigger);
    },
    
    maxH : 20,

    focusCS: 'g-ipt-text-hover',
    
    focusCallback: function(evt) {
      spr.focusCallback.call(this, evt);
      //fix chrome browser.
      var self = this;
      //IE6下 this.view.select.bind(this.view).timeout(20);
      // 也会出错,它的select没能bind..晕
      (function() {
        self.view.select();
      }).timeout(20);
    }
});

CC.ui.def('text', fr.Text);
/**
 * @class CC.ui.form.Textarea
 * @extends CC.ui.form.FormElement
 * 封装原生textarea元素,引用名为textarea
 */
CC.create('CC.ui.form.Textarea', cf, fr.Text.constructors, {
  template : 'Textarea',
  focusCallback: cf.prototype.focusCallback,
  maxH : Bx.prototype.maxH
});

CC.ui.def('textarea', fr.Textarea);

/**
 * @class CC.ui.form.Checkbox
 * @extends CC.ui.form.FormElement
 * 引用名为checkbox
 */

/**
 * @cfg {Boolean} checked 是否选中状态,参见{@link #setChecked}
 */
/**
 * @cfg {Function} oncheck 状态改变时回调 oncheck(checked)
 */
CC.create('CC.ui.form.Checkbox', cf, {
    template : 'Checkbox',
    hoverCS: 'g-check-over',
    clickCS: 'g-check-click',
    checkedCS: 'g-check-checked',
    
    initComponent: function() {
      spr.initComponent.call(this);
      
      if (this.checked) {
        delete this.checked;
        this.setChecked(true);
      }
      
      this.domEvent('focus', this.onFocusTrigger)
          .domEvent('blur', this.onBlurTrigger)
          .domEvent('keydown', this.onKeydownTrigger);
    },

    mouseupCallback: function(evt) {
      this.setChecked(!this.checked);
      spr.mouseupCallback.call(this, evt);
    },
/**
 * @param {Boolean} checked
 * @return this
 */
    setChecked: function(b) {
      if(this.checked !== b){
        this.checked = b;
        this.element.checked = b;
        this.checkClass(this.checkedCS, b);
        if (this.oncheck) 
          this.oncheck(b);
      }
      return this;
    }
});
CC.ui.def('checkbox', fr.Checkbox);


/**
 * @class CC.ui.form.Radio
 * @extends CC.ui.form.FormElement
 */

/**
 * @cfg {Function} oncheck 状态改变时回调 oncheck(checked)
 */

CC.create('CC.ui.form.Radio', cf, fr.Checkbox.constructors, {
/**
 * @cfg {Boolean} checked 是否选中状态,参见{@link #setChecked}
 */
  innerCS: 'g-radio',
  template: 'Checkbox',
  hoverCS: 'g-radio-over',
  clickCS: 'g-radio-click',
  checkedCS: 'g-radio-checked',
  elementNode : false,
  
  mouseupCallback: function(evt) {
    if(!this.checked)
      this.setChecked(true);
    spr.mouseupCallback.call(this, evt);
  },
  
  getGroup : function(){
    var f = this.getForm();
    if(f) {
      var rg = f._RADIOGROUPS;
      if(!rg)
        rg = f._RADIOGROUPS = {};
        
      var rs = rg[this.name];
      if(rs) {
        return Bx.byCid(rs);
      } else {
          rs = CC.ui.instance('radiogrp', {pCt:f, showTo:f.ct, name:this.name});
          f.follow(rs);
          rg[this.name] = rs.cacheId;
          return rs;
      }
    }
  },
/**
 * @param {Boolean} checked
 * @return this
 */
  setChecked : function(checked){
    var pc = this.checked;
    fr.Checkbox.prototype.setChecked.apply(this, arguments);
    
    if(pc !== checked && checked && this.name){
       var g = this.getGroup();
       g && g.setChecked(this, true);
    }
    
    return this;
  }
});
CC.ui.def('radio', fr.Radio);

CC.Tpl.def('CC.ui.form.RadioGroup', '<input type="hidden" />');

/**
 * @class CC.ui.form.RadioGroup
 * @extends CC.ui.form.FormElement
 * Radio分组，引用名为radiogrp
 */
CC.create('CC.ui.form.RadioGroup', cf, {
/**
 * 获得当前选中的Radio
 * @return {CC.ui.form.Radio}
 */
  getChecked : function(){
    return this.currentRadio && Bx.byCid(this.currentRadio);
  },
/**
 * 设置Radio的选择状态。
 * @param {CC.ui.form.Radio} radio
 * @param {Boolean} selected
 */
  setChecked : function(radio, b){
    if(b){
      var c = this.getChecked();
      if(!c || c !== radio){
        if(c) {
          c.setChecked(false);
        }
        this.currentRadio = radio.cacheId;
        var v = radio.getValue();
        if(v !== undefined)
          this.setValue( v );
      }
    }else {
      this.currentRadio = null;
      this.setValue('');
    }
  }
});
CC.ui.def('radiogrp', CC.ui.form.RadioGroup);

/**
 * @class CC.ui.form.Select
 * 对原生select元素的轻量封装
 * @extends CC.ui.form.FormElement
 * @cfg {Array} array options, 属性为原生option元素的属性，例如{text:'text', value:'value'}
 * 
 <pre><code>
   var sel = CC.ui.instance(
     {
        ctype:'select',
        selectedIndex : 1,
        onchange : function(){
            alert(this.getSelIdx());
        },
        array:[
          {text:'请选择...', value:0},
          {text:'选项一...', value:1},
          {text:'选项二...', value:2}
        ]
     });
     
     alert(sel.getSelIdx());
     sel.add({text:'选项三'});
     sel.setSelIdx(3);
     sel.$(3).text = '改变选项三';
 </code></pre>
 */

/**
 * @cfg {Number} selectedIndex 可以在初始化时设置一个默认选中的选项下标。
 */
 
/**
 * @cfg {Function} onchange 选择变更时触发
 */
/**
 * @event change
 * 选择变更时发送
 */
CC.create('CC.ui.form.Select', cf, {
  
    template:'Select',
    
    initComponent: function() {
      spr.initComponent.call(this);
      this.domEvent('focus', this.onFocusTrigger)
          .domEvent('blur', this.onBlurTrigger)
          .domEvent('keydown', this.onKeydownTrigger)
          .domEvent('change', this.onChangeTrigger);
          
      if(this.array){
        for(var i=0,as = this.array,len=as.length;i<len;i++){
          this.add(as[i]);
        }
        delete this.array;
      }
      
      if(this.selectedIndex){
        this.element.selectedIndex = this.selectedIndex;
        delete this.selectedIndex;
      }
    },
    
    onChangeTrigger : function(){
      if(this.onchange)
         this.onchange();
         
      this.fire('change');
    },

    getText : function(){
      var sel = this.element.options[this.element.selectedIndex];
      return sel?sel.text : '';
    },
/**
 * 添加一个option元素
 * @param {Object} option {text:'option text', value:'option value'}
 */
    add : function(option){
      var opts = this.element.options,
          op = document.createElement("OPTION");
      CC.extend(op, option);
      opts[opts.length] = op;
    },
/**
 * 获得下标对应的html option元素
 * @param {Number} index
 * @return {HTMLElement} option
 */
    $ : function(idx){
        return this.element.options[i];
    },
/**
 * 获得当前选择项下标。
 * @return {Number} selectedIndex
 */
    getSelIdx : function(){return this.element.selectedIndex;},
/**
 * 设置选中选项
 * @param {Number} index
 */
    setSelIdx : function(idx){this.element.selectedIndex = idx;}
});

CC.ui.def('select', fr.Select);
/**
 * @class CC.ui.form.Label
 * 标签，
 * 引用名为label
 * @extend CC.Base
 */
CC.create('CC.ui.form.Label', CC.Base);
CC.ui.def('label', CC.ui.form.Label);

})();
﻿/**
 *
 */
CC.Tpl.def('CC.ui.form.Line', '<li class="g-form-ln"><label class="desc" id="_lbl"><span id="_tle"></span><span class="req" id="_req">*</span></label><div id="_ctx" class="field-ct"></div></li>')
      .def('CC.ui.form.Layer', '<ul class="g-formfields"></ul>')
      .def('CC.ui.form.FormLayer', '<form><ul id="_ctx" class="g-formfields"></ul></form>')
      .def('CC.ui.form.FieldsetUL', '<fieldset class="g-fieldset g-corner"><legend id="_tle"></legend><div id="_ctx" class="fieldset-ct"></div><div class="g-clear"></div></fieldset>');


CC.create('CC.ui.form.Line', CC.ui.ContainerBase, function(spr) {
  return {
/**
 * 指明Label结点ID,不存在时设为false
 * @type {String}
 */
    labelNode: '_lbl',

    hlabel:false,

    hlabelCS:'g-form-hln',

/**
 * 如果字段是必须的,属性指明用于修饰"必须"字段的结点
 */
    reqNode : '_req',

/**
 * 域中标签的htmlFor指向的子项id,默认为0,为首级第一个子项
 */
    labelFor: 0,

    ct: '_ctx',

    title: false,

    initComponent: function() {
      spr.initComponent.call(this);

      if(this.hlabel)
        this.addClass(this.hlabelCS);

      if (this.title === false && this.labelNode !== false) {
        var d = this.dom(this.labelNode);
        d.parentNode.removeChild(d);
      }

/**
 * @name CC.ui.form.FieldLI
 * @property {Boolean} required 值是否必须,
 * 该属性在基类中只起修饰作用,并无验证功能,
 * 并且当属性为真时,存在结点id为this.reqNode用于显示"必须"提示符.
 */
      if(this.required)
        CC.fly(this.reqNode).show().unfly();
    },

    onAdd: function(field) {
    	spr.onAdd.apply(this, arguments);
      if(this.labelFor !== false && this.$(this.labelFor) === field){
        if(field.element){
         var lbl =  this.dom(this.labelNode);
         if(lbl)
          lbl.htmlFor = field.element.id;
        }
      }
    }
  };
});



CC.ui.def('fieldline',CC.ui.form.Line);

CC.create('CC.ui.form.Layer', CC.ui.ContainerBase, {
  itemCls : CC.ui.form.Line,
  ct: '_ctx'
});

CC.ui.def('fieldlayer', CC.ui.form.Layer);

CC.create('CC.ui.form.FormLayer', CC.ui.ContainerBase, {
  itemCls : CC.ui.form.Line,
  ct: '_ctx',
/**
 * @return {HTMLElement} form
 */
  getFormEl : function(){
  	return this.view;
  },
/**
 * 根据name返回首个元素或多个控件元素.
 * @param {String} name 控件元素的name值
 * @param {Boolean} [loop] 是否返回多个
 * @return {CC.Base|null|Array}
 */
    byName : function(name, loop){
      return this.byId(name, 'name',loop);
    }
});

CC.ui.def('form', CC.ui.form.FormLayer);

CC.ui.form.Fieldset = function(opt){
  return new CC.ui.form.Layer(CC.extendIf(opt, {
    template:'CC.ui.form.FieldsetUL',
    itemCls : CC.ui.form.Layer,
    ct: '_ctx'
  }));
};


CC.ui.form.Line.prototype.itemCls = CC.ui.form.Layer;

CC.ui.def('fieldset',CC.ui.form.Fieldset);
﻿CC.Tpl.def('CC.ui.form.Combox', '<div class="g-panel g-combo" tabindex="1" hidefocus="on"><div class="g-panel-wrap g-combo-wrap" id="_wrap"><input type="hidden" id="_el" /><div class="unedit-txt" id="_uetxt"></div><span class="downIco" id="_trigger"></span></div></div>');

/**
 * @class CC.ui.form.Combox
 * @extends CC.ui.form.FormElement
 */
CC.create('CC.ui.form.Combox', CC.ui.form.FormElement, function(superclass) {

  function allMather() { return true; }

  var Event = CC.Event;

  return /**@lends CC.ui.form.Combox#*/{

    hoverCS: 'g-combo-on',

    uneditCS: 'g-combo-unedit',

    downCS: 'g-combo-dwn',

    selectorCS:'g-combo-list',

    _leaveFocus: true,

    maxH: 21,
/**
 * @cfg {Boolean} filterContent 输入时是否过滤子项,默认为true
 */
    filterContent : true,
/**
 * @cfg {CC.Base} selector 下拉面板控件.
 */
    selector : false,
    
    initComponent: function() {

      //用于填充selector选项的数组
      var array = CC.delAttr(this, 'array');

      //编辑框
      this.editor = new CC.ui.form.Text({
        name: this.name
      });

      //父类初始化
      superclass.initComponent.call(this);

      //不可编辑时显示的主体
      this.uneditNode = this.dom('_uetxt');

      //加入编辑框
      this.dom('_wrap').insertBefore(this.editor.view, null);

      //下拉框主体
      var st = this.selector;

      //默认的下拉框为Folder控件
      st = st ? CC.ui.instance(st):this.createDefSelector();

      var sn = this.getSelectioner(st);
      
      if (array) 
        sn.fromArray(array);

      this.attach(st, sn);
      this._bindKey();

      if (this.uneditable) {
        delete this.uneditable;
        this.setEditable(false);
      } else this.setEditable(true);

      if (this.selected)
        sn.getSelectionProvider().select(this.selected);
      
      delete this.selected;
      
      //
      // 由于Combox由多个控件拼装而成, 为了能正确捕获Combox控件的blur, focus事件,
      // 不得不多监听几个事件,并作一处特殊处理.
      //
      this.domEvent('focus', this.onFocusTrigger)
          .domEvent('blur', this.onBodyBlurTrigger)
          .domEvent('focus', this.onFocusTrigger, false, null, this.editor.element)
          .domEvent('blur', this.onBodyBlurTrigger, false, null, this.editor.element)
          .domEvent('keydown', this.onKeydownTrigger)
          .wheelEvent(this.onMouseWheel, true);
      
      //焦点消失时检查输入值是否是下拉项的某一项,如果有,选择之.
      this.on('blur', this.checkSelected);
    },
    
    onHide : function(){
    	if(!this.selector.hidden)
    		this.selector.hide();
    	superclass.onHide.apply(this, arguments);
    },
    
    createDefSelector : function(){
        var st = CC.ui.instance({
        	ctype:'folder',
          showTo: document.body,
          shadow: true
        });
        return st;
    },
    
/**
 * 获得下拉控件中具有selectionProvider的控件
 */
    getSelectioner : function(st){
      return this.selectioner || st;
    },
    
    onMouseWheel : function(e){
      var dt = CC.Event.getWheel(e);
      if( dt>0 ){
        this.selectioner.selectionProvider.pre();
      }else if( dt<0 ){
        this.selectioner.selectionProvider.next();
      }
    },

    /**
     * @private
     * combox 主体失焦时触发
     */
    onBodyBlurTrigger: function() {
      if (this.selector.hidden && this._leaveFocus) {
        this.onBlurTrigger();
      }
    },

    onBlurTrigger: function() {
      this.leaveFocusOn();
      superclass.onBlurTrigger.call(this);
    },

    disable: function(b) {
      superclass.disable.call(this, b);
      this.editor.disable(b);
    },
/**
 * 设置下拉面板滚动高度,主要是为了出现滚动条.
 * @private
 */
    setScrollorHeight: function(h) {
      this.selector.fly('_scrollor').setHeight(h).unfly();
    },
    
/**
 * 是否可编辑.
 * @param {Boolean} editable
 */
    setEditable: function(b) {
      if (this.uneditable !== undefined && this.uneditable == b) return this;

      if (this.uneditable && b) {
        this.delClass(this.uneditCS)
            .unEvent('click', this.onUneditableClick);
      } else if (b) {
        this.domEvent('click', this.onUneditableClick, true, null, '_trigger')
            .domEvent('mousedown', this.leaveFocusOff, false, null, '_trigger');
      } else {
        this.addClass(this.uneditCS)
            .domEvent('click', this.onUneditableClick)
            .unEvent('click', this.onUneditableClick, '_trigger')
            .unEvent('mousedown', this.leaveFocusOff, '_trigger');
      }

      this.uneditable = !b;
      this.focusNode = !b ? this.view: this.editor.element;

      return this;
    },

    //@override
    onKeydownTrigger : function(evt){
      if(this._keyHandler(evt)===false){
        Event.stop(evt);
        return false;
      }

      superclass.onKeydownTrigger.apply(this, arguments);
    },

    onUneditableClick: function(evt) {
      var b = !this.selector.hidden;
      this.leaveFocusOff();
      if (!b && this.filterContent) {
        this.selectioner.filter(allMather);
      }
      this.showBox(!b);
    },

    leaveFocusOff: function() {
      if (this._leaveFocus !== false) this._leaveFocus = false;
    },

    leaveFocusOn: function() {
      if (this._leaveFocus !== true) this._leaveFocus = true;
    },

    attach: function(selector, selectioner) {
      this.selector = selector;
      this.selectioner = selectioner;
      
      this.follow(selector);

      selector.display(false);

      //ie hack:
      if (selector.shadow)
        selector.shadow.setZ(999);

      selector.addClass(this.selectorCS);
      selectioner.on('selected', this.onSelected, this)
      selectioner.on('itemclick', this.onclickEvent, this);

      this._savSelKeyHdr = selector.defKeyNav;

      var self = this;

      selectioner.getSelectionProvider().defKeyNav = (function(ev) {
        self._keyHandler(ev, true);
      });
    },

    onBoxContexted: function(evt) {
    	//来自浏览器事件
      if(evt){
	      var el = Event.element(evt);
	      if (this.ancestorOf(el)) return false;
      }
      //标记为外部影应,失去焦点
      this.leaveFocusOn();
      this.showBox(false);
      this.leaveFocusOff();
      this.onBlurTrigger();
    },

    onclickEvent: function() {
      this.showBox(false);
    },
/**
 * 返回false表示不再发送该事件
 * @private
 */
    _keyHandler: function(ev, isSelectorEv) {
      var kc = ev.keyCode;
      if (kc == 27 || kc == 13) {
        if(!this.selector.hidden){
        	this.showBox(false);
        	Event.stop(ev);
          return false;
        }
      }

      //handle to selector.
      if (!isSelectorEv) {
        return this.selectioner.selectionProvider.navigateKey(ev);
      }
    },

    _filtHandler: function(ev) {
      var kc = ev.keyCode,
          sn = this.selectioner,
          p = sn.selectionProvider;
      if (kc === p.UP || kc === p.DOWN || this.noFilt || kc === 27 || kc === 13 || kc === 9) return;

      var v = this.editor.element.value;
      if (v == '') p.select(null);

      if (p.selected && kc != Event.LEFT && kc != Event.RIGHT)
         p.select(null);

      if (this.filterContent && v != this.preValue) {
        sn.filter(this.matcher, this);
        this.preValue = v;
      }
      this.leaveFocusOff();
      this.showBox(true);
    },

    showBox: function(b) {
      var st = this.selector, ds = !st.hidden;
      if(ds != b){
        if (!b) {
          st.display(false);
          if (!this._leaveFocus) {
            if (!this.uneditable) this.editor.focus(true);
            else this.focus(true);
          }
          this.delClass(this.downCS);
          return;
        }else {
          st.display(true);
        }
  
        this.preferPosition();
        if (st.shadow) st.shadow.reanchor();
        if (!this.uneditable) this.editor.focus(true);
        else this.focus(true);
  
        if (ds) return;
        this.checkSelected();
        this.addClass(this.downCS);
        st.bindContext(this.onBoxContexted, false, this).display(true);
      }
    },

    active : function(){
      this.showBox(true);
    },
    
    deactive : function(){
    	this.showBox(false);
    },
    /**
     * 检查输入值是否为下拉选项中的某一项.
     * 如果有多个相同项,并且当前已选其中一项,忽略之,否则选中符合的首个选项.
     * @private
     */
    checkSelected: function() {
      var sn = this.selectioner,
          p  = sn.getSelectionProvider();

      var v = this.getValue();

      if (v === '' && p.selected) {
        p.select(null);
        return;
      }

      if (p.selected && this.getItemValue(p.selected) == v) return;

      p.select(null);
      
      var self = this;
      sn.each(function(it) {
        if (!it.hidden && !it.disabled && self.getItemValue(it) === v) {
          p.select(it);
          return false;
        }
      });
    },

   /**
   * 定位选择容器位置
   * @private
   */
    preferPosition: function() {
      var s = this.selector;
      if (!this.noAutoWidth) s.setWidth(this.preferWidth());
      s.anchorPos(this, 'lb', 'hr', null, true, true);
    },

  /**
   * 返回最佳宽度,重写该函数自定下拉选择容器的宽度
   * 默认返回combox的宽度.
   * @private
   */
    preferWidth: function() {
      return this.getWidth();
    },

    _bindKey: function(event) {
      this.domEvent('keydown', this._keyHandler, false, null, this.editor.view);
      this.domEvent('keyup', this._filtHandler, false, null, this.editor.view);
    },

    onSelected: function(item) {
      this.setValueFromItem(item, true);
      if (!this.uneditable && this.focused) this.editor.focus(true);
    },
    
    getItemValue : function(item){
      if(item.getValue)
        return item.getValue();
      if(item.value !== undefined)
        return item.value;
      return item.getTitle();
    },
    
    getItemTitle : function(item){
      return item.title!==undefined?item.title : item.value;
    },

    setValue : function(v, inner){
      superclass.setValue.call(this, v);
      if (this.selector && !inner) {
        this.checkSelected();
      }
      return this;
    },

    getText : function(){
      if(this.uneditable)
        return this.title||'';
      return this.editor.getValue();
    },
    
    setTitle : function(t){
      if(this.uneditable)
        this.uneditNode.innerHTML = t;
      else this.editor.setValue(t);
      this.title = t;
      return this;
    },
    
    /**
     * @private
     */
    setValueFromItem: function(item, inner) {
      var v = this.getItemValue(item), 
          t = this.getItemTitle(item);
      this.setValue(v, inner);
      this.setTitle(t);
      return this;
    },

    getValue: function() {
      return superclass.getValue.call(this);
    },

    // 自定过滤重写该函数即可.
    matcher: function(item) {
      var tle = this.getItemTitle(item);
      var v = this.editor.element.value;
      if (v == '') {
        item.setTitle(tle);
        return true;
      }

      if (tle.indexOf(v) >= 0) {
        //item.addClass('g-match');
        var nd = item.titleNode || item.dom('_tle');
        if(nd) nd.innerHTML = tle.replace(v, '<span class="g-match">' + v + '</span>');
        return true;
      }
      item.setTitle(tle);
      return false;
    },
/**
 * 选择下拉项.
 */
    select: function(id) {
      this.selectioner.selectionProvider.select(id);
    }
  };
});
CC.ui.def('combo', CC.ui.form.Combox);
﻿CC.Tpl.def('CC.ui.form.Progressbar' , '<table class="g-progressbar" cellspacing="0" cellpadding="0" border="0"><tr><td class="g-progress-l"><i>&nbsp;</i><input type="hidden" id="_el" /></td><td class="g-progress-c"><img id="_img" src="http://www.bgscript.com/s.gif" alt=""/></td><td class="g-progress-r"><i>&nbsp;</i></td></tr></table>');
/**
 * @class CC.ui.form.Progressbar
 * @extends CC.ui.form.FormElement
 */
CC.create('CC.ui.form.Progressbar', CC.ui.form.FormElement, function(father){
  if(!CC.ui.form.Progressbar.img)
    CC.ui.form.Progressbar.img = 'http://bgjs.googlecode.com/svn/trunk/cicy/default/ru/progressbar.gif';

  return {
    /**@cfg {Number} range 范围,默认100*/
    range : 100,

    value : 0,

    initComponent : function(){
      this.createView();
      if(CC.ui.form.Progressbar.img){
        this.img = this.dom('_img');
        this.img.src = CC.ui.form.Progressbar.img;
      }
      //else
      father.initComponent.call(this);
    },

    setValue : function(v){
      if(v>=100){
        CC.fly(this.img).fastStyleSet('width','100%').unfly();
        this.onstop();
        this.fire('progressstop', this);
        return father.setValue.call(this, 100);
      }

      CC.fly(this.img).fastStyleSet('width',v+'%').unfly();
      return father.setValue.call(this, v);
    },
/**@cfg {Function} onstop*/
    onstop : fGo
  };
});

CC.ui.def('progressbar', CC.ui.form.Progressbar);
(function(){
var FP = CC.ui.form.FormElement.prototype;
var E = CC.Event;

CC.Tpl.def('CC.ui.form.DatepickerField', '<div class="g-datepicker-field"><div class="field-wrap"><input type="text" class="g-corner" id="_el" /><a title="点击选择日期" tabindex="-1" class="trigger" id="_trigger" href="javascript:fGo();"></a></div></div>');
/**
* @class CC.ui.form.DatepickerField
* @extends CC.ui.form.FormElement
*/
CC.create('CC.ui.form.DatepickerField', CC.ui.form.FormElement, {

	focusCS: 'g-datepicker-field-focus',

	triggerHoverCS: 'triggerOn',

	contextCS: 'g-datepicker-field-ctx',

	_leaveFocus: true,

	maxH: 20,

	applyTimeout: 200,

	initComponent: function() {
		FP.initComponent.call(this);
		//关闭leaveFocus标记, element失焦后忽略
		this.bindHoverStyle(this.triggerHoverCS, true, null, null, null, '_trigger', '_trigger')
		.domEvent('click', this.onTriggerClick, false, null, '_trigger')
		.domEvent('mousedown', this.leaveFocusOff, false, null, '_trigger')
		.domEvent('mousedown', this.onFocusTriggerDelay)
		.domEvent('focus', this.onFocusTrigger, false, null, this.element)
		.domEvent('blur', this.onTrackBlur, false, null, this.element)
		.domEvent('keydown', this.onKeydownTrigger, false, null, this.element);
	},

	//@override
	active : function(){
		this.showDatepicker(true);
	},

	deactive : function(){
		this.showDatepicker(false);
	},

	onHide : function(){
		if(!this.getDatepicker().hidden)
		this.getDatepicker().hide();
		CC.ui.form.FormElement.prototype.onHide.apply(this, arguments);
	},

	onTrackBlur: function() {
		if (!this._leaveFocus && (this.datepicker && this.datepicker.hidden)) {
			this.leaveFocusOn();
			return;
		}
		this.onBlurTrigger();
	},

	// mousedown -> blur -> timeout
	onFocusTriggerDelay: function() {
		var self = this;
		(function() {
			self.leaveFocusOn();
			self.onFocusTrigger();
		}).timeout(0);
	},

	onBlurTrigger: function() {
		//恢复标记
		if (!this._leaveFocus) return;
		FP.onBlurTrigger.call(this);
	},

	leaveFocusOff: function() {
		if (this._leaveFocus !== false) this._leaveFocus = false;
	},

	leaveFocusOn: function() {
		if (this._leaveFocus !== true) this._leaveFocus = true;
	},

	onTriggerClick: function() {
		this.showDatepicker( !! this.getDatepicker().hidden);
	},

	showDatepicker: function(b) {
		var dp = this.getDatepicker();
		this.datepicker.display(b);
		if (b) {
			if (this.getValue())
			dp.setValue(this.getValue(), true);

			//get the right position.
			//callback,cancel, caller, childId, cssTarget, cssName
			dp.anchorPos(this, 'rb', 'hl', null, true, true);
			dp.bindContext(this.onDatepickerContexted, false, this, null, this, this.contextCS)
			  .focus(0);
		}else {
			this.focus();
		}
	},

	onDatepickerContexted: function(evt) {
		if(evt){
			var el = E.element(evt);
			if (!this.ancestorOf(el)){
				//标记为外部影应,失去焦点
				this.onBlurTrigger();
			}
		}
	},

	getDatepicker: function() {
		var dp = this.datepicker;
		if (!dp) {
			dp = this.datepicker = new CC.ui.Datepicker({
				showTo: document.body,
				autoRender: true,
				hidden: true
			});
			this.follow(dp);
			dp.on('select', this._onDateSelect)
			  .on('keydown', this.onKeydownTrigger, this);
		}
		return dp;
	},

	onKeydownTrigger : function(e){
		if(E.isEscKey(e) || E.isEnterKey(e)){
			if(!this.getDatepicker().hidden){
				E.stop(e);
				this.showDatepicker(false);
				return false;
			}

			if(E.isEnterKey(e)){
				this.getDatepicker().toToday();
				return false;
			}
		}

		FP.onKeydownTrigger.apply(this, arguments);
	},

	_onDateSelect: function(v) {
		var self = this.pCt;
		(function() {
			self.showDatepicker(false);
			self.setValue(v);
		}).timeout(self.applyTimeout);
	},

	setSize: function(a, b) {
		FP.setSize.apply(this, arguments);
		if (a.width) b = a.width;
		if (b !== false) {
			var f = this.fly('_trigger');
			//CC.fly(this.element).setWidth(this.width - (f.getWidth() || 22)).unfly();
			f.unfly();
		}
		return this;
	},
	
	getText : function(){
	  return this.getValue();
	}

});

CC.ui.def('datepicker', CC.ui.form.DatepickerField);
})();
﻿CC.create('CC.ui.form.ValidationProvider', CC.util.ValidationProvider, function(father){
return {
  // @implementation
  validator : function(item, collector){
    var ret = item.validator ? 
      // cbase item
      item.validator(item.getValue()) : 
      // flied html element
      this.htmlValidator.call(item);
    
    if(ret !== true)
      collector.push(ret);
    
    return ret;
  },
  
  htmlValidator : function(item){
    return true;
  },
  
  // @override
  each : function(callback){
    this.t.eachH(function(){
      // filter form element
      if(this.element && callback.apply(this, arguments) === false){
        return false;
      }
    });
    this.eachHtml(callback);
  },
  
  eachHtml : fGo
};
});
CC.ui.def('formvalidation', CC.ui.form.ValidationProvider);
CC.ui.form.FormLayer.prototype.validationProvider = CC.ui.form.ValidationProvider;
﻿/**
 * @class CC.ui.form.StoreProvider
 * @extends CC.util.StoreProvider
 */
CC.create('CC.ui.form.StoreProvider', CC.util.StoreProvider, function(father){


CC.ui.def('formstore' , CC.ui.form.StoreProvider);

return {

/**
 * 调用CC.formQuery 获得提交数据
 * @return {String}
 * @override
 */
  queryString : function(){
    return CC.formQuery(this.t.getFormEl());
    //ignore
  },

/**
 * 保存时提交整个表单数据
 */
  save : function(){
    if(this.beforeSave()!== false && 
       this.t.fire('store:beforesave', this)!==false){
         this.onSave();
    }
  },
  // 忽略addUrl与modifyUrl,统一利用saveUrl提交
  getSaveUrl : function(){
    return this.mappingUrl(this.saveUrl);
  },

  beforeSave : function(item, isNew){
    return this.t.getValidationProvider().validateAll()===true;
  }
};

});
CC.ui.form.FormLayer.prototype.storeProvider = CC.ui.form.StoreProvider;
