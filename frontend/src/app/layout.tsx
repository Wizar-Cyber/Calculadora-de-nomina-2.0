import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nómina Conductores TA',
  description: 'Calculadora de nómina para conductores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-900 text-white antialiased">{children}</body>
    </html>
  );
}
