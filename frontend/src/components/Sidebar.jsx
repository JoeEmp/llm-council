import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import './Sidebar.css';

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onConfigClick,
}) {
  const { t } = useTranslation();

  const handleDelete = (e, conversationId) => {
    e.stopPropagation();
    if (confirm(t('sidebar.delete_confirm'))) {
      onDeleteConversation(conversationId);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>{t('sidebar.title')}</h1>
        <button className="new-conversation-btn" onClick={onNewConversation}>
          + {t('sidebar.new_conversation')}
        </button>
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">{t('sidebar.no_conversations')}</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                conv.id === currentConversationId ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="conversation-info">
                <div className="conversation-title">
                  {conv.title || t('sidebar.new_conversation')}
                </div>
                <div className="conversation-meta">
                  {conv.message_count} {t('sidebar.messages')}
                </div>
              </div>
              <button
                className="delete-conversation-btn"
                onClick={(e) => handleDelete(e, conv.id)}
                title={t('sidebar.delete_conversation')}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <LanguageSelector />
        <button
          className="config-button"
          onClick={onConfigClick}
          title={t('configPanel.title')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m20.5-4.5L16 12l4.5 4.5M3.5 7.5L8 12l-4.5 4.5"></path>
          </svg>
          {t('configPanel.title')}
        </button>
      </div>
    </div>
  );
}
