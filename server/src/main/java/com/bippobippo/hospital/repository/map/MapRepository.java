package com.bippobippo.hospital.repository.map;

import com.bippobippo.hospital.model.MapData;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface MapRepository extends ElasticsearchRepository<MapData, String> {
    // Elasticsearch는 JPA와 달리 쿼리 메서드를 자동으로 생성하지 않으므로,
    // 복잡한 쿼리는 MapServiceImpl에서 직접 구현합니다.
} 