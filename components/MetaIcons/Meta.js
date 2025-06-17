"use client"
import { LuSparkles } from "react-icons/lu";

export default function Metas(){

 const boxStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: '#fff',
    width: '0.3em',
    height: '0.3em',
    borderRadius: '10em',
    boxShadow: '0 1px 3px 1px rgba(0, 0, 0, 0.25)',
    cursor: 'pointer',
    backgroundImage: 'linear-gradient(45deg, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000)',
    backgroundSize: '200%',
    animation: 'rotate-circle 5s linear infinite'
  };

  const centerStyle = {
    display: 'flex',
    flex: 1,
    height: '5vh',
    alignItems: 'center',
    justifyContent: 'center'
  };
return(
  <>
        <div style={centerStyle}>
          <div style={boxStyle}>
            <span><LuSparkles color='white'/></span>
          </div>
        </div>
        <style>
          {`
            @keyframes rotate-circle {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </>
)
}
