package com.bippobippo.hospital.service.user;

import com.bippobippo.hospital.entity.board.Comment;
import com.bippobippo.hospital.entity.board.HospitalTag;
import com.bippobippo.hospital.entity.board.Post;
import com.bippobippo.hospital.entity.user.User;
import com.bippobippo.hospital.repository.board.CommentRepository;
import com.bippobippo.hospital.repository.board.PostRepository;
import com.bippobippo.hospital.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    @Transactional
    public Comment createComment(Long postId, String content, Long parentId, List<Map<String, String>> hospitalTags) {
        User user = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPost(post);
        comment.setContent(content);

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("부모 댓글을 찾을 수 없습니다."));
            comment.setParent(parent);
        }

        // @병원 태그 처리
        if (hospitalTags != null && !hospitalTags.isEmpty()) {
            for (Map<String, String> tag : hospitalTags) {
                HospitalTag hospitalTag = new HospitalTag();
                hospitalTag.setComment(comment);
                hospitalTag.setHospitalId(tag.get("hospitalId"));
                comment.getHospitalTags().add(hospitalTag);
            }
        }

        return commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public List<Comment> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
        
        // 각 댓글의 병원 태그 정보를 포함하여 반환
        return comments.stream()
            .map(comment -> {
                // 병원 태그 정보를 Map으로 변환
                List<Map<String, String>> hospitalTags = comment.getHospitalTags().stream()
                    .map(tag -> Map.of(
                        "hospitalId", tag.getHospitalId()
                    ))
                    .collect(Collectors.toList());
                
                // 댓글 내용에서 @ 태그 처리
                String content = comment.getContent();
                for (HospitalTag tag : comment.getHospitalTags()) {
                    content = content.replace(
                        "@" + tag.getHospitalId(),
                        "@" + tag.getHospitalId()
                    );
                }
                comment.setContent(content);
                
                return comment;
            })
            .collect(Collectors.toList());
    }
} 