import { useTypewriter } from '../hooks/useTypewriter';

interface Props {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  speed?: number;
  delay?: number;
}

export default function TypewriterHeadline({
  text,
  as: Tag = 'h2',
  className = '',
  speed = 40,
  delay = 200,
}: Props) {
  const { displayedText, isDone } = useTypewriter({ text, speed, delay });

  return (
    <Tag className={`font-heading tracking-wide ${className}`}>
      <span>{displayedText}</span>
      {isDone && (
        <span
          className="typewriter-cursor"
          style={{ height: '0.9em' }}
          aria-hidden="true"
        />
      )}
    </Tag>
  );
}
