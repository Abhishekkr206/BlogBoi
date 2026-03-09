import { api } from "../../app/apiSlice";
import { socket } from "./socketSlice";

export const messageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. LEFT SIDE: The Sidebar Chat List
    getChatList: builder.query({
      query: () => `chat/list`,
      providesTags: (result) =>
        result?.message
          ? [
              ...result.message.map(({ _id }) => ({ type: "ChatList", id: _id })),
              { type: "ChatList", id: "LIST" },
            ]
          : [{ type: "ChatList", id: "LIST" }],

      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const handleNewMessageUpdateList = (newMessage) => {
          let isBrandNewChat = false;

          updateCachedData((draft) => {
            if (!draft || !draft.message) return;

            const userIndex = draft.message.findIndex(
              (user) =>
                user._id === newMessage.senderId ||
                user._id === newMessage.receiverId
            );

            if (userIndex !== -1) {
              const existingUser = draft.message[userIndex];
              draft.message.splice(userIndex, 1);
              draft.message.unshift(existingUser);
            } else {
              isBrandNewChat = true;
            }
          });

          if (isBrandNewChat) {
            dispatch(messageApi.util.invalidateTags([{ type: "ChatList", id: "LIST" }]));
          }
        };

        try {
          await cacheDataLoaded;
          socket.on("receive_message", handleNewMessageUpdateList);
        } catch (err) {}

        await cacheEntryRemoved;
        socket.off("receive_message", handleNewMessageUpdateList);
      },
    }),

    // 2. RIGHT SIDE: The Actual Messages
    getMessages: builder.query({
      query: (receiverId) => `chat/message/${receiverId}`,
      providesTags: (result, error, receiverId) => [
        { type: "Message", id: `CHAT-${receiverId}` },
      ],
      async onCacheEntryAdded(
        receiverId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const handleReceiveMessage = (newMessage) => {
          updateCachedData((draft) => {
            const isCurrentChat =
              newMessage.senderId === receiverId ||
              newMessage.receiverId === receiverId;

            if (isCurrentChat && draft?.message) {
              const exists = draft.message.some((m) => m._id === newMessage._id);
              if (!exists) {
                draft.message.push(newMessage);
              }
            }
          });
        };
                
        const handleMessagesRead = ({ by }) => {
            updateCachedData((draft) => {
              if (!draft?.message) return;
              
              // Loop through and directly update the specific messages
              draft.message.forEach((msg) => {
                // Ensure both IDs are strings before comparing
                if (msg.receiverId?.toString() === by.toString()) {
                  msg.isRead = true;
                }
              });
            });
          };

        try {
          await cacheDataLoaded;
          socket.on("receive_message", handleReceiveMessage);
          socket.on("messages_read", handleMessagesRead);
        } catch (err) {}

        await cacheEntryRemoved;
        socket.off("receive_message", handleReceiveMessage);
        socket.off("messages_read", handleMessagesRead);
      },
    }),

    // 3. SEND MESSAGE
    sendMessage: builder.mutation({
      query: ({ receiverId, text }) => ({
        url: `chat/send/${receiverId}`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: [{ type: "ChatList", id: "LIST" }],
    }),

    // 4. MARK AS READ
    isReadMessage: builder.mutation({
      query: (receiverId) => ({
        url: `chat/message/${receiverId}/read`,
        method: "POST",
      }),
    }),

  }),
});

export const { 
  useGetChatListQuery, 
  useGetMessagesQuery, 
  useSendMessageMutation,
  useIsReadMessageMutation,
} = messageApi;