export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="text-center py-24">
      <h1 className="text-lg font-semibold text-gray-900 mb-1">{title}</h1>
      <p className="text-sm text-gray-500">Έρχεται στο επόμενο βήμα.</p>
    </div>
  );
}
