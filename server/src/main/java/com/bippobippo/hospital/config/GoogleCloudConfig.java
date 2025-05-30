package com.bippobippo.hospital.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

@Configuration
public class GoogleCloudConfig {

    @Bean
    public Storage googleCloudStorage() throws IOException {
        GoogleCredentials credentials = GoogleCredentials.fromStream(
            new ClassPathResource("google-cloud-credentials.json").getInputStream()
        );
        
        return StorageOptions.newBuilder()
            .setCredentials(credentials)
            .build()
            .getService();
    }
} 