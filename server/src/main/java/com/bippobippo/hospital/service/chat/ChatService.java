package com.bippobippo.hospital.service.chat;

import com.bippobippo.hospital.dto.request.chat.ChatMessageRequest;
import com.bippobippo.hospital.dto.response.chat.ChatMessageResponse;

public interface ChatService {
    ChatMessageResponse processMessage(ChatMessageRequest request);
} 