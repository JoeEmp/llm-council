import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Collapsible from './Collapsible';
import './Stage2.css';

function deAnonymizeText(text, labelToModel) {
  if (!labelToModel) return text;

  let result = text;
  // Replace each "Response X" with the actual model name
  Object.entries(labelToModel).forEach(([label, model]) => {
    const modelShortName = model.split('/')[1] || model;
    result = result.replace(new RegExp(label, 'g'), `**${modelShortName}**`);
  });
  return result;
}

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

function EvaluationWithThinking({ content, labelToModel }) {
  const deAnonymizedContent = deAnonymizeText(content, labelToModel);
  const { hasThinking, thinking, content: mainContent } = splitThinkingFromContent(deAnonymizedContent);

  if (!hasThinking) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{deAnonymizedContent}</ReactMarkdown>;
  }

  return (
    <>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{mainContent}</ReactMarkdown>
      <Collapsible title={t('thinking')} defaultExpanded={false}>
        <div className="thinking-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinking}</ReactMarkdown>
        </div>
      </Collapsible>
    </>
  );
}

export default function Stage2({ rankings, labelToModel, aggregateRankings }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  if (!rankings || rankings.length === 0) {
    return null;
  }

  return (
    <div className="stage stage2">
      <h3 className="stage-title">{t('stage2.title')}</h3>

      <h4>{t('stage2.raw_evaluations')}</h4>
      <p className="stage-description">
        {t('stage2.description')}
      </p>

      <div className="tabs">
        {rankings.map((rank, index) => (
          <button
            key={index}
            className={`tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {rank.model.split('/')[1] || rank.model}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <div className="ranking-model">
          {rankings[activeTab].model}
        </div>
        <div className="ranking-content markdown-content">
          <EvaluationWithThinking
            content={rankings[activeTab].ranking}
            labelToModel={labelToModel}
          />
        </div>

        {rankings[activeTab].parsed_ranking &&
         rankings[activeTab].parsed_ranking.length > 0 && (
          <div className="parsed-ranking">
            <strong>{t('stage2.extracted_ranking')}</strong>
            <ol>
              {rankings[activeTab].parsed_ranking.map((label, i) => (
                <li key={i}>
                  {labelToModel && labelToModel[label]
                    ? labelToModel[label].split('/')[1] || labelToModel[label]
                    : label}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {aggregateRankings && aggregateRankings.length > 0 && (
        <div className="aggregate-rankings">
          <h4>{t('stage2.aggregate_rankings')}</h4>
          <p className="stage-description">
            {t('stage2.aggregate_description')}
          </p>
          <div className="aggregate-list">
            {aggregateRankings.map((agg, index) => (
              <div key={index} className="aggregate-item">
                <span className="rank-position">#{index + 1}</span>
                <span className="rank-model">
                  {agg.model.split('/')[1] || agg.model}
                </span>
                <span className="rank-score">
                  {t('stage2.average')}: {agg.average_rank.toFixed(2)}
                </span>
                <span className="rank-count">
                  ({agg.rankings_count} {t('stage2.votes')})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
