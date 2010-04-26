CC.Tpl.def('CC.ui.Foldable', '<div class="g-foldable"><div class="g-foldablewrap"><b title="����" id="_trigger" class="icos icoCls"></b><div id="_tle"></div></div></div>');
/**
 * @name CC.ui.Foldable
 * @class
 * @extends CC.Base
 */

CC.create('CC.ui.Foldable', CC.Base, /**@lends CC.ui.Foldable#*/{

    clsGroupCS: 'g-gridview-clsview',

    unselectable: true,
  /**
   * @property nodeBlockMode ָ����������displayMode:''��block
   */
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
 * @param {Boolean} foldOrNot
 */
    foldView: function(b){
        var f = CC.fly(this.foldNode ? this.target.dom(this.foldNode) : this.target.ct || this.target);
        //
        // b�������domEvent�Ļص���,����Event����!
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
        this.dom('_trigger').title = b ? '����' : 'չ��';
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