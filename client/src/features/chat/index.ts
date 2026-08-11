/**
 * Chat Feature Module
 * 
 * Provides lazy-loadable page factories for the chat feature.
 */

export const chatPages = {
  Chat: () => import("@/pages/Chat"),
  ChatList: () => import("@/pages/ChatList"),
};
