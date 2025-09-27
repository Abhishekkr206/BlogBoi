import Home from "../pages/home"
import BottomNavbar from "../components/bottomNav/bottomNavbar"
import {LoaderOne as Spinner} from "../components/spinner"

export default function App(){
    return(
        <div className="h-screen w-full flex justify-center items-end">
            <BottomNavbar/>
        </div>
    )
}