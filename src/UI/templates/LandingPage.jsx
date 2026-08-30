import Category from "../components/Category"
import FlashComponent from "../components/FlashSaleComponent"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import RecomendationComponent from "../components/RecomendationComponent"
import FlashContent from "../contents/FlashSaleContent"
import Hero from "../contents/HeroContents"
import RecomendationContent from "../contents/recomendation"

export default function LandingPage() {
    return (
        <div className="">
            <Navbar/>
            <Category/>
            <Hero/>
            <FlashComponent/>
            <FlashContent/>
            <RecomendationComponent/>
            <RecomendationContent/>
            <Footer/>
        </div>
    )
}