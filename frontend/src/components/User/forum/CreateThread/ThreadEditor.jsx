// src/components/User/forum/CreateThread/ThreadEditor.jsx
import React, { useRef, useEffect } from 'react';
import { 
  Box, 
  FormControl, 
  FormLabel, 
  Typography 
} from '@mui/material';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const ThreadEditor = ({ setContent, setQuillInstance, error, disabled = false, initialContent = '' }) => {
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null);
  
  useEffect(() => {
    if (quillRef.current && !quillInstanceRef.current) {
      quillInstanceRef.current = new Quill(quillRef.current, {
        theme: 'snow',
        placeholder: 'Vui lòng ghi nội dung bài viết (bắt buộc)',
        readOnly: disabled,
        modules: {
          toolbar: disabled ? false : [
            ['bold', 'italic', 'underline'],
            ['link'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean'],
          ],
        },
        formats: ['bold', 'italic', 'underline', 'link', 'list']
      });

      // Set quillInstance để component cha có thể truy cập
      setQuillInstance && setQuillInstance(quillInstanceRef.current);

      // Set initial content if provided
      if (initialContent) {
        quillInstanceRef.current.root.innerHTML = initialContent;
      }

      // Listen for text-change events
      quillInstanceRef.current.on('text-change', () => {
        const editorContent = quillInstanceRef.current.root.innerHTML;
        setContent && setContent(editorContent);
      });
    }
    
    // Update readonly state when disabled changes
    if (quillInstanceRef.current) {
      quillInstanceRef.current.enable(!disabled);
    }
    
  }, [setContent, setQuillInstance, disabled, initialContent]);

  // Update content when initialContent changes (for edit mode)
  useEffect(() => {
    if (quillInstanceRef.current && initialContent) {
      quillInstanceRef.current.root.innerHTML = initialContent;
    }
  }, [initialContent]);

  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <FormLabel 
        htmlFor="thread-content" 
        sx={{ mb: 1, fontWeight: 500 }}
      >
        Nội dung
      </FormLabel>
      <Box 
        sx={{ 
          border: '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          mb: 1,
          opacity: disabled ? 0.6 : 1,
          '.ql-toolbar': {
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
          },
          '.ql-container': {
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            height: '200px',
          }
        }}
      >
        {/* Quill editor will be initialized here */}
        <div ref={quillRef} style={{ height: '220px' }}></div>
      </Box>
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

export default ThreadEditor;