import UrlForm from "./components/UrlForm";
import ResultCard from "./components/ResultCard";
import ErrorMessage from "./components/ErrorMessage";
import { useShortenUrl } from "./hooks/useShortenUrl";

export default function App() {
  const { shortUrl, loading, error, submit } = useShortenUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-green-500 to-slate-700
                    flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-xl
                      rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                      p-10">
        <h1 className="text-4xl font-bold text-center tracking-tight">
          🔗 <span className="text-green-700">URL</span> <span className="text-indigo-500">Shortener</span>
        </h1>

        <p className="text-center text-slate-500 mt-2 text-sm">
          Fast • Scalable • Reliable • built by Karan Singh Rawat
        </p>

        <UrlForm onSubmit={submit} loading={loading} />
        <ErrorMessage message={error} />
        {shortUrl && <ResultCard shortUrl={shortUrl} />}
      </div>
    </div>
  );
}
