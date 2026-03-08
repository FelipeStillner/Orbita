export const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        throw new Error("No auth token found");
    }
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    } as const;
};