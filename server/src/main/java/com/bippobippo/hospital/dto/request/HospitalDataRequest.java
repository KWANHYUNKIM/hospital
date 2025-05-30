package com.bippobippo.hospital.dto.request;

import lombok.Getter;
import lombok.Setter;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Getter
@Setter
public class HospitalDataRequest {
    @NotBlank(message = "병원명은 필수입니다")
    private String yadmNm;
    
    @NotBlank(message = "주소는 필수입니다")
    private String addr;
    
    private String major;
    private String region;
    private String category;
    private List<String> subjects;
    
    @Valid
    private LocationRequest location;
    
    @Valid
    private ScheduleRequest schedule;
    
    @Valid
    private TimesRequest times;
    
    @Getter
    @Setter
    public static class LocationRequest {
        @NotNull(message = "위도는 필수입니다")
        private Double lat;
        
        @NotNull(message = "경도는 필수입니다")
        private Double lon;
    }

    @Getter
    @Setter
    public static class ScheduleRequest {
        private DayScheduleRequest monday;
        private DayScheduleRequest tuesday;
        private DayScheduleRequest wednesday;
        private DayScheduleRequest thursday;
        private DayScheduleRequest friday;
        private DayScheduleRequest saturday;
        private DayScheduleRequest sunday;
    }

    @Getter
    @Setter
    public static class DayScheduleRequest {
        private String openTime;
        private String closeTime;
    }

    @Getter
    @Setter
    public static class TimesRequest {
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
        private String trmtSunStart;
        private String trmtSunEnd;
    }
} 