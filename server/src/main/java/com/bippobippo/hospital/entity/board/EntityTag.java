package com.bippobippo.hospital.entity.board;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hospital_comment_entity_tags")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private BoardComment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_type_id")
    private TagType tagType;

    @Column(name = "entity_id")
    private Integer entityId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
} 