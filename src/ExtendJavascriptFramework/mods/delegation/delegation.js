void function( $EJF ){
    /**
     * requires         selector
     *                  extend_event
     *                  trim
     * 这里需要针对 delegation 写一个逆向 selector
     */
    function delegation( $selector, $event_name, $callback, $parent ){
        if( !$parent ) $parent = this;
        
        $selector = $selector.trim();
        $event_name = $event_name.trim();

        if( !($selector && $event_name && $callback ) ) return $parent;


        $parent.bind( $event_name, function( $evt ){
            var tgr = $evt.target, tgr_p = $EJF( tgr ), e = this;
            if( tgr && tgr.nodeType ){

                if( /[^#\[ ]/.test( $selector ) ){
                    match_simple( $selector, this );
                } else {
                    do_match( $selector, this );
                }
            }

            function match_simple( $selector, p ){
                var tmp = $selector.split(/[\s]+/), last = tmp[ tmp.length - 1 ], match = '', re = null;
                //console.log( $selector, last, tgr.nodeName ); 

                re = /^([^.]+)/;
                if( re.test( last ) ){
                    last.replace( re, function( $0, $1, $2 ){ match = $1; } ); 
                    if( match ){
                        if( tgr.nodeName != match.toUpperCase() ) return;
                        //console.log( 'tagname match: ' + match );
                    }
                }

                re = /\.([^.]+)/, match = '';
                if( re.test( last ) ){
                    last.replace( re, function( $0, $1, $2 ){ match = $1; } ); 
                    if( match ){
                        if( !tgr_p.hasClass( match ) ) return;
                        //console.log( 'has class match: ' + match );
                    }
                }

                do_match( $selector, p );
            }

            function do_match( $selector, p ){
                var list = $EJF( $selector, p );
                list.each( function( $obj ){
                    if( $obj === tgr ){
                        /**
                         * check if has EJF_HANDLE_CHANGE_EVENT for ie ver< 9 && > 0
                         */
                        if( p.EJF_HANDLE_CHANGE_EVENT && $evt.type.toLowerCase() == 'click' && $EJF.ieVer && $EJF.ieVer < 9 ){
                            //console.log( 'geted change', $evt.type );
                            if( !tgr.EJF_INITED_CHANGE_EVENT ){
                                $EJF( tgr ).bind( 'change', function( $evt ){
                                    $callback.call( tgr, $evt );
                                });
                                tgr.EJF_INITED_CHANGE_EVENT = true;
                            }

                            return;
                        }

                        $callback.call( tgr, $evt );
                    }
                });
            }

        });

        return $parent;
    }

    $EJF.plugins.delegation = delegation;
}( $EJF );
