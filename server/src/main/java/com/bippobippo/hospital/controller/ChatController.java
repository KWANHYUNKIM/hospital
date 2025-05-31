package com.bippobippo.hospital.controller;

import com.bippobippo.hospital.dto.request.ChatMessageRequest;
import com.bippobippo.hospital.dto.response.ChatMessageResponse;
import com.bippobippo.hospital.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponse> handleMessage(@RequestBody ChatMessageRequest request) {
        log.info("=== 채팅 메시지 요청 ===");
        log.info("메시지: {}", request.getMessage());
        log.info("위치: {}", request.getLocation());
        log.info("좌표: {}", request.getCoordinates());
        
        ChatMessageResponse response = chatService.processMessage(request);
        return ResponseEntity.ok(response);
    }
} 