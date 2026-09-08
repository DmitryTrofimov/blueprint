import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";

const settingsSections = [
  {
    title: "Workspace",
    fields: [
      { label: "Workspace name", value: "Acme Engineering", type: "text" },
      { label: "Default project", value: "Q2 Product Release", type: "text" },
    ],
  },
  {
    title: "Notifications",
    fields: [
      { label: "Email notifications", value: "Enabled", type: "toggle" },
      { label: "Telegram bot", value: "Connected", type: "toggle" },
      { label: "Task assignment alerts", value: "Enabled", type: "toggle" },
    ],
  },
  {
    title: "AI Preferences",
    fields: [
      { label: "Auto-generate subtasks", value: "Enabled", type: "toggle" },
      { label: "Auto-assign tasks", value: "Enabled", type: "toggle" },
      { label: "AI model", value: "Blueprint AI v2", type: "text" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" description="Manage your workspace preferences" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {settingsSections.map((section) => (
            <Card key={section.title} className="p-6">
              <h2 className="mb-4 text-sm font-semibold">{section.title}</h2>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div
                    key={field.label}
                    className="flex items-center justify-between border-b border-card-border pb-4 last:border-0 last:pb-0"
                  >
                    <label className="text-sm text-muted">{field.label}</label>
                    {field.type === "toggle" ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={field.value === "Enabled" || field.value === "Connected"}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          field.value === "Enabled" || field.value === "Connected"
                            ? "bg-accent-purple"
                            : "bg-surface-elevated"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                            field.value === "Enabled" || field.value === "Connected"
                              ? "translate-x-5"
                              : ""
                          }`}
                        />
                      </button>
                    ) : (
                      <input
                        type="text"
                        defaultValue={field.value}
                        readOnly
                        className="rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm text-foreground"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
