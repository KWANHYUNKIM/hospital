package com.bippobippo.hospital.dto.response.hospital;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class HospitalDataResponse {
    private String id;
    private String yadmNm;
    private String addr;
    private String major;
    private String region;
    private String category;
    private List<String> subjects;
    private Location location;
    private Schedule schedule;
    private Times times;

    @Getter
    @Setter
    public static class Location {
        private double lat;
        private double lon;
    }

    @Getter
    @Setter
    public static class Schedule {
        private DaySchedule monday;
        private DaySchedule tuesday;
        private DaySchedule wednesday;
        private DaySchedule thursday;
        private DaySchedule friday;
        private DaySchedule saturday;
        private DaySchedule sunday;
    }

    @Getter
    @Setter
    public static class DaySchedule {
        private String openTime;
        private String closeTime;
    }

    @Getter
    @Setter
    public static class Times {
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