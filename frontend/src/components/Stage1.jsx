import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Collapsible from './Collapsible';
import './Stage1.css';

/**
 * Split response text into thinking and main content
 * Supports: <think>...</think> tags (DeepSeek-R1, etc.)
 */
function splitThinkingFromContent(text) {
  // Check for <think>...</think> pattern
  const thinkPattern = /<think>([\s\S]*?)<\/think>/;
  const match = text.match(thinkPattern);

  if (match) {
    const thinking = match[1].trim();
    const content = text.replace(thinkPattern, '').trim();
    return { hasThinking: true, thinking, content };
  }

  return { hasThinking: false, thinking: '', content: text };
}

function ResponseWithThinking({ content }) {
  const { hasThinking, thinking, content: mainContent } = splitThinkingFromContent(content);

  if (!hasThinking) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
  }

  return (
    <>
      <Collapsible title="think" defaultExpanded={true}>
        <div className="thinking-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinking}</ReactMarkdown>
        </div>
      </Collapsible>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{mainContent}</ReactMarkdown>
    </>
  );
}

export default function Stage1({ responses }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!responses || responses.length === 0) {
    return null;
  }

  return (
    <div className="stage stage1">
      <h3 className="stage-title">Stage 1: Individual Responses</h3>

      <div className="tabs">
        {responses.map((resp, index) => (
          <button
            key={index}
            className={`tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {resp.model.split('/')[1] || resp.model}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <div className="model-name">{responses[activeTab].model}</div>
        <div className="response-text markdown-content">
          <ResponseWithThinking content={responses[activeTab].response} />
        </div>
      </div>
    </div>
  );
}
