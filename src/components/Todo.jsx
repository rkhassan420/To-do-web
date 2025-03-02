import { useRef, useState,useEffect } from "react"
import black_title from "../assets/black-title.png"
import white_title from "../assets/white-title.png"
import { List } from "./todoList"
import { FaSun } from "react-icons/fa";





export const Todo = () => {  

    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light-theme");
    const handleTheme = () => {
        
        if(theme === "dark-theme"){
            setTheme("light-theme")
            localStorage.setItem("theme", "light-theme");

        } 

        else{
            setTheme("dark-theme")
            localStorage.setItem("theme", "dark-theme");
        }
    } 

    useEffect(()=>{
        document.body.className = theme
    },[theme])



    const now = new Date()
    const format = now.toDateString()
    


    const inputRef = useRef();

    const [inputTodo, setTodoList] = useState(() => {
        const getData = localStorage.getItem("ReactTask");
        if(!getData) return [];
        return  JSON.parse(getData)
      });



    const addTodo = () => {

        const inputText = inputRef.current.value.trim()

        if(inputText === "")
        {
            return null
        }
        
        const add = {
            
            id: Date.now(),
            text: inputText,
            isComplete: false
        }

        setTodoList((prev) => [...prev, add])
        inputRef.current.value = ""




    }   


    const pressEnter = (event) => {

        if(event.key === "Enter"){
            
            return addTodo()
        }
    }



    const delTask = (id) => {

        setTodoList((prev)=>{
            return prev.filter((Todo) => Todo.id !== id)
        })

    }



    const delAll = () => {

        setTodoList([])
    }


    const toggleComplete = (id) => {
        
        setTodoList((prev) =>
          prev.map((todo) =>
            todo.id === id ? { ...todo, isComplete: !todo.isComplete } : todo
          )
        );
      };

       // Handle Delete key to remove all completed tasks
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Delete") {
        // Remove all completed tasks
        setTodoList((prev) => prev.filter((todo) => !todo.isComplete));
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array means this effect will only run on mount and unmount

  // Update localStorage whenever inputTodo changes
  useEffect(() => {
    localStorage.setItem("ReactTask", JSON.stringify(inputTodo));
  }, [inputTodo]);


    //   localStorage.setItem("ReactTask", JSON.stringify(inputTodo))

    


    return (

        <div className=" main-container  w-11/12 max-w-md place-self-center flex flex-col p-7 min-h-[550px] rounded-xl shadow-lg"
        style={{backgroundColor:"var(--main-container-bg-color)"}} > 

        <div className="flex items-center justify-end gap-3  ">
            
            <p style={{color:"var(--date-color)"}} className="float-end font-medium ">{format}</p>
            <span onClick={handleTheme} title="Light-Dark" className="cursor-pointer"><FaSun style={{color:"var(--dark-icon-color)"}} /></span>
            
        </div>                      
      
        <div className="flex items-center mt-7 gap-2 ">

           <img src={theme === "dark-theme" ? white_title : black_title} alt="app_icon" className="title-img h-7" />
           <h1 style={{color:"var(--title-color)"}} className= "  title text-3xl font-semibold">To-Do List</h1>

        </div>


        <div className=" task-input-container  my-3 mt-6 flex items-center bg-gray-200 rounded-full " >

       

            <input onKeyDown={pressEnter} ref={inputRef}  type="text" placeholder="Add Your Task" className=" bg-transparent border-0 outline-none flex-1 h-14 pl-6 pr-2" />
            
            <button onClick={addTodo} className="task-btn bg-orange-600 border-0 outline-none text-white text-lg font-medium cursor-pointer h-14 w-32 rounded-full ml-[50px] ">ADD +</button>

       

        </div>

       

        <div  className="h-[300px] overflow-y-auto  scroll-container ">

            {inputTodo.map((item,index) => {

                return <List key={index} text={item.text} id={item.id} isComplete={item.isComplete} delTask={delTask} toggleComplete={toggleComplete} theme={theme} />

            })}             

        </div>  


        <div className="mt-4 p-2">
        
            <button onClick={delAll} className=" del-all-btn bg-orange-600 border-0 outline-none text-white text-lg cursor-pointer h-14 w-32 rounded-full ml-[50px] font-medium float-end">Delete All</button>

        </div>      
    
    
        </div>
    )
}