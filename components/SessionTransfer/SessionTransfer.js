import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import QRCode from 'react-qr-code';
import BaseUrl from "../../Service/BaseUrl";
import Cookies from "js-cookie";

const SessionTransfer = ({ onClose }) => {
      const router = useRouter();
    const [qrData, setQrData] = useState(null);
    const [status, setStatus] = useState('initial');
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateQR = async () => {
            try {
                const response = await axios.get(`${BaseUrl}generate-qr`,
                {
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Cookies.get("currentUser")}`,
                          },
                        }
            );
                setQrData(response.data);
                setStatus('pending');
                startPolling(response.data.sessionId);
            } catch (err) {
                setError('Failed to generate QR code');
            }
        };

        generateQR();

        return () => {
            // Cleanup
        };
    }, []);

    const startPolling = (sessionId) => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${BaseUrl}qr-status/${sessionId}`,
                     {
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Cookies.get("currentUser")}`,
                          },
                        }
                );
                
                if (response.data.status === 'scanned') {
                    setStatus('scanned');
                    await completeTransfer(sessionId);
                    clearInterval(interval);
                }
            } catch (err) {
                clearInterval(interval);
                setError('Session transfer failed');
            }
        }, 2000);
    };

    const completeTransfer = async (sessionId) => {
        try {
            await axios.post(`${BaseUrl}verify-transfer`,
                { sessionId },
            {
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Cookies.get("currentUser")}`,
                          }
                        }
        );
            
            setStatus('completed');
               Cookies.remove("currentUser");
               Cookies.remove("UserId");
              
               router.push("/login");
            onClose();
            window.location.reload();
        } catch (err) {
            setError('Failed to complete transfer');
        }
    };

    return (
       <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="border-2 border-white/30 shadow-lg shadow-white/10 rounded-lg p-6 w-full max-w-md backdrop-blur-sm">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
                >
                    &times;
                </button>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 text-red-700 rounded p-3 mb-4">
                        {error}
                    </div>
                )}

                {/* QR Scanning Step */}
                {status === 'pending' && qrData && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4 text-white/50">Scan QR Code</h2>
                        <div className="flex justify-center mb-4">
                            <QRCode value={qrData.deepLinkUrl} size={200} />
                        </div>
                        <p className="text-gray-600">Use your phone's camera or Google Lens to scan and continue on mobile.</p>
                    </>
                )}

                {/* Session Transfer Step */}
                {status === 'scanned' && (
                    <p className="text-lg text-gray-700">Transferring session to your mobile device...</p>
                )}
            </div>
        </div>
    );
};

export default SessionTransfer;


