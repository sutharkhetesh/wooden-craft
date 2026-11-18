import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/security";
import { listEnquiries } from "@/lib/storage";
import { csvCell } from "@/lib/csv";
export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    const records = await listEnquiries();
    const rows = [
      [
        "Reference",
        "Created",
        "Status",
        "Name",
        "Email",
        "Mobile",
        "WhatsApp",
        "City",
        "Project",
        "Type",
        "Description",
        "Dimensions",
        "Material",
        "Quantity",
        "Finish",
        "Budget",
        "Timeline",
        "Location",
        "Instructions",
        "Internal notes",
        "Reference image count",
      ],
      ...records.map((r) => [
        r.id,
        r.createdAt,
        r.status,
        r.payload.name,
        r.payload.email,
        r.payload.mobile,
        r.payload.whatsapp,
        r.payload.city,
        r.payload.title,
        r.payload.projectType,
        r.payload.description,
        r.payload.dimensions,
        r.payload.material,
        r.payload.quantity,
        r.payload.finish,
        r.payload.budget,
        r.payload.timeline,
        r.payload.location,
        r.payload.instructions,
        r.notes,
        r.payload.attachments.length,
      ]),
    ];
    return new NextResponse(
      "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
      {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="grain-form-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to export enquiries." },
      { status: 503 },
    );
  }
}
