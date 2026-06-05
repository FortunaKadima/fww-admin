type StatCardProps = {
  label: string;
  value: string | number;
  subtext?: string;
  onClick?: () => void;
};

export default function StatCard({ label, value, subtext, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#e6eadc] rounded-none px-[18px] py-4 transition ${
        onClick ? "cursor-pointer hover:border-[#d4dcc4]" : ""
      }`}
    >
      <p className="text-[50px] font-black text-[#003219] mb-[7px] text-center" style={{ lineHeight: '100%', letterSpacing: '-2%' }}>{value}</p>
      <p className="text-[10px] font-extrabold uppercase tracking-[.07em] text-[#015d25] text-center">
        {label}
      </p>
      {subtext && <p className="text-[11px] text-[#636858] mt-[3px]">{subtext}</p>}
    </div>
  );
}
