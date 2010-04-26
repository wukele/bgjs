(function(){
  var CC = window.CC,
      tpx = CC.Tpl,
      uix = CC.ui,
      ccx = uix.ContainerBase,
      superclass = CC.layout.Layout.prototype,
      Math = window.Math,
      G = CC.util.dd.Mgr,
      undefined;

  tpx.def('CC.ui.BorderLayoutSpliter' , '<div class="g-layout-split"></div>')
     .def('CCollapseBarH' , '<table cellspacing="0" cellpadding="0" border="0" class="g-layout-split"><tr><td class="cb-l"></td><td class="cb-c"><div class="expander" id="_expander"><a class="nav" id="_navblock" href="javascript:fGo()"></a></div></td><td class="cb-r"></td></tr></table>')
     .def('CCollapseBarV' , '<table cellspacing="0" cellpadding="0" border="0" class="g-layout-split"><tr><td class="cb-l"></td></tr><tr><td class="cb-c"><div class="expander" id="_expander"><a class="nav" id="_navblock" href="javascript:fGo()"></a></div></td></tr><tr><td class="cb-r"></td></tr></table>');
  /**
   * @name CC.ui.BorderLayoutSpliter
   * @class
   */
  uix.BorderLayoutSpliter = CC.create(CC.Base, function(spr) {

    //ghost 初始坐标
    var GIXY;

    return {

      type: 'CC.ui.BorderLayoutSpliter',

      ghostCS : 'g-layout-sp-ghost',

      initComponent: function() {
        this.ct = this.layout.ct.wrapper;
        if (this.dir == 'north' || this.dir == 'south')
          this.dxDisd = true;
        spr.initComponent.call(this);
        G.installDrag(this, true);
      },
/**
 * 计算拖动范围dx,dy
 * @private
 * @return {Array}
 */
      getRestrict: function() {
        var ly = this.layout,
            wr = this.ct,
            max,
            min,
            dir  = this.dir,
            comp = ly[dir],
            op,
            cfg = comp.lyInf,
            lyv = ly.vgap,
            lyh = ly.hgap,
            vg  = cfg.gap == undefined ? lyv: cfg.gap,
            hg  = cfg.gap == undefined ? lyh: cfg.gap,
            cfg2,
            cbg = ly.cgap,
            cg,
            ch = wr.height,cw = wr.width;

        switch (dir) {
          case 'north':
            min = -1 * comp.height;
            max = ch + min - vg;
            op = ly.south;
            if (op) {
              cfg2 = op.lyInf;
              if(cfg2.cbar && !cfg2.cbar.hidden){
                cg = cfg2.cgap === undefined ? cbg: cfg2.cgap;
                max -= cg;
              }
              if(!op.hidden && !op.contexted)
                max -= op.height + (cfg2.gap == undefined ? lyv: cfg2.gap);
            }

            if(max>comp.maxH-comp.height)
              max = comp.maxH - comp.height;
            if(Math.abs(min)>comp.height - comp.minH)
              min = -1*(comp.height - comp.minH);
            break;
          case 'south':
            max = comp.height;
            min = -1 * ch + max + vg;
            op = ly.north;
            if (op) {
              cfg2 = op.lyInf;
              if(cfg2.cbar && !cfg2.cbar.hidden){
                cg = cfg2.cgap === undefined ? cbg: cfg2.cgap;
                min += cg;
              }

              if(!op.hidden && !op.contexted)
                min += op.height + (cfg2.gap == undefined ? lyv: cfg2.gap);
            }

            if(max>comp.height - comp.minH)
              max = comp.height - comp.minH;
            if(Math.abs(min)>comp.maxH-comp.height)
              min = -1*(comp.maxH-comp.height);
            break;
          case 'west':
            min = -1 * comp.width;
            max = cw + min - hg;
            op = ly.east;
            if (op) {
              cfg2 = op.lyInf;
              if(cfg2.cbar && !cfg2.cbar.hidden){
                cg = cfg2.cgap === undefined ? cbg: cfg2.cgap;
                max -= cg;
              }
              if(!op.hidden && !op.contexted)
                max -= op.width + (cfg2.gap == undefined ? lyh: cfg2.gap);
            }

            if(max > comp.maxW - comp.width)
              max = comp.maxW - comp.width;
            if(Math.abs(min)>comp.width - comp.minW)
              min = -1*(comp.width - comp.minW);
            break;
          case 'east':
            max = comp.width;
            min = -1 * cw + max + hg;
            op = ly.west;
            if (op) {
              cfg2 = op.lyInf;

              if(cfg2.cbar && !cfg2.cbar.hidden){
                cg = cfg2.cgap === undefined ? cbg: cfg2.cgap;
                min += cg;
              }

              if(!op.hidden && !op.contexted)
                min += op.width + (cfg2.gap === undefined ? lyh: cfg2.gap);
            }
            if(max > comp.width - comp.minW)
              max = comp.width - comp.minW;
            if(Math.abs(min)>comp.maxW - comp.width)
              min = -1*(comp.maxW - comp.width);
            break;
        }
        return dir === 'west' || dir === 'east' ?
               [max, min, 0, 0] : [0,0,max,min]
      },
/**
 * @private
 */
      applyGhost : function(b){
        var g = this.splitGhost;
        if(!g){
          g = this.splitGhost =
               this.$$(CC.$C({tagName:'DIV', className:this.ghostCS}));
        }
        if(b){
          this.copyViewport(g);
          GIXY = [g.left, g.top];
          g.appendTo(this.ct);
        }else{
          g.del();
        }
        return g;
      },

      beforedrag : function(){
        this.applyGhost(true);
        G.setBounds(this.getRestrict());
        G.resizeHelper.applyMasker(true);
        G.resizeHelper.masker.fastStyleSet('cursor', this.fastStyle('cursor'));
      },

      drag : function(){
        var d = G.getDXY(),i = G.getIEXY();
        this.dxDisd ?
          this.splitGhost.setTop(GIXY[1]+d[1]) :
          this.splitGhost.setLeft(GIXY[0]+d[0]);
      },

      dragend: function() {
        var c   = this.layout[this.dir],
            wr  = this.ct,
            dxy = G.getDXY(),
            cfg = c.lyInf,
            k;
        k = this.dxDisd ? this.dir === 'north' ? c.height + dxy[1]: c.height - dxy[1] :
                          this.dir === 'west'   ? c.width  + dxy[0]: c.width  - dxy[0];

        if(cfg.autoCollapseWidth !== false && k <= (cfg.autoCollapseWidth||40)){
           this.layout.collapse(c, true);
        }else {
          this.dxDisd ?
               c.setHeight(k) :
               c.setWidth(k);
          this.layout.doLayout();
        }
      },

      afterdrag :  function(){
        this.applyGhost(false);
        G.resizeHelper.applyMasker(false);
        G.resizeHelper.masker.fastStyleSet('cursor', '');
      }
    };
  });

  /**
   * @name CC.ui.BorderLayoutCollapseBar
   * @class
   * @extends CC.ui.ContainerBase
   */
  uix.BorderLayoutCollapseBar = CC.create(ccx,
   /**@lends CC.ui.BorderLayoutCollapseBar.prototype*/
   {

    type : 'CC.ui.BorderLayoutCollapseBar',

    hidden : true,

    innerCS:'g-layout-cbar',

    ct : '_expander',

    compContextedCS : 'g-layout-contexted',

    sliperCS : 'g-layout-sliper g-f1',

    navBlockCS : {
             east:'g-nav-block-l',west:'g-nav-block-r',
             south:'g-nav-block-u',north:'g-nav-block-d'
    },

    initComponent : function(){
      this.template =
        (this.dir === 'south' || this.dir === 'north') ?
          'CCollapseBarH' : 'CCollapseBarV';

      ccx.prototype.initComponent.call(this);

      if(this.dir === 'west' || this.dir === 'east')
        this.addClass(this.innerCS+'-v');

      this.centerExpander = this.dom('_expander');

      this.navBlock = this.dom('_navblock');

      CC.fly(this.navBlock)
        .addClass(this.navBlockCS[this.dir])
        .unfly();

      this.domEvent('mousedown', this.onBarClick, true)
          .domEvent('mousedown', this.onNavBlockClick, true, null, this.navBlock);

      this.sliperEl = CC.$C({tagName:'A', className:this.sliperCS,href:'javascript:fGo()'});
      this.comp.append(this.sliperEl);
      this.comp.domEvent('click', this.sliperAction, false, null, this.sliperEl);
    },

    destory : function(){
      this.centerExpander = null;
      this.navBlock = null;
      this.sliperEl = null;
      if(this.compShadow)
        this.compShadow.destory();
      ccx.prototype.destory.call(this);
    },

    sliperAction : function(){
      this.pCt.layout.collapse(this, true);
    },

    /**
     * 收缩按钮点击
     */
    onNavBlockClick : function(){
      var c = this.comp;
      c.setXY(10000,10000);
      if(c.contexted)
        c.releaseContext();
      this.itsLayout.collapse(c, false);
    },

    /**
     * 使得面板浮动
     */
    makeFloat : function(){
      var c = this.comp;
      c.addClass(this.compContextedCS)
       .show();

      this.setCompContextedBounds();

      var xy = c.absoluteXY();
      c.appendTo(document.body)
       .setXY(xy);

      if(c.collapse && c.collapsed)
        c.collapse(false);

      this.getShadow().attach(c).display(true);

      var cfg = c.lyInf;
      if(!cfg.cancelAutoHide){
        this.resetAutoHideTimer();
        cfg.autoHideTimer = this.onTimeout.bind(this).timeout(cfg.autoHideTimeout||5000);
      }
    },

    getShadow : function(){
      var sd = this.compShadow;
      if(!sd)
        sd = this.compShadow
           = uix.instance('shadow', {inpactH:9,inpactY:-2, inpactX : -4, inpactW:10});
      return sd;
    },

    onTimeout : function(){
      var c = this.comp;
      if(c.contexted)
        c.releaseContext();
      else this.unFloat();
      this.resetAutoHideTimer();
    },

    resetAutoHideTimer : function(){
      var cfg = this.comp.lyInf;
      if(cfg.autoHideTimer){
        clearTimeout(cfg.autoHideTimer);
        delete cfg.autoHideTimer;
      }
    },

    /**
     * 面板复原
     */
    unFloat : function(){
      var c = this.comp,
          cfg = c.lyInf;

      if(cfg.autoHideTimer)
        this.resetAutoHideTimer();
      c.pCt._addNode(c.view);
      c.delClass(this.compContextedCS);
      this.getShadow().detach();
    },

    /**
     * 点击区域范围外时回调
     */
    onCompReleaseContext : function(){
      var cfg = this.pCt.layout.cfgFrom(this);
      cfg.cbar.unFloat();
    },

    /**
     * 侧边栏点击
     */
    onBarClick : function(){
      var c = this.comp;
      if(c.contexted)
        c.releaseContext();
      //callback,cancel, caller, childId, cssTarget, cssName
      else {
        c.bindContext(this.onCompReleaseContext, true, null, null, this.navBlock, this.navBlockCS[this.dir]+'-on');
        this.makeFloat();
      }
    },

    /**
     * 设置浮动面板浮动开始前位置与宽高
     */
    setCompContextedBounds : function(){
      var c = this.comp, dir = this.dir;
      if(dir === 'west')
        c.setBounds(this.left+this.width+1, this.top, false, this.height);
      else if(dir === 'east')
        c.setBounds(this.left - c.width - 1, this.top, false, this.height);
      else if(dir === 'north')
        c.setBounds(this.left, this.top+this.height+1, this.width, false);
      else c.setBounds(this.left, this.top-c.height - 1, this.width, false);
    },

    setSize : function(){
      ccx.prototype.setSize.apply(this, arguments);
      var v;
      if(this.dir === 'north' || this.dir === 'south'){
        v = Math.max(0, this.width - 6)+'px';
        this.centerExpander.style.width = v;
        if(CC.ie)
          this.centerExpander.parentNode.style.width = v;
      }
      else{
        v =  Math.max(0, this.height - 6)+'px';
        this.centerExpander.style.height = v;
        if(CC.ie)
          this.centerExpander.parentNode.style.height = v;
      }
    }

  });
/**
 * 与Java swing中的BorderLayout具有相同效果.
 * 将容器内控件作为沿边框布局.
 *
 * @name CC.layout.BorderLayout
 * @class
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.BorderLayout', CC.layout.Layout,
  /**@lends CC.layout.BorderLayout#*/
  {
    /**
     * 水平方向分隔条高度,利用面板布置设置可覆盖该值.
     */
    hgap: 5,
    /**
     * 垂直方向分隔条高度,利用面板布置设置可覆盖该值.
     */
    vgap: 5,
    /**
     * 侧边栏宽度.
     */
    cgap : 32,
    /**
     *
     */
    cpgap : 5,

    wrCS : 'g-borderlayout-ct',

    itemCS :'g-borderlayout-item',

    separatorVCS : 'g-ly-split-v',

    separatorHCS : 'g-ly-split-h',

    add: function(comp, dir) {

      superclass.add.call(this, comp, dir);

      var d, s;

      if(!dir)
        dir = comp.lyInf;

      d = dir.dir;
      s = dir.split;

      if(!d)
        d = 'center';

      this[d] = comp;

      if (s && d !== 'center') {
        var sp = dir.separator = new uix.BorderLayoutSpliter({
          dir: d,
          layout: this
        });

        sp.addClass(
          d === 'west' || d === 'east' ? this.separatorVCS:this.separatorHCS
        );

        sp.appendTo(this.ct.ct)
          .show();
      }

      comp.addClass(this.itemCS + '-' + (d||'center'));

      dir.collapsed === undefined ? this.doLayout() : this.collapse(comp, dir.collapsed);

      return this;
    },
/***/
    getCollapseBar : function(c){
      var cfg,
          cg,
          cbar,
          cfg = c.lyInf,
          cbar = cfg.cbar;

      if(!cbar && !cfg.noSidebar){
        cbar = cfg.cbar = new uix.BorderLayoutCollapseBar({dir:cfg.dir, comp:c, itsLayout:this, autoRender:true});
        cbar.addClass(cbar.innerCS+'-'+cfg.dir)
            .appendTo(this.ct.ct);
      }
      return cbar;
    },
/**
 * 收起或展开指定控件,如果控件存在collapse方法,也将调用该方法
 * @param {CC.Base} component
 * @param {Boolean} collapsedOrNot
 */
    collapse : function(comp, b){
      var cbar = this.getCollapseBar(comp),
          cfg = comp.lyInf;

      cfg.collapsed = b;
      if(cfg.separator)
        cfg.separator.display(!b);

      if(comp.collapse)
        comp.collapse(b);

      if(cbar)
        cbar.display(b);

      comp.display(!b);
      this.doLayout();
    },

    onLayout: function() {
      superclass.onLayout.call(this);
      var wr = this.ct.wrapper,
          w = wr.getWidth(true),
          h = wr.getHeight(true),
          l = 0,
          t = 0,
          c = this.north,
          dd, n, sp, vg = this.vgap,
          cbg = this.cgap,
          cpg = this.cpgap,
          dcpg = cpg+cpg,
          hg = this.hgap,
          cfg, cg, cb;

      if (c) {
        cfg = c.lyInf;
        cb = cfg.cbar;

        if(cb && !cb.hidden){
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          cb.setBounds(l+cpg,t+cpg,w-dcpg, cg - dcpg);
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          t += cg;
        }

        if(!c.hidden && !c.contexted){
          dd = c.getHeight(true);
          c.setBounds(l, t, w, c.height);
          t += dd;
          cg = cfg.gap === undefined ? vg: cfg.gap;
          sp = cfg.separator;
          if (sp) {
            sp.setBounds(l, t, w, cg);
          }
          t += cg;
        }
        if(c.contexted)
          c.releaseContext();
      }

      c = this.south;
      if (c) {
        cfg = c.lyInf;
        cb = cfg.cbar;
        if(cb && !cb.hidden){
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          h -= cg;
          cb.setBounds(l+cpg,h+cpg,w-dcpg, cg - dcpg);
        }

        if(!c.hidden && !c.contexted){
          dd = c.getHeight(true);
          h -= dd;
          c.setBounds(l, h, w, c.height);
          cg = cfg.gap === undefined ? vg: cfg.gap;
          sp = cfg.separator;
          h -= cg;
          if (sp) sp.setBounds(l, h, w, cg);
        }

        if(c.contexted)
          c.releaseContext();
      }
      h -= t;

      c = this.east;
      if (c) {
        cfg = c.lyInf;
        cb = cfg.cbar;

        if(cb && !cb.hidden){
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          w -= cg;
          cb.setBounds(w+cpg, t, cg - dcpg, h);
        }

        if(!c.hidden && !c.contexted){
          dd = c.getWidth(true);
          w -= dd;
          c.setBounds(w, t, c.width, h);
          sp = cfg.separator;
          cg = cfg.gap === undefined ? hg: cfg.gap;
          w -= cg;
          if (sp) sp.setBounds(w, t, cg, h);
        }
        if(c.contexted)
          c.releaseContext();
      }

      c = this.west;
      if (c) {
        cfg = c.lyInf;
        cb = cfg.cbar;
        if(cb && !cb.hidden){
          cg = cfg.cgap === undefined ? cbg: cfg.cgap;
          cb.setBounds(l+cpg, t, cg - dcpg, h);

          l += cg;
          w -= cg;
        }

        if(!c.hidden && !c.contexted){
          dd = c.getWidth(true);
          c.setBounds(l, t, c.width, h);
          l += dd;
          cg = cfg.gap === undefined ? hg: cfg.gap;
          sp = cfg.separator;
          w -= dd + cg;
          if (sp) sp.setBounds(l, t, cg, h);
          l += cg;
        }
        if(c.contexted)
          c.releaseContext();
      }

      c = this.center;
      if (c) {
        c.setBounds(l, t, w, h);
      }
    },

    remove: function(c) {
      var cfg = c.lyInf;

      delete this[cfg.dir];

      var sp = cfg.separator;
      if (sp) {
        sp.destory();
        delete cfg.separator;
      }

      var cb = cfg.cbar;
      if(cb){
          cb.destory();
        delete cfg.cbar;
      }
      superclass.remove.apply(this, arguments);
    },

    detach : function(){
      var self = this;
      this.invalidated = true;
      CC.each(['east', 'south', 'west', 'north' , 'center'], function(){
        if(self[this])
          self.remove(self[this]);
      });
      superclass.detach.call(this);
    }
  });

 CC.layout.def('border', CC.layout.BorderLayout);

})();