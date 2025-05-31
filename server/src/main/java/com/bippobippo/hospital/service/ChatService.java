package com.bippobippo.hospital.service;

import com.bippobippo.hospital.dto.request.ChatMessageRequest;
import com.bippobippo.hospital.dto.response.ChatMessageResponse;

public interface ChatService {
    ChatMessageResponse processMessage(ChatMessageRequest request);
} 