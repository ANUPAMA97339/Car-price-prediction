import { Link } from 'react-router-dom'
import { Car, CarFront, Globe2, Brain, ShieldCheck, BarChart3, Sparkles, ArrowRight } from 'lucide-react'

const features = [
  { icon: Brain, title: 'AI-Powered Predictions', desc: 'Trained on real market datasets using proven regression models.' },
  { icon: Globe2, title: 'Multi-Country Support', desc: 'India, USA, UK, Germany — each with its own currency.' },
  { icon: ShieldCheck, title: 'No Login Required', desc: 'Use every feature instantly. History is stored locally.' },
  { icon: BarChart3, title: 'Market Insights', desc: 'Country, brand, and year-wise trends from real data.' },
]

const steps = [
  { n: 1, t: 'Choose Vehicle Type', d: 'Select new or used car.' },
  { n: 2, t: 'Enter Details', d: 'Country, brand, year, mileage, and specs.' },
  { n: 3, t: 'Get AI Price', d: 'Instant estimate with confidence range.' },
  { n: 4, t: 'Save & Export', d: 'Store history and download a PDF report.' },
]

export default function Home() {
  return (
    <div className="space-y-12 pb-10">
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden rounded-3xl h-[400px] md:h-[500px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&auto=format&fit=crop&q=80"
            alt="Modern car"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-bgPrimary via-bgPrimary/90 to-bgPrimary/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-bgPrimary/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 md:px-12 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-accent/20 text-accent mb-4 backdrop-blur-sm border border-accent/20 font-medium">
            <Sparkles size={14} /> Free & Open Source AI
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            Predict Car Prices <br />
            with <span className="text-accent">AI</span>
          </h1>
          <p className="text-textSub text-sm md:text-lg mt-4 max-w-lg leading-relaxed shadow-black drop-shadow-md">
            Get accurate estimates for new and used cars across multiple countries using machine learning trained on real market data.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/predict/new" className="btn-primary !px-6 !py-3 text-sm md:text-base shadow-lg shadow-accent/30">
              <Car size={18} /> New Car Prediction
            </Link>
            <Link to="/predict/used" className="btn-secondary !px-6 !py-3 text-sm md:text-base bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20">
              <CarFront size={18} /> Used Car Prediction
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="card hover:-translate-y-1 transition-transform duration-300">
              <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold text-lg mb-4">{s.n}</div>
              <p className="font-semibold text-textMain text-sm">{s.t}</p>
              <p className="text-textSub text-xs mt-1.5 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section>
        <h2 className="section-title">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-accentAlt/30 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-accentAlt/10 text-accentAlt flex items-center justify-center mb-4">
                <Icon size={24} />
              </div>
              <p className="font-semibold text-textMain text-sm">{title}</p>
              <p className="text-textSub text-xs mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}