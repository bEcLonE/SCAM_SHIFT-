# SCAM SHIFT v0.2.3

Trò chơi điều tra an toàn số bằng tiếng Việt. Chapter 01 gồm năm hồ sơ, một vụ luyện tập riêng và báo cáo nghiệp vụ sau mỗi quyết định. Nội dung và ứng dụng trong game đều dùng dữ liệu hư cấu.

## Chạy trên Windows

Trong PowerShell tại thư mục dự án, chạy:

```powershell
.\Chay-game.cmd
```

Trong CMD, chạy `Chay-game.cmd`. Có thể mở file này từ File Explorer. Mở địa chỉ ở dòng `Local:`, mặc định là http://127.0.0.1:5173/. Giữ cửa sổ lệnh mở khi chơi và nhấn Ctrl+C để dừng. File dùng Node trên PATH hoặc Node đi kèm môi trường Codex trên máy này. Bản chạy cần thư mục `dist` và các gói dự án đã cài.

Nếu mới tải mã nguồn hoặc cần tạo lại bản build, dùng Node.js 22.13+ và pnpm:

```powershell
pnpm install
pnpm run build
.\Chay-game.cmd
```

Để sửa và xem thay đổi trực tiếp, chạy `pnpm dev`.

## Chơi và tính điểm

Chọn **Hướng dẫn** để thực hành trọn một lượt với hồ sơ thư viện, hoặc chọn **Bắt đầu** để vào ca trực. Mỗi tài liệu đã đọc sẽ xuất hiện trong sổ tay. Đánh giá từng lời khai, chọn một hoặc nhiều tài liệu, nhận định được ghi tự động, sau đó chọn quyết định. Kết luận với dữ liệu còn thiếu cần một lần xác nhận trước khi nộp.

Mỗi hồ sơ chính thức tối đa 100 điểm. Quyết định chiếm 40 điểm, kiểm chứng 30 và quy trình điều tra 30. Hướng dẫn người dân nằm cuối báo cáo sau khi chấm. Các báo cáo đã nộp từ v0.2 giữ thang điểm gốc. Sổ tay và nhật ký nguồn tính theo tài liệu duy nhất. Báo cáo đánh dấu riêng các phê duyệt nguy hiểm. Hồ sơ luyện tập có báo cáo mẫu và nằm ngoài tổng 500 điểm.

## Tiến trình và tương thích

`scam-shift.v2` lưu nhận định và căn cứ, nguồn đã đọc, lựa chọn xử lý và báo cáo. Bản đầu tiên được đọc tự động từ `scam-shift.v1` nếu cùng nguồn gốc trình duyệt. Bản lưu cũ được giữ lại. Báo cáo cũ được quy đổi sang thang mới từ căn cứ và quyết định còn lưu, vì vậy điểm có thể thay đổi. Hướng dẫn an toàn và lịch sử nguồn trước đây chỉ có dữ liệu một phần.

Dùng cùng trình duyệt và địa chỉ để tiếp tục. `localhost`, `127.0.0.1`, cổng khác nhau và bản Sites có vùng lưu riêng. Khi tải lại, **Tiếp tục** khôi phục hồ sơ ở sổ tay. Màn hình đang mở trong từng ứng dụng có trạng thái riêng trong phiên chơi.

## Mã nguồn

- `main.tsx` quản lý ca trực, luyện tập và lưu tiến trình.
- `investigation.tsx` chứa sổ tay và báo cáo sau xử lý.
- `scoring.ts` chấm điểm và mô tả tiêu chí của từng vụ.
- `simulators.tsx` chứa các ứng dụng ngoại tuyến.
- `cases.ts` chứa hồ sơ, tài liệu và lời khai.
- `style.css` chứa giao diện menu, bàn trực và ứng dụng.

Bản Sites đang sử dụng vẫn là v0.1. Bản v0.2.3 nằm trong workspace. Bản sao mã nguồn và build v0.1 được giữ tại `.site-publish/v0.1`.



