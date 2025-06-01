package com.bippobippo.hospital.entity.board;

import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hospital_board_category_types")
@Getter
@NoArgsConstructor
public class BoardCategoryType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "type_name", nullable = false)
    private String typeName;

    @Column(name = "type_code", nullable = false, unique = true)
    private String typeCode;

    @Column(name = "description")
    private String description;

    @Column(name = "order_sequence")
    private Integer orderSequence;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "categoryType", cascade = CascadeType.ALL)
    private List<BoardCategory> categories = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public void setTypeCode(String typeCode) {
        this.typeCode = typeCode;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setOrderSequence(Integer orderSequence) {
        this.orderSequence = orderSequence;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
} 