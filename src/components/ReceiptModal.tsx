"use client";

import React, { useRef } from "react";

export interface ReceiptData {
  orderId: string;
  date: string;
  customerName?: string;
  items: Array<{
    id: string;
    name: string;
    sku: string;
    price: number | string;
    qty: number;
  }>;
  total: number;
  paymentMethod: string;
  cashTendered?: number;
  change?: number;
}

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
}

export default function ReceiptModal({ data, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-receipt,
          .printable-receipt * {
            visibility: visible;
          }
          .printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          backgroundColor: "#ffffff",
          color: "#1e293b",
          borderRadius: "12px",
          maxWidth: "380px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Modal Header */}
        <div
          className="no-print"
          style={{
            backgroundColor: "#1e3a5f",
            color: "white",
            padding: "0.75rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            🧾 ใบเสร็จรับเงิน (Receipt)
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1.25rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div
          ref={receiptRef}
          className="printable-receipt"
          style={{
            padding: "1.5rem 1.25rem",
            overflowY: "auto",
            fontFamily: "monospace, 'Courier New', Courier",
            fontSize: "12px",
            lineHeight: "1.4",
            background: "#fff",
          }}
        >
          {/* Shop Header */}
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                margin: 0,
                letterSpacing: "1px",
              }}
            >
              DPOS PRO STORE
            </h2>
            <p style={{ margin: "2px 0", color: "#64748b", fontSize: "11px" }}>
              ระบบจัดการสต็อกและจุดขายอัจฉริยะ
            </p>
            <p style={{ margin: "2px 0", color: "#64748b", fontSize: "10px" }}>
              โทร: 02-xxx-xxxx | TAX ID: 010555xxxxxxx
            </p>
          </div>

          <div
            style={{
              borderTop: "1px dashed #94a3b8",
              borderBottom: "1px dashed #94a3b8",
              padding: "6px 0",
              margin: "8px 0",
              fontSize: "11px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>เลขที่: {data.orderId}</span>
              <span>{data.date}</span>
            </div>
            {data.customerName && (
              <div style={{ marginTop: "2px" }}>
                <span>ลูกค้า: {data.customerName}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div style={{ margin: "10px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #cbd5e1",
                    textAlign: "left",
                    color: "#475569",
                  }}
                >
                  <th style={{ paddingBottom: "4px" }}>รายการ</th>
                  <th style={{ textAlign: "center", paddingBottom: "4px" }}>
                    จน.
                  </th>
                  <th style={{ textAlign: "right", paddingBottom: "4px" }}>
                    ราคา
                  </th>
                  <th style={{ textAlign: "right", paddingBottom: "4px" }}>
                    รวม
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px dotted #e2e8f0" }}>
                    <td style={{ padding: "4px 0", maxWidth: "140px" }}>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: "9px", color: "#94a3b8" }}>
                        {item.sku}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", padding: "4px 0" }}>
                      {item.qty}
                    </td>
                    <td style={{ textAlign: "right", padding: "4px 0" }}>
                      {Number(item.price).toFixed(2)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "4px 0",
                        fontWeight: 600,
                      }}
                    >
                      {(Number(item.price) * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div
            style={{
              borderTop: "1px dashed #94a3b8",
              paddingTop: "6px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                fontWeight: 800,
                marginBottom: "4px",
              }}
            >
              <span>ยอดรวมสุทธิ:</span>
              <span>฿{data.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#475569",
              }}
            >
              <span>วิธีชำระเงิน:</span>
              <span>
                {data.paymentMethod === "CASH"
                  ? "เงินสด (Cash)"
                  : data.paymentMethod === "TRANSFER"
                  ? "โอนเงิน / PromptPay"
                  : "บัตรเครดิต"}
              </span>
            </div>

            {data.paymentMethod === "CASH" && data.cashTendered !== undefined && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "#475569",
                  }}
                >
                  <span>รับเงินสดมา:</span>
                  <span>฿{data.cashTendered.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#059669",
                    marginTop: "2px",
                  }}
                >
                  <span>เงินทอน:</span>
                  <span>฿{(data.change || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div
            style={{
              textAlign: "center",
              marginTop: "16px",
              paddingTop: "10px",
              borderTop: "1px dashed #94a3b8",
              fontSize: "10px",
              color: "#64748b",
            }}
          >
            <p style={{ margin: "2px 0" }}>ขอบคุณที่ใช้บริการ / Thank You!</p>
            <p style={{ margin: "2px 0" }}>สินค้าซื้อแล้วไม่รับเปลี่ยนหรือคืน</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "9px" }}>
              Powered by DPOS PRO System
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div
          className="no-print"
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.6rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            🖨️ พิมพ์ใบเสร็จ (Print)
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: "#059669",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.6rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✨ ขายรายการถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
