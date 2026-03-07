import { useState } from "react";
import { FaHome, FaBuilding, FaExclamationTriangle, FaFileExport, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";


function SideBar(){
    const [ logout, setLogout ] = useState(false);
    const openLogout = () => setLogout(true);
    const closeLogout = () => setLogout(false);
    const navigate = useNavigate();

    const handleLogout = (id) =>{
        localStorage.removeItem('token', id)
        navigate('/login')
    }
    return (
        <>
        <div className="w-70 h-screen fixed bg-black/70">
           <section className="ml-8 gap-6 flex flex-col border-r border-gray-400 h-screen">
            <span className = "mt-10 ml-4 text-white text-2xl font-bold">EPM System</span>
              <Link to={'/home'} className="text-2xl mt-10 text-white/70 hover:text-xl transition-all duration-200"><FaHome className="inline mb-1 text-xl text-blue-600"/> Home </Link>
              <Link to={'/departments'} className="text-2xl text-white/70 hover:text-xl transition-all duration-200"><FaBuilding className="inline mb-1 text-xl text-green-500"/> Departments </Link>
              <Link to={'/employees'} className="text-2xl text-white/70 hover:text-xl transition-all duration-200"><FaUsers className="inline mb-1 text-xl text-yellow-300"/> Employees </Link>
              <Link to={'/salaries'} className="text-2xl text-white/70 hover:text-xl transition-all duration-200"><FaMoneyBill1Wave className="inline mb-1 text-xl text-purple-500"/> Salaries </Link>
              <Link to={'/report'} className="text-2xl text-white/70 hover:text-xl transition-all duration-200"><FaFileExport className="inline mb-1 text-xl text-red-500"/> Report </Link>

              <button 
              className="group mt-65 h-10 cursor-pointer hover:scale-105 w-50 bg-linear-to-r from-red-800/60 to-red-900/40 text-white hover:from-red-900/30 hover:to-rose-900/20 rounded-xl transition-all duration-300 hover:border-red-800/50"
              onClick={openLogout}
              >
              <FaSignOutAlt className="h-5 inline w-5 mr-2 cursor-pointer transition-transform duration-300 group-hover:rotate-180" />
              Log Out</button>
              {
                logout && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
                        <div className="absolute inset-0 bg-black/70" onClick={closeLogout}/>
                        <div className="relative bg-white rounded-xl shadow-2xl shadow-blue-800 z-10 max-w-md w-full p-6 transform transition-all">
                            <button className="absolute top-1 right-4 text-gray-400 hover:text-gray-600 text-2xl cursor-pointer" onClick={closeLogout}>X</button>
                            <h2 className="text-blue-500 text-xl font-bold"> <FaExclamationTriangle className="inline text-yellow-600 text-xl"/> You're about logging out of your account.</h2>
                            <span className="text-center text-xl ml-18 mt-8">Are sure you want to logout?</span>
                            <div className="flex justify-center items-center h-full">
                                <button className="bg-red-500 text-white h-8 m-4 hover:bg-red-600 rounded cursor-pointer w-15"
                                onClick={handleLogout}>Yes</button>
                                <button className="bg-gray-500 text-white h-8 ml-2 hover:bg-gray-600 rounded cursor-pointer w-15"
                                onClick={closeLogout}>No</button>
                            </div>
                        </div>
                    </div>
                )
              }
           </section>
        </div>
        </>
    )
}

export default SideBar;