CC.util.ProviderFactory.create('Selection', null, function(father){

  var Event = CC.Event;

  var trackerOpt = { isValid :  function (item){
    return !item.hidden && !item.disabled;
  }};

  return /**@lends CC.util.SelectionProvider#*/{
/**
 * 当前选择模式(单选,多选),默认单选
 */
  mode : 1,

  tracker : false,

  UP : Event.UP,

  DOWN : Event.DOWN,

  selectedIndex : -1,
/**
 * 子项选择后是否滚动到容器可视范围内,默认为true
 */
  autoscroll : true,
/**
 * 选择后是否聚焦,默认为true
 */
 autoFocus : true,
/**
 * @property {String} selectedCS 子项选择时子项样式
 */
  selectedCS: 'selected',

/**
 * 允许选择
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
 * @param {Boolean} cancelscroll
 */
 setSelected : function(item, b, cancelscroll, /**@inner*/e){
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
 * @protected
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

/**@protected*/
 defKeyNav : fGo,

/**
 * @name CC.util.SelectionProvider#t
 * @property {ContainerBase} t target目标容器
 * @protected
 */

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
 * @param {Boolean} b
 */
 select : function(item, cancelscroll, /**@inner*/e){

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
 * 选择前发出,为空选时不发出
 * @name CC.ui.ContainerBase#select
 * @event
 * @param {CC.Base} item
 * @param {Boolean}  b
 */


/**
 * 选择后发出,为空选时不发出
 * @name CC.ui.ContainerBase#selected
 * @event
 * @param {CC.Base} item
 * @param {CC.util.SelectionProvider} selectionProvider
 * @param {DomEvent} event 如果该选择事件由DOM事件触发,传递event
 */

/**
 * 选择后发出,为空选时不发出
 * @name CC.util.SelectionProvider#forceSelect
 * @property {Boolean} [forceSelect=false] 强制发送select事件,即使当前子项已被选中
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
 * @name CC.ui.Item#onselect 子项被选择时调用
 * @property {Function} onselect
 */
 onSelect : function(item, cancelscroll) {
  if(this.autoFocus)
   this.t.wrapper.focus();

  if(!cancelscroll && this.autoscroll)
      item.scrollIntoView(this.t.getScrollor());
  item.onselect && item.onselect();
 },

/**
 * @name CC.util.SelectionProvider#selected 当前被选择子项,如果多选模式,最后一个被选中选项
 * @property {CC.Base} selected
 */

/**
 * @name CC.util.SelectionProvider#previous 前一个被选择子项
 * @property {CC.Base} previous
 */

/**
 * 选择变更时发出,包括空选择
 * @name CC.ui.ContainerBase#selectchange
 * @event
 * @param {CC.Base} item
 * @param {CC.Base}  pre
 * @param {CC.util.SelectionProvider} provider
 */
/**@protected*/
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
 * 容器是否可选择
 * @return {Boolean}
 */
 isSelectable : function(){
  return !this.unselectable;
 },
/**
 * 容器是否可选择
 */
 setSelectable : function(b){
  this.unselectable = !b;
 },

/**
 * 检测item是否能作为下一个选择项
 * @return {Boolean}
 */
 canNext : function(item){
  return !item.disabled && !item.hidden;
 },

/**
 * 检测item是否能作为上一个选择项
 * @return {Boolean}
 */
 canPre : function(item){
  return !item.disabled && !item.hidden;
 },

 /**
  * @protected
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

/**@protected*/
 selectAllInner : function(b){
  var s = this;
  this.t.each(function(){
    s.setSelected(this, b, true);
  });
 },

/**
 * 全选/全不选
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
 selectOpp : function(b) {
  var s = this;
  this.t.each(function(){
    s.setSelected(this, !s.isSelected(this), false);
  });
 }

 }
});