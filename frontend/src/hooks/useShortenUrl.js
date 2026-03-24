import { useState } from "react";
import { shortenUrl } from "../api/shortenerApi";

export function useShortenUrl() {
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (longUrl, expiresIn) => {
    setLoading(true);
    setError("");
    setShortUrl("");

    try {
      const result = await shortenUrl(longUrl, expiresIn);
      setShortUrl(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { shortUrl, loading, error, submit };
}
