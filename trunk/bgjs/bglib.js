/**
 * Javascript Utility for web development.
 * R&D : www.bgscript.com/forum
 * @author javeejy@126.com
 * www.bgscript.com © 2009 - 构建自由的WEB应用 
 */

/**
 * 空函数,什么也不干,象征意义居多.
 * 空调用有什么用?
 * 常见的就有在一个超链接中,可设为<pre><a href="Javascript:fGo()" onclick="funcToRun()"></a></pre>
 * 其次当一个类未实现它的某个方法,但其它类又可能调用到该方法时,为了避免null调用,就可把这方法设为fGo.
 */
function fGo(){};

/**@global */
var CC = (function(){
	  //
	  // 以下为CC对象内部变量.
	  //
	  
    var ua = navigator.userAgent.toLowerCase();
    /**是否合法EMAIL字符串.
     * 参见 CC.isMail()
     */
    var mailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
    
    //产生全局一个唯一ID, 参见CC.uniqueID().
    uniqueId = 0,
   
    //浏览器检测, thanks extJS here, copy & paste, so easy.
    isStrict = document.compatMode == "CSS1Compat",
    isOpera = ua.indexOf("opera") > -1,
    isSafari = (/webkit|khtml/).test(ua),
    isSafari3 = isSafari && ua.indexOf('webkit/5') != -1,
    isIE = !isOpera && ua.indexOf("msie") > -1,
    isIE7 = !isOpera && ua.indexOf("msie 7") > -1,
    isIE6 = !isOpera && ua.indexOf("msie 6") > -1,
    isGecko = !isSafari && ua.indexOf("gecko") > -1,
    isGecko3 = !isSafari && ua.indexOf("rv:1.9") > -1,
    //盒模型?
    isBorderBox = isIE && !isStrict;

    // 修复在IE的一些版本中通过CSS改变元素背景图片会出现重新请求闪烁现象,IE6犹为明显.
    if(isIE && !isIE7){
        try{
            document.execCommand("BackgroundImageCache", false, true);
        }catch(e){}
    }
	  
	 /**
	  * 该方法在创建新类时被调用,依次执行父类构造函数以给子类添加父类属性.
	  * 参见 CC.create()
	  */
    function applyCustructors(obj, superclass, cts){
        for(var i=0,len=cts.length;i<len;i++){
            var c = cts[i];
            if(CC.isArray(c)){
                arguments.callee(obj, superclass,c);
            }
            else if(CC.isFunction(c)){
                CC.extend(obj,c(superclass));
            }
            else { CC.extend(obj, c);}
        }
    }
    
    /*
     * 生成CC对象
     */
    var bg = ({
    		version : '2009.6',
    	  /**
    	   * 根据结点ID值返回该DOM结点.
    	   * 该遍历为广度优先
    	   *@param a {String|DOMElement} id 结点ID,直接一个DOM也没关系
    	   *@param b {DOMElement} 父结点,如果该值指定,将在该结点下查找
    	   *@return {DOMElement} 对应ID的结点,如果不存在返回null
    	   */
        $: function(a,b) {
            var iss = a instanceof String || typeof a == "string";
            if (iss && !b){
                return document.getElementById(a);
            }
            if(!iss){
                return a;
	          }
            if(b.id == a){
                return b;
	          }
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
         * 遍历可以枚举的对象,
         *@param {Object} object 可枚兴的对象,如果为数组或arguments时遍历下标数据,为普通对象时遍历对象所有属性. 
         *@param {function} callback
         *@param args
         */
        each: function(object, callback, args) {

            if (!object) {
                return object;
            }

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
                if (object.length == undefined) {
                    for (var name in object)
                        if (callback.call(object[name], name, object[name]) === false)
                            break;
                } else
                    for (var i = 0, length = object.length, value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]){}
            }

            return object;
        },

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
				
        create: function() {
            var clazz = (function() {
                this.initialize.apply(this, arguments);
            });
    				
    				if(arguments.length == 0)
    					return clazz;
    				
            var absObj = clazz.prototype, parentClass, superclass, type, ags = this.$A(arguments);
            if(CC.isString(ags[0])) {
            	type = ags[0];
            	parentClass = ags[1];
            	ags.shift();
            }else{
            	parentClass = ags[0];
            }
            ags.shift();
            
            if(parentClass)
                superclass = parentClass.prototype;
                
            if(superclass){
                //用于访问父类方法
                clazz.superclass = superclass;
								this.extend(absObj, superclass);
                absObj.superclass = superclass;
            }
    
            
            if(type){
	            absObj.type = type;
	            if(type.indexOf('.')>0){
	            	this.$attr(window, type, clazz);  	
	            }else 
	            window[type]=clazz;
            }
            
            clazz.constructors = ags;
            applyCustructors(absObj, superclass, ags);
            return clazz;
        }
        ,

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
                console.debug('createXMLHttpRequest', ex);
                return false;
            }
        }
        ,
        
        $attr: function(obj, attrList, value) {
            if (this.isString(attrList)) {
                attrList = attrList.split('.');
            }
						var t1;
            for (var i = 0, idx = attrList.length - 1; i < idx; i++) {
                t1 = obj;
                obj = obj[attrList[i]];
                if(typeof obj == 'undefined' || obj === null)
                	t1[attrList[i]] = obj = {};
            }
            if (value == undefined) {
                return obj[attrList[i]];
            }
            obj[attrList[i]] = value;
        }
        ,
        
        queryString : function(obj) {
            if(!obj)
                return '';
            var arr = [];
            for(var k in obj){
                var ov = obj[k], k = encodeURIComponent(k);
                var type = typeof ov;
                if(type == 'undefined'){
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
				    //console.debug('checking field:',v, 'current value:'+obj.value);
				    var value = obj.value, msg = v[1], d = CC.isFunction(v[2])?v[3]:v[2];
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
				    if (CC.isFunction(v[2])) {
				      var ret = v[2](value, obj, form);
				      var pass = (ret !== false);
				      if (CC.isString(ret)) {
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
				      result += (result == '') ? ((typeof obj.name == 'undefined' || obj.name=='') ? obj.id : obj.name) + '=' + value: '&' + v[0] + '=' + value;
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

        uniqueID: function() {
            return uniqueId++;
        }
        ,
        /**
         * 应用对象替换模板内容
         * templ({name:'Rock'},'<html><title>{name}</title></html>');
         * st:0,1:未找到属性是是否保留
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

        isFunction: function(obj) {
            return (obj instanceof Function || typeof obj == "function");
        }
        ,

        isString: function(obj, canEmpty) {
            if (canEmpty) {
                return ((obj instanceof String || typeof obj == "string") && obj != "");
            } else {
                return (obj instanceof String || typeof obj == "string");
            }
        }
        ,

        isArray: function(obj) {
            return (obj instanceof Array || typeof obj == "array");
        }
        ,

        isDate: function(obj) {
            return (obj instanceof Date);
        }
        ,
	
        alert: function(msg) {
            alert(msg);
        }
        ,
	
        tip: function(msg, title, proxy, timeout, getFocus) {
            alert(msg);
        }
        ,
        /**
         * 移除并返回对象属性
         */
        delAttr : function(obj, attrName) {
            if(obj) {
                var t = obj[attrName];
                if(t !== undefined)
                	delete obj[attrName];
                return t;
            }
        },

        addClass: function(o, s) {
            var ss = o.className.replace(s, '');
            ss += ' ' + s;
            o.className = ss;
        }
        ,


        delClass: function(o, s) {
            o.className = o.className.replace(s, "");
        }
        ,
	
        hasClass : function(o, s) {
            return s && (' ' + o.className + ' ').indexOf(' ' + s + ' ') != -1;
        },

        switchClass: function(a, oldSty, newSty) {
            CC.delClass(a, oldSty);
            CC.addClass(a, newSty);
        }
        ,

        setClass: function(o, s) {
            o.className = s;
        },
        /**
         * 以style.display方式设置元素是否可见
         * inline为true时将display设为空,而不是block.
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
				 * 以visibility方式设置元素是否可见
				 */
				seeMe: function(v, b){
					if(b === undefined){
						return CC.$(v).style.visibility != 'hidden';
					}
					
					CC.$(v).style.visibility = b ? 'visible' : 'hidden';
				},
				
        disable: function(v, b) {
            if(arguments.length==1){
                return CC.$(v).disabled;
            }
            CC.$(v).disabled = b;
        }
        ,

        insertAfter: function(oNew, oSelf) {
            var oNext = oSelf.nextSibling;
            if (oNext == null) {
                oSelf.parentNode.insertBefore(oNew, oSelf);
            } else {
                oSelf.parentNode.insertBefore(oNew, oNext);
            }
            return oNew;
        },
  
        isNumber: function(ob) {
            return (ob instanceof Number || typeof ob == "number");
        }
        ,

        isMail : function(strMail) {
            return mailReg.test(strMail);
        },
	
        isUndefined: function(object) {
            return typeof object == "undefined";
        }
        ,
  
        today: function() {
            return new Date();
        }
        ,


        ddmmyy: function(date) {
            var d = date.getDate();
            if (d < 10) {
                d = "0" + d;
            }
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }
            var fyear = date.getFullYear();
            return d + "/" + month + "/" + fyear;
        }
        ,


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
  
        $C: function(a) {
            if (this.isString(a)) {
                return document.createElement(a);
            }
            var tag = a.tagName;
            delete a.tagName;
            var b = this.extend(document.createElement(tag), a);
            a.tagName = tag;
            return b;
        }
        ,
        $N: function(name) {
            return document.getElementsByName(name);
        },
        
       	tagUp : function(dom, tag){
        	while(dom && dom.tagName != tag){
        		dom = dom.parentNode;
        		if(dom && dom.tagName == 'BODY')
        			return null;
        	}
        	return dom;
        },
         
        loadScript: function(id, url) {
            var oHead = this. $T('head')[0];
            var script = this. $C( {
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
        
        loadCSS: function(id, url) {
            var oHead = this. $T('head')[0];
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
            return ss;
        }
        ,

        noCache: function() {
            return '&noCacheReq=' + (new Date()).getTime();
        }
        ,

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

        frameDoc : function(frame) {
            return frame.contentWindow ? frame.contentWindow.document:frame.contentDocument;
        },
 	
        frameWin : function(frame){
            return frame.contentWindow;
        },
		    
        getViewWidth : function(full) {
            return full ? this.getDocumentWidth() : this.getViewportWidth();
        },

        getViewHeight : function(full) {
            return full ? this.getDocumentHeight() : this.getViewportHeight();
        },

        getDocumentHeight: function() {
            var scrollHeight = (document.compatMode != "CSS1Compat") ? document.body.scrollHeight : document.documentElement.scrollHeight;
            return Math.max(scrollHeight, this.getViewportHeight());
        },

        getDocumentWidth: function() {
            var scrollWidth = (document.compatMode != "CSS1Compat") ? document.body.scrollWidth : document.documentElement.scrollWidth;
            return Math.max(scrollWidth, this.getViewportWidth());
        },

        getViewportHeight: function(){
            if(isIE){
                return isStrict ? document.documentElement.clientHeight :
                         document.body.clientHeight;
            }else{
                return self.innerHeight;
            }
        },

        getViewportWidth: function() {
            if(isIE){
                return isStrict ? document.documentElement.clientWidth : document.body.clientWidth;
            }else{
                return self.innerWidth;
            }
        },
  			
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
    });
    
bg.extendIf(String.prototype,  (function(){
    var allScriptText = new RegExp('<script[^>]*>([\\S\\s]*?)<\/script>', 'img');
    var onceScriptText = new RegExp('<script[^>]*>([\\S\\s]*?)<\/script>', 'im');
    var allStyleText = new RegExp('<style[^>]*>([\\S\\s]*?)<\/style>', 'img');
    var onceStyleText = new RegExp('<style[^>]*>([\\S\\s]*?)<\/style>', 'im');
  
    return ({
        //删除两头空格.
        trim: function() {
            return this.replace(new RegExp("(^[\\s]*)|([\\s]*$)", "g"), "");
        },
  
        escape: function() {
            return escape(this);
        }
        ,
	
        unescape: function() {
            return unescape(this);
        }
        ,
        
        checkSpecialChar : function(flag,oObj){
            var reg=/[%\'\"\/\\]/;
            if( this.search( reg )!=-1){
                if(flag){
                //CC.showSysMsg('error',"Be careful of characters such as ＂ % \' \" \\ \/ etc.",oObj,3000);
                }
                return false;
            }
            return true;
        },

        truncate: function(length, truncation) {
            length = length || 30;
            truncation = truncation === undefined ? '...' : truncation; return this.length > length ? this.slice(0, length - truncation.length) + truncation: this;
        }
        ,

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
        innerScript: function() {
            this.match(onceScriptText); return RegExp.$1;
        }
        ,

        innerStyle: function() {
            this.match(onceStyleText); return RegExp.$1;
        }
        ,

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

        execStyle: function() {
            return this.replace(allStyleText, function(ss) {
                //IE 不直接支持RegExp.$1??.
                ss.match(onceStyleText); CC.loadStyle(RegExp. $1); return '';
            }
            );
        },
  
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


bg.extendIf(Array.prototype,  {
	
    //p:the index or the obj in arr,return the length
    remove: function(p) {
        if (CC.isNumber(p)) {
            if (p < 0 || p >= this.length) {
                throw "Index Of Bounds:" + this.length + "," + p;
            }
            this.splice(p, 1)[0]; return this.length;
        }
        if (this.length > 0 && this[this.length - 1] == p) {
            this.pop();
        } else {
            var pos = this.indexOf(p);
            if (pos !=  - 1) {
                this.splice(pos, 1)[0];
            }
        }
        return this.length;
    }
    ,

    indexOf: function(obj) {
        for (var i = 0, length = this.length; i < length; i++) {
            if (this[i] == obj)return i;
        }
        return  - 1;
    }
    ,

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

if (!window.Event) {
    window.Event = new Object;
}

bg.extend(Event,  {
    KEY_BACKSPACE: 8,
    KEY_TAB: 9,
    KEY_ENTER: 13,
    KEY_ESC: 27,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_DELETE: 46,
		
		readyList : [],
		
		contentReady : false,
		
    noUp : function(ev) {
        Event.stop(ev||window.event);
    },
 
    noSelect: function() {
        return false;
    },

    //get event.srcElement
    element: function(ev) {
        return ev.srcElement || ev.target;
    }
    ,
	
    pageX : function(ev) {
        if ( ev.pageX == null && ev.clientX != null ) {
            var doc = document.documentElement, body = document.body;
            return ev.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
        }
        return ev.pageX;
    },
	
    pageY : function(ev) {
        if ( ev.pageY == null && ev.clientY != null ) {
            var doc = document.documentElement, body = document.body;
            return ev.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
        }
        return ev.pageY;
    },
	
    pageXY : function(ev) {
        if ( ev.pageX == null && ev.clientX != null ) {
            var doc = document.documentElement, body = document.body;
            return [ev.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0),
            ev.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0)];
        }
        return [ev.pageX, ev.pageY];
    },
	
    which : function(ev) {
        if ( !ev.which && ((ev.charCode || ev.charCode === 0) ? ev.charCode : ev.keyCode) )
            return ev.charCode || ev.keyCode;
    },
	
    isLeftClick: function(ev) {
        return (((ev.which)
            && (ev.which == 1)) || ((ev.button) && (ev.button == 1)));
    }
    ,
    isEnterKey: function(ev) {
        return (ev.keyCode == 13);
    },
  
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
    preventDefault : function(ev) {
        if(ev.preventDefault)
            ev.preventDefault();
        ev.returnValue = false;
    },
  
    stopPropagation : function(ev) {
        if (ev.stopPropagation)
            ev.stopPropagation();
        ev.cancelBubble = true;
    },
  
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
  
    observers: false,

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

    unloadCache: function() {
        if (!this.observers) {
            return ;
        }

        for (var i = 0; i < this.observers.length; i++) {
            this.removeListener.apply(this, this.observers[i]);
            this.observers[i][0] = null;
        }
        this.observers = false;
    }
    ,
    //Warning : In IE6 OR Lower 回调observer时this并不指向element.
    addListener: function(element, name, observer, useCapture) {
        useCapture = useCapture || false;

        if (name == 'keypress' && (navigator.appVersion.match( / Konqueror | Safari | KHTML / )
            || element.attachEvent)) {
            name = 'keydown';
        }
        this._observeAndCache(element, name, observer, useCapture);
    }
    ,

    removeListener: function(element, name, observer, useCapture) {
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
     * 在RIA中不建议用该方式实现元素拖放,而应实例化一个CBase对象,使之具有一个完整的控件生命周期.
     */
    setDragable: function(dragObj, moveObj, b, fnOnMov, fnOnDrag, fnOnDrog) {
        if (!b) {
            dragObj.onmousedown = dragObj.onmouseup = null;
            return ;
        }

        var fnMoving = function(event) {
            var ev = event || window.event;
            if (!Event.isLeftClick(ev)) {
                dragObj.onmouseup(); return ;
            }

            if (moveObj && fnOnDrag && !moveObj.__ondraged) {
                fnOnDrag(ev, moveObj); moveObj.__ondraged = true;
            }

            if (fnOnMov) {
                if (!fnOnMov(ev, moveObj)) {
                    return false;
                }
            }

            var x = ev.clientX;
            var y = ev.clientY;
            var x1 = x - moveObj._x;
            var y1 = y - moveObj._y;
            moveObj._x = x;
            moveObj._y = y;

            moveObj.style.left = moveObj.offsetLeft + x1;
            moveObj.style.top = moveObj.offsetTop + y1;
        };

        var msup = function(event) {
            if (moveObj && moveObj.__ondraged) {
                fnOnDrog(event || window.event, moveObj); moveObj.__ondraged = false;
            }
            window.document.ondragstart = function(event) {
                (event || window.event).returnValue = true;
            };
      
            Event.removeListener(document, "mousemove", fnMoving);
            Event.removeListener(document, 'mouseup', arguments.callee);
            Event.removeListener(document, "selectstart", Event.noSelect);
        };
        
        dragObj.onmousedown = function(event) {
        		if(moveObj.unmoveable)
        			return;
            var ev = event || window.event;
            var x = ev.clientX;
            var y = ev.clientY;
            moveObj._x = x;
            moveObj._y = y;
            window.document.ondragstart = function(event) {
                (event || window.event).returnValue = false;
            };
      
            Event.addListener(document, "mousemove", fnMoving);
            Event.addListener(document, "selectstart", Event.noSelect);
            Event.addListener(document, 'mouseup', msup);
        };
    },
    
    ready : function(callback) {
    	this.readyList.push(callback);
    },
    
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

if(!window.console)
    	window.console = {};
bg.extendIf(window.console, {debug : fGo,info : fGo,trace : fGo,log : fGo,warn : fGo,error : fGo,assert:fGo,dir:fGo,count : fGo,group:fGo,groupEnd:fGo,time:fGo,timeEnd:fGo});

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
	Event.addListener(window, "load", Event._onContentLoad);

////
window.Eventable = (function(opt){
    if(!opt)
      this.events = {};
    else this.events = opt.events || {};
    CC.extend(this,Eventable.prototype);
});


Eventable.prototype.fire = (function(eid/**,arg1,arg2,arg3,...,argN*/){
	
    var evtMap = this.evtMap;
    if(evtMap){
        if(evtMap[eid])
            eid = evtMap[eid];
    }
	
    var fnArgs = CC.$A(arguments);
    fnArgs.remove(0);
    console.debug('发送:%o,源:%o',arguments,this);
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
    if(this.subscribers){
    	var sr;
    	for(i=0,len=this.subscribers.length;i<len;i++){
    		sr = this.subscribers[i];
    		sr.fireSubscribe.apply(sr, arguments);
    	}
    }
    return ret;
});

Eventable.prototype.on = (function(eid,callback,ds,objArgs){
    if(!eid || !callback)
        console.error('eid or callbakc not not be null:%o',arguments);
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

Eventable.prototype.un = (function(eid,callback){
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

Eventable.prototype.trans = (function(old,ne){
    if(!this.evtMap){
        this.evtMap = {
            old:ne
        };
        return;
    }
    this.evtMap[old] = ne;
    return this;
});
/**
 * 订阅对象所有事件
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
 */
Eventable.prototype.fireSubscribe = Eventable.prototype.fire

bg.extendIf(Function.prototype, {
	bind : function() {
    var _md = this, args = CC.$A(arguments), object = args.shift();
    return function() {
        return _md.apply(object, args);
    }
  },
  
	bindAsListener : function(self) {
	    var _md = this;
	    return function(event) {
	        return _md.call(self, event||window.event);
	    }
	},
	
	bindAsNoCaptureListener : function() {
	    var _md = this, args = CC.$A(arguments), object = args.shift();
	    return function(event) {
	        event = event || window.event;
	        Event.stop(event);
	        return _md.apply(object, [event].concat(args));
	    }
	},

	timeout : function(seconds, interval){
		if(interval)
			return setInterval(this, seconds || 0);
		return setTimeout(this, seconds || 0);
	}
});

window.Ajax = bg.create();

Ajax.connect = (function(option){
    var ajax = new Ajax(option);
    ajax.connect();
    return ajax;
});

Ajax.prototype =  {
	
    method :'GET',
	
    url : null,
	
    asynchronous: true,
  
    timeout: 10000,
  
    disabledComp: null,
    
    contentType: 'application/x-www-form-urlencoded',
      
    msg: "数据加载中,请稍候...",
      
    //是否忽略浏览器缓存,默认为true.
    noCache:true,
      
    //XMLHttpRequest对象.
    xmlReq: null,
      
    //用于调用onfailure,onsuccess函数的this对象.
    caller: null,
  
    //失败后的回调.
    onfailure: null,
  
    data : undefined,
  
    //设置成功后的回调,默认为运行服务器返回的数据内容.
    onsuccess: (function(ajax) {
        ajax.invokeHtml();
    }),
  
    onfinal : null,
      
    //如果数据已加载,数据显示的DOM面板.
    displayPanel: null,
  
    //是否显示加载图标或进度.
    ui: true,
  
    //指明当前Ajax是否处理请求处理状态,在open后直至close前该值为真
    busy : false,
  
    /**
   * 根据设置初始化.
   */
    initialize: function(options) {
        Eventable.call(this,options);
        CC.extend(this, options);
    }
    ,
  
    /**
   * 重设置.
   *@param {Object} opts
   */
    setOption: function(opts) {
        CC.extend(this, opts);
    }
    ,
	
    /**
	 * 重写以实现自定消息界面,用于进度的消息显示,默认为空调用.
	 */
    setMsg: fGo
    ,

    _onTimeout: function() {
        if (this.xmlReq.readyState >= 4) {
            return ;
        }
        this.abort();
        this.setMsg("time out.");
    }
    ,

    _close: function() {
        if(this.timeout)
            clearTimeout(this._tid);
        if(this.onfinal)
            if(this.caller)
                this.onfinal.call(this.caller,this);
            else
                this.onfinal.call(this,this);
        this.fire('final',this);
        
        if (this.disabledComp) {
            CC.disable(this.disabledComp, false)
        };
        if(!CC.isUndefined(this.json))
            delete this.json;
        if(!CC.isUndefined(this.xmlDoc))
            delete this.xmlDoc;
    
        if(!CC.isUndefined(this.text))
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
    _req : function(){
        if(!this.xmlReq)
            this.xmlReq = CC.ajaxRequest();
    },
  
    _setHeaders: function() {
        this._req();
        if (this.method.toLowerCase() == 'post') {
            this.xmlReq.setRequestHeader('Content-type', this.contentType + (this.encoding ? '; charset=' + this.encoding: ''));
        }
    }
    ,
    /**
   * 建立XMLHttpRequest连接,在调用该方法后调用send方法前可设置HEADER.
   */
    open: function() {
        this._req();
        this.busy = 1;
        this.fire('open',this);
        if (this.timeout) {
            this._tid = setTimeout(this._onTimeout.bind(this), this.timeout);
        }

        if (this.disabledComp) {
            CC.disable(this.disabledComp, true);
        }
    
        var ps = this.params, ch = this.noCache;
        if(ps || ch){
            var isQ = this.url.indexOf('?') > 0;
            if(ch){
                if (isQ)
                    theUrl = this.url + '&__uid=' + CC.uniqueID();
                else
                    theUrl = this.url + '?&__uid=' + CC.uniqueID();
            }
	  	
            if(ps){
                if(!isQ && !ch)
                    this.url = this.url+'?';
	  			
                this.url = this.url + CC.queryString(ps);
            }
        }
        this.xmlReq.open(this.method.toUpperCase(), theUrl, this.asynchronous);
    }
    ,

    send: function(data) {
        this.fire('send');
        this._setHeaders();
        this.xmlReq.onreadystatechange = this._onReadyStateChange.bind(this);
        this.setMsg(this.msg);
        this.xmlReq.send(data || this.data);
    }
    ,

    connect : function(data) {
        if(this.busy)
            try{
                this.abort();
            }catch(e){
                console.debug(e);
            }
			
        this.open();
        this.send(data);
    },
	
    setRequestHeader: function(key, value) {
        this._req();
        this.xmlReq.setRequestHeader(key, value);
    }
    ,

    getResponseHeader: function(key) {
        return this.xmlReq.getResponseHeader(key);
    }
    ,

    _onReadyStateChange: function() {
        var req = this.xmlReq;
        if (req.readyState == 4) {
        		if(this.fire('load', this) === false)
        			return;
            var onsuccess = this.onsuccess;
            var onfailure = this.onfailure;
            // req.status 为 本地文件请求
            try{
                if (req.status == 200 || req.status == 0) {
                		if(this.fire('success', this) === false)
                			return false;
                    if(onsuccess)
                        if(this.caller)
                            onsuccess.call(this.caller, this);
                        else onsuccess.call(this,this);
                } else {
										if(this.fire('failure', this) === false)
                			return false;
                    if(onfailure)
                        if(this.caller)
                            onfailure.call(this.caller, this);
                        else onfailure.call(this,this);
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
	
    getText : function() {
        if(this.text)
            return this.text;
        var s = this.text = this.xmlReq.responseText;
        this.fire('text',s,this);
        return this.text;
    },

    getXmlDoc : function() {
        if(this.xmlDoc)
            return this.xmlDoc;
        var doc = this.xmlDoc = this.xmlReq.responseXML.documentElement;
        this.fire('xmlDoc',doc,this);
        return this.xmlDoc;
    },
	
    getJson : function(){
        if(this.json)
            return this.json;
        var o = undefined;
        try {
            this.json = o = eval("("+this.getText()+");");
        }catch(e) {
            console.debug(e+"\n"+this.getText());
            CC.alert('Internal server error : a request responsed with wrong json format.');
            throw e;
        }
        //可对json进行预处理
        this.fire('json',o,this);
        return this.json;
    }
    ,

    invokeScript: function() {
        return eval(this.getText());
    }
    ,

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


/**
 * 缓存类.
 */
window.Cache =  {

    /**某类设置的最大缓存数量.*/
    MAX_ITEM_SIZE: 5,

    /**获取缓存数据的回调函数.*/
    callbacks: [],

    register: function(k, callback) {
        this[k] = [null, callback];
    }
    ,

    get: function(k) {
        var a = this[k];
        if(a === undefined)
            return null;
    		var b = a[1];
        a = a[0];
        
        if(a === null){
        	return b();
        }
        	
        if(a.length > 0)
            return a.shift();
        if(b)
            return b();
        
        return null;
    }
    ,

    put: function(k, v) {
        var a = this[k];
        if(!a){
            this[k] = a = [[v]];
            return;
        }
        var c = this[k][0];
        if(!c)
        	this[k][0] = c = [];
        if (c.length >= this.MAX_ITEM_SIZE) {
            return ;
        }
        
        c.push(v);
    },
    
    remove : function(k){
    	var a = this[k];
    	if(a){
    		delete this[k];
    	}
    }
};

/**
 * 缓存DIV结点,该结点可方便复用其innerHTML功能.
 */
Cache.register('div', function() {
    return CC. $C('DIV');
}
);

window.CBase = (function(dom){
    if(dom !== undefined)
        this.view = CC.$(dom);
});

var CompCache = {};

Event.addListener(window, 'unload', function(ev){
	try{
		for(var i in CompCache){
			CompCache[i].destoryComponent();
		}
	}catch(e){console.debug(e);}
});

//thanks Ext JS here.
var view = document.defaultView;
// local style camelizing for speed
var propCache = {};
var camelRe = /(-[a-z])/gi;
var camelFn = function(m, a){ return a.charAt(1).toUpperCase(); };

var hidMode = {visibility:'hidden', display:'none'};
var dispMode = {visibility:'visible', display:'block'};
/**
 * 
 * 控件基类.
 *
 */
bg.extend(CBase.prototype,{

    type: 'CBase',

    view: null,

    clickCS : false,
    
    hoverCS : false,
	  
    disabled : false,

    height:false,
	
    width : false,
	
    left:false,
    
    top:false,
	
    minW:0,
    
    minH:0,
    
    maxH:Math.MAX,
    
    maxW:Math.MAX,

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

		createView : function(){
        if(this.template && !this.view){
            //default template.
            this.view = CTemplate.$(this.template);
            delete this.template;
        }else if(!this.view){
        	this.view = CTemplate.$(this.type);
        }else if(CC.isString(this.view)){
        	this.view = CC.$(this.view);
        }
	  		
        if (!this.view)
            this.view = CC.$C('DIV');			
		},
		
    initComponent : function() {
    		var cid = this.cacheId = 'c' + CC.uniqueID();
    		CompCache[cid] = this;
				
				this.createView();
    		
        if(this.strHtml){
            this.html(CTemplate[this.strHtml]);
            delete this.strHtml;
        }
    
        if (this.viewAttr) {
            CC.extend(this.view, this.viewAttr);
            delete this.viewAttr;
        }
			
        if(this.tip){
            //设置鼠标提示.
            this.setTip(this.tip===true?this.title:this.tip);
        }
    		
    		if(this.inherentCS)
    			this.addClass(this.inherentCS);
    		
        if(this.cs) {
            this.addClass(this.cs);
            delete this.cs;
        }
    
        if(!this.id)
            this.id = 'comp'+CC.uniqueID();
    
        if(!this.view.id)
            this.view.id=this.id;

        if(this.title){
        	this.setTitle(this.title);
    	  }
    	  
        if(this.icon) {
            this.setIcon(this.icon);
        }
    
        if(this.clickCS) {
            var cp = this._csIf('clickCS', 'click');
            this.bindClickStyle(cp);
            delete this.clickCS;
        }
    
        if(this.hoverCS){
            var cp = this._csIf('hoverCS', 'on');
            this.bindHoverStyle(cp);
            delete this.hoverCS;
        }
    
        if(this.unselectable)
            this.noselect();

        if(this.draggable) {
            //el, ondrag, ondrop, ondragstart,onmousedown,onmouseup, caller
            this.enableDragBehavior(this.draggable);
        }
  	
        if(this.ondropable){
            this.enableDropBehavior(this.ondropable);
        }
    		
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
				
				if(this.shadow){
    			this.shadow = new CShadow({target:this});
    			this.follow(this.shadow);
    		}
    },
   
  	follow : function(a){
  		var ls = this.__toDestory;
  		if(!ls)
  			ls = this.__toDestory = [];
  		ls.push(a);
  		if(!a.parentContainer)
  			a.parentContainer = this;
  		if(this.rendered && !a.rendered)
  			a.render();
  		return this;
  	},
    
    destoryComponent : function(){
     	delete CompCache[this.cacheId];
    	this.del();
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
	      delete this.observes;
    	}
    	obs = this.__toDestory;
    	if(obs){
    		for(i=0,len=obs.length;i<len;++i){
    			obs[i].destoryComponent();
    		}
    		delete this.__toDestory;
    	}
    },
    //
    // 子类应该重写该方法而不应该直接重写render方法
    //
    onRender : function(parentContainer, pos){
				if(this.hidden)
					this.display(0);
				
        var pc = parentContainer;
        if(!pc && this.showTo)
            pc = CC.$(this.showTo);
			  
        if(pc){
            pc = (pc.view||pc);
			
            if(this.showTo){
                delete this.showTo;
            }
			
            if(pos === undefined) {
                pc.appendChild(this.view);
            }else if(CC.isNumber(pos)){
                var c = pc.childNodes[pos];
                if(c)
                    pc.insertBefore(this.view, c);
            }
        }
        
      var obs = this.__toDestory;
    	if(obs){
    		for(var i=0,len=obs.length;i<len;i++){
    			if(!obs[i].rendered)
    				obs[i].render();
    		}
    	}
    },
    
    render : function(parentContainer, pos) {
        if(this.rendered || this.fire('render', this)===false)
            return false;
        this.rendered = true;
				this.onRender(parentContainer, pos);
        this.fire('rendered', this);
        if(this.hidden){
            delete this.hidden;
        }else if(this.shadow){
        	this.shadow.reanchor();
        	this.shadow.display(true);
        }
    },
	
    fire : fGo,
		
		hide : function(){
			return this.display(false);
		},
		
		show : function(){
			return this.display(true);
		},
		
		fly : function(childId){
			var el = this.dom(childId);
			if(el){
				return CC.fly(el);
			}
			return null;
		},
		
		unfly : function(){
			if(this.__flied === true){
				this.view = null;
				this.displayMode = 'display';
	  		this.blockMode = 'block';
				this.width = this.top = this.left = this.height = false;
				Cache.put('flycomp', this);
			}
		},
	
    addClass: function(s) {
        var v = this.view;
        var ss = v.className.replace(s, '');
        ss += ' ' + s;
        v.className = ss;
        return this;
    }
    ,

    delClass: function(s) {
        var v = this.view;
        v.className = v.className.replace(s, "");
        return this;
    }
    ,
	
    hasClass : function(s) {
        return s && (' ' + this.view.className + ' ').indexOf(' ' + s + ' ') != -1;
    },
	
    switchClass: function(oldSty, newSty) {
        this.delClass(oldSty);
        this.addClass(newSty);
        return this;
    }
    ,

    setClass: function(s) {
        this.view.className = s;
        return this;
    }
    ,

    $T: function(tagName) {
        return this.view.getElementsByTagName(tagName);
    }
    ,
  
    dom : function(childId) {
        return CC.$(childId, this.view);
    },
  
    noUp : function(eventName, childId) {
        return this.domEvent(eventName || 'click', Event.noUp, true, null, childId);
    },
  
    clear: isIE ? function() {
        var dv = Cache.get('div');
        var v = this.view;
        while (v.firstChild) {
            dv.appendChild(v.firstChild);
        }
        dv.innerHTML = '';
        Cache.put('div', dv);
    } : function(){
        var v = this.view;
        while (v.firstChild) {
            v.removeChild(v.firstChild);
        }
        return this;
    },
	
    del : function(){
        if(this.view.parentNode)
            this.view.parentNode.removeChild(this.view);
    },
    
	  displayMode : 'display',
	  
	  blockMode : 'block',
    
    /**
   * 显示或隐藏某结点,v可以是结点id或结点.
   * 如果是id,则结点必须在dom树中.
   */
   display: function(b) {
     if (b === undefined) {
     	return this.view.style[this.displayMode] != hidMode[this.displayMode];
     }
     
		 this.view.style[this.displayMode] = b ? this.blockMode : hidMode[this.displayMode];
		 if(this.shadow){
		 	if(b)
		 		this.shadow.reanchor();
		 	this.shadow.display(b);
		 }
		 return this;
   },
   
   setBlockMode : function(bl){
   		this.blockMode = bl;
   		return this;
   },
   
   setDisplayMode : function(dm){
   	this.displayMode = dm;
   	if(dm == 'visibility')
   		this.blockMode = dispMode[dm];
   	return this;
   },
   
    /**
   * 检查或设置DOM的disabled属性值.
   */
    disable: function(b) {
  	
        if(arguments.length==0){
            return this.disabled;
        }
  	
        var v = this.disableNode || this.view;
        this.dom(v).disabled = b;
        this.disabled = b;
    
        if(b)
            this.addClass(this.disabledCS || 'g-disabled');
        else
            this.delClass(this.disabledCS || 'g-disabled');
    	
        return this;
    },
	
    enableDragBehavior : function(b){
        b?this.bindDragDrop() : this.unDragDrop();
    },
	
    enableDropBehavior : function(b) {
        b?this.bindDDRListener() : this.unDDRListener();
    },
	
    append : function(oNode){
        this.view.appendChild(oNode.view || oNode);
        return this;
    },

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
		
        (this.container||this.view).innerHTML = ss;
        return this;
    },
	
    appendTo : function(where) {
        where.type ? where.append(this.view) : CC.$(where).appendChild(this.view);
        return this;
    },
    /**
   * 在结点之后插入oNew
   */
    insertAfter: function(oNew) {
        var f = CC.fly(oNew);
        oNew = f.view;
        var v = this.view;
        var oNext = v.nextSibling;
        if (oNext == null) {
            v.parentNode.appendChild(oNew);
        } else {
            v.parentNode.insertBefore(oNew, oNext);
        }
        f.unfly();
        return this;
    },
  
    insertBefore : function(oNew) {
        oNew = CC.$$(oNew).view;
        this.view.parentNode.insertBefore(oNew, this.view);
        return this;
    },
  
    setZ : function(zIndex) {
        this.style("z-index", zIndex);
        return this;
    },

    style : function(style,value) {
        //getter
        if(value === undefined) {
            return this.getStyle(style);
        }
        return this.setStyle(style,value);
    },

    getOpacity : function () {
        return this.getStyle('opacity');
    },
	
    //设置结点的透明度.
    setOpacity : function (value) {
        this.view.style.opacity = value == 1 ? '' : value < 0.00001 ? 0 : value;
        return this;
    },
	
    //设置结点风格.
    //如 CC.setStyle(oDiv,'position','relative');
    setStyle : function (key, value) {
        if (key == 'opacity') {
            this.setOpacity(value)
        } else {
            var st = this.view.style;
            st[
            key == 'float' || key == 'cssFloat' ? ( st.styleFloat === undefined ? ( 'cssFloat' ) : ( 'styleFloat' ) ) : (key.camelize())
            ] = value;
        }
        return this;
    },
    //Ext
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
		 * 先添加默认图标样式this.iconCS，再添加参数样式。
		 */
    setIcon: function(cssIco) {
        var o = this.fly(this.iconNode || '_ico');
        if(this.iconCS)
            if(!this.hasClass(this.iconCS))
                this.addClass(this.iconCS);
				
        if(o){
            if(CC.isString(cssIco))
                o.addClass(cssIco);
            else
                o.display(cssIco);
        	  o.unfly();
        }
        return this;
    }
    ,

    setTip:function(ss){
        if(this.tip !== false){
            if(this.view && ss){
                this.view.title = ss;
            }
        }
        return this;
    },
	
    setTitle: function(ss) {
        this.title = ss;
        if(!this.titleNode)
        	this.titleNode = this.dom('_tle');
        else if(!this.titleNode.tagName)
        	this.titleNode = this.dom(this.titleNode);
        if(this.titleNode)
        	this.titleNode.innerHTML = this.brush ? this.brush(ss):ss;
        this.setTip(this.tip||ss);
        return this;
    }
    ,

    setWidth: function(width) {
        this.setSize(width, false);
        return this;
    }
    ,

    getWidth : function(usecache){
        if(usecache && this.width !== false)
            return this.width;
        return this.getSize().width;
    },
	
    setHeight: function(height) {
        this.setSize(false, height);
        return this;
    }
    ,

    getHeight:function(usecache){
        if(usecache &&  this.height !== false)
            return this.height;
        return this.getSize().height;
    },
    
    setSize : function(a, b) {
        if(a.width !== undefined){
            var c = a.width;
            if(c !== false){
                if(c<this.minW) c=this.minW;
                if(c>this.maxW) c=this.maxW;
                this.style('width', c + 'px');
                this.width = c;
            }
            c=a.height;
            if(c !== false){
                if(c<this.minH) c=this.minH;
                if(c>this.maxH) c=this.maxH;
                if(c<0) a.height=c=0;
                this.style('height', c + 'px');
                this.height = c;
            }
            return this;
        }
		
        if(a !== false){
            if(a<this.minW) a=this.minW;
            if(a>this.maxW) a=this.maxW;
            this.style('width', a + 'px');
            this.width = a;
        }
        if(b !== false){
            if(b<this.minH) b=this.minH;
            if(b>this.maxH) b=this.maxH;
            this.style('height', b + 'px');
            this.height=b;
        }
		
        return this;
    },
		
		setXY : function(a, b){
        if(CC.isArray(a)){
	         if(a[0]!== false || a[1]!== false){
	        	if(a[0]!== false){
	            this.style('left',a[0]+'px');
	            this.left = a[0];
	          }
	          if(a[1] !== false){
	            this.style('top',a[1]+'px');
	            this.top = a[1];
	          }
	          return this;
	         }
        }
        
        if(a !== false || b !== false){
           if(a !== false){
            this.style('left',a+'px');
            this.left = a;
          }
           if(b !== false){
           	this.style('top',b+'px');
           	this.top = b;
          }
        }
        
        return this;
		},
		
    setTop: function(top) {
        this.setXY(false, top);
        return this;
    }
    ,

    getTop : function(usecache){
        if(usecache && this.top !== false)
            return this.top;
        this.top = parseInt(this.style('top'), 10) || this.view.offsetTop;
        return this.top;
    },
	
    setLeft: function(left) {
        this.setXY(left, false);
        return this;
    }
    ,

    getLeft : function(usecache){
        if(usecache && this.left !== false)
            return this.left;
        this.left = parseInt(this.style('left'), 10) || this.view.offsetLeft;
        return this.left;
    },
	
    xy : function(usecache) {
				return [this.getLeft(usecache), this.getTop(usecache)];
    }
    ,

    //get absolute location of element
    location: function(offset) {
        var c = 0, v = this.view;
        while (v) {
            c += v[offset];
            v = v.offsetParent;
        }
        return c;
    }
    ,

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

            var hasAbsolute = this.getStyle("position") == "absolute", f = CC.fly(el);
            
            while (p) {

                x += p.offsetLeft;
                y += p.offsetTop;
                f.view = p;
                if (!hasAbsolute && f.getStyle("position") == "absolute") {
                    hasAbsolute = true;
                }

                if (CC.gecko) {
                    var bt = parseInt(f.getStyle("borderTopWidth"), 10) || 0;
                    var bl = parseInt(f.getStyle("borderLeftWidth"), 10) || 0;
                    x += bl;
                    y += bt;
                    if (p != el && f.getStyle('overflow') != 'visible') {
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
                x += parseInt(f.getStyle("borderLeftWidth"), 10) || 0;
                y += parseInt(f.getStyle("borderTopWidth"), 10) || 0;
            }

            p = el.parentNode;
            while (p && p != bd) {
            		f.view = p;
                if (!CC.opera || (p.tagName != 'TR' && f.getStyle("display") != "inline")) {
                    x -= p.scrollLeft;
                    y -= p.scrollTop;
                }
                p = p.parentNode;
            }
            f.unfly();
            return [x, y];
    }
    ,
    
    absoluteX : function(){
        return this.absoluteXY()[0];
    },
	
    absoluteY : function() {
        return this.absoluteXY()[1];
    },
	
    //whether hide or not ,get the demensions,要获得正确size结点须在DOM中.
    getSize: function(usecache) {
        if(usecache && (this.width !== false && this.height !== false)) {
            return {
                width:this.width,
                height:this.height
            };
        }
    
        var v = this.view;
        var display = v.style.display;
        if (display != 'none' && display != null){ // Safari bug
            return {
                width:v.offsetWidth,
                height:v.offsetHeight
            };
        }

        // All *Width and *Height properties give 0 on vs with display none,
        // so enable the v temporarily
        var els = v.style;
        var oriVis = els.visibility;
        var oriPos = els.position;
        var oriDis = els.display;
        els.visibility = 'hidden';
        els.position = 'absolute';
        els.display = 'block';
        var oriW = v.clientWidth;
        var oriH = v.clientHeight;
        els.display = oriDis;
        els.position = oriPos;
        els.visibility = oriVis;
        return {
            width:oriW,
            height:oriH
        };
    },
		
  
    setBounds : function(x,y,w,h) {
        this.setXY(x,y);
        return this.setSize(w,h);
    },
  
    makePositioned: function(pos, zIndex, x, y) {
        var v = this.view;
        if (pos) {
            this._madePositioned = true;
            v.style.position = pos || 'relative';
        // Opera returns the offset relative to the positioning context, when an
        // v is position relative but top and left have not been defined
        }

        if(zIndex){
            this.setStyle("z-index", zIndex);
        }
        if(x !== undefined || y !== undefined){
            this.setXY(x, y);
        }
        return this;
    }
    ,

    unPositioned: function() {
        var v = this.view;
        if (this._madePositioned) {
            delete this._madePositioned;
            v.style.position = '';
            v.style.top = '';
            v.style.left = '';
            v.style.bottom = '';
            v.style.right = '';
        }
        return this;
    }
    ,

    clip: function() {
        var v = this.view;
        if (v._overflow)
            return this;
    	
        this._overflow = v.style.overflow || 'auto';
        if (this._overflow !== 'hidden')
            v.style.overflow = 'hidden';
        return this;
    },

    unclip: function() {
        var v = this.view;
        if (!this._overflow)
            return this;
        v.style.overflow = this._overflow == 'auto' ? '' : this._overflow;
        this._overflow = null;
        return this;
    },

    copyViewport : function(des){
        des = CC.$$(des);
        des.setXY(this.xy());
        des.setSize(this.getSize());
        return this;
    },
	
    _csIf : function(cs, def, proxy, from) {
        var a = this[cs];
        return CC.isString(a) ? a : def;
    }
    ,
  
    focus : function(timeout){
        		if(this.disabled)
        			return this;
            var el = this.focusNode?this.dom(this.focusNode):this.view;
						if(timeout)
            	(function(){ try{el.focus();}catch(ee){}}).timeout(timeout);
            else try{ el.focus();}catch(e){}
					return this;
    },

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
    },
		
    noselect : function() {
        var v = this, t = typeof this.unselectable, mt = false;
        if(t != 'undefined' && t != 'boolean'){
        		mt = true;
            v = this.fly(this.unselectable);
        }
        v.view.unselectable = "on";
        v.noUp("selectstart");
        //v.cssText("-moz-user-select:none;-khtml-user-select:none;");
        v.addClass("g-unsel");
        if(mt)
        	v.unfly();
        return this;
    },
  
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
  
    unDomEvent : function(evName, handler, childId){
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
  
    bindAlternateStyle: function(evtHover, evtOff, css, cancel, onBack, offBack, caller) {
        var a = evtHover+'Node',b=evtHover+'Target';
        var obj = this[a],tar=this[b];
        if(obj){
            obj = this.dom(obj);
            delete this[a];
         }else obj = this.view;
        
        if(tar){
        	tar = this.dom(tar);
        	delete this[b];
        }else tar = this.view;
        
        var self = this;
        onBack = onBack || self[evtHover+'Callback'];
        offBack = offBack || self[evtOff+'Callback'];
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

    bindHoverStyle: function( css, cancel, onBack, offBack, oThis) {
        return this.bindAlternateStyle('mouseover', 'mouseout', css || this.hoverCS, cancel, onBack || this.onMouseHover, offBack || this.onMouseOff, oThis || this);
    }
    ,

    bindFocusStyle : function( css, cancel, onBack, offBack, oThis) {
        return this.bindAlternateStyle('focus', 'blur', css, cancel, onBack || this.onFocusHover, offBack || this.onFocusOff, oThis || this);
    },
  
    bindClickStyle: function(css, cancel, downBack, upBack, oThis) {
        this.bindAlternateStyle('mousedown', 'mouseup', css, cancel, downBack, upBack, oThis);
        //防止鼠标按下并移开时样式未恢复情况.
        this.domEvent('mouseout', this.delClass.bind(this, css));
        return this;
    }
    ,

    bindContext : function(callback,cancel, caller, childId) {
        var tar = childId ? this.dom(childId) : this.view;
        if(!caller)
        	caller = this;
        
        var onClick = (function(evt) {
        		var src  = Event.element(evt), f = CC.fly(tar);
        		if(f.ancestorOf(src)){
        			f.unfly();
        			return;
        		}
            
            if(callback)
                if(callback.call(caller, evt, tar)===false)
                    return;
            Event.removeListener(document, 'mousedown', arguments.callee);
            this.contexted = false;
            f.display(0).unfly();
        }
        );
        
        Event.addListener(document, 'mousedown', onClick);
        this.contexted = true;
        return this;
    },

    /**
	 * 绑定使得一个元素具有拖动和放下过程中具有ondrag, ondrop, ondragstart事件.
	 * ondragstart.call(element,event)
	 */
    bindDragDrop : function(dragNode) {
        var proxy = this.view, G = CGhost.instance;
        if(dragNode || this.dragNode)
        	proxy = this.dom(dragNode || this.dragNode);
				this.draggable = true;
        proxy._ddrTrigger = (function(event){
            if(!this.draggable)
            	return;
            //mark the initial xy.
            var ev = event||window.event, el = this;
            //save mouse xy,and element position info.
            //MX:开始按下时鼠标X坐标,MY:开始按下时鼠标Y坐标,EX:开始始下时元素X,..EY,EW,EH其它类推
            G.IPXY = G.PXY = Event.pageXY(ev);
            G.EW=el.view.offsetWidth;
            G.EH=el.view.offsetHeight;
						if(el.beforeDragStart(el)===false)
							return false;
						
            window.document.ondragstart = G._noddrAction;

            Event.addListener(document, "mouseup", G._ddrMouseUp);
            Event.addListener(document, "mousemove", G._ddrMouseMove);
            Event.addListener(document, "selectstart", Event.noSelect);
            G.ddrEl = el;
            //Event.stop(ev);
        });
        
        this.domEvent('mousedown', proxy._ddrTrigger, false, null, proxy);
    },
	
    unDragDrop : function(dragNode){
    		this.draggable = false;
        var proxy = this.view;
        if(dragNode || this.dragNode)
        	proxy = this.dom(dragNode || this.dragNode);
        this.unDomEvent('mousedown', proxy._ddrTrigger);
    },
	
    /**
	 * 绑定使得一个元素具有监听拖放事件功能.
	 * ondragover 返回true表示可接受Drop.
	 */
    bindDDRListener : function(dragNode) {
        var proxy = this.view, G = CGhost.instance;
        if(dragNode || this.dragNode )
        	proxy = this.dom(dragNode || this.dragNode);
        this.ondropable = true;
        proxy._ddrMouseover = (function(event){
            if(!G.draging || G.ddrEl == this || !this.ondropable)
                return;
            var ev = event || window.event;
            //Event.stop(ev);
            //注册DDR OVER 结点
            G.onEl = this;
            var data = G.ddrEl.dragOverSB(this, ev);
            if(data === false)
                return;
				
            data = this.dragSBOver(G.ddrEl, data, ev);
				
            //mark current returned state.
            G.setAcceptable(data);
        });
		
        proxy._ddrMouseout = (function(event){
            if(!G.onEl || !this.ondropable)
                return;
            
            var ev = event || window.event, el = this;
            if(G.onEl.dragOutSB(el, ev) === false){
                G.onEl = null;
                return;
            }
			
            el.dragSBOut(G.onEl, ev);
            G.onEl = null;
            G.setAcceptable(0);
        });
				
				this.domEvent('mouseover', proxy._ddrMouseover, false, null, proxy);
				this.domEvent('mouseout', proxy._ddrMouseout, false, null, proxy);
    },
	
    unDDRListener : function(dragNode) {
        var proxy = this.view;
        this.ondropable = false;
        if(dragNode || this.dragNode)
        	proxy = this.dom(dragNode || this.dragNode);
        this.unDomEvent('mouseover', proxy._ddrMouseover);
        this.unDomEvent('mouseout', proxy._ddrMouseout);
    },
    
    $$ : function(id) {
        return CC.$$(id, this.view);
    },
  
    inspectDomAttr: function(childId, childAttrList, attrValue) {
        var obj = this.dom(childId);
        //??Shoud do this??
        if (!obj)
            return ;
    
        obj = CC.$attr(obj, childAttrList, attrValue);
        return obj;
    },

    setCloseable: function(b) {
        this.closeable = b;
        var obj = this.$$(this.closeNode || '_cls');
        if(obj)
            obj.display(b);
        return this;
    },
		
		offsetsTo : function(tar){
			  var o = this.absoluteXY();
			  tar = CC.fly(tar);
        var e = tar.absoluteXY();
        tar.unfly();
        return [o[0]-e[0],o[1]-e[1]];
		},
		
    scrollIntoView : function(container, hscroll){
        var c;
        if(container)
        	c = container.view || container;
        else c = CC.$body.view;
        
        var el = this.view, fc = CC.fly(c);

        var o = this.offsetsTo(c),
		        ct = parseInt(c.scrollTop, 10),
		        //相对container的'offsetTop'
		        t = o[1] + ct,
		        eh = el.offsetHeight,
		        //相对container的'offsetHeight'
		        b = t+eh,
		        
		        ch = c.clientHeight,
            //scrollTop至容器可见底高度
            cb = ct + ch;
        if(eh > ch || t < ct){
        	c.scrollTop = t;
        	c.scrollTop = c.scrollTop;
        }else if(b > cb){
        	  b -= ch;
        	  if(ct != b){
            	c.scrollTop = b;
            	c.scrollTop = c.scrollTop;
          	}
        }
        
        if(hscroll !== false){
        	var cl = parseInt(c.scrollLeft, 10),
        	    l = o[0] + cl,
        	    ew = el.offsetWidth,
        	    cw = c.clientWidth,
        	    r = l+ew, 
        	    cr = cl + cw;
					if(ew > cw || l < cl){
		        c.scrollLeft = l;
		        c.scrollLeft = c.scrollLeft;
		      }else if(r > cr){
		      	r -= cw;
		      	if(r != cl){
		      		c.scrollLeft = r;
		      		c.scrollLeft = c.scrollLeft;
		      	}
		      }
		      
        }
        fc.unfly();
        return this;
    },

    scrollChildIntoView : function(child, hscroll){
        this.fly(child).scrollIntoView(this.view, hscroll).unfly();
        return this;
    },
    
    toString : function(){
        return this.title || this.id;
    },
  
    beforeDragStart : fGo,
    dragStart : fGo,
    drag : fGo,
    dragOverSB : fGo,
    dragSBOver : fGo,
    dragSBOut : fGo,
    dragOutSB : fGo,
    dropSB : fGo,
    SBDrop : fGo,
    afterDrop:fGo
});

CBase.create = function(opt){
    var comp = new CBase();
    comp.initialize(opt);
    return comp;
};

bg.$$ = (function(dom, p) {
    if(!dom || dom.view)
        return dom;
	
    var c;
    if(!p){
        c = CC.$(dom);
        return c?new CBase(c) : null;
    }
	
    c = (p && p.view) ? CC.$(dom, p.view) : CC.$(dom, p);
    return c ? new CBase(c) : null;
});
//see unfly, fly
Cache.register('flycomp', function(){
	var c = new CBase();
	c.__flied = true;
	return c;
});

bg.fly = function(dom){
	if(dom){
		// string as an id
		if(typeof dom == 'string'){
			dom = CC.$(dom);
		}else if(dom.view){ // a component
			return dom;
		}
	}
	//actually, can not be null!
	if(!dom)
		throw 'Node not found.';
  // a DOMElement
	var c = Cache.get('flycomp');
	c.view = dom;
	return c;
};

if (isIE){
//    CBase.prototype.getStyle = function (key) {
//        var element = this.view;
//        key = key == 'float' ? 'styleFloat' : key.camelize();
//        var value = element.style[key];
//        if (!value && element.currentStyle) value = element.currentStyle[key];
//        if (key == 'opacity') {
//            return this.getOpacity(element);
//        } else {
//            if (value == 'auto') {
//                if (
//                    (key == 'width' || key == 'height') &&
//                    this.getStyle(element, 'display') != 'none'
//                    ) {
//                    return element['offset' + (key.charAt(0).toUpperCase()+ key.substring(1))] + 'px';
//                } else {
//                    return undefined;
//                }
//            }
//        }
//        return value;
//    };
     
    CBase.prototype.getOpacity = function() {
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
     
    CBase.prototype.setOpacity = function (value) {
        var element = this.view;
        if(element.zoom != 1)
            element.zoom = 1;
     			
        if (element.filters && element.filters[0] && typeof (element.filters[0].opacity) == 'number')
            element.filters[0].opacity = value*100;
        else 
            element.style.filter = 'alpha(opacity=' + value*100 + ')';
        return this;
    };
}

return bg;
})();


CC.create('CGhost', CBase, {
	
    okCS : 'g-ghost-ok',
	
    tip : false,
	
    ddrEl : null,

    onEl : null,
		
		height : 23,
    
    
    draging : false,
	
    resizeMask : null,
	
    enableTip : true,
	
    resizeCS : 'g-resize-ghost',
		
		resizeMaskCS : 'g-resize-mask',
		
    setAcceptable : function(b){
    	this.acceptable = !!b;
    	if(b){
    		this.addClass(this.okCS);
    		if(CC.ie)
    			this.setOpacity(1);
    	}
    	else{
    		this.delClass(this.okCS);
    		if(CC.ie)
    			this.setOpacity(0.5);
    	}
    },
	
    _ddrAction : function(event) {
        (event||window.event).returnValue = true;
    },
    
    _noddrAction:function(event){
        (event||window.event).returnValue = false;
    },
	
    _ddrMouseUp : function(event) {
        var G = CGhost.instance;
        window.document.ondragstart = G._ddrAction;
        //清空全局监听器
        Event.removeListener(document, "mouseup", G._ddrMouseUp);
        Event.removeListener(document, "mousemove", G._ddrMouseMove);
        Event.removeListener(document, "selectstart", Event.noSelect);

        var ev = event||window.event, ddrEl = G.ddrEl, onEl = G.onEl;
        G.PXY = Event.pageXY(ev);
        G.MDX = G.PXY[0] - G.IPXY[0];
        G.MDY = G.PXY[1] - G.IPXY[1];
        if(G.draging){
            //如果在拖动过程中松开鼠标
            if(ddrEl.dropSB(onEl, ev)===false)
                return;
            if(onEl  && G.acceptable)
                onEl.SBDrop(ddrEl, ev);
        }
        if(ddrEl)
        	ddrEl.afterDrop(ev);
        G.endDDR(ev);
    },
	
    _ddrMouseMove : function(event){
        var ev = event||window.event, G = CGhost.instance;
        G.PXY = Event.pageXY(ev);
        G.MDX = G.PXY[0] - G.IPXY[0];
        G.MDY = G.PXY[1] - G.IPXY[1];
        if(!G.draging) {
            G.draging = true;
            G.ddrEl.dragStart(ev);
		        G.display(G.enableTip);
        }
    
        if(G.enableTip) {
            G.setXY(G.PXY[0]+25, G.PXY[1]+20);
        }
    
        G.ddrEl.drag(ev);
    },
	
    endDDR : function(ev){
        if(this.enableTip) {
            this.display(0);
        }
		  
        this.onEl = null;
        this.ddrEl = null;
        this.draging = false;
        this.setAcceptable(false);
    },

    endResize : function(){
        this.enableTip = this._tmpEnabled;
        this.resizeLayer.display(0);
        this.resizeMask.display(0);
        this.resizing = false;
    },
    
    startResize : function(opt){
        this._tmpEnabled = this.enableTip;
        this.enableTip = false;
        var r = this.resizeMask, ly = this.resizeLayer;
        //如果半透明层未创建
        if(!ly){
        	ly = this.resizeLayer = CBase.create({view:CC.$C('DIV'), showTo:document.body, autoRender:true,cs:this.resizeCS, hidden:true});
        }
        
        //如果客户区域掩层未创建
        if(!r){
        	r = this.resizeMask = CBase.create({view:CC.$C('DIV'), showTo:document.body, autoRender:true, cs:this.resizeMaskCS, hidden:true, unselectable:true});
          r.setOpacity(0);
        }

        r.display(1);
        ly.display(1);
        this.resizing = true;
    }
});


var CTemplate = {};
CTemplate['CGhost'] = '<div class="g-ghost"><div id="_ico" class="g-ghost-icon"></div><div class="g-ghost-txt" id="_tle">请问有什么提示?</div></div>';


/**
 * 不宜在注册Cache缓存时调用模板方法CTemplate.$, CTemplate.$$,CTemplate.remove,这将引起循环的递归调用,因为模板生成的结点缓存在Cache里的.
 */
CC.extend(CTemplate,{
    $ : (function(keyName,compName, prehandler){
        var node = Cache.get(keyName);
        if(!node){
            if(!compName)
                compName = keyName;
						var tp = this[compName];
						if(typeof tp == 'undefined')
							return null;
							
            var dv = Cache.get('div');
            dv.innerHTML = prehandler? prehandler(tp) : tp;
            node = dv.removeChild(dv.firstChild);
            Cache.put('div',dv);
            Cache.put(keyName,node);
        }
        
        return node.cloneNode(true);
    }),
	
    $$ : function(key) {
        return CC.$$(this.$(key));
    },
    
    remove : function(key) {
    	Cache.remove(key);
    	delete this[key];
    },
    
    forNode : function(strHtml, dataObj, st) {
    	if(dataObj)
    		strHtml = CC.templ(dataObj, strHtml, st);
      var dv = Cache.get('div'), node;
      dv.innerHTML = strHtml;
      node = dv.removeChild(dv.firstChild);
      Cache.put('div',dv);
      return node;
    }
});

//
// 执行库自身初始化,在一切的Event.ready注册函数之前调用.
//
Event.defUIReady = (function(){
	CC.$body = CC.$$(document.body);
	if(!document.body.lang)
		document.body.lang = "zh";
	CGhost.instance =new CGhost({showTo:document.body, hidden:true, autoRender:true});
});

var CUtil = {};