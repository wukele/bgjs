/**
 * @class CC.layout.TablizeLayout
 * 只有一行的table布局,主要用于toolbar的布局,使得任何类型的元素排列的都比较整齐.
 * 也常用于form布局,当需要并排表单组件时,此布局就能派上用场了.
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.TablizeLayout', CC.layout.Layout, {

  attach : function(ct){
  	var self = this;
    this.tableEl = CC.Tpl.forNode('<table class="g-ly-tablize"><tr id="_tr"></tr></table>');
	  this.trEl = CC.$('_tr', this.tableEl);
	  
    ct._addNode = function(nd){
     var td = CC.$C('TD');
     td.className = 'tblly-td';
     td.appendChild(nd);
     self.trEl.appendChild(td);
    };
    ct.wrapper.append(this.tableEl);
    CC.layout.Layout.prototype.attach.apply(this, arguments);
  },

  add : function(c){
    CC.layout.Layout.prototype.add.apply(this, arguments);
    if(c.lyInf && c.lyInf.separator){
      this.addSeparator();
      delete c.lyInf.separator;
    }
  },
    
  onLayout : function(){
    if(!this.layouted){
      this.layouted = true;
	    CC.layout.Layout.prototype.onLayout.apply(this, arguments);
    }
  },
/**
 * 添加分隔条.
 */
  addSeparator : function(){
  	var td = CC.$C({
  	  tagName:'TD',
  	  innerHTML:'<span class="tblly-sep"> | </span>',
  	  className:'tblly-td'
  	});
    this.trEl.appendChild(td);
  }
});
CC.layout.def('tablize', CC.layout.TablizeLayout);