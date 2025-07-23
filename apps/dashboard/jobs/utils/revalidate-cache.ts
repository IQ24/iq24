export async function revalidateCache({
  tag,
  id,
}: {
  tag: string;
  id: string;
}) {
  return fetch(
    `${process.env.iq24_PUBLIC_APP_URL}/api/webhook/cache/revalidate`,
    {
      headers: {
        Authorization: `Bearer ${process.env.iq24_CACHE_API_SECRET}`,
      },
      method: "POST",
      body: JSON.stringify({ tag, id }),
    },
  );
}
