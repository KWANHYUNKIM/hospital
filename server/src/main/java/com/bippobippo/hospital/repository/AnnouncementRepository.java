package com.bippobippo.hospital.repository;

import com.bippobippo.hospital.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    @Query("SELECT a FROM Announcement a WHERE a.isActive = true AND a.startDate <= :now AND a.endDate >= :now ORDER BY a.priority DESC")
    List<Announcement> findActiveAnnouncements(LocalDateTime now);
} 