import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Avatar, Button, Checkbox, FormControl, Input, InputLabel, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import useSocket from '../../../hooks/useSocket';
import { getConversationsByUser } from '../../../redux/chatApi';
import './chat.css';

const currentUser = "user_1";

const Chat = () => {
    const location = useLocation();

    const post = location.state?.post;
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const id = currentUser?._id;
    const token = currentUser?.accessToken;
    const socket = useSocket(id);

    const [isHidden, setIsHidden] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [titlePost, setTitlePost] = useState('Bài đăng');
    const [pricePost, setPricePost] = useState('Giá');
    const [messagesChat, setMessagesChat] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showIcons, setShowIcons] = useState(true);
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState([]);

    const mess = [
        {
            id: "1",
            senderId: "user1",
            receiverId: "user2",
            content: "Chào bạn, bạn có khỏe không?",
            timestamp: "2024-03-25T08:30:00Z"
        },
        {
            id: "2",
            senderId: "user2",
            receiverId: "user1",
            content: "Mình khỏe, còn bạn thế nào?",
            timestamp: "2024-03-25T08:31:00Z"
        },
        {
            id: "3",
            senderId: "user1",
            receiverId: "user2",
            content: "Mình cũng khỏe, cảm ơn bạn!",
            timestamp: "2024-03-25T08:32:00Z"
        },
        {
            id: "4",
            senderId: "user2",
            receiverId: "user1",
            content: "Tối nay có đi chơi không?",
            timestamp: "2024-03-25T08:33:00Z"
        },
        {
            id: "5",
            senderId: "user1",
            receiverId: "user2",
            content: "Mình bận rồi, hôm khác nhé!",
            timestamp: "2024-03-25T08:34:00Z"
        }
    ];

    // Giả định id của người dùng hiện tại
    const idd = "user1";

    const getOtherParticipants = (conversations, currentUserId) => {
        return conversations.map(chat => {
            const otherParticipant = chat.participants.find(p => p._id !== currentUserId);

            return {
                ...chat, // Giữ nguyên tất cả thuộc tính khác của cuộc trò chuyện
                conversationId: chat._id,
                username: otherParticipant ? otherParticipant.username : "Unknown",
                profilePic: otherParticipant?.profile?.picture || null
            };
        });
    };

    console.log("selectChat:", selectedChat);  // Kiểm tra cuộc trò chuyện đã chọn


    useEffect(() => {
        const fetchConversation = async () => {
            try {
                const response = await getConversationsByUser(id, token);
                const formattedConversations = getOtherParticipants(response.data || [], id);
                setConversation(formattedConversations); // Lưu dữ liệu đã chuẩn hóa
            } catch (error) {
                console.error("Lỗi khi lấy đoạn chat:", error);
                setConversation([]);
            }
        };

        fetchConversation();
    }, [id, token]);

    useEffect(() => {
        if (!socket) return;

        socket.on("receiveMessage", (message) => {
            console.log("Received message:", message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [socket]);


    const sendMessage = () => {
        if (!newMessage.trim()) return; // Kiểm tra tin nhắn rỗng

        const participants = selectedChat?.participants || []; // Đảm bảo luôn có mảng
        console.log("Participants:", participants); // Kiểm tra dữ liệu

        const otherParticipant = participants.length > 1
            ? participants.find(p => p._id !== id)?._id
            : null;

        console.log("Other participant ID:", otherParticipant); // Kiểm tra người nhận

        const receiver = otherParticipant || post.contactInfo?.user;
        if (!receiver) {
            console.error("❌ Không tìm thấy receiver!");
            return; // Ngăn lỗi nếu không tìm thấy người nhận
        }

        const messageData = {
            sender: id,
            receiver,
            content: newMessage,
            postId: post?._id || null,
        };

        console.log("Sending message:", messageData);

        socket.emit("sendMessage", messageData, (response) => {
            console.log("Server response:", response);
        });

        setMessages((prevMessages) => [...prevMessages, messageData]);
        setNewMessage("");
    };


    const truncateMessage = (messa, maxLength) => {
        if (!messa) return "";

        return messa.length > maxLength
            ? messa.substring(0, maxLength) + '...'
            : messa;
    };

    const handleCheckboxChange = (id) => {
        setSelectedMessages((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((msgId) => msgId !== id)
                : [...prevSelected, id]
        );
    };

    const handleCardClick = (msg) => {
        setSelectedChat(msg);
    };

    const handleCloseIconClick = () => {
        setShowIcons(!showIcons);
        console.log("showIcons:", !showIcons);
    };

    return (
        <div className="chat-container">
            <div className='chat-box-right'>
                {!isHidden && (
                    <>
                        <div className='chat-box-right-header'>
                            <Input placeholder='Search for friends' />
                        </div>
                        <div className='chat-box-right-settings'>
                            <div className='chat-box-right-settings-select'>
                                <FormControl sx={{ minWidth: 200 }} size="small">
                                    <InputLabel id="label-select-filter">Bộ lọc</InputLabel>
                                    <Select
                                        labelId="label-select-filter"
                                        id="label-select-filter"
                                        label="Bộ lọc"
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    padding: 0,
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value={10}>Tin nhắn chưa đọc</MenuItem>
                                        <MenuItem value={20}>Tin nhắn đã ẩn</MenuItem>
                                        <MenuItem value={30}>Tin nhắn rác</MenuItem>
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
                    {conversation.map((msg) => (
                        <div key={msg._id} className='chat-card' onClick={() => handleCardClick(msg)}>
                            {isHidden && (
                                <Checkbox
                                    checked={selectedMessages.includes(msg.id)}
                                    onChange={() => handleCheckboxChange(msg.id)}
                                    sx={{
                                        color: 'black',
                                        '&.Mui-checked': {
                                            color: '#63ab45',
                                        },
                                    }}
                                />
                            )}
                            <Avatar src={msg.profile?.picture} alt={msg.participants?.username} className='chat-card-avatar' />
                            <div className='chat-card-content'>
                                <div className='chat-card-name'>{truncateMessage(msg.username, 30)}</div>
                                <div className='chat-card-message'>{truncateMessage(msg.lastMessage?.content, 50)}</div>
                            </div>
                            <img src={msg.postId?.images} alt='message' className='chat-card-image' />
                        </div>
                    ))}
                </div>
                <div className='chat-box-right-footer'>
                    {!isHidden ? (
                        <Button
                            variant="outlined"
                            size="small"
                            style={{ color: 'black', textTransform: 'none', borderColor: 'black', display: 'flex', alignItems: 'center' }}
                            onClick={() => setIsHidden(true)}
                        >
                            <VisibilityOffOutlinedIcon style={{ marginRight: '5px' }} />
                            Ẩn hộp thoại
                        </Button>
                    ) : (
                        <div className='chat-box-right-footer-selected'>
                            <span>Đã chọn {selectedMessages.length}</span>
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
                                style={{ color: 'white', textTransform: 'none', borderColor: 'black', marginLeft: '1rem', backgroundColor: '#63ab45', width: '30%' }}
                            >
                                Ẩn
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className='chat-box-left'>
                <div className='chat-box-left-header'>
                    {selectedChat ? (
                        <>
                            <Avatar src={selectedChat.profile?.picture} alt={selectedChat.username} className='chat-card-avatar-left' />
                            <div className='chat-card-content-left'>
                                <div className='chat-card-name-left'>{truncateMessage(selectedChat.username, 30)}</div>
                                <div className='chat-card-online'>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: selectedChat.isOnline === 'True' ? 'green' : 'gray',
                                            marginRight: '5px',
                                        }}
                                    ></span>
                                    {selectedChat.isOnline === 'True' ? 'Online' : 'Offline'}
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
                        <div className='chat-box-left-posts-title'>{selectedChat?.postId?.title}</div>
                        <div className="chat-box-left-posts-price">
                            {selectedChat?.postId?.rentalPrice} triệu
                            {selectedChat?.postId?.typePrice === 1 ? "/tháng" : selectedChat?.postId?.typePrice === 2 ? "/m²/tháng" : ""}
                        </div>
                    </div>
                    <div className='chat-box-left-posts-image'>
                        <img src={selectedChat?.firstPostImage} alt='post' className='chat-card-post-image' />
                    </div>
                </div>
                <div className='chat-box-left-content'>
                    {mess
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Sắp xếp tin nhắn theo thời gian
                        .map((msg) => (
                            <div key={msg.id} className={`message ${msg.senderId === idd ? "sent" : "received"}`}>
                                <p>{msg.content}</p>
                                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                        ))}
                </div>
                <div className='chat-box-left-idea'>
                    <div className='chat-box-left-idea-body' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {["Phòng này hiện còn trống không ạ?", "Tình trạng giấy tờ thế nào ạ?", "Tôi có thể trả góp không?", "Giá thuê phòng là bao nhiêu? Có bao gồm điện, nước không?", "Phòng có nội thất hay không? Nếu có thì bao gồm những gì?", "Hợp đồng thuê tối thiểu bao lâu? Có thể trả theo tháng không?"].map((question, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                size="small"
                                style={{ color: '#444444', textTransform: 'none', borderColor: '#444444', borderRadius: '15px', alignItems: 'center', margin: '0 5px', marginTop: '5px' }}
                            >
                                {question}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className='chat-box-left-footer'>
                    <div className="chat-box-left-footer">
                        <div className={`chat-box-left-footer-media ${showIcons ? 'visible' : 'hidden'}`}>
                            {showIcons ? (
                                <>
                                    <CloseIcon sx={{ color: '#63ab45' }} onClick={handleCloseIconClick} />
                                    <InsertPhotoIcon sx={{ color: '#63ab45' }} />
                                    <LocationOnIcon sx={{ color: '#63ab45' }} />
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
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className='chat-box-left-input'
                        />
                        <SendIcon onClick={sendMessage} sx={{ color: '#63ab45' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;