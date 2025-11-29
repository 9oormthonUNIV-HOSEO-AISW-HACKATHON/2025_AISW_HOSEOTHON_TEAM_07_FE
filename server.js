// server.js (CORS Proxy 라우트 추가됨)

const express = require('express');
const path = require('path');
const app = express();

// 1. [로컬 전용] 개발 모드일 때만 .env 파일 로드
if (process.env.NODE_ENV !== 'production') {
  console.log('🚧 [개발 모드] 로컬 환경 설정을 로드합니다.');
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

const PORT = process.env.PORT || 8080;

app.use(express.json()); 

// 2. API 키 읽기 및 백엔드 호스트 정의
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// ✅ 실제 백엔드 서버 호스트를 여기에 정의합니다.
const REAL_BACKEND_HOST = 'http://13.125.183.104:8080';

// ---------------------------------------------------------
// [기능 1] AI 채팅 API (모델: gemini-2.5-flash 고정)
// ---------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  console.log('📨 /api/chat 요청 도착');

  if (GEMINI_API_KEY) {
    // 보안상 키의 일부만 로그에 출력
    console.log(`🔑 API 키 로드 성공 (앞 5자리: ${GEMINI_API_KEY.substring(0, 5)}...)`);
  } else {
    console.error("❌ API 키가 로드되지 않았습니다!");
    return res.status(500).json({ error: 'API 키가 서버에 설정되지 않았습니다.' });
  }

  const { history } = req.body;
  if (!history) {
     return res.status(400).json({ error: '잘못된 요청입니다.' });
  }

  // 구글이 알아듣도록 데이터 가공 (system -> user)
  const contents = history.map(msg => ({
    role: msg.role === 'system' ? 'user' : msg.role,
    parts: [{ text: msg.content }]
  }));

  // ❗️ 요청하신 대로 2.5 버전으로 고정했습니다.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('🔥 Google API 에러 발생:', JSON.stringify(errorData, null, 2)); 
      return res.status(apiResponse.status).json({ 
        error: 'Gemini API 호출 실패', 
        details: errorData.error?.message || '알 수 없는 오류' 
      });
    }

    const data = await apiResponse.json();
    const aiResponseText = data.candidates[0].content.parts[0].text;
    
    console.log('✅ Gemini 응답 성공');
    res.status(200).json({ response: aiResponseText });

  } catch (error) {
    console.error('💥 서버 내부 오류:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.', details: error.message });
  }
});

// ---------------------------------------------------------
// [기능 2] 로그 전송 (POST) - 프론트엔드 -> 외부 백엔드 저장
// ---------------------------------------------------------
app.post('/api/event-logs/events', async (req, res) => {
  console.log('📝 [POST] 로그 저장 요청 -> 외부 서버로 전달');

  // ✅ REAL_BACKEND_HOST 사용
  const REAL_BACKEND_URL = `${REAL_BACKEND_HOST}/api/event-logs/events`;

  try {
    const apiResponse = await fetch(REAL_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!apiResponse.ok) {
      console.error('❌ 외부 서버 전송 실패:', apiResponse.status);
      return res.status(apiResponse.status).json({ error: '로그 저장 실패' });
    }

    console.log('✅ 로그 외부 서버 저장 완료!');
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('💥 로그 중계 중 오류:', error);
    res.status(500).json({ error: '로그 중계 서버 오류' });
  }
});

// ---------------------------------------------------------
// [기능 3] 로그 조회 (GET) - ResultPage에서 좌표 가져오기 (Proxy 역할)
// ---------------------------------------------------------
app.get('/api/event-logs/click', async (req, res) => {
  const { pageNum } = req.query;
  console.log(`🔍 [GET] 좌표 데이터 조회 요청 (pageNum: ${pageNum}) -> 외부 서버로 전달`);

  // ✅ REAL_BACKEND_HOST 사용
  const REAL_BACKEND_URL = `${REAL_BACKEND_HOST}/api/event-logs/click?pageNum=${pageNum}`;

  try {
    const apiResponse = await fetch(REAL_BACKEND_URL, { method: 'GET' });
    
    if (!apiResponse.ok) {
      console.error('❌ 데이터 조회 실패:', apiResponse.status);
      return res.status(apiResponse.status).json([]); 
    }

    const data = await apiResponse.json();
    console.log(`✅ 데이터 수신 완료: ${Array.isArray(data) ? data.length : 0}개`);
    res.json(data);

  } catch (error) {
    console.error('💥 조회 중계 오류:', error);
    res.status(500).json([]);
  }
});

// ---------------------------------------------------------
// [기능 4] 체류 시간 조회 (GET) - DwellTimePage용 (Proxy 역할)
// ---------------------------------------------------------
app.get('/api/event-logs/times/average', async (req, res) => {
    const { pageNum } = req.query;
    console.log(`🔍 [GET] 평균 체류 시간 조회 요청 (pageNum: ${pageNum}) -> 외부 서버로 전달`);

    // ✅ REAL_BACKEND_HOST 사용 및 API 경로 조합
    const REAL_BACKEND_URL = `${REAL_BACKEND_HOST}/api/event-logs/times/average?pageNum=${pageNum}`; 

    try {
        const apiResponse = await fetch(REAL_BACKEND_URL, { method: 'GET' });
        
        if (!apiResponse.ok) {
            console.error('❌ 데이터 조회 실패:', apiResponse.status);
            // 원격 서버의 오류 상태 코드를 그대로 전달
            return res.status(apiResponse.status).json({ error: '데이터 조회 실패' }); 
        }

        const data = await apiResponse.json();
        // 원격 서버가 보내준 데이터를 프론트엔드로 전달
        res.json(data);

    } catch (error) {
        console.error('💥 조회 중계 오류:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});


// ---------------------------------------------------------
// [배포 설정] 리액트 앱 서빙
// ---------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'textp', 'build')));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'textp', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});