export default function Category() {
    return (
        <div 
        className="sticky z-11 top-16 flex w-full p-2 grid grid-cols-8 justify-center mb-10
        bg-gray-100 text-[#16A085] font-bold text-sm
        ">
            <div>
                <button className="hover:text-green-300 cursor-pointer">
                    Clothes
                </button>
            </div>
            <div>
                <button className="hover:text-green-300 cursor-pointer">
                    Electronic
                </button>
            </div>
            <div>
                <button className="hover:text-green-300 cursor-pointer">
                    Skincare
                </button>
            </div>
            <div>
                <button className="hover:text-green-300 cursor-pointer">
                    Game
                </button>
            </div>
            <div>
                <button className="hover:text-green-300 cursor-pointer">
                    Decoration
                </button>
            </div>
            <div>
                <button className="hover:text-green-300 cursor-pointer">
                    Utensils
                </button>
            </div>
            <div>
                <button className="hover:text-green-300 cursor-pointer">
                    Tools
                </button>
            </div>
            <div>
                <button className="hover:text-green-300 cursor-pointer">
                    Other
                </button>
            </div>
        </div>
    )
}