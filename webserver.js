var http = require('http'),
    path = require('path'),
    fs   = require('fs'),
    mime = require('mime'),
    _base = __dirname;

 http.createServer(function (req,res) {
     var pathname = _base + req.url;
     fs.stat(pathname,function(err,stats) {
        if(err){
            res.writeHead(404);
            res.write('Bad request 404\n');
            res.end();
        }else if(stats.isFile()){
            var type = mime.lookup(pathname);
            res.setHeader('Content-Type',type);
            res.statusCode = 200;
            var file = fs.createReadStream(pathname);
            file.on('open',function () {
              file.pipe(res);
            });

            file.on('error',function(err) {
               console.log(err);
            });
        }else{
            res.writeHead(403);
            res.write('Directory access is forbidden\n');
            res.end();
        }
     });
    
 }).listen(3000);

 console.log('Server running at 3000');
