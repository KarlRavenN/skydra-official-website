import React from "react";

export function AdminHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border mb-8 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-heading">
          {title}
        </h1>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </header>
  );
}
