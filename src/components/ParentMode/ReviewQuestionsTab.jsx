import React, { useState, useMemo } from 'react';
import { storageService } from '../../services/storageService';
import questionsData from '../../data/questionsData.json';

export const ReviewQuestionsTab = ({ activeProfile, onRefresh }) => {
  const [activeFileKey, setActiveFileKey] = useState('vol1'); // vol1, vol2, math2, math6
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, good, need_review, not_asked
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(25);

  const reviewLogs = useMemo(() => {
    return activeProfile?.reviewLogs || [];
  }, [activeProfile]);

  // Get current active file questions
  const fileData = questionsData[activeFileKey] || { title: '', questions: [] };
  const questionsList = fileData.questions;

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return questionsList.filter(q => {
      // 1. Search Query filter
      const matchesSearch = searchQuery
        ? (
            (q.title && q.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (q.setup && q.setup.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (q.question && q.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (q.purpose && q.purpose.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (q.lesson && q.lesson.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : true;

      if (!matchesSearch) return false;

      // 2. Status Filter
      const log = reviewLogs.find(l => l.questionId === q.id && l.fileKey === activeFileKey);
      const status = log ? log.status : 'not_asked';

      if (statusFilter === 'all') return true;
      if (statusFilter === 'good') return status === 'good';
      if (statusFilter === 'need_review') return status === 'need_review';
      if (statusFilter === 'not_asked') return status === 'not_asked' || status === 'viewed';

      return true;
    });
  }, [questionsList, searchQuery, statusFilter, reviewLogs, activeFileKey]);

  // Pagination slice
  const visibleQuestions = useMemo(() => {
    return filteredQuestions.slice(0, visibleCount);
  }, [filteredQuestions, visibleCount]);

  const handleToggleExpand = (qId) => {
    if (expandedQuestionId === qId) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(qId);
      // Log as opened
      storageService.recordQuestionOpened(qId, activeFileKey);
      onRefresh();
    }
  };

  const handleFeedback = (qId, status) => {
    storageService.recordReviewFeedback(qId, activeFileKey, status);
    onRefresh();
  };

  const handleResetFeedback = (qId) => {
    // We can reset by setting status to viewed
    storageService.recordReviewFeedback(qId, activeFileKey, 'viewed');
    onRefresh();
  };

  // Helper stats for sub-tabs
  const getSubTabStats = (fileKey) => {
    const questions = questionsData[fileKey]?.questions || [];
    const logs = reviewLogs.filter(l => l.fileKey === fileKey);
    const good = logs.filter(l => l.status === 'good').length;
    const needReview = logs.filter(l => l.status === 'need_review').length;
    const reviewed = good + needReview;
    return { total: questions.length, reviewed, good, needReview };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Profile Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📚 Review Questions for <span style={{ color: 'var(--accent-purple)', fontWeight: 800 }}>{activeProfile?.name}</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Go through situation safety & math questions and log answers feedback.
          </p>
        </div>
      </div>

      {/* Sub Tab Buttons for Document Types */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {Object.keys(questionsData).map(fileKey => {
          const stats = getSubTabStats(fileKey);
          const isActive = activeFileKey === fileKey;
          const shortTitle = fileKey === 'vol1' ? '🛡️ Safety Vol I' 
                           : fileKey === 'vol2' ? '🏫 Safety Vol II' 
                           : fileKey === 'math2' ? '🧮 Math Grade 2' 
                           : '📐 Math Grade 6';
          
          return (
            <button
              key={fileKey}
              onClick={() => {
                setActiveFileKey(fileKey);
                setExpandedQuestionId(null);
                setVisibleCount(25);
                setSearchQuery('');
              }}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                padding: '0.5rem 0.85rem', 
                fontSize: '0.8rem', 
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>{shortTitle}</span>
              <span style={{ 
                fontSize: '0.7rem', 
                background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', 
                padding: '0.1rem 0.4rem', 
                borderRadius: '10px',
                fontWeight: 600
              }}>
                {stats.reviewed}/{stats.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters panel */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="🔍 Search questions, lessons or contents..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setVisibleCount(25); }}
          className="input-field"
          style={{ flex: 2, minWidth: '220px', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
        />

        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.15)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'not_asked', label: '⏳ Not Asked' },
            { id: 'good', label: '👍 Good' },
            { id: 'need_review', label: '⚠️ Review' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setStatusFilter(f.id); setVisibleCount(25); }}
              className={`btn ${statusFilter === f.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', border: 'none', background: statusFilter === f.id ? 'var(--accent-purple)' : 'transparent' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Render List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '48vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {visibleQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)' }}>
            📭 No questions found matching search or filter criteria.
          </div>
        ) : (
          visibleQuestions.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.id;
            const log = reviewLogs.find(l => l.questionId === q.id && l.fileKey === activeFileKey);
            
            const isGood = log?.status === 'good';
            const isNeedReview = log?.status === 'need_review';
            const isOpened = log?.status === 'viewed' || !!log;
            
            // Check if card should be dimmed
            const isDimmed = isGood || isNeedReview || isOpened;

            // Background & border highlighting based on review status
            let cardBg = 'var(--bg-glass)';
            let cardBorder = '1px solid var(--border-color)';
            if (isExpanded) {
              cardBorder = '1.5px solid var(--accent-purple)';
            } else if (isGood) {
              cardBorder = '1px solid rgba(16, 185, 129, 0.25)';
              cardBg = 'rgba(16, 185, 129, 0.03)';
            } else if (isNeedReview) {
              cardBorder = '1px solid rgba(245, 158, 11, 0.25)';
              cardBg = 'rgba(245, 158, 11, 0.03)';
            }

            return (
              <div
                key={q.id}
                style={{
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isDimmed && !isExpanded ? 0.65 : 1
                }}
                onClick={() => handleToggleExpand(q.id)}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <span># {idx + 1}</span>
                      {q.lesson && <span>• {q.lesson}</span>}
                    </div>
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '0.9rem', 
                      color: isDimmed ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: isGood ? 'line-through' : 'none'
                    }}>
                      {q.title || q.question}
                    </div>
                  </div>
                  
                  {/* Status badges right side */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                    {isGood && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                        👍 Good
                      </span>
                    )}
                    {isNeedReview && (
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                        ⚠️ Review
                      </span>
                    )}
                    {log?.lastOpenedDate && !isGood && !isNeedReview && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        👀 Opened {log.lastOpenedDate}
                      </span>
                    )}
                    {log?.lastOpenedDate && (isGood || isNeedReview) && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        Reviewed {log.lastOpenedDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Collapsible details body */}
                {isExpanded && (
                  <div 
                    style={{ 
                      marginTop: '0.85rem', 
                      paddingTop: '0.85rem', 
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      cursor: 'default'
                    }}
                    onClick={e => e.stopPropagation()} // Stop accordion toggling
                  >
                    {/* 1. Situation specific layout */}
                    {(activeFileKey === 'vol1' || activeFileKey === 'vol2') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <strong style={{ color: 'var(--accent-amber)', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Đặt vấn đề:</strong>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>{q.setup}</div>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--accent-pink)', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Câu hỏi tương tác:</strong>
                          <div style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--text-primary)' }}>{q.question}</div>
                        </div>
                        {q.steps && q.steps.length > 0 && (
                          <div>
                            <strong style={{ color: 'var(--accent-green)', fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>Giải pháp logic 3 bước:</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {q.steps.map((step, sIdx) => (
                                <div key={sIdx} style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-green)' }}>
                                  <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>{sIdx + 1}</span>
                                  <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Math specific layout */}
                    {(activeFileKey === 'math2' || activeFileKey === 'math6') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <strong style={{ color: 'var(--accent-pink)', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Câu hỏi:</strong>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{q.question}</div>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--accent-green)', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Mục đích / Gợi ý đáp án:</strong>
                          <div style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-cyan)', lineHeight: 1.4 }}>
                            {q.purpose}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Action recording bar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
                        Record response:
                      </span>
                      
                      <button
                        onClick={() => handleFeedback(q.id, 'good')}
                        className={`btn ${isGood ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ 
                          padding: '0.35rem 0.8rem', 
                          fontSize: '0.75rem', 
                          background: isGood ? '#10b981' : 'rgba(16,185,129,0.1)',
                          color: isGood ? '#fff' : '#10b981',
                          border: isGood ? 'none' : '1px solid rgba(16,185,129,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        👍 Good Answer
                      </button>

                      <button
                        onClick={() => handleFeedback(q.id, 'need_review')}
                        className={`btn ${isNeedReview ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ 
                          padding: '0.35rem 0.8rem', 
                          fontSize: '0.75rem', 
                          background: isNeedReview ? '#f59e0b' : 'rgba(245,158,11,0.1)',
                          color: isNeedReview ? '#fff' : '#f59e0b',
                          border: isNeedReview ? 'none' : '1px solid rgba(245,158,11,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        ⚠️ Needs Review
                      </button>

                      {(isGood || isNeedReview) && (
                        <button
                          onClick={() => handleResetFeedback(q.id)}
                          className="btn btn-secondary"
                          style={{ 
                            padding: '0.35rem 0.6rem', 
                            fontSize: '0.75rem', 
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          🔄 Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Load More Button */}
        {filteredQuestions.length > visibleCount && (
          <button
            onClick={() => setVisibleCount(prev => prev + 25)}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
          >
            🔽 Load More Questions ({filteredQuestions.length - visibleCount} remaining)
          </button>
        )}
      </div>
    </div>
  );
};
