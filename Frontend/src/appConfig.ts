const apiUrl = import.meta.env.VITE_API_URL ?? (
    import.meta.env.DEV
        ? 'http://localhost:1285'
        : 'https://projeto-muatfit-main-1.onrender.com'
);

export const appConfig = {
    render_url: apiUrl,
    uploads_url: `${apiUrl}/uploads`
};