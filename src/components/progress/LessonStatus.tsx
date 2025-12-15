
import { useProgress } from '@/context/progress/ProgressContext';
import CheckCircleIcon from '../icons/checkCircle';
import CircleIcon from '../icons/circleIcon';

type LessonStatusProps = {
  moduleSlug: string;
  lessonSlug: string;
};

export function LessonStatus({ moduleSlug, lessonSlug }: LessonStatusProps) {
  const { getLessonStatus } = useProgress();
  const status = getLessonStatus(moduleSlug, lessonSlug);

  if (status === 'completed') {
    return <CheckCircleIcon className="w-5 h-5 text-[var(--module-badge)]" />;
  }

  return <CircleIcon className="w-5 h-5 text-gray-300" />;
}
