import { PhotoCameraOutlined, VideocamOutlined } from '@mui/icons-material';
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import './index.css';

const AddPostLeft = () => {
    return (
        <div className="container-add-post-left">
            <h2 className='add-post-left-title'>Hình ảnh hoặc video bất động sản</h2>
            <div className="media-upload-container">
                <div className="media-box">
                    <div className="media-info">
                        <span className="info-icon">
                            <FaInfoCircle />
                        </span>
                        Hình ảnh hợp lệ
                    </div>
                    <div className="media-content">
                        <PhotoCameraOutlined className="media-icon" sx={{ fontSize: 70 }} />
                        <p className="media-text">Đăng từ 3 đến 10 hình</p>
                    </div>
                </div>

                <div className="media-box">
                    <div className="media-info">
                        <span className="info-icon">
                            <FaInfoCircle />
                        </span> Bán nhanh hơn với Chợ Tốt Video
                    </div>
                    <div className="media-content">
                        <VideocamOutlined className="media-icon" sx={{ fontSize: 70 }} />
                        <p className="media-title">Đăng video để bán nhanh hơn</p>
                        <p className="media-note">Bạn đã đăng 0/30 video trong tháng</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPostLeft;