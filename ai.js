'use strict';
(function(root){
 function endpoint(value){const u=new URL(value.trim());if(u.protocol!=='https:'||!u.hostname.endsWith('.ts.net')||u.username||u.password||u.port||u.search||u.hash||u.pathname!=='/')throw Error('آدرس HTTPS خصوصی Tailscale با پسوند ts.net وارد کن؛ بدون مسیر اضافی.');return u.origin;}
 const errors={401:'کلید اتصال نادرست است.',403:'این نشانی برنامه اجازه اتصال ندارد.',429:'مدل مشغول است؛ کمی بعد دوباره تلاش کن.',504:'زمان پاسخ مدل تمام شد؛ مدل سبک‌تر را امتحان کن.'};
 async function request(base,token,path,body){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),path==='/chat'?165000:15000);
  try{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer'});
   const result=await r.json();if(!r.ok)throw Error(errors[r.status]||(result.detail==='model_missing'?'مدل روی لپ‌تاپ نصب نیست.':'Ollama در دسترس نیست یا پاسخ معتبر نداد.'));return result;
  }catch(e){if(e.name==='AbortError')throw Error('مهلت اتصال تمام شد؛ وضعیت لپ‌تاپ را بررسی کن.');if(e instanceof TypeError)throw Error('اتصال برقرار نشد؛ Tailscale، نشانی و روشن‌بودن لپ‌تاپ را بررسی کن.');throw e;}finally{clearTimeout(timer);}
 }
 const api={endpoint,request};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ARISAI=api;
})(typeof window!=='undefined'?window:globalThis);
