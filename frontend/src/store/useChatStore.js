import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  //setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedUser: (selectedUser) => {
    const { chats } = get();
    // Reset cờ hasUnread của user vừa được chọn
    const updatedChats = chats.map((c) =>
      c._id === selectedUser._id ? { ...c, hasUnread: false } : c
    );
    set({ selectedUser, chats: updatedChats });
  },

  getAllContacts: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/message/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/message/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  // subscribeToNewMessages: () => {
  //   const { selectedUser, isSoundEnabled } = get();
  //   if (!selectedUser) return;
  //   const { socket } = useAuthStore.getState();
  //   socket.on("new-message", (newMessage) => {
  //     const isMessageFromSelectedUser =
  //       newMessage.senderId === selectedUser._id;
  //     if (!isMessageFromSelectedUser) return;
  //     const currentMessages = get().messages;
  //     set({ messages: [...currentMessages, newMessage] });
  //     if (isSoundEnabled) {
  //       const notificationSound = new Audio("/sounds/notification.mp3");

  //       notificationSound.currentTime = 0; // reset to start
  //       notificationSound
  //         .play()
  //         .catch((e) => console.log("Audio play failed:", e));
  //     }
  //   });
  // },

  subscribeToNewMessages: () => {
    const { socket } = useAuthStore.getState();
    const { isSoundEnabled, chats } = get();

    socket.off("new-message"); // tránh đăng ký trùng
    socket.on("new-message", (newMessage) => {
      const currentMessages = get().messages;
      const { selectedUser: currentSelectedUser } = get();

      // Nếu đang mở đúng đoạn chat
      if (
        currentSelectedUser &&
        newMessage.senderId === currentSelectedUser._id
      ) {
        set({ messages: [...currentMessages, newMessage] });
      } else {
        // Nếu đang ở ngoài đoạn chat → cập nhật danh sách chats
        const updatedChats = chats.map((c) =>
          c._id === newMessage.senderId ? { ...c, hasUnread: true } : c
        );
        set({ chats: updatedChats });

        // ✅ Gửi thông báo trình duyệt
        if (Notification.permission === "granted") {
          new Notification("Tin nhắn mới", {
            body: `${newMessage.senderName}: ${
              newMessage.text || "Đã gửi một hình ảnh"
            }`,
            icon: "/icon.png",
          });
        }

        // ✅ Phát âm thanh
        if (isSoundEnabled) {
          const sound = new Audio("/sounds/notification.mp3");
          sound.play().catch(() => {});
        }
      }
    });
  },
  unSubscribeToNewMessages: () => {
    const { socket } = useAuthStore.getState();
    socket.off("new-message");
  },
}));
