// src/hooks/useCommentLike.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { likeComment } from '../redux/commentApi';

export const useCommentLike = (commentId, initialLikesCount = 0, initialLiked = false) => {
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const accessToken = currentUser?.accessToken;
  const debounceRef = useRef(null); // THÊM debounce ref
  
  const [likeState, setLikeState] = useState({
    liked: initialLiked,
    likesCount: initialLikesCount,
    loading: false,
    error: null
  });

  // Update state when props change
  useEffect(() => {
    setLikeState(prev => ({
      ...prev,
      liked: initialLiked,
      likesCount: initialLikesCount
    }));
  }, [initialLiked, initialLikesCount]);

  // Handle like action với debounce
  const handleLike = useCallback(async () => {
    if (!accessToken || !commentId) {
      setLikeState(prev => ({ 
        ...prev, 
        error: 'Bạn cần đăng nhập để thích bình luận' 
      }));
      return;
    }

    if (likeState.loading) {
      console.log('🚫 Already processing like request');
      return;
    }

    // THÊM: Debounce để prevent multiple clicks
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      // Lưu state hiện tại để revert nếu lỗi
      const currentLiked = likeState.liked;
      const currentCount = likeState.likesCount;

      console.log('🔄 Processing like request:', { currentLiked, currentCount });

      // Optimistic update
      setLikeState(prev => ({
        ...prev,
        liked: !currentLiked,
        likesCount: currentLiked ? currentCount - 1 : currentCount + 1,
        loading: true,
        error: null
      }));

      try {
        const response = await likeComment(commentId, accessToken);
        
        if (response.success) {
          console.log('✅ Like API response:', response.data);
          
          // Cập nhật từ API response
          setLikeState(prev => ({
            ...prev,
            liked: response.data.liked,
            likesCount: response.data.likesCount,
            loading: false
          }));
        }
      } catch (error) {
        console.error('❌ Like comment error:', error);
        
        // Revert optimistic update on error
        setLikeState(prev => ({
          ...prev,
          liked: currentLiked,
          likesCount: currentCount,
          loading: false,
          error: error.message
        }));
      }
    }, 200); // Debounce 200ms
  }, [commentId, accessToken, likeState.loading, likeState.liked, likeState.likesCount]);

  // Clear error
  const clearError = useCallback(() => {
    setLikeState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    ...likeState,
    handleLike,
    clearError,
    isLoggedIn: !!accessToken
  };
};