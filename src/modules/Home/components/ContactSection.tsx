'use client';

import { useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  Divider,
  Input,
  Modal,
  Title,
} from 'animal-island-ui';

type SubmitStatus = 'idle' | 'success' | 'error';

interface ContactFormState {
  name: string;
  email: string;
  message: string;
  company: string;
}

const CONTACT_CARDS = [
  {
    title: '邮箱',
    value: 'your.email@example.com',
    color: 'app-blue' as const,
  },
  {
    title: '电话',
    value: '+86 123 4567 8900',
    color: 'app-green' as const,
  },
  {
    title: '地址',
    value: '中国，北京',
    color: 'app-yellow' as const,
  },
];

interface ContactApiResponse {
  success: boolean;
  error?: string;
  data?: {
    submittedAt?: string;
    channels?: {
      feishu?: string;
      qq?: string;
    };
  };
}

export function ContactSection() {
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

  const handleChange = (
    field: keyof ContactFormState,
    value: string,
  ) => {
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
    <section id="contact" className="home-section home-section--contact">
      <div className="home-section__heading">
        <Title size="middle" color="warm-peach-pink">
          联系我
        </Title>
      </div>

      <p className="home-section__desc">
        有任何问题或建议？留言后将通过飞书 / QQ 通知我
      </p>

      <Divider type="dashed-brown" />

      <Card className="home-contact__form-card">
        <form className="home-contact__form" onSubmit={handleSubmit}>
          <label className="home-contact__field home-contact__honeypot" aria-hidden>
            <span>Company</span>
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={formData.company}
              onChange={(event) => handleChange('company', event.target.value)}
            />
          </label>

          <label className="home-contact__field">
            <span>姓名</span>
            <Input
              value={formData.name}
              onChange={(event) => handleChange('name', event.target.value)}
              placeholder="请输入您的姓名"
              shadow
              required
            />
          </label>

          <label className="home-contact__field">
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

          <label className="home-contact__field">
            <span>消息</span>
            <textarea
              className="home-contact__textarea"
              name="message"
              rows={4}
              value={formData.message}
              onChange={(event) => handleChange('message', event.target.value)}
              placeholder="请输入您的消息"
              required
            />
          </label>

          {submitStatus === 'error' ? (
            <p className="home-contact__error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="home-contact__submit">
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
      </Card>

      <div className="home-contact__cards">
        {CONTACT_CARDS.map((item) => (
          <Card key={item.title} color={item.color} className="home-contact__info-card">
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </Card>
        ))}
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
