package com.bippobippo.hospital.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.GeoPointField;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

@Data
@Document(indexName = "map_data")
public class MapData {
    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String type;

    @Field(type = FieldType.Text)
    private String name;

    @Field(type = FieldType.Text)
    private String address;

    @Field(type = FieldType.Text)
    private String yadmNm;

    @Field(type = FieldType.Text)
    private String addr;

    @Field(type = FieldType.Text)
    private String telno;

    @GeoPointField
    private GeoPoint location;

    @Field(type = FieldType.Text)
    private String clCdNm;

    @Field(type = FieldType.Text)
    private String sidoCdNm;

    @Field(type = FieldType.Text)
    private String sgguCdNm;

    @Field(type = FieldType.Text)
    private String postNo;

    @Field(type = FieldType.Text)
    private String estbDd;

    @Field(type = FieldType.Text)
    private String hospUrl;
} 