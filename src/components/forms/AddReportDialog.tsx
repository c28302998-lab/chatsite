"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addReport } from "@/app/actions/report";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddReportDialog({ chatters }: { chatters: { id: string, name: string | null }[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await addReport(formData);
    
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
        + Сдать смену
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1C1C1E] text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Отчет за смену</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          <div className="space-y-2">
            <Label htmlFor="chatterId">Выберите Чатера</Label>
            <Select name="chatterId" required>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]">
                <SelectValue placeholder="Выберите чатера..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1E] border-zinc-800 text-white">
                {chatters.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="hover:bg-zinc-800 focus:bg-zinc-800">
                    {c.name || "Без имени"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shiftStart">Начало смены</Label>
            <Input id="shiftStart" name="shiftStart" type="datetime-local" required className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shiftEnd">Конец смены</Label>
            <Input id="shiftEnd" name="shiftEnd" type="datetime-local" required className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profitAmount">Профит ($)</Label>
            <Input id="profitAmount" name="profitAmount" type="number" step="0.01" min="0" required className="bg-zinc-900 border-zinc-800 focus:border-[#B9FF66]" />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="bg-[#B9FF66] text-black hover:bg-[#9DE54E]">
              {loading ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
