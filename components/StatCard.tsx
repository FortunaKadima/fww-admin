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
      className={`bg-white border border-[#e6eadc] rounded-[14px] px-[18px] py-4 transition ${
        onClick ? "cursor-pointer hover:border-[#d4dcc4]" : ""
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[#9aa489] mb-[7px]">
        {label}
      </p>
      <p className="text-xl font-bold tracking-[-.02em] text-[#1a1f15]">{value}</p>
      {subtext && <p className="text-[11px] text-[#9aa489] mt-[3px]">{subtext}</p>}
    </div>
  );
}
