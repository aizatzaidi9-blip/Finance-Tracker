export default function ProtectedLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded-full bg-[#EAECF0]" />
          <div className="h-9 w-36 animate-pulse rounded-full bg-[#EAECF0]" />
        </div>
        <div className="flex gap-2">
          <div className="h-11 w-11 animate-pulse rounded-full bg-[#EAECF0]" />
          <div className="h-11 w-11 animate-pulse rounded-full bg-[#EAECF0]" />
        </div>
      </div>
      <div className="h-36 animate-pulse rounded-[30px] bg-[#EAECF0]" />
      <div className="h-36 animate-pulse rounded-[30px] bg-[#EAECF0]" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-[24px] bg-[#EAECF0]" />
        <div className="h-24 animate-pulse rounded-[24px] bg-[#EAECF0]" />
      </div>
      <div className="h-64 animate-pulse rounded-[30px] bg-[#EAECF0]" />
    </div>
  );
}
