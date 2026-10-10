'use strict';
const key='aris-mobile-v1', $=id=>document.getElementById(id);
let data={tasks:[],notes:[],chats:[]},storageBlocked=false,toastTimer,editing=null;
function toast(text){if($('editor').open)$('editStatus').textContent=text;const t=$('toast');t.textContent=text;t.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.style.display='none',4500);}
try{const raw=localStorage.getItem(key);if(raw)data=ARISData.normalize(JSON.parse(raw));}
catch{storageBlocked=true;$('storageWarning').hidden=false;}
// Write succeeds before changing the visible state. Failed writes retain existing data.
function commit(next){
 if(storageBlocked){toast('ابتدا از داده‌های فعلی خروجی بگیر و مشکل ذخیره‌سازی را بررسی کن.');return false;}
 try{next=ARISData.normalize(next);localStorage.setItem(key,JSON.stringify(next));data=next;render();return true;}
 catch{toast('ذخیره انجام نشد؛ فضای ذخیره‌سازی یا مجوز مرورگر را بررسی کن.');return false;}
}
function change(fn){const next=JSON.parse(JSON.stringify(data));fn(next);return commit(next);}
function tab(name){document.querySelectorAll('section').forEach(s=>s.classList.toggle('active',s.id===name));document.querySelectorAll('nav button').forEach(b=>{b.classList.toggle('on',b.dataset.tab===name);b.setAttribute('aria-current',b.dataset.tab===name?'page':'false');});window.scrollTo(0,0);}
window.tab=tab;document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
const folded=s=>s.replace(/ي/g,'ی').replace(/ك/g,'ک').toLocaleLowerCase('fa');
function button(text,label,fn){const b=document.createElement('button');b.textContent=text;b.setAttribute('aria-label',label);b.onclick=fn;return b;}
function edit(kind,i){editing={kind,i};$('editStatus').textContent='';$('editHeading').textContent=kind==='task'?'ویرایش وظیفه':'ویرایش یادداشت';$('editTitle').maxLength=kind==='task'?180:100;$('editTitle').value=kind==='task'?data.tasks[i].text:data.notes[i].title;$('editBody').value=kind==='note'?data.notes[i].body:'';$('editBodyLabel').hidden=kind==='task';$('editBody').hidden=kind==='task';$('editor').showModal();$('editTitle').focus();}
$('cancelEdit').onclick=()=>{$('editor').close();editing=null;};
$('saveEdit').onclick=()=>{if(!editing)return;const title=$('editTitle').value.trim(),body=$('editBody').value.trim();if(!title||(editing.kind==='note'&&!body))return toast('متن را کامل کن.');const {kind,i}=editing;if(change(d=>{if(kind==='task')d.tasks[i].text=title;else d.notes[i]={title,body};})){$('editor').close();editing=null;toast('ویرایش ذخیره شد');}};
function render(){
 $('taskCount').textContent=data.tasks.filter(t=>!t.done).length.toLocaleString('fa');$('noteCount').textContent=data.notes.length.toLocaleString('fa');
 const tq=folded($('taskSearch').value),filter=$('taskFilter').value,tasks=$('taskList');tasks.replaceChildren();
 data.tasks.forEach((t,i)=>{if(!folded(t.text).includes(tq)||(filter==='open'&&t.done)||(filter==='done'&&!t.done))return;
  const row=document.createElement('div');row.className='item'+(t.done?' done':'');const label=document.createElement('span');label.textContent=t.text;const actions=document.createElement('div');actions.className='actions';
  actions.append(button(t.done?'↶':'✓',t.done?'بازگشایی وظیفه':'تکمیل وظیفه',()=>change(d=>{d.tasks[i].done=!d.tasks[i].done;})),button('ویرایش','ویرایش وظیفه',()=>edit('task',i)),button('×','حذف وظیفه',()=>{if(confirm('این وظیفه حذف شود؟'))change(d=>d.tasks.splice(i,1));}));row.append(label,actions);tasks.append(row);
 });if(!tasks.childElementCount)tasks.textContent=data.tasks.length?'نتیجه‌ای پیدا نشد.':'هنوز وظیفه‌ای ثبت نشده است.';
 const nq=folded($('noteSearch').value),notes=$('noteList');notes.replaceChildren();
 data.notes.forEach((n,i)=>{if(!folded(n.title+' '+n.body).includes(nq))return;const p=document.createElement('div');p.className='panel';const h=document.createElement('h3');h.textContent=n.title;const body=document.createElement('p');body.className='note-body';body.textContent=n.body;const actions=document.createElement('div');actions.className='actions';actions.append(button('ویرایش','ویرایش یادداشت',()=>edit('note',i)),button('حذف','حذف یادداشت',()=>{if(confirm('این یادداشت حذف شود؟'))change(d=>d.notes.splice(i,1));}));p.append(h,body,actions);notes.append(p);});if(!notes.childElementCount)notes.textContent=data.notes.length?'نتیجه‌ای پیدا نشد.':'هنوز یادداشتی ثبت نشده است.';
 const messages=$('messages');messages.replaceChildren();const welcome=document.createElement('div');welcome.className='bubble';welcome.textContent='اینجا پیام‌هایت روی همین دستگاه نگه‌داری می‌شوند. پس از آزمایش اتصال در تنظیمات، می‌توانی با مدل لپ‌تاپ گفتگو کنی. فرمانی اجرا نمی‌شود.';messages.append(welcome);
 for(const c of data.chats){const el=document.createElement('div');el.className='bubble'+(c.role==='user'?' me':'');el.textContent=c.text;messages.append(el);}messages.scrollTop=messages.scrollHeight;
}
for(const id of ['taskSearch','noteSearch'])$(id).addEventListener('input',render);$('taskFilter').addEventListener('change',render);
$('addTask').onclick=()=>{const text=$('taskInput').value.trim();if(!text)return toast('متن وظیفه را وارد کن');if(change(d=>d.tasks.unshift({text,done:false}))){$('taskInput').value='';toast('وظیفه ثبت شد؛ آلارم یا اعلان تنظیم نشده است.');}};
$('taskInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing)$('addTask').click();});
$('addNote').onclick=()=>{const title=$('noteTitle').value.trim(),body=$('noteBody').value.trim();if(!title||!body)return toast('عنوان و متن را وارد کن');if(change(d=>d.notes.unshift({title,body}))){$('noteTitle').value='';$('noteBody').value='';toast('یادداشت ذخیره شد');}};
let aiSession=null, aiBusy=false, aiRevision=0;
try{$('aiEndpoint').value=localStorage.getItem('aris-ai-endpoint')||'';}catch{}
function aiStatus(text){for(const id of ['aiStatus','aiHomeStatus','aiChatStatus'])$(id).textContent=text;}
function invalidateAI(){aiRevision++;aiSession=null;aiStatus('اتصال آزمایش نشده؛ دوباره آزمایش کن.');}
for(const id of ['aiEndpoint','aiToken'])$(id).addEventListener('input',invalidateAI);
$('disconnectAI').onclick=()=>{invalidateAI();$('aiToken').value='';aiStatus('اتصال قطع شد.');};
$('testAI').onclick=async()=>{
 if(aiBusy)return;
 try{const revision=aiRevision,base=ARISAI.endpoint($('aiEndpoint').value),token=$('aiToken').value.trim();if(token.length<32)throw Error('کلید نمایش‌داده‌شده روی لپ‌تاپ را وارد کن.');
  aiBusy=true;$('testAI').disabled=true;aiSession=null;aiStatus('در حال آزمایش اتصال…');
  const r=await ARISAI.request(base,token,'/health');if(r.status!=='ready'||r.protocol!==1||typeof r.model!=='string')throw Error('نسخه موتور سازگار نیست.');
  if(revision!==aiRevision)throw Error('تنظیمات اتصال تغییر کرد؛ دوباره آزمایش کن.');
  if($('aiEndpoint').value.trim()!==base&&$('aiEndpoint').value.trim()!==base+'/')throw Error('آدرس تغییر کرده؛ دوباره آزمایش کن.');
  if($('aiToken').value.trim()!==token)throw Error('کلید تغییر کرده؛ دوباره آزمایش کن.');
  aiSession={base,token};try{localStorage.setItem('aris-ai-endpoint',base);}catch{}
  aiStatus('اتصال بررسی شد • '+r.model);
 }catch(e){aiStatus(e.message);}finally{aiBusy=false;$('testAI').disabled=false;}
};
$('send').onclick=async()=>{
 const text=$('chatInput').value.trim();if(!text||aiBusy)return;
 if(!aiSession){toast('ابتدا در تنظیمات، اتصال هوش مصنوعی را آزمایش کن.');return;}
 const session=aiSession,messages=[...data.chats.slice(-11).map(c=>({role:c.role,content:c.text})),{role:'user',content:text}];
 aiBusy=true;$('send').disabled=true;$('testAI').disabled=true;
 for(const id of ['clear','clearChat','importFile'])$(id).disabled=true;
 $('chatStatus').textContent='منتظر پاسخ مدل لپ‌تاپ…';
 try{const r=await ARISAI.request(session.base,session.token,'/chat',{messages});
  if(aiSession!==session)throw Error('اتصال تغییر کرد؛ پاسخ ذخیره نشد.');
  if(typeof r.text!=='string'||!r.text.trim()||r.text.length>2000)throw Error('پاسخ موتور معتبر نیست.');
  if(change(d=>d.chats.push({role:'user',text},{role:'assistant',text:r.text}))){if($('chatInput').value.trim()===text)$('chatInput').value='';$('chatStatus').textContent=r.truncated?'پاسخ طولانی بود و کوتاه شد.':'پاسخ دریافت و ذخیره شد.';}else $('chatStatus').textContent='پاسخ دریافت شد ولی ذخیره نشد؛ از داده‌ها پشتیبان بگیر.';
 }catch(e){$('chatStatus').textContent=e.message+' متن پیام برای تلاش دوباره حفظ شد.';aiSession=null;aiStatus('برای ارسال بعدی، اتصال را دوباره آزمایش کن.');}
 finally{aiBusy=false;$('send').disabled=false;$('testAI').disabled=false;for(const id of ['clear','clearChat','importFile'])$(id).disabled=false;}
};
$('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing)$('send').click();});
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('export').onclick=()=>{try{if(storageBlocked){const raw=localStorage.getItem(key);if(!raw)return toast('داده‌ای برای خروجی در دسترس نیست.');download(raw,'aris-recovery.json');}else download(JSON.stringify({version:2,exportedAt:new Date().toISOString(),...data},null,2),'aris-backup.json');}catch{toast('دریافت پشتیبان ممکن نشد.');}};
$('importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5*1024*1024)throw Error('حجم فایل باید کمتر از ۵ مگابایت باشد.');const incoming=ARISData.normalize(JSON.parse(await file.text()));if(!confirm(`بازیابی ${incoming.tasks.length} وظیفه، ${incoming.notes.length} یادداشت و ${incoming.chats.length} پیام؟ اطلاعات جدید به داده‌های موجود اضافه می‌شوند.`))return;if(commit(ARISData.merge(data,incoming)))toast('بازیابی انجام شد؛ داده‌های قبلی حفظ شدند.');}catch(err){toast(err instanceof SyntaxError?'فایل JSON معتبر نیست.':err.message||'بازیابی انجام نشد.');}finally{e.target.value='';}});
$('clearChat').onclick=()=>{if(confirm('سابقه گفتگو از این دستگاه حذف شود؟'))change(d=>{d.chats=[];});};
$('clear').onclick=()=>{if(confirm('تمام وظایف، یادداشت‌ها و سابقه گفتگو از این دستگاه حذف شوند؟')){if(commit({tasks:[],notes:[],chats:[]}))toast('داده‌ها حذف شدند');}};
$('refreshApp').onclick=()=>{if(confirm('صفحه به‌روزرسانی شود؟ متن‌های تایپ‌شده‌ای که هنوز ثبت نکرده‌ای از بین می‌روند؛ موارد ذخیره‌شده حفظ می‌شوند.'))location.reload();};
function connectionStatus(){$('connectionStatus').textContent=navigator.onLine?'مرورگر آنلاین است':'مرورگر آفلاین است';}window.addEventListener('online',connectionStatus);window.addEventListener('offline',connectionStatus);connectionStatus();render();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>{$('offlineStatus').textContent='آماده استفاده آفلاین';}).catch(()=>{$('offlineStatus').textContent='ذخیره آفلاین فعال نشد؛ صفحه را دوباره باز کن';});
