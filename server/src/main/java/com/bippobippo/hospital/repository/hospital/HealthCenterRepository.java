package com.bippobippo.hospital.repository.hospital;

import com.bippobippo.hospital.model.HealthCenter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthCenterRepository extends MongoRepository<HealthCenter, String> {
    @Query("{'$or': [{'addr': {$regex: ?0, $options: 'i'}}, {'jibunAddr': {$regex: ?0, $options: 'i'}}]}")
    List<HealthCenter> findByAddressContaining(String address);

    @Query("{'clCdNm': ?0}")
    List<HealthCenter> findByType(String type);

    @Query("{'$or': [{'yadmNm': {$regex: ?0, $options: 'i'}}, {'addr': {$regex: ?0, $options: 'i'}}, {'jibunAddr': {$regex: ?0, $options: 'i'}}]}")
    List<HealthCenter> findByKeyword(String keyword);
} 