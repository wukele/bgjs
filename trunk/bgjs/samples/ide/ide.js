CC.create('IDE', CViewport, function(father) {
  return {
    //BorderLayout布局
    layout: 'border',

    id: 'IDE',

    loadFramework: function() {
      var self = this;
      //如果存在插件
      if (IDE.plugins) {
        CC.each(IDE.plugins, (function() {
          if (CC.isArray(this)) {
            self.on(this[0], this[1]);
          } else this(self);
        }));
        //release plugins.
        IDE.plugins = null;
      }
      //创建主要布局 - 东西北中
      this.northPanel = new CPanel({
        id: 'frameworkNorthPanel',
        view: 'frameworkNorthPanel',
        height: 70,
        maxH: 70
      });
      this.westPanel = new CPanel({
        id: 'frameworkWestPanel',
        view: 'frameworkWestPanel',
        width: 191,
        maxW: 450,
        layout: 'border'
      });
      this.eastPanel = new CPanel({
        id: 'frameworkEastPanel',
        view: 'frameworkEastPanel',
        width: 180,
        layout: 'row'
      });
      this.centerPanel = new CPanel({
        id: 'frameworkCenterPanel',
        view: 'frameworkCenterPanel',
        layout: 'row'
      });
      this.add(this.northPanel, {
        dir: 'north',
        gap: 0
      });
      this.fire('addNorthPanel', this.northPanel);
      this.add(this.eastPanel, {
        dir: 'east',
        split: true,
        gap: 7
      });
      this.fire('addEastPanel', this.eastPanel);
      this.add(this.westPanel, {
        dir: 'west',
        split: true,
        gap: 7
      });
      this.fire('addWestPanel', this.westPanel);
      this.add(this.centerPanel, 'center');
      this.fire('addCenterPanel', this.centerPanel);
    },

    destoryComponent: function() {
      this.fire('destory');
      father.destoryComponent.call(this);
    }
  };
});

(function() {
  var views_cache = {};
  var prpty_view_cache = {};
  
  CC.extend(IDE, {
    /**
		* 注册IDE插件
		*/
    registerPlugin: function(pln, c) {
      if (!IDE.plugins) IDE.plugins = [];
      if (CC.isFunction(pln)) {
        IDE.plugins.push(pln);
      } else {
        IDE.plugins.push([pln, c]);
      }
    },
    /**
	   * 保存控件类配置信息
	   */
    compCfgs: {},

    /**
	   * 注册控件类信息
	   */
    registerComponentCfg: function(clazzType, cfg) {
      IDE.compCfgs[clazzType] = cfg;
    },
    
    getViewByProperty : function(cfg){
    	return prpty_view_cache[cfg];
    },
    
    getPropertyView: function(cfg, title) {
      if (!prpty_view_cache[cfg]) {
        prpty_view_cache[cfg] = new CAttributeView({
          title: title + '属性',
          propertySet: cfg
        });
        this.propertyGrid.add(prpty_view_cache[cfg]);
      }
      return prpty_view_cache[cfg];
    },
		
		getPropertyGrid : function(){
			if(!this.propertyGrid){
				this.propertyGrid = new PropertyGrid({
				header:[
						{title:'名称'},
						{title:'键值'}
					],
				autoFit : true,
				id:'ide-prpty-grid'
			});
			this.initPropertyGridBehavior();
			}
			return this.propertyGrid;
		},
		
		initPropertyGridBehavior : function(){
			var g = this.propertyGrid;
			g.on('cellclick', function(cell){
				var row = cell.parentContainer;
				if(cell != row.valueCell)
					return;
				//如果为属性列,并在配置中具有编辑器,激活
				var cfg = row.vsProperty;
				if(cfg.activeEditor){
					cfg.activeEditor(g.bindingComponent);
				}
			});
		},
    
    getBindingComponent : function(){
    	return this.propertyGrid.bindingComponent;
    },
    
    getComponentPropertyViews: function(comp) {
      var ss = views_cache['__vs_cls_views_' + comp.type];
      if (ss) return ss;

      var cfg, p = comp;
      ss = [];
      while (p) {
        cfg = IDE.compCfgs[p.type];
        if (cfg) {
        	cfg = cfg.attr;
          if (!prpty_view_cache[cfg]) 
          	ss.push(this.getPropertyView(cfg,p.type));
          else ss.push(prpty_view_cache[cfg]);
        }
        p = p.superclass;
      }
      views_cache['__vs_cls_views_' + comp.type] = ss;
      return ss;
    }
  });
})();

/**
 * 初始化入口
 */
function globalLoadReady() {

  //
  // 创建AnchorBox类和实例
  //
  var AnchorBox = CC.create(CXResizer, function(superclass) {
    return {
      showTo: document.body,
      hidden: true,
      autoRender: true,
      ondropable: true,
      navKeyEvent: true,

      initComponent: function() {
        superclass.initComponent.call(this);

      },

      anchorTo: function(comp) {
        if (this.anchorComp == comp) {
          return;
        }
        if (this.fire('boxanchor', comp) === false) {
          return;
        }
        this.preanchorComp = this.anchorComp;
        this.anchorComp = comp;
        (function() {
          this.focus();
        }).bind(this).timeout(0);
        this.fire('boxanchored', comp);
      },

      beforeVsCompDragStart: fGo,

      //
      // 进入范围
      //
      dragVsCompOver: function(vsComp, target, evt) {
        Event.stop(evt);
        return false;
      },
      //
      //拖出
      //
      dragVsCompOut: function(vsComp, target, evt) {
        Event.stop(evt);
        return false;
      },

      //
      // 拖动中
      //
      dragVsComp: function(vsComp, evt) {

},

      //
      // 放开
      //
      dropVsComp: function(vsComp, target, evt) {

},
      //
      // 放开后
      //
      afterDropVsComp: fGo,

      /**
		   * 拖曳响应
		   */
      dragSBOver: function(sb, evt) {
        if (this.anchorComp) {
          if (sb.type == 'ComponentTreeItem') return this.dragVsCompOver(sb, this.anchorComp, evt);
        }
      },

      dragSBOut: function(sb, evt) {
        if (this.anchorComp) {
          if (sb.type == 'ComponentTreeItem') return this.dragVsCompOut(sb, this.anchorComp, evt);
        }
      },

      SBDrop: function(sb, evt) {
        if (this.anchorComp) {
          if (sb.type == 'ComponentTreeItem') return this.dropVsComp(sb, this.anchorComp, evt);
        }
      }
    };
  });

  var anchorBox = new AnchorBox({
    id: 'ide-anchorbox'
  });

  CUtil.getAnchorBox = function() {
    return anchorBox;
  }

  /**
	 * 注册默认的anchorBox事件处理
	 */
  anchorBox.on('reposed', function(a, b) {
    //this.anchorComp.setXY(a, b);
  });

  anchorBox.on('resized', function(a, b) {
    //this.anchorComp.setSize(a, b);
  });

  /**
	 * 定位控件时,设置控件与anchorBox关联
	 */
  anchorBox.on('boxanchored', function(comp) {
    //避免发送事件
    var f = CC.fly(this.view);
    f.setXY(comp.absoluteXY());
    f.setSize(comp.getSize());
    f.unfly();
    //
    this.display(true);
    //
    this.maxH = comp.maxH;
    this.minH = comp.minH;
    this.minW = comp.minW;
    this.maxW = comp.maxW;

  });

  //创建IDE实例
  var VS = window.VS = new IDE({
    anchorBox: anchorBox
  });
  VS.loadFramework();
  VS.render();

  //VS.centerPanel.add(new CButton({__bgcfg:{},title:'你好'}));
  CUtil.startMode();
  var w = new CWin({
    autoRender: true,
    showTo: document.body
  });
  w.setXY(100, 100);

	  	var fieldCombo = new CCombox({id:'mycombo', value:'combox can be dropped..', array:[
				{title:'粉绿色',icon:'icoIbx'},
				{title:'粉红色',icon:'icoDft'},
				{title:'蓝色',icon:false},
				{title:'清除记录',icon:'icoDel' ,disabled:true},
				{title:'粉红色',icon:'icoDft'},
				{title:'蓝色',icon:'icoNote'},
				{title:'清除记录',icon:'icoDel'}
			]});
//			var chk = new CCheckbox({title:'check this one!'});
//			var rad = new CRadio({title:'check this one!'});
			var layer = new CFormLayer({id:'aa', array:[
				{title:'Text area Here!', array:[{ctype:'textarea', name:'aa',id:'myarea',value:'Write some words here!'}]},
				{title:'Text field Here', array:[{id:'bb',title:'Text field Here!', ctype:'text'},
					{id:'bb',title:'Text field Here!', ctype:'radio'},{id:'bb',title:'Text field Here!', ctype:'checkbox'}]},
				{title:'Text field Here', array:[fieldCombo]},
				{title:false, array:[{ctype:'button', title:'Button'},{ctype:'button', title:'登录'}]}
			]});
	w.add(layer);
	
  w = new CWin({
    autoRender: true,
    showTo: document.body
  });
  w.setXY(400, 100);
  var tree1 = new CTree({
    title: 'Tree1'
  });
  tree1.root.fromArray([{
    title: 'disabled item',
    nodes: true,
    disabled: true
  },
  {
    title: 'B'
  },
  {
    title: 'C',
    nodes: true
  }]);

  tree1.root.$(2).fromArray([{
    title: 'disabled A',
    nodes: true,
    disabled: true
  },
  {
    title: 'B',
    disabled: true
  },
  {
    title: 'items',
    nodes: true
  }]);
  w.add(tree1);
  CUtil.endMode();
}