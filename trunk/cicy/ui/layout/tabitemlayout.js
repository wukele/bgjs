/**
 * @class CC.ui.layout.TabItemLayout
 * 用于布局{@link CC.ui.Tab}容器里的{@link CC.ui.TabItem},使得子项超出可视时出视导航条.
 * @extends CC.layout.Layout
 */
CC.Tpl.def('CC.ui.TabItemLayout', '<div class="g-panel"><div class="auto-margin" id="_margin"><a href="javascript:fGo()" id="_rigmov" class="auto-rigmov" style="right:0px;"></a><a href="javascript:fGo()" style="left:0px;" id="_lefmov" class="auto-lefmov"></a><div class="auto-scrollor" id="_scrollor" tabindex="1" hidefocus="on"><div class="auto-offset" id="_wrap"></div></div></div></div>');
CC.create('CC.ui.layout.TabItemLayout', CC.layout.Layout, function(father){
return {

  layoutOnChange : true,
  /**
   * 该值须与 CSS 中的.auto-margin值保持同步,因为这里margin并不是由JS控制.
   * 出于性能考虑,现在把它固定下来
   * @private
   */
  horizonMargin: 5,

  /**
   * 该值须与左边导航按钮宽度一致,出于性能考虑,现在把它固定下来
   * @private
   */
  navLeftWidth: 24,

  /**
   * 该值须与右边导航按钮宽度一致,出于性能考虑,现在把它固定下来
   * @private
   */
  navRightWidth: 24,

/**
 * 布局加到容器的样式
 * @private
 */
  ctCS : 'g-autoscroll-ly',
/**
 * 导航按钮的disabled样式
 * @private
 */
  disabledLeftNavCS: 'g-disabled auto-lefmov-disabled',

/**
 * 导航按钮的disabled样式
 * @private
 */
  disabledRightNavCS: 'g-disabled auto-rigmov-disabled',
/**
 * 导航按钮所在结点的样式
 * @private
 */
  navPanelCS: 'g-mov-tab',

  getMargins : function(){
    return [this.marginLeft||this.horizonMargin, this.marginRight||this.horizonMargin];
  },

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
 * @param {String} dir l 或 r
 */
  scrollToNext : function(dir, norepeat){
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
 * @private
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
 * 检查导航按钮状态，是否应显示或禁用.
 * @private
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

CC.layout.def('tabitem', CC.ui.layout.TabItemLayout);