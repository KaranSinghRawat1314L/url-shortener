export default function ResultCard({ shortUrl }) {
  return (
    <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-center">
      <p className="text-slate-600 mb-2 text-sm font-medium">Short URL</p>

      <a
        href={shortUrl}
        target="_blank"
        rel="noreferrer"
        className="text-indigo-600 font-semibold break-all hover:underline"
      >
        {shortUrl}
      </a>

      <button
        onClick={() => navigator.clipboard.writeText(shortUrl)}
        className="block mx-auto mt-4 text-sm text-indigo-500 hover:text-indigo-700"
      >
        Copy to clipboard
      </button>
    </div>
  );
}
