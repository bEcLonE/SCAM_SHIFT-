import type { Case, Status, Verdict } from './cases'

export type Finding = { status: Status; sources: string[]; reason: string }
export type Submission = { findings: Finding[]; verdict: Verdict; advice?: number; found: string[]; legacy?: boolean }
export const unassessed = (): Finding => ({status:'UNASSESSED',sources:[],reason:''})

type Brief = {steps:string[][]; required:Partial<Record<number,string[][]>>; guidance:string[]; consequence:string; summary:string[]; analysis:[string,string][]; supporting?:Partial<Record<number,string[]>>}

export const briefs: Brief[] = [
  { steps:[['directory'],['tuition'],['transfer']], required:{3:[['directory','tuition'],['transfer']]}, guidance:['Dừng bản nháp và không chuyển tiền vào tài khoản cá nhân.','Lưu tin nhắn và phiếu thu.','Tự mở cổng sinh viên, vào Tài chính → Học phí để kiểm tra hạn 15/12 và số dư. Nếu cần, liên hệ Phòng Tài chính qua danh bạ rồi thanh toán theo thông tin do trường công bố.'], consequence:'Trong kịch bản, tiền có thể vào tài khoản cá nhân trong khi nghĩa vụ học phí vẫn còn.',
    summary:['Số gửi không thuộc Phòng Tài chính.','Học phí đúng, nhưng hạn và người thụ hưởng trong tin nhắn sai.'],
    analysis:[
      ['Phòng Tài chính kiểm tra đầu số qua danh bạ nghiệp vụ và xác nhận số này không thuộc phòng. Tên và mã sinh viên khớp với hồ sơ chỉ chứng minh người gửi có dữ liệu của Mai Anh.','Nếu coi dữ liệu cá nhân là bằng chứng danh tính, Mai Anh có thể làm theo một yêu cầu giả mạo.'],
      ['Sổ học phí trên tài khoản sinh viên ghi số dư 4.800.000 ₫. Đây là nguồn đối chiếu nghĩa vụ thực tế. Tin nhắn chỉ nhắc lại cùng con số.','Nếu xem việc trùng số tiền là đủ để tin người gửi, khoản chuyển có thể đến sai người dù học phí là có thật.'],
      ['Sổ học phí ghi hạn 15/12. So với ngày tiếp nhận 25/11, sinh viên vẫn còn thời gian kiểm tra. Mốc “hôm nay” xuất phát từ tin nhắn.','Nếu tin hạn chót giả, Mai Anh có thể chuyển tiền vội trước khi đối chiếu.'],
      ['Đặt chính sách thu của trường cạnh bản nháp. Trường chỉ nhận qua cổng hoặc tài khoản đứng tên trường, còn bản nháp ghi người thụ hưởng là Trần Minh T.','Khoản tiền có thể đến tài khoản cá nhân và học phí vẫn chưa được ghi nhận.']
    ], supporting:{3:['message','attachment']} },
  { steps:[['link'],['policy'],['activity']], required:{0:[['link'],['policy']]}, guidance:['Không đăng nhập qua liên kết trong thư.','Mở dịch vụ từ địa chỉ đã biết và kiểm tra mục Hoạt động bảo mật.','Giữ thư và báo cáo qua kênh hỗ trợ Cloud. Nếu đã nhập mật khẩu, tự mở Cloud để đổi mật khẩu và kiểm tra phiên đăng nhập.'], consequence:'Trong kịch bản, sử dụng trang đích có thể làm lộ thông tin đăng nhập.',
    summary:['Tên miền của liên kết khác tên miền do dịch vụ công bố.','Nhật ký bảo mật không ghi lịch khóa lúc 18:00.'],
    analysis:[
      ['Bản xem trước cho biết liên kết mở may-verify.example. Trung tâm trợ giúp xác định tên miền của dịch vụ là luutrumay.example. Cần đối chiếu cả hai để kiểm tra đích thực sự.','Nếu tin nút đăng nhập trong thư, Huy có thể nhập thông tin vào một trang ngoài dịch vụ.'],
      ['Mục Hoạt động bảo mật dành riêng cho tài khoản của Huy và không ghi lịch khóa trong ngày nhận thư. Mốc 18:00 chỉ xuất hiện trong yêu cầu gửi đến.','Áp lực thời hạn có thể khiến Huy bỏ qua trang tài khoản và dùng liên kết chưa xác minh.'],
      ['Tiêu đề thư cho biết địa chỉ gửi và địa chỉ nhận phản hồi. Các trường này giúp kiểm tra nguồn của thư, nhưng không đủ để xác định cá nhân đang điều khiển hộp thư.','Quy kết danh tính từ địa chỉ thư có thể dẫn đến báo nhầm người.']
    ] },
  { steps:[['order'],['tracking'],['support']], required:{}, guidance:['Có thể đổi giờ giao trong Chi tiết đơn hàng.','Kiểm tra đúng đơn HC-581, chọn khung giờ mới và xem xác nhận trong ứng dụng. Đơn đã thanh toán nên không cần trả thêm hoặc cung cấp mã đăng nhập.'], consequence:'Trong kịch bản, từ chối đổi giờ có thể dẫn đến giao hụt dù yêu cầu hợp lệ.',
    summary:['Đơn đã thanh toán và vận đơn đang giao.','Đổi giờ được thực hiện trong ứng dụng mà không cần trả thêm.'],
    analysis:[
      ['Hồ sơ đơn HC-581 ghi thanh toán hoàn tất. Trạng thái này gắn trực tiếp với mã đơn, độc lập với lời nhắn của người giao.','Nếu hiểu nhầm đơn còn nợ, Hà có thể chấp nhận một yêu cầu thanh toán lần hai.'],
      ['Vận đơn HAC-781581 ghi kiện hàng đã rời bưu cục và chuyển sang đang giao. Đầu mối điều phối cũng có thể đối chiếu đơn này với đội giao nội thành.','Đánh giá sai trạng thái có thể khiến Hà bỏ lỡ lượt giao đang được bố trí.'],
      ['Trang vận đơn cho phép đổi giờ trong chi tiết đơn. Bộ phận hỗ trợ xác nhận thao tác này không phát sinh phí đối với HC-581.','Nếu hiểu đây là yêu cầu phải xử lý bên ngoài ứng dụng, Hà có thể bỏ lỡ khung giờ giao phù hợp.']
    ] },
  { steps:[['identity','calls'],['followup'],['transfer']], required:{}, guidance:['Tạm dừng giao dịch.','Gọi lại số Nam đã lưu hoặc nhờ người thân liên hệ với Nam. Nếu chưa liên lạc được, tiếp tục chờ. Khi xác minh được, kiểm tra lại nội dung yêu cầu và tên người nhận trước khi cân nhắc giao dịch.'], consequence:'Trong kịch bản, chuyển tiền khi danh tính chưa xác minh có thể khiến tiền đến người không liên quan.',
    summary:['Giọng quen và số mới chưa xác minh được danh tính.','Người thụ hưởng mang tên khác, và người gọi đồng ý chờ.'],
    analysis:[
      ['Câu trả lời về cuộc hẹn không cung cấp chi tiết để đối chiếu. Lịch sử cuộc gọi cũng chưa có cuộc liên lạc thành công qua số đã lưu. Danh tính cần được kiểm tra độc lập.','Tin giọng quen có thể khiến Long gửi tiền khi chưa biết mình đang nói chuyện với ai.'],
      ['Bản nháp ghi người thụ hưởng là Bùi A. Tên này khác tên Vũ Hoài Nam mà Long cần xác minh. Lịch sử chuyển tiền giúp đối chiếu tên người nhận quen thuộc.','Tiền có thể đến một bên thứ ba và khó thu hồi nếu giao dịch không đúng người.'],
      ['Khi được hỏi về cách xác minh, người gọi nói có thể chờ để Long gọi lại. Câu trả lời chỉ xác nhận họ đồng ý chờ.','Bỏ qua thời gian chờ sẽ làm mất cơ hội gọi lại qua số đã lưu trước khi chuyển tiền.']
    ], supporting:{1:['history']} },
  { steps:[['order'],['support'],['policy']], required:{}, guidance:['Không trả phí theo email.','Lưu email và mở Chi tiết thanh toán của đơn MN-092 để theo dõi 749.000 ₫ về thẻ ban đầu. Nếu quá thời gian dự kiến, liên hệ hỗ trợ ngay trong ứng dụng.'], consequence:'Trong kịch bản, khoản phí có thể bị mất trong khi lệnh hoàn chính thức vẫn xử lý riêng.',
    summary:['Đơn đã bị hủy và hệ thống đã khởi tạo lệnh hoàn.','Quy trình chính thức không có phí mở lệnh.'],
    analysis:[
      ['Chi tiết đơn và mốc 14:58 trong tiến trình đều ghi người bán hủy trước khi bàn giao. Việc email biết đơn đã hủy có thể chỉ là nhắc lại thông tin có thật.','Nếu lấy dữ kiện hủy đơn để xác thực cả email, Châu có thể tin luôn yêu cầu trả phí.'],
      ['Chính sách hoàn tiền quy định hoàn về phương thức ban đầu. Bảng thanh toán của MN-092 cũng ghi phí hoàn bằng 0, trái với mức 89.000 ₫ trong thư.','Châu có thể mất phí trong khi khoản hoàn chính thức vốn xử lý độc lập.'],
      ['Chi tiết thanh toán cho thấy đã tạo lệnh trả 749.000 ₫ về thẻ ban đầu. Đây là trạng thái khởi tạo, chưa xác nhận tiền đã vào thẻ.','Nếu tưởng cần mở lệnh mới, Châu có thể trả phí vô ích hoặc bỏ qua việc theo dõi khoản hoàn thật.']
    ] },
  { steps:[['message'],['directory']], required:{}, guidance:['Đến nhận sách từ 09:00 theo lịch công bố.'], consequence:'Trong tình huống luyện tập, bạn có thể đến trước giờ phục vụ.',
    summary:['Quầy Bạn đọc công bố mở từ 09:00.','Giờ 08:00 chỉ xuất hiện trong tin nhắn.'],
    analysis:[
      ['Lịch từ Quầy Bạn đọc ghi giờ mở cửa và giờ nhận sách đều bắt đầu lúc 09:00. Đây là lịch của đơn vị vận hành quầy, nên có giá trị hơn mốc giờ truyền qua tin nhắn.','Trịnh An có thể đến trước giờ phục vụ và phải quay lại.']
    ] }
]

export const sourceGroups = (game: Case, index: number, claim: number): string[][] =>
  briefs[index].required[claim] ?? [game.claims[claim].sources]

export function evaluate(game: Case, index: number, submission: Submission) {
  const brief = briefs[index]
  const claims = game.claims.map((claim, i) => {
    const finding = submission.findings[i] ?? unassessed()
    const groups = sourceGroups(game,index,i)
    const relevant = finding.sources.filter(id => groups.some(group => group.includes(id)))
    const supporting = submission.advice === undefined ? brief.supporting?.[i] ?? [] : []
    const extra = finding.sources.filter(id => !relevant.includes(id) && !supporting.includes(id))
    const missing = groups.filter(group => !group.some(id => relevant.includes(id)))
    const supported = missing.length === 0 && extra.length === 0
    const correct = finding.status === claim.status
    const ratio = !correct ? 0 : supported ? 1 : relevant.length || (finding.status === 'INCONCLUSIVE' && finding.reason.trim()) ? .6 : .4
    // Distribute integer points without changing the 30-point category maximum.
    const max = Math.floor(30 * (i + 1) / game.claims.length) - Math.floor(30 * i / game.claims.length)
    return {finding,groups,relevant,missing,supported,correct,extra,points:Math.round(ratio * max),max}
  })
  const found = brief.steps.map(group => group.some(id => submission.found.includes(id)))
  const coverage = found.filter(Boolean).length / found.length
  const verification = claims.reduce((sum, claim) => sum + claim.points,0)
  const investigationMax = submission.advice === undefined ? 30 : 15
  const investigation = Math.round(investigationMax * coverage)
  const complete = claims.every(claim => claim.correct && claim.supported)
  const unsafe = submission.verdict === 'APPROVE' && game.verdict !== 'APPROVE' && index !== 5
  const enoughInformation = coverage === 1 && (submission.advice !== undefined ||
    claims.every(entry => entry.groups.every(group => group.some(id => submission.found.includes(id)))))
  const decision = submission.verdict === game.verdict ? (submission.advice === undefined || complete ? 40 : 30)
    : submission.verdict === 'VERIFY' ? (enoughInformation ? 12 : 24) : 0
  const advice = submission.advice === 0 ? 15 : 0
  const total = verification + investigation + decision + advice
  const grade = total >= 90 ? 'S' : total >= 80 ? 'A' : total >= 65 ? 'B' : total >= 50 ? 'C' : 'D'
  return {claims,found,verification,investigation,investigationMax,decision,advice,total,grade,unsafe}
}



