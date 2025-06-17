"use client"
import Image from "next/image";
import { useEffect, useState, useContext } from "react";
import logo from "../../assets/logos-removebg-preview.png";
import UserList from "../UserList/userlist";
import { useRouter } from "next/navigation";
import { IoMdLogOut } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { FaQrcode } from "react-icons/fa";
import Axios, { AxiosError } from "axios";
import BaseUrl from "../../Service/BaseUrl";
import Cookies from "js-cookie";
import { PageContext } from "../../context/PageContext";
import { AuthContext } from "../../context/AuthContext";
import Metas from "../MetaIcons/Meta";
import SessionTransfer from "../SessionTransfer/SessionTransfer";

export default function Sidebar({showChat, setShowChat}) {
  const router = useRouter();
  const { UserId, SetUserId,Meta,SetMeta } = useContext(PageContext);
  const { setIsAuthenticated } = useContext(AuthContext);

  const [state, SetState] = useState(null);
  const [search, Setsearch] = useState("");
  const [AllUser, SetAllUser] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [Scanner,SetScanner]=useState(false);

  function onClose(){
    SetScanner((prev)=>!prev);
  }

  useEffect(() => {
    const GetDetails = async () => {
      try {
        const response = await Axios.get(`${BaseUrl}holder/details/:id`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("currentUser")}`,
          },
        });

        if (response.status === 200 || response.status === 201) {
          SetState(response.data);
        }
      } catch (error) {
        alert(error);
        console.error("Error fetching details:", error);
      }
    };

    GetDetails();
  }, []);

  async function Search() {
    try {
      const response = await Axios.post(
        `${BaseUrl}candidate/search/:id`,
        { search },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("currentUser")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        SetAllUser(response.data.users);
      }
    } catch (error) {}
  }

  useEffect(() => {
    Search();
  }, []);

  function HandleLogout() {
    Cookies.remove("currentUser");
    Cookies.remove("UserId");
    setIsAuthenticated(false);
    router.push("/login");
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // For preview
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    // Dummy upload API
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await Axios.post(
        `${BaseUrl}update-profile/:id`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("currentUser")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error uploading profile:", error);
    }
  };

  return (
 <div className={`h-screen w-full flex flex-col bg-transparent shadow-[inset_0_0_20px_2px_rgba(255,255,255,0.3)]`}>
      <div className="flex flex-col h-full">
        {/* Top section - non-scrollable */}
        <div className="flex-shrink-0 px-2">
          <div className="logo md:relative mt-[45px] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:-translate-0">
            <Image
              src={logo}
              alt="logo"
              width={100}
              height={100}
              className="h-40 w-auto mx-auto"
            />
          </div>
          <div className="h-[1px] w-[98%] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-[-110px]"></div>
          <div className="flex items-center gap-2 overflow-hidden border border-white/20 rounded-lg h-auto py-1 relative">
          <div className="relative">
            {selectedImage || state?.Profile ? (
              <Image
                src={selectedImage || state?.Profile}
                alt="profile"
                width={100}
                height={100}
                className="ml-2 h-12 w-12 object-contain rounded-full border-2 border-white object-cover"
              />
            ) : (
              <div className="ml-2 h-12 w-12 rounded-full border-2 border-white bg-black-600 text-white flex items-center justify-center text-xl font-semibold">
                {state?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            {/* Pencil icon */}
            <label htmlFor="file-upload">
              <FiEdit className="absolute bottom-0 right-0 bg-white text-black rounded-full p-1 cursor-pointer" size={18} />
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

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
          onChange={(e) => Setsearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              Search();
            }
          }}
        />
          <div className="h-[1px] w-[98%] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-[2px]"></div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
          {AllUser &&
            AllUser.map((temp, index) => (
              <div 
                key={index} 
                onClick={() => {
                  Search();
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setShowChat(true);
                  }
                }}
              >
                <UserList data={temp} Search={Search} />
              </div>
            ))}
        </div>
     
  {Scanner?(<SessionTransfer onClose={onClose}/>):null}
        {/* Bottom section - non-scrollable */}
        <div className="flex-shrink-2 px-2 pb-4 ">
          <div className="h-[1px] w-[98%] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
         <div className="flex flex-row items-center justify-center gap-1">
           <div className="flex items-center justify-center border border-white/20 rounded h-9 w-[94%] cursor-pointer mt-2">
            <button
              className="flex flex-row gap-3 justify-center cursor-pointer w-full h-full items-center"
              onClick={HandleLogout}
            >
              <IoMdLogOut className="text-white" />
              <p className="text-sm text-white">Log Out</p>
            </button>
            {typeof window !== 'undefined' && window.innerWidth < 768?(
            <div className="relative -mt-50 ml-5 corsor-pointer" onClick={()=>{SetMeta(true),setShowChat(true);}}>
              <Metas/>
              </div>
            ):null}
          </div>
           <div className="flex items-center justify-center border border-white/20 rounded h-9 w-9 cursor-pointer mt-2">
           <button onClick={onClose} ><FaQrcode width={20} color="white"/></button>
           </div>
          </div>
           
        </div>
      </div>
    </div>
  );
}