import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  title: string;
  items: BreadcrumbItem[];
  backHref?: string;
  backText?: string;
  showBack?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  title,
  items,
  backHref,
  backText = 'Back to list',
  showBack = false,
  className,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backHref) {
      navigate(backHref);
    } else {
      navigate(-1);
    }
  };

  const shouldShowBack = showBack || !!backHref;

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6', className)}>
      <div className="flex flex-col gap-1.5 min-w-0">
        {/* Trail & Title on the same line style */}
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
            {title}
          </h1>
          <nav className="text-[10px] font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500 flex items-center gap-1.5 select-none">
            {items.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300 dark:text-slate-700">/</span>}
                {item.href ? (
                  <Link to={item.href} className="hover:text-indigo-505 dark:hover:text-amber-400 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {shouldShowBack && (
        <button
          onClick={handleBack}
          className="lw-btn-interactive flex items-center gap-2 text-xs font-bold px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backText}</span>
        </button>
      )}
    </div>
  );
};

export default Breadcrumbs;
