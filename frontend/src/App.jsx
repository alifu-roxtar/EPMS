import { BrowserRouter as Router, Routes, Route  } from "react-router-dom";
import Reigster from "./pages/account/register";
import HomePage from "./pages/account/home";
import LandingPage from "./pages/landing";
import Login from "./pages/account/login";
import Profile from "./pages/account/profile";
import Settings from "./pages/account/settings";
import AllDepartments from "./pages/departments/allDepartments";
import AddDepartment from "./pages/departments/addDepartment";
import AllEmployees from "./pages/employees/allEmployees";
import Salaries from "./pages/salaries/allSalaries";
import GetReport from "./pages/reports/getReports";

function App(){
  return (
    <>
    <Router>
      <Routes>
        <Route path="/register" element={<Reigster />}/>
        <Route path="/home" element={<HomePage />}/>
        <Route path="/" element={<LandingPage />}/>
        <Route path="/proile/:id" element={<Profile />}/>
        <Route path="/settings" element={<Settings />}/>
        <Route path="/report" element={<GetReport />}/>
        <Route path="/salaries" element={<Salaries />}/>
        <Route path="/employees" element={<AllEmployees />}/>
        <Route path="/createDepartment" element={<AddDepartment />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/departments" element={<AllDepartments />}/>
      </Routes>
    </Router>
    </>
  )
}

export default App;
