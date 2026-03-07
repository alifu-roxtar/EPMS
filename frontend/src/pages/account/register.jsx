import { useState } from "react";
import API from "../../components/api";
import { useNavigate, Link } from "react-router-dom";
import { FaUsers, FaUserPlus, FaUserCircle, FaEnvelope, FaLock, FaPlus } from "react-icons/fa"

function Reigster(){
    const [ username, setUsername ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');
    const navigate = useNavigate();

    const handleCreate = async (e) =>{
        e.preventDefault();
        try {
            const res = await API.post('/users/register', { username, email, password });
            if(res.data){
                alert(res.data.msg)    
                setErrorMessage("");
                localStorage.setItem('token', res.data.token);
                navigate('/home')
            }else{
                setErrorMessage(res.data.msg);
            }
        } catch (error) {
            console.log('Error: ', error.response?.data?.msg);
            setErrorMessage(error.response?.data?.msg)
        }
    }
return (
    <div className="flex items-center justify-center h-screen">
        <div className="p-8 shadow-2xl rounded-2xl">
            <h2 className="text-purple-600 font-bold text-2xl">Welcome To The EPMS <FaUsers className="inline mb-2" /></h2>
            <h4 className="text-center mt-4 text-xl font-bold">Create an account <FaUserPlus className="inline mb-2" /></h4>

            <form action="" onSubmit={handleCreate} className="flex mt-4 flex-col gap-4">
                <label htmlFor="" className="text-xl">Username <FaUserCircle className="inline mb-1"/></label>
                <input type="text" className="border px-2 outline-0 focus:border-2 focus:border-blue-500 border-gray-400 rounded h-8" 
                placeholder="Fullnames"
                value={username} onChange={(e) => setUsername(e.target.value)}/>
                <label htmlFor="" className="text-xl">Email <FaEnvelope className="inline mb-1"/></label>
                <input type="email" className="border px-2 outline-0 focus:border-2 focus:border-blue-500 border-gray-400 rounded h-8"
                placeholder="Email Address"
                value={email} onChange={(e) => setEmail(e.target.value)}/>
                <label htmlFor="" className="text-xl">Password <FaLock  className="inline mb-1"/></label>
                <input type="password"className="border px-2 outline-0 focus:border-2 focus:border-blue-500 border-gray-400 rounded h-8" 
                placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}/>
                <p className="text-xl text-red-500 text-center">{errorMessage}</p>
                <span>Already have an account? <Link to='/login' className="text-blue-500 text-xl" >Login</Link></span>
                <button type="submit" className="group hover:scale-105 hover:shadow-2xl hover:shadow-black transition-all bg-green-500 h-8 rounded cursor-pointer text-white">Register <FaPlus  className="inline mb-1 transition-transform group-hover:rotate-180  duration-300"/></button>
            </form>

        </div>
    </div>
)
}

export default Reigster;