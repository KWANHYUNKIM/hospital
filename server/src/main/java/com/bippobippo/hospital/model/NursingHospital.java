package com.bippobippo.hospital.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.GeoPointField;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@Document(indexName = "hospitals")
public class NursingHospital {
    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String ykiho; // 요양기관번호

    @Field(type = FieldType.Text)
    private String yadmNm; // 요양기관명

    @Field(type = FieldType.Keyword)
    private String category; // 요양병원

    @Field(type = FieldType.Text)
    private String addr; // 주소

    @Field(type = FieldType.Text)
    private String telno; // 전화번호

    @Field(type = FieldType.Text)
    private String clCdNm; // 종별코드명

    @Field(type = FieldType.Text)
    private String sidoCdNm; // 시도코드명

    @Field(type = FieldType.Text)
    private String sgguCdNm; // 시군구코드명

    @Field(type = FieldType.Date)
    private Date dataStdDt; // 데이터기준일자

    @Field(type = FieldType.Date)
    private Date createdAt;

    @Field(type = FieldType.Date)
    private Date updatedAt;

    // 거리 정보 (미터 단위)
    private Long distance;

    @GeoPointField
    private GeoPoint location;

    @Field(type = FieldType.Double)
    private Double lat; // 위도

    @Field(type = FieldType.Double)
    private Double lon; // 경도

    private List<String> major;
    private Map<String, Object> times;
    private String region;
    private Boolean veteran_hospital;
} 