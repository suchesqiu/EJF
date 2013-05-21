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
