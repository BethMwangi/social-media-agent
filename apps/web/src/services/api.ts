const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getOrganization(slug: string) {
  const response = await fetch(
    `${API_URL}/organizations/${slug}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch organization");
  }

  return response.json();
}