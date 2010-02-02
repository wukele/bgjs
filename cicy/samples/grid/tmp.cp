<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; " /> 
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <script type="text/javascript" src="../../cicylib-all-debug.js"></script>
  <link rel="stylesheet" href="../../default/global.css" type="text/css"/>
  <link rel="stylesheet" href="flexigrid.css" type="text/css"/>
  <link rel="stylesheet" href="../resources/example.css" type="text/css"/>
<style>
	body {overflow:hidden;}
</style>
</head>
<body>
	
</body>
</html>
<script>
	CC.Tpl.def('CC.ui.GridPanel', '<div class="flexigrid"></div>');
	CC.Tpl.def('CC.ui.grid.Header', 
	      '<div class="hDiv">',
	        '<div class="hDivBox">',
	          '<table cellspacing="0" cellpadding="0"><colgroup id="_colGrp"></colgroup>',
	          '<tr></tr></thead></table></div></div>');
	CC.Tpl.def('CC.ui.grid.DataView', '<div class="bDiv" style="height: auto;"><table cellspacing="0" cellpadding="0" border="0" class="flexme2 autoht" style="display: table;"><tbody><tr><td><div style="text-align: left; width: 100px;">This is data 1 with overflowing content</div></td><td><div style="text-align: left; width: 100px;">This is data 2</div></td><td><div style="text-align: left; width: 322px;">This is data 3</div></td><td><div style="text-align: left; width: 300px;">This is data 4</div></td></tr></tbody></table><div class="iDiv" style="display: none;"></div></div>');

CC.create('CC.ui.grid.AbstractHeader', CC.ui.ContainerBase, function(F){

return {
	  
	  initComponent : function(){
			this.cols = [];
			F.initComponent.call(this);
	  },

/**
 * @field
 * @type Function
 */
	  colRenderer : function(v){
	  	return v;
	  },
/**
 * @param {Number} idx
 * @return {Function}
 */
		getColRenderer : function(idx){
			var r = this.cols[idx].renderer;
			return r?r:this.colRenderer;
		},
		
		setColRenderer : function(idx, fn){
			this.cols[idx].renderer = fn;
		},
		
		getColCount : function(){
			return this.colCount;
		},
		
		refreshView : function(){
			
		},
		
		setColWidth 
		
};
});

CC.Tpl.def('CC.ui.grid.Column', '<th><div>Column</div></th>');

CC.create('CC.ui.grid.Column', {
/**
 * @
 */
	renderer : null,
	
	initialize : function(opt){
		CC.extend(this, opt);
		this.initColumn();
	},
	
	initColumn : fGo,
	
	setRenderer : function(fn){
		this.renderer = fn;
	},
	
	setContentEl : function(contentEl){
		this.el = contentEl;
	},
	
	getContentEl : function(){
		return this.contentEl;
	}
});

CC.ready(function(){
	var gp = CC.Base.create({template:'CC.ui.GridPanel'});
	var hd = CC.Base.create({template:'CC.ui.grid.Header'});
	var dv = CC.Base.create({template:'CC.ui.grid.DataView'});
	
	gp.view.appendChild(hd.view);
	gp.view.appendChild(dv.view);
	
	CC.$body.append(gp);
});
</script>