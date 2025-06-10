import { DeleteOutline, PhotoCameraOutlined, VideocamOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import './index.css';

const AddPostLeft = ({ onMediaChange, type, editPost }) => {
    const [videoPreview, setVideoPreview] = useState([null]);
    const [selectedImages, setSelectedImages] = useState([]);

    const updateParentMedia = (images, video) => {
        if (onMediaChange) {
            onMediaChange({ images, video });
        }
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);

        if (selectedImages.length + files.length <= 8) {
            Promise.all(
                files.map((file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            resolve({ file, preview: reader.result });
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                })
            )
                .then((newImages) => {
                    const updatedImages = [...selectedImages, ...newImages];
                    setSelectedImages(updatedImages);
                    updateParentMedia(updatedImages, videoPreview);
                })
                .catch((error) => {
                    console.error("Error reading file:", error);
                    alert("Có lỗi khi tải ảnh lên.");
                });
        } else {
            alert("Bạn chỉ có thể tải lên tối đa 8 hình ảnh.");
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        const updated = [...selectedImages];
        updated.splice(indexToRemove, 1);
        setSelectedImages(updated);
        updateParentMedia(updated, videoPreview);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('video')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const preview = reader.result;
                const videoData = { file, preview };
                setVideoPreview(videoData);
                updateParentMedia(selectedImages, videoData);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (type !== "edit") {
            setVideoPreview(null); // Reset video khi không phải chỉnh sửa
        }

        if (type === "edit" && editPost) {
            const formattedImages = (editPost.images || []).map((url) => ({
                preview: url,
            }));
            setSelectedImages(formattedImages);

            if (editPost.video && editPost.videoUrl) {
                setVideoPreview({
                    preview: editPost.videoUrl
                });
            } else {
                setVideoPreview(null);
            }

            updateParentMedia(formattedImages, editPost.video || null);
        }
    }, [type, editPost]);

    return (
        <div className="container-add-post-left">
            <h2 className="add-post-left-title">Hình ảnh hoặc video bất động sản</h2>
            <div className="media-upload-container">
                {selectedImages.length === 0 ? (
                    <div className="media-box">
                        <div className="media-info">
                            <span className="info-icon"><FaInfoCircle /></span>
                            Hình ảnh hợp lệ
                        </div>
                        <div className="media-content">
                            <label htmlFor="upload-button">
                                <PhotoCameraOutlined className="media-icon" sx={{ fontSize: 70 }} />
                            </label>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="upload-button"
                                type="file"
                                name="images"
                                multiple
                                onChange={handleImageChange}
                            />
                            <p className="media-text">Đăng từ 3 đến 10 hình</p>
                        </div>
                    </div>
                ) : (
                    <div className="image-preview-container">
                        <div className="preview-grid">
                            {selectedImages.map((image, index) => (
                                <div key={index} className="preview-item">
                                    <img
                                        src={image.preview}
                                        alt={`uploaded-${index}`}
                                        className="preview-img"
                                    />
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <DeleteOutline />
                                    </button>
                                </div>
                            ))}

                            {selectedImages.length < 10 && (
                                <div className="preview-item upload-more">
                                    <label htmlFor="upload-button">
                                        <PhotoCameraOutlined className="media-icon" />
                                    </label>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="upload-button"
                                        type="file"
                                        name="images"
                                        multiple
                                        onChange={handleImageChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!videoPreview ? (
                    <div className="media-box">
                        <div className="media-info">
                            <span className="info-icon"><FaInfoCircle /></span>
                            Bán nhanh hơn với Chợ Tốt Video
                        </div>
                        <div className="media-content">
                            <label htmlFor="video-upload-button">
                                <VideocamOutlined className="media-icon" sx={{ fontSize: 70 }} />
                            </label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="file-input"
                                id='video-upload-button'
                            />
                            <p className="media-title">Đăng video để bán nhanh hơn</p>
                            <p className="media-note">Bạn đã đăng 0/30 video trong tháng</p>
                        </div>
                    </div>
                ) : (
                    <div className="video-preview-container">
                        <div className="preview-grid">
                            <div className="preview-item-video">
                                {videoPreview?.preview && (
                                    <video controls width="100%">
                                        <source src={videoPreview.preview} type="video/mp4" />
                                        Trình duyệt của bạn không hỗ trợ video.
                                    </video>
                                )}
                                <button
                                    className="remove-btn"
                                    onClick={() => {
                                        setVideoPreview(null);
                                        updateParentMedia(selectedImages, null);
                                    }}
                                >
                                    <DeleteOutline />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddPostLeft;
