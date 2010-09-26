(function(){

var ly = CC.layout;
var B =  ly.Layout;
var superclass = B.prototype;
var Math = window.Math;
var Base = CC.Base;
/**
 * @class CC.layout.CardLayout
 * CardLayout,容器内所有子项宽高与容器一致.<br>
 <pre><code>
   new CC.ui.Win({
     // 使得子项iframepanel布满整个window客户区域.
     layout:'card',
     items : [
       {ctype :'iframe', src:'http://www.cicyui.com' }
     ]
   });
 </code></pre>
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.CardLayout', B, {
  wrCS : 'g-card-ly-ct',
  layoutChild : function(item){
    var sz = this.ct.wrapper.getContentSize(true);
    if(!item.rendered)
    	Base.prototype.setSize.apply(item, sz);
    else item.setSize(sz[0], sz[1]);
  }
});

ly.def('card', ly.CardLayout);

/**
 * @class CC.layout.QQLayout.LayoutInf
 * 控件用于QQ布局的配置信息，本类实际不存在，方便描述。
 * 配置信息位于控件的{@link CC.Base#lyInf}属性中。
 */
/**
 * @cfg {Boolean} collapsed 是否收缩控件。
 */

/**
 * @class CC.layout.QQLayout
 *  
 <pre><code>
 			var win = new CC.ui.Win({
				layout:'qq',
				title:'QQ布局管理器',
				width:190,
				height:450,
				itemCls:'titlepanel',
				lyCfg : {
					items : [
					 {ctype:'titlepanel',title:'我的好友', array:[
	  					{ctype:'folder',
	  					 selectionProvider : {mode:0},
	  					 array:[
				  			{title:'disabled item',icon:'iconRef',disabled:true},
								{title:'粉红色',icon:'iconUser'},
								{title:'蓝色',icon:'iconEdit'},
								{title:'清除记录',icon:'iconLeaf'},
								{title:'粉红色',icon:'iconTabs'},
								{title:'蓝色',icon:'iconUser'},
								{title:'清除记录',icon:'iconEdit'}
	  	         ]
	  				 }
	  			]},
					 {title:'陌生人'},
					 {title:'黑名单'}
					]
				},
				showTo:document.body
			});
      win.render();
      win.layout.collapse(win.$(0), false);
		});
 </code></pre>
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.QQLayout', B, {

    wrCS : 'g-card-ly-ct',

    beforeAdd : function(comp, cfg){
      comp.fastStyleSet('position', 'absolute')
          .setLeft(0);

      if(cfg && cfg.collapsed === false){
        comp.collapse(false);
        this.frontOne = comp;
      }else {
        comp.collapse(true);
      }
      superclass.beforeAdd.apply(this, arguments);
    },

    onLayout : function(){
      superclass.onLayout.apply(this, arguments);
      var c = this.frontOne,
          ct = this.ct,
          ch = ct.wrapper.height,
          cw = ct.wrapper.width,
          i, it, t,j,
          its = ct.children,
          len = ct.size();
      //由上而下
      for(i=0, t = 0;i<len;i++){
        it = its[i];

        if(it.hidden)
          continue;

        if(it == c)
          break;

        it.setBounds(false, t, cw, it.minH);
        ch -= it.height;
        t += it.height;
      }

      if(c)
        c.setTop(t);
      //由下而上
      for(j=len-1, t = ct.wrapper.height;j>i;j--){
        it = its[j];
        t -= it.minH;
        it.setBounds(false, t, cw, it.minH);
        ch -= it.height;
      }

      if(c)
        c.setSize(cw, ch);
    },
/**
 * @param {CC.Base} component
 * @param {Boolean} collapseOrNot
 */
    collapse : function(comp, b){
      var cfg = comp.lyInf,fr = this.frontOne;

      if(cfg.collapsed !== b){
        if(fr && fr !== comp){
          if(fr.collapse)
            fr.collapse(true);
          fr.lyInf.collapsed = true;
        }

        if(comp.collapse)
          comp.collapse(b);

        cfg.collapsed = b;
        this.frontOne = b?null:comp;
        this.doLayout();
        this.ct.fire('collapsed', comp, b);
      }
    }
});

ly.def('qq', ly.QQLayout);


/**
 * @class CC.layout.RowLayout.LayoutInf
 * 本类并不存在，用于说明基于RowLayout类容器子项布局配置的信息。
 */

/**
 * @cfg {String|Number} h 设置组件高度信息，'auto','lead'，默认'auto'。
 * <div class="mdetail-params"><ul>
 * <li>auto:每次布局时利用component.getHeight()方法获得高度</li>
 * <li>lead:等待其它非lead组件高度信息确定后，再来计算组件高度。最终组件高度是容器剩下高度的均值。</li>
 * <li>Number值:大于或等于1时为高度值，小于1时为相对容器高度百分比，最终获得的高度将应用到组件的高度。</li>
 * </ul></div>
 */

/**
 * @cfg {Number} w 设置组件宽度信息，可以为整型或浮点值。
 * 大于或等于1时被作为宽度应用到组件宽；小于1时被告作为相对容器宽度百分比应用到宽；
 * 未设置时将保持组件宽度与容器宽度一致。
 */

/**
 * @class CC.layout.RowLayout
 * 行布局,该布局将对子控件宽度/高度进行布局,不干预控件坐标.
 * <br>
  <pre><code>
var win = new CC.ui.Win({
  showTo:document.body,
  layout:'row',
  lyCfg:{
    items:[
    {ctype:'base', template:'<div />', cs:'fix', css:'h:50', strHtml:'fixed height'},
    {ctype:'base', template:'<div />', cs:'lead',strHtml:'lead',lyInf:{h:'lead'}},
    ]
  }
});
win.render();
  </code></pre>
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.RowLayout', B, {
    wrCS : 'g-row-ly',
    onLayout: function() {
      var wr = this.ct.wrapper, 
	      w = wr.getWidth(true),
          h = wr.getHeight(true),
          i,len, it, 
		  its = this.ct.children, 
		  cfg, 
		  ty = this.type, 
		  iv,
          //y direction
		  leH = [], 
		  leW = [];

	  for(i=0,len=its.length;i<len;i++){
        it = its[i];
		
        if(it.hidden)
          continue;

        cfg = it.lyInf;
        switch(cfg.h){
          case 'auto' :
          case undefined :
		    // render to get correct height
            if(!it.rendered)
				it.render();
				
			h-=it.getHeight();
            break;
          case 'lead' :
            leH[leH.length] = it;
            break;
          default :
            iv = cfg.h;
            if(CC.isNumber(iv)){
              if(iv>=1){
                it.setHeight(iv);
                //may be maxH reached.
                h-=it.height
              }else if(iv>=0){
                iv = Math.floor(iv*h);
                it.setHeight(iv);
                //may be maxH reached.
                h-=it.height;
              }
            }
        }
        var fw = cfg.w;
        if(fw === undefined){
          it.setWidth(w);
        }
        else if(fw < 1){
          it.setWidth(Math.floor(fw*w));
        }
       }

       for(i=0,len=leH.length;i<len;i++){
          it = leH[i];
          cfg = it.lyInf;
          iv = cfg.len;
          if(CC.isNumber(iv)){
              iv = Math.floor(iv*h);
              it.setHeight(iv);
              h-=it.height
          }else {
            iv = Math.floor(h/(len-i));
            it.setHeight(iv);
            h-=it.height;
          }
       }

      for(i=0,len=its.length;i<len;i++){
        it = its[i];
        if (!it.rendered) it.render();
      }
    }
});

ly.RowLayout.prototype.layoutChild = ly.RowLayout.prototype.onLayout;

ly.def('row', ly.RowLayout);

/**
 * @class CC.layout.TableLayout
 * 用HTML TABLE元素布局控件,主要用于表单设计中,
 * 布局信息用JSON表示,通过 lyCfg:{  items:  } 传入.
 * items为一个数组,数组每个元素代表一行(tr).
 * 每一行的数据格式可为一个数组或一个object
 * 
 *  行为数组时,数组中每个元素表示每个单元(td)<br>
 *  行为object时,表示该行只有一个单元格,可以在object中定义td,tr的属性信息, object.td = {}, object.tr = {}<br>
 * 当一个配置信息既无ctype属性,亦无td属性时被看作是该行tr的信息
 * <br>

 <pre>
 <code>
var win = new CC.ui.Win({
  showTo:document.body,
  layout:'table',
  lyCfg:{
    // 设置table结点的class样式
    tblCs : 'form_tbl',
    // 设置每个分组的信息
  	group:{ 
  		cols:2,
  		// 第一个colgroup结点的信息
  		0 : {css:'w:120', cs:'hgrp'} 
  	},
  	
    items:[
      //  row one
      [ 
        { 
          // cell one
          ctype:'label', 
          title:'提交请求:', 
          // td结点的信息
          td:{css:'tr', cs:'cap'}
        },
         // cell two
        {ctype:'text',  width:120, value:'提交请求:'}
      ],
      // row two
      { 
        ctype:'text', css:'w:100%', 
        // td.colspan = 2
        td:{cols:2}
      },
      
      [
        // 占位td
        false, 
        // tr信息
        {cs:'tr-row'}, 
        {td:{css:'h:33'}}
      ],
      // row with single cell , no component
      {tr:{cs:'tr-end'}, td:{cols:2}}
    ]
  }
});
 </code></pre>
 * @extends CC.layout.Layout
 */

/**
 * @property tableEl
 * @type HTMLElement
 */
/**
 * @cfg {String} tblCs class name of main table node
 */

CC.create('CC.layout.TableLayout', B, {

	attach : function(ct){
		// cache the items
	  this._items = ct.lyCfg && ct.lyCfg.items;
	  // 自由添加结点到容器
	  ct._addNode = ct._removeNode = fGo;
	  superclass.attach.apply(this, arguments);
	},
	
	//override
  fromArray : function(items){
    // 将items的json行列所有数据存到单一的数组中,由父类fromArray载入
    // 未定义ctype的配置作为非实体控件配置处理
    var len = items.length, i, j, as, news = [], tds = [];
    for(i=0;i<len;i++){
      as = items[i];
      if(CC.isArray(as)){
        for(j=0;j<as.length;j++){
          if(as[j] && as[j].ctype){
            news.push(as[j]);
          }   
        }
      }else if(as && as.ctype){
        news.push(as);
      }
    }
    superclass.fromArray.call(this, news);
    news = null;
  },

/**
 * 一次性布局,生成table表
 * @private
 */
	onLayout : function(){
		if(!this.layouted){
			superclass.onLayout.apply(this, arguments);
			
			this.layouted = true;
			
			var tbl = this.tableEl;
			var tb = this.tableEl = CC.$C('TABLE');
			var c = this.ct;
			
			tb.className = 'g-ly-tbl';
			
			if(this.tblCs){
			  CC.fly(tb).addClass(this.tblCs).unfly();
			  delete this.tblCs;
			}
			
			// 应用table结点配置
			if(tbl)
			  Base.applyOption(tb, tbl);
			
			// 创建col结点信息
			if(this.group){
				var g = this.group;
				var gn = CC.$C('COLGROUP');
				var len = g.cols;
				var col;
				for(i=0;i<len;i++){
				  col = CC.$C('COL');
				  col.className = 'g'+(i+1);
				  if(g[i]){
				    Base.applyOption(col, g[i]);
				  }
				  gn.appendChild(col);
				}
			  delete this.group;
			  tb.appendChild(gn);
			}
			
			var tbody = CC.$C('TBODY'),
          its = this._items;
          
			if(its){
			  var szits = its.length, chs = c.children, szchs = chs.length;
			  var i,j,k,ch, szr, tr, td, cc, inf, tp,cpp;
			  for(i=0, k=0;i<szits;i++){
			    r = its[i];
			    tr = CC.$C('TR');
			    tr.className = 'r'+(i+1);
			    
			    if(CC.isArray(r)){
				     for(j=0,cpp=1,szr=r.length;j<szr;j++){
				       cc = r[j];
				       if(cc){
				          inf = cc.td, tp = cc.ctype;
				          if(!inf && !tp){
				            // tr config
				            Base.applyOption(tr, cc);
				            continue;
				          }
				          td = CC.$C('TD');
				          td.className = 'tbl-td c'+(cpp++);
				          // td class
				          if(cc.tdcs)
				            CC.fly(td).addClass(cc.tdcs).unfly();
				          // apply td cfg
							    if(inf){
							       if(inf.cols){
							         td.colSpan = inf.cols;
							         delete inf.cols;
							       }
							       Base.applyOption(td, inf);
							     }
							    // add component to td
                  if(tp){
							       ch  = chs[k++];
							       td.appendChild(ch.view);
							    }
							    tr.appendChild(td);
				       }else {
				         // else single td, nothing
				         td = CC.$C('TD');
				         td.className = 'tbl-td c'+(cpp++);
				         tr.appendChild(td);
				       }
				     }
			    }else {
				      // single td in row
				     td = CC.$C('TD');
				     td.className = 'tbl-td c'+(cpp++);
				     if(r.td){
				       var inf = r.td;
				       if(inf.cols){
				         td.colSpan = inf.cols;
				         delete td.cols;
				       }
				       Base.applyOption(td, inf);
				     }
				     if(r.tr){
              // tr config
              Base.applyOption(tr, r.tr);
				     }
				     if(r.ctype){
				       ch  = chs[k++];
				       td.appendChild(ch.view);
				     }
				     
				     tr.appendChild(td);
			    }
			    tbody.appendChild(tr);
			  }
			}
			tb.appendChild(tbody);
		  c.wrapper.append(tb);
		  delete this._items;
		}
	}
});

CC.layout.def('table', CC.layout.TableLayout);

})();