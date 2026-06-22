# كورة لايف ⚽
بث مباشر مباريات كأس العالم 2026

## تشغيل الموقع
افتح `index.html` مباشرة في المتصفح أو عبر **Live Server** في VS Code.
لا حاجة لأي build أو npm.

## كيفية إضافة رابط بث قبل المباراة

1. انظر تحت بطاقة المباراة → `ESPN ID: XXXXXXXXX`
2. افتح `js/streams.js`
3. أضف السطر التالي في `MATCH_STREAMS` **قبل 15 دقيقة** من المباراة :
```js
const MATCH_STREAMS = {
  "401671862": "https://رابط-البث-المباشر",
  // أضف المزيد هنا
};
```
4. احفظ الملف — الرابط سيعمل فوراً عند النقر على "▶ شاهد المباراة"

### إذا لم يكن الرابط موجوداً
سيظهر مودال تلقائياً: "البث سيكون متاح قريباً"

## الملفات
```
footlive/
├── index.html        ← هيكل الصفحة (عربي RTL)
├── css/style.css     ← التصميم (أبيض/بوردو)
└── js/
    ├── matches.js    ← ESPN API + بطاقات المباريات + أزرار الأيام
    └── streams.js    ← MATCH_STREAMS + مودال + الربط الرئيسي
```

## ESPN API
- Endpoint : `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`
- دعم التواريخ : `?dates=YYYYMMDD`
- تحديث تلقائي كل 30 ثانية (ليوم اليوم فقط)
