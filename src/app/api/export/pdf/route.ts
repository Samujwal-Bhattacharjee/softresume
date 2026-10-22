import { NextRequest, NextResponse } from "next/server";
import { ResumeDocumentSchema } from "@/lib/schemas/resume";
import { generatePdfBuffer } from "@/lib/export/pdf-generator";
import { sanitizeResumeFilename } from "@/lib/export/filename";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = ResumeDocumentSchema.safeParse(body.document);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid resume document schema",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const doc = parseResult.data;
    const filename = sanitizeResumeFilename(doc.basics.name, "pdf");

    const pdfBuffer = await generatePdfBuffer(doc, {
      overrideSettings: body.settings,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    logger.error("PDF export route error", error, { route: "/api/export/pdf" });
    return NextResponse.json(
      {
        error: "Failed to generate PDF. You can also use the browser print option as fallback.",
      },
      { status: 500 }
    );
  }
}
