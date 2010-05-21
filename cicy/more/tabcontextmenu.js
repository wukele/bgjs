/**
 * 给CC.ui.Tab添加右键菜单功能
 */
/**
 * @name CC.ui.Tab#contextmenu
 * @event
 * @param {CC.ui.Menu} contextmenu 弹出菜单
 * @param {CC.ui.TabItem} tabitem 右击所在的tabitem
 * @param {DOMEvent} event
 */
(function(preRenderChain){
  var Event = CC.Event;
  CC.ui.Tab.prototype.onRender = function(){
    // 应用原有函数
    preRenderChain.call(this);
   // 扩展右键菜单功能
  this.domEvent('contextmenu', function(e){
      var xy   = Event.pageXY(e), 
          item =  this.$(Event.element(e));
      if(item){
        var menu = this.contextMenu;
        if(!menu){
          menu = this.contextMenu = CC.ui.instance({
            ctype:'menu',
            showTo:document.body,
            array:[
             {title:'关闭', id:'closeself'},
             {title:'关闭其它', id:'closeother'},
             {title:'关闭所有', id:'closeall'}
            ],
            events:{
              selected:[{
                  cb: function(menuitem){
                    var tab = this.pCt, tabitem = CC.Base.byCid(this.currentTabItem);
                    if(tabitem){
                       switch(menuitem.id){
                          case 'closeself' :
                            tab.close(tabitem);
                            break;
                          case 'closeother' :
                            tab.each(function(){
                              if(this !== tabitem)
                                tab.close(this);
                            }); 
                            break;
                          case 'closeall' : 
                            tab.each(function(){
                               tab.close(this);
                            }); 
                       }
                    }
                  }
              }]
            }
          });
          this.follow(menu);
        }
        menu.currentTabItem = item.cacheId;
        
        // enable & disable
        menu.$('closeself').disable(!item.closeable);
        
        menu.at(xy[0], xy[1]);
        this.fire('contextmenu', menu, item, e);
        Event.stop(e);
     }
    });
  };
})(CC.ui.Tab.prototype.onRender);