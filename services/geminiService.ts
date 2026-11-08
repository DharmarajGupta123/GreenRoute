import { RouteEstimation } from "../types";

export const getRouteDetails = async (origin: string, destination: string): Promise<RouteEstimation> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("/api/route-estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ origin, destination }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Unable to estimate route impact. Please try again.");
    }

    const data = await response.json();
    return data as RouteEstimation;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error("Route estimation request took too long. Please try again.");
    }
    throw err;
  }
};