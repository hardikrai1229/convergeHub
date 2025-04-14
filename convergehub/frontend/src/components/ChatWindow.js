import React, { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../firebase";
import { 
  collection, 
  query, 
  getDoc,
  doc, 
  setDoc, 
  serverTimestamp, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const ChatWindow = ({ friendId, friendUsername, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getOrCreateChat = async () => {
      if (!currentUser || !friendId) return;
  
      const sortedIds = [currentUser.uid, friendId].sort();
      const generatedChatId = `${sortedIds[0]}_${sortedIds[1]}`;
      setChatId(generatedChatId);
  
      const chatRef = doc(db, "chats", generatedChatId);
      
      try {
        const chatSnap = await getDoc(chatRef);
        
        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            participants: {
              [currentUser.uid]: true,
              [friendId]: true
            },
            createdAt: serverTimestamp(),
            lastMessage: "",
            lastMessageTime: serverTimestamp()
          });
        }
  
        const messagesRef = collection(db, "chats", generatedChatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));
  
        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(messagesData);
        });
  
        return () => unsubscribeMessages();
      } catch (error) {
        console.error("Error in chat initialization:", error);
      }
    };
  
    getOrCreateChat();
  }, [currentUser, friendId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    try {
      let fileUrl = null;
      let fileType = null;

      if (file) {
        setIsUploading(true);
        const storageRef = ref(storage, `chat_files/${chatId}/${file.name}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
        fileType = file.type.split('/')[0];
        setIsUploading(false);
        setFile(null);
      }

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        fileName: file ? file.name : null
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: newMessage || (file ? "Sent a file" : ""),
        lastMessageTime: serverTimestamp()
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col w-full h-full" style={{ paddingTop: '60px' }}>
      <div className="flex items-center justify-between p-4 bg-gray-800 text-white relative z-10">
        <h3 className="text-lg">{friendUsername}</h3>
        <button onClick={onClose} className="text-white text-2xl hover:text-red-400">
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">Start your conversation with {friendUsername}</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg text-sm ${message.senderId === currentUser?.uid ? 'bg-blue-500 text-white' : 'bg-white text-black shadow-md'}`}>
                {message.fileUrl && (
                  <div className="mb-2">
                    {message.fileType === 'image' ? (
                      <img src={message.fileUrl} alt="Shared content" className="w-full h-40 object-cover rounded-lg" />
                    ) : message.fileType === 'video' ? (
                      <video controls className="w-full h-40 object-cover rounded-lg">
                        <source src={message.fileUrl} type={message.fileType} />
                      </video>
                    ) : (
                      <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">📄 {message.fileName || 'Download file'}</a>
                    )}
                  </div>
                )}
                {message.text && <div>{message.text}</div>}
                <div className="text-xs text-right text-gray-400">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center p-4 bg-gray-800">
        <label htmlFor="file-upload" className="mr-4 cursor-pointer text-white text-xl">📎</label>
        <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} />
        {file && (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-gray-300">{file.name}</span>
            <button 
              type="button" 
              onClick={() => setFile(null)} 
              className="text-red-500 text-lg"
            >
              ×
            </button>
          </div>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 bg-gray-700 text-white rounded-full outline-none mx-2"
        />
        <button 
          type="submit" 
          onClick={handleSendMessage}
          disabled={isUploading || (!newMessage.trim() && !file)}
          className="px-6 py-3 bg-blue-600 text-white rounded-full disabled:bg-gray-500"
        >
          {isUploading ? 'Uploading...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
