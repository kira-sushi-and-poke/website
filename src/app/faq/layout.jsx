export const metadata = {
    title: "FAQ | Kira Sushi & Poke | Gluten-Free & Vegan Options",
    description: "Get answers about Kira Sushi and Poke's gluten-free sashimi, vegan poke bowls, opening hours, allergen info, parking, and payment options. Fresh sushi in Chester-le-Street, County Durham.",
    keywords: "kira sushi faq, gluten free sushi, vegan poke bowl, sushi restaurant chester-le-street, allergen information, sushi opening hours, fresh sashimi",
    openGraph: {
        title: "FAQ - Your Questions About Kira Sushi Answered",
        description: "Find answers about gluten-free options, vegan dishes, allergens, opening hours, parking, and more at Kira Sushi and Poke in Chester-le-Street.",
        type: "website",
        locale: "en_GB",
    },
    twitter: {
        card: "summary",
        title: "FAQ - Kira Sushi and Poke",
        description: "Questions about gluten-free, vegan options, and more? Find all your answers here.",
    },
    alternates: {
        canonical: "/faq",
    },
};

export default function FAQLayout({ children }) {
    return children;
}
