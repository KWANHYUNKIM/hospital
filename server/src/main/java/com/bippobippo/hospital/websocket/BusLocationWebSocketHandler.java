package com.bippobippo.hospital.websocket;

import com.bippobippo.hospital.model.bus.BusLocation;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class BusLocationWebSocketHandler extends TextWebSocketHandler {
    
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        sessions.put(sessionId, session);
        log.info("WebSocket 연결 생성: {}", sessionId);
        
        // 연결 확인 메시지 전송
        session.sendMessage(new TextMessage("{\"type\":\"connection\",\"message\":\"버스 위치 실시간 연결이 설정되었습니다.\"}"));
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        String sessionId = session.getId();
        sessions.remove(sessionId);
        log.info("WebSocket 연결 종료: {}", sessionId);
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("WebSocket 메시지 수신: {}", payload);
        
        // 클라이언트로부터 특정 노선 구독 요청 처리
        if (payload.contains("subscribe")) {
            // 구독 로직 처리
            session.sendMessage(new TextMessage("{\"type\":\"subscription\",\"message\":\"구독이 설정되었습니다.\"}"));
        }
    }
    
    // 실시간 버스 위치 데이터를 모든 연결된 클라이언트에게 브로드캐스트
    public void broadcastBusLocation(BusLocation location) {
        String message;
        try {
            message = objectMapper.writeValueAsString(Map.of(
                "type", "busLocation",
                "data", location
            ));
            
            TextMessage textMessage = new TextMessage(message);
            
            // 모든 연결된 세션에 메시지 전송
            sessions.values().forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                    }
                } catch (Exception e) {
                    log.error("WebSocket 메시지 전송 실패: {}", e.getMessage());
                }
            });
            
        } catch (Exception e) {
            log.error("버스 위치 데이터 직렬화 실패: {}", e.getMessage());
        }
    }
    
    // 특정 노선의 버스 위치 데이터만 브로드캐스트
    public void broadcastBusLocationByRoute(String routeId, BusLocation location) {
        String message;
        try {
            message = objectMapper.writeValueAsString(Map.of(
                "type", "busLocation",
                "routeId", routeId,
                "data", location
            ));
            
            TextMessage textMessage = new TextMessage(message);
            
            sessions.values().forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                    }
                } catch (Exception e) {
                    log.error("WebSocket 메시지 전송 실패: {}", e.getMessage());
                }
            });
            
        } catch (Exception e) {
            log.error("버스 위치 데이터 직렬화 실패: {}", e.getMessage());
        }
    }
    
    // 연결된 클라이언트 수 반환
    public int getConnectedClientCount() {
        return sessions.size();
    }
} 