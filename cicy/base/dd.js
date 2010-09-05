/**
 * @class CC.util.dd
 * 库drag & drop效果实现
 * drag & drop实现有两种方法<ul>
 * <li>基于空间划分检测</li>
 * <li>一种基于浏览器自身的mouse over + mouse out检测</li></ul>
 * 这里采用第一种.
 */
(function(){

var CC = window.CC;
CC.util.dd = {};

var E = CC.Event,

    _w = window,

    doc = _w.document,

    M = _w.Math,

    //位于上方的控件
    onEl = null,

    //拖动中的控件
    dragEl = null,

    //拖动开始时鼠标位置
    IXY,

    //当前鼠标位置
    PXY,

    //鼠标离初始位置偏移量
    DXY = [0,0],

    //开始时拖动元素位置
    IEXY,

    //是否拖动中
    ing = false,

    //当前拖动compoent所在域
    zoom,

    //寄存点
    P = new CC.util.d2d.Point,

    //寄存ComponentRect
    R,
    
    // drag monitor
    AM,
    
    // drog monitor
    OM = false,
    //拖放事件是否已绑定,避免重复绑定
    binded = false,

    //drag source控件所在的域
    ownZoom = false,

    //[MAX_DX,MIN_DX,MAX_DY,MIN_DY]
    bounds = false,
    
    tmpValid = undefined,
    
    // temp DOMEvent on move
    V;

    function noSelect(e){
      e = e || window.E;
      E.stop(e);
      return false;
    }
    
    function checkZoom(){
      // check zoom, if not set zoom in beforedrag
      if(!zoom)
        zoom = mgr.$(dragEl.dragZoom);
      
      if(zoom) {
        if(dragEl.ownRect){
          if(zoom.contains(dragEl.ownRect)){
            tmpValid = dragEl.ownRect.valid;
            dragEl.ownRect.valid = false;
          }
        }
        zoom.update();
      }
    }
    
    function before(e){
        dragEl = this;
        if(__debug) console.group("拖放"+this);
        if(__debug) console.log('beforedrag');
        if((!this.beforedrag || this.beforedrag(e)!==false) && this.fire('beforedrag', e) !== false){
          // check drag monitor, this instead of null
          if(!AM)
            AM = this;
      
          if(AM !== this && AM.beforedrag){
            if(AM.beforedrag(e) === false){
              dragEl = false;
              AM = false;
              return;
            }
          }
          
          IEXY = dragEl.absoluteXY();
          IXY = PXY = E.pageXY(e);
          
          E.stop(e);
          
          if(!binded){
            // bind dom events
            binded = true;
            // chec drop monitor
            if(!OM)
            OM = this;
        
            if(!OM.movesb)
            OM.movesb = false;
        
            // 加速处理
            if(!AM.drag)
              AM.drag = false;
        
            E.on(doc, "mouseup", drop)
             .on(doc, "mousemove", drag)
             .on(doc, "selectstart", noSelect);
          }
          
          checkZoom();
      
          if(__debug && zoom) console.log('当前zoom:',this.dragZoom||zoom);
        }else {
          dragEl = false;
        }
    }

    function GDXY(){
      var d = DXY;
          d[0] = PXY[0] - IXY[0];
          d[1] = PXY[1] - IXY[1];
          if(bounds){
             var b = bounds;
             if(d[0]<b[1]) d[0]=b[1];
             else if(d[0]>b[0]) d[0]=b[0];

             if(d[1]<b[3]) d[1]=b[3];
             else if(d[1]>b[2]) d[1]=b[2];
          }
    }
    // 检测是否进入范围
    function _(){
        //区域检测
        R = zoom.isEnter(P);
        if(R && R.comp !== dragEl) {
          if(onEl !== R.comp){
            //首次进入,检测之前
            if(onEl !== null){
                if(__debug) console.log('离开:',onEl.title||onEl);
                OM.sbout && OM.sbout(onEl, dragEl, V);
            }
            //
            onEl = R.comp;
            if(!onEl.disabled){
              if(__debug) console.log('进入:',onEl.title||onEl);
              OM.sbover && OM.sbover(onEl, dragEl, V);
              // 可能已重新检测onEl
            }else {
              onEl = null;
            }
          }
          //源内移动
          if(onEl){
            if(OM.sbmove) OM.sbmove(onEl, V);
          }
        }else{
          if(onEl!== null){
            if(__debug) console.log('离开:',onEl.title||onEl);
            OM.sbout && OM.sbout(onEl, dragEl, V);
            onEl = null;
          }
        }
    }
    
    function drag(e){
    	// dragstart false state
    	if(ing === -1)
    		return;
    	
      V = e || _w.E;
      PXY = E.pageXY(e);


      P.x = PXY[0];
      P.y = PXY[1];

      GDXY();

      if(!ing){
        if(__debug) console.log('dragstart       mouse x,y is ', PXY,'dxy:',DXY);
        if(AM.dragstart){
        	if(AM.dragstart(e, dragEl) === false){
        		ing = -1;
        		return;
        	}
        }
        ing = true;
      }
      
      if((AM.drag === false || AM.drag(e) !== false) && zoom)
        _();
        
      E.stop(e);
    }

    function drop(e){
      // drag has started
      if(dragEl){
        e = e || _w.E;
        if(binded){
          //doc.ondragstart = null;
          //清空全局监听器
          E.un(doc, "mouseup", arguments.callee)
           .un(doc, "mousemove", drag)
           .un(doc, "selectstart", noSelect);
          if(ing && ing !== -1){
             if(__debug) console.log('dragend         mouse delta x,y is ',DXY, ',mouse event:',e);
            //如果在拖动过程中松开鼠标
            if(onEl !== null){
              OM.sbdrop && OM.sbdrop(onEl, dragEl, e);
              if(__debug) console.log(dragEl.toString(), '丢在', onEl.title||onEl,'上面');
            }

            AM.dragend && AM.dragend(e, dragEl);
          }
          
          onEl = null;
          if(zoom){
            zoom.clear();
            //不再将自己放入域
            ownZoom = false;
            zoom = null;
          }
          R = null;
          binded = false;
          ing = false;
        }
        
        if(__debug) console.log('afterdrag');
        AM.afterdrag && AM.afterdrag(e);
        dragEl.fire('afterdrag', e);
        
        // 恢复
        if(tmpValid !== undefined){
           dragEl.ownRect.valid = tmpValid;
           tmpValid = undefined;
        }
        
        dragEl = null;
        bounds = false;
        OM = AM = false;
        V = null;
        if(__debug) console.groupEnd();
      }
    }


/**
 * @class CC.util.dd.Mgr
 * Drag & Drop 管理器
 * 利用空间划分类，结合鼠标事件实现DRAG & DROP功能。
 <pre><code>
CC.ready(function(){
//__debug=true;
// 实现两个控件（树，表格）间的拖放响应效果。
var win = new CC.ui.Win({
  layout:'border',
  showTo:document.body,
  items:[
      {ctype:'tree',id:'typetree',  cs:'scrolltree', css:'lnr',
       getScrollor : function(){ return this; },
       // 默认tree点击触发事件是mousedown,就像tabitem一样,
       // 这里为了不影响拖动事件mousedown,将触发事件改为click
       clickEvent:'click',
       root:{expanded:true,title:'根目录'},
       width:190,lyInf:{dir:'west'}
      },
      {ctype:'grid', id:'attrgrid', lyInf:{dir:'center'},autoFit:true,css:'lnl',
       header : {array:[
         {title:'名 称'},
         {title:'值'}
       ]},
       
       content:{array:[{  array:[{title:'码 数'}, {title:'20'}] }] }
      }
  ]
});
win.render();
win.center();

var resizeImg = new CC.ui.Resizer({
    layout : 'card',
    left   : 20,
    top    : 10,
    width  : 300,
    height : 300,
    id     : '图片',
    showTo : document.body,
    autoRender : true,
    shadow : true,
    items  : [{
        ctype:'base',
        template:'<img alt="图片位置" src="3ea53e46d25.jpg">'
    }]
});

var attrgrid = win.byId('attrgrid');
var typetree    = win.byId('typetree');
// 拖放管理器
var G = CC.util.dd.Mgr;

// 添加三个拖放域，为指定控件所在的区域
var ctzoom = new CC.util.d2d.RectZoom({
  rects:[
    new CC.util.d2d.ComponentRect(attrgrid),
    new CC.util.d2d.ComponentRect(typetree),
    new CC.util.d2d.ComponentRect(resizeImg)
  ]
});

// 拖放处理对象
var handler = {
  beforedrag : function(){
    G.setZoom(ctzoom);
  },
  dragstart : function(evt, source){
    G.getIndicator().prepare();
    G.getIndicator().setMsg("容器间的拖放!", "源:"+source.id);
    CC.each(ctzoom.rects, function(){
        if(this.comp != source){
            this.comp.addClass('dragstart');
        }
    });
  },
  
  drag : function(){
    // 使得指示器在正确的位置显示
    G.getIndicator().reanchor();
  },
  sbover : function(target){
    G.getIndicator().setMsg('进入了<font color="red">'+target.id+'</font>');
    target.addClass('dragover');
  },
  sbout : function(target){
    G.getIndicator().setMsg("容器间的拖放!");
    target.delClass('dragover');
  },
  
  sbdrop : function(target, source){
    target.delClass('dragover');   
  },
  
  dragend : function(evt, source){
    CC.each(ctzoom.rects, function(){
        if(this.comp != source){
            this.comp.delClass('dragstart');
        }
    });
    G.getIndicator().end();
  }
};

G.installDrag(typetree, true, null, handler);

G.installDrag(attrgrid, true, null, handler);

G.installDrag(resizeImg, true, null, handler);
});
 </code></pre>

 */
  var mgr = CC.util.dd.Mgr = {
/**
 * 矩域缓存
 * @private
 */
        zmCache : {root:new CC.util.d2d.RectZoom()},

/**
 * 给控件安装可拖动功能,安装后控件component具有
 * component.draggable = true;
 * 如果并不想控件view结点触发拖动事件,可设置component.dragNode
 * 指定触发结点.
 * @param {CC.Base} component
 * @param {Boolean} install 安装或取消安装
 * @param {HTMLElement|String} dragNode 触发事件的结点,如无则采用c.dragNode
 */
        installDrag : function(c, b, dragNode, monitor, dragtrigger){
          if(!b){
            c.draggable = false;
            c.unEvent('mousedown', before,dragNode||c.dragNode);
          }else {
            c.draggable = true;
            if(dragtrigger){
              dragtrigger = c.dom(dragtrigger) || dragtrigger;
              if(dragtrigger){
                c.domEvent('mousedown',  function(e){
                   var el = E.element(e);
                   if(el === dragtrigger || el.id === dragtrigger){
                     mgr.startDrag(this, e);
                   }
                }, false, null, dragNode);
              }
            }else {
              c.domEvent('mousedown', before, false, null, dragNode);
            }
            
            if(monitor){
              c.beforedrag = function(){
                AM = OM = monitor;
              };
            }
          }
        },
/**
 * 手动触发拖放处理.
 * @param {CC.Base} dragSource
 * @param {DOMEvent} event 传入初始化事件.
 */
        startDrag : function(source, e){
          before.call(source, e);
        },

/**
 * 设置拖动中的控件, 在dragbefore时可以指定某个控件作为拖动源对象.
 * @param {CC.Base} draggingComponent
 * @return this
 */
        setSource : function(comp){
          dragEl = comp;
          return this;
        },
/**
 * 设置拖动监听器, 在dragbefore时可以指定某个对象作为拖动监听器,如果未设置,drag source控件将作为监听器.<br>
 * monitor具有以下接口
   beforedrag<br>
   dragstart <br>
   drag      <br>
   dragend   <br>
 * @param {Object} dragMonitor
 * @return this
 */
        setDragMonitor : function(monitor){
          DN = monitor;
          return this;
        },
/**
 * 设置drop监听器, 在dragbefore时可以指定某个对象作为监听器,如果未设置,drag source控件将作为监听器.<br>
 * monitor具有以下接口
   sbover    <br>
   sbout     <br>
   sbmove    <br>
   sbdrop    <br>
 * @param {Object} dropgMonitor
 * @return this
 */        
        setDropMonitor : function(monitor){
          AM = monitor;
          return this;
        },
/**
 * 集中一个监听器.
 * @param {Object} monitor
 * @return this
 */
        setMonitor : function(monitor){
          DN = AM = monitor;
          return this;
        },
/**
 * 可在dragbefore重定义当前拖放区域.
 * @param {CC.util.d2d.RectZoom} rectzoom
 * @param {Boolean} update
 * @return this
 */
        setZoom : function(z, update){
          zoom = z;
          if(z && update) zoom.update();
          return this;
        },
/**
 * 返回矩域
 * @param {String} name 矩域名称
 * @param {String} parent 父层矩域,如果该参数为非空,并且name域未存在,则创建一个新域并返回该域
 * @return {CC.util.d2d.RectZoom}
 * @method $
 */
        $ : function(k, p){
          var z = this.zmCache[k];
          if(!z && p){
            var c = this.zmCache;
            if(k === 'root')
              throw "can't named root";
            if(typeof p === 'string'){
              p = c[p];
              if(!p)
                throw "parent zoom doesn't exist."
            }else if(p === true)
              p = c.root;

            z = c[k] = new CC.util.d2d.RectZoom();
            p.add(z);
          }
          return z;
        },
/**
 * 设置拖放区域大小,在X方向上,最小的delta x与最大的delta x,
 * 在Y方向上,最小的delta y与最大的delta y, 所以数组数据为
 * [max_delta_x, min_delta_x, max_delta_y, min_delta_y],
 * 设置拖动区域后,超出区域的行为将被忽略,也就是并不回调
 * component.drag方法,所以,在drag方法内的操作都是安全的.
 * 受限区域在拖放结束后清空.
 * @param {Array} constrainBounds
 * @return this
 */
        setBounds : function(arr){
          bounds = arr;
          return this;
        },

/**
 * 获得受限区域
 * @return {Array} [MAX_DX,MIN_DX,MAX_DY,MIN_DY]
 */
        getBounds : function(){
          return bounds;
        },
/**
 * 返回根域
 * @return {CC.util.d2d.RectZoom}
 */
        getRoot : function(){
          return this.zmCache.root;
        },
/**
 * 从域链中移除名称为name的域
 * @param {String} name
 * @return {CC.util.d2d.RectZoom} 返回移除的域
 */
        remove : function(k){
         var z = this.zmCache[k];
         if(z && k !== 'root'){
          z.pZoom.remove(z);
          delete this.zmCache[k];
         }
         return z;
        },

/**
 * 将控件加入name域
 * @param {CC.Base} 控件
 * @param {String} name 矩域名
 * @return this
 */
        addComp : function(comp, k){
          k = this.$(k, true);
          k.add(new CC.util.d2d.ComponentRect(comp));
          return this;
        },
/**
 * 控件移出域
 * @param {CC.Base} 控件
 * @param {String} name 矩域名
 * @return this
 */
        removeComp : function(comp, k){
          k = this.$(k);
          var rs = k.getRects();
          CC.each(rs, function(){
            if(this.comp === comp){
              k.remove(this);
              this.destory();
              return false;
            }
          });
          return this;
        },

/**
 * 拖动开始时鼠标位置
 * @return {Array} [x, y]
 */
        getIMXY : function(){
          return IXY;
        },
/**
 * 获得对象拖动开始时对象坐标
 * @return {Array} [x,y]
 */
        getIEXY : function(){
          return IEXY;
        },

/**
 * 获得自鼠标拖动起至今的x,y方向偏移量
 * @return {Array} [dx, dy]
 */
        getDXY : function(){
          return DXY;
        },
/**
 * 获得当前鼠标位置
 * @return {Array} [x,y]
 */
        getXY : function(){
          return PXY;
        },
/**
 * 获得当前拖动的对象
 * @return {CC.Base}
 */
        getSource : function(){
          return dragEl;
        },
/**
 * 获得当前位正下方的对象,如果无,返回null
 * @return {CC.Base}
 */
        getTarget : function(){
          return onEl;
        },

/**
 * 更新当前拖动的矩域数据.
 * @return this
 */
    update : function(){
      if(zoom){
        zoom.update();
        // recheck again
      }
      return this;
    },

/**
 * 是否拖放中
 * @return {Boolean}
 */
        isDragging : function(){
          return ing;
        },
/**
 * @class CC.util.dd.Mgr.resizeHelper
 * 当控件需要resize时调用,可以创建resize相关的掩层和映像,防止其它干扰resize的因素,如iframe
 * @singleton
 */

        resizeHelper : {

          resizeCS : 'g-resize-ghost',

          maskerCS : 'g-resize-mask',
/**
 * @property  layer
 * 映像层,只读,当调用applyLayer方法后可直接引用
 * @type CC.Base
 */

/**
 * @property masker
 * 页面掩层,只读,当调用applyMasker方法后可直接引用
 * @type CC.Base
 */

/**
 * 在resize开始或结束时调用
 * @param {Boolean} applyOrNot
 * @param {String}  [maskerCursor] 掩层的style.cursor值
 */
          applyResize : function(b, cursor){
            this.resizing = b;
            this.applyLayer(b);
            this.applyMasker(b, cursor);
          },
/**
 * 是否应用映像层
 * @param {Boolean} apply
 * @return this
 */
          applyLayer : function(b){
            var y = this.layer;
            if(!y){
              y = this.layer =
                  CC.Base.create({
                    view:CC.$C('DIV'),
                    autoRender:true,
                    cs:this.resizeCS,
                    hidden:true
                  });
            }
            b ? y.appendTo(doc.body) : y.del();
            y.display(b);
            return this;
          },
/**
 * 创建或移除页面掩层,在resize拖动操作开始时,创建一个页面掩层,
 * 以防止受iframe或其它因素影响resize
 * @param {Boolean} cor 创建或移除页面掩层
 * @param {String}  cursor 掩层style.cursor值
 * @return this
 */
          applyMasker : function(b, cursor){
            var r = this.masker;
            if(!r)
              r = this.masker =
                CC.Base.create({
                  view:CC.$C('DIV'),
                  autoRender:true,
                  cs:this.maskerCS,
                  hidden:true,
                  unselectable:true
                });

            if(b && CC.ie)
              r.setSize(CC.getViewport());
            b ? r.appendTo(doc.body) : r.del();
            r.display(b);
            
            if(cursor !== undefined)
              r.fastStyleSet('cursor', cursor);
            return this;
          }
        }
  };
/**
 * @class CC.Base
 */
  CC.extendIf(CC.Base.prototype, {
/**
 * @cfg {String|HTMLElement} dragNode 触发控件拖动开始的结点或结点ID,属性由{@link CC.util.dd.Mgr}引入
 */

/**
 * @cfg {Boolean} draggable 是否允许拖动功能,该值只有在已安装拖动功能情况下才生效.<br>
 * 属性由{@link CC.util.dd.Mgr}类引入.
 */
 
/**
* @cfg {String} dragZoom 设置或获取控件源拖放区域名称(组),只有控件已安装拖动功能该设置才生效.<br>
* 属性由{@link CC.util.dd.Mgr}引入,另见{@link CC.dd.Mgr#installDrag}
*/

/**
* 是否安装结点拖放效果,方法由{@link CC.util.dd.Mgr}引入.
* @param {Boolean} true | false
* @return this
*/
    installDrag : function(b){
      mgr.installDrag(this, b);
      return this;
    },
/**
* 获得drag & drop 管理器,由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
* @return {CC.util.dd.Mgr}
*/
    getDDProvider : function(){
      return mgr;
    },

/**
 * 如果已安装拖放,
 * 函数在鼠标按下时触发,方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @method beforedrag
 */
    beforedrag : false,
/**
 * 如果已安装拖放,拖动开始时触发.方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @param {CC.Base}  source
 * @method dragstart
 */
    dragstart : false,
/**
 * 如果已安装拖放,
 * 函数在鼠标松开时触发,拖动曾经发生过.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @param {CC.Base}  source
 * @method dragend
 */
    dragend : false,
/**
 * 如果已安装拖放,
 * 函数在鼠标松开时触发,拖动不一定发生过.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @method afterdrag
 */
    afterdrag : false,
/**
 * 如果已安装拖放,
 * 函数在鼠标拖动时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {DOMEvent} event
 * @param {CC.Base} overComponent 在下方的控件,无则为空
 * @method drag
 */
    drag : false,

/**
 * 如果已加入拖放组,
 * 函数在源进入时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {CC.Base} dragTarget 下方控件
 * @param {CC.Base} dragSource 上方控件
 * @param {DOMEvent} event
 * @method sbover
 */
    sbover : false,
/**
 * 如果已加入拖放组,
 * 函数在源离开时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {CC.Base} dragTarget 下方控件
 * @param {CC.Base} dragSource 上方控件
 * @param {DOMEvent} event
 * @method sbout
 */
    sbout : false,
/**
 * 如果已加入拖放组,
 * 函数在源丢下时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {CC.Base} dragTarget 下方控件
 * @param {CC.Base} dragSource 上方控件
 * @param {DOMEvent} event
 * @method sbdrop
 */
    sbdrop : false,
/**
 * 如果已加入拖放组,
 * 函数在源移动时触发.
 * 方法由{@link CC.util.dd.Mgr}引入,另见{@link #installDrag}.
 * @param {CC.Base} dragTarget 下方组件
 * @param {DOMEvent} event
 * @method sbmove
 */
    sbmove : false
  });
  
/**
 *@class CC.util.d2d.ContainerDragZoom
 * 该类可快速将容器首层子控件添加到容器矩域中，并可实时刷新矩域数据。
 <pre><code>
 // 容器子项拖放响应
    var portalZoom = new CC.util.d2d.ContainerDragZoom({ct:win});
    var handler = {
        beforedrag : function(){
            CC.util.dd.Mgr.setZoom(portalZoom);
        },
        ...
    };
 </code></pre>
 * @extends CC.util.d2d.RectZoom
 */
  CC.create('CC.util.d2d.ContainerDragZoom', CC.util.d2d.RectZoom, {
/**
 * @cfg {Function} filter 在拖动开始收集控件区域时可过滤某些不合条件的子控件。
 * <br>
 * 格式:filter(childComponent),返回false时忽略该子控件
 */
    filter : false,
/**
 * @private
 */
    prepare : function(){
      var sv = this.ct.getScrollor().view, 
          ch = sv.clientHeight,
          st = sv.scrollTop,
          source = mgr.getSource(),
          self = this;

      var zoom = this;
      this.ct.each(function(){
        if(this !== source){
            if(!self.filter || self.filter(this) !== false){
              var v = this.view, ot = v.offsetTop, oh = v.offsetHeight;
              // 是否可见范围
              if(ot + oh - st > 0){
                if(ot - st - ch < 0){
                  zoom.add( new CC.util.d2d.ComponentRect(this) );
                  if(__debug) console.log('CC.util.d2d.ContainerDragZoom:item index:', arguments[1]);
                }else {
                  return false;
                }
              }
            }
        }
      });
      if( __debug ) console.groupEnd();
    },
/**
 * 
 */
    clear   : function(){
      this.rects.clear();
    },
/**
 * @param {CC.Base} component(s)
 */
    addComp : function(comp){
      if(CC.isArray(comp)){
        for(var i=0,len=comp.length;i<len;i++){
          this.addComp(comp[i]);
        }
      }
      else this.add( new CC.util.d2d.ComponentRect(comp) );
    }
  });
  
  CC.ui.def('ctzoom', CC.util.d2d.ContainerDragZoom);
/**
 * @class CC.util.dd.Indicator
 * 默认的拖放指示器
 * @extends CC.ui.ContainerBase
 */
  CC.create('CC.util.dd.Indicator', CC.ui.ContainerBase, {
      
      hidden : true,
      
      template : CC.ie ? 
           '<table class="g-float-tip g-clear g-openhand"><tr><td><table class="tipbdy"><tr><td id="_tle" class="important_txt"></td></tr><tr><td id="_msg" class="important_subtxt"></td></tr></table></td></tr></table>' :
           '<div class="g-float-tip g-clear g-openhand"><div class="tipbdy"><div id="_tle" class="important_txt"></div><div id="_msg" class="important_subtxt"></div></div></div>',
      
      shadow : {ctype:'shadow', inpactY:-1,inpactH:5},
/**
 * 设置标题。
 * @param {String} text 正文
 * @param {String} title 标题
 */
      setMsg : function(text, title){
        if(text !== false) {
          if(!this.msgNode)
            this.msgNode = this.dom('_msg');
          this.msgNode.innerHTML = text;
        }
        if(title !== undefined){
          if(!this.titleNode)
            this.titleNode = this.dom('_tle');
          this.titleNode.innerHTML = title;
        }
        
        if(this.shadow)
          this.shadow.resize();
      },
/**
 * 显示前调用，设置初始位置等信息。
 */
      prepare : function(x, y){
        if(x === undefined)
          x = 15;
          
        if(y === undefined)
          y = -10;

        if(!this.rendered) {
          this.render();
        }
        var ixy = mgr.getIMXY();
        x += ixy[0]; 
        y += ixy[1];
        this.initX = x;
        this.initY = y;
        this.setXY(x, y);
        this.show();
        mgr.resizeHelper.applyMasker(true);
        mgr.resizeHelper.masker.addClass('g-openhand');
        this.appendTo(document.body);
      },

      setXY : function(){
        this.superclass.setXY.apply(this, arguments);
        if(this.shadow)
          this.shadow.repos();
        return this;
      },
/**
 * 更新定位信息。
 */
      reanchor : function(){
        this.setXY(this.initX + DXY[0], this.initY + DXY[1]);
      },
/**
 * 指示结束后调用
 */
      end : function(){
        mgr.resizeHelper.applyMasker(false);
        mgr.resizeHelper.masker.delClass('g-openhand');
        this.hide().del();
      }
  });
  
  CC.ui.def('ddindicator', CC.util.dd.Indicator);
  
  /**
   * @member CC.util.dd.Mgr
   * @method getIndicator
   */
  mgr.getIndicator = function(cfg){
    var idc = this.indicator;
    if(!idc){
      idc = this.indicator = CC.ui.instance(CC.extend({ctype:'ddindicator'}, cfg));
    }
    return idc;
  };
})();