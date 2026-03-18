export const metadata = {
    title: "Reviews | Kira Sushi & Poke | 5-Star Sushi Chester-le-Street",
    description: "Read customer reviews for Kira Sushi & Poke in Chester-le-Street, County Durham. See why locals love our fresh sushi, Kira Rolls, poke bowls, and chicken katsu curry. 5-star ratings on Facebook and TripAdvisor.",
    keywords: "kira sushi reviews, sushi chester-le-street reviews, customer testimonials, best sushi county durham, 5 star sushi, poke bowl reviews, japanese restaurant reviews chester-le-street, fresh sushi reviews, kira rolls, salmon teriyaki reviews",
    openGraph: {
        title: "Loved by Locals | Kira Sushi and Poke Reviews",
        description: "Our customers rave about our fresh sushi, generous portions, and friendly service. See real posts from social media and customer testimonials.",
        images: [
            {
                url: "/kira-sushi-and-poke-logo.png",
                width: 1200,
                height: 630,
                alt: "Kira Sushi and Poke Reviews"
            }
        ],
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Loved by Locals | Kira Sushi and Poke Reviews",
        description: "Our customers rave about our fresh sushi, generous portions, and friendly service."
    }
};

export default function ReviewsLayout({ children }) {
    return children;
}
