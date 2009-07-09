//Default Framework Plugins

//Tab Plugins
UI126.registerPlugin('addNorthPanel', (function(northPanel){
		this.tab = new CTab({cs:'fr-tab'});
		northPanel.add(this.tab);
		this.fire('addTab', this.tab);
}));

//Left Folder UI Plugins
UI126.registerPlugin('addWestPanel', (function(westPanel){
		this.titlePanel = new CTitlePanel({title:'文件夹'});
		this.folder = CUtil.createFolder();
		this.titlePanel.add(this.folder);
		westPanel.add(this.titlePanel,'center');
		this.fire('addFolder', this.folder);
		this.tree = new CTree({title:'部门组织'});
		this.titlePanel.add(this.tree);
		this.fire('addTree', this.tree);
}));


UI126.registerPlugin('addEastPanel',(function(eastPanel){
//tree combox
   //tree filter for combox
			function treeFilter(matcher, caller){
			  var caller = caller || window, fn = arguments.callee;
			  if(this.children){
			  	var cm = true;
	        CC.each(this.children, (function(){
	            if(!matcher.call(caller,this) && !this.nodes){
	                this.display(0);
	                cm = false;
	                return;
	            }
	            this.display(1);
	            if(this.nodes && this.expanded)
	            	fn.call(this, matcher, caller);
	        }));
      	}
			}
//selector of combox
var tree = new CTree({title:'tree2', url:'/q?bg_q=test_group', autoConnect:true, shadow:false, showTo:document.body, hidden:true,filter:treeFilter});
var cb = new CCombox({id:'eastCombox', selectorCS:'g-combo-list g-combo-list-tree', autoRender:false,selector:tree, width:350});
//tree will be destoryed when combox destoryed. 
cb.follow(tree);
eastPanel.add(cb);

//folderview
var ct = new CContainerBase({ItemClass: CFolderView});

ct.connect('/q?bg_q=bg_uidemolist', {method:'GET'});
 
 ct.on('final',function(ajax){
		 CC.each(this.children, (function(){
			 //更新标题,显示数目
			 this.foldable.setTitle(this.title);
 }));
});
 
eastPanel.add(ct);
}));

//增加一个插件,主要功能是增加各TAB ITEM显示IFRAME
//IFRAME src在tabitem中设置
UI126.registerPlugin('addTab', (function(tab) {
    var fr = this;
    tab.on('selected', (function(item) {
      if (!item.panel && item.src) {
        item.panel = new CIFramePanel({
          src: item.src
        });
        //添加到中间面板去
        fr.centerPanel.add(item.panel);
      }
    }));
}));


//
// 增加其它项控件
//
UI126.registerPlugin('rendered', (function(){
			//增加TAB项,IFRAME例子.
			this.tab.fromArray([
			{title:'126', src:'http://www.126.com'},
			{title:'百度', src:'http://www.baidu.com'},
			{title:'禁用', disabled:true},
			{title:'google', src:'http://www.google.com'}
			]);
			
			//增加其它显示项,只是为了显示,没实质内容.
			this.folder.fromArray([
					{title:'背光脚本',icon:'icoNote'},
	  			{title:'disabled item',icon:'icoIbx',disabled:true},
					{title:'粉红色',icon:'icoDft'},
					{title:'蓝色',icon:'icoNote'},
					{title:'清除记录',icon:'icoDel'},
					{title:'粉红色',icon:'icoDft'},
					{title:'蓝色',icon:'icoNote'},
					{title:'清除记录',icon:'icoDel'}
			]);
			this.tree.autoConnect = true;
			this.tree.url = '/q?bg_q=test_group';
			this.tree.root.fromArray([
				{title:'背光脚本', nodes:true, array:[
					{title:'背光脚本'},
					{title:'126邮箱'},
					{title:'Google'},
					{title:'Ajaxian', disabled:true}
				]},
				{title:'百度'},
				{title:'谷歌'}
			]);
}));

//
// 增加中间面板主界面
//
UI126.registerPlugin('rendered', (function(){
	var panel = new CPanel({container:false, layout:'row',view:Cache.get('div')});
	//toolbar
	var onToolbarClick = function(item){CUtil.alert(item.title);};
	var tb = CPanel.createBigBar({array:[
			{icon:'iconCalendar',title:'小强旺财'},
			{icon:'iconUser',title:'用户名单'},
			{icon:'iconEdit',title:'编辑黑名单'},
			{icon:'iconRef',title:'立即启动',disabled:true}
	]});
	tb.on('selected',onToolbarClick);
	
	panel.add(tb);
	var opt = {createCustomComponent : function(){this.customComp = CC.$$(CC.$C('DIV'));}};
	var g = new CGrid({
		header:[
		    new CCustomColumn(),
				{title:'名称'},
				{title:'数目', disabled:true},
				{title:'分类'},
				{title:'column D'},
				{title:'column E'}
			]
		,
		autoFit:true
	});
	
	var v1 = new CGridGroupView({
		title : '收件箱',
		rowHoverCS:false,
		ItemClass : CCustomRow,
		itemOptions : opt
	});
	g.add(v1);
	
	v2 = new CGridGroupView({
		title : '发件箱',
		selectedCS:false,
		ItemClass : CCustomRow
	});
	g.add(v2);
	panel.add(g);
	
	this.centerPanel.add(panel);
	this.tab.insert(0, new CTabItem({title:'综合', panel:panel, id:'grid_tab'}));
	this.tab.on('selected',function(item){
		//在CFolderView标题中更新行数
		function onfinal(){
			this.foldbar.setTitle(this.foldbar.title);
		}
		
		if(item.id == 'grid_tab'){
			if(!v1.loaded){
				v1.on('final',onfinal);
				v1.connect("http://www.bgscript.com/q?bg_q=grid_view_data");
			}
			if(!v2.loaded){
				v2.on('final',onfinal);
				v2.connect("http://www.bgscript.com/q?bg_q=grid_view_data2");
			}
			if( v1.loaded && v2.loaded){
				this.un('selected', arguments.callee);
			}
		}
	});
}));