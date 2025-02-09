package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.MessagesApi;
import com.fptgang.backend.api.model.GetMessages200Response;
import com.fptgang.backend.api.model.MessageDto;
import com.fptgang.backend.api.model.Pageable;
import com.fptgang.backend.mapper.MessageMapper;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.MessageService;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;


@RestController
@RequestMapping("/api/v1")
public class MessageController implements MessagesApi {


    private static final Logger log = LoggerFactory.getLogger(MessageController.class);
    @Autowired
    private AccountService accountService;
    @Autowired
    private MessageService messageService;
//    @Autowired
//    private AttachmentService attachmentService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private MessageMapper messageMapper;

    @Override
    public ResponseEntity<GetMessages200Response> getMessages(Pageable pageable, String filter, String search) {
        log.info("Getting messages");
        var page = OpenApiHelper.toPageable(pageable);
        var userEmail = SecurityUtil.requireCurrentUserEmail();
        var account = accountService.findByEmail(userEmail);
        var userId = account.getAccountId();
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        Page<MessageDto> res = messageService
                .getAllInvolving(userId, page, filter, search, includeInvisible)
                .map(messageMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetMessages200Response.class);
    }

    @Override
    public ResponseEntity<Void> deleteMessage(Long messageId) {
        messageService.deleteById(messageId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<MessageDto> getMessageById(Long messageId) {
        return ResponseEntity.ok(messageMapper.toDTO(messageService.findByMessageId(messageId)));
    }

    @Override
    public ResponseEntity<MessageDto> updateMessage(Long messageId, MessageDto messageDto) {
        messageDto.setMessageId(messageId); // Override messageId

        return ResponseEntity.ok(messageMapper.toDTO(messageService.update(messageMapper.toEntity(messageDto))));
    }


    @MessageMapping("/chat.sendMessage/{receiverId}")
//    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendMessage(@Payload MessageDto messageDto,
                                         SimpMessageHeaderAccessor headerAccessor) {
        if (headerAccessor.getSessionAttributes().get("email") == null) {
            headerAccessor.getSessionAttributes().put("email", SecurityUtil.requireCurrentUserEmail());
        }
        try {
            Message message = messageMapper.toEntity(messageDto);
            message.setCreatedAt(LocalDateTime.now());
            message = messageService.create(message);
            messagingTemplate.convertAndSend("/topic/private/" + message.getReceiver().getEmail(), "New message");
            messagingTemplate.convertAndSend("/topic/private/" + message.getSender().getEmail(), "New message");
            messagingTemplate.convertAndSend("/topic/private/" + message.getReceiver().getAccountId(), message);
            messagingTemplate.convertAndSend("/topic/private/" + message.getSender().getAccountId(), message);

            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
