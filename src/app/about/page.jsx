import React from "react";
import AboutUs from "@/components/AboutUs";

export const metadata = {
    title: "About | Kira Sushi & Poke | Authentic Japanese Chester-le-Street",
    description: "Meet Chef Radori, a master sushi chef with over 10 years of experience. Discover the story behind Kira Sushi & Poke, Chester-le-Street's premier Japanese restaurant serving fresh sashimi, bluefin tuna, and authentic poke bowls.",
    keywords: "Chef Radori, master sushi chef, Japanese restaurant Chester-le-Street, authentic sushi County Durham, fresh sashimi, bluefin tuna, poke bowls, Japanese cuisine North East England",
    openGraph: {
        title: "About Chef Radori & Kira Sushi - Authentic Japanese in Chester-le-Street",
        description: "Meet Chef Radori, master sushi chef with 10+ years experience. Fresh, authentic Japanese cuisine made with premium ingredients in Chester-le-Street.",
        type: "website",
        locale: "en_GB",
    },
    twitter: {
        card: "summary_large_image",
        title: "About Chef Radori & Kira Sushi",
        description: "Master sushi chef serving authentic Japanese cuisine in Chester-le-Street",
    },
    alternates: {
        canonical: "/about",
    },
};

const AboutPage = () => {
    // Restaurant Schema for SEO
    const restaurantSchema = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": "Kira Sushi & Poke",
        "servesCuisine": ["Japanese", "Sushi", "Poke Bowl", "Asian"],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Chester-le-Street",
            "addressRegion": "County Durham",
            "addressCountry": "GB"
        },
        "priceRange": "££",
        "hasMenu": {
            "@type": "Menu",
            "hasMenuSection": [
                {"@type": "MenuSection", "name": "Sushi"},
                {"@type": "MenuSection", "name": "Poke Bowls"},
                {"@type": "MenuSection", "name": "Hot Dishes"}
            ]
        },
        "founder": {
            "@type": "Person",
            "name": "Chef Radori",
            "jobTitle": "Head Chef & Owner",
            "alumniOf": "10+ years sushi chef experience"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(restaurantSchema)
                }}
            />
            <div className="p-5">
                <AboutUs />
            </div>
        </>
    );
};

export default AboutPage;
