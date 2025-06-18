import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Nav = () => {
  const navigate = useNavigate();

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: 60,
      background: '#fff',
      borderBottom: '1px solid #eee',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontWeight: 900, color: '#222' }}>삐뽀삐뽀</span><span style={{ color: '#888', fontWeight: 400 }}>브랜드센터</span>
      </Link>
      <div style={{ display: 'flex', gap: 32, fontWeight: 500, fontSize: 16 }}>
        <Link to="/price" style={{ color: '#222', fontWeight: 500, textDecoration: 'none' }}>요금</Link>
        <Link to="/story" style={{ color: '#222', fontWeight: 500, textDecoration: 'none' }}>스토리</Link>
        <Link to="/support" style={{ color: '#222', fontWeight: 500, textDecoration: 'none' }}>고객지원</Link>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button style={{ padding: '6px 18px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#222', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate('/login')}>로그인</button>
        <button style={{ padding: '6px 18px', borderRadius: 8, border: 'none', background: '#222', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/signup')}>무료로 시작하기</button>
      </div>
    </nav>
  );
};

export default Nav; 