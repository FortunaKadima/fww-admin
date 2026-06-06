import { getAthletes, getDistinctSports } from "@/lib/queries";
import AthletesTable from "@/components/AthletesTable";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AthletesPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const [athletes, sports] = await Promise.all([getAthletes(), getDistinctSports()]);

  return (
    <>
      <div className="max-w-[1100px]">
        {/* Athletes Header */}
        <div className="mt-16 mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-2 md:gap-0 mb-4">
            <h1 className="text-xl md:text-[35px] font-black text-[#003219]" style={{ lineHeight: '100%', letterSpacing: '-2px' }}>Your Athletes</h1>
            <div className="md:text-right">
              <p className="text-sm md:text-[15px] font-normal italic text-[#003219]" style={{ lineHeight: '130%', letterSpacing: '0' }}>Search, filter, and view progress</p>
              <p className="text-sm md:text-[15px] font-normal italic text-[#003219]" style={{ lineHeight: '130%', letterSpacing: '0' }}>All enrolled athletes</p>
            </div>
          </div>
          {/* Divider */}
          <div style={{ width: '100%', height: '0px', border: '0.5px solid #55695F', opacity: 1 }}></div>
        </div>

        <AthletesTable athletes={athletes} sports={sports} initialFilter={filter ?? null} />
      </div>
    </>
  );
}
