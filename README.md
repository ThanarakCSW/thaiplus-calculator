# ไทยช่วยไทย Plus (Thai Plus Calculator)

[![Deploy to GitHub Pages](https://github.com/ThanarakCSW/thaiplus-calculator/actions/workflows/deploy.yml/badge.svg)](https://github.com/ThanarakCSW/thaiplus-calculator/actions/workflows/deploy.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

เว็บแอปพลิเคชันสำหรับคำนวณสิทธิ์ **รัฐช่วยจ่าย 60% สูงสุด 200 บาทต่อวัน** คำนวณแบบเรียลไทม์ ปัดเศษแม่นยำระดับสตางค์ ออกแบบให้ใช้งานง่าย เหมาะสำหรับเปิดใช้งานบนสมาร์ตโฟนขณะซื้อของหน้าร้าน

🌐 **เข้าใช้งานออนไลน์ (GitHub Pages):**  
👉 [https://thanarakcsw.github.io/thaiplus-calculator/](https://thanarakcsw.github.io/thaiplus-calculator/)

---

## 📱 คุณสมบัติเด่น (Features)

- ⚡ **คำนวณแบบ Real-time:** แสดงผลทันทีที่กรอกยอดซื้อหรือปรับเปลี่ยนสิทธิ์คงเหลือ
- 🎯 **กล่องผลลัพธ์แยกสีชัดเจน:**
  - 🟦 **คุณจ่ายทั้งหมด:** ยอดสุทธิที่คุณต้องควักกระเป๋าจ่าย
  - 🟩 **รัฐช่วยจ่าย:** ส่วนลด 60% ที่รัฐออกให้จริง
  - 🟥 **จ่ายเพิ่มเพราะสิทธิ์ไม่พอ:** ยอดเงินที่เกินสิทธิ์รายวัน (รวมอยู่ในยอดที่คุณจ่ายแล้ว)
- 💡 **สิทธิ์นี้ซื้อของได้ถึง (Optimal Purchase Capacity):** คำนวณยอดซื้อสูงสุดที่คุ้มค่าที่สุด โดยไม่เกิดส่วนเกินที่ต้องจ่ายเพิ่ม พร้อมปุ่ม **"ใช้ยอดนี้"** เพื่อกรอกอัตโนมัติ
- 🇹🇭 **รองรับตัวเลขไทยและรูปแบบสากล:** กรอกได้ทั้งตัวเลขอารบิก (1, 2, 3), ตัวเลขไทย (๑, ๒, ๓), เครื่องหมายจุลภาคคั่นหลักพัน (เช่น `1,500`), และทศนิยมไม่เกิน 2 ตำแหน่ง
- 🛡️ **ระบบกรองข้อมูลอัจฉริยะ (Input Validation):** ป้องกันการพิมพ์หรือวางตัวอักษร เครื่องหมายลบ หรือรูปแบบวิทยาศาสตร์ (`1e3`) แจ้งเตือนข้อผิดพลาดทันทีโดยไม่ตัดทอนตัวเลขจนเสียความหมาย
- 💾 **จำข้อมูลอัตโนมัติด้วย LocalStorage:** 
  - บันทึกในเบราว์เซอร์เครื่องผู้ใช้ด้วยคีย์ `thai-plus:daily-draft:v1`
  - เปิดกลับมาในวันเดิมจะคืนค่าล่าสุดให้ทันที
  - **รีเซ็ตอัตโนมัติเมื่อขึ้นวันใหม่ (00:00 น. ตามเวลาประเทศไทย `Asia/Bangkok`):** คืนค่าสิทธิ์เป็น 200 บาท และล้างยอดซื้อ
  - ทำงานแบบ Client-side 100% ไม่ส่งข้อมูลเงินหรือธุรกรรมไปเก็บที่เซิร์ฟเวอร์
- 📱 **Mobile-First & Responsive:** มีแถบสรุปยอดติดขอบล่างหน้าจอ (Sticky Footer) เมื่อเลื่อนดูข้อมูลบนมือถือ

---

## 🧮 สูตรการคำนวณและการปัดเศษ

การคำนวณทั้งหมดคำนวณเป็น **จำนวนเต็มหน่วยสตางค์** เพื่อป้องกันปัญหา Floating-point:

1. **เงินรัฐตามสัดส่วน** = 60% ของยอดซื้อ ปัดเป็นสตางค์ใกล้ที่สุด (`round(ยอดซื้อ × 0.60)`)
2. **รัฐจ่ายจริง** = ค่าน้อยที่สุดระหว่าง:
   - เงินรัฐตามสัดส่วน
   - สิทธิ์คงเหลือวันนี้
   - 200 บาท (เพดานสูงสุดต่อวัน)
3. **คุณจ่ายทั้งหมด** = ยอดซื้อ − รัฐจ่ายจริง
4. **จ่ายเพิ่มเพราะสิทธิ์ไม่พอ** = เงินรัฐตามสัดส่วน − รัฐจ่ายจริง
5. **สิทธิ์ที่จะเหลือหลังซื้อ** = สิทธิ์วันนี้ − รัฐจ่ายจริง (เป็นการจำลองยอด)
6. **ยอดซื้อสูงสุดที่ไม่เกินสิทธิ์** = สำหรับสิทธิ์คงเหลือ $A$ สตางค์ คำนวณจากสูตร:  
   $$\text{ยอดซื้อสูงสุด} = \left\lfloor \frac{5A + 2}{3} \right\rfloor \text{สตางค์}$$
   - ตัวอย่าง: หากมีสิทธิ์ 200 บาท ยอดซื้อสูงสุดคือ **333.34 บาท** (รัฐช่วย 200.00 บาท ผู้ใช้จ่าย 133.34 บาท หากซื้อ 333.35 บาท จะมีส่วนเกินจ่ายเพิ่ม 0.01 บาท)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Testing:** Node.js Native Test Runner (`node:test`)
- **CI/CD & Hosting:** GitHub Actions & GitHub Pages

---

## 🚀 การติดตั้งและรันในเครื่อง (Local Development)

### 1. โคลนคลังโค้ด
```bash
git clone git@github.com:ThanarakCSW/thaiplus-calculator.git
cd thaiplus-calculator
```

### 2. ติดตั้ง Dependencies
*(ต้องใช้ Node.js >= 22.13.0)*
```bash
npm install
```

### 3. รัน Development Server
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:5173](http://localhost:5173) หรือ [http://localhost:3000](http://localhost:3000)

### 4. รันชุดทดสอบ (Unit Tests)
```bash
npm test
```

### 5. Build สำหรับ Production
```bash
# Build โครงการ
npm run build

# หรือทดสอบ Build Static Export สำหรับ GitHub Pages
npm run build:pages
```

---

## 🌐 การ Deploy ขึ้น GitHub Pages

โปรเจกต์นี้ตั้งค่า GitHub Actions Workflow ไว้ที่ [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) ซึ่งจะทำงานโดยอัตโนมัติทุกครั้งที่มีการ `push` ขึ้น branch `main`

### วิธีเปิดใช้งานบน GitHub:
1. เข้าไปที่คลังโค้ดบน GitHub: [ThanarakCSW/thaiplus-calculator](https://github.com/ThanarakCSW/thaiplus-calculator)
2. ไปที่แท็บ **Settings** > เมนูด้านซ้ายเลือก **Pages**
3. ในหัวข้อ **Build and deployment**:
   - ที่ช่อง **Source** ให้เลือกเป็น **GitHub Actions**
4. เมื่อ push โค้ดขึ้น branch `main` ระบบจะทดสอบและ deploy ให้โดยอัตโนมัติ
5. เว็บไซต์จะพร้อมใช้งานที่:
   ```
   https://thanarakcsw.github.io/thaiplus-calculator/
   ```

---

## ⚠️ ข้อจำกัดความรับผิดชอบ (Disclaimer)

เว็บไซต์นี้จัดทำขึ้นเพื่ออำนวยความสะดวกในการจำลองและคำนวณยอดเงินเบื้องต้นเท่านั้น ไม่ใช่เว็บไซต์หรือแอปพลิเคชันทางการของโครงการรัฐบาล ข้อมูลทั้งหมดถูกจัดเก็บและประมวลผลอยู่บนอุปกรณ์ของผู้ใช้เท่านั้น
