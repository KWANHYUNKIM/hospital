package com.bippobippo.hospital.controller.hospital;

import com.bippobippo.hospital.dto.request.search.NursingHospitalSearchRequest;
import com.bippobippo.hospital.dto.response.search.NursingHospitalSearchResponse;
import com.bippobippo.hospital.model.NursingHospital;
import com.bippobippo.hospital.service.hospital.NursingHospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nursing-hospitals")
@RequiredArgsConstructor
public class NursingHospitalController {
    private final NursingHospitalService nursingHospitalService;

    @GetMapping("/search")
    public NursingHospitalSearchResponse searchHospitals(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double x,
            @RequestParam(required = false) Double y,
            @RequestParam(defaultValue = "10km") String distance) {
        
        // 요청 파라미터 로깅
        System.out.println("요양병원 검색 요청 - page: " + page + ", limit: " + limit + 
                          ", region: " + region + ", query: " + query + 
                          ", x: " + x + ", y: " + y + ", distance: " + distance);
        
        NursingHospitalSearchRequest request = NursingHospitalSearchRequest.builder()
                .page(page)
                .limit(limit)
                .region(region)
                .query(query)
                .x(x)
                .y(y)
                .distance(distance)
                .build();
        
        return nursingHospitalService.searchHospitals(request);
    }

    @GetMapping("/autoComplete")
    public ResponseEntity<Map<String, List<Map<String, String>>>> autoComplete(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(nursingHospitalService.autoComplete(query));
    }

    @GetMapping("/{ykiho}")
    public ResponseEntity<NursingHospital> getHospitalById(@PathVariable String ykiho) {
        return ResponseEntity.ok(nursingHospitalService.getHospitalById(ykiho));
    }

    @GetMapping("/hospital/{ykiho}")
    public ResponseEntity<Map<String, Object>> getHospitalDetail(@PathVariable String ykiho) {
        return ResponseEntity.ok(nursingHospitalService.getHospitalDetail(ykiho));
    }
} 