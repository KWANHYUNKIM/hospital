package com.bippobippo.hospital.dto.response.search;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
public class PharmacySearchResponse {
    private List<Map<String, Object>> data;
    private long totalCount;
    private int currentPage;
    private int totalPages;
} 