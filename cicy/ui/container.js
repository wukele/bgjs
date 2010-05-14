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
 * @property {Boolean} [deffer=false]
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
        },

        /**
         * 容器在添加子项前被调用。
         * @param {CC.Base} comp 子项
         * @param {Object} cfg 子项用布局的配置信息
         * @function
         */
        beforeAdd: fGo,
/**
 * @name CC.Base#lyInf
 * @property {Object} lyInf 布局配置数据,
    如果控件被布局管理器所管理,
    其布局相关的配置信息将存放在component.lyInf,
    要访问子项当前布局信息,可通过layout.cfgFrom(component)方法获得.
 * @protected
 * @see #cfgFrom
 * @example
   var ct = ct;
   var borderLayoutInformation = item.lyInf;
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
/**
 * @name CC.layout.Layout#itemCS
 * @property {String} itemCS 将子项被加进容器时添加到子项的CSS样式
 */
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
          return item.lyInf || {};
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
         * 除移子项时调用并重新布局,
         * 注意:从布局管理器移除子控件并不从容器移除.
         * 如果layoutOnChange设置为false时不调用。
         */
        remove: function(comp){
            if (this.layoutOnChange)
                this.doLayout.bind(this).timeout(0);
        },

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
               
               item = ct.instanceItem(item, cls, true)
              }
              this.add(item);
            }
            this.invalidate = tmp;
            
            if(this.isUp()){
              this.doLayout();
            }
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


            if(this.items){
              this.fromArray(this.items);
              delete this.items;
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
 * 指明面板容器结点,ID或Html元素
 * @type HTMLElement|String
 */
  ct: null,

  minH: 0,

  minW: 0,

  maxH: 65535,

  maxW: 65535,
 /**
 * @property {Base} [itemCls=CC.ui.Item] 容器子控件类, fromArray方法根据该子项类实例化子项
 * @see #fromArray
 */
  itemCls: CC.ui.Item,
  /**
 * @property {Boolean} [autoRender=false] 容器子控件类
 */
  autoRender: false,

/**
 * @property {Boolean|CC.util.SelectionProvider} selectionProvider 是否对容器应用子项选择功能
 */
  selectionProvider : false,

  initialize : function(){
    Base.prototype.initialize.apply(this, arguments);
    //pre load children
/**
 * @name CC.ui.ContainerBase#array
 * @property {Array} array 子项数据初始化组数
 * @see #fromArray
 */
    if (this.array) {
      this.fromArray(this.array);
      delete this.array;
    }
  },

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
      this.bindClickInstaller();
    }

    if(this.selectionProvider){
      this.getSelectionProvider();
    }

    if(this.connectionProvider)
      this.getConnectionProvider();

    this.children = [];

    this.createLayout();
  },

  createLayout : function(){
    if (this.layout) {
      /**
 * @name CC.ui.ContainerBase#layout
 * @property {Layout|String} [layout='default'] 容器布局管理器
 */
      if (typeof this.layout === 'string') {
/**
 * @name CC.ui.ContainerBase#lyCfg
 * @property {Object} lyCfg 布局管理器初始化配置
 */
        var cfg = this.lyCfg || {};
        cfg.ct = this;
        this.layout = new(CC.layout[this.layout])(cfg);
        if (this.lyCfg) delete this.lyCfg;
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
 /**
  * container.ct结点对应的Base对象,如果当前container.view === container.ct,则wrapper为容器自身.
  * @name CC.ui.ContainerBase#wrapper
  * @type CC.Base
  */
    this.wrapper = this.ct == this.view ? this: this.$$(this.ct);
  },

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

/**
 * 此时调用fromArray(array)加入子项,当onRender后布局容器.
 * @override
 */
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
 * @param {Base} a 子项
 */
  add: function(a) {

    // 由JSON格式创建
    if(!a.cacheId){
      a = UX.instance(a);
    }

/**
 * 添加前发送
 * @name CC.ui.ContainerBase#beforeadd
 * @event
 * @param {CC.Base} component
 */
      if(this.fire('beforeadd', a) !== false && this.beforeAdd(a) !== false){
        this.onAdd(a);
        this.afterAdd(a);
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
/**
 * @protected
 */
  onAdd : function(a){
    this.children.push(a);
    //默认子项结点将调用_addNode方法将加到容器中.
    this._addNode(a.view);

    if (a.pCt){
      if(a.pCt !== this){
        a.pCt.remove(a);
        //建立子项到容器引用
        a.pCt = this;
      }
    }else a.pCt = this;
    
    //在useContainerMonitor为false时,是否允许子项点击事件,并且是否由子项自身触发.
    if (!this.useContainerMonitor && this.clickEvent && !a.__click) {
      var bnd = a.__click = this.clickEventTrigger;
      var clickProxy = this.clickEventNode ? a.dom(this.clickEventNode) : a.view;
      a.domEvent(this.clickEvent === true ? 'mousedown': this.clickEvent, bnd, this.cancelClickBubble, null, clickProxy);
    }
  },

/**
 * @protected
 */
  beforeAdd : function(){
    
  },
  
/**
 * @protected
 */
  afterAdd : fGo,

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
    else if(this.fire('beforeremove', a)!==false && this.beforeRemove(a) !== false){
      this.onRemove(a);
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

  onRemove : function(a){
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
 * @name CC.ui.ContainerBase#itemCfg
 * @property {Object} itemCfg 用于批量添加子项{@link #fromArray}时子项的配置
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

  instanceItem : function(it, cls, /**@inner*/mixed){
    
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
    var act = (function(e) {
      var el = e.target || e.srcElement;

      if((srcName === undefined || el.tagName === srcName) && el !== this.view){
          var item = this.$(el);
          if (item)
            return item.disabled ? false : callback.call(this, item, e);
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
 * 根据ID或指定属性深层遍历寻找子控件.
 * @param {String} childId ID值或指定属性的值
 * @param {String} attributeName 不一定是id值,可以指定搜索其它属性
 * @param {Boolean} [returnMore] 是否返回第一个或多个 
 * @return {CC.Base|null|Array} 如果 returnMore 未设置,返回第一个匹配或null,否则返回一个数组,包含所有的匹配.
 @example
 <pre>
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
 </pre>
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
 * @param {Function} cb callback,  参数为 callback(idxOfItemContainer, totalCounter), 返回false时终止遍历;
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
 */
    getScrollor : function(){
      return this.scrollor || 
             this.height === false && this.width === false && this.pCt ? this.pCt.wrapper: this.wrapper;
    }
});

var ccx = CC.ui.ContainerBase;
var ccxp = CC.ui.ContainerBase.prototype;
UX.def('ct', ccx);
/**
 * 面板与容器的主要区别是可发送resized, reposed事件,可定制wrapper位置
 * @name CC.ui.Panel
 * @class 面板
 * @extends CC.ui.ContainerBase
 */
CC.create('CC.ui.Panel', ccx, function(superclass){
 return /**@lends CC.ui.Panel#*/{
/**
 * 默认为ID为_wrap,如果不存在该结点,则指向当前面板的view结点
 * @type HTMLElement|String
 */
        ct: '_wrap',
/**
 * 是否延迟布局,该值attach到布局管理器时将覆盖布局管理器原有deffer设置,默认不延迟.
 */
        deffer : false,

/**
 * 当面板宽高改变时是否同步计算并更新容器内容组件宽高,默认为true
 * @type Boolean
 */
        syncWrapper : true,

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
/**
 * @type Array
 */
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
 * @name CC.ui.Panel#resized
 * @event
 * @param {Number} contentWidth 面板容器结点内容宽度
 * @param {Number} contentHeight 面板容器结点内容高度
 * @param {Number} width  面板宽度
 * @param {Number} height 面板高度
 */

/**
 * 在设置宽高后发送resized事件,并调用布局管理器布局(layout.doLayout()).
 * @param {Boolean} uncheck 性能优化项,是否比较宽高,如果宽高未变,则直接返回
 * @override 计算容器和Wrapper或内容合适的宽高
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
 * @name CC.ui.Panel#reposed
 * @event
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

(function(cp){

  var borderOpts = {
    insets : [1, 1, 1, 1],
    template : 'WrapPanel',
    ct : '_wrap',
    innerCS :'g-borderpanel',
    wrCS :'g-borderpanel-wrap'
  };

/**
 *
 * @name CC.ui.BorderPanel
 * @class
 */
  CC.ui.BorderPanel = function(opt, cls){
    if(!opt)
      opt = {};
    CC.extendIf(opt, borderOpts);
    var c = new (cls||cp)(opt);
    c.wrapper.addClassIf(c.wrCS);
    return c;
  };

})(CC.ui.Panel);

UX.def('panel', CC.ui.Panel);
})();