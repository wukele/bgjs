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
 *@example
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
    isSafari3 = isSafari && ua.indexOf('webkit/5') != -1,
    isIE = !isOpera && ua.indexOf("msie") > -1,
    isIE7 = !isOpera && ua.indexOf("msie 7") > -1,
    isIE6 = !isOpera && ua.indexOf("msie 6") > -1,
    isGecko = !isSafari && ua.indexOf("gecko") > -1,
    isGecko3 = !isSafari && ua.indexOf("rv:1.9") > -1,
    //优先检测BackCompat,因为
    //假如以后compatMode改变,也是非盒模型
    isBorderBox = isQuirks || !isStrict,
    
    /**是否合法EMAIL字符串.
     * 参见 CC.isMail().
     * @inner
     */
    mailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    
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
		 * @name CC
		 * @class 所有类包根目录
		 */	
    var CC = 
       /**@lends CC*/
    {
    	  /**@config version 当前版本号*/
    		version : '2009.10 - 2.0.8',
    	  
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
         *@param args 
         *@example
             CC.each(array, funtion(obj, i){
              	//true
              	alert(this === array[i] && this === obj) ;;
             });
         */
        each: function(object, callback, args) {
            if (args) {
                if (object.length === undefined) {
                    for (var name in object)
                        if (callback.apply(object[name], args) === false)
                            break;
                } else
                    for (var i = 0, length = object.length; i < length; i++)
                        if (callback.apply(object[i], args) === false)
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
				      this.$attr(window, type, clazz);
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
           CC.$attr(obj, 'car.color', 'white');
           //get
           alert( CC.$attr(obj, 'car.color'));
         */
        $attr: function(obj, attrList, value) {
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
            var formData = "", elem = "", f = CC.$(f);
            var elements = f.elements;
            var length = elements.length;
            for (var s = 0; s < length; s++) {
                elem = elements[s];
                if (elem.tagName == 'INPUT') {
                    if (elem.type == 'radio' || elem.type == 'checkbox') {
                        if (!elem.checked) {
                            continue;
                        }
                    }
                }
                if (formData != "") {
                    formData += "&";
                }
                formData += encodeURIComponent(elem.name||elem.id) + "=" + encodeURIComponent(elem.value);
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
         * @return {String} 
         * @example 
           CC.templ({name:'Rock'},'&#60;html&#62;&#60;title&#62;{name}&#60;/title&#62;&#60;/html&#62;');
           st:0,1:未找到属性是是否保留
         */
        templ : function(obj, str, st) {
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
                return a;
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
            var ss = o.className.replace(s, '');
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
			    var ss = o.className.replace(s, '');
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
            o.className = o.className.replace(s, "");
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
 * @param {DOMElement} 新创建的DOM结点
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
        $C: function(a) {
            if (typeof a === 'string') {
                return document.createElement(a);
            }
            var tag = a.tagName;
            delete a.tagName;
            var b = this.extend(document.createElement(tag), a);
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
 * 加载一个脚本文件
 * @param {String} id 加载script标签ID
 * @param {String} url 加载script的路径
 * @return {DOMElement} script node
 */         
        loadScript: function(id, url) {
            var oHead = this.$T('head')[0];
            var script = this.$C( {
                tagName: 'SCRIPT',
                id: id,
                type: 'text/javascript',
                src: url
            }
            );
            oHead.appendChild(script);
            return script;
        }
        ,
        
/**
 * 加载一个CSS样式文件
 * @param {String} id 加载css标签ID
 * @param {String} url 加载css的路径
 * @return {DOMElement} link node
 */    
        loadCSS: function(id, url) {
            var oHead = this.$T('head')[0];
            var css = this. $C( {
                tagName: 'link',
                id: id,
                rel: 'stylesheet',
                href: url,
                type: 'text/css'
            }
            );
            oHead.appendChild(css);
            return css;
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
        $A : function(iterable) {
            if (!iterable)return [];
            if (iterable.toArray) {
                return iterable.toArray();
            } else {
                var results = [];
                for (var i = 0, length = iterable.length; i < length; i++)
                    results.push(iterable[i]);
                return results;
            }
        },
/**
 * 获得iframe中的document结点.
 * @param {DOMElement} frame iframe结点
 * @return {DOMElement} iframe页面中的document结点
 */
        frameDoc : function(frame) {
            return frame.contentWindow ? frame.contentDocument:frame.contentDocument;
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
 * 获得视图区域宽度.
 * @param {Boolean} full true返回文档宽度,false返回视图可见区域宽度
 */		    
        getViewWidth : function(full) {
            return full ? this.getDocumentWidth() : this.getViewportWidth();
        },
/**
 * 获得视图区域高度.
 * @param {Boolean} full true返回文档高度,false返回视图可见区域高度
 */		
        getViewHeight : function(full) {
            return full ? this.getDocumentHeight() : this.getViewportHeight();
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
        safari3 : isSafari3,
        gecko : isGecko,
        gecko3 : isGecko3,
        borderBox : isBorderBox,
        opera : isOpera
    };
    

		if(!window.CC)
			window.CC = CC;
    
    /**
     * UI相关功能函数存放类.
     * @name CC.Util
     * @class UI相关功能函数存放类
     */
    if(!CC.Util)
			CC.Util = {};
			
/**
 * 系统控制台,如果存在firebug,利用firebug输出调试信息,否则忽略.
 * 在firbug中可直接进行对某个对象进行监视,
 * 无console时就为空调用,可重写自定输出.
 * @name console
 * @class 系统控制台,如果存在firebug,利用firebug输出调试信息,否则忽略
 */
if(!window.console)
    	window.console = {};

if(!window.tester)
	window.tester = window.fireunit || {};
CC.extendIf(console, 
  /**
   @lends console
  */
  {
     	/**
     	 *@function
     	 *@param {arguments} 类似C语言中printf语法
     	 *@example
     	 * //%o表示参数为一个对象
     	 * console.log('This an string "%s",this is an object , link %o','a string', CC);
     	 */
  	debug : fGo,
  	/**@type function*/
  	info : fGo,
  	/**@type function*/
  	trace : fGo,
  	/**@type function*/
  	log : fGo,
  	/**@type function*/
  	warn : fGo,
  	/**@type function*/
  	error : fGo,
  	/**@type function*/
  	assert:fGo,
     	/**
     	 * 列出对象所有属性.
     	 *@function
     	 *@param {object} javascript对象
     	*/
  	dir:fGo,
  	/**@type function*/
  	count : fGo,
  	/**@type function*/
  	group:fGo,
  	/**@type function*/
  	groupEnd:fGo,
  	/**@type function*/
  	time:fGo,
  	/**@type function*/
  	timeEnd:fGo});
/**
 * 基于firebug插件fireunit
 */
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
CC.extendIf(String.prototype,  (function(){
    var allScriptText = new RegExp('<script[^>]*>([\\S\\s]*?)<\/script>', 'img');
    var onceScriptText = new RegExp('<script[^>]*>([\\S\\s]*?)<\/script>', 'im');
    var allStyleText = new RegExp('<style[^>]*>([\\S\\s]*?)<\/style>', 'img');
    var onceStyleText = new RegExp('<style[^>]*>([\\S\\s]*?)<\/style>', 'im');
    var trimReg = new RegExp("(?:^\\s*)|(?:\\s*$)", "g");
    
    return (/**@lends String.prototype*/{
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
 * 截短字符串,使得不超过指定长度,如果已截短,则用特定字符串追加.
 * @param {Number} length 截短的长度
 * @param {String} [truncation] 追加的字符串,默认为三个点,表示省略
 * @return {String}
 @example
   var str = "这是一个长长的字符串,非常非常长";
   //显示:这是一个长长的字符串...
   alert(str.truncate(10));
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
 * 返回字符串JavaScript脚本标签内容.
 @example
   var s = '&lt;script type=&quot;javascript&quot;&gt;var obj = {};&lt;/script&gt;';
   //显示 var obj = {};
   alert(s.innerScript());
 */
        innerScript: function() {
            this.match(onceScriptText); return RegExp.$1;
        }
        ,
/**
 * 返回字符串style标签内容.
 @example
   var s = '&lt;style&gt;.css {color:red;}&lt;/style&gt;';
   //显示 .css {color:red;}
   alert(s.innerStyle());
 */
        innerStyle: function() {
            this.match(onceStyleText); return RegExp.$1;
        }
        ,
/**
 * 执行字符串script标签中的内容.
 @example
   var s = '&lt;script type=&quot;text/javascript&quot;&gt;alert('execute some script code');&lt;/script&gt;';
   s.execScript();
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
 * 执行字符串style标签中的内容.
 @example
   var s = '&lt;style &gt;.css {color:red;}&lt;/style&gt;';
   s.execStyle();
   //应用
   div.innerHTML = '&lt;span class=&quot;css&quot;&gt;Text&lt;/span&gt;';
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
 * 将css文件属性名形式转换成js dom中style对象属性名称.
 * @return {String}
 @example
 //显示backgroundPosition
 alert('background-position'.camelize());
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
 * 扩充Array原型,原型的扩充是通过CC.extendIf来实现的,所以如果数组原型中在扩充前就具有某个方法时,并不会覆盖掉.
 * @class 扩充Array原型
 * @name Array
 * @see CC.extendIf
 */
CC.extendIf(Array.prototype,  
/**@lends Array.prototype*/
{
	
/**
 * 移除数组中的某个元素.
 * @param {Number|Object} 数组下标或数组元素
 * @return {Number} 移除元素后的数组长度
 @example
 	var arr = ['A','B',5,'C'];
 	arr.remove(0);
 	arr.remove('B');
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
 * 获得某元素在数组中的下标,如果数组存在该元素,返回下标,否则返回-1,该方法使用绝对等(===)作比较.
 * @param {Object} 查找元素
 * @return {Number} 如果数组存在该元素,返回下标,否则返回-1
 @example
 	var arr = ['A','B',5,'C'];
 	arr.indexOf('C');
 	arr.indexOf('B');
 	arr.indexOf('F');
 */
    indexOf: function(obj) {
        for (var i = 0, length = this.length; i < length; i++) {
            if (this[i] === obj)return i;
        }
        return  -1;
    }
    ,
/**
 *
 */
    insert: function(idx, obj) {
        return this.splice(idx, 0, obj);
    }
    ,

    include: function(obj) {
        return (this.indexOf(obj) !=  - 1);
    },
  
    clear : function(){
        this.splice(0,this.length);
    }
}
);

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
Eventable.prototype.fire = (function(eid/**,arg1,arg2,arg3,...,argN*/){	
   if(this.events){
    
    var fnArgs = CC.$A(arguments);
    fnArgs.remove(0);
    if(__debug) {console.log('发送:%s,%o,源:%o',eid, fnArgs,this);}
    var handlers = this.events[eid];
    if(handlers){
    var argLen = fnArgs.length, ret, i, len;
	
    for(i=0,len=handlers.length;i<len;i++){
        var oHand = handlers[i];
        // add the argument of callback of itself.
        if(oHand.args)
            fnArgs[argLen] = oHand.args;
        //has this object.
        ret = (oHand.ds)?oHand.cb.apply(oHand.ds,fnArgs):oHand.cb.apply(this,fnArgs);
        //cancel fire
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
    return ret;
});
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
        console.error('eid or callback can not be null:%o',arguments);
        console.trace();
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

/**
 * DOM事件处理实用函数库,更多关于浏览器DOM事件的文章请查看<a href="http://www.bgscript.com/archives/369" target="_blank">http://www.bgscript.com/archives/369</a>
 * @name CC.Event
 * @class DOM事件处理实用函数库
 * @singleton
 */
var Event = CC.Event = {};

CC.extend(Event, 
  /**@lends CC.Event*/ 
  {
  	/**@config*/
    BACKSPACE: 8,
    /**@config*/
    TAB: 9,
    /**@config*/
    ENTER: 13,
    /**@config*/
    ESC: 27,
    /**@config*/
    LEFT: 37,
    /**@config*/
    UP: 38,
    /**@config*/
    RIGHT: 39,
    /**@config*/
    DOWN: 40,
    /**@config*/
    DELETE: 46,
		/**
		 *@config
		 *@private
		 */
		readyList : [],
		/**@private*/
		contentReady : false,
		/**
		 * 常用于取消DOM事件继续传送,内在调用了Event.stop(ev||window.event);
		 * @param {Event} ev
		 * @example
		   div.onmousedown = Event.noUp;
		 */
    noUp : function(ev) {
        Event.stop(ev||window.event);
        return false;
    },
    
    noDef : function(ev){
    	Event.preventDefault(ev||window.event);
    },
    
/**
 * 获得DOM事件源
 * @param {Event} ev
 * @return {DOMElement}
 */
    element: function(ev) { return ev.srcElement || ev.target; }
    ,
/**
 * 获得事件发生时页面鼠标x坐标.
 * @param {Event} ev
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
 * @param {Event} ev
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
 * @param {Event} ev
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
 * @param {Event} ev
 */	
    which : function(ev) {
        if ( !ev.which && ((ev.charCode || ev.charCode === 0) ? ev.charCode : ev.keyCode) )
            return ev.charCode || ev.keyCode;
    },

/**
 * 是否左击.
 * @param {Event} ev
 * @return {Boolean}
 */	
    isLeftClick: function(ev) {
        return (((ev.which)
            && (ev.which === 1)) || ((ev.button) && (ev.button === 1)));
    }
/**
 * 是否按下回车键.
 * @param {Event} ev
 * @return {Boolean}
 */	
    ,
    isEnterKey: function(ev) {
        return ev.keyCode === 13;
    },
/**
 * 是否按下ESC键
 */
    isEscKey : function(ev){
    	return ev.keyCode === 27;
    },
/**
 * 获得滚轮增量
 * @return {Number}
 */
    getWheel : function(ev){
    	 /* IE或者Opera. */
			 if (ev.wheelDelta) {
				 delta = ev.wheelDelta/120;
				 /*在Opera9中，事件处理不同于IE*/
				 if (isOpera)
				 	delta = -delta;
			 } else if (ev.detail)
			   //In Mozilla, sign of delta is different than in IE.
			   //Also, delta is multiple of 3.
			   delta = -ev.detail/3;
			 return delta;
    },
/**
 * 停止事件传递和取消浏览器对事件的默认处理.
 * @param {Event} ev
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
 * @param {Event} ev
 */
    preventDefault : function(ev) {
        if(ev.preventDefault)
            ev.preventDefault();
        ev.returnValue = false;
    },
/**
 * 停止事件传递.
 * @param {Event} ev
 */
    stopPropagation : function(ev) {
        if (ev.stopPropagation)
            ev.stopPropagation();
        ev.cancelBubble = true;
    },
/**
 * 切换元素样式(展开,收缩等效果)
 * @param {DOMElement|String} 源DOM
 * @param {DOMElement|String} 目标DOM
 * @param {String} cssExpand 展开时样式
 * @param {String} cssFold   闭合时样式
 * @param {String} [msgExp] src.title = msgExp
 * @param {String} [msgFld] src.title =  msgFld
 * @param {String} [hasText] src显示文本
 @example
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
/**@private
 *@config
 */
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
 * 添加DOM元素事件监听函数.
 * Warning : In IE6 OR Lower 回调observer时this并不指向element.
 * @param {DOMElement} element 
 * @param {String} name 事件名称,无on开头
 * @param {Function} observer 事件处理函数
 * @param {Boolean} [useCapture]
 @example
   Event.on(document, 'click', function(event){
   	event = event || window.event;
   });
 */
    on: function(element, name, observer, useCapture) {
        useCapture = useCapture || false;

        if (name == 'keypress' && (navigator.appVersion.match( / Konqueror | Safari | KHTML / )
            || element.attachEvent)) {
            name = 'keydown';
        }
        this._observeAndCache(element, name, observer, useCapture);
    }
    ,
/**
 * 移除DOM元素事件监听函数.
 * @param {DOMElement} element 
 * @param {String} name 事件名称,无on开头
 * @param {Function} observer 事件处理函数
 * @param {Boolean} [useCapture]
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
    },
/**
 * 提供元素拖动行为,在RIA中不建议用该方式实现元素拖放,而应实例化一个Base对象,使之具有一个完整的控件生命周期.
 * @param {DOMElement} dragEl
 * @param {DOMElement} moveEl
 * @param {Boolean} enable or not?
 * @param {Function} [onmovee] callback on moving
 * @param {Function} [ondrag] callback on drag start
 * @param {Function} [ondrog] callback when drogged
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
 * 页面加载完成后回调.
 */    
    ready : function(callback) {
    	this.readyList.push(callback);
    },
    
/**@private*/    
    _onContentLoad : function(){
    	var et = Event;
    	if(et.contentReady)
    		return;
    	et.contentReady = true;
    	
    	if(et.defUIReady)
    		et.defUIReady();
    		
    	for(var i=0;i<et.readyList.length;i++){
    		et.readyList[i].call(window);
    	}
    }
}
);

/**
 * 添加DOM加载完成后回调函数
 * @function
 */
CC.ready = function(){
	Event.ready.apply(Event, arguments);
};

//
//Thanks to jQuery, www.jquery.org
// Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
	if ( document.addEventListener && !isOpera)
		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", Event._onContentLoad, false );
	
	// If IE is used and is not in a frame
	// Continually check to see if the document is ready
	if ( isIE && window == top ) (function(){
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

	if ( isOpera )
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

//	if ( isSafari )

// A fallback to window.onload, that will always work
	Event.on(window, "load", Event._onContentLoad);

CC.extendIf(Function.prototype, /**@lends Function.prototype*/{
/**
 * 绑定this对象到函数
 * @return 绑定this后的新函数
 @example
 	var self = {name:'Rock'};
 	function getName(){
 	 return this.name;
 	}
 	
 	var binded = getName.bind(self);
 	
 	//显示Rock
 	alert(binded());
 */
	bind : function() {
    var _md = this, args = CC.$A(arguments), object = args.shift();
    return function() {
        return _md.apply(object, args);
    }
  },
/**
 * 绑定事件处理函数,使其具有指定this范围功能,并传递event参数
 * @return 绑定this后的新函数
 @example
   var self = {name:'Rock'};
   function onclick = function(event){
     alert("name:" + this.name + ', event:'+event); 
   }
   
   dom.onclick = onclick.bindAsListener(self);
 */
	bindAsListener : function(self) {
	    var _md = this;
	    return function(event) {
	        return _md.call(self, event||window.event);
	    }
	},

/**
 * 超时调用.
 * @param {Number} seconds 毫秒
 * @param {Boolean} 是否为interval
 * @return {Number} timer id
 @example
   //setTimeout方式调用
   var timerId = (function(){
   	alert('timeout came!');
   }).timeout(2000);
   //setInterval方式调用
   var intervalTimerId = (function(){
   	alert('interval came!');
   	clearInterval(intervalTimerId);
   }).timeout(2000, true);
 */
	timeout : function(seconds, interval){
		if(interval)
			return setInterval(this, seconds || 0);
		return setTimeout(this, seconds || 0);
	}
});

//~@base/cache.js
/**
 * 缓存类.
 * 数据结构为:
 * Cache[key] = [dataObjectArray||null, generator];
 * dataObjectArray[0] = 预留位,保存该key数据最大缓存个数, 默认为5.
 * generator = 生成数据回调
 * @name CC.Cache
 * @class 缓存类
 * @singleton
 */
CC.Cache =  
   /**@lends CC.Cache */
   {

    /**@config {Number} MAX_ITEM_SIZE 某类设置的最大缓存数量.*/
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
 * @return data 或 null
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
 */
CC.Cache.register('div', function() {
    return CC. $C('DIV');
}
);

//~#
return CC;
})();


//~@base/ajax.js

(function(){
/**
 * @name CC.Ajax
 * @class Ajax请求封装类
 @example
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
  
  //
  var ajax = new Ajax({
   url : '...',
   method:'POST'
   ....
  });
  ajax.connect('param=data');
 */
var Ajax = CC.Ajax = CC.create();
/**
 * 快速Ajax调用
 *@static
 *@function
 *@memberOf CC.Ajax
@example
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
 */
Ajax.connect = (function(option){
    var ajax = new Ajax(option);
    ajax.connect();
    return ajax;
});

Ajax.prototype =
   /**
    * @lends CC.Ajax.prototype
    */
   {
/**
 * GET 或者 POST,默认GET
 * @type String
 */
    method :'GET',
/**@property {String}url 请求URL*/
    url : null,
/**@property {Boolean} [asynchronous=true] 是否异步,默认true*/	
    asynchronous: true,
/**@property {Number} [timeout=10000] 设置超时,默认10000ms*/
    timeout: 10000,
/**@property {DOMElement} [disabledComp] 在请求过程中禁止的元素*/
   disabledComp : undefined,
/**@property {String} [contentType] 默认application/x-www-form-urlencoded*/
    contentType: 'application/x-www-form-urlencoded',
/**@property {String} msg 提示消息*/
    msg: "数据加载中,请稍候...",

/**@property {Boolean} [noCache=true] 是否忽略浏览器缓存,默认为true.*/
    noCache:true,
/**
 * @name CC.Ajax#xmlReq
 * @property {XMLHttpRequest} [xmlReq]对象
 */
/**
 * @name CC.Ajax#caller
 * @property {Function} [caller] 用于调用failure,success函数的this对象.
 */
 
/**
 * @name CC.Ajax#failure
 * @property {Function} [failure]失败后的回调.
 */
 
/**
 * @name CC.Ajax#data
 * @property {Object} [data] send发送的数据
 */
 /**
  *@property {Function} [success] 设置成功后的回调,默认为运行服务器返回的数据内容.
  */
    success: (function(ajax) {
        ajax.invokeHtml();
    }),
    
    /**
     * @name CC.Ajax#onfinal
     * @property {Function} [onfinal] 无论请求成功与否最终都被调用.
     */
      
    /**@property {DOMElement|String} [displayPanel] 如果数据已加载,数据显示的DOM面板.*/
    displayPanel: null,
  
    /**
     * @name CC.Ajax#busy
     * @property {Boolean} busy 指明当前Ajax是否处理请求处理状态,在open后直至close前该值为真.
     * @readonly
     */

    /**
     * @private
     * 根据设置初始化.
     */
    initialize: function(options) {
    /**
     * @name CC.Ajax#eventable
     * @property {Boolean} eventable=true 该类是可以监听,发送和处理事件的.
     * @readonly
     */
        CC.Eventable.call(this,options);
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
	 * @function
	 * 重写以实现自定消息界面,用于进度的消息显示,默认为空调用.
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
        Ajax.fire('timeout', this);
        this.fire('timeout', this);
        this.setMsg("time out.");
        this._close();
    }
    ,
    /**@private*/
    _close: function() {
        if(this.timeout)
            clearTimeout(this._tid);
        if(this.onfinal)
            if(this.caller)
                this.onfinal.call(this.caller,this);
            else
                this.onfinal.call(this,this);
        /**
         * 请求结束后调用,无论成功与否.
         * @name CC.Ajax#final
         * @event {String} final
         * @param {CC.Ajax} ajax
         */
         
        //全局
        Ajax.fire('final', this);
        
        this.fire('final', this);
        
        if (this.disabledComp)
            CC.disable(this.disabledComp, false);

        if(!(this.json === undefined))
            delete this.json;
        if(!(this.xmlDoc === undefined))
            delete this.xmlDoc;
    
        if(!(this.text === undefined))
            delete this.text;
    	
        this.disabledComp = null;
        //CC.display(CC. $('ajaxProgressBar'), false);
        this.xmlReq = null;
        this.params = null;
        this.busy = 0;
    }
    ,
  
    /**终止请求*/
    abort: function() {
      if(this.xmlReq !== null){
        this.xmlReq.abort();
        this._close();
      }
    }
    ,
    /**@private*/
    _req : function(){
        if(!this.xmlReq)
            this.xmlReq = CC.ajaxRequest();
    },
    /**@private*/
    _setHeaders: function() {
        this._req();
        if (this.method.toLowerCase() == 'post') {
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
        
        /**
         * 在打开前发送
         * @name CC.Ajax#open
         * @event {String} open
         * @param {CC.Ajax} ajax
         */
        Ajax.fire('open', this);
        this.fire('open',this);
        if (this.timeout) {
            this._tid = setTimeout(this._onTimeout.bind(this), this.timeout);
        }

        if (this.disabledComp) {
            CC.disable(this.disabledComp, true);
        }
    
        var ps = this.params, ch = this.noCache, theUrl = this.url;
        if(ps || ch){
            var isQ = theUrl.indexOf('?') > 0;
            if(ch){
                if (isQ)
                    theUrl = theUrl + '&__uid=' + CC.uniqueID();
                else
                    theUrl = theUrl + '?__uid=' + CC.uniqueID();
            }
	  	
            if(ps){
            	if(this.method === 'GET'){
                if(!isQ && !ch)
                    theUrl = theUrl+'?';
	  			      
                theUrl = theUrl + '&' + ((typeof ps === 'string') ? ps : CC.queryString(ps));
              }
              else {
              	this.data = (typeof ps === 'string') ? ps : CC.queryString(CC.extend(this.data, ps));
              }
            }
        }
        this.xmlReq.open(this.method, theUrl, this.asynchronous);
    }
    ,
 
/**开始传输.
 * @param {object} [data] 要传输的数据
 */
    send: function(data) {
 /**
  * 在发送数据前发送
  * @name CC.Ajax#send
  * @event {String} send
  * @param {CC.Ajax} ajax
  */
        Ajax.fire('send', this);
        this.fire('send');
        this._setHeaders();
        this.xmlReq.onreadystatechange = this._onReadyStateChange.bind(this);
        this.setMsg(this.msg);
        if("POST" === this.method)
        	this.xmlReq.send(data || this.data);
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
			   	console.log(e);
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
    //private
    _onReadyStateChange: function() {
        var req = this.xmlReq;
        if (req.readyState == 4) {
/**
 * 请求响应返回加载后发送(此时readyState = 4).
 * @name CC.Ajax#load
 * @event {String} load
 * @param {CC.Ajax} ajax
 */
        		if(Ajax.fire('load', this)===false || this.fire('load', this) === false)
        			return;
            var success = this.success;
            var failure = this.failure;
            // req.status 为 本地文件请求
            try{
                if (req.status == 200 || req.status == 0) {
/**
 * 数据成功返回加载后发送.
 * @name CC.Ajax#success
 * @event {String} success
 * @param {CC.Ajax} ajax
 */
                		if(Ajax.fire('success', this)===false  || this.fire('success', this) === false)
                			return false;
                    if(success)
                        if(this.caller)
                            success.call(this.caller, this);
                        else success.call(this,this);
                } else {
/**
 * 数据请求失败返回后发送.
 * @name CC.Ajax#failure
 * @event {String} failure
 * @param {CC.Ajax} ajax
 */
										if(Ajax.fire('failure', this)===false || this.fire('failure', this) === false)
                			return false;
                    if(failure)
                        if(this.caller)
                            failure.call(this.caller, this);
                        else failure.call(this,this);
                }
            }catch(reqEx){
                console.error(reqEx);
                this._close();
                throw reqEx;
            }
            this._close();
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

    	  /**
    	   * @name CC.Ajax#text
    	   * @property {String} text 调用{@link # getText}方法后保存的text文本,在{@link #close}方法调用后销毁
    	   */
        var s = this.text = this.xmlReq.responseText;
        /**
         * 在获得XMLHttpRequest数据调后Ajax.getText方法后发送,如果要改变当前text数据,在更改text后设置当前Ajax对象text属性即可,这样可对返回的文件数据作预处理.
         * @name CC.Ajax#text
         * @event {String} text
         * @param {String} responseText
         * @param {CC.Ajax} ajax
         */
        Ajax.fire('text',s,this);
        this.fire('text',s,this);
        return this.text;
    },
  /**
	 * 获得服务器返回数据的XML Document 格式文档对象,该方法调用了XMLHttpRequest.responseXML.documentElement获得XML文档对象.
	 * 在调用过程中会发送xmlDoc事件.
	 * @return {XMLDocument} XML Document 文档对象.
	 */
    getXmlDoc : function() {
    	  /**
    	   * @name CC.Ajax#xmlDoc
    	   * @property {XMLDocument} xmlDoc
    	   * 调用{@link #getXmlDoc}方法后保存的XMLDocument对象,在{@link #close}方法调用后销毁.
    	   */
        if(this.xmlDoc)
            return this.xmlDoc;
        var doc = this.xmlDoc = this.xmlReq.responseXML.documentElement;
        /**
         * 在获得XMLHttpRequest数据调后Ajax.getXMLDoc方法后发送,可直接对当前xmlDoc对象作更改,这样可对返回的XMLDoc数据作预处理.
         * @name CC.Ajax#xmlDoc
         * @event {String} xmlDoc 
         * @param {XMLDocument} doc
         * @param {CC.Ajax} ajax
         */
        Ajax.fire('xmlDoc',doc, this);
        this.fire('xmlDoc', doc, this);
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
        var o = undefined;
        try {
        	  /**
        	   * @name CC.Ajax#json
        	   * @property {Object} json
        	   * 调用{@link #getJson}方法后保存的json对象,在{@link #close}方法调用后销毁.
        	   */
            this.json = o = eval("("+this.getText()+");");
        }catch(e) {
            if(__debug) console.log(e+"\n"+this.getText());
            CC.alert('Internal server error : a request responsed with wrong json format.');
            throw e;
        }
        /**
         * 在获得XMLHttpRequest数据调后Ajax.getJson方法后发送,可直接对当前json对象作更改,这样可对返回的json数据作预处理.
         * @name CC.Ajax#json
         * @event {String} json
         * @param {Object} o json对象
         * @param {Ajax} ajax
         */
        Ajax.fire('json',o,this);
        this.fire('json',o,this);
        return this.json;
    }
    ,
  /**
   * 运行返回内容中的JS,方法返回已剔除JS后的内容.
   *@return {string} 返回已剔除JS后的内容
   *@example
   *<pre>
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
   *</pre>
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

//~@base/cbase.js
(function(CC){
var Eventable = CC.Eventable;
//component cache
var CPC = {};
var Cache = CC.Cache;
var Event = CC.Event;
/**
 * 控件表现为属性+方法(行为)+视图(view),为了简单起见,在库控件的实现中控件属性和行为,可通过控件对象实例直接访问,而视图,即DOM部分可通过控件其中一个view属性访问.<br>
 * 一般来说,控件的私有属性和方法用下划线+名称表示.<br>
 * 控件的视图,即view,是表征控件外观,在页面中具体表现为html,从设计上来说,有两种方法可改变控件的视图,一是通过CSS控制控件的外观,二是改变控件视图的HTML.<br>
 * 第一种改变CSS有时达不到预期效果,它改变的仅仅是风格,如果两种都可运用则可使定义外观方式变得强大.<br>
 * 为了使得控件具体有多种外观而保持不变的行为,在库的控件实现中采用模板的方式定义控件的外观,在模板数据中可以定义控件具体的HTML,CSS,当改变控件的外观时,只需改变控件的模板,而必定义更多的代码.<br>
 * 例如将126风格的控件换成EXT风格控件,只需将它们的模板换成EXT相似的即可.
 * @name CC.Base
 * @class 为所有控件的基类,定义控件的基本属性与方法,管理控件的生命周期.
 * @author Rock
 */
var Base = CC.Base = (function(dom){
    if(dom !== undefined)
        this.view = CC.$(dom);
});

/**
 * 控件html模板定义类, 存放格式为 Tpl[component type] = strHtml.
 * @name CC.Tpl
 * @class 控件html模板定义类
 * @example
   Tpl['MyComp'] = '&lt;div class=&quot;cus&quot;&gt;&lt;/div&gt;';
 */
var Tpl = CC.Tpl;

if(!Tpl){
	Tpl = CC.Tpl = {};
}

/**
 * 不宜在注册Cache缓存时调用模板方法Tpl.$, Tpl.$$,Tpl.remove,这将引起循环的递归调用,因为模板生成的结点缓存在Cache里的.
 */
CC.extend(Tpl,
    /**@lends CC.Tpl*/
    {
/**
 * 为什么要有空图片?
 * 这是为填充img标签用的,为什么要用到img标签,用其它标签的background-url定位不行么?
 * img标签主要优点是可放大,缩小图片,目前兼容的css难做到这点
 */
    	BLANK_IMG : window.BLANK_IMG || 'http://www.bgscript.com/bgjs/default/s.gif',
/**
 * 根据模板名称获得模板字符串对应的HTML结点集,该结点生成只有一次,第二次调用时将从缓存克隆结点数据.
 * @param {String} keyName 模板在Tpl中的键值,即属性名称
 * @param {String} compName 
 * @param {Function} [prehandler] 模板字符串的预处理函数, 调用方式为 return function(strTemplate, objParam),返回处理后的html模板
 * @param {Object} [Object] prehandler 传递给prehandler的参数
 * @see #forNode
 * @function
 * @return {DOMElement} 模板字符串对应的HTML结点集
 * @example
  Tpl['MyComp'] = &lt;div class=&quot;fd&quot;&gt;&lt;a href=&quot;javascript:void(0)&quot; id=&quot;_tle&quot;&gt;&thorn;&yen;&lt;/a&gt;&lt;/div&gt;
  
  var  domNode = Tpl.$('MyComp');
  
  //显示 _tle
  alert(domNode.firstChild.id);
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
 * 根据html字符串返回由该字符串生成的HTML结点集.
 * @param {String} strHtml
 * @param {Object} [dataObj]
 * @param {String} [st] 模板替换方式, 参见{@link CC.templ}
 * @see CC.templ
 * @example
 
 var dataObj = {id:'Rock', age : 2};
 var strHtml = &lt;div class=&quot;fd&quot;&gt;&lt;a href=&quot;javascript:void(0)&quot; id=&quot;{title}&quot;&gt;年龄:{age}&lt;/a&gt;&lt;/div&gt;
 
 var node = Tpl.forNode( strHtml, dataObj );
 
 var link = node.firstChild;
 
 //显示 Rock
 alert(link.id);
 
 //显示 年龄:2
 alert(link.innerHTML);
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
 * @param {String} 模板字符串
 * @return this
 */
    def : function(key, str) {
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

var hidMode = {visibility:'hidden', display:'none'};
var dispMode = {visibility:'visible', display:'block'};

var undefined;

var NB = !CC.borderBox, Math = window.Math, parseInt = window.parseInt;

CC.extend(Base.prototype,
  /**@lends CC.Base.prototype*/
  {
/**@property {String} type 控件类型标识符*/
    type: 'CC.Base',
/**
 * @property {DOMElement} view * 控件对应的DOM结点,即控件视图部份,如果未设置,默认创建一个DIV结点作为视图,初始化时可为DOM元素或页面元素中的ID值
 */
 view: null,
/**
 * @name CC.Base#clickCS
 * @property {String} clickCS 点击效果修饰样式
 */
 
/**
 * @name CC.Base#hoverCS
 * @property {String} hoverCS 鼠标悬浮样式
 */
/**
 * @name CC.Base#height
 * @property {Number} [height=false] 控件高度,为false时忽略
 */
    height:false,
/**
 * @property {Number} [width=false] 控件宽度,为false时忽略
 */
    width : false,
/**
 * @property {Number} [left=false]  控件x值,为false时忽略
 */
    left:false,
    
/**
 * @property {Number} [top=false] 控件top值,为false时忽略
 */
    top:false,
/**
 * @property {Number} [minW=0] 控件最小宽度
 */
    minW:0,
/**
 * @property {Number} [minH=0] 控件最小高度
 */
    minH:0,
/**
 * @property {Number} [maxH=Math.MAX] 控件最大高度
 */
    maxH:Math.MAX,
/**
 * @property {Number} [maxW=Math.MAX] 控件最大宽度
 */
    maxW:Math.MAX,
    
/**
 * @name CC.Base#template
 * @property {String} template 设置控件视图view的HTML模板名称,利用这些模板创建DOM结点作为控件视图内容,该设置值不会被保留到控件属性中
 */

/**
 * @name CC.Base#clickDisabled
 * @property {Boolean} clickDisabled 存在clickEvent事件的控件时，如果 clickDisabled 为 false,则消取该事件的发送.
 */

/**
 * @name CC.Base#pCt
 * @property {CC.Base} pCt 父容器
 */
 
/**
 * @constructor
 * @private
 */
    initialize: function(opts) {
        if (opts){
          CC.extend(this, opts);
        }
        /**
         * @name CC.Base#eventable
         * @property {Boolean} eventable 是否实现事件模型,实现事件模型的控件具有发送,注册处理事件功能.
         */
        if(this.eventable)
        		Eventable.apply(this);
        this.initComponent();
        /**
         * @name CC.Base#autoRender
         * @property {Boolean} [autoRender=false] 是否自动渲染,自动渲染时在控件初始化后就立即调用{@link # render}进行渲染.
         */
        if(this.autoRender)
            this.render();
    },
/**
 * 生成控件DOM结点(view)部分.
 * @prototected
 */
		createView : function(){
			
			if(!this.view){
				
				if(this.hasOwnProperty('template') || 
				   this.constructor.prototype.hasOwnProperty('template') || 
				   this.superclass.hasOwnProperty('template')){
					
					this.view = Tpl.$(this.template);
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
		
		//prototected
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
		
/**
 * 初始化控件.
 */
    initComponent : function() {
/**
* @property {String} cacheId 控件全局唯一id,用于缓存识别,也可用于对象是否是类的实例化对象.
* @readonly
*/
    		var cid = this.cacheId = 'c' + CC.uniqueID();
    		CPC[cid] = this;
				
				this.createView();
/**
* @name CC.Base#strHtml
* @property {String} [strHtml] 控件html内容,如果存在,在控件初始化时生成.
*/    		
        if(this.strHtml){
            this.html(Tpl[this.strHtml]);
            delete this.strHtml;
        }
/**
 *@name CC.Base#viewAttr
 * @property {Object} viewAttr 控件view属性配置,用于初始化视图view结点,在应用后被移除.
 @example
  var comp = new Base({
   viewAttr:{
     className : 'vs',
     innerHTML : '<b>text</b>'
   }
  });
 
  //显示vs
  alert(comp.view.className);
*/
        if (this.viewAttr) {
            CC.extend(this.view, this.viewAttr);
            delete this.viewAttr;
        }
/**
* @name CC.Base#inherentCS
* @property {String} inherentCS 控件自身内在的css类设置,常用于控件的设计中.
*/    		
    		if(this.inherentCS)
    			this.addClass(this.inherentCS);
/**
* @name CC.Base#cs
* @property {String} cs 控件css类,它将添加在{@link # inherentCS}类后面.
*/
        if(this.cs) 
            this.addClass(this.cs);
/**
* @name CC.Base#id
* @property {String} id 控件id,如果无,系统会生成一个.
*/
        //if(!this.id)
        //    this.id = 'comp'+CC.uniqueID();
               
        if(this.id && !this.view.id)
            this.view.id=this.id;
        
        if(this.id === undefined) 
        	this.id = 'comp' + CC.uniqueID();
        	
        //cache the title node for latter rendering.
        
        if(this.title){
	        if(!this.titleNode)
	        	this.titleNode = this.dom('_tle');
	        else if(!this.titleNode.tagName)
	        	this.titleNode = this.dom(this.titleNode);
        }
/**
* @name CC.Base#icon
* @property {String} icon 控件图标css类.
*/
        if(this.icon) {
            this.setIcon(this.icon);
        }
        
        if(this.clickCS) {
            this.bindClickStyle(this.clickCS);
        }
    
        if(this.hoverCS){
            this.bindHoverStyle(this.hoverCS);
        }
/**
* @name CC.Base#unselectable
* @property {Boolean} [unselectable=false] 是否允许选择控件的文本区域.
*/   
        if(this.unselectable)
            this.noselect();
/**
* @name CC.Base#draggable
* @property {Boolean} draggable 是否允许拖放.
*/
        if(this.draggable) {
            //el, ondrag, ondrop, ondragstart,onmousedown,onmouseup, caller
            this.enableDragBehavior(this.draggable);
        }
/**
* @name CC.Base#ondropable
* @property {Boolean} ondropable 是否允许监听其它控件的拖放行为.
*/  	
        if(this.ondropable){
            this.enableDropBehavior(this.ondropable);
        }
/**
* @name CC.Base#disabled
* @property {Boolean} disabled 是否允许使用该控件.
*/
        if(this.disabled)
            this.disable(this.disabled);

        if(this.width !== false)
            this.setWidth(this.width);
		
        if(this.height !== false)
            this.setHeight(this.height);
		
        if(this.top !== false)
            this.setTop(this.top);
		
        if(this.left !== false)
            this.setLeft(this.left);
/**
* @name CC.Base#shadow
* @property {Boolean|Shadow} shadow 控件是否具有阴影效果.
*/
    		if(this.shadow){
    			if(this.shadow === true)
    				this.shadow = CC.ui.instance('shadow');
    			this.follow(this.shadow);
    		}
    },
/**
 * 将部件a纳入当前控件的管理范畴,纳入后部件a的渲染和销毁与控件一致.
 * 当某些部件不是以add方式加进容器控件的,就比如适合采用这方法将部件纳入管理范畴,使得它和宿主控件一起渲染和销毁.
 * @param {CC.Base} a 跟随控件的部件
 * @return this
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
/**
 * 销毁控件,包括:移出DOM;移除控件注册的所有事件;销毁与控件关联的部件(参见{@link # follow}).
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
    			obs[i].destory();
    		}
    		this.__delegations = null;
    	}
    	
    	this.view = null;
    	this.cacheId = null;
    },
    /**
     * 渲染方式的实现方法,子类要自定渲染时,重写该方法即可.
     * <ul>主要步骤有:</ul>
       <li>应用控件的显示/隐藏属性</li>
       <li>将控件view添加到showTo属性中</li>
       <li>如果需要,设置鼠标提示</li>
       <li>如果存在阴影,将阴影附加到控件中</li>
       <li>渲染跟随部件(参见{@link # follow})</li>
     */
    onRender : function(){
/**
* @name CC.Base#title
* @property {String} title 控件标题.
* 如果控件具有标题栏,将设置控件标题.基类是怎样知道一个控件具有标题的?这是个有趣的问题,它涉及到库中编写控件的一个小小的约定,
*  如调用基类setTitle方法设置标题时,类方法会在控件视图view结点中寻找一个id为'_tle'的子结点,如果没找到就返回,如果找到就设置它的内容为标题,这个id为'_tle'就是一个约定,
*  也就是说,控件如果有标题的话,就必须定义一个标题结点ID为'_tle'才能被找到,这个工作是轻松的,可以直接在视图view的模板里定义,例如<br>
<pre>
    //定义MyButton类的视图模板,该类是有标题的
 		Tpl['MyButton'] = '&lt;div class=&quot;button&quot;&gt;&lt;span id=&quot;_tle&quot;&gt;这里是标题&lt;/span&gt;&lt;/div&gt;';
 		//这样就可以设置控件标题了
 		myButton.setTitle('button title');
</pre>
*/
	      if(this.title)
	        this.setTitle(this.title);
/**
* @name CC.Base#hidden
* @property {String} hidden 当前控件是否可见
* @readonly
*/
				if(this.hidden)
					this.display(false);
				
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

        if(this.tip){
            //设置鼠标提示.
            this.setTip(this.tip===true?this.title:this.tip);
        }
/**
* @name CC.Base#qtip
* @property {String} qtip 设置控件库内置提示方式
*/
        if(this.qtip && CC.Util.qtip)
        		CC.Util.qtip(this);
    		
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
 * 渲染前发送.
 * @name CC.Base#render
 * @event {String} render
 */
/**
 * 渲染后发送.
 * @name CC.Base#rendered
 * @event {String} rendered
 */
 
/**
 * 渲染方法,子类要定义渲染方式应该重写{@link # onRender}方法,
 */
    render : function() {
        if(this.rendered || this.fire('render')===false)
            return false;
        /**
         * @name CC.Base#rendered
         * @property {Boolean} rendered  标记控件是否已渲染.
         * @readonly
         */
        this.rendered = true;
				this.onRender();
        this.fire('rendered');
        
        this.un('render');
        this.un('rendered');
        
        if(!this.hidden && this.shadow){
        	var s = this.shadow;
        	(function(){
        			s.reanchor().display(true);
        	}).timeout(0);
        }
    },
/**
 * Base类默认是没有事件处理模型的,预留fire为接口,方便一些方法如{@link # render}调用,当控件已实现事件处理模型时,即{@link # eventable}为true时,此时事件就变得可用.
 */
    fire : fGo,
/**@function*/
    un : fGo,
    
/**
 * 隐藏控件.
 * @return this
 */
		hide : function(){
			return this.display(false);
		},
/**
 * 显示控件.
 * @return this
 */
		show : function(){
			return this.display(true);
		},
/**
 * 取出视图view结点内的子元素,对其进行Base封装,以便利用,与{@link # unfly对应}.
 * @param {String|DOMElement} childId 子结点.
 * @see CC.Base#fly
 * @return {CC.Base} 封装后的对象,如果childId为空,返回null.
 @example
 	&lt;div id=&quot;content&quot;&gt;
 	 Content Page
 	 &lt;span id=&quot;sub&quot;&gt;&lt;/span&gt;
 	&lt;/div&gt;
 	&lt;script&gt;
 	  var c = new Base({view:'content', autoRender:true});
 	  c.fly('sub')
 	   .setStyle('color','red')
 	   .html('this is anothor text!')
 	   .unfly();
 	&lt;/script&gt;
 */
		fly : function(childId){
			var el = this.dom(childId);
			
			if(this.__flied !== undefined)
				this.unfly();
					
			if(el)
				return CC.fly(el);

			return null;
		},
/**
 * 解除结点的Base封装,与{@link # fly}成对使用.
 @example
 	&lt;div id=&quot;content&quot;&gt;
 	 Content Page
 	 &lt;span id=&quot;sub&quot;&gt;&lt;/span&gt;
 	&lt;/div&gt;
 	&lt;script&gt;
 	  var c = new Base({view:'content', autoRender:true});
 	  c.fly('sub')
 	   .setStyle('color','red')
 	   .html('this is anothor text!')
 	   .unfly();
 	&lt;/script&gt;
 */
		unfly : function(){
			if(this.__flied !== undefined){
				this.view = null;
				this.displayMode = 'display';
	  		this.blockMode = 'block';
				this.width = this.top = this.left = this.height = false;
				//引用计数量
				this.__flied -= 1;
				if(this.__flied === 0)
					Cache.put('flycomp', this);
			}
		},
		
/**
* 添加控件view元素样式类.
* @param {String} s css类名
* @see #delClass
* @see #addClassIf
* @return this
* @example
  comp.addClass('cssName');
*/
    addClass: function(s) {
        var v = this.view;
        var ss = v.className.replace(s, '');
        ss += ' ' + s;
        v.className = ss;
        return this;
    }
    ,
/**
* 如果控件view元素未存在该样式类,添加元素样式类,否则忽略.
* @param {String} s css类名
* @see #addClass
* @return this
* @example
  comp.addClassIf('cssName');
*/
    addClassIf: function(s) {
        if(this.hasClass(s))
			  return this;
		var v = this.view;
        var ss = v.className.replace(s, '');
        ss += ' ' + s;
        v.className = ss;
        return this;
    }
    ,
/**
* 删除view元素样式类.
* @param {String} s css类名
* @see #addClass
* @return this
* @example
  comp.delClass('cssName');
*/
    delClass: function(s) {
        var v = this.view;
        v.className = v.className.replace(s, "");
        return this;
    }
    ,
/**
* 测试view元素是否存在指定样式类.
* @param {String} s css类名
* @return {Boolean}
* @example
  comp.hasClass('cssName');
*/
    hasClass : function(s) {
        return s && (' ' + this.view.className + ' ').indexOf(' ' + s + ' ') != -1;
    },
/**
* 替换view元素样式类.
* @param {String} oldSty 已存在的CSS类名
* @param {String} newSty 新的CSS类名
* @return this
* @example
  comp.switchClass('mouseoverCss', 'mouseoutCss');
*/
    switchClass: function(oldSty, newSty) {
        this.delClass(oldSty);
        this.addClass(newSty);
        return this;
    }
    ,
/**
* 重置元素样式类.
* @param {String} s CSS类名
* @return this
* @example
  comp.switchClass('mouseoverCss', 'mouseoutCss');
*/
    setClass: function(s) {
        this.view.className = s;
        return this;
    }
    ,
/**
 * this.view.getElementsByTagName(tagName);
 * @param {String} tagName
 * @see CC.Base#$T
 * @return {DOMCollection} doms
 */
    $T: function(tagName) {
        return this.view.getElementsByTagName(tagName);
    }
    ,
/**
 * 获得控件视图下任一子结点.
 * @param {String|DOMElement} childId
 * @return CC.$(childId, this.view);
 * @see CC#$
 * @return {DOMElement} dom
 */  
    dom : function(childId) {
        return CC.$(childId, this.view);
    },
		/**
		 * 常用于取消DOM事件继续传送,内在调用了Event.stop(ev||window.event);
		 * @param {String} eventName 事件名称
		 * @param {String|DOMElement} 子结点
		 * @return this
		 */ 
    noUp : function(eventName, childId) {
        return this.domEvent(eventName || 'click', Event.noUp, true, null, childId);
    },
/**
 * 清空view下所有子结点.
 * @return this
 * @type function
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
 * @property {String} [disabledCS='g-disabled'] 禁用时元素样式
 */
    disabledCS : 'g-disabled',
    
/**
 * @property {String} [displayMode='display'] 显示模式,可选有display,visibility
 * @see #setDisplayMode
 */
	  displayMode : 'display',
/**
 * @property {String} [blockMode='block'] 当displayMode的display模式时,块显示方式,可选的有'block','inline'和''
 * @see #setBlockMode
 */
	  blockMode : 'block',
    
/**
 * 显示或隐藏或获得控件的显示属性.
 * @param {Boolean} [b] 设置是否可见
 * @return {this|Boolean}
 * @example
	 //测试元素是否可见
	 alert(comp.display());
	 
	 //设置元素可见,模式为block
	 comp.display(true);
	 
	 //设置元素可见,模式为inline
	 comp.setBlockMode('inline').display(true);
*/
   display: function(b) {
     if (b === undefined) {
     	return this.view.style[this.displayMode] != hidMode[this.displayMode];
     }

     this.hidden = !b;
		 this.view.style[this.displayMode] = b ? this.blockMode : hidMode[this.displayMode];
		 
		 if(this.shadow){
			 if(b){
			 	  var s = this.shadow;
			 	  (function(){
			 	  	s.reanchor()
			 	  	 .display(true);
			 	  }).timeout(0);
			 }else 
			 this.shadow.display(b);
		 }
		 return this;
   },
/** 
 * @param {String} bl 
 * @see #blockMode 
 * return this 
 */    
   setBlockMode : function(bl){
   		this.blockMode = bl;
   		return this;
   },
/** 
 * @param {String} dm 
 * @see #displayMode 
 * return this 
 */    
   setDisplayMode : function(dm){
   	this.displayMode = dm;
   	if(dm == 'visibility')
   		this.blockMode = dispMode[dm];
   	return this;
   },
   
/** 
 * 检查或设置DOM的disabled属性值. 
 * @param {Boolean|undefined} b 
 * @return {this|Boolean} 
 */ 
    disable: function(b) {
  	
        if(arguments.length==0){
            return this.disabled;
        }
  	
        var v = this.disableNode || this.view;
        this.dom(v).disabled = b;
        this.disabled = b;
    
        if(this.disabledCS){
           if (b) this.addClass(this.disabledCS);
             else
           this.delClass(this.disabledCS);
        }
    	
        return this;
    },

     /** 
      * this.view.appendChild(oNode.view || oNode); * @param {DOMElement} oNode
      * @return this; 
      */	
    append : function(oNode){
        this.view.appendChild(oNode.view || oNode);
        return this;
    },
/**
 * (this.ct||this.view).innerHTML = ss; 
 * @param {String} ss html内容 
 * @param {Boolean} [invokeScript] 是否运行里面的脚本 
 * @param {Function} [callback] 回调 
 * @return this 
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
     * where.appendChild(this.view); 
     * @param {DOMElement|CC.Base} where 
     * @return this 
     */		
    appendTo : function(where) {
        where.type ? where.append(this.view) : CC.$(where).appendChild(this.view);
        return this;
    },
/** 
 * 在结点之后插入oNew 
 * @param {DOMElement|CC.Base} oNew 
 * @return this 
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
        oNew = CC.$$(oNew).view;
        this.view.parentNode.insertBefore(oNew, this.view);
        return this;
    },
 /** 
  * 设置控件的zIndex值. 
  * @param {Number} zIndex 
  * @return this 
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
 * 设置或获得控件样式. 
 * @return {Mixed} 
 @example 
  var div = CC.$('someid');
  var f = CC.fly(div);
  f.style('background-color','red');
  //显示red
  alert(f.style('background-color');
  f.unfly(); 
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
	
    /*设置view结点风格.
     *@example
      comp.setStyle('position','relative');
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
    
    
/***/
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
 * 快速获得元素样式,比setStyle更轻量级,但也有如下例外
 * <li>不能设置float
 * <li>传入属性名必须为JS变量格式,如borderLeft,非border-width
 * <li>不能设置透明值
 */
    fastStyleSet : function(k, v){
    	this.view.style[k] = v;
    	return this;
    },
/**
 * 快速获得元素样式,比getStyle更轻量级,但也有如下例外
 * <li>不能获得float
 * <li>传入属性名必须为JS变量格式,如borderLeft,非border-width
 * <li>不能处理透明值
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
	 	 * @return this 
	 	 */ 
    setIcon: function(cssIco) {
	 	 	/** 
	 	 	 * @name CC.Base#iconNode 
	 	 	 * @property {DOMElement|String} iconNode 图标所在结点 
	 	 	 */
        var o = this.fly(this.iconNode || '_ico');
        if(this.iconCS)
            if(!this.hasClass(this.iconCS))
                this.addClass(this.iconCS);
				
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
* @param {String} ss
* @return this
*/
    setTip:function(ss){
      if(this.view && ss && !this.qtip){
      		this.view.title = ss;
      }
      this.tip = ss;
      return this;
   },
/**
* @param {String} ss
* @return this
*/
    setTitle: function(ss) {
/**
* @name CC.Base#titleNode
* @property {DOMElement|String} titleNode 标题所在结点
*/

/**
* @name CC.Base#brush
* @property {Function} brush 渲染标题的
* @type Function
* @param {Object} v
* @return {String} html string of title
*/
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
 * @return this 
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
 * @return this 
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
 * @name CC.Base#outerW border + padding 的宽度,除非确定当前
 * 值是最新的,否则请通过{@link #getOuterW}方法来获得该值.
 * 该值主要用于布局计算,当调用{@link #getOuterW}方法时缓存该值
 * @property {Number}  outerW
 * @protected
 */

/**
 * 得到padding+border 所占宽度, 每调用一次,该函数将缓存值在outerW属性中
 */
    getOuterW : function(cache){
    	var ow = this.outerW;
    	if(!cache || ow === undefined){
	    	ow =(parseInt(this.fastStyle('borderLeftWidth'),10) + 
	    	     parseInt(this.fastStyle('borderRightWidth'),10)+
	    	     parseInt(this.fastStyle('paddingLeft'),10)+
	    	     parseInt(this.fastStyle('paddingRight'),10))||0;
	    	this.outerW = ow;
      }
    	return ow;
    },

/**
 * @name CC.Base#outerH border + padding 的高度,除非确定当前
 * 值是最新的,否则请通过{@link #getOuterH}方法来获得该值.
 * 该值主要用于布局计算,当调用{@link #getOuterH}方法时缓存该值
 * @property {Number}  outerH
 * @protected
 */

/**
 * 得到padding+border 所占高度, 每调用一次,该函数将缓存该值在outerH属性中
 * @param {Boolean} cache 是否使用缓存值
 */
    getOuterH : function(cache){
    	var oh = this.outerH;
    	if(!cache || oh === undefined){
    	 	oh= (parseInt(this.fastStyle('borderTopWidth'),10) + 
    	  	   parseInt(this.fastStyle('borderBottomWidth'),10)+
    	       parseInt(this.fastStyle('paddingTop'),10)+
    	       parseInt(this.fastStyle('paddingBottom'),10))||0;
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
 * @param {Number|Object|false} a number或{width:number,height:number},为false时不更新 
 * @return this
 @example
 	comp.setSize(50,100);
 	comp.setSize(false,100);
 	comp.setSize(50,false);
 */ 
    setSize : function(a, b) {
        if(a.width !== undefined){
            var c = a.width;
            if(c !== false){
                if(c<this.minW) c=this.minW;
                if(c>this.maxW) c=this.maxW;
                this.fastStyleSet('width', NB?Math.max(c - this.getOuterW(true),0)+'px' : c + 'px');
                this.width = c;
            }
            c=a.height;
            if(c !== false){
                if(c<this.minH) c=this.minH;
                if(c>this.maxH) c=this.maxH;
                if(c<0) a.height=c=0;
                this.fastStyleSet('height', NB?Math.max(c - this.getOuterH(true),0)+'px' : c + 'px');
                this.height = c;
            }
            return this;
        }
		
        if(a !== false){
            if(a<this.minW) a=this.minW;
            if(a>this.maxW) a=this.maxW;
            this.fastStyleSet('width', NB?Math.max(a - this.getOuterW(true),0)+'px' : a + 'px');
            this.width = a;
        }
        if(b !== false){
            if(b<this.minH) b=this.minH;
            if(b>this.maxH) b=this.maxH;
            this.fastStyleSet('height', NB?Math.max(b - this.getOuterH(true),0)+'px' : b + 'px');
            this.height=b;
        }
		
        return this;
    },
/**
 * @param {Number|Array|false} a number或[x,y],为false时不更新.
 * @return this
 @example
 	comp.setXY(50,100);
 	comp.setXY(false,100);
 	comp.setXY(50,false);
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
 * @return this
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
 * @return this
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
 */
    xy : function(usecache) {
				return [this.getLeft(usecache), this.getTop(usecache)];
    }
    ,
/**
 * 得到相对页面x,y坐标值.
 * @return [x, y]
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
/** @return {Number}
 */
    absoluteX : function(){
        return this.absoluteXY()[0];
    },
/** * @return {Number}
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
            if(NB)
                w += this.getOuterW();
        }
        
        var h = Math.max(v.offsetHeight, v.clientHeight);
        if(!h){
            h = parseInt(this.fastStyle('height'), 10) || 0;
            if(NB)
                h += this.getOuterH();
        }
        
        return {
            width:w,
            height:h
        };
    },
		
/**
 * 连续应用 setXY, setSize方法
 * @return this
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
        
	    	if(ny < 0)
	    		ny = bx+bw>nx && bx<nx+w ? by+bh : 0;
	    	
	    	if(ny + h > vh)
	    		ny = bx+bw>nx && bx<nx+w ? by - h : vh - h;
	    }
	    
	    w = [nx, ny];
	    
	    if(move)
	    	this.setXY(w);
	    
	    return w;
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
 * @return this
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
 * @return this
 */  
    focus : function(timeout){
        		if(this.disabled)
        			return this;
        		/**
        		 * @name CC.Base#focusNode
        		 * @property {DOMElement|String} focusNode 当控件调用{@link #focus}聚焦时,控件中实际触发聚焦的DOM元素.
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
 * @return this
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
 * @return this
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
 * @return this
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
 * @return this
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
 * @return this
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
   * 为相对事件设置样式效果,如果控件disbled为true,效果被忽略.
   * 相对事件如onmouseup,onmousedown;onmouseout,onmouseover等等.
	 * 可选参数为
	 * cancel: 指示是否允许事件冒泡.
	 * onBack : over时回调.
	 * offBack: out时回调.
	 * 回调返回true时不改变样式.
	 * caller  : 用于调用回调函数的对象.
	 * @return this
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
	 *@param onMouseHover
	 *@param onMouseOff
	 * @return this
	 */
    bindHoverStyle: function( css, cancel, onBack, offBack, oThis, childId, targetId) {
        return this.bindAlternateStyle('mouseover', 'mouseout', css || this.hoverCS, cancel, onBack || this.onMouseHover, offBack || this.onMouseOff, oThis || this, childId, targetId);
    }
    ,
/***/
    bindFocusStyle : function( css, cancel, onBack, offBack, oThis, childId, targetId) {
        return this.bindAlternateStyle('focus', 'blur', css, cancel, onBack || this.onfocusHover, offBack || this.onfocusOff, oThis || this, childId, targetId);
    },
    /**
	 * 设置鼠标按下/松开时元素样式.
	 * @return this
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
 * @name CC.Base#contexted
 * @event
 * @param {Boolean} isContexted true|false
 * 当isContexted=true时,随后传递触发该事件的结点
 * 当isContexted=false时,随后传递触发释放事件的DOM事件,接着是DOM结点
 */
/**
 * 添加上下文切换效果,当点击控件区域以外的地方时隐藏控件.
 * @return this
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
    	this.__contextedCb();
    },
    
/**
 * Base包装控件内的子结点元素
 * @return {CC.Base}
 */
    $$ : function(id) {
        var c = CC.$$(id, this.view);
        if(c){
         this.follow(c);
        }
        return c;
    },
 /**访问或设置view中任一子层id为childId的子结子的属性.
  *属性也可以多层次.
  *@param {element|string} childId 子结点ID或dom元素
  *@param {string} childAttrList 属性列,可连续多个,如'style.display'
  *@param [attrValue] 如果设置该置,则模式为设置,设置属性列值为该值,如果未设置,为访问模式,返回视图view给出的属性列值
  *@return 如果为访问模式,即attrValue未设置,返回视图view给出的childAttrList属性列值
  *@see CC#$attr
  *@example 
  *<pre>
	  //如存在一id为this.iconNode || '_ico'子结点,设置其display属性为
	  comp.inspectAttr(this.iconNode || '_ico','style.display','block');
	*</pre>
	 */
    $attr: function(childId, childAttrList, attrValue) {
        var obj = this.dom(childId);
        //??Shoud do this??
        if (!obj)
            return ;
    
        obj = CC.$attr(obj, childAttrList, attrValue);
        return obj;
    },
/***/
    setCloseable: function(b) {
        this.closeable = b;
        var obj = this.fly(this.closeNode || '_cls');
        if(obj)
            obj.display(b).unfly();
        return this;
    },
/**得到相对位移*/
		offsetsTo : function(tar){
			  var o = this.absoluteXY();
			  tar = CC.fly(tar);
        var e = tar.absoluteXY();
        tar.unfly();
        return [o[0]-e[0],o[1]-e[1]];
		},
/**滚动控件到指定视图*/
    scrollIntoView : function(ct, hscroll){
        var c;
        if(ct)
        	c = ct.view || ct;
        else c = CC.$body.view;
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
/***/
    scrollChildIntoView : function(child, hscroll){
        this.fly(child).scrollIntoView(this.view, hscroll).unfly();
        return this;
    },
    
	/**
	 * 检测元素是否在某个容器的可见区域内,如果在可见区域内，返回false,
	 * 否则返回元素偏离容器的scrollTop,利用该scrollTop可将容器可视范围滚动到元素处。 
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
/***/
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
 * 创建一个具有完整生命周期的基本类实例,
 * 注意如果直接用new Base创建的类没控件初始化过程.
 * 该方法已被设为 protected, 不建议直接调用,要创建基类实例请调用
 * CC.ui.instance(option)方法.
 * @protected
 * @param {Object} opt 类初始化信息
 * @name CC.Base.create
 * @function
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
 * @function
 * @memberOf CC
 * 根据DOM快速转化为控件对象方法，该方法将具有控件生命周期，但略去了初始化和渲染.
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
 * @function
 * @memberOf CC
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
 * 标题画笔工厂.
 * @name CC.Base.BrushFactory
 * @namespace
 */
Base.BrushFactory = /**@lends CC.Base.BrushFactory*/{
/**
 * 获得浮点数格式化表示值.
 * @param {Number} 保留位数
 * @return {Function}
   @example
   var brush = Base.brushFactory.floatBrush(2);
   alert(brush(1.2214));
   alert(brush(.3218));
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
 * @param {String} fmt mm/dd/yy或其它格式
 * @return {Function}
 */
	date : function(fmt){
		if(!fmt)
			fmt = 'yy/mm/dd';
			
		return function(v){
			return CC.dateFormat(v, fmt);
		}
	}
};
/**
 * @name CC.Base.BrushFactory.Float2
 * @property {Function} Float2 保留两位小数的浮点预留画笔
 */
Base.BrushFactory.Float2 = Base.BrushFactory.floatBrush(2);

/**
 * @name CC.Base.BrushFactory.Percent2
 * @property {Function} Float2 保留两位小数的百分比预留画笔
 */
Base.BrushFactory.Percent2 = Base.BrushFactory.floatBrush(2, '%');


/**
 * @name CC.ui
 * @class 控件包
 */

CC.ui = /**@lends CC.ui*/{
/**@private*/
	ctypes : {},

/**
 * 注册控件类标识,方便在未知具体类的情况下生成该类,也方便序列化生成类实例.
 */
	def : function(ctype, clazz){
		this.ctypes[ctype] = clazz;
	},
	
/**
 * 根据类初始化信息返回类实例,如果初始化信息未指定ctype,默认类为CC.Base,
 * 如果初始化信息中存在ctype属性,在实例化前将移除该属性.
 * 如果传入的参数已是某个类的实例,则忽略.
 @example
  <pre>
 	通过该类创建类实例方式有几种
 	1. var inst = CC.ui.instance('shadow');
 	  或
 	   var inst = CC.ui.instance('shadow', { width:55, ...});
 	
 	2. var inst = CC.ui.instance({ctype:'shadow', width:55});
 	
 	//得到CC.ui.ContainerBase类实例,假定该类的ctype为ct
 	   var inst = CC.ui.instance({ ctype : 'ct', showTo : document.body });
 	</pre>
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
			
		else delete opt.ctype;
			
		return new this.ctypes[t](opt);
	}
};

/**
 * document.body的Base封装
 * @type CC.Base
 * @name CC.$body
 */
Event.defUIReady = function(){
	CC.$body = CC.$$(document.body);
	if(document.body.lang !== 'zh')
		document.body.lang = 'zh';
};

})(CC);

/**
 * @name CC.util
 * @class
 */
CC.util = {};

//~@base/d2d.js
/**
 * 平面2D相关类库
 * @name CC.util.d2d
 * @namespace
 */
 CC.util.d2d = {};
/**
 * @name CC.util.d2d.Point
 * 点类,描述平台空间上的一个点
 * @class
 */
	CC.util.d2d.Point = function(x, y){
		this.x = x || 0;
		this.y = y || 0;
	};
/**
 * @name CC.util.d2d.Rect
 * 矩形类,l,t,w,h
 * @param {Array|Number} data 传入一个数组或left, top, width, height
 * @class
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
	};
	
	CC.extend(CC.util.d2d.Rect.prototype, /**@lends CC.util.d2d.Rect.prototype*/{
/**
 * @type Number
 */
		l : 0,
/**
 * @type Number
 */
		t : 0,
/**
 * @type Number
 */
		w: 0,
/**
 * @type Number
 */
		h : 0,
/**
 * 点p是位于矩形内
 * @param {CC.util.Point} 点
 */
	  isEnter : function(p){
	  	var x = p.x, y = p.y;
	  	
	    return x>=this.l && x<=this.l+this.w &&
	           y>=this.t && y<=this.t+this.h;
	  },
/**
 * 刷新矩形缓存数据,默认为空调用
 */
	  update : fGo,

	  toString : function(){
	  	return this.valueOf() + '';
	  },
	  
	  valueOf : function(){
	  	return [this.l,this.t,this.w,this.h];
	  }
	});
	
/**
 * 矩域, 由多个矩形或矩域组成树型结构
 * 矩域大小由矩形链内最小的left,top与最大的left+width,top+height决定
 * @name CC.util.d2d.RectZoom 矩域
 * @class
 * @super CC.util.d2d.Rect
 */
	CC.create('CC.util.d2d.RectZoom', CC.util.d2d.Rect, function(father){
	 
	 var Math = window.Math;
	 
	 return {
/**
 * 父层矩域
 */
     pZoom : null,
/**
 * @constructor
 * @param {Array} rects 包含CC.util.Rect实例的数组
 */
     initialize : function(rects){
        this.rects = [];
        if(rects){
		  	 for(var i=0,len=rects.length;i<len;i++){
		  	 	this.add(rects[i]);
		  	 }
		  	 this.update();
		  	}
		  },
      
/**
 * 返回域内所有矩形
 * @return {Array}
 */
      getRects : function(){
      	return this.rects;
      },
      
/**
 * 矩形加入矩域
 * @param {CC.util.d2d.Rect} rect
 * @param {Boolean} update 是否更新
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
 */
		  remove : function(r, update){
		  	delete r.pZoom;
		  	this.rects.remove(r);
		  	if(update)
		  		this.update();
		  	return this;
		  },
		  
	/**
	 * 检测点是否位于当前矩形链中,如果点已进入范围,点所在的矩形
	 * @return [Boolean|CC.util.d2d.Rect] false或矩形类
	 */
		  isEnter : function(p){
		  	//先大范围检测
		  	if(father.isEnter.call(this, p)){
		  		var i, rs = this.rects, len = rs.length;
		  		for(i=0;i<len;i++){
		  			if(rs[i].isEnter(p)){
		  				return rs[i];
		  			}
		  		}
		  	}
		  	return false;
		  },
	    
	/**@private*/
		  calValue : function(){
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
				  x1 = Math.min.apply(Math, x1);
				  x2 = Math.max.apply(Math, x2);
				  t1 = Math.min.apply(Math, t1);
				  t2 = Math.max.apply(Math, t2);
			  }
			  this.l = x1;
			  this.t = t1;
			  this.w = x2 - x1;
			  this.h = t2 - t1;
		 },

		 update : function(){
			var i, rs = this.rects, len = rs.length;
			for(i=0;i<len;i++){
				rs[i].update();
			}
			this.calValue();
		 }
	 };
	  
  });
  
/**
 * @name CC.util.d2d.ComponentRect
 * @class
 */
  CC.create('CC.util.d2d.ComponentRect', CC.util.d2d.Rect, {
/**
 * @type Number
 * zIndex
 */
  	z : -1,
  	
  	initialize : function(comp){
  		this.comp = comp;
  		this.update();
  	},

/**
 * 刷新矩形缓存数据
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
  		this.comp = null;
  	}
  });
  
//~@base/dd.js
/**
 * 库drag & drop效果实现
 * drag & drop实现有两种方法,
 * <li>基于空间划分检测
 * <li>一种基于浏览器自身的mouse over + mouse out检测
 * 这里采用第二种
 * @namespace CC.util.dd
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
		
		//拖放事件是否已绑定,避免重复绑定
		binded = false,
		
		//[MAX_DX,MIN_DX,MAX_DY,MIN_DY]
		bounds = false;

		function noSelect(e){
			e = e || window.E;
			E.stop(e);
			return false;
		}
		
/**
 * @name CC.Base#draggable
 * @property {Boolean} 是否允许拖动功能,该值只有在已安装拖动功能情况下才生效
 */
 
		function before(e){
			if(this.draggable){
        IXY = PXY = E.pageXY(e);
        IEXY = this.absoluteXY();
        dragEl = this;
        if(__debug) console.group("拖放"+this);
        if(__debug) console.log('beforedrag');
				if(this.beforedrag(e)!==false && this.fire('beforedrag', e) !== false){
				  //doc.ondragstart = E.noUp;
				  if(!binded){
					  binded = true;
	          E.on(doc, "mouseup", drop);
	          E.on(doc, "mousemove", drag);
	          E.on(doc, "selectstart", noSelect);
	          zoom = mgr.$(this.dragZoom);
	          if(__debug && zoom) console.log('当前zoom:',this.dragZoom||zoom);
          }
			  }
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
		      return d;
		}
    
/**@inner*/
		function drag(e){
			e = e || _w.E;
			PXY = E.pageXY(e);
      
      	
    	P.x = PXY[0];
	    P.y = PXY[1];
		  
		  GDXY();
		  
		  if(!ing){
		  	if(__debug) console.log('dragstart       mouse x,y is ', PXY);
		  	if(dragEl.dragstart(e) !== false && dragEl.fire('dragstart', e) !== false){
		  		ing = true;
		  	}
		  }
		  
      if(dragEl.drag(e, onEl) !== false && zoom){	  
			  //区域检测
			  R = zoom.isEnter(P);
			  
			  if(R) {
			  	if(onEl !== R.comp){
			  		//首次进入,检测之前
			  		if(onEl !== null){
				  		onEl.sbout(dragEl, e);
				  		if(__debug) console.log('离开目标:',onEl);
			  		}
			  		onEl = R.comp;
			  		if(!onEl.disabled){
			  			onEl.sbover(dragEl, e);
			  			if(__debug) console.log('进入目标:',onEl);
			  		}else {
			  			onEl = null;
			  		}
			  	}
			  	//目标内移动
			  	onEl.sbmove(dragEl, e);
			  }else{
			  	if(onEl!== null){
			  		onEl.sbout(dragEl, e);
            if(__debug) console.log('离开目标:',onEl);
			  		onEl = null;
			  	}
			  }
		  }
		}

/**@inner*/
		function drop(e){
			if(dragEl){
				e = e || _w.E;
				if(binded){
					//doc.ondragstart = null;
		      //清空全局监听器
		      E.un(doc, "mouseup", arguments.callee);
		      E.un(doc, "mousemove", drag);
		      E.un(doc, "selectstart", noSelect);
		      if(ing){
		        //如果在拖动过程中松开鼠标
		      	if(onEl !== null){
		      		onEl.sbdrop(dragEl, e);
		      		if(__debug) console.log(dragEl.toString(), '丢在', onEl.toString(),'上面');
		      	}
		      	dragEl.dragend(e);
		      	ing = false;
		      }
		      binded = false;
		      onEl = null;
		      zoom = null;
		      R = null;
		      if(__debug) console.log('dragend         mouse delta x,y is ',DXY, ',mouse event:',e);
	      }
	      if(__debug) console.log('afterdrag');
	      dragEl.afterdrag(e);
        dragEl.fire('afterdrag', e);
        dragEl = null;
        bounds = false;
        if(__debug) console.groupEnd();
      }
		}
		

/**
 * @name CC.util.dd.Mgr
 * Drag & Drop 管理器
 * @class
 */
  var mgr = CC.util.dd.Mgr = {
/**
 * 矩域缓存
 */
		  	zmCache : {root:new CC.util.d2d.RectZoom()},

/**
 * 返回矩域
 * @param {String} name 矩域名称
 * @param {String} parent 父层矩域,如果该参数为非空,并且name域未存在,则创建一个新域并返回该域
 * @return {CC.util.d2d.RectZoom}
 */
		  	$ : function(k, p){
		  		var z = this.zmCache[k];
		  		if(!z && p){
		  			var c = this.zmCache;
		  			if(k === 'root')
		  				throw "can't named root";
		  			if(typeof p === 'string'){
		  				p = c[p];
		  				if(!p)
		  					throw "parent zoom doesn't exist."
		  			}else if(p === true)
		  				p = c.root;
		  			
		  			z = c[k] = new CC.util.d2d.RectZoom();
		  			p.add(z);
		  		}
		  		return z;
		  	},
/**
 * 设置拖放区域大小,在X方向上,最小的delta x与最大的delta x,
 * 在Y方向上,最小的delta y与最大的delta y, 所以数组数据为
 * [max_delta_x, min_delta_x, max_delta_y, min_delta_y],
 * 设置拖动区域后,超出区域的行为将被忽略,也就是并不回调
 * component.drag方法,所以,在drag方法内的操作都是安全的.
 * 受限区域在拖放结束后清空.
 * @type Array
 */
		  	setBounds : function(arr){
		  		bounds = arr;
		  	},
/**
 * 获得受限区域
 */
		  	getBounds : function(){
		  		return bounds;
		  	},
/**
 * 返回根域
 */
		  	getRoot : function(){
		  		return this.zmCache.root;
		  	},
/**
 * 从域链中移除名称为name的域
 * @param {String} name
 * @return {CC.util.d2d.RectZoom} 返回移除的域
 */
        remove : function(k){
         var z = this.zmCache[k];
         if(z && k !== 'root'){ 
         	z.pZoom.remove(z);
         	delete this.zmCache[k];
         }
         return z;
        },
        
/**
 * 将控件加入name域
 * @param {CC.Base} 控件
 * @param {String} name 矩域名
 * @return this
 */
        addComp : function(comp, k){
          k = this.$(k, true);
          k.add(new CC.util.d2d.ComponentRect(comp));
          return this;
        },
/**
 * 控件移出域
 * @param {CC.Base} 控件
 * @param {String} name 矩域名
 * @return this
 */
        removeComp : function(comp, k){
        	k = this.$(k);
        	var rs = k.getRects();
        	CC.each(rs, function(){
        		if(this.comp === comp){
        			k.remove(this);
        			this.destory();
        			return false;
        		}
        	});
        	return this;
        },
        
/**
 * 获得对象拖动开始时鼠标坐标
 * @return {Array} [x, y]
 */ 	
		  	getIMXY : function(){
		  		return IXY;
		  	},
/**
 * 获得对象拖动开始时对象坐标
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
 * 给控件安装可拖动功能,安装后控件component具有
 * component.draggable = true;
 * 如果并不想控件view结点触发拖动事件,可设置component.dragNode
 * 指定触发结点.
 * @param {CC.Base} component
 * @param {Boolean} install 安装或取消安装
 * @param {HTMLElement} 触发事件的结点,如无则采用c.dragNode
 */
		  	installDrag : function(c, b, dragNode){
					if(b===undefined || b){
						c.draggable = true;
						c.domEvent('mousedown', before, false, null, dragNode||c.dragNode);
					}else {
						c.draggable = false;
						c.unEvent('mousedown', before,dragNode||c.dragNode);
					}
		  	},
		  	
/**
 * 是否拖放中
 */
		  	isDragging : function(){
		  		return ing;
		  	},

/**
 * 当控件需要resize时调用,可以创建resize相关的掩层和映像,防止其它干扰resize的因素,如iframe
 * @type Object
 */
		  	resizeHelper : /**@lends CC.util.dd.Mgr.resizeHelper*/{
		  		
			    resizeCS : 'g-resize-ghost',
					
					maskerCS : 'g-resize-mask',
/**
 * @property {CC.Base} layer 映像层,只读,当调用applyLayer方法后可直接引用
 */

/**
 * @property {CC.Base} masker 页面掩层,只读,当调用applyMasker方法后可直接引用
 */
 
/**
 * 在resize开始或结束时调用
 * @param {Boolean} apply
 */
		      applyResize	: function(b){
		      	this.resizing = b;
			      this.applyLayer(b);
			      this.applyMasker(b);
		      },
/**
 * 是否应用映像层
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
			    	b ? y.appendTo(document.body) : y.del();
			    	y.display(b);
			    },
/**
 * 创建或移除页面掩层,在resize拖动操作开始时,创建一个页面掩层,
 * 以防止受iframe或其它因素影响resize
 * @param {Boolean} cor 创建或移除页面掩层
 */
			    applyMasker : function(b){
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
			      b ? r.appendTo(document.body) : r.del();
			      r.display(b);
			    }
		  	}
	};
  
	CC.extendIf(CC.Base.prototype,/**@lends CC.Base.prototype*/ {
/**
* @name CC.Base#dragNode
* @property {String|HTMLElement} 触发控件拖动开始的结点或结点ID
*/

/**
* @name CC.Base#dragZoom
* @property {String} 设置或获取控件目标拖放区域名称(组)
* 只有控件已安装拖动功能该设置才生效
* @see #installDrag
*/

/**
* 是否安装结点拖放效果
* @function
* @param {Boolean} true | false
*/
		installDrag : function(b){
			mgr.installDrag(this, b);
			return this;
		},
/**
* 获得drag & drop 管理器
* @return {CC.util.dd.Mgr}
*/
		getDDProvider : function(){
			return mgr;
		},

/**
 * 如果已安装拖放,
 * 函数在鼠标按下时触发
 */
		beforedrag : fGo,
/**
 * 如果已安装拖放
 * 拖动开始时触发
 */
    dragstart : fGo,
/**
 * 如果已安装拖放,
 * 函数在鼠标松开时触发,拖动曾经发生过
 */
		dragend : fGo,
/**
 * 如果已安装拖放,
 * 函数在鼠标松开时触发,拖动不一定发生过
 */
		afterdrag : fGo,
/**
 * 如果已安装拖放,
 * 函数在鼠标拖动时触发
 */
		drag : fGo,
		
/**
 * 如果已加入拖放组,
 * 函数在目标进入时触发
 */
		sbover : fGo,
/**
 * 如果已加入拖放组,
 * 函数在目标离开时触发
 */
		sbout : fGo,
/**
 * 如果已加入拖放组,
 * 函数在目标丢下时触发
 */
		sbdrop : fGo,
/**
 * 如果已加入拖放组,
 * 函数在目标移动时触发
 */
		sbmove : fGo
	});
})();

//~@ui/shadow.js
(function(){

var CC = window.CC;
var PR = CC.Base.prototype;

/**
 * 阴影类
 * 阴影类须在文档创建后(DOM Ready)生成.
 * @name CC.ui.Shadow
 * @class 阴影类
 * @extends CC.Base
 */
CC.Tpl.def('CC.ui.Shadow' , CC.ie6 ? '<div class="g-dxshadow"></div>' : '<div class="g-shadow" style="display:none;"><div class="g-shadow-t" id="_t"></div><div class="g-shadow-lt" id="_lt"></div><div class="g-shadow-rt" id="_rt"></div><div class="g-shadow-l" id="_l"></div><div class="g-shadow-lb" id="_lb"></div><div class="g-shadow-r" id="_r"></div><div class="g-shadow-rb" id="_rb"></div><div class="g-shadow-b" id="_b"></div></div>');

CC.create('CC.ui.Shadow', CC.Base, 
/**@lends CC.ui.Shadow.prototype*/ 
{
/**
 * @property {Number} [inpactW=8] 阴影宽度相关参数
 */
	inpactW : 8,
/**
 * @property {Number} [inpactH=0] 阴影高度相关参数
 */
	inpactH : 0,
/**
 * @property {Number} [inpactX=-4] 阴影x方向位移相关参数
 */
	inpactX : -4,
/**
 * @property {Number} [inpactY=8] 阴影y方向位移相关参数
 */
	inpactY : 4,
/**
 * @private
 * @property {Number} [shadowWidth=8] 阴影边沿宽度,该值只对IE有效
 */
	shadowWidth : 6,
	
	/**
	 * 变换引起的偏移量, 专为IE6采用的滤镜设置,非IE6时忽略该值,默认为4, 参见CSS滤镜中Blur(pixelradius).
	 * @property {Number}
   * @private
	 */
	offset : 4,
/**
 * @property {Boolean} [hidden=true] 默认隐藏
 */
	hidden : true,
	
	
	initComponent : function(){
/**
 * @name CC.ui.Shadow#showTo
 * @property {DOMElement} [showTo=document.body] 默认显示在document.body中
 */
		
		PR.initComponent.call(this);
/**
 * @name CC.ui.Shadow#target
 * @property {CC.Base} [target] 阴影附加的目标控件
 */
		if(this.target)
		  	this.attach(this.target);
		if(CC.ie && !CC.ie6){
			//@private
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
 * 更新至当前状态,当阴影大小或位置与目标不一致时调用.
 * @return this
 */
	reanchor : function(){
		var pos, t = !this.hidden;
    d = this.target.getSize(true);
		this.setRightSize(d.width, d.height);
    pos = this.target.absoluteXY();
		this.setRightPos(pos);
		if(t)
			PR.display.call(this, true);
		return this;
	},
	
	/**
	 * 只有target显示时才显示阴影,否则忽略.
	 * @override
	 */
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

//~@ui/loading.js
(function(){
var CC = window.CC;
var PR = CC.Base.prototype;
/**
 * 加载提示类
 * @name CC.ui.Loading
 * @class 加载提示类
 * @extends CC.Base
 */
CC.Tpl.def( 'CC.ui.Loading' , '<div class="g-loading"><div class="g-loading-indicator"><span id="_tle">加载中,请稍候...</span></div></div>');

CC.create('CC.ui.Loading', CC.Base, 
 /**@lends CC.ui.Loading.prototype*/
 {
/**
 * @field
 * 掩层CSS类名
 */
	loadMaskCS:'g-loading-mask',
	
	initComponent : function(){
		PR.initComponent.call(this);
		if(this.target)
			this.attach(this.target);
	},

/**
 * 装饰容器,当容器加载数据时出现提示.
 */
	attach : function(target){
/**
 * @name CC.ui.Loading#target
 * @property {Base} [target] 目标控件
 */
		this.target = target;
		this.target.
		  on('open',this.whenOpen,this).
		  on('send',this.whenSend,this).
		  on('success',this.whenSuccess,this).
		  on('final',this.whenFinal,this);
	},
	
	/**@private*/
	whenSend : fGo,
	/**@private*/
	whenSuccess : function(){this.target.loaded = true;},
	/**@private*/
	whenOpen : function(){
		this.target.busy = true;
		this.markIndicator();
	},
	/**@private*/
	whenFinal : function(){
  	this.target.busy = false;
  	this.loaded = true;
  	this.stopIndicator();
  	if(this.target.shadow){
  		this.target.shadow.reanchor();
  	}
  },
/**
 * 开始加载提示
 */
	markIndicator : function(){
		if(this.disabled)
			return;
/**
 * @name CC.ui.Loading#targetLoadCS
 * @property {String} [targetLoadCS] 加载时添加到目标的样式
 */
		if(this.targetLoadCS)
			CC.fly(this.target).addClass(this.targetLoadCS).unfly();

		//应用掩层
/**
 * @name CC.ui.Loading#maskDisabled
 * @property {Boolean} [maskDisabled=false] 是否禁用掩层
 */
		if((!this.mask || !this.mask.tagName) && !this.maskDisabled){
			this.mask = CC.$C({tagName:'DIV', className:this.loadMaskCS});
		}
		
		if(this.mask && !this.maskDisabled){
			this.target.wrapper.append(this.mask).unfly();
		}
		
/**
 * @name CC.ui.Loading#loadMsgDisabled
 * @property {Boolean} [loadMsgDisabled=false] 是否禁用消息提示
 */
		if(!this.loadMsgDisabled)
			this.target.wrapper.append(this);
	},
/**
 * 停止加载提示
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
	},
/**
 * 目标是否正在加载中
 */
	isBusy : function(){
		return this.target.busy;
	},
/**
 * 目标是否已成功加载
 */
	isLoaded : function(){
		return this.target.loaded;
	}
});

CC.ui.def('loading', CC.ui.Loading);
})();

//~@ui/ct.js
(function () {

var CC = window.CC;
var Base = CC.Base;
var cptx = Base.prototype;
var UX = CC.ui;
/**
 * @name CC.layout
 * @namespace 容器类布局管理器
 */
if(!CC.layout)
	CC.layout = {};

/**
 * @name CC.layout.def
 * @function
 */
CC.layout.def = function(type, cls){
	this[type] = cls;
	return this;
};
 
 /**
 * @name CC.ui.Item
 * @class
 * @extends CC.Base
 */ 
 CC.create('CC.ui.Item', Base, {});
 CC.ui.def('item', CC.ui.Item);
/**
 * @name CC.layout.Layout
 * @class 布局管理器基类
 */
CC.create('CC.layout.Layout', null, 
/**@lends CC.layout.Layout.prototype*/ {
        /**
         * 布局管理器对应的容器类
         * @property {CC.Base} ct
         */
        ct: null,
/**
 * 如果每次布局都涉及所有容器子项,则该值应设为true,以便于当容器子项变更(add, remove, display)时重新布局容器
 */
        layoutOnChange : false,
        
/**
 * @property {Boolean} deffer
 * 延迟多少毫秒后再布局,有利于提高用户体验,
 * 但注意访问同步,例如容器子项在布局时才渲染,
 * 如果deffer已置,则子项渲染将会在JavaScript下一周期调用.
 */
        deffer : false,
        
        /**
         * 初始化布局
         * @param {Object} opt 布局配置信息
         */
        initialize: function(opt){
            if (opt) 
                CC.extend(this, opt);
            var ct = CC.delAttr(this, 'ct');
            if(ct)
            	this.attach(ct);
            
            if(this.items){
            	for(var i=0, its = this.items,len=its.length;i<len;i++){
            		this.add(UX.instance(its[i]));
            	}
            }
        },
        
        /**
         * 容器在添加子项前被调用。
         * @param {CC.Base} comp 子项
         * @param {Object} cfg 子项用布局的配置信息
         * @function
         */
        beforeAdd: fGo,
/**
 * @name CC.Base#layoutInf
 * @property {Object} layoutInf 布局配置数据,
    如果控件被布局管理器所管理,
    其布局相关的配置信息将存放在component.layoutInf,
    要访问子项当前布局信息,可通过layout.cfgFrom(component)方法获得.
 * @protected
 * @see #cfgFrom
 * @example
   var ct = ct;
   var borderLayoutInformation = item.layoutInf;
 */
         
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
        	//添加到容器
        	this.ct.add(comp);
          var cc = comp.layoutInf;
          if (!cc)
          	comp.layoutInf = cc = cfg || {};
          else if(cfg)
          	CC.extend(cc, cfg);
          this.beforeAdd(comp, cc);
/**
 * @name CC.layout.Layout#itemCS
 * @property {String} itemCS 将子项被加进容器时添加到子项的CSS样式
 */
          if(this.itemCS)
          	comp.addClassIf(this.itemCS);

				  if(this.isUp()){
            if (!comp.rendered)
            	comp.render();
            	
            if(this.layoutOnChange)
            	this.doLayout();
            else this.layoutChild(comp); //子项布局后再渲染
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
 * 从布局移除指定组件,同时也从容器移除该组件,并删除组件布局信息layoutInf
 * 如果layoutOnChange为true则重新布局容器
 */
        remove : function(c){
        	this.ct.remove(c);
        	delete c.layoutInf;
          if(this.layoutOnChange)
          	this.doLayout();
        },
/**
 * 显示/隐藏子项,如果layoutOnChange为true则重新布局容器
 */
        display : function(c, b){
        	c.display(b);
          if(this.layoutOnChange)
           	this.doLayout();
        },

/**
 * @name CC.layout.Layout#invalidate
 * @property {Boolean} [invalidate=false] 指示当引发布局时是否执行布局,如大量引发重复布局的操作可先设置invalidate=true,执行完后再设置invalidate=false,再调用{@link #doLayout}布局.
 * 容器类不必直接设置该属性,可调用{@link CC.ui.ContainerBase#validate}和{@link CC.ui.ContainerBase#invalidate}方法设置.
 */
      
/**
 * 执行布局,要重写布局应重写onLayout方法.
 */
        doLayout: function(){
        	if(this.isUp()){
						//不可见时并不立即布局容器,而是待显示时再布局
						//参见ct.display
						if(this.ct.hidden){
							if(__debug) console.log(this,'容器处于隐藏状态,未立即布局..');
/**
 * @name CC.layout.Layout#defferArgs
 * @property {Array} defferArgs 延迟布局中寄存的布局方法参数
 * @private
 */
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
 * @param {CC.Base} item
 * @return {Object} 控件当前布局相关的属性配置信息
 * @example
   var item = ct.$(0);
   var layout = ct.layout;
   var cfg = layout.cfgFrom(item);
   
   if(cfg.collapsed) {
   	//...
   }
 */
        cfgFrom : function(item) {
        	return item.layoutInf || {};
        },

        insert : function(comp){
            if (this.layoutOnChange) 
                 this.doLayout.bind(this).timeout(0);
        },
        
        /**
         * 如没有针对单个控件布局的可直接忽略.
         * @protected
         * @param {CC.Base} comp
         * @param {Object} cfg
         */
        layoutChild: fGo,
        /**
         * 除移子项时调用并重新布局。
         * 如果layoutOnChange设置为false时不调用。
         */
        remove: function(comp){
            if (this.layoutOnChange) 
                this.doLayout.bind(this).timeout(0);
        },
        
        /**
         * 将布局管理器应用到一个容器控件中。
         * @param {Object} ct
         */
        attach: function(ct){
            this.ct = ct;
            if(ct.deffer !== undefined)
            	this.deffer = ct.deffer;
/**
 * @name CC.layout.Layout#ctCS
 * @property {String} ctCS 初始化时添加到容器的样式 
 */
            if (this.ctCS) 
                ct.addClass(this.ctCS);
/**
 * @name CC.layout.Layout#wrCS
 * @property {String} wrCS 初始化时添加到容器ct.wrapper的样式 
 */
            if(this.wrCS)
            	ct.wrapper.addClass(this.wrCS);
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

var lyx = CC.layout.Layout;

/**
 * @name CC.layout.default
 * @Layout
 */
CC.layout.def('default', lyx);
//
// WrapPanel模板, 设置wrap结点的padding,border而不会影响到panel层的宽高的计算,
// 可绕过浏览器对BoxModel解析的不同
//
CC.Tpl.def( 'CC.ui.Panel', '<div class="g-panel"></div>')
      .def( 'CC.ui.WrapPanel', '<div class="g-panel"><div class="g-panel-wrap" id="_wrap"></div></div>');

/**
 * 容器类控件,容器是基类的扩展,可包含多个子组件,
 * 子组件也可是一个容器,形成了组件树
 * @name CC.ui.ContainerBase
 * @class 容器基类
 * @extends CC.Base
 */
CC.create('CC.ui.ContainerBase', Base,
/**@lends CC.ui.ContainerBase.prototype*/
{

  /**
 * @property {Array} children 容器子控件存放处
 * @readonly
 */
  children: null,
/**
 * @property {Boolean} [eventable=true] 可处理事件,即可通过on方法监听容器事件
 * @readonly
 * @example
 	 ct.on('resized', function(){
 	   //...
 	 });
 */
  eventable: true,

  /**
 * @property {DOMElement|String} ct 容器子控件dom结点所在的父结点,可在初始化时指定
 */
  ct: null,

  minH: 0,

  minW: 0,

  maxH: 65535,

  maxW: 65535,
 /**
 * @property {Base} [ItemClass=CC.ui.Item] 容器子控件类, fromArray方法根据该子项类实例化子项
 * @see #fromArray
 */
  ItemClass: CC.ui.Item,
  /**
 * @property {Boolean} [autoRender=false] 容器子控件类
 */
  autoRender: false,

/**
 * @property {Boolean|CC.util.SelectionProvider} 是否对容器应用子项选择功能
 */
  selectionProvider : false,
  
  initComponent: function() {
    cptx.initComponent.call(this);

    /**
 * @name CC.ui.ContainerBase#keyEvent
 * @property {Boolean} keyEvent 是否开启键盘监听事件
 */
    if (this.keyEvent) 
      this.bindKeyInstaller();
      
    /**
 * @name CC.ui.ContainerBase#useContainerMonitor
 * @property {Boolean} useContainerMonitor 是否在容器层上处理子项DOM事件
 */
 
/**
 * @name CC.ui.ContainerBase#cancelClickBubble
 * @property {Boolean|String} [cancelClickBubble=false] 是否停止容器clickEvent事件的DOM触发事件冒泡
 */
    /**
 * @name CC.ui.ContainerBase#clickEvent
 * @property {Boolean|String} clickEvent 设置子项单击事件,如果为true,默认事件为mousedown 
 */
    if (this.useContainerMonitor && this.clickEvent) {
      this.itemAction(this.clickEvent === true ? 'mousedown': this.clickEvent, this.ctClickTrigger, this.cancelClickBubble);
    }
    
    if(this.selectionProvider === true)
    	this.getSelectionProvider();

    if(this.connectionProvider === true)
    	this.getConnectionProvider();
    
    this.children = [];
    
    if (this.layout) {
      /**
 * @name CC.ui.ContainerBase#layout
 * @property {Layout|String} [layout='default'] 容器布局管理器
 */
      if (typeof this.layout === 'string') {
/**
 * @name CC.ui.ContainerBase#layoutCfg
 * @property {Object} layoutCfg 布局管理器初始化配置
 */
        var cfg = this.layoutCfg || {};
        cfg.ct = this;
        this.layout = new(CC.layout[this.layout])(cfg);
        if (this.layoutCfg) delete this.layoutCfg;
      }
      else this.layout.attach(this);
    }
    else this.layout = new lyx({ ct: this });
  },
/**
 * 创建容器的DOM结点
 */
  createView: function() {
    cptx.createView.call(this);
    if (!this.ct) this.ct = this.view;
    
    //apply ct
    else if (typeof this.ct === 'string')
      this.ct = this.dom(this.ct);
    
    //再一次检测
    if (!this.ct)
    	this.ct = this.view;
    
    this.wrapper = this.ct == this.view ? this: this.$$(this.ct);
  },

  destory: function() {
		cptx.destory.call(this);
    //clear the binded action of this ct component.
    this.destoryed = true;
    var cs = this.bndActs, n;
    if (cs) {
      while (cs.length > 0) {
        n = cs[0];
        this.unEvent(n[0], n[2], n[3]);
        cs.remove(0);
      }
    }
    this.destoryChildren();
    this.layout.detach();
    this.ct = null;
    this.wrapper = null;
  },
/**
 * 此时调用fromArray(array)加入子项,当onRender后布局容器.
 * @override
 */
  onRender: function() {

/**
 * @name CC.ui.ContainerBase#array
 * @property {Array} array 子项数据初始化组数
 * @see #fromArray
 */
    if (this.array) {
      this.fromArray(this.array);
      delete this.array;
    }
    
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
    this.ct.removeChild(dom);
  },

/** 
 * 向容器中添加一个控件,默认如果容器已渲染,加入的子项将立即渲染,
 * 除非传入的第二个参数为true,指示未好渲染子项.
 * 布局管理就这样做,向容器加入后并未渲染子项,等待子项布局好后再渲染.
 * 控件即是本包中已实现的控件,具有基本的view属性.
 * 如果要批量加入子项,请调用fromArray方法.
 * @param {Base} a 子项
 */
  add: function(a, notRender) {
/**
 * 添加前发送
 * @name CC.ui.ContainerBase#beforeadd
 * @event
 * @param {CC.Base} component
 */
      if(this.fire('beforeadd', a) !== false && this.beforeAdd(a) !== false){
      	this.children.push(a);
	      //默认子项结点将调用_addNode方法将加到容器中.
	      this._addNode(a.view);
	      //建立子项到容器引用.
	      a.pCt = this;
	      
	      //默认如果容器已渲染,加入的子项将立即渲染
	      if(!notRender && this.rendered && !a.rendered){
	      	a.render();
	      }
/**
 * 添加后发出
 * @name CC.ui.ContainerBase#add
 * @event
 * @param {CC.Base} component
 */
        this.fire('add', a);
      }
    return this;
  },
  
  beforeAdd : function(a){
			if (a.pCt)
      	a.pCt.remove(a);
      //在useContainerMonitor为false时,是否允许子项点击事件,并且是否由子项自身触发.
      if (!this.useContainerMonitor && this.clickEvent && !a.__click) {
        var bnd = a.__click = this.clickEventTrigger;
        var clickProxy = this.clickEventNode ? a.dom(this.clickEventNode) : a.view;
        a.domEvent(this.clickEvent === true ? 'mousedown': this.clickEvent, bnd, this.cancelClickBubble, null, clickProxy);
      }
  },
  
/**
 * @private
 */
  ctClickTrigger: function(item, evt) {
    if (!item.disabled && !item.clickDisabled)
    	this.fire('itemclick', item, evt);
  },

/**
 * 子项点击事件回调,发送clickEvent事件.
 * @private
 */
  clickEventTrigger: function(event) {
    var p = this.pCt;
    if (!this.clickDisabled) p.fire('itemclick', this, event);
  },

/**
 * 移除前发送
 * @name CC.ui.ContainerBase#beforeremove
 * @event
 * @param {CC.Base} component
 */
 
/**
 * 移除后发送
 * @name CC.ui.ContainerBase#remove
 * @event
 * @param {CC.Base} component
 */
 
/**
 * 从容器移出但不销毁子项,移除的子项也包括托管的子控件.
 * 如果容器子项由布局管理器布局,在调用该方法后用
 * ct.doLayout重新布局, 或直接由ct.layout.remove(component)移除子项.
 * @param {String|CC.Base} 可为控件实例或控件ID
 */
  remove: function(a){
    a = this.$(a);
    if(a.delegated) {
	      this.__delegations.remove(a);
	      if(a.view.parentNode)
	      	a.view.parentNode.removeChild(a.view);
	  }
	  
	/**
	 * 移除子项前发出
	 * @name CC.ui.ContainerBase#beforeremove
	 * @event
	 * @param {CC.Base} item
	 */
    else if(this.fire('beforeremove', a)!==false && this.beforeRemove(a) !== false){
      a.pCt = null;
	    this.children.remove(a);
		  this._removeNode(a.view);
	/**
	 * 移除子项后发出
	 * @name CC.ui.ContainerBase#removed
	 * @event
	 * @param {CC.Base} item
	 */
		    this.fire('remove', a);
	  }
    return this;
  },
  
  beforeRemove : fGo,
  
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
    while (chs.length > 0) {
      it = chs[0];
      this.remove(it);
      it.destory();
    }
    
    if (!this.destoryed) this.validate();
  },

  /**
     * 根据控件ID或控件自身或控件所在数组下标安全返回容器中该控件对象.
     * <li>id为控件id,即字符串格式,返回id对应的子项,无则返回null
     * <li>id为数字格式,返回数字下标对应子项,无则返回null
     * <li>id为子项,直接返回该子项
     * @param {CC.Base|String|Number} id 子控件
     */
  $: function(id) {
    if (id === null || id === undefined || id === false) {
      return null;
    }

    //dom node
    if (id.tagName) {
      var chs = this.children,
      v, bdy = this.view,
      d;
      for (var i = 0, len = chs.length; i < len; i++) {
        d = id;
        v = chs[i].view;
        if (v == d) return chs[i];
        d = d.parentNode;
        while (d !== bdy && d !== null) {
          if (d === v) return chs[i];
          d = d.parentNode;
        }
      }
      return null;
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

  display: function(b) {
    if (b === undefined) return cptx.display.call(this);
    var h = this.hidden;

    cptx.display.call(this, b);

    if (b && h) {
      var ly = this.layout;
      if (!ly.defferArgs) return this;
      if (__debug) console.log(this, '容局显示时布局..', ly.defferArgs);
      ly.doLayout.apply(ly, ly.defferArgs);
      //重置标记
      ly.defferArgs = false;
    }

    //display shadow after layout
    if (this.shadow) {
      var tmp = this.shadow;
      if (b) { (function() {
          tmp.reanchor().display(true);
        }).timeout(0);
      } else tmp.display(b);
    }
    return this;
  },

  /**
 * 返回窗口中控件的索引.
 * @param {String|CC.Base} 参数a可为控件实例或控件ID
 */
  indexOf: function(a) {
    a = this.$(a);
    return ! a ? -1 : this.children.indexOf(a);
  },
  /**
 * 获得子项数量
 * @return {Number}
 */
  size: function() {
    return this.children.length;
  },
  /**
 * 容器是否包含给出控件.
 * @param {String|CC.Base} 参数a可为控件实例或控件ID
 * @return {Boolean}
 */
  contains: function(a) {
    if (!a.type) {
      a = this.$(a);
    }
    return a.pCt === this;
  },

  /**
 * 子项b之前插入项a.
 * @param {CC.Base} a
 * @param {CC.Base} a
 */
  insertBefore: function(a, b) {
    var idx = this.indexOf(b);
    this.insert(idx, a);
  },

  /**
     * 方法与_addNode保持一致,定义DOM结点在容器结点中的位置.
     * @param {DOMElement} n
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
    
    //本身已容器内部,Remove后调整位置
    if(item.pCt === this && this.indexOf(item)<idx)
    	idx --;
    
    if(this.fire('beforeadd', item) !== false && this.beforeAdd(item) !== false){
    	item.pCt = this;
    	this.children.insert(idx, item);
    	var nxt = this.children[idx+1];
			if (nxt) 
			   this._insertBefore(item.view, nxt.view);
			else this._addNode(item.view);
		  this.fire('add', item);
		  //this.layout.insertComponent.apply(this.layout, arguments);
    }
    return this;
  },
  
  
  /**
 * 同{@link #removeAll}
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
 * @return this
 */
  swap: function(a1, a2) {
    var ch = this.children;
    var idx1 = this.indexOf(a1);
    var idx2 = this.indexOf(a2);
    a1 = this.children[idx1];
    a2 = this.children[idx2];
    ch[idx1] = a2;
    ch[idx2] = a1;

    var n1 = a1.view;
    var n2 = a2.view;

    if (n1.swapNode) {
      n1.swapNode(n2);
    }
    else {
      var p = n2.parentNode;
      var s = n2.nextSibling;

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
    this.sorted = true;
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
 * @param {Object} 调用matcher的this
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
 * 根据控件某个属性值来过滤子项.
 * @param {Function} callback 符合条件后的回调,传递当前子项作参数
 * @param {String} attrName 属性名
 * @param {Object} attrV 测试的属性值
 * @param {Boolean} [strictEq=false] 是否使用绝对等比较方式
 * @return this
 */
  filterBy: function(callback, attrName, attrV, strictEq) {
    var chs = this.children,
    len = this.children.length,
    i = 0,
    it, useEq = strictEq || false,
    rt, v;
    for (; i < len; i++) {
      it = chs[i];
      if (useEq) {
        if (it[attrName] === attrV) rt = callback.call(it);
      }
      else {
        v = it[attrName] || false;
        if (v == attrV) rt = callback.call(it);
      }
      if (rt === false) break;
    }
    return this;
  },
/**
 * 枚举子项, 如果回调函数返回false,则终止枚举.
 * @param {Function} callback 回调,传递参数为 callback(item, i)
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
 * 子类寻找优先级为 :
 * {item option}.ctype -> 参数itemclass -> 容器.ItemClass,
 * 容器的ItemClass可以为ctype字符串, 也可以为具体类
 * @param {Array} array 子项实始化配置
 * @param {CC.Base} [itemclass=this.ItemClass] 可选, 子类
 * @return this
 */
  fromArray: function(array, itemclass) {
    itemclass = itemclass || this.ItemClass;
    if (typeof itemclass === 'string') {
      itemclass = CC.ui.ctypes[itemclass];
    }

/**
 * @name CC.ui.ContainerBase#itemCfg
 * @property {Object} 用于批量添加子项{@link #fromArray}时子项的配置
 */
    var item, itemOpts = this.itemCfg || false;

    for (var i = 0, len = array.length; i < len; i++) {
      item = array[i];
      if (!item.cacheId) {
        if (itemOpts) 
        	CC.extendIf(item, itemOpts);
        
        item = item.ctype ? CC.ui.instance(item) : new(itemclass)(item);
        
        //层层生成子项
        if (item.array && item.children) {
          item.fromArray(item.array);
          delete item.array;
        }
      }
      this.add(item);
    }
    return this;
  },
  
/**
 * @param {String} eventName
 * @param {Function} callback
 * @param {Boolean} cancelBubble
 * @param {Object} scope
 * @param {String|HTMLElement} childId
 * @param {String} srcName
 * @return this
 */
  itemAction: function(eventName, callback, cancelBubble, caller, childId, srcName) {
    var act = (function(event) {
      var el = event.target || event.srcElement;
      
      if((srcName === undefined || el.tagName === srcName) && el !== this.view){
					var item = this.$(el);
      		if (item)
        		return item.disabled ? false : callback.call(this, item, event);
      }
   });
    if (!this.bndActs) {
      this.bndActs = [];
    }
    this.bndActs.push([eventName, callback, act]);
    this.domEvent(eventName, act, cancelBubble, caller, childId);
    return this;
  },
/**
 *
 */
  unItemAction: function(eventName, callback, childId) {
    var bnds = this.bndActs;
    childId = childId !== undefined ? childId.tagName ? childId: this.dom(childId) : this.view;
    for (var i = 0, len = bnds.length; i < len; i++) {
      var n = bnds[i];
      if (n[0] == eventName && n[1] == callback(n[3] == childId || n[3] === undefined)) {
        this.unEvent(eventName, n[2], n[3]);
        bnds.remove(i);
        return this;
      }
    }

    return this;
  },
/**
 * @property {Boolean|String} keyEvent
 * 用于监听键盘按键的事件名称,如果该值在容器初始化时已设置,
 * 可监听容器发出的keydown事件
 * @example 
   var ct = new CC.ui.ContainerBase({keyEvent:true});
   ct.on('keydown', function(event){
   		this....
   });
 */
/**
 * @name CC.ui.ContainerBase#keydown
 * @event
 * 如果已安装键盘监听器,键盘按键触发时发送该事件
 * @param {DOMEvent} e
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

/**@private*/
  _onKeyPress: function(e) {
    if (!this.disabled && this.fire('keydown', e) !== false)
    	this.onKeyPressing(e);
  },
/**
 * 在处理完keydown事件后默认调用的回调函数,
 * 这是一个接口函数,默认为空函数,如果不想通过ct.on方式监听,
 * 可通过重写该方法快速处理按键事件
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
   * 布局当前容器,如果当前容器正处于布局变更中,并不执行布局
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
		 * @function
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
 * 根据ID深层遍历寻找子控件.
 * @param {String} childId
 * @return {CC.Base} 如无返回null
 */
		byId : function(cid){
			var tmp = [], chs = this.children, child = this.children[0];
			var k=0;
			while(child){
				if(child.id === cid)
					return child;
				
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
			return null;
		},
/**
 * 获得容器的滚动条所在控件,返回this.scrollor || this.wrapper,
 * 明确容器的scrollor有利于控制容器内容的滚动,
 * 在设计控件时可根据控件自身结构特点指定scrollor.
 */
		getScrollor : function(){
			return this.scrollor || this.wrapper;
		}
});

var ccx = CC.ui.ContainerBase;

UX.def('ct', ccx);

var ccxp = ccx.prototype;
var Event = CC.Event;


//~@base/connectionprovider.js
/**
 * 为控件提供数据加载功能
 * 这个类主要用于桥接CC.Ajax与CC.ui.ContainerBase
 */
CC.create('CC.util.ConnectionProvider', null, /**@lends CC.util.ConnectionProvider.prototype*/ {
/**
 * 是否禁用指示器,默认false 
 */
	indicatorDisabled : false,
/**
 * 连接器设置,连接器保存当前默认的连接器connector配置信息,
 * 每次连接时都以该配置信息与新的配置结合发出连接.
 * @example
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
 */
  ajaxCfg : null,

/**@private*/
	initialize : function(t, cfg) {
		if(t)
			this.setTarget(t);
		if(cfg)
			CC.extend(this, cfg);
		this.initConnection();
	},
	
	initConnection : function(){
		if(this.ajaxCfg && this.ajaxCfg.url)
			this.connect();
	},
/**
 * 设置目标控件
 */	
	setTarget : function(t){
		this.t = t;
	},
/**
 * @name CC.util.ConnectionProvider#loadType
 * @property {String} loadType 
 * 指明返回数据的类型,成功加载数据后默认的处理函数将根据该类型执行
 * 相应的操作,被支持的类型有如下两种
 * <li>html,返回的HTML将被加载到target.wrapper中
 * <li>json,返回的数据转换成json,并通过target.fromArray加载子项
 * 如果未指定,按json类型处理
 * @see #defaultLoadSuccess
 */
/**
 * 成功返回后执行,默认是根据返回数据类型(loadType)执行相应操作,
 * 如果要自定义处理返回的数据,可定义在连接时传递success方法或重写本方法
 * @param {CC.Ajax} j
 * @see #loadType
 * @example
   var ct = new CC.ui.ContainerBase({
   	connectionCfg : {loadType:'json'}
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
 */
	defaultLoadSuccess : function(j){
    switch(this.loadType){
      case 'html' :
      	this.t.wrapper.html(j.getText(), true);
      	break;
      default : 
    		var json = j.getJson();
    		this.t.fromArray(json);
    		break;
    }
	},

/**
 * 获得连接指示器
 * Loading类寻找路径 this.indicatorCls -> target ct.indicatorCls -> CC.ui.Loading
 */
	getIndicator : function(opt){
  	if(this.indicator)
  		return this.indicator;
  	
  	var cls = this.indicatorCls   ||
  	          this.t.indicatorCls ||
  	          CC.ui.Loading;

    var cfg = {
    	target: this.t,
      targetLoadCS: this.loadCS
    };
    if (opt !== undefined)
    	opt = CC.extend(cfg, opt);
    
    var it = this.indicator = new cls(cfg);
    this.t.follow(it);
    return it;
	},
/**
 * 连接服务器, success操作如果未在配置中指定,默认调用当前ConnectionProvider类的defaultLoadSuccess方法
 * 如果当前未指定提示器,调用getIndicator方法实例化一个提示器;
 * 如果上一个正求正忙,终止上一个请求再连接;
 * 当前绑定容器将订阅请求过程中用到的Ajax类的所有消息;
 * indicator cfg 配置信息从 this.indicatorCfg -> target ct.indicatorCfg获得
 * @param {String} url, 未指定时用this.url
 * @param {Object} cfg 配置Ajax类的配置信息, 参考信息:cfg.url = url, cfg.caller = this
 */
	connect : function(url, cfg){
    var afg = this.ajaxCfg;
    if(!afg)
    	afg = {};
    if(url)
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
 * @name CC.util.ConnectionProvider#indicatorCfg
 * @property {Object} indicatorCfg
 */
    if (!this.indicatorDisabled && !this.indicator)
      this.getIndicator(this.indicatorCfg || this.t.indicatorCfg);
    
    this.bindConnector(afg);
    return this;
	},
  
/**
 * 获得连接器,该连接器只提供数据加载功能,默认用CC.Ajax类作为连接器.
 * @return {CC.Ajax}
 */
  getConnector : function(){
    return this.connector;
  }, 
  
/**
 * 绑定连接器
 * 连接器接口为
  <pre> 
  function(config){
    //终止当前连接
    abort : fGo,
    //订阅连接事件
    to : fGo(subsciber),
    //连接
    connect : fGo
  }
  </pre>
 * @protected
 */
	bindConnector : function(cfg){
		
		if(this.indicator.isBusy())
    	this.getConnector().abort();
    
		a = this.connector =  this.createConnector(cfg);
    a.to(this.t);
    a.connect();
	},
/**
 * 创建并返回连接器
 * @protected
 */
	createConnector : function(cfg){
		return new CC.Ajax(cfg);
	}
});

/**
 * 获得容器连接器.
 * 如果未指定容器的连接器,可通过传过参数cls指定连接器类,
 * 用于实例化的连接器类搜寻过程为 cls -> ct.connectionCls -> CC.util.ConnectionProvider;
 * 连接器配置信息可存放在ct.connectionCfg中, 连接器实例化后将移除该属性;
 * 生成连接器后可直接通过ct.connectionProvider访问连接器;
 * @param {CC.util.ConnectionProvider} [cls] 使用指定连接器类初始化
 */
CC.ui.ContainerBase.prototype.getConnectionProvider = function(cls){
	var p = this.connectionProvider;
	if(p === true){
		p = this.connectionProvider = new (cls || this.connectionCls || CC.util.ConnectionProvider)(this, this.connectionCfg);
		if(this.connectionCfg)
			delete this.connectionCfg;
	}
	return p;
};

//~@base/selectionprovider.js
/**
 * 为容器提供子项选择功能,子项是否选择的检测是一个 -- 由子项样式状态作向导的实时检测.
 * @name CC.util.SelectionProvider
 * @class
 */
 
CC.create('CC.util.SelectionProvider', null, function(){
	
	var Event = CC.Event;
	
	var trackerOpt = { isValid : 	function (item){
		return !item.hidden && !item.disabled;
	}};
	
	return /**@lends CC.util.SelectionProvider.prototype*/{
/**
 * 当前选择模式(单选,多选),默认单选
 */
	mode : 1,
  
  tracker : false,
  
  UP : Event.UP,
  
  DOWN : Event.DOWN,

  selectedIndex : -1,
/**
 * 子项选择后是否滚动到容器可视范围内,默认为true
 */
  autoscroll : true,
/**
 * 选择后是否聚焦,默认为true
 */
 autoFocus : true,
/**
 * @property {String} selectedCS 子项选择时子项样式
 */
  selectedCS: 'selected',
        
/**
 * 允许选择
 */
	unselectable : false,

	initialize : function(t, cfg){
		if(t)
			this.setTarget(t);
		
		if(cfg)
			CC.extend(this, cfg);
		
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
 
 setTarget : function(t){
 	this.t = t;
 	this.t.on('itemclick', this.itemSelectionTrigger, this);
 	this.t.on('keydown',   this.navigateKey, this);
 	this.t.on('remove',   this.onItemRemoved, this);
 },
 
 setSelected : function(item, b){
 	if(b)
 		this.select(item);
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
 		  this.select(it, e);
 	  else this.setSelected(it, !this.isSelected(it), e);
 	}
 },

/**
 * 当子项移除时提示选择器更新状态
 * @protected
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

/**@protected*/
 defKeyNav : fGo,
 
/**
 * @name CC.util.SelectionProvider#t
 * @property {ContainerBase} t target目标容器
 * @protected
 */

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
 	if(s){
		if( b && !item.hasClass(s))
				item.addClass(s);
		else item.delClass(s);
	}
 },
 
/**
 * 选择某子项
 * @param {CC.Base} item
 * @param {Boolean} b
 */
 select : function(item, e){
 	
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
 * 选择前发出,为空选时不发出
 * @name CC.ui.ContainerBase#select
 * @event
 * @param {CC.Base} item
 * @param {Boolean}  b
 */
 

/**
 * 选择后发出,为空选时不发出
 * @name CC.ui.ContainerBase#selected
 * @event
 * @param {CC.Base} item
 * @param {CC.util.SelectionProvider} selectionProvider
 * @param {DomEvent} event 如果该选择事件由DOM事件触发,传递event
 */
		//fire selectchange
/**
 * 选择后发出,为空选时不发出
 * @name CC.util.SelectionProvider#forceSelect
 * @property {Boolean} [forceSelect=false] 强制发送select事件,即使当前子项已被选中
 */
 	if((this.forceSelect || !this.isSelected(item))
		  && this.t.fire('select', item, this, e) !== false){
		this.onSelectChanged(item, true, e);
		this.onSelect(item, e);
		this.t.fire('selected', item, this, e);
	}
	return this;
 },

 unselect : function(item){
 	item = this.t.$(item);
 	this.onSelectChanged(item, false);
 	return this;
 },
/**
 * @name CC.ui.Item#onselect 子项被选择时调用
 * @property {Function} onselect
 */
 onSelect : function(item) {
  if(this.autoFocus)
   this.t.wrapper.focus();
   
	if(this.autoscroll)
			item.scrollIntoView(this.t.getScrollor());
  item.onselect && item.onselect();
 },

/**
 * @name CC.util.SelectionProvider#selected 当前被选择子项,如果多选模式,最后一个被选中选项
 * @property {CC.Base} selected
 */

/**
 * @name CC.util.SelectionProvider#previous 前一个被选择子项
 * @property {CC.Base} previous
 */

/**
 * 选择变更时发出,包括空选择
 * @name CC.ui.ContainerBase#selected
 * @event
 * @param {CC.Base} item
 * @param {CC.Base}  pre
 * @param {CC.util.SelectionProvider} provider
 */
/**@protected*/
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
 	if(__debug){ 	console.group("selectchanged data"); console.log('当前选择:',this.selected);console.log('前一个选择:',this.previous); console.groupEnd();}
 },
 
/**
 * 测试选择项状态是否改变
 */
 hasChanged : function(item, b){
 	return !((item === this.selected) && b) || !(item && this.isSelected(item) === b);
 },
 
/**
 * 测试某子项是否已被选择
 * @param item
 * @return {Boolean}
 */
 isSelected : function(item){
 	return item.hasClass(this.selectedCS);
 },

/**
 * 容器是否可选择
 * @return {Boolean}
 */
 isSelectable : function(){
 	return !this.unselectable;
 },
/**
 * 容器是否可选择
 */
 setSelectable : function(b){
 	this.unselectable = !b;
 },

/**
 * 检测item是否能作为下一个选择项
 * @return {Boolean}
 */
 canNext : function(item){
 	return !item.disabled && !item.hidden;
 },
 
/**
 * 检测item是否能作为上一个选择项
 * @return {Boolean}
 */
 canPre : function(item){
  return !item.disabled && !item.hidden;
 },
 
 /**
  * @protected
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
 
/**@protected*/
 selectAllInner : function(b){
 	var s = this;
 	this.t.each(function(){
 	  s.setSelected(this, b);
 	});
 },
 
/**
 * 全选/全不选
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
 selectOpp : function(b) {
 	var s = this;
 	this.t.each(function(){
 		s.setSelected(this, !s.isSelected(this));
 	});
 }

  }
});


/**
 * 获得容器选择器,如果未设置,默认创建一个
 * @name CC.ui.ContainerBase.#getSelectionProvider
 * @function
 * @param {CC.util.SelectionProvider} providerClass
 * @return {CC.util.SelectionProvider}
 */
CC.ui.ContainerBase.prototype.getSelectionProvider = function(opt, cls){
	var p = this.selectionProvider;
	if(!p || p === true){
		
		if(this.keyEvent === undefined)
	  	this.bindKeyInstaller();
	  	
		p = this.selectionProvider = new (cls||this.selectionCls||CC.util.SelectionProvider)(this, CC.extendIf(opt, this.selectionCfg));
		if(this.selectionCfg)
			delete this.selectionCfg;
	}
	return p;
};

//~@base/Tracker.js
/**
 * 状态变更跟踪器
 */
CC.create('CC.util.Tracker', null, {
	/**历史记录最大条数*/
	max : 20,
	
	initialize : function(opt){
		this.area = [];
		if(opt)
			CC.extend(this, opt);
	},
	
/**记录数据*/
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
 * 测试当前记录数据是可用
 * @param data
 * @type function
 */
	isValid : fGo,

/**
 * isValid的this对象
 */
	validCaller : null,
	
/**
 * 弹出最近记录的数据
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
 * 移除指定记录数据
 */
	remove : function(data){
		this.area.remove(data);
	},
	
/**当前记录数据大小*/
	size : function() {return this.area.length;}
});

/**
 * @name CC.ui.Panel#resized
 * @event
 * @param {Number} contentWidth Wrapper宽度,即内容宽度
 * @param {Number} contentHeight Wrapper高度,即内容高度
 * @param {Number} panelWidth 容器宽度
 * @param {Number} panelHeight 容器高度
 */
 
/**
 * @name CC.ui.Panel
 * @class 面板
 */
CC.create('CC.ui.Panel', ccx, function(superclass){
 return /**@lends CC.ui.Panel.prototype*/{
	
        ct: '_wrap',
        
        deffer : 0,
        
        initComponent: function(){
            var w = false, h = false;
            if (this.width !== false) {
                w = this.width;
                this.width = false;
            }
            
            if (this.height !== false) {
                h = this.height;
                this.height = false;
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
        },
        //
        // 得到容器距离边框矩形宽高.
        // 该值应与控件CSS中设置保持一致,
        // 用于在控件setSize中计算客户区宽高,并不设置容器的坐标(Left, Top).
        //
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
 * @param {Boolean} uncheck 性能优化项,是否比较宽高,如果宽高未变,则直接返回
 * @override 计算容器和Wrapper或内容合适的宽高.
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
              w = this.width;
              h = this.height;
					    
					    var wr = this.wrapper, spaces,cw, ch;
            	//如果wrapper非容器结点
            	if(wr.view !== this.view){
            		spaces = this.getWrapperInsets();
                cw = Math.max(this.width - spaces[5], 0);
                ch = Math.max(this.height - spaces[4], 0);
            		this.wrapper.setSize(cw, ch);
            	}else {
            		//容器自身结点,计算容器content size
            		cw = Math.max(this.width - this.getOuterW(true), 0);
            		ch = Math.max(this.height - this.getOuterH(true), 0);
            	}
            	this.fire('resized', cw, ch, w, h);
              this.doLayout(cw, ch, w, h);
            }
            return this;
        },
        
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

(function(cp){
  
  var borderOpts = {
  	insets : [1, 1, 1, 1],
  	template : 'WrapPanel',
  	ct : '_wrap',
  	inherentCS :'g-borderpanel',
  	wrapperCS :'g-borderpanel-wrap'
  };
  
/**
 * @name CC.ui.BorderPanel
 * @class
 */
	CC.ui.BorderPanel = function(opt, cls){
  	if(!opt)
  		opt = {};
  	CC.extendIf(opt, borderOpts);
  	var c = new (cls||cp)(opt);
  	if(!c.wrapper.hasClass(c.wrapperCS))
  		c.wrapper.addClass(c.wrapperCS);
  	return c;
  };

})(CC.ui.Panel);

UX.def('panel', CC.ui.Panel);
})();

//~@ui/viewport.js
/**
 * @class
 * @name Viewport
 */
CC.create('CC.ui.Viewport', CC.ui.Panel, /**@lends Viewport.prototype*/{
	
	bodyCS : 'g-viewport-body',

	cs : 'g-viewoport',
	
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
			this.setSize(vp);
	}
}
);

CC.ui.def('viewport', CC.ui.Viewport);

//~@ui/borderlayout.js
/**
 * 与Java swing中的BorderLayout具有相同效果.
 * 将容器内控件作为沿边框布局.
 */
/**
 * 类似Java Swing BorderLayout
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
  /**
   * @name CC.ui.BorderLayoutSpliter
   * @class
   */
  uix.BorderLayoutSpliter = CC.create(CC.Base, function(spr) {
  	
  	//ghost 初始坐标
  	var GIXY;
  	
    return /**@lends CC.ui.BorderLayoutSpliter.prototype*/{
    	
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
 */
      getRestrict: function() {
        var ly = this.layout, 
            wr = this.ct, 
            max, 
            min, 
            dir  = this.dir,
            comp = ly[dir],
            op, 
            cfg = comp.layoutInf,
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
	            cfg2 = op.layoutInf;
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
	            cfg2 = op.layoutInf;
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
	            cfg2 = op.layoutInf;
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
	            cfg2 = op.layoutInf;
	            
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
            cfg = c.layoutInf,
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
  
  /**
   * @name CC.ui.BorderLayoutCollapseBar
   * @class
   */  
  uix.BorderLayoutCollapseBar = CC.create(ccx,
   /**@lends CC.ui.BorderLayoutCollapseBar.prototype*/
   {
  	
		type : 'CC.ui.BorderLayoutCollapseBar',
		
		hidden : true,
		
		inherentCS:'g-layout-cbar',
		
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
				this.addClass(this.inherentCS+'-v');

			this.centerExpander = this.dom('_expander');

			this.navBlock = this.dom('_navblock');
			
			CC.fly(this.navBlock)
			  .addClass(this.navBlockCS[this.dir])
			  .unfly();

			this.domEvent('mousedown', this.onBarClick, true)
			    .domEvent('mousedown', this.onNavBlockClick, true, null, this.navBlock);
			
			this.sliperEl = CC.$C({tagName:'A', className:this.sliperCS,href:'javascript:fGo()'});
			this.comp.wrapper.append(this.sliperEl);
			this.comp.domEvent('mousedown', this.sliperAction, false, null, this.sliperEl);
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
		
		/**
		 * 收缩按钮点击
		 */
		onNavBlockClick : function(){
			var c = this.comp;
			if(c.contexted)
				c.releaseContext();
			this.itsLayout.collapse(c, false);
		},
		
		/**
		 * 使得面板浮动
		 */
		makeFloat : function(){
			var c = this.comp;
			c.addClass(this.compContextedCS)
			 .show();
			
			this.setCompContextedBounds();
			
			var xy = c.absoluteXY();
			c.appendTo(document.body)
			 .setXY(xy);
			
			this.getShadow().attach(c).display(true);
			
			var cfg = c.layoutInf;
			if(!cfg.cancelAutoHide){
				this.resetAutoHideTimer();
				cfg.autoHideTimer = this.onTimeout.bind(this).timeout(cfg.autoHideTimeout||5000);
			}
		},
		
		getShadow : function(){
			var sd = this.compShadow;
			if(!sd)
				sd = this.compShadow 
				   = uix.instance('shadow', {inpactH:9,inpactY:-2, inpactX : -4, inpactW:11});
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
			var cfg = this.comp.layoutInf;
			if(cfg.autoHideTimer){
				clearTimeout(cfg.autoHideTimer);
				delete cfg.autoHideTimer;
			}
		},
		
		/**
		 * 面板复原
		 */
		unFloat : function(){
			var c = this.comp,
			    cfg = c.layoutInf;

			if(cfg.autoHideTimer)
				this.resetAutoHideTimer();
				
			c.pCt._addNode(this.comp.view);
			c.delClass(this.compContextedCS);
			
			this.getShadow().detach();
		},
		
		/**
		 * 点击区域范围外时回调
		 */
		onCompReleaseContext : function(){
			var cfg = this.pCt.layout.cfgFrom(this);
			cfg.cbar.unFloat();
		},
		
		/**
		 * 侧边栏点击
		 */
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
		
		/**
		 * 设置浮动面板浮动开始前位置与宽高
		 */
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
  /**@lends CC.layout.BorderLayout.prototype*/
  {
    /**
     * 水平方向分隔条高度,利用面板布置设置可覆盖该值.
     */
    hgap: 5,
    /**
     * 垂直方向分隔条高度,利用面板布置设置可覆盖该值.
     */
    vgap: 5,
    /**
     * 侧边栏宽度.
     */
		cgap : 32,
		/**
		 *
		 */
		cpgap : 5,
    
    wrCS : 'g-borderlayout-ct',
    
    itemCS :'g-borderlayout-item',
    
    separatorVCS : 'g-ly-split-v',
    
    separatorHCS : 'g-ly-split-h',
        
    add: function(comp, dir) {
    	
      superclass.add.call(this, comp, dir);
      
      var d, s;
      
      if(!dir)
      	dir = comp.layoutInf;
      
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
    
    getCollapseBar : function(c){
    	var cfg,
    	    cg, 
    	    cbar,
    	    cfg = c.layoutInf,
          cbar = cfg.cbar;
      
      if(!cbar && !cfg.noSidebar){
	      cbar = cfg.cbar = new uix.BorderLayoutCollapseBar({dir:cfg.dir, comp:c, itsLayout:this});
	      cbar.addClass(cbar.inherentCS+'-'+cfg.dir)
	          .appendTo(this.ct.ct);
      }
      return cbar;
    },
    
    collapse : function(comp, b){
    	var cbar = this.getCollapseBar(comp),
    	    cfg = comp.layoutInf;
    	
    	cfg.collapsed = b;
    	if(cfg.separator)
    		cfg.separator.display(!b);
    	
    	if(comp.fold)
    		comp.fold(b, true);
    	
    	if(cbar)
    		cbar.display(b);
    	
    	comp.display(!b);
    	this.doLayout();
    },
    
    onLayout: function() {
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
        cfg = c.layoutInf;
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
        cfg = c.layoutInf;
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
        cfg = c.layoutInf;
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
      	cfg = c.layoutInf;
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
      
      CC.layout.Layout.prototype.onLayout.call(this);
    },

    remove: function(c) {
      var cfg = c.layoutInf;
      
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

//~@ui/mixedlayout.js
(function(){

var ly = CC.layout;
var B =  ly.Layout;
var superclass = B.prototype;
var Math = window.Math;
/**
 * CardLayout,容器内所有子项宽高与容器一致
 * @name CC.layout.CardLayout
 * @class
 */
CC.create('CC.layout.CardLayout', B, {
	wrCS : 'g-card-ly-ct',
	layoutChild : function(item){
		var sz = this.ct.wrapper.getSize(true);
		console.trace();
		item.setSize(sz);
	}
});

ly.def('card', ly.CardLayout);
/**
 * @name CC.layout.QQLayout
 * @class
 */
CC.create('CC.layout.QQLayout', B,
	/**@lends CC.layout.QQLayout.prototype*/{
		add : function(comp, cfg){
			comp.fastStyleSet('position', 'absolute')
			    .setLeft(0);
			if(cfg && cfg.collapsed === false){
				comp.fold(false, true);
				this.frontOne = comp;
			}else {
				comp.fold(true, true);
			}
			superclass.add.apply(this, arguments);
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
		
		collapse : function(comp, b){
			var cfg = comp.layoutInf;
			if(cfg.collapsed == b)
				return;
			
			if(this.frontOne && this.frontOne !== comp){
				if(this.frontOne.fold)
					this.frontOne.fold(true, true);
				this.frontOne.layoutInf.collapsed = true;
			}
			if(comp.fold)
				comp.fold(b, true);
			cfg.collapsed = b;
			this.frontOne = b?null:comp;
      this.doLayout();
      this.ct.fire('collapse', comp, b);
		}
});

/**
 * @name CC.layout.qq
 */
ly.def('qq', ly.QQLayout);

/**
 * @name CC.layout.RowLayout
 * @class
 */
/**
 * 行布局,该布局将对子控件宽度/高度进行布局,不干预控件坐标.
 * 控件配置方面:
 * <li>auto : 自动宽高,不进行干预</li>
 * <li>具体宽/高 : 如50px</li>
 * <li>leading : 平分宽高</li>
 */
CC.create('CC.layout.RowLayout', B, {
	  wrCS : 'g-row-ly',
    onLayout: function() {
      var wr = this.ct.wrapper;
      var w = wr.getWidth(true),
      h = wr.getHeight(true),
      i,len, it, its = this.items, cfg, ty = this.type, iv;
      //y direction
      var leH = [], leW = [];
      for(i=0,len=its.length;i<len;i++){
      	it = its[i];
      	if(it.hidden)
      		continue;
      	
      	cfg = it.layoutInf;
      	switch(cfg.h){
      		case 'auto' :
      		case undefined : 
      			h-=it.getHeight(true);
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
      	it.setWidth(w);
       }
       
       for(i=0,len=leH.length;i<len;i++){
      		it = leH[i];
      		cfg = it.layoutInf;
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
    },
    
    add : function(c, cfg){
      this.items[this.items.length] = c;
      superclass.add.call(this, c, cfg);
    },
    
    attach: function(c) {
      superclass.attach.call(this, c);
      this.items = [];
    }
});

ly.RowLayout.prototype.layoutChild = ly.RowLayout.prototype.onLayout;

ly.def('row', ly.RowLayout);

ly.def('row2', ly.QQLayout);
})();


//~@ui/autoscrolllayout.js
/**
 * 该布局管理器可以在不影响原有面板的情况下使得子项被遮掩后出现导航条，当且当前选择项终始处于可视范围内。
 * 利用该布局管理器布局的控件有<code>Toolbar</code>,<code>Tab</code>.
 * 一个容器应该具备以下特性才能获得正确的布局：
 * html模板结构：参见AutoScrollLayout模板
 * @since v2.0.4
 * @author Rock
 */

CC.Tpl.def('AutoScrollLayout', '<div class="g-panel"><div class="auto-margin" id="_margin"><a href="javascript:fGo()" id="_rigmov" class="auto-rigmov" style="right:0px;"></a><a href="javascript:fGo()" style="left:0px;" id="_lefmov" class="auto-lefmov"></a><div class="auto-scrollor" id="_scrollor" tabindex="1" hidefocus="on"><div class="auto-offset" id="_wrap"></div></div></div></div>');

CC.create('CC.layout.AutoScrollLayout', CC.layout.Layout, function(superclass){
    /**
     * 导航按钮点击事件,当键按下时小于300ms就被看作一次点击处理，
     * 将触发移至下一项可见，否则当按下处理，不断移动可视范围直至松开键。
     */
    function onNavMousedown(){
        var ly = this.pCt.layout;
        var mov = this;
        ly.mousedownTimer = (function(){
        
            var hids;
            if (ly.lefMov == mov) {
                hids = ly.getHorizonOutOfViewItems('l');
                if (hids.length) 
                    ly.scrollTo(hids[0][1]);
            }
            else {
                hids = ly.getHorizonOutOfViewItems('r');
                if (hids.length) 
                    ly.scrollTo(hids[0][1]);
            }
            
            if (ly.mousedownTimer != null) {
                clearTimeout(ly.mousedownTimer);
                ly.mousedownTimer = null;
            }
        }).timeout(300);
    }
    
    /**
     * @see onNavMousedown
     */
    function onNavMouseup(){
        var ct = this.pCt, ly = ct.layout;
        if (ly.mousedownTimer != null) {
            clearTimeout(ly.mousedownTimer);
            ly.mousedownTimer = null;
            var first;
            if (ly.scrollTimer == null) {
                first = this.view.id == '_lefmov' ? ly.getHorizonOutOfViewItems('l') : ly.getHorizonOutOfViewItems('r');
                if (first.length == 0) 
                    return;
                first[first.length - 1][0].scrollIntoView(ct.scrollor, true);
            }
        }
        else {
            ly.resetScrollTimer();
        }
    }
    
    /**
     * 将子项滑动到容器可视范围内。
     * 该方法重写子项类位于<code>Base</code>类中的scrollIntoView方法，
     * 使得以动画形式滑动至容器可视处.
     * 注意:子项类原有方法scrollIntoView将被覆盖！
     * @override
     * @param {Mixed} scrollor 子项将滚动到该元素的可视范围内
     */
    function itemScrollIntoView(scrollor){
        var ly = this.pCt.layout;
        var to = this.getHiddenAreaOffsetHori(scrollor);
        if (to === false) 
            return;
        ly.scrollTo(to);
    }
    
    return {
    	  /**
    	   * 延迟布局.
    	   */
    	   
    	  deffer : 0,
        
        /**
         * @property {Number} 子项移动的累加速度
         */
        acceleration: 0.5,
        
        /**
         * 该值须与 CSS 中的.auto-margin值保持同步,因为这里margin并不是由JS控制.
         * 出于性能考虑,现在把它固定下来。
         * @property horizonMargin {Number} 水平方向空位大小
         */
        horizonMargin: 5,
        
        /**
         * 该值须与左边导航按钮宽度一致,出于性能考虑,现在把它固定下来。
         * @property {Number} navLeftWidth
         */
        navLeftWidth: 24,
        
        /**
         * 该值须与右边导航按钮宽度一致,出于性能考虑,现在把它固定下来。
         * @property {Number} navLeftWidth
         */
        navRightWidth: 24,
        
        ctCS : 'g-autoscroll-ly',

        disabledLeftMoverCS: 'auto-lefmov-disabled',

    		disabledRightMoverCS: 'auto-rigmov-disabled',
    
        /**
         * 当子项添加到容器时改写子项的scrollIntoView方法并重新布局容器。
         * @override
         * @param {CC.Base} comp
         */
        add: function(comp){
            superclass.add.apply(this, arguments);
            //override & replace
            comp.scrollIntoView = itemScrollIntoView;
            this.doLayout();
        },
        
        /**
         * 布局容器方法的主体实现
         * @override
         * @param {Object} a 当前容器宽度或false 或 undefined
         * @param {Object} b 当前容器高度或false 或 undefined
         * @param {Object} c 当前容器的wrapper宽度或false 或 undefined
         * @param {Object} d 当前容器的wrapper高度或false 或 undefined
         * @param {Object} dx 当前容器resize后在x轴的引起的增量
         * @param {Object} dy 当前容器resize后在y轴的引起的增量
         */
        onLayout: function(a, b, c, d, dx, dy){
            superclass.onLayout.apply(this, arguments);
            var ct = this.ct, 
                scrollor = ct.scrollor, 
                selected = ct.getSelectionProvider().selected;
            //
            // IE怪胎下固定宽度
            //
            if (CC.ie) {
                var w = a || ct.getWidth() - (this.marginLeft||this.horizonMargin) - (this.marginRight||this.horizonMargin); //margin of wrap.
                ct.fly('_margin').setWidth(w).unfly();
                w -= this.navLeftWidth + this.navRightWidth; //margin of nav bar.
                CC.fly(scrollor).setWidth(w).unfly();
            }
           
            // 是否由resized引起的布局
            if (a === undefined) {
                if (selected) {
                    this.checkMover(false);
                    selected.scrollIntoView(scrollor);
                }
                else 
                    this.checkMover();
                return;
            }
            
            var it, offR = false;
            if (dx) {
                //如果向右扩充
                if (dx > 0) {
                    //如果右边有隐藏，尽量显示,否则显示左边
                    it = this.getNextHiddenChild()[1];
                    if (it === false) 
                        scrollor.scrollLeft = scrollor.scrollLeft - dx;
                }
                //向左缩小,不改变scrollLeft
                if (selected) {
                    this.checkMover(false);
                    selected.scrollIntoView(scrollor, true);
                }
                else 
                    this.checkMover();
            }
        },
        
        /**
         * 绑定布局管理器到容器控件。
         * @param {CC.Base} ct 布局管理器对应的容器控件
         */
        attach: function(ct){
            superclass.attach.call(this, ct);
            ct.getWrapperInsets = fGo;
			// 重置margin结点值，忽略CSS设置的值，使得当CSS值不同的不引起布局的混乱。
			var mgst = ct.dom('_margin').style;
			mgst.marginLeft = (this.marginLeft||this.horizonMargin) + 'px';
			mgst.marginRight = (this.marginRight||this.horizonMargin) + 'px';
            
			if (!ct.scrollor) 
                ct.scrollor = ct.dom('_scrollor');
            var lm = this.lefMov = ct.$$('_lefmov');
            var rm = this.rigMov = ct.$$('_rigmov');
            lm.disabledCS = this.disabledLeftMoverCS;
            rm.disabledCS = this.disabledRightMoverCS;
            lm.domEvent('mousedown', onNavMousedown).domEvent('mouseup', onNavMouseup);
            rm.domEvent('mousedown', onNavMousedown).domEvent('mouseup', onNavMouseup);
            ct.hscroll = true;
        },
        
        /**
         * 移除移动子项到可视范围的定时器.
         */
        resetScrollTimer: function(){
            if (this.scrollTimer) {
                clearTimeout(this.scrollTimer);
                this.scrollTimer = null;
            }
            this.checkMover();
        },
        
        /**
         * 将滚动条滑动至指定处。
         * @param {Number} to scrollor结点的scrollLeft值.
         */
        scrollTo: function(to){
            if (this.scrollTimer != null) 
                this.resetScrollTimer();
            var sc = this.ct.scrollor;
            var current = sc.scrollLeft;
            var step = to - current;
            var seed = step / Math.abs(step) * this.acceleration;
            if (seed == 0) 
                return;
            var self = this;
            step = seed;
            this.scrollTimer = (function(){
                current = Math.floor(current + step);
                if (seed > 0) {
                    if (current > to) 
                        current = to;
                }
                else 
                    if (current < to) {
                        current = to;
                    }
                
                if (current == to) {
                    self.resetScrollTimer();
                }
                sc.scrollLeft = current;
                step += seed;
            }).timeout(this.scrollTimerInterval || 33, true);
        },
        
        /**
         * 检查导航按钮状态，是否应显示或禁用。
         */
        checkMover: function(timeout){
            var self = this;
            var func = (function(){
                var ct = self.ct, has = self.getNextHiddenChild();
                self.lefMov.disable(!has[0]);
                self.rigMov.disable(!has[1]);
                
                if (!has[0] && !has[1]) {
                    ct.delClass(self.movPanelCS);
                }
                
                else 
                    ct.addClassIf(self.movPanelCS);
            });
            if (timeout !== false) 
                func.timeout(100);
            else 
                func();
        },
		
        /**
         * 返回左右两边下一个被遮掩的子项。
         * 注:不包括隐藏的
         */
        getNextHiddenChild: function(){
            var its = this.ct.children, it, l = false, r = false, i = 0, j, len = its.length, sc = this.ct.scrollor;
            for (; i < len; i++) {
                it = its[i];
                if (it.hidden) 
                    continue;
                if (it.getHiddenAreaOffsetHori(sc) !== false) {
                    l = it;
                }
                i++;
                break;
            }
            
            for (j = len - 1; j >= i; j--) {
                it = its[j];
                if (it.hidden) 
                    continue;
                if (it.getHiddenAreaOffsetHori(sc) !== false) {
                    r = it;
                }
                break;
            }
            return [l, r];
        },
        
        /**
         * 获得水平方向被遮掩的项列表。
         * 注:不包括隐藏的。
         * @param {Object} dir 左边或右边或两边都返回。'l'或'r'或者undefined.
         */
        getHorizonOutOfViewItems: function(dir){
            var ct = this.ct, scrollor = ct.scrollor;
            var ls = [], rs = [], its = ct.children, len = its.length, it, i = 0, j, off;
            //left out of view items
            if (!dir || dir == 'l') {
                for (; i < len; i++) {
                    it = its[i];
                    if (it.hidden) 
                        continue;
                    off = it.getHiddenAreaOffsetHori(scrollor);
                    if (off === false) {
                        i++;
                        break;
                    }
                    ls[ls.length] = [it, off];
                }
            }
            
            //right out of view items
            if (!dir || dir == 'r') {
                for (j = len - 1; j >= i; j--) {
                    it = its[j];
                    if (it.hidden) 
                        continue;
                    off = it.getHiddenAreaOffsetHori(scrollor);
                    if (off === false) 
                        break;
                    rs[rs.length] = [it, off];
                }
            }
            
            if (!dir) 
                return [ls, rs];
            
            return dir == 'l' ? ls : rs;
        }
        
    };
});

CC.layout.def('autoscroll', CC.layout.AutoScrollLayout);

//~@ui/itemddrtag.js
/**
 * 拖放TabItem,Column项时显示的下标图标.
 * 该控件位于缓存中,一般可放下时显示,拖放结束后消失.
 */
CC.Tpl.def('ItemDDRBarUp', '<div class="g-tabMoveSp" style="display:none;"></div>');

if(!CC.Cache['ItemDDRBarUp']) {
		CC.Cache.register('ItemDDRBarUp', (function(){
			var n = CC.$$(CC.Tpl.forNode(CC.Tpl['ItemDDRBarUp']));
			n.appendTo(document.body);
			return n;
		}));
}

//~@ui/group.js
CC.Tpl.def('CC.ui.FolderItem', '<li class="g-unsel"><b id="_ico" class="icos"></b><a id="_tle" class="g-tle"></a></li>')
      .def('CC.ui.Folder', '<div class="g-folder g-grp-bdy"><div class="g-grp-bdy" id="_scrollor"><ul id="_bdy" tabindex="1" hidefocus="on"></ul></div></div>');

CC.ui.Folder = function(opt, type){
	opt = CC.extendIf(opt, {
        itemCfg : {template : 'CC.ui.FolderItem', hoverCS:'on', icon:'icoNote', blockMode:''},
        keyEvent : true,
        ct : '_bdy',
        clickEvent : true,
				useContainerMonitor : true,
				template:'CC.ui.Folder',
				selectionProvider : true
  });
	var c = new CC.ui.ContainerBase(opt);
	return c;
};

CC.ui.def('folder', CC.ui.Folder);


//~@ui/form.js

(function(){
var spr;
var CC = window.CC;
var Bx = CC.Base;
var Tpl = CC.Tpl;

CC.create('CC.ui.form.FormElement', Bx, 
{
    errorCS: 'g-error',

    elementNode: '_el',
    
    /**
     * 主要是为支持 blur, focus事件
     */
    eventable : true,
    
    /**
     * 验证状态,默认为true.
     */
    isValid : true,
    
    elementCS: 'g-form-el',

    initComponent: function() {
      //generate template first and searching form element node..
      var v = this.view;
      if (!v) {
        var t = this.template || this.type;
        this.view = v = Tpl.$(t);
      }
      var el = this.element;

      if (!el) el = this.element = this.dom(this.elementNode);

      el.id = this.id || 'comp' + CC.uniqueID();
      this.focusNode = el.id;

      if (v != el && !v.id) v.id = 'comp' + CC.uniqueID();
      //
      this.addClass(this.elementCS);

      Bx.prototype.initComponent.call(this);

      if (this.name) this.setName(this.name);

      if (this.value) this.setValue(this.value);
      
      if (this.focusCS)
      	this.bindFocusCS();
    },
    
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
     * @protected
     */
    focusCallback : fGo,
    
    /**
     * 继承的FormElement控件必要实现控件失去/获得焦点时事件的发送.
     * @protected
     */
    onFocusTrigger : function(){
    	if(this.focused)
    		return;
    	this.focused = true;
    	
    	if (this.onfocus) this.onfocus();
    	
    	this.fire('focus');
    },
    
    /**@protected*/
    onBlurTrigger : function(){
    	if(this.focused){
    		this.focused = false;
    	
      if(this.validator){
      	this.checkValid();
      }
    	
    	if (this.onblur) 
    			this.onblur();
    		
    		this.fire('blur');
    	}
    },

    /**
     * 继承的FormElement控件必要实现控件按件事件的发送.
     * @protected
     */
    onKeydownTrigger : function(evt){
    	this.fire('keydown', evt);
    },

    checkValid : function(){
			if(this.errorMsg)
    		this.errorMsg = false;
      this.isValid = this.validator? this.validator(this.getValue()):true;
      return this.isValid;
    },
    
    setValue: function(v) {
      this.element.value = v;
      this.value = v;
      return this;
    },
    
    getValue : function(){
    	return this.element.value;
    },
    
    getText : function(){
    	return this.title || this.element.value;
    },
    
    setName: function(n) {
      this.element.name = n;
      this.name = n;
      return this;
    },

    mouseupCallback: function(evt) {
      if (this.onclick) this.onclick(evt, this.element);
    }
}
);

/**
 * 激活该控件.
 */
CC.ui.form.FormElement.prototype.active  = CC.ui.form.FormElement.prototype.focus;

var cf = CC.ui.form.FormElement;
spr = cf.prototype;

var fr = CC.ui.form;

Tpl.def('Text', '<input type="text" id="_el" class="g-ipt-text" />')
   .def('Textarea', '<textarea id="_el" class="g-textarea" />')
   .def('Checkbox', '<span tabindex="1" class="g-checkbox"><input type="hidden" id="_el" /><img src="' + Tpl.BLANK_IMG + '" class="chkbk" /><label id="_tle"></label></span>');

CC.create('CC.ui.form.Text', cf, {
	  template : 'Text',
    initComponent : function(){
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

CC.create('CC.ui.form.Textarea', cf, fr.Text.constructors, {
	template : 'Textarea',
  focusCallback: cf.prototype.focusCallback,
  maxH : Bx.prototype.maxH
});

CC.ui.def('textarea', fr.Textarea);

CC.create('CC.ui.form.Checkbox', cf, {
	  template : 'Checkbox',
    hoverCS: 'g-check-over',
    clickCS: 'g-check-click',
    checkedCS: 'g-check-checked',
    initComponent: function() {
      spr.initComponent.call(this);
      if (this.checked) this.setChecked(true);
    	this.domEvent('focus', this.onFocusTrigger)
    	    .domEvent('blur', this.onBlurTrigger)
    	    .domEvent('keydown', this.onKeydownTrigger);
    },

    mouseupCallback: function(evt) {
      this.setChecked(!this.checked);
      spr.mouseupCallback.call(this, evt);
    },

    setChecked: function(b) {
      this.checked = b;
      this.element.checked = b;
      if (b) this.addClass(this.checkedCS);
      else this.delClass(this.checkedCS);
      if (this.onChecked) this.onChecked(b);
    }
});

CC.ui.def('checkbox', fr.Checkbox);

CC.create('CC.ui.form.Radio', cf, fr.Checkbox.constructors, {
  inherentCS: 'g-radio',
  template: 'Checkbox',
  hoverCS: 'g-radio-over',
  clickCS: 'g-radio-click',
  checkedCS: 'g-radio-checked'
});
CC.ui.def('radio', fr.Radio);

CC.Tpl.def('CC.ui.form.FieldLine', '<li><label class="desc" id="_tle" ><span class="req">*</span></label><div id="_elCtx"></div></li>')
      .def('CC.ui.form.FormLayer', '<ul class="g-formfields"></ul>');

CC.create('CC.ui.form.FieldLine', CC.ui.ContainerBase, function(spr) {
  return {
    labelNode: '_tle',
    labelFor: 0,
    ct: '_elCtx',
    title: false,
    initComponent: function() {
      spr.initComponent.call(this);
      if (this.title === false) {
        this.fly(this.labelNode).display(0).unfly();
      }
    },

    add: function(field, cfg) {
      if (field.ctype) field = new fr[field.ctype](field);
      spr.add.call(this, field, cfg);
      if (this.$(this.labelFor) == field) this.dom(this.labelNode).htmlFor = field.element.id;
    },

    fromArray: function(array) {
      for (var i = 0, len = array.length; i < len; i++) {
        this.add(array[i]);
      }
    }
  };
});

CC.ui.def('fieldline',CC.ui.form.FieldLine);

fr.FormLayer = function(opt) {
  opt = opt || {};
  opt.ItemClass = fr.FieldLine;
  opt.template = opt.type = 'CC.ui.form.FormLayer';
  return new CC.ui.ContainerBase(opt);
}
})();
//

//~@ui/progressbar.js

CC.Tpl.def('CC.ui.form.Progressbar' , '<table class="g-progressbar" cellspacing="0" cellpadding="0" border="0"><tr><td class="g-progress-l"><i>&nbsp;</i><input type="hidden" id="_el" /></td><td class="g-progress-c"><img id="_img" src="http://www.bgscript.com/s.gif" alt=""/></td><td class="g-progress-r"><i>&nbsp;</i></td></tr></table>');

CC.create('CC.ui.form.Progressbar', CC.ui.form.FormElement, function(father){
	if(!CC.ui.form.Progressbar.img)
		CC.ui.form.Progressbar.img = 'http://www.bgscript.com/images/progressbar.gif';

	return {
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
				this.onStop();
				this.fire('progressstop', this);
				return father.setValue.call(this, 100);
			}
			
			CC.fly(this.img).fastStyleSet('width',v+'%').unfly();
			return father.setValue.call(this, v);
		},

		onStop : fGo
	};
});
CC.ui.def('progressbar', CC.ui.form.Progressbar);

//~@ui/button.js
CC.Tpl.def('CC.ui.Button', '<table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="g-btn-l"><i>&nbsp;</i></td><td class="g-btn-c"><em unselectable="on"><button type="button" class="g-btn-text" id="_tle"></button></em></td><td class="g-btn-r"><i>&nbsp;</i></td></tr></tbody></table>');
/**
 *@class Button
 *@extend Base
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
        inherentCS: 'g-btn',
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
        
        setDocked: function(b){
            this.docked = b;
            b ? this.addClass(this.clickCS) : this.delClass(this.clickCS);
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


CC.ui.def('button', CC.ui.Button);

//~@ui/toolbar.js
CC.Tpl['BarItem'] = '<table class="g-baritem" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="g-btn-l"><i>&nbsp;</i></td><td class="g-btn-c"><em unselectable="on"><button type="button" class="g-btn-text" id="_tle"></button></em></td><td class="g-btn-r"><i>&nbsp;</i></td></tr></tbody></table>';

CC.ui.Bigbar = function(opt){
	return new CC.ui.Panel(CC.extend(
	{
	 keyEvent:false,
	 itemCfg : {
	 	template : 'BarItem', 
	 	maxH:31,
	 	hoverCS:'g-baritem-over',
	 	inherentCS : 'g-baritem',
		clickCS:'g-baritem-click',
		focusCS:false
	 },
	 maxH : 38,
	 inherentCS : 'g-bigbar',
	 ItemClass : CC.ui.Button,
   selectionProvider : true,
	 selectionCfg : {forceSelect:true},
	 template : 'AutoScrollLayout',
	  /**
	   * 主要用于autoscrolllayout布局
	   */
	  layoutCfg : {
	  	  
	  	  movPanelCS: 'g-mov-toolbar',
	  	  
	      horizonMargin: 5,
        
        /**
         * 该值须与左边导航按钮宽度一致,出于性能考虑,现在把它固定下来。
         * @property {Number} navLeftWidth
         */
        navLeftWidth: 20,
        
        /**
         * 该值须与右边导航按钮宽度一致,出于性能考虑,现在把它固定下来。
         * @property {Number} navLeftWidth
         */
        navRightWidth: 20
	  }
	}, 
	opt));
};

/**
 * 小型工具栏
 * @name CC.ui.Smallbar
 * @class
 */
CC.ui.Smallbar = function(opt){
	return new CC.ui.Panel(CC.extend(
	{
	 selectionProvider : true,
	 selectionCfg : {forceSelect:true},
	 keyEvent:false,
	 itemCfg : {
	 	template : 'BarItem', 
	 	hoverCS:'g-smallbar-item-over',
		clickCS:'g-smallbar-item-click',
		inherentCS:'g-smallbar-item',
		focusCS:false
	 },
	 maxH : 26,
	 inherentCS:'g-smallbar',

	 ItemClass : CC.ui.Button,
	 template : 'AutoScrollLayout',
	 
	  /**
	   * 主要用于autoscrolllayout布局
	   */
	  layoutCfg : {
	  	  
	  	  movPanelCS: 'g-mov-toolbar',
	  	  
	      horizonMargin: 5,
        
        /**
         * 该值须与左边导航按钮宽度一致,出于性能考虑,现在把它固定下来。
         * @property {Number} navLeftWidth
         */
        navLeftWidth: 20,
        
        /**
         * 该值须与右边导航按钮宽度一致,出于性能考虑,现在把它固定下来。
         * @property {Number} navLeftWidth
         */
        navRightWidth: 20
	  }
	}, 
	opt));
};


//~@ui/titlepanel.js
/**
 * @class 
 * @name CC.ui.TitlePanel
 */
CC.Tpl.def('CC.ui.TitlePanel', '<div class="g-panel g-titlepanel"><h3 class="g-titlepanel-hd" id="_tleBar"><a id="_btnFN" class="g-icoFld" href="javascript:fGo()"></a><a id="_tle" class="g-tle" href="javascript:fGo()"></a></h3><div id="_scrollor" class="g-panel-wrap g-titlepanel-wrap"></div></div>');

CC.create('CC.ui.TitlePanel', CC.ui.Panel, function(superclass){
    return /**@lends CC.ui.TitlePanel.prototype*/{
  
        unselectable : '_tleBar',
        
        ct:'_scrollor',
        
        minH : 29,
        
/**foldNode展开时样式*/
        openCS : 'g-icoOpn',
        
/**foldNode折叠时样式*/        
        clsCS  : 'g-icoFld',
        
        foldNode : '_btnFN',
        
        initComponent: function() {
            superclass.initComponent.call(this);
            //evName, handler, cancel, caller, childId
            this.domEvent('mousedown', this._btnFNOnclick, true, null, this.foldNode)
                .domEvent('mousedown', this.onTitleClick,  true, null, this.titleNode);
            //_tleBar
            this.header = this.$$('_tleBar');
            
            if(this.folded)
            	this.fold(this.folded);
        },
				
				getWrapperInsets : function(){
				 	return [29 , 0, 0, 0, 29, 0];
				},
				
        //点击收缩图标时触发,可重写自定.
        _btnFNOnclick: function() {
	          var v = !this.wrapper.hidden;
	          this.fold(v);
        },
/**
 * 标题点击时触发,默认执行缩放面板
 */
        onTitleClick : function(){
        	this._btnFNOnclick();
        },
/**
 * 收缩/展开内容面板
 * @param {Boolean}
 */
        fold: function(b, notNotifyLayout) {
        	  if(this.pCt && this.pCt.layout.collapse && !notNotifyLayout){
            	this.pCt.layout.collapse(this, b);
            	return this;
            }
            this.$attr(this.foldNode, 'className', b ? this.openCS : this.clsCS);
            this.wrapper.display(!b);
            this.folded = b;
            this.fire('fold',b);
            return this;
        }
    }
});

CC.ui.def('titlepanel', CC.ui.TitlePanel);

//~@ui/foldable.js
CC.Tpl.def('CC.ui.Foldable', '<div class="g-foldable"><div class="g-foldablewrap"><b title="隐藏" id="_trigger" class="icos icoCls"></b><div id="_tle"></div></div></div>');
CC.create('CC.ui.Foldable', CC.Base, {
    
    clsGroupCS: 'g-gridview-clsview',
    
    unselectable: true,
	/**
	 * @property nodeBlockMode 指定收缩结点的displayMode:''或block
	 */
	//nodeBlockMode:'block',
    initComponent: function(){
        this.createView();
        CC.Base.prototype.initComponent.call(this);
        this.domEvent('click', this.foldView, true, null);
        if (this.array) {
            this.target.fromArray(this.array);
            delete this.array;
        }
    },
    
    foldView: function(b){
        var f = CC.fly(this.foldNode ? this.target.dom(this.foldNode) : this.target.ct || this.target);
        //
        // b如果用在domEvent的回调中,就是Event对象!
        //
        if (b !== true && b !== false) 
            b = !f.display();
        if (this.fire('expand', this, b) === false) {
            f.unfly();
            return;
        }
		//
		if(this.nodeBlockMode !== undefined)
			f.setBlockMode(this.nodeBlockMode);
        f.display(b).unfly();
        if (this.target.shadow) 
            this.target.shadow.reanchor();
        this.dom('_trigger').title = b ? '隐藏' : '展开';
        b ? this.delClass(this.clsGroupCS) : this.addClass(this.clsGroupCS);
        this.expanded = b;
        this.fire('expanded', this, b);
        return this;
    },
    
    brush: function(v){
        if (this.target.children) 
            return '<strong>' + v + '</strong><span id="_view_span">(<strong><a id="_view_cnt" href="javascript:fGo();">' + this.target.size() + '</a></strong>)</span>';
        return v;
    }
});
CC.ui.def('foldable', CC.ui.Folderable);

//~@ui/framepanel.js
CC.create('CC.util.IFrameConnectionProvider', CC.util.ConnectionProvider, {

/**
 * 是否监听IFRAME加载事件,默认为true
 * @type Boolean
 */
	traceLoad : true,
/**indicatorDisabled:false*/  
  indicatorDisabled : true,
  
/**
 * 默认不处理
 */
	defaultLoadSuccess : fGo,
	
	initConnection : function(){
		if(this.traceLoad)
			this.t.domEvent(CC.ie?'readystatechange':'load', this.traceFrameLoad, false, this , this.t.getFrameEl());
		CC.util.ConnectionProvider.prototype.initConnection.apply(this, arguments);
	},

/**@private*/
  onFrameLoad : function(e){
  	var t = this.t;
  	try{
  		t.fire('success', this, e);
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
	    	if(!t.busy)
	    		t.fire('open', this, evt);
		  break;
		  //
		  //当用户手动刷新FRAME时该事件也会发送
	    //case 'interactive': //IE
	    case 'load': //Gecko, Opera
	    case 'complete': //IE
			  //May be ie would do a clean action before a new page loaded.
			  if(!CC.ie || this.url === t.view.src)
			  	this.onFrameLoad(evt);
	      break;
	  }
	},
	
	abort : function(){
		this.getFrameEl().src = CC.ie?'about:blank':'';
		this.onFinal();
	},
	
/**@private*/
	onFinal : function(){
  	this.t.fire('final', this);
  	
  	if(this['final']){
  		this['final'](this,  e);
  	}
	},
	
/**@private*/
	bindConnector : function(cfg){
		if(this.t.busy)
			this.abort();

		CC.extend(this, cfg);
		this.connectInner();
	},
	
/**@private*/
	connectInner : function(cfg){
    this.t.fire('open', this);
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
 * IFRAME面板封装
 * @name CC.ui.IFramePanel
 * @class
 */
CC.create('CC.ui.IFramePanel', CC.ui.Panel, {
/**
 * 是否跟踪IFramePanel父容器宽高改变以便调整自身宽高,默认值为false,
 * 通常并不需要该项,IFramePanel往往是通过父容器的布局管理器来调整它的大小.
 * @type Boolean
 */
	traceResize : false,
	
	connectionCls : CC.util.IFrameConnectionProvider,
	
	connectionProvider : true,
	
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
 * 获得iframe html结点
 */
	getFrameEl : function(){
	 	return this.view;
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
	 * @function
	 * @return {DOMElement}
	 */
	$ : function(id){
		return CC.frameDoc(this.view).getElementById(id);
	}
}
);

CC.ui.def('iframe', CC.ui.IFramePanel);

//~@ui/resizer.js
//定义控件模板
CC.Tpl.def('CC.ui.Resizer', '<div class="g-panel g-resizer"><div class="g-win-e" id="_xe"></div><div class="g-win-s" id="_xs"></div><div class="g-win-w" id="_xw"></div><div class="g-win-n" id="_xn"></div><div class="g-win-sw" id="_xsw"></div><div class="g-win-es" id="_xes"></div><div class="g-win-wn" id="_xwn"></div><div class="g-win-ne" id="_xne"></div><div class="g-panel-wrap g-resizer-wrap" id="_wrap"></div></div>');

/**
 * @class 边框缩放控件
 * @super CC.ui.Panel
 */
CC.create('CC.ui.Resizer', CC.ui.Panel ,(function(superclass){
	var CC = window.CC, G = CC.util.dd.Mgr, H = G.resizeHelper, E = CC.Event;
    return /**@lends CC.ui.Resizer*/{
/**
 * 是否允许缩放
 * @type Boolean
 */
        resizeable : true,
/**
 * 是否允许纵向缩放
 * @type Boolean
 */
        enableH:true,
/**
 * 是否允许横向缩放
 * @type Boolean
 */
        enableW:true,
        
        unresizeCS : 'g-win-unresize',
        
        width:500,
        
        height:250,
        
        minW:12,
        
        minH:6,

/**
 * @name CC.ui.Resizer#resizestart
 * @event
 * 缩放触发时发送
 */
/**
 * @private
 */
				onResizeStart : function(){
					if(this.resizeable){
						var a = this.absoluteXY(),
						    b = this.getSize(true);
						if(!CC.borderBox){
							b.width  -= 1;
							b.height -= 1;
						}
						//记录初始数据,坐标,宽高
						this.initPS = {pos:a,size:b};
						H.applyResize(true);
						H.layer.setXY(a)
						       .setSize(b);
						H.masker.fastStyleSet('cursor', this.fastStyle('cursor'));
						this.fire('resizestart');
					}
				},
				
/**
 * @name CC.ui.Resizer#resizeend
 * @event
 * @param {Array} xy [current_x, current_y]
 * @param {Array} dxy [delta_x, delta_y]
 * 缩放触发时发送
 */
				 
/**
 * @private
 */
				onResizeEnd : function(){
					var dxy = G.getDXY();
					if(dxy[0] === 0 && dxy[1] === 0){
						H.applyResize(false);
						H.masker.fastStyleSet('cursor','');
					}else{
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
						    sds = !sd.hidden;
						
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
						
						H.applyResize(false);
						H.masker.fastStyleSet('cursor', '');
						delete this.initPS;
					}
				},

/**
 * @name CC.ui.Resizer#initPS
 * @property {Object} 保存缩放开始时的数据,结构为{pos:[x, y], size:{width, height}}
 */
 
        initComponent : function() {
        	superclass.initComponent.call(this);
        	this.resizeable ? this.bindRezBehavior() : this.setResizable(false);
        },
/**
 * @private
 */
        bindRezBehavior : function(){
         var  ini = this.onResizeStart.bind(this),
            	end = this.onResizeEnd.bind(this),
            	  a = this.createRezBehavior(0x8),
                b = this.createRezBehavior(0x4),
                c = this.createRezBehavior(0x2),
                d = this.createRezBehavior(0x1),
                f = this.createRezBehavior('',c,b),
                e = this.createRezBehavior('',b,d),
                g = this.createRezBehavior('',a,c),
                h = this.createRezBehavior('',a,d);
              
              this.bindRezTrigger('_xn', a,ini,end)
                  .bindRezTrigger('_xs', b,ini,end)
                  .bindRezTrigger('_xw', c,ini,end)
                  .bindRezTrigger('_xe', d,ini,end)
                  .bindRezTrigger('_xes',e,ini,end)
                  .bindRezTrigger('_xsw',f,ini,end)
                  .bindRezTrigger('_xwn',g,ini,end)
                  .bindRezTrigger('_xne',h,ini,end);
        },
        
/**
 * @private
 */
        bindRezTrigger : function(id, drag, ini, end) {
            var vid = this.$$(id);
            vid.beforedrag = ini;
            vid.drag = drag;
            vid.afterdrag = end;
            vid.installDrag(true);
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
 * @name CC.ui.Resizer#resizeable
 * @property {Boolean} resizeable 获得控件是否可缩放,只读,设置时可调用setResizeable方法
 */
/**
 * 设置是否可以缩放
 * @param {Boolean} resizeable
 */
				setResizable : function(resizeable) {
					!resizeable ? this.addClass(this.unresizeCS) :
					              this.delClass(this.unresizeCS);
					this.resizeable = resizeable;
				},
				
				getWrapperInsets : function(){
					return [6,1,1,1,7,2];
				}
    };
}));

//~@ui/window.js
/**
 * window控件.
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
/**
 * @name CC.ui.Win#unmoveable
 * @property {Boolean} unmoveable 设置该值操纵当前窗口是否允许移动
 */
/**
 * @name CC.ui.win.Titlebar
 * @class
 * @super CC.ui.ContainerBase
 */
		CC.create('CC.ui.win.Titlebar', CC.ui.ContainerBase, {
		    autoRender: true,
		    clickEvent : true,
		    selectionCfg : {forceSelect: true, selectedCS : false},
		    unselectable:true,
		    cancelClickBubble : true,
		    itemCfg: { template: 'CC.ui.win.TitlebarButton' },
		    ct: '_ctx',
		    selectionProvider : true
		});
		
		
    return {

        closeable : true,
        
        shadow : true,
  
        inherentCS : 'g-win g-tbar-win',
/**
 * 最小化时窗口样式
 */
        minCS : 'g-win-min',

/**
 * 最大化时窗口样式
 */        
        maxCS : 'g-win-max',
 
        minH:30,
        
  			minW:80,
/**
 * 拖放时窗口透明度
 */  			
  			dragOpacity : 0.6,

        initComponent: function() {
          var tb = this.titlebar = new CC.ui.win.Titlebar({title:this.title});
          this.follow(tb);
					delete this.title;
					
					if(this.shadow === true)
						this.shadow = new CC.ui.Shadow({inpactY:-1,inpactH:5});
          
          father.initComponent.call(this);
          
          this.wrapper.insertBefore(tb);
            
          if(this.closeable === true){
          	this.clsBtn = new CC.ui.Item({
            	cs:'g-win-clsbtn',
              template:'CC.ui.win.TitlebarButton',
              onselect:this.onClsBtnClick,
              tip:'关闭',
              id:'_cls'
            });
            tb.add(this.clsBtn);
          }
           
          if(this.destoryOnClose)
          	this.on('closed', this.destory);
           
          this.domEvent('mousedown', this.trackZIndex)
              //为避免获得焦点,已禁止事件上传,所以还需调用trackZIndex更新窗口zIndex
              .domEvent('mousedown', this.trackZIndex, true, null, this.titlebar.view)
              .domEvent('dblclick',  this.switchState, true, null, this.titlebar.view);
              
          if(!this.unmoveable)
          	G.installDrag(this, true, tb.view);
        },
/**
 * 实现窗口的拖放
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
				 * 点击关闭按钮事件.
				 * 此时this为按钮
				 */
				onClsBtnClick : function(){
					this.pCt.pCt.close();
				},
/**
 * 设置标题,实际上调用了titlebar设置标题
 * @override
 */
				setTitle : function(tle) {
					this.titlebar.setTitle(tle);
					return this;
				},
/**
 * 更新窗口系统的zIndex,使得当前激活窗口位于最顶层.
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
		        if(this.shadow)
		        	this.shadow.setZ(zIndex-1);
		        this.zIndex = zIndex;
		        return this;
		    },
/**
 * 改变窗口状态
 * 可选状态有<br>
 * <li>max
 * <li>min
 * <li>normal
 */
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
         * 关闭当前窗口,发送close, closed事件.
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
							this.enableH = CC.delAttr(this, '_enableH');
        			this.enableW = CC.delAttr(this, '_enableW');
        			this.setResizable(CC.delAttr(this, '_resizeable'));
							this.titlebar.draggable = CC.delAttr(this, '_draggable');
	        	}
        	}
        	else {
        		this._normalBounds = [this.xy(),this.getSize(true)];
        		this._enableH = this.enableH;
        		this._enableW = this.enableW;
        		this._resizeable = this.resizeable;
        		this._draggable = this.titlebar.draggable;
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
         * 切换窗口状态
         * @param {String} st 状态选项, 值为max,min或空,为空时正常状态. 
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
		        	this.setResizable(false);
		        	break;
		        case 'max':
		        	if(this.shadow){
		        		this.shadow.hide();
		        	}
		        	this.titlebar.draggable = false;
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
		        	this.setResizable(false);
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

//~@ui/dialog.js
CC.Tpl.def('CC.ui.Dialog.Bottom', '<div class="g-win-bottom"><div class="bottom-wrap"></div></div>');
/**
 * 对话框是一个特殊的窗体，底部具有按钮栏，并且可指定是否模式，即是否有掩层。 
 * @super CC.ui.Win
 * @class CC.ui.Dialog
 * @param {Object} superclass
 * @constructor
 */
CC.create('CC.ui.Dialog', CC.ui.Win, function(superclass){
	var CC = window.CC;
	var Event = CC.Event;
	return {
		/**
		 * @property 内部高度，与CSS一致
		 * @private
		 */
		bottomHeight: 51,
		/**
		 * 返回状态值, 可自定,如ok,cancel...,当对话框某个按钮点击并可返回时,返回值为该按钮ID
		 * @property
		 */
    returnCode : false,

		/**
		 * 是否监听键盘事件,如当ESC按下时为取消.
		 * @property {Boolean}=true keyEvent
		 */
		
		/**
		 * 设置默认按钮,该按钮必须在当前按钮列表中.
		 * @property {String}
		 */
		defaultButton : false,
		
		initComponent: function(){
			this.createView();
			this.createBottom();
			this.keyEventNode = this.view;
			superclass.initComponent.call(this);
			if (this.buttons) {
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
				this.pCt.close();
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
		 * @function
		 */
		onOk : function(){
		   if(this.defaultButton){
		   	this.bottomer.selectionProvider.select(this.defaultButton, true);
		   }
		},
		
		/**
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
    
		show: function(parent, modal, callback){
			this.modal = modal;
			this.modalParent = parent;
			this.modalCallback = callback;
			return superclass.show.call(this);
		},
		
		trackZIndex : function(){
			superclass.trackZIndex.call(this);
			if(this.masker)
				this.masker.setZ((this.fastStyleSet('zIndex')||1002) - 1);
		},
		
		display: function(b){
			if (arguments.length == 0) 
				return superclass.display.call(this, b);
			
			if (b) {
				superclass.display.call(this, b);
				if (this.modal) {
					var m = this.masker;
					if (!m) 
						m = this.masker = new CC.ui.Mask();
					if (!m.target) 
						m.attach(this.modalParent || CC.$body);
					m.setZ(Math.max(this.fastStyle('zIndex')||999,1002) - 1);
				}
				this.center(this.modalParent);
				this.trackZIndex.bind(this).timeout(0);
				this.focusDefButton();
			}
			else if (!b) {
					if (this.modal) {
						if(this.modalCallback){
							if(this.modalCallback() === false)
								return this;
						}

					  this.masker.detach();
						delete this.modal;
						delete this.modalParent;
						delete this.modalCallback;
					}
					superclass.display.call(this, b);
		  }
			return this;
		},
		

		focusDefButton : function(){
			var def = this.bottomer.$(this.defaultButton);
			if(def)
				def.focus(22);
		},
		
		/**
		 * @private
		 */
		createBottom: function(){
			var b = this.bottomer = new CC.ui.ContainerBase({
				ItemClass: CC.ui.Button,
				template:'CC.ui.Dialog.Bottom',
				ct : '_wrap',
				showTo:this.view,
				clickEvent : 'click',
				keyEvent : true,
				selectionProvider:true,
				selectionCfg : {forceSelect:true}
			});
			
			this.follow(b);
			//监听按钮点击
			b.on('selected', this.onBottomItemSelected);
		},
		
		getWrapperInsets: function(){
			var s = CC.ui.Win.prototype.getWrapperInsets.call(this),
			    h = this.bottomHeight - 1;
			s[2] += h;
			s[4] += h;
			return s;
		}
	};
});


//~@ui/masker.js
/**
 * @name CC.ui.Mask
 * @class 容器控件遮掩层
 */
CC.create('CC.ui.Mask', CC.Base, {
	
  inherentCS: 'g-modal-mask',
  
	template : 'div',
	
/**
 * 点击层时响应回调
 * @type function
 */	
	onActive : null,

/**
 * @property {CC.Base} target 目标容器
 */
 
	initComponent : function(){
		CC.Base.prototype.initComponent.call(this);
		if(this.target){
			this.attach(this.target);
		}
		
		this.domEvent('mousedown', this.onMaskResponsed, true);
	},
	
	/**@private*/
	onMaskResponsed : function(){
	   this.fire('active', this);
	   if(this.onActive)
	   	this.onActive();
	},
	
/**
 * 绑定目标容器
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


//~@ui/menu.js

(function(){

var CC = window.CC;
var Event = CC.Event;
var SPP = CC.util.SelectionProvider.prototype;

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

/**
 * 重载该方法可以定义按键导航
 */
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

/**
 * 展开菜单当前项或激活第一个能激活的菜单项
 * @private
 */
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
  
/**
 * @override
 */
  getStartIndex : function(){
  	var m = this.t, o = m.onItem;
  	return o?m.indexOf(o) : -1;
  },

/**
 * 移动至下一菜单项
 * @override
 */
	next : function(){
    var t = this.t, it = this.getNext();
		if(!it) it = t.$(0);
		if(it) it.active(t.menubar);
	},
	
/**
 * 移动至前一菜单项
 */
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
			else m.pItem.active(false);
		}
	},
	
	enter : function(){
		var t = this.t, o = t.onItem;
		if(o)	this.select(o);
	}
});
/**
 * 菜单项被添加到菜单中,它可以被激活,激活后的菜单可方便键盘导航, 
 * 菜单项可附有子菜单,菜单项有多种状态,每种状态可有不同的CSS样式:
 * <li>normal(deactive) -- 常态
 * <li>active  -- 激活
 * <li>sub menu expanded -- 子项展开
 * @name CC.ui.MenuItem
 * @class 菜单项
 */
CC.create('CC.ui.MenuItem', CC.Base, function(superclass){
return {/**@lends CC.ui.MenuItem.prototype */
	
/**
 * 子菜单
 * @type CC.ui.Menu
 */
  subMenu: null,
	
/**
 * 如果菜单项存在子菜单,附加到菜单项上的样式
 * @type String
 */
	subCS : 'sub-x',
	
/**
 * 激活菜单项
 * 要设置激活菜单项样式,可设置父层菜单的activeCS属性
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
  
  isActive : function(){
  	return this.pCt.onItem === this;
  },
  
  decorateActive : function(b){
  	b ? this.addClass(this.pCt.activeCS) :
  	    this.delClass(this.pCt.activeCS);
  },
  
  deactive : function(fold){
  	var c = this.pCt, m = this.subMenu;
  	c.onItem = null;
  	
  	if(this.deactiveTimer)
  		this.clearDefer();
  	
  	this.decorateActive(false);
  	
  	if(m && fold && !m.hidden)
      this.showMenu(false);
  },
  
  deferDeactive : function(fold){
  	this.deactiveTimer = this.deactive.bind(this, fold).timeout(100);
  },
  
  clearDefer : function(){
  	clearTimeout(this.deactiveTimer);
  	this.deactiveTimer = false;
  },
  
  decorateExpand : function(b){
  	b ? this.addClass(this.pCt.expandCS) :
  	    this.delClass(this.pCt.expandCS);
  },
  
/**
 * 当选择菜单后调用
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
	
	decorateSub : function(b){
		b ? this.addClass(this.subCS) : this.delClass(this.subCS);
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
	  
	  //this.domEvent('mouseover', this.mouseoverCallback);
	  //this.domEvent('mouseout', this.mouseoutCallback);
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
 * 默认添加在document.body中,菜单按键导航功能由CC.ui.menu.MenuSelectionProvider提供.
 * @name CC.ui.Menu
 * @class 菜单
 */
CC.create('CC.ui.Menu', CC.ui.Panel, function(superclass) {
return {
	
	hidden : true,
/**
 * 父菜单项,如果存在
 * @type CC.ui.MenuItem
 */
  pItem: null,

/**
 * 菜单项激活时CSS样式
 */
	activeCS :  'itemOn',

/**
 * 当子菜单显示时,附加到菜单项上的样式
 * @type String
 */
  expandCS : 'subHover',
 
	clickEvent : 'mousedown',
	
	//cancelClickBubble : true,
	
	shadow : true,
	
/**
 * @private 
 * 当前激活菜单项
 */
  onItem: null,
	
	selectionProvider : true,
	
  selectionCls : CC.ui.menu.MenuSelectionProvider,
	
	ItemClass : CC.ui.MenuItem,
	
	ct : '_bdy',
	
	menubarCS : 'g-menu-bar',
	
/**
 * 分隔条结点样式
 * @type String
 */	
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
 * 把子菜单menu添加到tar项上,tar可为一个index,或一个MenuItem对象,还可为MenuItem的id
 * 附加子菜单时要按从最先至最后附加,这样事件才会被父菜单接收
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
 * 获得最顶层菜单
 * @return {CC.ui.Menu}
 */
	getRoot : function(){
		var p = this.pItem;
		if(!p)
			return this;
		return p.pCt.getRoot();
	},

/**
 * 隐藏所有关联菜单
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
/**
 * 与父类display方法相比:
 * <li>隐藏时取消菜单激活项
 * @override
 */
	display : function(b){
		if(b === undefined)
			return superclass.display.call(this);
		if(!b){
			var m;
			if(this.onItem)
				this.onItem.deactive(true);
		}
		superclass.display.call(this, b);
		this.onDisplay(b);
		return this;
	}
  ,
/**
 * 可重写该方法添加其它控件的一些样式
 */
  onDisplay : fGo,

/**
 * 是否自动展开子菜单
 * @private
 */
  setAutoExpand : function(b){
  	this.autoExpand = b;
  },
  
/**
 * 添加分隔条
 */
	addSeparator : function(){
		this._addNode(CC.ui.Menu.Separator.view.cloneNode(true));
	},
	
/**
 * 在指定坐标或控件下显示菜单
 * @param {CC.Base|Number} x
 * @param {Number|Boolean} y
 * @param {Boolean} contexted
 * @example
   //在指定坐标显示菜单
   menu.at(110, 120);
   //在指定控件下显示菜单
   menu.at(text);
   //在指定坐标显示菜单,并且点击菜单外部时取消隐藏
   menu.at(110,120,false);
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
  	superclass.destory.call(this);
  	this.each(function(){
  		if(this.subMenu && !this.disabledCascadeDel)
  			var sub = this.subMenu;
  			this.pCt.detach(this);
  			sub.destory();
  	});
  }
};
});

CC.ui.Menu.Separator = CC.$$(CC.$C({tagName:'LI', className:CC.ui.Menu.prototype.separatorCS}));

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
 * @override
 */
  bindContext : function(){
  	return CC.ui.Menu.prototype.bindContext.call(this, this.onContextedRelease);
  }
});
})();
//~@ui/tree.js
/**
 * 树型控件实现
 */
(function(){

var CC = window.CC;

CC.Tpl.def( 'CC.ui.Tree', '<div class="g-tree"><div class="g-panel-body g-panel-body-noheader" id="_scrollor"><ul id="_ctx" class="g-tree-nd-ct  g-tree-arrows" tabindex="1" hidefocus="on"></ul></div></div>' )
      .def( 'CC.ui.TreeItem', '<li class="g-tree-nd"><div class="g-tree-nd-el g-unsel" unselectable="on" id="_head"><span class="g-tree-nd-indent" id="_ident"></span><img class="g-tree-ec-icon" id="_elbow" src="'+CC.Tpl.BLANK_IMG+'"/><img unselectable="on" class="g-tree-nd-icon" src="'+CC.Tpl.BLANK_IMG+'" id="_ico" /><a class="g-tree-nd-anchor" unselectable="on" hidefocus="on" id="_tle"></a></div><ul class="g-tree-nd-ct" id="_bdy" style="display:none;" tabindex="1" hidefocus="on"></ul></li>' )
      .def( 'CC.ui.TreeItemSpacer', '<img class="g-tree-icon" src="'+CC.Tpl.BLANK_IMG+'"/>');

var cbx = CC.ui.ContainerBase;
var spr = cbx.prototype;


CC.create('CC.ui.TreeItem', cbx, /**@lends CC.ui.TreeItem.prototype*/{
	/**
	 * 每个TreeItem都有一个指向根结点的指针以方便访问根结点
	 */
	root : null,
	
	/**
	 * 指明容器结点为视图中ID结点
	 */
	ct : '_bdy',
	
	/**
	 *@override 设置触发Drag的结点ID
	 */
	dragNode : '_head',
	
	/**
	 * 鼠标掠过时样式.
	 */
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
	 */
	elbowLineCS :'g-tree-elbow-line',
	
	springCS : 'spring',
	/**
	 * 鼠标掠过时添加样式的触发结点id
	 *@see Base#bindAlternateStyle
	 */
	mouseoverNode : '_head',
	
	/**
	 * 鼠标掠过时添加样式目标结点id.
	 */
	mouseoverTarget : '_head',
	
	//树结点是否为目录,默认false.
	nodes : false,
	
	//监视子项点击
	clickEvent : 'mousedown',
	
	clickEventNode : '_head',
	/**
	 * 所有子项事件均委托树类发送
	 * @see #fire
	 */
	eventable : false,
	
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
			this.domEvent('dblclick', this.expand, true, null, this._head.view);
			this.domEvent('mousedown', this.expand, true, null, this._elbow.view, false);
		}
		else
			this._head.addClass(this.nodeLeafCS);
		
		this._decElbowSt(false);
	},
	
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
	
	expand : function(b) {
		if(b !== true && b !== false)
			b = !CC.display(this.ct);
		if(this.root.tree.fire('expand', this, b)===false)
			return false;
    this._decElbowSt(b);
    
		CC.display(this.ct,b);
	  this.expanded = b;
	  
		if(this.root.tree.fire('expanded', this, b)===false)
				return false;
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
		var pre = this.children[this.children.length-1];
		spr.add.call(this, item);
		item._decElbowSt();
		item._applyChange(this);
		if(pre){
			pre._decElbowSt();
			pre._applyChange(this);
		}
	},
	/**
	 * 该结点发生变动时重组
	 */
	_applyChange : function(parentNode) {
		//所有事件由据结点的事件监听者接收
		this._applyRoot(parentNode.root);
		this._applySibling();
		this._fixSpacer(parentNode);
		if(this.nodes) {
			this.ItemClass = parentNode.root.ItemClass;
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
  
    //子项点击事件回调,发送clickEvent事件.
   clickEventTrigger : function(e){
     this.root.tree.fire('itemclick', this, e);
   },

/**
 * 以深度优先遍历树目录
 * @param {Function} cb callback, this为treeItem, 参数为 callback(treeItem, counter), 返回false时终止遍历;
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

/**
 * 遍历查找结点(包括当前结点)
 * @param {String} childId
 * @return {CC.ui.TreeItem}
 */
	findH : function(childId){
	  if(this.id === childId)
	  	return this;
	    
	  if(!this.nodes)
	     return false;
	  
	  var n = false;
	  this.eachH(function(){
	  	if(this.id === childId)
	  		return false;
	  });
    
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
	 * 只有在渲染时才能确定根结点
	 */
	onRender : function(){
		this.root = this.pCt.root;
		this._applySibling();
		spr.onRender.call(this);
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

CC.ui.TreeItem.prototype.ItemClass = CC.ui.TreeItem;

var sprs = CC.ui.ContainerBase.prototype;

var undefined = window.undefined;

CC.create('CC.ui.tree.TreeSelectionProvider', CC.util.SelectionProvider, {
		
	selectedCS : 'g-tree-selected',	
	
	//@override
	decorateSelected : function(it, b){
		var h = it._head, c = this.selectedCS, f = h.hasClass(c);
		if(b && !f)
			h.addClass(c);
		else if(f)
			h.delClass(c);
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

CC.ui.TreeItem.prototype.indicatorCls = CC.ui.tree.TreeItemLoadingIndicator;

CC.create('CC.ui.tree.TreeItemLoadingIndicator', CC.ui.Loading, {
	
	onItemMarkIndicator : function(){
		this.target._head.addClass(this.target.loadCS);
	},
	
	onItemStopIndicator : function(){
		var t = this.target;
		t._head.delClass(t.loadCS);
		
		//@bug reminded by earls @v2.0.8 {@link http://www.bgscript.com/forum/viewthread.php?tid=33&extra=page%3D1}
		if(t.loaded)
			t.expand(true);
	}
});

CC.create('CC.ui.Tree', CC.ui.ContainerBase, {
	
	ct : '_ctx',
  
  selectionCls : CC.ui.tree.TreeSelectionProvider,
  
	parentParamName : 'pid',
	
	keyEvent : true,
	
	clickEventTrigger : CC.ui.TreeItem.prototype.clickEventTrigger,
	
	/**
	 * 项的选择事件触发结点为视图中指向的id结点.
	 */
	clickEventNode : '_head',
	
	clickEvent : true,
	
	selectionProvider : true,
	
	initComponent : function() {
		
		sprs.initComponent.call(this);
		
		if(!this.root) {
			opt = {nodes:true, draggable:false, ItemClass:CC.ui.TreeItem};
			this.root = new CC.ui.TreeItem(opt);
		}
		
		this.root.tree = this;
		this.root.setTitle(this.title);
		
		var self = this;
		this.add(this.root);
		this.on('expand', this.onExpand, this);
	},
	
	//自动加载功能
	onExpand : function(item, b) {
		//
		// 如果结点已经加载,忽略.
		//
		if(this.autoConnect  && b){
			this.loadItem(item);
			return (item.children.length>0);
		}
	},
/**
 * 加载子项, 该方法通过子项的connectionProvider来实现载入数据功能.
 */
  loadItem : function(item){
			var url = this.getItemUrl(item);
			if(url){
				var cp = item.getConnectionProvider(), ind = cp.getIndicator();
				if(!ind.isLoaded() && !ind.isBusy())
					cp.connect(url);
		  }
  },

/**
 * 获得子项用于请求数据的url
 */
  getItemUrl : function(item){
  	var url = this.url;
  	if(url){
  		//@bug reminded by earls @v2.0.8 {@link http://www.bgscript.com/forum/viewthread.php?tid=33&extra=page%3D1}
			//contains '?' already ??
		  url+= url.indexOf('?') > 0 ?'&':'?' +encodeURIComponent(this.parentParamName)+'='+encodeURIComponent(item.id);
  	}
  	return url;
  },
  
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
  }
});
})();

//~@ui/datepicker.js
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
      
      if (CC.qtip) 
      	CC.qtip(this.$$('_planeY'), '点击选择或直接输入年份值');
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

    selectYear: function(yy) {
      this.setValue(new Date(yy, this.mm, 1), true);
    },

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
        
      }, false, null, txt);
      
    },

    getSelectListHtml: function() {
      var html = ['<select>'],
          ys = this.selectYearStart || 1900,
          es = this.selectYearEnd || 2100;
      for (var i = ys; i <= es; i++) {
        html.push('<option value="' + i + '">' + i + '</option>');
      }
      html.push('<input type="text" />');
      return html.join('');
    },

    onDayClick: function(evt) {
      var el = Event.element(evt);
      if (el == this.monthWrap) return;
      var id = CC.tagUp(el, 'TD').id;
      if (id.indexOf('/') > 0) this.setValue(new Date(id));
      else this.setValue(new Date(this.yy, parseInt(id), 1), true);
    },

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
      
      if (!this.disableFilter || !this.disableFilter(yy, mm + 1, dd)){
	      this.yy = yy;
	      this.mm = mm;
	      this.dd = dd;
	
	      this.currentDate = v;
	      this.update(pre);
	      if (!cancelEvent) 
	      	this.fire('select', CC.dateFormat(v, this.fmt), v);
      }
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
      var html = [];
      var mm = date.getMonth() + 1,
          yy = date.getFullYear(),
          days = sumDays(yy, mm),
          ct = mm - 1,
          py = date.getFullYear(),
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
        html.push('<tr><td class="month_sep" id="' + i + '"><a href="javascript:fGo()" hidefocus="on">' + (i + 1) + '</a></td>');
        for (var j = 0; j < 7; j++) {
          html.push('<td class="' + cls);
          if (j == 6) html.push(' sateday');
          else if (j == 0) html.push(' sunday');

          if (df) if (df(y, m, psd)) html.push(' disabledday');
          html.push('" id="' + m + '/' + psd + '/' + y + '"><a href="javascript:fGo()" hidefocus="on">' + psd + '</a></td>');

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
        html.push('<td class="month_sep month_r" id="' + (i + 6) + '"><a href="javascript:fGo()" hidefocus="on">' + (i + 7) + '</a></td></tr>');
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

  /**
 * 全局实例
 * 用法 <input type="text" onclick="Datepicker.show(this)" />
 */
  DP.show = function(input) {
    if (!instance) {
      instance = DP.instance = new DP({
        hidden: true,
        showTo: document.body,
        autoRender: true
      });
      instance.on('select', onselect);
    }
    instance.dateFormat = DP.dateFormat;
    instance.bindingEditor = input;
    showDatepicker(true);
  };

  var FP = CC.ui.form.FormElement.prototype;

  /**
 * Datepicker field element
 */
  CC.Tpl.def('CC.ui.form.DatepickerField', '<div class="g-datepicker-field"><input type="text" id="_el" /><a title="点击选择日期" class="trigger" id="_trigger" href="javascript:fGo();"><b> </b></a></div>');

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
    
    onTrackBlur: function() {
      if (!this._leaveFocus && (this.datepicker && this.datepicker.hidden)) {
        this.leaveFocusOn();
        return;
      }
      this.onBlurTrigger();
    },

    /**
   * mousedown -> blur -> timeout
   */
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
        dp.anchorPos(this, 'lb', 'hr', null, true, true);
        dp.bindContext(this.onDatepickerContexted, false, this, null, this, this.contextCS)
          .focus(0);
      }
    },

    onDatepickerContexted: function(evt) {
      var el = Event.element(evt);
      if (this.ancestorOf(el)) return;

      //标记为外部影应,失去焦点
      this.onBlurTrigger();
    },

    onRender: function() {
      FP.onRender.call(this);
      this.setWidth(this.getWidth());
    },

    getDatepicker: function() {
      var dp = this.datepicker;
      if (!dp) {
        dp = this.datepicker = new DP({
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
    	if(Event.isEscKey(e) || Event.isEnterKey(e)){
    		Event.stop(e);
    		this.showDatepicker(false);
    		if(Event.isEnterKey(e))
    			this.getDatepicker().toToday();
    		//取消上传
    		return false;
    	}
    	
    	FP.onKeydownTrigger.apply(this, arguments);
    },
    
    _onDateSelect: function(v) {
      var self = this;
      (function() {
        self.pCt.showDatepicker(false);
        self.pCt.setValue(v);
      }).timeout(this.pCt.applyTimeout);
    },

    setSize: function(a, b) {
      FP.setSize.apply(this, arguments);
      if (a.width) b = a.width;
      if (b !== false) {
        var f = this.fly('_trigger');
        CC.fly(this.element).setWidth(this.width - (f.getWidth() || 22)).unfly();
        f.unfly();
      }
      return this;
    }

  });

  CC.ui.def('datepicker', CC.ui.form.DatepickerField);
})();


//~@ui/msgbox.js
/**
 * @property
 * @template
 */
CC.Tpl.def('Util.alert.input', '<div class="msgbox-input"><table class="swTb"><tbody><tr><td valign="top"><b class="icoIfo" id="_ico"></b></td><td><span id="_msg" class="swTit"></span>&nbsp;<input type="text" style="" class="gIpt" id="_input"/><p class="swEroMsg"><span id="_err"></span></p></span></td></tr></tbody></table></div>');
CC.extendIf(CC.Util, (function(){
	/**
	 * 根据对话框类型过滤按钮
	 * 当前this为过滤字符串
	 * @function
	 * @private
	 * @see CC.ui.ContainerBase#filter
	 */
	function buttonMatcher(item){
		return this.indexOf(item.id)>=0;
	}
	
return {
	/**
	 * 系统对话框引用,如果要获得系统对话框,请用Util.getSystemWin方法.
	 * @private
	 * @see CC.Util#getSystemWin
	 */
	_sysWin : null,
	/**
	 * 返回系统全局唯一对话框.
	 * 该对话框为系统消息窗口.
	 * @function
	 * @return {Dialog} 系统对话框
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
       * 得到inputBox中input元素
       * @function
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
   * @function
   * @param {String} msg 消息
   * @param {String} 标题
   * @param {String} 显示按钮ID,用|号分隔,如ok|cancel|yes|no
   * @param {Function} callback 当对话框返回时回调
   * @param {Win} modalParent 父窗口,默认为document.body层
   * @defButton {String} 聚焦按钮ID,默认为 'ok'
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
   * @function
   * @param {String} msg 消息
   * @param {String} 标题
   * @param {String} 显示按钮ID,用|号分隔,如ok|cancel|yes|no,默认为ok|cancel
   * @param {Function} callback 当对话框返回时回调
   * @param {Win} modalParent 父窗口,默认为document.body层
   * @defButton {String} 聚焦按钮ID,默认为 'ok'
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

//~@ui/tab.js
(function() {

  CC.Tpl.def('CIconButton', '<table unselectable="on" class="g-unsel g-tab-item"><tbody><tr id="_ctx"><td class="tLe" id="_tLe"></td><td class="bdy"><nobr id="_tle" class="g-tle">选卡1</nobr></td><td class="btn" id="_btnC"><a href="javascript:fGo()" title="关闭" id="_trigger" class="g-ti-btn"></a></td><td class="tRi" id="_tRi"></td></tr></tbody></table>');

  var SC = CC.ui.ContainerBase.prototype;

  var SP = CC.ui.Panel.prototype;

  var C = CC.Cache;

  var G = CC.util.dd.Mgr;

  function hideDDRBar() {
    C.put('ItemDDRBarUp', C.get('ItemDDRBarUp').display(false));
  }
  
  CC.create('CC.ui.TabItem', CC.ui.ContainerBase, {
  	
    template: 'CIconButton',
    
    hoverCS: false,
    
    closeable: true,
    
    unselectable: true,
    
    ct: '_ctx',
    
    ondropable: true,
    
    draggable: true,
    
    blockMode: '',

    initComponent: function() {
      SC.initComponent.call(this);
      var c = this.cacheBtnNode = this.dom('_btnC');
      if (c) c.parentNode.removeChild(c);

      this.bindClsEvent();
      this.setCloseable(this.closeable);
    },

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

    getContentPanel: function(autoCreate) {
      var p = this.panel;
      if (!p && autoCreate) {
        //iframe
        p = this.panel = this.src ? new CC.ui.IFramePanel() : new CC.ui.Panel();
      }
      return p;
    },

    _addNode: function(node) {
      if (this.buttonOrient != 'l') this.fly('_tRi').insertBefore(node).unfly();
      else this.fly('_tLe').insertAfter(node).unfly();
    },

    onClsClick: function() {
      this.pCt.close(this);
    },

    bindClsEvent: function() {
      var cls = this.$$(this.closeNode);
      if (!cls) {
        cls = this.addButton({
          id: '_clsBtn',
          blockMode: '',
          icon: 'g-ti-clsbtn'
        });
      }
      //close event.
      this.domEvent('click', this.onClsClick, true, null, cls.view);
      this.domEvent('dblclick', this.onClsClick, true);
      //不影响父容器mousedown事件.
      cls.view.onmousedown = CC.Event.noUp;
    },

    setCloseable: function(b) {
      if (this.cacheBtnNode) {
        this.closeable = b;
        this.$('_clsBtn').display(b);
      }
      else SC.setCloseable.call(this, b);

      return this;
    },

    dragStart: function() {
      G.enableTip = true;
      G.setTitle(this.title.truncate(10));
    },

    dragSBOver: function(item) {
      var b = (item.pCt && item.pCt == this.pCt);
      if (b) {
        //显示方位条
        var pxy = this.absoluteXY(),
        bar = C.get('ItemDDRBarUp');
        pxy[0] -= 9;
        pxy[1] -= bar.getHeight(true) - 2;
        bar.setXY(pxy).display(true);
        C.put('ItemDDRBarUp', bar);
      }
      return b;
    },

    SBDrop: function(tar) {
      var ct = this.pCt;
      ct.invalidate();
      ct.insertBefore(tar, this);
      ct.selectionProvider.select(tar);
      ct.validate();
    },

    dragSBOut: hideDDRBar,

    afterDrop: hideDDRBar,
    
    //@bug  fixed @v2.0.8.3 reminded by robin {@link http://www.bgscript.com/forum/viewthread.php?tid=38&extra=page%3D1}
    destory: function() {
      var p = this.panel;
      if (p) {
        if (p.pCt) p.pCt.remove(p);
        p.destory();
      }
      SC.destory.call(this);
    }

  });
  
  
  CC.create('CC.ui.Tab', CC.ui.Panel, {

    itemWidth: false,

    keyEvent: true,
    
    clickEvent : true,
    
    template: 'AutoScrollLayout',

    inherentCS: 'g-tab',

    keyEventNode: '_scrollor',
    
    selectionCfg : {
	    UP: CC.Event.LEFT,
	    DOWN: CC.Event.RIGHT
    },
    
    maxH: 33,

    ItemClass: CC.ui.TabItem,

    itemLoadCS: 'g-tabitem-loading',

    itemAutoConnect: false,

    destoryItemOnclose: false,

    /**
	   * 主要用于autoscrolllayout布局
	   */
    layoutCfg: {
    	
    	movPanelCS: 'g-mov-tab',
    	    
      horizonMargin: 5,

      /**
         * 该值须与左边导航按钮宽度一致,出于性能考虑,现在把它固定下来。
         * @property {Number} navLeftWidth
         */
      navLeftWidth: 24,

      /**
         * 该值须与右边导航按钮宽度一致,出于性能考虑,现在把它固定下来。
         * @property {Number} navLeftWidth
         */
      navRightWidth: 24
    },

    initComponent: function() {
      
      SP.initComponent.call(this);
      
      this.getSelectionProvider({tracker:true});
      
      if (this.itemAutoConnect)
        this.on('selected', this.onItemSelected);
    },
    
    onItemSelected : function(item){
    	if ((!item.url && !item.src) || !this.itemAutoConnect)
    		return;
    	this.loadItemContent(item);
    	
      var self = this;
      
      (function(){
      	for (var i = 0, len = self.size(); i < len; i++) {
	        var ch = self.children[i];
	        if (ch !== item && ch.panel) {
	          var p = ch.panel;
	          if (!p.hidden) p.display(false);
	        }
        }
        
	      self.displayItem(item, true);
	      if (item.panel)
	       item.panel.display(true);
      }).timeout(0);
    },
    
    /**
     * 如果允许自动加载TabItem内容,监听选择事件并加载内容.
     * 当项选择后才会加载.
     */
    loadItemContent : function(item) {
      var p = item.panel;
      if (!p) {
        p = item.getContentPanel(true);
        
        // 设置默认返回应用html内容
        p.getConnectionProvider().loadType = 'html';
        
        if (this.contentPanel)
        	this.contentPanel.add(p);
      }
      
      else if (p.loaded || p.busy)
        return;
      
      var cp = p.getConnectionProvider();
      
      if (!cp.indicator) {
        //自定Loading标识
        cp.getIndicator({
          markIndicator: this.onItemMarkIndicator,
          stopIndicator: this.onItemStopIndicator
        });
      }

      //Panel指向TAB项的引用
      p.bindingTabItem = item;
      p.getConnectionProvider().connect(item.src || item.url);
    },
    
    /**
     * TabItem内容面板加载时样式设置,这里主要在TabItem上显示一个loading图标.
     */
    onItemMarkIndicator: function() {
      var t = this.target.bindingTabItem;
      //此时的this为loading indicator.
      t.addClass(t.pCt.itemLoadCS);
      t._closeable = t.closeable;
      t.closeable = false;
    },

    onItemStopIndicator: function() {
      //此时的this为loading indicator.
      var tg = this.target,
      t = tg.bindingTabItem;
      if (t) {
        t.delClass(t.pCt.itemLoadCS);
        t.closeable = t._closeable;
        delete t._closeable;
        delete tg.bindingTabItem;
      }
    },

    /**
     * 关闭指定TabItem,当只有一个TabItem时忽略.
     */
    close: function(item) {
      item = this.$(item);
      if (!item.closeable || this.getDisc() == 1) return;
      if (this.fire('close', item) === false) return false;
      this.displayItem(item, 0);
      this.fire('closed', item);
      //@bug  fixed @v2.0.8.3 reminded by robin {@link http://www.bgscript.com/forum/viewthread.php?tid=38&extra=page%3D1}
      if (this.destoryItemOnclose) item.destory();
    },

    //@override
    add: function(it) {
      if(SP.add.call(this, it) === false)
      	return false;
      
      if (it.panel)
      	it.panel.display(false);

      if (this.itemWidth)
      	it.setWidth(this.itemWidth);
    },

    //是否显示指定的TabItem,
    //参数a可为TabItem实例也可为TabItem的id,b为true或false.
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
          this.select(chs[tmp]);
          return;
        }

        tmp = chs.length;
        idx += 1;
        while (idx < tmp && (chs[idx].hidden || chs[idx].disabled)) {
          idx++;
        }
        if (idx < tmp) {
          this.select(chs[idx]);
        }
      }
    },

    //返回显示的TabItem个数.
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

})();


//~@ui/combo.js
//控件HTML模板
CC.Tpl.def('CC.ui.form.Combox', '<div class="g-panel g-combo" tabindex="1" hidefocus="on"><div class="g-panel-wrap g-combo-wrap" id="_wrap"><input type="hidden" id="_el" /><div class="unedit-txt" id="_uetxt"></div><span class="downIco" id="_trigger"></span></div></div>');

/**
 * 继承FormElement类
 * 
 */
CC.create('CC.ui.form.Combox', CC.ui.form.FormElement, function(superclass) {

  function allMather() { return true; }

  var Event = CC.Event;

  return {

    hoverCS: 'g-combo-on',

    uneditCS: 'g-combo-unedit',

    downCS: 'g-combo-dwn',

    selectorCS:'g-combo-list',
    
    _leaveFocus: true,

    maxH: 21,
    
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
      if (!st) {
        st = this.selector = CC.Util.createFolder({
          showTo: document.body,
          shadow: true
        });
      }

      if (array) st.fromArray(array);

      //bind scrolor
      st.scrollor = st.dom('_scrollor');

      this.attach(st);
      this._bindKey();

      if (this.uneditable) {
        delete this.uneditable;
        this.setEditable(false);
      } else this.setEditable(true);

      if (this.selected) st.select(selected);

      //
      // 由于Combox由多个控件拼装而成, 为了能正确捕获Combox控件的blur, focus事件, 
      // 不得不多监听几个事件,并作一处特殊处理.
      //
      this.domEvent('focus', this.onFocusTrigger);
      this.domEvent('blur', this.onBodyBlurTrigger);
      this.domEvent('focus', this.onFocusTrigger, false, null, this.editor.element);
      this.domEvent('blur', this.onBodyBlurTrigger, false, null, this.editor.element);
      this.domEvent('keydown', this.onKeydownTrigger);
      //焦点消失时检查输入值是否是下拉项的某一项,如果有,选择之.
      this.on('blur', this.checkSelected);
    },

    /**
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

    setScrollorHeight: function(h) {
      this.selector.fly('_scrollor').setHeight(h).unfly();
    },

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
      if (!b) {
        this.selector.filter(allMather);
      }
      this.showBox(!b);
    },

    leaveFocusOff: function() {
      if (this._leaveFocus !== false) this._leaveFocus = false;
    },

    leaveFocusOn: function() {
      if (this._leaveFocus !== true) this._leaveFocus = true;
    },

    attach: function(selector) {
      this.selector = selector;

      //selector 与 主体生死存亡
      this.follow(selector);

      selector.display(false);

      //ie hack:
      if (selector.shadow)
        selector.shadow.setZ(999);

      selector.addClass(this.selectorCS)
              .on('selected', this.onSelected, this)
              .on('itemclick', this.onclickEvent, this);

      this._savSelKeyHdr = selector.defKeyNav;

      var self = this;

      selector.selectionProvider.defKeyNav = (function(ev) {
        self._keyHandler(ev, true);
      });
    },

    onBoxContexted: function(evt) {
      var el = Event.element(evt);
      if (this.ancestorOf(el)) return false;

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
 */
    _keyHandler: function(ev, isSelectorEv) {
      var kc = ev.keyCode;
      if (kc == 27 || kc == 13) {
        this.showBox(false);
        return false;
      }
      
      //handle to selector.
      if (!isSelectorEv) {
        var s = this.selector;
        return s.selectionProvider.navigateKey(ev);
      }
    },

    _filtHandler: function(ev) {
      var kc = ev.keyCode, 
          s = this.selector, 
          p = s.selectionProvider;
      if (kc == p.UP || kc == p.DOWN || this.noFilt || kc == 27 || kc == 13) return;

      var v = this.editor.element.value;
      if (v == '') p.select(null);

      if (p.selected && kc != Event.LEFT && kc != Event.RIGHT) p.select(null);

      if (v != this.preValue) {
        s.filter(this.matcher, this);
        this.preValue = v;
      }
      this.leaveFocusOff();
      this.showBox(true);
    },

    showBox: function(b) {
      var s = this.selector;
      var ds = !s.hidden;
      if (b.type) b = !ds;
      if (!b) {
        s.display(false);
        if (!this._leaveFocus) {
          if (!this.uneditable) this.editor.focus(true);
          else this.focus(true);
        }
        this.delClass(this.downCS);
        return;
      }

      this.preferPosition();
      if (this.selector.shadow) this.selector.shadow.reanchor();
      if (!this.uneditable) this.editor.focus(true);
      else this.focus(true);

      if (ds) return;
      this.checkSelected();
      this.addClass(this.downCS);
      s.bindContext(this.onBoxContexted, false, this).display(true);
    },

    //@override
    active : function(){
    	this.showBox(true);
    },
    
    /**
     * 检查输入值是否为下拉选项中的某一项.
     * 如果有多个相同项,并且当前已选其中一项,忽略之,否则选中符合的首个选项.
     */
    checkSelected: function() {
      var s = this.selector, 
          p = s.selectionProvider;

      var v = this.editor.element.value;
      
      if (!v && p.selected) {
        p.select(null);
        return;
      }

      if (p.selected && p.selected.title == v) return;

      p.select(null);

      s.each(function(it) {
        if (!it.hidden && !it.disabled && it.title == this) {
          p.select(it);
          return false;
        }
      },
      v);
    },

    /**
	 * 定位选择容器位置
	 */
    preferPosition: function() {
      var s = this.selector;
      if (!this.noAutoWidth) s.setWidth(this.preferWidth());
      s.anchorPos(this, 'lb', 'hr', null, true, true);
    },

    /**
	 * 返回最佳宽度,重写该函数自定下拉选择容器的宽度
	 * 默认返回combox的宽度
	 */
    preferWidth: function() {
      return this.getWidth();
    },

    _bindKey: function(event) {
      this.domEvent('keydown', this._keyHandler, false, null, this.editor.view);
      this.domEvent('keyup', this._filtHandler, false, null, this.editor.view);
    },

    onSelected: function(item) {
      this.editor.setValue(item.title);
      this.setValue(item.value, item.title, true);
      if (!this.uneditable && this.focused) this.editor.focus(true);
      else this.uneditNode.innerHTML = item.title;
    },

    /**
     * @param v 值
     * @param title 标题
     * @param innerUsed 内部使用
     * @override
     */
    setValue: function(v, title, innerUsed) {
      superclass.setValue.call(this, v || title);
      this.editor.setValue(title || v);

      if (innerUsed !== true && this.selector) {
        this.checkSelected();
      }
      return this;
    },

    /**
     * 当前没选择,返回空或编辑框中的值.
     * @override
     */
    getValue: function() {
      if (!this.selector.selected) {
        superclass.setValue.call(this, this.uneditable ? '': this.editor.getValue());
      }
      return superclass.getValue.call(this);
    },

    /**
	 * 自定过滤重写该函数即可.
	 */
    matcher: function(item) {
      var tle = item.title;
      var v = this.editor.element.value;
      if (v == '') {
        item.setTitle(item.title);
        return true;
      }

      if (tle.indexOf(v) >= 0) {
        //item.addClass('g-match');
        item.dom('_tle').innerHTML = tle.replace(v, '<span class="g-match">' + v + '</span>');
        return true;
      }
      item.setTitle(item.title);
      return false;
    },

    select: function(id) {
      this.selector.select(id);
    }
  };
});
CC.ui.def('combo', CC.ui.form.Combox);

//~@ui/tips.js
/**
 * 浮动提示框,可用于一般的对话提示或鼠标悬浮提示
 * @class CC.ui.FloatTip
 * @super CC.ui.Panel
 */

if(!CC.ie)
  CC.Tpl.def('CC.ui.FloatTip', '<div class="g-float-tip g-clear"><div class="tipbdy"><div id="_tle" class="important_txt"></div><div id="_msg" class="important_subtxt"></div></div><div class="btm_cap" id="_cap"></div></div>');
else 
	CC.Tpl.def('CC.ui.FloatTip', '<table class="g-float-tip g-clear"><tr><td><table class="tipbdy"><tr><td id="_tle" class="important_txt"></td></tr><tr><td id="_msg" class="important_subtxt"></td></tr></table></td></tr><tr><td class="btm_cap" id="_cap"></td></tr></table>');

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
	 * @function
	 * @param {String} msg 提示消息
	 * @param {String} [title] 消息提示标题
	 * @param {DOMElement|CC.Base} [target] 消息提示目录元素,消息将出现在该元素左上方
	 * @param {Boolean} [getFocus] 提示时是否聚焦到target元素,这对于表单类控件比较有用
	 * @param {Number} [timout] 超时毫秒数,即消息显示停留时间
	 * @example
	   CC.Util.ftip('密码不能为空.', '提示', 'input_el', true, 3000);
	 */
	CC.Util.ftip = function(msg, title, proxy, getFocus, timeout){
		if(!instance)
			instance = new CC.ui.FloatTip({showTo:document.body, autoRender:true});
		CC.fly(instance.tail).show().unfly();
		instance.show(msg, title, proxy, getFocus, timeout);
		
		return instance;
	};
	/**
	 * 给目标对象绑定悬浮消息
	 * @param {CC.ui.Base} target
	 * @param {String} msg
	 @example
	   CC.Util.qtip(input, '在这里输入您的大名');
	 */
	CC.Util.qtip = function(proxy, msg){
		if(!instance)
			instance = new CC.ui.FloatTip({showTo:document.body, autoRender:true});
		instance.tipFor(proxy, msg);
	};
	
	return /**@lends CC.ui.FloatTip.prototype*/{
	  /**
	   * @property {Number} timeout = 2500 设置消失超时ms, 如果为0 或 false 不自动关闭.
	   */
	  timeout: 2500,
	/**
	 * 显示提示消息的延迟,消息将鼠标位于目标延迟daly毫秒后出现
	 * @type Number
	 */
		delay : 500,
		
		/**
		 * @property {Boolean} [reuseable = true] 消息提示是否可复用,如果否,在消息隐藏后自动销毁
		 */
		reuseable : true,
	/**
	 * @override
	 */
		shadow:true,
	
	/**
	 * 指定是哪种显示风格,一种为mouseover式提示,另一种为弹出提示
	 */
	  qmode : false,
	  
	  zIndex : 10002,
	/**
	 * mouseover式提示时样式
	 */
	  hoverTipCS : 'g-small-tip',
	  
	  /**
	   * @private
	   * @override
	   */
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
	  
	  //@override
	  display : function(b) {
	    if(arguments.length === 0){
	    	return superclass.display.call(this);
	    }
	
	    //无论怎样,先清除前面一个timout
	    this.killTimer();
	
	    superclass.display.call(this, b);
	    
	    if(!b)
	    	return this;
	    
	    if(this.timeout)
	    	this.timerId = this._timeoutCall.bind(this).timeout(this.timeout);
	    return this;
	  }
	  ,
	
	/**@private*/
	  setRightPosForTarget : function(target){
	  	var f = CC.fly(target), xy = f.absoluteXY();
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
	 * 清除当前超时显示
	 * @param {boolean} check 是否作回收(reuseable)检查
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
	    return this;
	  },
	  
	/**
	 * @param {String} msg 提示消息
	 * @param {String} [title] 消息提示标题
	 * @param {DOMElement|CC.Base} [target] 消息提示目录元素,消息将出现在该元素左上方
	 * @param {Boolean} [getFocus] 提示时是否聚焦到target元素,这对于表单类控件比较有用
	 * @param {Number} [timout] 超时毫秒数,即消息显示停留时间
	 */
	  show : function(msg, title, target, getFocus, timeout){
	  	if(arguments.length == 0)
	  		return superclass.show.call(this);
	  		
	  	this.setMsg(msg, title);
	  	
	  	if(timeout !== undefined)
	  		this.timeout = timeout;
	  	
	  	if(this.qmode)
	  		this.createFtip();
	  	
	  	this.display(true);
	  	if(target){
	    	this.setRightPosForTarget(target);
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
	 * 给目标对象绑定悬浮消息
	 * @param {CC.ui.Base} target
	 * @param {String} msg, 消息
	 @example
	   CC.Util.qtip(input, '在这里输入您的大名');
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
						
						this.timerId = (function(){
							self.setMsg(proxy.qtip || proxy.tip || proxy.title || msg, title);
							CC.fly(self.tail).hide().unfly();
	  	    		if(!self.qmode)
	  	    			self.createQtip();
	  	    		self.display(true)
	  	    		    .setRightPosForHover(globalPos);
						}).timeout(this.delay);
						
	  	  	}, true, this)
	  	  .domEvent('mouseout', this.onTargetMouseout, true, this)
	  	  .unfly();
	  },
	/**@private*/  
		onTargetMouseout : function(evt){
			if(this.qmode)
			   this.display(false);
			if(docEvtBinded){
				Event.un(document, 'mousemove', onDocMousemove);
				docEvtBinded = false;
			}
		},
	/**
	 * 获得全局tip对象
	 */
	  getInstance : function(){
	  	return instance;
	  }
	};
});