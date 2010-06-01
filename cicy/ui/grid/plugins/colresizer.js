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
      
      // 列resize时宽度最大,最小长度限制
      bounds = [0, 0, 0, 0],
      
      // indicator 初始 xy
      IDX = 0;

/**
 * @cfg {Boolean} resizeDisabled 是否允许列缩放.<br>
 * 该属性来自{@link CC.ui.grid.plugins.ColumnResizer},一个列宽调整的插件.
 * @member CC.ui.grid.Column
 */
  CC.ui.grid.Column.prototype.resizeDisabled = false;

return {
  
/**@cfg {Boolean} resizeDisabled 是否禁用列缩放*/
  resizeDisabled : false,
  
/**@cfg {Number} monitorW*/
  monitorLen : 10,
 
  initialize : function(opt){
    CC.extend(this, opt);
  },
  
  install : function(hd){    
    hd.itemAction('mousemove', this.onColMouseMove, false, this)
      .itemAction('mousedown', this.onColMouseDown, false, this);
  },
  
  // 拖动开始时
  dragstart : function(){
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
  
  drag : function(){
    this.rightIndicator.view.style.left = (IDX + G.getDXY()[0]) + 'px';
  },
  
  dragend : function(){
     currentCol.setWidth(currentCol.getWidth(true) + G.getDXY()[0], true);
     this.leftIndicator.del();
     this.rightIndicator.del();
     this.grid.fire('colresizeend', this, currentCol.pCt.indexOf(currentCol));
  },
  
  afterdrag : function(){
     currentCol = null;
     Rz.applyMasker(false, '');
  },
  
  onColMouseMove : function(col, e){
     var st = col.view.style;
     if (col.resizeDisabled || G.isDragging()) {
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
     if (el.style.cursor === 'col-resize' && !col.resizeDisabled && !G.isDragging()){
        // preparing for resizing
        // 记录当前列
        currentCol = col;
        
        Rz.applyMasker(true, 'col-resize');
        G.setMonitor(this)
         .setBounds(this.calColWidthConstrain(col))
         .startDrag(col, e);
        E.preventDefault(e);
     }
  },
  
  calColWidthConstrain : function(col){
     if(this.grid.colwidthctrl){
       dx = this.grid.colwidthctrl.getConstrain(col);
       bounds[1] = -1*dx[0];
       bounds[0] = dx[1];
     }else {
       bounds[1] = Math.max(col.minW, 0);
       bounds[0] = Math.MAX_VALUE;
     }
     return bounds;
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
