const http = require('http');
const data = JSON.stringify({
  files: [{name: 'main.c', content: '#include <stdio.h>\nint main(){printf("hi");return 0;}' }],
  mainFile: 'main.c'
});
const req = http.request({hostname:'localhost',port:3000,path:'/api/run',method:'POST',headers:{'Content-Type':'application/json','Content-Length':data.length}},(res)=>{
  let d='';res.on('data',c=>d+=c);res.on('end',()=>{console.log(d);process.exit(0)});
});
req.on('error',e=>{console.log('err',e.message);process.exit(1)});
req.write(data);req.end();
