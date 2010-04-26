(function() {

  var SC = CC.ui.ContainerBase.prototype,
      SP = CC.ui.Panel.prototype,
      C = CC.Cache;

CC.Tpl.def('CC.ui.TabItemLayout', '<div class="g-panel"><div class="auto-margin" id="_margin"><a href="javascript:fGo()" id="_rigmov" class="auto-rigmov" style="right:0px;"></a><a href="javascript:fGo()" style="left:0px;" id="_lefmov" class="auto-lefmov"></a><div class="auto-scrollor" id="_scrollor" tabindex="1" hidefocus="on"><div class="auto-offset" id="_wrap"></div></div></div></div>');
CC.create('CC.ui.tab.TabItemLayout', CC.layout.Layout, function(father){
return /**@lends CC.ui.tab.TabItemLayout#*/{

  layoutOnChange : true,
  /**
   * 该值须与 CSS 中的.auto-margin值保持同步,因为这里margin并不是由JS控制.
   * 出于性能考虑,现在把它固定下来
   * @property horizonMargin {Number} 水平方向空位
   * @protected
   */
  horizonMargin: 5,

  /**
   * 该值须与左边导航按钮宽度一致,出于性能考虑,现在把它固定下来
   * @property {Number} navLeftWidth
   * @protected
   */
  navLeftWidth: 24,

  /**
   * 该值须与右边导航按钮宽度一致,出于性能考虑,现在把它固定下来
   * @property {Number} navLeftWidth
   * @protected
   */
  navRightWidth: 24,

/**
 * 布局加到容器的样式
 * @protected
 */
  ctCS : 'g-autoscroll-ly',
/**
 * 导航按钮的disabled样式
 * @protected
 */
  disabledLeftNavCS: 'g-disabled auto-lefmov-disabled',

/**
 * 导航按钮的disabled样式
 * @protected
 */
  disabledRightNavCS: 'g-disabled auto-rigmov-disabled',
/**
 * 导航按钮所在结点的样式
 * @protected
 */
  navPanelCS: 'g-mov-tab',

  getMargins : function(){
    return [this.marginLeft||this.horizonMargin, this.marginRight||this.horizonMargin];
  },

/**@override*/
  attach: function(ct){
    father.attach.call(this, ct);

    // 重置margin结点值，忽略CSS设置的值，
    // 使得当CSS值不同的不引起布局的混乱
    var mg = ct.dom('_margin').style, ms = this.getMargins();
    mg.marginLeft = ms[0] + 'px';
    mg.marginRight = ms[1] + 'px';

    this.scrollor = ct.$$('_scrollor');

    //左右导航结点
    var lm = this.lefNav = ct.$$('_lefmov'),
        rm = this.rigNav = ct.$$('_rigmov');

    lm.disabledCS = this.disabledLeftNavCS;
    rm.disabledCS = this.disabledRightNavCS;

    this.attachEvent();
  },

/**@private*/
  attachEvent : function(){
    var lm = this.lefNav, rm = this.rigNav;
    this.ct.on('remove', this.onStructureChange, this)
           .on('closed', this.onStructureChange, this)
           .domEvent('mousedown', this.onNavMousedown, true, this, lm.view)
           .domEvent('mouseup',   this.onNavMouseup,   true, this, lm.view)
           .domEvent('mousedown', this.onNavMousedown, true, this, rm.view)
           .domEvent('mouseup',   this.onNavMouseup,   true, this, rm.view);
  },

  onStructureChange : function(){
    //has left but no right
    if(this.hasLeft() && !this.hasRight())
      this.requireMoreSpace();
    this.doLayout();
  },

/**
 * 点击时是左导航按钮还是右导航按钮?
 * @private
 */
  getDirFromEvent : function(e) {
    return this.lefNav.view.id === CC.Event.element(e).id?'l':'r'
  },

/**
 * 滚动至首个隐藏按钮,使得按钮处于可见状态
 * @param {String} l 或 r
 */
  scrollToNext : function(dir, /**@inner*/norepeat){
    var nxt = this.getNextHiddenItem(dir);
    if(nxt){
      this.scrollItemIntoView(nxt);
      if(!norepeat){
        this.mousedownTimer =
          arguments.callee.bind(this, dir).timeout(300);
      }
    }else{
      clearTimeout(this.mousedownTimer);
      this.mousedownTimer = null;
    }
  },

/**
 * 将子项滚动到可见处
 * @param {CC.ui.TabItem} tabItem
 */
  scrollItemIntoView : function(item){
    if(!item)
      item = this.ct.selectionProvider.selected;

    if(item){
      var dx = this.getScrollIntoViewDelta(item);
      if(dx !== 0){
        if(__debug) console.log('scroll delta:'+dx);

        this.setScrollLeft(this.getScrollLeft() + dx);
      }
      this.checkStatus();
    }
  },

/**
 * @private
 */
  onNavMousedown : function(e){
    this.mousedownTimer = this.scrollToNext.bind(this, this.getDirFromEvent(e)).timeout(300);
  },
/**
 * @private
 */
  onNavMouseup : function(e){
    if(this.mousedownTimer){
        clearTimeout(this.mousedownTimer);
        this.mousedownTimer = null;
    }
    this.scrollToNext(this.getDirFromEvent(e), true);
  },

/**@override*/
  add: function(comp){
    //override & replace
    comp.scrollIntoView = this.scrollItemIntoView.bind(this);
    father.add.apply(this, arguments);
  },

/**
 * 获得Tab容器放置区域可视宽度
 * @private
 */
  getScrollViewWidth : function(){
    return this.scrollor.view.clientWidth;
  },

/**
 * @private
 */
  getScrollLeft : function(){
    return parseInt(this.scrollor.view.scrollLeft, 10) || 0;
  },
/**
 * @private
 */
  setScrollLeft : function(x){
    this.scrollor.view.scrollLeft = x;
  },
/**
 * @private
 */
  hasLeft : function(){
    return this.scrollor.view.scrollLeft>0;
  },
/**
 * @private
 */
  hasRight : function(){
    return this.ct.size() > 0 && this.getScrollRigthLength(this.ct.children[this.ct.size() - 1])>0;
  },
/**
 * @private
 */
  getScrollLeftLength : function(item){
    return this.getScrollLeft() - item.view.offsetLeft;
  },
/**
 * @private
 */
  getScrollRigthLength : function(item){
    var sv = this.getScrollViewWidth(),
        sl = this.getScrollLeft(),
        ol = item.view.offsetLeft,
        ow = item.view.offsetWidth;
    return ol+ow-sl-sv;
  },
/**
 * @private
 */
  getScrollIntoViewDelta : function(item){
    var d = this.getScrollLeftLength(item);

    if(__debug) console.log('scroll left dx:',d);

    if(d>0)
      return -1*d;
    d = this.getScrollRigthLength(item);

    if(__debug) console.log('scroll right dx:',d);

    return d>0?d:0;
  },
/**
 * @private
 */
  requireMoreSpace : function(){
    var nxt = this.getNextHiddenItem('l');
    if(nxt)
      this.scrollItemIntoView(nxt);
  },

  getLastVisibleItem : function(){
    var its = this.ct.children, i = 0,len = its.length;
    for(i=len-1;i>=0;i--){
      if(!its[i].hidden && this.getScrollRigthLength(its[i])<=0)
        return its[i];
    }
  },

/**
 * @private
 */
  getNextHiddenItem : function(dir){
    var its = this.ct.children,
        it,i = 0,len = its.length;

    if(dir === 'l'){
      for (; i < len; i++) {
        it = its[i];
        if(!it.hidden){
          if(this.getScrollLeftLength(it)<=0)
          return its[i-1];
        }
      }
    }else {
      for(i=len-1;i>=0;i--){
        it = its[i];
        if(!it.hidden){
          if(this.getScrollRigthLength(it)<=0)
          return its[i+1];
        }
      }
    }
  },
/**
 * @private
 */
  fixIEOnLayout : function(w){
    var ct = this.ct,
        ms = this.getMargins(),
        w = (w || ct.getWidth(true)) - ms[0] - ms[1]; //margin of wrap.

    ct.fly('_margin').setWidth(w).unfly();
    w -= this.navLeftWidth + this.navRightWidth; //margin of nav bar.
    this.scrollor.setWidth(w);
  },
/**
 * @override
 * @protected
 */
  onLayout : function(w){

   if(__debug) console.group('TabItem布局('+this.ct+')');

   father.onLayout.apply(this, arguments);
   var ct = this.ct,
       scrollor = ct.scrollor,
       selected = ct.selectionProvider.selected;
  //
  // fix ie
  //
  if (CC.ie)
    this.fixIEOnLayout(w);

  // 是否由resized引起的
  if(w !== undefined){
    var dx = false;

    if(this.preWidth === undefined)
      this.preWidth = w;
    else dx = w - this.preWidth;

    this.preWidth = w;

    if (dx) {
      //如果向右扩
      if (dx > 0) {
        //如果右边有隐藏，尽量显示,否则显示左边
        if(!this.hasRight())
          this.setScrollLeft(this.getScrollLeft() - dx);
      }
    }
  }
  if(selected)
      this.scrollItemIntoView(selected);
  else this.checkStatus();

  if(__debug) console.groupEnd();
  },


/**
 * 检查导航按钮状态，是否应显示或禁用。
 */
  checkStatus : function(){
    var ct = this.ct,
        dl = !this.hasLeft(),
        dr = !this.hasRight();

    if(__debug) console.log('checking nav disabled,','hasL:',!dl,'hasR:',!dr);

    this.lefNav.disable(dl);
    this.rigNav.disable(dr);
    ct.checkClass(this.navPanelCS, !dl || !dr);
  }
};
});
/**
 * 注册的CC.ui.tab.TabItemLayout布局
 * @name CC.layout#tabitem
 * @field
 */
CC.layout.def('tabitem', CC.ui.tab.TabItemLayout);

// html template for tabitem
CC.Tpl.def('CC.ui.TabItem', '<table unselectable="on" class="g-unsel g-tab-item"><tbody><tr id="_ctx"><td class="tLe" id="_tLe"></td><td class="bdy"><nobr id="_tle" class="g-tle">选卡1</nobr></td><td class="btn" id="_btnC"><a href="javascript:fGo()" title="关闭" id="_trigger" class="g-ti-btn"></a></td><td class="tRi" id="_tRi"></td></tr></tbody></table>');

/**
 * @name CC.ui.TabItem
 * @class
 * @extends CC.ui.ContainerBase
 */
  CC.create('CC.ui.TabItem', CC.ui.ContainerBase, {

    hoverCS: false,
/**
 * @type Boolean
 */
    closeable: true,

    unselectable: true,

    ct: '_ctx',

    blockMode: 2,
/**
 * 加载时样式
 */
    loadCS: 'g-tabitem-loading',

    initComponent: function() {
      SC.initComponent.call(this);
      var c = this.cacheBtnNode = this.dom('_btnC');
      if (c) c.parentNode.removeChild(c);

      this.bindClsEvent();
      if(this.closeable !== undefined)
        this.setCloseable(this.closeable);

      if(this.panel)
        this.setContentPanel(this.panel);
    },

/**
 * 增加按钮
 * @param {Object} config
 */
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
/**
 * 获得tabItem对应的内容面板
 * @param {Boolean} autoCreate 如果没有,是否自动创建
 * @return {CC.ui.ContainerBase}
 */
    getContentPanel: function(autoCreate) {
      var p = this.panel, ct, tct;
      if (!p && autoCreate) {
        //iframe
        p  = this.src ? new CC.ui.IFramePanel() : new CC.ui.Panel();
        this.setContentPanel(p);
      }
      
        //如果panel未加入tab 的 contentPanel,加入之
      if(p && !p.pCt){
        if((ct = this.pCt) && (tct = ct.getContentPanel())){
        	tct.layout.add(p);
        }
			/**
			 * tab item 销毁时是否连同对应的Panel一起销毁, 当tabitem.panel被自动加入tab.contentPanel面板时,如果该值未设置,则置为true.
			 * @type Boolean
			 */
        if(this.syncPanelDestory === undefined)
          this.syncPanelDestory = true;
      }
      
      return p;
    },
/**
 * 设置TabItem对应的内容面板,设置后,panel有一个bindingTabItem属性指向该TabItem
 * @param {CC.ContainerBase} contentPanel 内容面板,可以是CC.ui.IFramePanel或其它容器
 * @return this
 */
    setContentPanel : function(p){
      if(this.panel)
        delete this.panel.bindingTabItem;

      // 未实例化,实例化之,并不急于添加到tab的contentPanel中,因为contentPanel可能未创建
      if(!p.cacheId)
      	p = CC.ui.instance(p);
            
      this.panel = p;
      //Panel指向TAB项的引用
      p.bindingTabItem = this;
      return this;
    },

    _addNode: function(node) {
      if (this.buttonOrient != 'l') this.fly('_tRi').insertBefore(node).unfly();
      else this.fly('_tLe').insertAfter(node).unfly();
    },

    onClsClick: function() {
      if (this.closeable && this.pCt.getDisc() > 1){
        this.pCt.close(this);
      }
    },

    bindClsEvent: function() {
      var cls = this.$$(this.closeNode);
      if (!cls) {
        cls = this.addButton({
          id: '_clsBtn',
          blockMode: 2,
          icon: 'g-ti-clsbtn'
        });
      }
      //close event.
      this.domEvent('click', this.onClsClick, true, null, cls.view)
          .domEvent('dblclick', this.onClsClick, true);
      //不影响父容器mousedown事件.
      cls.view.onmousedown = CC.Event.noUp;
    },
/**
 * 设置是否可关闭
 * @param {Boolean}
 */
    setCloseable: function(b) {
      if (this.cacheBtnNode) {
        this.closeable = b;
        this.$('_clsBtn').display(b);
      }
      else SC.setCloseable.call(this, b);

      return this;
    },
/**
 * 如果允许自动创建内容面板,loadType设置创建的内容面板加载的内容,默认为html
 * 这个loadType将设置面板的connectionProvider.loadType.
 * @name CC.ui.TabItem#loadType
 * @property {String} loadType
 */

/**
 * 加载项面板内容
 * @return this
 */

    loadContent : function(reload){
      var p = this.getContentPanel(true);
      // 设置默认返回应用html内容
      p.getConnectionProvider().loadType = this.loadType||'html';

      var cp = p.getConnectionProvider(), ind = cp.indicator;
      if (!ind) {
          //自定Loading标识
          ind = cp.getIndicator({
            markIndicator: this.onIndicatorStart,
            stopIndicator: this.onIndicatorStop
          });
      }

      if (reload || (!ind.isLoaded() && !ind.isBusy())){
        cp.connect(this.src || this.url);
      }
      return this;
    },

    /**
     * TabItem内容面板加载时样式设置,这里主要在TabItem上显示一个loading图标.
     */
    onIndicatorStart: function() {
      var item = this.target.bindingTabItem;
      //此时的this为loading indicator.
      item.addClass(item.loadCS);
    },

    onIndicatorStop: function() {
      //此时的this为loading indicator.
      var tg = this.target,
          item = tg.bindingTabItem;
      if (item) {
        item.delClass(item.loadCS);
      }
    },

    //@bug  fixed @v2.0.8.3 reminded by robin {@link http://www.bgscript.com/forum/viewthread.php?tid=38&extra=page%3D1}
    destory: function() {
      this.syncPanelDestory &&
                 this.panel &&
                 this.panel.destory();
      SC.destory.call(this);
    }

  });

  CC.ui.def('tabitem', CC.ui.TabItem);
/**
 * @name CC.ui.Tab
 * @class
 * @extends CC.ui.Panel
 */
  CC.create('CC.ui.Tab', CC.ui.Panel, {

    keyEvent: true,

    clickEvent : true,

    template: 'CC.ui.TabItemLayout',

    innerCS: 'g-tab',

    keyEventNode: '_scrollor',

    selectionProvider : {
      UP: CC.Event.LEFT,
      DOWN: CC.Event.RIGHT,
      tracker:true
    },

    syncWrapper : false,

    maxH: 33,

    itemCls: CC.ui.TabItem,

/**
 * 子项选择时是否自动加载子项内容, 默认为true
 */
    autoLoad: true,
/**
 * 当关闭子项时是否销毁子项,默认为false, 子项也可以设置tabItem.destoryOnClose覆盖设置.
 * @type Boolean
 */
    destoryItemOnclose: false,

    /**
     * 主要用于TabItemLayout布局
     */
    lyCfg: {

      navPanelCS: 'g-mov-tab',

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

      this.on('selected', this.onItemSelected);
    },

    onItemSelected : function(item){
      if((item.url || item.src) && this.autoLoad){
        item.loadContent();
      }

      var self = this;

      (function(){
        var pre = self.selectionProvider.previous;

        pre && pre.getContentPanel() && !pre.panel.hidden && pre.panel.hide();

        self.displayItem(item, true);

        if (item.getContentPanel())
         item.panel.show();

      }).timeout(0);
    },

    /**
     * 关闭指定TabItem,当只有一个TabItem时忽略.
     */
    close: function(item) {
      item = this.$(item);
      if(item.closeable){
        if (this.fire('close', item) !== false){
          this.displayItem(item, 0);
          this.fire('closed', item);
          if(item.destoryOnClose === true || this.destoryItemOnclose){
            item.destory();
          }
        }
      }
    },

/**
 * 获得内容面板
 */
    getContentPanel : function(){
      var cp = this.contentPanel;

      if(typeof cp === 'string')
        cp = this.contentPanel = CC.Base.find(cp);

      return cp;
    },

    //@override
    beforeAdd: function(it) {
      if(SP.beforeAdd.call(this, it) !== false){
        if (it.getContentPanel())
          it.panel.display(false);
      }
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
          p.select(chs[tmp]);
          return;
        }

        tmp = chs.length;
        idx += 1;
        while (idx < tmp && (chs[idx].hidden || chs[idx].disabled)) {
          idx++;
        }
        if (idx < tmp) {
          p.select(chs[idx]);
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

  CC.ui.def('tab', CC.ui.Tab);
})();