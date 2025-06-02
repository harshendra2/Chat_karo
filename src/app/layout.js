// app/layout.js
import './globals.css';
import ClientWrapper from '../../components/ClientWrapper'; // Adjust path if needed

export const metadata = {
  title: 'Chat Karo'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: 'black' }}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
