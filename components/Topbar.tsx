"use client";

interface TopbarProps {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
}

export default function Topbar({ breadcrumb, title, subtitle }: TopbarProps) {
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-[#e6eadc] px-8 py-4 mb-7">
      {breadcrumb && (
        <div className="flex items-center gap-1 text-xs text-[#636858] mb-2">
          <span>{breadcrumb}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-[#1a1f15]">{title}</h1>
          {subtitle && <p className="text-xs text-[#636858] mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
