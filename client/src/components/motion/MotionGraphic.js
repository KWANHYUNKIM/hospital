import React from 'react';

const MotionGraphic = ({ style }) => (
  <div style={style}>
    <img
      src="/images/allustrate.png"
      alt="일러스트"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',   // 원형에 꽉 차게
        borderRadius: '50%', // 동그랗게
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)' // (선택) 그림자 효과
      }}
    />
  </div>
);

export default MotionGraphic;