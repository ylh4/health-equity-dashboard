export function validateEnv() {
    // Add your environment variable validation logic here
    const requiredEnvVars: string[] = [
      // List your required env variables here
      // e.g., 'NEXT_PUBLIC_API_URL'
    ];
  
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  }