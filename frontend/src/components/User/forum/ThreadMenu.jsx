// src/components/User/forum/ThreadMenu.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { deleteThread } from '../../../redux/threadApi'; 

const ThreadMenu = ({ thread, onEdit, onThreadDeleted }) => {
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit();
  };

  const handleDelete = () => {
    handleMenuClose();
    
    Swal.fire({
      title: "Xác nhận xóa",
      html: `
        <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
        <p><strong>Lưu ý:</strong> Tất cả bình luận cũng sẽ bị xóa.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'custom-swal-confirm',
        cancelButton: 'custom-swal-cancel'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeleting(true);
          
          const response = await deleteThread(thread.id || thread._id, currentUser.accessToken);
          
          if (response.success) {
            onThreadDeleted && onThreadDeleted(thread.id || thread._id);
            
            Swal.fire({
              title: "Đã xóa",
              text: "Bài viết đã được xóa thành công!",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'custom-swal-popup'
              }
            });
          }
        } catch (error) {
          console.error('Delete thread error:', error);
          Swal.fire({
            title: "Lỗi",
            text: error.message,
            icon: "error",
            confirmButtonText: "Đóng",
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-swal-confirm'
            }
          });
        } finally {
          setDeleting(false);
        }
      }
    });
  };

  return (
    <>
      <IconButton
        aria-label="settings"
        onClick={handleMenuClick}
        disabled={deleting}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.08)',
            transform: 'rotate(90deg)'
          },
          transition: 'all 0.2s ease-in-out',
          '&:disabled': { opacity: 0.3 }
        }}
      >
        {deleting ? (
          <CircularProgress size={20} />
        ) : (
          <MoreVertIcon />
        )}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            borderRadius: '12px',
            minWidth: '150px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleEdit}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.08)'
            }
          }}
        >
          <EditIcon sx={{ mr: 1.5, fontSize: 18, color: '#2E7D32' }} />
          <Typography variant="body2" fontWeight={500}>Sửa</Typography>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleDelete} 
          sx={{ 
            py: 1.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)'
            }
          }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
          <Typography variant="body2" fontWeight={500}>Xóa</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThreadMenu;
