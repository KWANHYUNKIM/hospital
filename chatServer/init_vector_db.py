import chromadb
from chromadb.config import Settings
from elasticsearch import Elasticsearch
from openai import OpenAI
import os
from dotenv import load_dotenv
from tqdm import tqdm
import random
from pathlib import Path

# 환경 변수 로드
load_dotenv()

# 프로젝트 루트 디렉토리 경로 설정
ROOT_DIR = Path(__file__).parent.parent.parent
CHROMA_DIR = ROOT_DIR / "server/vector_db/chroma_db"

# Elasticsearch 연결
es = Elasticsearch('http://localhost:9200')

# ChromaDB 클라이언트 초기화
client = chromadb.Client(Settings(
    persist_directory=str(CHROMA_DIR),
    anonymized_telemetry=False,
    is_persistent=True
))

# 기존 컬렉션이 있다면 삭제
try:
    client.delete_collection(name="hospital_info")
except:
    pass

# 컬렉션 생성
collection = client.create_collection(
    name="hospital_info",
    metadata={"hnsw:space": "cosine"}
)

# OpenAI 클라이언트 초기화
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def create_embedding(text):
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def process_hospital_batch(hospitals_batch, start_idx):
    embeddings = []
    documents = []
    ids = []
    
    for i, hospital in enumerate(hospitals_batch):
        # 병원 정보 텍스트 생성
        hospital_text = f"""
        {hospital['_source']['yadmNm']}은(는) {hospital['_source']['addr']}에 위치한 병원입니다.
        
        기본 정보:
        - 전화번호: {hospital['_source'].get('telno', '정보 없음')}
        - 진료과목: {hospital['_source'].get('dgsbjtCdNm', '정보 없음')}
        
        추가 정보:
        - 응급실 운영: {'운영' if hospital['_source'].get('emymCnt', 0) > 0 else '미운영'}
        - 의료진 수: {hospital['_source'].get('drTotCnt', 0)}명
        - 입원실 수: {hospital['_source'].get('hghrSickbdCnt', 0)}개
        - 일반 병상 수: {hospital['_source'].get('sickbdCnt', 0)}개
        
        진료 시간:
        - 평일: {hospital['_source'].get('dutyTime1s', '정보 없음')} ~ {hospital['_source'].get('dutyTime1c', '정보 없음')}
        - 주말: {hospital['_source'].get('dutyTime2s', '정보 없음')} ~ {hospital['_source'].get('dutyTime2c', '정보 없음')}
        - 공휴일: {hospital['_source'].get('dutyTime3s', '정보 없음')} ~ {hospital['_source'].get('dutyTime3c', '정보 없음')}
        
        특이사항:
        - 응급실 운영 여부: {'운영' if hospital['_source'].get('emymCnt', 0) > 0 else '미운영'}
        - 장애인 편의시설: {'있음' if hospital['_source'].get('dutyEryn', 0) > 0 else '정보 없음'}
        - 주차 가능: {'가능' if hospital['_source'].get('parking', 0) > 0 else '정보 없음'}
        """

        # 임베딩 생성
        embedding = create_embedding(hospital_text)
        
        embeddings.append(embedding)
        documents.append(hospital_text)
        ids.append(f"hospital_{start_idx + i}")
    
    return embeddings, documents, ids

def get_sample_data(sample_size=100):
    # Elasticsearch에서 데이터 가져오기
    query = {
        "size": sample_size,
        "query": {
            "match_all": {}
        }
    }
    
    response = es.search(
        index="hospitals",
        body=query
    )
    
    return response['hits']['hits']

def print_stored_data():
    print("\n=== 저장된 데이터 확인 ===")
    results = collection.get()
    print(f"총 {len(results['ids'])}개의 데이터가 저장되어 있습니다.")
    print("\n=== 샘플 데이터 (처음 5개) ===")
    for i in range(min(5, len(results['ids']))):
        print(f"\nID: {results['ids'][i]}")
        print(f"문서: {results['documents'][i]}")
        print("-" * 50)

def main():
    # 테스트용 샘플 데이터 가져오기 (기본값: 100개)
    sample_size = 100  # 테스트할 데이터 크기 설정
    hospital_data = get_sample_data(sample_size)
    
    print(f"테스트용 {sample_size}개의 병원 데이터를 선택했습니다.")
    
    batch_size = 10  # 배치 크기 설정
    batches = [hospital_data[i:i + batch_size] for i in range(0, len(hospital_data), batch_size)]
    
    # 진행률 표시를 위한 tqdm 설정
    with tqdm(total=len(hospital_data), desc="병원 데이터 처리 중") as pbar:
        for batch_idx, batch in enumerate(batches):
            embeddings, documents, ids = process_hospital_batch(batch, batch_idx * batch_size)
            
            # ChromaDB에 배치 저장
            collection.add(
                embeddings=embeddings,
                documents=documents,
                ids=ids
            )
            
            pbar.update(len(batch))
    
    print("벡터 DB 초기화 완료!")
    
    # 저장된 데이터 확인
    print_stored_data()

if __name__ == "__main__":
    main() 