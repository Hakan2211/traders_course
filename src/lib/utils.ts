import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const formatModuleSlug = (slug: string) => {
  const formattedSlug = slug.replace(/^\d{2}-/, '');
  return formattedSlug.split('-').map(capitalizeFirstLetter).join(' ');
};

//parseModuleSlug and parseLessonSlug

export interface ParsedModuleSlug {
  chapter: number;
  moduleName: string;
}

export interface ParsedLessonSlug {
  chapter: number;
  lessonNumber: string;
  sublessonNumber: string | null;
  lessonTitle: string;
}

export const parseModuleSlug = (moduleSlug: string): ParsedModuleSlug => {
  // Handle empty or invalid input
  if (!moduleSlug) {
    return { chapter: 0, moduleName: '' };
  }

  // Split by first dash and handle the rest as module name
  const match = moduleSlug.match(/^(\d+)-(.+)$/);
  if (!match) {
    return { chapter: 0, moduleName: moduleSlug };
  }

  const [, chapterStr, moduleName] = match;
  return {
    chapter: parseInt(chapterStr, 10),
    moduleName: moduleName.replace(/-/g, ' '), // Replace remaining dashes with spaces
  };
};

export const parseLessonSlug = (lessonSlug: string): ParsedLessonSlug => {
  // Handle empty or invalid input
  if (!lessonSlug) {
    return {
      chapter: 0,
      lessonNumber: '',
      sublessonNumber: null,
      lessonTitle: '',
    };
  }

  // Match pattern: "03-01.1-head-and-shoulder" or "03-01-head-and-shoulder"
  const match = lessonSlug.match(/^(\d+)-(\d+(?:\.\d+)?)-(.+)$/);
  if (!match) {
    return {
      chapter: 0,
      lessonNumber: '',
      sublessonNumber: null,
      lessonTitle: lessonSlug,
    };
  }

  const [, chapterStr, lessonPart, title] = match;
  let lessonNumber: string;
  let sublessonNumber: string | null = null;

  // Split lesson number if it contains a sublesson
  if (lessonPart.includes('.')) {
    const [mainLesson, subLesson] = lessonPart.split('.');
    lessonNumber = mainLesson;
    sublessonNumber = subLesson;
  } else {
    lessonNumber = lessonPart;
  }

  return {
    chapter: parseInt(chapterStr, 10),
    lessonNumber,
    sublessonNumber,
    lessonTitle: title.replace(/-/g, ' '),
  };
};

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
