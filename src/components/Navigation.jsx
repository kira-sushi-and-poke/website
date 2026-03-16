"use client";
import React from "react";
import { usePathname } from "next/navigation";

const Navigation = () => {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/menu", label: "Menu" },
        { href: "/about", label: "About" }
    ];

    return (
        <nav>
            <ul className="list-none flex gap-5 p-0 m-0">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.href}>
                            <a 
                                href={item.href} 
                                className={`font-bold transition-colors ${
                                    isActive 
                                        ? 'text-white bg-yellow px-4 py-2 rounded-lg' 
                                        : 'text-yellow hover:text-white'
                                }`}
                            >
                                {item.label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Navigation;
