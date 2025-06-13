import axios from '../utils/axios';
import { getApiUrl } from '../utils/api';

// 타입 정의
interface Bounds {
  sw: {
    lat: number;
    lng: number;
  };
  ne: {
    lat: number;
    lng: number;
  };
}

interface AreaSummary {
  areaCode: string;
  areaName: string;
  hospitalCount: number;
  pharmacyCount: number;
  latitude: number;
  longitude: number;
  level: 'ctp' | 'sig' | 'emd' | 'ri';
}

interface BoundaryData {
  id: string;
  name: string;
  coordinates: number[][][];
  properties: Record<string, any>;
}

interface MapData {
  hospitals: any[];
  pharmacies: any[];
  boundaries: BoundaryData[];
}

interface LocationSearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
}

interface MedicalStats {
  totalHospitals: number;
  totalPharmacies: number;
  totalHealthCenters: number;
  emergencyHospitals: number;
  nightServiceHospitals: number;
}

interface ClusterData {
  latitude: number;
  longitude: number;
  count: number;
  hospitals: number;
  pharmacies: number;
  radius: number;
}

interface CacheStatus {
  isCached: boolean;
  lastUpdated?: string;
  expiresAt?: string;
}

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

/**
 * 줌 레벨에 따른 행정구역 타입 결정
 * @param zoom 줌 레벨
 * @returns 행정구역 타입
 */
const getAreaTypeByZoom = (zoom: number): 'ctp' | 'sig' | 'emd' | 'ri' => {
  if (zoom >= 15) return 'ri';
  if (zoom >= 13) return 'emd';
  if (zoom >= 11) return 'sig';
  return 'ctp';
};

/**
 * 기본 지도 데이터 조회
 * @returns Promise<MapData> 기본 지도 데이터
 */
export const fetchMapData = async (): Promise<MapData> => {
  const response = await axios.get('/api/map-data');
  return response.data;
};

/**
 * type별 map 데이터 조회
 * @param type 지도 데이터 타입
 * @param bounds 지도 경계 (선택사항)
 * @returns Promise<MapData> 지도 데이터
 */
export const fetchMapTypeData = async (type: string, bounds: Partial<Bounds> = {}): Promise<MapData> => {
  try {
    const response = await axios.get(`${baseUrl}/api/map/map-data`, { 
      params: { type, ...bounds } 
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching map type data:', error);
    throw error;
  }
};

/**
 * 지도 검색 API
 * @param query 검색어
 * @returns Promise<LocationSearchResult[]> 검색 결과
 */
export const searchLocation = async (query: string): Promise<LocationSearchResult[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/map/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('위치 검색 실패:', error);
    throw error;
  }
};

/**
 * 시도별 병원/약국 요약 데이터 가져오기
 * @returns Promise<AreaSummary[]> 시도별 요약 데이터
 */
export const fetchMapSummary = async (): Promise<AreaSummary[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/map/summary`);
    return response.data;
  } catch (error) {
    console.error('지도 요약 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 의료기관 통계 데이터 조회
 * @returns Promise<MedicalStats> 의료기관 통계
 */
export const fetchMedicalStats = async (): Promise<MedicalStats> => {
  try {
    const response = await axios.get(`${baseUrl}/api/map_data/stats`);
    console.log('의료기관 통계 데이터:', response.data);
    return response.data;
  } catch (error) {
    console.error('의료기관 통계 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 시도 경계 데이터 조회
 * @param params 좌표 파라미터
 * @returns Promise<BoundaryData> 시도 경계 데이터
 */
export const fetchCtpBoundary = async (params: { lat: number; lng: number }): Promise<BoundaryData> => {
  try {
    if (!params.lat || !params.lng) {
      throw new Error('좌표가 필요합니다.');
    }
    const response = await axios.get(`${baseUrl}/api/geo/ctp/coordinates`, {
      params: {
        lat: params.lat,
        lng: params.lng
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching ctp boundary:', error);
    throw error;
  }
};

/**
 * 시군구 경계 데이터 조회
 * @param params 좌표 파라미터
 * @returns Promise<BoundaryData> 시군구 경계 데이터
 */
export const fetchSigBoundary = async (params: { lat: number; lng: number }): Promise<BoundaryData> => {
  try {
    if (!params.lat || !params.lng) {
      throw new Error('좌표가 필요합니다.');
    }
    const response = await axios.get(`${baseUrl}/api/geo/sig/coordinates`, {
      params: {
        lat: params.lat,
        lng: params.lng
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching sig boundary:', error);
    throw error;
  }
};

/**
 * 읍면동 경계 데이터 조회
 * @param params 좌표 파라미터
 * @returns Promise<BoundaryData> 읍면동 경계 데이터
 */
export const fetchEmdBoundary = async (params: { lat: number; lng: number }): Promise<BoundaryData> => {
  try {
    if (!params.lat || !params.lng) {
      throw new Error('좌표가 필요합니다.');
    }
    const response = await axios.get(`${baseUrl}/api/geo/emd/coordinates`, {
      params: {
        lat: params.lat,
        lng: params.lng
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching emd boundary:', error);
    throw error;
  }
};

/**
 * 읍면동별 좌표+집계 (바운드 파라미터 지원)
 * @param params 바운드 및 좌표 파라미터
 * @returns Promise<AreaSummary[]> 읍면동 요약 데이터
 */
export const fetchEmdongSummary = async (params: {
  swLat?: number;
  swLng?: number;
  neLat?: number;
  neLng?: number;
  lat?: number;
  lng?: number;
  zoom?: number;
} = {}): Promise<AreaSummary[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/map/emdong-summary`, { 
      params: {
        swLat: params.swLat,
        swLng: params.swLng,
        neLat: params.neLat,
        neLng: params.neLng,
        lat: params.lat,
        lng: params.lng,
        zoom: params.zoom
      }
    });
    return response.data;
  } catch (error) {
    console.error('읍면동 요약 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 리 경계 데이터 조회
 * @param params 좌표 파라미터
 * @returns Promise<BoundaryData> 리 경계 데이터
 */
export const fetchLiBoundary = async (params: { lat: number; lng: number }): Promise<BoundaryData> => {
  try {
    if (!params.lat || !params.lng) {
      throw new Error('좌표가 필요합니다.');
    }
    const response = await axios.get(`${baseUrl}/api/geo/li/coordinates`, {
      params: {
        lat: params.lat,
        lng: params.lng
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching li boundary:', error);
    throw error;
  }
};

/**
 * 통합된 지역 요약 데이터 조회 함수
 * @param bounds 지도 경계
 * @param zoom 줌 레벨
 * @returns Promise<AreaSummary[]> 지역 요약 데이터
 */
export const fetchAreaSummary = async (bounds: Bounds, zoom: number): Promise<AreaSummary[]> => {
  try {
    const areaType = getAreaTypeByZoom(zoom);
    const response = await axios.get(`${baseUrl}/api/map/map-summary/${areaType}`, {
      params: {
        swLat: bounds.sw.lat,
        swLng: bounds.sw.lng,
        neLat: bounds.ne.lat,
        neLng: bounds.ne.lng
      }
    });
    return response.data;
  } catch (error) {
    console.error('지역 요약 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 지역 요약 데이터 캐시 상태 확인
 * @param bounds 지도 경계
 * @param zoom 줌 레벨
 * @returns Promise<CacheStatus> 캐시 상태
 */
export const checkAreaSummaryCacheStatus = async (bounds: Bounds, zoom: number): Promise<CacheStatus> => {
  try {
    const response = await axios.get(`${baseUrl}/api/map/map-summary/cache-status`, {
      params: {
        swLat: bounds.sw.lat,
        swLng: bounds.sw.lng,
        neLat: bounds.ne.lat,
        neLng: bounds.ne.lng,
        zoomLevel: zoom
      }
    });
    return response.data;
  } catch (error) {
    console.error('지역 요약 데이터 캐시 상태 확인 실패:', error);
    throw error;
  }
};

/**
 * 캐시된 지역 요약 데이터 조회
 * @param bounds 지도 경계
 * @param zoom 줌 레벨
 * @returns Promise<AreaSummary[]> 캐시된 지역 요약 데이터
 */
export const fetchCachedAreaSummary = async (bounds: Bounds, zoom: number): Promise<AreaSummary[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/map/map-summary/cached`, {
      params: {
        swLat: bounds.sw.lat,
        swLng: bounds.sw.lng,
        neLat: bounds.ne.lat,
        neLng: bounds.ne.lng,
        zoomLevel: zoom
      }
    });
    return response.data;
  } catch (error) {
    console.error('캐시된 지역 요약 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 경계 데이터 조회 (Redis 캐시 활용)
 * @param boundaryId 경계 ID
 * @param type 경계 타입
 * @returns Promise<BoundaryData> 경계 데이터
 */
export const fetchBoundaryWithCache = async (boundaryId: string, type: string): Promise<BoundaryData> => {
  try {
    const response = await axios.get(`${baseUrl}/api/boundaries/${type}/${boundaryId}`);
    return response.data;
  } catch (error) {
    console.error('경계 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 경계 데이터 캐시 상태 확인
 * @param boundaryId 경계 ID
 * @param type 경계 타입
 * @returns Promise<CacheStatus> 캐시 상태
 */
export const checkBoundaryCacheStatus = async (boundaryId: string, type: string): Promise<CacheStatus> => {
  try {
    const response = await axios.get(`${baseUrl}/api/boundaries/cache-status/${type}/${boundaryId}`);
    return response.data;
  } catch (error) {
    console.error('캐시 상태 확인 실패:', error);
    throw error;
  }
};

/**
 * 경계 데이터 일괄 캐싱
 * @param boundaryIds 경계 ID 목록
 * @returns Promise<any> 캐싱 결과
 */
export const cacheBoundariesBatch = async (boundaryIds: string[]): Promise<any> => {
  try {
    const response = await axios.post(`${baseUrl}/api/boundaries/cache-batch`, {
      boundaryIds
    });
    return response.data;
  } catch (error) {
    console.error('일괄 캐싱 실패:', error);
    throw error;
  }
};

/**
 * 클러스터 데이터 조회
 * @param bounds 지도 경계
 * @returns Promise<ClusterData[]> 클러스터 데이터
 */
export const fetchClusterData = async (bounds: Bounds): Promise<ClusterData[]> => {
  try {
    const { sw, ne } = bounds;
    const centerLat = (sw.lat + ne.lat) / 2;
    const centerLng = (sw.lng + ne.lng) / 2;
    
    const response = await axios.get(`${baseUrl}/api/map/map-summary/clusters`, {
      params: {
        swLat: sw.lat,
        swLng: sw.lng,
        neLat: ne.lat,
        neLng: ne.lng,
        centerLat,
        centerLng,
        radius: 5
      }
    });
    return response.data;
  } catch (error) {
    console.error('클러스터 데이터 조회 실패:', error);
    return [];
  }
};

/**
 * 맵 클러스터 데이터 조회
 * @param bounds 지도 경계
 * @param zoomLevel 줌 레벨
 * @returns Promise<ClusterData[]> 맵 클러스터 데이터
 */
export const fetchMapClusterData = async (bounds: Bounds, zoomLevel: number): Promise<ClusterData[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/map/map-summary/mapCluster`, {
      params: {
        swLat: bounds.sw.lat,
        swLng: bounds.sw.lng,
        neLat: bounds.ne.lat,
        neLng: bounds.ne.lng,
        zoomLevel
      }
    });
    return response.data;
  } catch (error) {
    console.error('맵 클러스터 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 경계 geometry 데이터 조회
 * @param boundaryType 경계 타입
 * @param name 경계 이름
 * @returns Promise<BoundaryData> 경계 geometry 데이터
 */
export const fetchBoundaryGeometry = async (boundaryType: string, name: string): Promise<BoundaryData> => {
  try {
    const response = await axios.get(`${baseUrl}/api/map/map-summary/boundary-geometry`, {
      params: {
        boundaryType,
        name
      }
    });
    return response.data;
  } catch (error) {
    console.error('경계 geometry 데이터 조회 실패:', error);
    throw error;
  }
};

export default {
  fetchMapData,
  fetchMapTypeData,
  searchLocation,
  fetchMapSummary,
  fetchMedicalStats,
  fetchCtpBoundary,
  fetchSigBoundary,
  fetchEmdBoundary,
  fetchEmdongSummary,
  fetchLiBoundary,
  fetchAreaSummary,
  checkAreaSummaryCacheStatus,
  fetchCachedAreaSummary,
  fetchBoundaryWithCache,
  checkBoundaryCacheStatus,
  cacheBoundariesBatch,
  fetchClusterData,
  fetchMapClusterData,
  fetchBoundaryGeometry,
}; 