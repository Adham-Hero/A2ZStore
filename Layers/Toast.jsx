import { useApp } from '../src/AppContext.js'

export default function Toast() {
  const { toast } = useApp()
  return (
    <div className="toast-zone" aria-live="polite">
      {toast && (
        <div key={toast.key} className={`toast toast--${toast.tone}`}>{toast.message}</div>
      )}
    </div>
  )
}
