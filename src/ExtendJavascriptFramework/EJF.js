/**
 * on public using $$
 *
 * on dev using EJF
 */
void function(){

    function EJF( $selector, $container ){
     
        var selectors = EJF.selector( $selector, $container );

        EJF.each( EJF.plugins, function( $o, $k ){
            selectors[ $k ] = $o;
        });

        return selectors;
    }
    EJF.plugins = {};

    if( !window.console ) window.console = { log:function(){
        var r = [];
        for( var i = 0, j = arguments.length; i < j; i++ ) r.push( arguments[i] );
        window.status = r.join(' ');
    }};

    EJF.log = 
    function(){
        if( !EJF.debug ) return;
        window.console && console.log( [].slice.apply( arguments ).join(', ') );
    };


    if( !window.EJF ) window.EJF = EJF;
    if( !window.FW ) window.FW = EJF;
    if( !window.$EJF ) window.$EJF = EJF;
    if( !window.$X ) window.$X = EJF;
    if( !window.$ ) window.$ = EJF;
    if( !window.$$ ) window.$$ = EJF;
}();

