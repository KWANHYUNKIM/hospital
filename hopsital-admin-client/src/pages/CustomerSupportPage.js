import React from 'react';

const faqs = [
  {
    question: '온라인 교육, 동영상 강의 메뉴가 사라졌어요',
    answer: '설정 > 메뉴관리에서 다시 추가할 수 있습니다.'
  },
  {
    question: '주문관리v2 서드파티 연동하기',
    answer: '설정 > 외부연동에서 연동 가능합니다.'
  },
  {
    question: '계정/결제 관련 문의는 어디서 하나요?',
    answer: '고객센터 > 1:1 문의를 이용해 주세요.'
  }
];

const CustomerSupportPage = () => (
  <div style={{ maxWidth: 900, margin: '60px auto', textAlign: 'center' }}>
    <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 24 }}>무엇을 도와드릴까요?</div>
    <input
      type="text"
      placeholder="궁금한 점을 찾아보세요"
      style={{
        width: '60%',
        padding: '14px 18px',
        fontSize: 18,
        borderRadius: 8,
        border: '1.5px solid #eee',
        marginBottom: 32
      }}
    />
    <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: 700 }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>자주 묻는 질문</div>
      {faqs.map((faq, i) => (
        <div key={i} style={{
          background: '#f9f9f9',
          borderRadius: 12,
          padding: '18px 24px',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{faq.question}</div>
          <div style={{ color: '#666', fontSize: 15 }}>{faq.answer}</div>
        </div>
      ))}
    </div>
  </div>
);

export default CustomerSupportPage;
