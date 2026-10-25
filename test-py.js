const http = require('http');
const data = JSON.stringify({files:[{name:'t.py',content:'print(2+2)'}],mainFile:'t.py'});
const req=http.request({hostname:'localhost',port:3000,path:'/api/run',method:'POST',headers:{'Content-Type':'application/json','Content-Length':data.length}},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{console.log(d);process.exit(0)})});
req.write(data);req.end();
