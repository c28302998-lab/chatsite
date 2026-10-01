"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addApplication } from "@/app/actions/application";

export function AddApplicationDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await addApplication(formData);
    
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
        + Новая Заявка
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1C1C1E] text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Добавить Кандидата</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя кандидата</Label>
            <Input id="name" name="name" required className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram (@username)</Label>
            <Input id="telegram" name="telegram" className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон (если есть)</Label>
            <Input id="phone" name="phone" className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="bg-[#B9FF66] text-black hover:bg-[#9DE54E]">
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
