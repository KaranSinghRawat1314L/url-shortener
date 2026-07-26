export async function shortenUrl(longUrl, expiresIn) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shortener`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ longURL: longUrl, expiresIn }) // ✅ sends "1 0" format
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to shorten URL");
  }

  return data.shortUrl;
}
