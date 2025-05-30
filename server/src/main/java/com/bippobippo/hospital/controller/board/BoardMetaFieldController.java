package com.bippobippo.hospital.controller.board;

import com.bippobippo.hospital.entity.board.BoardMetaField;
import com.bippobippo.hospital.service.board.BoardMetaFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board/meta-fields")
@RequiredArgsConstructor
public class BoardMetaFieldController {
    private final BoardMetaFieldService metaFieldService;

    @GetMapping("/category-type/{categoryTypeId}")
    public ResponseEntity<List<BoardMetaField>> getMetaFieldsByCategoryType(@PathVariable Integer categoryTypeId) {
        return ResponseEntity.ok(metaFieldService.getMetaFieldsByCategoryType(categoryTypeId));
    }

    @GetMapping("/category-type/{categoryTypeId}/required")
    public ResponseEntity<List<BoardMetaField>> getRequiredMetaFieldsByCategoryType(@PathVariable Integer categoryTypeId) {
        return ResponseEntity.ok(metaFieldService.getRequiredMetaFieldsByCategoryType(categoryTypeId));
    }

    @PostMapping("/category-type/{categoryTypeId}")
    public ResponseEntity<BoardMetaField> createMetaField(
            @PathVariable Integer categoryTypeId,
            @RequestBody BoardMetaField metaField) {
        return ResponseEntity.ok(metaFieldService.createMetaField(categoryTypeId, metaField));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardMetaField> updateMetaField(
            @PathVariable Integer id,
            @RequestBody BoardMetaField metaField) {
        return ResponseEntity.ok(metaFieldService.updateMetaField(id, metaField));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMetaField(@PathVariable Integer id) {
        metaFieldService.deleteMetaField(id);
        return ResponseEntity.ok().build();
    }
} 