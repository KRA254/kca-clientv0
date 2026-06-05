import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type React from "react";
import { UploadCloud } from "lucide-react";
import { api } from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { caseCategories, projectSectors } from "@/lib/taxonomies";

export const Route = createFileRoute("/submit")({
  component: Submit,
  head: () => ({
    meta: [
      { title: "Submit a Record - Kenya Corruption Archives" },
      { name: "description", content: "Submit a corruption case or stalled project record for review." },
    ],
  }),
});

type Mode = "case" | "project";

const emptyCase = {
  title: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  category: "Allegations",
  year: new Date().getFullYear(),
  sourceTitle: "",
  sourceUrl: "",
  pseudonym: "",
};

const emptyProject = {
  name: "",
  imageUrl: "",
  description: "",
  details: "",
  county: "",
  sector: "Infrastructure",
  status: "under_review",
  budgetedAmount: 0,
  amountPaid: 0,
  estimatedLoss: 0,
  contractor: "",
  personResponsibleName: "",
  sourceTitle: "",
  sourceUrl: "",
  pseudonym: "",
};

function Submit() {
  const [mode, setMode] = useState<Mode>("case");
  const [caseForm, setCaseForm] = useState(emptyCase);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [message, setMessage] = useState("");

  const submitCase = useMutation({
    mutationFn: () => api.submitCorruptionCase({
      ...caseForm,
      year: Number(caseForm.year),
      pseudonym: caseForm.pseudonym || undefined,
      sources: buildOptionalSources(caseForm.sourceTitle, caseForm.sourceUrl),
      tags: [caseForm.category.toLowerCase()],
      images: [],
    }),
    onSuccess: (res) => {
      setMessage(`${res.message} Keep this anonymous name for follow-up: ${res.pseudonym}`);
      setCaseForm(emptyCase);
    },
    onError: (error: any) => setMessage(error.message ?? "Submission failed."),
  });

  const submitProject = useMutation({
    mutationFn: () => api.submitProject({
      ...projectForm,
      status: projectForm.status as any,
      budgetedAmount: Number(projectForm.budgetedAmount),
      amountPaid: Number(projectForm.amountPaid),
      estimatedLoss: Number(projectForm.estimatedLoss),
      pseudonym: projectForm.pseudonym || undefined,
      sources: buildOptionalSources(projectForm.sourceTitle, projectForm.sourceUrl),
    }),
    onSuccess: (res) => {
      setMessage(`${res.message} Keep this anonymous name for follow-up: ${res.pseudonym}`);
      setProjectForm(emptyProject);
    },
    onError: (error: any) => setMessage(error.message ?? "Submission failed."),
  });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeader kicker="Public Submission" title="Send a corruption record" />
      <div className="border-2 border-ink bg-card p-4 mb-6 text-sm leading-relaxed text-muted-foreground">
        Use an anonymous name or leave it blank and we will generate one. Public submissions are private until an editor reviews the evidence. Each network can send up to five submissions in a day.
      </div>

      <div className="flex gap-2 mb-6">
        {(["case", "project"] as Mode[]).map((item) => (
          <button
            key={item}
            onClick={() => {
              setMode(item);
              setMessage("");
            }}
            className={`border hairline px-4 py-2 font-mono text-xs uppercase ${mode === item ? "bg-ink text-primary-foreground" : "bg-card"}`}
          >
            {item === "case" ? "Corruption Case" : "Project Record"}
          </button>
        ))}
      </div>

      {message && <div className="border hairline bg-amber/20 p-3 mb-6 text-sm">{message}</div>}
      {mode === "case" ? (
        <CaseForm value={caseForm} setValue={setCaseForm} pending={submitCase.isPending} submit={() => submitCase.mutate()} />
      ) : (
        <ProjectForm value={projectForm} setValue={setProjectForm} pending={submitProject.isPending} submit={() => submitProject.mutate()} />
      )}
    </main>
  );
}

function buildOptionalSources(title: string, url: string) {
  if (!title.trim() && !url.trim()) return [];
  return [{ type: "Source", title: title.trim(), url: url.trim() }];
}

function Field(props: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="kicker mb-2 block">{props.label}</span>{props.children}</label>;
}

const input = "w-full border-2 border-ink bg-background px-3 py-2 text-sm outline-none";
const textarea = `${input} min-h-32`;

function SelectField({
  value,
  onChange,
  options,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <select required={required} className={input} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="space-y-2">
      <input className={input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL or upload below" />
      <label className="inline-flex items-center gap-2 border hairline bg-card px-3 py-2 font-mono text-xs uppercase cursor-pointer">
        <UploadCloud className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload image"}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploading(true);
            setError("");
            try {
              const uploaded = await api.uploadImage(file);
              onChange(uploaded.url);
            } catch (err: any) {
              setError(err.message ?? "Upload failed. Paste an image URL instead.");
            } finally {
              setUploading(false);
            }
          }}
        />
      </label>
      {error && <p className="text-sm text-alert">{error}</p>}
    </div>
  );
}

function CaseForm({ value, setValue, pending, submit }: { value: typeof emptyCase; setValue: (v: typeof emptyCase) => void; pending: boolean; submit: () => void }) {
  const update = (key: keyof typeof emptyCase, next: string | number) => setValue({ ...value, [key]: next });
  return (
    <form className="grid md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <Field label="Anonymous name"><input className={input} value={value.pseudonym} onChange={(e) => update("pseudonym", e.target.value)} placeholder="Optional" /></Field>
      <Field label="Year"><input className={input} type="number" value={value.year} onChange={(e) => update("year", Number(e.target.value))} /></Field>
      <Field label="Title"><input className={input} value={value.title} onChange={(e) => update("title", e.target.value)} placeholder="Optional, but helpful" /></Field>
      <Field label="Category">
        <SelectField
          required
          value={value.category}
          onChange={(next) => update("category", next)}
          options={caseCategories}
        />
      </Field>
      <div className="md:col-span-2"><Field label="Main image"><ImageInput value={value.featuredImage} onChange={(next) => update("featuredImage", next)} /></Field></div>
      <div className="md:col-span-2"><Field label="Short summary"><textarea className={textarea} value={value.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="Optional quick summary" /></Field></div>
      <div className="md:col-span-2"><Field label="Full details"><textarea className={`${textarea} min-h-72`} value={value.content} onChange={(e) => update("content", e.target.value)} placeholder="Add anything you know: names, dates, tender numbers, amounts, documents, and links." /></Field></div>
      <Field label="Source title"><input className={input} value={value.sourceTitle} onChange={(e) => update("sourceTitle", e.target.value)} placeholder="Optional" /></Field>
      <Field label="Source URL"><input className={input} value={value.sourceUrl} onChange={(e) => update("sourceUrl", e.target.value)} placeholder="Optional link" /></Field>
      <button className="md:col-span-2 bg-ink text-primary-foreground px-4 py-3 font-mono text-xs uppercase" disabled={pending}>{pending ? "Sending..." : "Send for review"}</button>
    </form>
  );
}

function ProjectForm({ value, setValue, pending, submit }: { value: typeof emptyProject; setValue: (v: typeof emptyProject) => void; pending: boolean; submit: () => void }) {
  const update = (key: keyof typeof emptyProject, next: string | number) => setValue({ ...value, [key]: next });
  return (
    <form className="grid md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <Field label="Anonymous name"><input className={input} value={value.pseudonym} onChange={(e) => update("pseudonym", e.target.value)} placeholder="Optional" /></Field>
      <Field label="Project status">
        <select className={input} value={value.status} onChange={(e) => update("status", e.target.value)}>
          {["under_review", "stalled", "delayed", "abandoned", "failed", "in_progress", "completed", "unknown"].map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
        </select>
      </Field>
      <Field label="Project name"><input className={input} value={value.name} onChange={(e) => update("name", e.target.value)} placeholder="Optional, but helpful" /></Field>
      <Field label="Sector">
        <SelectField
          required
          value={value.sector}
          onChange={(next) => update("sector", next)}
          options={projectSectors}
        />
      </Field>
      <Field label="County"><input className={input} value={value.county} onChange={(e) => update("county", e.target.value)} /></Field>
      <Field label="Contractor"><input className={input} value={value.contractor} onChange={(e) => update("contractor", e.target.value)} /></Field>
      <div className="md:col-span-2"><Field label="Project image"><ImageInput value={value.imageUrl} onChange={(next) => update("imageUrl", next)} /></Field></div>
      <Field label="Budgeted amount"><input className={input} type="number" value={value.budgetedAmount} onChange={(e) => update("budgetedAmount", Number(e.target.value))} /></Field>
      <Field label="Amount paid"><input className={input} type="number" value={value.amountPaid} onChange={(e) => update("amountPaid", Number(e.target.value))} /></Field>
      <Field label="Estimated loss"><input className={input} type="number" value={value.estimatedLoss} onChange={(e) => update("estimatedLoss", Number(e.target.value))} /></Field>
      <Field label="Responsible person"><input className={input} value={value.personResponsibleName} onChange={(e) => update("personResponsibleName", e.target.value)} /></Field>
      <div className="md:col-span-2"><Field label="Short description"><textarea className={textarea} value={value.description} onChange={(e) => update("description", e.target.value)} placeholder="Optional quick summary" /></Field></div>
      <div className="md:col-span-2"><Field label="More details"><textarea className={`${textarea} min-h-52`} value={value.details} onChange={(e) => update("details", e.target.value)} placeholder="Add whatever you know; admins can complete missing fields later." /></Field></div>
      <Field label="Source title"><input className={input} value={value.sourceTitle} onChange={(e) => update("sourceTitle", e.target.value)} placeholder="Optional" /></Field>
      <Field label="Source URL"><input className={input} value={value.sourceUrl} onChange={(e) => update("sourceUrl", e.target.value)} placeholder="Optional link" /></Field>
      <button className="md:col-span-2 bg-ink text-primary-foreground px-4 py-3 font-mono text-xs uppercase" disabled={pending}>{pending ? "Sending..." : "Send for review"}</button>
    </form>
  );
}
