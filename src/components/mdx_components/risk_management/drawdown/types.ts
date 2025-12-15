export interface EquityPoint {
  date: string;
  value: number;
  drawdown: number;
  description: string;
  emotionalState: string;
}

export interface QuoteProps {
  quote: string;
  author: string;
}

export interface HighlightProps {
  children: React.ReactNode;
  variant?: 'blue' | 'yellow' | 'red' | 'green' | 'accent';
}

export interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
}
