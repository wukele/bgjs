CC.util.ProviderFactory.create('Selection', null, function(father){

  var Event = CC.Event;

  var trackerOpt = { isValid :  function (item){
    return !item.hidden && !item.disabled;
  }};

  return /**@lends CC.util.SelectionProvider#*/{
/**
 * ��ǰѡ��ģʽ(��ѡ,��ѡ),Ĭ�ϵ�ѡ
 */
  mode : 1,

  tracker : false,

  UP : Event.UP,

  DOWN : Event.DOWN,

  selectedIndex : -1,
/**
 * ����ѡ����Ƿ�������������ӷ�Χ��,Ĭ��Ϊtrue
 */
  autoscroll : true,
/**
 * ѡ����Ƿ�۽�,Ĭ��Ϊtrue
 */
 autoFocus : true,
/**
 * @property {String} selectedCS ����ѡ��ʱ������ʽ
 */
  selectedCS: 'selected',

/**
 * ����ѡ��
 */
  unselectable : false,

  initialize : function(){
    father.initialize.apply(this, arguments);
    if(this.tracker === true)
      this.tracker = new CC.util.Tracker(trackerOpt);
  },
/**
 * mode��ѡ,1 | 0,����ʱ���������ѡ��
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
  // ��IE��,��ʹ�����,��event.button����Ϊ0,�����
  if(!this.unselectable){
    //this.decorateSelected(it, !this.isSelected(it));
    if(this.mode)
      this.select(it, false, e);
    else this.setSelected(it, !this.isSelected(it), false, e);
  }
 },

/**
 * �������Ƴ�ʱ��ʾѡ��������״̬
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
 * ���ظ÷������Զ��尴������
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
 * @property {ContainerBase} t targetĿ������
 * @protected
 */

/**
 * ���������ǰѡ��, �ò��������¼�⵱ǰѡ����
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
 * ����ѡ��ʱ�������CSS, ��д�÷������Զ�����ѡ��ʱ���η�
 * @param {CC.Base} item
 * @param {Boolean} b
 */
 decorateSelected : function(item, b){
  var s = this.selectedCS;
  if(s)
  	item.checkClass(s, b);
 },

/**
 * ѡ��ĳ����
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
 * ѡ��ǰ����,Ϊ��ѡʱ������
 * @name CC.ui.ContainerBase#select
 * @event
 * @param {CC.Base} item
 * @param {Boolean}  b
 */


/**
 * ѡ��󷢳�,Ϊ��ѡʱ������
 * @name CC.ui.ContainerBase#selected
 * @event
 * @param {CC.Base} item
 * @param {CC.util.SelectionProvider} selectionProvider
 * @param {DomEvent} event �����ѡ���¼���DOM�¼�����,����event
 */

/**
 * ѡ��󷢳�,Ϊ��ѡʱ������
 * @name CC.util.SelectionProvider#forceSelect
 * @property {Boolean} [forceSelect=false] ǿ�Ʒ���select�¼�,��ʹ��ǰ�����ѱ�ѡ��
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
 * @name CC.ui.Item#onselect ���ѡ��ʱ����
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
 * @name CC.util.SelectionProvider#selected ��ǰ��ѡ������,�����ѡģʽ,���һ����ѡ��ѡ��
 * @property {CC.Base} selected
 */

/**
 * @name CC.util.SelectionProvider#previous ǰһ����ѡ������
 * @property {CC.Base} previous
 */

/**
 * ѡ����ʱ����,������ѡ��
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
  if(__debug){  console.group("selectchanged data"); console.log('��ǰѡ��:',this.selected);console.log('ǰһ��ѡ��:',this.previous); console.groupEnd();}
 },

/**
 * ����ѡ����״̬�Ƿ�ı�
 */
 hasChanged : function(item, b){
  return !((item === this.selected) && b) || !(item && this.isSelected(item) === b);
 },

/**
 * ����ĳ�����Ƿ��ѱ�ѡ��
 * @param item
 * @return {Boolean}
 */
 isSelected : function(item){
  return item.hasClass(this.selectedCS);
 },

/**
 * �����Ƿ��ѡ��
 * @return {Boolean}
 */
 isSelectable : function(){
  return !this.unselectable;
 },
/**
 * �����Ƿ��ѡ��
 */
 setSelectable : function(b){
  this.unselectable = !b;
 },

/**
 * ���item�Ƿ�����Ϊ��һ��ѡ����
 * @return {Boolean}
 */
 canNext : function(item){
  return !item.disabled && !item.hidden;
 },

/**
 * ���item�Ƿ�����Ϊ��һ��ѡ����
 * @return {Boolean}
 */
 canPre : function(item){
  return !item.disabled && !item.hidden;
 },

 /**
  * @protected
  * ��õ�ǰ���ڼ�����|��һѡ����±�,Ĭ�Ϸ��ص�ǰѡ����selectedIndex
  */
 getStartIndex : function(){
  return this.selectedIndex;
 },

 /**
  * �����һ����ѡ����,���޿�ѡ����,����null
  * @return {CC.Base} item ��һ����ѡ����
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
  * �����һ����ѡ����,���޿�ѡ����,����null
  * @return {CC.Base} item ��һ����ѡ����
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
 * ѡ�񲢷�����һ��,���޷���null
 */
 next : function(){
  var n = this.getNext();
  if(n)
    this.select(n);
  return n;
 },

/**
 * ѡ�񲢷���ǰһ��,���޷���null
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
 * ȫѡ/ȫ��ѡ
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
 * ��ѡ
 */
 selectOpp : function(b) {
  var s = this;
  this.t.each(function(){
    s.setSelected(this, !s.isSelected(this), false);
  });
 }

 }
});