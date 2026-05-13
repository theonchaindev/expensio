"use client";

import { useEffect, useState, FormEvent } from "react";
import { Save, Eye } from "lucide-react";

type Company = {
  name: string;
  slug: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textOnPrimary: string;
  address: string;
  website: string;
};

const PRESET_THEMES = [
  { name: "Blue", primary: "#2563EB", secondary: "#1E40AF", accent: "#EFF6FF", text: "#FFFFFF" },
  { name: "Green", primary: "#16A34A", secondary: "#15803D", accent: "#F0FDF4", text: "#FFFFFF" },
  { name: "Purple", primary: "#7C3AED", secondary: "#6D28D9", accent: "#F5F3FF", text: "#FFFFFF" },
  { name: "Red", primary: "#DC2626", secondary: "#B91C1C", accent: "#FEF2F2", text: "#FFFFFF" },
  { name: "Orange", primary: "#EA580C", secondary: "#C2410C", accent: "#FFF7ED", text: "#FFFFFF" },
  { name: "Dark", primary: "#1E293B", secondary: "#0F172A", accent: "#F8FAFC", text: "#FFFFFF" },
];

export default function AdminCompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/company").then((r) => r.json()).then(setCompany);
  }, []);

  function set(field: string, value: string) {
    setCompany((c) => c ? { ...c, [field]: value } : c);
  }

  function applyPreset(preset: typeof PRESET_THEMES[0]) {
    setCompany((c) =>
      c ? { ...c, primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent, textOnPrimary: preset.text } : c
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Company Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Customise how your company appears to employees</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic info */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-white">Company Information</h2>
          {[
            { key: "name", label: "Company Name", type: "text" },
            { key: "logoUrl", label: "Logo URL", type: "url", placeholder: "https://..." },
            { key: "website", label: "Website", type: "url", placeholder: "https://..." },
            { key: "address", label: "Address", type: "text" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{f.label}</label>
              <input
                type={f.type}
                value={company[f.key as keyof Company] || ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Company ID (login slug)</label>
            <input
              type="text"
              value={company.slug}
              disabled
              className="w-full bg-slate-900/50 border border-slate-700 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">Employees use this to identify your company at login</p>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-white">Brand Colours</h2>

          {/* Presets */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Quick presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_THEMES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-400 transition-colors"
                >
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: preset.primary }} />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "primaryColor", label: "Primary Colour" },
              { key: "secondaryColor", label: "Secondary Colour" },
              { key: "accentColor", label: "Accent / Background" },
              { key: "textOnPrimary", label: "Text on Primary" },
            ].map((f) => (
              <div key={f.key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={company[f.key as keyof Company] || "#000000"}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-600 cursor-pointer bg-transparent"
                />
                <div>
                  <p className="text-xs font-medium text-slate-300">{f.label}</p>
                  <p className="text-xs text-slate-500 font-mono">{company[f.key as keyof Company]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </div>
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ backgroundColor: company.primaryColor }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: company.secondaryColor, color: company.textOnPrimary }}
              >
                {company.name.charAt(0)}
              </div>
              <span className="font-semibold text-sm" style={{ color: company.textOnPrimary }}>
                {company.name}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-6 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
