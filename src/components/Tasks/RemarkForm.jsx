import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

const RemarkForm = ({ onSubmit, placeholder = "Add a remark..." }) => {
    const [remark, setRemark] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!remark.trim()) return;

        setSubmitting(true);
        try {
            await onSubmit(remark);
            setRemark('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <div className="relative">
                <div className="absolute top-3 left-3 text-gray-400">
                    <MessageSquare size={16} />
                </div>
                <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder={placeholder}
                    rows="2"
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none text-sm resize-none"
                ></textarea>
                <button
                    type="submit"
                    disabled={submitting || !remark.trim()}
                    className="absolute bottom-2.5 right-2.5 p-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={16} />
                </button>
            </div>
        </form>
    );
};

export default RemarkForm;
