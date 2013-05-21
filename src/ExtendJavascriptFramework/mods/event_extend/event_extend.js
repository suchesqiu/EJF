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


/*  
    版本: 2009-2-22 20:24:42
    作用: 在 DOM 加载完毕时, 调用回调函数
必填参数: callback_f
*/
function dom_loaded_f(callback_f, capture_b)
{/* shawl.qiu, void return, func:none */
  if(document.addEventListener)
  {
    document.addEventListener('DOMContentLoaded', callback_f, capture_b);
  }
  else if(document.attachEvent)
  {
    document.attachEvent
    (
      'onreadystatechange',
      function(state)
      {
        if(document.readyState=="complete")
        {
          callback_f.call( document, window.event );
        }        
      }    
      , capture_b
    );
  }
}/* function dom_loaded_f(callback_f, capture_b) */


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
    $EJF.plugins.on = bind;
    $EJF.plugins.event_extend = event_extend;

    $EJF.ready = $EJF.plugins.ready = function( $callback, $capture ){
        var p = this;
        
        dom_loaded_f( $callback, $capture );

        return p;
    };
}( $EJF );
