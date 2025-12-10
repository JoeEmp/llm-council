import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ConfigPanel from './components/ConfigPanel';
import ModelSelector from './components/ModelSelector';
import LanguageSelector from './components/LanguageSelector';
import { api } from './api';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [skipModelSelector, setSkipModelSelector] = useState(false);

  // For stopping message generation
  const abortControllerRef = useRef(null);
  const lastMessageRef = useRef(''); // Store the last sent message content

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load conversation details when selected
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    }
  }, [currentConversationId]);

  const handleConfigUpdated = () => {
    // Configuration updated, could add notification here
    console.log('Configuration updated successfully');
  };

  const handleModelsSelected = useCallback((selectedModels) => {
    // Models selected, create new conversation
    console.log('Models selected:', selectedModels);
    setShowModelSelector(false);
    setSkipModelSelector(true);
    handleNewConversation();
  }, []);

  const loadConversations = async () => {
    try {
      const convs = await api.listConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (id) => {
    try {
      const conv = await api.getConversation(id);
      setCurrentConversation(conv);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await api.createConversation();
      await loadConversations();
      setCurrentConversationId(newConv.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleStartNewConversation = () => {
    // Show model selector for new conversation
    setCurrentConversationId(null);
    setCurrentConversation(null);
    setShowModelSelector(true);
    setSkipModelSelector(false);
  };

  const handleModelSelectorCancel = () => {
    // Close model selector and return to main app
    setShowModelSelector(false);
    setSkipModelSelector(true);
  };

  const handleSelectConversation = (id) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      // Delete from backend
      await api.deleteConversation(conversationId);

      // Optimistically update conversations list by filtering out the deleted one
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      // Check if we deleted the current conversation
      if (currentConversationId === conversationId) {
        // Clear current conversation selection and show welcome screen
        setCurrentConversationId(null);
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert(t('errors.failed_delete'));
      // If delete failed, reload from backend to ensure consistency
      await loadConversations();
    }
  };

  const handleSendMessage = async (content) => {
    if (!currentConversationId) return;

    // Store the message content for potential regeneration
    lastMessageRef.current = content;

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      // Optimistically add user message to UI
      const userMessage = { role: 'user', content };
      setCurrentConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      // Create a partial assistant message that will be updated progressively
      const assistantMessage = {
        role: 'assistant',
        stage1: null,
        stage2: null,
        stage3: null,
        metadata: null,
        loading: {
          stage1: false,
          stage2: false,
          stage3: false,
        },
      };

      // Add the partial assistant message
      setCurrentConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));

      // Send message with streaming
      await api.sendMessageStream(
        currentConversationId,
        content,
        (eventType, event) => {
          switch (eventType) {
            case 'stage1_start':
              setCurrentConversation((prev) => {
                const messages = [...prev.messages];
                const lastMsg = messages[messages.length - 1];
                lastMsg.loading.stage1 = true;
                return { ...prev, messages };
              });
              break;

            case 'stage1_complete':
              setCurrentConversation((prev) => {
                const messages = [...prev.messages];
                const lastMsg = messages[messages.length - 1];
                lastMsg.stage1 = event.data;
                lastMsg.loading.stage1 = false;
                return { ...prev, messages };
              });
              break;

            case 'stage2_start':
              setCurrentConversation((prev) => {
                const messages = [...prev.messages];
                const lastMsg = messages[messages.length - 1];
                lastMsg.loading.stage2 = true;
                return { ...prev, messages };
              });
              break;

            case 'stage2_complete':
              setCurrentConversation((prev) => {
                const messages = [...prev.messages];
                const lastMsg = messages[messages.length - 1];
                lastMsg.stage2 = event.data;
                lastMsg.metadata = event.metadata;
                lastMsg.loading.stage2 = false;
                return { ...prev, messages };
              });
              break;

            case 'stage3_start':
              setCurrentConversation((prev) => {
                const messages = [...prev.messages];
                const lastMsg = messages[messages.length - 1];
                lastMsg.loading.stage3 = true;
                return { ...prev, messages };
              });
              break;

            case 'stage3_complete':
              setCurrentConversation((prev) => {
                const messages = [...prev.messages];
                const lastMsg = messages[messages.length - 1];
                lastMsg.stage3 = event.data;
                lastMsg.loading.stage3 = false;
                return { ...prev, messages };
              });
              break;

            case 'title_complete':
              // Reload conversations to get updated title
              loadConversations();
              break;

            case 'complete':
              // Stream complete, reload conversations list and current conversation
              loadConversations();
              if (currentConversationId) {
                loadConversation(currentConversationId);
              }
              setIsLoading(false);
              abortControllerRef.current = null;
              break;

            case 'error':
              console.error('Stream error:', event.message);
              setIsLoading(false);
              abortControllerRef.current = null;
              break;

            default:
              console.log('Unknown event type:', eventType);
          }
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      console.error('Failed to send message:', error);

      // Check if this was a user cancellation (AbortError)
      if (error.name === 'AbortError') {
        console.log('Message generation was cancelled by user');
        // Remove the partial assistant message
        setCurrentConversation((prev) => ({
          ...prev,
          messages: prev.messages.slice(0, -1),
        }));
      } else {
        // Remove optimistic messages on error
        setCurrentConversation((prev) => ({
          ...prev,
          messages: prev.messages.slice(0, -2),
        }));
      }
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);

      // Remove the partial assistant message but keep the user message for regeneration
      setCurrentConversation((prev) => {
        if (!prev || prev.messages.length === 0) return prev;
        const lastMsg = prev.messages[prev.messages.length - 1];
        if (lastMsg.role === 'assistant' && lastMsg.loading) {
          return { ...prev, messages: prev.messages.slice(0, -1) };
        }
        return prev;
      });
    }
  };

  const handleRegenerate = () => {
    // Resend the last message
    if (lastMessageRef.current && currentConversationId) {
      handleSendMessage(lastMessageRef.current);
    }
  };

  return (
    <div className="app">
      {/* Show Model Selector when starting new conversation or no conversation selected */}
      {showModelSelector && !skipModelSelector && (
        <ModelSelector
          onModelsSelected={handleModelsSelected}
          onCancel={handleModelSelectorCancel}
        />
      )}

      {/* Show main app when model selector is skipped or conversation exists */}
      {(!showModelSelector || skipModelSelector) && (
        <>
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleStartNewConversation}
            onDeleteConversation={handleDeleteConversation}
          />
          <ChatInterface
            conversation={currentConversation}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStopGeneration={handleStopGeneration}
            onRegenerate={handleRegenerate}
            lastMessage={lastMessageRef.current}
          />

          {/* Language Selector and Config Button */}
          <div className="header-actions">
            <LanguageSelector />
            <button
              className="config-button"
              onClick={() => setConfigPanelOpen(true)}
              title="Configure Models"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m20.5-4.5L16 12l4.5 4.5M3.5 7.5L8 12l-4.5 4.5"></path>
              </svg>
              Config
            </button>
          </div>

          {/* Config Panel */}
          <ConfigPanel
            isOpen={configPanelOpen}
            onClose={() => setConfigPanelOpen(false)}
            onConfigUpdated={handleConfigUpdated}
          />
        </>
      )}
    </div>
  );
}

export default App;
