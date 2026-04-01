"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Navigation = () => {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/menu", label: "Menu" },
        { href: "/contact", label: "Contact" },
        { href: "/faq", label: "FAQ" }
    ];

    return (
        <nav>
            <ul className="list-none flex flex-wrap justify-center gap-y-3 gap-x-2 md:gap-x-3 p-0 m-0">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.href}>
                            <Link 
                                href={item.href} 
                                className={`font-heading font-semibold transition-all duration-300 px-4 py-2.5 rounded-full text-sm md:text-base min-h-[44px] inline-flex items-center justify-center border-2 ${
                                    isActive 
                                        ? "bg-yellow text-white border-yellow shadow-md active:scale-95" 
                                        : "bg-white text-hot-pink border-hot-pink/20 shadow-sm active:scale-95 active:shadow-sm md:hover:border-hot-pink md:hover:shadow-md md:hover:-translate-y-0.5"
                                }`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
                
                {/* Order/Basket Icon - Hidden for testing */}
                {/* Uncomment when ready to launch ordering feature
                <li>
                    <Link 
                        href="/menu/order"
                        className={`font-heading font-semibold transition-all duration-300 px-5 py-3 rounded-lg flex items-center gap-2 min-h-[44px] ${
                            pathname?.startsWith("/menu/order")
                                ? "bg-yellow text-white shadow-md active:scale-95" 
                                : "bg-white text-hot-pink shadow-soft active:scale-95 active:shadow-sm md:hover:shadow-soft-lg md:hover:-translate-y-0.5"
                        }`}
                        title="Order Online"
                    >
                        <i className="fas fa-shopping-basket"></i>
                        <span>Order</span>
                    </Link>
                </li>
                */}
            </ul>
        </nav>
    );
};

export default Navigation;
