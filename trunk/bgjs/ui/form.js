    CC.create('CFormElement', CBase, function(superclass){
        return {
            errorCS :'g-error',

            elementNode : '_el',
						
						elementCS : 'g-form-el',
						
            initComponent : function(){
                //generate template first and searching form element node..
                var v = this.view;
                if(!v) {
                    var t = this.template || this.type;
                    this.view = v = CTemplate.$(t);
                }
                var el = this.element;

                if(!el)
                    el = this.element = this.dom(this.elementNode);

                el.id = this.id || 'comp'+CC.uniqueID();
                this.focusNode = el.id;

                if(v != el && !v.id)
                    v.id = 'comp'+CC.uniqueID();
                //
                this.addClass(this.elementCS);
                
                superclass.initComponent.call(this);

                if(this.name)
                    this.setName(this.name);

                if(this.value)
                    this.setValue(this.value);

                if(this.focusCS)
                    this.bindFocusStyle(this.focusCS);
            },

            setValue : function(v) {
                this.element.value = v;
                this.value = v;
                return this;
            },

            setName : function(n){
                this.element.name = n;
                this.name = n;
                return this;
            },

            focusCallback : function(evt){
                if(this.onFocus)
                    this.onFocus(evt, this.element);
            },

            mouseupCallback : function(evt){
                if(this.onClick)
                    this.onClick(evt, this.element);
            },

            blurCallback : function(evt){
                if(this.onBlur)
                    this.onBlur(evt, this.element);
            }
        };
    });

    CTemplate['CText'] = '<input type="text" id="_el" class="g-ipt-text" />';
    CC.create('CText', CFormElement, function(superclass){
        return {
            focusCS : 'g-ipt-text-hover',
            focusCallback : function(evt){
                superclass.focusCallback.call(this, evt);
                //fix chrome browser.
                var self = this;
                //IE6下 this.view.select.bind(this.view).timeout(20);
                // 也会出错,它的select没能bind..晕
                (function(){self.view.select();}).timeout(20);
            }
        };
    });
    CFormElement['text'] = CText;

    CTemplate['CTextarea'] = '<textarea id="_el" class="g-textarea" />';
    CC.create('CTextarea', CFormElement, CText.constructors, {
        focusCallback : CFormElement.prototype.focusCallback
    });
    CFormElement['textarea'] = CTextarea;

    CTemplate['CCheckbox'] = '<span tabindex="1" class="g-checkbox"><input type="hidden" id="_el" /><img src="'+CTemplate.BLANK_IMG+'" class="chkbk" /><label id="_tle"></label></span>';
    CC.create('CCheckbox', CFormElement, function(superclass){
        return {
            hoverCS : 'g-check-over',
            clickCS : 'g-check-click',
            checkedCS : 'g-check-checked',
            initComponent:function(){
                superclass.initComponent.call(this);
                if(this.checked)
                    this.setChecked(true);
            },

            mouseupCallback : function(evt){
                this.setChecked(!this.checked);
                superclass.mouseupCallback.call(this, evt);
            },

            setChecked : function(b){
                this.checked = b;
                this.element.checked = b;
                if(b)
                    this.addClass(this.checkedCS);
                else 
                    this.delClass(this.checkedCS);
                if(this.onChecked)
                	this.onChecked(b);
            }
        };
    });
    CFormElement['checkbox'] = CCheckbox;


    CC.create('CRadio', CFormElement, CCheckbox.constructors, {
        inherentCS : 'g-radio',
        template : 'CCheckbox',
        hoverCS : 'g-radio-over',
        clickCS : 'g-radio-click',
        checkedCS : 'g-radio-checked'
    });
    CFormElement['radio'] = CRadio;


    CTemplate['CFieldLine'] = '<li><label class="desc" id="_tle" ><span class="req">*</span></label><div id="_elCtx"></div></li>';
    CC.create('CFieldLine', CContainerBase, function(superclass){
        return {
            labelNode : '_tle',
            labelFor : 0,
            template : 'CFieldLine',
            container : '_elCtx',
            title : false,
            initComponent : function(){
                superclass.initComponent.call(this);
                if(this.title === false){
                    this.fly(this.labelNode).display(0).unfly();
                }
            },

            add : function(field, cfg){
                if(field.ctype)
                    field = new CFormElement[field.ctype](field);
                superclass.add.call(this, field, cfg);
                if(this.$(this.labelFor) == field)
                    this.dom(this.labelNode).htmlFor = field.element.id;
                
            },
            
            fromArray : function(array) {
            	for(var i=0, len = array.length;i<len;i++){
            		this.add(array[i]);
            	}
            }
        };
    });
    
    CFormElement['fieldline'] = CFieldLine;


    CTemplate['CFormLayer'] = '<ul class="g-formfields"></ul>';
    function CFormLayer(opt){
        opt = opt || {};
        opt.ItemClass = CFieldLine;
        opt.template  = opt.type = 'CFormLayer';
        return new CContainerBase(opt);
    }