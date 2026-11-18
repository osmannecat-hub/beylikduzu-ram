/* Beylikdüzü RAM | LGS Yolculuğum | Akademik gelişim ve çalışma planı
  Yalnızca öğrenci cihazında / öğrencinin kendi Supabase progress state'inde saklanır.
  Soru veya öğrenci kimlik bilgisi toplanmaz. Deneme neti resmi merkezi sınav puanı değildir.
*/
(function(){
"use strict";
const SUBJECTS=[
 {id:"tr",name:"Türkçe",count:20,emoji:"📖",topics:["Paragrafta anlam","Sözcükte ve cümlede anlam","Fiilimsiler","Cümlenin ögeleri","Yazım kuralları","Noktalama işaretleri","Metin türleri","Sözel mantık"]},
 {id:"ma",name:"Matematik",count:20,emoji:"🔢",topics:["Çarpanlar ve Katlar","Üslü İfadeler","Kareköklü İfadeler","Veri Analizi","Basit Olayların Olma Olasılığı","Cebirsel İfadeler ve Özdeşlikler","Doğrusal Denklemler","Eşitsizlikler","Üçgenler","Eşlik ve Benzerlik"]},
 {id:"fen",name:"Fen Bilimleri",count:20,emoji:"🔬",topics:["Mevsimler ve İklim","DNA ve Genetik Kod","Basınç","Madde ve Endüstri","Basit Makineler","Enerji Dönüşümleri ve Çevre Bilimi","Elektrik Yükleri ve Elektrik Enerjisi"]},
 {id:"ink",name:"T.C. İnkılap Tarihi",count:10,emoji:"🏛️",topics:["Bir Kahraman Doğuyor","Millî Uyanış","Ya İstiklal Ya Ölüm!","Atatürkçülük ve Çağdaşlaşan Türkiye","Demokratikleşme Çabaları","Atatürk Dönemi Türk Dış Politikası","Atatürk'ün Ölümü ve Sonrası"]},
 {id:"din",name:"Din Kültürü",count:10,emoji:"📗",topics:["Kader İnancı","Zekât ve Sadaka","Din ve Hayat","Hz. Muhammed'in Örnekliği","Kur'an-ı Kerim ve Özellikleri"]},
 {id:"en",name:"İngilizce",count:10,emoji:"🌍",topics:["Friendship","Teen Life","In the Kitchen","On the Phone","The Internet","Adventures","Tourism","Chores","Science","Natural Forces"]}
];
const MAX={exams:20,topics:60,plan:80,mistakes:50};
const $=q=>document.querySelector(q);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const trim=(v,n=100)=>String(v??"").trim().slice(0,n);
const ident=()=>crypto&&typeof crypto.randomUUID==="function"?crypto.randomUUID():"a"+Date.now().toString(36)+Math.random().toString(36).slice(2,9);
const getS=id=>SUBJECTS.find(x=>x.id===id);
const keyDate=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
const today=()=>keyDate(new Date());
const datePlus=(offset)=>{let d=new Date();d.setDate(d.getDate()+offset);return keyDate(d)};
const presentDate=d=>{try{let x=new Date(d+"T12:00:00");return x.toLocaleDateString("tr-TR",{day:"2-digit",month:"short"})}catch{return String(d||"")}};
const fmt=n=>(Number(n)||0).toLocaleString("tr-TR",{minimumFractionDigits:1,maximumFractionDigits:2});
const net=(s,d,w)=>Number(d)-Number(w)/3;
function numeric(v,max){let x=Number(v);return Number.isInteger(x)&&x>=0&&x<=max?x:null}
function sanitize(raw){
 const x=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 const exam=Array.isArray(x.exams)?x.exams:[];
 const topics=Array.isArray(x.topics)?x.topics:[];
 const plan=Array.isArray(x.plan)?x.plan:[];
 const mistakes=Array.isArray(x.mistakes)?x.mistakes:[];
 return {
 exams:exam.slice(-MAX.exams).filter(v=>v&&typeof v==="object").map(v=>{
  let results={};
  for(let s of SUBJECTS){let d=numeric(v.results?.[s.id]?.d,s.count),w=numeric(v.results?.[s.id]?.w,s.count);if(d!==null&&w!==null&&d+w<=s.count)results[s.id]={d,w}}
  return {id:trim(v.id,60),date:/^\d{4}-\d{2}-\d{2}$/.test(v.date)?v.date:today(),label:trim(v.label,65),results}
 }).filter(v=>v.id&&Object.keys(v.results).length),
 topics:topics.slice(-MAX.topics).filter(v=>getS(v?.subject)&&trim(v?.topic)).map(v=>({id:trim(v.id,60),subject:v.subject,topic:trim(v.topic,75),status:["tekrar","calisiliyor","pekisti"].includes(v.status)?v.status:"tekrar",date:/^\d{4}-\d{2}-\d{2}$/.test(v.date)?v.date:today()})),
 plan:plan.slice(-MAX.plan).filter(v=>getS(v?.subject)&&trim(v?.topic)).map(v=>({id:trim(v.id,60),subject:v.subject,topic:trim(v.topic,75),date:/^\d{4}-\d{2}-\d{2}$/.test(v.date)?v.date:today(),minutes:[15,20,25,30,40,45,60].includes(Number(v.minutes))?Number(v.minutes):25,done:!!v.done,source:v.source==="suggested"?"suggested":"manual"})),
 mistakes:mistakes.slice(-MAX.mistakes).filter(v=>getS(v?.subject)&&trim(v?.topic)).map(v=>({id:trim(v.id,60),subject:v.subject,topic:trim(v.topic,75),reason:["konu","okuma","zaman","dikkat","diger"].includes(v.reason)?v.reason:"diger",date:/^\d{4}-\d{2}-\d{2}$/.test(v.date)?v.date:today(),reviewed:!!v.reviewed}))
 };
}
let ctx=null,tab="overview",notice="";
const state=()=>sanitize(ctx?.getData()?.academic);
function apply(next){
 if(!ctx)return;
 const d=ctx.getData();d.academic=sanitize(next);
 ctx.save();ctx.render();
}
function msg(t){notice=t;ctx?.render()}
function subjectSelect(id,placeholder="Ders seçin"){return '<select id="'+id+'">'+SUBJECTS.map(s=>'<option value="'+s.id+'">'+esc(s.name)+'</option>').join("")+'</select>'}
function input(id,label,type="text",other=""){return '<div class="field"><label for="'+id+'">'+esc(label)+'</label><input id="'+id+'" type="'+type+'" '+other+'></div>'}
function segmentButton(t,label){return '<button class="btn small '+(tab===t?"primary":"light")+'" data-academic="tab:'+t+'">'+label+'</button>'}
function header(){
 return '<div class="row" style="justify-content:space-between;align-items:start"><div><div class="eyebrow">8. SINIF · KİŞİSEL AKADEMİK GELİŞİM</div><h1>📊 Akademik Yolculuğum</h1><p>Denemelerden öğrendiklerini konu hedeflerine, oradan da uygulanabilir bir haftalık plana dönüştür.</p></div><span class="tag">Yalnızca sana özel</span></div><div class="row" style="margin:19px 0;gap:7px">'+segmentButton("overview","🏠 Genel Bakış")+segmentButton("exams","📝 Denemeler")+segmentButton("topics","🗺️ Konu Haritası")+segmentButton("planner","📅 Haftalık Program")+segmentButton("mistakes","📒 Yanlış Defterim")+'</div>';
}
function totals(ex){
 if(!ex)return 0;
 return SUBJECTS.reduce((n,s)=>{const v=ex.results[s.id];return n+(v?net(s,v.d,v.w):0)},0);
}
function overview(a){
 const latest=[...a.exams].sort((x,y)=>y.date.localeCompare(x.date))[0],lastExam=latest?totals(latest):null;
 const flagged=a.topics.filter(x=>x.status==="tekrar");
 const completed=a.plan.filter(x=>x.done).length,active=a.plan.filter(x=>x.date>=today()&&!x.done).length;
 let h='<div class="statrow">'+stat(a.exams.length,"Kayıtlı deneme")+stat(latest?fmt(lastExam):"—","Son deneme neti")+stat(flagged.length,"Tekrar edilecek konu")+'</div>';
 h+='<div class="grid2"><div class="tile"><h3>Deneme gelişimim</h3><p>Denemeler, aynı ders dağılımıyla girildiğinde daha anlamlı karşılaştırılabilir.</p>'+trend(a.exams)+'<div class="row">'+button("tab:exams","Yeni deneme ekle","small primary")+'</div></div>';
 h+='<div class="tile"><h3>Bu haftanın çalışma nabzı</h3><div class="listrow"><strong>Tamamladığım hedefler</strong><strong>'+completed+'</strong></div><div class="listrow"><strong>Planlı / bekleyen hedefler</strong><strong>'+active+'</strong></div><div class="listrow"><strong>Tekrar gerektiren konu</strong><strong>'+flagged.length+'</strong></div><p>Önce zorlandığın konuları işaretle, sonra tek dokunuşla haftalık öneri al.</p>'+button("tab:topics","Konu haritasına git","small light")+'</div></div>';
 if(a.exams.length>0){
  const latestSorted=[...a.exams].sort((x,y)=>y.date.localeCompare(x.date))[0];
  let parts=SUBJECTS.filter(s=>latestSorted.results[s.id]).map(s=>{const v=latestSorted.results[s.id];return {name:s.name,icon:s.emoji,ratio:net(s,v.d,v.w)/s.count,display:fmt(net(s,v.d,v.w))+"/"+s.count}});
  h+='<div class="tile" style="margin-top:17px"><h3>Son denememin derslere göre görünümü</h3><p class="muted">Grafik, girdiğin denemenin net değerlerine dayanır; resmî LGS puanı değildir.</p>'+parts.map(x=>'<div class="aca-track"><div class="row" style="justify-content:space-between"><strong>'+x.icon+' '+esc(x.name)+'</strong><span>'+x.display+' net</span></div><div class="progress"><span style="width:'+Math.max(0,Math.min(100,x.ratio*100))+'%"></span></div></div>').join("")+'</div>';
 }
 return h+'<div class="note good" style="margin-top:17px">Bu paneldeki netler, 2026 MEB kılavuzundaki <strong>doğru − yanlış / 3</strong> kuralıyla hesaplanır. Resmî LGS puanının yerine geçmez ve 2027 kuralları değişirse güncellenmelidir.</div>';
}
function stat(n,label){return '<div class="stat"><strong>'+esc(n)+'</strong><small>'+esc(label)+'</small></div>'}
function button(action,label,style="light"){return '<button class="btn '+style+'" data-academic="'+action+'">'+label+'</button>'}
function trend(exams){
 const xs=[...exams].sort((a,b)=>a.date.localeCompare(b.date)).slice(-7);
 if(!xs.length)return '<div class="empty">Henüz deneme kaydı yok. İlk denemeni ekleyerek başlayabilirsin.</div>';
 const max=90;
 return '<div class="aca-chart">'+xs.map((v,i)=>{const n=totals(v);return '<div class="aca-barcol" title="'+esc(v.label)+': '+fmt(n)+' net"><div class="aca-barwrap"><div class="aca-bar" style="height:'+Math.max(2,Math.min(100,n/max*100))+'%"></div></div><strong>'+fmt(n)+'</strong><small>'+(i+1)+'. den.</small></div>'}).join("")+'</div>';
}
function examForm(){
 return '<div class="tile"><h3>Yeni deneme kaydı</h3><div class="formgrid">'+input("acaExamName","Denemenin adı","text",'maxlength="65" placeholder="Ör. Kasım denemesi"')+input("acaExamDate","Deneme tarihi","date",'value="'+today()+'"')+'</div><p class="muted" style="font-size:12px">Her dersin doğru ve yanlış sayısını gir. Boşlar otomatik hesaplanır. Bir dersi boş bırakırsan bu denemeye dahil edilmez.</p><div class="aca-exam-grid">'+SUBJECTS.map(s=>'<div class="aca-exam-row"><div class="aca-subj"><span>'+s.emoji+' '+esc(s.name)+'</span><small>'+s.count+' soru</small></div>'+input("acaD"+s.id,"Doğru","number",'min="0" max="'+s.count+'" step="1" placeholder="0"')+input("acaW"+s.id,"Yanlış","number",'min="0" max="'+s.count+'" step="1" placeholder="0"')+'<div class="aca-net" id="acaNet'+s.id+'">—</div></div>').join("")+'</div><div class="row">'+button("saveExam","Denemeyi kaydet","primary")+'<small class="muted">Net = doğru − yanlış / 3</small></div></div>';
}
function exams(a){
 const arr=[...a.exams].sort((x,y)=>y.date.localeCompare(x.date));
 return '<h2>Deneme Analizi</h2><p>Net değişimlerini izle, derslere göre gelişimini değerlendir ve ihtiyaç duyduğun konuları belirle.</p>'+examForm()+'<div class="tile" style="margin-top:16px"><h3>Deneme geçmişim ('+arr.length+')</h3>'+(arr.length?arr.map((ex,i)=>'<div class="aca-exam-item"><div><strong>'+esc(ex.label)+'</strong><small>'+presentDate(ex.date)+' · '+SUBJECTS.filter(s=>ex.results[s.id]).map(s=>s.emoji+' '+fmt(net(s,ex.results[s.id].d,ex.results[s.id].w))).join(' · ')+'</small></div><div class="row"><strong>'+fmt(totals(ex))+' net</strong>'+button("deleteExam:"+esc(ex.id),"Sil","small outline")+'</div></div>').join(""):'<p>Henüz deneme eklemedin.</p>')+'</div>';
}
function topics(a){
 const selected=a.topics.slice().sort((x,y)=>["tekrar","calisiliyor","pekisti"].indexOf(x.status)-["tekrar","calisiliyor","pekisti"].indexOf(y.status));
 const tags={tekrar:"🔴 Tekrar gerekli",calisiliyor:"🟡 Çalışıyorum",pekisti:"🟢 Pekişti"};
 let h='<h2>Konu Eksikliği Haritam</h2><p>Konuları kendin işaretle. Düşük net, hangi konuyu bilmediğini tek başına göstermez. Konu haritanı soru incelemesiyle oluştur.</p><div class="grid2"><div class="tile"><h3>Konu ekle</h3>'+subjectField("acaTopicSubject","Ders")+'<div class="field"><label for="acaTopicPreset">Örnek konu etiketi</label><select id="acaTopicPreset"></select></div>'+input("acaTopicCustom","Veya kendi konu başlığın","text",'maxlength="75" placeholder="Listede yoksa buraya yaz"')+'<div class="row" style="margin-top:12px">'+button("addTopic","🔴 Tekrar listeme ekle","primary")+'</div><p style="font-size:12px">Liste öneri amaçlıdır. Okulunun kullandığı güncel kazanım başlıklarına göre özelleştirebilirsin.</p></div><div class="tile"><h3>Konu haritası özeti</h3>'+stat(a.topics.filter(x=>x.status==="tekrar").length,"Tekrar gerekli")+stat(a.topics.filter(x=>x.status==="calisiliyor").length,"Üzerinde çalışıyorum")+stat(a.topics.filter(x=>x.status==="pekisti").length,"Pekiştirdim")+'</div></div>';
 h+='<div class="tile" style="margin-top:16px"><div class="row" style="justify-content:space-between"><h3>Konu listem ('+selected.length+')</h3>'+button("tab:planner","Programa dönüştür →","small light")+'</div>'+(selected.length?selected.map(t=>'<div class="aca-topicrow"><div><strong>'+esc(getS(t.subject)?.name)+' · '+esc(t.topic)+'</strong><small>'+tags[t.status]+'</small></div><div class="row"><select aria-label="Konu durumunu değiştir" data-academic-status="'+esc(t.id)+'"><option value="tekrar" '+(t.status==="tekrar"?"selected":"")+'>Tekrar</option><option value="calisiliyor" '+(t.status==="calisiliyor"?"selected":"")+'>Çalışıyorum</option><option value="pekisti" '+(t.status==="pekisti"?"selected":"")+'>Pekişti</option></select>'+button("deleteTopic:"+esc(t.id),"Sil","small outline")+'</div></div>').join(""):'<p>Önce tekrar etmek istediğin ilk konuyu ekle.</p>')+'</div>';return h;
}
function subjectField(id,label){return '<div class="field"><label for="'+id+'">'+esc(label)+'</label>'+subjectSelect(id)+'</div>'}
function planner(a){
 const start=today(),end=datePlus(6),upcoming=a.plan.filter(p=>p.date>=start&&p.date<=end).sort((x,y)=>x.date.localeCompare(y.date));
 const unfinished=upcoming.filter(x=>!x.done).length;
 let h='<h2>Akıllı Haftalık Çalışma Programım</h2><p>Konu haritandaki tekrar hedeflerini haftanın uygun günlerine dağıtabilir ya da kendi görevini oluşturabilirsin.</p>';
 h+='<div class="statrow">'+stat(upcoming.length,"Bu haftanın görevleri")+stat(upcoming.filter(x=>x.done).length,"Tamamlanan")+stat(unfinished,"Bekleyen")+'</div>';
 h+='<div class="grid2"><div class="tile"><h3>Konu haritasından plan oluştur</h3><p>“Tekrar gerekli” olarak işaretlediklerinden, mevcut planında olmayan en fazla 5 görev önerilir. Her görev 25 dakikadır.</p>'+button("suggestPlan","✨ Bu haftaya öneri ekle","primary")+'</div><div class="tile"><h3>Manuel görev oluştur</h3>'+subjectField("acaPlanSubject","Ders")+input("acaPlanTopic","Konu / hedef","text",'maxlength="75" placeholder="Ör. Üslü ifadeler 10 soru"')+'<div class="formgrid">'+input("acaPlanDate","Tarih","date",'value="'+today()+'"')+'<div class="field"><label for="acaPlanMinutes">Süre</label><select id="acaPlanMinutes"><option>15</option><option>20</option><option selected>25</option><option>30</option><option>40</option><option>45</option><option>60</option></select></div></div>'+button("addPlan","Görev ekle","light")+'</div></div>';
 h+='<div class="tile" style="margin-top:16px"><h3>Önümüzdeki 7 gün</h3>'+Array.from({length:7},(_,i)=>datePlus(i)).map(day=>{const rows=upcoming.filter(x=>x.date===day);return '<div class="aca-day"><div class="aca-daylabel">'+presentDate(day)+'</div><div class="aca-daybody">'+(rows.length?rows.map(t=>'<div class="aca-task"><label><input type="checkbox" data-academic-check="'+esc(t.id)+'" '+(t.done?"checked":"")+'> <span style="'+(t.done?"text-decoration:line-through;color:#819aa3":"")+'"><strong>'+esc(getS(t.subject)?.name)+'</strong> · '+esc(t.topic)+' <small>('+t.minutes+' dk)</small></span></label>'+button("deletePlan:"+esc(t.id),"Sil","small outline")+'</div>').join(""):'<small>Henüz görev yok</small>')+'</div></div>'}).join("")+'</div>';
 if(a.plan.some(x=>x.date<start&&!x.done))h+='<div class="note warn">Geçmiş tarihte tamamlanmamış hedeflerin var. İstersen yeni bir tarihe taşıyarak planı güncelleyebilirsin.</div>';
 return h;
}
function mistakes(a){
 const reasons={konu:"Konu eksiği",okuma:"Soru kökünü yanlış okuma",zaman:"Zaman yönetimi",dikkat:"Dikkat / işlem hatası",diger:"Diğer"};
 const arr=[...a.mistakes].sort((x,y)=>y.date.localeCompare(x.date));
 return '<h2>Yanlışlarım Defteri</h2><p>Yanlışın tamamını veya özel bir fotoğrafı yüklemek yerine konusunu ve nedenini kaydet. Sonra tekrar çalıştığında işaretle.</p><div class="tile"><div class="formgrid">'+subjectField("acaMistakeSubject","Ders")+input("acaMistakeTopic","Konu","text",'maxlength="75" placeholder="Ör. Kareköklü ifadeler"')+'<div class="field"><label for="acaMistakeReason">Hata türü</label><select id="acaMistakeReason">'+Object.entries(reasons).map(([k,v])=>'<option value="'+k+'">'+esc(v)+'</option>').join("")+'</select></div>'+input("acaMistakeDate","Tarih","date",'value="'+today()+'"')+'</div><div style="margin-top:12px">'+button("addMistake","Yanlışı kaydet","primary")+'</div></div><div class="tile" style="margin-top:16px"><h3>Yanlış kayıtlarım ('+arr.length+')</h3>'+(arr.length?arr.map(m=>'<div class="aca-topicrow"><div><strong>'+esc(getS(m.subject)?.name)+' · '+esc(m.topic)+'</strong><small>'+presentDate(m.date)+' · '+esc(reasons[m.reason])+'</small></div><div class="row"><label class="row"><input type="checkbox" data-academic-review="'+esc(m.id)+'" '+(m.reviewed?"checked":"")+'> Tekrar edildi</label>'+button("deleteMistake:"+esc(m.id),"Sil","small outline")+'</div></div>').join(""):'<p>Henüz yanlış kaydı yok.</p>')+'</div>';
}
function render(context){
 ctx=context;const a=state();
 return '<div class="aca-page">'+header()+(notice?'<div class="note good">'+esc(notice)+'</div>':"")+({overview,exams,topics,planner,mistakes}[tab]||overview)(a)+'</div>';
}
function homeCard(data){
 const a=sanitize(data?.academic),last=a.exams.slice().sort((x,y)=>y.date.localeCompare(x.date))[0];
 return '<div class="tile" style="margin-top:16px"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">AKADEMİK GELİŞİM TAKİBİ</div><h3>📊 Denemelerim · Konularım · Haftalık Planım</h3><p>'+(last?'Son deneme '+fmt(totals(last))+' net · ':'Henüz deneme eklenmedi · ')+a.topics.filter(x=>x.status==="tekrar").length+' konu tekrar bekliyor.</p></div>'+button("open","Takibi aç →","primary")+'</div></div>';
}
function summary(data){
 const a=sanitize(data?.academic);let d=[...a.exams].sort((x,y)=>y.date.localeCompare(x.date))[0];
 return '<div class="tile" style="margin-top:16px"><div class="row" style="justify-content:space-between"><div><h3>📊 Akademik gelişimim</h3><p>'+a.exams.length+' deneme · '+a.topics.filter(x=>x.status==="tekrar").length+' tekrar konusu · '+a.plan.filter(x=>x.done).length+' tamamlanan akademik görev</p><small>'+(d?'Son deneme: '+fmt(totals(d))+' net':'Henüz deneme kaydı yok')+'</small></div>'+button("open","Akademik takibe git","small light")+'</div></div>';
}
function examNumbers(){
 for(let s of SUBJECTS){
 const d=$("#acaD"+s.id),w=$("#acaW"+s.id),box=$("#acaNet"+s.id);
 if(!d||!w||!box)continue;
 if(d.value===""&&w.value===""){box.textContent="—";continue}
 const dc=Number(d.value||0),wc=Number(w.value||0);
 box.textContent=dc+wc>s.count?"Fazla soru":fmt(net(s,dc,wc))+" net";
 }
}
function updateTopicPresets(){
 const subject=$("#acaTopicSubject"),sel=$("#acaTopicPreset");if(!subject||!sel)return;
 const s=getS(subject.value);
 sel.innerHTML='<option value="">Konu seçin</option>'+(s?.topics||[]).map(t=>'<option value="'+esc(t)+'">'+esc(t)+'</option>').join("");
}
async function act(code){
 if(!ctx)return;
 const a=state();notice="";
 if(code==="open"){tab="overview";return ctx.go("academic")}
 if(code.startsWith("tab:")){tab=code.slice(4);return ctx.render()}
 if(code==="saveExam"){
 const label=trim($("#acaExamName")?.value,65)||("Deneme "+(a.exams.length+1)),date=trim($("#acaExamDate")?.value,10)||today();let results={},errors=[];
 for(let s of SUBJECTS){let d=$("#acaD"+s.id)?.value,w=$("#acaW"+s.id)?.value;if(d===""&&w==="")continue;
  let dc=numeric(d||0,s.count),wc=numeric(w||0,s.count);
  if(dc===null||wc===null||dc+wc>s.count)errors.push(s.name+" için doğru ve yanlış toplamı "+s.count+" soruyu aşamaz.");
  else results[s.id]={d:dc,w:wc};
 }
 if(errors.length)return alert(errors.join("\n"));
 if(!Object.keys(results).length)return alert("En az bir ders için doğru veya yanlış sayısı gir.");
 if(a.exams.length>=MAX.exams)return alert("Deneme limiti 20. Önce eski bir kaydı silerek devam edebilirsin.");
 a.exams.push({id:ident(),date,label,results});notice="Deneme kaydedildi.";return apply(a);
 }
 if(code.startsWith("deleteExam:")){if(!confirm("Bu deneme kaydını silmek istiyor musun?"))return;a.exams=a.exams.filter(x=>x.id!==code.slice(11));notice="Deneme silindi.";return apply(a)}
 if(code==="addTopic"){
 let subject=$("#acaTopicSubject")?.value,topic=trim($("#acaTopicCustom")?.value,75)||trim($("#acaTopicPreset")?.value,75);
 if(!getS(subject)||!topic)return alert("Ders ve konu seç veya konu başlığını yaz.");
 if(a.topics.some(x=>x.subject===subject&&x.topic.toLocaleLowerCase("tr-TR")===topic.toLocaleLowerCase("tr-TR")))return alert("Bu konu haritanda zaten bulunuyor.");
 if(a.topics.length>=MAX.topics)return alert("Konu haritasında en fazla 60 kayıt olabilir.");
 a.topics.push({id:ident(),subject,topic,status:"tekrar",date:today()});notice="Konu haritana eklendi.";return apply(a);
 }
 if(code.startsWith("deleteTopic:")){a.topics=a.topics.filter(x=>x.id!==code.slice(12));notice="Konu silindi.";return apply(a)}
 if(code==="suggestPlan"){
 let targets=a.topics.filter(x=>x.status==="tekrar").sort((x,y)=>x.date.localeCompare(y.date));
 if(!targets.length)return alert("Önce konu haritanda en az bir konuyu “Tekrar” olarak işaretle.");
 let added=0;for(let t of targets){
  if(added>=5||a.plan.length>=MAX.plan)break;
  if(a.plan.some(p=>p.subject===t.subject&&p.topic===t.topic&&p.date>=today()&&p.date<=datePlus(6)))continue;
  a.plan.push({id:ident(),subject:t.subject,topic:t.topic,date:datePlus(added),minutes:25,done:false,source:"suggested"});added++;
 }
 if(!added)return alert("Bu haftaya eklenebilecek yeni konu yok veya çalışma programın dolu.");
 notice=added+" konu için haftalık çalışma önerisi oluşturuldu. Tarihleri ve süreleri ihtiyaçlarına göre düzenleyebilirsin.";return apply(a);
 }
 if(code==="addPlan"){
 let subject=$("#acaPlanSubject")?.value,topic=trim($("#acaPlanTopic")?.value,75),date=trim($("#acaPlanDate")?.value,10),minutes=Number($("#acaPlanMinutes")?.value||25);
 if(!getS(subject)||!topic||!/^\d{4}-\d{2}-\d{2}$/.test(date))return alert("Ders, konu ve tarih bilgilerini kontrol et.");
 if(a.plan.length>=MAX.plan)return alert("Plan sınırı 80 görev. Önce tamamlanan eski bir görevi sil.");
 a.plan.push({id:ident(),subject,topic,date,minutes,done:false,source:"manual"});notice="Çalışma hedefine eklendi.";return apply(a)
 }
 if(code.startsWith("deletePlan:")){a.plan=a.plan.filter(x=>x.id!==code.slice(11));notice="Görev silindi.";return apply(a)}
 if(code==="addMistake"){
 const subject=$("#acaMistakeSubject")?.value,topic=trim($("#acaMistakeTopic")?.value,75),reason=$("#acaMistakeReason")?.value,date=trim($("#acaMistakeDate")?.value,10);
 if(!getS(subject)||!topic)return alert("Ders ve konu yaz.");
 if(a.mistakes.length>=MAX.mistakes)return alert("Yanlış defterinde en fazla 50 kayıt olabilir.");
 a.mistakes.push({id:ident(),subject,topic,reason,date,reviewed:false});notice="Yanlış defterine eklendi.";return apply(a)
 }
 if(code.startsWith("deleteMistake:")){a.mistakes=a.mistakes.filter(x=>x.id!==code.slice(14));notice="Yanlış kaydı silindi.";return apply(a)}
}
document.addEventListener("click",ev=>{let b=ev.target.closest("[data-academic]");if(!b)return;ev.preventDefault();try{act(b.dataset.academic)}catch(err){alert("İşlem tamamlanamadı: "+err.message)}});
document.addEventListener("change",ev=>{
 const t=ev.target,a=state();
 if(t.id==="acaTopicSubject"){updateTopicPresets();return}
 if(t.dataset.academicStatus!==undefined){let item=a.topics.find(x=>x.id===t.dataset.academicStatus);if(item&&["tekrar","calisiliyor","pekisti"].includes(t.value)){item.status=t.value;apply(a)}return}
 if(t.dataset.academicCheck!==undefined){let item=a.plan.find(x=>x.id===t.dataset.academicCheck);if(item){item.done=!!t.checked;apply(a)}return}
 if(t.dataset.academicReview!==undefined){let item=a.mistakes.find(x=>x.id===t.dataset.academicReview);if(item){item.reviewed=!!t.checked;apply(a)}return}
});
document.addEventListener("input",ev=>{if(/^aca[DW](tr|ma|fen|ink|din|en)$/.test(ev.target?.id||""))examNumbers()});
function afterRender(){if(tab==="topics")updateTopicPresets();if(tab==="exams")examNumbers()}
window.LGSAcademic={render,homeCard,summary,afterRender,sanitize,subjects:SUBJECTS,net,totals,init:c=>ctx=c};
})();