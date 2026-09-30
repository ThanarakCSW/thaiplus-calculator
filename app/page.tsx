"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Check, ChevronDown, CircleHelp, Clock3, HeartHandshake, Info, Plus, ReceiptText, RotateCcw, ShieldCheck, Smartphone, TriangleAlert, Wallet, X } from "lucide-react";
import { calculate, formatMoney, isMoneyInputText, maximumPurchaseForBalance, parseDailyBalance, parseMoney } from "../lib/calculator";
import { useCalculatorTool } from "../lib/use-calculator-tool";
import { useDailyDraft } from "../lib/use-daily-draft";

function Amount({ value, testId, className = "" }: { value: number | null; testId?: string; className?: string }) {
  const text = value === null ? "—" : formatMoney(value);
  return <span key={text} data-testid={testId} className={`amount ${text.length > 10 ? "amount-long" : ""} ${className}`}>{text}</span>;
}

export default function Home() {
  const { balance, purchase, ready, newDay, setBalance, setPurchase, clearData } = useDailyDraft();
  useCalculatorTool(setBalance, setPurchase);
  const purchaseRef = useRef<HTMLInputElement>(null);
  const parsedBalance = parseDailyBalance(balance);
  const parsedPurchase = parseMoney(purchase, true);
  const capacity = ready && parsedBalance.value !== null ? maximumPurchaseForBalance(parsedBalance.value) : null;
  const capacityPayment = capacity && parsedBalance.value !== null ? calculate(capacity, parsedBalance.value).user : 0;
  const [inputNotice, setInputNotice] = useState({ balance: "", purchase: "" });
  const result = ready && parsedBalance.value !== null && parsedPurchase.value !== null ? calculate(parsedPurchase.value, parsedBalance.value) : null;
  const shortage = !!result && result.extra > 0;
  const inputError = parsedBalance.error || parsedPurchase.error;
  const [announcement, setAnnouncement] = useState("");
  const [cleared, setCleared] = useState(false);
  const message = inputNotice.balance || inputNotice.purchase || (result ? `คุณจ่ายทั้งหมด ${formatMoney(result.user)} บาท รัฐช่วย ${formatMoney(result.government)} บาท${shortage ? ` รวมเงินที่ต้องจ่ายเพิ่ม ${formatMoney(result.extra)} บาทแล้ว` : ""}` : inputError || "กรอกข้อมูลเพื่อคำนวณ");

  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(message), 350);
    return () => clearTimeout(timer);
  }, [message]);

  function editMoney(field: "balance" | "purchase", value: string) {
    if (!isMoneyInputText(value)) {
      setInputNotice(previous => ({ ...previous, [field]: "ใส่ได้เฉพาะตัวเลข เช่น 100 หรือ 100.50" }));
      return;
    }
    setInputNotice(previous => ({ ...previous, [field]: "" }));
    setCleared(false);
    if (field === "balance") setBalance(value.trim()); else setPurchase(value.trim());
  }
  function blockInvalidPaste(event: React.ClipboardEvent<HTMLInputElement>, field: "balance" | "purchase") {
    if (!isMoneyInputText(event.clipboardData.getData("text"))) {
      event.preventDefault();
      setInputNotice(previous => ({ ...previous, [field]: "ใส่ได้เฉพาะตัวเลข เช่น 100 หรือ 100.50" }));
    }
  }
  function clearPurchase() { editMoney("purchase", ""); purchaseRef.current?.focus(); }
  function eraseDraft() { clearData(); setInputNotice({ balance: "", purchase: "" }); setCleared(true); }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="flex items-center gap-2.5" aria-label="ไทยช่วยไทย Plus หน้าหลัก">
            <span className="brand-mark"><Plus size={24} strokeWidth={3} /></span>
            <span className="brand-name">ไทยช่วยไทย <span>Plus</span></span>
          </a>
          <span className="daily-badge"><Clock3 size={14} /> 200 บาท / วัน</span>
        </div>
      </header>

      <main className="main-content">
        <div className="page-heading">
          <div><p className="eyebrow">เครื่องคำนวณสิทธิ์รายวัน</p><h1>ก่อนจ่าย <span>เช็กให้ชัวร์</span></h1><p className="heading-description">รู้ทันทีว่าคุณจ่ายเท่าไร รัฐช่วยเท่าไร</p></div>
        </div>

        {newDay && <p className="day-notice"><Info size={17} /> วันนี้เริ่มสิทธิ์ใหม่ 200 บาท หากใช้ไปแล้วให้ปรับยอดคงเหลือก่อนคำนวณ</p>}

        <div className="calculator-layout">
          <section className="input-card" aria-labelledby="input-heading">
            <div className="section-heading"><h2 id="input-heading"><ReceiptText size={19} /> กรอกข้อมูลการซื้อ</h2><span className="auto-label"><span /> คำนวณทันที</span></div>

            <div className="balance-block">
              <div className="balance-label"><label htmlFor="balance">สิทธิ์รัฐที่เหลือวันนี้</label><span>สูงสุด 200 บาท</span></div>
              <div className={`balance-input ${parsedBalance.error ? "field-invalid" : ""}`}>
                <Wallet size={19} aria-hidden="true" />
                <input id="balance" disabled={!ready} inputMode="decimal" enterKeyHint="next" autoComplete="off" spellCheck={false} maxLength={32} value={balance} placeholder="200" onChange={event => editMoney("balance", event.target.value)} onPaste={event => blockInvalidPaste(event, "balance")} onBlur={() => { if (parsedBalance.value !== null) setBalance(formatMoney(parsedBalance.value)); }} onKeyDown={event => { if (event.key === "Enter") purchaseRef.current?.focus(); }} aria-invalid={!!parsedBalance.error} aria-describedby="balance-help" />
                <span>บาท</span>
              </div>
              <p id="balance-help" className={`field-help ${parsedBalance.error || inputNotice.balance ? "error-text" : ""}`}>{parsedBalance.error || inputNotice.balance || "กรอกยอดที่เหลือจริง หากวันนี้ใช้สิทธิ์ไปแล้ว"}</p>
              <div className="capacity-panel">
                <div><p>สิทธิ์นี้ซื้อของได้ถึง</p><strong><Amount value={capacity} testId="purchase-capacity" /> <span>บาท</span></strong><p>{capacity === null ? "กรอกสิทธิ์วันนี้เพื่อดูยอดซื้อ" : capacity === 0 ? "สิทธิ์หมดแล้ว ยอดซื้อใหม่ต้องจ่ายเองทั้งหมด" : `คุณจ่าย ${formatMoney(capacityPayment)} บาท · ไม่เสียส่วนเพิ่ม`}</p></div>
                <button type="button" disabled={!capacity} onClick={() => { if (capacity) editMoney("purchase", formatMoney(capacity)); }} className="use-capacity">ใช้ยอดนี้</button>
              </div>
            </div>

            <div className="purchase-block">
              <div className="flex items-center justify-between gap-3"><label htmlFor="purchase">ยอดซื้อครั้งนี้</label><button type="button" disabled={!ready || !purchase} onClick={clearPurchase} className="text-button"><RotateCcw size={14} /> ล้างยอดซื้อ</button></div>
              <div className={`purchase-input ${parsedPurchase.error ? "field-invalid" : ""}`}>
                <span className="currency-symbol" aria-hidden="true">฿</span>
                <input ref={purchaseRef} id="purchase" disabled={!ready} inputMode="decimal" enterKeyHint="done" autoComplete="off" spellCheck={false} maxLength={32} value={purchase} placeholder="0.00" onChange={event => editMoney("purchase", event.target.value)} onPaste={event => blockInvalidPaste(event, "purchase")} onBlur={() => { if (parsedPurchase.value !== null) setPurchase(formatMoney(parsedPurchase.value)); }} onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} aria-invalid={!!parsedPurchase.error} aria-describedby="purchase-help" />
                {purchase && <button type="button" onClick={clearPurchase} aria-label="ล้างยอดซื้อที่กรอก" className="clear-input"><X size={17} /></button>}
              </div>
              <p id="purchase-help" className={`field-help ${parsedPurchase.error || inputNotice.purchase ? "error-text" : ""}`}>{parsedPurchase.error || inputNotice.purchase || "ราคาสินค้ารวม ก่อนหักสิทธิ์รัฐ"}</p>
            </div>
            <p className="manual-note"><ShieldCheck size={16} /> ทดลองคำนวณได้ สิทธิ์ที่กรอกจะไม่ถูกหักอัตโนมัติ</p>
          </section>

          <section className={`result-card ${shortage ? "has-shortage" : ""}`} aria-labelledby="result-heading">
            <div className="section-heading"><h2 id="result-heading">สรุปยอดที่ต้องจ่าย</h2><span className="result-badge">{result ? <><Check size={13} /> คำนวณแล้ว</> : "รอยอดซื้อ"}</span></div>
            <div className="your-payment">
              <div className="payment-label"><Wallet size={20} /><h3>คุณจ่ายทั้งหมด</h3></div>
              <p className="your-payment-value"><Amount value={result?.user ?? null} testId="user-payment" /><span className="money-unit">บาท</span></p>
              <p className="payment-caption">{shortage ? "รวมเงินที่ต้องจ่ายเพิ่มแล้ว" : result ? "เงินที่คุณต้องเตรียมจ่ายจริง" : "กรอกยอดซื้อ แล้วดูคำตอบได้ตรงนี้"}</p>
            </div>
            <div className="government-payment"><div className="flex items-center gap-2.5"><span className="government-icon"><HeartHandshake size={21} /></span><div><h3>รัฐช่วยจ่าย</h3><p>60% แต่ไม่เกินสิทธิ์วันนี้</p></div></div><p className="government-value"><Amount value={result?.government ?? null} testId="government-payment" /><span> บาท</span></p></div>

            {shortage ? <div className="shortage-alert"><div className="flex items-center gap-2"><TriangleAlert size={18} /><h3>สิทธิ์ไม่พอ คุณต้องจ่ายเพิ่ม</h3></div><p className="extra-amount"><Amount value={result.extra} testId="extra-payment" /><span> บาท</span></p><p>รวมอยู่ในยอด <strong>คุณจ่ายทั้งหมด</strong> ด้านบนแล้ว</p></div> : result ? <p className="enough-notice"><BadgeCheck size={17} /> สิทธิ์เพียงพอ ไม่มีเงินที่ต้องจ่ายเพิ่ม</p> : <p className={`result-hint ${inputError ? "error-text" : ""}`}><Info size={16} /> {inputError ? "แก้ไขตัวเลขที่กรอก เพื่อดูยอดจ่ายที่ถูกต้อง" : "ใส่ข้อมูลด้านบนเพื่อเริ่มคำนวณ"}</p>}

            {result && <div className="receipt-breakdown">
              {shortage && <><div><span>ส่วนที่คุณจ่ายปกติ 40%</span><strong>{formatMoney(result.baseUser)} บาท</strong></div><div className="error-text"><span>จ่ายเพิ่มเพราะสิทธิ์ไม่พอ</span><strong>+ {formatMoney(result.extra)} บาท</strong></div></>}
              <div className="receipt-total"><span>ยอดซื้อรวม</span><strong>{formatMoney(result.purchase)} บาท</strong></div>
              <div><span>สิทธิ์ที่จะเหลือหลังซื้อ</span><strong data-testid="remaining">{formatMoney(result.remaining)} บาท</strong></div>
              <p className="projected-note">เป็นยอดจำลอง ยังไม่ได้หักสิทธิ์ที่คุณกรอก</p>
            </div>}
          </section>
        </div>

        <section className="help-section" aria-label="วิธีคำนวณและข้อมูลที่บันทึก">
          <details><summary><span><CircleHelp size={17} /> คำนวณอย่างไร?</span><ChevronDown size={17} /></summary><div className="help-content"><p>รัฐช่วย 60% ของยอดซื้อ ไม่เกินสิทธิ์ที่เหลือวันนี้ และสูงสุด <strong>200 บาทต่อวัน</strong> ส่วนที่เหลือคุณเป็นผู้จ่าย</p><div className="example-line"><span>ซื้อ 500 บาท · เหลือสิทธิ์ 200 บาท</span><strong>คุณจ่าย <span className="error-text">300</span> + รัฐจ่าย 200 บาท</strong></div><p>ส่วนปกติของคุณ 200 บาท และจ่ายเพิ่ม 100 บาทเพราะสิทธิ์ไม่พอ โดยเงินเพิ่มรวมอยู่ใน 300 บาทแล้ว</p><p>ยอดรัฐ 60% ปัดเป็นสตางค์ใกล้ที่สุด จากนั้นนำไปหักจากยอดซื้อเพื่อให้ยอดรวมตรงกัน</p><p>“สิทธิ์นี้ซื้อของได้ถึง” คือยอดซื้อสูงสุดที่ไม่ต้องจ่ายส่วนเพิ่มตามการปัดเศษนี้ คุณยังต้องจ่ายส่วนปกติ เช่น สิทธิ์ 200 บาท รองรับยอดซื้อ 333.34 บาท รัฐจ่าย 200 บาท และคุณจ่าย 133.34 บาท</p></div></details>
          <details><summary><span><Smartphone size={17} /> จำข้อมูลไว้อย่างไร?</span><ChevronDown size={17} /></summary><div className="help-content"><p>เก็บสิทธิ์ที่กรอกและยอดซื้อล่าสุดด้วย LocalStorage ในเบราว์เซอร์นี้ เมื่อเปิดกลับมาในวันเดิมจะใช้ค่าล่าสุด ไม่ส่งยอดเงินไปยังเซิร์ฟเวอร์</p><p>เมื่อขึ้นวันใหม่ตามเวลาไทย สิทธิ์จะเริ่มที่ 200 บาทและล้างยอดซื้อ หากใช้สิทธิ์ไปแล้ว ให้ปรับยอดคงเหลือเอง ข้อมูลไม่เชื่อมกับแอปของรัฐหรืออุปกรณ์อื่น</p><button type="button" onClick={eraseDraft} disabled={!ready} className="erase-button"><RotateCcw size={15} /> ล้างข้อมูลที่จำไว้</button>{cleared && <p role="status">ล้างข้อมูลแล้ว เริ่มใหม่ด้วยสิทธิ์ 200 บาท</p>}</div></details>
        </section>
        <footer className="site-footer"><span className="flex items-center justify-center gap-1.5"><ShieldCheck size={14} /> ข้อมูลอยู่บนอุปกรณ์ของคุณ</span><span>เครื่องมือช่วยคำนวณ ไม่ใช่เว็บไซต์ทางการของโครงการ</span></footer>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      </main>

      <div className={`mobile-summary ${shortage ? "has-shortage" : ""}`} aria-hidden="true">
        <div><span>คุณจ่ายทั้งหมด</span><p><Amount value={result?.user ?? null} /> <small>บาท</small></p></div>
        <div><span>รัฐช่วยจ่าย</span><p><Amount value={result?.government ?? null} /> <small>บาท</small></p></div>
      </div>
    </div>
  );
}
