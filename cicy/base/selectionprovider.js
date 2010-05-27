/**
 * @class CC.util.SelectionProvider
 * 为容器提供子项选择功能,子项是否选择的检测是一个 -- 由子项样式状态作向导的实时检测.
 * @extends CC.util.ProviderBase
 */
CC.util.ProviderFactory.create('Selection', null, function(father){

  var Event = CC.Event;

  var trackerOpt = { isValid :  function (item){
    return !item.hidden && !item.disabled;
  }};

  return {
/**
 * @cfg {Number} mode 当前选择模式(1单选,0多选),默认单选
 */
  mode : 1,
/**@cfg {Boolean} tracker 是否应用选择跟踪器*/
  tracker : false,
  
/**@cfg {Number} UP 定义"向上"的按键值*/
  UP : Event.UP,
  
/**@cfg {Number} DOWN 定义"向下"的按键值*/
  DOWN : Event.DOWN,
  
/**@cfg {Number} selectedIndex 当前选择项下标*/
  selectedIndex : -1,
/**
 * @cfg {Boolean} autoscroll 子项选择后是否滚动到容器可视范围内,默认为true
 */
  autoscroll : true,
  
/**
 * @cfg {Boolean} autoFocus 选择后是否聚焦,默认为true
 */
 autoFocus : true,
/**
 * @cfg {String} selectedCS=selected 子项选择时子项样式
 */
  selectedCS: 'selected',
/**
 * @property selected
 * 当前选择项,如果多选模式,最后一个被选中选项.
 * @type {CC.Base}
 */
 
/**
 * @property previous
 * 上一选择项
 * @type {CC.Base}
 */
 
/**
 * @cfg {Boolean} unselectable 是否允许选择
 */
  unselectable : false,

  initialize : function(){
    father.initialize.apply(this, arguments);
    if(this.tracker === true)
      this.tracker = new CC.util.Tracker(trackerOpt);
  },
/**
 * mode可选,1 | 0,设置时将清除现有选择
 */
 setMode : function(m){
  this.selectAll(false);
  this.mode = m;
  return this;
 },

 setTarget : function(ct){
  
  if(ct.keyEvent === undefined)
      ct.bindKeyInstaller();
      
  father.setTarget.apply(this, arguments);
  
  ct.on('itemclick', this.itemSelectionTrigger, this)
    .on('keydown',   this.navigateKey, this)
    .on('remove',   this.onItemRemoved, this);
  
  if(this.selected !== undefined){
    var t = this.selected;
    delete this.selected;
    this.select(t);
  }
 },
/**
 * @param {CC.Base} item
 * @param {Boolean} selectOrNot
 * @param {Boolean} cancelscroll
 */
 setSelected : function(item, b, cancelscroll, e){
  if(b)
    this.select(item, cancelscroll, e);
  else this.unselect(item);

  return this;
 },

/*@private**/
 itemSelectionTrigger : function(it, e){
  //TODO:|| !Event.isLeftClick(e)
  // 在IE下,即使是左击,但event.button还是为0,很奇怪
  if(!this.unselectable){
    //this.decorateSelected(it, !this.isSelected(it));
    if(this.mode)
      this.select(it, false, e);
    else this.setSelected(it, !this.isSelected(it), false, e);
  }
 },

/**
 * 当子项移除时提示选择器更新状态
 * @private
 **/
 onItemRemoved : function(item){
  if(item === this.selected){
    this.decorateSelected(item, false);
    this.select(null);
  }else if(item === this.previous)
    this.previous = null;

  if(this.tracker)
    this.tracker.remove(item);
 },

/**
 * 重载该方法可以定义按键导航
 * @private
 */
 navigateKey : function(e){
   var kc = e.keyCode;
   if (kc === this.UP) {
    this.pre();
    Event.stop(e);
   } else if (kc === this.DOWN) {
    this.next();
    Event.stop(e);
   } else return this.defKeyNav(e);
 },

/**@private*/
 defKeyNav : fGo,

/**
 * 获得容器当前选区, 该操作会重新检测当前选择项
 * @return {Array}
 */
 getSelection : function(){
  var s = this, sn = [];
  s.t.each(function(){
    if(s.isSelected(this)){
      sn.push(this);
    }
  });
  return sn;
 },

/**
 * 修饰选择时子项外观CSS, 重写该方法以自定子项选择时修饰方
 * @param {CC.Base} item
 * @param {Boolean} b
 */
 decorateSelected : function(item, b){
  var s = this.selectedCS;
  if(s)
  	item.checkClass(s, b);
 },

/**
 * 选择某子项
 * @param {CC.Base} item
 * @param {Boolean} cancelscroll
 */
 select : function(item, cancelscroll, e){

  if(this.unselectable || this.disabled)
    return this;

  var t = this.t;

  if(!t.rendered){
    t.on('rendered', function(){
      t.selectionProvider.select(item);
    });
    return this;
  }

  item = this.t.$(item);

  // select none
  if(!item)
    return this.selectAll(false);

  if(item.disabled)
    return this;

/**
 * @event select
 * 选择前发出,为空选时不发出
 * @param {CC.Base} item
 * @param {Boolean}  b
 */


/**
 * @event selected
 * 选择后发出,为空选时不发出
 * @param {CC.Base} item
 * @param {CC.util.SelectionProvider} selectionProvider
 * @param {DOMEvent} event 如果该选择事件由DOM事件触发,传递event
 */

/**
 * @cfg {Boolean} forceSelect 是否强制发送select事件,即使当前子项已被选中.<br>
 * 默认是当某项选中后,再次选择并不触发selected事件,可强制设定即使已选时是否发送.
 */
  if((this.forceSelect || !this.isSelected(item))
      && this.t.fire('select', item, this, e) !== false){
    this.onSelectChanged(item, true, e);
    this.onSelect(item, cancelscroll ,e);
    this.t.fire('selected', item, this, e);
  }
  return this;
 },

 unselect : function(item){
  item = this.t.$(item);
  this.onSelectChanged(item, false);
  return this;
 },
 
/**
 * @cfg {Function} onselect 该属性由{@link CC.util.SelectionProvider}类处理,当项选中时,调用本方法.
 * @member CC.Base
 */
 onSelect : function(item, cancelscroll) {
  if(this.autoFocus)
   this.t.wrapper.focus();

  if(!cancelscroll && this.autoscroll)
      item.scrollIntoView(this.t.getScrollor());
  item.onselect && item.onselect();
 },

/**
 * 选择变更时发出,包括空选择.
 * @event selectchange
 * @param {CC.Base} item
 * @param {CC.Base}  previous
 * @param {CC.util.SelectionProvider} provider
 */
 
/**@private*/
 onSelectChanged : function(item , b){
  if(!this.hasChanged(item, b))
    return;

  var s = this.selected,
      pre = this.previous;

  if(item)
    this.decorateSelected(item, b);

  if(this.mode){
    if(b){
      if(s)
        this.decorateSelected(s, false);
      this.previous = s;
      this.selected = item;
      this.selectedIndex = this.t.indexOf(item);
    }else if(item === s){
      this.selected = null;
      this.selectedIndex = -1;
    }
  }
  else {
    if(b){
      this.previous = s;
      this.selected = item;
    }else if(s === item){
      // -> unselect
      // selected -> unselect,
      this.previous = null;
      this.selected = pre;
    }else if(item === pre && pre){
      //unselect pre
      this.previous = null;
    }
  }

  if(this.tracker && s && b)
    this.tracker.track(s);

  this.t.fire('selectchange', item, s, this);
  if(__debug){  console.group("selectchanged data"); console.log('当前选择:',this.selected);console.log('前一个选择:',this.previous); console.groupEnd();}
 },

/**
 * 测试选择项状态是否改变
 * @private
 */
 hasChanged : function(item, b){
  return !((item === this.selected) && b) || !(item && this.isSelected(item) === b);
 },

/**
 * 测试某子项是否已被选择
 * @param item
 * @return {Boolean}
 */
 isSelected : function(item){
  return item.hasClass(this.selectedCS);
 },

/**
 * 容器是否可选择.
 * @return {Boolean}
 */
 isSelectable : function(){
  return !this.unselectable;
 },
/**
 * 设置容器是否可选择
 */
 setSelectable : function(b){
  this.unselectable = !b;
 },

/**
 * 检测item是否能作为下一个选择项.
 * @param {CC.Base} item
 * @return {Boolean}
 */
 canNext : function(item){
  return !item.disabled && !item.hidden;
 },

/**
 * 检测item是否能作为上一个选择项
 * @param {CC.Base} item
 * @return {Boolean}
 */
 canPre : function(item){
  return !item.disabled && !item.hidden;
 },

 /**
  * @private
  * 获得当前用于计算下|上一选项的下标,默认返回当前选项项selectedIndex
  */
 getStartIndex : function(){
  return this.selectedIndex;
 },

 /**
  * 获得下一个可选择项,如无可选择项,返回null
  * @return {CC.Base} item 下一个可选择项
  */
 getNext : function(){
  var idx = this.getStartIndex() + 1,
      cs  = this.t.children,
      len = cs.length;

  while (idx <= len - 1 && !this.canNext(cs[idx])) idx++;

  if (idx >= 0 && idx <= len - 1) {
    return cs[idx];
  }
  return null;
 },

 /**
  * 获得上一个可选择项,如无可选择项,返回null
  * @return {CC.Base} item 上一个可选择项
  */
 getPre : function(){
  var idx = this.getStartIndex() - 1,
      cs  = this.t.children,
      len = cs.length;

  while (idx >= 0 && !this.canPre(cs[idx])) idx--;

  if (idx >= 0 && idx <= len - 1) {
    return cs[idx];
  }
  return null;
 },

/**
 * 选择并返回下一项,如无返回null
 */
 next : function(){
  var n = this.getNext();
  if(n)
    this.select(n);
  return n;
 },

/**
 * 选择并返回前一项,如无返回null
 */
 pre : function(){
  var n = this.getPre();
  if(n)
    this.select(n);
  return n;
 },

/**@private*/
 selectAllInner : function(b){
  var s = this;
  this.t.each(function(){
    s.setSelected(this, b, true);
  });
 },

/**
 * 全选/全不选
 * @param {Boolean}
 */
 selectAll : function(b){
  if(this.mode && !b){
    if(this.selected)
      this.unselect(this.selected);

    return this;
  }
  this.selectAllInner(b);
  return this;
 },

/**
 * 反选
 */
 selectOpp : function() {
  var s = this;
  this.t.each(function(){
    s.setSelected(this, !s.isSelected(this), false);
  });
 }

 }
});