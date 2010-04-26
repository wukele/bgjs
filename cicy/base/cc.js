/**
 * Javascript Utility for web development.
 * ���� : www.bgscript.com/forum
 * @author Rock - javeejy@126.com
 * www.bgscript.com ? 2010 - �������ɵ�WEBӦ��
 */
//~@base/base.js
/**
 * @fileOverview ����⹦�ܺ����Ϳؼ�����(Ԫ�ط�װ��).
 * @author <a href="mailto:javeejy@126.com">Rock</a>
 * @version 1.0.1
 */


/**
 * �պ���,ʲôҲ����,��������Ӷ�.
 * �յ�����ʲô��?
 * �����ľ�����һ����������,
 * ��ε�һ����δʵ������ĳ������,���������ֿ��ܵ��õ��÷���ʱ,Ϊ�˱���null����,�Ϳɰ��ⷽ����ΪfGo.
 * @function
 * @example
   &lt;a href=&quot;Javascript:fGo()&quot; onclick=&quot;funcToRun()&quot;&gt;&lt;/a&gt;
 */
function fGo(){};

/**
 * ���Կ���,Ĭ��false,����Firefox�µ�firebug����̨����__debug=true|false�л�����.
 *@global
 *@name __debug
 */
if(!window.__debug)
  var __debug = true;


(function(){

    var document = window.document,

    /**@inner*/
    ua = navigator.userAgent.toLowerCase(),

    /**����ȫ��һ��ΨһID, �μ�CC.uniqueID().
      * @inner
      */
    uniqueId = 0,

    String = window.String,

    undefined,

    //��������, thanks ExtJS here
    isStrict = document.compatMode === "CSS1Compat",
    isQuirks = document.compatMode === "BackCompat",
    isOpera = ua.indexOf("opera") > -1,
    isSafari = (/webkit|khtml/).test(ua),
    isChrome = ua.indexOf('chrome') > -1,
    isIE = !isOpera && ua.indexOf("msie") > -1,
    isIE7 = !isOpera && ua.indexOf("msie 7") > -1,
    isIE6 = !isOpera && ua.indexOf("msie 6") > -1,
    isGecko = !isSafari && ua.indexOf("gecko") > -1,
    //���ȼ��BackCompat,��Ϊ
    //�����Ժ�compatMode�ı�,Ҳ�ǷǺ�ģ��
    isBorderBox = (isIE && !isStrict) || (!isIE && !isStrict),
    /**�Ƿ�Ϸ�EMAIL�ַ���.
     * �μ� CC.isMail().
     * @inner
     */
    mailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
    
    
    Slice = Array.prototype.slice;

    // �޸���IE��һЩ�汾��ͨ��CSS�ı�Ԫ�ر���ͼƬ���������������˸����,IE6��Ϊ����.
    if(isIE && !isIE7){
        try{
            document.execCommand("BackgroundImageCache", false, true);
        }catch(e){}
    }
   /**
    * �÷����ڴ�������ʱ������,����ִ�и��๹�캯���Ը�������Ӹ�������.
    * �μ� CC.create()
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
     * CC, Cicy��д,���������Ŀ¼.
     * @name CC
     * @class ���������Ŀ¼
     */
    var CC =
       /**@lends CC*/
    {
        /**@property version ��ǰ�汾��*/
        version : '2010.4',

        /**
         * ���ݽ��IDֵ���ظ�DOM���.
         * �ñ���Ϊ�������
         * ���ֻ��һ������,����id��ͬ�Ľ��(ֻһ��).
         * �� var objDiv = CC.$('idDiv');
         * ������Ϊ2ʱ, ���ذ����ڸ�����е�����id���ӽ��,���ӽ��������,id�ڸ��������Ψһ.
         * �� var objDiv = CC.$('idOfAncestor', 'idOfChild');
         *@param {String|DOMElement} a id ���ID,ֱ��һ��DOMҲû��ϵ
         *@param {DOMElement} b �����,�����ֵָ��,���ڸý���²���
         *@returns {DOMElement} ��ӦID�Ľ��,��������ڷ���null
         *@example
           //���Ϊtrue
           alert(CC.$('idDIV')==document.getElementById('idDIV'));
           //�ڽ��oDiv��Ѱ��idΪchildDiv�Ľ��
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
         * ��������ö�ٵĶ���.
         *@param {Object} object ��ö�˵Ķ���,���Ϊ�����argumentsʱ�����±�����,Ϊ��ͨ����ʱ����������������.
         *@param {Function} callback
         *@param args
         *@example
             CC.each(array, funtion(obj, i){
                //true
                alert(this === array[i] && this === obj) ;
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
         * ���ϲ����ĳ���Ա���.
         * @param {Object} obj
         * @param {String} nextAttr
         * @param {Function} callback
         * @return ���callback�з���ֵ,���жϵ�ǰ�������ظ�ֵ.
         * @example

         CC.eachH(element, 'parentNode', function(){
            alert('��ǰ�������Ϊ:'+ this);
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
         * ����src�������Ե�des������,des��������ͬ���Ƶ����Ա�����.
         * @return ���desΪ��,����src���Ը���,���򷵻�des
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
         * ��ԭ�����������Ը��Ƶ�Ŀ�������,���Ŀ�������ڸ�����,�������и���.
         * �÷�������for..in..�����������Ե�.
         * @param {Object} des Ŀ�����
         * @param {Object} src Դ����
         * @see CC#extend
         * @return {Object} ����Ŀ�����,���Ŀ��Ϊ��,����һ���¶���
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
         * �����෽��
         * @param {String} ns ����,�ɴ��������ռ�
         * @param {Object} base ����
         * @param {Object|Function} set �����Լ�,���Ϊһ������,���������Զ���.
         * @return {Object} ����
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
         * ���һ��XMLHttpRequest��ʵ��.
         * @return {XMLHttpRequest} XMLHttpRequest ʵ��
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
         * ��û����ö�������������.
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
         * ���ض����ѯ�ַ�����ʾ��ʽ.
         * @param {Object} obj
         * @return ����Ĳ�ѯ�ַ�����ʾ��ʽ
         * @example
           var obj = {name:'rock', age:'25'};

           //��ʾ name=rock&age=25
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
         * ���һ�������б�Ԫ�ص�����,�����ر��Ĳ�ѯ�ַ�����ʾ.
         * @param {FormElement|String} f form��form��id
         * @return {String} ���б�Ԫ�صĲ�ѯ�ַ�����ʾ
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
 * ����֤����.
 * @example

//���볤��>=6
function checkPassword(v) {
  return v.length >= 6;
}

//��������Ҫ��ͬ
function isTheSame(v, obj, form) {
  return form ? form.password.value == v: CC.$('password').value == v;
}

//����ʱ�Զ��ص�
function myCallback(msg, obj, form) {
  alert("������ʾ����Ϣ��:" + msg + " - Ԫ��:" +
          obj.name + ",����form:" + (form ? form.id: '��'));
}

//����Form������
function testForm() {
  var result = CC.validate('testForm',
     ['username', '�������û�����'],
     ['mail', '�����ʽ����ȷ��', isMail],
     ['password', '���볤�ȴ��ڻ����6��', checkPassword],
     //����������ʾ��
     ['password2', '�������벻һ�¡�', isTheSame,
        {nofocus: false,callback: myCallback,ignoreNull: false}
     ],
     {queryString: true});

  if (result !== false) alert("��ϲ��ͨ����֤!�ύ���ַ�����:" + result);

  return result;
}
//��Form������.
function testNoForm() {
  var result = CC.validate( //��Ȼûform��,���ﲻ�ش���form id��Ϊ��һ������.
   ['username', '�������û�����'],
   ['mail', '�����ʽ����ȷ��', CC.isMail],
   ['password', '���볤�ȴ��ڻ����6��', checkPassword],
   ['password2', '�������벻һ�¡�', isTheSame,
        {nofocus: false, callback: myCallback, ignoreNull: false}
   ],
  //�������һ������
  { queryString: true});

  if (result !== false) alert("��ϲ��ͨ����֤!�ύ���ַ�����:" + result);

  return result;
}

 */
        validate: function() {
          var args = CC.$A(arguments),
          form = null;
          //form�����Ϊ��Ԫ��,Ӧ���ڵ�һ��������.
          if (!CC.isArray(args[0])) {
            form = CC.$(args[0]);
            args.remove(0);
          }
          //�������������,Ӧ�������һ��������.
          //cfg.queryString = true|false;
          //cfg.callback = function
          //cfg.ignoreNull
          //nofocus:true|false
          var b = CC.isArray(b) ? {}: args.pop();
          var queryStr = b.queryString;
          var result = queryStr ? '': {};
          CC.each(args, function(i, v) {
            //�����fomr�в����ڸ�nameԪ��,�͵�id�����
            var obj = v[0].tagName ? v[0] : form ? form[v[0]] : CC.$(v[0]);
            //if(__debug) console.log('checking field:',v, 'current value:'+obj.value);
            var value = obj.value, msg = v[1], d = typeof v[2] === 'function' ? v[3]:v[2];
            //ѡ��
            if(!d || typeof d != 'object')
              d = b;

            //�Ƿ���Կ�
            if (!d.ignoreNull &&
            (value == '' || value == null)) {
              //��������ڻص�����,�͵���alert����ʾ������Ϣ
              if (!d.callback)
                CC.alert(msg, obj, form);
              //������ڻص�,ע�⴫�ݵ���������
              //msg:��Ϣ,obj:�ý��,form:��Ӧ�ı�,������ڵĻ�
              else d.callback(msg, obj, form);
              //������Ƿ�ۼ�
              if (!d.nofocus)
                obj.focus();
              result = false;
              return false;
            }
            //�Զ�����֤����
            if (typeof v[2] === 'function') {
              var ret = v[2](value, obj, form);
              var pass = (ret !== false);
              if (typeof ret === 'string') {
                msg = ret;
                pass = false;
              }

              if (!pass) {
                if (!d.callback) CC.alert(msg, obj, form);
                //ͬ��
                else d.callback(msg, obj, form);

                if (!d.nofocus)
                  obj.focus();
                result = false;
                return false;
              }
            }
            //���������queryString��ͨ����֤,������form,�ͷ���һ������,�ö����������{elementName|elementId:value}������.
            if (queryStr && !form) {
              result += (result == '') ? ((typeof obj.name === 'undefined' || obj.name==='') ? obj.id : obj.name) + '=' + value: '&' + v[0] + '=' + value;
            } else if (!form) {
              result[v[0]] = value;
            }
          });
          //������õ�queryString:true��ͨ����֤,�ͷ���form���ύ�ַ���.
          if (result !== false && form && queryStr)
            result = CC.formQuery(form);
          return result;
        }
        ,
        /**
         * ���һ��ȫ��Ψһ��ID.
         * @return {Number} ȫ��ΨһID
         */
        uniqueID: function() {
            return uniqueId++;
        }
        ,
        /**
         * Ӧ�ö����滻ģ������.
         * @param {Object} obj ���ݶ���
         * @param {String} str ģ���ַ���
         * @param {undefined|Number} [st] ���ƿ��� undefined �� 0 �� 1 ������
         * @param {Boolean} [urlencode] �Ƿ���encodeURIComponent�������б���
         * @return {String}
         * @example
           CC.templ({name:'Rock'},'&#60;html&#62;&#60;title&#62;{name}&#60;/title&#62;&#60;/html&#62;');
           st:0,1:δ�ҵ��������Ƿ���
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
         * �Ƿ�Ϊһ������(����).
         * @param {Object} obj
         * @return {Boolean}
         */
        isFunction: function(obj) {
            return obj instanceof Function || typeof obj === "function";
        }
        ,
        /**
         * �Ƿ�Ϊ�ַ���.
         */
        isString: function(obj) {
            return obj instanceof String || typeof obj === "string";
        }
        ,
        /**
         * �Ƿ�ΪArrayʵ��.
         */
        isArray: function(obj) {
            return obj instanceof Array;
        }
        ,
        /**
         * �Ƿ�Ϊһ�����ڶ���.
         */
        isDate: function(obj) {
            return obj instanceof Date;
        }

        ,
        /**
         * ϵͳ�Ի���.
         * @param {Object} msg ��ʾ����Ϣ
         */
        alert: function(msg) {
            alert(msg);
        }
        ,
        /**
         * ϵͳС��ʾ.
         */
        tip: function(msg, title, proxy, timeout, getFocus) {
            alert(msg);
        }
        ,
        /**
         * �Ƴ������ض�������,�÷�������deleteɾ����������,�����ظ�����ֵ.
         * @param {Object} obj Ҫ�Ƴ����������ڵĶ���
         * @param {String} attrName ��������
         * @return {Object} �Ƴ����Ե�ֵ,���������,����undefined
         */
        delAttr : function(obj, attrName) {
          var t = obj[attrName];
          if(t !== undefined)
            delete obj[attrName];
          return t;
        },

        /**
         * ���Ԫ����ʽ��.
         * @param {DOMElement} o
         * @param {String} s css����
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
         * ���Ԫ��δ���ڸ���ʽ��,���Ԫ����ʽ��,�������.
         * @param {DOMElement} o
         * @param {String} s css����
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
         * ɾ��Ԫ����ʽ��.
         * @param {DOMElement} o
         * @param {String} s css����
         * @see CC#addClass
         * @example
           CC.delClass(oDiv, 'cssName');
         */
        delClass: function(o, s) {
            o.className = o.className.replace(s, "").trim();
        }
        ,
        /**
         * ����Ԫ���Ƿ����ָ����ʽ��.
         * @param {DOMElement} o
         * @param {String} s css����
         * @return {Boolean}
         * @example
           CC.hasClass(oDiv, 'cssName');
         */
        hasClass : function(o, s) {
            return s && (' ' + o.className + ' ').indexOf(' ' + s + ' ') != -1;
        },
        /**
         * �滻Ԫ����ʽ��.
         * @param {DOMElement} o
         * @param {String} oldSty �Ѵ��ڵ�CSS����
         * @param {String} newSty �µ�CSS����
         * @example
           CC.switchClass(oDiv, 'mouseoverCss', 'mouseoutCss');
         */
        switchClass: function(a, oldSty, newSty) {
            CC.delClass(a, oldSty);
            CC.addClass(a, newSty);
        }
        ,
        /**
         * ����Ԫ����ʽ��.
         * @param {DOMElement} o
         * @param {String} s CSS����
         * @example
           CC.switchClass(oDiv, 'mouseoverCss', 'mouseoutCss');
         */
        setClass: function(o, s) {
            o.className = s;
        },
        /**
         * ��û�����Ԫ��style.display����.
         * ��style.display��ʽ����Ԫ���Ƿ�ɼ�.
         * @param {DOMElement} v dom���
         * @param {Boolean} [b] �����Ƿ�ɼ�
         * @param {Boolean} [inline] inlineΪtrueʱ��display��Ϊ��,������block
         * @example
           //����Ԫ���Ƿ�ɼ�
           alert( CC.display(div) );
           //����Ԫ�ؿɼ�,ģʽΪblock
           CC.display(div, true);
           //����Ԫ�ؿɼ�,ģʽΪinline
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
         * ���Ի�����Ԫ���ǿ���.
         * @param {DOMElement} v
         * @param {Boolean} [b]
         * @example
           //����Ԫ��
           CC.disable(div, true);
           //����Ԫ���Ƿ����.
           var b = CC.disable(div);
         */
        disable: function(v, b) {
          if(b === undefined)
            return CC.$(v).disabled;

          CC.$(v).disabled = b;
        }
        ,
/**
 * ��oSelf�������oNew���.
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
 * �����Ƿ�Ϊ����
 * @param {Object} ob
 * @return {Boolean}
 */
        isNumber: function(ob) {
            return (ob instanceof Number || typeof ob == "number");
        }
        ,
/**
 * �����ַ����Ƿ�Ϊ�����ʽ.
 * @param {String} strMail
 * @return {Boolean}
 */
        isMail : function(strMail) {
            return mailReg.test(strMail);
        },

/**
 * �������ڵĸ�ʽ���ַ���.
 * @param {Date} date
 * @param {String} ��ʽ, mm/dd/yy��dd/mm/yy��yy/mm/dd,�м�ָ������޶�
 * @return {String} ���ڵĸ�ʽ���ִ���
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
 * �����ڵĸ�ʽ���ַ�������ʾ�����ڶ���.
 * @param {String} str ���ڵĸ�ʽ���ַ���,��2009/02/15
 * @param {String} ��ʽ, mm/dd/yy��dd/mm/yy��yy/mm/dd,�м�ָ������޶�
 * @return {Date} ��ʽ���ַ�������ʾ�����ڶ���
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
 * �������ڵ�ĳ���ֶ�ֵ.
 * @param {String} field year|month|day�е�һ��
 * @param {Date} date
 * @param {Number} delta ����
 * @return {Date} ֵ���Ӻ��������
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
 * ����һ��DOMԪ��.
 * @param {String|Object} Ϊ�ַ���ʱ,����tagName,Ϊ����ʱ,�������Լ�.
 * @param {Document} document
 * @return {DOMElement} �´�����DOM���
 * @example
   //�򵥷�ʽ����һ��DIV���.
   var div = CC.$C('DIV');
   //�����Լ�����һ��DIV���.
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
 * document.getElementsByName�Ŀ��ٵ���.
 * @param name DOMԪ�ص�name
 * @return {DOMCollection}
 */
        ,
        $N: function(name) {
            return document.getElementsByName(name);
        },
/**
 * dom.getElementsByTagName�Ŀ��ٵ���.
 * @param {String} tagName ��ǩ��
 * @param {DOMElement} [dom] �ڸñ�ǩ�²���,δ����ʱΪdocument
 * @return {DOMCollection}
 */
        $T: function(tagName, dom) {
          return (dom || document).getElementsByTagName(tagName);
        }
        ,
/**
 * ��dom������ϱ���,��Ѱ�ұ�ǩ��Ϊtag�Ľ��,û�ҵ�����null.
 * @param {DOMElement} dom ���ý���ϱ���(�����ý��)
 * @param {String} tag ���ҵı�ǩ��
 * @return {DOMElement} ƥ���ǩ�Ľ��
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
 * ��ö���Ͷ���ԭ������ĳ�����Ե�����ֵ,����ֻ�ʺ��ñ��ⴴ������superclass���Ե���ʵ��.
 * @param {Object} object
 * @param {String} attributeName
 * @return {Array} �������ϸ����Ե�����ֵ
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
 * ����һ����Դ�ļ�
 * @param {Object} ��Դ����
 * @param {Function} callback ���غ�ص�, thisָ����Դtag
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
 * ����JavaScript�ű��ļ�
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
 * ����һ��CSS��ʽ�ļ�
 * @param {String} id ����css��ǩID
 * @param {String} url ����css��·��
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
 * Ӧ��һ��CSS��ʽ�ı�
 * @param {String} id ���ɵ���ʽstyle���ID\
 * @param {String} ��ʽ�ı�����
 @example
   CC.loadStyle('customCS', '.g-custom {background-color:#DDD;}');
   //��Ԫ����Ӧ��������ʽ��
   &lt;div class=&quot;g-custom&quot;&gt;��̬������ʽ&lt;/div&gt;
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
 * ���һ�������ַ���,���ַ������ڱ����������������ҳ��,׷����URLβ��.
 * @return {String} �����������������ҳ����ַ���.
 * @example
 * var requestUrl = 'http://www.site.com/?name=rock'+CC.noCache();
 */
        noCache: function() {
            return '&noCacheReq=' + (new Date()).getTime();
        }
        ,
/**
 * ����ö�ٶ������ݸ��Ƶ���������,�����ظ�����,��ö�ٶ�����ָ����[index]����,������length���Ե�,��������arguments����.
 * @param {Object} iterable ��ö�ٶ���
 * @return {Array} ������
 */
        $A : function(a) {
            return Slice.call(a);
        },
/**
 * ���iframe�е�document���.
 * @param {DOMElement} frame iframe���
 * @return {DOMElement} iframeҳ���е�document���
 */
        frameDoc : function(frame) {
            return frame.contentWindow ? frame.contentDocument:frame.contentDocument;
        },
/**
 * ���iframe�е�window����.
 * @param {IFrame} frame iframe���
 * @return {DOMElement} iframeҳ���е�document���
 */
        frameWin : function(frame){
            return frame.contentWindow;
        },
/**
 * ����ĵ���������߶�.
 * @return {Number}
 */
        getDocumentHeight: function() {
            var scrollHeight = (document.compatMode != "CSS1Compat") ? document.body.scrollHeight : document.documentElement.scrollHeight;
            return Math.max(scrollHeight, this.getViewportHeight());
        },
/**
 * ����ĵ�����������.
 * @return {Number}
 */
        getDocumentWidth: function() {
            var scrollWidth = (document.compatMode != "CSS1Compat") ? document.body.scrollWidth : document.documentElement.scrollWidth;
            return Math.max(scrollWidth, this.getViewportWidth());
        },
/**
 * �����ͼ�ɼ�������߶�.
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
 * �����ͼ�ɼ���������.
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
 * �����ͼ�ɼ���������.
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

//�ϲ��ⲿCC
if(window.CC)
CC.extend(CC, window.CC);

window.CC = CC;
/**
* UI��ع��ܺ��������.
* @name CC.Util
* @class UI��ع��ܺ��������
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
