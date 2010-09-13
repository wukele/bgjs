/**
 * @class CC.layout.Portal
 */
 
/**
 * @cfg {Function} createZoom 自定义生成矩域，调用方式为 createZoom(source)，方法在拖放开始时触发。
 */

CC.create('CC.layout.Portal', CC.layout.Layout, {
    
    initialize : function(opt){
        this.portable = new CC.util.dd.Portable(this.portable);
        // 设置createZoom
        this.portable.createZoom = this.createZoom.bindRaw(this);
        CC.layout.Layout.prototype.initialize.call(this, opt);
    },
    
    beforeAdd : function(comp){
      // flag 
      if(!comp._portalAddedBnd){
              if(__debug) console.log('check ct child dd binded', comp);
              comp.on('add', this.bindModule, this);
              comp._portalAddedBnd = true;
      }
      
      var self = this;
      comp.each(function(){
          if(!this.portalDDBinded)
              self.bindModule(this);
      });
    },
  
    bindModule : function(c){
      if(!c.portalDDBinded){
          this.portable.bind(c);
      }
    },
  
    createZoom : function(source){
            var ct = this.ct, 
                row, cell, 
                root = new CC.util.d2d.RectZoom();
            
            function filter(c){
                return c !== source;
            }
            
            for(var i=0,chs=ct.children,len=chs.length;i<len;i++){
                row = chs[i];
                if(row.size()){
                    root.add(new CC.util.d2d.ContainerDragZoom({
                        ct:row, 
                        filter:filter
                    }));
                }else {
                    // 
                    // 对于空容器，添加placehold域以获得响应
                    // 在拖放结束后清空placehold域
                    //
                    var hold = new CC.util.d2d.ComponentRect(this.portable.createPlaceholdForCt(row));
                    root.add(hold);
                }
            }
            return root;
    }
});

CC.layout.def('portal', CC.layout.Portal);
