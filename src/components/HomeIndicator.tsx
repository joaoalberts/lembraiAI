import s from './HomeIndicator.module.css';

/** Barra "home" do iOS, sobre a barra de menu (ref/5.png). */
export function HomeIndicator() {
  return <i aria-hidden className={s.bar} />;
}
