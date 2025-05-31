package com.bippobippo.hospital.service.board;

import com.bippobippo.hospital.dto.request.board.BoardCreateRequest;
import com.bippobippo.hospital.dto.request.board.BoardUpdateRequest;
import com.bippobippo.hospital.dto.response.board.BoardCategoryTypeResponse;
import com.bippobippo.hospital.dto.response.board.BoardDetailResponse;
import com.bippobippo.hospital.dto.response.board.BoardListResponse;
import com.bippobippo.hospital.dto.response.board.RelatedBoardResponse;
import com.bippobippo.hospital.entity.board.Board;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BoardService {
    Page<BoardListResponse> getBoardList(int page, int limit, Integer categoryId);
    BoardDetailResponse getBoardDetail(Integer id);
    Board createBoard(BoardCreateRequest request);
    void updateBoard(Integer id, BoardUpdateRequest request);
    void deleteBoard(Integer id, Integer userId);
    void incrementView(Integer id);
    List<BoardCategoryTypeResponse> getCategoryTypes();
    Page<RelatedBoardResponse> getRelatedBoards(Integer boardId, int page);
} 