/**
 * Print an A4 document (reports, tables, invoices)
 */
export const printDocument = (element: HTMLElement, title?: string) => {
  const width = Math.min(1200, window.screen?.width || 1200);
  const height = Math.min(900, window.screen?.height || 900);
  const printWindow = window.open('', '_blank', `width=${width},height=${height},resizable=yes,scrollbars=yes`);
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const styles = `
    <style>
      @page {
        size: A4;
        margin: 15mm;
      }
      body {
        margin: 0;
        padding: 20px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background: #fff;
        color: #000;
      }
      * { box-sizing: border-box; }
      .print-header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #333;
      }
      .print-header h1 {
        margin: 0 0 5px 0;
        font-size: 18px;
        font-weight: 600;
      }
      .print-header .subtitle {
        color: #666;
        font-size: 11px;
      }
      .print-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        font-size: 11px;
        color: #666;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }
      th, td {
        padding: 8px 10px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        background: #f5f5f5;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 10px;
        letter-spacing: 0.5px;
      }
      tr:nth-child(even) { background: #fafafa; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .font-mono { font-family: monospace; }
      .font-bold { font-weight: 600; }
      .text-success { color: #16a34a; }
      .text-warning { color: #ca8a04; }
      .text-danger { color: #dc2626; }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 500;
      }
      .badge-success { background: #dcfce7; color: #166534; }
      .badge-warning { background: #fef9c3; color: #854d0e; }
      .badge-danger { background: #fee2e2; color: #991b1b; }
      .badge-default { background: #f3f4f6; color: #374151; }
      .badge-primary { background: #dbeafe; color: #1e40af; }
      .print-footer {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #ddd;
        font-size: 10px;
        color: #666;
        text-align: center;
      }
      @media print {
        body { padding: 0; }
        .no-print { display: none !important; }
      }
    </style>
  `;

  const printDate = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || 'Print Document'}</title>
        ${styles}
      </head>
      <body>
        ${element.outerHTML}
        <div class="print-footer">
          Printed on ${printDate}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
};

/**
 * Print a receipt (thermal printer format)
 */
export const printReceipt = (element: HTMLElement) => {
  const width = Math.min(900, window.screen?.width || 900);
  const height = Math.min(900, window.screen?.height || 900);
  const printWindow = window.open('', '_blank', `width=${width},height=${height},resizable=yes,scrollbars=yes`);
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const styles = `
    <style>
      @page {
        size: 80mm auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: 'Courier New', Courier, monospace;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background: #fff;
      }
      * { box-sizing: border-box; }
      .receipt-root {
        max-width: 320px;
        margin: 0 auto;
      }
    </style>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        ${styles}
      </head>
      <body>
        <div class="receipt-root">
          ${element.outerHTML}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
};
  
  export const downloadReceiptAsPDF = async (element: HTMLElement, orderId: string) => {
    // For now, we'll use print-to-pdf functionality
    // In production, you'd use a library like html2canvas + jsPDF
    printReceipt(element);
  };
  
