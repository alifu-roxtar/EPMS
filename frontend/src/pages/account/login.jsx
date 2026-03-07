import { useState } from "react";
import { FaEnvelope, FaLock, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import API from "../../components/api";

function Login(){
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');
    const navigate = useNavigate();

    const handleLogin = async(e) =>{
        e.preventDefault();

        try {
            const res = await API.post('/users/login', { email, password });
            if(res.data){
                alert(res.data.msg);
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('uid', res.data.user.id);
                navigate('/home');
                setErrorMessage('');
            }else{
                console.log('Error Occured while logging in');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.msg);
        }
    }
    return (
        <>
        <div className="h-screen justify-center items-center flex">
            <div className="shadow-xl p-8 rounded-xl">
                <h3 className="text-center text-blue-500 text-2xl font-bold">Welcom Back To EPMS</h3>
                <form action="" onSubmit={handleLogin} className="flex flex-col gap-6 mt-4">
                    <label htmlFor="">Email <FaEnvelope className="inline mb-1"/></label>
                    <input type="email" 
                    className="border border-gray-400 rounded  h-8 outline-0 focus:border-2 focus:border-blue-500 px-2 py-1"
                    placeholder="Email Address"
                    value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <label htmlFor="">Password <FaLock className="inline mb-1"/></label>
                    <input type="password" 
                    className="border border-gray-400 rounded  h-8 outline-0 focus:border-2 focus:border-blue-500 px-2 py-1"
                    placeholder="Password"
                    value={password} onChange={(e) => setPassword(e.target.value)}/>
                    {errorMessage && <p className="text-red-500 text-xl"> {errorMessage} </p> }
                    <span>Don't have an account? <Link to='/register' className="text-blue-500 text-xl">Register</Link></span>
                    <button
                    type="submit"
                    className="bg-linear-to-r from-blue-900/80 to-purple-900/80 text-white h-10 rounded cursor-pointer group hover:scale-100 transition-all">
                        Login <FaSignOutAlt className="group-hover:rotate-360 transition-transform duration-300 inline"/></button>

                </form>
            </div>
        </div>
        </>
    )
}

export default Login;