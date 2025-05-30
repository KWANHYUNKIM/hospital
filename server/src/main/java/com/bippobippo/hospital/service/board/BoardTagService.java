package com.bippobippo.hospital.service.board;

import java.util.List;

public interface BoardTagService {
    List<Integer> createTags(Integer boardId, List<String> tags, String userId);
} 