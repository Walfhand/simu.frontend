import { FILTER_BACKEND } from "@/services/httpClientBackend";
import { SimulationResult } from "@/types/simulation";
import { NextRequest, NextResponse } from "next/server";
import { withGlobalMiddleware } from "../middleware";

async function handleGet(request: NextRequest) {
  const params = request.nextUrl.searchParams.entries();
  console.log("Base endpoint", process.env.FRONTEND_PUBLIC_API_URL);
  console.log("GetEndpoint");
  const queryParams: Record<string, string[]> = {};

  for (const [key, value] of params) {
    if (!queryParams[key]) {
      queryParams[key] = [];
    }
    queryParams[key].push(value);
  }
  var response = await FILTER_BACKEND<SimulationResult>(
    `/simulations`,
    queryParams
  );
  return NextResponse.json(response);
}

export const { GET } = await withGlobalMiddleware({
  GET: handleGet,
});
