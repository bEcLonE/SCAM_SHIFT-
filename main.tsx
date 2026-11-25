import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { shiftDate, cases, practice as practiceCase } from './cases'
import type { Tool, Verdict } from './cases'
import { Simulator, tools } from './simulators'
import { AfterAction, Notebook, verdicts } from './investigation'
import { evaluate, unassessed } from './scoring'
import type { Finding, Submission } from './scoring'
import './style.css'

type Save = {
  index:number; found:string[]; findings:Finding[]; answers:number[];
  reports:(Submission|null)[]; active:number; verdict:Verdict | ''
}
type LegacyFinding = {status:Finding['status']; source:string}
type LegacyReport = {findings:LegacyFinding[];verdict:Verdict}
type LegacySave = {index:number;found:string[];answers:number[];findings:LegacyFinding[];reports:LegacyReport[]}
type Screen = 'menu' | 'intro' | 'desk' | 'report' | 'summary'
const key = 'scam-shift.v2'
const practiceIndex = cases.length
const scenarios = [...cases,practiceCase]
const code = (index:number) => index === practiceIndex ? 'LUYỆN TẬP' : 'CASE-' + String(index + 1).padStart(3,'0')
function fresh(index = 0,reports:Save['reports'] = []):Save {
  const blank = () => scenarios[index].claims.map(unassessed)
  return {index,found:[],findings:blank(),answers:[],reports,active:0,verdict:''}
}
function load():Save|null {
  try {
    const current = JSON.parse(localStorage.getItem(key) || 'null') as (Save & {drafts?:Finding[]})|null
    if (current && cases[current.index] && Array.isArray(current.reports) && Array.isArray(current.findings)) {
      const {drafts,...saved} = current
      return {...saved,findings:drafts?.length === saved.findings.length ? drafts : saved.findings}
    }
    const old = JSON.parse(localStorage.getItem('scam-shift.v1') || 'null') as LegacySave|null
    if (!old || !cases[old.index] || !Array.isArray(old.findings) || !Array.isArray(old.reports)) return null
    const convert = (entries:LegacyFinding[]):Finding[] => entries.map(({status,source}) => ({status,sources:source ? [source] : [],reason:''}))
    const findings = convert(old.findings)
    const reports = old.reports.map((entry,i):Submission => ({
      findings:convert(entry.findings),verdict:entry.verdict,advice:-1,legacy:true,
      found:i === old.index ? old.found : [...new Set(entry.findings.map(item => item.source).filter(Boolean))]
    }))
    return {...fresh(old.index,reports),found:old.found,answers:old.answers,findings}
  } catch { return null }
}
const initial = ['Tin nhắn và phiếu thu trên điện thoại','Email nhận lúc 08:57','Thông báo trong ứng dụng giao hàng','Lịch sử liên lạc và bản nháp giao dịch','Email về đơn MN-092','Tin nhắn về giờ mở cửa']
const hints = ['Đọc hồ sơ tiếp nhận để biết Trịnh An cần hỗ trợ việc gì.','Mở Điện thoại rồi đọc tin nhắn về lịch mở cửa.','Mở Danh bạ, tìm Quầy Bạn đọc và liên hệ xác minh.','Mở lại thông tin vừa thu thập trong danh mục tài liệu.','Mở sổ tay kiểm chứng để ghi nhận kết quả.','Chọn nhận định cho lời khai.','Chọn tài liệu làm căn cứ.','Chọn quyết định rồi nộp báo cáo.']

function App() {
  const [screen,setScreen] = useState<Screen>('menu')
  const [save,setSave] = useState(load)
  const [practice,setPractice] = useState<Save|null>(null)
  const [lesson,setLesson] = useState(0)
  const [tool,setTool] = useState<Tool|null>(null)
  const [overlay,setOverlay] = useState<'rules'|'pause'|'restart'|'submit'|null>(null)
  const [storageFailed,setStorageFailed] = useState(false)
  const [instance,setInstance] = useState(0)
  const toolScroll = useRef<HTMLDivElement>(null)
  const toolPositions = useRef<Partial<Record<Tool,number>>>({})
  const session = practice ?? save
  const index = session?.index ?? 0
  const game = scenarios[index]
  const report = session?.reports[index]
  const total = save?.reports.reduce((sum,entry,i) => sum + (entry ? evaluate(cases[i],i,entry).total : 0),0) ?? 0
  const done = save?.reports.filter(Boolean).length ?? 0

  useLayoutEffect(() => {
    if (toolScroll.current) toolScroll.current.scrollTop = tool ? toolPositions.current[tool] ?? 0 : 0
  },[screen,tool,instance])

  useEffect(() => {
    if (!save) return
    try { localStorage.setItem(key,JSON.stringify(save)) } catch { setStorageFailed(true) }
  },[save])
  useEffect(() => {
    if (!overlay) return
    const onKey = (event:KeyboardEvent) => { if (event.key === 'Escape') setOverlay(null) }
    window.addEventListener('keydown',onKey)
    return () => window.removeEventListener('keydown',onKey)
  },[overlay])

  function start() { setPractice(null);setOverlay(null);setScreen('intro') }
  function menu() { setPractice(null);setOverlay(null);setScreen('menu') }
  function desk(next:Save,isPractice = false) {
    if (isPractice) setPractice(next)
    else { setPractice(null);setSave(next) }
    toolPositions.current = {}
    setTool(null);setInstance(value => value + 1);setScreen('desk')
  }
  function switchTool(next:Tool) {
    if (tool && toolScroll.current) toolPositions.current[tool] = toolScroll.current.scrollTop
    setTool(next)
  }
  function beginPractice() { setLesson(0);desk(fresh(practiceIndex),true) }
  function advance(from:number) { setLesson(value => value === from ? from + 1 : value) }
  function update(change:(value:Save)=>Save) {
    const setter = practice ? setPractice : setSave
    setter(value => value ? change(value) : value)
  }
  function collect(id:string) {
    if (!game.evidence[id]) return
    update(value => value.found.includes(id) ? value : {...value,found:[...value.found,id]})
    if (practice && id === 'message') advance(1)
    if (practice && id === 'directory') advance(2)
  }
  function edit(finding:Finding) {
    update(value => ({...value,findings:value.findings.map((entry,i) => i === value.active ? finding : entry)}))
    if (practice && finding.status !== 'UNASSESSED') setLesson(step => {
      if (step === 5) return finding.sources.length ? 7 : 6
      return step === 6 && finding.sources.length ? 7 : step
    })
  }
  const incomplete = !!session?.findings.some(entry => entry.status === 'UNASSESSED' || !entry.sources.length)
  function submit() {
    if (!session?.verdict) return
    const submission:Submission = {findings:session.findings,verdict:session.verdict,found:session.found}
    const reports = [...session.reports]
    while (reports.length <= index) reports.push(null)
    reports[index] = submission
    update(value => ({...value,reports}))
    setOverlay(null);setScreen('report')
  }
  function next() {
    if (practice) { start();return }
    if (!save) return
    if (index === cases.length - 1) setScreen('summary')
    else desk(fresh(index+1,save.reports))
  }

  return <div className={screen === 'desk' ? 'shell desk-shell' : 'shell'}>
    <header className="top"><div className="wordmark"><span className="mark">S</span>CAM <b>SHIFT</b></div>
      {screen === 'desk' ? <div className="top-actions"><button onClick={() => setOverlay('rules')}>Sổ tay</button><button onClick={() => setOverlay('pause')}>Tạm dừng</button></div>
      : <span className="top-caption">TRUNG TÂM HỖ TRỢ AN TOÀN SỐ</span>}
    </header>
    {storageFailed && <div className="storage" role="status">Trình duyệt không lưu được tiến trình. Hãy giữ trang mở để tiếp tục.</div>}
    {screen === 'menu' && <main className="menu">
      <div className="menu-art" aria-hidden="true"><div className="wall-sign">TRUNG TÂM<br/>AN TOÀN SỐ</div><div className="monitor one"><i/><i/><i/></div><div className="monitor two"><i/><i/><i/></div><div className="desk-art"/><div className="lamp"/></div>
      <section className="menu-copy"><div className="eyebrow">CHAPTER 01 / FIRST SHIFT</div><h1>SCAM <em>SHIFT</em></h1>
        <h2>Mỗi quyết định đều có hệ quả.</h2>
        <p>Bạn là nhân viên trực tại Trung tâm hỗ trợ an toàn số. Mỗi ngày, những người dân tìm đến bạn với các tin nhắn, cuộc gọi, email và yêu cầu đáng ngờ.</p>
        <p>Nhiệm vụ của bạn là kiểm tra thông tin, xác minh lời khai và đưa ra quyết định trước khi họ thực hiện những hành động có thể gây nguy hiểm.</p>
        <p>Không phải mọi điều đáng ngờ đều là lừa đảo. Không phải mọi thông tin chính xác đều đáng tin cậy.</p>
        <p>Hãy điều tra cẩn thận. Mỗi quyết định đều có hệ quả.</p>
        <div className="toolbar"><button className="primary" onClick={() => save ? setOverlay('restart') : start()}>Bắt đầu</button>
          {save && <button onClick={() => { setTool(null); setPractice(null); setScreen(save.reports[save.index] ? 'report' : 'desk') }}>Tiếp tục</button>}
          <button onClick={() => beginPractice()}>Hướng dẫn</button></div>
      </section><footer>BẢN CHƠI THỬ · V0.2.3</footer>
    </main>}

    {screen === 'intro' && <main className="interstitial"><div className="eyebrow">CHAPTER 01</div><h1>FIRST <em>SHIFT</em></h1><h2>Ca trực đầu tiên</h2>
      <blockquote><strong>Quản lý trung tâm</strong><p>Chào mừng đến bàn tiếp nhận. Hôm nay bạn sẽ xử lý năm vụ việc. Đối chiếu nguồn thông tin, ghi lại nhận định trong sổ tay và đề xuất bước an toàn cho người dân.</p></blockquote>
      <div className="toolbar"><button onClick={menu}>Menu chính</button><button className="primary" onClick={() => desk(fresh())}>Tiếp nhận CASE-001</button></div></main>}
    {screen === 'desk' && session && <main className="work">
      {practice ? <div className="lesson-bar" role="status"><span><strong>Luyện tập · {lesson+1}/9</strong> {hints[lesson]}</span><button onClick={menu}>Bỏ qua hướng dẫn</button></div>
        : <div className="shift-bar"><span>CA TRỰC <b>01</b></span><span>HÔM NAY <b>{shiftDate}</b></span><span>HỒ SƠ <b>{code(index)}</b></span><span>ĐÃ XỬ LÝ <b>{done}/{cases.length}</b></span><span>ĐIỂM <b>{total}/500</b></span><progress aria-label="Tiến độ ca trực" max={cases.length} value={done}/></div>}
      <div className="workspace">
        <section className="panel reception paper"><div className="panel-heading">PHIẾU TIẾP NHẬN</div><div className="panel-body">
          <div className="case-meta eyebrow"><span>{code(index)}</span><time dateTime={shiftDate.split('/').reverse().join('-') + 'T' + game.time}>{shiftDate} · {game.time}</time><span>LEVEL {game.level}</span></div><h2>{game.title}</h2><p>{game.topic}</p>
          {practice && lesson === 0 ? <button className="primary" onClick={() => advance(0)}>Mở hồ sơ tiếp nhận</button> : <>
            <div className="person"><span className={'portrait portrait-' + index} aria-hidden="true"><i/><b/></span><div><strong>{game.name}</strong><p>{game.age} tuổi · {game.job}</p></div></div>
            <h3>Lời trình báo</h3><p className="quote">{game.report}</p><h3>Yêu cầu hỗ trợ</h3><p>{game.request}</p>
            <h3>Tài liệu bàn giao</h3><p>{initial[index]}</p><h3>Ghi chú phỏng vấn</h3>
            {game.questions.map(([question,answer],i) => <div className="question" key={question}>
              <button onClick={() => update(value => value.answers.includes(i) ? value : {...value,answers:[...value.answers,i]})}>{question}</button>
              {session.answers.includes(i) && <p>{answer}</p>}</div>)}
          </>}
        </div></section>
        <section className="panel investigation"><div className="panel-heading">BÀN ĐIỀU TRA <span>{session.found.length} tài liệu</span></div>
          <div className="tool-bar">{game.tools.map(id => <button key={id} aria-pressed={id === tool} className={id === tool ? 'selected' : ''} onClick={() => switchTool(id)}>
            <span aria-hidden="true">{tools[id][0]}</span> {tools[id][1]}</button>)}</div>
          <div className="panel-scroll investigation-body" ref={toolScroll} key={instance}>
          <div className="tool-area">{!tool && <div className="idle"><span aria-hidden="true">◎</span><h2>Ứng dụng điều tra</h2><p>Chọn một công cụ để mở hồ sơ liên quan.</p></div>}
            {game.tools.map(id => <div hidden={id !== tool} key={id}><Simulator game={game} tool={id} collect={collect}/></div>)}</div>
          {session.found.length > 0 && <details className="evidence" open={practice && lesson === 3 ? true : undefined}>
            <summary>Tài liệu đã thu thập ({session.found.length})</summary>
            {session.found.map(id => game.evidence[id] && <details key={id} onToggle={event => {
              if (practice && id === 'directory' && event.currentTarget.open) advance(3)
            }}><summary>{game.evidence[id].title}</summary><p>{game.evidence[id].text}</p></details>)}
          </details>}</div>
        </section>
        <section className="panel claims"><div className="panel-heading">SỔ TAY KIỂM CHỨNG</div><div className="panel-body">
          {practice && lesson < 5 ? <button disabled={lesson < 4} className="primary" onClick={() => advance(4)}>Mở sổ tay kiểm chứng</button> :
            <Notebook key={instance} game={game} found={session.found} findings={session.findings} active={session.active}
              onSelect={active => update(value => ({...value,active}))} onEdit={edit}
              tutorialStep={practice ? lesson : undefined}/>}
        </div>
          {(!practice || lesson >= 7) && <div className="handoff">
            <label>Quyết định cuối cùng<select aria-label="Quyết định cuối cùng" value={session.verdict} onChange={event => update(value => ({...value,verdict:event.target.value as Verdict|''}))}>
              <option value="">Chọn cách xử lý</option>{Object.keys(verdicts).map(id => <option key={id}>{id}</option>)}</select></label>
            <button className="primary full" disabled={!session.verdict} onClick={() => incomplete ? setOverlay('submit') : submit()}>Nộp báo cáo</button>
          </div>}
        </section>
      </div>
    </main>}
    {screen === 'report' && report && <AfterAction game={game} index={index} code={code(index)} report={report} practice={!!practice}
      onNext={next} onMenu={menu} onReplay={() => {
        if (practice) beginPractice()
        else if (save) { const reports = [...save.reports];reports[index] = null;desk(fresh(index,reports)) }
      }}/>}
    {screen === 'summary' && save && <main className="interstitial"><div className="eyebrow">CHAPTER 01 / HOÀN THÀNH</div><h1>HẾT <em>CA TRỰC</em></h1>
      <h2>{total}/500 điểm · {done}/{cases.length} hồ sơ</h2>
      <ul className="summary-list">{save.reports.map((entry,i) => entry && <li key={i}><span>{code(i)} · {cases[i].title}</span><strong>{evaluate(cases[i],i,entry).total}/100</strong></li>)}</ul>
      <button className="primary" onClick={menu}>Về menu chính</button></main>}
    {overlay && <div className="scrim"><section role="dialog" aria-modal="true" aria-label="Ca trực" className="overlay">
      <button className="close" aria-label="Đóng" onClick={() => setOverlay(null)} autoFocus>×</button>
      {overlay === 'rules' && <><h2>Quy trình ca trực</h2><p>Đọc hồ sơ, mở nguồn độc lập, lưu nhận định có căn cứ và chọn hướng dẫn xử lý an toàn.</p>
        <dl className="guide-defs">{Object.entries(verdicts).map(([id,label]) => <div key={id}><dt>{id}</dt><dd>{label}</dd></div>)}</dl></>}
      {overlay === 'pause' && <><h2>Ca trực đang tạm dừng</h2><div className="toolbar"><button onClick={menu}>Menu chính</button><button className="primary" onClick={() => setOverlay(null)}>Tiếp tục</button></div></>}
      {overlay === 'restart' && <><h2>Bắt đầu ca trực mới?</h2><p>Khi tiếp nhận CASE-001, tiến trình của ca trước sẽ được thay thế.</p><div className="toolbar"><button onClick={() => setOverlay(null)}>Quay lại</button><button className="primary" onClick={start}>Bắt đầu ca mới</button></div></>}
      {overlay === 'submit' && <><h2>Nộp với ghi nhận còn thiếu?</h2><p>Một số lời khai chưa có đánh giá hoặc tài liệu đi kèm. Bạn có thể nộp hồ sơ với thông tin hiện có.</p><div className="toolbar"><button onClick={() => setOverlay(null)}>Quay lại sổ tay</button><button className="primary" onClick={submit}>Xác nhận nộp</button></div></>}
    </section></div>}
  </div>
}
createRoot(document.getElementById('root')!).render(<App/>)


