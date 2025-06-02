// src/pages/forum/ThreadDetail.jsx - New page for thread details
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container, Box, Typography, Alert } from '@mui/material';
import { getThreadById } from '../../redux/threadApi';
import ThreadCard from '../../components/User/forum/ThreadCard';
import CommentModal from '../../components/User/forum/CommentThread/CommentModal';

const ThreadDetail = () => {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const commentId = searchParams.get('comment');
  
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  
  const highlightRef = useRef(null);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        const response = await getThreadById(threadId);
        
        if (response.success) {
          setThread(response.data);
          
          // Open comment modal if there's a comment to highlight
          if (commentId) {
            setCommentModalOpen(true);
          }
        } else {
          setError('Không thể tải bài viết');
        }
      } catch (err) {
        console.error('Error fetching thread:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (threadId) {
      fetchThread();
    }
  }, [threadId, commentId]);

  // Highlight comment when modal opens
  useEffect(() => {
    if (commentModalOpen && commentId) {
      // Wait for modal to render then scroll to comment
      setTimeout(() => {
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          commentElement.style.backgroundColor = '#fff3e0';
          setTimeout(() => {
            commentElement.style.backgroundColor = '';
          }, 3000);
        }
      }, 500);
    }
  }, [commentModalOpen, commentId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Đang tải bài viết...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!thread) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Không tìm thấy bài viết</Alert>
      </Container>
    );
  }

  const handleCommentModalClose = () => {
    setCommentModalOpen(false);
    // Remove comment parameter from URL without page reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('comment');
    window.history.replaceState({}, '', newUrl);
  };

return (
    <Container maxWidth="lg" sx={{ py: 4, mt: '100px' }} >
        <Box sx={{ mb: 3 }}>
            <ThreadCard
                thread={thread}
                onCommentClick={() => setCommentModalOpen(true)}
                onThreadUpdated={(id, data) => setThread(prev => ({ ...prev, ...data }))}
                onThreadDeleted={() => {
                    // Handle thread deletion - maybe redirect to forum home
                    window.location.href = '/forum';
                }}
            />
        </Box>

        <CommentModal
            open={commentModalOpen}
            onClose={handleCommentModalClose}
            thread={thread}
            highlightCommentId={commentId} // Pass comment ID to highlight
        />
    </Container>
);
};

export default ThreadDetail;