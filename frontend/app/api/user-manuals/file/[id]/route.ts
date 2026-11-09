import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getDemoManualHtml(id: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blue Star Inverter Split AC Service & Technical Manual</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #0e1424;
      --accent: #0284c7;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --border: #1e293b;
      --highlight: #38bdf8;
      --danger: #f43f5e;
      --success: #10b981;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 30px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      font-size: 24px;
      color: #fff;
      margin: 0 0 5px 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(2, 132, 199, 0.2);
      border: 1px solid var(--accent);
      color: var(--highlight);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .section {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    h2 {
      font-size: 18px;
      color: var(--highlight);
      margin-top: 0;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-top: 15px;
    }
    th, td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      background: rgba(255, 255, 255, 0.03);
      color: var(--muted);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
    }
    .code-badge {
      font-family: monospace;
      font-weight: 900;
      font-size: 14px;
      color: var(--danger);
      background: rgba(244, 63, 94, 0.15);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .svg-container {
      background: #050810;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-top: 15px;
      text-align: center;
    }
    .alert {
      background: rgba(16, 185, 129, 0.1);
      border-left: 4px solid var(--success);
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <span class="badge">Technical Reference Guide</span>
        <h1>Blue Star Inverter Split AC (Vectra Series) - Service Manual</h1>
        <p style="color: var(--muted); font-size: 13px; margin: 4px 0 0 0;">
          Document Ref: BS-INV-SVC-2026 · Models: 185V Vectra, 183V Vectra, 123V Vectra
        </p>
      </div>
    </header>

    <!-- SECTION: Error Codes -->
    <div class="section" id="error-codes">
      <h2>1. Fault Code & Diagnostic Matrix (Error Code E1 - E9)</h2>
      <p style="font-size: 13px; color: var(--muted);">
        Use this troubleshooting chart when the indoor digital display or timer LED flashes an error code:
      </p>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Fault Description</th>
            <th>Probable Root Cause</th>
            <th>Service Action</th>
          </tr>
        </thead>
        <tbody>
          <tr id="e1">
            <td><span class="code-badge">E1</span></td>
            <td><strong>Room Temp Sensor Fault</strong></td>
            <td>Indoor thermistor open or short circuit</td>
            <td>Measure sensor resistance (10 kΩ at 25°C). Replace thermistor harness if open.</td>
          </tr>
          <tr id="e2">
            <td><span class="code-badge">E2</span></td>
            <td><strong>Indoor Coil Temp Sensor</strong></td>
            <td>Coil pipe sensor disconnected or damaged</td>
            <td>Verify resistance (15 kΩ at 25°C). Ensure clip is firmly seated on copper U-bend.</td>
          </tr>
          <tr id="e4">
            <td><span class="code-badge">E4</span></td>
            <td><strong>Outdoor IPM / Inverter Over-Current</strong></td>
            <td>Compressor rotor lock, IPM short circuit, or DC bus voltage abnormal</td>
            <td>
              1. Check DC bus voltage across P & N terminals (310V DC &plusmn;10%).<br/>
              2. Inspect IPM module heat sink silicone paste.<br/>
              3. Check compressor windings resistance (U-V, V-W, W-U: ~0.8Ω balanced).
            </td>
          </tr>
          <tr id="e5">
            <td><span class="code-badge">E5</span></td>
            <td><strong>DC Fan Motor Feedback Fault</strong></td>
            <td>Outdoor BLDC motor blocked or hall sensor circuit failure</td>
            <td>Check fan motor connector and verify 15V DC and 310V DC supply rails.</td>
          </tr>
          <tr id="e6">
            <td><span class="code-badge">E6</span></td>
            <td><strong>Communication Error (Indoor &harr; Outdoor)</strong></td>
            <td>Signal wire S loose, disconnected, or optocoupler defective</td>
            <td>Check AC voltage across N and S terminals (should fluctuate between 0V and 24V DC).</td>
          </tr>
          <tr id="e8">
            <td><span class="code-badge">E8</span></td>
            <td><strong>Discharge Pipe Overheat Protection</strong></td>
            <td>Refrigerant gas leak, low suction pressure, or expansion valve jammed</td>
            <td>Verify running gas pressure (R32: 120-130 PSI, R410A: 115-125 PSI).</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- SECTION: Wiring Diagram -->
    <div class="section" id="wiring-diagram">
      <h2>2. PCB Circuit Schematic & Terminal Wiring Diagram</h2>
      <p style="font-size: 13px; color: var(--muted);">
        Electrical connection layout for indoor unit terminal block to outdoor power PCB:
      </p>
      <div class="svg-container">
        <svg viewBox="0 0 760 320" width="100%" height="auto" style="max-height: 320px;">
          <!-- Indoor Unit Block -->
          <rect x="20" y="40" width="220" height="240" rx="12" fill="#0b1329" stroke="#0284c7" stroke-width="2"/>
          <text x="130" y="70" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">Indoor Unit (IDU PCB)</text>
          
          <rect x="180" y="95" width="40" height="25" rx="4" fill="#1e293b"/>
          <text x="200" y="112" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">L (1)</text>

          <rect x="180" y="135" width="40" height="25" rx="4" fill="#1e293b"/>
          <text x="200" y="152" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">N (2)</text>

          <rect x="180" y="175" width="40" height="25" rx="4" fill="#1e293b"/>
          <text x="200" y="192" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">S (3)</text>

          <rect x="180" y="215" width="40" height="25" rx="4" fill="#1e293b"/>
          <text x="200" y="232" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">PE</text>

          <!-- Connecting Lines -->
          <line x1="220" y1="107" x2="520" y2="107" stroke="#ef4444" stroke-width="3"/>
          <text x="370" y="100" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="middle">Line (230V AC)</text>

          <line x1="220" y1="147" x2="520" y2="147" stroke="#3b82f6" stroke-width="3"/>
          <text x="370" y="140" fill="#3b82f6" font-size="10" font-weight="bold" text-anchor="middle">Neutral</text>

          <line x1="220" y1="187" x2="520" y2="187" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,4"/>
          <text x="370" y="180" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">Communication (S-Line)</text>

          <line x1="220" y1="227" x2="520" y2="227" stroke="#10b981" stroke-width="3"/>
          <text x="370" y="220" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">Earth Ground</text>

          <!-- Outdoor Unit Block -->
          <rect x="520" y="40" width="220" height="240" rx="12" fill="#0b1329" stroke="#38bdf8" stroke-width="2"/>
          <text x="630" y="70" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">Outdoor Unit (ODU PCB)</text>

          <rect x="540" y="95" width="40" height="25" rx="4" fill="#1e293b"/>
          <text x="560" y="112" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">L</text>

          <rect x="540" y="135" width="40" height="25" rx="4" fill="#1e293b"/>
          <text x="560" y="152" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">N</text>

          <rect x="540" y="175" width="40" height="25" rx="4" fill="#1e293b"/>
          <text x="560" y="192" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">S</text>

          <rect x="540" y="215" width="40" height="25" rx="4" fill="#1e293b"/>
          <text x="560" y="232" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">PE</text>

          <!-- Compressor connections inside ODU -->
          <circle cx="670" cy="190" r="30" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="670" y="194" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">DC COMP</text>
        </svg>
      </div>

      <div class="alert">
        <strong>Safety Tip:</strong> Always discharge the DC bus capacitors (wait 5 minutes after power-down) before touching the IPM heat sink or terminals.
      </div>
    </div>

    <!-- SECTION: Gas Charging & Compressor Specs -->
    <div class="section" id="gas-charging">
      <h2>3. Refrigerant Gas Charging & Compressor Specs</h2>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>1.0 Ton (123V)</th>
            <th>1.5 Ton (183V / 185V)</th>
            <th>2.0 Ton (243V)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Refrigerant Type</td>
            <td>R-32</td>
            <td>R-32</td>
            <td>R-32</td>
          </tr>
          <tr>
            <td>Factory Gas Charge</td>
            <td>560 g</td>
            <td>780 g</td>
            <td>980 g</td>
          </tr>
          <tr>
            <td>Suction Running Pressure</td>
            <td>118 - 128 PSI</td>
            <td>120 - 132 PSI</td>
            <td>122 - 135 PSI</td>
          </tr>
          <tr>
            <td>Compressor Type</td>
            <td>Twin Rotary Inverter</td>
            <td>Twin Rotary Inverter</td>
            <td>High-Efficiency BLDC</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Handle demo service manuals
    if (id.startsWith("demo")) {
      const html = getDemoManualHtml(id);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": 'inline; filename="Blue Star_Vectra_Service_Manual.html"',
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const manual = await prisma.userManualLibrary.findUnique({
      where: { id },
      select: {
        fileName: true,
        fileData: true,
      },
    });

    if (!manual || !manual.fileData) {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = manual.fileName.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "csv") contentType = "text/csv";
    else if (ext === "xlsx")
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return new NextResponse(manual.fileData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${manual.fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
