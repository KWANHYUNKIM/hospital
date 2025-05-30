package com.bippobippo.hospital.dto.response.search;

import com.bippobippo.hospital.model.NursingHospital;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NursingHospitalSearchResponse {
    private List<NursingHospital> data;
    private long totalCount;
    private int currentPage;
    private int totalPages;
} 