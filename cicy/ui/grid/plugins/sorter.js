/**
 * @cfg {Boolean} sortable 属性来自{@link CC.ui.grid.plugins.Sorter},
 * 表示是否允许排序该列，默认为undefined。当值为undefined时，
 * 如果列为{@link CC.ui.grid.Column.dataCol}，允许对该列排序，否则不允许排序。
 * @member CC.ui.grid.Column
 */

/**
 * @cfg {Boolean} sortable 属性来自{@link CC.ui.grid.plugins.Sorter},
 * 表示是否允许排序表格，默认为true, false时关闭表格排序功能.
 * @member CC.ui.Grid
 */
 
/**
 * @cfg {Boolean} dt 属性来自{@link CC.ui.grid.plugins.Sorter},
 * 指明当前列的数据类型，可选类型有 string|bool|float|int|date, 参见{@link CC.util.TypeConverter}可注册自定义的数据类型
 * @member CC.ui.grid.Column
 */
 
/**
 * @property order 属性来自{@link CC.ui.grid.plugins.Sorter},表示当前列的排序方式，'asc','desc'或undefined。
 * @type String
 * @member CC.ui.grid.Column
 */
 
CC.ui.Grid.prototype.sortable = true;
CC.ui.grid.Column.prototype.sortable = undefined;
CC.ui.grid.Column.prototype.order    = undefined;
CC.ui.grid.Column.prototype.dt       = undefined;

/**
 * @class CC.ui.grid.plugins.Sorter
 * 一个列辅助排序插件。
 */

/**
 * @cfg {String} trigEvent 排序触发事件，默认为click
 */
 
/**
 * @cfg {String} order 首次排序方式[asc, desc]，默认为降序, desc.
 */
 
/**
 * @cfg {String} dt 默认列数据类型为string
 */
 
CC.create('CC.ui.grid.plugins.Sorter', null, {
  
  trigEvent : 'click',
  
  order : 'desc',
  
  dt : 'string',
  
  initialize : function(opt){
    CC.extend(this, opt);
  },

  gridEventHandlers : {
    afteraddheader : function(hd){
      if(this.grid.sortable)
        hd.itemAction(this.trigEvent, this.onColClick, false, this);
    }
  },
  
  onColClick : function(col){
    if(col.sortable || (col.sortable === undefined && col.dataCol)){
      var order = 
            col.order === undefined ? 
              this.order :
              col.order === 'desc' ? 'asc':'desc';

      this.sort(col, order);
    }
  },
  
  sort : function(col, order){
    var idx = col.pCt.indexOf(col), 
        dt  = col.dt === undefined ? this.dt:col.dt, 
        comparator = col.comparator ? 
          col.comparator : CC.util.TypeConverter.getComparator(dt);
      
    if(this.grid.fire('sortcol', col, idx, order, comparator) !== false){
      var pre = this.preSorted;
      if(pre)
        pre = CC.Base.byCid(pre);
      
      if(pre && pre !== col){
          // reset order
          pre.order = undefined;
      }
      
      this.preSorted = col.cacheId;

      col.order = order;
      col.sortDecorator(order, pre);
      this.grid.fire('sortcolend', col, idx, order, pre);
    }
  }
});

CC.ui.def('gridsorter', CC.ui.grid.plugins.Sorter);

CC.ui.Grid.prototype.plugins.push({name:'sorter', ctype:'gridsorter'});

/**
 * @event sortcol
 * 发送排序某列请求
 * @param {CC.ui.grid.Column} sortCol
 * @param {Number} colIndex
 * @param {String} order order asc or desc.
 * @param {String} comparator use this comparator to compare two column values.
 * @member CC.ui.Grid
 */
 
/**
 * @event sortcolend
 * 排序某列后发送
 * @param {CC.ui.grid.Column} sortCol
 * @param {Number} colIndex
 * @param {String} order order asc or desc.
 * @param {CC.ui.grid.Column} previous sorted column if existed.
 * @member CC.ui.Grid
 */
