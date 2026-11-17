/* Beylikdüzü RAM | LGS Yolculuğum - Öğrenci girişi ve kişisel ilerleme */
(function(){
"use strict";
const SB="https://uftqsvxieizpclpxbejs.supabase.co";
const KEY="sb_publishable_qd7956g-qF9_RVj6xIoX8w_3UQg02R8";
const EDGE=SB+"/functions/v1/lgs-student-accounts";
const SESSION_KEY="lgs_student_session_v1", GUEST_KEY="lgs_yolculugum_v4";
const STAGES=12;
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let ctx=null,session=null,sessionUid="",connected=false,busy=false,mode="login",error="",notice="";
let unclaimed=[],lastIssued=[],resetSecret="",remoteUpdated="",syncStatus="",debounce=null,saving=false,dirty=0,committed=0;
let lastSavedState=null;
try{session=JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null");sessionUid=session?.user?.id||""}catch(_){session=null}
const guestState=()=>{
  try{return JSON.parse(localStorage.getItem(GUEST_KEY)||"null")||{}}catch(_){return {}}
};
const empty=()=>({completed:[],tasks:[],habits:{},font:0,quizResults:[],activityCompleted:[]});
function safeData(v){
 const s=Object.assign(empty(),(v&&typeof v==="object"&&!Array.isArray(v))?v:{});
 s.completed=Array.isArray(s.completed)?s.completed.filter(x=>typeof x==="string").slice(0,12):[];
 s.tasks=Array.isArray(s.tasks)?s.tasks.filter(x=>x&&typeof x.text==="string").slice(-100).map(x=>({text:x.text.slice(0,120),day:String(x.day||"Bugün").slice(0,30),done:!!x.done})):[];
 s.habits=s.habits&&typeof s.habits==="object"&&!Array.isArray(s.habits)?s.habits:{};
 const habitKeys=Object.keys(s.habits).sort().slice(-90);s.habits=Object.fromEntries(habitKeys.map(k=>[k,s.habits[k]]));
 s.quizResults=Array.isArray(s.quizResults)?s.quizResults.slice(-40).map(x=>({date:String(x.date||"").slice(0,30),score:Number(x.score)||0,total:Number(x.total)||0,title:String(x.title||"Mini yarışma").slice(0,110)})):[];
 s.activityCompleted=Array.isArray(s.activityCompleted)?s.activityCompleted.filter(x=>typeof x==="string").slice(-150):[];
 s.font=(Number(s.font)||0)%3;
 return s;
}
function codeValue(value){
 const raw=String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
 if(!/^LGS[A-HJ-NP-Z2-9]{12}$/.test(raw))return "";
 return "LGS-"+raw.slice(3,7)+"-"+raw.slice(7,11)+"-"+raw.slice(11,15);
}
const emailFor=code=>"lgs"+code.replace(/[^A-Z0-9]/g,"").toLowerCase()+"@students.lgs.example";
function saveSession(s){session=s;sessionUid=s?.user?.id||"";if(s)sessionStorage.setItem(SESSION_KEY,JSON.stringify(s));else sessionStorage.removeItem(SESSION_KEY)}
async function req(path,method="GET",data,token){
 const headers={"apikey":KEY};if(data!==undefined)headers["Content-Type"]="application/json";if(token)headers.Authorization="Bearer "+token;
 if(method!=="GET"&&path.startsWith("/rest/"))headers.Prefer="resolution=merge-duplicates,return=minimal";
 const res=await fetch(SB+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data)});
 const txt=await res.text();let payload={};try{payload=txt?JSON.parse(txt):{}}catch(_){}
 if(!res.ok)throw Error(payload.msg||payload.message||payload.error_description||payload.error||("Sunucu hatası "+res.status));
 return payload;
}
async function getToken(){
 if(!session)return "";
 if(Number(session.expires_at||0)<Date.now()/1000+90){
  const s=await req("/auth/v1/token?grant_type=refresh_token","POST",{refresh_token:session.refresh_token});
  s.expires_at=Math.floor(Date.now()/1000)+Number(s.expires_in||3600);
  saveSession(s);
 }
 return session.access_token;
}
async function edge(payload,isAdmin=false){
 let jwt="";
 if(isAdmin){
  try{jwt=JSON.parse(sessionStorage.getItem("lgs_admin_session")||"null")?.access_token||""}catch(_){}
  if(!jwt)throw Error("Önce yönetici hesabınızla giriş yapın.");
 }
 const res=await fetch(EDGE,{method:"POST",headers:{"apikey":KEY,"Content-Type":"application/json",...(jwt?{Authorization:"Bearer "+jwt}:{})},body:JSON.stringify(payload)});
 let d={};try{d=await res.json()}catch(_){}
 if(!res.ok)throw Error(d.error||"Sunucu işlemi başarısız.");
 return d;
}
async function loadRemote(){
 if(!session)return;
 const uid=sessionUid;
 const t=await getToken();
 const rows=await req("/rest/v1/lgs_student_progress?select=state,updated_at&user_id=eq."+encodeURIComponent(uid),"GET",undefined,t);
 if(uid!==sessionUid)return;
 connected=true;syncStatus="Kaydedildi";
 remoteUpdated=rows[0]?.updated_at||"";
 const newState=safeData(rows[0]?.state||empty());
 lastSavedState=JSON.stringify(newState);
 ctx.setData(newState);
 window.LGSFamily?.refreshLinks?.();
}
async function logIn(code,password){
 const normalized=codeValue(code);
 if(!normalized)throw Error("Öğrenci kodunu kontrol et.");
 if(!password)throw Error("Şifreni gir.");
 const result=await req("/auth/v1/token?grant_type=password","POST",{email:emailFor(normalized),password});
 if(!result.access_token||!result.user?.id)throw Error("Giriş yapılamadı.");
 result.expires_at=Math.floor(Date.now()/1000)+Number(result.expires_in||3600);
 if(result.user?.app_metadata?.lgs_student!==true)throw Error("Bu hesap öğrenci hesabı değil.");
 saveSession(result);connected=false;dirty=0;committed=0;
 try{await loadRemote();notice="Hesabına giriş yaptın. İlerlemelerin güvenle saklanıyor.";error="";return true}
 catch(e){saveSession(null);connected=false;throw e}
}
async function sync(){
 if(!connected||!session||saving)return;
 saving=true;
 const uid=sessionUid;
 try{
  while(committed<dirty&&uid===sessionUid){
   const v=dirty;
   const snapshot=JSON.stringify(safeData(ctx.getData()));
   syncStatus="Kaydediliyor…";renderStatus();
   const t=await getToken();
   await req("/rest/v1/lgs_student_progress?on_conflict=user_id","POST",{user_id:uid,state:JSON.parse(snapshot),updated_at:new Date().toISOString()},t);
   if(uid!==sessionUid)return;
   committed=v;lastSavedState=snapshot;remoteUpdated=new Date().toISOString();syncStatus="Kaydedildi";renderStatus();
  }
 }catch(e){syncStatus="Bağlantı hatası, tekrar dene";renderStatus()}
 finally{saving=false}
}
function saveData(data){
 if(!connected||!session){try{localStorage.setItem(GUEST_KEY,JSON.stringify(data))}catch(_){}return}
 dirty++;syncStatus="Kaydediliyor…";renderStatus();
 if(debounce)clearTimeout(debounce);
 debounce=setTimeout(sync,550);
}
function renderStatus(){const e=$("#studentSync");if(e)e.textContent=syncStatus}
function accountWidget(){
 return '<div class="row" style="justify-content:space-between;gap:12px"><div class="row"><span style="font-size:25px">👤</span><div><strong>'+(connected?"Kişisel ilerlemen hesabına bağlı":"İlerlemeni her cihazda koru")+'</strong><small style="display:block">'+(connected?("● "+esc(syncStatus)):"Öğrenci kodunla giriş yap, kaldığın yerden devam et.")+'</small></div></div><button class="btn small light" data-go="student">'+(connected?"Gelişimimi gör →":"Hesap oluştur / giriş yap →")+'</button></div>';
}
function graph(data){
 const now=new Date();const bars=[];
 for(let i=6;i>=0;i--){
  const d=new Date(now);d.setDate(now.getDate()-i);
  const key=d.toLocaleDateString("sv-SE");
  const checked=Object.values(data.habits?.[key]||{}).filter(Boolean).length;
  bars.push('<div style="flex:1;text-align:center;min-width:0"><div style="height:80px;display:flex;align-items:flex-end;justify-content:center"><span title="'+checked+' / 4" style="display:block;width:27px;max-width:100%;height:'+Math.max(7,checked*24)+'%;border-radius:8px 8px 3px 3px;background:'+(checked?"#4eaa94":"#dfebee")+'"></span></div><small>'+d.toLocaleDateString("tr-TR",{weekday:"short"})+'</small></div>');
 }
 return bars.join("");
}
function dashboard(data){
 const done=(data.completed||[]).length, tasks=(data.tasks||[]).filter(x=>x.done).length;
 const scores=(data.quizResults||[]).slice(-3).reverse();
 const act=(data.activityCompleted||[]).length;
 const remain=["kaygi","plan","odak","uyku","beden","destek","deneme","sinavgunu","erteleme","ozguven","dijital","hedef"].find(x=>!(data.completed||[]).includes(x));
 const ratio=Math.round(done/STAGES*100);
 return '<div class="row" style="justify-content:space-between;align-items:start"><div><div class="eyebrow">KİŞİSEL ÖĞRENCİ ALANIM</div><h1>Gelişimim 🌱</h1><p>Her küçük adımın birikiyor. Bu bilgiler yalnızca senin hesabına bağlı.</p></div><button class="btn small outline" data-action="studentLogout">Çıkış yap</button></div><div class="note good">🔒 <strong>Giriş yapıldı.</strong> Adın, okulun veya e-posta adresin kaydedilmiyor. <span id="studentSync">'+esc(syncStatus)+'</span></div><div class="statrow">'+stat(done+"/"+STAGES,"Bitirdiğim modül")+stat(tasks,"Tamamlanan hedef")+stat((data.quizResults||[]).length,"Mini test denemem")+'</div><div class="grid2"><div class="tile"><h3>Modül ilerlemem</h3><h2>'+ratio+'%</h2><div class="progress" style="margin:15px 0"><span style="width:'+ratio+'%"></span></div><p>'+done+' modülü bitirdin. '+(remain?'Bir sonraki modülü de keşfetmeye ne dersin?':'Altı modülü tamamladın, istediğin zaman tekrar edebilirsin.')+'</p><button class="btn primary" data-go="lessons">Modüllere git →</button></div><div class="tile"><h3>Son 7 günlük rutinim</h3><p>İşaretlediğin küçük alışkanlıkların görünümü. Yüksek puan yarışı değil, farkındalık alanı.</p><div style="display:flex;gap:7px;align-items:flex-end;margin-top:25px">'+graph(data)+'</div><button class="btn light small" data-go="wellness" style="margin-top:17px">Bugünkü adımları işaretle</button></div></div><div class="grid2" style="margin-top:17px"><div class="tile"><h3>Mini testlerim</h3>'+(scores.length?scores.map(x=>'<div class="listrow"><div><strong>'+esc(x.title)+'</strong><small>'+esc(String(x.date).slice(0,10))+'</small></div><strong>'+x.score+'/'+x.total+'</strong></div>').join(""):'<p>Henüz bir mini test tamamlamadın.</p>')+'<button class="btn light small" data-go="quiz" style="margin-top:13px">Bilgimi dene</button></div><div class="tile"><h3>Kendi çalışma adımlarım</h3><div class="listrow"><strong>Eklediğim hedefler</strong><strong>'+(data.tasks||[]).length+'</strong></div><div class="listrow"><strong>Tamamladığım etkinlikler</strong><strong>'+act+'</strong></div><button class="btn light small" data-go="planner" style="margin-top:13px">Planımı aç</button></div></div>'+window.LGSFamily.renderStudentLinks()+'<div class="tile" style="margin-top:16px"><h3>Önceki cihazımdaki ilerlemem</h3><p>Bu cihazda hesap açmadan önce yaptığın etkinlikler varsa, istersen bunları hesabına aktarabilirsin. Ortak kullanılan okul bilgisayarlarında başka bir öğrencinin kayıtlarını aktarma.</p><div class="row"><button class="btn outline" data-action="studentImport">Bu cihazdaki eski ilerlememi aktar</button><button class="btn light" data-action="studentRetrySync">Kaydı yeniden dene</button></div></div>';
}
function stat(n,label){return '<div class="stat"><strong>'+esc(n)+'</strong><small>'+esc(label)+'</small></div>'}
function form(){
 const intro='<div class="eyebrow">8. SINIF | KİŞİSEL ALAN</div><h1>Gelişimim 👤</h1><p>Giriş yaparak tamamladığın modülleri, çalışma planını ve mini test sonuçlarını farklı cihazlarda da görebilirsin.</p>';
 const tabs='<div class="row" style="margin:20px 0"><button class="btn '+(mode==="login"?"primary":"light")+'" data-action="studentMode:login">Giriş yap</button><button class="btn '+(mode==="register"?"primary":"light")+'" data-action="studentMode:register">İlk kez kayıt ol</button></div>';
 const fields='<div class="stack">'+field("Öğrenci kodum",'<input id="studentCode" autocomplete="username" maxlength="25" autocapitalize="characters" placeholder="LGS-XXXX-XXXX-XXXX">')+field(mode==="register"?"Kendime şifre oluşturuyorum":"Şifrem",'<input id="studentPass" type="password" autocomplete="'+(mode==="register"?"new-password":"current-password")+'" placeholder="'+(mode==="register"?"En az 10 karakter, harf ve rakam":"Şifreni yaz")+'">')+(mode==="register"?field("Şifremi tekrar yazıyorum",'<input id="studentConfirm" type="password" autocomplete="new-password" placeholder="Şifreni yeniden yaz">'):"")+'<button class="btn primary" data-action="'+(mode==="register"?"studentRegister":"studentLogin")+'">'+(mode==="register"?"Hesabımı oluştur":"İlerlemeni aç")+'</button><div id="studentMessage">'+(error?'<div class="note warn">'+esc(error)+'</div>':"")+(notice?'<div class="note good">'+esc(notice)+'</div>':"")+'</div></div>';
 return intro+'<div class="grid2"><div class="tile">'+tabs+fields+'</div><div class="tile" style="background:#e8f4f8"><h2>🔐 Kişisel kodunla devam et</h2><p>Rehber öğretmeninden <strong>tek kullanımlık öğrenci kodu</strong> al. İlk girişinde kendi şifreni oluştur. Sonraki girişlerde aynı kodu ve şifreni kullan.</p><div class="note good">✅ Ad-soyad, okul, telefon veya e-posta bilgisi istenmez.</div><p><strong>Önemli:</strong> Kodunu ve şifreni güvenli bir yerde sakla. Şifreni unutursan rehber öğretmeninden sıfırlama desteği iste.</p><p>Ortak bilgisayarda kullanıyorsan işin bitince çıkış yap.</p></div></div>';
}
function field(label,html){return '<div class="field"><label>'+esc(label)+'</label>'+html+'</div>'}
function render(data){if(session&&!connected)return '<div class="tile">Hesabındaki ilerleme yükleniyor…</div>';return connected?dashboard(safeData(data)):form()}
function message(s,good=false){const e=$("#studentMessage");if(e)e.innerHTML='<div class="note '+(good?"good":"warn")+'">'+esc(s)+'</div>';else{error=s;if(ctx)ctx.refresh()}}
function setBusy(v){busy=v;const btn=$("#studentCode")?.closest(".tile")?.querySelector('[data-action="studentLogin"],[data-action="studentRegister"]');if(btn)btn.disabled=v}
function passwordValue(){return $("#studentPass")?.value||""}
async function actionLogin(){if(busy)return;const code=$("#studentCode")?.value,pass=passwordValue();setBusy(true);try{await logIn(code,pass);ctx.refresh()}catch(e){message("Giriş yapılamadı. Kodu ve şifreyi kontrol et. "+(e.message.includes("rate")?"Biraz sonra yeniden dene.":""))}finally{setBusy(false)}}
async function actionRegister(){if(busy)return;const code=$("#studentCode")?.value,pass=passwordValue(),confirm=$("#studentConfirm")?.value;if(pass!==confirm)return message("İki şifre aynı değil.");if(pass.length<10||!/[a-zA-Z]/.test(pass)||!/[0-9]/.test(pass))return message("Şifre en az 10 karakter olmalı, harf ve rakam içermeli.");setBusy(true);try{await edge({op:"register",code,password:pass});await logIn(code,pass);notice="Hesabın oluşturuldu ve ilerlemelerin bundan sonra saklanacak.";ctx.refresh()}catch(e){message(e.message)}finally{setBusy(false)}}
async function logout(){
 if(debounce)clearTimeout(debounce);
 if(connected&&dirty>committed){await sync()}
 try{const t=await getToken();if(t)await req("/auth/v1/logout","POST",undefined,t)}catch(_){}
 saveSession(null);connected=false;sessionUid="";dirty=0;committed=0;syncStatus="";window.LGSFamily?.clearStudentLinks?.();
 // Öğrenciye ait ilerlemeyi ortak cihazda göstermemek için misafir kaydına dön.
 ctx.setData(safeData(guestState()));ctx.refresh();
}
function importGuest(){
 if(!connected)return;
 const old=safeData(guestState()),now=safeData(ctx.getData());
 if(!(old.completed.length||old.tasks.length||old.quizResults.length||old.activityCompleted.length||Object.keys(old.habits).length))return alert("Bu cihazda aktarılabilecek eski ilerleme bulunamadı.");
 if(!confirm("Bu cihazdaki önceki görevler ve ilerlemeler senin mi? Ortak cihazdaysan başka bir öğrencinin kayıtlarını aktarma."))return;
 now.completed=[...new Set([...now.completed,...old.completed])];
 now.tasks=[...now.tasks,...old.tasks].slice(-100);
 now.quizResults=[...now.quizResults,...old.quizResults].slice(-40);
 now.activityCompleted=[...new Set([...now.activityCompleted,...old.activityCompleted])].slice(-150);
 now.habits=Object.assign({},old.habits,now.habits);
 ctx.setData(now);saveData(now);alert("Eski ilerleme hesabına ekleniyor.");
}
function renderAdminCodes(){
 return '<div class="tile" style="margin-top:16px"><div class="row" style="justify-content:space-between"><div><h3>👤 Öğrenci hesap kodları</h3><p>8. sınıf öğrencileri için tek kullanımlık, isimsiz giriş kodları oluştur.</p></div><span class="tag">Yöneticiye özel</span></div><div class="row"><button class="btn small primary" data-action="studentIssue:10">10 kod üret</button><button class="btn small light" data-action="studentIssue:30">30 kod üret</button><button class="btn small outline" data-action="studentListCodes">Kullanılmamış kodları göster</button></div><div id="studentAdminInfo"></div><div id="studentCodeList">'+(lastIssued.length?codesMarkup(lastIssued,"Üretilen kodlar"):unclaimed.length?codesMarkup(unclaimed,"Kullanılmamış kodlar"):"")+'</div><hr style="border:0;border-top:1px solid var(--line);margin:23px 0"><h3>Öğrenci şifresini sıfırla</h3><p>Şifresini unutan öğrencinin kodunu yazın. Yeni geçici şifre yalnızca burada gösterilir.</p><div class="row"><input id="studentResetCode" class="student-reset-input" placeholder="LGS-XXXX-XXXX-XXXX" maxlength="25" style="border:1px solid #d0dee8;border-radius:11px;padding:11px;min-width:210px;max-width:100%"><button class="btn small outline" data-action="studentReset">Geçici şifre oluştur</button></div><div id="studentResetResult">'+(resetSecret?'<div class="note good">'+esc(resetSecret)+'</div>':"")+'</div><div class="note warn">Bu kodların öğrencilere güvenli biçimde iletilmesi gerekir. Kodlara öğrenci adını veya başka kişisel bilgi eklemeyin.</div></div>';
}
function codesMarkup(codes,head){return '<div class="note good"><strong>'+esc(head)+' ('+codes.length+')</strong><div class="row" style="margin-top:9px"><button class="btn small outline" data-action="studentCopyCodes">Kodları kopyala</button></div><textarea readonly id="studentCodesArea" style="margin-top:9px;width:100%;min-height:130px;font:13px monospace;border:1px solid #b8d3dc;border-radius:9px;padding:10px">'+codes.map(esc).join("\n")+'</textarea></div>'}
async function issue(n){const r=await edge({op:"issue",count:n},true);lastIssued=r.codes||[];unclaimed=[];const e=$("#studentCodeList");if(e)e.innerHTML=codesMarkup(lastIssued,"Yeni kodlar");info("Yeni kodlar oluşturuldu. Bunları güvenli biçimde öğrencilere dağıtabilirsiniz.",true)}
async function listCodes(){
 const a=JSON.parse(sessionStorage.getItem("lgs_admin_session")||"null");
 if(!a?.access_token)throw Error("Yönetici girişi gerekli.");
 let rows=await req("/rest/v1/lgs_student_invites?select=code&claimed_at=is.null&order=created_at.desc&limit=200","GET",undefined,a.access_token);
 unclaimed=rows.map(x=>x.code);lastIssued=[];
 const e=$("#studentCodeList");if(e)e.innerHTML=unclaimed.length?codesMarkup(unclaimed,"Kullanılmamış kodlar"):'<div class="note good">Kullanılmamış kod yok.</div>';
 info(unclaimed.length+" adet kullanılmamış kod listelendi (en fazla 200).",true);
}
function info(msg,good){let e=$("#studentAdminInfo");if(e)e.innerHTML='<div class="note '+(good?"good":"warn")+'">'+esc(msg)+'</div>'}
async function resetCode(){
 let code=$("#studentResetCode")?.value;if(!code)throw Error("Öğrencinin kodunu girin.");
 if(!confirm("Bu öğrenci hesabının şifresi sıfırlansın mı? Eski şifre geçersiz olacak."))return;
 const result=await edge({op:"reset",code},true);
 resetSecret="Öğrenci kodu: "+result.code+" | Yeni geçici şifre: "+result.password;
 const e=$("#studentResetResult");if(e)e.innerHTML='<div class="note good"><strong>Yeni şifre oluşturuldu.</strong><div><code>'+esc(result.password)+'</code></div><small>Şifreyi öğrenciye güvenli biçimde iletin. Sayfa yenilenirse burada tekrar görüntülenmez.</small></div>';
}
function init(options){
 ctx=options;
 if(session){loadRemote().then(()=>ctx.refresh()).catch(e=>{saveSession(null);connected=false;ctx.refresh()})}
}
document.addEventListener("click",async(event)=>{
 const b=event.target.closest("[data-action]");if(!b)return;
 const act=b.dataset.action||"";
 if(!act.startsWith("student"))return;
 event.preventDefault();
 if(act.startsWith("studentMode:")){mode=act.split(":")[1];error="";notice="";ctx?.refresh();return}
 try{
  if(act==="studentLogin")return await actionLogin();
  if(act==="studentRegister")return await actionRegister();
  if(act==="studentLogout")return await logout();
  if(act==="studentImport")return importGuest();
  if(act==="studentRetrySync"){await sync();return}
  if(act.startsWith("studentIssue:"))return await issue(Number(act.split(":")[1]));
  if(act==="studentListCodes")return await listCodes();
  if(act==="studentCopyCodes"){let val=$("#studentCodesArea")?.value;if(val){try{await navigator.clipboard.writeText(val)}catch(_){$("#studentCodesArea").select();document.execCommand("copy")}}return}
  if(act==="studentReset")return await resetCode();
 }catch(e){info(e.message||"İşlem tamamlanamadı.",false)}
});
window.addEventListener("online",()=>{if(connected&&dirty>committed)sync()});
window.LGSStudent={init,saveData,isLoggedIn:()=>connected,getStudentToken:getToken,getStudentUid:()=>sessionUid,render,banner:accountWidget,renderAdminCodes,recordQuiz:(score,total,title)=>{
 const s=safeData(ctx.getData());s.quizResults.push({date:new Date().toISOString(),score,total,title});s.quizResults=s.quizResults.slice(-40);ctx.setData(s);saveData(s);
 }};
})();