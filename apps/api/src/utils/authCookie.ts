import type {Response} from "express";

export const AUTH_COOKIE_NAME = "learnify_token";

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: "/",
})

export const setAuthCookie = (res: Response, token: string): void => {
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
}

export const clearAuthCookie = (res: Response): void => {
    res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
    });
}