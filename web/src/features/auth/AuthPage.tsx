import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSuccess = (res: CredentialResponse) => {
        if (res.credential) {
            login(res.credential);
            navigate("/");
        }
    };

    return (
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a" }}>
            <div style={{ textAlign: "center", color: "white" }}>
                <h1>Welcome to Orbita</h1>
                <p>Please sign in to continue</p>
                <GoogleLogin onSuccess={handleSuccess} theme="filled_blue" shape="pill" />
            </div>
        </div>
    );
}