//定义控件模板
CTemplate['CResizer'] = '<div class="g-panel g-resizer"><div class="g-win-e" id="_xe"></div><div class="g-win-s" id="_xs"></div><div class="g-win-w" id="_xw"></div><div class="g-win-n" id="_xn"></div><div class="g-win-sw" id="_xsw"></div><div class="g-win-es" id="_xes"></div><div class="g-win-wn" id="_xwn"></div><div class="g-win-ne" id="_xne"></div><div class="g-panel-wrap g-resizer-wrap" id="_wrap"></div></div>';
/**
 * Resize开始时位置长宽信息保存在控件的initPS属性.
 */
CC.create('CResizer', CPanel ,(function(superclass){
    return {
        resizeable : true,
        enableH:true,
        enableW:true,
        template : 'CResizer',
        unresizeCS : 'g-win-unresize',
        width:500,
        height:250,
        minW:12,
        minH:6,
        initComponent : function() {
            superclass.initComponent.call(this);
            if(this.resizeable){
                var v = this.view;
                var self = this;
                var G = CGhost.instance;
                //onmousedown and start
                var ini = (function(){
                		if(!self.resizeable)
                			return false;
                    var a = self.absoluteXY();
                    var b = self.getSize();
                    if(!CC.borderBox){
                    	b.width -= 1;
                    	b.height -= 1;
                    }
                    self.initPS = {
                        pos:a,
                        size:b
                    };
                    //current 'this' is the element which gets the event.
                    //notice the ghost proxy.
                    G.startResize();
                    G.resizeLayer.setXY(a).setSize(b);
                    G.resizeMask.style('cursor', this.style('cursor'));
                });
					
                var end = (function(){
                    if(self.fire('resize', self)=== false)
                        return false;
                    var sz = G.resizeLayer.getSize(true);
                    //hack:
                    if(!CC.borderBox){
                    	if(sz.width != 0)
                    		sz.width += 1;
                    	if(sz.height != 0)
                    		sz.height += 1;
                    }
                    self.setSize(sz);
                    self.setXY(G.resizeLayer.xy());
                    G.endResize();
                    delete self.initPS;
                });
					
                var a = this._createFn(0x8);
                var b = this._createFn(0x4);
                var c = this._createFn(0x2);
                var d = this._createFn(0x1);
                var f = this._createFn('',c,b);
                var e = this._createFn('',b,d);
                var g = this._createFn('',a,c);
                var h = this._createFn('',a,d);
                var G = CGhost.instance;
                this._bindTriggerAction('_xn',a,ini,end);
                this._bindTriggerAction('_xs',b,ini,end);
                this._bindTriggerAction('_xw',c,ini,end);
                this._bindTriggerAction('_xe',d,ini,end);
                this._bindTriggerAction('_xes',e,ini,end);
                this._bindTriggerAction('_xsw',f,ini,end);
                this._bindTriggerAction('_xwn',g,ini,end);
                this._bindTriggerAction('_xne',h,ini,end);
            }else {
                this.setResizable(false);
            }
        },
				//
				// 在窗口创建后调用
				//
				setResizable : function(resizeable) {
					if(!resizeable)
						this.addClass(this.unresizeCS);
					else 
						this.delClass(this.unresizeCS);
					this.resizeable = resizeable;
				},
				
				getWrapperInsets : function(){
					return [6,1,1,1,7,2];
				},
				
        _bindTriggerAction : function(id, drag, ini, end) {
            var vid = this.$$(id);
            this.follow(vid);
            vid.beforeDragStart = ini;
            vid.drag = drag;
            vid.afterDrop = end;
            vid.bindDragDrop();
            vid.parentContainer = this;
        },
		
        _createFn : function(axis,a,b) {
            var self = this;
            var G = CGhost.instance;
            if(axis == 0x4 || axis == 0x8){
                return function(ev) {
                    if(!self.enableH) {
                        return;
                    }
                    var pace = G.PXY[1] - G.IPXY[1];
                    self._zoom(axis, pace);
                }
            }
            else if(axis == 0x1 || axis == 0x2) {
                return function(ev) {
                    if(!self.enableW) {
                        return;
                    }
                    var pace = G.PXY[0] - G.IPXY[0];
                    self._zoom(axis, pace);
                }
            }else {
                return function(ev) {
                    a.call(this,ev);
                    b.call(this,ev);
                };
            }
        },
		
        _zoom : function(axis, pace) {
            var G = CGhost.instance, off;
            var ly = G.resizeLayer;
            if((axis & 0x1) != 0x0) {
                off =  this.initPS.size.width+ pace;
                if(off>=this.minW)
                    ly.setWidth(off);
            }
			
            else if((axis & 0x2) != 0x0) {
                off = this.initPS.size.width - pace;
                if(off<this.minW)
                    return;
                ly.setWidth(off);
                off = this.initPS.pos[0] + pace;
                ly.setLeft(off);
            }
			
            if((axis & 0x4) != 0x0) {
                off = this.initPS.size.height + pace;
                if(off>=this.minH)
                    ly.setHeight(off);
            }
			
            else if((axis & 0x8) != 0x0) {
                off = this.initPS.size.height - pace;
                if(off<this.minH)
                    return;
                ly.setHeight(off);
                off = this.initPS.pos[1] + pace;
                ly.setTop(off);
            }
        }
    };
}));