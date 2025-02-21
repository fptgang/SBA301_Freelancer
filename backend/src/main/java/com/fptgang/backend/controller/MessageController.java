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
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
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


    @MessageMapping("/chat.sendMessage/{projectId}")
    @Transactional
//    @PreAuthorize("isAuthenticated()")
    public void sendMessage(@Payload MessageDto messageDto) {
        try {
            Message message = messageMapper.toEntity(messageDto);
            messageDto = messageMapper.toDTO(messageService.create(message));
            messagingTemplate.convertAndSend("message/"+message.getSender().getEmail(), messageDto);
            if(message.getProject().getActiveProposal() != null)
            messagingTemplate.convertAndSend("message/"+message.getProject().getActiveProposal().getFreelancer().getEmail(), messageDto);
            log.info("Sending message: {} to {} and {}", message.getContent(), "message/"+message.getSender().getAccountId(), message.getProject().getActiveProposal().getFreelancer().getAccountId());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
