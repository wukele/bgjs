CC.create('CGridGroupView', CGridView, function(father) {
  return {
    
    template: 'CGridView',
    
    initComponent: function() {
      father.initComponent.call(this);
      this.foldbar = new CFoldable({target:this, foldNode:this.container.parentNode});
      this.view.insertBefore(this.foldbar.view, this.view.firstChild);
    },
    
    render: function() {
      father.render.call(this);
      this.foldbar.setTitle(this.title);
    },
    
    destoryComponent:function(){
    	this.foldbar.destoryComponent();
    	father.destoryComponent.call(this);
    }
  };
});