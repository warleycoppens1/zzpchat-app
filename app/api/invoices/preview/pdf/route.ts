import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// POST /api/invoices/preview/pdf - Generate PDF for invoice preview
export async function POST(request: NextRequest) {
  try {
    const { invoice } = await request.json()

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice data is required' },
        { status: 400 }
      )
    }

    // Generate PDF using puppeteer
    const pdfBuffer = await generatePDF(invoice)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factuur-${invoice.number}-preview.pdf"`
      }
    })

  } catch (error) {
    console.error('Preview PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview PDF' },
      { status: 500 }
    )
  }
}

async function generatePDF(invoice: any) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    const html = generateInvoiceHTML(invoice)
    
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

function generateInvoiceHTML(invoice: any) {
  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : []
  const billTo = invoice.billTo || {}
  const billFrom = invoice.billFrom || {}

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factuur ${invoice.number}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 20px;
        }
        .company-info h1 {
            color: #4f46e5;
            margin: 0;
            font-size: 24px;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-info h2 {
            margin: 0;
            color: #4f46e5;
            font-size: 20px;
        }
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .bill-to, .bill-from {
            flex: 1;
        }
        .bill-to {
            margin-right: 40px;
        }
        .bill-to h3, .bill-from h3 {
            margin: 0 0 10px 0;
            color: #4f46e5;
            font-size: 16px;
        }
        .line-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .line-items th,
        .line-items td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .line-items th {
            background-color: #f8fafc;
            font-weight: bold;
            color: #4f46e5;
        }
        .line-items .amount {
            text-align: right;
        }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .total-row.final {
            font-weight: bold;
            font-size: 18px;
            color: #4f46e5;
            border-top: 2px solid #4f46e5;
            margin-top: 10px;
            padding-top: 15px;
        }
        .notes {
            margin-top: 40px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
        }
        .notes h3 {
            margin: 0 0 10px 0;
            color: #4f46e5;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>${billFrom.company || 'Uw Bedrijf'}</h1>
            <p>${billFrom.name || ''}</p>
            <p>${billFrom.address || ''}</p>
            <p>${billFrom.email || ''}</p>
            <p>${billFrom.phone || ''}</p>
        </div>
        <div class="invoice-info">
            <h2>FACTUUR</h2>
            <p><strong>Factuurnummer:</strong> ${invoice.number}</p>
            <p><strong>Datum:</strong> ${new Date(invoice.createdAt).toLocaleDateString('nl-NL')}</p>
            <p><strong>Vervaldatum:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('nl-NL') : 'Niet opgegeven'}</p>
        </div>
    </div>

    <div class="billing-section">
        <div class="bill-to">
            <h3>Factuur aan:</h3>
            <p><strong>${invoice.client.name}</strong></p>
            ${invoice.client.company ? `<p>${invoice.client.company}</p>` : ''}
            <p>${billTo.address || ''}</p>
            <p>${billTo.email || invoice.client.email || ''}</p>
        </div>
        <div class="bill-from">
            <h3>Van:</h3>
            <p><strong>${billFrom.company || 'Uw Bedrijf'}</strong></p>
            <p>${billFrom.name || ''}</p>
            <p>${billFrom.address || ''}</p>
            <p>${billFrom.email || ''}</p>
        </div>
    </div>

    <table class="line-items">
        <thead>
            <tr>
                <th>Beschrijving</th>
                <th>Aantal</th>
                <th>Prijs</th>
                <th class="amount">Totaal</th>
            </tr>
        </thead>
        <tbody>
            ${lineItems.map((item: any) => `
                <tr>
                    <td>${item.description || ''}</td>
                    <td>${item.quantity || 0}</td>
                    <td>€${(item.rate || 0).toFixed(2)}</td>
                    <td class="amount">€${(item.amount || 0).toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <div class="total-row">
            <span>Subtotaal:</span>
            <span>€${(invoice.subtotal || invoice.amount).toFixed(2)}</span>
        </div>
        ${invoice.discountAmount > 0 ? `
            <div class="total-row">
                <span>Korting (${invoice.discountRate || 0}%):</span>
                <span>-€${(invoice.discountAmount || 0).toFixed(2)}</span>
            </div>
        ` : ''}
        ${invoice.taxAmount > 0 ? `
            <div class="total-row">
                <span>BTW (${invoice.taxRate || 21}%):</span>
                <span>€${(invoice.taxAmount || 0).toFixed(2)}</span>
            </div>
        ` : ''}
        ${invoice.shipping > 0 ? `
            <div class="total-row">
                <span>Verzending:</span>
                <span>€${(invoice.shipping || 0).toFixed(2)}</span>
            </div>
        ` : ''}
        <div class="total-row final">
            <span>Totaal:</span>
            <span>€${invoice.amount.toFixed(2)}</span>
        </div>
    </div>

    ${invoice.description ? `
        <div class="notes">
            <h3>Opmerkingen:</h3>
            <p>${invoice.description}</p>
        </div>
    ` : ''}

    <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
        <p>Bedankt voor uw zaken!</p>
        <p>Voor vragen kunt u contact opnemen via ${billFrom.email || 'uw email'}</p>
    </div>
</body>
</html>
  `
}


