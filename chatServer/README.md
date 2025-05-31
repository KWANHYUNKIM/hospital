# 병원 검색 챗봇 서버

이 서버는 병원 검색을 위한 AI 챗봇 서비스를 제공합니다.

## 설치 방법

1. Python 3.8 이상이 필요합니다.

2. 필요한 패키지 설치:
```bash
pip install -r requirements.txt
```

3. `.env` 파일 생성:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## 실행 방법

```bash
python server.py
```

또는

```bash
uvicorn server:app --host 127.0.0.1 --port 8001 --reload
```

## API 엔드포인트

1. 채팅 메시지 전송
```
POST /api/chat/message
Content-Type: application/json

{
    "message": "서울에 있는 정형외과 병원 추천해주세요"
}
```

2. 병원 검색
```
POST /api/query
Content-Type: application/json

{
    "query": "서울 정형외과",
    "n_results": 4
}
```

## 주의사항

- 서버를 실행하기 전에 반드시 `.env` 파일에 OpenAI API 키를 설정해야 합니다.
- ChromaDB 데이터베이스가 초기화되어 있어야 합니다. 