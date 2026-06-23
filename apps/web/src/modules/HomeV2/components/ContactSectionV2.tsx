'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, Modal } from '@sa2kit-ui/react';

type SubmitStatus = 'idle' | 'success' | 'error';

interface ContactFormState {
  name: string;
  email: string;
  message: string;
  company: string;
}

const CONTACT_CARDS = [
  { title: '邮箱', value: 'your.email@example.com' },
  { title: '电话', value: '+86 123 4567 8900' },
  { title: '地址', value: '中国，北京' },
];

interface ContactApiResponse {
  success: boolean;
  error?: string;
}

export function ContactSectionV2() {
  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    email: '',
    message: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const handleChange = (field: keyof ContactFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/homeContact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as ContactApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.error || '发送失败，请稍后重试');
      }

      setSubmitStatus('success');
      setSuccessOpen(true);
      setFormData({ name: '', email: '', message: '', company: '' });
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : '发送失败，请稍后重试',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="home-v2-section">
      <header className="home-v2-section__header">
        <h2 className="home-v2-section__title">联系我</h2>
        <p className="home-v2-section__desc">
          有任何问题或建议？留言后将通过飞书 / QQ 通知我
        </p>
      </header>

      <div className="home-v2-contact__layout">
        <article className="home-v2-card">
          <form className="home-v2-contact__form" onSubmit={handleSubmit}>
            <label
              className="home-v2-contact__field home-v2-contact__honeypot"
              aria-hidden
            >
              <span>Company</span>
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={formData.company}
                onChange={(event) =>
                  handleChange('company', event.target.value)
                }
              />
            </label>

            <label className="home-v2-contact__field">
              <span>姓名</span>
              <Input
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="请输入您的姓名"
                shadow
                required
              />
            </label>

            <label className="home-v2-contact__field">
              <span>邮箱</span>
              <Input
                type="email"
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="请输入您的邮箱"
                shadow
                required
              />
            </label>

            <label className="home-v2-contact__field">
              <span>消息</span>
              <textarea
                className="home-v2-contact__textarea"
                name="message"
                rows={4}
                value={formData.message}
                onChange={(event) =>
                  handleChange('message', event.target.value)
                }
                placeholder="请输入您的消息"
                required
              />
            </label>

            {submitStatus === 'error' ? (
              <p className="home-v2-contact__error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <div className="home-v2-contact__submit">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                发送消息
              </Button>
            </div>
          </form>
        </article>

        <div className="home-v2-contact__info-grid">
          {CONTACT_CARDS.map((item) => (
            <article
              key={item.title}
              className="home-v2-card home-v2-contact__info-card"
            >
              <h3>{item.title}</h3>
              <p>{item.value}</p>
            </article>
          ))}
        </div>
      </div>

      <Modal
        open={successOpen}
        title="消息已发送"
        typewriter={false}
        onClose={() => setSuccessOpen(false)}
        onOk={() => setSuccessOpen(false)}
      >
        感谢你的留言，我已收到通知，会尽快回复！
      </Modal>
    </section>
  );
}
