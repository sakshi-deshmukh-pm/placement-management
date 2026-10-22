
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
    id: number;
    email: string;
    role: string;
    name?: string;
    isActive?: boolean;
    rollNumber?: string | null;
    branch?: string | null;
    year?: string | null;
};

type AuthState = {
    token: string | null;
    user: AuthUser | null;
};

function getSavedUser(): AuthUser | null {
    if (typeof localStorage === "undefined") {
        return null;
    }

    try {
        const saved = localStorage.getItem("user");
        return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
        return null;
    }
}

const initialState: AuthState = {
    token:
        typeof localStorage !== "undefined"
            ? localStorage.getItem("token")
            : null,
    user: getSavedUser(),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ token: string; user: AuthUser }>,
        ) => {
            state.token = action.payload.token;
            state.user = action.payload.user;

            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },

        setUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },

        logout: (state) => {
            state.token = null;
            state.user = null;

            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
    },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
