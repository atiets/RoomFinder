// src/components/User/forum/CreateThread/TagInput.jsx
import React, { useState, useRef } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  TextField,
  Chip,
  Typography,
  InputAdornment
} from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';

const TagInput = ({ tags = [], setTags, disabled = false, error }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Xử lý thêm tag mới
  const handleAddTag = (tagValue) => {
    const cleanTag = tagValue.trim().toLowerCase();
    
    // Validation
    if (!cleanTag) return;
    if (cleanTag.length > 20) {
      // Tag quá dài
      return;
    }
    if (tags.includes(cleanTag)) {
      // Tag đã tồn tại
      return;
    }
    if (tags.length >= 5) {
      // Tối đa 5 tags
      return;
    }

    // Thêm tag mới
    setTags([...tags, cleanTag]);
    setInputValue('');
  };

  // Xử lý xóa tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Xử lý khi nhấn phím trong input
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag(inputValue);
    } else if (event.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Xóa tag cuối khi nhấn Backspace ở input trống
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  // Xử lý khi mất focus (blur)
  const handleBlur = () => {
    if (inputValue.trim()) {
      handleAddTag(inputValue);
    }
  };

  // Xử lý paste (dán nhiều tags cách nhau bởi dấu phẩy hoặc space)
  const handlePaste = (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    const newTags = pastedText
      .split(/[,\s]+/)
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag && tag.length <= 20 && !tags.includes(tag));
    
    const tagsToAdd = newTags.slice(0, 5 - tags.length);
    setTags([...tags, ...tagsToAdd]);
  };

  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <FormLabel 
        htmlFor="thread-tags" 
        sx={{ mb: 1, fontWeight: 500 }}
      >
        Tags (không bắt buộc)
      </FormLabel>
      
      {/* Tags hiện tại */}
      {tags.length > 0 && (
        <Box sx={{ 
          mb: 2, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1,
          p: 1,
          bgcolor: '#f5f5f5',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={`#${tag}`}
              onDelete={disabled ? undefined : () => handleRemoveTag(tag)}
              disabled={disabled}
              size="small"
              sx={{
                bgcolor: index % 2 === 0 ? '#C1E1C1' : '#FFD8B1',
                color: '#333',
                fontWeight: 600,
                '& .MuiChip-deleteIcon': {
                  color: '#666',
                  '&:hover': {
                    color: '#333'
                  }
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Input để thêm tag mới */}
      <TextField
        id="thread-tags"
        ref={inputRef}
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onPaste={handlePaste}
        disabled={disabled || tags.length >= 5}
        placeholder={
          tags.length >= 5 
            ? "Tối đa 5 tags" 
            : "Nhập tag và nhấn Enter (vd: javascript, react)"
        }
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <TagIcon sx={{ color: '#666', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          }
        }}
      />

      {/* Helper text */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Nhấn Enter để thêm tag • Tối đa 5 tags • Mỗi tag tối đa 20 ký tự
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {tags.length}/5 tags
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <Typography 
          color="error" 
          variant="caption" 
          sx={{ mt: 1 }}
        >
          {error}
        </Typography>
      )}
    </FormControl>
  );
};

export default TagInput;
