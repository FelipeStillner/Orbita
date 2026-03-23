export const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        // Guest mode: no Authorization header.
        // Protected endpoints will still return 401.
        return {};
    }
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    } as const;
};