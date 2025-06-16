import React from 'react';
import { Plus, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { ChatHistory } from '../hooks/useChat';

interface SidebarProps {
  chatHistory: ChatHistory[];
  currentChatId: string | null;
  onNewChat: () => void;
  onLoadChat: (chatId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ 
  chatHistory, 
  currentChatId, 
  onNewChat, 
  onLoadChat, 
  isOpen, 
  onToggle 
}: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-80 bg-gray-900 text-white z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h1 className="text-xl font-semibold">AI Chat</h1>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 hover:bg-gray-700 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Chats</h3>
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onLoadChat(chat.id)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-700 group
                      ${currentChatId === chat.id ? 'bg-gray-700 border-l-2 border-blue-500' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare size={16} className="mt-1 text-gray-400 group-hover:text-white" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-white">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {chat.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {chatHistory.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No previous chats
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}