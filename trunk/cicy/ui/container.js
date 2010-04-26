(function () {

var CC = window.CC;
var Base = CC.Base;
var cptx = Base.prototype;
var UX = CC.ui;
/**
 * @name CC.layout
 * @namespace �����಼�ֹ�����
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
 * @class ���ֹ���������
 */
CC.create('CC.layout.Layout', null,
/**@lends CC.layout.Layout.prototype*/ {
        /**
         * ���ֹ�������Ӧ��������
         * @property {CC.Base} ct
         */
        ct: null,
/**
 * ���ÿ�β��ֶ��漰������������,���ֵӦ��Ϊtrue,�Ա��ڵ�����������(add, remove, display)ʱ���²�������
 */
        layoutOnChange : false,

/**
 * @property {Boolean} [deffer=false]
 * �ӳٶ��ٺ�����ٲ���,����������û�����,
 * ��ע�����ͬ��,�������������ڲ���ʱ����Ⱦ,
 * ���deffer����,��������Ⱦ������JavaScript��һ���ڵ���.
 */
        deffer : false,

        /**
         * ��ʼ������
         * @param {Object} opt ����������Ϣ
         */
        initialize: function(opt){
            if (opt)
                CC.extend(this, opt);
            var ct = CC.delAttr(this, 'ct');
            if(ct)
              this.attach(ct);
        },

        /**
         * �������������ǰ�����á�
         * @param {CC.Base} comp ����
         * @param {Object} cfg �����ò��ֵ�������Ϣ
         * @function
         */
        beforeAdd: fGo,
/**
 * @name CC.Base#lyInf
 * @property {Object} lyInf ������������,
    ����ؼ������ֹ�����������,
    �䲼����ص�������Ϣ�������component.lyInf,
    Ҫ�������ǰ������Ϣ,��ͨ��layout.cfgFrom(component)�������.
 * @protected
 * @see #cfgFrom
 * @example
   var ct = ct;
   var borderLayoutInformation = item.lyInf;
 */

/**
 * ����� component ��ӵ�����,
 * �������������Ч�Ĳ��ֹ�����,����Ӳ��ֹ���������������,
 * ������ֱ�ӵ�������add����, ��������������(remove, insert)ͬ��.
 * ���layoutOnChangeΪtrue,�����������²�������,����ֻ����layoutChild�Լ���������в���.
 * @param {CC.Base} component
 * @param {Object} cfg ���������Ϣ
 * @return this
 */
        add : function(comp, cfg){

          // ��JSON��ʽ����
          if(!comp.cacheId){
            comp = UX.instance(comp);
          }

          //��ӵ�����
          this.ct.add(comp);
          var cc = comp.lyInf;
          if (!cc)
            comp.lyInf = cc = cfg || {};
          else if(cfg)
            CC.extend(cc, cfg);
          this.beforeAdd(comp, cc);
/**
 * @name CC.layout.Layout#itemCS
 * @property {String} itemCS ������ӽ�����ʱ��ӵ������CSS��ʽ
 */
          if(this.itemCS)
            comp.addClassIf(this.itemCS);

          if(this.isUp()){
            if (!comp.rendered)
              comp.render();

            if(this.layoutOnChange)
              this.doLayout();
            else this.layoutChild(comp); //����ֺ�����Ⱦ
          }
          return this;
        },
/**
 * ��ǰ���ֹ������Ƿ����ִ��doLayout����
 * @private
 */
        isUp : function(){
          return !this.invalidate && this.ct.rendered;
        },

/**
 * ��ʾ/��������,���layoutOnChangeΪtrue�����²�������
 */
        display : function(c, b){
          c.display(b);
          if(this.layoutOnChange)
            this.doLayout();
        },

/**
 * @name CC.layout.Layout#invalidate
 * @property {Boolean} [invalidate=false] ָʾ����������ʱ�Ƿ�ִ�в���,����������ظ����ֵĲ�����������invalidate=true,ִ�����������invalidate=false,�ٵ���{@link #doLayout}����.
 * �����಻��ֱ�����ø�����,�ɵ���{@link CC.ui.ContainerBase#validate}��{@link CC.ui.ContainerBase#invalidate}��������.
 */

/**
 * ִ�в���,Ҫ��д����Ӧ��дonLayout����.
 */
        doLayout: function(){
          if(this.isUp()){
            //���ɼ�ʱ����������������,���Ǵ���ʾʱ�ٲ���
            //�μ�ct.display
            if(this.ct.hidden){
              if(__debug) console.log(this,'������������״̬,δ��������..');
/**
 * @property {Array} defferArgs �ӳٲ����мĴ�Ĳ��ַ�������
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
 * ��ÿؼ���ǰ������ص�����������Ϣ, �õ��������κ�ʱ�򶼻᷵��һ����null����,��ʹ������ò�����.
 * @param {CC.Base} item
 * @return {Object} �ؼ���ǰ������ص�����������Ϣ
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
         * ��û����Ե����ؼ����ֵĿ�ֱ�Ӻ���.
         * @protected
         * @param {CC.Base} comp
         * @param {Object} cfg
         */
        layoutChild: fGo,

        /**
         * ��������ʱ���ò����²���,
         * ע��:�Ӳ��ֹ������Ƴ��ӿؼ������������Ƴ�.
         * ���layoutOnChange����Ϊfalseʱ�����á�
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
        },

        /**
         * �����ֹ�����Ӧ�õ�һ�������ؼ��С�
         * @param {Object} ct
         */
        attach: function(ct){
            this.ct = ct;
            if(ct.deffer !== undefined)
              this.deffer = ct.deffer;
/**
 * @name CC.layout.Layout#ctCS
 * @property {String} ctCS ��ʼ��ʱ��ӵ���������ʽ
 */
            if (this.ctCS)
                ct.addClass(this.ctCS);
/**
 * @name CC.layout.Layout#wrCS
 * @property {String} wrCS ��ʼ��ʱ��ӵ�����ct.wrapper����ʽ
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
         * �Ƴ������Ĳ��ֹ�����.
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
         * ����������ֺ�����Ⱦ.
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
// WrapPanelģ��, ����wrap����padding,border������Ӱ�쵽panel��Ŀ�ߵļ���,
// ���ƹ��������BoxModel�����Ĳ�ͬ
//
CC.Tpl.def( 'CC.ui.Panel', '<div class="g-panel"></div>')
      .def( 'CC.ui.WrapPanel', '<div class="g-panel"><div class="g-panel-wrap" id="_wrap"></div></div>');

/**
 * ������ؼ�,�����ǻ������չ,�ɰ�����������,
 * �����Ҳ����һ������,�γ��������
 * @name CC.ui.ContainerBase
 * @class ��������
 * @extends CC.Base
 */
CC.create('CC.ui.ContainerBase', Base,
/**@lends CC.ui.ContainerBase.prototype*/
{

  /**
 * @property {Array} children �����ӿؼ���Ŵ�
 * @readonly
 */
  children: null,
/**
 * @property {Boolean} [eventable=true] �ɴ����¼�,����ͨ��on�������������¼�
 * @readonly
 * @example
   ct.on('resized', function(){
     //...
   });
 */
  eventable: true,

/**
 * ָ������������,ID��HtmlԪ��
 * @type HTMLElement|String
 */
  ct: null,

  minH: 0,

  minW: 0,

  maxH: 65535,

  maxW: 65535,
 /**
 * @property {Base} [itemCls=CC.ui.Item] �����ӿؼ���, fromArray�������ݸ�������ʵ��������
 * @see #fromArray
 */
  itemCls: CC.ui.Item,
  /**
 * @property {Boolean} [autoRender=false] �����ӿؼ���
 */
  autoRender: false,

/**
 * @property {Boolean|CC.util.SelectionProvider} selectionProvider �Ƿ������Ӧ������ѡ����
 */
  selectionProvider : false,

  initialize : function(){
    Base.prototype.initialize.apply(this, arguments);
    //pre load children
/**
 * @name CC.ui.ContainerBase#array
 * @property {Array} array �������ݳ�ʼ������
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
 * @property {Boolean} keyEvent �Ƿ������̼����¼�
 */
    if (this.keyEvent)
      this.bindKeyInstaller();

    /**
 * @name CC.ui.ContainerBase#useContainerMonitor
 * @property {Boolean} useContainerMonitor �Ƿ����������ϴ�������DOM�¼�
 */

/**
 * @name CC.ui.ContainerBase#cancelClickBubble
 * @property {Boolean|String} [cancelClickBubble=false] �Ƿ�ֹͣ����clickEvent�¼���DOM�����¼�ð��
 */
    /**
 * @name CC.ui.ContainerBase#clickEvent
 * @property {Boolean|String} clickEvent ����������¼�,���Ϊtrue,Ĭ���¼�Ϊmousedown
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
 * @property {Layout|String} [layout='default'] �������ֹ�����
 */
      if (typeof this.layout === 'string') {
/**
 * @name CC.ui.ContainerBase#lyCfg
 * @property {Object} lyCfg ���ֹ�������ʼ������
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
 * ����������DOM���
 */
  createView: function() {
    cptx.createView.call(this);
    if (!this.ct) this.ct = this.view;

    //apply ct
    else if (typeof this.ct === 'string')
      this.ct = this.dom(this.ct);

    //��һ�μ��
    if (!this.ct)
      this.ct = this.view;
 /**
  * container.ct����Ӧ��Base����,�����ǰcontainer.view === container.ct,��wrapperΪ��������.
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
 * ��ʱ����fromArray(array)��������,��onRender�󲼾�����.
 * @override
 */
  onRender: function() {
    cptx.onRender.call(this);
    // layout ct
    this.layout.doLayout();
  },

  /**
     * ���ʱĬ���ӿؼ�view��Ϊct������һ���ӽ��,�������д�÷������Զ��ӽ����ӵ���������λ��.
     * @param {DOMElement} dom ����view���
     * @param {Number} [idx]
     */
  _addNode: function(dom, idx) {
    if (idx === undefined) this.ct.appendChild(dom);
    else {
      this.ct.insertBefore(this.ct.childNodes[idx], dom);
    }
  },
  /**
 * �Զ����Ƴ������е�����DOMԪ��.
 * @param {DOMElement} dom ����view���
 */
  _removeNode: function(dom) {
    dom.parentNode.removeChild(dom);
  },

/**
 * �����������һ���ؼ�,Ĭ�������������Ⱦ,��������������Ⱦ,
 * ���Ǵ���ĵڶ�������Ϊtrue,ָʾδ����Ⱦ����.
 * ���ֹ����������,�����������δ��Ⱦ����,�ȴ�����ֺú�����Ⱦ.
 * �ؼ����Ǳ�������ʵ�ֵĿؼ�,���л�����view����.
 * ���Ҫ������������,�����fromArray����.
 * @param {Base} a ����
 */
  add: function(a) {

    // ��JSON��ʽ����
    if(!a.cacheId){
      a = UX.instance(a);
    }

/**
 * ���ǰ����
 * @name CC.ui.ContainerBase#beforeadd
 * @event
 * @param {CC.Base} component
 */
      if(this.fire('beforeadd', a) !== false && this.beforeAdd(a) !== false){
        this.onAdd(a);
        this.afterAdd(a);
/**
 * ��Ӻ󷢳�
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
    //Ĭ�������㽫����_addNode�������ӵ�������.
    this._addNode(a.view);
    //���������������.
    a.pCt = this;

    //Ĭ�������������Ⱦ,��������������Ⱦ
    if(this.rendered && !a.rendered){
      a.render();
    }
  },

/**
 * @protected
 */
  beforeAdd : function(a){
      if (a.pCt)
        a.pCt.remove(a);
      //��useContainerMonitorΪfalseʱ,�Ƿ������������¼�,�����Ƿ�������������.
      if (!this.useContainerMonitor && this.clickEvent && !a.__click) {
        var bnd = a.__click = this.clickEventTrigger;
        var clickProxy = this.clickEventNode ? a.dom(this.clickEventNode) : a.view;
        a.domEvent(this.clickEvent === true ? 'mousedown': this.clickEvent, bnd, this.cancelClickBubble, null, clickProxy);
      }
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
 * �������¼��ص�,����clickEvent�¼�.
 * @private
 */
  clickEventTrigger: function(event) {
    var p = this.pCt;
    if (!this.clickDisabled) p.fire('itemclick', this, event);
  },

/**
 * �Ƴ�ǰ����
 * @name CC.ui.ContainerBase#beforeremove
 * @event
 * @param {CC.Base} component
 */

/**
 * �Ƴ�����
 * @name CC.ui.ContainerBase#remove
 * @event
 * @param {CC.Base} component
 */

/**
 * �������Ƴ�������������,�Ƴ�������Ҳ�����йܵ��ӿؼ�.
 * ������������ɲ��ֹ���������,�ڵ��ø÷�������
 * ct.doLayout���²���, ��ֱ����ct.layout.remove(component)�Ƴ�����.
 * @param {String|CC.Base} ��Ϊ�ؼ�ʵ����ؼ�ID
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
   * �Ƴ�����󷢳�
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
 * �Ƴ���������.
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
     * ����������������.
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
     * ���ݿؼ�ID��ؼ������ؼ����������±갲ȫ���������иÿؼ�����.
     * <li>idΪ�ؼ�id,���ַ�����ʽ,����id��Ӧ������,���򷵻�null
     * <li>idΪ���ָ�ʽ,���������±��Ӧ����,���򷵻�null
     * <li>idΪ����,ֱ�ӷ��ظ�����
     * @param {CC.Base|String|Number} id �ӿؼ�
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
        if (__debug) console.log(this, '�ݾ���ʾʱ����..', ly.defferArgs);
        ly.doLayout.apply(ly, ly.defferArgs);
        //���ñ��
        ly.defferArgs = false;

        if(this.shadow){
         (function() {
           this.shadow.reanchor().display(true);
         }).bind(this).timeout(ly.deffer||0);
        }
      }
  },

  /**
 * ���ش����пؼ�������.
 * @param {String|CC.Base} ����a��Ϊ�ؼ�ʵ����ؼ�ID
 */
  indexOf: function(a) {
    a = this.$(a);
    return ! a ? -1 : this.children.indexOf(a);
  },
  /**
 * �����������
 * @return {Number}
 */
  size: function() {
    return this.children.length;
  },
  /**
 * �����Ƿ���������ؼ�.
 * @param {String|CC.Base} ����a��Ϊ�ؼ�ʵ����ؼ�ID
 * @return {Boolean}
 */
  contains: function(a) {
    if (!a.type) {
      a = this.$(a);
    }
    return a.pCt === this;
  },

  /**
 * ����b֮ǰ������a.
 * @param {CC.Base} a
 * @param {CC.Base} a
 */
  insertBefore: function(a, b) {
    var idx = this.indexOf(b);
    this.insert(idx, a);
  },

  /**
     * ������_addNode����һ��,����DOM�������������е�λ��.
     * @param {DOMElement} n
     * @param {DOMElement} old
     */
  _insertBefore: function(n, old) {
    this.ct.insertBefore(n, old);
  },

  /**
     * ����ǰitem ����������, ��idx�±괦����item, ��item����ԭidx����֮ǰ.
     * @param {Number} index
     * @param {CC.Base} item
     * @return this
     */
  insert: function(idx, item) {

    //�����������ڲ�,Remove�����λ��
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
 * ͬ{@link #removeAll}
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
 * ����������.
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
     * �������ؼ���������,����Array��sort����,�����ؼ���DOM���λ��Ҳ��֮�ı�.
     * @param {Function} comparator �Ƚ���
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
 * ��ת�ӿؼ�
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
 * ���˷�ʽ�����ӿؼ�.
 * @param {Function} matcher
 * @param {Object} ����matcher��this
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
 * ���ݿؼ�ĳ������ֵ����������.
 * @param {Function} callback ����������Ļص�,���ݵ�ǰ����������
 * @param {String} attrName ������
 * @param {Object} attrV ���Ե�����ֵ
 * @param {Boolean} [strictEq=false] �Ƿ�ʹ�þ��ԵȱȽϷ�ʽ
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
 * ö������, ����ص���������false,����ֹö��.
 * @param {Function} callback �ص�,���ݲ���Ϊ callback(item, i)
 * @param {Object} caller ����callback��this, Ĭ��Ϊ����
 * @return ���һ���ص����ý��ֵ
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
     * �Ƿ�Ϊ�ؼ��ĸ�����
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
 * ������������, �����ڳ�ʼ�����������fromArray,��Ϊ�ؼ�δ��ʼ�����ʱ���ܼ����ӿؼ�.
 * ����Ѱ�����ȼ�Ϊ :
 * {item option}.ctype -> ����itemclass -> ����.itemCls,
 * ������itemCls����Ϊctype�ַ���, Ҳ����Ϊ������
 * @param {Array} array ����ʵʼ������
 * @param {CC.Base} [itemclass=this.itemCls] ��ѡ, ����
 * @return this
 */
  fromArray: function(array, cls) {
    cls = cls || this.itemCls;
    if (typeof cls === 'string') {
      cls = CC.ui.ctypes[cls];
    }

/**
 * @name CC.ui.ContainerBase#itemCfg
 * @property {Object} itemCfg ���������������{@link #fromArray}ʱ���������
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
	  			
			it = it.ctype ? UX.instance(it) : new(cls||CC.ui.Item)(it);
		
			//�����������
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
 * ���ڼ������̰������¼�����,�����ֵ��������ʼ��ʱ������,
 * �ɼ�������������keydown�¼�
 * @example
   var ct = new CC.ui.ContainerBase({keyEvent:true});
   ct.on('keydown', function(event){
      this....
   });
 */
/**
 * @name CC.ui.ContainerBase#keydown
 * @event
 * ����Ѱ�װ���̼�����,���̰�������ʱ���͸��¼�
 * @param {DOMEvent} e
 */
/**
 * ��װ�����¼�������,���ڷ���������keydown�¼�,
 * һЩ����ѡ����(CC.util.SelectionProvider)�ؼ���Ĭ�Ͽ����˸ù���.
 * ��ͨ����ȡ����keyEvent���Լ���Ƿ�װ�˼�����
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
 * ��װ����itemclick�¼�
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
 * �ڴ�����keydown�¼���Ĭ�ϵ��õĻص�����,
 * ����һ���ӿں���,Ĭ��Ϊ�պ���,�������ͨ��ct.on��ʽ����,
 * ��ͨ����д�÷������ٴ������¼�
 */
  onKeyPressing: fGo,

/**
 * �����۽�,��ͨ������timeout��undefinedֵ����ʱ�۽�
 * @param {Number} timeout ���ó�ʱ
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
   * �������ֵ�ǰ����
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
   * ���ֵ�ǰ����,�����ǰ���������ڲ��ֱ����,����ִ�в���
   * @return this
   */
  doLayout: function() {
    if (!this.layout.invalidate && this.rendered) this.layout.doLayout.apply(this.layout, arguments);
    return this;
  },

/**
 * �����������ݿ���Զ�����.
 * @override
 * @return this
 */
  autoHeight: function() {
    var v = this.ct;
    this.setSize(this.getWidth(true) + v.scrollWidth - v.clientWidth, this.getHeight(true) + v.scrollHeight - v.clientHeight);
    return this;
  },
    /**
     * ��Ը������,����ľ���������ӽǾ���.
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
 * ����ID��ָ������������Ѱ���ӿؼ�.
 * @param {String} childId IDֵ��ָ�����Ե�ֵ
 * @param {String} attributeName ��һ����idֵ,����ָ��������������
 * @param {Boolean} [returnMore] �Ƿ񷵻ص�һ������ 
 * @return {CC.Base|null|Array} ��� returnMore δ����,���ص�һ��ƥ���null,���򷵻�һ������,�������е�ƥ��.
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
 * �Թ�����ȱ����ؼ���
 * @param {Function} cb callback,  ����Ϊ callback(idxOfItemContainer, totalCounter), ����falseʱ��ֹ����;
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
 * ��������Ĺ��������ڿؼ�,����ؼ���������û�����������,���ؿؼ�wrapper,���򷵻ظ�����wrapper,
 * ��ȷ������scrollor�����ڿ����������ݵĹ���,
 * ����ƿؼ�ʱ�ɸ��ݿؼ�����ṹ�ص�ָ��scrollor.
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
 * �������������Ҫ�����ǿɷ���resized, reposed�¼�,�ɶ���wrapperλ��
 * @name CC.ui.Panel
 * @class ���
 * @extends CC.ui.ContainerBase
 */
CC.create('CC.ui.Panel', ccx, function(superclass){
 return /**@lends CC.ui.Panel#*/{
/**
 * Ĭ��ΪIDΪ_wrap,��������ڸý��,��ָ��ǰ����view���
 * @type HTMLElement|String
 */
        ct: '_wrap',
/**
 * �Ƿ��ӳٲ���,��ֵattach�����ֹ�����ʱ�����ǲ��ֹ�����ԭ��deffer����,Ĭ�ϲ��ӳ�.
 */
        deffer : false,

/**
 * ������߸ı�ʱ�Ƿ�ͬ�����㲢������������������,Ĭ��Ϊtrue
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
 * �õ���������߿���ο��.
 * ��ֵӦ��ؼ�CSS�����ñ���һ��,
 * �����ڿؼ�setSize�м���ͻ������,������������������(Left, Top).
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
 * @param {Number} contentWidth �������������ݿ��
 * @param {Number} contentHeight �������������ݸ߶�
 * @param {Number} width  �����
 * @param {Number} height ���߶�
 */

/**
 * �����ÿ�ߺ���resized�¼�,�����ò��ֹ���������(layout.doLayout()).
 * @param {Boolean} uncheck �����Ż���,�Ƿ�ȽϿ��,������δ��,��ֱ�ӷ���
 * @override ����������Wrapper�����ݺ��ʵĿ��
 */
        setSize: function(a, b, uncheck){
            var w = this.width, h = this.height;
            if(!uncheck){
              w = w===false?a:w===a?false:a;
              h = h===false?b:h===b?false:b;
            }

            if (w !== false || h !== false){
              superclass.setSize.call(this, w, h);
              //��max,minӰ��,���»��
              if(w !== false) w = this.width;
              if(h !== false) h = this.height;

              var wr = this.wrapper, spaces,cw, ch;
              //���wrapper���������
              if(wr.view !== this.view && this.syncWrapper){
                spaces = this.getWrapperInsets();
                cw = w===false?w:Math.max(w - spaces[5], 0);
                ch = h===false?h:Math.max(h - spaces[4], 0);
                wr.setSize(cw, ch);
                //��max,minӰ��,���»��
                if(cw !== false) cw = wr.width;
                if(ch !== false) ch = wr.height;
              }else {
                //����������,��������content size
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
 * @param {Number} left ���ú����x����
 * @param {Number} top  ���ú����y����
 * @param {Number} deltaX
 * @param {Number} deltaY
 */

/**
 * �������x,y����
 * ���ú���reposed�¼�
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