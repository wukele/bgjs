(function(CC){
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
 * 根据DOM元素返回一个控件, 如果已指定pCt,返回该容器子控件中的匹配控件
 * @param {HTMLElement} dom
 * @param {CC.ui.ContainerBase} pCt, 如果已指定,返回该容器子控件中的匹配控件
 * @static
 * @member CC.Base
 * @method byDom
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
      BLANK_IMG : window.BLANK_IMG || 'http://www.bgscript.com/bgjs/default/s.gif',
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
 * <li>通过{@link #follow}方式委托另一个控件("父"容器)管理自身控件周期的子控件</li>
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
        oNew = CC.$$(oNew).view;
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