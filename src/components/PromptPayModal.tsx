"use client";

import React, { useState, useEffect } from "react";

interface PromptPayModalProps {
  amount: number;
  customerName?: string;
  onConfirmPayment: () => void;
  onClose: () => void;
}

export default function PromptPayModal({
  amount,
  customerName,
  onConfirmPayment,
  onClose,
}: PromptPayModalProps) {
  const [copied, setCopied] = useState(false);
  const [promptPayNumber, setPromptPayNumber] = useState("081-234-5678");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const numberSetting = data.find((s: any) => s.key === 'PROMPTPAY_NUMBER');
        if (numberSetting && numberSetting.value) setPromptPayNumber(numberSetting.value);
        
        const imageSetting = data.find((s: any) => s.key === 'PROMPTPAY_QR_IMAGE');
        if (imageSetting && imageSetting.value) setQrImage(imageSetting.value);

        const accountSetting = data.find((s: any) => s.key === 'ACCOUNT_NAME');
        if (accountSetting && accountSetting.value) setAccountName(accountSetting.value);

        const bankSetting = data.find((s: any) => s.key === 'BANK_NAME');
        if (bankSetting && bankSetting.value) setBankName(bankSetting.value);
      })
      .catch(console.error);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptPayNumber.replace(/-/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          borderRadius: "16px",
          maxWidth: "360px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Header Thai QR Payment Blue Band */}
        <div
          style={{
            backgroundColor: "#003d6b",
            color: "white",
            padding: "1.25rem 1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🇹🇭 Thai QR Payment</span>
          </div>
          <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>
            พร้อมเพย์ (PromptPay)
          </span>
        </div>

        {/* QR Code Container */}
        <div style={{ padding: "1.5rem" }}>
          <div
            style={{
              padding: "1rem",
              background: "#f8fafc",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              display: "inline-block",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            }}
          >
            {qrImage ? (
              <img 
                src={qrImage} 
                alt="Bank QR Code" 
                style={{ width: "180px", height: "180px", objectFit: "contain", display: "block" }} 
              />
            ) : (
              <svg
                width="180"
                height="180"
                viewBox="0 0 100 100"
                style={{ display: "block" }}
              >
                <rect width="100" height="100" fill="#ffffff" rx="4" />
                <rect x="8" y="8" width="24" height="24" fill="#003d6b" rx="2" />
                <rect x="12" y="12" width="16" height="16" fill="#ffffff" rx="1" />
                <rect x="16" y="16" width="8" height="8" fill="#003d6b" />

                <rect x="68" y="8" width="24" height="24" fill="#003d6b" rx="2" />
                <rect x="72" y="12" width="16" height="16" fill="#ffffff" rx="1" />
                <rect x="76" y="16" width="8" height="8" fill="#003d6b" />

                <rect x="8" y="68" width="24" height="24" fill="#003d6b" rx="2" />
                <rect x="12" y="72" width="16" height="16" fill="#ffffff" rx="1" />
                <rect x="16" y="76" width="8" height="8" fill="#003d6b" />

                <rect x="36" y="10" width="6" height="6" fill="#003d6b" />
                <rect x="46" y="14" width="8" height="4" fill="#003d6b" />
                <rect x="58" y="10" width="6" height="6" fill="#003d6b" />

                <rect x="36" y="24" width="8" height="6" fill="#003d6b" />
                <rect x="48" y="22" width="6" height="8" fill="#003d6b" />
                <rect x="58" y="24" width="6" height="6" fill="#003d6b" />

                <rect x="10" y="36" width="6" height="8" fill="#003d6b" />
                <rect x="22" y="40" width="6" height="6" fill="#003d6b" />
                <rect x="32" y="36" width="8" height="8" fill="#003d6b" />
                <rect x="44" y="38" width="12" height="6" fill="#003d6b" />
                <rect x="60" y="36" width="6" height="8" fill="#003d6b" />
                <rect x="72" y="40" width="8" height="6" fill="#003d6b" />
                <rect x="84" y="36" width="6" height="8" fill="#003d6b" />

                <circle cx="50" cy="50" r="13" fill="#003d6b" />
                <path
                  d="M45 47 L50 42 L55 47 M50 43 L50 56"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <rect x="10" y="48" width="8" height="6" fill="#003d6b" />
                <rect x="22" y="52" width="6" height="8" fill="#003d6b" />
                <rect x="70" y="50" width="6" height="8" fill="#003d6b" />
                <rect x="82" y="48" width="8" height="6" fill="#003d6b" />

                <rect x="36" y="68" width="6" height="8" fill="#003d6b" />
                <rect x="46" y="70" width="8" height="6" fill="#003d6b" />
                <rect x="58" y="68" width="6" height="8" fill="#003d6b" />
                <rect x="70" y="72" width="8" height="6" fill="#003d6b" />
                <rect x="82" y="68" width="6" height="8" fill="#003d6b" />

                <rect x="36" y="82" width="8" height="6" fill="#003d6b" />
                <rect x="48" y="80" width="6" height="8" fill="#003d6b" />
                <rect x="58" y="82" width="8" height="6" fill="#003d6b" />
                <rect x="72" y="82" width="6" height="6" fill="#003d6b" />
                <rect x="82" y="80" width="8" height="8" fill="#003d6b" />
              </svg>
            )}
          </div>

          {/* Amount Display */}
          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              ยอดชำระเงิน
            </div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#059669",
                fontFamily: "monospace",
              }}
            >
              ฿{amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Account Details */}
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem",
              backgroundColor: "#f1f5f9",
              borderRadius: "8px",
              textAlign: "left"
            }}
          >
            {accountName && (
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.25rem" }}>
                {accountName}
              </div>
            )}
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <div style={{ fontSize: "0.85rem", color: "#3b82f6", fontWeight: 600 }}>
                {promptPayNumber || "081-234-5678"}
              </div>
              <button
                onClick={handleCopy}
                style={{
                  background: "none",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  color: copied ? "#059669" : "#2563eb",
                }}
              >
                {copied ? "✓ คัดลอกแล้ว" : "คัดลอก"}
              </button>
            </div>

            {bankName && (
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {bankName}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: "#e2e8f0",
              color: "#475569",
              border: "none",
              borderRadius: "8px",
              padding: "0.6rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirmPayment}
            style={{
              flex: 1.5,
              backgroundColor: "#059669",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.6rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(5,150,105,0.3)",
            }}
          >
            ✓ ยืนยันรับเงินแล้ว
          </button>
        </div>
      </div>
    </div>
  );
}
