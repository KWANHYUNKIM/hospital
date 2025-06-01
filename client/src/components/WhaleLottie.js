import React from "react";
// import whaleData from "./whale.json"; // whale.json이 없을 때 주석 처리

const WhaleLottie = ({ width = 300, height = 300 }) => (
  <div style={{ width, height, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <img
      src="/images/whale-placeholder.png"
      alt="고래 애니메이션 준비중"
      style={{ width: "80%", height: "80%", objectFit: "contain", opacity: 0.7 }}
    />
  </div>
);

export default WhaleLottie;