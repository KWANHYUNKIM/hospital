package com.bippobippo.hospital.entity.board;

import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hospital_board_category_types")
@Getter
@Setter
@NoArgsConstructor
public class BoardCategoryType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "type_name", nullable = false)
    private String typeName;

    @Column(name = "type_code", nullable = false, unique = true)
    private String typeCode;

    @Column(name = "description")
    private String description;

    @Column(name = "order_sequence")
    private Integer orderSequence = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "categoryType")
    private List<BoardCategory> categories = new ArrayList<>();

    @OneToMany(mappedBy = "categoryType", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardMetaField> metaFields = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 