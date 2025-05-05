import React from 'react';
import './index.css';

const FooterAddPost = ({onSubmit}) => {
    return (
        <div className="footer-add-post">
            <div className="footer-left">
                <span>Đã chọn <strong>Đăng tin thường (Miễn phí)</strong></span>
            </div>
            <div className="footer-right">
                <button className="btn-preview">Xem trước</button>
                <button className="btn-draft">Lưu nháp</button>
                <button className="btn-submit" onClick={onSubmit}>Đăng tin</button>
            </div>
        </div>
    );
};

export default FooterAddPost;
