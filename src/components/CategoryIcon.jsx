import { categoryInfo } from '../lib/categories';

const SIZES = {
  sm: { box: 'h-7 w-7 rounded-md', icon: 15 },
  md: { box: 'h-10 w-10 rounded-lg', icon: 19 },
  lg: { box: 'h-14 w-14 rounded-xl', icon: 26 },
};

/** A category's icon on a soft tile tinted with its colour. */
export default function CategoryIcon({ name, size = 'md', className = '' }) {
  const info = categoryInfo(name);
  const Icon = info.icon;
  const s = SIZES[size] || SIZES.md;
  return (
    <span className={`grid shrink-0 place-items-center ${s.box} ${className}`}
      style={{ backgroundColor: `${info.color}1f`, color: info.color }} aria-hidden="true">
      <Icon size={s.icon} weight="duotone" />
    </span>
  );
}
