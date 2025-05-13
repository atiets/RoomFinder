import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Avatar, Button, Checkbox, FormControl, Input, InputLabel, MenuItem, Select } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import useSocket from '../../../hooks/useSocket';
import { getConversationsByUser, getFilteredConversations, getMessagesByConversation, searchConversation, updateConversationVisibility } from '../../../redux/chatApi';
import { uploadImages } from '../../../redux/uploadApi';
import ModalMap from '../ModalMap';
import './chat.css';
import MessageLocation from './MessageLocation';
import SuggestedQuestions from './SuggestedQuestions';

const Chat = () => {
    const location = useLocation();
    const chatRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    const postID = location.state?.postId || null;
    const title = location.state?.title || null;
    const images = location.state?.images || null;
    const price = location.state?.price || null;
    const typePrice = location.state?.typePrice || null;
    const contactInfo = location.state?.contactInfo || null;

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

    const conversationId = selectedChat?._id || null;

    console.log('title', title);

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
        return (conversations || []).map(chat => {
            const participants = Array.isArray(chat.participants) ? chat.participants : [];
            const otherParticipant = participants.find(p => p._id !== currentUserId);
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
                postId: postID || null,
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

    console.log("conversation", conversation);

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
                                <SettingsIcon style={{ marginRight: '1.6rem' }} />
                            </div>
                        </div>
                    </>
                )}
                <div className='chat-box-right-body' style={{ overflowY: 'auto', maxHeight: '400px' }}>
                    {conversation
                        .map((msg) => {
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
                                    <img src={msg.postId?.images} alt="message" className="chat-card-image" />
                                </div>
                            );
                        })}
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
                            <MoreVertIcon style={{ marginLeft: 'auto', alignContent: 'center' }} />
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
                            {price || selectedChat?.postId?.rentalPrice} triệu
                            {typePrice || selectedChat?.postId?.typePrice === 1 ? "/tháng" : typePrice || selectedChat?.postId?.typePrice === 2 ? "/m²/tháng" : ""}
                        </div>
                    </div>
                    <div className='chat-box-left-posts-image'>
                        <img src={images || selectedChat?.firstPostImage} alt='post' className='chat-card-post-image' />
                    </div>
                </div>
                <div className='chat-box-left-content' ref={chatRef}>
                    {messagesChat
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender === id ? "sent" : "received"}`}>
                                {/* Nội dung văn bản */}
                                {msg.content && <p>{msg.content}</p>}

                                {/* Hiển thị ảnh nếu có */}
                                {msg.images && msg.images.length > 0 && (
                                    <div className="message-images">
                                        {msg.images.map((imgUrl, index) => (
                                            <img
                                                key={index}
                                                src={imgUrl}
                                                alt={`Ảnh ${index + 1}`}
                                                className="message-image"
                                                onClick={() => handleImageClick(imgUrl)} // Mở ảnh lớn khi click
                                            />
                                        ))}
                                    </div>
                                )}
                                {msg.location && <MessageLocation location={msg.location} />}
                                {/* Thời gian */}
                                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
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
                                    <ChatIcon sx={{ color: '#63ab45' }} />
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
        </div>
    );
};

export default Chat;