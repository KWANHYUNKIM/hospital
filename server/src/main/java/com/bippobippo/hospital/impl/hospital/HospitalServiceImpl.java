package com.bippobippo.hospital.impl.hospital;

import com.bippobippo.hospital.dto.response.hospital.HospitalNearbyResponse;
import com.bippobippo.hospital.entity.hospital.Hospital;
import com.bippobippo.hospital.entity.hospital.HospitalSubject;
import com.bippobippo.hospital.entity.hospital.HospitalTime;
import com.bippobippo.hospital.repository.hospital.HospitalRepository;
import com.bippobippo.hospital.repository.hospital.HospitalSubjectRepository;
import com.bippobippo.hospital.repository.hospital.HospitalTimeRepository;
import com.bippobippo.hospital.service.hospital.HospitalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalSubjectRepository hospitalSubjectRepository;
    private final HospitalTimeRepository hospitalTimeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HospitalNearbyResponse> findNearbyHospitals(Double latitude, Double longitude, Integer radius) {
        // 위치 기반으로 반경 내 병원 검색
        List<Hospital> hospitals = hospitalRepository.findNearbyHospitals(latitude, longitude, radius, PageRequest.of(0, 10));

        return hospitals.stream()
            .map(hospital -> {
                // 진료과목 조회
                List<HospitalSubject> subjects = hospitalSubjectRepository.findByYkiho(hospital.getYkiho());
                // 진료시간 조회
                List<HospitalTime> times = hospitalTimeRepository.findByYkiho(hospital.getYkiho());

                return HospitalNearbyResponse.builder()
                    .ykiho(hospital.getYkiho())
                    .name(hospital.getName())
                    .address(hospital.getAddress())
                    .phone(hospital.getPhone())
                    .latitude(hospital.getLatitude())
                    .longitude(hospital.getLongitude())
                    .distance(calculateDistance(latitude, longitude, hospital.getLatitude(), hospital.getLongitude()))
                    .subjects(subjects.stream()
                        .map(subject -> HospitalNearbyResponse.HospitalSubjectResponse.builder()
                            .ykiho(subject.getYkiho())
                            .subjectCode(subject.getSubjectCode())
                            .subjectName(subject.getSubjectName())
                            .build())
                        .collect(Collectors.toList()))
                    .times(times.stream()
                        .map(time -> HospitalNearbyResponse.HospitalTimeResponse.builder()
                            .ykiho(time.getYkiho())
                            .dayOfWeek(time.getDayOfWeek())
                            .openTime(time.getOpenTime())
                            .closeTime(time.getCloseTime())
                            .isHoliday(time.getIsHoliday())
                            .build())
                        .collect(Collectors.toList()))
                    .build();
            })
            .collect(Collectors.toList());
    }

    private Double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int R = 6371000; // 지구 반경 (미터)
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
} 