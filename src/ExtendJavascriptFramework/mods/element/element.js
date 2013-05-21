void function( $EJF ){
    /**
    * requires   
    */

    $EJF.plugins.hasClass = function( $class ){ return has_class_f( this, $class ); };
    $EJF.plugins.attr = function( $k, $v ) { return attr_f( this, $k, $v ); };
    $EJF.plugins.hasAttr = function( $k ) { return has_attr_f( this, $k ); };
    $EJF.plugins.val = function( $v ) { return attr_f( this, $v ); };

    /**
     * 判断DOM节点是否有 $k 这个HTML 属性
     * suches 2013-05-19
     */
    function has_attr_f( $ele, $k ){
        return $ele.hasAttribute( $k );
    }

    /**
     * 获取或设置DOM节点的属性值
     * suches 2013-05-18
     */
    function attr_f( $ele, $k, $v ){
        if( typeof $v != 'undefined' ){
            $ele.setAttribute( $k, $v );
        }else{
            $v = $ele.getAttribute( $k );
        }
        return $v;
    }

    /**
     * 获取或设置DOM form 子节点的属性值
     * suches 2013-05-18
     */
    function val_f( $ele, $v ){
        if( typeof $v == 'undefined' ){
            $ele.value = $v;
        }else{
            $v = $ele.value;
        }
        return $v;
    }


    function has_class_f( ele, class_s )
    {
        return new RegExp( '\\b'+class_s+'\\b' ).test( ele.className );
    }


}( $EJF );
