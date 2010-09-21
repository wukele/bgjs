(function() {

  var SC = CC.ui.ContainerBase.prototype,
      SP = CC.ui.Panel.prototype,
      C = CC.Cache;
// html template for tabitem
CC.Tpl.def('CC.ui.TabItem', '<table unselectable="on" class="g-unsel g-tab-item"><tbody><tr id="_ctx"><td class="tLe" id="_tLe"></td><td class="bdy"><nobr id="_tle" class="g-tle">选卡1</nobr></td><td class="btn" id="_btnC"><a href="javascript:fGo()" title="关闭" id="_trigger" class="g-ti-btn"></a></td><td class="tRi" id="_tRi"></td></tr></tbody></table>');

/**
 * @class CC.ui.TabItem
 * @extends CC.ui.ContainerBase
 */
  CC.create('CC.ui.TabItem', CC.ui.ContainerBase, {

    hoverCS: false,
/**
 * 是否可关闭.
 * @cfg {Boolean} closeable
 */
 
/**
 * @cfg {Boolean} autoReload 当再次选择项或再次调用loadContent时是否自动重新加载内容，即使内容已经加载，默认为false.
 */
    
    autoReload : false,
    
    closeable: true,

    unselectable: true,

    ct: '_ctx',

    blockMode: 2,

    loadCS: 'g-tabitem-loading',

    initComponent: function() {
      SC.initComponent.call(this);
      var c = this.cacheBtnNode = this.dom('_btnC');
      if (c) c.parentNode.removeChild(c);

      this.bindClsEvent();
      if(this.closeable !== undefined)
        this.setCloseable(this.closeable);

      if(this.panel){
        this.setContentPanel(this.panel);
        //this.follow(this.panel);
      }
    },

/**
 * 增加按钮,如关闭按钮,还可以增加其它类似的按钮.
 * @param {Object} config button config
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
		 * @cfg {Boolean} syncPaneldestroy tab item 销毁时是否连同对应的Panel一起销毁, 当tabitem.panel被自动加入tab.contentPanel面板时,如果该值未设置,则置为true.
		 */
	  syncPaneldestroy : undefined,
		
/**
 * 获得tabItem对应的内容面板
 * @param {Boolean} autoCreate 如果没有,是否自动创建
 * @return {CC.ui.ContainerBase}
 */
    getContentPanel: function(autoCreate) {
      var p = this.panel, tct;
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
        if(this.syncPaneldestroy === undefined)
          this.syncPaneldestroy = true;
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
 * @param {Boolean} closeable
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
 * @cfg {String} loadType
 * 如果允许自动创建内容面板,loadType设置创建的内容面板加载的内容,默认为html
 * 这个loadType将设置面板的connectionProvider.loadType.
 */
   loadType : 'html',
   
/**
 * 加载项面板内容
 * @param {String} url
 * @return this
 */

    loadContent : function(url){
      var p = this.getContentPanel(true);
      // 设置默认返回应用html内容
      p.getConnectionProvider().loadType = this.loadType||'html';

      var cp = p.getConnectionProvider(), ind = cp.indicator;
      if (!ind) {
          //自定Loading标识
          // 取消iframepanel默认indicatorDisabled:true
          cp.indicatorDisabled = false;
          ind = cp.getIndicator({
            markIndicator: this.onIndicatorStart,
            stopIndicator: this.onIndicatorStop
          });
      }

      if (url || ( (this.autoReload || !this.isContentLoaded()) && !this.isContentBusy())){
        this._dataConnectorId = cp.connect(url || this.src || this.url);
      }
      return this;
    },

/**
 * 指示内容面板是否已加载。
 */
    isContentLoaded : function(){
      return this._dataConnectorId && 
        this.getContentPanel(true)
            .getConnectionProvider()
            .getConnectionQueue()
            .isConnectorLoaded(this._dataConnectorId);
    },
    
    isContentBusy : function(){
      return this._dataConnectorId && 
        this.getContentPanel(true)
            .getConnectionProvider()
            .getConnectionQueue()
            .isConnectorBusy(this._dataConnectorId);
    },
    
    /**
     * TabItem内容面板加载时样式设置,这里主要在TabItem上显示一个loading图标.
     * @private
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

    //@bug  fixed @v2.0.8.3 reminded by robin {@link http://www.cicyui.com/forum/viewthread.php?tid=38&extra=page%3D1}
    destroy: function() {
      this.syncPaneldestroy &&
                 this.panel &&
                 this.panel.destroy();
      SC.destroy.call(this);
    }

  });

  CC.ui.def('tabitem', CC.ui.TabItem);
/**
 * @class CC.ui.Tab
 * @extends CC.ui.Panel
 */
  CC.create('CC.ui.Tab', CC.ui.Panel, {

    keyEvent: true,

    clickEvent : true,

    template: 'CC.ui.TabItemLayout',

    innerCS: 'g-tab',

    keyEventNode: '_scrollor',
    
    vcs : 'g-vtab',
/**
 * @cfg {Boolean} vtab 是否在下部显示
 */
    vtab : false,
    
    selectionProvider : {
      UP: CC.Event.LEFT,
      DOWN: CC.Event.RIGHT,
      tracker:true,
      selectedCS:'g-tab-selectitem'
    },

    syncWrapper : false,

    maxH: 33,

    itemCls: CC.ui.TabItem,
    
    floatCS : 'g-tab-float',
    
/**
 * @cfg {Boolean} autoLoad 子项选择时是否自动加载子项内容, 默认为true
 */
    autoLoad: true,
/**
 * @cfg {Boolean} destroyItemOnclose 当关闭子项时是否销毁子项,默认为false, 子项也可以设置tabItem.destroyOnClose覆盖设置.
 */
    destroyItemOnclose : false,

    lyCfg: {

      navPanelCS: 'g-mov-tab',

      horizonMargin: 5,

      // 该值须与左边导航按钮宽度一致,出于性能考虑,现在把它固定下来
      navLeftWidth: 24,

      // 该值须与右边导航按钮宽度一致,出于性能考虑,现在把它固定下来
      navRightWidth: 24
    },

    initComponent: function() {

      SP.initComponent.call(this);

      this.on('selected', this.onItemSelected);
      
      if(this.vtab){
        this.addClass(this.vcs);
        delete this.vtab;
      }
      
      if(this['float']){
        this.addClass(this.floatCS + (this['float']===true?'':this['float']));
        delete this['float'];
      }
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
     * @param {CC.ui.TabItem} tabItem
     */
    close: function(item) {
      item = this.$(item);
      if(item.closeable){
        if (this.fire('close', item) !== false){
          this.displayItem(item, false);
          this.fire('closed', item);
          // destoryOnClose，E文差，打错字，要作兼容
          if(item.destroyOnClose === true || this.destroyItemOnclose || item.destoryOnClose === true){
            item.destroy();
          }
        }
      }
    },

/**
 * 获得内容面板.
 * @return {CC.ui.ContainerBase}
 */
    getContentPanel : function(){
      var cp = this.contentPanel;

      if(typeof cp === 'string')
        cp = this.contentPanel = CC.Base.find(cp);

      return cp;
    },

/**
 * 是否显示指定的TabItem,
 * 参数a可为TabItem实例也可为TabItem的id,b为true或false.
 * @param {CC.ui.TabItem|String} tabItem
 * @param {Boolean} displayOrNot
 */
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

/**
 * 返回显示的TabItem个数.
 * @return {Number}
 */
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