import React from 'react';

const LoginPage = () => (
  <div style={{ maxWidth: 400, margin: '80px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18, textAlign: 'center' }}>로그인</h2>
    <form>
      <input type="email" placeholder="이메일" style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 8, border: '1.5px solid #eee', fontSize: 16 }} />
      <input type="password" placeholder="비밀번호" style={{ width: '100%', padding: 12, marginBottom: 24, borderRadius: 8, border: '1.5px solid #eee', fontSize: 16 }} />
      <button type="submit" style={{ width: '100%', background: '#181A1B', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '14px 0', cursor: 'pointer' }}>
        로그인
      </button>
    </form>
  </div>
);

export default LoginPage;