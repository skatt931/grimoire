export default function Loading() {
  return (
    <div className="pt-4 pb-6 px-6 animate-pulse">
      <div className="pt-2 pb-5">
        <div className="h-8 w-36 rounded-xl mb-2" style={{ background: "rgba(139,159,212,.08)" }} />
        <div className="h-3 w-48 rounded-full" style={{ background: "rgba(139,159,212,.06)" }} />
      </div>
      {[0,1,2,3].map(i => (
        <div key={i} className="rounded-[18px] h-[100px] mb-3" style={{ background: "rgba(13,11,30,.6)", border: "1px solid rgba(139,159,212,.07)" }} />
      ))}
    </div>
  );
}
