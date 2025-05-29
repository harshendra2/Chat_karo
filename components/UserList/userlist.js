import Image from "next/image";
import images from "../../assets/Images.png";

export default function UserList({data}){
    return(
        <div className="flex items-center gap-2 overflow-hidden border border-white/20 rounded-lg h-auto py-1 cursor-pointer">
          <Image 
            src={data?.profile||images} 
            alt="logo"
            width={40}
            height={40} 
            className="h-10 ml-2 w-auto object-contain rounded-full"
          />
          <div className="flex flex-col items-start">
            <h3 className="text-white m-0 text-sm md:text-sm">{data?.name}</h3> 
            <p className="text-gray-300 text-xs">Status: Accepted</p> 
          </div>
        </div>
    )
}