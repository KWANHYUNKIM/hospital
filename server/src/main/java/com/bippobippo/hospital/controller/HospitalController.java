package com.bippobippo.hospital.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    @GetMapping("/detail")
    public String getHospitalDetail() {
        return "Hospital detail endpoint";
    }

    @GetMapping("/subjects")
    public String getHospitalSubjects() {
        return "Hospital subjects endpoint";
    }
} 