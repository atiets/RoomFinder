import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Avatar, Button, Checkbox, FormControl, Input, InputLabel, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';
import avatar from '../../../assets/images/demo1.jpg';
import demo from '../../../assets/images/demo2.jpg';
import './chat.css';

const currentUser = "user_1";

const Chat = () => {
    const [isHidden, setIsHidden] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [titlePost, setTitlePost] = useState('Bài đăng');
    const [pricePost, setPricePost] = useState('Giá');
    const [messagesChat, setMessagesChat] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const fetchMessages = async () => {
            const response = {
                chatId: "123",
                messages: [
                    { id: 1, senderId: "user_1", message: "Hello!", timestamp: "10:00 AM" },
                    { id: 2, senderId: "user_2", message: "Hi!", timestamp: "10:02 AM" },
                    { id: 3, senderId: "user_1", message: "How are you?", timestamp: "10:05 AM" }
                ]
            };
            setMessagesChat(response.messages);
        };

        fetchMessages();
    }, []);

    const sendMessage = () => {
        if (newMessage.trim() === "") return;

        const newMsg = {
            id: messagesChat.length + 1,
            senderId: currentUser,
            message: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        setMessagesChat([...messagesChat, newMsg]); // Cập nhật danh sách tin nhắn
        setNewMessage("");
    };

    const messages = [
        {
            id: 1,
            name: 'John Doe',
            message: 'Hello, how are you?',
            avatar: avatar,
            image: demo,
            active: 'Active now'
        },
        {
            id: 2,
            name: 'Jane Smithssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
            message: 'I am fine, thank youaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaa!',
            avatar: avatar,
            image: demo,
            active: 'Active now'
        },
        {
            id: 3,
            name: 'John Doe',
            message: 'Hello, how are you?',
            avatar: avatar,
            image: demo,
            active: 'Active now'
        },
        {
            id: 4,
            name: 'John Doe',
            message: 'Hello, how are you?',
            avatar: avatar,
            image: demo,
            active: 'Active 1 minute ago'
        },
        {
            id: 5,
            name: 'John Doe',
            message: 'Hello, how are you?',
            avatar: avatar,
            image: demo,
            active: 'Active 30 minute ago'
        },
        {
            id: 6,
            name: 'John Doe',
            message: 'Hello, how are you?',
            avatar: avatar,
            image: demo,
            active: 'Active 1 minute ago'
        },
        {
            id: 7,
            name: 'John Doe',
            message: 'Hello, how are you?',
            avatar: avatar,
            image: demo,
            active: 'Active 1 minute ago',
        },
    ];

    const truncateMessage = (message, maxLength) => {
        if (message.length > maxLength) {
            return message.substring(0, maxLength) + '...';
        }
        return message;
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
                    {messages.map((msg) => (
                        <div key={msg.id} className='chat-card' onClick={() => handleCardClick(msg)}>
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
                            <Avatar src={msg.avatar} alt={msg.name} className='chat-card-avatar' />
                            <div className='chat-card-content'>
                                <div className='chat-card-name'>{truncateMessage(msg.name, 30)}</div>
                                <div className='chat-card-message'>{truncateMessage(msg.message, 50)}</div>
                            </div>
                            <img src={msg.image} alt='message' className='chat-card-image' />
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
                            <Avatar src={selectedChat.avatar} alt={selectedChat.name} className='chat-card-avatar-left' />
                            <div className='chat-card-content-left'>
                                <div className='chat-card-name-left'>{truncateMessage(selectedChat.name, 30)}</div>
                                <div className='chat-card-online'>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: selectedChat.active === 'Active now' ? 'green' : 'gray',
                                            marginRight: '5px',
                                        }}
                                    ></span>
                                    {selectedChat.active}
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
                        <div className='chat-box-left-posts-title'>{truncateMessage(titlePost, 30)}</div>
                        <div className='chat-box-left-posts-price'>{truncateMessage(pricePost, 30)}</div>
                    </div>
                    <div className='chat-box-left-posts-image'>
                        <img src={demo} alt='post' className='chat-card-post-image' />
                    </div>
                </div>
                <div className='chat-box-left-content'>
                    {messagesChat
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Sắp xếp theo thời gian
                        .map((msg) => (
                            <div key={msg.id} className={`message ${msg.senderId === currentUser ? "sent" : "received"}`}>
                                <p>{msg.message}</p>
                                <span>{msg.timestamp}</span>
                            </div>
                        ))}
                </div>
                <div className='chat-box-left-idea'>
                    {/* Additional content for the selected chat */}
                </div>
                <div className='chat-box-left-footer'>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                    />
                    <button onClick={sendMessage}>Gửi</button>
                </div>
            </div>
        </div>
    );
};

export default Chat;