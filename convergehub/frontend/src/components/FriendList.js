import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ChatWindow from "./ChatWindow"; // Import the ChatWindow component

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(""); // Add error state
  const [friendUsernames, setFriendUsernames] = useState({}); // Object to store friendId -> username mapping
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser) return;

      const q = query(collection(db, "users"), where("uid", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs[0]?.data();
      setFriends(userData?.friends || []);
    };

    fetchFriends();
  }, [currentUser]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      const q = query(
        collection(db, "users"),
        where("username", ">=", searchTerm),
        where("username", "<=", searchTerm + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => doc.data());
      setSearchResults(results);
    };

    fetchSearchResults();
  }, [searchTerm]);

  const handleAddFriend = async (friendId, friendUsername) => {
    if (!currentUser) {
      console.error("No current user found.");
      return;
    }

    if (friends.includes(friendId)) {
      setError(`${friendUsername} is already your friend.`);
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    const friendRef = doc(db, "users", friendId);

    try {
      await updateDoc(userRef, {
        friends: arrayUnion(friendId),
      });

      await updateDoc(friendRef, {
        friends: arrayUnion(currentUser.uid),
      });

      setFriends((prev) => [...prev, friendId]);
      setError("");
    } catch (error) {
      console.error("Error adding friend:", error);
      setError("Failed to add friend. Please try again.");
    }
  };

  useEffect(() => {
    const fetchFriendUsernames = async () => {
      if (!friends.length) return;

      const friendUsernamesMap = {};
      for (const friendId of friends) {
        const friendData = await getDocs(query(collection(db, "users"), where("uid", "==", friendId)));
        const user = friendData.docs[0]?.data();
        friendUsernamesMap[friendId] = user?.username || friendId;
      }
      setFriendUsernames(friendUsernamesMap);
    };

    fetchFriendUsernames();
  }, [friends]);

  return (
    <div className="flex h-full w-full">
      {/* Sidebar - Friend List */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col overflow-y-auto sticky top-0 h-screen">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl text-white font-semibold">Friends</h3>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            + Add Friend
          </button>
        </div>

        {showSearch && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 mb-2 bg-gray-700 rounded-md text-white"
            />

            {searchResults.length > 0 && (
              <div className="bg-gray-700 p-4 rounded-md">
                {searchResults.map((user) => (
                  <div key={user.uid} className="flex justify-between items-center mb-2">
                    <span>{user.username}</span>
                    <button
                      onClick={() => handleAddFriend(user.uid, user.username)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex-1 overflow-y-auto">
          {friends.length > 0 ? (
            friends.map((friendId) => {
              const friendUsername = friendUsernames[friendId] || friendId;

              return (
                <div
                  key={friendId}
                  className="p-3 bg-gray-700 text-white rounded-md mb-2 cursor-pointer hover:bg-blue-600"
                  onClick={() => setSelectedFriend({ id: friendId, username: friendUsername })}
                >
                  <span>{friendUsername}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400">Add friends to see them here.</p>
          )}
        </div>
      </div>

      {/* Main Content - Chat Window */}
      <div className="flex-1 p-4 bg-gray-700 overflow-y-auto">
        {selectedFriend && selectedFriend.id ? (
          <ChatWindow
            friendId={selectedFriend.id}
            friendUsername={selectedFriend.username}
            onClose={() => setSelectedFriend(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-lg text-gray-400">
            Select a friend to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendList;
