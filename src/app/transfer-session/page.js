'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BaseUrl from '../../../Service/BaseUrl';
import Image from "next/image";
import logo from "../../../assets/logos-removebg-preview.png";

export default function TransferSession() {
  const [timeLeft, setTimeLeft] = useState(120);
  const [status, setStatus] = useState('pending');
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    if (sessionId) {
      const completeTransfer = async () => {
        try {
          const response = await fetch(`${BaseUrl}transfer-session?sessionId=${sessionId}`);
          const data = await response.json();
          
          if (data.token && data.userId) {
            // Set cookies
            document.cookie = `currentUser=${data.token}; path=/; secure=${process.env.NODE_ENV === "production"}; sameSite=strict`;
            document.cookie = `UserId=${data.userId}; path=/; secure=${process.env.NODE_ENV === "production"}; sameSite=strict`;
            
            // Redirect to dashboard
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Transfer failed:', error);
          router.push('/login?error=transfer_failed');
        }
      };
      
      completeTransfer();
    }
  }, [sessionId, router]);

  const onClose = () => {
    router.push('/login');
  };

  useEffect(() => {
  const timer = timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
  return (()=>{
    clearInterval(timer);
    router.push('/login');
  })
}, [timeLeft]);

  return (
    <div className="min-h-screen flex flex-col bg-black-50">
      <div className="flex items-center justify-between py-5 px-4 md:block">
        <Image 
          src={logo} 
          alt="logo"
          width={100}  
          height={100} 
          className="h-40 w-auto" 
        />
      </div>
      
      <main className="flex-grow w-full flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-gray-400">
          <div className="text-center">
            <div className="space-y-2">
              <h3 className="text-white-700 text-3xl font-bold">
                Transferring Your Session
              </h3>
              <p className="text-white-500">
                Please wait while we authenticate your device
              </p>
            </div>
          </div>
          
          <div className="bg-white shadow-lg p-6 sm:p-8 rounded-lg">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Animated loading spinner */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-[#7e525f] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <svg
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#7e525f]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              
              {/* Progress text */}
              <div className="text-center">
                <p className="text-gray-600">
                  {status === 'pending' ? 'Processing...' : 'Transfer complete!'}
                </p>
                {status === 'pending' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Time remaining: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
              
              {/* Cancel button */}
              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-[#7e525f] hover:text-[#986673] hover:underline focus:outline-none"
                >
                  Cancel Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}