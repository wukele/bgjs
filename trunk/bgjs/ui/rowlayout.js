CC.create('CRowLayout', CLayout, CColumnLayout.constructors, function(superclass){
	return {
		onLayout : function(){
    	var its = this.items,c,cfg,t=false, ty = this.type, w = this.container.wrapper.width, s;
      if(its.length==0)
      	return;
      for(var i=0,len=its.length;i<len;i++){
        c = its[i];
        cfg = c.layoutCfg[ty];
        if(cfg === undefined)
        	s = w;
        else if(cfg<1)
        	s = Math.floor(w*cfg);
        else s = cfg;
        c.setWidth(s);
      }
      CRowLayout.superclass.onLayout.call(this);
		}
	};
});

CLayout['row'] = CRowLayout;