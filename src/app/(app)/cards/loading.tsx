export default function Loading() {
  return (
    <div className="pt-4 pb-6 px-6 animate-pulse">
      <div className="pt-2 pb-4">
        <div className="h-8 w-28 rounded-xl mb-2" style={{ background: "rgba(139,159,212,.08)" }} />
        <div className="h-3 w-44 rounded-full" style={{ background: "rgba(139,159,212,.06)" }} />
      </div>
      <div className="h-10 w-full rounded-[14px] mb-4" style={{ background: "rgba(13,11,30,.6)", border: "1px solid rgba(139,159,212,.08)" }} />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-[14px] aspect-[2/3]" style={{ background: "rgba(13,11,30,.6)", border: "1px solid rgba(139,159,212,.07)" }} />
        ))}
      </div>
    </div>
  );
}
