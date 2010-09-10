/**
 * @class CC.ui.Foldable
 * @extends CC.Base
 */

/**
 * @cfg {String} nodeBlockMode 指定收缩结点的blockMode:''或block, 参见{@link CC.Base#blockMode}
 */

/**
 * @cfg {String|HTMLElement} foldNode 指定模板中收缩结点或结点ID
 */
 
/**
 * @cfg {Function} getTarget 定义收缩的控件
 */
CC.Tpl.def('CC.ui.Foldable', '<div class="g-foldable"><div class="g-foldablewrap"><b title="隐藏" id="_trigger" class="icos icoCls"></b><div><strong id="_tle"></strong></div></div></div>');

CC.create('CC.ui.Foldable', CC.Base, {

    clsGroupCS: 'g-gridview-clsview',

    unselectable: true,
   
    initComponent: function(){
        CC.Base.prototype.initComponent.call(this);
        this.domEvent('click', this.onTrigClick, true, null);
    },
    
    getTarget : function(){
       if(!this.target.cacheId)
        this.target = CC.Base.find(this.target);
       return this.target;
    },
    
    onTrigClick : function(){
        this.fold(!this.getTarget().hidden);
    },
/**
 * 收缩内容区域.
 * @param {Boolean} foldOrNot
 */
    fold: function(b){
        var t = this.getTarget();
        
        if (this.fire('expand', this, b) !== false) {
            t.display(!b);
            this.dom('_trigger').title = b ? '隐藏' : '展开';
            this.checkClass(this.clsGroupCS, b);
            this.expanded = b;
            this.fire('expanded', this, b);
        }
        //
        return this;
    }
});
CC.ui.def('foldable', CC.ui.Foldable);