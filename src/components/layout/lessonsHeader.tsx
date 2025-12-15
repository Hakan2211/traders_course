import useWindowSize from '@/hooks/useWindowSize';
import SideBarSheet from './sidebarSheet';
import { LessonsNav } from './lessonsNav';

type SidebarProps = {
  moduleBadge?: string;
  moduleSlug: string;
  lessonSlug: string;
  lessons: { slug: string; title: string; parent: string | null }[];
  basePath?: string;
};

function LessonsHeader({
  moduleBadge,
  moduleSlug,
  lessons,
  lessonSlug,
  basePath = '/course',
}: SidebarProps) {
  const { width } = useWindowSize();
  const effectiveWidth = width ?? 0;
  return effectiveWidth > 768 ? (
    <header className="bg-[var(--bg-color)] text-[var(--text-color-primary-800)] h-[3rem] pr-4 flex items-center justify-end">
      <LessonsNav />
    </header>
  ) : (
    <header className="bg-[var(--bg-color)] text-[var(--text-color-primary-800)] h-[3rem] flex  justify-start">
      <div className="mr-auto">
        <SideBarSheet
          lessons={lessons}
          moduleBadge={moduleBadge}
          moduleSlug={moduleSlug}
          lessonSlug={lessonSlug}
          basePath={basePath}
        />
      </div>
      <div className="flex items-center">
        <LessonsNav />
      </div>
    </header>
  );
}

export default LessonsHeader;
