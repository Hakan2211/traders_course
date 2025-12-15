import { Link } from '@tanstack/react-router'
import { LessonsNav } from '../layout/lessonsNav'
import styles from '../../routes/course/course.module.css'

export default function NavBar() {
  return (
    <nav className={`w-full z-10 flex items-center ${styles.gridContainer}`}>
      <div
        className={`${styles.gridContent} flex justify-between items-center w-full py-6`}
      >
        <div>
          <Link
            to="/"
            className="text-[var(--text-color-primary-800)] font-bold text-xl tracking-wider"
          >
            Logo<span className="text-blue-400"></span>
          </Link>
        </div>
        <div>
          <LessonsNav />
        </div>
      </div>
    </nav>
  )
}
