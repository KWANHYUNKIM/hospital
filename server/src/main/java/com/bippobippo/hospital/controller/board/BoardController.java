package com.bippobippo.hospital.controller.board;

import com.bippobippo.hospital.dto.request.board.BoardCreateRequest;
import com.bippobippo.hospital.dto.request.board.BoardUpdateRequest;
import com.bippobippo.hospital.dto.response.board.BoardCategoryTypeResponse;
import com.bippobippo.hospital.dto.response.board.BoardDetailResponse;
import com.bippobippo.hospital.dto.response.board.BoardListResponse;
import com.bippobippo.hospital.dto.response.board.RelatedBoardResponse;
import com.bippobippo.hospital.exception.BoardNotFoundException;
import com.bippobippo.hospital.service.board.BoardService;
import com.bippobippo.hospital.security.CustomUserDetails;
import com.bippobippo.hospital.entity.board.Board;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<Page<BoardListResponse>> getBoardList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Integer categoryId) {
        return ResponseEntity.ok(boardService.getBoardList(page, limit, categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDetailResponse> getBoardDetail(@PathVariable Integer id) {
        try {
            BoardDetailResponse board = boardService.getBoardDetail(id);
            return ResponseEntity.ok(board);
        } catch (BoardNotFoundException e) {
            return ResponseEntity.status(404).body(null);
        } catch (Exception e) {
            log.error("게시글 상세 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<BoardDetailResponse> createBoard(@RequestBody BoardCreateRequest request) {
        log.info("게시글 생성 요청 데이터: {}", request);
        Board board = boardService.createBoard(request);
        return ResponseEntity.ok(BoardDetailResponse.from(board));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBoard(@PathVariable Integer id, @RequestBody BoardUpdateRequest request) {
        log.info("게시글 수정 요청 - ID: {}, 요청 데이터: {}", id, request);
        try {
            boardService.updateBoard(id, request);
            log.info("게시글 수정 성공 - ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("게시글 수정 실패 - ID: {}, 오류: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("게시글 삭제 요청 - 게시글 ID: {}, 사용자: {}", id, userDetails.getUsername());
        boardService.deleteBoard(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/increment-view")
    public ResponseEntity<Void> incrementView(@PathVariable Integer id) {
        boardService.incrementView(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/category-types")
    public ResponseEntity<List<BoardCategoryTypeResponse>> getCategoryTypes() {
        return ResponseEntity.ok(boardService.getCategoryTypes());
    }

    @GetMapping("/related/{id}")
    public ResponseEntity<Page<RelatedBoardResponse>> getRelatedBoards(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "1") int page) {
        try {
            Page<RelatedBoardResponse> relatedBoards = boardService.getRelatedBoards(id, page);
            return ResponseEntity.ok(relatedBoards);
        } catch (BoardNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 