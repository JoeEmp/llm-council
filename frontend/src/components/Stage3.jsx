import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Collapsible from './Collapsible';
import './Stage3.css';

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

export default function Stage3({ finalResponse }) {
  if (!finalResponse) {
    return null;
  }

  return (
    <div className="stage stage3">
      <h3 className="stage-title">Stage 3: Final Council Answer</h3>
      <div className="final-response">
        <div className="chairman-label">
          Chairman: {finalResponse.model.split('/')[1] || finalResponse.model}
        </div>
        <div className="final-text markdown-content">
          {finalResponse.response ? (
            <ResponseWithThinking content={finalResponse.response} />
          ) : (
            <p>Waiting for final response...</p>
          )}
        </div>
      </div>
    </div>
  );
}
