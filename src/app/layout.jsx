import React from "react";
import "./globals.css";
import OpeningHoursChat from "../components/OpeningHoursChat";
import Navigation from "../components/Navigation";
import Breadcrumbs from "../components/Breadcrumbs";
import restaurantInfo from "../data/restaurant-info";
import { getLocationData } from "../lib/getLocationData";
import { checkRestaurantStatus } from "../lib/checkRestaurantStatus";
import Image from "next/image";
import KiraLogo from "../../public/kira-sushi-and-poke-logo.png";
import Link from "next/link";
import { Inter, Poppins } from "next/font/google";

// Revalidate every 3 minutes to keep opening hours fresh
export const revalidate = 180;

// Configure Google Fonts
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata = {
    title: {
        default: "Kira Sushi and Poke | Fresh Japanese Sushi & Poke Bowls in Chester-le-Street",
        template: "%s | Kira Sushi and Poke"
    },
    description: "Authentic Japanese sushi and poke bowls made fresh daily with premium ingredients. Order online for pickup in Chester-le-Street.",
    keywords: restaurantInfo.keywords.join(", "),
    authors: [{ name: "Kira Sushi and Poke" }],
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: "/apple-touch-icon.png",
        shortcut: "/favicon.ico",
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
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        }
    }
};

const Layout = async ({ children }) => {
    // Fetch opening hours from Square API (with internal fallback handling)
    const { openingHours, openingHoursSchema, openingHoursText, isFallback, mobileLocationData } = await getLocationData();
    const restaurantStatus = checkRestaurantStatus(openingHours, mobileLocationData, isFallback);

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
        "openingHoursSpecification": openingHoursSchema.map(hours => ({
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": hours.split(" ")[0],
            "opens": hours.split(" ")[1].split("-")[0],
            "closes": hours.split(" ")[1].split("-")[1]
        })),
        "url": restaurantInfo.url,
        "logo": restaurantInfo.logo,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": "5"
        },
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
                <meta name="google-site-verification" content="sU2-OcfYsD2h1pvrh84bZRnCNvYd-5W_5IK_2xQhl4A" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(restaurantSchema)
                    }}
                />
            </head>
            <body suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
                <header className="bg-hot-pink text-white p-4 md:p-5 shadow-md">
                    <div className="flex flex-col items-center gap-4 md:gap-5">
                        <div className="flex items-center">
                            <Image 
                                src={KiraLogo} 
                                alt="Kira Sushi and Poke Logo"
                                className="w-auto"
                                priority
                                loading="eager"
                            />
                        </div>
                        <Navigation />
                    </div>
                </header>
                <Breadcrumbs />
                
                <main>{children}</main>

                <OpeningHoursChat openingHours={openingHours} isFallback={isFallback} restaurantStatus={restaurantStatus} />
                <footer className="bg-gray-800 text-white py-8">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                                <p className="text-gray-300">{openingHoursText.days}<br />{openingHoursText.times}</p>
                            </div>

                            {/* Links */}
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-yellow">Links</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/" className="text-gray-300 hover:text-yellow transition-colors">Home</Link></li>
                                    <li><Link href="/menu" className="text-gray-300 hover:text-yellow transition-colors">Menu</Link></li>
                                    <li><Link href="/about" className="text-gray-300 hover:text-yellow transition-colors">About</Link></li>
                                    <li><Link href="/reviews" className="text-gray-300 hover:text-yellow transition-colors">Reviews</Link></li>
                                    <li><Link href="/contact" className="text-gray-300 hover:text-yellow transition-colors">Contact</Link></li>
                                    <li><Link href="/faq" className="text-gray-300 hover:text-yellow transition-colors">FAQ</Link></li>
                                </ul>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-yellow">Follow us</h3>
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
