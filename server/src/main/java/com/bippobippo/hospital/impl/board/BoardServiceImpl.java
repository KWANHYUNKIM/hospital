package com.bippobippo.hospital.impl.board;

import com.bippobippo.hospital.dto.request.board.BoardCreateRequest;
import com.bippobippo.hospital.dto.request.board.BoardUpdateRequest;
import com.bippobippo.hospital.dto.response.board.BoardCategoryTypeResponse;
import com.bippobippo.hospital.dto.response.board.BoardDetailResponse;
import com.bippobippo.hospital.dto.response.board.BoardListResponse;
import com.bippobippo.hospital.dto.response.board.RelatedBoardResponse;
import com.bippobippo.hospital.entity.board.Board;
import com.bippobippo.hospital.entity.board.BoardCategory;
import com.bippobippo.hospital.entity.board.BoardDetail;
import com.bippobippo.hospital.entity.board.BoardTag;
import com.bippobippo.hospital.entity.user.User;
import com.bippobippo.hospital.repository.board.BoardRepository;
import com.bippobippo.hospital.repository.board.BoardCategoryRepository;
import com.bippobippo.hospital.repository.board.BoardCategoryTypeRepository;
import com.bippobippo.hospital.repository.user.UserRepository;
import com.bippobippo.hospital.repository.board.BoardTagRepository;
import com.bippobippo.hospital.service.board.BoardService;
import com.bippobippo.hospital.exception.BoardNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {
    private final BoardRepository boardRepository;
    private final BoardCategoryRepository categoryRepository;
    private final BoardCategoryTypeRepository boardCategoryTypeRepository;
    private final UserRepository userRepository;
    private final BoardTagRepository boardTagRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BoardListResponse> getBoardList(int page, int limit, Integer categoryId) {
        try {
            PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), limit);
            Page<Board> boards;
            
            if (categoryId != null) {
                boards = boardRepository.findByCategoryIdAndStatus(categoryId, pageRequest);
            } else {
                boards = boardRepository.findByStatus(pageRequest);
            }
            
            return boards.map(BoardListResponse::from);
        } catch (Exception e) {
            log.error("게시글 목록 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("게시글 목록을 가져오는데 실패했습니다.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BoardDetailResponse getBoardDetail(Integer id) {
        try {
            // 게시글 기본 정보와 연관된 엔티티들을 함께 조회
            Board board = boardRepository.findByIdWithDetails(id);
            if (board == null) {
                throw new BoardNotFoundException("게시글을 찾을 수 없습니다.");
            }

            // 태그 정보 조회
            Board boardWithTags = boardRepository.findByIdWithTags(id);
            if (boardWithTags != null) {
                board.setTags(boardWithTags.getTags());
            }

            // 첨부파일 정보 조회
            Board boardWithAttachments = boardRepository.findByIdWithAttachments(id);
            if (boardWithAttachments != null) {
                board.setAttachments(boardWithAttachments.getAttachments());
            }

            return BoardDetailResponse.from(board);
        } catch (Exception e) {
            log.error("게시글 상세 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("게시글을 불러오는데 실패했습니다.");
        }
    }

    @Override
    @Transactional
    public Board createBoard(BoardCreateRequest request) {
        log.info("게시글 생성 서비스 요청 데이터: {}", request);
        BoardCategory category = categoryRepository.findById(Integer.parseInt(request.getCategoryId()))
            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Board board = Board.builder()
            .title(request.getTitle())
            .summary(request.getSummary())
            .category(category)
            .user(user)
            .status(request.getStatus() != null ? request.getStatus() : "published")
            .isNotice(request.getIsNotice() != null ? request.getIsNotice() : false)
            .tags(new HashSet<>())
            .build();

        // BoardDetail 엔티티 생성 및 설정
        BoardDetail boardDetail = BoardDetail.builder()
            .content(request.getSummary())
            .board(board)
            .build();
        board.setBoardDetail(boardDetail);

        log.info("생성된 게시글 데이터: {}", board);
        return boardRepository.save(board);
    }

    @Override
    @Transactional
    public void updateBoard(Integer id, BoardUpdateRequest request) {
        log.info("게시글 수정 시작 - ID: {}, 요청 데이터: {}", id, request);
        try {
            Board board = boardRepository.findById(id)
                    .orElseThrow(() -> new BoardNotFoundException("게시글을 찾을 수 없습니다."));

            log.info("기존 게시글 데이터: {}", board);

            // 게시글 정보 업데이트
            board.setTitle(request.getTitle());
            board.setSummary(request.getSummary());
            
            // 카테고리 업데이트
            if (request.getCategoryId() != null) {
                BoardCategory category = categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
                board.setCategory(category);
            }

            // 메타 데이터 업데이트
            if (request.getMetaFields() != null) {
                BoardDetail boardDetail = board.getBoardDetail();
                if (boardDetail == null) {
                    boardDetail = new BoardDetail();
                    boardDetail.setBoard(board);
                }
                boardDetail.setMetaData(request.getMetaFields());
                board.setBoardDetail(boardDetail);
            }

            // 태그 업데이트
            if (request.getTags() != null) {
                // 기존 태그 관계 제거
                board.getTags().clear();
                
                // 새로운 태그 관계 추가
                for (String tagName : request.getTags()) {
                    final String finalTagName = tagName.trim();
                    if (!finalTagName.isEmpty()) {
                        // 태그 이름으로 검색
                        BoardTag tag = boardTagRepository.findByName(finalTagName)
                            .orElseGet(() -> {
                                // 태그가 없으면 새로 생성
                                BoardTag newTag = new BoardTag();
                                newTag.setName(finalTagName);
                                newTag.setSlug(finalTagName.toLowerCase().replace(" ", "-"));
                                return boardTagRepository.save(newTag);
                            });
                        board.getTags().add(tag);
                    }
                }
            }

            boardRepository.save(board);
            log.info("게시글 수정 완료 - ID: {}", id);
        } catch (Exception e) {
            log.error("게시글 수정 중 오류 발생 - ID: {}, 오류: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteBoard(Integer id, Integer userId) {
        Board board = boardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        if (!board.getUserId().equals(userId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        boardRepository.delete(board);
    }

    @Override
    @Transactional
    public void incrementView(Integer id) {
        Board board = boardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        board.incrementViewCount();
    }

    @Override
    public List<BoardCategoryTypeResponse> getCategoryTypes() {
        return boardCategoryTypeRepository.findAll().stream()
                .map(BoardCategoryTypeResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RelatedBoardResponse> getRelatedBoards(Integer boardId, int page) {
        try {
            // 현재 게시글 조회
            Board currentBoard = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글을 찾을 수 없습니다."));

            // 페이지네이션 설정
            PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), 10);

            // 관련 게시글 조회
            Page<Board> relatedBoards = boardRepository.findRelatedBoards(
                currentBoard.getCategory().getId(),
                boardId,
                pageRequest
            );

            // DTO 변환
            return relatedBoards.map(board -> {
                RelatedBoardResponse response = new RelatedBoardResponse();
                response.setId(board.getId());
                response.setTitle(board.getTitle());
                response.setSummary(board.getSummary());
                response.setCategoryName(board.getCategory().getName());
                response.setUsername(board.getUser().getUsername());
                response.setUserId(board.getUserId());
                response.setCommentCount(board.getComments().size());
                response.setViewCount(board.getViewCount());
                response.setCreatedAt(board.getCreatedAt().toString());
                response.setUpdatedAt(board.getUpdatedAt().toString());
                return response;
            });
        } catch (Exception e) {
            log.error("관련 게시글 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("관련 게시글을 가져오는데 실패했습니다.");
        }
    }
} 