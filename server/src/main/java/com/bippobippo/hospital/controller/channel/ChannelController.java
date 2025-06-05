package com.bippobippo.hospital.controller.channel;

import com.bippobippo.hospital.dto.request.channel.ChannelRequest;
import com.bippobippo.hospital.dto.request.channel.ChannelApprovalRequest;
import com.bippobippo.hospital.dto.response.channel.ChannelResponse;
import com.bippobippo.hospital.entity.channel.ChannelSourceType;
import com.bippobippo.hospital.service.channel.ChannelService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    @Autowired
    private ChannelService channelService;

    // 채널 생성
    @PostMapping
    public ResponseEntity<ChannelResponse> createChannel(@RequestBody ChannelRequest request) {
        return ResponseEntity.ok(channelService.createChannel(request));
    }

    // 채널 수정
    @PutMapping("/{id}")
    public ResponseEntity<ChannelResponse> updateChannel(@PathVariable Long id, @RequestBody ChannelRequest request) {
        return ResponseEntity.ok(channelService.updateChannel(id, request));
    }

    // 채널 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChannel(@PathVariable Long id) {
        channelService.deleteChannel(id);
        return ResponseEntity.ok().build();
    }

    // 활성화된 채널 목록 조회
    @GetMapping
    public ResponseEntity<List<ChannelResponse>> getActiveChannels() {
        return ResponseEntity.ok(channelService.getActiveChannels());
    }

    // 소스 타입별 채널 목록 조회
    @GetMapping("/source/{sourceType}")
    public ResponseEntity<List<ChannelResponse>> getChannelsBySourceType(@PathVariable ChannelSourceType sourceType) {
        return ResponseEntity.ok(channelService.getChannelsBySourceType(sourceType));
    }

    // 채널 승인/거절
    @PostMapping("/{id}/approve")
    public ResponseEntity<ChannelResponse> approveChannel(
            @PathVariable Long id,
            @RequestBody ChannelApprovalRequest request) {
        return ResponseEntity.ok(channelService.processApproval(id, request));
    }
} 