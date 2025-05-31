package com.bippobippo.hospital.entity.hospital;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hospital_times")
@Getter
@Setter
public class HospitalTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ykiho", length = 20, nullable = false)
    private String ykiho;

    @Column(name = "day_of_week", length = 10, nullable = false)
    private String dayOfWeek;

    @Column(name = "open_time", length = 5)
    private String openTime;

    @Column(name = "close_time", length = 5)
    private String closeTime;

    @Column(name = "is_holiday")
    private Boolean isHoliday = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 