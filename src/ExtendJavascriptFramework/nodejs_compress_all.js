/**
 * EJF 发布脚本, 使用 nodejs 
 * 依赖: nodejs, java, node-minify
 * npm 安装 node-minify:  npm install node-minify
 *
 * 使用: 
 * $ node link node-minify #( windows系统需要这一步，linux不需要)
 * $ node node_compress_all.js
 *
 * x@btbtd.org
 */

var compressor = require('node-minify');
var fs = require('fs');

var tmp = [];
    tmp.push( fs.readFileSync('EJF.js', 'utf8') );

var modspath = "mods";
var dirs = fs.readdirSync( modspath );

for( var i = 0, j = dirs.length; i < j; i++ ){
    var dirpath = [modspath, dirs[i]].join('/');
    var fstat = fs.statSync( dirpath );
    if( fstat.isDirectory() ){
        var flpath = dirpath + '/' + dirs[i] + '.js';

        if( fs.existsSync( flpath ) ){
            tmp.push( fs.readFileSync( flpath, 'utf8' ) );
        }
    }
}

var mergepath = "./pub/EJF.merge.js";
var minpath = "./pub/EJF.min.js"

fs.writeFileSync( mergepath, tmp.join('\n'), 'utf8' );

new compressor.minify({
    type: 'yui-js',
    fileIn: mergepath,
    fileOut: minpath,
    callback: function(err){
        console.log('js: ' + err  + ' : ' +  mergepath);
    }
});
