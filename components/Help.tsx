import React, { useState } from 'react';

const FAQ_DATA = [
    {
      question: "How do I check in a vehicle?",
      answer: "Navigate to the 'Gate Management' page. Find the vehicle in the 'Today's Approved Arrivals' list. If its assigned dock is 'Available', click the green 'Check In' button. A gate pass will be generated."
    },
    {
      question: "What does 'Assign to Yard' mean?",
      answer: "If a vehicle arrives but its assigned dock is 'Occupied' or under 'Maintenance', use the 'Assign to Yard' button. This moves the vehicle to a virtual waiting area until its dock is free."
    },
    {
      question: "How do I handle a dock that has finished maintenance?",
      answer: "On the 'Gate Management' page, if a vehicle is waiting for a dock marked 'Maintenance', a 'Set Available' button will appear next to the status badge. Click it to mark the dock as available."
    },
    {
      question: "How do I report a delay in an operation?",
      answer: "Go to the 'Operations' page. Find the active operation and click the 'Report Delay' button. A modal will appear where you can enter the reason for the delay, which will be logged in the system."
    },
    {
        question: "How do I add a new carrier?",
        answer: "Navigate to the 'Carriers' page and click the '+ New Carrier' button. Fill out the form in the modal that appears and click 'Add Carrier' to save the new record."
    }
];

const FaqItem: React.FC<{ faq: { question: string; answer: string }; isOpen: boolean; onClick: () => void }> = ({ faq, isOpen, onClick }) => {
    return (
      <div className="border-b">
        <button onClick={onClick} className="w-full flex justify-between items-center text-left py-4 px-2 hover:bg-gray-50 focus:outline-none">
          <span className="font-semibold text-gray-700">{faq.question}</span>
          <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="p-4 bg-gray-50 text-gray-600">
            {faq.answer}
          </div>
        </div>
      </div>
    );
};

interface HelpProps {
    onSubmitSupportRequest: (data: {name: string, email: string, subject: string, message: string}) => void;
}

const Help: React.FC<HelpProps> = ({ onSubmitSupportRequest }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitSupportRequest(formData);
        setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
                <p className="text-gray-500">Find answers to your questions and get in touch with our support team.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: FAQs */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        {FAQ_DATA.map((faq, index) => (
                            <FaqItem 
                                key={index} 
                                faq={faq} 
                                isOpen={openFaq === index} 
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Contact & Links */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Contact Support</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Your Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleFormChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div>
                                <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                                <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleFormChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                             <div>
                                <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                <textarea name="message" id="message" value={formData.message} onChange={handleFormChange} rows={4} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <button type="submit" className="w-full bg-brand-accent text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-brand-accent/90 transition-transform transform hover:scale-105">
                                Submit Request
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Quick Links</h2>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5 text-brand-accent mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804V4.804A7.968 7.968 0 0014.5 4z" /></svg>
                                <span className="font-semibold text-gray-600">User Guide</span>
                            </a>
                             <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5 text-brand-accent mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                                <span className="font-semibold text-gray-600">Troubleshooting</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;