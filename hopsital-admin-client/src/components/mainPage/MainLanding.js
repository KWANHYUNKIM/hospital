import React from 'react';

const cards = [
  {
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    text: '친구랑 동업하면 안돼?',
    size: 'small'
  },
  {
    img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    text: '좋아하는 일로',
    size: 'medium'
  },
  {
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    text: '나만이 할 수 있는 일이 됩니다',
    size: 'large'
  },
  {
    img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    text: '진짜 자신 있는 일',
    size: 'medium'
  },
  {
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    text: '나는 언제 빛날까?',
    size: 'small'
  }
];

const cardSize = {
  small: { width: 200, height: 180, fontSize: 22 },
  medium: { width: 240, height: 220, fontSize: 28 },
  large: { width: 340, height: 300, fontSize: 32 }
};

const MainLanding = () => (
  <div style={{
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#fff',
    position: 'relative',
    paddingTop: 60
  }}>
    {/* 메인 타이틀 */}
    <div style={{ fontSize: 48, fontWeight: 800, color: '#222', textAlign: 'center', margin: '60px 0 40px 0', letterSpacing: '-2px' }}>
      물음표를 넘어서면 브랜드가 시작되죠
    </div>
    {/* 카드형 이미지 리스트 */}
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 32,
      marginBottom: 60
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          width: cardSize[card.size].width,
          height: cardSize[card.size].height,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          position: 'relative',
          background: '#eee',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          transition: 'transform 0.2s',
        }}>
          <img src={card.img} alt="card" style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 1,
            filter: 'brightness(0.7)'
          }} />
          <div style={{
            position: 'relative',
            zIndex: 2,
            color: '#fff',
            fontWeight: 700,
            fontSize: cardSize[card.size].fontSize,
            padding: '0 18px 18px 18px',
            textShadow: '0 2px 8px rgba(0,0,0,0.18)',
            textAlign: 'center',
            lineHeight: 1.2
          }}>{card.text}</div>
        </div>
      ))}
    </div>
    {/* 하단 강조 텍스트 */}
    <div style={{ fontSize: 32, fontWeight: 800, color: '#222', marginBottom: 8 }}>
      내가 잘하는 게 뭘까?
    </div>
    <div style={{ fontSize: 18, color: '#888', marginBottom: 60 }}>
      미도리작업실
    </div>
  </div>
);

export default MainLanding; 