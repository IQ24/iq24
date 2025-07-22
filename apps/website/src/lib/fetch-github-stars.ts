"use server";

export async function fetchGithubStars() {
  const response = await fetch("https://api.github.com/repos/iq24-ai/iq24", {
    next: {
      revalidate: 3600,
    },
  });

  return response.json();
}
