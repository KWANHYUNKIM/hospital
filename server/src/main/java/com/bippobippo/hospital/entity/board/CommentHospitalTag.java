package com.bippobippo.hospital.entity.board;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hospital_comment_hospital_tags")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentHospitalTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private BoardComment comment;

    @Column(name = "hospital_id")
    private Integer hospitalId;
} 