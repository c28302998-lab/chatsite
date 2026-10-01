"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addWorker } from "@/app/actions/worker";

export function AddWorkerDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await addWorker(formData);
    
    setLoading(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Произошла ошибка");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#B9FF66] text-black hover:bg-[#9DE54E] shadow-[0_0_15px_rgba(185,255,102,0.3)]" />}>
        + Саб-рекрутер
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1C1C1E] text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Добавить Саб-рекрутера</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя / Никнейм</Label>
            <Input id="name" name="name" required className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" required className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="bg-[#B9FF66] text-black hover:bg-[#9DE54E]">
              {loading ? "Добавление..." : "Добавить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
