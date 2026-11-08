import { RouteEstimation } from "../types";

export const getRouteDetails = async (origin: string, destination: string): Promise<RouteEstimation> => {
  const response = await fetch("/api/route-estimate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ origin, destination }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to estimate route impact. Please ensure your search terms are recognizable places.");
  }

  return data as RouteEstimation;
};