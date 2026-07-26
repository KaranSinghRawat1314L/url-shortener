import { useState } from "react";

export default function UrlForm({ onSubmit, loading }) {
  const [days, setDays] = useState("1");
  const [hours, setHours] = useState("0");

  const handleSubmit = (e) => {
    e.preventDefault();
    const longURL = e.target.url.value.trim();
    if (!longURL) return;

    const expiresIn = `${days} ${parseFloat(hours) || 0}`;
    onSubmit(longURL, expiresIn);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <input
        name="url"
        type="url"
        placeholder="Paste your long URL here"
        required
        className="w-full px-5 py-4 border border-slate-300 rounded-2xl
                   focus:outline-none focus:ring-4 focus:ring-indigo-500/30
                   transition"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Days
          </label>
          <input
            type="number"
            min="0"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl
                       focus:ring-4 focus:ring-indigo-500/30 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Hours (decimal allowed)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl
                       focus:ring-4 focus:ring-indigo-500/30 transition"
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full py-4 rounded-2xl font-semibold text-white
                   bg-gradient-to-r from-indigo-500 to-purple-600
                   hover:from-indigo-600 hover:to-purple-700
                   active:scale-[0.98] transition-all duration-200
                   shadow-lg shadow-indigo-500/30
                   disabled:opacity-60"
      >
        {loading ? "Shortening..." : "Shorten URL"}
      </button>
    </form>
  );
}
