# 🍔 MZ AI Kiosk Order Helper (AI 주문 도우미)

> **"어르신들도 쉽고 재밌게 주문할 수 있는 AI 키오스크"**
> MZ세대 페르소나를 가진 AI 알바생과 대화하며, 음성으로 편리하게 주문하고 사용자의 터치 패턴을 분석하는 스마트 키오스크 프로젝트입니다.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Styled Components](https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white)](https://styled-components.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google%20bard&logoColor=white)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## 📱 프로젝트 미리보기

| 메인 화면 (주문하기) | AI 채팅 (MZ 알바생) | 터치 분석 결과 (히트맵) |
|:---:|:---:|:---:|
| ![Main Screen](https://via.placeholder.com/200x400?text=Main+Screen) | ![Chat Screen](https://via.placeholder.com/200x400?text=Chat+Screen) | ![Result Screen](https://via.placeholder.com/200x400?text=Result+Screen) |

*(스크린샷을 찍어서 이미지를 교체해보세요!)*

---

## ✨ 주요 기능 (Key Features)

### 1. 🗣️ AI 음성 주문 시스템 (STT & TTS)
- **Voice Only Interface:** 텍스트 입력 없이 **마이크 버튼** 하나로 대화 가능.
- **MZ 페르소나 AI:** 딱딱한 기계음이 아닌, "완전 럭키비키잖아🍀" 같은 유행어를 사용하는 친근한 AI 알바생.
- **음성 인식 & 출력:** 사용자의 말을 텍스트로 변환(STT)하고, AI의 응답을 음성으로 읽어줌(TTS).

### 2. 🍔 반응형 메뉴판 & 장바구니
- **실시간 메뉴 정렬:** 사용자가 "매운 거 추천해줘"라고 하면, **AI가 추천한 메뉴가 자동으로 맨 앞으로 정렬**됨.
- **접근성 UI:** 노인분들을 위해 **큰 글씨, 큰 이미지, 직관적인 버튼** 디자인 적용.
- **스마트 장바구니:** 수량 조절, 개별 삭제, 전체 삭제 및 결제 기능 완비.

### 3. 📊 사용자 행동 분석 (Touch Tracking)
- **터치 로그 수집:** 사용자가 화면의 어느 부분을 터치했는지, 어떤 탭에 얼마나 머물렀는지(Stay Time) 백엔드로 전송.
- **히트맵 결과 제공:** 결제 완료 후, 관리자(결과) 페이지에서 **사용자가 터치한 위치를 빨간 점(히트맵)으로 시각화**하여 표시.

### 4. 🔒 보안 및 배포
- **Proxy Server:** API Key 유출 방지를 위해 Node.js(Express)를 프록시 서버로 사용하여 Google API와 통신.
- **Vercel 배포:** 프론트엔드와 백엔드를 하나의 프로젝트로 통합하여 Vercel에 배포 완료.

---

## 🛠️ 프로젝트 구조 (Directory Structure)

```bash
test-chat/
├── server.js            # 백엔드 서버 (API Proxy & Log 처리)
├── package.json         # 백엔드 의존성
├── vercel.json          # 배포 설정
├── .env                 # (로컬용) 환경 변수
└── textp/               # 프론트엔드 (React)
    ├── src/
    │   ├── Components/  # ChatScreen, MenuPage 등 컴포넌트
    │   ├── hooks/       # useUserTracker (로그 추적 로직)
    │   └── pages/       # Intro, Result 페이지
    ├── public/          # 이미지 에셋 (assets/)
    └── package.json     # 프론트엔드 의존성
