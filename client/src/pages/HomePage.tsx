import React, { useState, useRef, useEffect } from 'react';
import { Menu, Volume2, VolumeX, Wrench } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { usePromptAPI } from '../hooks/usePromptAPI';
import { speak, stopSpeaking, isSpeaking } from '../utils/speak';
import { getBrowserLang } from '../utils/languageMap';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ToolRenderer from '../components/ToolRenderer';
import checklistTemplate from '../templates/checklist.json';

export default function HomePage() {
  const { user } = useAuth();
  const { messages, chatHistory, currentChatId, isLoading, sendMessage, startNewChat, loadChat } = useChat();
  const { generateTool, isLoading: toolLoading, error: toolError, toolConfig, clearError, clearToolConfig } = usePromptAPI();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getBrowserLang());
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showToolDemo, setShowToolDemo] = useState(false);
  const [demoToolConfig, setDemoToolConfig] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test speech synthesis on component mount
  useEffect(() => {
    const testSpeech = async () => {
      try {
        console.log('Detected browser language:', currentLanguage);
        // Uncomment the line below to test speech on page load
        // await speak('Welcome to AI Chat! Speech synthesis is working.', currentLanguage);
      } catch (error) {
        console.error('Speech synthesis test failed:', error);
      }
    };
    
    testSpeech();
  }, [currentLanguage]);

  const handleSpeakMessage = async (messageId, text) => {
    try {
      if (speakingMessageId === messageId && isSpeaking()) {
        // Stop speaking if already speaking this message
        stopSpeaking();
        setSpeakingMessageId(null);
      } else {
        // Stop any current speech and start new one
        stopSpeaking();
        setSpeakingMessageId(messageId);
        
        await speak(text, currentLanguage, {
          rate: 0.9,
          pitch: 1,
          volume: 0.8
        });
        
        setSpeakingMessageId(null);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setSpeakingMessageId(null);
    }
  };

  const testSpeechFunction = async () => {
    const testMessages = [
      'Hello! This is a test of the speech synthesis functionality.',
      'The current language is set to ' + currentLanguage,
      'You can click the speaker icon next to any message to hear it spoken aloud.'
    ];
    
    for (const message of testMessages) {
      try {
        await speak(message, currentLanguage);
        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Speech test error:', error);
        break;
      }
    }
  };

  const handleToolGeneration = async (prompt) => {
    try {
      const config = await generateTool(prompt);
      if (config) {
        console.log('Generated tool config:', config);
      }
    } catch (error) {
      console.error('Tool generation error:', error);
    }
  };

  const showDemoTool = () => {
    setDemoToolConfig(checklistTemplate);
    setShowToolDemo(true);
  };

  const handleDemoToolChange = (updatedConfig) => {
    setDemoToolConfig(updatedConfig);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onNewChat={startNewChat}
        onLoadChat={loadChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {messages.length > 0 ? 'Chat' : 'AI Assistant'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Language: {currentLanguage}
            </div>
            <button
              onClick={testSpeechFunction}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              Test Speech
            </button>
            <button
              onClick={showDemoTool}
              className="flex items-center gap-2 px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Wrench size={16} />
              Demo Tool
            </button>
            <div className="text-sm text-gray-600">
              Welcome, {user?.name}
            </div>
          </div>
        </header>

        {/* Tool Demo Modal */}
        {showToolDemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Tool Demo</h2>
                <button
                  onClick={() => {
                    setShowToolDemo(false);
                    setDemoToolConfig(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <ToolRenderer 
                  toolConfig={demoToolConfig} 
                  onConfigChange={handleDemoToolChange}
                  showSaveButton={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tool Generation Results */}
        {(toolConfig || toolLoading || toolError) && (
          <div className="border-b border-gray-200 bg-blue-50 p-4">
            <div className="max-w-4xl mx-auto">
              {toolLoading && (
                <div className="flex items-center gap-3 text-blue-700">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
                  <span>Generating tool from your prompt...</span>
                </div>
              )}
              
              {toolError && (
                <div className="flex items-center justify-between bg-red-100 border border-red-300 rounded-lg p-3">
                  <span className="text-red-700">{toolError}</span>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {toolConfig && (
                <div className="bg-white rounded-lg border border-blue-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Generated Tool</h3>
                    <button
                      onClick={clearToolConfig}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <ToolRenderer 
                    toolConfig={toolConfig} 
                    showSaveButton={true}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  How can I help you today?
                </h2>
                <p className="text-gray-600 mb-6">
                  Start a conversation by typing a message, using voice input, or try generating a tool.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-800">💡 Ask questions</p>
                    <p className="text-gray-600 mt-1">Get answers on any topic</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-800">🎤 Voice input</p>
                    <p className="text-gray-600 mt-1">Click the mic to speak</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-800">🔊 Text-to-speech</p>
                    <p className="text-gray-600 mt-1">Click speaker icons to hear messages</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-800">🛠️ Generate tools</p>
                    <p className="text-gray-600 mt-1">Ask for checklists, forms, etc.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-800">🌐 Multi-language</p>
                    <p className="text-gray-600 mt-1">Auto-detected: {currentLanguage}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-800">💾 Save tools</p>
                    <p className="text-gray-600 mt-1">Keep your generated tools</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 mb-2">
                    <strong>Try asking:</strong>
                  </p>
                  <div className="space-y-1 text-sm text-purple-700">
                    <p>"Create a daily productivity checklist"</p>
                    <p>"Make a travel preparation checklist"</p>
                    <p>"Generate a fitness routine checklist"</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 p-6 ${message.role === 'user' ? 'bg-gray-50' : 'bg-white'} group`}>
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-white'}
                  `}>
                    {message.role === 'user' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => handleSpeakMessage(message.id, message.content)}
                          className={`
                            p-1 rounded transition-colors opacity-0 group-hover:opacity-100
                            ${speakingMessageId === message.id 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                            }
                          `}
                          title={speakingMessageId === message.id ? 'Stop speaking' : 'Speak message'}
                        >
                          {speakingMessageId === message.id ? (
                            <VolumeX size={14} />
                          ) : (
                            <Volume2 size={14} />
                          )}
                        </button>
                      )}
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 p-6 bg-white">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm text-gray-900">AI Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput 
          onSendMessage={(message) => {
            sendMessage(message);
            // Check if the message is asking for a tool
            if (message.toLowerCase().includes('checklist') || 
                message.toLowerCase().includes('create') || 
                message.toLowerCase().includes('generate') ||
                message.toLowerCase().includes('make a')) {
              handleToolGeneration(message);
            }
          }} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}