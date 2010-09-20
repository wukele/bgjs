(function(){
var 
    G = CC.util.dd.Mgr, 
    Rz = G.resizeHelper,
    // 当前指示器方向，例如目标上半段或下半段
    DIR;
/**
 * @class CC.util.dd.Portable
 * 本类支持容器内子控件子控件与子控件以及容器间子控件与子控件的拖放响应.
 * 当拖放开始时,拖放源会离开原位置浮动起来,随着鼠标移动而移动.<br>
 * 最常见例子是利用本类做Portal布局.它的效果就是这样,
 * Portal布局管理器运行Portable类并限定了拖放的范围,细化到在某一容器下拖放子控件。
 */

/**
 * @cfg {String} dragNode 指定触发拖放响应的结点ID,该结点位于拖放源中.
 */
 
/**
 * @cfg {Function} createZoom, 生成并返回拖放域，回调参数：createZoom(dragSource)
 */
 
CC.create('CC.util.dd.Portable', null, {
    
    dragNode : '_drag',
    
    // 浮动时添加到拖放源的样式
    floatingCS    :'g-portal-float',
    
    // 占位元素的样式
    
    srcPlaceholdCS : 'g-portal-srchold',
    
    ctPlaceholdCS : 'g-portal-ct-hold',
    
    indicatorCS   : 'g-portal-indicator',
    
    // 修复ie offsetParent与实际定位不一致,显式添加position
    ieOfpCs       : 'g-portal-ie-ofp',
    
    // 当容器无子项时,添加到容器占位元素的最小高度
    miniCtHolderH : 100,
    
    initialize : function(cfg){
        if(cfg)
            CC.extend(this, cfg);
    },
    
/**
 * 绑定一个控件,使之成为拖放源,以触发拖放事件.
 * @param {CC.Base} dragSource
 */
    bind : function(c){
        return G.installDrag(c, true, this.getDragNode(c), this);
    },
    
/**
 * 如果不通过设置{@link #dragNode}来自定义触发拖放的元素,
 * 可以重写该方法返回拖放源上的某个元素作为触发拖放的元素.<br>
 * 函数默认返回拖放源的dragNode属性或者当前类的dragNode属性.
 * @param {CC.Base} dragSource
 * @return {HTMLElement|String} 触发拖放的html元素或元素ID
 */
    getDragNode : function(c){
        return c.dragNode || this.dragNode;
    },

    createZoom : fGo,

//
//  Drag & Drop Handler 接口实现
//    
    dragstart : function(e, source){
        // 重置方向指示
        DIR = undefined;
        // 建drag zoom
        G.setZoom(this.createZoom(source), true);
        // 避免拖放过程中产生的干扰
        Rz.applyMasker(true);
        // 使得拖放可浮动移动
        this.freeSource(source, true);
        // 显示源占位
        source.insertBefore(this.getSrcPlacehold());
        
        if(__debug) console.log('portal zoom tree:', G.getZoom());
    },
    
    drag : function(){
    	  // 拖放源随鼠标移动而移动
        var dxy = G.getDXY(), ixy = this._initOff;
        G.getSource().setXY(dxy[0]+ixy[0], dxy[1] + ixy[1]);
    },

//
//       UP
//  ------------ <-
//      DOWN
//
    sbmove : function(target){
        //
        // 得到目标矩形,并确定鼠标在矩形内的位置(象限)
        //
        var rect = target.ownRect,
            xy = G.getXY(),
            qd = rect.qdAt(xy[0], xy[1]);
        
        // 位于空容器或者目标上半段
        if(target.placeholdCt || qd === 3 || qd === 4 || qd === 8){
            if(!DIR){
                DIR = true;
                this._wayFor(target, true);
            }
        }else if(DIR === undefined || DIR){
            DIR = false;
            this._wayFor(target, false);
        }
    },

    sbout : function(){
    	 // 复位位置
        DIR = undefined;
    },
    
    dragend : function(e, source){
        
        this.getIndicator().del();
        
        if(this._currHold)
            this._applyHold(source, this._currHold, DIR);
        
        Rz.applyMasker(false, '');
        this.getSrcPlacehold().del();
        this.freeSource(source, false);
        
        this.destroyCtPlaceholds();
        delete this._currHold;
    },

    //// 
    
    /**
     * 获得源占位
     * @private
     */
    getSrcPlacehold : function(){
        return this.placehold || ( this.placehold = this.createPlacehold(this.srcPlaceholdCS) );
    },
    /**
     * 获得指示器
     * @private
     */
    getIndicator : function(){
        return this.indicator || ( this.indicator = this.createPlacehold( this.indicatorCS ) );
    },
    
    /**
     * 是否应用容器占位，容器占位在拖放前生成，拖放结束后销毁。
     * @private
     */
    createPlaceholdForCt : function(ct, b){
        var cph = this.createPlacehold();
        cph.placeholdCt = ct;
        cph.setHeight(
            Math.max(
                this.miniCtHolderH, 
                ct.getHeight() - this.getSrcPlacehold(this.ctPlaceholdCS).getHeight()
            )
        );
        cph.appendTo(ct.ct);
        
        // 记录拖放时的空容器
        if (!this.emptyCtHolds) 
            this.emptyCtHolds = [];
        this.emptyCtHolds.push(cph);
        return cph;
    },
    
    destroyCtPlaceholds : function(){
        if(this.emptyCtHolds){
            var ct, ph;
            for(var i=0,chs=this.emptyCtHolds,len=chs.length;i<len;i++) {
                delete chs[i].placeholdCt;
                chs[i].destroy();
                chs[i] = null;
            }
            delete this.emptyCtHolds;
        }
    },
    
//
// 生成占位 
//
    createPlacehold : function(cs){
        var ph = CC.ui.instance({
            ctype:'base',
            cs : cs
        });
        return ph;
    },
    
//
// 使得拖放可浮动移动
//
    freeSource : function(source, free){
    
      if(free){
          var v = source.view,
              op = v.offsetParent, 
              off = this._initOff = source.offsetsTo(op);
          
          //
          //  IE下，offsetParent返回的是上一层父元素，
          //  但该元素并不具absolute 或 relative属性，
          //  所以在确定初始位置时误判。现在显式设置
          //  offsetParent的position属性为relative
          //
          if(CC.ie){
              var op = CC.fly(op),
                  ps = op.fastStyle('position');
              if(ps !== 'relative' || ps !== 'absolute'){
                  this._ofPnt = op.view;
                  op.addClass(this.ieOfpCs)
                    .unfly();
              }
          }
          
          source.fastStyleSet('left', off[0] + 'px')
                .fastStyleSet('top',  off[1] + 'px')
                .fastStyleSet('width', v.offsetWidth + 'px')
                .fastStyleSet('position', 'absolute');
      }else {
          source.fastStyleSet('left', '')
                .fastStyleSet('top','')
                .fastStyleSet('position', '')
                .fastStyleSet('width', '');
                
          if(CC.ie && this._ofPnt){
              CC.fly(this._ofPnt)
                .delClass(this.ieOfpCs)
                .unfly();
              delete this._ofPnt;
          }
      }
      
      source.checkClass(this.floatingCS, free);
    },

//
//  往目标位置处插入拖放源
//
    _applyHold : function(source, target, at){
        var tct;
        // TOP - BOTTOM
        // if a container placehold
        if(target.placeholdCt){
            target.placeholdCt.add(source);
            target.hide();
        }else {
            var ct = target.pCt;
            var idx = ct.indexOf(target);
            at ? ct.insert( idx, source ) : 
                 ct.insert( idx+1, source);
        }
    },
    
//
//  在目标上方时显示指示器
//
    _wayFor : function(target, before){
        var it = this.getIndicator();
        before ? target.insertBefore(it) : 
                 target.insertAfter(it);
        if(this._currHold !== target)
            this._currHold = target; 
    }
});
})();