import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

// Client safe config
export const config = createClient({
    projectId: "s6cp4kz0",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
});

export const client = config;

// Admin level client, used for backend
// Admin client for mutations
const adminConfig = createClient({
    projectId: "s6cp4kz0",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

export const adminClient = adminConfig;

const builder = imageUrlBuilder(client);

export const urlFor = (source: string) => {
    return builder.image(source);
};