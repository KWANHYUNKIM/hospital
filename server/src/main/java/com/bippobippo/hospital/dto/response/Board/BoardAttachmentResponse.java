package com.bippobippo.hospital.dto.response.board;

import com.bippobippo.hospital.entity.board.BoardAttachment;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BoardAttachmentResponse {
    private Integer id;
    
    @JsonProperty("file_name")
    private String fileName;
    
    @JsonProperty("file_path")
    private String filePath;
    
    @JsonProperty("file_size")
    private Long fileSize;
    
    @JsonProperty("mime_type")
    private String mimeType;
    
    @JsonProperty("board_id")
    private Integer boardId;

    public static BoardAttachmentResponse from(BoardAttachment attachment) {
        BoardAttachmentResponse response = new BoardAttachmentResponse();
        response.setId(attachment.getId());
        response.setFileName(attachment.getFileName());
        response.setFilePath(attachment.getFilePath());
        response.setFileSize(attachment.getFileSize());
        response.setMimeType(attachment.getMimeType());
        response.setBoardId(attachment.getBoard().getId());
        return response;
    }
} 