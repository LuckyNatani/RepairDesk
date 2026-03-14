import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

const RemarkForm = ({ onSubmit, placeholder = "Add a remark..." }) => {
    const [remark, setRemark] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const quickRemarks = [
        "Customer not home",
        "Need replacement parts",
        "Delayed due to traffic",
        "Issue resolved"
    ];

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
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {quickRemarks.map((qr, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => setRemark(prev => prev ? `${prev} ${qr}` : qr)}
                        className="px-2.5 py-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-full transition-colors whitespace-nowrap"
                    >
                        {qr}
                    </button>
                ))}
            </div>
            <div className="relative">
                <div className="absolute top-3 left-3 text-slate-400">
                    <MessageSquare size={16} />
                </div>
                <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder={placeholder}
                    rows="2"
                    className="w-full pl-9 pr-12 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm resize-none shadow-sm"
                ></textarea>
                <button
                    type="submit"
                    disabled={submitting || !remark.trim()}
                    className="absolute bottom-2.5 right-2.5 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <Send size={16} />
                </button>
            </div>
        </form>
    );
};

export default RemarkForm;
