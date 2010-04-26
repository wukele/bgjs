(function() {

  var SC = CC.ui.ContainerBase.prototype,
      SP = CC.ui.Panel.prototype,
      C = CC.Cache;

CC.Tpl.def('CC.ui.TabItemLayout', '<div class="g-panel"><div class="auto-margin" id="_margin"><a href="javascript:fGo()" id="_rigmov" class="auto-rigmov" style="right:0px;"></a><a href="javascript:fGo()" style="left:0px;" id="_lefmov" class="auto-lefmov"></a><div class="auto-scrollor" id="_scrollor" tabindex="1" hidefocus="on"><div class="auto-offset" id="_wrap"></div></div></div></div>');
CC.create('CC.ui.tab.TabItemLayout', CC.layout.Layout, function(father){
return /**@lends CC.ui.tab.TabItemLayout#*/{

  layoutOnChange : true,
  /**
   * ��ֵ���� CSS �е�.auto-marginֵ����ͬ��,��Ϊ����margin��������JS����.
   * �������ܿ���,���ڰ����̶�����
   * @property horizonMargin {Number} ˮƽ�����λ
   * @protected
   */
  horizonMargin: 5,

  /**
   * ��ֵ������ߵ�����ť���һ��,�������ܿ���,���ڰ����̶�����
   * @property {Number} navLeftWidth
   * @protected
   */
  navLeftWidth: 24,

  /**
   * ��ֵ�����ұߵ�����ť���һ��,�������ܿ���,���ڰ����̶�����
   * @property {Number} navLeftWidth
   * @protected
   */
  navRightWidth: 24,

/**
 * ���ּӵ���������ʽ
 * @protected
 */
  ctCS : 'g-autoscroll-ly',
/**
 * ������ť��disabled��ʽ
 * @protected
 */
  disabledLeftNavCS: 'g-disabled auto-lefmov-disabled',

/**
 * ������ť��disabled��ʽ
 * @protected
 */
  disabledRightNavCS: 'g-disabled auto-rigmov-disabled',
/**
 * ������ť���ڽ�����ʽ
 * @protected
 */
  navPanelCS: 'g-mov-tab',

  getMargins : function(){
    return [this.marginLeft||this.horizonMargin, this.marginRight||this.horizonMargin];
  },

/**@override*/
  attach: function(ct){
    father.attach.call(this, ct);

    // ����margin���ֵ������CSS���õ�ֵ��
    // ʹ�õ�CSSֵ��ͬ�Ĳ����𲼾ֵĻ���
    var mg = ct.dom('_margin').style, ms = this.getMargins();
    mg.marginLeft = ms[0] + 'px';
    mg.marginRight = ms[1] + 'px';

    this.scrollor = ct.$$('_scrollor');

    //���ҵ������
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
 * ���ʱ���󵼺���ť�����ҵ�����ť?
 * @private
 */
  getDirFromEvent : function(e) {
    return this.lefNav.view.id === CC.Event.element(e).id?'l':'r'
  },

/**
 * �������׸����ذ�ť,ʹ�ð�ť���ڿɼ�״̬
 * @param {String} l �� r
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
 * ������������ɼ���
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
 * ���Tab��������������ӿ��
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

   if(__debug) console.group('TabItem����('+this.ct+')');

   father.onLayout.apply(this, arguments);
   var ct = this.ct,
       scrollor = ct.scrollor,
       selected = ct.selectionProvider.selected;
  //
  // fix ie
  //
  if (CC.ie)
    this.fixIEOnLayout(w);

  // �Ƿ���resized�����
  if(w !== undefined){
    var dx = false;

    if(this.preWidth === undefined)
      this.preWidth = w;
    else dx = w - this.preWidth;

    this.preWidth = w;

    if (dx) {
      //���������
      if (dx > 0) {
        //����ұ������أ�������ʾ,������ʾ���
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
 * ��鵼����ť״̬���Ƿ�Ӧ��ʾ����á�
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
 * ע���CC.ui.tab.TabItemLayout����
 * @name CC.layout#tabitem
 * @field
 */
CC.layout.def('tabitem', CC.ui.tab.TabItemLayout);

// html template for tabitem
CC.Tpl.def('CC.ui.TabItem', '<table unselectable="on" class="g-unsel g-tab-item"><tbody><tr id="_ctx"><td class="tLe" id="_tLe"></td><td class="bdy"><nobr id="_tle" class="g-tle">ѡ��1</nobr></td><td class="btn" id="_btnC"><a href="javascript:fGo()" title="�ر�" id="_trigger" class="g-ti-btn"></a></td><td class="tRi" id="_tRi"></td></tr></tbody></table>');

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
 * ����ʱ��ʽ
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
 * ���Ӱ�ť
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
 * ���tabItem��Ӧ���������
 * @param {Boolean} autoCreate ���û��,�Ƿ��Զ�����
 * @return {CC.ui.ContainerBase}
 */
    getContentPanel: function(autoCreate) {
      var p = this.panel, ct, tct;
      if (!p && autoCreate) {
        //iframe
        p  = this.src ? new CC.ui.IFramePanel() : new CC.ui.Panel();
        this.setContentPanel(p);
      }
      
        //���panelδ����tab �� contentPanel,����֮
      if(p && !p.pCt){
        if((ct = this.pCt) && (tct = ct.getContentPanel())){
        	tct.layout.add(p);
        }
			/**
			 * tab item ����ʱ�Ƿ���ͬ��Ӧ��Panelһ������, ��tabitem.panel���Զ�����tab.contentPanel���ʱ,�����ֵδ����,����Ϊtrue.
			 * @type Boolean
			 */
        if(this.syncPanelDestory === undefined)
          this.syncPanelDestory = true;
      }
      
      return p;
    },
/**
 * ����TabItem��Ӧ���������,���ú�,panel��һ��bindingTabItem����ָ���TabItem
 * @param {CC.ContainerBase} contentPanel �������,������CC.ui.IFramePanel����������
 * @return this
 */
    setContentPanel : function(p){
      if(this.panel)
        delete this.panel.bindingTabItem;

      // δʵ����,ʵ����֮,����������ӵ�tab��contentPanel��,��ΪcontentPanel����δ����
      if(!p.cacheId)
      	p = CC.ui.instance(p);
            
      this.panel = p;
      //Panelָ��TAB�������
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
      //��Ӱ�츸����mousedown�¼�.
      cls.view.onmousedown = CC.Event.noUp;
    },
/**
 * �����Ƿ�ɹر�
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
 * ��������Զ������������,loadType���ô��������������ص�����,Ĭ��Ϊhtml
 * ���loadType����������connectionProvider.loadType.
 * @name CC.ui.TabItem#loadType
 * @property {String} loadType
 */

/**
 * �������������
 * @return this
 */

    loadContent : function(reload){
      var p = this.getContentPanel(true);
      // ����Ĭ�Ϸ���Ӧ��html����
      p.getConnectionProvider().loadType = this.loadType||'html';

      var cp = p.getConnectionProvider(), ind = cp.indicator;
      if (!ind) {
          //�Զ�Loading��ʶ
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
     * TabItem����������ʱ��ʽ����,������Ҫ��TabItem����ʾһ��loadingͼ��.
     */
    onIndicatorStart: function() {
      var item = this.target.bindingTabItem;
      //��ʱ��thisΪloading indicator.
      item.addClass(item.loadCS);
    },

    onIndicatorStop: function() {
      //��ʱ��thisΪloading indicator.
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
 * ����ѡ��ʱ�Ƿ��Զ�������������, Ĭ��Ϊtrue
 */
    autoLoad: true,
/**
 * ���ر�����ʱ�Ƿ���������,Ĭ��Ϊfalse, ����Ҳ��������tabItem.destoryOnClose��������.
 * @type Boolean
 */
    destoryItemOnclose: false,

    /**
     * ��Ҫ����TabItemLayout����
     */
    lyCfg: {

      navPanelCS: 'g-mov-tab',

      horizonMargin: 5,

      /**
         * ��ֵ������ߵ�����ť���һ��,�������ܿ���,���ڰ����̶�������
         * @property {Number} navLeftWidth
         */
      navLeftWidth: 24,

      /**
         * ��ֵ�����ұߵ�����ť���һ��,�������ܿ���,���ڰ����̶�������
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
     * �ر�ָ��TabItem,��ֻ��һ��TabItemʱ����.
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
 * ����������
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

    //�Ƿ���ʾָ����TabItem,
    //����a��ΪTabItemʵ��Ҳ��ΪTabItem��id,bΪtrue��false.
    displayItem: function(a, b) {
      a = this.$(a);
      //Cann't change this attribute.
      if (!a.closeable && !b) {
        return false;
      }

      var isv = !a.hidden;

      a.display(b);

      var p = this.selectionProvider;
      //�л���һ��TabItem
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

    //������ʾ��TabItem����.
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