# 함께하는개발 게시판형 사이트

Next.js App Router, Supabase Auth/Postgres, Vercel 배포를 기준으로 만든 운영형 게시판 사이트입니다.

## Local Setup

1. `.env.example`을 기준으로 `.env.local`을 만듭니다.
2. Supabase SQL Editor에서 `supabase/migrations/0001_initial_schema.sql`을 적용합니다.
3. 앱을 실행합니다.

```bash
npm install
npm run dev
```

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

선택 연락 채널:

- `NEXT_PUBLIC_CONTACT_TEL`
- `NEXT_PUBLIC_CONTACT_SMS`
- `NEXT_PUBLIC_KAKAO_CHANNEL_URL`

홈 하단 위치 안내:

- `NEXT_PUBLIC_COMPANY_ADDRESS`
- `NEXT_PUBLIC_COMPANY_LAT`
- `NEXT_PUBLIC_COMPANY_LNG`
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
- `NEXT_PUBLIC_NAVER_MAP_URL`

`NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`에는 `Application Services > Maps`에서 발급한 신규 Client ID를 입력합니다. 구형 `AI·NAVER API` Application의 Client ID나 Client Secret은 사용할 수 없습니다. Application에서 `Web Dynamic Map`을 선택하고 Web 서비스 URL은 포트와 경로를 제외한 `http://localhost`로 등록합니다. 운영 도메인도 같은 방식으로 호스트만 등록합니다.

네이버지도 Client ID와 좌표가 없거나 인증에 실패하면 홈 하단에는 지도 연결 안내와 네이버지도 바로가기가 표시됩니다.

첫 관리자 계정은 Supabase에서 가입 후 SQL로 `profiles.role = 'admin'`으로 승격합니다.

## 시공 실적 작성 규칙

- `title`: 공사 유형 또는 현장 성격을 짧게 작성합니다.
- `excerpt`: `서울권 · 상가 내부 철거 · 마감재 철거 및 폐기물 정리`처럼 지역 단위, 유형, 작업 범위를 한 줄로 작성합니다.
- `content`: 공사 유형, 지역 단위, 작업 범위, 진행 방식, 문의 CTA 순서로 작성합니다.
- 대표자명, 개인 연락처, 사업자 식별정보, 상세 주소, 얼굴, 차량번호는 입력하지 않습니다.

## 플로팅 상담 버튼

- 카톡 채널은 `NEXT_PUBLIC_KAKAO_CHANNEL_URL`을 사용하며, 값이 없으면 `/contact`로 이동합니다.
- 1:1 상담은 `NEXT_PUBLIC_CONTACT_TEL`을 사용해 `tel:` 링크를 만들며, 값이 없으면 `/contact`로 이동합니다.
- 플로팅 버튼은 공개 페이지에만 표시되고 `/admin` 경로에서는 숨깁니다.

## 무료 비교 견적 폼

- 홈 첫 화면의 `무료 비교 견적 받기` 버튼은 Supabase Edge Function `quote-request`로 전송합니다.
- 첨부파일은 비공개 Storage bucket `quote-attachments`에 저장하고, 이메일에는 7일 만료 signed URL을 포함합니다.
- Edge Function secrets: `RESEND_API_KEY`, `QUOTE_REQUEST_TO_EMAIL`, `QUOTE_REQUEST_FROM_EMAIL`.
- 선택 secret `QUOTE_ATTACHMENT_SIGNED_URL_SECONDS`의 기본값은 `604800`입니다.
