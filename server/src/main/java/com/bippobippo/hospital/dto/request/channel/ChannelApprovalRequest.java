package com.bippobippo.hospital.dto.request.channel;

import com.bippobippo.hospital.entity.channel.ChannelApprovalStatus;
import lombok.Data;

@Data
public class ChannelApprovalRequest {
    private ChannelApprovalStatus status;
    private String rejectionReason;
} 