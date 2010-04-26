(function(){

var CC = window.CC;
var Event = CC.Event;
var SPP = CC.util.SelectionProvider.prototype;
/**
 * @name CC.ui.menu
 * @namespace
 */
CC.Tpl.def('CC.ui.Menu', '<div class="g-panel g-menu"><div id="_wrap" class="g-panel-wrap"><ul class="g-menu-opt" id="_bdy"  tabindex="1" hidefocus="on"></ul></div></div>')
      .def('CC.ui.MenuItem', '<li class="g-menu-item"><span id="_tle" class="item-title"></span></li>');
/**
 * @class
 * @name CC.ui.menu.MenuSelectionProvider
 * @extends CC.util.SelectionProvider
 */
CC.create('CC.ui.menu.MenuSelectionProvider', CC.util.SelectionProvider,
/**@lends CC.ui.menu.MenuSelectionProvider#*/{
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

/**@private*/
  next : function(){
    var t = this.t, it = this.getNext();
    if(!it) it = t.$(0);
    if(it) it.active(t.menubar);
  },

/**@private*/
  pre : function(){
    var t = this.t, it = this.getPre();
    if(!it) it = t.$(t.size() - 1);
    if(it)  it.active(t.menubar);
  },

/**@private*/
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

/**@private*/
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

/**@private*/
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

/**@private*/
  enter : function(){
    var t = this.t, o = t.onItem;
    if(o) this.select(o);
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
 * @extends CC.Base
 */
CC.create('CC.ui.MenuItem', CC.Base, function(superclass){
return {/**@lends CC.ui.MenuItem# */

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
 * @private
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
/**@private*/
  isActive : function(){
    return this.pCt.onItem === this;
  },

/**@protected*/
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
 * 默认添加在document.body中,菜单按键导航功能由CC.ui.menu.MenuSelectionProvider提供.
 * @name CC.ui.Menu
 * @class 菜单
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Menu', CC.ui.Panel, function(superclass) {
return /**@lends CC.ui.Menu#*/{

  hidden : true,
/**
 * 默认宽度设为115px
 */
  width : 115,
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
 * @name CC.ui.Menubar
 * @class
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