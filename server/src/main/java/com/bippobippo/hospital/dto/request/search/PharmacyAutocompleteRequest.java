package com.bippobippo.hospital.dto.request.search;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PharmacyAutocompleteRequest {
    private String query;
} 