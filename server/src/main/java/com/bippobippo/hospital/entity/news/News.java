package com.bippobippo.hospital.entity.news;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "hospital_news")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private NewsCategory category;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "representative_image_url")
    private String representativeImageUrl;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "author_id")
    private Long authorId;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "news", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<NewsImage> images;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addImage(NewsImage image) {
        if (this.images == null) {
            this.images = new ArrayList<>();
        }
        this.images.add(image);
        image.setNews(this);
    }

    public void update(String title, String summary, String content, String representativeImageUrl, NewsCategory category) {
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.representativeImageUrl = representativeImageUrl;
        this.category = category;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
} 