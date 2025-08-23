package com.bippobippo.hospital.entity.board;

import com.bippobippo.hospital.entity.user.User;
import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.Builder;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "hospital_board")
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String summary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private BoardCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Integer userId;

    @Column(nullable = false)
    @Builder.Default
    private String status = "published";

    @Column(name = "is_notice")
    @Builder.Default
    private Boolean isNotice = false;

        @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;
    
    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<BoardComment> comments = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "hospital_board_tag_relation",
        joinColumns = @JoinColumn(name = "board_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<BoardTag> tags = new HashSet<>();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<BoardMetaField> metaFields = new HashSet<>();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<BoardAttachment> attachments = new HashSet<>();

    @OneToOne(mappedBy = "board", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private BoardDetail boardDetail;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (viewCount == null) viewCount = 0;
        if (likeCount == null) likeCount = 0;
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

} 