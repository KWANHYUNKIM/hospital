package com.bippobippo.hospital.entity.board;

import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "hospital_tag_types")
@Getter
@Setter
@NoArgsConstructor
public class TagType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "type_name", nullable = false, length = 50)
    private String name;

    @Column(name = "type_code", nullable = false, length = 20, unique = true)
    private String code;

    @Column(length = 255)
    private String description;

    @Column(name = "order_sequence")
    private Integer orderSequence = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "tagType")
    private List<EntityTag> entityTags = new ArrayList<>();
} 