import React, { ReactNode } from 'react';

const headingToId = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
};

const getNodeText = (children: ReactNode): string => {
  try {
    if (typeof children === 'string') {
      return children;
    }
    if (Array.isArray(children)) {
      return children.map(getNodeText).join('');
    }
    if (React.isValidElement(children) && children.props) {
      return getNodeText(children.props.children);
    }
    return '';
  } catch (error) {
    console.error('Error processing MDX heading children:', error);
    return '';
  }
};

interface BlogHeadingProps {
  level: number;
  className?: string;
  children: ReactNode;
  [key: string]: any; // For any other props
}

const BlogHeading: React.FC<BlogHeadingProps> = ({
  level,
  className = '',
  children,
  ...delegated
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  const textContent = getNodeText(children);
  const id = headingToId(textContent) || 'unknown-heading';

  return (
    <Component id={id ?? 'unknown'} className={className} {...delegated}>
      {children}
    </Component>
  );
};

export default BlogHeading;
