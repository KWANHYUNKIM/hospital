package com.bippobippo.hospital.elasticsearch.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.SSLContexts;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.RestClients;
import org.springframework.data.elasticsearch.config.AbstractElasticsearchConfiguration;

import javax.net.ssl.SSLContext;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;

@Configuration
public class ElasticsearchConfig extends AbstractElasticsearchConfiguration {
    
    @Value("${elasticsearch.host:localhost}")
    private String host;
    
    @Value("${elasticsearch.port:9200}")
    private int port;
    
    @Value("${elasticsearch.scheme:http}")
    private String scheme;
    
    @Value("${elasticsearch.username:}")
    private String username;
    
    @Value("${elasticsearch.password:}")
    private String password;
    
    @Value("${elasticsearch.ssl.enabled:false}")
    private boolean sslEnabled;
    
    @Value("${elasticsearch.connection.timeout:5000}")
    private int connectionTimeout;
    
    @Value("${elasticsearch.socket.timeout:60000}")
    private int socketTimeout;
    
    @Value("${elasticsearch.max.retry.timeout:30000}")
    private int maxRetryTimeout;
    
    @Override
    @Bean
    @Primary
    public RestHighLevelClient elasticsearchClient() {
        ClientConfiguration clientConfiguration = createClientConfiguration();
        return RestClients.create(clientConfiguration).rest();
    }
    
    private ClientConfiguration createClientConfiguration() {
        ClientConfiguration.TerminalClientConfigurationBuilder builder = ClientConfiguration.builder()
            .connectedTo(host + ":" + port)
            .withConnectTimeout(connectionTimeout)
            .withSocketTimeout(socketTimeout)
            .withClientConfigurer(RestClients.RestClientConfigurationCallback.from(httpClientBuilder -> {
                // 인증 설정
                if (username != null && !username.isEmpty() && password != null && !password.isEmpty()) {
                    CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
                    credentialsProvider.setCredentials(AuthScope.ANY, 
                        new UsernamePasswordCredentials(username, password));
                    httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
                }
                
                // SSL 설정
                if (sslEnabled) {
                    try {
                        SSLContext sslContext = SSLContexts.custom()
                            .loadTrustMaterial(null, (x509Certificates, s) -> true)
                            .build();
                        httpClientBuilder.setSSLContext(sslContext);
                    } catch (Exception e) {
                        throw new RuntimeException("SSL 컨텍스트 생성 실패", e);
                    }
                }
                
                return httpClientBuilder;
            }));
        
        return builder.build();
    }
    

} 