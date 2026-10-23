// Beylikdüzü RAM: admin-only school password provisioning without sending email.
const PROJECT_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const PUBLISHABLE_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const ADMIN_ORIGIN = 'https://osmannecat-hub.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ADMIN_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'Vary': 'Origin'
};
function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
const adminHeaders = () => ({
  'Authorization': 'Bearer ' + SERVICE_KEY,
  'apikey': SERVICE_KEY,
  'Content-Type': 'application/json'
});
async function fetchAdmin(path: string, init: RequestInit = {}) {
  const res = await fetch(PROJECT_URL + path, { ...init, headers: { ...adminHeaders(), ...(init.headers ?? {}) } });
  const value = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, value };
}
Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== 'POST') return json(405, { error: 'Yalnızca POST desteklenir.' });
  if (!PROJECT_URL || !SERVICE_KEY || !PUBLISHABLE_KEY) return json(503, { error: 'Sunucu yapılandırması eksik.' });
  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return json(401, { error: 'Oturum açmanız gerekiyor.' });
  try {
    const self = await fetch(PROJECT_URL + '/auth/v1/user', {
      headers: { 'apikey': PUBLISHABLE_KEY, 'Authorization': 'Bearer ' + token }
    });
    if (!self.ok) return json(401, { error: 'Oturum süresi dolmuş.' });
    const me = await self.json();
    if (!me?.id) return json(401, { error: 'Kullanıcı doğrulanamadı.' });
    const admin = await fetchAdmin('/rest/v1/ram_admins?select=user_id&user_id=eq.' + encodeURIComponent(me.id));
    if (!admin.ok || !Array.isArray(admin.value) || admin.value.length !== 1) return json(403, { error: 'RAM yönetici yetkisi gerekiyor.' });
    const body = await request.json().catch(() => null);
    const schoolId = body?.school_id;
    const action = body?.action;
    const password = body?.password;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(schoolId ?? '')) return json(400, { error: 'Geçerli okul seçiniz.' });
    if (!['provision', 'rotate'].includes(action)) return json(400, { error: 'İşlem geçersiz.' });
    if (typeof password !== 'string' || password.length < 16 || password.length > 128) return json(400, { error: 'Şifre 16-128 karakter arasında olmalıdır.' });
    const checkSchool = await fetchAdmin('/rest/v1/ram_schools?select=id,active&id=eq.' + encodeURIComponent(schoolId));
    if (!checkSchool.ok || !Array.isArray(checkSchool.value) || checkSchool.value.length !== 1 || !checkSchool.value[0].active) return json(404, { error: 'Aktif okul bulunamadı.' });
    const found = await fetchAdmin('/rest/v1/ram_school_logins?select=user_id&school_id=eq.' + encodeURIComponent(schoolId));
    if (!found.ok || !Array.isArray(found.value)) return json(500, { error: 'Okul girişi denetlenemedi.' });
    const account = found.value[0];
    if (action === 'rotate') {
      if (!account?.user_id) return json(404, { error: 'Önce okula giriş şifresi oluşturunuz.' });
      const rotated = await fetchAdmin('/auth/v1/admin/users/' + encodeURIComponent(account.user_id), {
        method: 'PUT', body: JSON.stringify({ password })
      });
      if (!rotated.ok) return json(500, { error: 'Şifre değiştirilemedi.' });
      await fetchAdmin('/rest/v1/ram_school_logins?school_id=eq.' + encodeURIComponent(schoolId), {
        method: 'PATCH', body: JSON.stringify({ rotated_at: new Date().toISOString() })
      });
      return json(200, { success: true, action: 'rotated' });
    }
    if (account) return json(409, { error: 'Bu okulun zaten şifresi var. Şifre yenile seçeneğini kullanınız.' });
    // RFC reserved example.org domain, not a real school mailbox. No email is sent.
    const syntheticEmail = 'school-' + schoolId.replace(/-/g, '') + '@example.org';
    const created = await fetchAdmin('/auth/v1/admin/users', {
      method: 'POST', body: JSON.stringify({ email: syntheticEmail, password, email_confirm: true })
    });
    const userId = created.value?.id;
    if (!created.ok || !userId) return json(500, { error: 'Okul hesabı oluşturulamadı. Sistem yöneticisiyle iletişime geçiniz.' });
    try {
      const loginCreated = await fetchAdmin('/rest/v1/ram_school_logins', {
        method: 'POST', body: JSON.stringify({ school_id: schoolId, user_id: userId })
      });
      if (!loginCreated.ok) throw new Error('Giriş eşleştirme başarısız.');
      const membershipCreated = await fetchAdmin('/rest/v1/ram_memberships', {
        method: 'POST', body: JSON.stringify({ school_id: schoolId, user_id: userId })
      });
      if (!membershipCreated.ok) throw new Error('Okul yetkilendirme başarısız.');
      return json(200, { success: true, action: 'provisioned' });
    } catch {
      await fetchAdmin('/rest/v1/ram_school_logins?school_id=eq.' + encodeURIComponent(schoolId), { method: 'DELETE' });
      await fetchAdmin('/rest/v1/ram_memberships?user_id=eq.' + encodeURIComponent(userId), { method: 'DELETE' });
      await fetchAdmin('/auth/v1/admin/users/' + encodeURIComponent(userId), { method: 'DELETE' });
      return json(500, { error: 'Hesap tamamlanamadı; işlem geri alındı.' });
    }
  } catch {
    return json(500, { error: 'Beklenmeyen sunucu hatası.' });
  }
});
