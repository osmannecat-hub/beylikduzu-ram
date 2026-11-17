/* Beylikdüzü RAM | LGS Yolculuğum | Etkileşimli psikoeğitim atölyeleri */
(function(){
"use strict";
const $=s=>document.querySelector(s);
const e=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const TODAY=()=>new Date().toLocaleDateString("sv-SE");
const studentTitles=["Kendimi fark ediyorum","Düşünce, duygu ve davranış","Üç duraklı sınav senaryosu","Yardımcı iç konuşma","Sakinleşme araç kutusu","Kendi baş etme planım"];
const parentTitles=["Çocuğumu anlamak","Ebeveyn tepkilerinin etkisi","Destekleyici cümleler","Etkin dinleme denemesi","Önce kendi tepkimi düzenleme","Aile iletişim planı"];
const situations=[
{q:"Deneme sınavı öncesi karnında sıkışma hissediyorsun. Aklından 'Ya yapamazsam?' düşüncesi geçiyor.",a:[
{t:"Bu his hiç geçmeyecek diye düşünüp çalışmayı bırakırım.",f:"Bazen uzaklaşmak kısa süreli rahatlatabilir, ancak konuyu çözmeyi erteleyebilir. Şimdi seçebileceğin küçük bir adım var."},
{t:"Hislerimi fark edip önce kısa bir mola verir, sonra bir hedef seçerim.",f:"Bu seçim kaygıyı hemen yok etmek zorunda değil. Kaygı varken de küçük bir hazırlık adımı seçebilirsin."},
{t:"Sürekli başkalarının netlerini kontrol ederim.",f:"Başkalarının sonuçlarına odaklanmak karşılaştırma baskısını artırabilir. Kendi planına dönmek daha işlevsel olabilir."}]},
{q:"Sınav başladı. İki soruda zorlandın ve aklından 'Hepsini yanlış yapacağım' düşüncesi geçti.",a:[
{t:"Düşüncemi bir düşünce olarak görür, süremi gözetip ilerlerim.",f:"Tek bir soruda zorlanmak sınavın geri kalanını belirlemez. Dikkatini sonraki yapılabilir adıma yöneltebilirsin."},
{t:"Bütün süreyi aynı soruda kullanırım.",f:"Uzun süre aynı soruda kalmak diğer sorulara ayıracağın zamanı azaltabilir. Bir işaret koyup daha sonra dönmeyi deneyebilirsin."},
{t:"Bütün soruları rastgele işaretlerim.",f:"Kaygıyla hızla karar vermek yerine kısa bir duraklama ve soru kökünü yeniden okuma yardımcı olabilir."}]},
{q:"Deneme sonucu beklediğinden düşük geldi. Eve giderken canın sıkkın.",a:[
{t:"Bu puanın beni tanımladığına karar veririm.",f:"Puan yalnızca o denemeye ilişkin bir sonuçtur; senin değerini veya bütün potansiyelini tanımlamaz."},
{t:"Hiç kimseyle konuşmam ve her şeyi saklarım.",f:"Kendine biraz zaman tanımak anlaşılabilir. İhtiyaç duyarsan güvendiğin bir yetişkinden destek istemek de bir seçenektir."},
{t:"Bir güçlü yönümü, bir geliştireceğim konuyu belirleyip destek isterim.",f:"Somut geri bildirim ve destek, sonraki çalışma adımını belirlemeyi kolaylaştırabilir."}]}
];
const parentScenes=[
{q:"Çocuğunuz, 'Yarınki denemeden çok korkuyorum' diyor.",a:[
{t:"Korkacak bir şey yok, bunu büyütme.",f:"Duygusunu küçümsemek onun konuşma isteğini azaltabilir. Önce nasıl hissettiğini anlamaya çalışabilirsiniz."},
{t:"Bu sınavın önemli olduğunu biliyorum. En çok ne seni düşündürüyor?",f:"Duyguyu kabul eden ve açık uçlu soru içeren yaklaşım, konuşmayı sürdürmek için alan açabilir."},
{t:"Bu kadar çalıştık, korkmaya hakkın yok.",f:"Bu tür beklenti cümleleri baskıyı artırabilir. Emeğini fark edip desteğinizi belirtmek daha yapıcı olabilir."}]},
{q:"Deneme sonucu beklenenden düşük geliyor. Çocuğunuz konuşmak istemediğini söylüyor.",a:[
{t:"Şimdi konuşmak istemediğini görüyorum, hazır olduğunda dinlerim.",f:"Biraz alan açmak, çocuğunuz hazır olduğunda daha güvenli bir iletişim ortamı oluşturabilir."},
{t:"Hemen neden böyle yaptığını açıklamasını isterim.",f:"Hemen hesap sormak, özellikle yoğun duygular sırasında iletişimi zorlaştırabilir."},
{t:"Arkadaşlarının kaç net yaptığını sorarım.",f:"Karşılaştırma, sonuca ilişkin baskıyı artırabilir. Kendi öğrenme sürecini konuşmak daha yararlıdır."}]},
{q:"Çocuğunuz, 'Matematik hiç olmayacak' diyor.",a:[
{t:"Sen zaten bu dersi yapamıyorsun, başka ders çalış.",f:"Genelleyici ifadeler çocuğun deneme isteğini azaltabilir. Zorlandığı belirli konuyu ele almayı deneyin."},
{t:"Sadece olumlu düşünmesini söylerim.",f:"Yalnızca olumlu düşünmesini istemek, yaşadığı güçlüğün anlaşılmadığı hissi yaratabilir."},
{t:"Hangi konuda zorlandığını birlikte bulup küçük hedef belirlemeyi teklif ederim.",f:"Belirli konu ve küçük bir adım üzerine konuşmak, çözüm aramayı kolaylaştırabilir."}]}
];
const classifyStudent=[
{q:"'Bütün soruları yanlış yapacağım.'",type:0,why:"Bu cümle bir düşüncedir. Gerçeğin tamamı olmak zorunda değildir."},
{q:"Kalbimin daha hızlı atmasını fark ediyorum.",type:1,why:"Bu, bedende fark edilebilen bir tepkidir."},
{q:"Endişe duyuyorum.",type:2,why:"Endişe bir duygudur; kendi başına yanlış ya da ayıp değildir."},
{q:"Sorudan uzaklaşmak istiyorum.",type:3,why:"Bu cümle bir davranış eğilimini anlatır."}
];
const classifyParent=[
{q:"'Bunu kafana takma, abartıyorsun.'",type:1,why:"Duyguyu küçümseyen bir ifade çocuğun paylaşma isteğini azaltabilir."},
{q:"'Hazır olduğunda seni dinlemek isterim.'",type:0,why:"Baskı kurmadan konuşma için alan açan bir ifadedir."},
{q:"'Arkadaşın daha yüksek net yapmış.'",type:1,why:"Çocuğu başkasıyla kıyaslamak baskıyı artırabilir."},
{q:"'Seni zorlayan konuyu birlikte anlamayı deneyebiliriz.'",type:0,why:"Soruna odaklanan ve iş birliği teklif eden bir ifadedir."}
];
const promptsParent=[
{q:"Çocuğunuz: 'Çok çalışıyorum ama netlerim artmıyor.'",a:[
{t:"Önce duygusunu yansıt: 'Çaba gösterip sonuç alamamak yorucu olabilir.'",f:"Duyguyu kabul etmek, çözüm konuşmadan önce anlaşılma hissini güçlendirebilir."},
{t:"'Az çalıştığın için böyle' de.",f:"Kesin yargılar ve suçlama, konuşmanın devamını zorlaştırabilir."},
{t:"'Benim zamanımda daha zordu' de.",f:"Kendi geçmişimiz bazen faydalıdır, ancak bu anda çocuğun deneyimine alan açmak öncelikli olabilir."}]},
{q:"Çocuğunuz: 'Matematik sorularında donup kalıyorum.'",a:[
{t:"'O sırada aklından neler geçiyor?' diye açık bir soru sor.",f:"Açık bir soru, çocuk isterse deneyimini kendi sözcükleriyle anlatmasını kolaylaştırabilir."},
{t:"'Demek ki dikkat etmiyorsun' de.",f:"Hızlı bir yorum, konunun tam anlaşılmasını engelleyebilir."},
{t:"Hemen 100 soru çözmesini iste.",f:"Önce güçlüğü anlamak, ardından uygulanabilir bir adım belirlemek daha yapıcı olabilir."}]},
{q:"Çocuğunuz konuşmayı bitirirken 'Yarın ne yapacağımı bilmiyorum' diyor.",a:[
{t:"Onun yerine tüm programı belirle.",f:"Planı tamamen devralmak çocuğun öz düzenleme fırsatını sınırlayabilir."},
{t:"'İstersen bir küçük adım seçebiliriz, sana nasıl destek olmamı istersin?' de.",f:"Seçenek ve destek sunmak, çocuğun kendi kararına katılımını kolaylaştırır."},
{t:"'Bunu çoktan halletmeliydin' de.",f:"Geçmişe dönük eleştiri yerine sıradaki küçük adıma odaklanmak daha yardımcı olabilir."}]}
];
const toolTitles=["🔎 Kaygıyı fark et","🧠 Düşünceyi yeniden ele al","🧭 Sıradaki küçük adımı seç"];
const GUARD_STEPS=6;
let ctx={student:null,parent:null};
const ui={
student:{step:0,loaded:false,signals:[],matched:{},scenario:{},thought:"",situation:"",action:"",calm:"",timer:null,left:0},
parent:{step:0,loaded:false,signals:[],matched:{},scenario:{},listen:{},situation:"",action:"",calm:"",timer:null,left:0}
};
function state(kind){
 const o=kind==="student"?ctx.student?.state:ctx.parent?.progress;
 if(!o)return {steps:[],plan:{},practiceDates:[]};
 const a=o.advancedModules&&typeof o.advancedModules==="object"?o.advancedModules:{};
 const v=a[kind==="student"?"kaygi":"kaygi_destegi"];
 if(!v||typeof v!=="object")return {steps:[],plan:{},practiceDates:[]};
 return {
  steps:Array.isArray(v.steps)?v.steps.filter(x=>Number.isInteger(x)&&x>=0&&x<GUARD_STEPS):[],
  plan:v.plan&&typeof v.plan==="object"?v.plan:{},
  practiceDates:Array.isArray(v.practiceDates)?v.practiceDates.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).slice(-30):[]
 };
}
function titles(kind){return kind==="student"?studentTitles:parentTitles}
function persist(kind,partial){
 const o=kind==="student"?ctx.student?.state:ctx.parent?.progress;
 if(!o)return;
 const key=kind==="student"?"kaygi":"kaygi_destegi";
 const old=state(kind),now=Object.assign({},old,partial);
 now.steps=[...new Set(now.steps)].sort((a,b)=>a-b);
 now.practiceDates=[...new Set(now.practiceDates)].slice(-30);
 if(!o.advancedModules||typeof o.advancedModules!=="object")o.advancedModules={};
 o.advancedModules[key]=now;
 if(kind==="student"){
  if(now.steps.length===GUARD_STEPS&&!o.completed.includes("kaygi"))o.completed.push("kaygi");
  ctx.student.save();ctx.student.render();
 }else{
  if(ctx.parent.logged){
   const completed=ctx.parent.progress.completed||[];
   if(now.steps.length===GUARD_STEPS&&!completed.includes("kaygi_destegi"))completed.push("kaygi_destegi");
   Promise.resolve(ctx.parent.saveParent()).catch(()=>{alert("İlerleme çevrimiçi kaydedilemedi. Bağlantınızı kontrol edin.")}).finally(()=>ctx.parent.render());
  }else{ctx.parent.render()}
 }
}
function mark(kind,step){const p=state(kind);if(!p.steps.includes(step))p.steps.push(step);persist(kind,{steps:p.steps});ui[kind].step=Math.min(step+1,6);if(kind==="student")ctx.student.render();else ctx.parent.render()}
function sel(kind,action,extra={}){const u=ui[kind];Object.assign(u,extra);const fn=kind==="student"?ctx.student.render:ctx.parent.render;fn()}
function intro(kind){
 const student=kind==="student";
 return '<div class="ws-copy"><h3>'+(student?"Sınav heyecanı geldiğinde ne oluyor?":"Çocuğunuz zorlandığında ilk tepkiniz ne oluyor?")+'</h3><p>'+(student?"Sınav öncesi heyecan, zihinde bazı düşünceler ve bedende farklı tepkiler oluşturabilir. Bunları fark etmek, ardından bir adım seçmek için iyi bir başlangıçtır.":"Çocuğunuzun kaygısını hemen ortadan kaldırmak zorunda değilsiniz. İlk adım, onun duygu ve ihtiyaçlarını anlamak ve konuşma için güvenli bir alan oluşturmaktır.")+'</p><div class="note good">Bu bir psikolojik test veya tanı aracı değildir. Seçtikleriniz kaydedilmez.</div>';
 const choices=student?["Kalbimin hızlı atması","Aklıma olumsuz düşünceler gelmesi","Sorulara başlamayı erteleme isteği","Bir yetişkinle konuşma ihtiyacı"]:["Hemen çözüm söyleme isteği","Kendi kaygımı fark etme","Sorular sorma isteği","Sessiz kalıp önce dinleme ihtiyacı"];
 let c='<div class="ws-choices">'+choices.map((t,i)=>'<button type="button" class="ws-choice '+(ui[kind].signals.includes(i)?"selected":"")+'" data-ws="'+kind+':signal:'+i+'"><span>'+(ui[kind].signals.includes(i)?"✓":"○")+'</span>'+e(t)+'</button>').join("")+'</div>';
 return intro(kind)+c+'<p class="ws-help">Bir veya birkaç seçeneği işaretleyin. Burada doğru-yanlış yok.</p>'+wsButton(kind+":complete:0","Fark ettim, devam et →",ui[kind].signals.length===0)+"</div>";
}
function wsButton(action,label,disabled=false,cls="primary"){return '<button type="button" class="btn '+cls+'" data-ws="'+action+'" '+(disabled?"disabled":"")+'>'+e(label)+'</button>'}
function match(kind){
 const isStudent=kind==="student",arr=isStudent?classifyStudent:classifyParent;
 const lbl=isStudent?["Düşünce","Bedensel tepki","Duygu","Davranış eğilimi"]:["Destekleyici yaklaşım","Zorlayıcı yaklaşım"];
 const u=ui[kind];let all=arr.every((_,i)=>u.matched[i]!==undefined);
 let html='<div class="ws-copy"><h3>'+(isStudent?"Dört parçayı ayırt et":"Sözlerin olası etkisini fark et")+'</h3><p>'+(isStudent?"Aynı durumda düşündüğümüz, hissettiğimiz, bedenimizde fark ettiğimiz ve yaptığımız şeyler farklıdır. Her cümleyi uygun kategoriye yerleştir.":"Aşağıdaki ebeveyn cümlelerini destekleyici ya da zorlayıcı olarak sınıflandır. Doğru cevaptan daha önemlisi nedenini anlamak.")+'</p>';
 for(let i=0;i<arr.length;i++){
  let x=arr[i],answer=u.matched[i];
  html+='<div class="ws-question"><strong>'+(i+1)+'. '+e(x.q)+'</strong><div class="ws-options">'+lbl.map((v,j)=>'<button type="button" class="ws-option '+(answer===j?"selected":"")+'" data-ws="'+kind+':match:'+i+':'+j+'">'+e(v)+'</button>').join("")+'</div>'+(answer===undefined?"":'<p class="ws-feedback">'+(answer===x.type?"✅ ":"🔎 ")+e(x.why)+'</p>')+'</div>';
 }
 return html+wsButton(kind+":complete:1","Öğrendim, devam et →",!all)+'</div>';
}
function scenario(kind){
 const s=kind==="student"?situations:parentScenes,u=ui[kind];
 const i=Math.min(Object.keys(u.scenario).length,2),answer=u.scenario[i],x=s[i];
 let html='<div class="ws-copy"><h3>Karar noktası '+(i+1)+' / 3</h3><p>Hikâyenin bu bölümünde hangi tepkinin olası sonuçlarını görmek istersin?</p><div class="ws-question"><strong>'+e(x.q)+'</strong><div class="ws-options vertical">'+x.a.map((v,j)=>'<button type="button" class="ws-option '+(answer===j?"selected":"")+'" data-ws="'+kind+':scenario:'+i+':'+j+'">'+e(v.t)+'</button>').join("")+'</div>';
 if(answer!==undefined)html+='<p class="ws-feedback">'+e(x.a[answer].f)+'</p>';
 html+='</div><div class="row">'+(answer!==undefined?(i===2?wsButton(kind+":complete:2","Senaryoyu tamamla →"):wsButton(kind+":scenarioNext","Sonraki durak →")):"")+'</div><p class="ws-help">Seçimlerin bir sınav puanına dönüştürülmez; farklı tepkilerin olası etkilerini keşfetmek içindir.</p></div>';
 return html;
}
function thought(kind){
 if(kind==="parent")return parentListen();
 const choices=[
 ["“Kesin başarısız olacağım.”","“Bütün soruları yapmam gerekmiyor; bildiğim sorularla başlayabilirim.”","“Bunu hissediyorsam sınava girmemeliyim.”"],
 ["“Bir soruda zorlandım, bütün sınav kötü gidecek.”","“Bu bir düşünce; sonraki soruya odaklanabilirim.”","“Zor soru görmemem gerekir.”"],
 ["“Bu sonuç her şeyi belirler.”","“Bu sonuç bana hangi konuda çalışacağımı gösterebilir.”","“Artık hiçbir şeyi değiştiremem.”"]
 ];
 const u=ui.student;
 let html='<div class="ws-copy"><h3>Zihninden geçen her cümle bir gerçek olmayabilir</h3><p>İç konuşmanı fark et ve sana ilerleme alanı açan bir cümle seç. Amaç kaygıyı zorla yok etmek değil, kaygıya rağmen işlevsel bir adım atabilmek.</p><div class="ws-question"><strong>“Ya yapamazsam?” düşüncesi geldiğinde hangisi sana yardımcı olabilir?</strong><div class="ws-options vertical">';
 const options=["“Yapmak zorundayım, başka seçenek yok.”","“Zorlanabilirim; bildiğim sorudan başlayıp ilerlemeyi deneyebilirim.”","“Kaygılanırsam herkes bunu fark eder.”"];
 html+=options.map((v,i)=>'<button type="button" class="ws-option '+(u.thought===String(i)?"selected":"")+'" data-ws="student:thought:'+i+'">'+e(v)+'</button>').join("")+'</div>';
 if(u.thought)html+='<p class="ws-feedback">'+(u.thought==="1"?"✅ Bu yaklaşım, güçlük yaşanabileceğini kabul ederken yapılabilir bir davranışı hatırlatıyor.":"🔎 Daha esnek bir cümle, hem zorlanma ihtimalini kabul eder hem de yapılabilir bir adım gösterir.")+'</p>';
 return html+'</div>'+wsButton("student:complete:3","Kendi cümlemi seçtim →",!u.thought)+'</div>';
}
function parentListen(){
 const u=ui.parent,arr=promptsParent;
 const idx=Math.min(Object.keys(u.listen).length,2),ans=u.listen[idx],q=arr[idx];
 let html='<div class="ws-copy"><h3>Üç adımlı dinleme provası</h3><p>Sohbetinizi sırasıyla üç beceri üzerinden deneyin: <strong>duyguyu yansıtma, açık soru sorma ve birlikte küçük adım seçme.</strong></p><div class="ws-question"><div class="eyebrow">KONUŞMA '+(idx+1)+' / 3</div><strong>'+e(q.q)+'</strong><div class="ws-options vertical">'+q.a.map((x,i)=>'<button type="button" class="ws-option '+(ans===i?"selected":"")+'" data-ws="parent:listen:'+idx+':'+i+'">'+e(x.t)+'</button>').join("")+'</div>';
 if(ans!==undefined)html+='<p class="ws-feedback">'+e(q.a[ans].f)+'</p>';
 html+='</div>'+(ans!==undefined?(idx===2?wsButton("parent:complete:3","Dinleme provasını bitir →"):wsButton("parent:listenNext","Sonraki konuşma →")):"")+'</div>';
 return html;
}
function calm(kind){
 const u=ui[kind],p=kind==="student"?"Kısa bir beden ve dikkat molası":"Önce kendi hızımı yavaşlatıyorum";
 const desc=kind==="student"?"Kaygının yükseldiğini fark ettiğinde kısa bir nefes molası veya duyulara yönelme egzersizi deneyebilirsin.":"Çocuğuna yanıt vermeden önce kendi bedenini ve hızını fark edebilirsin. Amaç duyguyu bastırmak değil, daha bilinçli tepki seçmektir.";
 let html='<div class="ws-copy"><h3>'+p+'</h3><p>'+desc+'</p><div class="note warn">Nefes çalışması rahatsızlık veriyorsa durabilir veya duyusal farkındalık seçeneğini kullanabilirsin. Nefesini tutmak zorunda değilsin.</div><div class="ws-tools"><div class="ws-breath"><div class="ws-breath-ring" id="wsBreathRing"><div><div id="wsBreathWords">Nefes egzersizi</div><strong id="wsBreathTime">'+(u.left||"40")+' sn</strong></div></div><p class="ws-help">4 saniye rahatça nefes al, 6 saniye yavaşça ver. Toplam 40 saniye.</p><div class="row">'+wsButton(kind+":startBreath","40 saniyeyi başlat",false,"light")+wsButton(kind+":stopBreath","Durdur",false,"outline")+'</div></div><div class="ws-ground"><h3>Alternatif: Duyulara dön</h3><p>Etrafına bak ve sırayla fark et:</p><ol><li>Görebildiğin 5 nesne</li><li>Dokunabildiğin 4 yüzey</li><li>Duyabildiğin 3 ses</li><li>Fark edebildiğin 2 koku</li><li>Fark edebildiğin 1 tat veya bedensel his</li></ol>'+wsButton(kind+":ground","Duyusal farkındalığı denedim",false,"light")+'</div></div>';
 if(u.calm)html+='<div class="note good">✅ Bir uygulama deneyimledin. Hangisinin sana iyi geldiğini fark etmek için kendine zaman tanıyabilirsin.</div>';
 return html+wsButton(kind+":complete:4","Araç kutumu tamamladım →",!u.calm)+'</div>';
}
function plan(kind){
 const student=kind==="student",u=ui[kind],s=state(kind);
 const when=student?["Deneme sınavından önce","Zor bir soruya takıldığımda","Deneme sonucumdan sonra"]:["Çocuğum sınav kaygısını anlattığında","Deneme sonucunu konuşurken","Çocuğum yardım istemediğinde"];
 const actions=student?["Durup rahatça nefes alır, bir küçük hedef seçerim.","Aklımdan geçen düşünceyi fark edip sonraki soruya geçerim.","Güvendiğim bir yetişkinden destek isterim."]:["Önce duygusunu yansıtır, sonra açık bir soru sorarım.","Puanla karşılaştırmadan bir güçlü yönünü fark ederim.","Hazır olduğunda dinlemeye açık olduğumu söylerim."];
 let html='<div class="ws-copy"><h3>'+(student?"Kendi baş etme planın":"Ailenizin küçük iletişim planı")+'</h3><p>Bir günlük yaşam durumu ve uygulayacağın bir yaklaşım seç. Planın özel notlar veya sınav puanları içermez.</p><div class="ws-question"><strong>Hangi durumda?</strong><div class="ws-options">'+when.map((v,i)=>'<button type="button" class="ws-option '+(u.situation===String(i)?"selected":"")+'" data-ws="'+kind+':when:'+i+'">'+e(v)+'</button>').join("")+'</div></div><div class="ws-question"><strong>Ne yapacağım?</strong><div class="ws-options">'+actions.map((v,i)=>'<button type="button" class="ws-option '+(u.action===String(i)?"selected":"")+'" data-ws="'+kind+':action:'+i+'">'+e(v)+'</button>').join("")+'</div></div>';
 if(u.situation!==""&&u.action!=="")html+='<div class="note good"><strong>Benim planım:</strong> '+e(when[Number(u.situation)])+' → '+e(actions[Number(u.action)])+'</div>';
 html+='<p class="ws-help">Planın seçtiğin başlıklarla kaydedilir; kişisel düşünce veya duygularının metni kaydedilmez.</p>';
 return html+wsButton(kind+":finish","Planımı tamamla →",u.situation===""||u.action==="")+'</div>';
}
function finish(kind){
 const p=state(kind),t=titles(kind),isStudent=kind==="student";
 return '<div class="ws-complete"><div style="font-size:52px">🌱</div><h2>Atölyeyi tamamladın!</h2><p>'+(isStudent?"Kaygı geldiğinde fark etme, düşünceleri ayırma, seçenekleri değerlendirme ve küçük bir plan yapma adımlarını öğrendin.":"Duyguyu dinleme, destekleyici konuşma ve sakin tepki seçme konusunda bir uygulama planı hazırladın.")+'</p><div class="ws-completion"><strong>6 / 6</strong><small>Atölye aşaması</small></div><div class="note good"><strong>Günlük yaşama taşı:</strong> Seçtiğin yaklaşımı uygun bir zamanda dene ve buraya geri dönüp işaretle. Unutma, işaretleme psikolojik iyileşme puanı değildir.</div><div class="row">'+wsButton(kind+":practice","Bugün küçük adımımı denedim",p.practiceDates.includes(TODAY()),"primary")+wsButton(kind+":goto:0","Atölyeyi yeniden incele",false,"outline")+'</div><p class="ws-help">'+p.practiceDates.length+' farklı günde uygulama işaretlemesi yaptın.'+(isStudent?" Hesabına giriş yaparsan bu ilerleme farklı cihazlarda da korunur.":" Veli hesabın varsa ilerlemen hesabına kaydedilir.")+'</p></div>';
}
function header(kind){
 const u=ui[kind],p=state(kind),t=titles(kind),student=kind==="student";
 const count=p.steps.length,step=u.step;
 let h='<div class="ws-header"><div class="eyebrow">BEYLİKDÜZÜ RAM · '+(student?"8. SINIF ÖĞRENCİ ATÖLYESİ":"EBEVEYN PSİKOEĞİTİM ATÖLYESİ")+'</div><h1>'+(student?"Kaygımla Başa Çıkıyorum":"Çocuğumun Sınav Kaygısına Destek")+'</h1><p>'+(student?"Yalnızca okumakla kalma. Kendini fark et, seçenekleri dene ve kendi yolunu oluştur.":"Çocuğunuzu anlamak, destekleyici iletişim kurmak ve günlük yaşamda küçük adımlar atmak için yapılandırılmış bir çalışma.")+'</p><div class="row"><span class="tag">6 aşamalı atölye</span><span class="tag">Yaklaşık 15–20 dakika</span><span class="tag">'+count+' / 6 aşama</span></div><div class="progress" style="margin:17px 0"><span style="width:'+Math.round(count/GUARD_STEPS*100)+'%"></span></div><div class="ws-stepnav" aria-label="Atölye aşamaları">';
 for(let i=0;i<GUARD_STEPS;i++)h+='<button type="button" title="'+e(t[i])+'" class="ws-step '+(step===i?"on":"")+' '+(p.steps.includes(i)?"done":"")+'" data-ws="'+kind+':goto:'+i+'" '+(!p.steps.includes(i)&&i>count?"disabled":"")+'>'+(p.steps.includes(i)?"✓":String(i+1))+'</button>';
 h+='</div><div class="ws-current"><span class="eyebrow">AŞAMA '+Math.min(step+1,6)+' / 6</span><h2>'+e(step===6?"Atölye tamamlandı":t[step])+'</h2></div></div>';
 return h;
}
function render(kind){
 const u=ui[kind],p=state(kind),student=kind==="student";
 if(!u.loaded){u.step=p.steps.length===6?6:p.steps.length;u.loaded=true}
 if(u.step>=6)return '<div class="ws-shell">'+header(kind)+finish(kind)+'</div>';
 let body;
 if(u.step===0)body=intro(kind);
 else if(u.step===1)body=match(kind);
 else if(u.step===2)body=scenario(kind);
 else if(u.step===3)body=thought(kind);
 else if(u.step===4)body=calm(kind);
 else body=plan(kind);
 return '<div class="ws-shell">'+header(kind)+'<div class="ws-panel">'+body+'</div><div class="ws-footer"><span>Bu atölye rehberlik amaçlıdır. İhtiyaç duyarsan okul psikolojik danışmanına başvurabilirsin.</span><span>Seçimlerin puanlanmaz.</span></div></div>';
}
function handle(kind,action,vals){
 const u=ui[kind],st=state(kind),renderFn=kind==="student"?ctx.student?.render:ctx.parent?.render;
 const n=x=>Number(x);
 if(action==="goto"){const step=n(vals[0]);if(step>=0&&step<=6&&(step<=st.steps.length||st.steps.length===6)){stopTimer(kind);u.step=step;renderFn?.()}return}
 if(action==="signal"){let i=n(vals[0]);u.signals=u.signals.includes(i)?u.signals.filter(x=>x!==i):[...u.signals,i];renderFn();return}
 if(action==="match"){u.matched[n(vals[0])]=n(vals[1]);renderFn();return}
 if(action==="scenario"){u.scenario[n(vals[0])]=n(vals[1]);renderFn();return}
 if(action==="scenarioNext"){renderFn();return}
 if(action==="listen"){u.listen[n(vals[0])]=n(vals[1]);renderFn();return}
 if(action==="listenNext"){renderFn();return}
 if(action==="thought"){u.thought=vals[0];renderFn();return}
 if(action==="when"){u.situation=vals[0];renderFn();return}
 if(action==="action"){u.action=vals[0];renderFn();return}
 if(action==="startBreath"){startTimer(kind);return}
 if(action==="stopBreath"){stopTimer(kind);renderFn();return}
 if(action==="ground"){u.calm="ground";stopTimer(kind);renderFn();return}
 if(action==="complete"){
  const step=n(vals[0]);
  const allowed=step===0?u.signals.length>0:step===1?Object.keys(u.matched).length===4:step===2?Object.keys(u.scenario).length===3:step===3?(kind==="student"?u.thought!=="":Object.keys(u.listen).length===3):step===4?!!u.calm:false;
  if(!allowed)return;
  stopTimer(kind);mark(kind,step);return;
 }
 if(action==="finish"){
  if(u.situation===""||u.action==="")return;
  stopTimer(kind);const steps=[...new Set([...st.steps,5])];
  u.step=6;
  persist(kind,{steps,plan:{situation:u.situation,action:u.action}});
  return;
 }
 if(action==="practice"){const today=TODAY();if(st.practiceDates.includes(today))return;persist(kind,{practiceDates:[...st.practiceDates,today]});return}
}
function startTimer(kind){
 const u=ui[kind];stopTimer(kind);u.left=40;
 let remaining=40;
 const update=()=>{
  const val=$("#wsBreathTime"),words=$("#wsBreathWords"),ring=$("#wsBreathRing");
  if(!val||!words||!ring){stopTimer(kind);return}
  val.textContent=remaining+" sn";
  const elapsed=40-remaining,phase=elapsed%10;
  words.textContent=phase<4?"Rahatça nefes al":"Yavaşça nefes ver";
  ring.classList.toggle("expanding",phase<4);
  if(remaining<=0){stopTimer(kind);u.calm="breath";const fn=kind==="student"?ctx.student.render:ctx.parent.render;fn()}
 };
 update();
 u.timer=setInterval(()=>{remaining--;u.left=remaining;update()},1000);
}
function stopTimer(kind){const u=ui[kind];if(u.timer)clearInterval(u.timer);u.timer=null;const ring=$("#wsBreathRing");if(ring)ring.classList.remove("expanding")}
document.addEventListener("click",ev=>{
 const b=ev.target.closest("[data-ws]");if(!b)return;
 ev.preventDefault();
 const parts=String(b.dataset.ws||"").split(":"),kind=parts.shift(),action=parts.shift();
 if(!["student","parent"].includes(kind)||b.disabled)return;
 handle(kind,action,parts);
});
const studentSummary=data=>{
 const p=data?.advancedModules?.kaygi||{},steps=Array.isArray(p.steps)?p.steps.length:0,days=Array.isArray(p.practiceDates)?p.practiceDates.length:0;
 return '<div class="tile" style="margin-top:16px"><div class="row" style="justify-content:space-between"><div><h3>🌿 Kaygıyla baş etme atölyem</h3><p>Uygulamalı atölye: '+steps+' / 6 aşama · Günlük uygulama: '+days+' gün</p></div><button class="btn small light" data-action="lesson:kaygi">Atölyeyi aç →</button></div><div class="progress"><span style="width:'+Math.round(steps/6*100)+'%"></span></div><small>Bu ilerleme beceri yeterliği veya kaygı düzeyi ölçümü değildir.</small></div>';
};
const parentSummary=data=>{
 const p=data?.advancedModules?.kaygi_destegi||{},steps=Array.isArray(p.steps)?p.steps.length:0,days=Array.isArray(p.practiceDates)?p.practiceDates.length:0;
 return '<div class="tile" style="margin-top:16px"><h3>🌿 Sınav kaygısında destek atölyem</h3><p>'+steps+' / 6 aşama · '+days+' farklı günde uygulama</p><div class="progress"><span style="width:'+Math.round(steps/6*100)+'%"></span></div><button class="btn small light" data-action="familyLesson:kaygi_destegi" style="margin-top:12px">Atölyeye dön →</button></div>';
};
window.LGSWorkshops={
 renderStudent:options=>{ctx.student=options;return render("student")},
 renderParent:options=>{ctx.parent=options;return render("parent")},
 studentSummary,parentSummary,stopTimer,
 enter:kind=>{stopTimer(kind);ui[kind].loaded=false;ui[kind].signals=[];ui[kind].matched={};ui[kind].scenario={};ui[kind].listen={};ui[kind].calm="";ui[kind].thought="";ui[kind].situation="";ui[kind].action="";}
};
})();