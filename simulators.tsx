import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Case, Tool } from './cases'

export const tools: Record<Tool, [string, string]> = {
  phone:['♧','Điện thoại'],portal:['▤','Cổng sinh viên'],directory:['▥','Danh bạ'],transaction:['⇄','Giao dịch'],
  email:['✉','Email'],browser:['◎','Trình duyệt'],call:['☎','Cuộc gọi'],shopping:['▣','Mua sắm']
}

export function Simulator({ game, tool, collect }: { game: Case; tool: Tool; collect: (id: string) => void }) {
  const [page, setPage] = useState('')
  const [detail, setDetail] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [tabs, setTabs] = useState<string[][]>([['search']])
  const [historyLog, setHistoryLog] = useState<string[][]>([['search']])
  const [tab, setTab] = useState(0)
  const [read, setRead] = useState(false)
  const [started, setStarted] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (started === null) return
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => window.clearInterval(timer)
  }, [started])

  function open(next: string, id?: string) {
    setPage(next)
    setDetail('')
    if (id) collect(id)
  }
  function reveal(id: string) {
    setDetail(id)
    collect(id)
  }
  function item(id: string) {
    const doc = game.evidence[id]
    return doc && <div className="document"><small>{doc.title}</small><p>{doc.text}</p></div>
  }
  function action(label: string, handler: () => void, active = false) {
    return <button type="button" className={active ? 'selected' : ''} onClick={handler}>{label}</button>
  }
  function app(brand: string, nav: ReactNode, content: ReactNode, className = '') {
    return <div className={'sim ' + className}><div className="app-brand">{brand}</div><div className="app-layout">
      {nav && <nav>{nav}</nav>}<div className="app-content">{content}</div>
    </div></div>
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    setQuery(search.trim())
  }

  if (tool === 'phone') {
    return <div className="phone"><div className="phone-status"><span>{game.time}</span><span>▮▮▮ · 92%</span></div>
      <div className="phone-bar">{action('Tin nhắn', () => open(''), page !== 'calls')}{action('Cuộc gọi', () => open('calls', 'calls'), page === 'calls')}</div>
      {page === 'calls' ? <><h3>Cuộc gọi gần đây</h3>{item('calls') || <p>Không có cuộc gọi liên quan trong bản trích xuất.</p>}</>
        : page === 'chat' ? <>{action('‹ Hội thoại', () => open(''))}<h3>{game.evidence.message.title}</h3><small>{game.time} · Tin đến</small>
          <details className="contact-info"><summary>Thông tin liên hệ</summary><p>{game.evidence.message.title} · {game.title === 'THE LAST MILE' ? 'Hội thoại trong đơn hàng' : 'Người gửi chưa lưu trong danh bạ thiết bị'}</p></details>
          <p className="bubble">{game.evidence.message.text}</p>
          {game.evidence.attachment && action('▤ Xem ảnh đính kèm', () => reveal('attachment'))}{item(detail)}</>
        : <><h3>Hội thoại</h3><button className="message-row" onClick={() => open('chat','message')}><span className="sender-icon" aria-hidden="true">▤</span><span><strong>{game.evidence.message.title}</strong><small>{game.time} · 1 tin nhắn</small></span></button></>}
    </div>
  }

  if (tool === 'portal') {
    const sections = ['Trang chủ','Hồ sơ sinh viên','Thông báo','Tài chính','Hỗ trợ sinh viên']
    const section = page || sections[0]
    return app('ĐẠI HỌC HẢI ĐĂNG · CỔNG SINH VIÊN', sections.map(label =>
      <div key={label}>{action(label, () => open(label, label === sections[1] ? 'profile' : undefined), section === label)}</div>),
      <><small>Cổng sinh viên / {section}{detail === 'tuition' && ' / Học phí'}</small><h3>{section}</h3>
        {section === sections[0] && <p>Chào Mai Anh. Chọn một mục để xem hồ sơ và dịch vụ sinh viên.</p>}
        {section === sections[1] && item('profile')}
        {section === sections[2] && <><details className="document"><summary>21/11 · Lịch học kỳ 1</summary><p>Tra cứu thời khóa biểu từ trang Hồ sơ sinh viên.</p></details><details className="document"><summary>05/09 · Tiếp nhận sinh viên mới</summary><p>Thông báo đã lưu trữ. Xem nghĩa vụ thanh toán hiện tại tại mục Tài chính.</p></details></>}
        {section === sections[3] && <><div className="toolbar">{action('Học phí', () => reveal('tuition'), detail === 'tuition')}{action('Lịch sử thanh toán', () => setDetail('history'), detail === 'history')}</div>
          {item(detail)}{detail === 'history' && <p>Chưa phát sinh khoản thanh toán kỳ 1.</p>}</>}
        {section === sections[4] && <p>Liên hệ Phòng Tài chính qua danh bạ của trường để xác minh người nhận.</p>}
      </>, 'portal')
  }

  if (tool === 'directory') {
    const doc = game.evidence.directory
    const offices = [doc.title,'Tiếp nhận hồ sơ chung','Hỗ trợ kỹ thuật']
    const filtered = offices.filter(label => label.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')))
    return app('DANH BẠ · ĐẦU MỐI CHÍNH THỨC', null, <>
      <h3>Tra cứu bộ phận</h3><form onSubmit={submit} className="toolbar"><input aria-label="Từ khóa tìm danh bạ" placeholder="Tên tổ chức hoặc bộ phận" value={search} onChange={e => setSearch(e.target.value)} /><button>Tìm</button></form>
      {!query && <p>Nhập một phần tên bộ phận để thu hẹp danh sách liên hệ.</p>}
      <table className="directory-table"><thead><tr><th>Bộ phận</th><th>Phạm vi</th></tr></thead><tbody>
        {filtered.map(label => <tr key={label}><td>{action(label,() => open(label),page === label)}</td><td>{label === doc.title ? 'Xác minh nghiệp vụ' : 'Tiếp nhận và chuyển tuyến'}</td></tr>)}
      </tbody></table>
      {!filtered.length && <p>Không có đầu mối phù hợp.</p>}
      {page && <div className="document"><strong>{page}</strong><p>Gửi yêu cầu đối chiếu thông tin hồ sơ.</p>
        {action('Liên hệ xác minh',() => page === doc.title ? reveal('directory') : setDetail('referred'))}</div>}
      {detail === 'referred' && <p>Bộ phận này không có quyền xác nhận hồ sơ. Hãy liên hệ đơn vị nghiệp vụ trong danh bạ.</p>}
      {item(detail)}
    </>, 'directory')
  }
  if (tool === 'transaction') {
    return app('SỔ GIAO DỊCH · CHỈ ĐỌC', <>{action('Bản nháp', () => open('draft', 'transfer'), page === 'draft')}{action('Lịch sử', () => open('history', 'history'), page === 'history')}</>,
      <><h3>{page === 'history' ? 'Giao dịch gần đây' : 'Kiểm tra người thụ hưởng'}</h3>
        {page === 'history' ? item('history') || <p>Không có giao dịch đã lưu cho hồ sơ này.</p> : page === 'draft' ? item('transfer') : <p>Mở bản nháp để đối chiếu số tiền và người nhận.</p>}</>, 'transaction')
  }

  if (tool === 'email') {
    return app('HỘP THƯ · SABLE MAIL', <>{action(read ? 'Hộp thư đến' : 'Hộp thư đến · 1', () => open(''), page !== 'archive')}{action('Lưu trữ', () => open('archive'), page === 'archive')}</>,
      page === 'archive' ? <p>Thư mục trống.</p> : page === 'mail' ? <>
        {action('‹ Hộp thư đến', () => open(''))}<h3>{game.evidence.mail.title}</h3>
        <div className="mail-meta"><strong>{game.title === 'REFUND DETOUR' ? 'Bộ phận hoàn tiền' : 'Cloud'}</strong><small> Gửi đến tôi · {game.title === 'REFUND DETOUR' ? '15:42' : '08:57'}</small></div><div className="toolbar">{action('Chi tiết người gửi', () => reveal('headers'))}{action('Xem đích liên kết', () => reveal('link'))}{action('Tệp đính kèm', () => reveal('attachment'))}</div>
        <p>{game.evidence.mail.text}</p>{item(detail)}
      </> : <><h3>Hộp thư đến</h3><button className={'mail-row' + (read ? '' : ' unread')} onClick={() => { setRead(true);open('mail','mail') }}><span>{read ? 'Đã đọc' : 'Chưa đọc'}</span><strong>{game.evidence.mail.title}</strong></button></>, 'mail')
  }

  if (tool === 'browser') {
    const refund = game.title === 'REFUND DETOUR'
    const official = refund ? 'monau.example' : 'luutrumay.example'
    const suspect = refund ? 'monau-dichvu.example' : 'may-verify.example'
    const addresses: Record<string,string> = {search:'Tìm kiếm nội bộ',official,policy:official+'/tro-giup',activity:official+'/trang-thai',suspect}
    const history = tabs[tab]
    const current = history[history.length-1]
    function navigate(next:string) {
      setTabs(values => values.map((entries,i) => i === tab && entries.at(-1) !== next ? [...entries,next] : entries))
      if (next !== current) setHistoryLog(values => values.map((entries,i) => i === tab ? [...entries,next] : entries))
      setSearch('');setDetail('')
      if (['policy','activity'].includes(next)) collect(next)
      if (next === 'suspect') collect('link')
    }
    function go(event:FormEvent) {
      event.preventDefault()
      const address = search.trim().replace(/^https?:\/\//,'').replace(/\/$/,'').toLowerCase()
      const match = Object.keys(addresses).find(key => key !== 'search' && addresses[key] === address)
      if (match || address.startsWith(suspect+'/')) navigate(match || 'suspect')
      else { setQuery(search.trim());navigate('search') }
    }
    const terms = refund ? ['mỏ','nâu','monau','hoàn','mn-092'] : ['cloud','mây','may','mau','luutru','khóa','tài khoản']
    return app('TRÌNH DUYỆT · MÔ PHỎNG NGOẠI TUYẾN',null,<>
      <div className="browser-tabs">{tabs.map((entries,i) => <button key={i} aria-pressed={i === tab} className={i === tab ? 'selected' : ''} onClick={() => {setTab(i);setSearch('');setDetail('')}}>{addresses[entries.at(-1)!]}</button>)}
        <button aria-label="Tab mới" onClick={() => {
          setTabs([...tabs,['search']]);setHistoryLog([...historyLog,['search']]);setTab(tabs.length);setSearch('');setDetail('')
        }}>+</button></div>
      <form onSubmit={go} className="toolbar">
        <button type="button" aria-label="Quay lại" disabled={history.length === 1} onClick={() => {
          setTabs(values => values.map((entries,i) => i === tab ? entries.slice(0,-1) : entries));setSearch('');setDetail('')
        }}>‹</button>
        <button type="button" aria-label="Tải lại" onClick={() => {setSearch('');setDetail('reload')}}>↻</button>
        <input aria-label="Địa chỉ hoặc từ khóa" placeholder={addresses[current]} value={search} onChange={e => {setSearch(e.target.value);setDetail('')}}/><button>Mở</button>
      </form>
      {detail === 'reload' && <small role="status">Đã tải lại {addresses[current]}.</small>}
      <details className="browser-history"><summary>Lịch sử tab</summary><ol>{historyLog[tab].map((id,i) =>
        <li key={i}>{action(addresses[id],() => navigate(id))}</li>)}</ol></details>
      {current === 'search' && <><h3>{query ? 'Kết quả cho “'+query+'”' : 'Tìm kiếm nội bộ'}</h3><p>Tìm theo tổ chức hoặc nhập tên miền từ thư.</p>
        {query && (terms.some(term => query.toLowerCase().includes(term)) ? <div className="results"><button onClick={() => navigate('official')}>{official}</button><button onClick={() => navigate('suspect')}>{suspect}</button></div> : <p>Không có kết quả phù hợp trong kho mô phỏng.</p>)}</>}
      {current === 'official' && <div className="site-view"><h3>{refund ? 'Mỏ Nâu' : 'Cloud'}</h3><div className="toolbar">{action('Trung tâm trợ giúp',() => navigate('policy'))}{action(refund ? 'Trạng thái dịch vụ' : 'Hoạt động bảo mật',() => navigate('activity'))}</div></div>}
      {current === 'suspect' && <div className="site-view"><h3>{refund ? 'Cổng hoàn tiền' : 'Xác nhận tài khoản'}</h3>{item('link')}<p>Bản xem trước của trang đích.</p></div>}
      {['policy','activity'].includes(current) && item(current)}
    </>,'browser')
  }
  if (tool === 'call') {
    const active = started !== null
    const connecting = active && elapsed === 0
    return <div className="phone call"><div className="phone-status"><span>{game.time}</span><span>▮▮▮</span></div>
      <div className="caller">☎</div><h3>Số mới · 0900 000 208</h3>
      <p>{connecting ? 'Đang kết nối…' : active ? 'Đã kết nối' : page === 'ended' ? 'Đã kết thúc cuộc gọi' : 'Chờ kết nối'} · {String(Math.floor(elapsed / 60)).padStart(2,'0')}:{String(elapsed % 60).padStart(2,'0')}</p>
      {active ? <>{!connecting && <>{action('Hỏi về cuộc hẹn hôm qua', () => reveal('identity'))}{action('Hỏi có thể gọi lại không', () => reveal('followup'))}</>}
        {action('Kết thúc cuộc gọi', () => { setStarted(null); setPage('ended') })}</>
        : action('Gọi lại số này', () => { setElapsed(0); setStarted(Date.now()); setDetail('') })}
      {item(detail)}
    </div>
  }

  return app('ĐƠN HÀNG · ' + (game.title === 'REFUND DETOUR' ? 'MỎ NÂU' : 'HẠC CHUYỂN'), <>{action('Đơn đã đặt', () => open(''), !page)}{action('Hỗ trợ', () => open('support', 'support'), page === 'support')}</>,
    <><h3>{page === 'support' ? 'Hỗ trợ đơn hàng' : 'Lịch sử đơn hàng'}</h3>
      {!page && action(game.evidence.order.title, () => open('order', 'order'))}
      {page === 'order' && <>{item('order')}<p className="order-progress">{game.title === 'REFUND DETOUR' ? 'Đã đặt · Đã hủy · Đang hoàn tiền' : 'Đã đặt · Đang giao · Chờ nhận'}</p><div className="toolbar">{action('Tra cứu vận đơn', () => reveal('tracking'))}{action('Chi tiết thanh toán & hỗ trợ', () => reveal('support'))}</div>{item(detail)}</>}
      {page === 'support' && item('support')}
    </>, 'shopping')
}


