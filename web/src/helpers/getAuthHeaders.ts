export const getAuthHeaders = () => {
    const googleToken = localStorage.getItem("auth_token");
    if (!googleToken) {
        throw new Error("No Google token found");
    }
    return {
        Authorization: `Bearer ${googleToken}`,
        "Content-Type": "application/json",
    } as const;
};