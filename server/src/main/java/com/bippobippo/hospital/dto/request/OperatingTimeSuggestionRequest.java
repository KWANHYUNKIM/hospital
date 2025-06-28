package com.bippobippo.hospital.dto.request;

import lombok.Data;

@Data
public class OperatingTimeSuggestionRequest {
    private String hospitalId;
    private String hospitalName;
    private String suggestion;
    
    // 현재 영업시간 데이터
    private String trmtMonStart;
    private String trmtMonEnd;
    private String trmtTueStart;
    private String trmtTueEnd;
    private String trmtWedStart;
    private String trmtWedEnd;
    private String trmtThuStart;
    private String trmtThuEnd;
    private String trmtFriStart;
    private String trmtFriEnd;
    private String trmtSatStart;
    private String trmtSatEnd;
    private String noTrmtSun;
    private String noTrmtHoli;
    private String lunchWeek;
    
    // 제안된 영업시간 데이터
    private String suggestedTrmtMonStart;
    private String suggestedTrmtMonEnd;
    private String suggestedTrmtTueStart;
    private String suggestedTrmtTueEnd;
    private String suggestedTrmtWedStart;
    private String suggestedTrmtWedEnd;
    private String suggestedTrmtThuStart;
    private String suggestedTrmtThuEnd;
    private String suggestedTrmtFriStart;
    private String suggestedTrmtFriEnd;
    private String suggestedTrmtSatStart;
    private String suggestedTrmtSatEnd;
    private String suggestedNoTrmtSun;
    private String suggestedNoTrmtHoli;
    private String suggestedLunchWeek;
} 