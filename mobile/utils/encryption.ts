import CryptoJS from 'crypto-js';

// 암호화 키 - 실제 앱에서는 보안이 강화된 방식으로 관리해야 함
const ENCRYPTION_KEY = 'your-secret-key-32-characters-long';

/**
 * 짧은 ID 생성 (8자리)
 * @param text 원본 텍스트
 * @returns 8자리 해시 ID
 */
export const generateShortId = (text: string): string => {
  return CryptoJS.SHA256(text).toString().substring(0, 8);
};

/**
 * 텍스트 암호화
 * @param text 암호화할 텍스트
 * @returns 암호화된 텍스트 (짧은ID:암호화데이터 형식)
 */
export const encrypt = (text: string): string => {
  try {
    // 짧은 ID 생성
    const shortId = generateShortId(text);
    
    // AES 암호화
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    
    // 짧은 ID와 암호화된 데이터를 콜론으로 구분하여 반환
    return `${shortId}:${encrypted}`;
  } catch (error) {
    console.error('암호화 오류:', error);
    throw new Error('암호화 실패');
  }
};

/**
 * 텍스트 복호화
 * @param encryptedText 암호화된 텍스트
 * @returns 복호화된 원본 텍스트
 */
export const decrypt = (encryptedText: string): string => {
  try {
    const textParts = encryptedText.split(':');
    if (textParts.length !== 2) {
      throw new Error('잘못된 암호화 텍스트 형식');
    }

    const encrypted = textParts[1];
    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error('복호화 실패 - 잘못된 키 또는 데이터');
    }
    
    return result;
  } catch (error) {
    console.error('복호화 오류:', error);
    throw new Error('복호화 실패');
  }
};

/**
 * ID 암호화
 * @param id 암호화할 ID (숫자 또는 문자열)
 * @returns 암호화된 ID
 */
export const encryptId = (id: number | string): string => {
  try {
    const idString = id.toString();
    
    // 짧은 ID 생성
    const shortId = generateShortId(idString);
    
    // AES 암호화
    const encrypted = CryptoJS.AES.encrypt(idString, ENCRYPTION_KEY).toString();
    
    // 짧은 ID와 암호화된 데이터를 콜론으로 구분하여 반환
    return `${shortId}:${encrypted}`;
  } catch (error) {
    console.error('ID 암호화 실패:', error);
    return id.toString(); // 실패 시 원본 ID 반환
  }
};

/**
 * ID 복호화
 * @param encryptedId 암호화된 ID
 * @returns 복호화된 원본 ID
 */
export const decryptId = (encryptedId: string): string => {
  try {
    const textParts = encryptedId.split(':');
    if (textParts.length !== 2) {
      throw new Error('잘못된 암호화 ID 형식');
    }

    const encrypted = textParts[1];
    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error('ID 복호화 실패');
    }
    
    return result;
  } catch (error) {
    console.error('ID 복호화 실패:', error);
    return encryptedId; // 실패 시 원본 반환
  }
};

/**
 * 안전한 데이터 저장을 위한 암호화
 * @param data 저장할 데이터 객체
 * @returns 암호화된 JSON 문자열
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return encrypt(jsonString);
  } catch (error) {
    console.error('데이터 암호화 실패:', error);
    throw new Error('데이터 암호화 실패');
  }
};

/**
 * 암호화된 데이터 복호화
 * @param encryptedData 암호화된 JSON 문자열
 * @returns 복호화된 데이터 객체
 */
export const decryptData = (encryptedData: string): any => {
  try {
    const jsonString = decrypt(encryptedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('데이터 복호화 실패:', error);
    throw new Error('데이터 복호화 실패');
  }
}; 