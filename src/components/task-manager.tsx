import  { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Trash2 } from "lucide-react"

type Task = {
  id: number
  text: string
  completed: boolean
  active: boolean
}

type Category = {
  id: number
  name: string
  tasks: Task[]
  history: Task[]
}

const initialCategories: Category[] = [
  { id: 1, name: "1 Year Goal", tasks: [], history: [] },
  { id: 2, name: "6 Month Goal", tasks: [], history: [] },
  { id: 3, name: "3 Month Goal", tasks: [], history: [] },
  { id: 4, name: "1 Month Goal", tasks: [], history: [] },
  { id: 5, name: "1 Week Goal", tasks: [], history: [] },
  { id: 6, name: "Daily Goal", tasks: [], history: [] },
]

export default function TaskManager() {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCategories = localStorage.getItem('categories')
      return savedCategories ? JSON.parse(savedCategories) : initialCategories
    }
    return initialCategories
  })

  const [newTask, setNewTask] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('categories', JSON.stringify(categories))
    }
  }, [categories])

  const addTask = () => {
    if (newTask.trim() !== "" && selectedCategory !== null) {
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === selectedCategory
            ? {
                ...category,
                tasks: [
                  { id: Date.now(), text: newTask, completed: false, active: true },
                  ...(category.tasks || []).map(task => ({ ...task, active: false }))
                ]
              }
            : category
        )
      )
      setNewTask("")
      setSelectedCategory(null)
      setIsSheetOpen(false)
    }
  }

  const toggleTaskCompletion = (categoryId: number, taskId: number) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId
          ? {
              ...category,
              tasks: (category.tasks || []).filter(task => task.id !== taskId),
              history: [
                ...(category.history || []),
                { ...(category.tasks || []).find(task => task.id === taskId)!, completed: true, active: false }
              ]
            }
          : category
      )
    )
  }

  const setActiveTask = (categoryId: number, taskId: number) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId
          ? {
              ...category,
              tasks: (category.tasks || []).map(task => 
                task.id === taskId
                  ? { ...task, active: true, completed: false }
                  : { ...task, active: false }
              )
            }
          : category
      )
    )
  }

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const clearHistory = (categoryId: number) => {
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === categoryId
          ? { ...category, history: [] }
          : category
      )
    )
  }

  return (
    <div className="container mx-auto  pb-20 max-w-md md:max-w-2xl">
      <h1 className="text-2xl font-bold mb-4 text-center">One thing</h1>
      
      <div className="space-y-4">
        {categories.map(category => {
          const activeTask = (category.tasks || []).find(task => task.active);
          const isExpanded = expandedCategory === category.id;
          return (
            <Card key={category.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleCategoryExpansion(category.id)}
                >
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  {activeTask ? (
                    <div className="flex items-center">
                      <Checkbox
                        id={`active-task-${activeTask.id}`}
                        checked={activeTask.completed}
                        onCheckedChange={() => toggleTaskCompletion(category.id, activeTask.id)}
                      />
                      <label htmlFor={`active-task-${activeTask.id}`} className="ml-2 text-sm">
                        {activeTask.text}
                      </label>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No hay tarea activa</p>
                  )}
                </div>
                {isExpanded && (
                  <div className="border-t p-4">
                    <h4 className="font-semibold mb-2 text-sm">Tareas pendientes:</h4>
                    <ul className="space-y-2">
                      {(category.tasks || []).filter(task => !task.active).map(task => (
                        <li key={task.id} className="flex items-center text-sm">
                          {isExpanded && (<Checkbox
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskCompletion(category.id, task.id)}
                          />)}
                          <label
                            htmlFor={`task-${task.id}`}
                            className="ml-2"
                          >
                            {task.text}
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto text-xs py-1 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTask(category.id, task.id);
                            }}
                          >
                            Activar
                          </Button>
                        </li>
                      ))}
                    </ul>
                    {(category.history || []).length > 0 && (
                      <>
                        <div className="flex justify-between items-center mt-4 mb-2">
                          <h4 className="font-semibold text-sm">Historial:</h4>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => clearHistory(category.id)}
                            className="text-xs py-1 px-2"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Limpiar historial
                          </Button>
                        </div>
                        <ul className="space-y-2">
                          {(category.history || []).map(task => (
                            <li key={task.id} className="flex items-center text-sm text-gray-500">
                              <Checkbox checked={true} disabled />
                              <span className="ml-2 line-through">{task.text}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="default" 
            size="icon" 
            className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Agregar nueva tarea</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90%] sm:h-[60%] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Agregar Nueva Tarea</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Nueva tarea"
            />
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              className="block w-full p-2 border rounded"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <Button onClick={addTask} disabled={!newTask || selectedCategory === null}>
              Agregar Tarea
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}