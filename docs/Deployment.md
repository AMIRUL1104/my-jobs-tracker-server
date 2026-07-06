---

### ⑤. `docs/deployment.md`

```markdown
# Deployment Guide

JobTrackr প্রজেক্টটি যেহেতু পার্সোনাল এবং লাইটওয়েট, তাই এটি সম্পূর্ণ বিনামূল্যে ক্লাউডে ডিপ্লয় করার গাইডলাইন নিচে দেওয়া হলো।

---

## 1. Backend Deployment (Render / Vercel)

আমরা আমাদের Express.js ব্যাকএন্ডটি **Render** অথবা **Vercel**-এ ডিপ্লয় করতে পারি।

### Render-এ ডিপ্লয় করার ধাপসমূহ:

1. আপনার কোডটি একটি GitHub রিপোজিটরিতে পুশ (Push) করুন।
2. [Render Dashboard](https://dashboard.render.com) এ লগইন করুন।
3. **New +** বাটনে ক্লিক করে **Web Service** সিলেক্ট করুন।
4. আপনার জিটহাব রিপোজিটরিটি কানেক্ট করুন।
5. নিচের কনফিগারেশনগুলো সেট করুন:
   - **Root Directory:** `server` (যেহেতু ব্যাকএন্ডটি সাব-ফোল্ডারে আছে)
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
6. **Advanced** অপশনে গিয়ে Environment Variables-গুলো যোগ করুন:
   - `PORT` = `4000`
   - `DB_USER` = `your_mongodb_username`
   - `DB_PASS` = `your_mongodb_password`
   - `CLIENT_URL` = `আপনার_লাইভ_ফ্রন্টএন্ড_ইউআরএল`
7. **Deploy Web Service** এ ক্লিক করুন।

---

## 2. Database Whitelisting (Crucial Step)

ডিপ্লয়মেন্টের পর ব্যাকএন্ড যেন ডাটাবেজের সাথে কানেক্ট হতে পারে, সেজন্য:

1. MongoDB Atlas ড্যাশবোর্ডে যান।
2. **Network Access** ট্যাবে ক্লিক করুন।
3. **Add IP Address** এ ক্লিক করে **Allow Access From Anywhere (0.0.0.0/0)** সিলেক্ট করুন (যেহেতু ক্লাউড সার্ভারের আইপি ডাইনামিকালি চেঞ্জ হয়)।

---

## 3. Frontend Deployment (Vercel)

Next.js ফ্রন্টএন্ড ডিপ্লয় করার জন্য **Vercel** সবচেয়ে সেরা এবং অপ্টিমাইজড চয়েস।

### Vercel-এ ডিপ্লয় করার ধাপসমূহ:

1. [Vercel Dashboard](https://vercel.com) এ যান।
2. **Add New...** থেকে **Project** সিলেক্ট করুন এবং GitHub রিপোজিটরিটি ইমপোর্ট করুন।
3. কনফিগারেশন সেটিংসে:
   - **Root Directory:** `client` সিলেক্ট করুন।
   - Framework Preset হিসেবে **Next.js** অটোমেটিক সিলেক্ট হয়ে যাবে।
4. Environment Variables সেকশনে আপনার ব্যাকএন্ডের লাইভ ইউআরএলটি যুক্ত করুন (যেমন: `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com`)।
5. **Deploy** বাটনে ক্লিক করুন। ২ মিনিটের মধ্যে আপনার অ্যাপ্লিকেশনটি লাইভ হয়ে যাবে!
