import { useState, useEffect } from 'react'
import { api } from './api/client'

// ─── GLOBAL STYLES ────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#07090f;--s1:#0c1018;--s2:#111520;--s3:#161d2a;
    --b1:#1c2535;--b2:#243044;
    --cyan:#00e5ff;--purple:#7c5cfc;--orange:#ff6b35;
    --green:#00e096;--red:#ff3b5c;--yellow:#ffb800;
    --t1:#e8edf5;--t2:#8896ab;--t3:#4a5a72;
    --ff:'Instrument Sans',sans-serif;
    --fd:'Syne',sans-serif;
    --fm:'JetBrains Mono',monospace;
  }
  html,body,#root{height:100%;width:100%}
  body{background:var(--bg);color:var(--t1);font-family:var(--ff);overflow-x:hidden}
  input,select,textarea,button{font-family:var(--ff)}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--b2);border-radius:3px}
  input,select,textarea{
    background:var(--s2);border:1px solid var(--b1);border-radius:8px;
    padding:10px 14px;color:var(--t1);font-size:13px;outline:none;
    transition:border-color .2s;width:100%;
  }
  input:focus,select:focus,textarea:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,229,255,.08)}
  input::placeholder{color:var(--t3)}
  select option{background:var(--s2)}
  table{width:100%;border-collapse:collapse}
  th{padding:11px 16px;text-align:left;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);background:var(--s2);border-bottom:1px solid var(--b1)}
  td{padding:13px 16px;font-size:13px;border-bottom:1px solid var(--b1);color:var(--t1)}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:rgba(255,255,255,.015)}
`

// ─── HELPERS ──────────────────────────────────────────────
function Badge({ type, children }) {
  const styles = {
    active:    { bg: 'rgba(0,224,150,.12)',  color: '#00e096', border: 'rgba(0,224,150,.25)' },
    locked:    { bg: 'rgba(255,59,92,.12)',  color: '#ff3b5c', border: 'rgba(255,59,92,.25)' },
    suspended: { bg: 'rgba(255,184,0,.12)',  color: '#ffb800', border: 'rgba(255,184,0,.25)' },
    closed:    { bg: 'rgba(0,229,255,.1)',   color: '#00e5ff', border: 'rgba(0,229,255,.2)'  },
  }
  const s = styles[type] || styles.active
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px',
      borderRadius:6, fontSize:11, fontWeight:700, fontFamily:'var(--fm)',
      letterSpacing:.5, textTransform:'uppercase',
      background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {children}
    </span>
  )
}

function Btn({ children, variant='primary', size='md', onClick, disabled, style={} }) {
  const variants = {
    primary: { background:'var(--cyan)', color:'var(--bg)' },
    danger:  { background:'rgba(255,59,92,.15)', color:'var(--red)', border:'1px solid rgba(255,59,92,.3)' },
    success: { background:'rgba(0,224,150,.15)', color:'var(--green)', border:'1px solid rgba(0,224,150,.3)' },
    ghost:   { background:'var(--s3)', color:'var(--t2)', border:'1px solid var(--b1)' },
    purple:  { background:'rgba(124,92,252,.15)', color:'var(--purple)', border:'1px solid rgba(124,92,252,.3)' },
  }
  const sizes = { sm:'5px 10px', md:'8px 16px', lg:'11px 22px' }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:sizes[size], borderRadius:8,
      fontSize: size==='sm'?12:size==='lg'?15:13,
      fontWeight:600, cursor:disabled?'not-allowed':'pointer',
      border:'none', opacity:disabled?.6:1,
      transition:'all .2s', whiteSpace:'nowrap',
      ...variants[variant], ...style
    }}>{children}</button>
  )
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:'var(--s1)', border:'1px solid var(--b1)',
      borderRadius:14, overflow:'hidden', ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ title, action }) {
  return (
    <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--b1)',
      display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ fontFamily:'var(--fd)', fontSize:15, fontWeight:700 }}>{title}</div>
      {action}
    </div>
  )
}

function StatCard({ label, value, color, meta, top }) {
  return (
    <div style={{ background:'var(--s1)', border:'1px solid var(--b1)', borderRadius:14,
      padding:20, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:top||color }} />
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase',
        color:'var(--t3)', marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:'var(--fd)', fontSize:32, fontWeight:800,
        lineHeight:1, color, marginBottom:4 }}>{value}</div>
      {meta && <div style={{ fontSize:12, color:'var(--t2)' }}>{meta}</div>}
    </div>
  )
}

function Modal({ title, children, onClose, footer }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)',
      backdropFilter:'blur(8px)', zIndex:200, display:'flex',
      alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'var(--s1)', border:'1px solid var(--b2)',
        borderRadius:18, width:'100%', maxWidth:540,
        maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 40px 80px rgba(0,0,0,.5)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--b1)',
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--fd)', fontSize:18, fontWeight:700 }}>{title}</div>
          <Btn variant='ghost' size='sm' onClick={onClose}>✕</Btn>
        </div>
        <div style={{ padding:24 }}>{children}</div>
        {footer && <div style={{ padding:'16px 24px', borderTop:'1px solid var(--b1)',
          display:'flex', justifyContent:'flex-end', gap:10 }}>{footer}</div>}
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'var(--t2)' }}>{label}</label>}
      <input {...props} />
    </div>
  )
}

function EmiBar({ paid, total }) {
  const pct = Math.round((paid/total)*100)
  return (
    <div>
      <div style={{ fontSize:12, fontFamily:'var(--fm)', marginBottom:4 }}>{paid}/{total}</div>
      <div style={{ height:5, background:'var(--s3)', borderRadius:3, width:90 }}>
        <div style={{ height:'100%', borderRadius:3, width:`${pct}%`,
          background:'linear-gradient(90deg,var(--purple),var(--cyan))' }} />
      </div>
    </div>
  )
}

// ─── LOGIN PAGE ───────────────────────────────────────────
function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    if (!username || !password) return setError('Sab fields bharein')
    setLoading(true); setError('')
    try {
      const data = await api.login(username, password)
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)',
      backgroundImage:'radial-gradient(ellipse at 20% 50%, rgba(0,229,255,.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,92,252,.05) 0%, transparent 60%)' }}>
      <div style={{ width:380 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:56, height:56, borderRadius:16,
            background:'linear-gradient(135deg,var(--cyan),var(--purple))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, margin:'0 auto 16px' }}>🔒</div>
          <div style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:800,
            letterSpacing:-1 }}>PhoneLock <span style={{ color:'var(--cyan)' }}>Admin</span></div>
          <div style={{ fontSize:13, color:'var(--t2)', marginTop:6 }}>Super Admin Portal</div>
        </div>

        <Card>
          <div style={{ padding:28 }}>
            {error && <div style={{ background:'rgba(255,59,92,.1)', border:'1px solid rgba(255,59,92,.25)',
              borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--red)',
              marginBottom:20 }}>⚠ {error}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Input label="Username" placeholder="admin" value={username}
                onChange={e=>setUsername(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()} />
              <Input label="Password" type="password" placeholder="••••••••"
                value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()} />
              <Btn variant='primary' size='lg' onClick={handleLogin} disabled={loading}
                style={{ width:'100%', justifyContent:'center', marginTop:8 }}>
                {loading ? 'Logging in...' : '→ Login'}
              </Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null)
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getStats(), api.getRetailers()])
      .then(([s, r]) => { setStats(s); setRetailers(r) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="System-wide overview" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <StatCard label="Active Retailers" value={stats?.activeRetailers||0} color="var(--cyan)" top="var(--cyan)" />
        <StatCard label="Total Devices" value={stats?.totalDevices||0} color="var(--purple)" top="var(--purple)" />
        <StatCard label="Locked Devices" value={stats?.lockedDevices||0} color="var(--red)" top="var(--red)" />
        <StatCard label="Total Revenue" value={`₨${((stats?.totalRevenue||0)/1000).toFixed(0)}K`} color="var(--green)" top="var(--green)" />
      </div>

      <Card>
        <CardHeader title="Top Retailers" />
        <table>
          <thead><tr><th>RETAILER</th><th>CITY</th><th>DEVICES</th><th>LIMIT</th><th>STATUS</th></tr></thead>
          <tbody>
            {retailers.slice(0,5).map(r => (
              <tr key={r.id}>
                <td><div style={{fontWeight:600}}>{r.name}</div><div style={{fontSize:11,color:'var(--t2)'}}>{r.email}</div></td>
                <td>{r.city}</td>
                <td><span style={{fontFamily:'var(--fm)',color:'var(--cyan)'}}>{r.devices_registered||0}</span></td>
                <td><span style={{fontFamily:'var(--fm)'}}>{r.license_limit}</span></td>
                <td><Badge type={r.status}>{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ─── RETAILERS PAGE ───────────────────────────────────────
function Retailers() {
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [search, setSearch]       = useState('')
  const [form, setForm]           = useState({ name:'', city:'', owner:'', phone:'', email:'', password:'', licenseLimit:50 })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const load = () => api.getRetailers().then(setRetailers).finally(()=>setLoading(false))
  useEffect(() => { load() }, [])

  const filtered = retailers.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase()) ||
    r.owner?.toLowerCase().includes(search.toLowerCase())
  )

  async function addRetailer() {
    if (!form.name||!form.email||!form.password) return setError('Name, email, password zaroori hai')
    setSaving(true); setError('')
    try {
      await api.addRetailer(form)
      setShowAdd(false)
      setForm({ name:'', city:'', owner:'', phone:'', email:'', password:'', licenseLimit:50 })
      load()
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function toggleStatus(r) {
    await api.updateRetailer(r.id, { status: r.status==='active'?'suspended':'active' })
    load()
  }

  async function addLicenses(r, n) {
    await api.updateRetailer(r.id, { licenseLimit: parseInt(r.license_limit)+n })
    load()
  }

  if (loading) return <Loader />

  return (
    <div>
      <PageHeader title="Retailers" subtitle={`${retailers.length} registered`}
        action={<Btn onClick={()=>setShowAdd(true)}>+ Add Retailer</Btn>} />

      <div style={{ marginBottom:20 }}>
        <input placeholder="🔍  Search retailers..." value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{ maxWidth:300 }} />
      </div>

      <Card>
        <div style={{ overflowX:'auto' }}>
          <table>
            <thead><tr><th>ID</th><th>SHOP</th><th>OWNER</th><th>LICENSES</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {filtered.map(r => {
                const used = parseInt(r.devices_registered)||0
                const limit = parseInt(r.license_limit)||50
                const pct = Math.round(used/limit*100)
                return (
                  <tr key={r.id}>
                    <td><span style={{fontFamily:'var(--fm)',fontSize:11,color:'var(--cyan)'}}>{r.id}</span></td>
                    <td><div style={{fontWeight:600}}>{r.name}</div><div style={{fontSize:11,color:'var(--t2)'}}>{r.city}</div></td>
                    <td><div>{r.owner}</div><div style={{fontSize:11,color:'var(--t2)'}}>{r.phone}</div></td>
                    <td>
                      <div style={{fontFamily:'var(--fm)',fontSize:12,marginBottom:5}}>{used}/{limit}</div>
                      <div style={{height:4,background:'var(--s3)',borderRadius:2,width:80}}>
                        <div style={{height:'100%',borderRadius:2,width:`${pct}%`,
                          background:pct>80?'var(--yellow)':'var(--cyan)'}} />
                      </div>
                    </td>
                    <td><Badge type={r.status==='active'?'active':'suspended'}>{r.status}</Badge></td>
                    <td>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <Btn variant='purple' size='sm' onClick={()=>addLicenses(r,25)}>+25</Btn>
                        <Btn variant='purple' size='sm' onClick={()=>addLicenses(r,100)}>+100</Btn>
                        <Btn variant={r.status==='active'?'danger':'success'} size='sm'
                          onClick={()=>toggleStatus(r)}>
                          {r.status==='active'?'Suspend':'Activate'}
                        </Btn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <Modal title="➕ New Retailer" onClose={()=>setShowAdd(false)}
          footer={<>
            <Btn variant='ghost' onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addRetailer} disabled={saving}>{saving?'Saving...':'Add Retailer'}</Btn>
          </>}>
          {error && <div style={{background:'rgba(255,59,92,.1)',border:'1px solid rgba(255,59,92,.25)',borderRadius:8,padding:'10px 14px',fontSize:13,color:'var(--red)',marginBottom:16}}>⚠ {error}</div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Input label="Shop Name" placeholder="Ali Mobile Store" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <Input label="City" placeholder="Lahore" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} />
            <Input label="Owner Name" placeholder="Muhammad Ali" value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})} />
            <Input label="Phone" placeholder="0300-0000000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
            <Input label="Email" placeholder="shop@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <label style={{fontSize:12,fontWeight:600,color:'var(--t2)'}}>License Limit</label>
              <select value={form.licenseLimit} onChange={e=>setForm({...form,licenseLimit:+e.target.value})}>
                <option value={25}>25 Devices</option>
                <option value={50}>50 Devices</option>
                <option value={100}>100 Devices</option>
                <option value={250}>250 Devices</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── DEVICES PAGE ─────────────────────────────────────────
function Devices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')
  const [acting, setActing]   = useState(null)

  const load = () => api.getDevices().then(setDevices).finally(()=>setLoading(false))
  useEffect(() => { load() }, [])

  async function doLock(d) {
    setActing(d.id)
    try {
      if (d.status==='locked') await api.unlockDevice(d.id)
      else await api.lockDevice(d.id)
      load()
    } finally { setActing(null) }
  }

  const filtered = devices.filter(d => {
    const ms = d.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
               d.imei?.includes(search) ||
               d.brand?.toLowerCase().includes(search.toLowerCase())
    if (filter==='locked') return ms && d.status==='locked'
    if (filter==='active') return ms && d.status==='active'
    return ms
  })

  if (loading) return <Loader />

  return (
    <div>
      <PageHeader title="All Devices" subtitle={`${devices.length} total`} />

      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <input placeholder="🔍  Search..." value={search}
          onChange={e=>setSearch(e.target.value)} style={{maxWidth:260}} />
        <div style={{display:'flex',gap:4,background:'var(--s2)',padding:4,borderRadius:8,border:'1px solid var(--b1)'}}>
          {['all','active','locked'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:'5px 14px',borderRadius:6,border:'none',fontSize:12,fontWeight:600,cursor:'pointer',
              background:filter===f?'var(--cyan)':'transparent',
              color:filter===f?'var(--bg)':'var(--t2)'
            }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>

      <Card>
        <div style={{overflowX:'auto'}}>
          <table>
            <thead><tr><th>IMEI</th><th>DEVICE</th><th>CUSTOMER</th><th>RETAILER</th><th>EMI</th><th>STATUS</th><th>ACTION</th></tr></thead>
            <tbody>
              {filtered.map(d=>(
                <tr key={d.id}>
                  <td><span style={{fontFamily:'var(--fm)',fontSize:11,color:'var(--t2)'}}>{d.imei}</span></td>
                  <td><div style={{fontWeight:600}}>{d.brand}</div><div style={{fontSize:11,color:'var(--t2)'}}>{d.model}</div></td>
                  <td><div>{d.customer_name}</div><div style={{fontSize:11,color:'var(--t2)'}}>{d.customer_phone}</div></td>
                  <td><div style={{fontSize:12}}>{d.retailer_name}</div><div style={{fontSize:11,color:'var(--t2)'}}>{d.retailer_city}</div></td>
                  <td><EmiBar paid={d.emi_paid||0} total={d.emi_total||1} /></td>
                  <td><Badge type={d.status}>{d.status}</Badge></td>
                  <td>
                    <Btn variant={d.status==='locked'?'success':'danger'} size='sm'
                      onClick={()=>doLock(d)} disabled={acting===d.id}>
                      {acting===d.id?'...' : d.status==='locked'?'🔓 Unlock':'🔒 Lock'}
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── LOGS PAGE ────────────────────────────────────────────
function Logs() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.getLogs().then(setLogs).finally(()=>setLoading(false)) }, [])

  if (loading) return <Loader />

  return (
    <div>
      <PageHeader title="Action Logs" subtitle="Lock/unlock history" />
      <Card>
        <div style={{overflowX:'auto'}}>
          <table>
            <thead><tr><th>TIME</th><th>ACTION</th><th>DEVICE</th><th>CUSTOMER</th><th>RETAILER</th><th>REASON</th></tr></thead>
            <tbody>
              {logs.map(l=>(
                <tr key={l.id}>
                  <td><span style={{fontFamily:'var(--fm)',fontSize:11,color:'var(--t2)'}}>{new Date(l.performed_at).toLocaleString('en-PK')}</span></td>
                  <td><Badge type={l.action==='lock'?'locked':'active'}>{l.action==='lock'?'🔒 Lock':'🔓 Unlock'}</Badge></td>
                  <td><div style={{fontSize:12}}>{l.brand} {l.model}</div><div style={{fontFamily:'var(--fm)',fontSize:10,color:'var(--t3)'}}>{l.imei}</div></td>
                  <td>{l.customer_name}</td>
                  <td>{l.retailer_name}</td>
                  <td style={{color:'var(--t2)',fontSize:12}}>{l.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── SETTINGS PAGE ────────────────────────────────────────
function Settings({ user, onLogout }) {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('api_url_override')||'')
  const [saved, setSaved]   = useState(false)

  function saveUrl() {
    localStorage.setItem('api_url_override', apiUrl)
    setSaved(true)
    setTimeout(()=>setSaved(false), 2000)
    window.location.reload()
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configuration" />
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <Card>
          <CardHeader title="Backend URL" />
          <div style={{padding:20}}>
            <div style={{fontSize:13,color:'var(--t2)',marginBottom:12,lineHeight:1.6}}>
              Jab bhi tunnel restart ho aur nayi URL mile — yahan update karo. Page reload hoga.
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <Input label="Current API URL" placeholder="https://xxxx.lhr.life"
                value={apiUrl} onChange={e=>setApiUrl(e.target.value)} />
              <Btn onClick={saveUrl} style={{width:'fit-content'}}>
                {saved?'✅ Saved!':'Save & Reload'}
              </Btn>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Admin Info" />
          <div style={{padding:20}}>
            {[
              ['Username', user?.username],
              ['Role', 'Super Admin'],
              ['Version', 'v1.0.0'],
            ].map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',
                padding:'10px 0',borderBottom:'1px solid var(--b1)',fontSize:13}}>
                <span style={{color:'var(--t2)'}}>{k}</span>
                <span style={{fontFamily:'var(--fm)',color:'var(--cyan)'}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:20}}>
              <Btn variant='danger' onClick={onLogout}>Logout</Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── LAYOUT ───────────────────────────────────────────────
function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
      <div>
        <div style={{ fontFamily:'var(--fd)', fontSize:26, fontWeight:800, letterSpacing:-.5 }}>{title}</div>
        {subtitle && <div style={{ fontSize:13, color:'var(--t2)', marginTop:4 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

function Loader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:300, color:'var(--t3)', fontSize:14 }}>
      Loading...
    </div>
  )
}

const NAV = [
  { id:'dashboard', icon:'◈', label:'Dashboard' },
  { id:'retailers', icon:'🏪', label:'Retailers' },
  { id:'devices',   icon:'📱', label:'Devices' },
  { id:'logs',      icon:'📋', label:'Logs' },
  { id:'settings',  icon:'⚙️', label:'Settings' },
]

function Layout({ user, onLogout }) {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard />,
    retailers: <Retailers />,
    devices:   <Devices />,
    logs:      <Logs />,
    settings:  <Settings user={user} onLogout={onLogout} />,
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Sidebar */}
      <div style={{ width:210, background:'var(--s1)', borderRight:'1px solid var(--b1)',
        display:'flex', flexDirection:'column', padding:'16px 10px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', marginBottom:20 }}>
          <div style={{ width:32, height:32, borderRadius:8,
            background:'linear-gradient(135deg,var(--cyan),var(--purple))',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🔒</div>
          <div style={{ fontFamily:'var(--fd)', fontWeight:800, fontSize:16 }}>
            Phone<span style={{color:'var(--cyan)'}}>Lock</span>
          </div>
        </div>

        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',
          color:'var(--t3)',padding:'6px 10px',marginBottom:4}}>MENU</div>

        {NAV.map(item=>(
          <button key={item.id} onClick={()=>setPage(item.id)} style={{
            display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
            borderRadius:8, fontSize:13, fontWeight:500,
            color: page===item.id?'var(--cyan)':'var(--t2)',
            background: page===item.id?'rgba(0,229,255,.08)':'transparent',
            border: page===item.id?'1px solid rgba(0,229,255,.15)':'1px solid transparent',
            cursor:'pointer', width:'100%', textAlign:'left', marginBottom:2,
            transition:'all .15s'
          }}><span>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}

        <div style={{marginTop:'auto',padding:'12px 10px',borderTop:'1px solid var(--b1)'}}>
          <div style={{fontSize:11,color:'var(--t3)',fontFamily:'var(--fm)'}}>
            {user?.username}
          </div>
          <div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>Super Admin</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:28, background:'var(--bg)' }}>
        {pages[page]}
      </div>
    </div>
  )
}

// ─── ROOT APP ─────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')) } catch { return null }
  })

  function handleLogout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setUser(null)
  }

  return (
    <>
      <style>{G}</style>
      {user
        ? <Layout user={user} onLogout={handleLogout} />
        : <Login onLogin={setUser} />
      }
    </>
  )
}
