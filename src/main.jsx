import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  LayoutDashboard, Film, Repeat2, Smartphone, FilePenLine, Radio,
  Plus, Trash2, Play, Square, Upload, Download, History, Settings,
  LogIn, LogOut, Menu, X, CheckCircle2, AlertCircle, Loader2, FolderOpen
} from 'lucide-react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { supabase } from './supabase'
import './style.css'

const tools = [
  { id:'dashboard', label:'Dashboard', icon:LayoutDashboard },
  { id:'joiner', label:'Video Joiner', icon:Film },
  { id:'looper', label:'Video Looper', icon:Repeat2 },
  { id:'reels', label:'VEO → Reels 9:16', icon:Smartphone },
  { id:'metadata', label:'Metadata Editor', icon:FilePenLine },
  { id:'live', label:'Live Streaming', icon:Radio },
]

function App(){
  const [page,setPage] = useState('dashboard')
  const [user,setUser] = useState(null)
  const [authOpen,setAuthOpen] = useState(false)
  const [mobile,setMobile] = useState(false)
  const [jobs,setJobs] = useState([])

  useEffect(()=>{
    if(!supabase) return
    supabase.auth.getSession().then(({data})=>setUser(data.session?.user ?? null))
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_e,session)=>setUser(session?.user ?? null))
    return ()=>subscription.unsubscribe()
  },[])

  async function loadJobs(){
    if(!supabase || !user) return
    const {data} = await supabase.from('jobs').select('*').order('created_at',{ascending:false}).limit(50)
    setJobs(data || [])
  }
  useEffect(()=>{ loadJobs() },[user])

  async function signOut(){
    await supabase?.auth.signOut()
  }

  const content = {
    dashboard:<Dashboard user={user} jobs={jobs} onOpen={setPage}/>,
    joiner:<Joiner user={user} onJob={loadJobs}/>,
    looper:<Looper user={user} onJob={loadJobs}/>,
    reels:<Reels user={user} onJob={loadJobs}/>,
    metadata:<Metadata user={user} onJob={loadJobs}/>,
    live:<Live user={user}/>,
  }[page]

  return <div className="app">
    <aside className={`sidebar ${mobile?'open':''}`}>
      <div className="brand"><span>MUNIF</span><b>APPS</b></div>
      <div className="brand-sub">Creator Toolkit • Web</div>
      <nav>
        {tools.map(t=>{
          const I=t.icon
          return <button key={t.id} className={page===t.id?'active':''} onClick={()=>{setPage(t.id);setMobile(false)}}>
            <I size={18}/><span>{t.label}</span>
          </button>
        })}
      </nav>
      <div className="side-bottom">
        <div className="engine">● FFmpeg WebAssembly</div>
        {user ? <button className="logout" onClick={signOut}><LogOut size={16}/> Keluar</button>
             : <button className="login-side" onClick={()=>setAuthOpen(true)}><LogIn size={16}/> Login</button>}
        <small>MunifApps v1.0 • 2026</small>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button>
        <div><strong>{tools.find(x=>x.id===page)?.label}</strong><span> / MunifApps</span></div>
        <div className="top-actions">
          {user ? <span className="user-pill">{user.email}</span> : <button onClick={()=>setAuthOpen(true)}><LogIn size={16}/> Login</button>}
        </div>
      </header>
      <section className="content">{content}</section>
    </main>
    {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onDone={()=>setAuthOpen(false)}/>}
  </div>
}

function Dashboard({user,jobs,onOpen}){
  const cards=[
    ['joiner','🎬','Video Joiner','Gabungkan banyak video menjadi satu file.'],
    ['looper','⟳','Video Looper','Ulangi satu video atau playlist.'],
    ['reels','📱','VEO → Reels 9:16','Format vertikal untuk Reels, TikTok & Shorts.'],
    ['metadata','✎','Metadata Editor','Judul, genre, tags dan deskripsi.'],
    ['live','🔴','Live Streaming','Siapkan playlist untuk RTMP streaming.'],
  ]
  return <div className="dashboard">
    <div className="hero">
      <div>
        <div className="eyebrow">🚀 MUNIFAPPS WEB</div>
        <h1>Semua tools kreator<br/><em>dalam satu aplikasi.</em></h1>
        <p>Proses video langsung dari browser dengan FFmpeg WebAssembly, simpan riwayat di Supabase, dan deploy frontend ke Netlify.</p>
        {!user && <div className="notice">Login Supabase opsional untuk menyimpan riwayat proses.</div>}
      </div>
      <div className="hero-orb">M</div>
    </div>
    <h2>Creator Tools</h2>
    <div className="tool-grid">
      {cards.map(([id,icon,title,desc])=><button className="tool-card" key={id} onClick={()=>onOpen(id)}>
        <span className="big-icon">{icon}</span><strong>{title}</strong><p>{desc}</p><span className="open">Buka Tool →</span>
      </button>)}
    </div>
    <div className="section-row"><h2>Riwayat Terbaru</h2><span>{user?'Supabase':'Login untuk menyimpan'}</span></div>
    <div className="history">
      {!user ? <Empty text="Belum login — hasil proses tetap bisa di-download, tetapi riwayat tidak disimpan."/> :
       jobs.length===0 ? <Empty text="Belum ada proses."/> :
       jobs.slice(0,8).map(j=><div className="history-row" key={j.id}><CheckCircle2 size={17}/><div><b>{j.tool}</b><small>{j.file_name || j.output_name}</small></div><time>{new Date(j.created_at).toLocaleString('id-ID')}</time></div>)}
    </div>
  </div>
}

function Empty({text}){ return <div className="empty"><History size={22}/>{text}</div> }

function FilePicker({files,setFiles,multiple=true}){
  const input=useRef()
  function choose(e){setFiles(Array.from(e.target.files||[]))}
  return <div className="filebox">
    <input ref={input} type="file" accept="video/*" multiple={multiple} onChange={choose}/>
    <div className="drop" onClick={()=>input.current?.click()}>
      <Upload size={25}/><strong>Pilih video</strong><span>MP4, MOV, MKV, WebM • Klik untuk memilih</span>
    </div>
    {files.length>0 && <div className="file-list">{files.map((f,i)=><div key={i}><FolderOpen size={15}/><span>{f.name}</span><small>{(f.size/1024/1024).toFixed(1)} MB</small><button onClick={()=>setFiles(files.filter((_,x)=>x!==i))}><Trash2 size={15}/></button></div>)}</div>}
  </div>
}

function ToolShell({title,desc,children,status,progress}){
 return <div className="tool-page"><div className="page-head"><div><div className="eyebrow">MUNIFAPPS TOOL</div><h1>{title}</h1><p>{desc}</p></div></div>{children}
 {status && <div className="status"><span>{status}</span>{progress!==undefined && <div className="progress"><i style={{width:`${progress}%`}}/></div>}</div>}</div>
}

function useFFmpeg(){
 const ref=useRef(null), [ready,setReady]=useState(false), [loading,setLoading]=useState(false)
 async function load(){
  if(ref.current) return ref.current
  setLoading(true)
  const ff=new FFmpeg()
  ff.on('log',({message})=>console.debug('[FFmpeg]',message))
  const base='https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
  await ff.load({coreURL:await toBlobURL(`${base}/ffmpeg-core.js`,'text/javascript'),wasmURL:await toBlobURL(`${base}/ffmpeg-core.wasm`,'application/wasm')})
  ref.current=ff; setReady(true); setLoading(false); return ff
 }
 return {load,ready,loading}
}

async function saveJob(user,tool,file,output,metadata={}){
 if(!supabase || !user) return
 await supabase.from('jobs').insert({user_id:user.id,tool,file_name:file,output_name:output,status:'completed',metadata})
}

function DownloadButton({blob,name}){
 if(!blob) return null
 const url=URL.createObjectURL(blob)
 return <a className="download" href={url} download={name}><Download size={17}/> Download {name}</a>
}

function Joiner({user,onJob}){
 const [files,setFiles]=useState([]), [status,setStatus]=useState('Siap.'), [blob,setBlob]=useState(null), {load,loading}=useFFmpeg()
 async function run(){
  if(files.length<2)return setStatus('Tambahkan minimal 2 video.')
  setStatus('Memuat FFmpeg…'); const ff=await load(); setStatus('Memproses video…')
  try{
   const list=files.map((_,i)=>`input${i}.mp4`).join('\n')
   await ff.writeFile('list.txt',new TextEncoder().encode(files.map((_,i)=>`file 'input${i}.mp4'`).join('\n')))
   for(let i=0;i<files.length;i++) await ff.writeFile(`input${i}.mp4`,await fetchFile(files[i]))
   let code=await ff.exec(['-f','concat','-safe','0','-i','list.txt','-c','copy','out.mp4'])
   if(code!==0){code=await ff.exec(['-f','concat','-safe','0','-i','list.txt','-c:v','libx264','-preset','veryfast','-crf','20','-c:a','aac','out.mp4'])}
   const data=await ff.readFile('out.mp4'); const b=new Blob([data.buffer],{type:'video/mp4'}); setBlob(b); setStatus('Selesai.')
   await saveJob(user,'Video Joiner',`${files.length} video`,'MunifApps_Joined.mp4',{count:files.length}); onJob()
  }catch(e){setStatus('Gagal: '+e.message)}
 }
 return <ToolShell title="Video Joiner" desc="Satukan beberapa video menjadi satu file." status={status}>
  <div className="card"><h3>1. Pilih Video</h3><FilePicker files={files} setFiles={setFiles}/></div>
  <div className="action-row"><button className="primary" onClick={run} disabled={loading}><Film size={17}/> {loading?'Memuat FFmpeg…':'Gabung Video'}</button><DownloadButton blob={blob} name="MunifApps_Joined.mp4"/></div>
 </ToolShell>
}

function Looper({user,onJob}){
 const [files,setFiles]=useState([]),[loops,setLoops]=useState(2),[status,setStatus]=useState('Siap.'),[blob,setBlob]=useState(null),{load,loading}=useFFmpeg()
 async function run(){
  if(!files.length)return setStatus('Pilih video.')
  const ff=await load(); setStatus('Memproses loop…')
  try{
   const names=[]; for(let i=0;i<files.length;i++){const n=`v${i}.mp4`;names.push(n);await ff.writeFile(n,await fetchFile(files[i]))}
   const lines=[]; for(let x=0;x<loops;x++) names.forEach(n=>lines.push(`file '${n}'`))
   await ff.writeFile('list.txt',new TextEncoder().encode(lines.join('\n')))
   let code=await ff.exec(['-f','concat','-safe','0','-i','list.txt','-c','copy','loop.mp4'])
   if(code!==0) code=await ff.exec(['-f','concat','-safe','0','-i','list.txt','-c:v','libx264','-preset','veryfast','-crf','20','-c:a','aac','loop.mp4'])
   const d=await ff.readFile('loop.mp4');setBlob(new Blob([d.buffer],{type:'video/mp4'}));setStatus('Loop selesai.')
   await saveJob(user,'Video Looper',`${files.length} video`, `MunifApps_Looped_${loops}x.mp4`,{loops});onJob()
  }catch(e){setStatus('Gagal: '+e.message)}
 }
 return <ToolShell title="Video Looper" desc="Ulangi video atau playlist secara otomatis." status={status}>
  <div className="card"><h3>1. Pilih Video</h3><FilePicker files={files} setFiles={setFiles}/></div>
  <div className="card settings"><label>Jumlah Loop <input type="number" min="1" max="9999" value={loops} onChange={e=>setLoops(+e.target.value)}/></label></div>
  <div className="action-row"><button className="primary" onClick={run}><Repeat2 size={17}/> Loop Video</button><DownloadButton blob={blob} name={`MunifApps_Looped_${loops}x.mp4`}/></div>
 </ToolShell>
}

function Reels({user,onJob}){
 const [files,setFiles]=useState([]),[mode,setMode]=useState('blur'),[res,setRes]=useState('1080x1920'),[top,setTop]=useState(''),[bottom,setBottom]=useState(''),[wm,setWm]=useState(''),[status,setStatus]=useState('Siap.'),[blob,setBlob]=useState(null),{load}=useFFmpeg()
 async function run(){
  if(!files.length)return setStatus('Pilih video.')
  const ff=await load(); setStatus('Mengonversi…')
  try{
   const f=files[0]; await ff.writeFile('input.mp4',await fetchFile(f))
   const [w,h]=res.split('x')
   let vf=mode==='blur'
    ? `split=2[a][b];[a]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},boxblur=20:10[bg];[b]scale=${w}:${h}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`
    : `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`
   const esc=s=>s.replaceAll(':','\\\\:').replaceAll(\"'\",\"\\\\'\")
   if(top)vf+=`,drawtext=text='${esc(top)}':fontcolor=white:fontsize=54:x=(w-text_w)/2:y=80:box=1:boxcolor=black@0.45:boxborderw=16`
   if(bottom)vf+=`,drawtext=text='${esc(bottom)}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-150:box=1:boxcolor=black@0.45:boxborderw=14`
   if(wm)vf+=`,drawtext=text='${esc(wm)}':fontcolor=white@0.55:fontsize=28:x=w-text_w-25:y=25`
   await ff.exec(['-i','input.mp4','-vf',vf,'-r','30','-c:v','libx264','-preset','veryfast','-crf','20','-c:a','aac','out.mp4'])
   const d=await ff.readFile('out.mp4');setBlob(new Blob([d.buffer],{type:'video/mp4'}));setStatus('Video Reels selesai.')
   await saveJob(user,'VEO → Reels 9:16',f.name,`${f.name.replace(/\.[^.]+$/,'')}_Reels_9x16.mp4`,{mode,res});onJob()
  }catch(e){setStatus('Gagal: '+e.message)}
 }
 return <ToolShell title="VEO → Reels 9:16" desc="Ubah video ke format vertikal siap upload." status={status}>
  <div className="card"><h3>1. Pilih Video</h3><FilePicker files={files} setFiles={setFiles} multiple={false}/></div>
  <div className="card settings"><h3>2. Metode</h3><div className="seg"><button className={mode==='blur'?'sel':''} onClick={()=>setMode('blur')}>Background Blur</button><button className={mode==='crop'?'sel':''} onClick={()=>setMode('crop')}>Crop (Potong)</button></div><div className="form-grid"><label>Resolusi<select value={res} onChange={e=>setRes(e.target.value)}><option>1080x1920</option><option>720x1280</option></select></label></div></div>
  <div className="card"><h3>3. Teks & Watermark</h3><input placeholder="Teks atas" value={top} onChange={e=>setTop(e.target.value)}/><input placeholder="Teks bawah" value={bottom} onChange={e=>setBottom(e.target.value)}/><input placeholder="Watermark" value={wm} onChange={e=>setWm(e.target.value)}/></div>
  <div className="action-row"><button className="primary" onClick={run}><Smartphone size={17}/> Buat Video</button><DownloadButton blob={blob} name="MunifApps_Reels_9x16.mp4"/></div>
 </ToolShell>
}

function Metadata({user,onJob}){
 const [files,setFiles]=useState([]),[title,setTitle]=useState(''),[genre,setGenre]=useState(''),[tags,setTags]=useState(''),[desc,setDesc]=useState(''),[status,setStatus]=useState('Siap.'),[blob,setBlob]=useState(null),{load}=useFFmpeg()
 async function run(){
  if(!files.length)return setStatus('Pilih video.')
  const ff=await load();setStatus('Menulis metadata…')
  try{
   await ff.writeFile('input.mp4',await fetchFile(files[0]))
   const args=['-i','input.mp4','-map','0','-c','copy']
   if(title)args.push('-metadata',`title=${title}`)
   if(genre)args.push('-metadata',`genre=${genre}`)
   if(tags)args.push('-metadata',`comment=${tags}`)
   if(desc)args.push('-metadata',`description=${desc}`)
   args.push('metadata.mp4')
   await ff.exec(args)
   const d=await ff.readFile('metadata.mp4');setBlob(new Blob([d.buffer],{type:'video/mp4'}));setStatus('Metadata berhasil ditulis.')
   await saveJob(user,'Metadata Editor',files[0].name,'MunifApps_Metadata.mp4',{title,genre,tags});onJob()
  }catch(e){setStatus('Gagal: '+e.message)}
 }
 return <ToolShell title="Video Metadata Editor" desc="Tambahkan atau ubah metadata video." status={status}>
  <div className="card"><h3>1. Pilih Video</h3><FilePicker files={files} setFiles={setFiles} multiple={false}/></div>
  <div className="card form-grid"><h3>2. Add Metadata</h3><input placeholder="Judul Video" value={title} onChange={e=>setTitle(e.target.value)}/><input placeholder="Genre Video" value={genre} onChange={e=>setGenre(e.target.value)}/><input placeholder="Tags (pisahkan dengan koma)" value={tags} onChange={e=>setTags(e.target.value)}/><textarea placeholder="Deskripsi" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
  <div className="action-row"><button className="primary" onClick={run}><FilePenLine size={17}/> Simpan Metadata</button><DownloadButton blob={blob} name="MunifApps_Metadata.mp4"/></div>
 </ToolShell>
}

function Live(){
 return <ToolShell title="Live Streaming" desc="Antarmuka playlist streaming untuk endpoint RTMP.">
  <div className="warning"><AlertCircle size={20}/><div><b>Penting untuk versi Web</b><p>Browser/Netlify tidak dapat menjalankan FFmpeg desktop terus-menerus untuk RTMP seperti aplikasi Windows. Halaman ini menyiapkan konfigurasi, tetapi engine RTMP production harus dijalankan pada server/worker terpisah.</p></div></div>
  <div className="card form-grid"><h3>Platform</h3><select><option>YouTube</option><option>Facebook</option><option>Custom RTMP</option></select><input placeholder="RTMP URL"/><input placeholder="Stream Key" type="password"/><select><option>720p</option><option>1080p</option><option>480p</option></select><input placeholder="Bitrate kbps" type="number" defaultValue="3000"/></div>
  <div className="card"><h3>Arsitektur Production</h3><div className="architecture"><span>Browser</span><b>→</b><span>Supabase Auth/DB</span><b>→</b><span>RTMP Worker</span><b>→</b><span>YouTube / Facebook</span></div></div>
 </ToolShell>
}

function AuthModal({onClose,onDone}){
 const [mode,setMode]=useState('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
 async function submit(){
  if(!supabase)return setMsg('Supabase belum dikonfigurasi.')
  setBusy(true);setMsg('')
  const result=mode==='login'
   ? await supabase.auth.signInWithPassword({email,password})
   : await supabase.auth.signUp({email,password})
  setBusy(false)
  if(result.error)setMsg(result.error.message);else {setMsg(mode==='login'?'Login berhasil.':'Akun dibuat. Cek email jika verifikasi diminta.');setTimeout(onDone,700)}
 }
 return <div className="modal-bg"><div className="modal"><button className="close" onClick={onClose}><X/></button><div className="eyebrow">MUNIFAPPS ACCOUNT</div><h2>{mode==='login'?'Login':'Daftar'}</h2><p>Gunakan Supabase Auth untuk menyimpan riwayat.</p><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>{msg&&<div className="notice">{msg}</div>}<button className="primary full" onClick={submit} disabled={busy}>{busy?<Loader2 className="spin"/>:mode==='login'?'Login':'Buat Akun'}</button><button className="linkbtn" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Belum punya akun? Daftar':'Sudah punya akun? Login'}</button></div></div>
}

createRoot(document.getElementById('root')).render(<App/>)
