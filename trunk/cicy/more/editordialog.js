/**
 * Javascript Utility for web development.
 * 反馈 : www.cicyui.com/forum
 * @mailto javeejy@126.com
 * www.cicyui.com ? 2010 - 构建自由的WEB应用
 */

/**
 * @class CC.ui.form.EditorDialog
 * 文本编辑器对话框
 */
 
/**
 * @cfg editor
 */
 
/**
 * @property editor
 */
 
CC.create('CC.ui.form.EditorDialog', CC.ui.Dialog, {
	
	layout:'card',
	modal : true,
	buttons : [
		{title:'确 定', id:'ok'},
		{title:'取 消', id:'cancel'}
	],
	
	initComponent : function(){
		CC.ui.Dialog.prototype.initComponent.call(this);
		this.editor = CC.ui.instance(CC.extend(this.editor, { ctype:'rtext' }));
		this.add(this.editor);
	},
	
	//
	
	focus : function(){
		this.editor.focus();
		return this;
	},
	
	getValue : function(){
		return this.editor.getValue();
	},
	
	setValue : function(){
		this.editor.setValue();
		return this;
	},
	
	active : function(){
		this.show(null ,true);
	},
	
	onok : function(){
		this.setContexted(false);
    this._navNext(true);
	},
	
	oncancel : function(){
		this._navNext(false);
	},
	
	_navNext : function(apply){
		this.setContexted(false);
		var editingCell = this.bindingCell;
		if(editingCell){
			var edition = editingCell.pCt.pCt.grid.edition;
			edition.endEdit(editingCell, apply);
			var next = edition.getNextEditableBlock(
				editingCell.pCt, 
				editingCell.pCt.indexOf(editingCell)
		  );
		  
		  if(next)
		  	edition.startEdit(next);
		}
	},
	
	onContextRelease : function(){
		// 表格编辑时自定义关闭
		return false;
	},
	
	// override
	getText : function(){
		return this.editor.getValue();
	},
	
	setText : function(t){
		this.editor.setText(t);
		return this;
	}
});

CC.ui.def('editordlg', CC.ui.form.EditorDialog);