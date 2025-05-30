package com.bippobippo.hospital.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "map_data")
@Getter
@Setter
public class MapData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String name;
    private String address;
    private String yadmNm;
    private String addr;
    private String telno;
    private Double lat;
    private Double lng;
    private String clCdNm;
    private String sidoCdNm;
    private String sgguCdNm;
    private String postNo;
    private String estbDd;
    private String hospUrl;
} 