"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Breadcrumbs = () => {
    const pathname = usePathname();
    
    // Don't show breadcrumbs on home page
    if (pathname === "/") return null;

    // Generate breadcrumb items
    const pathSegments = pathname.split("/").filter(segment => segment);
    
    const breadcrumbs = [
        { label: "Home", href: "/" },
        ...pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");
            const label = segment.charAt(0).toUpperCase() + segment.slice(1);
            return { label, href };
        })
    ];

    // Generate Breadcrumb Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.label,
            "item": `https://kirasushi.co.uk${crumb.href}`
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema)
                }}
            />
            <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200 py-3.5 px-4 md:px-10">
                <ol className="flex items-center gap-2 text-sm max-w-7xl mx-auto flex-wrap">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return (
                            <li key={crumb.href} className="flex items-center gap-2">
                                {!isLast ? (
                                    <>
                                        <Link 
                                            href={crumb.href}
                                            className="text-gray-600 hover:text-hot-pink transition-colors"
                                        >
                                            {crumb.label}
                                        </Link>
                                        <span className="text-gray-400">/</span>
                                    </>
                                ) : (
                                    <span className="text-gray-900 font-semibold">
                                        {crumb.label}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
};

export default Breadcrumbs;
