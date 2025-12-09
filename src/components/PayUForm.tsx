'use client';
import { useEffect, useRef } from 'react';

interface PayUFormProps {
    action: string;
    params: {
        key: string;
        txnid: string;
        amount: string;
        productinfo: string;
        firstname: string;
        email: string;
        phone: string;
        surl: string;
        furl: string;
        hash: string;
        [key: string]: string; // For optional fields like udf1, address etc.
    };
}

export function PayUForm({ action, params }: PayUFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (formRef.current) {
            formRef.current.submit();
        }
    }, []);

    return (
        <form
            ref={formRef}
            action={action}
            method="POST"
            style={{ display: 'none' }}
        >
            {Object.entries(params).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
            ))}
        </form>
    );
}
