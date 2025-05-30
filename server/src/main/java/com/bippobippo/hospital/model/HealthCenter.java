package com.bippobippo.hospital.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "hospital_healthcenter")
public class HealthCenter {
    @Id
    private String id;
    private String yadmNm; // 건강증진센터명
    private String clCdNm; // 건강증진센터구분
    private String addr; // 소재지도로명주소
    private String jibunAddr; // 소재지지번주소
    private Double YPos; // 위도
    private Double XPos; // 경도
    private String bizCont; // 건강증진업무내용
    private String startTime; // 운영시작시각
    private String endTime; // 운영종료시각
    private String holidayInfo; // 휴무일정보
    private Double buildingArea; // 건물면적
    private Integer drTotCnt; // 의사수
    private Integer pnursCnt; // 간호사수
    private Integer socialWorkerCnt; // 사회복지사수
    private Integer nutritionistCnt; // 영양사수
    private String etcPersonnelStatus; // 기타인력현황
    private String etcUseInfo; // 기타이용안내
    private String telno; // 운영기관전화번호
    private String operOrgNm; // 운영기관명
    private String mgrTelno; // 관리기관전화번호
    private String mgrOrgNm; // 관리기관명
    private Date dataStdDt; // 데이터기준일자
    private String providerCd; // 시도코드
    private String providerNm; // 시도명
    private Date createdAt;
    private Date updatedAt;
} 