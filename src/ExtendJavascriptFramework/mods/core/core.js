void function( $EJF ){

    $EJF.each = xeach;
    $EJF.plugins.each = $EJF.plugins.foreach = Array.prototype.each = function( $callback ){ xeach( this, $callback ); return this; };

    /**
    * @description 遍历键值对象或数组
    * @author      suches@btbtd.org
    * @date        2011-7-24
    */        
    function xeach( $list, $callback )
    {
        var count = 0;

        if( $list.constructor == Array )
        {
            for( var i = 0, j = $list.length; i < j; i++ )
            {
                if( inner( i, count, $callback ) === false )
                {
                    return;
                }
                count++;
            }
        }
        else
        {    
            for( var o in $list )
            {

                if( inner( o, count, $callback ) === false )
                {
                    return;
                }
                count++;
            }
        }

        function inner( $key )
        {
            if( $callback )
            {
                return $callback( $list[$key], $key, count );
            }
        }
    }
   
}( $EJF );
