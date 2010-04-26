/**
 * window控件
 * @name CC.ui.Win
 * @class
 * @extends CC.ui.Resizer
 */
CC.create('CC.ui.Win', CC.ui.Resizer, function(father){
    var CC = window.CC;
    CC.Tpl.def('CC.ui.win.Titlebar', '<div id="_g-win-hd" class="g-win-hd"><div class="fLe"></div><b class="icoSw" id="_ico"></b><span id="_tle" class="g-tle">提示</span><div class="fRi"></div><div class="g-win-hd-ct" style="position:absolute;right:5px;top:7px;" id="_ctx"></div></div>');
    CC.Tpl.def('CC.ui.win.TitlebarButton', '<a class="g-hd-btn" href="javascript:fGo();"></a>');

    //static变量,跟踪当前最顶层窗口的zIndex
    var globalZ = 900,
        G = CC.util.dd.Mgr,
        H = G.resizeHelper,
        Base = CC.Base,
        SX = Base.prototype.setXY,
        IPXY;
/**
 * @name CC.ui.Win#unmoveable
 * @property {Boolean} unmoveable 设置该值操纵当前窗口是否允许移动
 */
/**
 * @namespace
 * @name CC.ui.win
 */
/**
 * @name CC.ui.win.Titlebar
 * @class
 * @extends CC.ui.ContainerBase
 */
    CC.create('CC.ui.win.Titlebar', CC.ui.ContainerBase, {
        autoRender: true,
        clickEvent : true,
        unselectable:true,
        cancelClickBubble : true,
        itemCfg: { template: 'CC.ui.win.TitlebarButton' },
        ct: '_ctx',
        selectionProvider : {forceSelect: true, selectedCS : false}
    });


    return /**@lends CC.ui.Win#*/{

        closeable : true,

        shadow : true,

        innerCS : 'g-win g-tbar-win',
/**
 * 最小化时窗口样式
 * @private
 */
        minCS : 'g-win-min',

/**
 * 最大化时窗口样式
 * @private
 */
        maxCS : 'g-win-max',

        minH:30,
/**
 * 指定内容溢出时是否显示滚动条(overflow:hidden|auto),默认为显示
 */
        overflow:false,

        minW:80,
/**
 * 拖放时窗口透明度
 * @private
 */
        dragOpacity : 0.6,

        initComponent: function() {
          var tb = this.titlebar = new CC.ui.win.Titlebar({title:this.title});
          this.follow(tb);
          delete this.title;

          if(this.shadow === true)
            this.shadow = new CC.ui.Shadow({inpactY:-1,inpactH:5});

          father.initComponent.call(this);

          if(this.overflow)
            this.wrapper.fastStyleSet('overflow', this.overflow);

          this.wrapper.insertBefore(tb);

          if(this.closeable === true){
            this.clsBtn = new CC.ui.Item({
              cs:'g-win-clsbtn',
              template:'CC.ui.win.TitlebarButton',
              onselect:this.onClsBtnClick,
              tip:'关闭',
              id:'_cls'
            });
            tb.add(this.clsBtn);
          }

          if(this.destoryOnClose)
            this.on('closed', this.destory);

          this.domEvent('mousedown', this.trackZIndex)
              //为避免获得焦点,已禁止事件上传,所以还需调用trackZIndex更新窗口zIndex
              .domEvent('mousedown', this.trackZIndex, true, null, this.titlebar.view)
              .domEvent('dblclick',  this.switchState, true, null, this.titlebar.view);

          if(!this.unmoveable)
            G.installDrag(this, true, tb.view);

          this.trackZIndex();
        },
/**
 * 实现窗口的拖放
 * @private
 * @override
 */
        dragstart : function(){
          if(this.unmoveable || this.fire('movestart') === false)
            return false;

          if (this.shadow)
            this.shadow.hide();

          H.applyMasker(true);
          this.decorateDrag(true);
          IPXY = this.xy();
        },

        drag : function() {
          var d = G.getDXY();
          SX.call(this, IPXY[0] + d[0], IPXY[1] + d[1]);
        },

        dragend : function() {
          H.applyMasker(false);
          if (this.fire('moveend') === false) {
            this.setXY(IPXY);
            this.decorateDrag(false);
            return false;
          }

          //update x,y
          var d = G.getDXY(), ip = IPXY;
          this.left = this.top = false;
          this.setXY(ip[0] + d[0], ip[1] + d[1]);
          this.decorateDrag(false);
          IPXY = null;
        },
/**
 * 拖动前台修饰或恢复窗口效果,主要是设置透明,隐藏内容
 * @private
 * @param {Boolean} decorate 修饰或恢复
 */
        decorateDrag : function(b){
          if(b){
           this.setOpacity(this.dragOpacity)
               .wrapper.hide();
          }else{
           this.setOpacity(1)
               .wrapper.show();
          }
          if (this.shadow)
            this.shadow.display(!b);
        },

/**
 * @private
 * 点击关闭按钮事件.
 * 此时this为按钮
 */
        onClsBtnClick : function(){
          this.pCt.pCt.close();
        },
/**
 * 设置标题,实际上调用了titlebar设置标题
 * @override
 */
        setTitle : function(tle) {
          this.titlebar.setTitle(tle);
          return this;
        },
/**
 * 更新窗口系统的zIndex,使得当前激活窗口位于最顶层
 * @private
 */
        trackZIndex : function(){
          if(this.zIndex != globalZ){
            //以5+速度递增,+5因为存在阴影,边框拖放条的zindex更新
            globalZ+=5;
            this.setZ(globalZ);
          }
        },

        //override
        setZ : function(zIndex) {
            this.fastStyleSet("zIndex", zIndex);

            //corners
            for(var i=0,cs=this.cornerSprites,len=cs.length;i<len;i++){
              cs[i].setZ(zIndex + 1);
            }

            //shadow
            if(this.shadow)
              this.shadow.setZ(zIndex-1);

            //cache the zIndex
            this.zIndex = zIndex;

            return this;
        },
/**
 * 改变窗口状态
 * 可选状态有<br>
 * <li>max
 * <li>min
 * <li>normal
 */
        switchState : function(){
          if(this.win_s != 'max')
            this.max();
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

        /**
         * 关闭当前窗口,发送close, closed事件.
         * @return this;
         */
        close : function(){
            if(this.fire('close')=== false)
                return false;
            this.onClose();
            this.fire('closed');
            return this;
        },

/**
 * @private
 * 默认的关闭处理
 */
        onClose : function(){
            this.display(0);
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
        /**
         * 最小化窗口.
         * @return this
         */
        min : function(){
          this.setState('min');
          return this;
        },

        /**
         * 恢复正常
         * @return this;
         */
        normalize : function(){
          return this.setState('normal');
        },
        /**
         * 最大化
         * @return this
         */
        max : function(){
          return this.setState('max');
        },
        /**
         * 切换窗口状态
         * @param {String} st 状态选项, 值为max,min或空,为空时正常状态.
         */
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
              var sz, p = this.pCt?this.pCt.view : this.view.parentNode;
              if(p === document.body){
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
});
CC.ui.def('win', CC.ui.Win);