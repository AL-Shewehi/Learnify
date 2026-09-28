import ApiError from "./ApiError";

export const getRouteParam = (param: string | string[] | undefined): string => {
  if (!param || typeof param !== "string") {
    throw new ApiError("Invalid route parameter", 400);
  }
  return param;
};