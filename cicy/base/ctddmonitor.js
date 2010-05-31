(function(){
  
var E = CC.Event,
    G = CC.util.dd.Mgr;
/**
 * @class CC.util.dd.AbstractCtMonitor
 * 为容器提供方便子项拖放的功能.
 * 只需要往容器绑定一次,不必为每个子项绑定拖放事件.
 */  
CC.create('CC.util.dd.AbstractCtMonitor', null, {
  
  initialize : function(cfg){
    if(cfg) CC.extend(this, cfg);
    
    var zoom = this.zoom;
    
    if(!zoom)
      zoom =  {ctype:'ctzoom'};
     
    if(zoom.ctype !== undefined)
       zoom = this.zoom = CC.ui.instance(zoom);
    
    if(this.pZoom){
      this.pZoom.add(zoom);
    }
  },
  
/**
 * @cfg {String} trigger 触发drag DOM元素ID,默认为'_dragger'
 */
  trigger : '_dragger',
/**
 * @cfg {Boolean} masker 拖放时是否应掩层,默认为true
 */
  masker  : true,

  maskerCursor : '',
/**
 * @cfg {String} dragCS 拖动中源控件样式
 */
  dragCS : false,
  
  indicator : false,
  
/**
 * trigger按下时,寻找trigger所在的子项作为拖放源.
 * @private
 */
  beforedrag : function(e){
    // 查看是否为子项发出
    var el = E.element(e);
    
    if(el.id !== this.trigger) 
      return false;
    
    // 将drag source设为当前子项
    G.setSource(this.ct.$(el));
    E.stop(e);
  },
/**
 * 拖放开始时,获得可视范围内的子控件作为区域项,更新区域矩形数据.
 * @private
 */
  dragstart : function(e , source){
    //
    //  组建当前的dragzoom为表可见列
    //
    G.setZoom(this.pZoom||this.zoom, true);
    
    if(this.masker) 
      G.resizeHelper.applyMasker(true, this.maskerCursor);

    if(this.dragCS)
      source.addClass(this.dragCS);
  },
/**
 * 如果未设置showTo,showTo到document.body
 * @private
 * @protected
 */
  getIndicator : function(){
    
    var idt = this.indicator;
    
    if(idt && !idt.cacheId){
      if(!idt.showTo)
        idt.showTo = document.body;
      this.indicator = idt = CC.ui.instance(idt);
    }
    
    return idt;
  },
  
  dragend : function(e, source){
    
    if(this.masker)
       G.resizeHelper.applyMasker(false);

    if(this.indicator) 
      this.getIndicator().hide();
      
    if(this.dragCS)
      source.delClass(this.dragCS);
  }
});
})();