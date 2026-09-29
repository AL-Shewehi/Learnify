"use client"

import { useMutation } from "@tanstack/react-query"
import type { LoginInput } from "@learnify/shared"
import { authApi } from "../api/auth-api"
import { useAuthStore } from "../store/auth-store"

export function useLogin() {
    const setUser = useAuthStore((state) => state.setUser)

    return useMutation({
        mutationFn: (input: LoginInput) => authApi.login(input),
        onSuccess: (user) => {
            setUser(user)
        },
    })
} 