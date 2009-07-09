/**
 * window控件.
 */

CC.create('CWin', CResizer, (function(){
	
    CTemplate['CWinTitlebar'] = '<div id="_g-win-hd" class="g-win-hd ellipsis"><div class="fLe"></div><b class="icoSw" id="_ico"></b><span id="_tle" class="g-tle">提示</span><div class="fRi"></div><div class="g-win-hd-ct" style="position:absolute;right:5px;top:7px;" id="_ctx"></div></div>';
	  CTemplate['CWinBarItem'] = '<a class="g-hd-btn" href="javascript:fGo();"></a>';
    var globalZ = 900;
    
		var CWinTitlebar = CC.create(CSelectedContainer, {
		    type: 'CWinTitlebar',
		    template: 'CWinTitlebar',
		    autoRender: true,
		    forceSelect: true,
		    unselectable:true,
		    selectedCS: false,
		    itemClickEvent:'click',
		    itemOptions: {
		        template: 'CWinBarItem'
		    },
		    itemCallback: true,
		    cancelSelectBubble: true,
		    container: '_ctx',
		    draggable: true,
		    dragStart: function() {
		        var c = this.parentContainer;
		        if(c.unmoveable)
		        	return false;
		        CGhost.instance.enableTip = false;
		        if (c.fire('movestart') === false) return false;
		        if (c.shadow) c.shadow.hide();
		        c.setOpacity(0.6);
		        c.initPos = c.xy();
		    },
		    drag: function() {
		        var G = CGhost.instance,
		        c = this.parentContainer;
		        CBase.prototype.setXY.call(c, c.initPos[0] + G.MDX, c.initPos[1] + G.MDY);
		    },
		    dropSB: function() {
		        var c = this.parentContainer;
		        if (c.fire('moveend') === false) {
		            c.setXY(c.initPos);
		            return false;
		        }
		        //update x,y
		        var G = CGhost.instance;
		        c.left = c.top = false;
		        c.setXY(c.initPos[0] + G.MDX, c.initPos[1] + G.MDY);
		        c.setOpacity(1);
		        if (c.shadow) c.shadow.show();
		        delete c.initPos;
		    }
		});
		
		
    return {

        closeable : true,
        
        shadow : true,
  
        inherentCS : 'g-win g-tbar-win',
        
        minCS : 'g-win-min',
        
        maxCS : 'g-win-max',
        
        minH:30,
        
  			minW:80,
  			
        //blanks : [0,1,1,1,30,2],
  
        titlebar : true,
  
        initComponent: function() {
            this.showTo = this.showTo || document.body;
            this.titlebar = new CWinTitlebar({parentContainer:this, title:this.title});
						delete this.title;
            CResizer.prototype.initComponent.call(this);    	
            var tb = this.titlebar;
            this.wrapper.insertBefore(tb);
            if(this.closeable === true){
                    this.clsBtn = new CItem({
                        cs:'g-win-clsbtn',
                        template:'CWinBarItem',
                        callback:this.close.bind(this),
                        tip:'关闭',
                        id:'_cls'
                    });
                    tb.add(this.clsBtn);
           }
           if(this.destoryOnClose){
           	this.on('closed', this.destoryComponent);
           }
           
           this.domEvent('mousedown', this.trackZIndex);
           this.domEvent('dblclick', this.switchState,true, null, this.titlebar.view);
        },
				
				setTitle : function(tle) {
					this.titlebar.setTitle(tle);
					return this;
				},
				
				trackZIndex : function(){
					if(this.zIndex != globalZ){
						globalZ+=2;
						this.setZ(globalZ);
					}
				},
				
				//override
		    setZ : function(zIndex) {
		        this.style("z-index", zIndex);
		        if(this.shadow)
		        	this.shadow.setZ(zIndex-1);
		        this.zIndex = zIndex;
		        return this;
		    },
    
				switchState : function(){
					if(this.win_s != 'max')
						this.maximize();
					else this.normalize();
				},
				
				getWrapperInsets : function(){
					return [29,1,1,1,30,2];
				},
					
        setTitle : function(tle){
            if(this.titlebar){
                this.titlebar.setTitle(tle);
                this.title = tle;
            }
            return this;
        },
  
        close : function(){
            if(this.fire('close')=== false)
                return false;
            this.onClose();
            this.fire('closed');
        },
  
        onClose : function(){
            this.display(0);
        },
        
        destoryComponent : function(){
        	CResizer.prototype.destoryComponent.call(this);
        	if(this.titlebar)
        		this.titlebar.destoryComponent();
        },
        
        _markStated : function(unmark){
        	if(unmark){
	        	var n = CC.delAttr(this, '_normalBounds');
	        	if(n){
	        		this.setXY(n[0]);
							this.setSize(n[1]);
							this.enableH = CC.delAttr(this, '_enableH');
        			this.enableW = CC.delAttr(this, '_enableW');
        			this.setResizable(CC.delAttr(this, '_resizeable'));
							this.titlebar.draggable = CC.delAttr(this, '_draggable');
	        	}
        	}
        	else {
        		this._normalBounds = [this.xy(),this.getSize(true)];
        		this._enableH = this.enableH;
        		this._enableW = this.enableW;
        		this._resizeable = this.resizeable;
        		this._draggable = this.titlebar.draggable;
        	}
        },
        
        minimize : function(){
        	this.setState('min'); 	
        },
        
        normalize : function(){
        	this.setState('normal');
        },
        
        maximize : function(){
        	this.setState('max');
        },
        
        setState : function(st) {
        	var ws = this.win_s;
        	
        	if(this.win_s == st)
        		return this;
        	
        	this.fire('statechange', st, ws);
        	
        	switch(ws){
        		case 'min' : 
        			this.delClass(this.minCS);break;
        		case 'max' : this.delClass(this.maxCS);break;
        		default :
        			this._markStated();
        	}
        	
        	switch(st){
        		case 'min' : 
        		  if(this.shadow)
        		  	this.shadow.show();
		        	this.addClass(this.minCS);
		        	this.setHeight(this.minH);
		        	this.setResizable(false);
		        	break;
		        case 'max':
		        	if(this.shadow){
		        		this.shadow.hide();
		        	}
		        	this.titlebar.draggable = false;
		          this.addClass(this.maxCS);
		        	var sz, p = this.parentContainer?this.parentContainer.view : this.view.parentNode;
		        	if(p == document.body){
		        		sz = CC.getViewport();
		        	}
		        	else{
		        		p = CC.fly(p);
		        		sz = p.getSize();
		        		p.unfly();
		        	}
		        	this.setXY(0,0).setSize(sz);
		        	this.setResizable(false);
		        	break;
		        //as normal
		        default : 
		        	this._markStated(true);
		        	if(this.shadow)
		        		this.shadow.show();
        	}
        	this.win_s = st;
        	
        	this.fire('statechanged', st, ws);
        	return this;
        }
    };
})());
