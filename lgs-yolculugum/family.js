/* LGS Yolculuğum / Beylikdüzü RAM: veli modülleri, davetle eşleştirme ve sınırlı gelişim özeti */
(function(){
"use strict";
const SB="https://uftqsvxieizpclpxbejs.supabase.co";
const APIKEY="sb_publishable_qd7956g-qF9_RVj6xIoX8w_3UQg02R8";
const SESSION="lgs_parent_auth_v1",ENDPOINT=SB+"/functions/v1/lgs-family";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PARENT_MODULES=[
{id:"iletisim",emoji:"💬",title:"Yargılamadan dinlemek",subtitle:"Çocuğunuzla destekleyici iletişim",sections:[["Önce duyguya alan açın","Çocuğunuz zorlandığını anlattığında hemen çözüm önermek yerine, ne yaşadığını anlamaya odaklanın."],["Açık uçlu sorular","“Neden düşük aldın?” yerine “Bu denemede seni en çok zorlayan neydi?” sorusu paylaşmayı kolaylaştırabilir."],["Birlikte seçenek üretin","Yardım teklif edin, ancak çözüme çocuğunuzun da katılmasına alan tanıyın."]],practice:"Bugün çocuğunuza yalnızca dinlemek amacıyla 10 dakika ayırın. Telefonları kaldırın ve sözü mümkün olduğunca ona bırakın."},
{id:"kaygi_destegi",emoji:"🌿",title:"Sınav kaygısında destek atölyesi",subtitle:"Altı aşamalı uygulamalı ebeveyn rehberi",sections:[["Kaygıyı küçümsemeyin","“Korkacak ne var?” yerine “Bu sınavın senin için önemli olduğunu biliyorum.” demeyi deneyin."],["Karşılaştırmadan kaçının","Kardeş veya arkadaş başarılarıyla kıyaslamalar baskıyı artırabilir."],["Gerektiğinde destek alın","Günlük yaşamı belirgin biçimde etkileyen yoğun kaygıda okul psikolojik danışmanıyla görüşün."]],practice:"Kaygı üzerine konuşurken en az bir kez çocuğunuzun güçlü yönünü, not veya puanla ilişkilendirmeden ifade edin."},
{id:"calisma_destegi",emoji:"📘",title:"Çalışma düzenine eşlik",subtitle:"Yönetmek değil, birlikte düzenlemek",sections:[["Ortak plan","Çalışma saatlerini ve mola zamanlarını çocukla birlikte belirleyin; uygulanabilir hedefler seçin."],["Çabayı görün","Yalnızca test sayısına veya netlere odaklanmak yerine öğrenme stratejilerini konuşun."],["Sürdürülebilir ritim","Aşırı uzun çalışmalar yerine uyku, dinlenme ve sosyal zamanı koruyan dengeyi önemseyin."]],practice:"“Bu hafta hangi küçük hedefi seçmek istersin, benim sana nasıl yardım etmem iyi olur?” diye sorun."},
{id:"dijital_denge",emoji:"🌙",title:"Uyku ve dijital denge",subtitle:"Evin ritmini birlikte kurmak",sections:[["Uyku rutini","Ergenler için genellikle 8–10 saat uyku önerilir. Düzenli yatış-kalkış saatleri yardımcı olabilir."],["Ortak ekran kuralları","Tek taraflı yasaklardan ziyade ailece uygulanabilecek, açık ve gerçekçi sınırlar belirleyin."],["Hareket ve mola","Kısa fiziksel hareketler, açık hava ve arkadaşlarla zaman geçirme de günlük yaşama dahil olsun."]],practice:"Ailece uygulanacak tek bir ekran-dışı akşam rutini seçin."},
{id:"deneme_sonuclari",emoji:"📊",title:"Deneme sonuçlarına yaklaşım",subtitle:"Puan yerine gelişimi konuşmak",sections:[["Sonuç bir geri bildirimdir","Tek bir deneme sınavı çocuğunuzun kişiliğini, geleceğini veya değerini belirlemez."],["Çözümü beraber arayın","“Hangi konulara geri dönmek istersin?” sorusu, “Neden yapamadın?” sorusundan daha yapıcı olabilir."],["Küçük gelişmeleri fark edin","Yanlışların azalması, soruyu daha dikkatli okuma veya zamanı daha iyi kullanma gibi ilerlemeleri görün."]],practice:"Son denemeyi konuşurken yalnızca bir güçlü yön ve bir sonraki küçük adımı ele alın."},
{id:"sinav_haftasi",emoji:"☀️",title:"Sınav haftası aile rehberi",subtitle:"Güvenli ve sakin bir ortam oluşturmak",sections:[["Son günlerde denge","Çocuğu daha fazla çalışmaya zorlamak yerine dinlenme, uyku ve düzeni destekleyin."],["Pratik hazırlıklar","Gerekli belgeler, ulaşım ve sınav günü saatini önceden birlikte gözden geçirin."],["Koşulsuz destek","“Sonuç ne olursa olsun yanındayım.” mesajını gerçekçi ve tutarlı davranışlarla gösterin."]],practice:"Sınav öncesi çocuğunuzdan sizin hangi davranışınızın ona daha çok destek olacağını öğrenin."}
];
let context=null,sess=null,uid="",logged=false,parentProgress={completed:[]},summary=null,view="home",selected="",mode="login",notice="",error="",working=false;
let students=[],pending=[],invitationCode="",studentError="",parentSync="",linkedStudentUid="";
try{sess=JSON.parse(sessionStorage.getItem(SESSION)||"null");uid=sess?.user?.id||""}catch(_){}
function normCode(raw){const s=String(raw??"").toUpperCase().replace(/[^A-Z0-9]/g,"");if(!/^VELI[A-HJ-NP-Z2-9]{12}$/.test(s))return "";return "VELI-"+s.slice(4,8)+"-"+s.slice(8,12)+"-"+s.slice(12,16)}
function pseudo(code){return "v"+code.replace(/[^A-Z0-9]/g,"").toLowerCase()+"@parents.lgs.example"}
function saveSession(s){sess=s;uid=s?.user?.id||"";if(s)sessionStorage.setItem(SESSION,JSON.stringify(s));else sessionStorage.removeItem(SESSION)}
async function api(path,method="GET",body,token,extra={}){
 const headers={"apikey":APIKEY,...(token?{"Authorization":"Bearer "+token}:{}),...(body!==undefined?{"Content-Type":"application/json"}:{}),...extra};
 const r=await fetch(SB+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 const text=await r.text();let d={};try{d=text?JSON.parse(text):{}}catch(_){}
 if(!r.ok)throw Error(d.error_description||d.msg||d.message||d.error||("İşlem tamamlanamadı ("+r.status+")."));
 return d;
}
async function authToken(){
 if(!sess)return "";
 if(Number(sess.expires_at||0)<Date.now()/1000+90){
  const s=await api("/auth/v1/token?grant_type=refresh_token","POST",{refresh_token:sess.refresh_token});
  s.expires_at=Math.floor(Date.now()/1000)+Number(s.expires_in||3600);saveSession(s);
 }
 return sess.access_token;
}
async function edge(payload,token=""){
 const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","apikey":APIKEY,...(token?{"Authorization":"Bearer "+token}:{})},body:JSON.stringify(payload)});
 let v={};try{v=await r.json()}catch(_){}
 if(!r.ok)throw Error(v.error||"İşlem tamamlanamadı.");
 return v;
}
function goView(v,id){view=v;selected=id||"";context?.render();window.scrollTo({top:0,behavior:"smooth"})}
function badges(){return '<div class="row"><span class="tag">8. sınıf aile rehberi</span><span class="tag">'+PARENT_MODULES.length+' veli modülü</span></div>'}
function moduleCard(m){
 if(m.id==="kaygi_destegi"){
  const base=parentProgress.advancedModules?.kaygi_destegi,first=Array.isArray(base?.steps)?base.steps.length:0;
  const advanced=window.LGSCurriculum.state(parentProgress,"kaygi_destegi").steps.length;
  return '<div class="tile card deep-card" style="--tile:#e5f4ef"><div class="ico">🌿</div><span class="tag">Temel + ileri düzey program</span><h3>Sınav Kaygısında Ebeveyn Desteği</h3><p>Temel 6 aşama ve ileri düzey 8 uygulama aşaması.</p><small>Temel: '+first+'/6 · İleri: '+advanced+'/8</small><div class="progress"><span style="width:'+Math.round(advanced/8*100)+'%"></span></div><div class="row"><button class="btn small light" data-action="familyLesson:kaygi_destegi">Temel</button><button class="btn small outline" data-action="familyDeep:kaygi_destegi">İleri düzey</button></div></div>';
 }
 return window.LGSCurriculum.card("parent",m.id,parentProgress);
}
let familyDeepMode=false;
function lesson(){
 const l=PARENT_MODULES.find(x=>x.id===selected);if(!l)return home();
 const back='<button class="back" data-action="familyBack">← Veli modüllerine dön</button>';
 if(l.id==="kaygi_destegi"&&!familyDeepMode)
  return back+'<div class="tile" style="margin-bottom:16px"><div class="row" style="justify-content:space-between"><div><strong>🌿 Sınav kaygısında iki düzeyli aile rehberi</strong><p>Temel atölyenin ardından daha derin karar senaryolarını deneyebilirsiniz.</p></div><button class="btn light" data-action="familyDeep:kaygi_destegi">İleri düzeye geç →</button></div></div>'+window.LGSWorkshops.renderParent({progress:parentProgress,logged,saveParent,render:context.render});
 return back+window.LGSCurriculum.render("parent",l.id,{progress:parentProgress,logged,saveParent,render:context.render});
}
function home(){
 return '<div class="hero"><div><div class="eyebrow">VELİLERE ÖZEL · BEYLİKDÜZÜ RAM</div><h1>Sınava birlikte,<br>güvenle. 🤝</h1><p>LGS yolculuğunda çocuğunuzun yanında olmak için destekleyici iletişim, günlük düzen ve sınav haftası rehberi.</p><button class="btn white" data-action="familyView:'+(logged?"dashboard":"login")+'">'+(logged?"Veli panelime git":"Veli hesabı / giriş")+' →</button></div><div class="heroart">🏡</div></div><div class="sectionhead"><div><h2>Ebeveyn rehberlik modülleri</h2><p>Her modülü ayrı ayrı inceleyebilir, küçük aile etkinlikleri uygulayabilirsiniz.</p></div></div><div class="grid">'+PARENT_MODULES.map(moduleCard).join("")+'</div><div class="note good" style="margin-top:17px">Ebeveyn panelinde yalnızca genel ilerleme sayıları gösterilir. Çocuğunuzun özel hedef metinleri, günlük alışkanlık ayrıntıları ve sınav puanları paylaşılmaz.</div>';
}
function loginView(){
 return '<div class="eyebrow">VELİ HESABI</div><h1>Çocuğumun gelişimi 👨‍👩‍👧</h1><p>Çocuğunuzun kendi hesabından oluşturduğu tek kullanımlık veli davet koduyla bağlantı kurabilirsiniz.</p><div class="grid2"><div class="tile"><div class="row" style="margin-bottom:14px"><button class="btn '+(mode==="login"?"primary":"light")+'" data-action="familyMode:login">Giriş yap</button><button class="btn '+(mode==="register"?"primary":"light")+'" data-action="familyMode:register">İlk kez kayıt ol</button></div><div class="stack">'+field("Veli davet / giriş kodu",'<input id="familyCode" autocomplete="username" maxlength="25" placeholder="VELI-XXXX-XXXX-XXXX">')+field(mode==="register"?"Şifre oluştur":"Şifre",'<input id="familyPassword" type="password" autocomplete="'+(mode==="register"?"new-password":"current-password")+'" placeholder="'+(mode==="register"?"En az 10 karakter, harf ve rakam":"Şifrenizi yazın")+'">')+(mode==="register"?field("Şifreyi doğrula",'<input id="familyConfirm" type="password" autocomplete="new-password" placeholder="Şifreyi tekrar yazın">'):"")+'<button class="btn primary" data-action="family'+(mode==="register"?"Register":"Login")+'">'+(mode==="register"?"Veli hesabımı aç":"Giriş yap")+'</button>'+(error?'<div class="note warn">'+esc(error)+'</div>':'')+(notice?'<div class="note good">'+esc(notice)+'</div>':'')+'</div></div><div class="tile" style="background:#eaf4f8"><h3>Bağlantı nasıl kurulur?</h3><p>1. Öğrenci kendi hesabından <strong>Gelişimim</strong> bölümünü açar.</p><p>2. <strong>Veli davet kodu oluştur</strong> düğmesine basar.</p><p>3. Kod size iletilir; siz kod ve kendi şifrenizle hesap açarsınız.</p><p>4. Çocuğunuz bağlantıyı dilediği zaman kaldırabilir.</p><div class="note good">Çocuğunuzun sınav puanları, çalışma notları ve kişisel yanıtları size gösterilmez.</div><button class="btn outline" data-action="familyView:home">Rehberlik modüllerine dön</button></div></div>';
}
function field(label,value){return '<div class="field"><label>'+esc(label)+'</label>'+value+'</div>'}
function counter(number,label){return '<div class="stat"><strong>'+esc(number)+'</strong><small>'+esc(label)+'</small></div>'}
function dashboard(){
 const completed=parentProgress.completed.length;
 let top='<div class="row" style="justify-content:space-between;align-items:start"><div><div class="eyebrow">VELİ KİŞİSEL ALANIM</div><h1>Aile gelişim panelim 🌱</h1><p>Destekleyici aile rehberliği ve çocuğunuzun paylaşıma açtığı genel ilerleme özeti.</p></div><button class="btn small outline" data-action="familyLogout">Çıkış yap</button></div>';
 top+=window.LGSWorkshops.parentSummary(parentProgress)+window.LGSCurriculum.summary("parent",parentProgress);top+='<div class="tile"><div class="row" style="justify-content:space-between"><div><h3>Benim öğrenme ilerlemem</h3><p>Veli modülleri: '+completed+' / '+PARENT_MODULES.length+'</p></div><button class="btn small light" data-action="familyView:home">Modülleri aç →</button></div><div class="progress"><span style="width:'+Math.round(completed/PARENT_MODULES.length*100)+'%"></span></div></div>';
 if(summary===null)return top+'<div class="tile" style="margin-top:16px">Gelişim bilgileri yükleniyor…</div>';
 if(!summary.linked)return top+'<div class="note warn">Öğrenci bağlantısı şu anda aktif değil. Çocuğunuz bağlantıyı kaldırmış olabilir. Yeniden davet kodu oluşturması gerekir.</div>';
 const s=summary.summary||{};let pct=Math.round((Number(s.completed_modules)||0)/(Number(s.total_modules)||12)*100);
 return top+'<div class="sectionhead"><div><h2>Çocuğumun ilerleme özeti</h2><p>Bu bilgiler genel tamamlama sayılarını içerir, kişisel yanıtları içermez.</p></div><button class="btn small outline" data-action="familyReload">Yenile ↻</button></div><div class="statrow">'+counter((s.completed_modules||0)+"/"+(s.total_modules||12),"Tamamlanan modül")+counter(s.goals_completed||0,"Tamamlanan çalışma hedefi")+counter(s.quizzes_attempted||0,"Mini test denemesi")+'</div><div class="grid2"><div class="tile"><h3>Rehberlik modülü ilerlemesi</h3><h2>'+pct+'%</h2><div class="progress"><span style="width:'+pct+'%"></span></div><p>Çocuğunuz '+(s.completed_modules||0)+' modülü tamamladı. Onun hızını ve tercihlerini desteklemeniz yeterli.</p></div><div class="tile"><h3>Genel çalışma katılımı</h3><div class="listrow"><strong>Planlanan hedefler</strong><strong>'+(s.goals_added||0)+'</strong></div><div class="listrow"><strong>Tamamlanan hedefler</strong><strong>'+(s.goals_completed||0)+'</strong></div><div class="listrow"><strong>Etkinlik tamamlama</strong><strong>'+(s.activities_completed||0)+'</strong></div></div></div><div class="note good">Bu panel başarı veya puan sıralaması değildir. Çocuğunuzun çalışma notları, kaygı yanıtları ve mini test puanları gizli kalır.</div>';
}
function render(){if(!logged&&sess)return '<div class="tile">Veli oturumunuz yükleniyor…</div>';if(view==="lesson")return lesson();if(view==="login")return loginView();if(view==="dashboard"){if(!logged){view="login";return loginView()}return dashboard()}return home()}
async function refreshOverview(){
 if(!sess||!logged)return;
 try{summary=await edge({op:"overview"},await authToken());error=""}
 catch(e){error=e.message;summary={linked:false}}
 context?.render();
}
async function loadParent(){
 const token=await authToken();
 const u=await api("/auth/v1/user","GET",undefined,token);
 if(u?.app_metadata?.lgs_parent!==true)throw Error("Bu hesap veli hesabı değil.");
 const r=await api("/rest/v1/lgs_parent_progress?select=state&parent_id=eq."+encodeURIComponent(uid),"GET",undefined,token);
 const previous=Array.isArray(r)?r[0]?.state:null;
 parentProgress={completed:Array.isArray(previous?.completed)?previous.completed.filter(x=>typeof x==="string").slice(0,6):[],advancedModules:previous?.advancedModules&&typeof previous.advancedModules==="object"&&!Array.isArray(previous.advancedModules)?previous.advancedModules:{},deepModules:previous?.deepModules&&typeof previous.deepModules==="object"&&!Array.isArray(previous.deepModules)?previous.deepModules:{}};
 logged=true;view="dashboard";context?.render();
 await refreshOverview();
}
async function parentLogin(code,pw){
 const c=normCode(code);if(!c||!pw)throw Error("Veli kodunuzu ve şifrenizi kontrol edin.");
 const s=await api("/auth/v1/token?grant_type=password","POST",{email:pseudo(c),password:pw});
 if(!s.access_token||s.user?.app_metadata?.lgs_parent!==true)throw Error("Veli girişi başarısız.");
 s.expires_at=Math.floor(Date.now()/1000)+Number(s.expires_in||3600);saveSession(s);logged=false;
 try{await loadParent();error="";notice="Veli hesabınıza giriş yaptınız."}catch(e){saveSession(null);logged=false;throw e}
}
async function register(){
 const c=$("#familyCode")?.value,pw=$("#familyPassword")?.value||"",confirm=$("#familyConfirm")?.value||"";
 if(pw!==confirm)throw Error("Şifrelerin ikisi de aynı olmalı.");
 if(pw.length<10||!/[A-Za-z]/.test(pw)||!/\d/.test(pw))throw Error("Şifreniz en az 10 karakter olmalı; harf ve rakam içermelidir.");
 await edge({op:"register",code:c,password:pw});
 await parentLogin(c,pw);
}
let parentSaveQueue=Promise.resolve();
async function saveParent(){
 if(!logged)return;
 const currentUid=uid,snapshot=JSON.parse(JSON.stringify(parentProgress));
 parentSync="Kaydediliyor…";
 parentSaveQueue=parentSaveQueue.catch(()=>{}).then(async()=>{
  if(!logged||uid!==currentUid)return;
  const tok=await authToken();
  await api("/rest/v1/lgs_parent_progress?on_conflict=parent_id","POST",{parent_id:currentUid,state:snapshot,updated_at:new Date().toISOString()},tok,{"Prefer":"resolution=merge-duplicates,return=minimal"});
  parentSync="Kaydedildi";
 });
 return parentSaveQueue;
}
async function logout(){
 try{await api("/auth/v1/logout","POST",undefined,await authToken())}catch(_){}
 saveSession(null);logged=false;summary=null;parentProgress={completed:[]};view="home";context?.render();
}
function clearStudentLinks(){students=[];pending=[];invitationCode="";studentError="";linkedStudentUid=""}
async function refreshLinks(){
 if(!window.LGSStudent?.isLoggedIn()){clearStudentLinks();return}
 const current=window.LGSStudent.getStudentUid();
 if(linkedStudentUid!==current){clearStudentLinks();linkedStudentUid=current}
 try{
  const x=await edge({op:"student-links"},await window.LGSStudent.getStudentToken());
  if(current!==window.LGSStudent.getStudentUid())return;
  students=x.parents||[];pending=x.invites||[];studentError="";
 }catch(e){if(current===window.LGSStudent.getStudentUid())studentError=e.message}
 context?.render();
}
function renderStudentLinks(){
 if(!window.LGSStudent?.isLoggedIn())return "";
 const current=window.LGSStudent.getStudentUid();
 if(current!==linkedStudentUid){clearStudentLinks();linkedStudentUid=current}
 const active=students.filter(x=>x.active);
 let html='<div class="tile" style="margin-top:16px"><div class="row" style="justify-content:space-between"><div><h3>👨‍👩‍👧 Veliyle ilerleme paylaşımı</h3><p>Paylaşım yalnızca senin onayınla açılır. Veli, puanlarını veya özel notlarını görmez.</p></div><span class="tag">Sen kontrol edersin</span></div><div class="row"><button class="btn primary small" data-action="familyInviteStudent">Veli davet kodu oluştur</button><button class="btn outline small" data-action="familyReloadLinks">Bağlantılarımı yenile</button></div>'+(invitationCode?'<div class="note good"><strong>Veliye vereceğin kod</strong><h2 style="font-family:monospace;letter-spacing:.05em">'+esc(invitationCode)+'</h2><small>Bu kod 7 gün geçerlidir ve yalnızca bir kez kullanılabilir.</small><div><button class="btn small outline" data-action="familyCopyInvite">Kodu kopyala</button></div></div>':'')+(studentError?'<div class="note warn">'+esc(studentError)+'</div>':'')+'<div style="margin-top:13px">';
 active.forEach((x,i)=>html+='<div class="listrow"><div><strong>Veli bağlantısı '+(i+1)+'</strong><small>Bağlantı: '+new Date(x.linked_at).toLocaleDateString("tr-TR")+'</small></div><button class="btn small outline" data-action="familyRevoke:'+esc(x.id)+'">Erişimi kaldır</button></div>');
 if(!active.length)html+='<p>Henüz bağlantılı bir veli hesabı yok.</p>';
 pending.forEach(x=>html+='<div class="listrow"><div><strong>'+esc(x.code)+'</strong><small>Kullanılmamış davet kodu</small></div><button class="btn small outline" data-action="familyCancelInvite:'+esc(x.code)+'">Kodu iptal et</button></div>');
 return html+'</div><div class="note warn">Veli hesabı bağlantısı oluşturduğunda, veli yalnızca modül ve etkinlik tamamlanma sayılarını görür. Paylaşmak istemezsen hiç kod üretmeyebilirsin.</div></div>';
}
function init(opts){context=opts;if(sess){loadParent().then(()=>context?.render()).catch(_=>{saveSession(null);logged=false;context?.render()})}}
document.addEventListener("click",async e=>{
 const el=e.target.closest("[data-action]");if(!el)return;
 const a=el.dataset.action||"";if(!a.startsWith("family"))return;
 e.preventDefault();if(working)return;
 if(a==="familyBack")return goView("home");
 if(a.startsWith("familyView:")){error="";return goView(a.split(":")[1])}
 if(a.startsWith("familyMode:")){mode=a.split(":")[1];error="";notice="";return context?.render()}
 if(a.startsWith("familyLesson:")){const id=a.substring(13);familyDeepMode=false;if(id==="kaygi_destegi")window.LGSWorkshops.enter("parent");else window.LGSCurriculum.enter("parent",id);return goView("lesson",id)}
 if(a.startsWith("familyDeep:")){const id=a.substring("familyDeep:".length);familyDeepMode=true;window.LGSCurriculum.enter("parent",id);return goView("lesson",id)}
 try{
 working=true;
 if(a==="familyLogin"){await parentLogin($("#familyCode")?.value,$("#familyPassword")?.value);return context?.render()}
 if(a==="familyRegister"){await register();return context?.render()}
 if(a==="familyLogout")return await logout();
 if(a==="familyReload")return await refreshOverview();
 if(a.startsWith("familyComplete:")){
  const id=a.substring(15),prev=parentProgress.completed.slice();
  if(!parentProgress.completed.includes(id))parentProgress.completed.push(id);
  try{await saveParent()}catch(e){parentProgress.completed=prev;throw e}
  return context?.render();
 }
 if(a==="familyInviteStudent"){const x=await edge({op:"make-invite"},await window.LGSStudent.getStudentToken());invitationCode=x.code;await refreshLinks();return}
 if(a==="familyReloadLinks")return await refreshLinks();
 if(a==="familyCopyInvite"){if(invitationCode)await navigator.clipboard.writeText(invitationCode);return}
 if(a.startsWith("familyCancelInvite:")){const code=a.substring(19);if(!confirm("Bu kullanılmamış veli davet kodu iptal edilsin mi?"))return;await edge({op:"cancel-invite",code},await window.LGSStudent.getStudentToken());if(invitationCode===code)invitationCode="";return await refreshLinks()}
 if(a.startsWith("familyRevoke:")){const id=a.substring(13);if(!confirm("Bu veli hesabının çocuğunun gelişim özetine erişimini kaldıralım mı?"))return;await edge({op:"revoke-parent",parent_id:id},await window.LGSStudent.getStudentToken());return await refreshLinks()}
 }catch(err){
  const msg=err?.message||"İşlem tamamlanamadı.";
  if(a.includes("Student")||a.includes("Invite")||a.includes("Links")||a.includes("Revoke")){studentError=msg;context?.render()}else{error=msg;notice="";context?.render()}
 }finally{working=false}
});
window.LGSFamily={init,render,renderStudentLinks,refreshLinks,clearStudentLinks,isLoggedIn:()=>logged};
})();