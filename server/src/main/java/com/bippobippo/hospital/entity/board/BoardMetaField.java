package com.bippobippo.hospital.entity.board;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hospital_board_meta_fields")
@Getter
@Setter
@NoArgsConstructor
public class BoardMetaField {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_type_id", nullable = false)
    private BoardCategoryType categoryType;

    @Column(name = "field_name", nullable = false, length = 50)
    private String fieldName;

    @Column(name = "field_type", nullable = false, length = 20)
    private String fieldType;

    @Column(name = "field_label", nullable = false, length = 100)
    private String fieldLabel;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Column(name = "field_options", columnDefinition = "json")
    private String fieldOptions;

    @Column(name = "order_sequence")
    private Integer orderSequence = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
} 