import React from 'react';

interface CircleIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

const CircleIcon: React.FC<CircleIconProps> = ({
  size = 24,
  color = 'currentColor',
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-circle"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export default CircleIcon;
