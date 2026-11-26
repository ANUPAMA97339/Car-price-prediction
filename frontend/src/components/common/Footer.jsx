export default function Footer() {
  return (
    <footer className="text-center text-xs text-textSub py-4 border-t theme-border">
      © {new Date().getFullYear()} Global Car Price Prediction AI — Predictions are estimates, not guarantees.
    </footer>
  )
}