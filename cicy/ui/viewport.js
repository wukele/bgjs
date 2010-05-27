/**
 * @class CC.ui.Viewport
 * 时刻布满整个浏览器客户区的面板
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Viewport', CC.ui.Panel, {

  bodyCS : 'g-viewport-body',

  cs : 'g-viewport',
  
/**@cfg {Array} mg margins*/
  mg : [0,0,0,0],
  
  initComponent : function(){
    this.showTo = document.body;
    if(!this.view)
      this.view = CC.$C('DIV');
      
    CC.Event.on(window, 'resize', this.onWindowResize.bind(this));
    
    CC.ui.Panel.prototype.initComponent.call(this);
    
    CC.$body.addClass(this.bodyCS);
    
    this.onWindowResize();
  },

  onWindowResize : function(){
      var vp = CC.getViewport();
      var x=0, y=0, mg = this.mg, space;
      
      x = mg[1];
      y = mg[2];
      vp.width  -= mg[1] + mg[3];
      vp.height -= mg[0] + mg[2];
      
      if(this.maxW < vp.width){
      	space = vp.width - this.maxW;
        x += Math.floor(space/2);;
        vp.width -= space;
      }
      
      if(this.maxH < vp.height){
      	space = vp.height - this.height;
        y += Math.floor(space/2);;
        vp.height -= space;
      }
      
      this.setBounds(x, y, vp.width ,vp.height);
      
  }
}
);

CC.ui.def('viewport', CC.ui.Viewport);