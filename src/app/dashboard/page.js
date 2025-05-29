"use client"
import { useContext, useState } from "react";
import CallScreen from "../../../components/CallScreen/CallScreen";
import Chat from "../../../components/Chat/Chat";
import RightBar from "../../../components/RightBar/rightbar";
import Sidebar from "../../../components/Sidebar/sidebar";
import { PageContext } from "../../../context/PageContext";
import IncommingCall from "../../../components/IncommingCall/IncommingCall";

export default function DashBoard(){
  const { page} = useContext(PageContext);

    return(
        <div>
          
            {page?(
                <div className="h-screen flex flex-row"  style={{
        background:"#020024",
background: "linear-gradient(157deg,rgba(2, 0, 36, 1) 27%, rgba(26, 26, 186, 1) 52%, rgba(0, 212, 255, 1) 100%)"
        }}> 
     <Sidebar/>
      {/* <RightBar/> */}
      <Chat/>
        </div>
            ):(
                 <CallScreen/>
                //  <IncommingCall/>
            )}
        </div>
    )
}