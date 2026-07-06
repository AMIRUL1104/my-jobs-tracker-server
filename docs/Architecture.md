# System Architecture - JobTrackr

## 1. High-Level Overview

JobTrackr একটি Monolithic-inspired Minimalist Full-Stack Architecture ফলো করে তৈরি করা হয়েছে। এটি মূলত একটি Personal-use System (Admin Only), যার কারণে আর্কিটেকচারটিকে অতিরিক্ত জটিল না করে **Speed, Simplicity, এবং Low-Maintenance**-এর ওপর ফোকাস করা হয়েছে।

## 2. Core Components

```text
+--------------------------------------------------------+
|                      Client Layer                      |
|       Next.js (React) + Tailwind CSS + Recharts        |
+--------------------------------------------------------+
                           |
                           | HTTP Requests (REST API)
                           v
+--------------------------------------------------------+
|                      Server Layer                      |
|          Node.js + Express.js (Single-file)            |
+--------------------------------------------------------+
                           |
                           | Native Driver Queries
                           v
+--------------------------------------------------------+
|                     Database Layer                     |
|                 MongoDB Atlas (Cloud)                  |
+--------------------------------------------------------+
```

### A. Client Layer (Frontend)

- **Framework:** Next.js (App Router) ক্লায়েন্ট-সাইড রেন্ডারিং এবং অপ্টিমাইজড পারফরম্যান্স নিশ্চিত করে।
- **State & Forms:** React Hook Form দিয়ে ফর্ম হ্যান্ডলিং এবং রিয়েল-টাইম ভ্যালিডেশন করা হয়।
- **Visualization:** অ্যাপ্লিকেশনের স্ট্যাটিস্টিকস সুন্দরভাবে দেখানোর জন্য Recharts ব্যবহার করা হয়েছে।

### B. Server Layer (Backend)

- **Framework:** Express.js ব্যবহার করে একটি লাইটওয়েট এপিআই লেয়ার তৈরি করা হয়েছে।
- **Monolithic Single-file Setup:** সম্পূর্ণ ব্যাকএন্ড লজিক (Routing, Validation, Controller) একটি মাত্র index.js ফাইলে রাখা হয়েছে যেন কোনো আর্কিটেকচারাল ওভারহেড ছাড়া দ্রুত ডাটা প্রসেস করা যায়।

### C. Database Layer

- **Database:** MongoDB Atlas (Cloud Hosted) যা স্কিমাহীন (Schemaless) ডকুমেন্ট ফরম্যাটে জব ট্র্যাকিংয়ের ডাটা স্টোর করে।
- **Driver:** কোনো ODM (যেমন Mongoose) ছাড়াই সরাসরি অফিসিয়াল mongodb native driver ব্যবহার করা হয়েছে, যা কুয়েরি এক্সিকিউশন স্পিড বহুগুণ বাড়িয়ে দেয়।

### 3. Data Flow & Security Philosophy

- **No-Auth Overhead:** যেহেতু এটি পার্সোনাল অ্যাপ, তাই জটিল ইনক্রিপশন ছাড়াই ডাটাবেজে থাকা নির্দিষ্ট অ্যাডমিন ক্রেডেনশিয়ালের সাথে সরাসরি ব্যাকএন্ড ম্যাচিং করানো হয়।

- **Data Safety:** PATCH এবং POST এপিআই-তে ইউজারের পাঠানো ডাটা থেকে `_id` এবং `createdAt`-এর মতো সেনসিটিভ ফিল্ডগুলো ব্যাকএন্ড লেভেলে ফিল্টার/ডিলিট করে দেওয়া হয় যেন ডাটাবেজের কনসিস্টেন্সি নষ্ট না হয়।
