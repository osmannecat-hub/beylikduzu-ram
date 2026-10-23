const PUBLIC_KEY='sb_publishable_qd7956g-qF9_RVj6xIoX8w_3UQg02R8';
const labels=["Anne en fazla ilkokul mezunu", "Baba en fazla ilkokul mezunu", "Tek çocuk olan", "5 ve üstü kardeşi olan", "Anne ve babası ayrı yaşayan ", "Anne ve babası boşanmış olan", "Yalnızca annesi ile yaşayan", "Yalnızca babası ile yaşayan", "Annesi hayatta olmayan", "Babası hayatta olmayan", "Anne ve babası hayatta olmayan ", " Şehit Çocuğu", "Yalnızca büyükanne/büyükbabasıyla yaşayan", "Yalnızca diğer akrabalarıyla yaşayan", "Koruyucu aile gözetiminde olan", "Sevgi Evlerinde kalan", "Sosyal Hizmetler Çocuk Esirgeme Kurumunda kalan", "Ailesinde süreğen hastalığı olan", "Ailesinde ruhsal hastalığı olan", "Ailesinde Bağımlı Bireyler Bulunan (alkol/madde)", "Ailesinde cezai hükmü bulunan", "Ailesi mevsimlik işçi olan", "Aile içi şiddete maruz kalan", "Özel Yetenekli tanısı olan", "Yetersizlik alanında özel eğitim raporu olan", "Süreğen hastalığı olan", "Ruhsal hastalığı olan", "Danışmanlık  Tedbir Kararı Olan ", " Eğitim Tedbir Kararı Olan ", "Maddi Sıkıntı Yaşayan", "Sürekli Devamsız olan", "Bir işte çalışan", "Akademik Başarısı Düşük ", "Riskli akran grubuna dahil olan", "Okulda bulunan yabancı uyruklu öğrenci sayısı", "Diğer"];
const $=id=>document.getElementById(id),message=s=>$('msg').textContent=s;
const API='https://uftqsvxieizpclpxbejs.supabase.co';
let session=null,user=null,admin=false,schools=[],submissions=[],members=[],current=null,version=null,reportPayload=null,schoolAccounts=[];
let bulkRunning=false,bulkStop=false,bulkIssued=[],bulkFailures=[],bulkDownloadedCount=0;
try{session=JSON.parse(sessionStorage.getItem('ram-session')||'null');}catch{}
const hash=new URLSearchParams(location.hash.slice(1));if(hash.has('access_token')){session={access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token')};history.replaceState(null,'',location.pathname);sessionStorage.setItem('ram-session',JSON.stringify(session));}
async function api(path,{method='GET',body,auth=true,retry=true}={}){const headers={apikey:PUBLIC_KEY,'Content-Type':'application/json'};if(auth&&session)headers.Authorization='Bearer '+session.access_token;if(path.startsWith('/rest/'))headers.Prefer='return=representation';const res=await fetch(API+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});const data=await res.json().catch(()=>null);if(res.status===401&&auth&&session?.refresh_token&&retry){const refreshed=await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token},auth:false,retry:false});session=refreshed;sessionStorage.setItem('ram-session',JSON.stringify(session));return api(path,{method,body,auth,retry:false});}if(!res.ok)throw Error(data?.msg||data?.message||data?.error_description||data?.error||'İşlem başarısız ('+res.status+')');return data;}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const opts=items=>items.map(s=>'<option value="'+s.id+'">'+esc(s.name)+' · '+esc(s.level)+' · '+esc(s.sector)+'</option>').join('');
const rows=arr=>arr.map(s=>({...s,payload:{district:'Beylikdüzü',school:schools.find(x=>x.id===s.school_id)?.name||'Okul',level:schools.find(x=>x.id===s.school_id)?.level||'',period:s.period,grade:'OKUL',section:'GENEL',student_count:0,counts:s.counts}}));
async function refresh(){
schools=await api('/rest/v1/ram_schools?select=*&order=name');
if(!user)return;
admin=(await api('/rest/v1/ram_admins?select=user_id')).length>0;
members=await api('/rest/v1/ram_memberships?select=*');
submissions=rows(await api('/rest/v1/ram_submissions?select=*&order=updated_at.desc'));
$('loginPanel').hidden=true;
$('identityPanel').hidden=false;
const own=schools.filter(s=>members.some(m=>m.school_id===s.id));
$('identity').textContent=admin?(user.email+' · RAM yöneticisi'):(own.map(x=>x.name).join(', ')||user.email)+' · Okul yetkilisi';
$('adminPanel').hidden=!admin;
$('schoolPanel').hidden=admin;
$('requestPanel').hidden=admin||own.length>0;
$('assignedSchool').innerHTML='<option value="">Okul seçiniz</option>'+opts(own);
$('requestSchool').innerHTML='<option value="">Yetki istenecek okul</option>'+opts(schools.filter(s=>s.active));
if(admin){
  schoolAccounts=await api('/rest/v1/ram_school_logins?select=school_id,rotated_at');
  const sel=$('credentialsSchool'),previous=sel.value;
  sel.innerHTML='<option value="">Şifre tanımlanacak okul</option>'+opts(schools.filter(s=>s.active));
  if(previous&&schools.some(s=>s.id===previous))sel.value=previous;
  updateCredentialsUi();
  await renderAdmin();
} else message(own.length?'Yetkili olduğunuz okulu seçiniz.':'Okulunuzu seçip erişim isteği gönderiniz. RAM onayladıktan sonra formu doldurabilirsiniz.');
}
async function init(){
try{
  schools=await api('/rest/v1/ram_schools?select=*&active=eq.true&order=name',{auth:false});
  $('loginSchool').innerHTML='<option value="">Okulunuzu seçiniz</option>'+opts(schools);
  if(session){user=await api('/auth/v1/user');await refresh();}
  else message('Okulunuzu ve RAM tarafından verilen şifreyi giriniz. Yöneticiyseniz alt bölümden giriş yapınız.');
}catch(e){
  if(session){session=null;sessionStorage.removeItem('ram-session');}
  message('Bağlantı veya giriş sorunu: '+e.message);
}}
$('login').onclick=async()=>{try{message('Giriş yapılıyor…');session=await api('/auth/v1/token?grant_type=password',{method:'POST',body:{email:$('email').value.trim(),password:$('password').value},auth:false});sessionStorage.setItem('ram-session',JSON.stringify(session));$('password').value='';user=await api('/auth/v1/user');await refresh();}catch(e){message('Giriş yapılamadı: '+e.message);}};
$('schoolSignIn').onclick=async()=>{
const selected=$('loginSchool').value,password=$('schoolPassword').value;
if(!selected){message('Önce okulunuzu seçiniz.');return;}
if(!password){message('RAM tarafından verilen okul şifresini giriniz.');return;}
const b=$('schoolSignIn');b.disabled=true;
try{
 message('Okul girişi doğrulanıyor…');
 const internalEmail='school-'+selected.replace(/-/g,'')+'@example.org';
 session=await api('/auth/v1/token?grant_type=password',{method:'POST',body:{email:internalEmail,password},auth:false});
 sessionStorage.setItem('ram-session',JSON.stringify(session));
 $('schoolPassword').value='';
 user=await api('/auth/v1/user');
 await refresh();
}catch(e){message('Giriş yapılamadı. Okulunuzu ve RAM tarafından verilen şifreyi kontrol ediniz.');}
finally{b.disabled=false;}
};
$('logout').onclick=async()=>{try{await api('/auth/v1/logout',{method:'POST'});}catch{}sessionStorage.removeItem('ram-session');location.reload();};
$('refresh').onclick=()=>refresh().catch(e=>message(e.message));
$('requestAccess').onclick=async()=>{const id=$('requestSchool').value;if(!id){message('Önce okul seçiniz.');return;}try{await api('/rest/v1/ram_access_requests',{method:'POST',body:{user_id:user.id,school_id:id,email:user.email}});message("Okul erişim isteğiniz RAM'a ulaştı. Onaylandıktan sonra “Yenile” düğmesine basınız.");}catch(e){message('İstek alınamadı (aynı istek önceden gönderilmiş olabilir): '+e.message);}};
$('risks').innerHTML=labels.map((label,i)=>'<div class="risk"><span>'+(i+1)+'. '+esc(label.trim())+'</span><input aria-label="'+(i+1)+'. gösterge sayısı" type="number" min="0" max="100000" step="1" value="0" data-indicator="'+(i+1)+'"></div>').join('');
function payload(){const s=schools.find(x=>x.id===$('assignedSchool').value);const counts={};document.querySelectorAll('[data-indicator]').forEach(x=>counts[x.dataset.indicator]=x.value.trim()===''?NaN:Number(x.value));return {district:'Beylikdüzü',school:s?.name||'',level:s?.level||'',period:$('period').value.trim(),grade:'OKUL',section:'GENEL',student_count:0,counts};}
function validate(p){return p&&p.school&&/^\d{4}-\d{4}$/.test(p.period)&&Number(p.period.slice(5))===Number(p.period.slice(0,4))+1&&Object.values(p.counts).length===36&&Object.values(p.counts).every(v=>Number.isInteger(v)&&v>=0&&v<=100000);}
function checked(){if(admin)return reportPayload;const p=payload();if(!validate(p)){message('Okul, ardışık eğitim yılı ve 36 sayıyı kontrol ediniz. Boş alan bırakmayınız.');return null;}return p;}
async function loadSchool(){current=null;version=null;$('schoolReportContent').hidden=true;const id=$('assignedSchool').value;if(!id)return;const found=await api('/rest/v1/ram_submissions?select=*&school_id=eq.'+id+'&period=eq.'+encodeURIComponent($('period').value.trim()));current=found[0]||null;version=current?.version??null;document.querySelectorAll('[data-indicator]').forEach(x=>x.value=current?.counts[x.dataset.indicator]??0);message(current?"RAM’da kayıtlı form yüklendi. Düzenleyip tekrar gönderebilirsiniz.":"Bu okul ve dönem için yeni form.");}
$('assignedSchool').onchange=()=>loadSchool().catch(e=>message(e.message));$('period').onchange=()=>loadSchool().catch(e=>message(e.message));
$('save').onclick=async()=>{const p=checked();if(!p)return;const b=$('save');b.disabled=true;try{const body={school_id:$('assignedSchool').value,period:p.period,counts:p.counts,updated_by:user.id};const saved=current?await api('/rest/v1/ram_submissions?id=eq.'+current.id+'&version=eq.'+version,{method:'PATCH',body}):await api('/rest/v1/ram_submissions',{method:'POST',body});if(!saved.length)throw Error('Kayıt başka bir girişte değiştirildi. Okulu yeniden seçip güncel formu yükleyiniz.');current=saved[0];version=current.version;message("Kaydınız Beylikdüzü RAM'a ulaştı.");}catch(e){message('Gönderilemedi: '+e.message);}finally{b.disabled=false;}};
function selectedRecords(){return submissions.filter(r=>r.period===$('adminPeriod').value.trim()&&(!$('adminLevel').value||r.payload.level===$('adminLevel').value));}
async function renderAdmin(){const period=$('adminPeriod').value.trim(),term=$('adminSearch').value.toLocaleLowerCase('tr-TR'),level=$('adminLevel').value;const list=schools.filter(s=>(!level||s.level===level)&&s.name.toLocaleLowerCase('tr-TR').includes(term));$('adminRows').innerHTML=list.map(s=>{const r=submissions.find(r=>r.school_id===s.id&&r.period===period);return '<tr><td>'+esc(s.name)+'<br><small>'+esc(s.sector)+'</small></td><td>'+esc(s.level)+'</td><td>'+(r?'Geldi':'Bekleniyor')+'</td><td>'+(r?'<button data-report="'+r.id+'">Formu gör</button>':'—')+'</td></tr>';}).join('');document.querySelectorAll('[data-report]').forEach(b=>b.onclick=()=>{const r=submissions.find(x=>x.id===b.dataset.report);reportPayload=r.payload;buildSchoolReport();$('schoolReportContent').scrollIntoView({behavior:'smooth'});});$('adminSummary').textContent='Listede '+list.length+' okul · '+list.filter(s=>submissions.some(r=>r.school_id===s.id&&r.period===period)).length+' form geldi';
const submitted=submissions.filter(r=>r.period===period&&(!level||r.payload.level===level)&&r.payload.school.toLocaleLowerCase('tr-TR').includes(term));
$('submittedRows').innerHTML=submitted.map(r=>'<tr><td>'+esc(r.payload.school)+'</td><td>'+esc(r.period)+'</td><td>'+esc(new Date(r.updated_at).toLocaleString('tr-TR'))+'</td><td><button type="button" data-sent-report="'+esc(r.id)+'">Görüntüle</button><button type="button" class="danger" data-sent-delete="'+esc(r.id)+'">Sil</button></td></tr>').join('')||'<tr><td colspan="4">Seçilen filtrelerde gönderilmiş form bulunamadı.</td></tr>';
document.querySelectorAll('[data-sent-report]').forEach(b=>b.onclick=()=>{const r=submissions.find(x=>x.id===b.dataset.sentReport);if(!r)return;reportPayload=r.payload;buildSchoolReport();$('schoolReportContent').scrollIntoView({behavior:'smooth'});});
document.querySelectorAll('[data-sent-delete]').forEach(b=>b.onclick=async()=>{
if(!admin){message('Bu işlem yalnızca RAM yöneticilerine açıktır.');return;}
const r=submissions.find(x=>x.id===b.dataset.sentDelete);if(!r)return;
const school=schools.find(x=>x.id===r.school_id);if(!school)return;
const approval=window.prompt('UYARI: '+school.name+' okulunun '+r.period+' dönemine ait formu kalıcı olarak silinecek. Bu işlem geri alınamaz. Onaylamak için kurum kodunu yazınız: '+school.code);
if(approval===null)return;
if(approval.trim()!==school.code){message('Kurum kodu uyuşmuyor. Form silinmedi.');return;}
if(!window.confirm(school.name+' formunu kalıcı olarak silmek istediğinizden emin misiniz?'))return;
b.disabled=true;
try{
const deleted=await api('/rest/v1/ram_submissions?id=eq.'+encodeURIComponent(r.id)+'&version=eq.'+encodeURIComponent(r.version),{method:'DELETE'});
if(!Array.isArray(deleted)||deleted.length!==1)throw Error('Kayıt silinemedi veya başka bir kullanıcı tarafından güncellendi. Listeyi yenileyiniz.');
submissions=submissions.filter(x=>x.id!==r.id);
reportPayload=null;$('schoolReportContent').hidden=true;$('schoolReportContent').innerHTML='';
await renderAdmin();
message(school.name+' okulunun '+r.period+' dönemi formu silindi.');
}catch(e){message('Silme işlemi başarısız: '+e.message);}finally{b.disabled=false;}
});
const requests=await api('/rest/v1/ram_access_requests?select=*&order=created_at');$('requests').innerHTML=requests.map(r=>'<p>'+esc(r.email)+' · '+esc(schools.find(s=>s.id===r.school_id)?.name||'')+' <button data-user="'+r.user_id+'" data-school="'+r.school_id+'">Okul erişimini onayla</button></p>').join('')||'Bekleyen erişim isteği yok.';document.querySelectorAll('[data-user]').forEach(b=>b.onclick=async()=>{if(!confirm('Bu e-posta adresinin seçilen okulun yetkili öğretmenine ait olduğunu doğruladınız mı?'))return;try{await api('/rest/v1/rpc/ram_approve_request',{method:'POST',body:{target_user:b.dataset.user,target_school:b.dataset.school}});await refresh();message('Okul erişimi onaylandı.');}catch(e){message(e.message);}});}

function makeSchoolPassword(){
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
const random=crypto.getRandomValues(new Uint8Array(28));
return 'R'+Array.from(random,n=>alphabet[n%alphabet.length]).join('');
}
function updateCredentialsUi(){
const id=$('credentialsSchool').value,exists=schoolAccounts.some(x=>x.school_id===id);
const school=schools.find(x=>x.id===id);
$('credentialsStatus').textContent=!school?'Okulu seçiniz.':(exists?'Bu okulun giriş şifresi tanımlı. Gerekirse yeni şifre üretebilirsiniz.':'Bu okula henüz giriş şifresi verilmemiş.');
$('issueSchoolPassword').disabled=!school||exists||bulkRunning;
$('rotateSchoolPassword').disabled=!school||!exists||bulkRunning;
}
$('credentialsSchool').onchange=()=>{
$('credentialsReveal').hidden=true;
$('issuedSchoolPassword').textContent='';
updateCredentialsUi();
};
async function handleCredentials(action){
if(!admin){message('RAM yönetici yetkisi gerekli.');return;}
const id=$('credentialsSchool').value,school=schools.find(x=>x.id===id);
if(!school){message('Okul seçiniz.');return;}
const isRotate=action==='rotate',verb=isRotate?'yenilenmesini':'oluşturulmasını';
if(!window.confirm(school.name+' okulunun giriş şifresinin '+verb+' onaylıyor musunuz?'))return;
const password=makeSchoolPassword();
const btn=$(isRotate?'rotateSchoolPassword':'issueSchoolPassword');
btn.disabled=true;
$('credentialsReveal').hidden=true;
$('issuedSchoolPassword').textContent='';
try{
 await api('/functions/v1/ram-school-credentials',{method:'POST',body:{action,school_id:id,password}});
 $('issuedSchoolPassword').textContent=password;
 $('credentialsReveal').hidden=false;
 schoolAccounts=await api('/rest/v1/ram_school_logins?select=school_id,rotated_at');
 updateCredentialsUi();
 message(school.name+' okuluna ait şifre '+(isRotate?'yenilendi.':'oluşturuldu.')+' Lütfen şifreyi güvenli yoldan okula iletiniz.');
}catch(e){message('Şifre işlemi başarısız: '+e.message);}
finally{updateCredentialsUi();}
}
$('issueSchoolPassword').onclick=()=>handleCredentials('provision');
$('rotateSchoolPassword').onclick=()=>handleCredentials('rotate');
$('copySchoolPassword').onclick=async()=>{
const pwd=$('issuedSchoolPassword').textContent;
if(!pwd)return;
try{await navigator.clipboard.writeText(pwd);message('Okul şifresi panoya kopyalandı.');}
catch{message('Panoya kopyalama engellendi. Şifreyi ekrandan seçip kopyalayınız.');}
};

function bulkUi(){
  const ready=admin&&!bulkRunning&&bulkIssued.length<=bulkDownloadedCount;
  $('bulkCreatePasswords').disabled=!ready;
  $('bulkDownloadPasswords').disabled=bulkIssued.length===0;
  $('bulkStopPasswords').hidden=!bulkRunning;
  $('bulkPasswordFailures').hidden=bulkFailures.length===0;
  $('bulkPasswordFailureList').textContent=bulkFailures.map(x=>x.school.name+' ('+(x.school.code||'kod yok')+'): '+x.error).join('\n');
}
window.addEventListener('beforeunload',e=>{
  if(bulkRunning||bulkIssued.length>bulkDownloadedCount){
    e.preventDefault();
    e.returnValue='';
  }
});
function csvCell(value){
  let v=String(value??'').replace(/[\x00-\x1f\x7f]/g,' ').trim();
  // Mitigate spreadsheet formula injection in school names and other external labels.
  if(/^[=+\-@]/.test(v))v="'"+v;
  return '"'+v.replace(/"/g,'""')+'"';
}
function downloadSchoolCredentials(){
  if(!admin||!bulkIssued.length)return;
  const rows=[
    ['Kurum Adı','Kurum Kodu','Kademe','Tür','Kontrol Gerekiyor','Okul Kimliği','Giriş Şifresi','Giriş Adresi'],
    ...bulkIssued.map(({school,password})=>[
      school.name,school.code||'',school.level,school.sector,
      school.needs_review?'Evet':'Hayır',school.id,password,
      'https://osmannecat-hub.github.io/beylikduzu-ram/'
    ])
  ];
  const csv='\uFEFF'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n');
  const file=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(file);
  try{
    const a=document.createElement('a');
    a.href=url;
    a.download='Beylikduzu_RAM_Okul_Giris_Sifreleri_'+new Date().toISOString().slice(0,10)+'.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    bulkDownloadedCount=bulkIssued.length;
    message(bulkIssued.length+' okulun yeni şifresini içeren CSV indirme işlemi başlatıldı. Dosyayı kontrol edip yalnızca ilgili okul yetkilisiyle tekil olarak paylaşınız.');
  }finally{
    setTimeout(()=>URL.revokeObjectURL(url),10000);
    bulkUi();
  }
}
$('bulkDownloadPasswords').onclick=downloadSchoolCredentials;
$('bulkStopPasswords').onclick=()=>{bulkStop=true;message('İşlemi durdurma isteği alındı. Devam etmeden önce oluşturulan şifreleri CSV olarak kaydediniz.');};
$('bulkCreatePasswords').onclick=async()=>{
  if(!admin||bulkRunning)return;
  if(bulkIssued.length>bulkDownloadedCount){
    message('Yeni işleme geçmeden önce mevcut şifre listesini CSV olarak indiriniz.');
    return;
  }
  let fresh;
  try{
    fresh=await api('/rest/v1/ram_school_logins?select=school_id');
    if(!Array.isArray(fresh))throw Error('Hesap listesi alınamadı.');
  }catch(e){message('Mevcut okul hesapları kontrol edilemedi: '+e.message);return;}
  schoolAccounts=fresh;
  const existing=new Set(fresh.map(r=>r.school_id));
  const pending=schools.filter(s=>s.active&&!existing.has(s.id));
  if(!pending.length){message('Şifresi olmayan aktif okul kalmadı. Mevcut şifreleri görmek mümkün değildir; gerekirse tekil şifre yenileyebilirsiniz.');return;}
  const warning=pending.length+' aktif okul için YENİ giriş hesabı ve ayrı şifre oluşturulacak. '+existing.size+' mevcut okul hesabının şifresi korunacak.\n\nİşlem uzun sürebilir. Sekmeyi kapatmayın. Şifre listesini CSV olarak indirmeden bu sayfadan ayrılmayın. Devam edilsin mi?';
  if(!window.confirm(warning))return;
  bulkIssued=[];bulkFailures=[];bulkDownloadedCount=0;bulkStop=false;bulkRunning=true;
  const progress=$('bulkPasswordProgress');
  progress.max=pending.length;
  progress.value=0;
  $('bulkPasswordStatus').textContent='Hazırlanıyor… 0 / '+pending.length;
  bulkUi();
  updateCredentialsUi();
  let failuresInRow=0,attempted=0,alreadyThere=0;
  for(const school of pending){
    if(bulkStop)break;
    const password=makeSchoolPassword();
    try{
      const result=await api('/functions/v1/ram-school-credentials',{
        method:'POST',body:{action:'provision',school_id:school.id,password}
      });
      if(!result?.success||result.action!=='provisioned')throw Error('Sunucu hesap oluşturmayı doğrulamadı.');
      bulkIssued.push({school,password});
      schoolAccounts.push({school_id:school.id});
      failuresInRow=0;
    }catch(e){
      let recovered=false;
      // A lost response can occur after successful provisioning. Verify the
      // proposed password, but NEVER assume an already-existing account uses it.
      try{
        const lookup=await api('/rest/v1/ram_school_logins?select=school_id&school_id=eq.'+encodeURIComponent(school.id));
        if(Array.isArray(lookup)&&lookup.length){
          const internalEmail='school-'+school.id.replace(/-/g,'')+'@example.org';
          const signedIn=await api('/auth/v1/token?grant_type=password',{
            method:'POST',auth:false,retry:false,
            body:{email:internalEmail,password}
          });
          if(signedIn?.access_token){
            bulkIssued.push({school,password});
            schoolAccounts.push({school_id:school.id});
            recovered=true;
          }else{
            alreadyThere++;
          }
        }
      }catch{}
      if(recovered)failuresInRow=0;
      else{
        bulkFailures.push({school,error:e?.message||'Hesap oluşturulamadı'});
        failuresInRow++;
      }
    }
    attempted++;
    progress.value=attempted;
    $('bulkPasswordStatus').textContent='İşlenen: '+attempted+'/'+pending.length+' · Oluşturulan: '+bulkIssued.length+' · Hata: '+bulkFailures.length+' · Mevcut hesaplar: '+existing.size+'. İstediğiniz anda kısmi CSV indirebilirsiniz.';
    bulkUi();
    if(failuresInRow>=3){
      bulkStop=true;
      message('Arka arkaya üç hata oluştu. Gereksiz kayıt denemelerini önlemek için işlem durduruluyor. Hataları kontrol edin ve eldeki şifreleri CSV olarak indirin.');
    }
  }
  bulkRunning=false;
  try{schoolAccounts=await api('/rest/v1/ram_school_logins?select=school_id,rotated_at');}
  catch(e){message('Okul şifreleri üretildi ancak güncel hesap listesi getirilemedi: '+e.message);}
  updateCredentialsUi();
  bulkUi();
  $('bulkPasswordStatus').textContent=(bulkStop?'İşlem durduruldu. ':'Toplu işlem tamamlandı. ')+
    'Yeni hesap: '+bulkIssued.length+' · Hata: '+bulkFailures.length+
    ' · Toplam hedef: '+pending.length+
    (alreadyThere?' · Başka işlemde oluşturulmuş hesap: '+alreadyThere:'')+
    '. Şifreleri CSV olarak indirmeyi unutmayınız.';
  if(bulkIssued.length){
    message('Yeni okul hesapları oluşturuldu. Şimdi “Şifre listesini CSV indir” düğmesine basıp listeyi güvenle saklayınız.');
    $('bulkDownloadPasswords').focus();
  }else message('Şifre oluşturulamadı. Hata ayrıntılarını kontrol ediniz.');
};

['adminPeriod','adminLevel','adminSearch'].forEach(id=>$(id).oninput=()=>renderAdmin().catch(e=>message(e.message)));
$('districtReport').onclick=()=>{const records=selectedRecords();if(!records.length){message('Bu dönemde yüklenmiş form yok.');return;}reportPayload={district:'Beylikdüzü',school:'İlçe toplamı · '+records.length+' okul formu',level:$('adminLevel').value||'Tüm kademeler',period:$('adminPeriod').value.trim(),counts:Object.fromEntries(labels.map((_,i)=>[i+1,records.reduce((n,r)=>n+r.counts[i+1],0)]))};buildSchoolReport();$('schoolReportContent').scrollIntoView({behavior:'smooth'});};
$('showSchoolReport').onclick=()=>{if(buildSchoolReport())$('schoolReportContent').scrollIntoView({behavior:'smooth'});};$('printSchoolReport').onclick=()=>{if(buildSchoolReport())window.print();};
init();

const reportRecommendations=[
{keys:[0,1,3,21,29],title:"Aile koşulları ve sosyal destek",body:"Ailelerin ihtiyaçlarını belirlemek üzere rehberlik görüşmeleri planlanabilir; okul yönetimiyle birlikte sosyal yardım, burs ve ilgili kamu hizmetlerine yönlendirme değerlendirilebilir."},
{keys:[4,5,6,7,8,9,10,12,13,14,15,16],title:"Aile yapısı ve bakım koşulları",body:"Öğrencilerin okul aidiyetini güçlendiren destekleyici çalışmalar, veli görüşmeleri ve gerektiğinde ilgili kurumlarla iş birliği planlanabilir. Aile yapısı tek başına risk veya sorun olarak yorumlanmamalıdır."},
{keys:[17,18,19,22,26],title:"Psikososyal destek ve güvenlik",body:"Öğrencilerin ihtiyaçlarına yönelik bireysel değerlendirme, koruyucu-önleyici psikoeğitim ve gerektiğinde yetkili birimlere yönlendirme yapılabilir. Şiddet veya istismar şüphesinde yürürlükteki bildirim ve çocuk koruma süreçleri izlenmelidir."},
{keys:[23,24,25],title:"Özel eğitim ve farklılaştırılmış destek",body:"BEP ve eğitsel değerlendirme süreçleri gözden geçirilebilir; öğretmen müşavirliği, aile iş birliği ve öğrencinin güçlü yönlerine dayalı destek planlanabilir."},
{keys:[27,28],title:"Koruyucu ve destekleyici tedbirlerin takibi",body:"Mevcut tedbir kararları kapsamında ilgili birimler arasında koordinasyon, izleme ve mevzuata uygun raporlama süreçleri güçlendirilebilir."},
{keys:[30,31,32],title:"Devamsızlık ve akademik destek",body:"Devamsızlık nedenleri araştırılabilir; akademik destek, okul-aile görüşmeleri ve öğrenciye özel izleme planı hazırlanabilir."},
{keys:[33],title:"Akran ilişkileri ve okul iklimi",body:"Akran ilişkileri, zorbalığı önleme, sosyal-duygusal öğrenme ve güvenli okul iklimi çalışmalarına öncelik verilebilir."},
{keys:[34],title:"Dil ve uyum desteği",body:"İhtiyaca göre Türkçe dil desteği, kapsayıcı sınıf uygulamaları ve aile-okul iletişimini güçlendiren çalışmalar planlanabilir. Yabancı uyruklu olmak tek başına risk göstergesi değildir."}
];
function escapeReport(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function buildSchoolReport(){
const p=checked();if(!p)return false;
const ranked=labels.map((label,i)=>({label:label.trim(),i,n:p.counts[String(i+1)]||0})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n||a.i-b.i);
const total=ranked.reduce((a,x)=>a+x.n,0),top=ranked.slice(0,5),max=Math.max(1,...ranked.map(x=>x.n));
const school=escapeReport(p.school||"Okul adı belirtilmedi");
const title='<h2>Beylikdüzü RAM · Okul Risk Haritası Analiz Raporu</h2><p><b>'+school+'</b> · '+escapeReport(p.district)+' · '+escapeReport(p.level)+' · '+escapeReport(p.period)+'</p>';
const stats='<div class="report-summary"><div class="report-stat">Toplam gösterge bildirimi<strong>'+total+'</strong></div><div class="report-stat">Sıfırdan büyük gösterge<strong>'+ranked.length+' / 36</strong></div><div class="report-stat">En yüksek gösterge sayısı<strong>'+(ranked[0]?.n||0)+'</strong></div></div>';
if(!ranked.length){$('schoolReportContent').innerHTML=title+stats+'<p>Henüz sıfırdan büyük bir gösterge girilmedi. Sayıları girdikten sonra raporu yeniden oluşturun.</p><p class="report-note">Bu rapor okulun kendi veri girişine dayanır; başka okullarla karşılaştırma içermez.</p>'; $('schoolReportContent').hidden=false;return true;}
const bars=ranked.map((x,j)=>'<div class="report-row"><div class="report-row-head"><span>'+(j+1)+'. '+escapeReport(x.label)+'</span><strong>'+x.n+'</strong></div><div class="report-bar-track"><div class="report-bar-fill" style="width:'+(x.n/max*100).toFixed(1)+'%"></div></div></div>').join('');
const topHtml='<h3>En sık bildirilen ilk 5 gösterge</h3><ol>'+top.map(x=>'<li>'+escapeReport(x.label)+' — <b>'+x.n+'</b></li>').join('')+'</ol>';
const matches=reportRecommendations.map(g=>({...g,score:top.filter(x=>g.keys.includes(x.i)).reduce((a,x)=>a+x.n,0)})).filter(g=>g.score>0).sort((a,b)=>b.score-a.score);
const suggestions='<h3>Önceliklendirilebilecek çalışmalar</h3>'+(matches.length?matches.map(g=>'<div class="report-advice"><b>'+escapeReport(g.title)+'</b><p>'+escapeReport(g.body)+'</p></div>').join(''):'<p>İlk beş göstergenin içeriğine göre okul rehberlik servisi tarafından ihtiyaç analizi yapılması önerilir.</p>');
const interpretation='<h3>Değerlendirme</h3><p>Okulun veri girişinde en yüksek sayı <b>'+escapeReport(ranked[0].label)+'</b> göstergesinde ('+ranked[0].n+') görülmektedir. İlk beş gösterge, okul rehberlik hizmetlerinin planlanmasında ihtiyaç değerlendirmesi için başlangıç noktası olarak ele alınabilir. Çalışmalar öğrencilerin bireysel ihtiyaçları, koruyucu faktörler ve okulun koşulları dikkate alınarak planlanmalıdır.</p>';
const note='<p class="report-note"><b>Yorumlama notu:</b> Aynı öğrenci birden fazla göstergeye dahil olabilir. Toplam '+total+' değeri tekil öğrenci sayısı değildir. Okul öğrenci sayısı alınmadığından oran veya yaygınlık hesaplanmaz. Sayılar tanı, nedensellik veya tek başına risk düzeyi anlamına gelmez. Bu rapor ekrandaki mevcut değerlerin anlık görüntüsüdür; kaydedilmiş olma şartı yoktur.</p>';
$('schoolReportContent').innerHTML=title+stats+topHtml+'<h3>36 gösterge grafiği (sıfırdan büyük değerler)</h3>'+bars+interpretation+suggestions+note;
$('schoolReportContent').hidden=false;return true;
}
