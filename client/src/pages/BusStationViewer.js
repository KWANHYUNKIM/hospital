import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BusStationViewer.css';

const BusStationViewer = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [arrivalPredictions, setArrivalPredictions] = useState({});
  const [showPredictedStations, setShowPredictedStations] = useState(false);
  
  // 버스 운행 추적 관련 상태 추가
  const [trackingStats, setTrackingStats] = useState(null);
  const [activeTrackings, setActiveTrackings] = useState([]);
  const [showTrackingDetails, setShowTrackingDetails] = useState(false);
  const [cityStats, setCityStats] = useState([]);

  // 정류장 데이터 조회
  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3002/api/bus/stations');
      setStations(response.data);
      console.log('정류장 데이터:', response.data);
    } catch (err) {
      setError('정류장 데이터 조회 실패: ' + err.message);
      console.error('정류장 데이터 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 도시별 정류장 조회
  const fetchStationsByCity = async (cityCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3002/api/bus/stations/city/${cityCode}`);
      setStations(response.data);
      console.log(`${cityCode} 도시 정류장 데이터:`, response.data);
    } catch (err) {
      setError('도시별 정류장 데이터 조회 실패: ' + err.message);
      console.error('도시별 정류장 데이터 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 정류장 검색
  const searchStations = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3002/api/bus/stations/search?stationNm=${searchTerm}`);
      setStations(response.data);
      console.log(`"${searchTerm}" 검색 결과:`, response.data);
    } catch (err) {
      setError('정류장 검색 실패: ' + err.message);
      console.error('정류장 검색 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 특정 정류장의 버스 도착 예측 조회
  const fetchArrivalPredictions = async (stationId, stationName) => {
    try {
      const response = await axios.get(`http://localhost:3002/api/bus/predictions/station/${stationId}/simple`);
      setArrivalPredictions(prev => ({
        ...prev,
        [stationId]: response.data
      }));
      console.log(`${stationName} 도착 예측:`, response.data);
    } catch (err) {
      console.error(`${stationName} 도착 예측 조회 실패:`, err);
      setArrivalPredictions(prev => ({
        ...prev,
        [stationId]: { error: '도착 예측 조회 실패' }
      }));
    }
  };

  // 모든 정류장의 도착 예측 조회
  const fetchAllArrivalPredictions = async () => {
    const predictions = {};
    for (const station of stations.slice(0, 20)) { // 상위 20개 정류장만
      try {
        const response = await axios.get(`http://localhost:3002/api/bus/predictions/station/${station.stationId}/simple`);
        predictions[station.stationId] = response.data;
        console.log(`${station.stationNm} 도착 예측 완료`);
      } catch (err) {
        console.error(`${station.stationNm} 도착 예측 실패:`, err);
        predictions[station.stationId] = { error: '도착 예측 조회 실패' };
      }
    }
    setArrivalPredictions(predictions);
  };

  // 버스 운행 추적 통계 조회
  const fetchTrackingStats = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/bus/tracking/stats');
      setTrackingStats(response.data);
      console.log('운행 추적 통계:', response.data);
    } catch (err) {
      console.error('운행 추적 통계 조회 실패:', err);
    }
  };

  // 특정 도시의 운행 중인 버스들 조회
  const fetchActiveTrackingsByCity = async (cityCode) => {
    try {
      const response = await axios.get(`http://localhost:3002/api/bus/tracking/city/${cityCode}/active`);
      setActiveTrackings(response.data);
      console.log(`${cityCode} 도시 운행 중인 버스들:`, response.data);
    } catch (err) {
      console.error(`${cityCode} 도시 운행 추적 조회 실패:`, err);
    }
  };

  // 버스 위치 수집 시작
  const startBusLocationCollection = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3002/api/bus/locations/collect');
      console.log('버스 위치 수집 시작:', response.data);
      alert('버스 위치 수집이 시작되었습니다. 잠시 후 운행 추적 정보를 확인해보세요.');
    } catch (err) {
      console.error('버스 위치 수집 실패:', err);
      alert('버스 위치 수집 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 모든 운행 중인 버스 추적 정보 조회
  const fetchAllActiveTrackings = async () => {
    try {
      setLoading(true);
      
      // 전체 운행 중인 버스들 조회
      const response = await axios.get('http://localhost:3002/api/bus/tracking/active/all');
      const allTrackings = response.data;
      
      // 통계 정보 조회
      const statsResponse = await axios.get('http://localhost:3002/api/bus/tracking/stats');
      const stats = statsResponse.data;
      
      // 도시별 통계 조회
      const cityStatsResponse = await axios.get('http://localhost:3002/api/bus/tracking/active/city-stats');
      const cityStats = cityStatsResponse.data;
      
      setActiveTrackings(allTrackings);
      setTrackingStats(stats);
      console.log('전체 운행 추적 정보:', allTrackings);
      console.log('도시별 통계:', cityStats);
      
      // 도시별 통계를 상태에 저장
      setCityStats(cityStats);
    } catch (err) {
      console.error('운행 추적 정보 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 특정 노선의 운행 중인 버스들 조회
  const fetchActiveTrackingsByRoute = async (routeId) => {
    try {
      const response = await axios.get(`http://localhost:3002/api/bus/tracking/route/${routeId}/active`);
      setActiveTrackings(response.data);
      console.log(`노선 ${routeId} 운행 중인 버스들:`, response.data);
    } catch (err) {
      console.error(`노선 ${routeId} 운행 추적 조회 실패:`, err);
    }
  };

  // 필터링된 정류장 목록
  const filteredStations = stations.filter(station => 
    station.stationNm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.stationId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // arrivalPredictions에 데이터가 있는 정류장만 추출
  const predictedStations = stations.filter(
    s => arrivalPredictions[s.stationId] && arrivalPredictions[s.stationId].arrivals
  ).slice(0, 20);

  useEffect(() => {
    fetchStations();
    fetchTrackingStats(); // 운행 추적 통계도 함께 조회
  }, []);

  // 정류장이 변경될 때마다 도착 예측 조회
  useEffect(() => {
    if (stations.length > 0) {
      fetchAllArrivalPredictions();
    }
  }, [stations]);

  return (
    <div className="bus-station-viewer">
      <h1>🚌 버스 정류장 데이터 뷰어</h1>
      
      {/* 컨트롤 패널 */}
      <div className="control-panel">
        <div className="search-section">
          <input
            type="text"
            placeholder="정류장명 또는 ID로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={searchStations} className="search-btn">
            🔍 검색
          </button>
        </div>
        
        <div className="action-buttons">
          <button onClick={fetchStations} className="action-btn">
            📊 전체 정류장 조회
          </button>
          <button onClick={() => fetchStationsByCity('37040')} className="action-btn">
            🏙️ 안동시 정류장
          </button>
          <button onClick={() => fetchStationsByCity('11000')} className="action-btn">
            🏙️ 서울시 정류장
          </button>
          <button onClick={fetchAllArrivalPredictions} className="action-btn">
            ⏰ 도착 예측 새로고침
          </button>
          <button onClick={fetchTrackingStats} className="action-btn">
            🚌 운행 추적 통계
          </button>
          <button onClick={() => fetchActiveTrackingsByCity('37040')} className="action-btn">
            🚌 안동시 운행 버스
          </button>
          <button onClick={startBusLocationCollection} className="action-btn">
            🚌 버스 위치 수집 시작
          </button>
          <button onClick={fetchAllActiveTrackings} className="action-btn">
            🚌 전체 지역 운행 버스 조회
          </button>
        </div>
      </div>

      {/* 상태 표시 */}
      {loading && <div className="loading">⏳ 데이터 로딩 중...</div>}
      {error && <div className="error">❌ {error}</div>}

      {/* 통계 정보 */}
      <div className="stats">
        <h3>📈 통계 정보</h3>
        <p>전체 정류장 수: {stations.length}개</p>
        <p>검색 결과: {filteredStations.length}개</p>
        <p style={{cursor:'pointer', color:'#2980b9', textDecoration:'underline'}}
           onClick={() => setShowPredictedStations(v => !v)}>
          도착 예측 조회된 정류장: {predictedStations.length}개 (클릭 시 목록 보기)
        </p>
        
        {/* 버스 운행 추적 통계 */}
        {trackingStats && (
          <div className="tracking-stats">
            <h4>🚌 버스 운행 추적 통계</h4>
            <p><strong>운행 중인 버스:</strong> {trackingStats.totalActiveBuses}대</p>
            <p><strong>업데이트 시간:</strong> {new Date(trackingStats.timestamp).toLocaleString()}</p>
            <p style={{cursor:'pointer', color:'#e74c3c', textDecoration:'underline'}}
               onClick={() => setShowTrackingDetails(v => !v)}>
              운행 중인 버스 상세 정보 보기 (클릭)
            </p>
          </div>
        )}
      </div>

      {/* 운행 중인 버스 상세 정보 */}
      {showTrackingDetails && activeTrackings.length > 0 && (
        <div className="tracking-details">
          <h4>🚌 운행 중인 버스 상세 정보 ({activeTrackings.length}대)</h4>
          <div className="trackings-grid">
            {activeTrackings.map((tracking, idx) => (
              <div key={tracking.id || idx} className="tracking-card">
                <div className="tracking-header">
                  <h5>🚌 {tracking.vehicleNo}</h5>
                  <span className="route-info">{tracking.routeNo}번</span>
                </div>
                <div className="tracking-details">
                  <p><strong>노선 ID:</strong> {tracking.routeId}</p>
                  <p><strong>도시 코드:</strong> {tracking.cityCode}</p>
                  <p><strong>운행 시작:</strong> {new Date(tracking.startTime).toLocaleString()}</p>
                  <p><strong>방문 정류장:</strong> {tracking.totalStations}개</p>
                  <p><strong>총 운행 거리:</strong> {tracking.totalDistance}km</p>
                  <p><strong>총 운행 시간:</strong> {tracking.totalDuration}분</p>
                  <p><strong>평균 속도:</strong> {tracking.averageSpeed}km/h</p>
                </div>
                
                {/* 방문한 정류장 목록 */}
                {tracking.stationVisits && tracking.stationVisits.length > 0 && (
                  <div className="station-visits">
                    <h6>📍 방문한 정류장 ({tracking.stationVisits.length}개)</h6>
                    
                    {/* 경로 시각화 */}
                    <div className="route-visualization">
                      <h6>🛣️ 운행 경로</h6>
                      {tracking.stationVisits.length > 8 ? (
                        // 긴 경로는 요약 버전으로 표시
                        <div>
                          <div className="route-path route-summary">
                            {/* 첫 번째 정류장 */}
                            <div className="route-stop">
                              <div className="stop-marker">
                                <span className="stop-number">{tracking.stationVisits[0].stationSeq}</span>
                              </div>
                              <div className="stop-info">
                                <div className="stop-name">{tracking.stationVisits[0].stationNm}</div>
                                <div className="stop-time">
                                  {new Date(tracking.stationVisits[0].arrivalTime).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="route-arrow">→</div>
                            
                            {/* 중간 정류장들 (요약) */}
                            <div className="route-stop">
                              <div className="stop-marker" style={{background: '#95a5a6'}}>
                                <span className="stop-number">...</span>
                              </div>
                              <div className="stop-info">
                                <div className="stop-name">{tracking.stationVisits.length - 2}개 정류장</div>
                                <div className="stop-time">경유</div>
                              </div>
                            </div>
                            
                            <div className="route-arrow">→</div>
                            
                            {/* 마지막 정류장 */}
                            <div className="route-stop">
                              <div className="stop-marker">
                                <span className="stop-number">{tracking.stationVisits[tracking.stationVisits.length - 1].stationSeq}</span>
                              </div>
                              <div className="stop-info">
                                <div className="stop-name">{tracking.stationVisits[tracking.stationVisits.length - 1].stationNm}</div>
                                <div className="stop-time">
                                  {new Date(tracking.stationVisits[tracking.stationVisits.length - 1].arrivalTime).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 전체 경로 보기 버튼 */}
                          <button 
                            className="route-toggle"
                            onClick={() => {
                              const routeElement = document.getElementById(`route-${tracking.id || tracking.vehicleNo}`);
                              if (routeElement) {
                                routeElement.style.display = routeElement.style.display === 'none' ? 'flex' : 'none';
                              }
                            }}
                          >
                            📍 전체 경로 보기
                          </button>
                          
                          {/* 전체 경로 (기본적으로 숨김) */}
                          <div 
                            id={`route-${tracking.id || tracking.vehicleNo}`}
                            className="route-path"
                            style={{display: 'none', marginTop: '10px'}}
                          >
                            {tracking.stationVisits.map((visit, visitIdx) => (
                              <div key={visitIdx} className="route-stop">
                                <div className="stop-marker">
                                  <span className="stop-number">{visit.stationSeq}</span>
                                </div>
                                <div className="stop-info">
                                  <div className="stop-name">{visit.stationNm}</div>
                                  <div className="stop-time">
                                    {new Date(visit.arrivalTime).toLocaleTimeString()}
                                  </div>
                                </div>
                                {visitIdx < tracking.stationVisits.length - 1 && (
                                  <div className="route-arrow">→</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // 짧은 경로는 전체 표시
                        <div className="route-path">
                          {tracking.stationVisits.map((visit, visitIdx) => (
                            <div key={visitIdx} className="route-stop">
                              <div className="stop-marker">
                                <span className="stop-number">{visit.stationSeq}</span>
                              </div>
                              <div className="stop-info">
                                <div className="stop-name">{visit.stationNm}</div>
                                <div className="stop-time">
                                  {new Date(visit.arrivalTime).toLocaleTimeString()}
                                </div>
                              </div>
                              {visitIdx < tracking.stationVisits.length - 1 && (
                                <div className="route-arrow">→</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="visits-list">
                      {tracking.stationVisits.slice(-5).map((visit, visitIdx) => (
                        <div key={visitIdx} className="visit-item">
                          <span className="station-name">{visit.stationNm}</span>
                          <span className="visit-time">
                            {new Date(visit.arrivalTime).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                      {tracking.stationVisits.length > 5 && (
                        <div className="more-visits">
                          ... 그리고 {tracking.stationVisits.length - 5}개 더
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 도착 예측 기록 */}
                {tracking.predictions && tracking.predictions.length > 0 && (
                  <div className="prediction-history">
                    <h6>🔮 예측 기록 ({tracking.predictions.length}개)</h6>
                    <div className="predictions-list">
                      {tracking.predictions.slice(-3).map((pred, predIdx) => (
                        <div key={predIdx} className="prediction-item">
                          <span className="pred-station">{pred.stationNm}</span>
                          <span className="pred-time">{pred.predictedMinutes}분</span>
                          <span className="pred-accuracy">
                            정확도: {Math.round(pred.accuracy * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 버스 노선 추적 요약 정보 */}
      {activeTrackings.length > 0 && (
        <div className="tracking-summary">
          <h4>📊 버스 노선 추적 요약</h4>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">총 운행 버스:</span>
              <span className="summary-value">{activeTrackings.length}대</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">총 방문 정류장:</span>
              <span className="summary-value">
                {activeTrackings.reduce((total, tracking) => total + (tracking.totalStations || 0), 0)}개
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">총 운행 거리:</span>
              <span className="summary-value">
                {activeTrackings.reduce((total, tracking) => total + (tracking.totalDistance || 0), 0).toFixed(1)}km
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">평균 운행 시간:</span>
              <span className="summary-value">
                {Math.round(activeTrackings.reduce((total, tracking) => total + (tracking.totalDuration || 0), 0) / activeTrackings.length)}분
              </span>
            </div>
          </div>
          
          {/* 도시별 운행 버스 분포 */}
          <div className="city-distribution">
            <h5>🏙️ 도시별 운행 버스 분포</h5>
            <div className="city-stats">
              {Object.entries(activeTrackings.reduce((acc, tracking) => {
                acc[tracking.cityCode] = (acc[tracking.cityCode] || 0) + 1;
                return acc;
              }, {})).map(([cityCode, count]) => (
                <div key={cityCode} className="city-stat">
                  <span className="city-code">도시 {cityCode}:</span>
                  <span className="city-count">{count}대</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 도시별 상세 통계 */}
          {cityStats && cityStats.cityStats && (
            <div className="city-detailed-stats">
              <h5>📊 도시별 상세 통계</h5>
              <div className="city-detailed-grid">
                {Object.entries(cityStats.cityStats).map(([cityCode, stats]) => (
                  <div key={cityCode} className="city-detailed-stat">
                    <div className="city-header">
                      <h6>도시 {cityCode}</h6>
                      <span className="city-bus-count">{stats.totalBuses}대</span>
                    </div>
                    <div className="city-metrics">
                      <div className="metric">
                        <span className="metric-label">총 정류장:</span>
                        <span className="metric-value">{stats.totalStations}개</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">총 거리:</span>
                        <span className="metric-value">{stats.totalDistance.toFixed(1)}km</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">총 시간:</span>
                        <span className="metric-value">{stats.totalDuration}분</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">평균 거리:</span>
                        <span className="metric-value">
                          {stats.totalBuses > 0 ? (stats.totalDistance / stats.totalBuses).toFixed(1) : 0}km
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 도착 예측된 정류장만 별도 표시 */}
      {showPredictedStations && (
        <div className="predicted-stations-list">
          <h4>🟢 도착 예측된 정류장 20개</h4>
          <div className="stations-grid">
            {predictedStations.map((station, idx) => {
              const predictions = arrivalPredictions[station.stationId];
              return (
                <div key={station._id || idx} className="station-card">
                  <div className="station-header">
                    <h4>{station.stationNm || '정류장명 없음'}</h4>
                    <span className="station-id">{station.stationId}</span>
                  </div>
                  <div className="station-details">
                    <p><strong>도시:</strong> {station.cityName || 'N/A'}</p>
                    <p><strong>도시코드:</strong> {station.cityCode || 'N/A'}</p>
                    <p><strong>정류장번호:</strong> {station.stationNo || 'N/A'}</p>
                    <p><strong>관리도시:</strong> {station.managementCity || 'N/A'}</p>
                    <p><strong>위치:</strong> {station.gpsY}, {station.gpsX}</p>
                    <p><strong>수집일:</strong> {new Date(station.collectedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="arrival-predictions">
                    <h5>🚌 버스 도착 정보</h5>
                    {predictions.arrivals && predictions.arrivals.length > 0 ? (
                      <div className="arrivals-list">
                        {predictions.arrivals.map((arrival, idx2) => (
                          <div key={idx2} className="arrival-item">
                            <span className="route-name">{arrival.routeNm}</span>
                            <span className="arrival-time">{arrival.estimatedArrivalMinutes}분</span>
                            <span className="distance">({arrival.distanceKm}km)</span>
                            <span className={`traffic ${arrival.trafficCondition}`}>{arrival.trafficCondition}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-arrivals">🚫 도착 예정 버스 없음</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 정류장 목록 */}
      <div className="stations-container">
        <h3>📍 정류장 목록</h3>
        {filteredStations.length === 0 ? (
          <div className="no-data">정류장 데이터가 없습니다.</div>
        ) : (
          <div className="stations-grid">
            {filteredStations.slice(0, 50).map((station, index) => {
              const predictions = arrivalPredictions[station.stationId];
              return (
                <div key={station._id || index} className="station-card">
                  <div className="station-header">
                    <h4>{station.stationNm || '정류장명 없음'}</h4>
                    <span className="station-id">{station.stationId}</span>
                  </div>
                  <div className="station-details">
                    <p><strong>도시:</strong> {station.cityName || 'N/A'}</p>
                    <p><strong>도시코드:</strong> {station.cityCode || 'N/A'}</p>
                    <p><strong>정류장번호:</strong> {station.stationNo || 'N/A'}</p>
                    <p><strong>관리도시:</strong> {station.managementCity || 'N/A'}</p>
                    <p><strong>위치:</strong> {station.gpsY}, {station.gpsX}</p>
                    <p><strong>수집일:</strong> {new Date(station.collectedAt).toLocaleDateString()}</p>
                  </div>
                  
                  {/* 도착 예측 정보 */}
                  <div className="arrival-predictions">
                    <h5>🚌 버스 도착 정보</h5>
                    {!predictions ? (
                      <div className="loading-predictions">⏳ 도착 예측 로딩 중...</div>
                    ) : predictions.error ? (
                      <div className="prediction-error">❌ {predictions.error}</div>
                    ) : predictions.arrivals && predictions.arrivals.length > 0 ? (
                      <div className="arrivals-list">
                        {predictions.arrivals.map((arrival, idx) => (
                          <div key={idx} className="arrival-item">
                            <span className="route-name">{arrival.routeNm}</span>
                            <span className="arrival-time">{arrival.estimatedArrivalMinutes}분</span>
                            <span className="distance">({arrival.distanceKm}km)</span>
                            <span className={`traffic ${arrival.trafficCondition}`}>
                              {arrival.trafficCondition}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-arrivals">🚫 도착 예정 버스 없음</div>
                    )}
                    <button 
                      onClick={() => fetchArrivalPredictions(station.stationId, station.stationNm)}
                      className="refresh-btn"
                    >
                      🔄 새로고침
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 더 많은 정류장이 있는 경우 */}
      {filteredStations.length > 50 && (
        <div className="more-data">
          <p>... 그리고 {filteredStations.length - 50}개의 정류장이 더 있습니다.</p>
        </div>
      )}
    </div>
  );
};

export default BusStationViewer; 