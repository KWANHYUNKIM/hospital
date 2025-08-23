package com.bippobippo.hospital.entity.news;

import javax.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "hospital_news_categories")
@Data
public class NewsCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "category")
    private List<News> news;
} 