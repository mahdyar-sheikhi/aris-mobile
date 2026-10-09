'use strict';
(function(root){
 const validText=(v,n)=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
 function normalize(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('ساختار فایل پشتیبان معتبر نیست.');
  if(!Array.isArray(raw.tasks)||!Array.isArray(raw.notes))throw Error('فایل باید شامل وظایف و یادداشت‌های آریس باشد.');
  if(raw.version!==undefined&&![1,2].includes(raw.version))throw Error('نسخه فایل پشتیبان پشتیبانی نمی‌شود.');
  const chats=raw.chats===undefined?[]:raw.chats;
  if(!Array.isArray(chats)||raw.tasks.length>10000||raw.notes.length>10000||chats.length>10000)throw Error('تعداد رکوردها بیش از حد مجاز است.');
  if(raw.tasks.some(t=>!t||!validText(t.text,180)||typeof t.done!=='boolean')||raw.notes.some(n=>!n||!validText(n.title,100)||!validText(n.body,5000))||chats.some(c=>!c||!['user','assistant'].includes(c.role)||!validText(c.text,2000)))throw Error('یک یا چند رکورد فایل معتبر نیست؛ هیچ داده‌ای تغییر نکرد.');
  return {tasks:raw.tasks.map(t=>({text:t.text,done:t.done})),notes:raw.notes.map(n=>({title:n.title,body:n.body})),chats:chats.map(c=>({role:c.role,text:c.text}))};
 }
 function merge(current,incoming){
  const result=normalize(current),extra=normalize(incoming);
  for(const field of ['tasks','notes','chats']){
   const seen=new Set(result[field].map(x=>JSON.stringify(x)));
   for(const item of extra[field]){const key=JSON.stringify(item);if(!seen.has(key)){result[field].push(item);seen.add(key);}}
  }
  return normalize(result);
 }
 const api={normalize,merge}; if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ARISData=api;
})(typeof window!=='undefined'?window:globalThis);
