package com.bippobippo.hospital.dto.response.hospital;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;

import java.util.List;

@Getter
@Setter
@Builder
public class HospitalNearbyResponse {
    private String ykiho; // 요양기관번호
    private String name;
    private String address;
    private String phone;
    private Double latitude;
    private Double longitude;
    private Double distance; // 현재 위치로부터의 거리 (미터)
    private List<HospitalSubjectResponse> subjects;
    private List<HospitalTimeResponse> times;

    @Getter
    @Setter
    @Builder
    public static class HospitalSubjectResponse {
        private String ykiho;
        private String subjectCode;
        private String subjectName;
    }

    @Getter
    @Setter
    @Builder
    public static class HospitalTimeResponse {
        private String ykiho;
        private String dayOfWeek;
        private String openTime;
        private String closeTime;
        private Boolean isHoliday;
    }
} 