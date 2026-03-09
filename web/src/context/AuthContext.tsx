import { GoogleOAuthProvider } from "@react-oauth/google";
import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("auth_token"));

    const login = (token: string) => {
        localStorage.setItem("auth_token", token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        setIsAuthenticated(false);
    };

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
                {children}
            </AuthContext.Provider>
        </GoogleOAuthProvider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};