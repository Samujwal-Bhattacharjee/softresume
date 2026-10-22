/**
 * Template dispatcher — maps templateId to its renderer component.
 * RS-050 — Template Rendering Contract
 */
import type { TemplateRenderProps } from "@/lib/resume/template-contract";
import type { TemplateId } from "@/lib/schemas/resume";
import { ClassicATSTemplate } from "./classic-ats";
import { FresherGraduateTemplate } from "./fresher-graduate";
import { ModernEditorialTemplate } from "./modern-editorial";
import { TechnicalTemplate } from "./technical";
import { ExperiencedTemplate } from "./experienced";

// ─────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────

export function TemplateRenderer(props: TemplateRenderProps) {
  const { settings } = props;
  const templateId: TemplateId = settings.templateId ?? "classic-ats";

  switch (templateId) {
    case "classic-ats":
      return <ClassicATSTemplate {...props} />;
    case "fresher-graduate":
      return <FresherGraduateTemplate {...props} />;
    case "modern-editorial":
      return <ModernEditorialTemplate {...props} />;
    case "technical":
      return <TechnicalTemplate {...props} />;
    case "experienced":
      return <ExperiencedTemplate {...props} />;
    case "creative":
      // Creative template deferred — fallback to modern editorial with expressive disclaimer
      return <ModernEditorialTemplate {...props} />;
    default:
      return <ClassicATSTemplate {...props} />;
  }
}

export { ClassicATSTemplate } from "./classic-ats";
export { ClassicATSTemplate as ClassicAtsTemplate } from "./classic-ats";
export { FresherGraduateTemplate } from "./fresher-graduate";
export { ModernEditorialTemplate } from "./modern-editorial";
export { TechnicalTemplate } from "./technical";
export { ExperiencedTemplate } from "./experienced";
