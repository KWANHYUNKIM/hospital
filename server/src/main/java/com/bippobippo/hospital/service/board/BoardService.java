package com.bippobippo.hospital.service.board;

import com.bippobippo.hospital.dto.request.Board.BoardCreateRequest;
import com.bippobippo.hospital.dto.request.Board.BoardUpdateRequest;
import com.bippobippo.hospital.dto.response.Board.BoardDetailResponse;
import com.bippobippo.hospital.dto.response.Board.BoardListResponse;
import com.bippobippo.hospital.dto.response.Board.BoardCategoryTypeResponse;
import com.bippobippo.hospital.dto.response.Board.RelatedBoardResponse;
import com.bippobippo.hospital.entity.board.Board;
import com.bippobippo.hospital.exception.BoardNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

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