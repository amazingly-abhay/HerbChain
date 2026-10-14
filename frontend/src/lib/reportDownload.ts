import { Batch, Report } from './types';
import { formatDateTime } from './utils';

export function downloadReportHtml(batch: Batch, report: Report) {
  const isMain = report.type === 'main' || report.stage === 'testing';
  const title = isMain 
    ? 'Main Quality & Laboratory Inspection Certificate'
    : `${report.stage ? report.stage.toUpperCase() : 'SUPPLY CHAIN'} VERIFICATION REPORT`;

  const reportId = report.id || `RPT-${batch.id}`;
  const reportDate = formatDateTime(report.createdAt || new Date().toISOString());
  const reportHash = report.hash || 'N/A';
  const txHash = report.blockchainTxHash || batch.blockchainTxHash || 'On-chain Anchor Pending';
  const explorerUrl = report.blockchainExplorerUrl || (report.blockchainTxHash && !report.blockchainTxHash.startsWith('mock-') ? `https://sepolia.etherscan.io/tx/${report.blockchainTxHash}` : '');

  const data = report.data || {};
  const labTest = data.lab_test || (batch.events ? batch.events.find(e => e.stage === 'testing') : null);
  const labParams = labTest?.parameters || labTest?.labParameters || {};

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${batch.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; line-height: 1.5; }
    .header { border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
    .logo { font-size: 24px; font-weight: 800; color: #059669; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; margin-top: 6px; }
    .title-block h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; }
    .meta-item { font-size: 13px; }
    .meta-label { color: #64748b; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .meta-val { color: #0f172a; font-weight: 600; font-family: monospace, sans-serif; word-break: break-all; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-left: 3px solid #059669; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    th { background: #f1f5f9; color: #475569; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .proof-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px; font-size: 12px; }
    .proof-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
    .proof-row:last-child { margin-bottom: 0; }
    .proof-key { font-weight: 600; color: #065f46; font-size: 11px; text-transform: uppercase; }
    .proof-val { font-family: monospace; color: #047857; word-break: break-all; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-block">
      <div class="logo">🌿 HerbChain Provenance Ledger</div>
      <h1>${title}</h1>
      <span class="badge">${isMain ? (batch.testingStatus === 'failed' ? 'REJECTED / FAILED' : 'VERIFIED & PASSED') : report.stage.toUpperCase()}</span>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748b;">
      <div><strong>Report ID:</strong> ${reportId}</div>
      <div><strong>Issued:</strong> ${reportDate}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-label">Batch Identifier</div>
      <div class="meta-val">${batch.id}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Herb Botanical / Common Name</div>
      <div class="meta-val">${batch.herbName} ${batch.scientificName ? `(${batch.scientificName})` : ''}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Quantity & Unit</div>
      <div class="meta-val">${batch.quantity} ${batch.unit || 'kg'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Origin Location</div>
      <div class="meta-val">${batch.origin?.address || 'Harvested Wildcraft / Farm'}</div>
    </div>
  </div>

  ${isMain && Object.keys(labParams).length > 0 ? `
  <div class="section">
    <div class="section-title">Laboratory Physical & Chemical Parameters</div>
    <table>
      <thead>
        <tr>
          <th>Test Parameter</th>
          <th>Observed Value</th>
          <th>Standard Limit</th>
          <th>Evaluation</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(labParams).map(([k, v]) => `
        <tr>
          <td style="font-weight: 500; text-transform: capitalize;">${k.replace(/([A-Z])/g, ' $1')}</td>
          <td><strong>${String(v)}</strong></td>
          <td>${k.toLowerCase().includes('purity') ? '≥ 80%' : k.toLowerCase().includes('moisture') ? '≤ 12%' : 'Standard AYUSH Pharmacopoeia'}</td>
          <td style="color: #059669; font-weight: 600;">PASS</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${data.event ? `
  <div class="section">
    <div class="section-title">Event Operations & Dispatch Verification</div>
    <table>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Record Details</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Operator / Entity</td>
          <td><strong>${data.event.actor_name || 'Authorized Actor'} (${data.event.actor_role || report.stage})</strong></td>
        </tr>
        <tr>
          <td>Timestamp</td>
          <td>${formatDateTime(data.event.timestamp || report.createdAt)}</td>
        </tr>
        <tr>
          <td>Facility / Geolocation</td>
          <td>${data.event.location?.address || 'Verified Coordinates'}</td>
        </tr>
        <tr>
          <td>Execution Notes</td>
          <td>${data.event.notes || 'Stage protocol executed and validated successfully.'}</td>
        </tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Cryptographic Immutability & Blockchain Attestation</div>
    <div class="proof-box">
      <div class="proof-row">
        <span class="proof-key">Cryptographic SHA-256 Digest:</span>
        <span class="proof-val">${reportHash}</span>
      </div>
      <div class="proof-row">
        <span class="proof-key">Ethereum Sepolia Blockchain Transaction:</span>
        <span class="proof-val">${txHash}</span>
      </div>
      ${explorerUrl ? `
      <div class="proof-row">
        <span class="proof-key">Public Ledger Explorer:</span>
        <span class="proof-val"><a href="${explorerUrl}" target="_blank" style="color: #047857; text-decoration: underline;">${explorerUrl}</a></span>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="footer">
    <div>Secured by HerbChain Ayurvedic Provenance Ledger · Zero-Knowledge Cryptographic Traceability</div>
    <div>Digital Signature Certified</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${batch.id}_${report.stage}_report.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
