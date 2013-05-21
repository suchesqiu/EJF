/**
 * on public using $$
 *
 * on dev using $FW
 */
void function(){

    function EJF( $selector, $container ){
        !$container && ( $container = document );
        $container = [$container];
        
        var selectors = $FW.selector( $selector, $container );

        $FW.each( EJF.plugins, function( $o, $k ){
            selectors[ $k ] = $o;
        });

        return selectors;
    }
    var $FW = EJF;

    $FW.plugins = {};

    if( !window.console ) window.console = { log:function(){
        var r = [];
        for( var i = 0, j = arguments.length; i < j; i++ ) r.push( arguments[i] );
        window.status = r.join(' ');
    }};

    if( !window.$FW ) window.$FW = EJF;
    if( !window.EJF ) window.EJF = EJF;
    if( !window.$EJF ) window.$EJF = EJF;
    if( !window.$X ) window.$X = EJF;
    if( !window.$ ) window.$ = EJF;
    if( !window.$$ ) window.$$ = EJF;
}();


void function( $EJF ){

    $EJF.isIE = ie_f();
    $EJF.isNS = ns_f();
    $EJF.isOP = op_f();

    $EJF.ieVer = ie_ver_f();

    function ie_f(){ return navigator.appName == 'Microsoft Internet Explorer';}
    function ns_f(){ return navigator.appName == 'Netscape';}
    function op_f(){ return navigator.appName == 'Opera';}
    function ie_ver_f(){ var v = 0; navigator.appVersion.replace( /MSIE ([0-9]+)/, function( $0, $1 ){ v = parseInt($1, 10)||0; } ); return v; }

}( $EJF );

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

        if( $list.length )
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

void function( $EJF ){
    /**
    * requires   
    */

    $EJF.plugins.hasClass = function(){ return has_class_f( this ); };
    $EJF.plugins.attr = function( $k, $v ) { return attr_f( this, $k, $v ); };

    function attr_f( $ele, $k, $v ){

    }

    function has_class_f( ele, class_s )
    {
        return new RegExp( '\\b'+class_s+'\\b' ).test( ele.className );
    }


}( $EJF );

void function( $EJF ){
    /**
     * requires         
     *                  xeach
     *                  attach_event_f
     */
    function event_extend( $evt ){
        $evt.target = target_f( $evt );
        return $evt;
    }

    function bind( $evtName, $callback, $capture ){
        var p = this;
        $evtName.replace(/[\s]+/g, '').split(',').each( function( $ename ){
            p.each( function( $ele ){
                if( !( $ele && $ele.nodeType ) ) return;
                /**
                 * hack for foucs/blur event, if parent is not input or textarea
                 */
                if( /focus|blur/i.test( $ename ) && !/input|textarea/i.test( $ele.nodeName.toUpperCase() ) ){
                    if( $ele.addEventListener ){
                        attach_event_f( $ele, $ename, cb, true );
                    }else{
                        if( /focus/i.test( $ename ) ) $ename += 'in'; else $ename = 'focusout';
                        attach_event_f( $ele, $ename, cb );
                    }
                }else{
                    /**
                     * hack for ie change event
                     */
                    if( /^change$/i.test( $ename ) && $EJF.ieVer && $EJF.ieVer <= 8 ){
                        $ename = 'click';
                        $ele.EJF_HANDLE_CHANGE_EVENT = true;
                    }

                    attach_event_f( $ele, $ename, cb, $capture );
                }

                function cb( $evt ){
                    event_extend( event_f( $evt || window.event ) );
                    //if( /focusin/i.test( $evt.type ) ) $evt.type = 'focus';
                    //if( /focusout/i.test( $evt.type ) ) $evt.type = 'blur';
                    if( $callback ) $callback.call( $ele, $evt );
                }

            });
        });
        return p;
    };

    /**
    *  兼容各浏览器的附加事件函数
    *  x@btbtd.org 2012/7/24      
    */ 
    function attach_event_f( $ele, $evtName, $func, $cap )
    {
        if(document.addEventListener) $ele.addEventListener($evtName, $func, $cap);
        else if(document.attachEvent) $ele.attachEvent('on' + $evtName, $func);
    }
    /**
    *  兼容各浏览器的清除事件函数
    *  x@btbtd.org 2012/7/24
    */ 
    function detach_event_f( $ele, $evtName, $func, $cap )
    {
        if(document.addEventListener) $ele.removeEventListener($evtName, $func, $cap);
        else if(document.attachEvent) $ele.detachEvent('on' + $evtName, $func);
    }
    function event_f( $evt ){ return $evt || window.event; }
    function target_f( $evt ){ return $evt.target || $evt.srcElement; }

    $EJF.plugins.bind = bind;
    $EJF.plugins.event_extend = event_extend;
}( $EJF );

void function( $EJF ){
    /*
    ext_o
    {
    filter_level_symbol: string: >, +, ~
    }
    */
    /**
    * requires     trim
    */
function selector($selector, container_a, ext_o)
{  
  ext_o = ext_o || {};
  var result_a = [];
  
  for(var container_i = 0, container_j=container_a.length; container_i<container_j; container_i++)
  {  
    var container = container_a[container_i];
    var container_ele_a = container.getElementsByTagName('*');
        
    if( ext_o.filter_level_symbol )
    {
      container_ele_a = [];
      if(container===document)
      {
        container = document.body;
      }
      
      switch(ext_o.filter_level_symbol)
      {
        case '>':
          for(var i_=0, j_=container.childNodes.length; i_<j_; i_++)
          {
            var item_ = container.childNodes[i_];
            
            if(item_.nodeType===1)
            {
              container_ele_a.push( item_ );
            }
          }
          break;
          
        case '+':
          
          var temp_item_ = container;
          while( temp_item_ = temp_item_.nextSibling )
          {
            if(!temp_item_){break;}
            if(temp_item_.nodeType!==1){continue;}
            container_ele_a.push( temp_item_ );
            break;
          }
          
          break;
          
        case '~':
          
          var temp_item_ = container;
          while(temp_item_.nextSibling )
          {
            if(!temp_item_){break;}
            temp_item_ = temp_item_.nextSibling;
            if(temp_item_.nodeType!==1){continue;}
            
            container_ele_a.push( temp_item_ );
          }
          break;      
      }
    }//if( ext_o.filter_level_symbol )
    
    if(typeof $selector=='string')
    {
      $selector = $selector.replace(trim_r, '');
      
      var temp_attr_o_ = {};
      var temp_attr_count_ = 1;
      
      var endecode_o =
      {
        prefix: 'ENDECODE_PREFIX_'
        , suffix: '_'
        , count: 1
        , encode_list: 
          [
            {begin:'"', over:'"'}
            , {begin:"'", over:"'"}
            , {begin:"[", over:"]"}
            , {begin:"(", over:")"}
          ]
        , encoded_o:{}
        , item_reg: /(ENDECODE_PREFIX_[\d]+_)/g
      };  

      $selector = encode_content_f( $selector, endecode_o );
             
      var selector_a = $selector.split(',');
            
      for(var i=0, j=selector_a.length; i<j; i++)
      {
        
        var item_ = selector_a[i] = selector_a[i].replace(trim_r, '');        
        var filter_func_ = '';
                        
        if( item_.indexOf(' ')===-1 )
        {             
          if(/^\[/.test(item_) )
          {
            filter_func_ = item_;
          }
          else if( is_filter_func_r.test(item_) )
          {
            func_item_r.exec(item_);
            
            item_ = RegExp.$1;
            filter_func_ = RegExp.$2;
          }
          
          item_ = item_.replace(trim_r, '');
          
          if(item_=='')
          {
            continue;
          }
            
          if( /^[a-zA-Z][\w]*$/.test(item_) ) //tag
          {
            var temp_a = [];
            
            if(ext_o.filter_level_symbol)
            {
              for(var i_=0, j_=container_ele_a.length; i_<j_; i_++)
              {
                var item__ = container_ele_a[i_];
                
                if( item__.tagName.toUpperCase() == item_.toUpperCase() )
                {
                  temp_a.push( item__ );
                }
              }
            }
            else
            {
              temp_a = container.getElementsByTagName(item_);
            }
            
            for(var i_=0, j_=temp_a.length; i_<j_; i_++)
            {
              result_a.push( temp_a[i_] );
            }
          }
          else if( /^\.[a-zA-Z][\w]*$/.test(item_) )//class
          {
            if( item_.match(/\./g) )
            {
              if(item_.match(/\./g).length>1){ continue; }
            }
            
            item_ = item_.slice(1);            
            for(var i_=0, j_=container_ele_a.length; i_<j_; i_++)
            {
              var temp_item_ = container_ele_a[i_];
              if( has_class_f(temp_item_, item_) )
              {
                result_a.push( temp_item_ );
              }
            }
          }
          else if( /^\#[a-zA-Z][\w]*$/.test(item_) )//id
          {
            var temp_e = container.getElementById( item_.slice(1) );
            if( temp_e!=null ){ result_a.push( temp_e ); }
          }
          else if( item_.charAt(0)=='[' ) //attribute
          {  
            for(var i_=0, j_=container_ele_a.length; i_<j_; i_++)
            {
              var temp_item_ = container_ele_a[i_];
              result_a.push( temp_item_ );
            }
          }
          else if( /^[\w]+\.[\w]+/.test(item_) ) //(tag|id).class
          {
            var selector_a_ = item_.replace(clear_space_r, '').split( '.' );
            var result_a_ = selector( selector_a_[0], [container] );
            
            for(var i_ = 0, j_ = result_a_.length; i_ < j_; i_++)
            {
              var temp_item_ = result_a_[i_];
              if( has_class_f(temp_item_, selector_a_[1]) )
              {
                result_a.push( temp_item_ );
              }
            }                        
          }  
          
          if(filter_func_!='')
          {         
            filter_func_ = filter_func_.replace(selectorunc_symbol_r, selector_placeholder_s+'$1').replace(selector_placeholder_s, '');
            filter_func_ = decode_content_f( filter_func_, endecode_o );
            
            var filter_func_a_ = filter_func_.split(selector_placeholder_s);            
                       
            result_a = filter_func_f(result_a, filter_func_a_);
            
          }
          
        }/* if( is_sample_r.test(item_) ) */
        else //$selector has multi-level
        {     
          var selector_a_ = item_.split(/\s+/);          
          var result_a_ = [ [container] ];
          
          for(var i_=0, j_=selector_a_.length; i_<j_; i_++)
          {
            var item__ = selector_a_[i_] = selector_a_[i_].replace(trim_r, '');

            item__ = decode_content_f( item__, endecode_o );
            
            if( selector_level_symbol_r.test(item__) )
            {
              item__ = item__.charAt(0);              
              var temp_item_ = selector_a_[i_+1] = selector_a_[i_+1].replace(trim_r, '');            
            
              temp_item_ = decode_content_f( temp_item_, endecode_o );
              
              var temp_result_ = selector( temp_item_, result_a_[ result_a_.length-1 ], {filter_level_symbol: item__} );
              
              result_a_.push( temp_result_ );   
              
              i_++;          
            }
            else
            {
              result_a_.push( selector( item__, result_a_[ result_a_.length-1 ] ) );   
            }            
                              
          }/* for(var i_=0, j_=selector_a_.length; i_<j_; i_++) */
          
          result_a = result_a.concat( result_a_[result_a_.length-1] );
        }
        
      }/* for(var i=0, j=selector_a.length; i<j; i++) */
    }
    else if(typeof $selector=='object' && $selector.nodeType) //HTML节点
    {
      result_a[ result_a.length ] = $selector;
    }
    else if($selector===window)
    {
      result_a[ result_a.length ] = $selector;
    }

  }//for(var container_i = 0, container_j=container_a.length; container_i<container_j; container_i++)
  
  return result_a;
}/* function selector($selector) */
    var trim_r = /^\s*|\s*$/gi;
    var clear_space_r = /\s*/g;
    var is_sample_r = /[^ ]/;

    var selector_symbol_r = /([\.\#]+)/g;  
    var selectorunc_symbol_r = /([\:|\[]+)/g
    var selector_placeholder_s = '$selectorPLACEHOLDER';

    var selector_level_symbol_r = /\>|\+|\~/;

    var is_filter_func_r = /\:|\[/;
        var func_item_r = /^([\w]+)(.*)$/
        var func_func_item_r = /^:([\w]+)(?:\((.*?)\)|)/;

        var filter_func_attr_item_r = /(\!\=|\^\=|\$\=|\*\=|\=)/;

        function encode_content_f( content_s,  endecode_o )
        {
            for(var i=0, j=endecode_o.encode_list.length; i<j; i++)
            {
                var index_offset = 0;

                while(true)
                {
                    var item_ = endecode_o.encode_list[i];

                    var start_pos_i = content_s.indexOf( item_.begin, index_offset );
                    if(start_pos_i==-1){ break; } //找不到匹配项

                    var over_pos_i = content_s.indexOf( item_.over, start_pos_i+1 );
                    if(over_pos_i==-1){ break; } //找不到结束项

                    var string_part_ = string_part_f(content_s, start_pos_i, over_pos_i);

                    var key_ = 'ENDECODE_PREFIX_'+endecode_o.count+endecode_o.suffix;
                    endecode_o.encoded_o[key_] = string_part_.middle;
                    content_s = format_f( '{0}{1}{2}{3}{4}', string_part_.begin, string_part_.begin_char, key_, string_part_.end_char, string_part_.over  );

                    index_offset = content_s.indexOf( key_+string_part_.end_char )  + key_.length +1;      
                    endecode_o.count++;
                }

            }/* for(var i=0, j=endecode_o.encode_list.length; i<j; i++) */

            return content_s;
        }

        function decode_content_f( content_s,  endecode_o )
        {
            while( endecode_o.item_reg.test(content_s) )
            {
                content_s = content_s.replace
                (
                    endecode_o.item_reg ,
                    function($0, $1)
                    {
                        if($1 in endecode_o.encoded_o)
                        {
                            if($1===endecode_o.encoded_o[$1]){return '---recursive---'}
                            $1 = endecode_o.encoded_o[$1];
                        }
                        else
                        {
                            $1 = '---error---'
                        }
                        return $1;
                    }
                );
            }

            return content_s;
        }

        //alert(input_a.join('\n,').slice(0, 2))

        function string_part_f(string_s, begin_i, over_i)
        {
            return {
                begin: string_s.slice(0, begin_i)
                , over: string_s.slice(over_i+1)
                , middle: string_s.slice(begin_i+1, over_i)
                , begin_char: string_s.charAt(begin_i)
                , end_char: string_s.charAt(over_i)
            }
        }

function has_class_f( ele, class_s )
{
  return new RegExp( '\\b'+class_s+'\\b' ).test( ele.className );
}

    $EJF.selector = selector;
    $EJF.plugins.selector = selector;
}( $EJF );

void function( $EJF ){
     /* *
    * 清除字符串头尾的空白字符
    * x@btbtd.org  2012-2-21
    */
    function trim( $s )
    {
        return ($s||'').toString().replace( /^[\s]+|[\s]+$/g, '' );
    } 
    
    String.prototype.trim = Number.prototype.trim = function(){ return trim( this ); };
}( $EJF );
