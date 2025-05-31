package com.bippobippo.hospital.dto.response.board;

import com.bippobippo.hospital.entity.board.BoardTag;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardTagResponse {
    private Integer id;
    private String name;
    private String slug;

    public static BoardTagResponse from(BoardTag tag) {
        BoardTagResponse response = new BoardTagResponse();
        response.setId(tag.getId());
        response.setName(tag.getName());
        response.setSlug(tag.getSlug());
        return response;
    }
} 