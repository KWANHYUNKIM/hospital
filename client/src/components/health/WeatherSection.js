import React, { useState, useEffect } from 'react';
import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaTemperatureLow,
  FaWind,
  FaTint,
  FaClock
} from 'react-icons/fa';
import { fetchLatestWeather } from '../../service/commonApi';

const ICON_MAP = {
  '1': <FaSun className="w-12 h-12 text-yellow-500"/>,      // 맑음
  '3': <FaCloud className="w-12 h-12 text-gray-400"/>,     // 구름많음
  '4': <FaCloudRain className="w-12 h-12 text-blue-400"/>, // 흐림(비)
};

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState(null);
  const [tab, setTab] = useState('today'); // today, tomorrow, dayAfter, monthly, past

  useEffect(() => {
    (async () => {
      const data = await fetchLatestWeather();
      setWeatherData(data);
    })();
  }, []);

  // 구조 분해 할당에 기본값 추가
  const {
    metadata = {},
    current = {},
    hourly = [],
    daily = [],
    items = []
  } = weatherData || {};

  // current가 없고 items만 있을 때 fallback 표 렌더링
  if (!weatherData || (!current || Object.keys(current).length === 0) && items.length === 0) {
    return <div className="p-8 text-center">로딩 중…</div>;
  }

  if (!current || Object.keys(current).length === 0) {
    // items 기반 fallback
    return (
      <div className="max-w-xl mx-auto p-4 font-sans">
        <h2 className="text-xl font-bold mb-2">원시 날씨 데이터</h2>
        <table className="w-full border text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-2 border">카테고리</th>
              <th className="p-2 border">값</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id || item.category}>
                <td className="p-2 border">{item.category}</td>
                <td className="p-2 border">{item.obsrValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const { sidoNm = '-', sgguNm = '-' } = metadata;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 font-sans">
      {/* ——— 지역 & 탭 ——— */}
      <div>
        <h2 className="text-2xl font-bold mb-2">{sidoNm} {sgguNm}</h2>
        <ul className="flex space-x-4 text-gray-600">
          {['today','tomorrow','dayAfter','monthly','past'].map(key => {
            const label = {
              today: '오늘', tomorrow: '내일', dayAfter: '모레',
              monthly: '월간', past: '과거'
            }[key];
            return (
              <li
                key={key}
                onClick={()=>setTab(key)}
                className={`cursor-pointer pb-1 ${tab===key? 'text-blue-600 border-b-2 border-blue-600':'hover:text-gray-800'}`}
              >
                {label}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ——— 서비스 선택 버튼 ——— */}
      <div className="flex space-x-2 text-sm">
        {['기상청','아큐웨더','웨더채널','웨더뉴스'].map(src => (
          <button key={src}
                  className="px-3 py-1 border rounded-full text-gray-600 hover:bg-blue-50">
            {src}
          </button>
        ))}
        <button className="ml-auto text-sm text-gray-500 hover:underline">
          예보비교
        </button>
      </div>

      {/* ——— 오늘 요약 카드 ——— */}
      <div className="bg-white rounded-2xl shadow p-6 text-center space-y-2">
        <div className="flex justify-center">
          {ICON_MAP[current.sky] || <FaSun className="w-12 h-12"/>}
          <span className="text-5xl font-bold ml-2">{current.temp}°</span>
        </div>
        <div className="text-gray-600">
          어제보다 {current.diffFromYesterday > 0
            ? `+${current.diffFromYesterday}°`
            : `${current.diffFromYesterday}°`} / {current.desc}
        </div>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <div><FaTemperatureLow className="inline"/> 체감 {current.feelsLike}°</div>
          <div><FaTint className="inline"/> 습도 {current.humidity}%</div>
          <div><FaWind className="inline"/> {current.wind?.speed}m/s</div>
        </div>
      </div>

      {/* ——— 미세먼지·자외선·일몰 카드 ——— */}
      <div className="grid grid-cols-5 gap-2 text-center text-sm">
        <div className="bg-blue-50 rounded-lg p-2">
          <div>미세먼지</div>
          <div className="font-bold text-blue-600">좋음</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2">
          <div>초미세먼지</div>
          <div className="font-bold text-blue-600">좋음</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2">
          <div>자외선</div>
          <div className="font-bold text-green-600">보통</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2">
          <div>일몰</div>
          <div className="font-bold">19:37</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 flex items-center justify-center hover:bg-blue-100 cursor-pointer">
          <span className="text-blue-600">날씨 제보톡&nbsp;›</span>
        </div>
      </div>

      {/* ——— 시간별 예보 (오늘) ——— */}
      {tab === 'today' && (
        <div>
          <h3 className="font-semibold mb-2">시간별 예보</h3>
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {hourly.map(item => (
              <div key={item.time} className="flex-shrink-0 w-16 text-center">
                <div className="text-xs text-gray-500">{item.time}</div>
                <div className="my-1">
                  {ICON_MAP[item.sky] || <FaSun className="w-6 h-6"/>}
                </div>
                <div className="font-medium">{item.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ——— 주간예보 ——— */}
      {(tab === 'today' || tab === 'monthly') && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">주간예보</h3>
            <span className="text-sm text-gray-500 hover:underline cursor-pointer">최저 최고 기준</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-700">
            {daily.map(item => (
              <div key={item.date} className="flex items-center justify-between bg-white rounded-lg shadow p-2">
                <div>
                  <div className="font-medium">{item.weekday}</div>
                  <div className="text-xs text-gray-500">{item.date}</div>
                </div>
                <div className="text-xs text-blue-500">
                  {item.morningPop}% / {item.afternoonPop}%
                </div>
                <div className="text-right">
                  <div>{item.min}°</div>
                  <div className="font-bold">{item.max}°</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}