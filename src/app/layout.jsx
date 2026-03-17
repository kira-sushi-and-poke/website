import React from "react";
import "./globals.css";
import OpeningHoursChat from "../components/OpeningHoursChat";
import Navigation from "../components/Navigation";
import Breadcrumbs from "../components/Breadcrumbs";
import restaurantInfo from "../data/restaurant-info";

export const metadata = {
    title: {
        default: "Kira Sushi and Poke | Fresh Japanese Sushi & Poke Bowls in London",
        template: "%s | Kira Sushi and Poke"
    },
    description: "Authentic Japanese sushi and poke bowls made fresh daily with premium ingredients. Order online for delivery or pickup in London.",
    keywords: restaurantInfo.keywords.join(", "),
    authors: [{ name: "Kira Sushi and Poke" }],
    icons: {
        icon: "/kira-logo.jpg",
    },
    metadataBase: new URL(restaurantInfo.url),
    openGraph: {
        type: "website",
        locale: "en_GB",
        url: restaurantInfo.url,
        siteName: restaurantInfo.name,
        title: "Kira Sushi and Poke | Fresh Japanese Sushi & Poke Bowls",
        description: restaurantInfo.description,
        images: [
            {
                url: restaurantInfo.logo,
                width: 1200,
                height: 630,
                alt: "Kira Sushi and Poke Logo"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Kira Sushi and Poke | Fresh Japanese Sushi & Poke Bowls",
        description: restaurantInfo.description,
        images: [restaurantInfo.logo]
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        }
    }
};

const Layout = ({ children }) => {
    // Generate structured data for Restaurant
    const restaurantSchema = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": restaurantInfo.name,
        "image": restaurantInfo.logo,
        "description": restaurantInfo.description,
        "servesCuisine": restaurantInfo.cuisine,
        "priceRange": restaurantInfo.priceRange,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": restaurantInfo.address.streetAddress,
            "addressLocality": restaurantInfo.address.addressLocality,
            "addressRegion": restaurantInfo.address.addressRegion,
            "postalCode": restaurantInfo.address.postalCode,
            "addressCountry": restaurantInfo.address.addressCountry
        },
        "openingHoursSpecification": restaurantInfo.openingHours.map(hours => ({
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": hours.split(' ')[0],
            "opens": hours.split(' ')[1].split('-')[0],
            "closes": hours.split(' ')[1].split('-')[1]
        })),
        "url": restaurantInfo.url,
        "logo": restaurantInfo.logo,
        "sameAs": [
            restaurantInfo.socialMedia.facebook,
            restaurantInfo.socialMedia.instagram
        ]
    };

    return (
        <html lang="en">
            <head>
                <link 
                    rel="stylesheet" 
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
                    integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
                <link rel="canonical" href={restaurantInfo.url} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(restaurantSchema)
                    }}
                />
            </head>
            <body>
                <header className="bg-hot-pink text-white p-5">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center">
                            <img 
                                src="/kira-sushi-and-poke-logo.png" 
                                alt="Kira Sushi and Poke Logo"
                                className="h-25 w-auto"
                            />
                        </div>
                        <Navigation />
                    </div>
                </header>
                <Breadcrumbs />
                <main>{children}</main>
                <OpeningHoursChat />
                <footer className="bg-gray-800 text-white py-8">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Address */}
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-yellow">Location</h3>
                                <address className="not-italic text-gray-300">
                                    {restaurantInfo.address.streetAddress}<br />
                                    {restaurantInfo.address.addressLocality}<br />
                                    {restaurantInfo.address.postalCode}<br />
                                    United Kingdom
                                </address>
                            </div>

                            {/* Opening Hours */}
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-yellow">Hours</h3>
                                <p className="text-gray-300">Monday - Sunday<br />11:00 AM - 7:00 PM</p>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-yellow">Follow Us</h3>
                                <div className="flex gap-4">
                                    <a 
                                        href={restaurantInfo.socialMedia.facebook} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-yellow transition-colors text-2xl"
                                        aria-label="Facebook"
                                    >
                                        <i className="fab fa-facebook"></i>
                                    </a>
                                    <a 
                                        href={restaurantInfo.socialMedia.instagram} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-yellow transition-colors text-2xl"
                                        aria-label="Instagram"
                                    >
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
                            <p>&copy; {new Date().getFullYear()} Kira Sushi and Poke. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
};

export default Layout;
