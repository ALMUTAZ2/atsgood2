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
  certifications?: string;
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
  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 text-slate-800 text-sm">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
        {title && <p className="font-medium mb-1">{title}</p>}

        {(location || email || phone || linkedin) && (
          <p className="text-xs text-slate-600">
            {location && <span>{location}</span>}
            {email && (
              <>
                {location && ' • '}
                <span>{email}</span>
              </>
            )}
            {phone && (
              <>
                {(location || email) && ' • '}
                <span>{phone}</span>
              </>
            )}
            {linkedin && (
              <>
                {(location || email || phone) && ' • '}
                <span>{linkedin}</span>
              </>
            )}
          </p>
        )}
      </header>

      {/* PROFESSIONAL SUMMARY */}
      <section className="mb-5">
        <h2 className="font-bold text-xs tracking-widest text-slate-700 mb-1">
          PROFESSIONAL SUMMARY
        </h2>
        <p className="leading-relaxed whitespace-pre-wrap">{summary}</p>
      </section>

      {/* EXPERIENCE */}
      <section className="mb-5">
        <h2 className="font-bold text-xs tracking-widest text-slate-700 mb-2">
          WORK EXPERIENCE
        </h2>
        <div className="leading-relaxed whitespace-pre-wrap">{experience}</div>
      </section>

      {/* EDUCATION */}
      <section className="mb-5">
        <h2 className="font-bold text-xs tracking-widest text-slate-700 mb-2">
          EDUCATION
        </h2>
        <div className="leading-relaxed whitespace-pre-wrap">{education}</div>
      </section>

      {/* SKILLS */}
      <section className="mb-5">
        <h2 className="font-bold text-xs tracking-widest text-slate-700 mb-2">
          SKILLS
        </h2>
        <div className="leading-relaxed whitespace-pre-wrap">{skills}</div>
      </section>

      {/* CERTIFICATIONS (اختياري) */}
      {certifications && certifications.trim() && (
        <section className="mb-2">
          <h2 className="font-bold text-xs tracking-widest text-slate-700 mb-2">
            CERTIFICATIONS
          </h2>
          <div className="leading-relaxed whitespace-pre-wrap">
            {certifications}
          </div>
        </section>
      )}
    </div>
  );
};
