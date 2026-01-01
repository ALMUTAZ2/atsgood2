import React from 'react';

interface ATSPreviewTemplateProps {
  fullName: string;
  title?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  certifications: string; // ✅ من AI
}

export const ATSPreviewTemplate: React.FC<ATSPreviewTemplateProps> = ({
  fullName,
  title,
  location,
  email,
  phone,
  linkedin,
  summary,
  experience,
  education,
  skills,
  certifications,
}) => {
  const renderLines = (text: string) =>
    text
      .split('\n')
      .filter((l) => l.trim() !== '')
      .map((line, idx) => (
        <li key={idx} className="text-xs text-slate-700 leading-relaxed">
          {line.startsWith('-') ? line.substring(2).trim() : line}
        </li>
      ));

  return (
    <div className="max-w-[800px] mx-auto bg-white shadow-sm border border-slate-200 rounded-xl p-8 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
        {title && <p className="text-sm text-slate-600 mt-1">{title}</p>}

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {location && <span>{location}</span>}
          {email && <span>Email: {email}</span>}
          {phone && <span>Mobile: {phone}</span>}
          {linkedin && <span>LinkedIn: {linkedin}</span>}
        </div>
      </header>

      <main className="space-y-5 text-sm">
        {/* SUMMARY */}
        {summary.trim() && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.18em] text-slate-500 uppercase mb-1">
              Professional Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          </section>
        )}

        {/* EXPERIENCE */}
        {experience.trim() && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.18em] text-slate-500 uppercase mb-1">
              Experience
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              {renderLines(experience)}
            </ul>
          </section>
        )}

        {/* EDUCATION */}
        {education.trim() && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.18em] text-slate-500 uppercase mb-1">
              Education
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              {renderLines(education)}
            </ul>
          </section>
        )}

        {/* SKILLS */}
        {skills.trim() && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.18em] text-slate-500 uppercase mb-1">
              Skills
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              {renderLines(skills)}
            </ul>
          </section>
        )}

       {/* CERTIFICATIONS */}
{certifications.trim() && (
  <section>
    <h2 className="text-xs font-bold tracking-[0.18em] text-slate-500 uppercase mb-1">
      Certifications
    </h2>
    <ul className="list-disc pl-4 space-y-1">
      {renderLines(certifications)}
    </ul>
  </section>
)}
      </main>
    </div>
  );
};
