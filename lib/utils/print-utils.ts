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
        * {
          box-sizing: border-box;
        }
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
  
