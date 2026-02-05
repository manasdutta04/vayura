import styles from './contact.module.css';

export default function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">

      {/* Hero Section */}
      <section className={`${styles.section} space-y-6`}>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Contact <span className="text-green-600">Vayura</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Have questions, suggestions, or want to collaborate with us?
          We’d love to hear from you and explore how we can work together
          for a greener future.
        </p>
      </section>

      {/* Contact Cards */}
      <section className={`${styles.section} grid grid-cols-1 md:grid-cols-3 gap-8`}>

        <div className={`${styles.card} bg-white rounded-xl border border-gray-200 p-8`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Email Us
          </h3>
          <p className="text-gray-600 mb-2">
            Reach out to us directly via email for any queries or feedback.
          </p>
          <p className="text-green-600 font-medium">
            contact@vayura.in
          </p>
        </div>

        <div className={`${styles.card} bg-white rounded-xl border border-gray-200 p-8`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Visit Online
          </h3>
          <p className="text-gray-600 mb-2">
            Learn more about our work, updates, and initiatives on our website.
          </p>
          <p className="text-green-600 font-medium">
            www.vayura.in
          </p>
        </div>

        <div className={`${styles.card} bg-white rounded-xl border border-gray-200 p-8`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Our Location
          </h3>
          <p className="text-gray-600 mb-2">
            We are proudly based in India, working on nationwide
            environmental intelligence initiatives.
          </p>
          <p className="text-green-600 font-medium">
            India
          </p>
        </div>

      </section>

      {/* Why Reach Out */}
      <section className={`${styles.section} space-y-4`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          Why Reach Out?
        </h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 max-w-4xl">
          <li className="hover:text-green-600 transition">
            • General questions about the platform
          </li>
          <li className="hover:text-green-600 transition">
            • Feedback or feature suggestions
          </li>
          <li className="hover:text-green-600 transition">
            • Research or data collaboration
          </li>
          <li className="hover:text-green-600 transition">
            • Environmental initiatives and partnerships
          </li>
        </ul>
      </section>

      {/* Highlight Section */}
      <section className={`${styles.section} ${styles.gradientBox} p-10 space-y-4`}>
        <h2 className="text-2xl font-semibold text-gray-900">
          Let’s Build a Greener Future Together
        </h2>
        <p className="text-gray-600 max-w-4xl">
          Whether you’re a student, researcher, policymaker, or concerned
          citizen, your ideas and feedback matter. Vayura thrives on
          collaboration and shared responsibility toward environmental
          sustainability.
        </p>
      </section>

    </main>
  );
}
