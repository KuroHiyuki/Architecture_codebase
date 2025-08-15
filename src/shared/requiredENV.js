export const requiredENV = () => {
    const required = ["MONGODB_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length) {
        console.error(`Missing required environment variables: ${missing.join(", ")}`);
        process.exit(1);
    }
}
