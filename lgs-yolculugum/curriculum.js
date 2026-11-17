/* Beylikdüzü RAM · LGS Yolculuğum · 8 aşamalı dijital öğrenme atölyesi
 * Tekil seçimler/quiz cevapları cihaz belleğinde geçicidir; sunucuya yazılmaz.
 * Yalnızca tamamlanan aşamalar, sabit plan seçenekleri ve uygulama tarihleri saklanır.
 */
(function(){
"use strict";
const DATA=window.LGSCurriculumData;
const lookup={student:Object.fromEntries(DATA.student.map(x=>[x.id,x])),parent:Object.fromEntries(DATA.parent.map(x=>[x.id,x]))};
const steps=["Kendimi tanıyorum","Konuya yakından bakıyorum","Yaygın düşünceleri ayırt ediyorum","Bilgimi deniyorum","Karar laboratuvarı 1","Karar laboratuvarı 2","Beceri uygulaması","Günlük yaşam planım"];
const temp=new Map();
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date=()=>new Date().toLocaleDateString("sv-SE");
const key=(kind,id)=>kind+"|"+id;
const clamp=(v,max)=>Math.max(0,Math.min(max,Number(v)||0));
function get(kind,id){return lookup[kind]?.[id]}
function state(data,id){
 const v=data?.deepModules?.[id]||{};
 return {steps:Array.isArray(v.steps)?[...new Set(v.steps.filter(n=>Number.isInteger(n)&&n>=0&&n<8))].sort((a,b)=>a-b):[],
  plan: v.plan&&typeof v.plan==="object"?v.plan:{},
  practiceDates:Array.isArray(v.practiceDates)?[...new Set(v.practiceDates.filter(x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)))].slice(-21):[]};
}
function ui(kind,id,data){
 const k=key(kind,id);
 if(!temp.has(k)){
  const x=state(data,id);
  temp.set(k,{step:x.steps.length>=8?8:x.steps.length,signals:[],read:new Set(),myth:{},quiz:{},scenario:{},practice:new Set(),planWhen:"",planDo:"",error:"",saving:false});
 }
 return temp.get(k);
}
function enter(kind,id){temp.delete(key(kind,id))}
function card(kind,id,data){
 const m=get(kind,id),s=state(data,id),done=s.steps.length,pct=Math.round(done/8*100);
 if(!m)return "";
 return '<div class="tile card deep-card" style="--tile:#e9f4f8"><div class="ico">'+m.icon+'</div><span class="tag">8 aşamalı psikoeğitim · '+(done===8?"Tamamlandı":"Yaklaşık 20–30 dk")+'</span><h3>'+esc(m.title)+'</h3><p>'+esc(m.summary)+'</p><div class="progress" style="margin:8px 0"><span style="width:'+pct+'%"></span></div><button class="linklike" data-action="'+(kind==="student"?"lesson:":"familyLesson:")+esc(id)+'">'+(done===8?"✓ Atölyeyi yeniden incele":"Atölyeyi aç")+' · '+done+'/8 →</button></div>';
}
function header(kind,m,s,u){
 let c='<div class="deep-hero"><div class="eyebrow">'+(kind==="student"?"8. SINIF · ETKİLEŞİMLİ ÖĞRENME":"VELİ AKADEMİSİ · ETKİLEŞİMLİ ÖĞRENME")+'</div><div class="row" style="gap:15px;align-items:center;margin:10px 0"><span style="font-size:45px">'+m.icon+'</span><div><h1>'+esc(m.title)+'</h1><p>'+esc(m.summary)+'</p></div></div><div class="row"><span class="tag">8 etkinlik aşaması</span><span class="tag">15–30 dakika</span><span class="tag">'+s.steps.length+' / 8 tamamlandı</span></div><div class="progress" style="margin:18px 0 13px"><span style="width:'+Math.round(s.steps.length/8*100)+'%"></span></div><div class="deep-nav">';
 for(let i=0;i<8;i++){const can=i<=s.steps.length||s.steps.length===8;c+='<button class="deep-dot '+(u.step===i?"on ":"")+(s.steps.includes(i)?"done":"")+'" data-deep="'+kind+':'+m.id+':goto:'+i+'" '+(!can?"disabled":"")+' title="'+esc(steps[i])+'">'+(s.steps.includes(i)?"✓":(i+1))+'</button>'}
 c+='</div></div>';return c;
}
function button(kind,id,act,label,disabled=false,variant="primary"){
 return '<button class="btn '+variant+'" '+(disabled?"disabled":"")+' data-deep="'+kind+':'+esc(id)+':'+act+'">'+esc(label)+'</button>';
}
function foot(){return '<div class="deep-footer">Bu atölye bilgilendirme ve beceri denemesi amaçlıdır. Kişisel yanıtların kaydedilmez. Psikolojik test veya tanı aracı değildir.</div>'}
function intro(kind,m,u){
 let c='<div class="deep-prose"><h2>Bu modülde neler kazanacağım?</h2><p>'+esc(m.summary)+'</p><div class="deep-outcomes"><div><strong>Fark et</strong><p>'+esc(m.learn[0][0])+'</p></div><div><strong>Uygula</strong><p>'+esc(m.skill[0])+'</p></div><div><strong>Sürdür</strong><p>Günlük yaşamda kullanabileceğin küçük bir plan oluştur.</p></div></div><h3>Bugün hangisi üzerinde durmak istersin?</h3><p class="muted">Bir veya birkaç alan seç. Seçimin hesapta saklanmaz ve puanlanmaz.</p><div class="deep-options">';
 for(let i=0;i<3;i++)c+='<button class="deep-option '+(u.signals.includes(i)?"selected":"")+'" data-deep="'+kind+':'+m.id+':signal:'+i+'">'+(u.signals.includes(i)?"✓ ":"○ ")+esc(m.learn[i][0])+'</button>';
 return c+'</div>'+button(kind,m.id,"finish:0","Atölyeye başla →",u.signals.length===0)+"</div>";
}
function learn(kind,m,u){
 let c='<h2>Öğrenme köşesi</h2><p class="muted">Dört başlığa dokunarak örnekleri oku. Hepsini inceledikten sonra devam edebilirsin.</p><div class="deep-learn">';
 for(let i=0;i<m.learn.length;i++){const [title,body]=m.learn[i];let read=u.read.has(i);c+='<button type="button" class="deep-learn-card '+(read?"read":"")+'" data-deep="'+kind+':'+m.id+':read:'+i+'"><span class="deep-number">'+(read?"✓":String(i+1))+'</span><strong>'+esc(title)+'</strong><span>'+esc(body)+'</span><small>'+(read?"İncelendi":"İnceledim diye işaretle")+'</small></button>'}
 return c+'</div>'+button(kind,m.id,"finish:1","Öğrendim, devam et →",u.read.size<4);
}
function myths(kind,m,u){
 let c='<h2>Düşünceleri ayırt et</h2><p class="muted">Her çiftte, günlük yaşamda daha yardımcı olabilecek ifadeyi seç. Seçimlerin puanlanmaz.</p>';
 m.myths.forEach((pair,i)=>{
  const v=u.myth[i];
  c+='<div class="deep-question"><div class="eyebrow">ÇİFT '+(i+1)+' / '+m.myths.length+'</div><div class="deep-options">'+pair.map((text,j)=>'<button class="deep-option '+(v===j?"selected":"")+'" data-deep="'+kind+':'+m.id+':myth:'+i+':'+j+'">'+esc(text)+'</button>').join("")+'</div>';
  if(v!==undefined)c+='<p class="deep-feedback">'+(v===1?"✅ Bu ifade daha esnek ve uygulamaya dönük.":"🔎 Diğer ifadeyi de düşün: Daha esnek ve yapıcı bir bakış sunabilir.")+'</p>';
  c+='</div>';
 });
 return c+button(kind,m.id,"finish:2","Farkı anladım →",Object.keys(u.myth).length!==m.myths.length);
}
function check(kind,m,u){
 let c='<h2>Bilgimi deniyorum</h2><p class="muted">Bu bölüm bir sınav değil. Seçtiğin cevabın nedenini görerek öğrenebilirsin; yanlış seçim yapman ilerlemene engel değildir.</p>';
 m.questions.forEach((x,i)=>{
  const [question,answers,correct,explanation]=x,selected=u.quiz[i];
  c+='<div class="deep-question"><div class="eyebrow">SORU '+(i+1)+'</div><h3>'+esc(question)+'</h3><div class="deep-options">'+answers.map((v,j)=>'<button class="deep-option '+(selected===j?"selected":"")+'" data-deep="'+kind+':'+m.id+':quiz:'+i+':'+j+'">'+esc(v)+'</button>').join("")+'</div>';
  if(selected!==undefined)c+='<p class="deep-feedback">'+(selected===correct?"✅ İyi seçim. ":"🌱 Öğrenme fırsatı. ")+esc(explanation)+'</p>';
  c+='</div>';
 });
 return c+button(kind,m.id,"finish:3","Soruları tamamladım →",Object.keys(u.quiz).length!==m.questions.length);
}
function scenario(kind,m,u,which){
 const x=m.scenarios[which],selected=u.scenario[which];
 let c='<div class="eyebrow">GERÇEK YAŞAM SENARYOSU '+(which+1)+' / 2</div><h2>Bu durumda nasıl davranabilirsin?</h2><div class="deep-story">'+esc(x[0])+'</div><p class="muted">Farklı yanıtların olası etkilerini keşfetmek için seçim yap.</p><div class="deep-options">';
 x[1].forEach(([label,feedback],i)=>{c+='<button class="deep-option '+(selected===i?"selected":"")+'" data-deep="'+kind+':'+m.id+':scenario:'+which+':'+i+'">'+esc(label)+'</button>'});
 c+='</div>';
 if(selected!==undefined)c+='<div class="deep-feedback">'+esc(x[1][selected][1])+'<div class="deep-hint">Başka bir seçeneği de seçip farklı bir yaklaşımı karşılaştırabilirsin.</div></div>';
 return c+button(kind,m.id,"finish:"+(which+4),which?"Beceri provama geç →":"İkinci duruma geç →",selected===undefined);
}
function skill(kind,m,u){
 let c='<h2>Beceri provası</h2><p>'+esc(m.skill[0])+'</p><p class="muted">Her adımı okuyup kendine uygun bir biçimde zihninde canlandır veya uygula. İşaretlemeler bu oturumda kalır.</p><div class="deep-skill">';
 m.skill[1].forEach((v,i)=>{let done=u.practice.has(i);c+='<button type="button" data-deep="'+kind+':'+m.id+':practice:'+i+'" class="deep-skillrow '+(done?"selected":"")+'"><span class="deep-number">'+(done?"✓":i+1)+'</span><span>'+esc(v)+'</span></button>'});
 return c+'</div><div class="note good">Bu bölümde belirli bir duygu yaşaman veya egzersizin mutlaka işe yaraması beklenmiyor. Amaç seçenekleri deneyimlemek.</div>'+button(kind,m.id,"finish:6","Prova tamamlandı →",u.practice.size!==3);
}
function plan(kind,m,u,s){
 const [when,actions]=m.plan;
 let c='<h2>Günlük yaşama aktarma planım</h2><p class="muted">Bir durum ve bir strateji seç. Yalnızca seçenek numaraları hesabında saklanır; özel notlar yazman istenmez.</p><div class="deep-question"><h3>Hangi durumda deneyeceğim?</h3><div class="deep-options">'+when.map((x,i)=>'<button class="deep-option '+(u.planWhen===String(i)?"selected":"")+'" data-deep="'+kind+':'+m.id+':when:'+i+'">'+esc(x)+'</button>').join("")+'</div></div><div class="deep-question"><h3>Ne yapacağım?</h3><div class="deep-options">'+actions.map((x,i)=>'<button class="deep-option '+(u.planDo===String(i)?"selected":"")+'" data-deep="'+kind+':'+m.id+':do:'+i+'">'+esc(x)+'</button>').join("")+'</div></div>';
 if(u.planWhen!==""&&u.planDo!=="")c+='<div class="note good"><strong>Benim küçük planım:</strong> '+esc(when[Number(u.planWhen)])+' → '+esc(actions[Number(u.planDo)])+'</div>';
 return c+button(kind,m.id,"finish:7","Planımı oluştur ve bitir",u.planWhen===""||u.planDo==="");
}
function done(kind,m,s){
 const dates=new Set(s.practiceDates);
 let days='';
 for(let k=6;k>=0;k--){let d=new Date();d.setDate(d.getDate()-k);let dt=d.toLocaleDateString("sv-SE");days+='<span class="deep-day '+(dates.has(dt)?"marked":"")+'" title="'+dt+'">'+(dates.has(dt)?"✓":d.toLocaleDateString("tr-TR",{weekday:"short"}))+'</span>'}
 return '<div class="deep-done"><div style="font-size:45px">🌱</div><h2>Atölye tamamlandı</h2><p>Bilgiyi okudun, karar seçeneklerini inceledin, bir beceri provası yaptın ve kendi küçük uygulama planını seçtin.</p><div class="note good"><strong>Günlük yaşama taşı:</strong> Uygun olduğunda planını dene. Sonrasında uygulama işaretlemesi yapabilirsin. Bu işaretleme başarı, beceri düzeyi veya psikolojik durum ölçümü değildir.</div><div class="deep-days">'+days+'</div><div class="row">'+button(kind,m.id,"log","Bugünkü uygulamayı denedim",dates.has(date()))+button(kind,m.id,"goto:0","Atölyeyi yeniden incele",false,"outline")+'</div><p class="muted">'+s.practiceDates.length+' farklı gün işaretlendi.'+(kind==="parent"?" Veli hesabınla giriş yaptıysan kaydın saklanır.":" Öğrenci hesabınla giriş yaptıysan ilerlemen diğer cihazlarda da görünür.")+'</p></div>';
}
function render(kind,id,context){
 const m=get(kind,id);if(!m)return '<div class="note warn">Bu atölye bulunamadı.</div>';
 const data=kind==="student"?context.data:context.progress;
 const s=state(data,id),u=ui(kind,id,data);
 contextFor.set(key(kind,id),context);
 let c='<div class="deep-shell">'+header(kind,m,s,u)+'<div class="deep-panel">';
 if(u.step>=8)c+=done(kind,m,s);
 else{
  c+='<div class="eyebrow">AŞAMA '+(u.step+1)+' / 8</div><h2 class="deep-stage-title">'+steps[u.step]+'</h2>';
  c+= [intro,learn,myths,check,()=>scenario(kind,m,u,0),()=>scenario(kind,m,u,1),skill,()=>plan(kind,m,u,s)][u.step](kind,m,u);
 }
 return c+'</div>'+foot()+'</div>';
}
const contextFor=new Map();
function commit(kind,id,partial,finish=false){
 const context=contextFor.get(key(kind,id));if(!context)return;
 const obj=kind==="student"?context.data:context.progress;
 if(!obj.deepModules||typeof obj.deepModules!=="object")obj.deepModules={};
 const old=state(obj,id),updated={...old,...partial};
 updated.steps=[...new Set(updated.steps)].sort((a,b)=>a-b);
 updated.practiceDates=[...new Set(updated.practiceDates)].slice(-21);
 obj.deepModules[id]=updated;
 if(finish&&!obj.completed.includes(id))obj.completed.push(id);
 if(kind==="student"){context.save();context.render()}
 else{if(context.logged)Promise.resolve(context.saveParent()).catch(()=>{alert("İlerlemen kaydedilemedi. İnternet bağlantını kontrol et.")});context.render()}
}
function action(kind,id,act,parts){
 const m=get(kind,id),ctx=contextFor.get(key(kind,id));if(!m||!ctx)return;
 const d=kind==="student"?ctx.data:ctx.progress,u=ui(kind,id,d),s=state(d,id);
 const n=v=>Number(v);
 if(act==="goto"){const i=n(parts[0]);if(i>=0&&i<=8&&(i<=s.steps.length||s.steps.length===8)){u.step=i;ctx.render()}return}
 if(act==="signal"){let i=n(parts[0]);u.signals=u.signals.includes(i)?u.signals.filter(x=>x!==i):[...u.signals,i];ctx.render();return}
 if(act==="read"){u.read.add(n(parts[0]));ctx.render();return}
 if(act==="myth"){u.myth[n(parts[0])]=n(parts[1]);ctx.render();return}
 if(act==="quiz"){u.quiz[n(parts[0])]=n(parts[1]);ctx.render();return}
 if(act==="scenario"){u.scenario[n(parts[0])]=n(parts[1]);ctx.render();return}
 if(act==="practice"){u.practice.add(n(parts[0]));ctx.render();return}
 if(act==="when"){u.planWhen=parts[0];ctx.render();return}
 if(act==="do"){u.planDo=parts[0];ctx.render();return}
 if(act==="finish"){
  const step=n(parts[0]);if(step!==u.step)return;
  const valid=[()=>u.signals.length>0,()=>u.read.size===4,()=>Object.keys(u.myth).length===m.myths.length,()=>Object.keys(u.quiz).length===m.questions.length,()=>u.scenario[0]!==undefined,()=>u.scenario[1]!==undefined,()=>u.practice.size===3,()=>u.planWhen!==""&&u.planDo!==""][step]?.();
  if(!valid)return;
  u.step=Math.min(8,step+1);
  const stepsCompleted=[...new Set([...s.steps,step])];
  const p=step===7?{plan:{when:Number(u.planWhen),action:Number(u.planDo)}}:{};
  commit(kind,id,{...p,steps:stepsCompleted},step===7);
  return;
 }
 if(act==="log"){
  const today=date();if(s.steps.length!==8||s.practiceDates.includes(today))return;
  commit(kind,id,{practiceDates:[...s.practiceDates,today]});return;
 }
}
document.addEventListener("click",ev=>{
 const b=ev.target.closest("[data-deep]");if(!b||b.disabled)return;
 ev.preventDefault();const parts=(b.dataset.deep||"").split(":"),kind=parts.shift(),id=parts.shift(),act=parts.shift();
 if(!get(kind,id))return;
 action(kind,id,act,parts);
});
function summary(kind,data){
 const list=(kind==="student"?DATA.student:DATA.parent).map(m=>({m,s:state(data,m.id)}));
 const started=list.filter(x=>x.s.steps.length>0),complete=list.filter(x=>x.s.steps.length===8);
 const recent=[...started].sort((a,b)=>b.s.steps.length-a.s.steps.length).slice(0,4);
 let h='<div class="tile" style="margin-top:16px"><div class="row" style="justify-content:space-between;align-items:center"><div><h3>🧩 Derinleştirilmiş öğrenme atölyelerim</h3><p>'+started.length+' / '+list.length+' atölyede adım attım · '+complete.length+' tamamladım</p></div></div><div class="progress"><span style="width:'+Math.round(complete.length/list.length*100)+'%"></span></div>';
 for(const x of recent)h+='<div class="deep-summary-row"><span>'+esc(x.m.icon+" "+x.m.title)+'</span><strong>'+x.s.steps.length+'/8</strong></div>';
 return h+'<small>Buradaki sayılar yalnızca etkinlik tamamlamayı gösterir. Psikolojik ölçüm değildir.</small></div>';
}
window.LGSCurriculum={has:(kind,id)=>!!get(kind,id),render,enter,card,state,summary,count:{student:DATA.student.length,parent:DATA.parent.length}};
})();