import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roomDetails, setRoomDetails] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [roomTypingStatus, setRoomTypingStatus] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [dmUsers, setDmUsers] = useState([]);
  const [loadingDmUsers, setLoadingDmUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    fetchRooms();
    // Auto-refresh rooms every second for real-time updates
    const roomsInterval = setInterval(fetchRooms, 1000);
    return () => clearInterval(roomsInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rooms.length > 0) {
      // Initial fetch
      fetchAllRoomsTypingStatus();

      // Poll typing status for all rooms every 1 second
      const typingStatusInterval = setInterval(fetchAllRoomsTypingStatus, 1000);
      return () => clearInterval(typingStatusInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      markAsRead(selectedRoom.id);

      // Auto-refresh messages every 1 second for real-time feel
      const messagesInterval = setInterval(() => {
        fetchMessages(selectedRoom.id);
        // Mark messages as read whenever we fetch new messages while room is open
        markAsRead(selectedRoom.id);
      }, 1000);

      // Poll for typing indicators every 1 second
      const typingInterval = setInterval(() => {
        fetchTypingUsers(selectedRoom.id);
      }, 1000);

      return () => {
        clearInterval(messagesInterval);
        clearInterval(typingInterval);
        // Clear typing status when leaving room
        chatAPI.typing.set(selectedRoom.id, false).catch(() => {});
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        } else if (showAddParticipants) {
          setShowAddParticipants(false);
        } else if (showParticipants) {
          setShowParticipants(false);
        } else if (showCreateRoom) {
          setShowCreateRoom(false);
        } else if (showDirectMessage) {
          setShowDirectMessage(false);
        } else if (selectedRoom) {
          setSelectedRoom(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showEmojiPicker, showAddParticipants, showParticipants, showCreateRoom, showDirectMessage, selectedRoom]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  const fetchRooms = async () => {
    try {
      const response = await chatAPI.rooms.list();
      // Handle paginated response
      const roomsData = response.data.results || response.data;
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (err) {
      setError('Failed to load chat rooms.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await chatAPI.messages.list(roomId);
      const messagesData = response.data.results || response.data;
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (err) {
      setMessages([]);
    }
  };

  const markAsRead = async (roomId) => {
    try {
      await chatAPI.markRead(roomId);
      await fetchRooms();
    } catch (err) {
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    setSending(true);
    // Clear typing indicator when sending
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    chatAPI.typing.set(selectedRoom.id, false).catch(() => {});

    try {
      await chatAPI.messages.create(selectedRoom.id, { content: newMessage });
      setNewMessage('');
      await fetchMessages(selectedRoom.id);
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await chatAPI.rooms.create({
        name: newRoomName,
        room_type: 'GROUP'
      });
      setNewRoomName('');
      setShowCreateRoom(false);
      await fetchRooms();
      setSelectedRoom(response.data);
    } catch (err) {
      setError('Failed to create chat room.');
    }
  };

  const fetchDMUsers = async () => {
    try {
      setLoadingDmUsers(true);
      const response = await chatAPI.participants.available(selectedRoom?.id || rooms[0]?.id || 1);
      const users = response.data.users || response.data.available_users || [];
      setDmUsers(users);
    } catch (err) {
      setDmUsers([]);
    } finally {
      setLoadingDmUsers(false);
    }
  };

  const handleCreateDirectChat = async (userId) => {
    try {
      const response = await chatAPI.createDirectChat(userId);
      setShowDirectMessage(false);
      await fetchRooms();
      setSelectedRoom(response.data.chat_room);
    } catch (err) {
      setError('Failed to create direct chat.');
    }
  };

  const handleShowDirectMessage = async () => {
    setShowDirectMessage(true);
    await fetchDMUsers();
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoomName = (room) => {
    // Use display_name if available (backend provides this for DIRECT chats)
    if (room.display_name) return room.display_name;
    if (room.name) return room.name;
    if (room.room_type === 'EVENT' && room.event) return room.event.title;
    if (room.room_type === 'DIRECT' && room.participants) {
      const other = room.participants.find(p => p.id !== user?.id);
      return other ? `${other.first_name} ${other.last_name}` : 'Direct Chat';
    }
    return 'Chat';
  };

  const fetchRoomDetails = async (roomId) => {
    try {
      const response = await chatAPI.rooms.get(roomId);
      setRoomDetails(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to load room details.');
      return null;
    }
  };

  const fetchAvailableUsers = async () => {
    if (!selectedRoom) return;
    try {
      const response = await chatAPI.participants.available(selectedRoom.id);
      setAvailableUsers(response.data.users || []);
    } catch (err) {
      setError('Failed to load available users.');
    }
  };

  const handleShowParticipants = async () => {
    if (!selectedRoom) return;
    await fetchRoomDetails(selectedRoom.id);
    setShowParticipants(true);
  };

  const handleShowAddParticipants = async () => {
    setShowParticipants(false);
    await fetchAvailableUsers();
    setShowAddParticipants(true);
    setSelectedUsers([]);
  };

  const handleAddParticipants = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await chatAPI.participants.add(selectedRoom.id, selectedUsers);
      setShowAddParticipants(false);
      setSelectedUsers([]);
      await fetchRooms();
      await fetchRoomDetails(selectedRoom.id);
      setShowParticipants(true);
    } catch (err) {
      setError('Failed to add participants.');
    }
  };

  const handleLeaveRoom = async () => {
    if (!selectedRoom) return;

    if (!window.confirm(`Are you sure you want to leave ${getRoomName(selectedRoom)}?`)) {
      return;
    }

    try {
      await chatAPI.participants.remove(selectedRoom.id);
      setShowParticipants(false);
      setSelectedRoom(null);
      await fetchRooms();
    } catch (err) {
      setError('Failed to leave room.');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const fetchTypingUsers = async (roomId) => {
    try {
      const response = await chatAPI.typing.get(roomId);
      setTypingUsers(response.data.typing_users || []);
    } catch (err) {
    }
  };

  const fetchAllRoomsTypingStatus = async () => {
    try {
      const typingStatus = {};
      await Promise.all(
        rooms.map(async (room) => {
          try {
            const response = await chatAPI.typing.get(room.id);
            const users = response.data.typing_users || [];
            if (users.length > 0) {
              typingStatus[room.id] = users;
            }
          } catch (err) {
          }
        })
      );
      setRoomTypingStatus(typingStatus);
    } catch (err) {
    }
  };

  const handleTyping = () => {
    if (!selectedRoom) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Send typing indicator
    chatAPI.typing.set(selectedRoom.id, true).catch(() => {});

    // Set timeout to clear typing status after 3 seconds of no typing
    const timeout = setTimeout(() => {
      chatAPI.typing.set(selectedRoom.id, false).catch(() => {});
    }, 3000);

    setTypingTimeout(timeout);
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) {
      return `${typingUsers[0].first_name} is typing...`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0].first_name} and ${typingUsers[1].first_name} are typing...`;
    }
    return `${typingUsers[0].first_name} and ${typingUsers.length - 1} others are typing...`;
  };

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '🙏',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟',
    '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🎄', '🎃', '🎆', '🎇',
    '✨', '🎯', '🎮', '🎲', '🎭', '🎨', '🎬', '🎤', '🎧', '🎵',
    '🔥', '💯', '⭐', '🌟', '✅', '❌', '⚡', '💪', '🙌', '👏'
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  if (rooms.length === 0 && !loading) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <span className="empty-icon">💬</span>
          <h3>No chat rooms yet</h3>
          <p>Create a group chat or join an event to start chatting!</p>
          <button onClick={() => setShowCreateRoom(true)} className="btn btn-primary">
            Create Chat Room
          </button>
        </div>

        {showCreateRoom && (
          <div className="modal-overlay" onClick={() => setShowCreateRoom(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create Group Chat</h2>
              <form onSubmit={handleCreateRoom}>
                <div className="form-group">
                  <label htmlFor="roomName">Group Name</label>
                  <input
                    type="text"
                    id="roomName"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g., Movie Lovers"
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCreateRoom(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDirectMessage && (
          <div className="modal-overlay" onClick={() => setShowDirectMessage(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>New Direct Message</h2>
              <p className="modal-subtitle">Select a user to start chatting</p>
              <div className="users-list">
                {loadingDmUsers ? (
                  <p className="no-users">Loading users...</p>
                ) : dmUsers.length === 0 ? (
                  <p className="no-users">No users available</p>
                ) : (
                  dmUsers.map(dmUser => (
                    <div
                      key={dmUser.id}
                      className="user-item"
                      onClick={() => handleCreateDirectChat(dmUser.id)}
                    >
                      <div className="user-avatar">
                        {dmUser.first_name?.charAt(0) || ''}{dmUser.last_name?.charAt(0) || ''}
                      </div>
                      <div className="user-info">
                        <div className="user-name">
                          {dmUser.first_name} {dmUser.last_name}
                        </div>
                        <div className="user-email">{dmUser.email}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowDirectMessage(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${!selectedRoom ? 'mobile-visible' : ''}`}>
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="sidebar-header-actions">
            <button onClick={handleShowDirectMessage} className="btn-create-room" title="New direct message">
              💬
            </button>
            <button onClick={() => setShowCreateRoom(true)} className="btn-create-room" title="Create group chat">
              +
            </button>
          </div>
        </div>

        <div className="rooms-list">
          {rooms.map(room => {
            const typingInRoom = roomTypingStatus[room.id] || [];
            const typingText = typingInRoom.length > 0
              ? `${typingInRoom[0].first_name} is typing...`
              : null;

            return (
              <div
                key={room.id}
                className={`room-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => setSelectedRoom(room)}
              >
                <div className="room-avatar">
                  {room.room_type === 'DIRECT' ? '👤' : room.room_type === 'EVENT' ? '🎉' : '👥'}
                </div>
                <div className="room-info">
                  <div className="room-header">
                    <span className="room-name">{getRoomName(room)}</span>
                    {room.unread_count > 0 && (
                      <span className="unread-badge">{room.unread_count}</span>
                    )}
                  </div>
                  {typingText ? (
                    <p className="last-message typing-in-room">
                      <span className="typing-dots-small">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                      {typingText}
                    </p>
                  ) : room.last_message ? (
                    <p className="last-message">{room.last_message.content}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`chat-main ${selectedRoom ? 'mobile-visible' : ''}`}>
        {selectedRoom ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <h2>{getRoomName(selectedRoom)}</h2>
                <span className="chat-type">
                  {selectedRoom.room_type === 'DIRECT' ? 'Direct Message' :
                   selectedRoom.room_type === 'EVENT' ? 'Event Chat' : 'Group Chat'}
                </span>
              </div>
              <div className="chat-header-actions">
                <button
                  className="btn-participants"
                  onClick={handleShowParticipants}
                  title="View participants"
                >
                  👥 {selectedRoom.participant_count || selectedRoom.participants?.length || 0}
                </button>
                <button
                  className="btn-close-chat"
                  onClick={() => setSelectedRoom(null)}
                  title="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`message ${message.sender.id === user?.id ? 'own-message' : ''}`}
                    >
                      <div className="message-avatar">
                        {message.sender.first_name[0]}{message.sender.last_name[0]}
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-sender">
                            {message.sender.id === user?.id
                              ? 'You'
                              : `${message.sender.first_name} ${message.sender.last_name}`}
                          </span>
                          <span className="message-time">
                            {formatMessageTime(message.created_at)}
                          </span>
                        </div>
                        <p className="message-text">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="message-input-container">
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <span className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  <span className="typing-text">{getTypingText()}</span>
                </div>
              )}
              {error && <div className="error-message-small">{error}</div>}
              <form onSubmit={handleSendMessage} className="message-form">
                <div className="message-input-wrapper">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onInput={handleTyping}
                    placeholder="Type a message..."
                    rows="1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-emoji"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Add emoji"
                  >
                    😊
                  </button>
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="emoji-picker">
                      <div className="emoji-picker-header">
                        <span>Emojis</span>
                        <button
                          type="button"
                          className="emoji-picker-close"
                          onClick={() => setShowEmojiPicker(false)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="emoji-grid">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            className="emoji-button"
                            onClick={() => insertEmoji(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-send"
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? '...' : '➤'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-selection">
            <span className="empty-icon">💬</span>
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {showCreateRoom && (
        <div className="modal-overlay" onClick={() => setShowCreateRoom(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Group Chat</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label htmlFor="roomName">Group Name</label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Movie Lovers, Study Group"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateRoom(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!newRoomName.trim()}>
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDirectMessage && (
        <div className="modal-overlay" onClick={() => setShowDirectMessage(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>New Direct Message</h2>
            <p className="modal-subtitle">Select a user to start chatting</p>
            <div className="users-list">
              {loadingDmUsers ? (
                <p className="no-users">Loading users...</p>
              ) : dmUsers.length === 0 ? (
                <p className="no-users">No users available</p>
              ) : (
                dmUsers.map(dmUser => (
                  <div
                    key={dmUser.id}
                    className="user-item"
                    onClick={() => handleCreateDirectChat(dmUser.id)}
                  >
                    <div className="user-avatar">
                      {dmUser.first_name?.charAt(0) || ''}{dmUser.last_name?.charAt(0) || ''}
                    </div>
                    <div className="user-info">
                      <div className="user-name">
                        {dmUser.first_name} {dmUser.last_name}
                      </div>
                      <div className="user-email">{dmUser.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowDirectMessage(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showParticipants && roomDetails && (
        <div className="modal-overlay" onClick={() => setShowParticipants(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Participants</h2>
            {roomDetails.participants && roomDetails.participants.length > 0 ? (
              <div className="participants-list">
                {roomDetails.participants.map(participant => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-avatar">
                      {participant.first_name[0]}{participant.last_name[0]}
                    </div>
                    <div className="participant-info">
                      <span className="participant-name">
                        {participant.first_name} {participant.last_name}
                        {participant.id === user?.id && ' (You)'}
                      </span>
                      <span className="participant-email">{participant.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-users-message">No participants found.</p>
            )}
            <div className="modal-actions">
              {roomDetails.room_type !== 'DIRECT' && (
                <>
                  <button
                    type="button"
                    onClick={handleShowAddParticipants}
                    className="btn btn-primary"
                  >
                    Add Participants
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveRoom}
                    className="btn btn-danger"
                  >
                    Leave Room
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setShowParticipants(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddParticipants && (
        <div className="modal-overlay" onClick={() => setShowAddParticipants(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Participants</h2>
            {availableUsers.length === 0 ? (
              <p className="no-users-message">No users available to add.</p>
            ) : (
              <div className="users-list">
                {availableUsers.map(availableUser => (
                  <div
                    key={availableUser.id}
                    className={`user-item ${selectedUsers.includes(availableUser.id) ? 'selected' : ''}`}
                    onClick={() => toggleUserSelection(availableUser.id)}
                  >
                    <div className="user-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(availableUser.id)}
                        onChange={() => {}}
                      />
                    </div>
                    <div className="user-avatar">
                      {availableUser.first_name[0]}{availableUser.last_name[0]}
                    </div>
                    <div className="user-info">
                      <span className="user-name">
                        {availableUser.first_name} {availableUser.last_name}
                      </span>
                      <span className="user-email">{availableUser.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowAddParticipants(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddParticipants}
                className="btn btn-primary"
                disabled={selectedUsers.length === 0}
              >
                Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
