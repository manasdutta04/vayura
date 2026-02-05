import styles from './about.module.css';

export default function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">

      {/* Hero Section */}
      <section className={`${styles.section} space-y-6`}>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          About <span className="text-green-600">Vayura</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-4xl">
          Vayura is a data-driven environmental intelligence platform focused on
          understanding, monitoring, and improving oxygen-generating ecosystems
          across India. By combining reliable data with public awareness, Vayura
          enables informed decisions for a healthier and more sustainable future.
        </p>
      </section>

      {/* The Problem */}
      <section className={`${styles.section} space-y-4`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          The Problem We Address
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-4xl">
          Rapid urbanization, deforestation, and climate change have led to
          declining air quality and shrinking green cover. Despite this, access
          to transparent and localized environmental data remains limited, making
          it difficult to assess regional environmental health or take timely
          action.
        </p>
      </section>

      {/* Why Oxygen Intelligence */}
      <section className={`${styles.section} space-y-4`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          Why Oxygen Intelligence Matters
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-4xl">
          Oxygen-producing ecosystems such as forests, wetlands, and urban green
          spaces are vital for ecological balance. Tracking oxygen-related
          indicators helps measure ecosystem health, identify vulnerable regions,
          and support sustainable development planning.
        </p>
      </section>

      {/* Mission & Vision Grid */}
      <section className={`${styles.section} grid grid-cols-1 md:grid-cols-2 gap-8`}>
        <div className={`${styles.highlightCard} rounded-xl border border-gray-200 p-8`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Our Mission
          </h3>
          <p className="text-gray-600 leading-relaxed">
            To democratize access to environmental data and empower communities,
            researchers, and decision-makers to take meaningful, data-backed
            actions that protect and enhance oxygen-producing ecosystems.
          </p>
        </div>

        <div className={`${styles.highlightCard} rounded-xl border border-gray-200 p-8`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Our Vision
          </h3>
          <p className="text-gray-600 leading-relaxed">
            An India where environmental awareness is driven by transparency,
            participation, and responsible governance—resulting in resilient
            ecosystems and improved quality of life.
          </p>
        </div>
      </section>

      {/* What Vayura Offers */}
      <section className={`${styles.section} space-y-4`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          What Vayura Offers
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 max-w-4xl">
          <li className={styles.featureItem}>• District-level environmental intelligence</li>
          <li className={styles.featureItem}>• Interactive dashboards and analytics</li>
          <li className={styles.featureItem}>• State-wise environmental leaderboards</li>
          <li className={styles.featureItem}>• Carbon and CO₂ impact calculators</li>
          <li className={styles.featureItem}>• Transparent data sources and methodology</li>
        </ul>
      </section>

      {/* Key Focus Areas */}
      <section className={`${styles.section} ${styles.gradientBox} rounded-2xl p-10 space-y-6`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          Key Focus Areas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
          <div className={`${styles.highlightCard} p-4 rounded-lg bg-white border`}>
            🌱 Environmental sustainability & green cover
          </div>
          <div className={`${styles.highlightCard} p-4 rounded-lg bg-white border`}>
            📊 District-level data transparency
          </div>
          <div className={`${styles.highlightCard} p-4 rounded-lg bg-white border`}>
            🧠 Data-driven policy insights
          </div>
          <div className={`${styles.highlightCard} p-4 rounded-lg bg-white border`}>
            🤝 Community participation & awareness
          </div>
        </div>
      </section>

      {/* Who It Is For */}
      <section className={`${styles.section} space-y-4`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          Who Is Vayura For?
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-4xl">
          Vayura is designed for students, educators, environmental researchers,
          policymakers, sustainability advocates, and citizens who want to
          understand environmental conditions and contribute to positive change.
        </p>
      </section>

      {/* Data & Transparency */}
      <section className={`${styles.section} space-y-4`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          Data & Transparency
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-4xl">
          Transparency is a core principle of Vayura. All data sources,
          methodologies, and calculations are documented clearly to ensure trust,
          reproducibility, and responsible interpretation of insights.
        </p>
      </section>

      {/* Community & Impact */}
      <section className={`${styles.section} space-y-4`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          Community & Impact
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-4xl">
          Beyond data, Vayura promotes community involvement through initiatives
          such as tree plantation drives, awareness programs, and citizen
          feedback—because meaningful impact is achieved collectively.
        </p>
      </section>

      {/* Looking Ahead */}
      <section className={`${styles.section} space-y-4`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          Looking Ahead
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-4xl">
          As Vayura evolves, our focus remains on expanding reliable data
          coverage, enhancing analytical depth, and strengthening collaboration
          between citizens, researchers, and institutions—making environmental
          intelligence actionable across India.
        </p>
      </section>

    </main>
  );
}
