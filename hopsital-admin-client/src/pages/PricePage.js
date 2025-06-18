import React from 'react';

const plans = [
  {
    name: 'Starter',
    desc: '시작하는 비즈니스',
    price: '0원/월',
    oldPrice: '16,000원',
    color: '#FFD43B',
    btn: '14일 무료 체험 시작하기',
    icon: '🏠'
  },
  {
    name: 'Pro',
    desc: '온라인 전문 쇼핑몰',
    price: '0원/월',
    oldPrice: '24,000원',
    color: '#38BDF8',
    btn: '14일 무료 체험 시작하기',
    icon: '🏢'
  },
  {
    name: 'Global',
    desc: '글로벌 비즈니스',
    price: '0원/월',
    oldPrice: '40,000원',
    color: '#A78BFA',
    btn: '14일 무료 체험 시작하기',
    icon: '🌏'
  }
];

const PricePage = () => (
  <div style={{ maxWidth: 900, margin: '60px auto', textAlign: 'center' }}>
    <div style={{ color: '#E040FB', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>브랜드 운영에 꼭 맞는</div>
    <div style={{ fontSize: 44, fontWeight: 900, marginBottom: 12 }}>요금제를 선택해 보세요</div>
    <div style={{ color: '#888', fontSize: 18, marginBottom: 32 }}>
      창업 초기 단계부터 해외 진출까지, 모든 단계를 지원하는 요금제를 만나보세요
    </div>
    <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
      {plans.map((plan, i) => (
        <div key={i} style={{
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: 32,
          minWidth: 220,
          flex: 1,
          border: `2.5px solid ${plan.color}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{plan.icon}</div>
          <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 6 }}>{plan.name}</div>
          <div style={{ color: '#888', fontSize: 16, marginBottom: 18 }}>{plan.desc}</div>
          <div style={{ fontWeight: 900, fontSize: 28, marginBottom: 4 }}>{plan.price}</div>
          <div style={{ color: '#bbb', textDecoration: 'line-through', marginBottom: 18 }}>{plan.oldPrice}</div>
          <button style={{
            background: plan.color,
            color: '#222',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            cursor: 'pointer',
            marginTop: 8
          }}>{plan.btn}</button>
        </div>
      ))}
    </div>
  </div>
);

export default PricePage;
