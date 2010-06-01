/**
 * @class 
 */
CC.ui.def('rowmover', CC.create(CC.util.dd.AbstractCtMonitor, function(father){

var inited = false,
    
    E = CC.Event,
    G = CC.util.dd.Mgr;
return {
 
  // 比header先实例化
  weight : CC.ui.grid.Header.WEIGHT - 1,
  
/**@cfg {String} draggerCS 拖放结点样式*/
  draggerCS : 'dragnode',
  
  maskerCursor : 'move',
  
  dragCS : 'g-disabled',
  
  changeOnHover : false,
  
  indicator : {
    ctype:'base',
    view :'div',
    cs:'g-vrt-ins',
    autoRender:true
  },
  
  initialize : function(){
    father.initialize.apply(this, arguments);
    
    if(!inited){
      inited = true;
      CC.loadCSS(CICY_BASE+'more/grid/rowmover/style.css');
    }
    var cs = this.draggerCS;
    this.grid.header.array.insert(0, {
        dataCol : false,
        // 生成拖放结点
        cellBrush:function(){
          return '<div id="_dragger" class="'+cs+'"/>';
        },
        id:'dragcol',
        width:15,
        resizeDisabled:true,
        disabled : true,
        title:'&nbsp;'
    });
  },
  
  gridEventHandlers : {
    afteraddcontent : function(content){
      CC.util.dd.Mgr.installDrag(content, true, false, this, '_dragger');
      this.ct = content;
      // bind the container
      this.zoom.ct = content;
    }
  },
  
  sbover : function(onEl, dragEl){
    if(this.changeOnHover){
      onEl.pCt.insertBefore(dragEl, onEl);
      G.update();
    }

    if(onEl){
      var idt = this.getIndicator(), xy  = onEl.absoluteXY();
      idt.setXY(xy[0] - Math.floor(parseInt(idt.fastStyle('width'),10)/2), xy[1] - Math.floor(parseInt(idt.fastStyle('height'),10)/2))
         .show();
    }
  },
  
  sbout : function(){
    this.getIndicator().hide();
  },


  sbdrop : function(onEl, dragEl){
    if(!this.changeOnHover)
      onEl.pCt.insertBefore(dragEl, onEl);
    this.grid.content.fire('structchange', onEl, dragEl);
  }
};
}));