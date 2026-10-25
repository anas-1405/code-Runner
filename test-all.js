const http = require('http');

function post(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({hostname:'localhost',port:3000,path:'/api/run',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}}, res => {
      let d=''; res.on('data', c=>d+=c); res.on('end', ()=>resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

(async () => {
  const c = await post({files:[{name:'main.c',content:'#include <stdio.h>\nint main(){printf("C ok");return 0;}'}],mainFile:'main.c'});
  console.log('C:', JSON.stringify(c));
  const cpp = await post({files:[{name:'main.cpp',content:'#include <iostream>\nint main(){std::cout<<"CPP ok";}'}],mainFile:'main.cpp'});
  console.log('CPP:', JSON.stringify(cpp));
  const py = await post({files:[{name:'main.py',content:'print("PY ok")'}],mainFile:'main.py'});
  console.log('PY:', JSON.stringify(py));
  const multi = await post({files:[
    {name:'main.c',content:'#include <stdio.h>\n#include "helper.h"\nint main(){hello();return 0;}'},
    {name:'helper.h',content:'#ifndef H\n#define H\nvoid hello();\n#endif'},
    {name:'helper.c',content:'#include <stdio.h>\nvoid hello(){printf("MULTI ok");}'}
  ],mainFile:'main.c'});
  console.log('MULTI:', JSON.stringify(multi));
  const err = await post({files:[{name:'bad.c',content:'int main(){ syntax error }'}],mainFile:'bad.c'});
  console.log('ERRCASE:', JSON.stringify(err).slice(0,160));
})();
