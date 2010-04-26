/**
 * ��drag & dropЧ��ʵ��
 * drag & dropʵ�������ַ���,
 * <li>���ڿռ仮�ּ��
 * <li>һ�ֻ�������������mouse over + mouse out���
 * ������õ�һ��
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

    //λ���Ϸ��Ŀؼ�
    onEl = null,

    //�϶��еĿؼ�
    dragEl = null,

    //�϶���ʼʱ���λ��
    IXY,

    //��ǰ���λ��
    PXY,

    //������ʼλ��ƫ����
    DXY = [0,0],

    //��ʼʱ�϶�Ԫ��λ��
    IEXY,

    //�Ƿ��϶���
    ing = false,

    //��ǰ�϶�compoent������
    zoom,

    //�Ĵ��
    P = new CC.util.d2d.Point,

    //�Ĵ�ComponentRect
    R,

    //�Ϸ��¼��Ƿ��Ѱ�,�����ظ���
    binded = false,

    //�Ϸſؼ��Ƿ�λ�ڵ�ǰ����
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
 * @property {Boolean} draggable �Ƿ������϶�����,��ֵֻ�����Ѱ�װ�϶���������²���Ч
 */

    function before(e){
      if(this.draggable){
        IXY = PXY = E.pageXY(e);
        IEXY = this.absoluteXY();
        dragEl = this;
        if(__debug) console.group("�Ϸ�"+this);
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
            if(__debug && zoom) console.log('��ǰzoom:',this.dragZoom||zoom);
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
        //������
        R = zoom.isEnter(P);

        if(R && R.comp !== dragEl) {
          if(onEl !== R.comp){
            //�״ν���,���֮ǰ
            if(onEl !== null){
              onEl.sbout(dragEl, e);
              if(__debug) console.log('�뿪Ŀ��:',onEl);
            }
            onEl = R.comp;
            if(!onEl.disabled){
              onEl.sbover(dragEl, e);
              if(__debug) console.log('����Ŀ��:',onEl);
            }else {
              onEl = null;
            }
          }
          //Ŀ�����ƶ�
          if(onEl)
            onEl.sbmove(dragEl, e);
        }else{
          if(onEl!== null){
            onEl.sbout(dragEl, e);
            if(__debug) console.log('�뿪Ŀ��:',onEl);
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
          //���ȫ�ּ�����
          E.un(doc, "mouseup", arguments.callee);
          E.un(doc, "mousemove", drag);
          E.un(doc, "selectstart", noSelect);
          if(ing){
            //������϶��������ɿ����
            if(onEl !== null){
              onEl.sbdrop(dragEl, e);
              if(__debug) console.log(dragEl.toString(), '����', onEl.toString(),'����');
            }
            dragEl.dragend(e);
            ing = false;
            if(__debug) console.log('dragend         mouse delta x,y is ',DXY, ',mouse event:',e);
          }
          binded = false;
          onEl = null;
          if(zoom){
            //���½��Լ�������
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
 * Drag & Drop ������
 * @name CC.util.dd.Mgr
 * @class
 */
  var mgr = CC.util.dd.Mgr = /**@lends CC.util.dd.Mgr*/{
/**
 * ���򻺴�
 * @protected
 */
        zmCache : {root:new CC.util.d2d.RectZoom()},

/**
 * ���ؾ���
 * @param {String} name ��������
 * @param {String} parent �������,����ò���Ϊ�ǿ�,����name��δ����,�򴴽�һ�����򲢷��ظ���
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
 * �����Ϸ������С,��X������,��С��delta x������delta x,
 * ��Y������,��С��delta y������delta y, ������������Ϊ
 * [max_delta_x, min_delta_x, max_delta_y, min_delta_y],
 * �����϶������,�����������Ϊ��������,Ҳ���ǲ����ص�
 * component.drag����,����,��drag�����ڵĲ������ǰ�ȫ��.
 * �����������ϷŽ��������.
 * @type Array
 */
        setBounds : function(arr){
          bounds = arr;
          return this;
        },

/**
 * �����������
 * @return {Array} [MAX_DX,MIN_DX,MAX_DY,MIN_DY]
 */
        getBounds : function(){
          return bounds;
        },
/**
 * ���ظ���
 * @return {CC.util.d2d.RectZoom}
 */
        getRoot : function(){
          return this.zmCache.root;
        },
/**
 * ���������Ƴ�����Ϊname����
 * @param {String} name
 * @return {CC.util.d2d.RectZoom} �����Ƴ�����
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
 * ���ؼ�����name��
 * @param {CC.Base} �ؼ�
 * @param {String} name ������
 * @return this
 */
        addComp : function(comp, k){
          k = this.$(k, true);
          k.add(new CC.util.d2d.ComponentRect(comp));
          return this;
        },
/**
 * �ؼ��Ƴ���
 * @param {CC.Base} �ؼ�
 * @param {String} name ������
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
 * ��ö����϶���ʼʱ�������
 * @return {Array} [x, y]
 */
        getIMXY : function(){
          return IXY;
        },
/**
 * ��ö����϶���ʼʱ��������
 * @return {Array} [x,y]
 */
        getIEXY : function(){
          return IEXY;
        },

/**
 * ���������϶��������x,y����ƫ����
 * @return {Array} [dx, dy]
 */
        getDXY : function(){
          return DXY;
        },
/**
 * ��õ�ǰ���λ��
 * @return {Array} [x,y]
 */
        getXY : function(){
          return PXY;
        },
/**
 * ��õ�ǰ�϶��Ķ���
 * @return {CC.Base}
 */
        getSource : function(){
          return dragEl;
        },
/**
 * ��õ�ǰλ���·��Ķ���,�����,����null
 * @return {CC.Base}
 */
        getTarget : function(){
          return onEl;
        },

/**
 * ���µ�ǰ�϶�zoom
 * @return this
 */
    update : function(){
      if(zoom)
        zoom.update();
      return this;
    },

/**
 * ���ؼ���װ���϶�����,��װ��ؼ�component����
 * component.draggable = true;
 * ���������ؼ�view��㴥���϶��¼�,������component.dragNode
 * ָ���������.
 * @param {CC.Base} component
 * @param {Boolean} install ��װ��ȡ����װ
 * @param {HTMLElement} �����¼��Ľ��,���������c.dragNode
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
 * �Ƿ��Ϸ���
 * @return {Boolean}
 */
        isDragging : function(){
          return ing;
        },
/**
 * ���ؼ���Ҫresizeʱ����,���Դ���resize��ص��ڲ��ӳ��,��ֹ��������resize������,��iframe
 * @name CC.util.dd.Mgr.resizeHelper
 * @class
 */

        resizeHelper : /**@lends CC.util.dd.Mgr.resizeHelper*/{

          resizeCS : 'g-resize-ghost',

          maskerCS : 'g-resize-mask',
/**
 * @property {CC.Base} layer ӳ���,ֻ��,������applyLayer�������ֱ������
 */

/**
 * @property {CC.Base} masker ҳ���ڲ�,ֻ��,������applyMasker�������ֱ������
 */

/**
 * ��resize��ʼ�����ʱ����
 * @param {Boolean} apply
 */
          applyResize : function(b){
            this.resizing = b;
            this.applyLayer(b);
            this.applyMasker(b);
          },
/**
 * �Ƿ�Ӧ��ӳ���
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
 * �������Ƴ�ҳ���ڲ�,��resize�϶�������ʼʱ,����һ��ҳ���ڲ�,
 * �Է�ֹ��iframe����������Ӱ��resize
 * @param {Boolean} cor �������Ƴ�ҳ���ڲ�
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
* @property {String|HTMLElement} dragNode �����ؼ��϶���ʼ�Ľ�����ID
*/

/**
* @name CC.Base#dragZoom
* @property {String} dragZoom ���û��ȡ�ؼ�Ŀ���Ϸ���������(��)
* ֻ�пؼ��Ѱ�װ�϶����ܸ����ò���Ч
* @see #installDrag
*/

/**
* �Ƿ�װ����Ϸ�Ч��
* @function
* @param {Boolean} true | false
*/
    installDrag : function(b){
      mgr.installDrag(this, b);
      return this;
    },
/**
* ���drag & drop ������
* @return {CC.util.dd.Mgr}
*/
    getDDProvider : function(){
      return mgr;
    },

/**
 * ����Ѱ�װ�Ϸ�,
 * ��������갴��ʱ����
 * @type function
 */
    beforedrag : fGo,
/**
 * ����Ѱ�װ�Ϸ�
 * �϶���ʼʱ����
 * @type function
 */
    dragstart : fGo,
/**
 * ����Ѱ�װ�Ϸ�,
 * ����������ɿ�ʱ����,�϶�����������
 * @type function
 */
    dragend : fGo,
/**
 * ����Ѱ�װ�Ϸ�,
 * ����������ɿ�ʱ����,�϶���һ��������
 * @type function
 */
    afterdrag : fGo,
/**
 * ����Ѱ�װ�Ϸ�,
 * ����������϶�ʱ����
 * @type function
 */
    drag : fGo,

/**
 * ����Ѽ����Ϸ���,
 * ������Ŀ�����ʱ����
 * @type function
 */
    sbover : fGo,
/**
 * ����Ѽ����Ϸ���,
 * ������Ŀ���뿪ʱ����
 * @type function
 */
    sbout : fGo,
/**
 * ����Ѽ����Ϸ���,
 * ������Ŀ�궪��ʱ����
 * @type function
 */
    sbdrop : fGo,
/**
 * ����Ѽ����Ϸ���,
 * ������Ŀ���ƶ�ʱ����
 * @type function
 */
    sbmove : fGo
  });
  
  CC.ui.def('base', function(opt){
    return CC.Base.create(opt);
  });
})();