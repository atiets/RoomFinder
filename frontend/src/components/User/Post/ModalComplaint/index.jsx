import { Modal } from '@mui/material';
import { useState } from 'react';
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { sendComplaint } from '../../../../redux/apiReport';
import CustomInput from './CustomInput';
import './index.css';

const ComplaintModal = ({ isOpen, handleClose, postID }) => {
    const user = useSelector((state) => state.auth.login.currentUser);
    const token = user?.accessToken;
    const userId = user?._id;

    const [selectedReason, setSelectedReason] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');

    const reasons = [
        'Lừa đảo',
        'Trùng lặp',
        'Bất động sản đã bán',
        'Không liên lạc được',
        'Thông tin Bất động sản không đúng thực tế',
        'Thông tin người đăng không đúng thực tế',
        'Lý do khác',
    ];

    const reasonsRequireNote = [
        'Lừa đảo',
        'Không liên lạc được',
        'Thông tin Bất động sản không đúng thực tế',
        'Thông tin người đăng không đúng thực tế',
        'Lý do khác',
    ];

    const getPlaceholderByReason = (reason) => {
        switch (reason) {
            case 'Lừa đảo':
                return 'Vui lòng mô tả hành vi lừa đảo cụ thể';
            case 'Không liên lạc được':
                return 'Vui lòng mô tả cách bạn đã cố gắng liên hệ. VD: gọi điện nhiều lần không bắt máy, số ảo, khóa máy,...';
            case 'Thông tin Bất động sản không đúng thực tế':
                return 'Vui lòng mô tả thông tin sai lệch. VD: sai giá, sai diện tích, địa điểm tin đăng và dẫn đi thực tế khác nhau,...';
            case 'Thông tin người đăng không đúng thực tế':
                return 'Vui lòng mô tả sự khác biệt. VD: tên người đăng không đúng, số điện thoại không đúng, người đăng đăng bán dịch vụ khác, người đăng chỉ muốn lấy thông tin cá nhân,... ';
            case 'Lý do khác':
                return 'Vui lòng mô tả lý do của bạn';
            default:
                return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReason || !phone || !email) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
        }
        const reportData = {
            postId: postID,
            reporter: {
                id: userId,
                phone,
                email
            },
            reason: selectedReason,
            note
        };

        try {
            const result = await sendComplaint(reportData, token);
            toast.success("Báo cáo đã được gửi thành công.");
            setSelectedReason('');
            setPhone('');
            setEmail('');
            setNote('');
            setTimeout(() => {
                handleClose();
            }, 1000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Gửi báo cáo thất bại. Vui lòng thử lại.";
            toast.error(errorMessage);
        }
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <div className="complaint-modal-overlay">
                <ToastContainer position="top-right" autoClose={5000} />
                <div className="complaint-modal">
                    <div className="modal-header">
                        <h2>Báo cáo vi phạm</h2>
                        <button onClick={handleClose} className="close-btn">×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="complaint-modal-content">
                            <label className="complaint-modal-title">
                                Tin rao này có vấn đề gì <span className="required">*</span>
                            </label>
                            <div className='complaint-modal-reason'>
                                {reasons.map((reason, index) => (
                                    <label key={index} className="radio-option">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={reason}
                                            checked={selectedReason === reason}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                        />
                                        {reason}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {reasonsRequireNote.includes(selectedReason) && (
                            <div className="complaint-modal-note">
                                <label className="complaint-modal-title">Ghi chú</label>
                                <CustomInput
                                    placeholder={getPlaceholderByReason(selectedReason)}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="complaint-modal-container-info">
                            <label className="complaint-modal-title">
                                Thông tin để Nhà Tốt liên hệ với bạn khi cần thiết
                            </label>
                            <input
                                className='complaint-modal-input-phone'
                                type="text"
                                placeholder="Điện thoại của bạn *"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                            <input
                                className='complaint-modal-input-email'
                                type="email"
                                placeholder="Email của bạn *"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn">GỬI BÁO CÁO</button>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default ComplaintModal;
