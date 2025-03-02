import tick from "../assets/tick.png"
import not_tick from "../assets/not_tick.png"
import white_bin from "../assets/white-bin.png"
import gray_bin from "../assets/gray-bin.png"




export const List = ({text, id, isComplete, delTask, toggleComplete, theme}) => {

    
    return (

        <div  className=" flex items-center my-3 gap-2 px-2  " >
            
            <div onClick={() => {toggleComplete(id)}} className="flex items-center flex-1 cursor-pointer  ">

                <img   src={isComplete ? tick : not_tick} alt="" className="w-7" />

                <p style={{color:"var(--list-text-color)"}} className={` task-text  ml-4 text-[17px] ${isComplete ? "line-through" : " "}`}>{text}</p>
                
            </div>

          <img onClick={()=>{delTask(id)}}  src={theme === "dark-theme" ? gray_bin : gray_bin} alt="" className=" dust-bin w-5 cursor-pointer " />

            

        </div>
    )
}