import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "YOUR_PROJECT_ID",
  dataset: "production",
  apiVersion: "2023-10-01",
  token: "YOUR_API_TOKEN",
  useCdn: false
});

export default client