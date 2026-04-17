import { getAthletes, getDistinctSports } from "@/lib/queries";
import AthletesTable from "@/components/AthletesTable";
import Topbar from "@/components/Topbar";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AthletesPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const [athletes, sports] = await Promise.all([getAthletes(), getDistinctSports()]);

  return (
    <>
      <Topbar title="Athletes" subtitle="Search, filter, and view progress for all enrolled athletes" />
      <div className="max-w-[1100px]">
        <AthletesTable athletes={athletes} sports={sports} initialFilter={filter ?? null} />
      </div>
    </>
  );
}
