package com.bippobippo.hospital.repository.hospital;

import com.bippobippo.hospital.model.NursingHospital;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NursingHospitalRepository extends ElasticsearchRepository<NursingHospital, String> {
} 