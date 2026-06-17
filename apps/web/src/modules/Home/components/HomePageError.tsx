'use client';

import { Button, Card, Title } from 'animal-island-ui';

interface HomePageErrorProps {
  message: string;
  onRetry?: () => void;
}

export function HomePageError({ message, onRetry }: HomePageErrorProps) {
  return (
    <div className="home-page home-page--error">
      <Card className="home-page-error-card">
        <div className="home-page-error-card__inner">
          <Title size="small" color="app-red">
            无法加载首页
          </Title>
          <p className="home-page-error-card__message">{message}</p>
          {onRetry ? (
            <Button type="primary" onClick={onRetry}>
              重试
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
