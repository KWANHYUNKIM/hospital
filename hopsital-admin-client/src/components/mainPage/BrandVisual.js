import React from 'react';

const images = [
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80', // 왼쪽 작은 이미지
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', // 가운데 큰 이미지
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80'  // 오른쪽 작은 이미지
];

const BrandVisual = () => (
  <div style={{
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '60px 0 40px 0',
  }}>
    <div style={{
      fontSize: 90,
      fontWeight: 900,
      color: '#181A1B',
      letterSpacing: '-7px',
      lineHeight: 1.05,
      textAlign: 'center',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-end',
      position: 'relative',
      gap: 0
    }}>
      <span>나만의 병원을</span>
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginTop: -30,
      gap: 0
    }}>
      <span style={{ fontSize: 90, fontWeight: 900, color: '#181A1B', letterSpacing: '-7px', lineHeight: 1.05 }}>브</span>
      <img src={images[0]} alt="left" style={{ width: 90, height: 60, objectFit: 'cover', borderRadius: 12, margin: '0 8px' }} />
      <span style={{ fontSize: 90, fontWeight: 900, color: '#181A1B', letterSpacing: '-7px', lineHeight: 1.05 }}>랜</span>
      <img src={images[1]} alt="center" style={{ width: 160, height: 220, objectFit: 'cover', borderRadius: 18, margin: '0 8px' }} />
      <span style={{ fontSize: 90, fontWeight: 900, color: '#181A1B', letterSpacing: '-7px', lineHeight: 1.05 }}>딩</span>
      <img src={images[2]} alt="right" style={{ width: 90, height: 60, objectFit: 'cover', borderRadius: 12, margin: '0 8px' }} />
      <span style={{ fontSize: 90, fontWeight: 900, color: '#181A1B', letterSpacing: '-7px', lineHeight: 1.05 }}>하세요</span>
    </div>
    <button style={{
      background: '#181A1B',
      color: '#fff',
      fontWeight: 600,
      fontSize: 20,
      border: 'none',
      borderRadius: 8,
      padding: '16px 40px',
      cursor: 'pointer',
      marginTop: 32,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      지금 나만의 브랜드 만들기
    </button>
  </div>
);

export default BrandVisual; 