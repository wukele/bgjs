(function () {

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
  
/**
 * 获得容器的滚动条所在控件,如果控件宽高已设置或父容器不存在,返回控件wrapper,否则返回父容器wrapper,
 * 明确容器的scrollor有利于控制容器内容的滚动,
 * 在设计控件时可根据控件自身结构特点指定scrollor.
 * @return {DOMElement|CC.Base}
 */
    getScrollor : function(){
      return this.scrollor || 
             this.height === false && 
             this.width === false && 
             this.pCt ? this.pCt.wrapper: this.wrapper;
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