package com.bippobippo.hospital.impl;

import com.bippobippo.hospital.dto.request.ChatMessageRequest;
import com.bippobippo.hospital.dto.response.ChatMessageResponse;
import com.bippobippo.hospital.service.ChatService;
import com.bippobippo.hospital.util.ChatUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final RestTemplate restTemplate;
    private final ChatUtil chatUtil;

    @Override
    public ChatMessageResponse processMessage(ChatMessageRequest request) {
        log.info("=== 서버 요청 정보 ===");
        log.info("시간: {}", java.time.LocalDateTime.now());
        log.info("메시지: {}", request.getMessage());
        log.info("위치: {}", request.getLocation());
        log.info("좌표: {}", request.getCoordinates());
        log.info("=====================");

        ChatMessageResponse response = new ChatMessageResponse();

        // 일반 대화인 경우
        if (!chatUtil.isHospitalSearch(request.getMessage())) {
            response.setMessage(createGeneralResponse());
            return response;
        }

        // 지역 기반 검색인 경우
        String region = chatUtil.extractRegion(request.getMessage());
        if (region != null) {
            response.setMessage(chatUtil.searchHospitalsByRegion(request.getMessage(), region));
            return response;
        }

        // 위치 기반 검색인 경우
        if (request.getCoordinates() != null) {
            response.setMessage(chatUtil.searchHospitalsByLocation(
                request.getMessage(), 
                request.getCoordinates().getLatitude(),
                request.getCoordinates().getLongitude()
            ));
            return response;
        }

        // 위치 정보가 없는 경우
        response.setMessage(createLocationRequiredResponse());
        return response;
    }

    private String createGeneralResponse() {
        return """
            <div class="message bot">
                <div class="message-content" style="padding: 10px; border-radius: 8px; max-width: 80%; word-break: break-word;">
                    <div class="answer-section">
                        <div class="answer-content">
                            <p>죄송합니다. 저는 병원 검색만 도와드릴 수 있습니다.</p>
                            <ul>
                                <li>내 주변 병원 검색 (예: "내 주변 내과 찾아줘")</li>
                                <li>지역별 병원 검색 (예: "서울 내과", "대전 치과")</li>
                                <li>특수 조건 검색 (예: "야간 진료 병원", "주말 진료 치과")</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            """;
    }

    private String createLocationRequiredResponse() {
        return """
            <div class="message bot">
                <div class="message-content" style="padding: 10px; border-radius: 8px; max-width: 80%; word-break: break-word;">
                    <div class="answer-section">
                        <div class="answer-content">
                            <h2 class="answer-title">위치 정보 필요</h2>
                            <p>정확한 병원 검색을 위해서는 위치 정보가 필요합니다. 다음 중 하나를 시도해주세요:</p>
                            <ul>
                                <li>위치 정보 제공을 허용해주세요.</li>
                                <li>특정 지역을 지정해주세요 (예: "서울 병원", "대전 내과")</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            """;
    }
} 