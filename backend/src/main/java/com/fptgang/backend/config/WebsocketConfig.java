package com.fptgang.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
import org.springframework.web.socket.handler.WebSocketHandlerDecoratorFactory;

import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        WebSocketMessageBrokerConfigurer.super.configureWebSocketTransport(registry);

        registry.addDecoratorFactory(new WebSocketHandlerDecoratorFactory() {
            @Override
            public WebSocketHandler decorate(WebSocketHandler webSocketHandler) {
                return new WebSocketHandlerDecorator(webSocketHandler) {
                    @Override
                    public void afterConnectionEstablished(final WebSocketSession session) throws Exception {
                        try{
                            sessions.add(session);
                            super.afterConnectionEstablished(session);

                        } catch (Exception e){
                            log.error("Error when connection established", e);
                            session.close(CloseStatus.BAD_DATA);
                        }
                    }

                    @Override
                    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
                        try{
                            //Remove the WebSocketSession object from the store
                            sessions.remove(session);
                            super.afterConnectionClosed(session, closeStatus);
                        }catch(Exception e){
                            e.printStackTrace();
                        }finally {
                            super.afterConnectionClosed(session, closeStatus);
                        }


                    }
                };
            }
        });
    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/message").setAllowedOrigins("*");
    }


    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }

}
