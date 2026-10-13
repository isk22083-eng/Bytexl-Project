import { Suspense } from "react";
import RecordDetailServer from "./RecordDetailServer";

export default function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <RecordDetailServer params={params} />
    </Suspense>
  );
}
