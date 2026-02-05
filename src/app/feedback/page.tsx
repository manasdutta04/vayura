'use client';

import { useState } from 'react';
import styles from './feedback.module.css';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!message.trim()) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setShowThankYou(true);
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">

      {/* Heading */}
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Share Your <span className="text-green-600">Feedback</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Your feedback helps us improve Vayura. Share your thoughts,
          ideas, or concerns and help shape a greener future.
        </p>
      </section>

      {/* Feedback Form */}
      <section
        className={`${styles.card} max-w-3xl bg-white border border-gray-200 rounded-2xl p-10`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={`${styles.input} w-full rounded-md border px-4 py-2 text-sm focus:outline-none
                ${errors.name
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-green-500'}`}
            />
            {errors.name && (
              <p className={`${styles.errorText} mt-1 text-sm text-red-600`}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`${styles.input} w-full rounded-md border px-4 py-2 text-sm focus:outline-none
                ${errors.email
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-green-500'}`}
            />
            {errors.email && (
              <p className={`${styles.errorText} mt-1 text-sm text-red-600`}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Type
            </label>
            <select
              className={`${styles.input} w-full rounded-md border border-gray-300 px-4 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option>General Feedback</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Data Concern</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Message
            </label>
            <textarea
              rows={5}
              placeholder="Write your feedback here..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrors((prev) => ({ ...prev, message: undefined }));
              }}
              className={`${styles.input} w-full rounded-md border px-4 py-2 text-sm focus:outline-none
                ${errors.message
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-green-500'}`}
            />
            {errors.message && (
              <p className={`${styles.errorText} mt-1 text-sm text-red-600`}>
                {errors.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`${styles.submitBtn} inline-flex items-center justify-center rounded-md
              bg-green-600 px-8 py-3 text-sm font-medium text-white hover:bg-green-700`}
          >
            Submit Feedback
          </button>

        </form>
      </section>

      {/* Note */}
      <section>
        <p className="text-sm text-gray-500 max-w-3xl">
          Note: This form currently collects feedback for review purposes.
          Backend integration can be added in future updates.
        </p>
      </section>

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`${styles.modal} bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl`}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Thank You, {name} 🌱
            </h2>
            <p className="text-gray-600 mb-6">
              We appreciate you taking the time to share your feedback.
              Your input helps us make Vayura better.
            </p>
            <button
              onClick={() => setShowThankYou(false)}
              className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white
                         hover:bg-green-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </main>
  );
}