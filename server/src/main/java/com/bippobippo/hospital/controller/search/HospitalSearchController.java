package com.bippobippo.hospital.controller.search;

import com.bippobippo.hospital.elasticsearch.service.HospitalSearchService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalSearchController {

    private static final Logger logger = LoggerFactory.getLogger(HospitalSearchController.class);
    private final HospitalSearchService hospitalSearchService;

    @GetMapping("/search")
    public Map<String, Object> searchHospitals(
            @RequestParam(defaultValue = "1") String page,
            @RequestParam(defaultValue = "10") String limit,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double x,
            @RequestParam(required = false) Double y,
            @RequestParam(defaultValue = "10km") String distance,
            @RequestParam(required = false) String operating) {

        logger.info("병원 검색 요청 받음 - page: {}, limit: {}, query: {}, region: {}, category: {}, major: {}, operating: {}", 
            page, limit, query, region, category, major, operating);

        Map<String, Object> searchParams = new HashMap<>();
        searchParams.put("page", page);
        searchParams.put("limit", limit);
        searchParams.put("region", region);
        searchParams.put("subject", subject);
        searchParams.put("category", category);
        searchParams.put("major", major);
        searchParams.put("query", query);
        searchParams.put("x", x);
        searchParams.put("y", y);
        searchParams.put("distance", distance);
        searchParams.put("operating", operating);

        try {
            logger.info("HospitalSearchService 호출 시작");
            Map<String, Object> result = hospitalSearchService.searchHospitals(searchParams);
            logger.info("병원 검색 성공 - 결과 수: {}", result.get("totalCount"));
            return result;
        } catch (Exception e) {
            logger.error("병원 검색 중 오류 발생:", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "검색 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.put("details", e.toString());
            return errorResponse;
        }
    }
} 