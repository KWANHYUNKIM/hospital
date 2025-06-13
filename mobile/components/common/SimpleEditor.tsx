import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TypeScript 인터페이스 정의
interface SimpleEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  editable?: boolean;
}

interface ToolbarButton {
  name: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  maxLength = 5000,
  editable = true
}) => {
  const textInputRef = useRef<TextInput>(null);
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const [selectionEnd, setSelectionEnd] = useState<number>(0);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  // 텍스트 포맷팅 함수들
  const insertText = (textToInsert: string, wrapText?: string) => {
    const beforeText = value.substring(0, selectionStart);
    const selectedText = value.substring(selectionStart, selectionEnd);
    const afterText = value.substring(selectionEnd);

    let newText: string;
    let newCursorPosition: number;

    if (wrapText) {
      // 선택된 텍스트를 감싸는 경우
      newText = beforeText + wrapText + selectedText + wrapText + afterText;
      newCursorPosition = selectionStart + wrapText.length + selectedText.length + wrapText.length;
    } else {
      // 단순 텍스트 삽입
      newText = beforeText + textToInsert + afterText;
      newCursorPosition = selectionStart + textToInsert.length;
    }

    onChange(newText);
    
    // 커서 위치 업데이트
    setTimeout(() => {
      textInputRef.current?.setNativeProps({
        selection: { start: newCursorPosition, end: newCursorPosition }
      });
    });
  };

  // 툴바 버튼 액션들
  const toggleBold = () => insertText('', '**');
  const toggleItalic = () => insertText('', '*');
  const toggleUnderline = () => insertText('', '__');
  const insertBulletList = () => insertText('\n• ');
  const insertNumberList = () => insertText('\n1. ');
  const insertQuote = () => insertText('\n> ');
  const insertCode = () => insertText('', '`');

  const insertLink = () => {
    if (linkUrl.trim()) {
      const selectedText = value.substring(selectionStart, selectionEnd);
      const linkText = selectedText || 'Link';
      insertText(`[${linkText}](${linkUrl.trim()})`);
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const insertImage = () => {
    if (imageUrl.trim()) {
      insertText(`![Image](${imageUrl.trim()})`);
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  // 툴바 버튼 데이터
  const toolbarButtons: ToolbarButton[] = [
    { name: 'bold', icon: 'format-bold', action: toggleBold },
    { name: 'italic', icon: 'format-italic', action: toggleItalic },
    { name: 'underline', icon: 'format-underlined', action: toggleUnderline },
    { name: 'list', icon: 'format-list-bulleted', action: insertBulletList },
    { name: 'number', icon: 'format-list-numbered', action: insertNumberList },
    { name: 'quote', icon: 'format-quote', action: insertQuote },
    { name: 'link', icon: 'link', action: () => setShowLinkModal(true) },
    { name: 'image', icon: 'image', action: () => setShowImageModal(true) },
    { name: 'code', icon: 'code', action: insertCode },
  ];

  // 텍스트 선택 변경 핸들러
  const handleSelectionChange = (event: any) => {
    const { start, end } = event.nativeEvent.selection;
    setSelectionStart(start);
    setSelectionEnd(end);
  };

  return (
    <View style={styles.container}>
      {/* 툴바 */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {toolbarButtons.map((button, index) => (
            <TouchableOpacity
              key={button.name}
              style={[styles.toolbarButton, button.disabled && styles.toolbarButtonDisabled]}
              onPress={button.action}
              disabled={button.disabled || !editable}
            >
              <Icon
                name={button.icon}
                size={20}
                color={button.disabled || !editable ? '#9CA3AF' : '#374151'}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 텍스트 입력 영역 */}
      <TextInput
        ref={textInputRef}
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        maxLength={maxLength}
        editable={editable}
      />

      {/* 문자 수 표시 */}
      <View style={styles.footer}>
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      </View>

      {/* 링크 입력 모달 */}
      <Modal
        visible={showLinkModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLinkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>링크 추가</Text>
            <TextInput
              style={styles.modalInput}
              value={linkUrl}
              onChangeText={setLinkUrl}
              placeholder="URL을 입력하세요"
              placeholderTextColor="#9CA3AF"
              keyboardType="url"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setLinkUrl('');
                  setShowLinkModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={insertLink}
                disabled={!linkUrl.trim()}
              >
                <Text style={[
                  styles.confirmButtonText,
                  !linkUrl.trim() && styles.confirmButtonTextDisabled
                ]}>
                  추가
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 이미지 입력 모달 */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>이미지 추가</Text>
            <TextInput
              style={styles.modalInput}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="이미지 URL을 입력하세요"
              placeholderTextColor="#9CA3AF"
              keyboardType="url"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setImageUrl('');
                  setShowImageModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={insertImage}
                disabled={!imageUrl.trim()}
              >
                <Text style={[
                  styles.confirmButtonText,
                  !imageUrl.trim() && styles.confirmButtonTextDisabled
                ]}>
                  추가
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  toolbar: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  toolbarButton: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 4,
  },
  toolbarButtonDisabled: {
    opacity: 0.5,
  },
  textInput: {
    minHeight: 200,
    maxHeight: 400,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    opacity: 0.5,
  },
});

export default SimpleEditor; 