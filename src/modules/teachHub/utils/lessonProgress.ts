import type { LessonIndex, TeachLessonProgress } from '../types';

export function lessonProgressMap(progress: TeachLessonProgress[]) {
  return new Map(progress.map((p) => [p.lessonSlug, p]));
}

export function mergeLessonsWithProgress(
  lessons: LessonIndex[],
  progress: TeachLessonProgress[],
) {
  const map = lessonProgressMap(progress);
  return lessons.map((lesson) => ({
    lesson,
    progress: map.get(lesson.slug),
  }));
}
