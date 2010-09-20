/**
 * @class CC.ui.form.RichEditor
 * 基于CKEDITOR或其它开源的富文本编辑器
 */
 
/**
 * @cfg {String} editorUrl 指定远程加载编辑器脚本文件
 */

/**
 * @cfg {String} lazyLoad 是否延迟加载，延迟后当文本框聚焦时才加载，默认为false。
 */
 
/**
 * @cfg {Object} editorCfg editor configeration
 */

/**
 * @event editorload, replace后立即调用
 * @param {Object} editor
 */
 
/**
 * @event editorload, editor就绪后调用
 * @param {Object} editor
 * @param {Object} [editorEvent]
 */ 

CC.Tpl.def('CC.ui.form.RichEditor', '<div><textarea id="_el" class="g-textarea g-corner" ></textarea></div>');

CC.create('CC.ui.form.RichEditor', CC.ui.form.Textarea, {
    
    template : 'CC.ui.form.RichEditor',
    
    editorUrl : 'http://ckeditor.com/apps/ckeditor/3.4/ckeditor.js',
 
    lazyLoad :  false,
    
    onRender : function(){
        this.superclass.onRender.call(this);
        if(!this.lazyLoad)
            this.loadEditor();
    },
    
    focusCallback : function(){
        this.superclass.focusCallback.apply(this, arguments);
        if(this.lazyLoad && !this.editor)
            this.loadEditor();
    },
    
/**手动加载编辑器*/
    loadEditor : function(callback, cfg){
        if(!this.editor){
            // 等待load后的调用队列
            if(!this._loadCbList){
                this._loadCbList = [];
                if(__debug) console.assert(CC.ui.form.RichEditor.isLoading, true);

                this._replace(this.element, CC.extendIf(cfg, this.editorCfg), (function(editor){
                    this._onEditorLoad(editor);
                    if(this.editorCfg)
                    delete this.editorCfg;
                }).bindRaw(this));
            }
            
            if(callback)
                this._loadCbList.push(callback);
        }
        else callback.call(this, this.editor);
    },
    
    focus : function(){
        if(!this.editor){
            this.loadEditor(function(editor){
                //editor.focus();
            });
        }else{
            alert('');
            this.editor.focus();
        }
        return this;
    },
    
    getValue : function(){
        return this.editor ? this.editor.getData() : this.value;
    },
    
    getText : function(){
        return this.editor ? this.editor.getData() : this.value;
    },
    
    setValue : function(v){
        if(this.editor)
            this.editor.setData(v);
        return this.superclass.setValue.call(this, v);
    },

/**
 * 如果未加载，并且callback参数为空，返回空。
 * @param {Function} [callback] 加载editor后回调
 * @return {Object} editor OR null
 */
    getEditor : function(callback){
        if(!this.editor && callback)
            this.loadEditor(callback);

        return this.editor; 
    },
    
/**
 * 
 */
    isModified : function(){
        if(this.editor){
            this.modified = this.checkDirty();
            return this.modified;
        }
        return this.modified;
    },
    
    setSize : function(){
        this.superclass.setSize.apply(this, arguments);

        if(this.editor)
            this.editor.resize(this.width, this.height);
        else CC.fly(this.element)
               .fastStyleSet('width', this.width + 'px')
               .fastStyleSet('height', this.height + 'px');
        return this;
    },
    
    // override
    destroy : function(){
        try{
            // ckeditor will throw some error when is removed from dom.
            this.editor.destroy();
        }catch(e) { }
        this.superclass.destroy.call(this);
    },
    
    _onEditorLoad : function(editor){
        this.editor = editor;
        this.fire('editorload', editor);
        this.editor.on('dataReady', this._onEditorReady.bindRaw(this));
    },
    
    _onEditorReady : function(e){
        var editor = e.editor;

        if(this.width !== false || 
           this.height !== false)
             this.editor.resize(this.width, this.height);
        
        if(this.value)
            editor.setData(this.value);

        this.fire('editorready', editor, e);

        if(this._loadCbList){
            for(var i=0,cs = this._loadCbList,len=cs.length;i<len;i++){
                cs[i].call(this, editor, e);
            }
            delete this._loadCbList;
        }
        

        if(this.onEditorReady)
            this.onEditorReady(editor, e);
    },

    _replace : function(el, cfg, callback){
        var editor;
        if(!window.CKEDITOR){
           this._loadAPI(function(){
              editor =  CKEDITOR.replace(el, cfg);
              callback(editor, cfg);
           });
        }else {
            editor =  CKEDITOR.replace(el, cfg);
            callback(editor, cfg);
        }
    },
    
    _loadAPI : function(callback){
        // 防止重复加载
        CC.ui.form.RichEditor.isLoading = true;
        CC.loadScript(this.editorUrl, function(){
            callback();
            delete CC.ui.form.RichEditor.isLoading;
        });
    }
});

CC.ui.form.RichEditor.prototype.getText = CC.ui.form.RichEditor.prototype.getValue;

CC.ui.def('rtext', CC.ui.form.RichEditor);