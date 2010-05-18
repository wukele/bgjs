(function(){

var ly = CC.layout;
var B =  ly.Layout;
var superclass = B.prototype;
var Math = window.Math;
var Base = CC.Base;
/**
 * CardLayout,容器内所有子项宽高与容器一致
 * @name CC.layout.CardLayout
 * @extends CC.layout.Layout
 * @class
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
 * @name CC.layout.QQLayout
 * @class
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
 * @param {Boolean}
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
 * 行布局,该布局将对子控件宽度/高度进行布局,不干预控件坐标.
 * 控件配置方面:
 * <li>auto : 自动宽高,不进行干预</li>
 * <li>具体宽/高 : 如50px</li>
 * <li>leading : 平分宽高</li>
 * @name CC.layout.RowLayout
 * @class
 * @extends CC.layout.Layout
 */
CC.create('CC.layout.RowLayout', B, {
    wrCS : 'g-row-ly',
    onLayout: function() {
      var wr = this.ct.wrapper;
      var w = wr.getWidth(true),
      h = wr.getHeight(true),
      i,len, it, its = this.ct.children, cfg, ty = this.type, iv;
      //y direction
      var leH = [], leW = [];
      for(i=0,len=its.length;i<len;i++){
        it = its[i];
        if(it.hidden)
          continue;

        cfg = it.lyInf;
        switch(cfg.h){
          case 'auto' :
          case undefined :
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
 * 用HTML TABLE元素布局控件,主要用于表单设计中,
 * 布局信息用JSON表示,通过 lyCfg:{  items:  } 传入.
 * items为一个数组,数组每个元素代表一行(tr).
 * 每一行的数据格式可为一个数组或一个object
 * 
 *  行为数组时,数组中每个元素表示每个单元(td)<br>
 *  行为object时,表示该行只有一个单元格,可以在object中定义td,tr的属性信息, object.td = {}, object.tr = {}<br>
 * 当一个配置信息既无ctype属性,亦无td属性时被看作是该行tr的信息
 * @example
 <pre>
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
      // row with single cell 
      {tr:{cs:'tr-end'}, td:{cols:2}}
    ]
  }
});
 </pre>
 * @name CC.layout.TableLayout
 * @class
 */
CC.create('CC.layout.TableLayout', B, {

	attach : function(ct){
		// cache the items
	  this._items = ct.lyCfg && ct.lyCfg.items;
	  // 自由添加结点到容器
	  ct._addNode = fGo;
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
            // 避免td污染
//            tds.push(as[j].td);
//            delete as[j].td;
          }   
        }
      }else if(as && as.ctype){
        news.push(as);
        // 避免td污染
//        tds.push(as.td);
//        delete as.td;
      }
    }
    superclass.fromArray.call(this, news);
    
    // 恢复td
//    for(i=0,len=news.length;i<len;i++){
//      if(news[i].td !== undefined){
//        news[i].td = tds[i];
//      }
//    }
//    tds = null;
    news = null;
  },
/**
 * @property {HTMLElement} tableEl
 */
/**
 * 一次性布局,生成table表
 * @override
 * @protected
 */
/**
 * class name of main table node
 * @property {String} tblCs
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
			
			if(tbl){
			  Base.applyOption(tb, tbl);
			}
			
			if(this.group){
				var g = this.group;
				var gn = CC.$C('COLGROUP');
				var len = g.cols;
				var col;
				for(i=0;i<len;i++){
				  col = CC.$C('COL');
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
			  var i,j,k,ch, szr, tr, td, cc, inf, tp;
			  for(i=0, k=0;i<szits;i++){
			    r = its[i];
			    tr = CC.$C('TR');
			    
			    if(CC.isArray(r)){
				     for(j=0,szr=r.length;j<szr;j++){
				       cc = r[j];
				       if(cc){
				          inf = cc.td, tp = cc.ctype;
				          if(!inf && !tp){
				            // tr config
				            Base.applyOption(tr, cc);
				            continue;
				          }
				          td = CC.$C('TD');
				          td.className = 'tbl-td';
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
				         td.className = 'tbl-td';
				         tr.appendChild(td);
				       }
				     }
			    }else {
				      // single td in row
				     td = CC.$C('TD');
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