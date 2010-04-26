/**
 * 一个列宽调整的插件
 */
CC.create('CC.ui.grid.plugins.ColumnWidthControler', null, {

  autoFitCS : 'g-grid-fit',

  minColWidth : 10,

  initialize : function(opt){
    CC.extend(this, opt);
  },

  initPlugin : function(g) {
    this.grid = g;
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
    }
  },

  initColWidths : function(w){
     var lf = w, hd = this.grid.header, len = hd.getColumnCount();
     var cw, min = this.minColWidth;
     hd.each(function(){
       cw = this.width;
       if(cw !== false){
         //小数,按百分比计
         if(cw < 1){
           cw = Math.floor(w * cw);
         }
         len --;
         this.setWidth(Math.max(cw, min));
         lf -= this.width;
       }
     });

     cw = Math.max(Math.floor(lf/len), min);

     hd.each(function(){
      if(this.width === false){
        this.setWidth(cw);
      }
     });
  },

  autoColWidths : function(w){
    if(this.grid.autoFit){
      var hd  = this.grid.header,
          len = hd.getColumnCount(),
          min = this.minColWidth;

      var ws = 0;
      
      hd.each(function(){
        ws += this.width;
      });
      
      var dw  = w - ws,
          avw = Math.floor(dw/len),
          nw, cnt = len, prew;
      hd.each(function(){
        prew = this.width;
        nw = cnt === 1? prew + dw : Math.max(this.width + avw, min);
        this.setWidth(nw);
        dw -= (this.width - prew);
        cnt --;
        if(nw !== this.width){
          //normalize
          avw = Math.floor(dw / cnt); 
        }
      });
    }
  }

});

CC.ui.def('gridwidthcontrolor', CC.ui.grid.plugins.ColumnWidthControler);

CC.ui.Grid.prototype.plugins.push({name:'widthcontrolor', ctype:'gridwidthcontrolor'});