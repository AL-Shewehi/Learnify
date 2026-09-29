"use client"

import { useMutation } from "@tanstack/react-query"
import type { SignupInput } from "@learnify/shared"
import { authApi } from "../api/auth-api"
import { useAuthStore } from "../store/auth-store"

export function useSignup() {
    const setUser = useAuthStore((state) => state.setUser)

    return useMutation({
        mutationFn: (input: SignupInput) => authApi.signup(input),
        onSuccess: (user) => {
            setUser(user)
        }
    })
}