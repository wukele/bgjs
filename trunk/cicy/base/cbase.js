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
 * @name CC.Base.find
 * 根据控件ID获得控件,该方法将遍历控件缓存,速度并不快
 * @param {String} componentId
 */
Base.find = function(id){
  for(var i in CPC){
    if(CPC[i].id === id)
      return CPC[i];
  }
  return null;
};
/**
 * @name CC.Base.byCid
 * 根据控件缓存ID(唯一)获得控件,该缓存id在控件初始化时设置,保存在 component.cacheId 和 component.view.cicyId中.
 * @param {String} componentId
 */
Base.findByCid = Base.byCid = function(cid){
  return CPC[cid];
};
/**
 * 根据DOM元素返回一个控件, 如果已指定pCt,返回该容器子控件中的匹配控件
 * @param {HTMLElement} dom
 * @param {CC.ui.ContainerBase} pCt, 如果已指定,返回该容器子控件中的匹配控件
 */
Base.byDom = function(dom, pCt){
      //find cicyId mark
      var c, bd = pCt && pCt.view || document;

      while( dom !== bd){
        if(dom.cicyId){
          c = Base.byCid(dom.cicyId);
          if(c && !c.delegated){
            if(pCt){
              if(c.pCt === pCt)
                return c;
            }else return c;
          }
        }
        dom = dom.parentNode;
      }

      return null;  
};

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
 * 用于填充img标签.为什么要用到img标签,用其它标签的background-url定位不行么?
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
 * @param {String} 模板字符串,可以多个参数,方便查看
 * @return this
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
var hidCS = ['vid','hid'];

var disCS = ['vvi', 'dbl','dbi'];

var undefined;

var Math = window.Math, parseInt = window.parseInt;

var CPR = CC.util.CssParser.getParser();

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
           (this.superclass && this.superclass.hasOwnProperty('template'))){
          // come from a html string or cache
          this.view = this.template.charAt(0) === '<' ? Tpl.forNode(this.template) : Tpl.$(this.template);
          
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
        // if not initializing from fly element
        if(this.__flied === undefined){
	        var cid = this.cacheId = 'c' + CC.uniqueID();
	        CPC[cid] = this;
	        
	        this.createView();
        }
/**
* @name CC.Base#strHtml
* @property {String} [strHtml] 控件html内容,如果存在,在控件初始化时生成.
*/
        if(this.strHtml){
            this.html(this.strHtml);
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
* @name CC.Base#innerCS
* @property {String} innerCS 控件自身内在的css类设置,常用于控件的设计中.
*/
        if(this.innerCS)
          this.addClass(this.innerCS);
/**
* @name CC.Base#cs
* @property {String} cs 控件css类,它将添加在{@link # innerCS}类后面.
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

        //cache the cacheId to dom node for fast access to host component
        this.view.cicyId = cid;

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

        if(this.top !== false)
            this.setTop(this.top);

        if(this.left !== false)
            this.setLeft(this.left);


/**
* @name CC.Base#disabled
* @property {Boolean} disabled 是否允许使用该控件.
*/
        if(this.disabled){
            this.disabled = 1;
            this.disable(true);
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

/**
* @name CC.Base#shadow
* @property {Boolean|Shadow} shadow 控件是否具有阴影效果.
*/
        if(this.shadow){
          this.shadow = CC.ui.instance(this.shadow===true?'shadow':this.shadow);
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
* @name CC.Base#hidden
* @property {String} hidden 当前控件是否可见
* @readonly
*/
        if(this.hidden){
          this.hidden = undefined;
          this.display(false);
        }


/**
* @name CC.Base#css
* @property {String} css 设置控件inline style字符串
*/
        if(this.css)
         this.cset(this.css);

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
        if(this.rendered || this.fireOnce('render')===false)
            return false;
        /**
         * @name CC.Base#rendered
         * @property {Boolean} rendered  标记控件是否已渲染.
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
 * Base类默认是没有事件处理模型的,预留fire为接口,方便一些方法如{@link # render}调用,当控件已实现事件处理模型时,即{@link # eventable}为true时,此时事件就变得可用.
 */
    fire : fGo,

    fireOnce : fGo,

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

      if(this.__flied !== undefined && this.__flied > 0)
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
        var ss = v.className.replace(s, '').trim();
        ss += ' ' + s;
        v.className = ss;
        return this;
    }
    ,
/**
 * 检查是否含有某个样式,如果有,添加或删除该样式.
 * @param {String} css
 * @param {Boolean} true -> add, or else remove
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
        var ss = v.className.replace(s, '').trim();
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
        v.className = v.className.replace(s, "").trim();
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
 * @property {Boolean} [displayMode=1] 显示模式0,1,可选有display=1,visibility=0
 * @see #setDisplayMode
 */
    displayMode : 1,
/**
 * @property {Number} 可选的有block=1,inline=2和''=0
 * @see #setBlockMode
 */
    blockMode : 1,

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
      return !this.hasClass(hidCS[this.displayMode]);
     }
     if(this.hidden !== !b){
       this.hidden = !b;
       b ? this.onShow() : this.onHide();
     }
     return this;
   },
/**
 * @protected
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
 * @protected
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
* @param {String} ss
* @return this
*/
    setTip:function(ss){
      if(this.view && !this.qtip){
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
 * border + padding 的宽度,除非确定当前
 * 值是最新的,否则请通过{@link #getOuterW}方法来获得该值.
 * 该值主要用于布局计算,当调用{@link #getOuterW}方法时缓存该值
 * @name CC.Base#outerW
 * @property {Number}  outerW
 * @protected
 */

/**
 * 得到padding+border 所占宽度, 每调用一次,该函数将缓存值在outerW属性中
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
 * border + padding 的高度,除非确定当前
 * 值是最新的,否则请通过{@link #getOuterH}方法来获得该值.
 * 该值主要用于布局计算,当调用{@link #getOuterH}方法时缓存该值
 * @name CC.Base#outerH
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
/**
 *
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
      if(this.contexted)
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
  *@see CC#attr
  *@example
  *<pre>
    //如存在一id为this.iconNode || '_ico'子结点,设置其display属性为
    comp.inspectAttr(this.iconNode || '_ico','style.display','block');
  *</pre>
   */
    attr: function(childId, childAttrList, attrValue) {
        var obj = this.dom(childId);
        //??Shoud do this??
        if (!obj)
            return ;

        obj = CC.attr(obj, childAttrList, attrValue);
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
/**
 * 滚动控件到指定视图
 * @param {DOMElement|CC.CBase} ct 指定滚动到视图的结点
 * @param {Boolean} hscroll 是否水平滚动,默认只垂直滚动
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
 */
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
 * @parma {HTMLElement} element
 * @param {Object} options
 */
Base.applyOption = function(el, opt){
  var f = CC.fly(el);
  f.initialize(opt);
  f.render();
  f.unfly();
};

/**
 * 根据DOM快速转化为控件对象方法，该方法将具有控件生命周期，但略去了初始化和渲染.
 * @function
 * @memberOf CC
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

    //else delete opt.ctype;

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