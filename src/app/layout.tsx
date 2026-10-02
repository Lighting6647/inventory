import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: 'DPOS - Inventory & POS System',
  description: 'ระบบบริหารจัดการคลังสินค้าและขายหน้าร้าน POS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
