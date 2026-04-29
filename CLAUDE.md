# AI Tech Pulse — Claude Code Guide

## Project
Nền tảng theo dõi và phân tích AI trends theo thời gian thực.
Thu thập từ nhiều nguồn (blogs, GitHub, papers), xử lý bằng AI để dedup + tag + tóm tắt.

## Stack
- **Framework**: Next.js 15 (App Router), TypeScript
- **UI**: Tailwind CSS v4, Shadcn UI, Framer Motion
- **Database**: PostgreSQL (Supabase) + Prisma v7
- **Background jobs**: Inngest
- **AI**: Groq (free, hiện tại) → Claude API (khi có key)
- **Dedup**: fuse.js + SHA256 hash

## Kiến trúc quan trọng

### Scrapers (`lib/scrapers/`)
- Mọi scraper PHẢI kế thừa `BaseScraper` từ `lib/scrapers/base.scraper.ts`
- Khai báo vào registry trong `lib/scrapers/index.ts`
- Không gọi DB trực tiếp trong scraper — trả về `ScrapedItem[]`

### AI Layer (`lib/ai/`)
- Mọi AI call ĐI QUA `AIProvider` interface — không gọi SDK trực tiếp
- Để swap sang Claude: thêm `ClaudeProvider` implements `AIProvider`, đổi `getProvider()` trong `pipeline.ts`
- `enrichArticles()` trong `pipeline.ts` là entry point duy nhất

### Database (`lib/db/`)
- Import Prisma client QUA `lib/db/prisma.ts` — không import `PrismaClient` trực tiếp
- Prisma v7: generated client ở `app/generated/prisma/`

### Background Jobs (`lib/inngest/`)
- Scraping chạy qua Inngest functions — không dùng Server Actions cho long-running tasks
- Mỗi nguồn = 1 Inngest function riêng

## Quy ước code
- Không dùng `any` trong TypeScript
- Không inline magic strings — dùng constants hoặc enum
- Error handling chỉ ở boundary (API routes, Inngest functions)

## Commands thường dùng
```bash
npm run dev          # Start dev server
npx prisma studio    # Xem/edit DB qua UI
npx prisma validate  # Kiểm tra schema
npx tsc --noEmit     # Kiểm tra TypeScript
```

## Thứ tự thêm scraper mới
1. Tạo `lib/scrapers/[name].scraper.ts` kế thừa `BaseScraper`
2. Thêm vào registry trong `lib/scrapers/index.ts`
3. Thêm record `Source` vào DB (seed hoặc migration)
4. Tạo Inngest function trong `lib/inngest/functions/`
