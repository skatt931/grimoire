export default function Loading() {
  return (
    <div className="pt-4 pb-6 px-6 animate-pulse">
      {/* Header skeleton */}
      <div className="pt-2 pb-4">
        <div className="h-3 w-32 rounded-full mb-3" style={{ background: "rgba(139,159,212,.12)" }} />
        <div className="h-10 w-48 rounded-xl mb-2" style={{ background: "rgba(139,159,212,.08)" }} />
        <div className="h-3 w-40 rounded-full" style={{ background: "rgba(139,159,212,.06)" }} />
      </div>
      {/* Card skeleton */}
      <div className="mx-1 mb-4 rounded-[18px] h-[100px]" style={{ background: "rgba(13,11,30,.6)", border: "1px solid rgba(139,159,212,.08)" }} />
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-2.5 mt-2">
        {[0,1,2,3].map(i => (
          <div key={i} className="rounded-[20px] h-[110px]" style={{ background: "rgba(13,11,30,.6)", border: "1px solid rgba(139,159,212,.07)" }} />
        ))}
      </div>
    </div>
  );
}
