CC.Tpl.def('CC.ui.Resizer', '<div class="g-panel g-resizer"><div class="g-win-e" id="_xe"></div><div class="g-win-s" id="_xs"></div><div class="g-win-w" id="_xw"></div><div class="g-win-n" id="_xn"></div><div class="g-win-sw" id="_xsw"></div><div class="g-win-es" id="_xes"></div><div class="g-win-wn" id="_xwn"></div><div class="g-win-ne" id="_xne"></div><div class="g-panel-wrap g-resizer-wrap" id="_wrap"></div></div>');

/**
 * @class CC.ui.Resizer
 * 八个方向都可以缩放的面板.
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Resizer', CC.ui.Panel ,(function(superclass){
  var CC = window.CC, G = CC.util.dd.Mgr, H = G.resizeHelper, E = CC.Event;
    return {

/**
 * @cfg {Boolean} resizeable 是否允许缩放.
 */
        resizeable : true,
/**
 * @cfg {Boolean} enableH 是否允许纵向缩放
 */
        enableH:true,
/**
 * @cfg {Boolean} enableW 是否允许横向缩放
 */
        enableW:true,

        unresizeCS : 'g-win-unresize',

        width:500,

        height:250,

        minW:12,

        minH:6,

/**
 * @event resizestart
 * 缩放开始时发送.
 */
 
/**
 * @private
 */
        onResizeStart : function(nd){
          if(this.resizeable){
            var a = this.absoluteXY(),
                b = this.getSize(true);
            if(!CC.borderBox){
              b.width  -= 1;
              b.height -= 1;
            }
            //记录初始数据,坐标,宽高
            this.initPS = {pos:a,size:b};
            H.applyResize(true, nd.fastStyle('cursor'));
            H.layer.setXY(a)
                   .setSize(b);
            this.fire('resizestart');
          }
        },

/**
 * @event resizeend
 * @param {Array} xy [current_x, current_y]
 * @param {Array} dxy [delta_x, delta_y]
 * 缩放结束后发送.
 */
/**
 * @property initPS
 * 记录缩放开始时控件位置,长度等相关信息.
 * 结构为 {pos:[x,y],size:{width:w, height:h}}
 * @type Object
 */
/**
 * @private
 */
        onResizeEnd : function(){
          var dxy = G.getDXY();
          if(dxy[0] === 0 && dxy[1] === 0){
            H.applyResize(false);
            H.masker.fastStyleSet('cursor','');
          }else if(this.initPS){
            var sz = H.layer.getSize(true);
            //TODO:hack
            if(!CC.borderBox){
              if(sz.width !== 0)
                sz.width += 1;
              if(sz.height !== 0)
                sz.height += 1;
            }
            var dlt = H.layer.xy(),
                ips = this.initPS.pos,
                isz = this.initPS.size,
                dxy = [sz.width - isz.width, sz.height - isz.height],
                sd  = this.shadow,
                sds = sd && !sd.hidden;

            dlt[0] -= ips[0];
            dlt[1] -= ips[1];

            //消除阴影残影
            if(sd && sds)
              sd.hide();

            this.setXY(this.getLeft(true) + dlt[0],
                       this.getTop(true)  + dlt[1])
                .setSize(sz);

            if(sd && sds)
              sd.show();

            this.fire('resizeend', dlt, dxy);

            H.applyResize(false, '');
            delete this.initPS;
          }
        },

        initComponent : function() {
          superclass.initComponent.call(this);
          
          this.cornerSprites = [];
          this.resizeable ? this.bindRezBehavior() : this.setResizable(false);
        },
/**
 * @private
 */
        bindRezBehavior : function(){
         var  end = this.onResizeEnd.bind(this),
                a = this.createRezBehavior(0x8),
                b = this.createRezBehavior(0x4),
                c = this.createRezBehavior(0x2),
                d = this.createRezBehavior(0x1),
                f = this.createRezBehavior('',c,b),
                e = this.createRezBehavior('',b,d),
                g = this.createRezBehavior('',a,c),
                h = this.createRezBehavior('',a,d);

              this.bindRezTrigger('_xn', a,end)
                  .bindRezTrigger('_xs', b,end)
                  .bindRezTrigger('_xw', c,end)
                  .bindRezTrigger('_xe', d,end)
                  .bindRezTrigger('_xes',e,end)
                  .bindRezTrigger('_xsw',f,end)
                  .bindRezTrigger('_xwn',g,end)
                  .bindRezTrigger('_xne',h,end);
        },

/**
 * @private
 */
        bindRezTrigger : function(id, drag, end) {
            var self = this;
            var vid = this.cornerSprites[this.cornerSprites.length] = this.$$(id);

            vid.beforedrag = function(){self.onResizeStart(vid);};
            vid.drag = drag;
            vid.afterdrag = end;
            vid.installDrag(true);
            return this;
        },
/**
 * @private
 */
        createRezBehavior : function(axis,a,b) {
            var self = this;
            if(axis == 0x4 || axis == 0x8){
                return function() {
                    if(!self.enableH) {
                        return;
                    }
                    var dxy = G.getDXY();
                    self._zoom(axis, dxy[1]);
                };
            }
            else if(axis == 0x1 || axis == 0x2) {
                return function() {
                    if(self.enableW) {
                      var dxy = G.getDXY();
                      self._zoom(axis, dxy[0]);
                    }
                };
            }else {
                return function(ev) {
                    a.call(this);
                    b.call(this);
                };
            }
        },
/**@private*/
        _zoom : function(axis, pace) {
            var ly = H.layer;
            if((axis & 0x1) !== 0x0) {
                off =  this.initPS.size.width + pace;
                if(off>=this.minW)
                  ly.setWidth(off);
            }

            else if((axis & 0x2) !== 0x0) {
                off = this.initPS.size.width - pace;
                if(off >= this.minW){
                  ly.setWidth(off);
                  off = this.initPS.pos[0] + pace;
                  ly.setLeft(off);
                }
            }

            if((axis & 0x4) != 0x0) {
                off = this.initPS.size.height + pace;
                if(off>=this.minH)
                    ly.setHeight(off);
            }

            else if((axis & 0x8) != 0x0) {
                off = this.initPS.size.height - pace;
                if(off>=this.minH){
                  ly.setHeight(off);
                  off = this.initPS.pos[1] + pace;
                  ly.setTop(off);
                }
            }
        },
/**
 * 设置是否可缩放.
 * @param {Boolean} resizeable
 */
        setResizable : function(resizeable) {
          this.checkClass(this.unresizeCS, !resizeable);
          this.resizeable = resizeable;
        },

        getWrapperInsets : function(){
          return [6,1,1,1,7,2];
        }
    };
}));

CC.ui.def('resizer', CC.ui.Resizer);