
import Image from "next/image";
import { useEffect,useState} from "react";
import logo from "../../assets/logos-removebg-preview.png";
import UserList from "../UserList/userlist";
import { IoMdLogOut } from "react-icons/io";
import Axios, { AxiosError } from "axios";
import BaseUrl from '../../Service/BaseUrl';
import Cookies from "js-cookie";

export default function Sidebar(){

  const [state,SetState]=useState(null)
  const [search,Setsearch]=useState("");
  const [AllUser,SetAllUser]=useState([]);

useEffect(() => {
  const GetDetails = async () => {
     
      try {
    
      const response = await Axios.get(
        `${BaseUrl}holder/details/:id`,
         {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("currentUser")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
          SetState(response.data)
      }
    } catch (error) {
      alert(error)
      console.error("Error fetching details:", error);
    }
  };

  GetDetails();
}, []);


async function Search(){
try{
 const response = await Axios.post(
        `${BaseUrl}candidate/search/:id`,
        {
         search
        },
         {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("currentUser")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
          SetAllUser(response.data.users)
      }
}catch(error){
}
}

useEffect(()=>{
 Search()
},[])

    return(
  <div className="h-screen w-full md:w-[20%] flex items-center justify-center md:block bg-transparent shadow-[inset_0_0_20px_2px_rgba(255,255,255,0.3)]">

  <div className="md:relative mt-[45px] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
    <Image 
      src={logo} 
      alt="logo"
      width={100}  
      height={100} 
      className="h-40 w-auto mx-auto" 
    />
  </div>
 <div className="h-[1px] w-[98%] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-[-110px]"></div>
<div className="flex items-center gap-2 overflow-hidden border border-white/20 rounded-lg h-auto py-1">
  <Image 
    src={state?.Profile||logo} 
    alt="logo"
    width={50}
    height={50} 
    className="h-12 w-auto object-contain rounded-full"
  />
  <div className="flex flex-col items-start">
    <h3 className="text-white m-0 text-sm md:text-sm">{state?.name}</h3> 
    <p className="text-gray-300 text-xs">My account</p> 
  </div>
</div>
  <div className="h-[1px] w-[98%] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-[2px]"></div>
   <input
                  type="search"
                  required
                  className="w-full mt-2 px-3 py-2 text-gray-100 bg-transparent outline-none border border-white-100 focus:border-red shadow-md rounded-lg duration-200"
                  placeholder="Search users"
                  value={search}
                  onChange={(e)=>Setsearch(e.target.value)}
                   onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      Search();
    }
  }}
                />

 <div className="h-[1px] w-[98%] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-[2px]"></div>
<div className="h-75 overflow-y-auto scrollbar-hide">
  {AllUser&&AllUser.map((temp,index)=>(
 <UserList key={index} data={temp}/>
  ))}

</div>
<div className="h-[1px] w-[98%] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-[2px]"></div>

 <div className="flex items-center justify-center border border-white/20 rounded h-9 cursor-pointer">
 <button className="flex flex-row gap-3 justify-center cursor-pointer">
   <IoMdLogOut /> <p className="text-sm text-white">Log Out</p>
</button>
 </div>

</div>
    )
}