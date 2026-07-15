interface BrandMarkProps {
  className?: string
  size?: number
}

export function BrandMark({ className = '', size = 32 }: BrandMarkProps) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Navor</title>
      <rect className="fill-accent" height="32" rx="6" width="32" />
      <path className="fill-paper-elevated" d="M7.5 23.5v-15h4l9 9.4V8.5h4v15h-4l-9-9.4v9.4h-4Z" />
      <path className="fill-warning-soft" d="m25 3.5 1.8 1.8L25 7.1l-1.8-1.8L25 3.5Z" />
    </svg>
  )
}
