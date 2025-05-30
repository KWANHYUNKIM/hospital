package com.bippobippo.hospital.entity.board;

import javax.persistence.*;
import lombok.*;

@Entity
@Table(name = "hospital_board_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "meta_data", columnDefinition = "JSON")
    private String metaData;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;
} 