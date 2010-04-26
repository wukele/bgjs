/**
 * 库drag & drop效果实现
 * drag & drop实现有两种方法,
 * <li>基于空间划分检测
 * <li>一种基于浏览器自身的mouse over + mouse out检测
 * 这里采用第一种
 * @class
 * @name CC.util.dd
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

    //拖放事件是否已绑定,避免重复绑定
    binded = false,

    //拖放控件是否位于当前域中
    ownZoom = false,

    //[MAX_DX,MIN_DX,MAX_DY,MIN_DY]
    bounds = false;

    function noSelect(e){
      e = e || window.E;
      E.stop(e);
      return false;
    }

/**
 * @name CC.Base#draggable
 * @property {Boolean} draggable 是否允许拖动功能,该值只有在已安装拖动功能情况下才生效
 */

    function before(e){
      if(this.draggable){
        IXY = PXY = E.pageXY(e);
        IEXY = this.absoluteXY();
        dragEl = this;
        if(__debug) console.group("拖放"+this);
        if(__debug) console.log('beforedrag');
        if(this.beforedrag(e)!==false && this.fire('beforedrag', e) !== false){
          //doc.ondragstart = E.noUp;
          if(!binded){
            binded = true;
            E.on(doc, "mouseup", drop);
            E.on(doc, "mousemove", drag);
            E.on(doc, "selectstart", noSelect);
            zoom = mgr.$(this.dragZoom);
            if(zoom){
              if(this.ownRect){
                ownZoom = zoom.contains(this.ownRect);
                if(ownZoom){
                  ownZoom.remove(this.ownRect);
                }
              }
              zoom.update();
            }
            if(__debug && zoom) console.log('当前zoom:',this.dragZoom||zoom);
          }
        }
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

/**@inner*/
    function drag(e){
      e = e || _w.E;
      PXY = E.pageXY(e);


      P.x = PXY[0];
      P.y = PXY[1];

      GDXY();

      if(!ing){
        if(__debug) console.log('dragstart       mouse x,y is ', PXY,'dxy:',DXY);
        if(dragEl.dragstart(e) !== false && dragEl.fire('dragstart', e) !== false){
          ing = true;
        }
      }

      if(dragEl.drag(e, onEl) !== false && zoom){
        //区域检测
        R = zoom.isEnter(P);

        if(R && R.comp !== dragEl) {
          if(onEl !== R.comp){
            //首次进入,检测之前
            if(onEl !== null){
              onEl.sbout(dragEl, e);
              if(__debug) console.log('离开目标:',onEl);
            }
            onEl = R.comp;
            if(!onEl.disabled){
              onEl.sbover(dragEl, e);
              if(__debug) console.log('进入目标:',onEl);
            }else {
              onEl = null;
            }
          }
          //目标内移动
          if(onEl)
            onEl.sbmove(dragEl, e);
        }else{
          if(onEl!== null){
            onEl.sbout(dragEl, e);
            if(__debug) console.log('离开目标:',onEl);
            onEl = null;
          }
        }
      }
    }

/**@inner*/
    function drop(e){
      if(dragEl){
        e = e || _w.E;
        if(binded){
          //doc.ondragstart = null;
          //清空全局监听器
          E.un(doc, "mouseup", arguments.callee);
          E.un(doc, "mousemove", drag);
          E.un(doc, "selectstart", noSelect);
          if(ing){
            //如果在拖动过程中松开鼠标
            if(onEl !== null){
              onEl.sbdrop(dragEl, e);
              if(__debug) console.log(dragEl.toString(), '丢在', onEl.toString(),'上面');
            }
            dragEl.dragend(e);
            ing = false;
            if(__debug) console.log('dragend         mouse delta x,y is ',DXY, ',mouse event:',e);
          }
          binded = false;
          onEl = null;
          if(zoom){
            //重新将自己放入域
            if(ownZoom){
              ownZoom.add(dragEl.ownRect);
              ownZoom = false;
            }
            zoom = null;
          }
          R = null;
        }
        if(__debug) console.log('afterdrag');
        dragEl.afterdrag(e);
        dragEl.fire('afterdrag', e);
        dragEl = null;
        bounds = false;
        if(__debug) console.groupEnd();
      }
    }


/**
 * Drag & Drop 管理器
 * @name CC.util.dd.Mgr
 * @class
 */
  var mgr = CC.util.dd.Mgr = /**@lends CC.util.dd.Mgr*/{
/**
 * 矩域缓存
 * @protected
 */
        zmCache : {root:new CC.util.d2d.RectZoom()},

/**
 * 返回矩域
 * @param {String} name 矩域名称
 * @param {String} parent 父层矩域,如果该参数为非空,并且name域未存在,则创建一个新域并返回该域
 * @return {CC.util.d2d.RectZoom}
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
 * @type Array
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
 * 获得对象拖动开始时鼠标坐标
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
 * 更新当前拖动zoom
 * @return this
 */
    update : function(){
      if(zoom)
        zoom.update();
      return this;
    },

/**
 * 给控件安装可拖动功能,安装后控件component具有
 * component.draggable = true;
 * 如果并不想控件view结点触发拖动事件,可设置component.dragNode
 * 指定触发结点.
 * @param {CC.Base} component
 * @param {Boolean} install 安装或取消安装
 * @param {HTMLElement} 触发事件的结点,如无则采用c.dragNode
 */
        installDrag : function(c, b, dragNode){
          if(b===undefined || b){
            c.draggable = true;
            c.domEvent('mousedown', before, false, null, dragNode||c.dragNode);
          }else {
            c.draggable = false;
            c.unEvent('mousedown', before,dragNode||c.dragNode);
          }
        },

/**
 * 是否拖放中
 * @return {Boolean}
 */
        isDragging : function(){
          return ing;
        },
/**
 * 当控件需要resize时调用,可以创建resize相关的掩层和映像,防止其它干扰resize的因素,如iframe
 * @name CC.util.dd.Mgr.resizeHelper
 * @class
 */

        resizeHelper : /**@lends CC.util.dd.Mgr.resizeHelper*/{

          resizeCS : 'g-resize-ghost',

          maskerCS : 'g-resize-mask',
/**
 * @property {CC.Base} layer 映像层,只读,当调用applyLayer方法后可直接引用
 */

/**
 * @property {CC.Base} masker 页面掩层,只读,当调用applyMasker方法后可直接引用
 */

/**
 * 在resize开始或结束时调用
 * @param {Boolean} apply
 */
          applyResize : function(b){
            this.resizing = b;
            this.applyLayer(b);
            this.applyMasker(b);
          },
/**
 * 是否应用映像层
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
          },
/**
 * 创建或移除页面掩层,在resize拖动操作开始时,创建一个页面掩层,
 * 以防止受iframe或其它因素影响resize
 * @param {Boolean} cor 创建或移除页面掩层
 */
          applyMasker : function(b){
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
          }
        }
  };

  CC.extendIf(CC.Base.prototype,/**@lends CC.Base.prototype*/ {
/**
* @name CC.Base#dragNode
* @property {String|HTMLElement} dragNode 触发控件拖动开始的结点或结点ID
*/

/**
* @name CC.Base#dragZoom
* @property {String} dragZoom 设置或获取控件目标拖放区域名称(组)
* 只有控件已安装拖动功能该设置才生效
* @see #installDrag
*/

/**
* 是否安装结点拖放效果
* @function
* @param {Boolean} true | false
*/
    installDrag : function(b){
      mgr.installDrag(this, b);
      return this;
    },
/**
* 获得drag & drop 管理器
* @return {CC.util.dd.Mgr}
*/
    getDDProvider : function(){
      return mgr;
    },

/**
 * 如果已安装拖放,
 * 函数在鼠标按下时触发
 * @type function
 */
    beforedrag : fGo,
/**
 * 如果已安装拖放
 * 拖动开始时触发
 * @type function
 */
    dragstart : fGo,
/**
 * 如果已安装拖放,
 * 函数在鼠标松开时触发,拖动曾经发生过
 * @type function
 */
    dragend : fGo,
/**
 * 如果已安装拖放,
 * 函数在鼠标松开时触发,拖动不一定发生过
 * @type function
 */
    afterdrag : fGo,
/**
 * 如果已安装拖放,
 * 函数在鼠标拖动时触发
 * @type function
 */
    drag : fGo,

/**
 * 如果已加入拖放组,
 * 函数在目标进入时触发
 * @type function
 */
    sbover : fGo,
/**
 * 如果已加入拖放组,
 * 函数在目标离开时触发
 * @type function
 */
    sbout : fGo,
/**
 * 如果已加入拖放组,
 * 函数在目标丢下时触发
 * @type function
 */
    sbdrop : fGo,
/**
 * 如果已加入拖放组,
 * 函数在目标移动时触发
 * @type function
 */
    sbmove : fGo
  });
  
  CC.ui.def('base', function(opt){
    return CC.Base.create(opt);
  });
})();