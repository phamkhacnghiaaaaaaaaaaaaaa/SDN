# Định hướng sản phẩm — Thư viện thuê sách có phí (Pay-per-borrow)

> Tài liệu định hướng cho hệ thống Library SDN302. Mục tiêu: gỡ mâu thuẫn giữa
> mô hình "cho thuê" / "bán" / "thư viện số" đang lẫn lộn trong schema hiện tại,
> và chốt một mô hình nghiệp vụ mạch lạc để phát triển tiếp.

---

## 1. Tầm nhìn (1 câu)

**Một nền tảng cho thuê sách (vật lý + đọc số) tính phí theo mỗi lượt mượn:**
người dùng chọn sách vào *giỏ mượn*, trả **phí thuê theo kỳ hạn** (mặc định 14
ngày), đọc/nhận sách, và trả lại đúng hạn — trễ hạn phát sinh **phí phạt**.

Đây là hướng thay đổi **ít nhất** so với code hiện có: toàn bộ luồng đơn thuê,
tồn kho, và "doanh thu" trên dashboard đều trở nên **có ý nghĩa** thay vì mơ hồ.

---

## 2. Gán lại ý nghĩa cho những gì đang mâu thuẫn

| Thành phần hiện tại | Trước đây (mơ hồ) | Sau khi chốt hướng A |
| :--- | :--- | :--- |
| `book.price` | Giá bán? Giá thuê? | **Phí thuê cho một kỳ hạn** (VND / 14 ngày) |
| `CartContext` + *Add to Cart* | Giỏ mua hàng | **Giỏ mượn** — gom nhiều sách vào 1 đơn thuê |
| `rental.due_date` / `return_date` | Đã đúng | Giữ nguyên — hạn trả = ngày thuê + kỳ hạn |
| `book.pdf_url` | Bán ebook? | **Đã loại bỏ** — không còn đọc online (chỉ cho thuê sách) |
| `reading_progress` | — | **Đã loại bỏ khỏi UI** — bỏ tab "Reading Progress" |
| `user.rental_available: 20` | — | **Hạn mức** số sách được mượn đồng thời |
| Dashboard "doanh thu" | Không rõ tính từ đâu | **Tổng phí thuê đã thu + phí trễ hạn** |

Nguyên tắc: **không đổi tên `price` vội** (tránh sửa hàng loạt ở
`book.controller`, `dashboard.controller`, form tạo sách). Chỉ *tài liệu hóa*
ý nghĩa mới và bổ sung vài trường phụ trợ.

---

## 3. Mô hình nghiệp vụ

### 3.1. Khái niệm cốt lõi
- **Kỳ hạn thuê (rental period):** mặc định **14 ngày**. Cấu hình toàn cục
  (hoặc theo sách nếu cần).
- **Phí thuê (rental fee):** `book.price` × số lượng, tính cho **một kỳ**.
- **Phí trễ hạn (late fee):** `late_fee_per_day` × số ngày trễ × số lượng,
  tính khi trả sách sau `due_date`.
- **Đặt cọc (deposit) — tùy chọn:** khoản giữ chân cho sách vật lý, hoàn khi
  trả nguyên vẹn. *Đề xuất: chưa làm ở MVP.*
- **Thanh toán:** MVP làm **thu tại quầy / xác nhận thủ công** (`payment_status`),
  chưa tích hợp cổng thanh toán online.

### 3.2. Vòng đời đơn thuê (cập nhật state machine)

```
                 (đặt mượn)          (staff duyệt +          (giao / nhận sách)
   [ Khách ] ───────────────► pending ─── thu phí thuê) ───► accepted ──────────► borrowed
                                 │            trừ kho             │                    │
                                 │                                │                    │ (trả sách)
                                 ▼                                ▼                    ▼
                             cancelled                        cancelled            returned
                          (hoàn kho nếu đã trừ)            (hoàn kho + hoàn phí)   (+ tính phí trễ,
                                                                                    hoàn kho)
```

Bảng chuyển trạng thái (giữ đúng `validTransitions` hiện có, chỉ thêm ý nghĩa tiền):

| Từ → Đến | Điều kiện | Tác động kho | Tác động tiền |
| :--- | :--- | :--- | :--- |
| `pending → accepted` | Đủ tồn kho | `-quantity` | Ghi nhận **phí thuê** phải thu (`payment_status = paid` khi đã thu) |
| `accepted → borrowed` | Đã thu phí | — | — |
| `borrowed → returned` | — | `+quantity` | Tính **phí trễ** nếu `now > due_date` |
| `* → cancelled` | pending/accepted | Hoàn kho nếu đã trừ | Hoàn phí nếu đã thu |

> **Thời điểm thu phí:** tại bước `accepted` (khi staff duyệt / khách thanh toán).
> **Thời điểm chốt phí trễ:** tại bước `returned`.

---

## 4. Thay đổi schema đề xuất

Chia làm 2 mức — làm MVP trước, mở rộng sau.

### 4.1. `Book` (`be/src/model/book.model.js`)
```js
price: { type: Number, default: 0 },              // ĐỔI NGHĨA: phí thuê / kỳ (VND)
rental_period_days: { type: Number, default: 14 },// MỚI: kỳ hạn cho sách này
late_fee_per_day:  { type: Number, default: 5000 },// MỚI: phí trễ / ngày / bản
```
> Nếu muốn đơn giản: bỏ 2 trường mới, dùng **hằng số cấu hình chung** cho cả hệ
> thống (`RENTAL_PERIOD_DAYS`, `LATE_FEE_PER_DAY`) đặt trong `be/config`.

### 4.2. `Rental` (`be/src/model/rental.model.js`)
```js
// MỚI — "đóng băng" giá tại thời điểm thuê để báo cáo doanh thu chính xác
fee:            { type: Number, default: 0 },   // tổng phí thuê của đơn
late_fee:       { type: Number, default: 0 },   // phí trễ khi trả
deposit:        { type: Number, default: 0 },   // (tùy chọn) tiền cọc
payment_status: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
paid_at:        { type: Date },
```
Mỗi `items[]` nên lưu thêm `unit_fee` (phí thuê 1 bản tại thời điểm thuê) để
lịch sử không đổi khi admin sửa giá sách sau này.

### 4.3. `User` — giữ nguyên
`rental_available` đã đóng vai trò hạn mức mượn đồng thời.

---

## 5. Ảnh hưởng tới từng màn hình

| Màn hình / File | Thay đổi cần làm |
| :--- | :--- |
| **Chi tiết sách** `fe/src/page/BookDetail.jsx` | Hiển thị "**Phí thuê: X VND / 14 ngày**"; đổi nút *Add to Cart* → **"Thêm vào giỏ mượn"**; thêm nút **"Thuê ngay"** |
| **Card sách** `fe/src/components/CarouselBooks.jsx` | Nhãn nút mua → "Thêm vào giỏ mượn"; hiển thị phí thuê thay vì giá |
| **Giỏ hàng** `fe/src/page/Cart.jsx` + `CartContext` | Đổi tên hiển thị → **Giỏ mượn**; tính **phí thuê tạm tính**, kỳ hạn, tổng; nút **"Đặt thuê"** thay checkout |
| **Lịch sử thuê** `fe/src/components/profile/RentalHistory.jsx` | Cột phí thuê, phí trễ, hạn trả, trạng thái thanh toán |
| **Staff — Quản lý đơn** `fe/src/page/staff/ManageRentals.jsx` | Hiện phí; nút **"Thu phí"** khi duyệt; tự tính **phí trễ** khi bấm Return |
| **Staff — Tạo đơn** `fe/src/page/staff/CreateRental.jsx` | Hiện tổng phí thuê dự kiến |
| **Admin Dashboard** `fe/src/page/admin/AdminDashboard.jsx` | "Doanh thu" = phí thuê đã thu; thêm ô **"Phí trễ hạn thu được"** |

### Backend
| File | Thay đổi |
| :--- | :--- |
| `be/src/controller/rental.staff.controller.js` | Khi `accepted`: tính & lưu `fee`, set `payment_status`. Khi `returned`: tính `late_fee` theo `due_date`. |
| `be/src/controller/rental.controller.js` (đơn từ khách) | Tính `fee` tạm tính lúc tạo `pending`; set `due_date = rent_date + period` |
| `be/src/controller/dashboard.controller.js` | `estimatedRevenue` đổi thành `SUM(rental.fee where payment_status=paid) + SUM(late_fee)` thay cho aggregate giá sách hiện tại |

---

## 6. Doanh thu & báo cáo (Dashboard)

Sau khi có `rental.fee` + `rental.late_fee`, dashboard admin phản ánh **tiền thật**:
- **Doanh thu phí thuê** = tổng `fee` các đơn `payment_status = 'paid'`.
- **Phí trễ hạn** = tổng `late_fee` các đơn `returned`.
- **Đơn quá hạn** (đã có) → gắn thêm **ước tính phí phạt đang tích lũy**.
- Biểu đồ doanh thu 6 tháng (mở rộng từ biểu đồ số đơn hiện có).

---

## 7. Lộ trình triển khai

**Phase 1 — MVP (khớp định hướng, đủ để demo):**
1. Thêm hằng số kỳ hạn + phí trễ (config chung), tài liệu hóa `price = phí thuê/kỳ`.
2. Thêm `fee`, `late_fee`, `payment_status` vào `Rental`; tính `fee` khi tạo/duyệt đơn.
3. Đổi nhãn UI: giỏ hàng → **giỏ mượn**, nút "Thuê", hiển thị phí thuê + hạn trả.
4. Dashboard doanh thu tính từ `fee`.

**Phase 2 — Hoàn thiện:**
5. Tính phí trễ tự động khi trả; badge cảnh báo đơn quá hạn.
6. Trang cấu hình kỳ hạn/phí (Admin).
7. Đọc PDF online có kiểm soát theo trạng thái thuê + `reading_progress`.

**Phase 3 — Nâng cao (tùy chọn):**
8. Đặt cọc & hoàn cọc.
9. Thanh toán online (VNPay/Momo…), hóa đơn.
10. Gia hạn thuê (extend), nhắc hạn qua email (đã có `utils/email.js`).

---

## 8. Các quyết định cần chốt tiếp

- [ ] Kỳ hạn thuê cố định 14 ngày hay cho phép chọn (7/14/30)?
- [ ] Phí trễ hạn: mức mặc định bao nhiêu VND/ngày/bản?
- [ ] Có thu **đặt cọc** cho sách vật lý không? (đề xuất: chưa, để Phase 3)
- [ ] Thanh toán: **tại quầy/thủ công** (MVP) hay **online ngay** từ đầu?
- [ ] Cho phép **gia hạn** đơn đang mượn không?

---

*Cập nhật: 2026-07-21 — Định hướng đã chốt: **A. Thuê sách có phí**.*

---

## 9. Trạng thái triển khai (Phase 1 — ĐÃ LÀM)

> Bỏ hoàn toàn phần **ebook** (đọc online, tab tiến độ đọc, ô nhập link PDF).

**Backend**
- `be/src/config/rental.config.js` *(mới)*: `RENTAL_PERIOD_DAYS = 14`, `LATE_FEE_PER_DAY = 5000`.
- `Rental` model: thêm `items[].unit_fee`, `fee`, `late_fee`, `payment_status`, `paid_at`.
- `rental.controller` / `rental.staff.controller`: tính & đóng băng phí thuê khi tạo đơn; **thu phí** khi `accepted` (payment=paid), **tính phí trễ** khi `returned`, **hoàn phí** khi hủy đơn đã duyệt; kỳ hạn = config.
- `dashboard.controller`: doanh thu = phí thuê (đơn accepted/borrowed/returned) + phí trễ hạn.

**Frontend**
- `config/constants.js` *(mới)*: `RENTAL_PERIOD_DAYS`, `formatVND`.
- Hiển thị **phí thuê** ở: card sách, chi tiết sách, giỏ (tổng phí + kỳ hạn 14 ngày), lịch sử thuê (phí + phí trễ + trạng thái thanh toán), tạo đơn (staff), quản lý đơn (staff), dashboard admin.
- **Gỡ ebook**: xóa nút "Read Online", tab "Reading Progress" + component/service liên quan, ô nhập `pdf_url` trong form sách; đổi nhãn "Price" → "Rental Fee (₫ / 14 days)".

---

## 10. Trạng thái triển khai (Phase 2 — ĐÃ LÀM)

> Không làm nhắc hạn qua email và không làm thanh toán online (theo yêu cầu).

**Cấu hình hệ thống (DB-backed)**
- `Setting` model (singleton) + `GET /settings` (công khai) + `PATCH /settings` (Admin).
- Kỳ hạn thuê & phí trễ hạn giờ lấy từ DB; logic tạo đơn / trả sách / gia hạn dùng giá trị này.
- FE: `SettingsContext` nạp `/settings` khi khởi động; trang **Admin → Cấu hình hệ thống** (`/admin/settings`) cho phép sửa và áp dụng ngay (card sách, chi tiết, giỏ, lịch sử đều đọc kỳ hạn từ context).

**Cảnh báo quá hạn**
- Staff/Admin (Quản lý đơn): hiển thị ngày đến hạn, badge **"Overdue N day(s)"**, số lần đã gia hạn.
- Khách (Lịch sử thuê): badge quá hạn + **ước tính phí trễ đang tích lũy**.

**Gia hạn đơn**
- `PATCH /rentals/staff/:id/extend` (Staff/Admin): cộng 1 kỳ hạn vào `due_date` (tính từ hôm nay nếu đã quá hạn) + thu thêm 1 kỳ phí thuê, tăng `extensions`.
- FE: nút gia hạn trên đơn `accepted`/`borrowed` trong trang Quản lý đơn.

**Còn lại (tùy chọn tương lai):** đặt cọc/hoàn cọc, thanh toán online, nhắc hạn qua email.
