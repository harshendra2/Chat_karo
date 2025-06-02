import Image from "next/image";
import images from "../../assets/Images.png";
import Axios, { AxiosError } from "axios";
import BaseUrl from '../../Service/BaseUrl';
import Cookies from "js-cookie";

export default function UserList({data,Search}){

  
  async function Follow(Id){
  try{
   const response = await Axios.put(
          `${BaseUrl}candidate/status/follow/:id/${Id}`,
          {},
           {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("currentUser")}`,
            },
          }
        );
  
        if (response.status === 200 || response.status === 201) {
           await Search()
            const audio = new Audio("/bell-98033.mp3");
   audio.play();
        }
  }catch(error){
  }
  }


  async function Accept(Id){
  try{
   const response = await Axios.put(
          `${BaseUrl}candidate/accept/request/:id/${Id}`,
          {},
           {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("currentUser")}`,
            },
          }
        );
  
        if (response.status === 200 || response.status === 201) {
           await Search()
           const audio = new Audio("/bell-98033.mp3");
   audio.play();
        }
  }catch(error){
  }
  }

    return(
        <div className="flex items-center gap-2 overflow-hidden border border-white/20 rounded-lg h-auto py-1 cursor-pointer">
          {data?.Profile ? (
                              <Image
                                src={data?.Profile}
                                alt={`logo`}
                                width={40}
            height={40} 
            className="h-10 ml-2 w-10 object-contain rounded-full border-2 border-white object-cover"
                              />
                            ) : (
                              <div className="ml-2 h-10 w-10 rounded-full border-2 border-white bg-black-600 text-white flex items-center justify-center text-xl font-semibold">
                                {data?.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
          <div className="flex flex-col items-start">
            <h3 className="text-white m-0 text-sm md:text-sm">{data?.name}</h3> 
           <p className="text-gray-300 text-xs">
  Status: 
  {data?.status === "Follower" ? (
    <button className="text-[0.6rem] ml-2">Following</button>
  ) : data?.status === "New" ? (
    <button className="text-blue-400 border border-white rounded-full pl-1 pr-1 ml-2 text-[0.6rem] hover:text-blue-800" onClick={() => Follow(data?._id)}>+ Connect</button>
  ) : data?.status === "Following" ? (
    <button className="text-[0.6rem] ml-2">Connected</button>
  ) : data?.status === "Accept" ? (
    <button className="text-blue-400 border border-white rounded-full pl-1 pr-1 ml-2 text-[0.6rem] hover:text-blue-800" onClick={()=> Accept(data?._id)}>Accept</button>
  ) : (
    <button className="text-[0.6rem] ml-2">Accepted</button>
  )}
</p>

          </div>
        </div>
    )
}