import RecordDetailClient from "./RecordDetailClient";

export default async function RecordDetailServer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecordDetailClient id={id} />;
}
