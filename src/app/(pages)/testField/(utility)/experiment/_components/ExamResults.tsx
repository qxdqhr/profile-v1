"use client";

import { useEffect, useState } from 'react';
import { useExam } from '../_context';
import { MultipleChoiceQuestion, QuestionType, SingleChoiceQuestion } from '@/app/(pages)/testField/(utility)/experiment/config/types';
import styles from '../styles.module.css';
import { assert } from '../_utils/utils';

const ExamResults = () => {
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const {
    questions,
    userAnswers,
    resetExam,
    resetToStart,
    calculateScore,
    resultModalData,
  } = useExam();

  const { score, totalPoints, correctAnswers, incorrectAnswers, unanswered } = calculateScore();

  const percentageScore = Math.round((score / totalPoints) * 100);
  const isPassing = percentageScore > resultModalData.passingScore;

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setShowResults(true);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    const modalTimer = setTimeout(() => {
      setShowModal(true);
    }, resultModalData.showDelayTime);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(modalTimer);
    };
  }, [resultModalData.showDelayTime]);

  const renderQuestionReview = () => {
    return questions.map((question, index) => {
      const userAnswer = userAnswers.find((answer) => answer.questionId === question.id);

      if (question.type === QuestionType.FillBlank) {
        return (
          <div key={question.id} className={styles['result-question-item']}>
            <div className={styles['result-question-title']}>
              第 {index + 1} 题（填空题）
            </div>
            <div>{question.content}</div>
            <div className={styles['result-question-skip']}>填空题暂不展示答案详情</div>
          </div>
        );
      }

      if (question.type === QuestionType.SingleChoice) {
        const singleQuestion = question as SingleChoiceQuestion;
        const selectedId = userAnswer?.selectedOptions?.[0];
        const correctId = singleQuestion.answer;
        const selectedOption = singleQuestion.options.find((option) => option.id === selectedId);
        const correctOption = singleQuestion.options.find((option) => option.id === correctId);
        const isCorrect = !!selectedId && selectedId === correctId;

        return (
          <div key={question.id} className={styles['result-question-item']}>
            <div className={styles['result-question-title']}>
              第 {index + 1} 题（单选题）
            </div>
            <div>{question.content}</div>
            <div className={styles['result-question-line']}>
              你的选择：{selectedOption ? selectedOption.content : '未作答'}
            </div>
            <div className={styles['result-question-line']}>
              正确答案：{correctOption ? correctOption.content : correctId}
            </div>
            <div className={isCorrect ? styles['result-question-correct'] : styles['result-question-wrong']}>
              {isCorrect ? '回答正确' : '回答错误'}
            </div>
          </div>
        );
      }

      if (question.type === QuestionType.MultipleChoice) {
        const multipleQuestion = question as MultipleChoiceQuestion;
        const selectedIds = userAnswer?.selectedOptions || [];
        const selectedOptions = multipleQuestion.options.filter((option) => selectedIds.includes(option.id));
        const correctOptions = multipleQuestion.options.filter((option) =>
          multipleQuestion.answers.includes(option.id)
        );
        const isCorrect =
          selectedIds.length === multipleQuestion.answers.length &&
          multipleQuestion.answers.every((answerId) => selectedIds.includes(answerId));

        return (
          <div key={question.id} className={styles['result-question-item']}>
            <div className={styles['result-question-title']}>
              第 {index + 1} 题（多选题）
            </div>
            <div>{question.content}</div>
            <div className={styles['result-question-line']}>
              你的选择：
              {selectedOptions.length > 0
                ? selectedOptions.map((option) => option.content).join('，')
                : '未作答'}
            </div>
            <div className={styles['result-question-line']}>
              正确答案：{correctOptions.map((option) => option.content).join('，')}
            </div>
            <div className={isCorrect ? styles['result-question-correct'] : styles['result-question-wrong']}>
              {isCorrect ? '回答正确' : '回答错误'}
            </div>
          </div>
        );
      }

      return (
        <div key={question.id} className={styles['result-question-item']}>
          <div className={styles['result-question-title']}>第 {index + 1} 题</div>
          <div>{question.content}</div>
          <div className={styles['result-question-skip']}>该题型暂不展示答案详情</div>
        </div>
      );
    });
  };

  return (
    <div className={styles['exam-container']}>
      {showModal && (
        <div className={styles['modal']}>
          <div className={styles['modal-content']}>
            <h2>{resultModalData.title}</h2>
            {isPassing ? <p>{resultModalData.messages.pass}</p> : <p>{resultModalData.messages.fail}</p>}
            <button
              onClick={() => {
                setShowModal(false);
                if (!isPassing) {
                  assert(true, '让我们继续我们之前的理想吧');
                }
              }}
            >
              {resultModalData.buttonText}
            </button>
          </div>
        </div>
      )}

      <div className={styles['results-container']}>
        {!showResults ? (
          <div className={styles['loading-results']}>
            <h2>正在计算成绩</h2>
            <div className={styles['circular-progress']}>
              <div
                className={styles['circular-progress-inner']}
                style={{
                  background: `conic-gradient(#0066cc ${progress * 3.6}deg, #f0f7ff 0deg)`,
                }}
              >
                <div className={styles['circular-progress-number']}>{progress}%</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles['results-header']}>
              <h1 className={styles['results-title']}>考试完成</h1>
              <p>感谢您完成考试！以下是您的成绩。</p>
            </div>

            <div className={styles['score-container']}>
              <div className={styles['score-circle']}>
                <div className={styles['score-value']}>{percentageScore}%</div>
                <div className={styles['score-label']}>总分</div>
              </div>
            </div>

            <div className={styles['summary-stats']}>
              <div className={styles['stat-item']}>
                <div className={styles['stat-value']}>{correctAnswers}</div>
                <div className={styles['stat-label']}>正确</div>
              </div>

              <div className={styles['stat-item']}>
                <div className={styles['stat-value']}>{incorrectAnswers}</div>
                <div className={styles['stat-label']}>错误</div>
              </div>

              <div className={styles['stat-item']}>
                <div className={styles['stat-value']}>{unanswered}</div>
                <div className={styles['stat-label']}>未回答</div>
              </div>
            </div>

            <div className={styles['result-question-list']}>{renderQuestionReview()}</div>

            <div className={styles['button-group']}>
              <button className={styles['review-button']} onClick={resetExam}>
                重新开始考试
              </button>

              <button
                className={`${styles['review-button']} ${styles['secondary-button']}`}
                onClick={resetToStart}
              >
                回到启动页
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamResults;
