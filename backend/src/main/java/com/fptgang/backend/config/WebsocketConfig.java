package com.fptgang.backend.config;

import com.fptgang.backend.service.JwtService;
import com.fptgang.backend.service.impl.JwtServiceImpl;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
import org.springframework.web.socket.handler.WebSocketHandlerDecoratorFactory;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private final JwtService jwtService;

    public WebsocketConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

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
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())||StompCommand.SEND.equals(accessor.getCommand())) {
                    // Get JWT token from headers
                    List<String> authorization = accessor.getNativeHeader("Authorization");
                    String token = authorization != null && !authorization.isEmpty() ? authorization.getFirst().split(" ")[1] : null;
                    // Get destination (channel) being subscribed to
                    String destination = accessor.getDestination();
                    String email = SecurityUtil.getEmailFromJwt(jwtService.parseToken(token));
                    try {
                        if(destination.startsWith("noti/")||destination.startsWith("message/")) {
                            String destinationEmail = destination.split("/")[1];
                            if (!email.equals(destinationEmail)) {
                                return null; // This prevents the subscription
                            }
                        }
                    } catch (Exception e) {
                        return null;
                    }
                }
                log.info("User subscribed to {}", accessor.getDestination());
                return message;
            }
        });
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/hirable-ws").setAllowedOrigins("*");
    }


    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("resources","noti","message");
    }

}
