# Mi Nhon Hotel Official

## Mục lục
- [Giới thiệu](#giới-thiệu)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cài đặt & Chạy thử](#cài-đặt--chạy-thử)
- [Triển khai Production](#triển-khai-production)
- [Backup & Restore](#backup--restore)
- [Rollback](#rollback)
- [Scale & High Availability](#scale--high-availability)
- [Testing & CI/CD](#testing--cicd)
- [Developer Onboarding](#developer-onboarding)

---

## Giới thiệu
Hệ thống quản lý khách sạn Mi Nhon Hotel: gồm frontend (React), backend (Node.js/Express), database (Postgres), cache (Redis), AI (OpenAI), email, WebSocket, CI/CD, monitoring, backup, rollback, và bảo mật.

## Kiến trúc hệ thống
- **Frontend:** React SPA, tối ưu performance, lazy load, analytics, feedback widget.
- **Backend:** Node.js/Express, REST API, WebSocket, email queue, cache Redis, monitoring, logging, rate limit, Sentry.
- **Database:** Postgres, migration, backup tự động.
- **Cache:** Redis, TTL, batch, atomic, pub/sub.
- **DevOps:** Docker Compose, CI/CD, backup, rollback, scale.

## Cài đặt & Chạy thử
```bash
git clone ...
cd MinhonHotelOFFICIAL
docker-compose up --build
```
- Truy cập frontend: http://localhost:3000
- API backend: http://localhost:8080

## Triển khai Production
- Sửa `.env.production` cho các biến môi trường.
- Sử dụng Docker Compose hoặc Kubernetes.
- Đảm bảo HTTPS, bảo mật CORS, JWT, secrets.

## Backup & Restore
- **Backup:**
  - Tự động backup Postgres mỗi ngày (xem docker-compose.yml, volume `/db-backup`).
  - Có thể backup thủ công: `docker exec -t <db_container> pg_dumpall -c -U postgres > /db-backup/backup.sql`
- **Restore:**
  - `docker exec -i <db_container> psql -U postgres < /db-backup/backup.sql`

## Rollback
- Nếu deploy lỗi, dùng backup để restore DB.
- Có thể rollback code bằng git: `git checkout <commit_id>` rồi redeploy.
- Đảm bảo kiểm tra healthcheck sau rollback.

## Scale & High Availability
- **Backend:** Có thể scale nhiều instance (stateless, dùng Redis cho session/cache).
- **Redis:** Có thể chuyển sang Redis cluster hoặc managed Redis (AWS, GCP).
- **Postgres:** Có thể dùng replica, managed service (RDS, Cloud SQL).
- **Frontend:** Có thể deploy nhiều instance, dùng Nginx/nginx-ingress.

## Testing & CI/CD
- Đã tích hợp Vitest, GitHub Actions, coverage, migration test.
- Xem file `.github/workflows/` và `vitest.config.ts`.

## Developer Onboarding
- Cài Node.js, Docker, npm.
- Copy `.env.example` thành `.env` và chỉnh sửa.
- Chạy `docker-compose up --build`.
- Đọc tài liệu API (OpenAPI/Swagger).
- Đọc hướng dẫn backup/restore, rollback ở trên.

---

## Liên hệ hỗ trợ
- Email: ...
- Zalo: ...