import { Link } from '@tanstack/react-router'
import { LessonsNav } from '../layout/lessonsNav'
import styles from '../../routes/course/course.module.css'
import { AnimatedLogo } from '../ui/AnimatedLogo'

export default function NavBar() {
  return (
    <nav className={`w-full z-10 flex items-center ${styles.gridContainer}`}>
      <div
        className={`${styles.gridContent} flex justify-between items-center w-full py-6`}
      >
        <div>
          <Link
            to="/"
            className="flex items-center gap-2 text-[var(--text-color-primary-800)] font-bold text-xl tracking-wider"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-zinc-800 to-black border border-white/10 group-hover:border-[#B0811C]/50 transition-colors duration-500">
              <AnimatedLogo className="w-8 h-8 text-[#B0811C]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-serif font-base text-2xl tracking-tight leading-none group-hover:text-amber-100 transition-colors">
                Market
              </span>
              <span className="text-[#dab25b] font-mono font-semibold text-[12px] tracking-[0.2em] uppercase leading-none">
                Magic Box
              </span>
            </div>
          </Link>
        </div>
        <div>
          <LessonsNav />
        </div>
      </div>
    </nav>
  )
}
