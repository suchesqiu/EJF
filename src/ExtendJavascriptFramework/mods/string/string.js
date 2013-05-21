void function( $EJF ){

    String.prototype.trim = Number.prototype.trim = function(){ return trim( this ); };
    String.prototype.printf = function()
    {
        var len_ = arguments.length, re_ = null, arg_o = arguments, $input = this; 

        for(var i = 0; i < len_; i++)
        {
            re_ = new RegExp(["\\{", i, "(\\:[a-zA-Z]|)}"].join(""), "g"); 
            $input = $input.replace
                (
                 re_,
                 function($0, $1)
                 {
                     var result_a = [arg_o[i]]; 
                     switch($1){
                         case ":C" : case ":c" : result_a.unshift('￥'); break;
                     }
                     return result_a.join('');
                 }

                );
        }
        return $input;
    }
    /* *
     * 清除字符串头尾的空白字符
     * x@btbtd.org  2012-2-21
     */
    function trim( $s )
    {
        return ($s||'').toString().replace( /^[\s]+|[\s]+$/g, '' );
    } 


}( $EJF );
