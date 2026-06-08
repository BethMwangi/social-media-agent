const API_URL =
  "http://localhost:8000/api/v1";

export async function getBrandSettings(
  organizationId: string
) {
  const response = await fetch(
    `${API_URL}/brand-settings/${organizationId}`
  );

  return response.json();
}

export async function updateBrandSettings(
  organizationId: string,
  payload: any
) {
  const response = await fetch(
    `${API_URL}/brand-settings/${organizationId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return response.json();
}