export type Status = 'UNASSESSED' | 'CONFIRMED' | 'REFUTED' | 'INCONCLUSIVE'
export type Verdict = 'APPROVE' | 'VERIFY' | 'DENY'
export type Tool = 'phone' | 'portal' | 'directory' | 'transaction' | 'email' | 'browser' | 'call' | 'shopping'
export type Evidence = { id: string; title: string; text: string }
type Claim = { text: string; status: Status; sources: string[] }
export type Case = {
  title: string; topic: string; level: number; name: string; age: number; job: string; time: string
  report: string; request: string; questions: [string, string][]; tools: Tool[]
  evidence: Record<string, Evidence>; claims: Claim[]; verdict: Verdict; lesson: string
}
const evidence = (id: string, title: string, text: string): Evidence => ({ id, title, text })
const claim = (text: string, status: Status, ...sources: string[]): Claim => ({ text, status, sources })
export const shiftDate = '25/11/2026'

export const cases: Case[] = [
  {
    title: 'TUITION TRAP', topic: 'Thông báo đóng học phí', level: 1, name: 'Nguyễn Mai Anh', age: 20, job: 'Sinh viên', time: '08:14',
    report: 'Em nhận được tin nhắn tự xưng là phòng tài chính Đại học Hải Đăng. Họ biết tên và mã sinh viên của em.',
    request: 'Em có nên chuyển tiền theo hướng dẫn trong tin nhắn không?',
    questions: [['Em đã chuyển khoản chưa?', 'Chưa ạ. Em có lưu thông tin người nhận để kiểm tra.'], ['Tin nhắn đến từ đâu?', 'Từ số lạ. Họ gửi kèm một phiếu thu dạng ảnh.']],
    tools: ['phone','portal','directory','transaction'],
    evidence: {
      message: evidence('message','Tin nhắn từ 0900 000 102','Mai Anh, SV HD24061. Học phí kỳ này 4.800.000 ₫. Hạn chót hôm nay. Chuyển ngay cho Trần Minh T. theo phiếu đính kèm.'),
      attachment: evidence('attachment','Phiếu thu đính kèm','PHIẾU TẠM THU · HD24061\nNgười thụ hưởng: Trần Minh T.\nSố tiền: 4.800.000 ₫'),
      profile: evidence('profile','Hồ sơ sinh viên','Nguyễn Mai Anh · HD24061 · Khoa Truyền thông.'),
      tuition: evidence('tuition','Sổ học phí kỳ 1','Còn phải nộp: 4.800.000 ₫. Hạn: 15/12/2026. Thanh toán qua cổng sinh viên hoặc tài khoản mang tên Đại học Hải Đăng.'),
      directory: evidence('directory','Phòng Tài chính Hải Đăng','Đầu mối chính thức: tc@haidang.example. Số 0900 000 102 không thuộc phòng. Nhà trường không thu học phí qua tài khoản cá nhân.'),
      transfer: evidence('transfer','Bản nháp chuyển khoản','4.800.000 ₫ · Trần Minh T. · HD24061 HOC PHI · Chưa thực hiện.')
    },
    claims: [claim('Người gửi là Phòng Tài chính Đại học Hải Đăng.','REFUTED','directory'),claim('Khoản học phí là 4.800.000 ₫.','CONFIRMED','tuition'),claim('Hôm nay, 25/11, là hạn cuối.','REFUTED','tuition'),claim('Tài khoản cá nhân trong tin nhắn được trường chấp nhận.','REFUTED','directory','tuition')],
    verdict: 'DENY', lesson: 'Số tiền và mã sinh viên trùng khớp vẫn có thể xuất hiện trong yêu cầu giả mạo. Hãy thanh toán qua cổng trường.'
  },
  {
    title: 'INBOX IMPOSTOR', topic: 'Email khóa tài khoản', level: 2, name: 'Phạm Quốc Huy', age: 32, job: 'Kiến trúc sư', time: '09:06',
    report: 'Email tự xưng là Cloud báo tài khoản sẽ bị khóa nếu tôi không đăng nhập lại.',
    request: 'Tôi có nên dùng nút đăng nhập trong email để giữ tài khoản không?',
    questions: [['Anh có nhận cảnh báo trong ứng dụng không?', 'Không thấy. Tôi chỉ nhận được email này.']],
    tools: ['email','browser','directory'],
    evidence: {
      mail: evidence('mail','Yêu cầu xác nhận tài khoản','Tài khoản của bạn sẽ bị khóa lúc 18:00. Hãy xác nhận đăng nhập để tiếp tục sử dụng Cloud.'),
      headers: evidence('headers','Thông tin người gửi','Từ: thongbao@may-account.example · Reply-To: hotro@may-verify.example · 25/11/2026 08:57.'),
      attachment: evidence('attachment','Thông báo đính kèm','Thông báo số ML-1125. Văn bản yêu cầu xác nhận đăng nhập qua nút trong thư.'),
      link: evidence('link','Đích của nút trong thư','https://may-verify.example/xac-nhan · Bản xem trước nội bộ.'),
      policy: evidence('policy','Trung tâm trợ giúp Cloud','Tên miền của dịch vụ là luutrumay.example. Cảnh báo bảo mật nằm trong mục Hoạt động bảo mật. Dịch vụ không gửi nút xác nhận qua tên miền khác.'),
      activity: evidence('activity','Hoạt động bảo mật','Tài khoản của Huy không có yêu cầu xác nhận hay lịch khóa trong ngày 25/11.'),
      directory: evidence('directory','Hỗ trợ Cloud','Hỗ trợ chính thức: hotro@luutrumay.example.')
    },
    claims: [claim('Nút trong thư dẫn đến tên miền chính thức.','REFUTED','link','policy'),claim('Tài khoản có lịch khóa lúc 18:00.','REFUTED','activity'),claim('Có thể xác định danh tính cá nhân đứng sau email.','INCONCLUSIVE','headers')],
    verdict: 'DENY', lesson: 'Mở dịch vụ từ địa chỉ bạn đã biết và kiểm tra cảnh báo ngay trong tài khoản.'
  },
  {
    title: 'THE LAST MILE', topic: 'Xác nhận giao hàng', level: 2, name: 'Lê Thu Hà', age: 41, job: 'Chủ tiệm hoa', time: '10:22',
    report: 'Tôi đặt giấy gói hoa. Ứng dụng báo tài xế muốn xác nhận giờ giao vì cửa hàng mở muộn.',
    request: 'Tôi có thể xác nhận khung giờ giao qua ứng dụng không?',
    questions: [['Họ yêu cầu thông tin gì?', 'Chỉ hỏi tôi nhận hàng vào lúc nào.'], ['Chị đã thanh toán chưa?', 'Tôi đã thanh toán trong ứng dụng khi đặt.']],
    tools: ['shopping','phone','directory'],
    evidence: {
      message: evidence('message','Hội thoại giao hàng','Chào chị Hà, đơn HC-581 đang đi giao. Chị chọn 14:00–16:00 trong Chi tiết đơn hàng nếu buổi sáng chưa mở cửa nhé.'),
      order: evidence('order','Đơn HC-581','Giấy gói hoa · 186.000 ₫ · Đã thanh toán · Giao bởi Hạc Chuyển.'),
      tracking: evidence('tracking','Vận đơn HAC-781581','09:42 · Rời bưu cục. 10:16 · Đang giao. Khung giờ có thể đổi trong Chi tiết đơn hàng.'),
      support: evidence('support','Trung tâm hỗ trợ giao hàng','Cho phép đổi khung giờ trong ứng dụng. Không thu thêm phí với đơn HC-581.'),
      directory: evidence('directory','Điều phối Hạc Chuyển','Đầu mối chính thức xác nhận đơn HC-581 đang trên tuyến giao của đội nội thành.')
    },
    claims: [claim('Đơn HC-581 đã thanh toán.','CONFIRMED','order'),claim('Kiện hàng đang đi giao.','CONFIRMED','tracking','directory'),claim('Có thể đổi giờ giao trong ứng dụng.','CONFIRMED','tracking','support')],
    verdict: 'APPROVE', lesson: 'Yêu cầu đổi giờ có thể xử lý trong ứng dụng khi vận đơn và quy trình hỗ trợ khớp.'
  },
  {
    title: 'A FAMILIAR VOICE', topic: 'Cuộc gọi mượn tiền', level: 3, name: 'Vũ Đức Long', age: 57, job: 'Kỹ thuật viên', time: '13:31',
    report: 'Một số mới gọi, giọng giống con trai tôi. Người gọi muốn mượn tiền và bảo điện thoại cũ hết pin.',
    request: 'Tôi có nên chuyển 3.000.000 ₫ vào tài khoản người gọi cung cấp không?',
    questions: [['Anh đã thử số cũ chưa?', 'Tôi gọi rồi, hiện chưa ai nghe.'], ['Người nhận là ai?', 'Họ bảo đó là tài khoản của bạn đi cùng.']],
    tools: ['phone','call','transaction'],
    evidence: {
      message: evidence('message','Tin nhắn sau cuộc gọi','Bố chuyển 3 triệu vào tài khoản Bùi A. giúp con. Điện thoại con hết pin, con mượn số này.'),
      calls: evidence('calls','Lịch sử cuộc gọi','13:19 · Số lạ 0900 000 208 · 00:47. 13:25 · Số đã lưu của Nam · Không trả lời.'),
      identity: evidence('identity','Phụ đề về danh tính','Người gọi: Con đây bố. Con đang mượn máy. Hỏi về cuộc hẹn hôm qua: Con sẽ kể sau khi về.'),
      followup: evidence('followup','Phụ đề về phương án xác minh','Người gọi: Bạn con đứng tên tài khoản. Con có thể chờ bố gọi lại khi con sạc được máy.'),
      transfer: evidence('transfer','Thông tin người thụ hưởng','3.000.000 ₫ · Bùi A. · HỖ TRỢ · Chưa thực hiện.'),
      history: evidence('history','Giao dịch đã lưu','Lần gửi gần nhất cho con trai có người thụ hưởng là Vũ Hoài Nam.')
    },
    claims: [claim('Người gọi là Vũ Hoài Nam.','INCONCLUSIVE','identity','calls'),claim('Tài khoản yêu cầu nhận tiền đứng tên Vũ Hoài Nam.','REFUTED','transfer'),claim('Người gọi đồng ý chờ gọi lại.','CONFIRMED','followup')],
    verdict: 'VERIFY', lesson: 'Tạm dừng giao dịch và gọi lại qua số đã lưu hoặc liên hệ một người thân để xác minh.'
  },
  {
    title: 'REFUND DETOUR', topic: 'Hoàn tiền đơn hàng', level: 3, name: 'Đỗ Minh Châu', age: 27, job: 'Biên tập viên', time: '15:48',
    report: 'Đơn tai nghe của tôi bị hủy. Một email biết đúng mã đơn và yêu cầu chuyển phí để mở lệnh hoàn tiền.',
    request: 'Tôi có nên trả phí theo hướng dẫn trong email không?',
    questions: [['Ứng dụng báo gì?', 'Đơn đã hủy. Tôi chưa mở phần thanh toán.'], ['Chị đã trả phí chưa?', 'Chưa. Tôi chỉ chép thông tin vào bản nháp.']],
    tools: ['email','browser','shopping','transaction'],
    evidence: {
      mail: evidence('mail','Yêu cầu phí mở lệnh hoàn tiền','Đơn MN-092 bị hủy. Để nhận 749.000 ₫, hãy nộp phí xử lý 89.000 ₫ qua thông tin trong thư.'),
      headers: evidence('headers','Thông tin người gửi','Từ: hoantien@monau-dichvu.example · Reply-To: nhanphi@monau-dichvu.example · 25/11/2026 15:42.'),
      link: evidence('link','Đích liên kết hoàn tiền','https://monau-dichvu.example/hoan-tien · Bản xem trước nội bộ.'),
      attachment: evidence('attachment','Phiếu phí đính kèm','MN-092 · Phí mở lệnh 89.000 ₫ · Người nhận B. Quang.'),
      policy: evidence('policy','Quy chế hoàn tiền Mỏ Nâu','Đơn hủy được hoàn về phương thức thanh toán ban đầu. Mỏ Nâu không yêu cầu phí mở lệnh.'),
      activity: evidence('activity','Thông báo dịch vụ Mỏ Nâu','Các lệnh hoàn dự kiến được xử lý trong 3–5 ngày làm việc.'),
      order: evidence('order','Đơn MN-092','Tai nghe · 749.000 ₫ · Đã hủy do hết hàng.'),
      tracking: evidence('tracking','Tiến trình đơn MN-092','14:58 · Người bán hủy trước khi bàn giao. Chưa tạo vận đơn.'),
      support: evidence('support','Chi tiết thanh toán MN-092','Đã khởi tạo hoàn 749.000 ₫ về thẻ ban đầu. Phí hoàn 0 ₫.'),
      transfer: evidence('transfer','Bản nháp trả phí','89.000 ₫ · B. Quang · MN092 PHI HOAN · Chưa thực hiện.')
    },
    claims: [claim('Đơn MN-092 đã bị hủy.','CONFIRMED','order','tracking'),claim('Cần chuyển 89.000 ₫ để mở lệnh hoàn.','REFUTED','policy','support'),claim('Lệnh hoàn 749.000 ₫ đã được khởi tạo.','CONFIRMED','support')],
    verdict: 'DENY', lesson: 'Kiểm tra lệnh hoàn trong chi tiết thanh toán của đơn hàng và bỏ qua yêu cầu chuyển phí bên ngoài.'
  }
]

export const practice: Case = {
  title:'LIBRARY NOTICE', topic:'Lịch nhận sách đặt trước', level:1, name:'Trịnh An', age:24, job:'Nhân viên văn phòng', time:'07:50',
  report:'Tôi có sách đặt trước. Tin nhắn bảo thư viện mở cửa lúc 08:00, nhưng tôi nhớ giờ mở cửa đã đổi.',
  request:'Tôi có nên đến nhận sách lúc 08:00 không?',
  questions:[['Bạn đã kiểm tra lịch hôm nay chưa?', 'Tôi chưa xem lịch công bố của thư viện.']],
  tools:['phone','directory'],
  evidence:{
    message:evidence('message','Tin nhắn về lịch mở cửa','Thư viện Sông Xanh mở cửa lúc 08:00 hôm nay.'),
    directory:evidence('directory','Quầy Bạn đọc Sông Xanh','Lịch công bố hôm nay: mở cửa từ 09:00. Quầy nhận sách hoạt động từ giờ mở cửa.')
  },
  claims:[claim('Thư viện mở cửa lúc 08:00 hôm nay.','REFUTED','directory')],
  verdict:'DENY', lesson:'Đối chiếu lịch trong tin nhắn với giờ công bố của địa điểm trước khi đi.'
}


