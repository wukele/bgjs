/**
 * @cfg {Boolean} autoFit 是否自动调整列宽以适应表格宽度,该属性来自{@link CC.ui.grid.ColumnWidthControler}.
 * @member CC.ui.Grid
 */
CC.ui.Grid.prototype.autoFit = false;

/**
 * @class CC.ui.grid.plugins.ColumnWidthControler
 * 该插件负任调整表头列宽,表头列自适应表宽度等.
 */
CC.create('CC.ui.grid.plugins.ColumnWidthControler', null, function(){
  Math = window.Math;
return {

  autoFitCS : 'g-grid-fit',
/**
 * @cfg {Number} minColWidth 每列缩放的最小宽度,默认为10
 */
  minColWidth : 10,

  initialize : function(opt){
    CC.extend(this, opt);
  },

  initPlugin : function(g) {
    if(g.autoFit){
      g.addClass(this.autoFitCS);
    }
  },

  gridEventHandlers : {
    resized : function(w){
      if(w !== false){
        if(!this.hasInitColWidths){
         w = Math.max(0, w - CC.ui.Grid.SCROLLBAR_WIDTH);
         this.initColWidths(w);
         this.hasInitColWidths = true;
       }else if(this.grid.autoFit){
         w = Math.max(0, w - CC.ui.Grid.SCROLLBAR_WIDTH);
         this.autoColWidths(w); 
       }
      }
    },
    
    colwidthchange : function(idx, col){
        if(!col._widthcontrolset) this.autoColWidths();
    }
  },
  // 第一次初始化
  initColWidths : function(w){
     var lf = w, hd = this.grid.header, len = hd.getColumnCount();
     var cw, min = this.minColWidth, self = this;
     hd.each(function(){
       cw = this.width;
       if(cw !== false){
         //小数,按百分比计
         if(cw < 1){
           cw = Math.floor(w * cw);
         }
         len --;
         self.setColWidth0(this, Math.max(cw, min));
         lf -= this.width;
       }
     });

     cw = Math.max(Math.floor(lf/len), min);

     hd.each(function(){
      if(this.width === false){
        self.setColWidth0(this, cw);
      }
     });
  },
  
  // private
  getAutoWidthLen : function(w){
    return Math.max(0, (w||this.grid.width)- CC.ui.Grid.SCROLLBAR_WIDTH);
  },
  
  // private
  setColWidth0 : function(col, w){
    col._widthcontrolset = true;
    col.setWidth(w, true);
    delete col._widthcontrolset;
  },
  
  // 瓜分多出的宽度到列
  deliverDelta : function(dw){
    var chs = this.grid.header.children,
        len = chs.length,
        // 每列瓜分均值
        avw , 
        // 应重设列宽值
        nw, 
        // 重设前宽值
        prew,
        
        min = this.minColWidth,
        i,col,
        
        // 仍处理的列 
        queue = [], 
        
        // 已剔除的列
        delqueue = [];
        
    // clone array
    for(i=0;i<len;i++){
      if(!chs[i].locked)
        queue[queue.length] = chs[i];
    }
    
    while(dw !== 0 && queue.length){
      avw = Math.floor(dw / queue.length);
      for(i=0,len=queue.length;i<len;i++){
        col = queue[i];
        prew = col.width;
        nw = Math.max(col.width + avw, min);
        if(nw !== prew){
          this.setColWidth0(col, nw);
          if(col.width !== prew){
            dw -= (col.width - prew);
          }else {delqueue.push(col);}
        }else {delqueue.push(col);}
      }
      
      for(i=0;i<delqueue.length;i++){
        queue.remove(delqueue[i]);
      }
      delqueue = [];
    }
    
    // ('remain dw:',dw);
  },
  
  autoColWidths : function(w){
    if(this.grid.autoFit){
      
      if( !w )
        w = this.getAutoWidthLen();
      
      var hd  = this.grid.header, ws = 0;
      
      hd.each(function(){
          ws += this.width;
      });
      
      var dw  = w - ws; // 每列扩展的宽度值delta width
      var self = this;
      if(dw != 0){
         this.deliverDelta(dw);
      }
    }
  },

/**
 * 获得在插件列宽调整规则内指定列可调整的最大与最小<strong>可缩放宽度</strong>.
 * @return {Array} maxminwidth [minWidth, maxWidth]
 * @public
 */
  getConstrain : function(col){
    
    if(col.resizeDisabled)
      return [col.width, col.width];
    
    var min = col.width - Math.max(this.minColWidth, col.minW, 0);
    
    if(this.grid.autoFit){
      var hd  = this.grid.header, 
          idx = hd.indexOf(col),
          chs = hd.children;
          maxW = 0, minW = 0;
      for(var i=idx+1,len=chs.length;i<len;i++){
        maxW += chs[i].width;
        minW =  Math.max(this.minColWidth, chs[i].minW, 0);
      }
      
      return [min, maxW - minW];
    }
    
    return [min, Math.MAX_VALUE];
  }
};
}
);

CC.ui.def('colwidthctrl', CC.ui.grid.plugins.ColumnWidthControler);

CC.ui.Grid.prototype.plugins.push({name:'colwidthctrl', ctype:'colwidthctrl'});