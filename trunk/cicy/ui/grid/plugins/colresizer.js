/**
 * @class CC.ui.grid.plugins.ColumnResizer
 * 一个列宽调整的插件
 */
CC.create('CC.ui.grid.plugins.ColumnResizer', null, function(){
  
  var G = CC.util.dd.Mgr, 
      Rz = G.resizeHelper, 
      E = CC.Event,
      Math = window.Math,
      
      // 当前resize列
      currentCol,
      
      // 列resize时宽度最小,最大长度限制
      constrains = [0, 0],
      
      // resize前鼠标x
      IX, 
      
      // 移动中的x偏移
      CX, 
      
      // indicator 初始 xy
      IDX = 0;

/**
 * @cfg {Boolean} disabledResize 是否允许列缩放.<br>
 * 该属性来自{@link CC.ui.grid.plugins.ColumnResizer},一个列宽调整的插件.
 * @member CC.ui.grid.Column
 */
  CC.ui.grid.Column.prototype.disabledResize = false;

return {
  
/**@cfg {Boolean} resizeDisabled 是否禁用列缩放*/
  resizeDisabled : false,
  
/**@cfg {Number} monitorW*/
  monitorLen : 10,

/**
 * @property resizing
 * 是否拖放中
 * @type Boolean
 */
  resizing : false,
 
  initialize : function(opt){
    CC.extend(this, opt);
  },
  
  initPlugin : function(g) {
    this.grid = g;
  },
  
  install : function(hd){    
    hd.itemAction('mousemove', this.onColMouseMove, false, this)
      .itemAction('mousedown', this.onColMouseDown, false, this);
  },

  onColMouseMove : function(col, e){
     var st = col.view.style;
     if (this.resizeDisabled || this.resizing || G.isDragging()) {
          if (st.cursor != '') 
             st.cursor = "";
          return;
     }
     
     // td
     var el = col.view, 
         px = el.offsetWidth - E.pageX(e) + col.absoluteXY()[0];
     if (px < this.monitorLen) {
       st.cursor = "col-resize";
     } else if (st.cursor != ''){
       st.cursor = "";
     }
  },

  onColMouseDown: function(col, e){
     var el = col.view;
     if (el.style.cursor === 'col-resize' && !col.disabledResize){
        // preparing for resizing
        // 记录当前列
        currentCol = col;
        // 绑定body范围事件
        CC.$body.domEvent('mouseup', this.onDocMouseUp, true, this)
                .domEvent('mousemove', this.onDocMouseMove, true, this);
        IX = E.pageX(e);
        this.calColWidthConstrain(col);
        Rz.applyMasker(true, 'col-resize');
        E.preventDefault(e);
     }
  },
  
  onColResizeStart : function(e){
     this.grid.fire('colresizestart', currentCol, currentCol.pCt.indexOf(currentCol));
     // indicator定位到初始位置
     var rdc = this.getIndicator(), 
         ldc = this.leftIndicator, 
         cxy = currentCol.absoluteXY(), 
         y;
         
     IDX     = cxy[0] + currentCol.view.offsetWidth - Math.floor(rdc.getWidth(true)/2);
     y       = cxy[1] + currentCol.view.offsetHeight;
     
     rdc.setXY(IDX, y).appendTo(document.body);
     ldc.setXY(cxy[0] - Math.floor(rdc.getWidth(true)/2), y).appendTo(document.body);
  },
  
  onColResizeEnd : function(e){
     currentCol.setWidth(currentCol.getWidth(true) + CX, true);
     this.leftIndicator.del();
     this.rightIndicator.del();
     this.grid.fire('colresizeend', this, currentCol.pCt.indexOf(currentCol));
  },

  onDocMouseUp : function(e){
     CC.$body.unEvent('mouseup',   this.onDocMouseUp)
             .unEvent('mousemove', this.onDocMouseMove);
     if(this.resizing){
       this.resizing = false;
       this.onColResizeEnd(e);
     }
     
     currentCol = null;
     Rz.applyMasker(false, '');
  },
  
  onDocMouseMove : function(e){
    if(!this.resizing){
      this.resizing = true;
      this.onColResizeStart(e);
    }
    CX = E.pageX(e);
    var dx = CX - IX;
    if(dx < 0){
      if(dx < constrains[0])
         dx = constrains[0];
    }else if(dx > 0){
      if(dx > constrains[1])
        dx = constrains[1];
    }
    CX = dx;
    this.rightIndicator.view.style.left = (IDX + dx) + 'px';
  },
  
  calColWidthConstrain : function(col){
     if(this.grid.colwidthctrl){
       constrains = this.grid.colwidthctrl.getConstrain(col);
       constrains[0] = -1*constrains[0];
     }else {
       constrains[0] = Math.max(col.minW, 0);
       constrains[1] = Math.MAX_VALUE;
     }
  },
  
  gridEventHandlers : {
  	afteraddheader : function(hd){
  	  this.install(hd);
  	}
  },
  
  indicatorCS : 'g-grid-cwidctor',
  
  getIndicator : function(){
    var rdc = this.rightIndicator;
    if(!rdc){
      var cfg = {
        view:'div',
        ctype:'base',
        cs: this.indicatorCS
      };
      rdc = this.rightIndicator = CC.ui.instance(cfg);
      this.leftIndicator        = CC.ui.instance(cfg);
      this.grid.header.follow(rdc)
                      .follow(this.leftIndicator);
    }
    return rdc;
  }
};

});

CC.ui.def('colresizer', CC.ui.grid.plugins.ColumnResizer);

CC.ui.Grid.prototype.plugins.push({name:'colresizer', ctype:'colresizer'});


/**
 * @event colresizestart
 * 当开始调整列宽时发送.<br>
 * 该属性来自{@link CC.ui.grid.plugins.ColumnResizer},一个列宽调整的插件.
 * @param {CC.ui.grid.Column} column
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */
 
 /**
 * @event colresizeend
 * 当列宽调整结束后发送.<br>
 * 该属性来自{@link CC.ui.grid.plugins.ColumnResizer},一个列宽调整的插件.
 * @param {CC.ui.grid.Column} column
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */
