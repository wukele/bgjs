//
// http://jsbeautifier.org/
//
function starts_with(str, what)
{
    return str.substr(0, what.length) === what;
}

function trim_leading_comments(str)
{
    // very basic. doesn't support /* ... */
    str = str.replace(/^(\s*\/\/[^\n]*\n)+/, '');
    str = str.replace(/^\s+/, '');
    return str;
}

function unpacker_filter(source)
{

    if (true) {

        stripped_source = trim_leading_comments(source);

        if (starts_with(stripped_source.toLowerCase().replace(/ +/g, ''), 'eval(function(p,a,c,k')) {
            try {
                eval('var unpacked_source = ' + stripped_source.substring(4) + ';')
                return unpacker_filter(unpacked_source);
            } catch (error) {
                source = '// jsbeautifier: unpacking failed\n' + source;
            }
        }
    }
    return source;

}


function do_js_beautify(contentArea, tabsize, preserve_newline)
{
    var js_source = contentArea.value.replace(/^\s+/, '');
    var indent_size = tabsize;
    var indent_char = ' ';
    var preserve_newlines = preserve_newline;

    if (indent_size == 1) {
        indent_char = '\t';
    }


    if (js_source && js_source[0] === '<' && js_source.substring(0, 4) !== '<!--') {
        contentArea.value = style_html(js_source, indent_size, indent_char, 80);
    } else {
        contentArea.value =
        js_beautify(unpacker_filter(js_source), {indent_size: indent_size, indent_char: indent_char, preserve_newlines:preserve_newlines});
    }
    return false;
}