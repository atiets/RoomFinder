// src/hooks/useThreadLike.js
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { likeThread, dislikeThread, getThreadLikeStatus } from '../redux/threadApi';

export const useThreadLike = (threadId, initialLikesCount = 0, initialDislikesCount = 0) => {
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const accessToken = currentUser?.accessToken;
  
  const [likeState, setLikeState] = useState({
    liked: false,
    disliked: false,
    likesCount: initialLikesCount,
    dislikesCount: initialDislikesCount,
    loading: false,
    error: null
  });

  // Lấy like status khi component mount (nếu user đã login)
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!accessToken || !threadId) return;
      
      try {
        const response = await getThreadLikeStatus(threadId, accessToken);
        if (response.success) {
          setLikeState(prev => ({
            ...prev,
            liked: response.data.liked,
            disliked: response.data.disliked,
            likesCount: response.data.likesCount,
            dislikesCount: response.data.dislikesCount
          }));
        }
      } catch (error) {
        console.log('Could not fetch like status:', error.message);
        // Không show error cho trường hợp này vì không critical
      }
    };

    fetchLikeStatus();
  }, [threadId, accessToken]);

  // Handle like action
  const handleLike = useCallback(async () => {
    if (!accessToken) {
      setLikeState(prev => ({ 
        ...prev, 
        error: 'Bạn cần đăng nhập để thích bài viết' 
      }));
      return;
    }

    if (likeState.loading) return;

    setLikeState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await likeThread(threadId, accessToken);
      
      if (response.success) {
        setLikeState(prev => ({
          ...prev,
          liked: response.data.liked,
          disliked: response.data.disliked,
          likesCount: response.data.likesCount,
          dislikesCount: response.data.dislikesCount,
          loading: false
        }));
      }
    } catch (error) {
      setLikeState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [threadId, accessToken, likeState.loading]);

  // Handle dislike action
  const handleDislike = useCallback(async () => {
    if (!accessToken) {
      setLikeState(prev => ({ 
        ...prev, 
        error: 'Bạn cần đăng nhập để không thích bài viết' 
      }));
      return;
    }

    if (likeState.loading) return;

    setLikeState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await dislikeThread(threadId, accessToken);
      
      if (response.success) {
        setLikeState(prev => ({
          ...prev,
          liked: response.data.liked,
          disliked: response.data.disliked,
          likesCount: response.data.likesCount,
          dislikesCount: response.data.dislikesCount,
          loading: false
        }));
      }
    } catch (error) {
      setLikeState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [threadId, accessToken, likeState.loading]);

  // Clear error
  const clearError = useCallback(() => {
    setLikeState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...likeState,
    handleLike,
    handleDislike,
    clearError,
    isLoggedIn: !!accessToken
  };
};