package com.bippobippo.hospital.service;

import com.bippobippo.hospital.model.HealthCenter;
import com.bippobippo.hospital.repository.HealthCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import static java.util.Map.entry;

@Service
@RequiredArgsConstructor
public class HealthCenterService {
    private final HealthCenterRepository healthCenterRepository;
    private final MongoTemplate mongoTemplate;

    private static final Map<String, List<String>> REGION_MAPPING = Map.ofEntries(
        entry("서울", Arrays.asList("서울", "서울시", "서울특별시")),
        entry("부산", Arrays.asList("부산", "부산시", "부산광역시")),
        entry("대구", Arrays.asList("대구", "대구시", "대구광역시")),
        entry("인천", Arrays.asList("인천", "인천시", "인천광역시")),
        entry("광주", Arrays.asList("광주", "광주시", "광주광역시")),
        entry("대전", Arrays.asList("대전", "대전시", "대전광역시")),
        entry("울산", Arrays.asList("울산", "울산시", "울산광역시")),
        entry("세종", Arrays.asList("세종", "세종시", "세종특별자치시")),
        entry("경기", Arrays.asList("경기", "경기도")),
        entry("강원", Arrays.asList("강원", "강원도")),
        entry("충북", Arrays.asList("충북", "충청북도")),
        entry("충남", Arrays.asList("충남", "충청남도")),
        entry("전북", Arrays.asList("전북", "전라북도")),
        entry("전남", Arrays.asList("전남", "전라남도")),
        entry("경북", Arrays.asList("경북", "경상북도")),
        entry("경남", Arrays.asList("경남", "경상남도")),
        entry("제주", Arrays.asList("제주", "제주도", "제주특별자치도"))
    );

    public Page<HealthCenter> searchHealthCenters(String keyword, String type, String sido, int page, int limit) {
        Query query = new Query();
        Criteria criteria = new Criteria();

        if (type != null && !type.equals("all")) {
            criteria.and("clCdNm").is(type);
        }

        if (sido != null && !sido.equals("all")) {
            List<String> regionVariants = REGION_MAPPING.getOrDefault(sido, List.of(sido));
            Criteria regionCriteria = new Criteria().orOperator(
                regionVariants.stream()
                    .map(variant -> new Criteria().orOperator(
                        Criteria.where("addr").regex(variant, "i"),
                        Criteria.where("jibunAddr").regex(variant, "i")
                    ))
                    .toArray(Criteria[]::new)
            );
            criteria.andOperator(regionCriteria);
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                Criteria.where("yadmNm").regex(keyword, "i"),
                Criteria.where("addr").regex(keyword, "i"),
                Criteria.where("jibunAddr").regex(keyword, "i")
            );
            criteria.andOperator(keywordCriteria);
        }

        query.addCriteria(criteria);
        query.with(Sort.by(Sort.Direction.ASC, "yadmNm"));

        Pageable pageable = PageRequest.of(page - 1, limit);
        query.with(pageable);

        List<HealthCenter> centers = mongoTemplate.find(query, HealthCenter.class);
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), HealthCenter.class);

        return PageableExecutionUtils.getPage(centers, pageable, () -> total);
    }

    public HealthCenter getHealthCenterById(String id) {
        return healthCenterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("건강증진센터를 찾을 수 없습니다."));
    }

    public List<HealthCenter> saveHealthCenters(List<HealthCenter> centers) {
        return healthCenterRepository.saveAll(centers);
    }
} 