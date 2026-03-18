"use client";
import React from "react";
import Link from "next/link";

const ReviewsPage = () => {
    const reviews = {
        google: [],
        facebook: [
            {
                id: 8,
                name: "Craig Birkett",
                rating: 5,
                comment: "High quality sushi made to order. Their signature Kira Rolls were phenomenal and the Salmon Teriyaki bowl a generous portion. Super fresh ingredients and friendly staff. Makes the high street a better place! Hope it succeeds.",
                date: "Mar 2026",
                platform: "facebook"
            },
            {
                id: 9,
                name: "Caroline Jones",
                rating: 5,
                comment: "We had the chicken katsu and the chicken dumplings. It was totes delish and generous portions, 10/10!",
                date: "Mar 2026",
                platform: "facebook"
            },
            {
                id: 6,
                name: "Rosie Martin",
                rating: 5,
                comment: "Absolutely stunning sushi....I got Kira and best sushi I've ever tasted.....staff so welcoming and highly recommend to everyone x",
                date: "Jan 2026",
                platform: "facebook"
            },
            {
                id: 7,
                name: "Alana Chipchase",
                rating: 5,
                comment: "100% recommend the katsu chicken curry fresh ingredients super tasty 👌🏻 will be back again ! Xx",
                date: "Jan 2026",
                platform: "facebook"
            }
        ],
        tripadvisor: [
            {
                id: 5,
                name: "StevefromWashington",
                rating: 5,
                comment: "Excellent fresh sushi and very tasty chicken katsu curry. Top quality food at sensible prices.",
                date: "Feb 2026",
                platform: "tripadvisor"
            }
        ]
    };
    const allReviews = [...reviews.google, ...reviews.facebook, ...reviews.tripadvisor];

    const getPlatformIcon = (platform) => {
        switch(platform) {
            case "google": return "fa-google";
            case "facebook": return "fa-facebook";
            case "tripadvisor": return "fa-kiwi-bird";
            default: return "fa-star";
        }
    };

    const getPlatformColor = (platform) => {
        switch(platform) {
            case "google": return "text-blue-600";
            case "facebook": return "text-blue-700";
            case "tripadvisor": return "text-green-600";
            default: return "text-hot-pink";
        }
    };

    return (
        <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-hot-pink text-center">
                Reviews | Kira Sushi & Poke
            </h1>
            
            <p className="text-center text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
                5-star reviews from customers across Chester-le-Street and County Durham. See why locals love our fresh <Link href="/menu#sushi" className="text-hot-pink font-semibold hover:underline">sushi</Link>, <Link href="/menu#poke" className="text-hot-pink font-semibold hover:underline">poke bowls</Link>, and <Link href="/menu#hot" className="text-hot-pink font-semibold hover:underline">Japanese hot dishes</Link>.
            </p>

            {/* Facebook Post Embed Section */}
            <div className="mb-12 border-2 border-hot-pink rounded-lg p-6 md:p-8 bg-hot-pink/5">
                    <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-6 text-center">
                        <i className="fab fa-facebook"></i> Chester-le-Street Customer Posts & Photos
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        <div className="flex justify-center">
                            <div className="w-full max-w-lg">
                                <div className="relative w-full" style={{paddingBottom: '135%'}}>
                                    <iframe 
                                        src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fsabrinacorrinx%2Fposts%2Fpfbid0J6P2EVsLCEAL5Wb21DRyZD7ib7wGVJF79mEBuobuPVikZmgnD1sWVakY8BgBLgQRl&show_text=true&width=500" 
                                        className="absolute top-0 left-0 w-full h-full"
                                        style={{border: 'none', overflow: 'hidden'}} 
                                        scrolling="no" 
                                        frameBorder="0" 
                                        allowFullScreen={true} 
                                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                    ></iframe>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="w-full max-w-lg">
                                <div className="relative w-full" style={{paddingBottom: '85%'}}>
                                    <iframe 
                                        src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Frachel.s.brown.94%2Fposts%2Fpfbid036MtZbzgCpaWZJZrtZsAoTSJ9L3wiyi9npNDBV3AMbP2w1Rb1Md317RxgKfCSdZusl&show_text=true&width=500" 
                                        className="absolute top-0 left-0 w-full h-full"
                                        style={{border: 'none', overflow: 'hidden'}} 
                                        scrolling="no" 
                                        frameBorder="0" 
                                        allowFullScreen={true} 
                                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <div className="w-full max-w-lg">
                                <div className="relative w-full" style={{paddingBottom: '139%'}}>
                                    <iframe 
                                        src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fmelhunter83%2Fposts%2Fpfbid09ynzHy5N1XSjyqEUsCrvb9BFerBV7aDQNcJvta7SXaY2hHx3PEkY8nZyUfm4T4d8l&show_text=true&width=500" 
                                        className="absolute top-0 left-0 w-full h-full"
                                        style={{border: 'none', overflow: 'hidden'}} 
                                        scrolling="no" 
                                        frameBorder="0" 
                                        allowFullScreen={true} 
                                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                    ></iframe>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="w-full max-w-lg">
                                <div className="relative w-full" style={{paddingBottom: '140%'}}>
                                    <iframe 
                                        src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid02S4EDD86xzkfLiAg2DGvAJLsgY4PmqLQtVutaTvgEiaux5ggznabmmkPHdnk3sEaGl%26id%3D1539407347&show_text=true&width=500" 
                                        className="absolute top-0 left-0 w-full h-full"
                                        style={{border: 'none', overflow: 'hidden'}} 
                                        scrolling="no" 
                                        frameBorder="0" 
                                        allowFullScreen={true} 
                                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

            {/* Reviews Section */}
            <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-hot-pink mb-2">
                    5-Star Reviews from Chester-le-Street & County Durham
                </h2>
                <p className="text-gray-600">
                    <i className="fas fa-heart text-hot-pink"></i> What our customers are saying
                </p>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {allReviews.map(review => {
                    // Generate schema.org markup for each review
                    const reviewSchema = {
                        "@type": "Review",
                        "author": {
                            "@type": "Person",
                            "name": review.name
                        },
                        "reviewRating": {
                            "@type": "Rating",
                            "ratingValue": review.rating,
                            "bestRating": "5",
                            "worstRating": "1"
                        },
                        "reviewBody": review.comment,
                        "datePublished": review.date,
                        "publisher": {
                            "@type": "Organization",
                            "name": review.platform === "facebook" ? "Facebook" : review.platform === "tripadvisor" ? "TripAdvisor" : "Google"
                        }
                    };

                    // Enhanced comment with internal links
                    const enhanceCommentWithLinks = (comment) => {
                        const linkMap = {
                            "Kira Roll": "/menu#sushi",
                            "Salmon Teriyaki": "/menu#hot",
                            "chicken katsu": "/menu#hot",
                            "chicken dumplings": "/menu#solo",
                            "sushi": "/menu#sushi"
                        };

                        let enhancedComment = comment;
                        Object.entries(linkMap).forEach(([text, link]) => {
                            const regex = new RegExp(`(${text})`, 'gi');
                            if (regex.test(enhancedComment) && !enhancedComment.includes('</Link>')) {
                                enhancedComment = enhancedComment.replace(
                                    regex,
                                    `<Link href="${link}" className="text-hot-pink font-semibold hover:underline">$1</Link>`
                                );
                            }
                        });

                        return enhancedComment;
                    };

                    return (
                        <div key={review.id} className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                            <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify(reviewSchema)
                                }}
                            />
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-hot-pink">{review.name}</h3>
                                {review.platform === "tripadvisor" ? (
                                    <span className="text-sm font-semibold text-green-600">TripAdvisor</span>
                                ) : (
                                    <i className={`fab ${getPlatformIcon(review.platform)} ${getPlatformColor(review.platform)} text-xl`} aria-label={review.platform}></i>
                                )}
                            </div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex" role="img" aria-label={`${review.rating} out of 5 stars`}>
                                    {[...Array(review.rating)].map((_, i) => (
                                        <i key={i} className="fas fa-star text-yellow text-lg"></i>
                                    ))}
                                    {[...Array(5 - review.rating)].map((_, i) => (
                                        <i key={i} className="fas fa-star text-gray-300 text-lg"></i>
                                    ))}
                                </div>
                                <time className="text-xs text-gray-500" dateTime={review.date}>{review.date}</time>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {review.comment.includes("Kira") ? (
                                    <>
                                        {review.comment.substring(0, review.comment.indexOf("Kira"))}
                                        <Link href="/menu#sushi" className="text-hot-pink font-semibold hover:underline">
                                            Kira
                                        </Link>
                                        {review.comment.substring(review.comment.indexOf("Kira") + 4)}
                                    </>
                                ) : review.comment.includes("Salmon Teriyaki") ? (
                                    <>
                                        {review.comment.substring(0, review.comment.indexOf("Salmon Teriyaki"))}
                                        <Link href="/menu#hot" className="text-hot-pink font-semibold hover:underline">
                                            Salmon Teriyaki
                                        </Link>
                                        {review.comment.substring(review.comment.indexOf("Salmon Teriyaki") + 15)}
                                    </>
                                ) : review.comment.includes("katsu") ? (
                                    <>
                                        {review.comment.substring(0, review.comment.indexOf("katsu"))}
                                        <Link href="/menu#hot" className="text-hot-pink font-semibold hover:underline">
                                            katsu
                                        </Link>
                                        {review.comment.substring(review.comment.indexOf("katsu") + 5)}
                                    </>
                                ) : (
                                    review.comment
                                )}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* SEO Content Section - After Reviews */}
            <div className="mt-12 max-w-4xl mx-auto">
                <div className="bg-white border-2 border-hot-pink rounded-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-hot-pink mb-4 text-center">
                        Why Chester-le-Street Loves Kira Sushi & Poke
                    </h2>
                    <div className="text-gray-700 leading-relaxed space-y-3">
                        <p>
                            Our 5-star customer reviews reflect our commitment to fresh ingredients, generous portions, and exceptional service. From signature <Link href="/menu#sushi" className="text-hot-pink font-semibold hover:underline">Kira Rolls</Link> to comforting <Link href="/menu#hot" className="text-hot-pink font-semibold hover:underline">chicken katsu curry</Link>, we serve authentic Japanese cuisine that keeps Chester-le-Street coming back.
                        </p>
                        <p className="text-center font-semibold">
                            <strong>148 Front Street, Chester-le-Street, DH3 3AY</strong><br />
                            Open 7 days | 11am - 7pm
                        </p>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center bg-hot-pink/10 border-2 border-hot-pink rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-hot-pink mb-3">
                    Leave Us a Review!
                </h2>
                <p className="text-gray-700 mb-6">
                    We'd love to hear about your experience. Share your thoughts on your favorite platform!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href="https://www.google.com/search?q=kira+sushi+and+poke"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-hot-pink hover:bg-hot-pink hover:text-white transition-colors"
                    >
                        <i className="fab fa-google"></i>
                        Google
                    </a>
                    <a
                        href="https://www.facebook.com/people/Kira-Sushi-Poke/61583413766423/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-hot-pink hover:bg-hot-pink hover:text-white transition-colors"
                    >
                        <i className="fab fa-facebook"></i>
                        Facebook
                    </a>
                    <a
                        href="https://www.tripadvisor.com/Restaurant_Review-g1156051-d34241645-Reviews-Kira_Sushi_and_Poke-Chester_le_Street_County_Durham_England.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-hot-pink hover:bg-hot-pink hover:text-white transition-colors"
                    >
                        TripAdvisor
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;
