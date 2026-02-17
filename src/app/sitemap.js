export default function sitemap() {
    return [
        { url: 'https://webothplay.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: 'https://webothplay.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: 'https://webothplay.com/commands', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: 'https://webothplay.com/upgrade', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
        { url: 'https://webothplay.com/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: 'https://webothplay.com/terms', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: 'https://webothplay.com/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: 'https://webothplay.com/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ]
}
