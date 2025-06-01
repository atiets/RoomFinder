// src/components/User/forum/CommentModal/CommentModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  Button,
  TextField,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getThreadComments, createComment } from "../../../../redux/commentApi";
import CommentItem from "./CommentItem";
import "./comment-system.css";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "16px",
    maxHeight: "80vh",
    width: "100%",
    maxWidth: "600px",
  },
}));

const CommentInputBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderTop: "1px solid",
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
}));

const CommentModal = ({ open, onClose, thread, onCommentAdded }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const accessToken = currentUser?.accessToken;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // {commentId, username}
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const commentsEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load comments khi mở modal
  useEffect(() => {
    if (open && thread) {
      loadComments(true);
    }
  }, [open, thread]);

  // Auto scroll to bottom khi có comment mới
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  // Focus input khi reply
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const loadComments = async (reset = false) => {
    if (loading || !thread) return;

    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      const response = await getThreadComments(
        thread.id || thread._id,
        currentPage,
        20
      );

      if (response.success) {
        const newComments = response.data.comments;

        if (reset) {
          setComments(newComments);
          setPage(2);
        } else {
          setComments((prev) => [...prev, ...newComments]);
          setPage((prev) => prev + 1);
        }

        setHasMore(newComments.length === 20);
      }
    } catch (err) {
      console.error("Load comments error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    if (!accessToken) {
      Swal.fire({
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để bình luận.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
        customClass: {
          popup: "custom-swal-popup",
          confirmButton: "custom-swal-confirm",
          cancelButton: "custom-swal-cancel",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    try {
      setSubmitting(true);

      const commentData = {
        content: newComment.trim(),
        ...(replyingTo?.commentId
          ? { parentCommentId: replyingTo.commentId }
          : {}),
      };

      const response = await createComment(
        thread.id || thread._id,
        commentData,
        accessToken
      );

      if (response.success) {
        const newCommentData = response.data;

        if (replyingTo) {
          // Là reply - thêm vào replies của parent comment
          setComments((prev) =>
            updateCommentReplies(prev, replyingTo.commentId, newCommentData)
          );
        } else {
          // Là comment gốc - thêm vào đầu list
          setComments((prev) => [newCommentData, ...prev]);
          
          // Callback to parent để update comment count
          onCommentAdded && onCommentAdded();
        }

        // Reset form
        setNewComment("");
        setReplyingTo(null);

        // Show success message
        Swal.fire({
          title: "Thành công",
          text: "Bình luận đã được gửi!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "custom-swal-popup",
          },
        });
      }
    } catch (err) {
      console.error("Submit comment error:", err);
      Swal.fire({
        title: "Lỗi",
        text: err.message,
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: "custom-swal-popup",
          confirmButton: "custom-swal-confirm",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function để update replies trong nested structure
  const updateCommentReplies = (comments, parentCommentId, newReply) => {
    return comments.map((comment) => {
      if (comment._id === parentCommentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
          repliesCount: (comment.repliesCount || 0) + 1,
        };
      }
      // Kiểm tra trong replies
      if (comment.replies && comment.replies.length > 0) {
        const updatedReplies = updateCommentReplies(comment.replies, parentCommentId, newReply);
        if (updatedReplies !== comment.replies) {
          return { ...comment, replies: updatedReplies };
        }
      }
      return comment;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleReply = (commentId, username) => {
    setReplyingTo({ commentId, username });
    setNewComment(`@${username} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };

  // Handle comment updated callback
  const handleCommentUpdated = (commentId, updatedData) => {
    const updateCommentData = (comments) => {
      return comments.map((comment) => {
        if (comment._id === commentId) {
          return { ...comment, ...updatedData };
        }
        // Check replies
        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = updateCommentData(comment.replies);
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });
    };

    setComments((prev) => updateCommentData(prev));
  };

  // Handle comment deleted callback
  const handleCommentDeleted = (commentId, isParentComment) => {
    const removeComment = (comments) => {
      return comments.filter((comment) => {
        if (comment._id === commentId) {
          return false; // Remove this comment
        }
        // Update replies
        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = removeComment(comment.replies);
          comment.replies = updatedReplies;
          comment.repliesCount = updatedReplies.length;
        }
        return true;
      });
    };

    setComments((prev) => removeComment(prev));
  };

  if (!thread) return null;

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="comment-dialog-title"
    >
      <DialogTitle
        id="comment-dialog-title"
        sx={{
          fontWeight: "bold",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "#C1E1C1",
          color: "#2E7D32",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        Bình luận bài viết
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ p: 0, display: "flex", flexDirection: "column", height: "60vh" }}
      >
        {/* Comments List */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          {loading && comments.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : comments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </Typography>
            </Box>
          ) : (
            <>
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onReply={handleReply}
                  onCommentUpdated={handleCommentUpdated}
                  onCommentDeleted={handleCommentDeleted}
                  currentUser={currentUser}
                  isReply={false}
                />
              ))}

              {hasMore && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    onClick={() => loadComments(false)}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                  >
                    {loading ? "Đang tải..." : "Xem thêm bình luận"}
                  </Button>
                </Box>
              )}
            </>
          )}
          <div ref={commentsEndRef} />
        </Box>

        <Divider />

        {/* Reply indicator */}
        {replyingTo && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: "#f5f5f5",
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Đang trả lời <strong>@{replyingTo.username}</strong>
            </Typography>
            <Button size="small" onClick={cancelReply}>
              Hủy
            </Button>
          </Box>
        )}

        {/* Comment Input */}
        <CommentInputBox>
          <Avatar
            src={currentUser?.profile?.picture || ""}
            sx={{ width: 32, height: 32 }}
          >
            {currentUser?.username?.charAt(0).toUpperCase() || "U"}
          </Avatar>

          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder={
              replyingTo
                ? `Trả lời @${replyingTo.username}...`
                : "Viết bình luận..."
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={submitting}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
              },
            }}
          />

          <IconButton
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
            color="primary"
            sx={{
              bgcolor: "#2E7D32",
              color: "white",
              "&:hover": {
                bgcolor: "#1B5E20",
              },
              "&:disabled": {
                bgcolor: "#cccccc",
                color: "#666666",
              },
            }}
          >
            {submitting ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </CommentInputBox>
      </DialogContent>
    </StyledDialog>
  );
};

export default CommentModal;