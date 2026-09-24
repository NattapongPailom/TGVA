# TGVA — Thai Airways Virtual

หน้าเว็บของ Thai Airways Virtual บน Next.js (App Router) + TypeScript + Tailwind CSS v4

## เริ่มใช้งาน

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # ตรวจว่า build ผ่านก่อน deploy เสมอ
npm run lint
```

## โครงสร้าง

| ที่อยู่ | หน้าที่ |
| --- | --- |
| `app/` | เส้นทางหน้าเว็บ, metadata, และ `globals.css` ที่เก็บ design token |
| `components/sections/` | แต่ละส่วนของหน้าแรก เรียงตามลำดับใน `app/page.tsx` |
| `components/ui/` | ชิ้นส่วนที่ใช้ซ้ำ — ปุ่ม หัวข้อ section |
| `components/motion/` | แอนิเมชัน — หน้าโหลด, เส้นคั่นเครื่องบิน, reveal ตอนเลื่อน |
| `components/media/` | วิดีโอที่เล่นเมื่อเลื่อนถึง |
| `content/` | ข้อความและข้อมูลทั้งหมด แยกจาก markup |
| `lib/world-map.ts` | จุดของแผนที่โลก สร้างจากพิกัดจริง |
| `lib/site-config.ts` | โดเมนของเว็บ — metadata, sitemap และการ์ดโซเชียลอ่านค่าจากที่นี่ |

## แก้เนื้อหาโดยไม่ต้องแตะ layout

ข้อความ รายชื่อทีม เมนู และรายการบริการอยู่ใน `content/site.ts`
ส่วนข้อมูลเส้นทางบินรายภูมิภาคอยู่ใน `content/regions.ts`

`regions.ts` เก็บตำแหน่งหมุดบนแผนที่เป็นเปอร์เซ็นต์ที่คำนวณจากพิกัดจริง
(ดูวิธีฉายพิกัดได้ใน `lib/world-map.ts`) การเพิ่มภูมิภาคใหม่จึงทำได้โดยเพิ่ม
object ใน `regions` แล้วหมุดกับแผงข้อมูลจะขึ้นเองทั้งคู่

## สีและฟอนต์

สีแบรนด์ทั้งหมดเป็น token อยู่ใน `app/globals.css` ใต้ `@theme`
เปลี่ยนสีม่วงหรือสีทองที่นั่นที่เดียว แล้วทั้งเว็บเปลี่ยนตาม

ฟอนต์โหลดผ่าน `next/font` ใน `app/layout.tsx` — Archivo สำหรับหัวข้อ
และ Sarabun สำหรับเนื้อหา (รองรับภาษาไทย)

## ไฟล์วิดีโอ

`.gitignore` กันไฟล์วิดีโอไม่ให้เข้า repository โดยตั้งใจ — ไฟล์ต้นฉบับมีขนาดหลักร้อยเมกะไบต์
และจะติดอยู่ในประวัติ git ถาวรถ้าเผลอ commit

ตอนนี้ไฟล์ที่หน้าเว็บใช้อยู่ที่ `public/video/` ในเครื่อง (`who-we-are.mp4`, `showreel.mp4`)
ก่อนขึ้น production ให้ย้ายทั้งสองไฟล์ไปบริการสตรีมมิ่ง แล้วเปลี่ยน path ใน
`components/sections/WhoWeAre.tsx` และ `components/sections/OurStory.tsx` เป็น URL ของ CDN

## ตั้งค่าโดเมนก่อน deploy

ตั้งตัวแปรสภาพแวดล้อม `NEXT_PUBLIC_SITE_URL` เป็นโดเมนจริง เช่น

```
NEXT_PUBLIC_SITE_URL=https://tgva.org
```

ค่านี้ใช้ร่วมกันทั้ง metadata, `robots.txt`, `sitemap.xml` และการ์ดพรีวิวตอนแชร์
ถ้าไม่ตั้ง จะใช้ค่าตัวอย่างใน `lib/site-config.ts` แทน

## ที่ยังค้างอยู่

- รูปทีมงานใน `components/sections/OurTeam.tsx` ยังเป็นช่องว่าง รอรูปจริงแล้วเปลี่ยนเป็น `next/image`
- ชื่อทีมงานใน `content/site.ts` ยังเป็น “ชื่อ–นามสกุล”
- เนื้อหาส่วน What We Do ใน `content/site.ts` เป็นฉบับร่าง รอข้อความจริง
- วิดีโอ showreel ยังไม่มีคำบรรยาย (`<track>`)
