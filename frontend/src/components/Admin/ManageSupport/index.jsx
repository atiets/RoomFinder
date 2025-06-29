import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import { Avatar, Button, FormControl, Input, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import useSocket from '../../../hooks/useSocket';
import { getListConversation, getMessagesByConversation, getUnclaimedConversations } from '../../../redux/chatApi';
import { uploadImages } from '../../../redux/uploadApi';
import './index.css';

const ManageSupport = () => {
  const location = useLocation();
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const postID = location.state?.postId || null;
  const contactInfo = location.state?.contactInfo || null;

  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const id = currentUser?._id;
  const token = currentUser?.accessToken;
  const socket = useSocket(id);

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
  const [searchText, setSearchText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [visibleConversations, setVisibleConversations] = useState([]);
  const [typeConversation, setTypeConversation] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const conversationId = selectedChat?._id || null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(searchText.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

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

    const onReceive = (data) => {
      const { message, updatedConversation, userIds } = data;

      console.log("Received message:", message);
      console.log("Conversation mở hiện tại:", selectedChat?._id);
      console.log("Conversation của message:", updatedConversation._id);

      if (selectedChat?._id === updatedConversation._id) {
        console.log("✅ Appending message to UI:", message);
        setMessagesChat((prev) => [...prev, message]);
      }

      handleUpdateConversation({ updatedConversation, userIds });
    };

    socket.on("receiveMessage", onReceive);

    return () => {
      socket.off("receiveMessage", onReceive);
    };
  }, [socket, selectedChat?.userId]);

  const handleUpdateConversation = (payload = {}) => {
    const { userIds = [], updatedConversation = {} } = payload;

    console.log("🔧 [handleUpdateConversation]");
    console.log("➡️ Current user ID:", id);
    console.log("➡️ Payload userIds:", userIds);
    console.log("➡️ Payload updatedConversation:", updatedConversation);

    setConversation(prev => {
      // Sửa tìm conversation theo đúng _id của updatedConversation
      const exists = prev.find(conv => conv._id === updatedConversation._id);
      let newList;

      if (exists) {
        console.log("🔁 Updating existing conversation in list");
        newList = prev.map(conv =>
          conv._id === updatedConversation._id
            ? { ...conv, ...updatedConversation }
            : conv
        );
      } else {
        console.log("➕ Adding new conversation to list");
        // Giữ nguyên logic lấy participant format
        const newFormatted = getOtherParticipants([updatedConversation], id);
        newList = [...newFormatted, ...prev];
      }

      // Sắp xếp conversation mới nhất lên đầu
      return [...newList].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const handleUpdate = (data) => {
    const { conversation, message } = data;
    const formatted = getOtherParticipants([conversation])[0];
    if (
      selectedChat &&
      selectedChat._id?.toString() === formatted._id?.toString()
    ) {
      setSelectedChat(formatted);
    } else {
      console.log("ℹ️ selectedChat is different, skipping selectedChat update");
    }

    setConversation((prevConversations) =>
      prevConversations.map((conv) =>
        conv._id === formatted._id ? formatted : conv
      )
    );
  };

  const getOtherParticipants = (conversations) => {
    const botId = process.env.REACT_APP_BASE_URL_BOT_ID?.toString();
    console.log("id của bot: ", botId);
    return (conversations || []).map(chat => {
      const participants = Array.isArray(chat.participants) ? chat.participants : [];
      const otherParticipant = participants.find(p => p._id?.toString() !== botId);

      console.log("Other participant:", otherParticipant);

      return {
        ...chat,
        conversationId: chat._id,
        userId: otherParticipant ? otherParticipant._id : null,
        username: otherParticipant ? otherParticipant.username : "Unknown",
        profilePic: otherParticipant?.profile?.picture || null
      };
    });
  };

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

  useEffect(() => {
    fetchConversations();
  }, [token, debouncedText, unreadOnly]);

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

      if (!selectedChat || !selectedChat._id) {
        console.error("❌ Không có cuộc hội thoại được chọn.");
        return;
      }

      const conversationId = selectedChat._id;

      const messageData = {
        conversationId,          // ID cuộc trò chuyện
        adminId: id,             // ID admin đang gửi (từ biến `id`)
        content: newMessage,     // nội dung tin nhắn
        images: uploadedImageUrls, // ảnh nếu có
      };

      console.log("📨 Gửi message:", messageData);

      socket.emit("adminSendMessage", messageData, (response) => {
        if (response?.error) {
          console.error("❌ Server error:", response.error);
        }
      });

      setMessages(prev => [...prev, messageData]);
      setNewMessage("");
      setSelectedImages([]);
      setImageFiles([]);

    } catch (error) {
      console.error("❌ Lỗi khi gửi tin nhắn:", error);
    }
  };

  const truncateMessage = (messa, maxLength) => {
    if (!messa) return "";
    return messa.length > maxLength
      ? messa.substring(0, maxLength) + '...'
      : messa;
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

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setTypeConversation(value);
    if (value === "all") {
      setUnreadOnly(false);
    } else if (value === "unread") {
      setUnreadOnly(true);
    }
  };

  const fetchConversations = async () => {
    try {
      const res1 = await getListConversation(id, token, unreadOnly, debouncedText);
      const res2 = await getUnclaimedConversations(token);

      const formatted1 = getOtherParticipants(res1.data || [], id);
      const formatted2 = getOtherParticipants(res2.data || [], id);

      const merged = [...formatted1];

      formatted2.forEach((conv) => {
        if (!merged.some((c) => c._id === conv._id)) {
          merged.push(conv);
        }
      });

      // 👉 Sort: Unclaimed lên đầu
      const sorted = merged.sort((a, b) => {
        const aClaimed = !!a.claimedByAdmin;
        const bClaimed = !!b.claimedByAdmin;

        if (aClaimed === bClaimed) return 0;
        return aClaimed ? 1 : -1; // Unclaimed first
      });

      setConversation(sorted);
    } catch (err) {
      console.error("Lỗi khi lấy toàn bộ cuộc trò chuyện:", err);
    }
  };

  const handleClaimConversation = (conversationId) => {
    socket.emit("claimConversation", {
      conversationId,
      adminId: id,
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleClaimSuccess = (conversationData) => {
      console.log("Claimed conversation:", conversationData);

      const processed = getOtherParticipants([conversationData])[0];

      setConversation(prev => {
        if (prev.some(conv => conv._id === processed._id)) return prev;
        return [processed, ...prev];
      });
      fetchConversations();
    };

    const handleConversationClaimed = (data) => {
      console.log("Received conversationClaimed:", data);
      const { conversationId } = data;
      setConversation((prev) => prev.filter((conv) => conv._id !== conversationId));
    };

    const handleAdminNotifyMessage = (data) => {
      console.log("Received adminNotifyMessage:", data);
      const processed = getOtherParticipants([data])[0];

      setConversation((prev) => {
        if (prev.some(conv => conv._id === processed._id)) return prev;
        return [processed, ...prev];
      });
    };

    const handleUpdateConversation = ({ userIds, updatedConversation }) => {
      console.log("🟡 [updateConversationsAdmin] Event received:", {
        currentAdminId: id,
        userIds,
        updatedConversation,
      });

      if (!userIds.includes(id)) {
        console.warn("⚠️ updateConversationsAdmin: ID không khớp, bỏ qua.");
        return;
      }
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

    const handleReceiveMessage = (newMessage) => {
      setMessagesChat((prev) => [...prev, newMessage]);
    };

    socket.on("claimSuccess", handleClaimSuccess);
    socket.on("conversationClaimed", handleConversationClaimed);
    socket.on("adminNotifyMessage", handleAdminNotifyMessage);
    socket.on("updateConversationsAdmin", handleUpdateConversation);
    socket.on("receiveMessageAdmin", handleReceiveMessage);
    return () => {
      socket.off("claimSuccess", handleClaimSuccess);
      socket.off("conversationClaimed", handleConversationClaimed);
      socket.off("adminNotifyMessage", handleAdminNotifyMessage);
      socket.off("updateConversationsAdmin", handleUpdateConversation);
      socket.off("receiveMessageAdmin", handleReceiveMessage);
    };
  }, [socket, id]);

  useEffect(() => {
    if (!socket) return;
    socket.on("conversationResolved", handleUpdate);
    return () => {
      socket.off("conversationResolved", handleUpdate);
    };
  }, [socket, selectedChat?._id]);


  const handleResolveConversation = () => {
    socket.emit("resolveConversation", {
      conversationId: selectedChat?._id,
      adminId: id
    });
  };

  useEffect(() => {
    const fetchUnclaimedConversations = async () => {
      try {
        const res = await getUnclaimedConversations(token);
        const processed = res.data.map((item) => getOtherParticipants([item])[0]);
        setConversation((prev) => {
          const newList = [...prev];

          processed.forEach((conv) => {
            if (!newList.some((c) => c._id === conv._id)) {
              newList.push(conv);
            }
          });

          return newList;
        });
      } catch (err) {
        console.error("Failed to fetch unclaimed conversations", err);
      }
    };

    fetchUnclaimedConversations();
  }, [token]);

  return (
    <div className="admin-chat-container">
      <ToastContainer position="admin-top-right" autoClose={5000} />
      <div className='admin-chat-box-right'>
        <div className='admin-chat-box-right-header'>
          <Input
            placeholder='Search for friends'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className='admin-chat-box-right-settings'>
          <div className='admin-chat-box-right-settings-select'>
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
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="unread">Chưa đọc</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        <div className='admin-chat-box-right-body' style={{ overflowY: 'auto', maxHeight: '400px' }}>
          {Array.isArray(conversation) &&
            conversation.map((msg) => {
              const isUnread = Array.isArray(msg?.readBy) ? !msg?.readBy.includes(id) : true;
              const isClaimed = !!msg?.claimedByAdmin;

              return (
                <div
                  key={msg._id}
                  className={`chat-card ${isUnread ? "unread" : ""}`}
                  onClick={() => handleCardClick(msg)}
                >
                  <Avatar
                    src={msg?.profilePic}
                    alt={msg?.username}
                    className="admin-chat-card-avatar"
                  />
                  <div className="admin-chat-card-content">
                    <div className={`admin-chat-card-name ${isUnread ? "unread-text" : ""}`}>
                      {truncateMessage(msg?.username, 30)}
                    </div>
                    <div className={`admin-chat-card-message ${isUnread ? "unread-text" : ""}`}>
                      {truncateMessage(msg.lastMessage?.content || "", 50)}
                    </div>
                  </div>
                  {!isClaimed && (
                    <Button
                      variant="outlined"
                      startIcon={<CheckIcon sx={{ fontSize: '16px' }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaimConversation(msg._id);
                      }}
                      sx={{
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#2e7d32',
                        borderColor: '#2e7d32',
                        height: '34px',
                        px: 1.5,
                        py: 0.3,
                        textTransform: 'none',
                        backgroundColor: '#fff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#e8f5e9',
                          borderColor: '#1b5e20',
                          color: '#1b5e20'
                        }
                      }}
                    >
                      Claim
                    </Button>
                  )}
                </div>
              );
            })}
        </div>
      </div>
      <div className='admin-chat-box-left'>
        <div className='admin-chat-box-left-header'>
          {selectedChat ? (
            <>
              <Avatar src={selectedChat.profilePic} alt={selectedChat.username} className='admin-chat-card-avatar-left' />
              <div className='admin-chat-card-content-left'>
                <div className='admin-chat-card-name-left'>{truncateMessage(selectedChat.username, 30)}</div>
                <div className='admin-chat-card-online'>
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
            <div className='admin-chat-card-content'>
              <div className='admin-chat-card-name'>Chọn một cuộc trò chuyện</div>
            </div>
          )}
        </div>
        {(selectedChat?.adminStatus === "processing" || selectedChat?.adminStatus === "pending") && (
          <div className='admin-chat-box-left-content-header'>
            <Button
              variant="outlined"
              startIcon={<CheckCircleIcon sx={{ fontSize: '16px' }} />}
              sx={{
                borderRadius: '6px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '12px',
                minHeight: '28px',
                px: 1.5,
                py: 0.3,
                color: '#f57c00',
                borderColor: '#f57c00',
                backgroundColor: '#fff',
                transition: 'all 0.25s ease',
                '&:hover': {
                  backgroundColor: '#fff3e0',
                  borderColor: '#ef6c00',
                  color: '#ef6c00'
                },
                '&:active': {
                  backgroundColor: '#ffe0b2',
                  boxShadow: 'none'
                }
              }}
              onClick={handleResolveConversation}
            >
              Resolve
            </Button>
          </div>
        )}
        <div className='admin-chat-box-left-content' ref={chatRef}>
          {messagesChat
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((msg) => (
              <div key={msg.id} className={`admin-message ${msg.sender === id ? "sent" : "received"}`}>
                {msg.content && <p>{msg.content}</p>}
                {msg.images && msg.images.length > 0 && (
                  <div className="admin-message-images">
                    {msg.images.map((imgUrl, index) => (
                      <img
                        key={index}
                        src={imgUrl}
                        alt={`Ảnh ${index + 1}`}
                        className="admin-message-image"
                        onClick={() => handleImageClick(imgUrl)} // Mở ảnh lớn khi click
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

          {/* Modal hiển thị ảnh lớn */}
          {selectedImage && (
            <div className="admin-modal open" onClick={closeModal}>
              <img src={selectedImage} alt="Ảnh lớn" />
            </div>
          )}
        </div>
        <div className="admin-image-preview-container">
          {selectedImages.map((image, index) => (
            <div key={index} className="admin-image-preview">
              <img src={image} alt={`admin-preview-${index}`} />
              <button onClick={() => handleRemoveImage(index)}>X</button>
            </div>
          ))}
        </div>
        <div className='admin-chat-box-left-footer'>
          <div className="admin-chat-box-left-footer">
            <div className={`admin-chat-box-left-footer-media ${showIcons ? 'visible' : 'hidden'}`}>
              <InsertPhotoIcon sx={{ color: '#63ab45' }} onClick={handleImageIconClick} />
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </div>
          </div>
          <div className='admin-chat-box-left-input-container' style={{ flex: showIcons ? 8 : 10 }}>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className='admin-chat-box-left-input'
              onKeyPress={handleKeyPress}
            />
            <SendIcon onClick={sendMessage} sx={{ color: '#63ab45' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSupport;