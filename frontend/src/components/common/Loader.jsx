export default function Loader({ label = 'Loading…', fullScreen = false }) {
  const inner = (
    <div className="flex items-center justify-center py-12 text-textSub text-sm">
      <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full mr-3" />
      {label}
    </div>
  )
  return fullScreen ? <div className="min-h-[60vh] flex items-center justify-center">{inner}</div> : inner
}