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
        <div className="w-72 h-screen fixed bg-gradient-to-b from-gray-900 via-black to-gray-900 shadow-2xl">
           
           <section className="flex flex-col h-full px-6 py-8 border-r border-gray-700">

            {/* Logo */}
            <span className="text-white text-3xl font-bold tracking-wide mb-12">
                EPM <span className="text-blue-500">System</span>
            </span>

            {/* Navigation */}
            <div className="flex flex-col gap-5 text-lg">

              <Link 
              to={'/home'} 
              className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-blue-600/20 px-4 py-2 rounded-lg transition duration-300"
              >
              <FaHome className="text-blue-500 text-xl"/> Home
              </Link>

              <Link 
              to={'/departments'} 
              className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-green-600/20 px-4 py-2 rounded-lg transition duration-300"
              >
              <FaBuilding className="text-green-500 text-xl"/> Departments
              </Link>

              <Link 
              to={'/employees'} 
              className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-yellow-500/20 px-4 py-2 rounded-lg transition duration-300"
              >
              <FaUsers className="text-yellow-400 text-xl"/> Employees
              </Link>

              <Link 
              to={'/salaries'} 
              className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-purple-600/20 px-4 py-2 rounded-lg transition duration-300"
              >
              <FaMoneyBill1Wave className="text-purple-500 text-xl"/> Salaries
              </Link>

              <Link 
              to={'/report'} 
              className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-red-600/20 px-4 py-2 rounded-lg transition duration-300"
              >
              <FaFileExport className="text-red-500 text-xl"/> Report
              </Link>

            </div>

            {/* Logout Button */}
            <div className="mt-auto">
              <button 
              className="group flex items-center justify-center gap-2 w-full py-3 mt-10 rounded-xl bg-gradient-to-r from-red-700 to-red-900 text-white hover:scale-105 transition duration-300 shadow-lg"
              onClick={openLogout}
              >
              <FaSignOutAlt className="transition-transform duration-300 group-hover:rotate-180"/>
              Log Out
              </button>
            </div>

           </section>
        </div>

        {/* Logout Modal */}
        {
        logout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            
            <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeLogout}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-scaleIn">

                <button 
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={closeLogout}
                >
                ×
                </button>

                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaExclamationTriangle className="text-yellow-500"/>
                    Confirm Logout
                </h2>

                <p className="text-gray-600 mt-4 text-center">
                    Are you sure you want to logout from your account?
                </p>

                <div className="flex justify-center gap-4 mt-6">

                    <button 
                    className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                    onClick={handleLogout}
                    >
                    Yes
                    </button>

                    <button 
                    className="px-5 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
                    onClick={closeLogout}
                    >
                    No
                    </button>

                </div>
            </div>
        </div>
        )
        }

        </>
    )
}

export default SideBar;
