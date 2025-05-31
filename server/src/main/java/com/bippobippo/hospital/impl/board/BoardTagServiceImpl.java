package com.bippobippo.hospital.impl.board;

import com.bippobippo.hospital.entity.board.Board;
import com.bippobippo.hospital.entity.board.BoardTag;
import com.bippobippo.hospital.entity.user.User;
import com.bippobippo.hospital.repository.board.BoardRepository;
import com.bippobippo.hospital.repository.board.BoardTagRepository;
import com.bippobippo.hospital.repository.user.UserRepository;
import com.bippobippo.hospital.service.board.BoardTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BoardTagServiceImpl implements BoardTagService {
    private final BoardRepository boardRepository;
    private final BoardTagRepository boardTagRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public List<Integer> createTags(Integer boardId, List<String> tags, String userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        User user = userRepository.findByUsername(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!board.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("게시글을 수정할 권한이 없습니다.");
        }

        List<Integer> tagIds = new ArrayList<>();
        for (String tagName : tags) {
            Optional<BoardTag> existingTag = boardTagRepository.findByName(tagName);
            BoardTag tag;
            if (existingTag.isPresent()) {
                tag = existingTag.get();
            } else {
                tag = BoardTag.builder()
                        .name(tagName)
                        .slug(tagName.toLowerCase().replace(" ", "-"))
                        .build();
                tag = boardTagRepository.save(tag);
            }
            tagIds.add(tag.getId());
            board.getTags().add(tag);
        }
        boardRepository.save(board);
        return tagIds;
    }
} 