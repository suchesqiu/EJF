void function( $EJF ){

    function selector( $selector, $container ){
        $container = init_container( $container );
        return new selector_processor( $selector, $container );
    }

    function init_container( $container ){ 
        $container = $container || [document];
        if(!$container.length){ $container = [document]; }
        if(typeof $container =='string'){ $container = selector($container, [document]); }
        return $container;
    };


    function selector_processor( $selector, $container ){
        var p = this;

        p.result = [];
        if( $container == false ) return p.result;

        p.src_selector = $selector;
        p.src_container = $container;

        p.selector_parts; //选择器存储在数组里， 因为可能会有多个选择器

        p.init();
        p.split_selector();
        p.process_selector();

        return p.result;
    }

    selector_processor.prototype = {
        /**
         * 初始化选择器
         */
        "init": function(){
            var p = this;
        }
        /**
         * 解析有多少个选择器
         */
        , "split_selector": function(){
            var p = this;
            switch( p.src_selector.constructor ){
                case Array:{
                               p.selector_parts = p.src_selector;
                               break;
                           }
                case String:{
                                /**
                                 * 这里需要优化 [] 里面的空格
                                 */
                                p.selector_parts = p.src_selector.split(/[\s]*?,[\s]*/);
                                break;
                            }
                default:{
                            p.selector_parts = [ p.src_selector ];
                        }
            }
        }
        /**
         * 解析各个子选择器
         */
        , "process_selector": function(){
            var p = this;

            p.src_container.each( function( $container ){
                p.selector_parts.each( function( $selector ){
                    if( typeof( $selector ) == 'string' ){
                        var parts = p.analytics_selector_parts( $selector );
                            $EJF.log( parts.join(', ') );
                            p.get_selector_part_elements( $container, parts );
                    }else{
                        p.result.push( $selector );
                    }
                });
            });
        }
        /**
         * 从选择器的各部分获取最终要选取的节点
         */
        , "get_selector_part_elements": 
            function( $container, $parts ){

                var level_elements = [ $container ], p = this;

                for( var i = 0, j = $parts.length; i < j; i++ ){

                    if( !level_elements.length ) break;

                    var item = $parts[i], first_char = item.slice( 0, 1 ), tmp = [], r, ignore;
                    $EJF.log( item, first_char );

                    if( item == ' ' ) continue; 
                    /**
                     * 如果是标签
                     */
                    if( /[a-z*]/i.test( first_char ) ){
                        level_elements.each( function( $ele ){
                            tmp = tmp.concat( find_elements_by_tagName( $ele, item, $parts[i-1] ) );
                        });
                    }else{
                        if( first_char == '[' ){
                            var attrs = processor_attr( item );
                        }
                        level_elements.each( function( $ele ){
                            switch( first_char ){
                                /**
                                 * for id
                                 */ 
                                case '#':{
                                             r = find_element_by_id( item.slice( 1 ) );
                                             r && tmp.push( r );
                                             break;
                                         }
                                /**
                                 * 查找 class name
                                 */
                                case '.':{
                                             r = find_elements_by_class( $ele, item.slice( 1 ), $parts[i-1] );
                                             tmp = tmp.concat( r );
                                             break;
                                         }
                                case ':':{
                                             break;
                                         }
                                /**
                                 * 查找子节点
                                 */
                                case '>': tmp = level_elements; break;
                                /**
                                 * 查找向后的相邻节点
                                 */
                                case '+': tmp = level_elements; break;
                                /**
                                 * 查找向后的所有相邻节点
                                 */
                                case '~': tmp = level_elements; break;
                                /**
                                 * 查找HTML属性
                                 */
                                case '[':{
                                             r = find_element_by_attr( $ele, attrs, $parts[i-1] );
                                             tmp = tmp.concat( r );
                                             break;
                                         }
                            }
                        });
                    }

                     level_elements = tmp;
                }//end for
                p.result = p.result.concat( level_elements );

                $EJF.log( '\n' );
            }
        /**
         * 分析各个子选择器的层次
         */
        , "analytics_selector_parts": function( $selector ){
            var parts = [], space_parts = $selector.split( /[\s]+/ ), tmp = [];

            /**
             * 这里添加空格, 是为了识别层级关系, 比如 .class 是所有的, 还是某个标签下的  
             */
            space_parts.each( function( $item ){
                tmp.push( $item );
                if( /[a-z*]/i.test( $item ) ) tmp.push( ' ' );
            });
            space_parts = tmp;
            if( space_parts.length ) space_parts.pop();

            space_parts.each( function( $item  ) {
                if( /[:\[.]/.test( $item ) ){
                    var tmp = split_selector_parts( $item );
                    tmp.each( function( $sitem ){
                        parts.push( $sitem );
                    });
                }else{
                    parts.push( $item );
                }
            });

            return parts;
        }
    };
    /**
     *
     */
    function find_element_by_attr( $container, $attrs, $pre_item ){
        var r= [];
        switch( $attrs.length ){
            case 2:{
                       if( $EJF.plugins.hasAttr.call( $container, $attrs[0] ) ) 
                           r.push( $container );
                       break;
                   }
            case 3:{
                       if( $EJF.plugins.attr.call( $container, $attrs[0] ) === $attrs[1] ) 
                           r.push( $container );
                       break;
                   }
        }
        $EJF.log( $attrs, r );
        return r;
    }
    /**
     * 解析选择器 属性的 名/值 对
     * suches@btbtd.org  2013-05-19
     */
    function processor_attr( $attr ){
        var r = [], re = /^(['"])(.*)\1$/g;
        $attr = $attr.slice( 1, $attr.length - 1 ).trim();

        /([|~*$!\^]*?\=)/.exec( $attr );
        var sym = RegExp.$1 || '';

        r = $attr.split( /[|~*$!\^]*?\=/ );
        r[0] = r[0].replace( re, '$2' );
        r[1] && ( r[1] = r[1].replace( re, '$2' ) );
        r.push( sym );
        return r;
    }
    /**
     *
     */
    function find_elements_by_class( $container, $class, $pre_item ){
        var r = [];
        $pre_item = $pre_item || ' ';
        $EJF.log( 'pre_item: ', $pre_item );

        if( $pre_item == ' ' ){
            var ls = [].slice.apply( $container.getElementsByTagName( '*' ) );
            ls.each( function( $e ){
                if( $EJF.plugins.hasClass.call( $e, $class ) ){
                    r.push( $e );
                }
            });
        }else{
            if( /[a-z]/i.test( $pre_item ) ){
                if( $EJF.plugins.hasClass.call( $container, $class ) ){
                    r.push( $container );
                }
            }else{
                switch( $pre_item ){
                    case '>':{
                                 var childs = [].slice.apply( $container.childNodes );
                                 childs.each( function( $e ){
                                     if( $EJF.plugins.hasClass.call( $e, $class ) ){
                                         r.push( $e );
                                     }
                                 });
                                 break;
                             }
                    case '~':{
                                 $class = '.' + $class;
                                 while( $container ){
                                     $container = $container.nextSibling;
                                     if( $container && /text/i.test( $container.nodeName ) ) continue;
                                     if( $container && has_feature( $container, $class ) ){
                                         r.push( $container );
                                     }
                                 }
                                 break;
                             }

                    case '+':{
                                 $class = '.' + $class;
                                 while( $container ){
                                     $container = $container.nextSibling;
                                     if( $container && /text/i.test( $container.nodeName ) ) continue;
                                     if( $container && has_feature( $container, $class ) ){
                                         r.push( $container );
                                     }
                                     break;
                                 }
                                 break;
                             }
                }
            }
        }

        return r;
    }
    function has_feature( $ele, $feature ){
        var r = false, f = $feature.slice(0, 1 );

        if( /[a-z*]/i.test( f ) ){
            if( $feature.toUpperCase() == $ele.nodeName.toUpperCase() || $feature == '*' ) r = true;
        }else{
            switch( f ){
                case '.':{
                             if( $EJF.plugins.hasClass.call( $ele, $feature.slice( 1 ) ) ) r = true;
                             break;
                         }
               case '#':{
                            if( $ele.id && $ele.id.toUpperCase() == $feature.toUpperCase() ) r = true;
                        }
            }
        }

        return r;
    }
    /**
     *
     */
    function find_element_by_id( $id ){
        var id = document.getElementById( $id );
        return id;
    }
    /**
     *
     */
    function find_elements_by_tagName( $container, $tagName, $pre_item ){
        var r = [];
        $pre_item = $pre_item || ' ';
        $tagName = $tagName.toUpperCase();
        $EJF.log( 'pre_item: ', $pre_item );

        if( $pre_item == ' ' ){
            var ls = [].slice.apply( $container.getElementsByTagName( $tagName ) );

            ls.each( function( $e ){
                if( $e.nodeName.toUpperCase() == $tagName || $tagName == '*' ){
                    r.push( $e );
                }
            });
        }else{
            switch( $pre_item ){
                case '>':{
                             var childs = [].slice.apply( $container.childNodes );
                             childs.each( function( $e ){
                                 if( $e.nodeName.toUpperCase() == $tagName ){
                                     r.push( $e );
                                 }
                             });
                             break;
                         }
            }
        }

        return r;
    }
    /**
     *
     */
    function split_selector_parts( $selector ){
        var r =  [], endc_obj = {}, count = 1, delimiter = '@@@';

        $selector = $selector.replace( /(\[[^\]]+?\])/g, replace_callback );
        $selector = $selector.replace( /(\:[^.:#\[\]]+)/g, replace_callback );
        $selector = $selector.replace( /(\.[^.:#\[\]]+)/g, replace_callback );

        $selector = $selector.split( delimiter );

        $selector.each( function( $item ){
            if( $item in endc_obj ){
                $item = endc_obj[ $item ];
                delete endc_obj[ $item ];
            }
            $item.trim() && r.push( $item );
        });

        function replace_callback( $0, $1 ){
           var tmp = delimiter + count;
            endc_obj[ count ] = $1;
            count++;
            return tmp;
        }

        return r;
    }

    $EJF.selector = selector;
    $EJF.plugins.selector = selector;
}( $EJF );
