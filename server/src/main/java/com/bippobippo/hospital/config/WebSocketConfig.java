package com.bippobippo.hospital.config;

import com.bippobippo.hospital.websocket.BusLocationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    
    private final BusLocationWebSocketHandler busLocationWebSocketHandler;
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(busLocationWebSocketHandler, "/ws/bus-location")
                .setAllowedOrigins("*"); // CORS 설정 (프로덕션에서는 특정 도메인으로 제한)
    }
} 