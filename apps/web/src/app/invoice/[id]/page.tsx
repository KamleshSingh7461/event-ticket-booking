import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function InvoicePage({ params }: { params: { id: string } }) {
    await dbConnect();

    const invoice = await Invoice.findById(params.id).lean();

    if (!invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center p-8 bg-white rounded-lg shadow">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Invoice Not Found</h1>
                    <p className="text-gray-500 mb-6">The invoice you are looking for does not exist or has been removed.</p>
                    <Link href="/user/dashboard" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
                        Go Back
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0 text-black">
            {/* Control Bar (Hidden when printing) */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
                <Link href="/user/dashboard" className="flex items-center text-gray-600 hover:text-black transition">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            if (typeof window !== 'undefined') window.print();
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-black text-white font-bold rounded shadow-lg hover:bg-gray-800 transition active:scale-95"
                    >
                        <Printer className="w-4 h-4" /> Print / Save PDF
                    </button>
                </div>
            </div>

            {/* The Invoice Document */}
            <div className="max-w-4xl mx-auto bg-white p-12 shadow-2xl print:shadow-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-widest text-black mb-1">INVOICE</h1>
                        <p className="text-gray-500 font-mono">#{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <img src="https://res.cloudinary.com/desdbjzzt/image/upload/v1777203252/logo_yswfeg.png" alt="Logo" className="h-12 w-auto ml-auto mb-2 opacity-90" />
                        <h2 className="text-xl font-bold">{invoice.sellerInfo?.companyName || 'WYLDCARD STATS PVT LTD'}</h2>
                        <p className="text-sm text-gray-500 mt-1 max-w-[250px] ml-auto">{invoice.sellerInfo?.address}</p>
                        {invoice.sellerInfo?.gstin && <p className="text-sm text-gray-500 mt-1">GSTIN: <span className="font-medium text-black">{invoice.sellerInfo.gstin}</span></p>}
                        {invoice.sellerInfo?.pan && <p className="text-sm text-gray-500">PAN: <span className="font-medium text-black">{invoice.sellerInfo.pan}</span></p>}
                    </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
                        <p className="font-bold text-lg">{invoice.customerInfo?.name}</p>
                        <p className="text-gray-600">{invoice.customerInfo?.email}</p>
                        <p className="text-gray-600">{invoice.customerInfo?.phone}</p>
                        {invoice.customerInfo?.address && <p className="text-gray-600 mt-1">{invoice.customerInfo.address}</p>}
                        {invoice.customerInfo?.state && <p className="text-gray-600">{invoice.customerInfo.state}</p>}
                    </div>
                    <div className="text-right">
                        <div className="grid grid-cols-2 gap-y-3 gap-x-8 ml-auto w-max">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">Invoice Date</p>
                            <p className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                            
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">Booking Ref</p>
                            <p className="font-medium font-mono">{invoice.bookingReference}</p>
                            
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">Status</p>
                            <p className="font-bold text-green-600">{invoice.status}</p>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-12">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-y-2 border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="py-4 px-2">Description</th>
                                <th className="py-4 px-2 text-center">Qty</th>
                                <th className="py-4 px-2 text-right">Base Price</th>
                                <th className="py-4 px-2 text-right">GST</th>
                                <th className="py-4 px-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm border-b-2 border-gray-100">
                            {invoice.items?.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-50 last:border-0">
                                    <td className="py-4 px-2 font-medium">{item.description}</td>
                                    <td className="py-4 px-2 text-center">{item.quantity}</td>
                                    <td className="py-4 px-2 text-right">{invoice.currency} {item.basePrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-4 px-2 text-right">{invoice.currency} {item.gstAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-4 px-2 text-right font-bold text-black">{invoice.currency} {item.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals & Tax Breakdown */}
                <div className="flex justify-between items-start">
                    {/* Tax Breakdown */}
                    <div className="w-1/2 pr-8">
                        {invoice.taxBreakdown && (invoice.taxBreakdown.cgst > 0 || invoice.taxBreakdown.igst > 0) && (
                            <div className="bg-gray-50 rounded-lg p-5">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Tax Breakdown</h3>
                                <div className="space-y-2 text-sm">
                                    {invoice.taxBreakdown.cgst > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">CGST ({(invoice.taxBreakdown.gstRate / 2)}%)</span>
                                            <span className="font-medium">{invoice.currency} {invoice.taxBreakdown.cgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {invoice.taxBreakdown.sgst > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">SGST ({(invoice.taxBreakdown.gstRate / 2)}%)</span>
                                            <span className="font-medium">{invoice.currency} {invoice.taxBreakdown.sgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {invoice.taxBreakdown.igst > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">IGST ({invoice.taxBreakdown.gstRate}%)</span>
                                            <span className="font-medium">{invoice.currency} {invoice.taxBreakdown.igst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Totals */}
                    <div className="w-1/2 pl-8">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{invoice.currency} {invoice.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 pb-3 border-b border-gray-200">
                                <span>Total Tax (GST)</span>
                                <span>{invoice.currency} {invoice.gstAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-lg font-bold">Grand Total</span>
                                <span className="text-2xl font-black">{invoice.currency} {invoice.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
                    <p className="mb-1">This is a computer-generated invoice and does not require a physical signature.</p>
                    <p>For any queries, please contact support@wyldcardstat.com</p>
                </div>
            </div>
            
            {/* Client-side script to auto-print or just handle print logic */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    // A tiny script just to ensure styling applies nicely on print
                    window.addEventListener('beforeprint', () => {
                        document.title = 'Invoice_${invoice.invoiceNumber}';
                    });
                `
            }} />
        </div>
    );
}
