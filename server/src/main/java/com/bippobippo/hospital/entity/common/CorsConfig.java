package com.bippobippo.hospital.entity.common;

import lombok.Data;
import javax.persistence.*;

@Data
@Entity
@Table(name = "hospital_cors_configs")
public class CorsConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String origin;

    @Column
    private String methods;

    @Column
    private String headers;

    @Column
    private Boolean credentials;

    @Column(name = "max_age")
    private Integer maxAge;
} 