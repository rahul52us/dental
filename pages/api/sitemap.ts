import { NextApiRequest, NextApiResponse } from "next";

const baseUrl = "https://www.metamindhealth.com";

// 1. STATIC PAGES
const staticPages = [
  "/",
  "/therapist",
  "/contact-us",
  "/about-us",
  "/blogs"
];

// 2. BLOG PAGES
const blogPages = [
  "/blogs/how-to-choose-the-right-therapist-for-your-mental-health",
  "/blogs/how-to-know-when-you-need-professional-mental-health-support",
  "/blogs/what-happens-during-your-first-therapy-session",
  "/blogs/clinical-psychologist-role-in-mental-health-treatment",
  "/blogs/common-mental-health-conditions-in-india",
  "/blogs/benefits-of-psychotherapy-for-anxiety-and-stress",
  "/blogs/difference-between-psychologist-and-psychiatrist"
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const allPages = [...staticPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allPages
      .map(
        (page) => `
    <url>
      <loc>${baseUrl}${page}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
      )
      .join("")}
  </urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(sitemap);
}
