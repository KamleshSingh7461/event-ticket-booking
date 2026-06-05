'use client';

import { Printer } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    invoiceNumber: string;
}

export default function InvoicePrintButton({ invoiceNumber }: Props) {
    useEffect(() => {
        const handler = () => {
            document.title = `Invoice_${invoiceNumber}`;
        };
        window.addEventListener('beforeprint', handler);
        return () => window.removeEventListener('beforeprint', handler);
    }, [invoiceNumber]);

    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-black text-white font-bold rounded shadow-lg hover:bg-gray-800 transition active:scale-95"
        >
            <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
    );
}
