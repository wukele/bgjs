/**
 * 拖放CTabItem,CColumn项时显示的下标图标.
 * 该控件位于缓存中,一般可放下时显示,拖放结束后消失.
 */
CTemplate['CItemDDRBarUp'] = '<div class="g-tabMoveSp" style="display:none;"></div>';

if(!Cache['CItemDDRBarUp']) {
		Cache.register('CItemDDRBarUp', (function(){
			var n = CC.$$(CTemplate.forNode(CTemplate['CItemDDRBarUp']));
			n.appendTo(document.body);
			return n;
		}));
}
	