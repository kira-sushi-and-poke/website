import React from "react";

const ContactUs = () => {
    return (
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-md border border-gray-100">
            <div className="bg-yellow/10 border-l-4 border-yellow p-4 mb-5 rounded-r">
                <p className="font-semibold text-gray-800 text-base">
                    <i className="fas fa-star text-yellow mr-2"></i>
                    Social media is the fastest way to reach us!
                </p>
            </div>

            <p className="text-gray-700 mb-5 leading-relaxed text-base">
                Connepct with us for daily specials, updates, and quick responses to your questions.
            </p>
            <div className="space-y-3 mb-6">
                <a 
                    href="https://www.instagram.com/kira_sushi_and_poke" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm active:shadow-md md:hover:shadow-md transition-all group min-h-[60px] border border-purple-100"
                >
                    <i className="fab fa-instagram text-3xl text-hot-pink"></i>
                    <div className="flex-1">
                        <p className="font-bold text-gray-800">Instagram</p>
                        <p className="text-sm text-gray-600">@kira_sushi_and_poke</p>
                    </div>
                    <i className="fas fa-arrow-right text-gray-400 group-hover:text-hot-pink transition-colors"></i>
                </a>
                <a 
                    href="https://www.facebook.com/people/Kira-Sushi-Poke/61583413766423/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm active:shadow-md md:hover:shadow-md transition-all group min-h-[60px] border border-blue-100"
                >
                    <i className="fab fa-facebook text-3xl text-hot-pink"></i>
                    <div className="flex-1">
                        <p className="font-bold text-gray-800">Facebook</p>
                        <p className="text-sm text-gray-600">Kira Sushi Poke</p>
                    </div>
                    <i className="fas fa-arrow-right text-gray-400 group-hover:text-hot-pink transition-colors"></i>
                </a>
            </div>

            <div className="border-t border-gray-200 pt-5 space-y-5">
                <div>
                    <h3 className="font-heading text-hot-pink mb-2">Email</h3>
                    <p className="text-gray-700 italic text-base">
                        Coming soon
                    </p>
                </div>
                <div>
                    <h3 className="font-heading text-hot-pink mb-2">Reservations</h3>
                    <p className="text-gray-700 leading-relaxed text-base">
                        Walk-ins welcome! We operate primarily as a dine-in restaurant. For large groups or special arrangements, please contact us through social media.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
