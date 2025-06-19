import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Avatar, Button, Checkbox, FormControl, Input, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import defaultImage from '../../../assets/images/defaultImage.jpg';
import useSocket from '../../../hooks/useSocket';
import { getConversationsByUser, getFilteredConversations, getMessagesByConversation, searchConversation, updateConversationVisibility } from '../../../redux/chatApi';
import { uploadImages } from '../../../redux/uploadApi';
import ModalMap from '../ModalMap';
import './chat.css';
import MessageLocation from './MessageLocation';
import SuggestedQuestions from './SuggestedQuestions';

const formatPriceToText = (price) => {
    const numericPrice = Number(price);

    if (isNaN(numericPrice)) {
        return "Liên hệ";
    }

    if (numericPrice >= 1_000_000_000) {
        const billions = (numericPrice / 1_000_000_000).toFixed(1);
        return `${billions} tỷ`;
    }

    if (numericPrice >= 1_000_000) {
        const millions = (numericPrice / 1_000_000).toFixed(1);
        return `${millions} triệu`;
    }

    if (numericPrice >= 1_000) {
        const thousands = Math.floor(numericPrice / 1_000);
        return `${thousands}k`;
    }

    return `${numericPrice.toLocaleString()}`;
};

const Chat = () => {
    const location = useLocation();
    const chatRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const postID = location.state?.postId || null;
    const title = location.state?.title || null;
    const images = location.state?.image || null;
    const contactInfo = location.state?.contactInfo || null;
    const rawPrice = location.state?.price;
    console.log("Giá truyền đến: ", rawPrice);
    const [price, setPrice] = useState();

    useEffect(() => {
        const numericPrice = Number(rawPrice);
        setPrice(formatPriceToText(numericPrice));
    }, [rawPrice]);

    console.log("Giá đc format: ", price);

    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const id = currentUser?._id;
    const token = currentUser?.accessToken;
    const socket = useSocket(id);

    const [isHidden, setIsHidden] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messagesChat, setMessagesChat] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showIcons, setShowIcons] = useState(true);
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [openMapModal, setOpenMapModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debouncedText, setDebouncedText] = useState("");
    const [visibleConversations, setVisibleConversations] = useState([]);
    const [typeConversation, setTypeConversation] = useState("");
    const [showTime, setShowTime] = useState(null);

    const conversationId = selectedChat?._id || null;

    const BOT_ID = process.env.REACT_APP_BASE_URL_BOT_ID;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedText(searchText.trim());
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                if (!debouncedText) {
                    const response = await getConversationsByUser(id, token);
                    const formatted = getOtherParticipants(response.data || [], id);
                    setConversation(formatted);
                } else {
                    const results = await searchConversation(id, debouncedText, token);
                    if (results) {
                        const formattedResults = getOtherParticipants(results, id);
                        setConversation(formattedResults);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tìm kiếm hoặc lấy cuộc trò chuyện:", error);
                setConversation([]);
            }
        };

        fetchResults();
    }, [debouncedText, id, token]);

    const handleImageClick = (imgUrl) => {
        setSelectedImage(imgUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const handleImageIconClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleRemoveImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        const previews = files.map(file => URL.createObjectURL(file));
        setSelectedImages(prev => [...prev, ...previews]);
        setImageFiles(prev => [...prev, ...files]);
    };

    useEffect(() => {
        if (!socket) return;
        socket.on("onlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
        return () => {
            socket.off("onlineUsers");
        };
    }, [socket]);

    useEffect(() => {
        const chatBox = chatRef.current;
        if (!chatBox) return;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, [messagesChat]);

    useEffect(() => {
        if (!socket) return;
        const handleReceiveMessage = (newMessage) => {
            setMessagesChat((prev) => [...prev, newMessage]);
        };
        socket.on("receiveMessage", handleReceiveMessage);
        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [socket]);

    const getOtherParticipants = (conversations, currentUserId) => {
        return (conversations || [])
            .filter(chat => {
                const participants = Array.isArray(chat.participants) ? chat.participants : [];
                // Loại bỏ conversation có BOT_ID
                return !participants.some(p => {
                    const participantId = typeof p === 'object' ? p._id : p;
                    return participantId?.toString() === BOT_ID;
                });
            })
            .map(chat => {
                const participants = Array.isArray(chat.participants) ? chat.participants : [];
                const otherParticipant = participants.find(p => p._id?.toString() !== currentUserId);
                return {
                    ...chat,
                    conversationId: chat._id,
                    userId: otherParticipant ? otherParticipant._id : null,
                    username: otherParticipant ? otherParticipant.username : "Unknown",
                    profilePic: otherParticipant?.profile?.picture || null
                };
            });
    };

    useEffect(() => {
        handleFilterConversations(typeConversation);
        if (socket) {
            const handleUpdateConversation = ({ userIds, updatedConversation }) => {
                if (!userIds.includes(id)) return;
                setConversation(prev => {
                    const exists = prev.find(conv => conv._id === updatedConversation._id);
                    let newList;
                    if (exists) {
                        newList = prev.map(conv =>
                            conv._id === updatedConversation._id
                                ? { ...conv, ...updatedConversation }
                                : conv
                        );
                    } else {
                        const newFormatted = getOtherParticipants([updatedConversation], id);
                        newList = [...newFormatted, ...prev];
                    }

                    return [...newList].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                });
            };

            socket.on("updateConversations", handleUpdateConversation);

            return () => {
                socket.off("updateConversations", handleUpdateConversation);
            };
        }
    }, [id, token, socket]);

    const fetchMessages = async () => {
        try {
            const response = await getMessagesByConversation(conversationId, token, 1, 20);
            if (response && response.data) {
                setMessagesChat(response.data.messages);
            }
        } catch (error) {
            console.error("Lỗi khi lấy tin nhắn:", error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [conversationId, token]);

    const handleKeyPress = (event) => {
        if (event.key === "Enter" && newMessage.trim()) {
            sendMessage();
        }
    };

    const sendMessage = async (location = null) => {
        if (!newMessage.trim() && imageFiles.length === 0 && !location) return;
        try {
            let uploadedImageUrls = [];
            if (imageFiles.length > 0) {
                uploadedImageUrls = await uploadImages(imageFiles);
            }
            const participants = selectedChat?.participants || [];
            const otherParticipant = participants.length > 1
                ? participants.find(p => p._id !== id)?._id
                : null;
            const receiver = otherParticipant || contactInfo;
            if (!receiver) {
                console.error("❌ Không tìm thấy người nhận!");
                return;
            }
            const messageData = {
                sender: id,
                receiver,
                content: newMessage,
                images: uploadedImageUrls,
                postId: postID || selectedChat?.postId?._id || null,
                location: location ? { latitude: location[0], longitude: location[1] } : null,
            };
            socket.emit("sendMessage", messageData, (response) => {
                console.log("Server response:", response);
            });
            setMessages(prev => [...prev, messageData]);
            setNewMessage("");
            setSelectedImages([]);
            setImageFiles([]);
        } catch (error) {
            console.error("❌ Lỗi khi gửi tin nhắn hoặc upload ảnh:", error);
        }
    };

    const truncateMessage = (messa, maxLength) => {
        if (!messa) return "";
        return messa.length > maxLength
            ? messa.substring(0, maxLength) + '...'
            : messa;
    };

    const handleCheckboxChange = (id) => {
        setVisibleConversations((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((msgId) => msgId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    const handleCardClick = (msg) => {
        if (!msg.readBy?.includes(currentUser.id)) {
            socket.emit("readConversation", {
                conversationId: msg._id,
                userId: id,
            });
        }
        setSelectedChat(msg);
        setNewMessage("");
        navigate(location.pathname, { replace: true });
    };

    const handleCloseIconClick = () => {
        setShowIcons(!showIcons);
    };

    const handleToggleVisibility = async (visible) => {
        try {
            const data = await updateConversationVisibility(visibleConversations, visible, token);
            setVisibleConversations([]);
            toast.success("Cập nhật thành công!");
            handleFilterConversations(typeConversation);
        } catch (err) {
            toast.error(err);
        }
    };

    const handleSelectChange = (event) => {
        const selectedType = event.target.value;
        setTypeConversation(selectedType);
        handleFilterConversations(selectedType);
    };

    const handleFilterConversations = async (typeConversation) => {
        try {
            const response = await getFilteredConversations(id, typeConversation, token);
            const formatted = getOtherParticipants(response.data || [], id);
            setConversation(formatted);
        } catch (error) {
            console.error("Lỗi khi lọc cuộc trò chuyện:", error);
        }
    };

    console.log("Selected Chat:", selectedChat);
    return (
        <div className="chat-container">
            <ToastContainer position="top-right" autoClose={5000} />
            <div className='chat-box-right'>
                {!isHidden && (
                    <>
                        <div className='chat-box-right-header'>
                            <Input
                                placeholder='Search for friends'
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className='chat-box-right-settings'>
                            <div className='chat-box-right-settings-select'>
                                <FormControl sx={{ minWidth: 200 }} size="small">
                                    <InputLabel id="label-select-filter">Bộ lọc</InputLabel>
                                    <Select
                                        labelId="label-select-filter"
                                        id="label-select-filter"
                                        label="Bộ lọc"
                                        value={typeConversation}
                                        onChange={handleSelectChange}
                                        size="small"
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    padding: 0,
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Không lọc</MenuItem>
                                        <MenuItem value="all">Tất cả</MenuItem>
                                        <MenuItem value="unread">Tin nhắn chưa đọc</MenuItem>
                                        <MenuItem value="hidden">Tin nhắn đã ẩn</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div className='chat-box-right-settings-icon'>
                                {/* <SettingsIcon style={{ marginRight: '1.6rem' }} /> */}
                            </div>
                        </div>
                    </>
                )}
                <div className="chat-box-right-body" style={{ overflowY: 'auto', maxHeight: '400px' }}>
                    {conversation.length > 0 ? (
                        conversation.map((msg) => {
                            const isUnread = !msg.readBy?.includes(id);
                            return (
                                <div
                                    key={msg._id}
                                    className={`chat-card ${isUnread ? 'unread' : ''}`}
                                    onClick={() => handleCardClick(msg)}
                                >
                                    {isHidden && (
                                        <Checkbox
                                            checked={visibleConversations.includes(msg._id)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => handleCheckboxChange(msg._id)}
                                            sx={{
                                                color: 'black',
                                                '&.Mui-checked': {
                                                    color: '#63ab45',
                                                },
                                            }}
                                        />
                                    )}
                                    <Avatar src={msg.profilePic} alt={msg.username} className="chat-card-avatar" />
                                    <div className="chat-card-content">
                                        <div className={`chat-card-name ${isUnread ? 'unread-text' : ''}`}>
                                            {truncateMessage(msg.username, 30)}
                                        </div>
                                        <div className={`chat-card-message ${isUnread ? 'unread-text' : ''}`}>
                                            {truncateMessage(msg.lastMessage?.content, 50)}
                                        </div>
                                    </div>
                                    <img src={msg.postId?.images || defaultImage || images} alt="message" className="chat-card-image" />
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#FFA500' }}>
                            <span style={{ fontSize: '2rem' }}>💬</span>
                            <div style={{ marginTop: '0.5rem', fontWeight: '500' }}>Bạn chưa có cuộc trò chuyện nào</div>
                        </div>
                    )}
                </div>
                <div className='chat-box-right-footer'>
                    {!isHidden ? (
                        <Button
                            variant="outlined"
                            size="small"
                            style={{ color: 'black', textTransform: 'none', borderColor: 'black', display: 'flex', alignItems: 'center' }}
                            onClick={() => setIsHidden(true)}
                        >
                            {typeConversation === 'hidden' ? (
                                <>
                                    <VisibilityOutlinedIcon style={{ marginRight: '5px' }} />
                                    Hiện hộp thoại
                                </>
                            ) : (
                                <>
                                    <VisibilityOffOutlinedIcon style={{ marginRight: '5px' }} />
                                    Ẩn hộp thoại
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className='chat-box-right-footer-selected'>
                            <span>Đã chọn {visibleConversations.length}</span>
                            <Button
                                variant="outlined"
                                size="small"
                                style={{ color: 'black', textTransform: 'none', borderColor: 'black', marginLeft: '1rem', width: '30%' }}
                                onClick={() => setIsHidden(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                style={{
                                    color: 'white',
                                    textTransform: 'none',
                                    borderColor: 'black',
                                    marginLeft: '1rem',
                                    backgroundColor: '#63ab45',
                                    width: '30%'
                                }}
                                onClick={() => handleToggleVisibility(typeConversation === 'hidden' ? 1 : 0)}
                            >
                                {typeConversation === 'hidden' ? 'Hiện' : 'Ẩn'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {!(selectedChat || postID || title || images || price || contactInfo) ? (
                <div className='empty-chat-box-in-user'>
                    <i className="fas fa-comments"></i>
                    <p>Vui lòng chọn một cuộc trò chuyện để bắt đầu</p>
                </div>

            ) : (
                <div className='chat-box-left'>
                    <div className='chat-box-left-header'>
                        {selectedChat ? (
                            <>
                                <Avatar src={selectedChat.profilePic} alt={selectedChat.username} className='chat-card-avatar-left' />
                                <div className='chat-card-content-left'>
                                    <div className='chat-card-name-left'>{truncateMessage(selectedChat.username, 30)}</div>
                                    <div className='chat-card-online'>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: onlineUsers.includes(selectedChat.userId) ? 'green' : 'gray',
                                                marginRight: '5px',
                                            }}
                                        ></span>
                                        {onlineUsers.includes(selectedChat.userId) ? 'Online' : 'Offline'}
                                    </div>
                                </div>
                                {/* <MoreVertIcon style={{ marginLeft: 'auto', alignContent: 'center' }} /> */}
                            </>
                        ) : (
                            <div className='chat-card-content'>
                                <div className='chat-card-name'>Chọn một cuộc trò chuyện</div>
                            </div>
                        )}
                    </div>
                    <div className='chat-box-left-posts'>
                        <div className='chat-box-left-posts-content'>
                            <div className='chat-box-left-posts-title'>{title || selectedChat?.postId?.title}</div>
                            <div className="chat-box-left-posts-price">
                                {price}
                                <span className="price-unit">VNĐ</span>
                            </div>
                        </div>
                        <div className='chat-box-left-posts-image'>
                            <img src={images || selectedChat?.firstPostImage || defaultImage} alt='post' className='chat-card-post-image' />
                        </div>
                    </div>
                    <div className='chat-box-left-content' ref={chatRef}>
                        {messagesChat
                            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                            .map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chat-message-wrapper ${msg.sender === id ? "chat-sent" : "chat-received"}`}
                                    onClick={() => setShowTime((prev) => (prev === msg.id ? null : msg.id))}
                                >
                                    {/* Chỉ hiển thị khung cam nếu có content */}
                                    {msg.content && (
                                        <div className={`chat-message ${msg.sender === id ? "chat-message-sent" : "chat-message-received"}`}>
                                            <p>{msg.content}</p>

                                            {/* Hiện giờ nếu không có ảnh và location */}
                                            {showTime === msg.id && !msg.images?.length && !msg.location && (
                                                <span className="chat-message-time">
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Ảnh */}
                                    {msg.images?.length > 0 && (
                                        <div className="chat-message-images">
                                            {msg.images.map((imgUrl, index) => (
                                                <img
                                                    key={index}
                                                    src={imgUrl}
                                                    alt={`Ảnh ${index + 1}`}
                                                    className="chat-message-image"
                                                    onClick={() => handleImageClick(imgUrl)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Location */}
                                    {msg.location && (
                                        <div className="chat-message-location">
                                            <MessageLocation location={msg.location} />
                                        </div>
                                    )}

                                    {/* Giờ nằm ngoài nếu có ảnh hoặc location */}
                                    {(msg.images?.length > 0 || msg.location) && showTime === msg.id && (
                                        <span className="chat-message-time chat-time-outside">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                            ))}

                        {/* Modal hiển thị ảnh lớn */}
                        {selectedImage && (
                            <div className="modal open" onClick={closeModal}>
                                <img src={selectedImage} alt="Ảnh lớn" />
                            </div>
                        )}
                    </div>
                    <div className='chat-box-left-idea'>
                        <SuggestedQuestions
                            postContent={title || selectedChat?.postId?.title}
                            selectChat={selectedChat}
                            onSelectQuestion={(question) => setNewMessage(question)}
                        />
                    </div>
                    <div className="image-preview-container">
                        {selectedImages.map((image, index) => (
                            <div key={index} className="image-preview">
                                <img src={image} alt={`preview-${index}`} />
                                <button onClick={() => handleRemoveImage(index)}>X</button>
                            </div>
                        ))}
                    </div>
                    <div className='chat-box-left-footer'>
                        <div className="chat-box-left-footer">
                            <div className={`chat-box-left-footer-media ${showIcons ? 'visible' : 'hidden'}`}>
                                {showIcons ? (
                                    <>
                                        <CloseIcon sx={{ color: '#63ab45' }} onClick={handleCloseIconClick} />
                                        <InsertPhotoIcon sx={{ color: '#63ab45' }} onClick={handleImageIconClick} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                        />
                                        <LocationOnIcon
                                            sx={{ color: "#63ab45", cursor: "pointer" }}
                                            onClick={() => setOpenMapModal(true)}
                                        />
                                        <ModalMap
                                            open={openMapModal}
                                            onClose={() => setOpenMapModal(false)}
                                            onSendLocation={(coords) => sendMessage(coords)}
                                        />
                                        {/* <ChatIcon sx={{ color: '#63ab45' }} /> */}
                                    </>
                                ) : null}
                            </div>
                            {!showIcons && (
                                <AddIcon sx={{ color: '#63ab45' }} onClick={handleCloseIconClick} />
                            )}
                        </div>
                        <div className='chat-box-left-input-container' style={{ flex: showIcons ? 8 : 10 }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className='chat-box-left-input'
                                onKeyPress={handleKeyPress}
                            />
                            <SendIcon onClick={sendMessage} sx={{ color: '#63ab45' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;