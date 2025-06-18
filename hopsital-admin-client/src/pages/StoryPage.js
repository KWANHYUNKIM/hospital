import React from 'react';

const stories = [
  {
    title: 'Recipe',
    desc: '클릭률 높이는 상품 썸네일 뱃지 설정법',
    date: '2025. 06. 12',
    color: '#F0F',
    tag: '1분 디자인 레시피'
  },
  {
    title: 'On the Table',
    desc: '재구매율 45% 패션 브랜드, 근본부터 바꾼 이유',
    date: '2025. 06. 11',
    color: '#38BDF8',
    tag: 'On the Table : 해브해드 편'
  },
  {
    title: '협업 노하우',
    desc: '놓치면 큰일나요! 전문가 협업 노하우',
    date: '2025. 05. 29',
    color: '#0FF',
    tag: 'imweb insight'
  }
];

const StoryPage = () => (
  <div style={{ maxWidth: 900, margin: '60px auto', textAlign: 'center' }}>
    <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 24 }}>아임웹 블로그</div>
    <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
      {stories.map((story, i) => (
        <div key={i} style={{
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: 0,
          minWidth: 220,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
          <div style={{
            background: story.color,
            width: '100%',
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: 32
          }}>{story.title}</div>
          <div style={{ fontWeight: 700, fontSize: 18, margin: '18px 0 6px 0' }}>{story.desc}</div>
          <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>{story.tag}</div>
          <div style={{ color: '#bbb', fontSize: 14, marginBottom: 18 }}>{story.date}</div>
        </div>
      ))}
    </div>
  </div>
);

export default StoryPage;
