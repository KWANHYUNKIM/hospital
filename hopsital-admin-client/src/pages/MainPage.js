import React from 'react';
import BrandVisual from '../components/mainPage/BrandVisual';
import MainLanding from '../components/mainPage/MainLanding';

const MainPage = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#fff',
    position: 'relative',
    paddingTop: 60
  }}>
    <BrandVisual />
    <MainLanding />
  </div>
);

export default MainPage;
