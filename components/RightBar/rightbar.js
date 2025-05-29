import Image from "next/image"
import OIP from "../../assets/OIP.png"

export default function RightBar() {
    return(
        <div className="h-screen ml-2 w-[79%] flex items-center justify-center bg-transparent shadow-[inset_0_0_20px_2px_rgba(255,255,255,0.3)]">
            <div className="flex flex-col items-center gap-2 w-full max-w-2xl px-4">
                <div className="relative w-full max-w-xs h-70">
                    <Image 
                        src={OIP} 
                        alt="OIP" 
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                    />
                </div>
                <div className="text-gray-300 text-center">
                    <h1 className="text-xl font-medium leading-relaxed">
                        Make calls, share your screen and get faster experience when you're downloading the Chat Karo app.
                    </h1>
                </div>
            </div>
        </div>
    )
}