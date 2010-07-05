CC.create('CC.ui.grid.plugins.RowChecker', null, {
   
   name : 'rowchecker',
   
   cell :  {
      title:'&nbsp;',
      maxW : 20,
      minW : 20,
      resizeDisabled : true,
      id : 'rowCheckerCol',
      dataCol : false,
      checkedCS : 'g-check-checked',
      cellBrush: function(){
        return '<span class="g-checkbox g-form-el"><img class="chkbk" src="'+CC.Tpl.BLANK_IMG+'"></span>';
      },
      
      brush : function(){
        return '<span class="g-checkbox g-form-el" title="全选/反选"><img class="chkbk" src="'+CC.Tpl.BLANK_IMG+'"></span>';
      },
      
      //添加全选反选事件
      onRender : function(){
        this.superclass.onRender.call(this);
        this.domEvent('click', function(){
          var sp = this.pCt.pCt.content.getSelectionProvider();
          var sel = this.selected = !this.selected;
          this.checkClass(this.checkedCS, sel);
          if(sp.mode === 0)
            sp.selectAll(sel);
        });
      }
   },
   
   initialize : function( opt ){
      var cell = CC.extend({}, this.cell);
      if(opt){
        if(opt.cell) {
          CC.extend(cell, CC.delAttr('cell', opt));
        }
        CC.extend(this, opt);
      }
      
      this.grid.header.array && this.grid.header.array.insert(0, cell);
   },
   
   gridEventHandlers : {
  	 afteraddcontent : function(ct){
  	   ct.on('selectchange', function(current, previous, selProvider){
  	       var cell = current.getCell('rowCheckerCol');
  	       var col  = ct.grid.header.$('rowCheckerCol');
   	       cell.checkClass(col.checkedCS, selProvider.isSelected( current ));
   	       if(previous){
   	         var preCell = previous.getCell('rowCheckerCol');
   	         preCell.checkClass(col.checkedCS, selProvider.isSelected( previous ));
   	       }
   	   });
  	}
   }
});

CC.ui.grid.plugins.RowChecker.WEIGHT = CC.ui.grid.plugins.RowChecker.prototype.weight = CC.ui.grid.Header.WEIGHT - 2;

CC.ui.def('gridrowchecker', CC.ui.grid.plugins.RowChecker);