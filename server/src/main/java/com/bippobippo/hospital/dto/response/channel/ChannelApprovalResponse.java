package com.bippobippo.hospital.dto.response.channel;

import com.bippobippo.hospital.entity.channel.ChannelApprovalStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChannelApprovalResponse {
    private Long channelId;
    private ChannelApprovalStatus status;
    private String rejectionReason;
    private LocalDateTime processedAt;
    private String processedBy;
} 