/**
 * @class CC.util.d2d
 * 平面2D相关类库
 */
 CC.util.d2d = {};
/**
 * @class CC.util.d2d.Point
 * 点类,描述平面空间上的一个点
 * @cfg {Number} x x坐标
 * @cfg {Number} y y坐标
 * @constructor
 * @param {Number} x x坐标
 * @param {Number} y y坐标
 */
  CC.util.d2d.Point = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
  };

/**
 * @class CC.util.d2d.Rect
 * 矩形类,l,t,w,h<br>
 * <pre><code>
    var rect  = new CC.util.d2d.Rect(left, top, width, height);
    var rect2 = new CC.util.d2d.Rect([left, top, width, height]);
   </code></pre>
 * @param {Array|Number} data 传入一个数组或left, top, width, height
 * @constructor
 */
  CC.util.d2d.Rect = function(l, t, w, h){
    var len = arguments.length;
    if(len === 4){
      this.l = l || 0;
      this.t = t || 0;
      this.w = w || 0;
      this.h = h || 0;
    }else {
      this.l = l[0];
      this.t = l[1];
      this.w = l[2];
      this.h = l[3];
    }
    
    this.valid = true;
  };

  CC.extend(CC.util.d2d.Rect.prototype, {
    valid : true,
/**
 * @cfg {Boolean} valid 指示矩形数据是否有效，无效的数据将忽略对矩形的各种检测.
 */
/**
 * @cfg {Number} l left值
 */
    l : 0,
/**
 * @cfg {Number} t top值
 */
    t : 0,
/**
 * @cfg {Number} w width值
 */
    w: 0,
/**
 * @cfg {Number} h height值
 */
    h : 0,
/**
 * 判断点p是位于矩形内.
 * @param {CC.util.Point} 点
 * @return {Boolean}
 */
    isEnter : function(p){
      if(this.valid){
        var x = p.x, y = p.y;
  
        x =    x>=this.l && x<=this.l+this.w &&
               y>=this.t && y<=this.t+this.h;
        return x ? this : false;
      }
      return false
    },
    

/**
 * qd, quadrant 缩写，计算指定点所属矩形的象限，调用前请确保点已落在矩形上。
 * <br> 返回值： 0 - 8;
 * 象限所在X，Y轴正向与屏幕坐标系正方向一致。
 *  ________ x+
 *    |
 *  2 |  1
 *   y+
 <div class="mdetail-params"><ul>
 <li>0:原点</li>
 <li>1 - 4 : 1-4象限</li>
 <li>5 - 8 原点为中心，x, y四条轴，其中5为x正轴，其它类推。</li>
 <li>bool</li>
 <li>date</li>
 </ul></div>
 * @param {Number} x
 * @param {Number} y
 * @return {Number}
 */
    qdAt : function(x, y){
        // assert(this.isEnter({x:x, y:y}));
        var dx = Math.floor(x - this.l - this.w/2),
            dy = Math.floor(y - this.t - this.h/2);
        
        if(dx > 0){
            if(dy>0) 
                return 1;
            else if(dy<0) return 4;
            else return 5;
        }else if(dx < 0){
            if(dy>0)
                return 2;
            else if(dy<0)
                return 3;
            else return 7;
        }else { // dx = 0
            if(dy > 0)
                return 6;
            else if(dy < 0)
                return 8;
            return 0; 
        }
    },
    
/**
 * 接口,刷新矩形缓存数据,默认为空调用
 * @method
 */
    update : fGo,
/**
 * @return  this.valueOf() + ''
 */
    toString : function(){
      return this.valueOf() + '';
    },
/**
 * @return [this.l,this.t,this.w,this.h]
 */
    valueOf : function(){
      return [this.l,this.t,this.w,this.h];
    }
  });

/**
 * @class CC.util.d2d.RectZoom
 * 矩域, 由多个矩形或矩域组成树型结构,
 * 矩域大小由矩形链内最小的left,top与最大的left+width,top+height决定.
 * @extends CC.util.d2d.Rect
 * @constructor
 * @param {Array} rects 由矩形数组创建矩域
 */
  CC.create('CC.util.d2d.RectZoom', CC.util.d2d.Rect, function(father){

   var Math = window.Math, max = Math.max, min = Math.min;

   return {
/**
 * 父层矩域
 * @type {CC.util.d2d.RectZoom}
 */
     pZoom : null,
/**
 * @private
 * @param {Array} rects 包含CC.util.Rect实例的数组
 */
     initialize : function(opt){
       this.valid = true;
       if(opt) CC.extend(this, opt);
       var rects = CC.delAttr(this, 'rects');
       this.rects = [];
       if(rects){
         for(var i=0,len=rects.length;i<len;i++){
            this.add(rects[i]);
         }
       }
        // 跳过prototype
        //this.isEnter = this.isEnter;
      },


/**@interface*/
      prepare : fGo,
      
/**
 * 返回域内所有矩形, 返回的并不是矩形的复制,
 * 而是实例内所有矩形的引用,所以对返回矩形数据的修改也就是对矩域内矩形数据的修改.
 * @return {Array} rects
 */
      getRects : function(){
        return this.rects;
      },

/**
 * 矩形加入矩域
 * @param {CC.util.d2d.Rect} rect
 * @param {Boolean} update 加入后是否重新计算域数据
 */
      add : function(r, update){
        if(r.pZoom)
          r.pZoom.remove(r);

        this.rects.push(r);
        if(update)
          this.update();
        r.pZoom = this;
        return this;
      },
/**
 * 矩形移出矩域
 * @param {CC.util.d2d.Rect} rect
 * @param {Boolean} update 移出后是否重新计算域数据
 */
      remove : function(r, update){
        delete r.pZoom;
        this.rects.remove(r);
        if(update)
          this.update();
        return this;
      },
/**
 * 是否包含某矩形(域),深层检测
 * @param {CC.util.d2d.Rect} rect
 * @return {Boolean}
 */
      contains : function(r){
        var c = false, ch;
        for(var i=0,rs=this.rects,len=rs.length;i<len;i++){
          ch = rs[i];
          if(ch === r){
            c = this;
            break;
          }
          if(ch.contains){
            c = ch.contains(r);
            if(c)
              break;
          }
        }
        return c;
      },

  /**
   * 检测点是否位于当前矩形链中,如果点已进入范围,点所在的矩形
   * @param {CC.util.d2d.Point} point
   * @return [Boolean|CC.util.d2d.Rect] false或矩形类
   */
      isEnter : function(p){
        //先大范围检测
        if(this.valid && father.isEnter.call(this, p)){
          var i, rs = this.rects, len = rs.length, rt;
          for(i=0;i<len;i++){
            rt = rs[i].isEnter(p);
            if(rt){
              return rt;
            }
          }
       }
       return false;
      },

  /**@private*/
      union : function(){
        var i, rs = this.rects, len = rs.length, r;
        var t1=[], t2=[], x1=[], x2=[];
        if(len === 0){
          t1 = t2 = x1 = x2 = 0;
        }else{
          for(i=0;i<len;i++){
              r = rs[i];
              t1.push(r.t);
              t2.push(r.t+r.h);
              x1.push(r.l);
              x2.push(r.l+r.w);
          }
          x1 = min.apply(Math, x1);
          x2 = max.apply(Math, x2);
          t1 = min.apply(Math, t1);
          t2 = max.apply(Math, t2);
        }
        this.l = x1;
        this.t = t1;
        this.w = x2 - x1;
        this.h = t2 - t1;
     },
/**
 * 刷新计算域数据。具体操作为：1.清空原有矩域；2.调用prepare方法；3.调用子矩域update方法，依次更新每个子矩域数据。
 * @override
 */
     update : function(){
      this.clear();
      this.prepare();
      var i, rs = this.rects, len = rs.length;
      for(i=0;i<len;i++){
        rs[i].update();
      }
      this.union();
     },
/**
 * @interface
 */
     clear : fGo
   };

  });
  
/**
 * @class CC.util.d2d.ComponentRect
 * 组件封装后的矩形
 * @extends CC.util.d2d.Rect
 * @constructor
 * @param {CC.Base} component 与矩形关联的控件
 */
 
/**
 * @property comp 
 * 该区域对应的控件
 * @type CC.ui.Base
 */
 
  CC.create('CC.util.d2d.ComponentRect', CC.util.d2d.Rect, {
/**
 * @property z 
 * zIndex值
 * @type Number
 */
    z : -1,
/**
 * @property ownRect
 * 如果控件已注册拖放区域,引用指向封装该控件的矩形CC.util.d2d.ComponentRect.<br>
 * 该属性是由{@link CC.util.d2d.ComponentRect}类引入的.
 * @type {CC.util.d2d.ComponentRect}
 * @member CC.Base
 * @constructor
 * @param {CC.Base} component binding component
 * @param {Boolean} autoUpdate 是否立即更新矩形数据,默认false.
 */
    initialize : function(comp, autoUpdate){
      this.comp = comp;
      this.valid = true;
      comp.ownRect = this;
      if(autoUpdate) this.update();
    },

/**
 * 刷新矩形缓存数据.
 * @override
 */
    update : function(){
      if(this.hidden){
        this.l = this.t = this.w = this.h = 0;
        this.z = -1;
      } else {
        var c = this.comp,
            sz = c.getSize(),
            xy = c.absoluteXY();
        this.z = c.getZ();
        this.l = xy[0];
        this.t = xy[1];
        this.w = sz.width;
        this.h = sz.height;
      }
    },
/**
 * 解除与控件关联
 */
    destory : function(){
      delete this.comp.ownRect;
      this.comp = null;
    }
  });