﻿CC.Tpl.def('CC.ui.Foldable', '<div class="g-foldable"><div class="g-foldablewrap"><b title="隐藏" id="_trigger" class="icos icoCls"></b><div id="_tle"></div></div></div>');
/**
 * @class CC.ui.Foldable
 * @extends CC.Base
 */

CC.create('CC.ui.Foldable', CC.Base, {

    clsGroupCS: 'g-gridview-clsview',

    unselectable: true,
   
   //指定收缩结点的displayMode:''或block
   //nodeBlockMode:1,
    initComponent: function(){
        this.createView();
        CC.Base.prototype.initComponent.call(this);
        this.domEvent('click', this.foldView, true, null);
        if (this.array) {
            this.target.fromArray(this.array);
            delete this.array;
        }
    },
/**
 * 收缩内容区域.
 * @param {Boolean} foldOrNot
 */
    foldView: function(b){
        var f = CC.fly(this.foldNode ? this.target.dom(this.foldNode) : this.target.ct || this.target);
        //
        // b如果用在domEvent的回调中,就是Event对象!
        //
        if (b !== true && b !== false)
            b = !f.display();
        if (this.fire('expand', this, b) === false) {
            f.unfly();
            return;
        }
    //
    if(this.nodeBlockMode !== undefined)
      f.setBlockMode(this.nodeBlockMode);
        f.display(b).unfly();
        if (this.target.shadow)
            this.target.shadow.reanchor();
        this.dom('_trigger').title = b ? '隐藏' : '展开';
        this.checkClass(this.clsGroupCS, !b);
        this.expanded = b;
        this.fire('expanded', this, b);
        return this;
    },

    brush: function(v){
        if (this.target.children)
            return '<strong>' + v + '</strong><span id="_view_span">(<strong><a id="_view_cnt" href="javascript:fGo();">' + this.target.size() + '</a></strong>)</span>';
        return v;
    }
});
CC.ui.def('foldable', CC.ui.Folderable);