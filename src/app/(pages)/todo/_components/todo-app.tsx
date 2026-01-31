/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { Todo } from "@/generated/prisma/client";
import { TodoForm } from "./todo-form";
import { TodoList } from "./todo-list";
import { Toaster, toast } from "sonner";
import { todoApi } from "@/services/todo-service";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  DragEndEvent,
  DragStartEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TodoItem } from "./todo-item";
import { useGamificationStore } from "@/store/use-gamification";

interface TodoAppProps {
  initialTodos: Todo[];
}

export const TodoApp = ({ initialTodos }: TodoAppProps) => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isReordering = useRef(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => { setIsMounted(true); }, []);

  const activeTodos = todos.filter((t) => !t.isCompleted).sort((a, b) => a.order - b.order);
  const completedTodos = todos.filter((t) => t.isCompleted).sort((a, b) => a.order - b.order);

  const { processGamification } = useGamificationStore();

  const handleAddTodo = (newTodo: Todo) => {
    setTodos((prev) => [newTodo, ...prev]);
    toast.success("Task added!");
  };

  const handleDeleteTodo = async (id: string) => {
    const previousTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await todoApi.delete(id);
      toast.success("Task deleted");
    } catch (error) {
      setTodos(previousTodos);
      toast.error("Failed to delete");
    }
  };

  const handleUpdateTodo = async (updatedTodo: Todo) => {
    // 1. Optimistic Update (UI berubah duluan biar cepet)
    setTodos((prev) => prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));

    try {
      // 2. Panggil API pakai Service 
      const result = await todoApi.update(updatedTodo.id, {
        title: updatedTodo.title,
        description: updatedTodo.description,
        isCompleted: updatedTodo.isCompleted
      });

      // 3. Lempar result ke Store Gamifikasi
      // Service sekarang sudah mengizinkan properti 'gamification' lewat
      processGamification(result);

    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
      // Optional: Rollback state kalau error
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // --- LOGIC BARU: MENCEGAH DRAG LINTAS STATUS ---
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Cari task yang sedang di-drag
    const activeTask = todos.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Tentukan status asal (Active atau Completed)
    const activeContainer = activeTask.isCompleted ? "completed" : "active";

    // Tentukan status tujuan
    let overContainer = "";
    if (overId === "active" || overId === "completed") {
      // Jika drop langsung di container kosong
      overContainer = overId;
    } else {
      // Jika drop di atas task lain
      const overTask = todos.find((t) => t.id === overId);
      // Jika task tidak ketemu (aneh), anggap container sama biar aman
      overContainer = overTask ? (overTask.isCompleted ? "completed" : "active") : activeContainer;
    }

    // --- BLOCKING LOGIC ---
    // Jika container asal BEDA dengan container tujuan, STOP.
    // Jangan lakukan update state apapun.
    if (activeContainer !== overContainer) {
      return;
    }

  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // Basic checks
    if (!over || active.id === over.id) return;
    if (isReordering.current) return;

    // Cari item
    const activeTask = todos.find((t) => t.id === active.id);
    const overTask = todos.find((t) => t.id === over.id);

    // --- SECURITY CHECK DI DRAG END ---
    // Pastikan active dan over ada di "Dunia" yang sama (sama-sama Active atau sama-sama Completed)
    // Ini mencegah edge case jika user drop sangat cepat
    if (activeTask && overTask && activeTask.isCompleted !== overTask.isCompleted) {
      return; // Kembalikan ke posisi asal
    }

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // 1. Update UI Optimistic
    const reorderedList = arrayMove(todos, oldIndex, newIndex);

    // Kita perlu update urutan 'order' hanya untuk item yang relevan, 
    // tapi update seluruh list 'order' juga tidak masalah dan lebih aman konsistensinya.
    const updatedList = reorderedList.map((t, idx) => ({
      ...t,
      order: idx,
    }));

    setTodos(updatedList);

    // 2. Call API
    isReordering.current = true;
    try {
      await todoApi.reorder(updatedList.map((t) => t.id));
    } catch (err) {
      console.error("Reorder failed", err);
      setTodos(todos); // Rollback jika gagal
    } finally {
      isReordering.current = false;
    }
  };

 const handleDeleteCompleted = async () => {
    try {
      await todoApi.deleteCompleted();
      
      setTodos((prev) => prev.filter((t) => !t.isCompleted));
      
      toast.success("All completed tasks cleared!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear tasks");
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };
  const activeItem = todos.find((t) => t.id === activeId);

  if (!isMounted) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full space-y-10">
        <TodoForm onAdd={handleAddTodo} />
        {isDesktop ? (
          <div className="grid grid-cols-2 gap-8 items-start">
            <TodoList
              id="active"
              title="Active Tasks"
              todos={activeTodos}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              showPlaceholder={true}
            />
            <TodoList
              id="completed"
              title="Completed"
              todos={completedTodos}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              showPlaceholder={false}
              onClearCompleted={handleDeleteCompleted}
            />
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active">
                Active <span className="ml-2 text-xs bg-muted text-foreground px-1.5 py-0.5 rounded-full">{activeTodos.length}</span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed <span className="ml-2 text-xs bg-muted text-foreground px-1.5 py-0.5 rounded-full">{completedTodos.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-0 outline-none">
              <TodoList
                id="active"
                todos={activeTodos}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
                showPlaceholder={true}
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-0 outline-none">
              <TodoList
                id="completed"
                todos={completedTodos}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
                showPlaceholder={false}
                onClearCompleted={handleDeleteCompleted}
              />
            </TabsContent>
          </Tabs>
        )}

        <DragOverlay dropAnimation={dropAnimation}>
          {activeItem ? (
            <div className="opacity-90 rotate-2 cursor-grabbing shadow-2xl scale-105">
              <TodoItem
                todo={activeItem}
                onUpdate={() => { }}
                onDelete={() => { }}
              />
            </div>
          ) : null}
        </DragOverlay>

        <Toaster position="bottom-right" theme="system" />
      </div>
    </DndContext>
  );
};