const http=require('http');
function get(path){return new Promise(r=>{http.get({host:'localhost',port:5173,path},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>r({code:res.statusCode,len:d.length,head:d.slice(0,40)}))})})}
(async()=>{
 console.log('CSS:',JSON.stringify(await get('/src/style.css')));
 const data=JSON.stringify({files:[{name:'main.c',content:'#include <stdio.h>\nint main(){printf("proxy ok");return 0;}'}],mainFile:'main.c'});
 await new Promise(r=>{const req=http.request({host:'localhost',port:5173,path:'/api/run',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{console.log('PROXY API:',d);r()})});req.write(data);req.end()});
})();
