export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F7F8FC] p-6 text-center text-[#172033]">
      <div className="max-w-sm rounded-[30px] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font900">Anda sedang offline</h1>
        <p className="mt-2 text-sm leading-6 text-[#667085]">
          Shell aplikasi tersedia. Sambung internet semula untuk data terkini.
        </p>
      </div>
    </main>
  );
}
