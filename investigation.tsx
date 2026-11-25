import { useState } from 'react'
import type { Case, Status, Tool, Verdict } from './cases'
import { briefs, evaluate } from './scoring'
import type { Finding, Submission } from './scoring'
import { tools } from './simulators'

export const statuses: Record<Status, string> = { UNASSESSED:'Chưa đánh giá', CONFIRMED:'Đã xác thực', REFUTED:'Bị bác bỏ', INCONCLUSIVE:'Chưa đủ căn cứ' }
export const verdicts: Record<Verdict,string> = {
  APPROVE:'Cho phép thực hiện yêu cầu.', VERIFY:'Tạm dừng để tiếp tục xác minh.', DENY:'Từ chối yêu cầu hiện tại.'
}
const descriptions = {
  CONFIRMED:'Tài liệu xác nhận lời khai.', REFUTED:'Tài liệu mâu thuẫn với lời khai.',
  INCONCLUSIVE:'Thông tin hiện có chưa đủ để kết luận.'
}
const origins: Record<string, Tool> = {
  message:'phone', calls:'phone', profile:'portal', tuition:'portal', directory:'directory',
  transfer:'transaction', history:'transaction', mail:'email', headers:'email', link:'email',
  policy:'browser', activity:'browser', identity:'call', followup:'call', order:'shopping',
  tracking:'shopping', support:'shopping'
}

export function sourceName(game: Case, id: string) {
  if (id === 'attachment') return game.tools.includes('email') ? tools.email[1] : tools.phone[1]
  if (id === 'link' && !game.tools.includes('email')) return tools.browser[1]
  const tool = origins[id]
  return tool ? tools[tool][1] : 'Hồ sơ tiếp nhận'
}

type NotebookProps = {
  game:Case; found:string[]; findings:Finding[]; active:number;
  onSelect:(i:number)=>void; onEdit:(finding:Finding)=>void;
  tutorialStep?:number
}
export function Notebook({game,found,findings,active,onSelect,onEdit,tutorialStep}:NotebookProps) {
  const [documents,setDocuments] = useState(false)
  const completed = findings.filter(finding => finding.status !== 'UNASSESSED').length
  const draft = findings[active]

  function toggle(id:string) {
    onEdit({...draft,sources:draft.sources.includes(id) ? draft.sources.filter(source => source !== id) : [...draft.sources,id]})
  }

  return <div className="notebook">
    <small>{game.title} · {completed}/{game.claims.length} đã nhận định</small>
    <div className="claim-index" aria-label="Danh sách lời khẳng định">
      {game.claims.map((claim,i) => <button key={claim.text} title={claim.text} aria-current={i === active ? 'step' : undefined}
        className={i === active ? 'selected' : ''} onClick={() => {onSelect(i);setDocuments(false)}}>
        <span>{i + 1}. {claim.text}</span><small key={JSON.stringify(findings[i])} className={findings[i].status === 'UNASSESSED' ? undefined : 'claim-recorded'}>{statuses[findings[i].status]}</small>
      </button>)}
    </div>
    <div className="claim-bubble"><small>Lời khẳng định cần kiểm chứng</small><h3>{game.claims[active].text}</h3></div>
    {tutorialStep === 5 && <p className="coach">Chọn nhận định cho lời khai về giờ mở cửa.</p>}
    <div className="status-options" role="group" aria-label="Nhận định">
      {Object.entries(descriptions).map(([id,description]) => <button key={id} aria-pressed={draft.status === id}
        className={draft.status === id ? 'selected' : ''} onClick={() => onEdit({...draft,status:id as Status})}>
        <strong>{statuses[id as Status]}</strong><small>{description}</small></button>)}
    </div>
    {draft.status === 'INCONCLUSIVE' && <label className="reason">Thông tin còn thiếu <textarea rows={2} value={draft.reason} onChange={e => onEdit({...draft,reason:e.target.value})} /></label>}
    {tutorialStep === 6 && <p className="coach">Mở Tài liệu làm căn cứ, chọn nguồn đã dùng.</p>}
    <div className="notebook-sources">
      <button aria-expanded={documents} onClick={() => setDocuments(!documents)}>Tài liệu làm căn cứ ({draft.sources.length})</button>
      {documents && (found.length === 0 ? <p>Chưa thu thập tài liệu. Mở công cụ để đọc hồ sơ.</p> : found.map(id => {
        const doc = game.evidence[id]
        if (!doc) return null
        return <div className="notebook-source" key={id}><label><input type="checkbox" checked={draft.sources.includes(id)} onChange={() => toggle(id)}/>{doc.title}</label>
          <details><summary>{sourceName(game,id)} · Đọc tài liệu</summary><p>{doc.text}</p></details></div>
      }))}
    </div>
    <div className="toolbar">
      {active < game.claims.length - 1 && <button onClick={() => {onSelect(active+1);setDocuments(false)}}>Vấn đề tiếp theo</button>}</div>
  </div>
}

export function AfterAction({game,index,code,report,practice,onNext,onReplay,onMenu}:{
  game:Case;index:number;code:string;report:Submission;practice:boolean;
  onNext:()=>void;onReplay:()=>void;onMenu:()=>void
}) {

  const score = evaluate(game,index,report)
  const brief = briefs[index]
  const names = (ids:string[]) => ids.map(id => game.evidence[id]?.title ?? id).join(', ')
  const groupNames = (groups:string[][]) => groups.map(group => group.map(id => names([id])).join(' hoặc ')).join(' + ')
  const mismatch = report.verdict === game.verdict ? '' : report.verdict === 'VERIFY'
    ? 'Tạm dừng hạn chế rủi ro trước mắt. Các nguồn dưới đây cho thấy cách chốt hồ sơ khi có đủ thông tin.'
    : report.verdict === 'DENY' && game.verdict === 'VERIFY'
      ? 'Từ chối ngăn được giao dịch trước mắt, nhưng danh tính người gọi vẫn còn bỏ ngỏ và có thể kiểm tra độc lập.'
      : brief.consequence
  return <main className="interstitial report aar">
    <section className="aar-overview" aria-label="Tóm tắt vụ việc">
      <div className="aar-title">
        <div><div className="eyebrow">{code} / {practice ? '9/9 · BÁO CÁO MẪU' : 'BÁO CÁO SAU XỬ LÝ'}</div><h1>{game.title}</h1></div>
        <div className="aar-rating"><strong>{score.total}<small>/100</small></strong><span>Hạng {score.grade}</span></div>
      </div>
      <p className={score.unsafe ? 'aar-safety unsafe' : 'aar-safety'}>
        {score.unsafe ? 'LỖI AN TOÀN NGHIÊM TRỌNG' : 'Không có phê duyệt nguy hiểm trong kịch bản'}
      </p>
      <p className="aar-verdict">Bạn chọn <strong>{report.verdict}</strong><span>Phương án phù hợp <strong>{game.verdict}</strong></span></p>
      <ul className="aar-reasons">{brief.summary.map(reason => <li key={reason}>{reason}</li>)}</ul>
      {mismatch && <p>{mismatch}</p>}
      {report.verdict === game.verdict && score.verification < 30 && <p>{report.advice === undefined
        ? 'Quyết định phù hợp và nhận đủ điểm quyết định. Các nhận định và căn cứ được chấm riêng.'
        : 'Báo cáo cũ tính điểm quyết định cùng mức độ hoàn chỉnh của sổ tay.'}</p>}
      <dl className="score-strip">
        <div><dt>Quyết định</dt><dd>{score.decision}/40</dd></div>
        <div><dt>Kiểm chứng</dt><dd>{score.verification}/30</dd></div>
        <div><dt>Điều tra</dt><dd>{score.investigation}/{score.investigationMax}</dd><small>Đã mở {score.found.filter(Boolean).length}/{score.found.length} nhóm nguồn cần kiểm tra</small></div>
        {report.advice !== undefined && <div><dt>Xử lý an toàn · v0.2</dt><dd>{score.advice}/15</dd></div>}
      </dl>
      {report.legacy && <small>Hồ sơ chuyển từ v0.1. Nhật ký nguồn và hướng dẫn xử lý của bản cũ chỉ có dữ liệu một phần.</small>}
    </section>
    <section className="aar-claims">
      <h2>Phân tích từng lời khẳng định</h2>
      {game.claims.map((claim,i) => {
        const entry = score.claims[i]
        const [analysis,risk] = brief.analysis[i]
        const outcome = entry.finding.status === 'UNASSESSED' ? 'Chưa thực hiện kiểm chứng'
          : !entry.correct ? 'Nhận định sai' : entry.supported ? 'Đúng và đủ căn cứ'
          : entry.missing.length ? 'Đúng nhưng thiếu căn cứ phù hợp' : 'Đúng, có căn cứ gây nhiễu'
        return <details className="aar-claim" key={claim.text}>
          <summary><span><strong>{claim.text}</strong><small>{outcome}</small></span><b>{entry.points}/{entry.max}</b></summary>
          <div className="aar-claim-body">
            <p><strong>Kết quả và cách đối chiếu:</strong> {statuses[claim.status]}. {analysis}</p>
            <p><strong>Rủi ro trong kịch bản:</strong> {risk}</p>
            <dl className="aar-sources">
              <div><dt>Nhận định của bạn</dt><dd>{statuses[entry.finding.status]}</dd></div>
              <div><dt>Tài liệu bạn dùng</dt><dd>{names(entry.finding.sources) || 'Chưa chọn tài liệu.'}</dd></div>
              <div><dt>Nguồn có giá trị</dt><dd>{groupNames(entry.groups)}</dd></div>
              {entry.groups.map((group,groupIndex) => {
                const id = group.find(source => entry.relevant.includes(source)) ?? group.find(source => report.found.includes(source)) ?? group[0]
                return <div className="report-excerpt" key={groupIndex}><dt>{names([id])}</dt><dd>{game.evidence[id].text}</dd></div>
              })}
            </dl>
            <p><strong>Điểm nhận định:</strong> {entry.points}/{entry.max}. {entry.finding.status === 'UNASSESSED'
              ? 'Bạn chưa chọn nhận định cho lời khẳng định này.'
              : !entry.correct ? 'Nhận định đã chọn không phù hợp với kết quả đối chiếu ở trên.'
              : entry.missing.length ? 'Nhận định phù hợp. Để đủ điểm, cần bổ sung ' + groupNames(entry.missing) + '.'
              : entry.extra.length ? 'Đủ nguồn để kết luận, nhưng có tài liệu không liên quan được chọn kèm.'
              : 'Nhận định phù hợp và có đủ nguồn cần thiết.'}</p>
            {entry.extra.length > 0 && <p>{names(entry.extra)} không trực tiếp kiểm chứng lời khai này.</p>}
            {entry.finding.reason.trim() && <p>Ghi chú của bạn · {entry.finding.reason}</p>}
          </div>
        </details>
      })}
    </section>
    <section className="aar-guidance"><h2>Hướng dẫn người dân</h2>
      <ol>{brief.guidance.map(step => <li key={step}>{step}</li>)}</ol>
    </section>
    <div className="toolbar"><button onClick={onMenu}>Menu chính</button><button onClick={onReplay}>Chơi lại vụ việc</button><button className="primary" onClick={onNext}>{practice ? 'Bắt đầu ca trực' : index === 4 ? 'Xem tổng kết ca trực' : 'Tiếp tục vụ việc'}</button></div>
  </main>
}

