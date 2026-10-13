# 캐릭터 디자인 생성기 웹사이트

그림 작업용 캐릭터 컨셉을 생성하고, 해당 설정으로 캐릭터 디자인 시트 이미지를 만드는 웹앱입니다.

## 폴더 구조

```text
auto-character-design/
├─ frontend/                 # React + Vite + TypeScript + Tailwind UI
│  └─ src/
│     ├─ services/api.ts     # 백엔드 API 호출
│     ├─ constants.ts        # 옵션/로컬스토리지 키
│     ├─ types.ts            # 타입 정의
│     └─ App.tsx             # 화면/상태/기능 구현
├─ backend/                  # Express 프록시 서버
│  └─ src/
│     ├─ server.js           # API 라우트/에러 처리
│     ├─ middleware/upload.js# 업로드 검증(5MB, jpg/png/webp)
│     ├─ services/
│     │  ├─ characterService.js
│     │  └─ imageGen/
│     │     ├─ index.js
│     │     └─ pollinationsImageGen.js
│     ├─ constants.js
│     └─ utils.js
├─ .env.example
└─ .gitignore
```

## 구현 순서(요약)

1. Express 백엔드 API 구현
2. 프론트 기본 레이아웃/탭/다크모드 구현
3. 랜덤 생성 + 항목 잠금/부분 재생성 구현
4. 입력 기반 생성(텍스트+이미지 업로드/미리보기) 구현
5. 이미지 생성/재생성 + 결과 액션(복사/JSON/다운로드) 구현
6. 히스토리(localStorage) 구현

## 주요 기능

- 랜덤 생성 모드 + 잠금 기반 부분 재생성
- 입력 기반 생성 모드(텍스트 + 이미지 업로드/드래그앤드롭)
- 비신체 정보(이름/나이 등) 생성 체크박스 옵션
- Pollinations API 기반 이미지 생성
- 디자인 시트 한 장에 전신/안보이는 부분/주 아이템/대표 컬러 반영 프롬프트
- 결과 복사/JSON 내보내기/이미지 다운로드
- 생성 기록 저장/재열기/삭제
- 시스템 다크모드 자동 + 수동 토글

## 환경 변수

루트에 `.env` 파일을 생성하고 아래 값을 설정하세요.

```env
PORT=4000
POLLINATIONS_TEXT_MODEL=openai
POLLINATIONS_IMAGE_MODEL=flux
VITE_API_BASE_URL=
```

- `VITE_API_BASE_URL`를 비워두면 개발 시 Vite 프록시(`/api` -> `http://localhost:4000`)를 사용합니다.

## 설치 및 실행 방법

### 1) 의존성 설치

```bash
cd /home/runner/work/auto-character-design/auto-character-design/frontend
npm install

cd /home/runner/work/auto-character-design/auto-character-design/backend
npm install
```

### 2) 개발 서버 실행

백엔드:

```bash
cd /home/runner/work/auto-character-design/auto-character-design/backend
npm run dev
```

프론트엔드(별도 터미널):

```bash
cd /home/runner/work/auto-character-design/auto-character-design/frontend
npm run dev
```

- 프론트: `http://localhost:5173`
- 백엔드: `http://localhost:4000`

### 3) 빌드

```bash
cd /home/runner/work/auto-character-design/auto-character-design/frontend
npm run build
```

## API 요약

- `POST /api/character/random`
- `POST /api/character/from-input` (multipart/form-data)
- `POST /api/image/generate`
- `GET /api/health`

## 보안/운영 메모

- API 키/설정은 `.env`로만 관리하고 저장소에 커밋하지 않습니다.
- 업로드 이미지는 5MB 이하 및 jpg/png/webp만 허용합니다.
- 실패 시 사용자 친화적 에러 메시지를 반환합니다.
