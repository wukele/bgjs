/**
 * �Ϸ�CTabItem,CColumn��ʱ��ʾ���±�ͼ��.
 * �ÿؼ�λ�ڻ�����,һ��ɷ���ʱ��ʾ,�ϷŽ�������ʧ.
 */
CTemplate['CItemDDRBarUp'] = '<div class="g-tabMoveSp" style="display:none;"></div>';

if(!Cache['CItemDDRBarUp']) {
		Cache.register('CItemDDRBarUp', (function(){
			var n = CC.$$(CTemplate.forNode(CTemplate['CItemDDRBarUp']));
			n.appendTo(document.body);
			return n;
		}));
}
	