package com.bippobippo.hospital.entity.common;

import lombok.Data;
import javax.persistence.*;

@Data
@Entity
@Table(name = "hospital_server_configs")
public class ServerConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key_name")
    private String keyName;

    @Column
    private String value;

    @Column
    private String environment;

    @Column
    private String description;

    @Column(name = "is_active")
    private Boolean isActive;
} 