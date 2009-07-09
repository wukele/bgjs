CC.create('CItem', CBase, {});

/**
 *
 */

CC.create('CLayout', null, (function() {
  return {
    container: null,

    ctNode: false,

    wrapper: false,

    initialize: function(opt) {
      if (opt) CC.extend(this, opt);
      this.attach(CC.delAttr(this, 'container'));
    },

    doLayout: function() {
    	if(this.invalidate)
    		return;
      this.onLayout();
      this.container.fire('layouted');
    },
		//
		// 此时容器不一定已渲染
		//
    addComponent: function(comp, cfg) {
      var cc = comp.layoutCfg;
      if (!cc) comp.layoutCfg = cc = {};
        cc[this.type] = cfg;
      if (!this.container.rendered) 
      	return;
      //子项布局后再渲染
      this.layoutChild(comp);
      if (!comp.rendered) comp.render();
    },
		
		insertComponent : fGo,
		
    //protected
    layoutChild: fGo,

    removeComponent: fGo,

    attach: function(container) {
      if (this.container === container) return this;

      if (this.container) this.detach();

      this.container = container;
      this.ctNode = this.container.container;
      this.wrapper = this.container.wrapper;

      if (this.ctCS) this.container.addClass(this.ctCS);

      return this;
    },

    detach: function() {
      var ct = this.container;
      if (this.ctCS) ct.delClass(this.ctCS);
      this.container = null;
      this.ctNode = null;
      this.wrapper = null;
      return this;
    },

    //子项被容器布局后再渲染
    onLayout: function() {
      var i = 0,
      ch, chs = this.container.children,
      len = chs.length;
      for (; i < len; i++) {
        ch = chs[i];
        this.layoutChild(ch);
        if (!ch.rendered) ch.render();
      }
    }
  }
})());

CLayout['default'] = CLayout;

CTemplate['CPanel'] = '<div class="g-panel"></div>';
CTemplate['CWrapPanel'] = '<div class="g-panel"><div class="g-panel-wrap" id="_wrap"></div></div>';
/**
 * 容器类控件.
 *@config keyEvent
 */
CC.create('CContainerBase', CBase, {

  children: null,

  eventable: true,

  container: null,

  minH: 0,

  minW: 0,

  maxH: 65535,

  maxW: 65535,

  ItemClass: CItem,

  autoRender: false,

  initComponent: function() {
    //调用父类初始化.
    CContainerBase.superclass.initComponent.call(this);
    if (this.layout) {
      if (CC.isString(this.layout))
         this.layout = new(CLayout[this.layout])({container: this});
      else this.layout.attach(this);
    }else
    	this.layout = new CLayout({container:this});

    if (this.navKeyEvent) {
      this._bindNavKeyEvent();
      delete this.navKeyEvent;
    }

    if (this.useContainerMonitor && this.itemClickEvent) {
      this.itemAction(this.itemClickEvent === true ? 'mousedown': this.itemClickEvent, this._containerClickTrigger, this.cancelItemClickBubble);
    }
    this.children = [];
  },
	
	createView : function(){
		CBase.prototype.createView.call(this);
    if (!this.container) this.container = this.view;
    //apply container
    else if (CC.isString(this.container)) {
      this.container = this.dom(this.container);
    }
    //再一次检测
    if (!this.container) this.container = this.view;
    //has wrapper?
    if (this.wrapper) {
      this.scrollor = this.wrapper.view || this.wrapper.container;
    }
    //no wrapper , has scrollor?
    else if (this.scrollor && this.scrollor != this.view) {
      this.scrollor = this.dom(this.scrollor);
      this.wrapper = this.$$(this.scrollor);
    }
    //not defined scrollor & wrapper, container default.
    else {
      this.scrollor = this.container;
      this.wrapper = this.scrollor == this.view ? this: this.$$(this.scrollor);
    }

    if (this.wrapCS) {
      this.wrapper.addClass(this.wrapCS);
      delete this.wrapCS;
    }
	},
	
  destoryComponent: function() {
    this.del();
    //clear the binded action of this container component.
    var cs = this.bndActs,
    n;
    if (cs) {
      while (cs.length > 0) {
        n = cs[0];
        this.unDomEvent(n[0], n[2], n[3]);
        cs.remove(0);
      }
    }
    this.destoryChildren();
    CContainerBase.superclass.destoryComponent.call(this);
    this.layout.detach();
  },

  onRender: function() {
    //不能在初始化函数里调用fromArray,因为控件未初始化完成时不能加入子控件.
    if(this.array){
    	this.fromArray(this.array);
    	delete this.array;
    }
    
    CContainerBase.superclass.onRender.call(this);
    this.layout.doLayout();
  },

  /**
	 *添加时默认子控件view将为container结点最后一个子结点,子类可重写该方法以自定子结点添加到容器结点的位置.
	 */
  _addNode: function(dom, idx) {
    if (idx === undefined) this.container.appendChild(dom);
    else {
      this.container.insertBefore(this.container.childNodes[idx], dom);
    }
  },

  _removeNode: function(dom) {
    console.debug(dom);
    this.container.removeChild(dom);
  },

  //向容器中添加一个控件.
  //控件即是本包中已实现的控件,具有基本的view属性.
  //对于只是一般的添加操作容器,可覆盖该方法,更得添加时变得更加快速,例如在一个Grid中,对子项控制要求较少,可直接重写个更有效的方法.
  add: function(a) {
    if (!this.contains(a)) {
      if (a.parentContainer != null) a.parentContainer.remove(a);
      this.children.push(a);

      //默认子项结点将调用_addNode方法将加到容器中.
      this._addNode(a.view);

      //建立子项到容器引用.
      a.parentContainer = this;
      //在useContainerMonitor为false时,是否允许子项点击事件,并且是否由子项自身触发.
      if (!this.useContainerMonitor && this.itemClickEvent && !a._clickTrigger) {
        var bnd = a._clickTrigger = this._itemClickTrigger;
        var clickProxy = this.itemClickEventNode ? a.dom(this.itemClickEventNode) : a.view;
        a.domEvent(this.itemClickEvent === true ? 'mousedown': this.itemClickEvent, bnd, this.cancelItemClickBubble, null, clickProxy);
      }

      this.layout.addComponent.apply(this.layout, arguments);
    }
    return this;
  },

  _containerClickTrigger: function(item, evt) {
    this.fire('itemclick', item, evt);
  },

  //子项点击事件回调,发送itemclick事件.
  _itemClickTrigger: function(event) {
    var p = this.parentContainer;
    p.fire('itemclick', this, event);
  },

  //参数a可为控件实例或控件ID.
  remove: function(a) {
    a = this.$(a);
    a.parentContainer = null;
    this.children.remove(a);
    this._removeNode(a.view);
    this.layout.removeComponent.apply(this.layout, arguments);
    return this;
  },

  removeAll: function() {
    var it, chs = this.children;
    this.invalidate();
    for (var i = 0, len = chs.length; i < len; i++) {
      it = chs[i];
      this.remove(it);
    }
    this.validate();
  },

  //移除容器所有子项.
  destoryChildren: function() {
    var it, chs = this.children;
    this.invalidate();
    for (var i = 0, len = chs.length; i < len; i++) {
      it = chs[i];
      this.remove(it);
      it.destoryComponent();
    }
    this.validate();
  },

  //根据控件ID或控件自身或控件所在数组下标安全返回容器中该控件对象.
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
    if (CC.isNumber(id)) {
      return this.children[id];
    }

    //component
    if (id.type) {
      if (this.children.indexOf(id) == -1) {
        return null;
      }
      return id;
    }

    var chs = this.children;

    for (var i = 0, len = chs.length; i < len; i++) {
      if (chs[i].id == id) {
        return chs[i];
      }
    }
    return null;
  },

  //设置容器中指定控件的显示属性.
  //b为true或false.
  //参数a可为控件实例或控件ID.
  displayItem: function(a, b) {
    a = this.$(a);
    a.display(b);
    return a;
  },

  //返回窗口中控件的索引.
  //参数a可为控件实例或控件ID.
  indexOf: function(a) {
    a = this.$(a);
    return ! a ? -1 : this.children.indexOf(a);
  },

  size: function() {
    return this.children.length;
  },
  //容器是否包含给出控件.
  //参数a可为控件实例或控件ID.
  contains: function(a) {
    if (!a.type) {
      a = this.$(a);
    }
    return this.children.indexOf(a) != -1;
  },

  //b之前插入a.
  insertBefore: function(a, b) {
    var idx = this.indexOf(b);
    this.insert(idx, a);
  },
  
  /**
   * 方法与_addNode保持一致,定义DOM结点在容器结点中的位置.
   */
  _insertBefore : function(n, old){
  	this.container.insertBefore(n, old);
  },
  
  //插入前item 可在容器内.
  //在idx下标处插入item
  //即item放在原idx处项之前
  insert: function(idx, item) {
		var nxt = this.children[idx];
		if(item.parentContainer){
				item.parentContainer.remove(item);
		}		
    item.parentContainer = this;
    //在useContainerMonitor为false时,是否允许子项点击事件,并且是否由子项自身触发.
    if (!this.useContainerMonitor && this.itemClickEvent && !item._clickTrigger) {
      var bnd = item._clickTrigger = this._itemClickTrigger;
      var clickProxy = this.itemClickEventNode ? item.dom(this.itemClickEventNode) : item.view;
      item.domEvent(this.itemClickEvent === true ? 'mousedown': this.itemClickEvent, bnd, this.cancelItemClickBubble, null, clickProxy);
    }
    //如果项在容器中,被删除后重新计算idx
    idx = this.indexOf(nxt);
    if(idx == -1)
    	idx = 0;
    this.children.insert(idx, item);
		
		if(nxt)
			this._insertBefore(item.view, nxt.view);
    else this._addNode(item.view);
    
    this.layout.insertComponent.apply(this.layout, arguments);
    return this;
  },

  clear: function() {
    var ch = this.children;
    for (var i = 0, len = ch.length; i < len; i++) {
      this.remove(ch[0]);
    }
    return this;
  },

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
    } else {
      var p = n2.parentNode;
      var s = n2.nextSibling;

      if (s == n1) {
        p.insertBefore(n1, n2);
      } else if (n2 == n1.nextSibling) {
        p.insertBefore(n2, n1);
      } else {
        n1.parentNode.replaceChild(n2, n1);
        p.insertBefore(n1, s);
      }
    }
    return this;
  },
  /**
	 *对容器控件进行排序,采用Array中sort方法,排序后控件的DOM结点位置也随之改变.
	 */
  sort: function(comparator) {
    var chs = this.children;
    if (comparator === undefined) chs.sort();
    else chs.sort(comparator);

    var oFrag = document.createDocumentFragment();
    for (var i = 0, len = chs.length; i < len; i++) {
      oFrag.appendChild(chs[i].view);
    }

    this.container.appendChild(oFrag);
    this.sorted = true;
    return this;
  },

  reverse: function() {
    var chs = this.children;
    chs.reverse();

    var oFrag = document.createDocumentFragment();
    for (var i = 0, len = chs.length; i < len; i++) {
      oFrag.appendChild(chs[i].view);
    }

    this.container.appendChild(oFrag);
    return this;
  },

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
      } else {
        v = it[attrName] || false;
        if (v == attrV) rt = callback.call(it);
      }
      if (rt === false) break;
    }
    return this;
  },

  each: function(cb, caller) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      var it = this.children[i];
      var rt = cb.call(caller || it, it, i);
      if (rt === false) break;
    }
  },

  /**
	 * 是否为控件的父容器
	 */
  parentOf: function(child) {
    if (!child) return false;
    if (child.parentContainer == this) return true;
    var self = this;
    var r = CC.eachH(child, 'parentContainer', function() {
      if (this == self) return 1;
    });
    return r == true;
  },

  fromArray: function(array, itemclass, itemoptions) {
    itemclass = itemclass || this.ItemClass;
    if (CC.isString(itemclass)) {
      itemclass = window[itemclass];
    }
    var item, itemOpts = itemoptions || this.itemOptions || false;

    for (var i = 0, len = array.length; i < len; i++) {
      item = array[i];
      if (itemOpts) CC.extendIf(item, itemOpts);
      item = new(itemclass)(item);
      //层层生成子项
      if(item.array && item.children){
      	item.fromArray(item.array);
      	delete item.array;
      }
      this.add(item);
    }
    return this;
  },

  connect: function(url, cfg) {
    url = url || this.url;
    if (!cfg) cfg = {};
    cfg.url = url;
    cfg.caller = this;
    if (!cfg.onsuccess) cfg.onsuccess = this.defLoadSuccess;
    if (!this.indicatorDisabled && !this.loadIndicator) {
      this.getLoadIndicator();
    }

    var a = new Ajax(cfg);
    a.to(this);
    a.connect();
    return this;
  },

  getLoadIndicator: function(opt) {
    if (!this.indicatorDisabled && !this.loadIndicator) {
      var cfg = {
        target: this,
        targetLoadCS: this.loadCS
      };
      if (opt) opt = CC.extend(cfg, opt);
      this.loadIndicator = new(this.LoadingClass || window['CLoading'])(cfg);
      this.follow(this.loadIndicator);
    }
    return this.loadIndicator;
  },

  defLoadSuccess: function(ajax) {
    var json = ajax.getJson();
    this.fromArray(json);
  },

  itemAction: function(eventName, callback, cancelBubble, caller, childId, srcName) {
    var act = (function(event) {
      var el = event.target || event.srcElement;
      if (srcName !== undefined) {
        if (el.tagName != srcName) return;
      }

      if (el === this.view) return;
      var item = this.$(el);
      if (item) {
        if (item.disabled) return false;
        callback.call(this, item, event);
      }
    });
    if (!this.bndActs) {
      this.bndActs = [];
    }
    this.bndActs.push([eventName, callback, act]);
    this.domEvent(eventName, act, cancelBubble, caller, childId);
    return this;
  },

  unItemAction: function(eventName, callback, childId) {
    var bnds = this.bndActs;
    childId = childId !== undefined ? childId.tagName ? childId: this.dom(childId) : this.view;
    for (var i = 0, len = bnds.length; i < len; i++) {
      var n = bnds[i];
      if (n[0] == eventName && n[1] == callback(n[3] == childId || n[3] === undefined)) {
        this.unDomEvent(eventName, n[2], n[3]);
        bnds.remove(i);
        return this;
      }
    }

    return this;
  },

  _bindNavKeyEvent: function() {
    var kev = this.navKeyEvent === true ? 'keydown': this.navKeyEvent;
    if (this.container.tabIndex == -1) {
      //ie won't works.
      this.container.tabIndex = 0;
      this.container.hideFocus = 'on';
    }
    this.domEvent(kev, this._onKeyPress, this.cancelKeyBubble, null, this.container);
  },

  _onKeyPress: function(evt) {
    if (this.disabled || this.fire('keydown', evt) === false) return;
    this.onKeyPressing(evt);
  },

  onKeyPressing: fGo,

  //立即布局当前容器.
  validate: function() {
    this.layout.invalidate = false;
    this.container.doLayout();
    return this;
  },

  invalidate: function() {
    this.layout.invalidate = true;
  },

  //布局当前容器,如果当前容器正处于布局变更中,并不执行布局.
  doLayout: function() {
    if(!this.layout.invalidate && this.rendered)
    	this.layout.doLayout();
    return this;
  },

  acceptDrop: function(comp) {
    return comp.parentContainer && comp.parentContainer.type == this.type;
  },

  ondrop: function(comp) {
    this.add(comp);
  }
});

CC.create('CSelectedContainer', CContainerBase, function(superclass) {

  return {

    itemClickEvent: true,

    //Object
    selected: null,

    selectedIndex: -1,

    previousSelected: null,

    selectedCS: 'selected',

    initComponent: function() {

      if (this.navKeyEvent) {
        this.KEY_UP = this.KEY_UP || Event.KEY_UP;
        this.KEY_DOWN = this.KEY_DOWN || Event.KEY_DOWN;
      }

      superclass.initComponent.call(this);

      if (this.itemCallback) {
        this.on('selected', this._itemCallback);
        delete this.itemCallback;
      }

      this.on('itemclick', this._onItemClick);
    },

    _onItemClick: function(item, evt) {
      this.focus();
      this.select(item, this.forceSelect);
    },

    _itemCallback: function(item) {
      if (item.callback) {
        return item.callback.call(item, item);
      }
    },

    onKeyPressing: function(ev) {
      var kc = ev.keyCode;
      if (kc == this.KEY_UP) {
        this.selectPre();
        Event.stop(ev);
      } else if (kc == this.KEY_DOWN) {
        this.selectNext();
        Event.stop(ev);
      } else return this._defKeyNav(ev);
    },

    _defKeyNav: fGo,

    selectNext: function() {
      var idx = this.selectedIndex + 1,
      cs = this.children,
      len = this.children.length;
      while (idx <= len - 1 && (cs[idx].disabled || !cs[idx].display())) {
        idx++;
      }
      if (idx >= 0 && idx <= len - 1) {
        this.select(cs[idx]);
        return cs[idx];
      }
      return null;
    },

    selectPre: function() {
      var idx = this.selectedIndex - 1,
      cs = this.children,
      len = this.children.length;
      while (idx >= 0 && (cs[idx].disabled || !cs[idx].display())) {
        idx--;
      }
      if (idx >= 0 && idx <= len - 1) {
        this.select(cs[idx]);
        return cs[idx];
      }
      return null;
    },

    remove: function(a) {
      if (this.selected == a) this.select(null);
      superclass.remove.call(this, a);
    },

    //选择某个控件,
    //参数a可为控件实例也可为id或数组下标.
    //选择空时a为null
    select: function(a, forceSelect) {
      a = this.$(a);
      if ((a && a.disabled) || a == this.selected && !forceSelect) return this;

      if (this.fire('select', a) === false) return this;

      var cs = this.selectedCS;

      this.previousSelected = this.selected;
      this.selected = a;
      this.selectedIndex = this.indexOf(a);

      if (this.previousSelected && cs) {
        if (this.selectedCSTarget) this.previousSelected.fly(this.selectedCSTarget).delClass(cs).unfly();
        else this.previousSelected.delClass(cs);

      }
      if (!a) return this;
      if (cs) {
        if (this.selectedCSTarget) a.fly(this.selectedCSTarget).addClass(cs).unfly();
        else a.addClass(cs);
      }
      //CC.fly(this.scrollor).scrollChildIntoView(a.view).unfly();
      a.scrollIntoView(this.scrollor);
      this.fire('selected', a);
      if (this.buddleFire && this.parentContainer) {
        this.parentContainer.fire('selected', a);
      }
      return this;
    },

    focus: function(timeout) {
      if (this.disabled) return this;
      var ct = this.container;
      if (timeout)(function() {
        try {
          ct.focus();
        } catch(ee) {}
      }).timeout(0);
      else try {
        ct.focus();
      } catch(e) {}
      return this;
    }
  };
});

/**
 *
 */
CC.create('CPanel', CContainerBase, (function(superclass) {
  return {
    container: '_wrap',

    initComponent: function() {
      var w = false,
      h = false;
      if (this.width !== false) {
        w = this.width;
        this.width = false;
      }

      if (this.height !== false) {
        h = this.height;
        this.height = false;
      }

      superclass.initComponent.call(this);

      if (w !== false || h !== false) this.setSize(w, h);
    },
    //
    // 得到容器距离边框矩形宽高.
    // 该值应与控件CSS中设置保持一致,
    // 用于在控件setSize中计算客户区宽高,并不设置容器的坐标(Left, Top).
    //
    getWrapperInsets: function() {
      return [0, 0, 0, 0, 0, 0];
    },

    /**
		*@override 计算容器和Wrapper合适的宽高.
	  */
    setSize: function(a, b) {
      if (a === this.width) {
        a = false;
      }
      if (b === this.height) {
        b = false;
      }

      if (a === false && b === false) return this;

      var ba = false,
      bb = false,
      rs = false,
      wr = this.wrapper,
      ic = this.getWrapperInsets();
      if (a !== false) {
        if (a.width !== undefined) {
          var c = a;
          a = c.width;
          b = c.height;
        }
        if (a < this.minW) a = this.minW;
        if (a > this.maxW) a = this.maxW;
        ba = a - ic[5];
        if (ba < 0) ba = 0;
        if (wr.width != ba) rs = true;
      }

      if (b !== false) {
        if (b < this.minH) b = this.minH;
        if (b > this.maxH) b = this.maxH;
        bb = b - ic[4];
        if (wr.height != bb) rs = true;
      }

      superclass.setSize.call(this, a, b);

      if (wr.view != this.view && rs) {
        wr.setSize(ba, bb);
      }

      this.fire('resized', ba, bb, a, b);
      this.doLayout();

      return this;
    },

    setXY: function(a, b) {
      if (CC.isArray(a)) {
        b = a[1];
        a = a[0];
      }

      if ((a !== this.left && a !== false) || (b !== this.top && b !== false)) {
        if (a !== this.left && a !== false) {
          this.style('left', a + 'px');
          this.left = a;
        } else a = false;

        if (b !== this.top && b !== false) {
          this.style('top', b + 'px');
          this.top = b;
        } else b = false;
        if (a !== false || b !== false) this.fire('reposed', a, b);
      }

      return this;
    }
  };
}));

CC.create('CSelectedPanel', CSelectedContainer, CPanel.constructors);