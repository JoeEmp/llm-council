import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Collapsible.css';

export default function Collapsible({
  children,
  title = 'think',
  defaultExpanded = false,
  className = '',
  contentClassName = '',
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`collapsible ${className}`}>
      <button
        type="button"
        className={`collapsible-header ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={toggle}
        aria-expanded={isExpanded}
      >
        <span className="collapsible-icon">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="collapsible-title">{title === 'think' ? t('thinking') : title}</span>
      </button>
      <div
        className={`collapsible-content ${contentClassName}`}
        style={{
          maxHeight: isExpanded ? '1000px' : '0',
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? '8px' : '0',
        }}
      >
        {children}
      </div>
    </div>
  );
}
