package com.bippobippo.hospital.elasticsearch.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * 스케줄링과 비동기 처리를 활성화하는 설정
 */
@Configuration
@EnableScheduling
@EnableAsync
public class SchedulingConfig {
    // 스케줄링과 비동기 처리를 활성화하는 설정
} 