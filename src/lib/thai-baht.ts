// ponytail: ครอบถึงแสนล้าน พอสำหรับบิล — ขยายเมื่อถึงพันล้าน
const ONES = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const POS = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

function chunk(n: number): string {
  if (!n) return "";
  const d = String(n).padStart(6, "0").slice(-6).split("").map(Number);
  return d
    .map((v, i) => {
      const pos = 5 - i;
      if (!v) return "";
      if (pos === 1 && v === 1) return "สิบ";
      if (pos === 1 && v === 2) return "ยี่สิบ";
      if (pos === 0 && v === 1 && i > 0 && d[i - 1]) return "เอ็ด";
      return ONES[v] + POS[pos];
    })
    .join("");
}

export function thaiBaht(amount: number | string): string {
  const n = Math.round(Number(amount) * 100) / 100;
  const baht = Math.floor(n);
  const satang = Math.round((n - baht) * 100);
  const millions = Math.floor(baht / 1e6);
  const rest = baht % 1e6;
  const words = (millions ? chunk(millions) + "ล้าน" : "") + chunk(rest);
  if (!satang) return (words || "ศูนย์") + "บาทถ้วน";
  return (words || "") + "บาท" + chunk(satang) + "สตางค์";
}
